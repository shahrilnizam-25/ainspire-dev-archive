// Loopback-only demo directory API for the illustrative ainspire_demo org. Not production authentication.
import crypto from 'node:crypto';
import http from 'node:http';
import pg from 'pg';

const PORT = Number(process.env.DEMO_API_PORT ?? 8787);
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set.');
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
// Sessions end when this process restarts; that is acceptable for a local simulation.
const SECRET = crypto.randomBytes(32);
const COOKIE = 'ainspire_demo_session';
const SESSION_SECONDS = 8 * 3600;
const STAFF_ID = /^TM[0-9]{6}$/;
const attempts = new Map();
// Only the test harness overrides this; the default is the real limit.
const MAX_ATTEMPTS_PER_MINUTE = Number(process.env.DEMO_API_MAX_ATTEMPTS ?? 30);

const sign = (value) => crypto.createHmac('sha256', SECRET).update(value).digest('base64url');
function issueToken(staffId) {
  const payload = `${staffId}.${Math.floor(Date.now() / 1000) + SESSION_SECONDS}`;
  return `${payload}.${sign(payload)}`;
}
function readToken(request) {
  const raw = (request.headers.cookie ?? '').split(';').map(part => part.trim()).find(part => part.startsWith(COOKIE + '='));
  const parts = raw?.slice(COOKIE.length + 1).split('.');
  if (parts?.length !== 3) return null;
  const [staffId, expires, signature] = parts;
  const expected = Buffer.from(sign(`${staffId}.${expires}`));
  const given = Buffer.from(signature);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  return STAFF_ID.test(staffId) && Number(expires) > Date.now() / 1000 ? staffId : null;
}
const cookie = (value, maxAge) => `${COOKIE}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}`;

