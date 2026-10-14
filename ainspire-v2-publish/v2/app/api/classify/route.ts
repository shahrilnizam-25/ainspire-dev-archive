import { classifyPayload } from '../../../server/classify';
export async function POST(request: Request) {
 if (Number(request.headers.get('content-length') ?? 0) > 16000) return Response.json({error:'Request too large.'},{status:413});
 let body: unknown; try { const raw = await request.text(); if (raw.length > 16000) return Response.json({error:'Request too large.'},{status:413}); body = JSON.parse(raw); } catch { return Response.json({error:'Invalid JSON.'},{status:400}); }
 if (!body || typeof body !== 'object' || Array.isArray(body)) return Response.json({error:'Invalid request.'},{status:400});
 try { return Response.json(await classifyPayload(body as Record<string,unknown>), {headers:{'Cache-Control':'no-store'}}); } catch (e) { return Response.json({error:e instanceof Error ? e.message : 'Invalid assessment.'},{status:400}); }
}
