// Role-matrix test for the demo directory API. Needs the seeded local Postgres (pnpm demo-seed).
import { strict as assert } from 'node:assert';
import { spawn } from 'node:child_process';
import { after, before, test } from 'node:test';

const PORT = 8799;
const BASE = `http://127.0.0.1:${PORT}/api/demo`;
const servers = [];

async function startServer(port, env = {}) {
  const child = spawn(process.execPath, ['--env-file=.env', 'scripts/demo-api.mjs'], { env: { ...process.env, DEMO_API_PORT: String(port), ...env }, stdio: ['ignore', 'pipe', 'inherit'] });
  servers.push(child);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('demo-api did not start')), 10_000);
    child.once('exit', code => reject(new Error(`demo-api exited early (${code}); is Postgres seeded?`)));
    child.stdout.on('data', chunk => { if (String(chunk).includes('Demo directory API')) { clearTimeout(timer); resolve(); } });
  });
}

// The main server gets a high attempt limit so many sign-ins do not trip the limiter; the limiter has its own server below.
before(() => startServer(PORT, { DEMO_API_MAX_ATTEMPTS: '1000' }));
after(() => servers.forEach(child => child.kill()));

const call = (path, { cookie, method = 'GET', body, headers = {} } = {}) => fetch(BASE + path, {
  method, body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  headers: { ...(body !== undefined && typeof body !== 'string' ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...headers },
});
async function login(staffId) {
  const response = await call('/session', { method: 'POST', body: { staff_id: staffId } });
  const set = response.headers.get('set-cookie') ?? '';
  return { response, profile: await response.json(), cookie: set.split(';')[0], set };
}

const samples = {};
let allSamples = [];
test('sample IDs cover each role combination', async () => {
  ({ samples: allSamples } = await (await call('/sample-ids')).json());
  for (const sample of allSamples.filter(item => item.group === 'role')) samples[sample.kind] = sample.staff_id;
  assert.deepEqual(Object.keys(samples).sort(), ['employee', 'hr', 'hr_supervisor', 'supervisor']);
});

test('example samples are varied, unique, and sign in with the traits they claim', async () => {
  const examples = allSamples.filter(item => item.group === 'example');
  assert.ok(examples.length >= 9, `expected at least 9 examples, got ${examples.length}`);
  assert.equal(new Set(allSamples.map(item => item.staff_id)).size, allSamples.length, 'sample IDs must be unique');
  assert.ok(new Set(examples.map(item => item.persona).filter(Boolean)).size >= 4, 'all four personas should appear');
  assert.ok(examples.some(item => item.assessment_status === 'pending'), 'a pending assessment should appear');
  assert.ok(examples.some(item => item.is_ready === false && item.assessment_status === 'complete'), 'a developing profile should appear');
  assert.ok(examples.some(item => item.direct_reports > 50), 'a large team should appear');
  assert.ok(examples.some(item => item.is_hr && item.direct_reports > 0), 'an HR supervisor should appear');
  for (const sample of allSamples) {
    const { response, profile } = await login(sample.staff_id);
    assert.equal(response.status, 200, sample.staff_id);
    assert.equal(profile.direct_reports, sample.direct_reports, sample.staff_id);
    assert.equal(profile.views.includes('supervisor'), sample.direct_reports > 0, sample.staff_id);
    assert.equal(profile.views.includes('hr'), sample.is_hr, sample.staff_id);
  }
});

test('the profile carries what the prefilled work-context form needs', async () => {
  const { profile } = await login(samples.employee);
  for (const field of ['staff_id', 'display_name', 'business_role', 'division_name_en']) assert.ok(typeof profile[field] === 'string' && profile[field].trim(), field);
  const divisions = ['unifi', 'TM One', 'TM Global', 'TM Research & Development (TM R&D)', 'Legal Strategy & Intellectual Property (LSIP)', 'Business & Innovation Technology (BiTech)', 'Group Network Technology (GNT)', 'Group IT & Digital (GITD)', 'Group Finance (GF)', 'Group Human Capital Management (GHCM)', 'Group Information Security (GIS)', 'Group Procurement (GP)', 'Group Strategy (GS)', 'Group Internal Audit (GIA)'];
  for (const sample of allSamples) assert.ok(divisions.includes(sample.division_name_en), `${sample.staff_id} division ${sample.division_name_en} must match a form option`);
});

test('views follow the Staff ID: employee, supervisor, HR, HR + supervisor', async () => {
  const expected = { employee: ['employee'], supervisor: ['employee', 'supervisor'], hr: ['employee', 'hr'], hr_supervisor: ['employee', 'supervisor', 'hr'] };
  for (const [kind, views] of Object.entries(expected)) {
    const { response, profile } = await login(samples[kind]);
    assert.equal(response.status, 200, kind);
    assert.deepEqual(profile.views, views, kind);
  }
});

test('the session cookie is HttpOnly and the probe is a normal answer when signed out', async () => {
  const { set } = await login(samples.employee);
  assert.match(set, /HttpOnly/);
  assert.match(set, /SameSite=Lax/);
  const signedOut = await call('/session');
  assert.equal(signedOut.status, 200);
  assert.deepEqual(await signedOut.json(), { signed_in: false });
});

test('removed endpoints stay removed', async () => {
  assert.equal((await call('/organization')).status, 404);
  assert.equal((await call('/workforce')).status, 404);
  assert.equal((await call('/team')).status, 404);
});

test('unknown, malformed and injection-style Staff IDs are refused', async () => {
  for (const staff_id of ['TM999999', 'abc', "TM100094' OR '1'='1", '', 42, null]) {
    const response = await call('/session', { method: 'POST', body: { staff_id } });
    assert.equal(response.status, 404, String(staff_id));
  }
});

test('forged, tampered and expired cookies are rejected', async () => {
  const { cookie } = await login(samples.employee);
  const value = cookie.split('=')[1];
  const [staffId, expires, signature] = value.split('.');
  const forged = [`ainspire_demo_session=${samples.hr}.${expires}.${signature}`, `ainspire_demo_session=${staffId}.9999999999.${signature}`, 'ainspire_demo_session=TM111611.9999999999.AAAA', 'ainspire_demo_session=garbage'];
  for (const forgedCookie of forged) assert.deepEqual(await (await call('/session', { cookie: forgedCookie })).json(), { signed_in: false }, forgedCookie);
});

test('logout ends the session cookie and answers 204 with no body', async () => {
  const response = await call('/session', { method: 'DELETE' });
  assert.equal(response.status, 204);
  assert.equal(await response.text(), '');
  assert.equal(response.headers.get('content-type'), null);
  assert.match(response.headers.get('set-cookie') ?? '', /Max-Age=0/);
});

test('cross-origin, wrong content type and oversized bodies are refused', async () => {
  assert.equal((await call('/session', { method: 'POST', body: { staff_id: samples.employee }, headers: { Origin: 'http://evil.example' } })).status, 403);
  assert.equal((await call('/session', { method: 'POST', body: 'x', headers: { 'Content-Type': 'text/plain' } })).status, 415);
  assert.equal((await call('/session', { method: 'POST', body: JSON.stringify({ staff_id: 'T'.repeat(4000) }), headers: { 'Content-Type': 'application/json' } })).status, 413);
  assert.equal((await call('/session', { method: 'POST', body: '{not json', headers: { 'Content-Type': 'application/json' } })).status, 400);
});

test('repeated sign-in attempts are rate limited at the default limit', async () => {
  await startServer(8798);
  const attempt = () => fetch('http://127.0.0.1:8798/api/demo/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ staff_id: 'TM000000' }) });
  const statuses = [];
  for (let count = 0; count < 31; count++) statuses.push((await attempt()).status);
  assert.deepEqual(new Set(statuses.slice(0, 30)), new Set([404]), 'the first 30 attempts are answered normally');
  assert.equal(statuses[30], 429, 'the 31st attempt in a minute is limited');
});
