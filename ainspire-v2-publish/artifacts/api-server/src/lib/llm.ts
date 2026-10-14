const GIGX_API_URL = process.env.GIGX_API_URL ?? "https://gigx.nexa-dev.tm.com.my/llm/v1/chat/completions";
const GIGX_API_TOKEN = process.env.GIGX_API_TOKEN;
const GIGX_MODEL = process.env.GIGX_LLM_MODEL ?? "qwen3-vl-4b-instruct";
const TOKEN_URL = process.env.TM_APIGATE_TOKEN_URL ?? "https://api.apigate.tm.com.my/token";
const API_URL = process.env.TM_APIGATE_API_URL ?? "https://api.apigate.tm.com.my/t/tm.com.my/AI-Foundry-Service/1.82.1/v1/chat/completions";
const CLIENT_ID = process.env.TM_APIGATE_CLIENT_ID;
const CLIENT_SECRET = process.env.TM_APIGATE_CLIENT_SECRET;
const CHAT_KEY = process.env.TM_APIGATE_CHAT_KEY;
const GATEWAY_MODEL = process.env.TM_LLM_MODEL ?? "gpt-oss-20b";
const REFRESH_BUFFER_SECONDS = 60;

type TokenCache = {
  accessToken: string;
  expiryTime: number;
};

let tokenCache: TokenCache | null = null;

function gatewayConfigError() {
  if (!CLIENT_ID || !CLIENT_SECRET || !CHAT_KEY) return new Error("TM API Gateway credentials are not configured");
  return null;
}

async function requestNewToken(): Promise<string> {
  const configError = gatewayConfigError();
  if (configError) throw configError;
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
  let primaryError: Error;

  if (!GIGX_API_TOKEN) {
    primaryError = new Error("GIGX_API_TOKEN is not configured");
  } else {
    try {
      return await requestCompletion(GIGX_API_URL, GIGX_API_TOKEN, GIGX_MODEL, prompt, maxTokens);
    } catch (error) {
      primaryError = error instanceof Error ? error : new Error(String(error));
    }
  }

  const configError = gatewayConfigError();
  if (configError) {
    throw new Error(`Primary GIGX LLM failed (${primaryError.message}); API Gate fallback unavailable (${configError.message})`);
  }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const token = await getValidToken();
      return await requestCompletion(API_URL, token, GATEWAY_MODEL, prompt, maxTokens, {
        "x-litellm-api-key": CHAT_KEY as string,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes("(401)") && attempt === 0) {
        tokenCache = null;
        continue;
      }
      throw new Error(`Primary GIGX LLM failed (${primaryError.message}); API Gate fallback failed (${error instanceof Error ? error.message : String(error)})`);
    }
  }

  throw new Error(`Primary GIGX LLM failed (${primaryError.message}); API Gate fallback failed after token refresh`);
}

async function requestCompletion(
  url: string,
  token: string,
  model: string,
  prompt: string,
  maxTokens: number,
  extraHeaders: Record<string, string> = {},
): Promise<string> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`LLM request failed (${response.status}): ${responseText.slice(0, 500)}`);
  }
  const data = (await response.json()) as {
    choices?: { message?: { content?: string | Array<{ type?: string; text?: string }> } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.length > 0) return content;
  if (Array.isArray(content)) {
    const text = content.map((item) => item.text ?? "").join("");
    if (text.length > 0) return text;
  }
  throw new Error("LLM response did not contain message content");
}
