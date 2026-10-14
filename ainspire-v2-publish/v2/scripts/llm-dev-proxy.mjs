// Local dev relay: the Worker runtime rejects the TM provider certificates, so this skips TLS verification for those hosts only.
import http from 'node:http';
import https from 'node:https';

if (process.env.NODE_ENV === 'production') throw new Error('The LLM dev proxy must not run in production.');

const PORT = Number(process.env.LLM_DEV_PROXY_PORT ?? 8788);
const MAX_BODY = 256 * 1024;
const hostOf = (value, fallback) => new URL(value ?? fallback).host;
const ALLOWED_HOSTS = new Set([
  hostOf(process.env.GIGX_API_URL, 'https://gigx.nexa-dev.tm.com.my/llm/v1/chat/completions'),
  hostOf(process.env.TM_APIGATE_TOKEN_URL, 'https://api.apigate.tm.com.my/token'),
  hostOf(process.env.TM_APIGATE_API_URL, 'https://api.apigate.tm.com.my/t/tm.com.my/AI-Foundry-Service/1.82.1/v1/chat/completions'),
]);
const FORWARDED_HEADERS = ['authorization', 'content-type', 'x-litellm-api-key', 'accept'];

function reject(response, status, error) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify({ error }));
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error('Request too large'), { status: 413 });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

const server = http.createServer(async (request, response) => {
  try {
    // Browsers always send Origin on cross-origin posts; the Worker does not, so this keeps web pages out.
    if (request.method !== 'POST' || request.headers.origin) return reject(response, 403, 'Not allowed');
    const match = /^\/([^/?]+)(\/[^?]*)?(\?.*)?$/.exec(request.url ?? '');
    const host = match ? decodeURIComponent(match[1]) : '';
    if (!ALLOWED_HOSTS.has(host)) return reject(response, 403, 'Host is not on the provider allowlist');
    const body = await readBody(request);
    const target = new URL(`https://${host}${match[2] ?? '/'}${match[3] ?? ''}`);
    const headers = Object.fromEntries(FORWARDED_HEADERS.filter(name => request.headers[name]).map(name => [name, request.headers[name]]));
    headers['content-length'] = body.length;
    const upstream = https.request({ hostname: target.hostname, port: target.port || 443, path: target.pathname + target.search, method: 'POST', headers, rejectUnauthorized: false, timeout: 30_000 }, upstreamResponse => {
      console.log(`${target.host}${target.pathname} -> ${upstreamResponse.statusCode}`);
      response.writeHead(upstreamResponse.statusCode ?? 502, { 'Content-Type': upstreamResponse.headers['content-type'] ?? 'application/json' });
      upstreamResponse.pipe(response);
    });
    upstream.on('timeout', () => upstream.destroy(new Error('timeout')));
    upstream.on('error', error => { console.log(`${target.host}${target.pathname} -> unreachable (${error.code ?? error.message})`); if (!response.headersSent) reject(response, 502, 'Provider unreachable'); else response.destroy(); });
    upstream.end(body);
  } catch (error) {
    reject(response, error.status ?? 500, error.status ? error.message : 'Proxy error');
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`LLM dev proxy on http://127.0.0.1:${PORT} for: ${[...ALLOWED_HOSTS].join(', ')}`));