function send(response, status, body, headers = {}) {
  // A 204 must not carry a body, or proxies may abort the response.
  if (status === 204) { response.writeHead(204, { 'Cache-Control': 'no-store', ...headers }); return response.end(); }
  response.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers });
  response.end(JSON.stringify(body));
}
async function readJson(request) {
  if (!String(request.headers['content-type'] ?? '').startsWith('application/json')) throw Object.assign(new Error('JSON required'), { status: 415 });
  const origin = request.headers.origin;
  if (origin && new URL(origin).host !== request.headers.host) throw Object.assign(new Error('Cross-origin request refused'), { status: 403 });
  let size = 0; const chunks = [];
  for await (const chunk of request) { size += chunk.length; if (size > 1024) throw Object.assign(new Error('Request too large'), { status: 413 }); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
}
function limited(request) {
  const key = request.socket.remoteAddress ?? 'local';
  const now = Date.now();
  const recent = (attempts.get(key) ?? []).filter(time => now - time < 60_000);
  recent.push(now); attempts.set(key, recent);
  return recent.length > MAX_ATTEMPTS_PER_MINUTE;
}

const viewsFor = (profile) => ['employee', ...(profile.direct_reports > 0 ? ['supervisor'] : []), ...(profile.is_hr ? ['hr'] : [])];
async function loadProfile(staffId) {
  const { rows } = await pool.query(`
    select e.staff_id, e.display_name, e.business_role, e.grade_code, e.division_code, d.name_en as division_name_en, d.name_bm as division_name_bm,
      e.assessment_status, e.persona, e.readiness_score, e.is_ready, e.is_hr, m.display_name as supervisor_name,
      (select count(*)::int from ainspire_demo.employees r where r.supervisor_staff_id = e.staff_id) as direct_reports
    from ainspire_demo.employees e
    join ainspire_demo.divisions d using (organization_code, division_code)
    left join ainspire_demo.employees m on m.staff_id = e.supervisor_staff_id
    where e.staff_id = $1`, [staffId]);
  return rows[0] ? { ...rows[0], views: viewsFor(rows[0]), is_illustrative: true } : null;
}
// Static conditions only (never user input): [group, kind, SQL condition]. Each picks the lowest matching Staff ID.
const SAMPLE_SPECS = [
  ['role', 'employee', "not is_hr and direct_reports = 0 and assessment_status = 'complete'"],
  ['role', 'supervisor', "not is_hr and direct_reports > 0 and business_role = 'Team Manager'"],
  ['role', 'hr', 'is_hr and direct_reports = 0'],
  ['role', 'hr_supervisor', "is_hr and direct_reports > 0 and business_role = 'Team Manager'"],
  ['example', 'example', "not is_hr and direct_reports = 0 and persona = 'builder' and is_ready and division_code = 'D08'"],
  ['example', 'example', "not is_hr and direct_reports = 0 and persona = 'strategist' and is_ready and division_code = 'D13'"],
  ['example', 'example', "not is_hr and direct_reports = 0 and persona = 'visionary' and is_ready and division_code = 'D07'"],
  ['example', 'example', "not is_hr and direct_reports = 0 and persona = 'explorer' and is_ready = false and division_code = 'D01'"],
  ['example', 'example', "not is_hr and direct_reports = 0 and assessment_status = 'complete' and is_ready = false and division_code = 'D12'"],
  ['example', 'example', "not is_hr and direct_reports = 0 and assessment_status = 'pending' and division_code = 'D09'"],
  ['example', 'example', "not is_hr and direct_reports = 0 and assessment_status = 'pending' and division_code = 'D05'"],
  ['example', 'example', "not is_hr and business_role = 'Division Head' and division_code = 'D08'"],
  ['example', 'example', "not is_hr and business_role = 'Team Manager' and division_code = 'D14'"],
  ['example', 'example', "is_hr and business_role = 'Division Head'"],
];
async function sampleIds() {
  const picks = SAMPLE_SPECS.map(([, , condition], index) => `(select $${index * 2 + 1}::text as group_name, $${index * 2 + 2}::text as kind, ${index} as ord, e.* from emp e where ${condition} order by staff_id limit 1)`);
  const { rows } = await pool.query(`
    with emp as (
      select e.*, d.name_en as division_name_en,
        (select count(*)::int from ainspire_demo.employees r where r.supervisor_staff_id = e.staff_id) as direct_reports
      from ainspire_demo.employees e join ainspire_demo.divisions d using (organization_code, division_code))
    select group_name as group, kind, staff_id, display_name, business_role, division_name_en, assessment_status, persona, is_ready, direct_reports, is_hr
    from (${picks.join(' union all ')}) t order by ord`, SAMPLE_SPECS.flatMap(([group, kind]) => [group, kind]));
  return { samples: rows };
}
async function route(request, response) {
  const { pathname } = new URL(request.url, 'http://127.0.0.1');
  const staffId = readToken(request);

  if (pathname === '/api/demo/sample-ids' && request.method === 'GET') return send(response, 200, await sampleIds());

  if (pathname === '/api/demo/session') {
    if (request.method === 'POST') {
      if (limited(request)) return send(response, 429, { error: 'Too many attempts. Try again shortly.' });
      const body = await readJson(request);
      const requested = typeof body.staff_id === 'string' ? body.staff_id.trim().toUpperCase() : '';
      const profile = STAFF_ID.test(requested) ? await loadProfile(requested) : null;
      if (!profile) return send(response, 404, { error: 'Staff ID not found in the sample organization.' });
      return send(response, 200, profile, { 'Set-Cookie': cookie(issueToken(requested), SESSION_SECONDS) });
    }
    if (request.method === 'GET') {
      const profile = staffId ? await loadProfile(staffId) : null;
      return profile ? send(response, 200, profile) : send(response, 200, { signed_in: false });
    }
    if (request.method === 'DELETE') return send(response, 204, {}, { 'Set-Cookie': cookie('', 0) });
  }

  return send(response, 404, { error: 'Not found' });
}

http.createServer((request, response) => {
  route(request, response).catch(error => {
    if (!response.headersSent) send(response, error.status ?? 500, { error: error.status ? error.message : 'Demo directory error.' });
    if (!error.status) console.error('[demo-api]', error.message);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`Demo directory API on http://127.0.0.1:${PORT}`));
