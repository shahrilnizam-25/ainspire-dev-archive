import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildPowerAutomatePayload, dispatchPowerAutomate, parseNotificationEvent } from '../server/notifications';
import { POST } from '../app/api/notifications/route';

test('assessment email uses fixed recipients, branded HTML and a seven-day reminder', () => {
  const event = parseNotificationEvent({
    eventId: 'assessment-1', eventType: 'assessment.results_ready', lang: 'EN', employeeName: '<Shahril>',
    persona: 'builder', contributionRole: 'Solution builder', overallReadiness: 75,
    dimensionScores: { aiExposure: 50, aiApplication: 75 }, narrative: '<script>alert(1)</script>',
    strengths: ['Practical application'], developmentGaps: ['Critical judgement'],
    learningResources: [{ title: 'Responsible AI', url: 'https://www.youtube.com/watch?v=abcdefghijk' }],
  });
  const payload = buildPowerAutomatePayload(event, new Date('2026-10-12T00:00:00.000Z'));
  assert.equal(payload.to, 'shahril.abdullah@tm.com.my');
  assert.equal(payload.cc, 'ctsoo@tm.com.my;noorain.ismail@tm.com.my');
  assert.match(payload.htmlBody, /background:#030712/);
  assert.match(payload.htmlBody, /&lt;Shahril&gt;/);
  assert.doesNotMatch(payload.htmlBody, /<script>/);
  assert.match(payload.htmlBody, /https:\/\/ainspire\.sooct2003\.chatgpt\.site/);
  assert.equal(payload.reminder?.dueAt, '2026-10-19T00:00:00.000Z');
  assert.equal(payload.reminder?.cc, 'ctsoo@tm.com.my');
});

test('project interest includes supervisor and HR while learning milestones only copy supervisor', () => {
  const interest = buildPowerAutomatePayload(parseNotificationEvent({
    eventId: 'interest-1', eventType: 'project.interest', lang: 'BM', projectName: 'SARING', contributionRole: 'Penyumbang domain',
  }));
  const milestone = buildPowerAutomatePayload(parseNotificationEvent({
    eventId: 'learning-1', eventType: 'learning.milestone', lang: 'EN', topic: 'AI foundations', status: 'completed',
  }));
  assert.equal(interest.cc, 'ctsoo@tm.com.my;noorain.ismail@tm.com.my');
  assert.equal(milestone.cc, 'ctsoo@tm.com.my');
  assert.match(milestone.htmlBody, /Open the AiNspire portal/);
});

test('notification request rejects client-controlled recipients and unsafe result fields', () => {
  assert.throws(() => parseNotificationEvent({ eventId: 'x', eventType: 'unknown', lang: 'EN', to: 'attacker@example.com' }));
  assert.throws(() => parseNotificationEvent({ eventId: 'x', eventType: 'assessment.results_ready', lang: 'EN', persona: 'builder', overallReadiness: 999 }));
  const parsed = parseNotificationEvent({ eventId: 'x', eventType: 'learning.milestone', lang: 'EN', topic: 'Course', status: 'started', to: 'attacker@example.com' });
  assert.equal(buildPowerAutomatePayload(parsed).to, 'shahril.abdullah@tm.com.my');
});

test('Power Automate dispatch requires a configured secure URL and posts the server-built email', async () => {
  const oldUrl = process.env.POWER_AUTOMATE_TRIGGER_URL;
  const oldFetch = globalThis.fetch;
  const payload = buildPowerAutomatePayload(parseNotificationEvent({
    eventId: 'interest-2', eventType: 'project.interest', lang: 'EN', projectName: 'DataOps', contributionRole: 'Contributor',
  }));
  try {
    delete process.env.POWER_AUTOMATE_TRIGGER_URL;
    await assert.rejects(dispatchPowerAutomate(payload), /not configured/);
    process.env.POWER_AUTOMATE_TRIGGER_URL = 'https://flow.example.test/trigger';
    let requestBody = '';
    globalThis.fetch = async (input, init) => {
      assert.equal(String(input), 'https://flow.example.test/trigger');
      assert.equal(new Headers(init?.headers).get('idempotency-key'), 'interest-2');
      requestBody = String(init?.body);
      return new Response(null, { status: 202 });
    };
    await dispatchPowerAutomate(payload);
    assert.equal(JSON.parse(requestBody).to, 'shahril.abdullah@tm.com.my');
  } finally {
    globalThis.fetch = oldFetch;
    if (oldUrl === undefined) delete process.env.POWER_AUTOMATE_TRIGGER_URL;
    else process.env.POWER_AUTOMATE_TRIGGER_URL = oldUrl;
  }
});

test('notification API enforces same-origin JSON requests and reports an unconfigured flow', async () => {
  const oldUrl = process.env.POWER_AUTOMATE_TRIGGER_URL;
  delete process.env.POWER_AUTOMATE_TRIGGER_URL;
  const body = JSON.stringify({ eventId: 'route-check', eventType: 'learning.milestone', lang: 'EN', topic: 'AI foundations', status: 'started' });
  const base = { method: 'POST', headers: { 'cf-connecting-ip': 'notification-test-client' } };
  try {
    const wrongType = await POST(new Request('https://portal.test/api/notifications', { ...base, headers: { ...base.headers, 'content-type': 'text/plain' }, body }));
    assert.equal(wrongType.status, 415);
    const wrongOrigin = await POST(new Request('https://portal.test/api/notifications', { ...base, headers: { ...base.headers, 'content-type': 'application/json', origin: 'https://attacker.test' }, body }));
    assert.equal(wrongOrigin.status, 403);
    const unavailable = await POST(new Request('https://portal.test/api/notifications', { ...base, headers: { ...base.headers, 'content-type': 'application/json', origin: 'https://portal.test' }, body }));
    assert.equal(unavailable.status, 503);
  } finally {
    if (oldUrl !== undefined) process.env.POWER_AUTOMATE_TRIGGER_URL = oldUrl;
  }
});