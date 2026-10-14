const TOKEN_URL = process.env.TM_APIGATE_TOKEN_URL ?? "https://api.apigate.tm.com.my/token";
const API_URL = process.env.TM_APIGATE_API_URL ?? "https://api.apigate.tm.com.my/t/tm.com.my/AI-Foundry-Service/1.82.1/v1/chat/completions";
const CLIENT_ID = process.env.TM_APIGATE_CLIENT_ID;
const CLIENT_SECRET = process.env.TM_APIGATE_CLIENT_SECRET;
const CHAT_KEY = process.env.TM_APIGATE_CHAT_KEY;
const LLM_MODEL = process.env.TM_LLM_MODEL ?? "gpt-oss-20b";
const REFRESH_BUFFER_SECONDS = 60;

type TokenCache = {
  accessToken: string;
  expiryTime: number;
};

let tokenCache: TokenCache | null = null;

function requireGatewayConfig() {
  if (!CLIENT_ID || !CLIENT_SECRET || !CHAT_KEY) {
    throw new Error("TM API Gateway credentials are not configured");
  }
}

async function requestNewToken(): Promise<string> {
  requireGatewayConfig();
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) throw new Error(`AI Gateway token request failed (${response.status})`);
  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("AI Gateway token response did not include access_token");

  tokenCache = {
    accessToken: data.access_token,
    expiryTime: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

async function getValidToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiryTime - REFRESH_BUFFER_SECONDS * 1000) {
    return tokenCache.accessToken;
  }
  return requestNewToken();
}

export async function chatComplete(prompt: string, maxTokens = 1024): Promise<string> {
  requireGatewayConfig();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = await getValidToken();
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-litellm-api-key": CHAT_KEY,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (response.status === 401 && attempt === 0) {
      tokenCache = null;
      continue;
    }
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LLM request failed (${response.status}): ${text.slice(0, 500)}`);
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? "{}";
  }

  throw new Error("LLM request failed after token refresh");
}
const LLM_BASE_URL = process.env.TM_LLM_BASE_URL ?? "https://v-qcwq7ngstdnjr69dtn7g-4000.tma01.gpuproxy.tm.com.my/v1";
const LLM_API_KEY = process.env.TM_LLM_API_KEY ?? "sk-DLZKh-WBCuXKLTxkSgtF6A";
const LLM_MODEL = process.env.TM_LLM_MODEL ?? "gpt-oss-20b";

const TOKEN_URL = process.env.TM_APIGATE_TOKEN_URL ?? "https://api.apigate.tm.com.my/token";
const API_URL = process.env.TM_APIGATE_API_URL ?? "https://api.apigate.tm.com.my/t/tm.com.my/AI-Foundry-Service/1.82.1/v1/chat/completions";
const CLIENT_ID = process.env.TM_APIGATE_CLIENT_ID;
const CLIENT_SECRET = process.env.TM_APIGATE_CLIENT_SECRET;
const CHAT_KEY = process.env.TM_APIGATE_CHAT_KEY;
const REFRESH_BUFFER_SECONDS = 60;

type TokenCache = {
  accessToken: string;
  expiryTime: number;
};

let tokenCache: TokenCache | null = null;

function requireGatewayConfig() {
  if (!CLIENT_ID || !CLIENT_SECRET || !CHAT_KEY) {
    throw new Error("TM API Gateway credentials are not configured");
  }
}

async function requestNewToken(): Promise<string> {
  requireGatewayConfig();

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    signal: AbortSignal.timeout(30_000),
  });

  if (!response.ok) {
    throw new Error(`AI Gateway token request failed (${response.status})`);
  }

  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("AI Gateway token response did not include access_token");

  tokenCache = {
    accessToken: data.access_token,
    expiryTime: Date.now() + (data.expires_in ?? 3600) * 1000,
  };
  return data.access_token;
}

async function getValidToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiryTime - REFRESH_BUFFER_SECONDS * 1000) {
    return tokenCache.accessToken;
  }
  return requestNewToken();
}

export async function chatComplete(prompt: string, maxTokens = 1024): Promise<string> {
  requireGatewayConfig();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = await getValidToken();
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-litellm-api-key": CHAT_KEY,
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(120_000),
    });

    if (response.status === 401 && attempt === 0) {
      tokenCache = null;
      continue;
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`LLM request failed (${response.status}): ${text.slice(0, 500)}`);
    }

    const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? "{}";
  }

  throw new Error("LLM request failed after token refresh");
}

export async function chatComplete(prompt: string, maxTokens = 1024): Promise<string> {
  const res = await fetch(`${LLM_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LLM_API_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM request failed (${res.status}): ${text}`);
  }

  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices[0]?.message?.content ?? "{}";
}
