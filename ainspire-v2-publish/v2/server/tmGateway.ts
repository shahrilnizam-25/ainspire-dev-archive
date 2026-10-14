const DEFAULT_GIGX_API_URL = "https://gigx.nexa-dev.tm.com.my/llm/v1/chat/completions";
const DEFAULT_API_GATE_TOKEN_URL = "https://api.apigate.tm.com.my/token";
const DEFAULT_API_GATE_URL = "https://api.apigate.tm.com.my/t/tm.com.my/AI-Foundry-Service/1.82.1/v1/chat/completions";
const REFRESH_BUFFER_SECONDS = 60;

type TokenCache = {
  accessToken: string;
  expiryTime: number;
  clientId: string;
  tokenUrl: string;
};

export type ChatProviderState = "not-configured" | "standby" | "responded" | "failed";
export type ChatProviderTrace = { gigx: ChatProviderState; apiGate: ChatProviderState };

export class ChatProviderError extends Error {
  constructor(message: string, readonly providerTrace: ChatProviderTrace) {
    super(message);
    this.name = "ChatProviderError";
  }
}

let tokenCache: TokenCache | null = null;

// Development only: lets a local relay reach provider hosts whose certificates the Worker runtime rejects.
function providerFetchUrl(url: string) {
  const proxy = process.env.LLM_DEV_PROXY_URL;
  if (!proxy || process.env.NODE_ENV === "production") return url;
  const target = new URL(url);
  return `${proxy.replace(/\/$/, "")}/${target.host}${target.pathname}${target.search}`;
}

export function hasChatProviderConfigured() {
  return Boolean(process.env.GIGX_API_KEY || hasApiGateConfig());
}

export function configuredChatProvider() {
  if (process.env.GIGX_API_KEY) return hasApiGateConfig() ? "gigx-with-apigate-fallback" : "gigx";
  return hasApiGateConfig() ? "apigate" : "deterministic";
}

function hasApiGateConfig() {
  return Boolean(process.env.TM_APIGATE_CLIENT_ID && process.env.TM_APIGATE_CLIENT_SECRET && process.env.TM_APIGATE_CHAT_KEY);
}

function requireApiGateConfig() {
  if (!hasApiGateConfig()) {
    throw new Error("TM API Gateway fallback credentials are not configured");
  }
}

async function requestNewToken(): Promise<string> {
  requireApiGateConfig();
  const clientId = process.env.TM_APIGATE_CLIENT_ID!;
  const clientSecret = process.env.TM_APIGATE_CLIENT_SECRET!;
  const tokenUrl = process.env.TM_APIGATE_TOKEN_URL ?? DEFAULT_API_GATE_TOKEN_URL;
  const response = await fetch(providerFetchUrl(tokenUrl), {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) throw new Error(`AI Gateway token request failed (${response.status})`);
  const data = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!data.access_token) throw new Error("AI Gateway token response did not include access_token");

  tokenCache = {
    accessToken: data.access_token,
    expiryTime: Date.now() + (data.expires_in ?? 3600) * 1000,
    clientId,
    tokenUrl,
  };
  return data.access_token;
}

async function getValidToken(): Promise<string> {
  if (tokenCache && tokenCache.clientId === process.env.TM_APIGATE_CLIENT_ID && tokenCache.tokenUrl === (process.env.TM_APIGATE_TOKEN_URL ?? DEFAULT_API_GATE_TOKEN_URL) && Date.now() < tokenCache.expiryTime - REFRESH_BUFFER_SECONDS * 1000) {
    return tokenCache.accessToken;
  }
  return requestNewToken();
}

async function readCompletion(response: Response, provider: string): Promise<string> {
  if (!response.ok) throw new Error(`${provider} LLM request failed (${response.status})`);
  const data = (await response.json()) as { choices?: { message?: { content?: unknown } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) {
    throw new Error(`${provider} LLM response did not contain message content`);
  }
  return content;
}

async function requestGigx(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = process.env.GIGX_API_KEY;
  if (!apiKey) throw new Error("GiGX API key is not configured");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(providerFetchUrl(process.env.GIGX_API_URL ?? DEFAULT_GIGX_API_URL), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.GIGX_LLM_MODEL ?? "qwen3-vl-4b-instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: maxTokens,
          temperature: 0,
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (attempt === 0 && (response.status === 408 || response.status === 429 || response.status >= 500)) {
        await response.body?.cancel();
        await new Promise(resolve => setTimeout(resolve, 250));
        continue;
      }
      return await readCompletion(response, "GiGX");
    } catch (error) {
      const transientNetworkError = error instanceof TypeError;
      if (attempt === 0 && transientNetworkError) {
        await new Promise(resolve => setTimeout(resolve, 250));
        continue;
      }
      throw error;
    }
  }
  throw new Error("GiGX request failed after transient retry");
}

async function requestApiGate(prompt: string, maxTokens: number): Promise<string> {
  requireApiGateConfig();
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const token = await getValidToken();
    const response = await fetch(providerFetchUrl(process.env.TM_APIGATE_API_URL ?? DEFAULT_API_GATE_URL), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-litellm-api-key": process.env.TM_APIGATE_CHAT_KEY!,
      },
      body: JSON.stringify({
        model: process.env.TM_LLM_MODEL ?? "gpt-oss-20b",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (response.status === 401 && attempt === 0) {
      tokenCache = null;
      continue;
    }
    return readCompletion(response, "TM API Gateway");
  }
  throw new Error("TM API Gateway request failed after token refresh");
}

export async function chatCompleteWithTrace(prompt: string, maxTokens = 1024): Promise<{ content: string; providerTrace: ChatProviderTrace }> {
  const providerTrace: ChatProviderTrace = {
    gigx: process.env.GIGX_API_KEY ? "standby" : "not-configured",
    apiGate: hasApiGateConfig() ? "standby" : "not-configured",
  };

  if (process.env.GIGX_API_KEY) {
    try {
      const content = await requestGigx(prompt, maxTokens);
      return { content, providerTrace: { ...providerTrace, gigx: "responded" } };
    } catch (gigxError) {
      const gigxReason = gigxError instanceof Error ? gigxError.message : "unknown error";
      providerTrace.gigx = "failed";
      if (!hasApiGateConfig()) throw new ChatProviderError(`GiGX request failed: ${gigxReason}`, providerTrace);
      try {
        const content = await requestApiGate(prompt, maxTokens);
        return { content, providerTrace: { ...providerTrace, apiGate: "responded" } };
      } catch (apiGateError) {
        const apiGateReason = apiGateError instanceof Error ? apiGateError.message : "unknown error";
        providerTrace.apiGate = "failed";
        throw new ChatProviderError(`GiGX request failed (${gigxReason}); TM API Gateway fallback failed (${apiGateReason})`, providerTrace);
      }
    }
  }

  try {
    const content = await requestApiGate(prompt, maxTokens);
    return { content, providerTrace: { ...providerTrace, apiGate: "responded" } };
  } catch (error) {
    providerTrace.apiGate = hasApiGateConfig() ? "failed" : "not-configured";
    const reason = error instanceof Error ? error.message : "unknown error";
    throw new ChatProviderError(reason, providerTrace);
  }
}

export async function chatComplete(prompt: string, maxTokens = 1024): Promise<string> {
  return (await chatCompleteWithTrace(prompt, maxTokens)).content;
}