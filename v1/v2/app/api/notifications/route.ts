import { buildPowerAutomatePayload, dispatchPowerAutomate, parseNotificationEvent } from '../../../server/notifications';

const requestsByClient = new Map<string, number[]>();

function isRateLimited(request: Request): boolean {
  const client = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'local';
  const now = Date.now();
  const recent = (requestsByClient.get(client) ?? []).filter(timestamp => now - timestamp < 60_000);
  recent.push(now);
  requestsByClient.set(client, recent);
  return recent.length > 20;
}

export async function POST(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return Response.json({ error: 'JSON required.' }, { status: 415 });
  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(request.url).host) return Response.json({ error: 'Cross-origin request refused.' }, { status: 403 });
    } catch {
      return Response.json({ error: 'Invalid origin.' }, { status: 403 });
    }
  }
  if (isRateLimited(request)) return Response.json({ error: 'Too many notification requests.' }, { status: 429 });
  if (Number(request.headers.get('content-length') ?? 0) > 16_000) return Response.json({ error: 'Request too large.' }, { status: 413 });
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > 16_000) return Response.json({ error: 'Request too large.' }, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: 'Invalid JSON.' }, { status: 400 });
  }
  try {
    const event = parseNotificationEvent(body);
    await dispatchPowerAutomate(buildPowerAutomatePayload(event));
    return Response.json({ accepted: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const status = typeof error === 'object' && error && 'status' in error && typeof error.status === 'number' ? error.status : 400;
    return Response.json({ error: error instanceof Error ? error.message : 'Notification failed.' }, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}