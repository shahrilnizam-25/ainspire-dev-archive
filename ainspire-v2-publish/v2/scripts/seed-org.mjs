// Rebuilds ainspire_demo from the v2 illustrative division/persona counts. Local databases only.
import { readFileSync } from 'node:fs';
import pg from 'pg';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is not set.');
if (!['localhost', '127.0.0.1', '::1'].includes(new URL(url).hostname)) throw new Error('Refusing to rebuild a non-local database.');
if (!process.argv.includes('--rebuild')) throw new Error('Pass --rebuild to drop and recreate the ainspire_demo schema.');

const ORG = { code: 'TM-DEMO', display_name: 'TM Illustrative Workforce', source_label: 'v2-illustrative-org-simulation' };
const POPULATION = 16720;
// code, name, assessed, ready, builder, explorer, strategist, visionary (from the existing dashboard cohorts)
const DIVISIONS = [
  ['D01', 'unifi', 491, 396, 182, 143, 119, 47], ['D02', 'TM One', 472, 371, 166, 141, 118, 47],
  ['D03', 'TM Global', 459, 365, 171, 133, 111, 44], ['D04', 'TM Research & Development (TM R&D)', 421, 326, 152, 124, 104, 41],
  ['D05', 'Legal Strategy & Intellectual Property (LSIP)', 238, 163, 69, 78, 65, 26], ['D06', 'Business & Innovation Technology (BiTech)', 447, 342, 166, 130, 108, 43],
  ['D07', 'Group Network Technology (GNT)', 400, 302, 152, 114, 96, 38], ['D08', 'Group IT & Digital (GITD)', 503, 405, 187, 146, 121, 49],
  ['D09', 'Group Finance (GF)', 433, 323, 143, 134, 111, 45], ['D10', 'Group Human Capital Management (GHCM)', 416, 323, 124, 135, 112, 45],
  ['D11', 'Group Information Security (GIS)', 385, 271, 131, 117, 98, 39], ['D12', 'Group Procurement (GP)', 367, 248, 121, 113, 95, 38],
  ['D13', 'Group Strategy (GS)', 400, 328, 149, 116, 96, 39], ['D14', 'Group Internal Audit (GIA)', 171, 95, 48, 57, 47, 19],
];
const ROLES = {
  D01: ['Customer Experience Analyst', 'Broadband Product Specialist', 'Sales Operations Executive', 'Service Quality Engineer'],
  D02: ['Enterprise Solutions Consultant', 'Account Manager', 'Presales Engineer', 'Service Delivery Analyst'],
  D03: ['Network Planning Engineer', 'Wholesale Account Executive', 'Interconnect Analyst', 'Regional Operations Specialist'],
  D04: ['Research Engineer', 'Data Scientist', 'Innovation Analyst', 'Prototype Developer'],
  D05: ['Legal Counsel', 'IP Analyst', 'Contracts Executive', 'Compliance Associate'],
  D06: ['Business Analyst', 'Solution Architect', 'Software Engineer', 'Quality Assurance Engineer'],
  D07: ['Network Engineer', 'Transmission Engineer', 'Field Operations Planner', 'Capacity Analyst'],
  D08: ['IT Operations Engineer', 'Data Engineer', 'Software Developer', 'Platform Support Analyst'],
  D09: ['Financial Analyst', 'Accountant', 'Treasury Executive', 'Budget Controller'],
  D10: ['HR Business Partner', 'Talent Development Executive', 'Compensation Analyst', 'HR Operations Executive'],
  D11: ['Security Analyst', 'Risk Analyst', 'Identity Access Specialist', 'Incident Responder'],
  D12: ['Procurement Executive', 'Vendor Analyst', 'Sourcing Specialist', 'Contract Administrator'],
  D13: ['Strategy Analyst', 'Transformation Lead', 'Business Planning Executive', 'Portfolio Analyst'],
  D14: ['Internal Auditor', 'Audit Analyst', 'Risk Assurance Executive', 'Data Analytics Auditor'],
};
const FIRST = ['Aisha', 'Daniel', 'Farah', 'Hafiz', 'Jason', 'Kavitha', 'Lee', 'Mei Ling', 'Nadia', 'Omar', 'Priya', 'Rizal', 'Siti', 'Tan', 'Umar', 'Vikram', 'Wei', 'Yasmin', 'Zul', 'Amir'];
const LAST = ['Rahman', 'Lim', 'Kumar', 'Abdullah', 'Wong', 'Nair', 'Ismail', 'Chong', 'Singh', 'Hassan', 'Teo', 'Pillai', 'Yusof', 'Lau', 'Raj', 'Ahmad', 'Chan', 'Menon', 'Salleh', 'Goh'];
const HR_DIVISION = 'D10';
const HR_MANAGERS = 5;
const HR_STAFF = 40;

// Deterministic so reseeding reproduces the same population.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const random = rng(20261012);
function shuffle(items) { const out = [...items]; for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return out; }

