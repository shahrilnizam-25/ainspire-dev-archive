import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

process.env.GIGX_API_URL = "https://gigx.test/chat/completions";
process.env.GIGX_API_TOKEN = "primary-test-token";
process.env.GIGX_LLM_MODEL = "qwen3-vl-4b-instruct";
process.env.TM_APIGATE_TOKEN_URL = "https://apigate.test/token";
process.env.TM_APIGATE_API_URL = "https://apigate.test/chat/completions";
process.env.TM_APIGATE_CLIENT_ID = "fallback-client";
process.env.TM_APIGATE_CLIENT_SECRET = "fallback-secret";
process.env.TM_APIGATE_CHAT_KEY = "fallback-chat-key";
process.env.TM_LLM_MODEL = "gpt-oss-20b";

const originalFetch = globalThis.fetch;
const { chatComplete } = await import("../dist/index.mjs");

afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("uses GIGX Qwen as the primary completion provider", async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return Response.json({ choices: [{ message: { content: "primary response" } }] });
  };

  const result = await chatComplete("test prompt", 64);

  assert.equal(result, "primary response");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://gigx.test/chat/completions");
  assert.equal(calls[0].options.headers.Authorization, "Bearer primary-test-token");
  assert.equal(JSON.parse(calls[0].options.body).model, "qwen3-vl-4b-instruct");
});

test("falls back to API Gate when GIGX fails", async () => {
  const calls = [];
  globalThis.fetch = async (url, options) => {
    const requestUrl = String(url);
    calls.push(requestUrl);
    if (requestUrl === "https://gigx.test/chat/completions") {
      return new Response("primary unavailable", { status: 503 });
    }
    if (requestUrl === "https://apigate.test/token") {
      return Response.json({ access_token: "fallback-access-token", expires_in: 3600 });
    }
    if (requestUrl === "https://apigate.test/chat/completions") {
      return Response.json({ choices: [{ message: { content: "fallback response" } }] });
    }
    throw new Error(`Unexpected URL: ${requestUrl}`);
  };

  const result = await chatComplete("test prompt", 64);

  assert.equal(result, "fallback response");
  assert.deepEqual(calls, [
    "https://gigx.test/chat/completions",
    "https://apigate.test/token",
    "https://apigate.test/chat/completions",
  ]);
});