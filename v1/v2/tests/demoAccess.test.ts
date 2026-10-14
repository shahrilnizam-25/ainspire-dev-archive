import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { accessFor, visibleViews, type DemoProfile, type SessionState } from '../src/shared/demoAccess';
import { signOut } from '../src/shared/demoSession';

const profile = (views: DemoProfile['views']): DemoProfile => ({
  staff_id: 'TM100001', display_name: 'Sample Person', business_role: 'Analyst', grade_code: 'E1', division_code: 'D01',
  division_name_en: 'unifi', division_name_bm: 'unifi', assessment_status: 'complete', persona: 'builder', readiness_score: 80,
  is_ready: true, is_hr: views.includes('hr'), supervisor_name: null, direct_reports: views.includes('supervisor') ? 3 : 0, views, is_illustrative: true,
});
const signedIn = (views: DemoProfile['views']): SessionState => ({ status: 'signed-in', profile: profile(views) });

test('each Staff ID role combination opens exactly the views it holds', () => {
  const cases: Array<[DemoProfile['views'], boolean, boolean]> = [
    [['employee'], false, false],
    [['employee', 'supervisor'], true, false],
    [['employee', 'hr'], false, true],
    [['employee', 'supervisor', 'hr'], true, true],
  ];
  for (const [views, supervisor, hr] of cases) {
    const state = signedIn(views);
    assert.equal(accessFor(state, 'employee'), 'open');
    assert.equal(accessFor(state, 'supervisor'), supervisor ? 'open' : 'denied');
    assert.equal(accessFor(state, 'hr'), hr ? 'open' : 'denied');
    assert.deepEqual(visibleViews(state), views);
  }
});

test('signed-out visitors are asked for a Staff ID and see no role tabs', () => {
  const state: SessionState = { status: 'anonymous', profile: null };
  assert.equal(accessFor(state, 'hr'), 'signin');
  assert.equal(accessFor(state, 'supervisor'), 'signin');
  assert.deepEqual(visibleViews(state), []);
});

test('views stay closed while the session is still loading', () => {
  const state: SessionState = { status: 'loading', profile: null };
  assert.equal(accessFor(state, 'hr'), 'checking');
  assert.equal(accessFor(state, 'supervisor'), 'checking');
});

test('without the sample directory the existing ungated behaviour is kept', () => {
  const state: SessionState = { status: 'unavailable', profile: null };
  assert.equal(accessFor(state, 'hr'), 'open');
  assert.equal(accessFor(state, 'supervisor'), 'open');
  assert.equal(visibleViews(state), null);
});

test('switching Staff ID awaits an ordinary logout request', async context => {
  let finishLogout: () => void = () => {};
  let finishBody: () => void = () => {};
  const body = new Promise<string>(resolve => { finishBody = () => resolve(''); });
  const logoutResponse = new Response(null, { status: 204 });
  context.mock.method(logoutResponse, 'text', () => body);
  const response = new Promise<Response>(resolve => { finishLogout = () => resolve(logoutResponse); });
  context.mock.method(globalThis, 'fetch', (url: string, options: RequestInit) => {
    assert.equal(url, '/api/demo/session');
    assert.deepEqual(options, { method: 'DELETE' });
    return response;
  });
  let finished = false;
  const switching = signOut().then(() => { finished = true; });
  await Promise.resolve();
  assert.equal(finished, false);
  finishLogout();
  await Promise.resolve();
  assert.equal(finished, false);
  finishBody();
  await switching;
  assert.equal(finished, true);
});