function allocatePopulation() {
  const assessedTotal = DIVISIONS.reduce((sum, d) => sum + d[2], 0);
  const raw = DIVISIONS.map(d => d[2] * POPULATION / assessedTotal);
  const sizes = raw.map(Math.floor);
  let remainder = POPULATION - sizes.reduce((a, b) => a + b, 0);
  raw.map((value, index) => [value - Math.floor(value), index]).sort((a, b) => b[0] - a[0]).forEach(([, index]) => { if (remainder-- > 0) sizes[index]++; });
  return sizes;
}

function dimensionScores(ready, ordinal) {
  const pick = (options) => options[ordinal % options.length];
  const dims = ready
    ? [0, 1, 2, 3].map(d => ((ordinal * 37 + d * 23) % 100) < [32, 18, 16, 18][d] ? 100 : 75)
    : pick([[75, 50, 75, 50], [50, 75, 50, 75], [75, 50, 50, 75], [50, 50, 75, 75]]);
  const growth = [50, 75, 100][ordinal % 3];
  return { aiExposure: dims[0], aiApplication: dims[1], criticalJudgement: dims[2], aiProblemSolving: dims[3], growthAspiration: growth };
}

function buildEmployees() {
  const sizes = allocatePopulation();
  const employees = [];
  let next = 100001;
  const newId = () => 'TM' + String(next++);
  const name = () => `${FIRST[Math.floor(random() * FIRST.length)]} ${LAST[Math.floor(random() * LAST.length)]}`;
  DIVISIONS.forEach(([code, , assessed, ready, builder, explorer, strategist, visionary], index) => {
    const size = sizes[index];
    const managerCount = Math.round((size - 1) / 16);
    const rows = [];
    const head = { staff_id: newId(), supervisor_staff_id: null, business_role: 'Division Head', grade_code: 'E3', is_hr: code === HR_DIVISION };
    rows.push(head);
    const managers = Array.from({ length: managerCount }, (_, i) => ({ staff_id: newId(), supervisor_staff_id: head.staff_id, business_role: 'Team Manager', grade_code: 'E2', is_hr: code === HR_DIVISION && i < HR_MANAGERS }));
    rows.push(...managers);
    const roles = ROLES[code];
    let hrStaff = 0;
    for (let i = 0; i < size - 1 - managerCount; i++) {
      const hr = code === HR_DIVISION && hrStaff < HR_STAFF; if (hr) hrStaff++;
      rows.push({ staff_id: newId(), supervisor_staff_id: managers[i % managerCount].staff_id, business_role: roles[i % roles.length], grade_code: 'E1', is_hr: hr });
    }
    const personas = shuffle([...Array(builder).fill('builder'), ...Array(explorer).fill('explorer'), ...Array(strategist).fill('strategist'), ...Array(visionary).fill('visionary')]);
    const readyFlags = shuffle([...Array(ready).fill(true), ...Array(assessed - ready).fill(false)]);
    const assessedIds = new Set(shuffle(rows.map(r => r.staff_id)).slice(0, assessed));
    let k = 0;
    for (const row of rows) {
      Object.assign(row, { display_name: name(), organization_code: ORG.code, division_code: code });
      if (assessedIds.has(row.staff_id)) {
        const isReady = readyFlags[k];
        const dims = dimensionScores(isReady, k);
        const score = Math.round(Object.values(dims).reduce((a, b) => a + b, 0) / 5);
        Object.assign(row, { assessment_status: 'complete', persona: personas[k], readiness_score: score, is_ready: isReady, dimension_scores: JSON.stringify(dims) });
        k++;
      } else Object.assign(row, { assessment_status: 'pending', persona: null, readiness_score: null, is_ready: null, dimension_scores: null });
    }
    employees.push(...rows);
  });
  return employees;
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  const employees = buildEmployees();
  await client.query('begin');
  await client.query('drop schema if exists ainspire_demo cascade');
  await client.query(readFileSync(new URL('../db/postgres/org-schema.sql', import.meta.url), 'utf8'));
  await client.query('insert into ainspire_demo.organizations (code, display_name, source_label) values ($1, $2, $3)', [ORG.code, ORG.display_name, ORG.source_label]);
  for (const [code, nameEn] of DIVISIONS) await client.query('insert into ainspire_demo.divisions (organization_code, division_code, name_en, name_bm) values ($1, $2, $3, $3)', [ORG.code, code, nameEn]);
  const columns = ['staff_id', 'display_name', 'organization_code', 'division_code', 'business_role', 'grade_code', 'supervisor_staff_id', 'is_hr', 'assessment_status', 'persona', 'readiness_score', 'is_ready', 'dimension_scores'];
  for (let start = 0; start < employees.length; start += 1000) {
    const chunk = employees.slice(start, start + 1000);
    const params = [];
    const tuples = chunk.map((row, r) => `(${columns.map((column, c) => { params.push(row[column]); return `$${r * columns.length + c + 1}${column === 'dimension_scores' ? '::jsonb' : ''}`; }).join(',')})`);
    await client.query(`insert into ainspire_demo.employees (${columns.join(',')}) values ${tuples.join(',')}`, params);
  }
  await client.query('commit');
  const { rows } = await client.query('select population_count, assessed_count, ready_count from ainspire_demo.organization_metrics');
  console.log('Seeded ainspire_demo:', rows[0]);
} catch (error) {
  await client.query('rollback').catch(() => {});
  throw error;
} finally {
  await client.end();
}
