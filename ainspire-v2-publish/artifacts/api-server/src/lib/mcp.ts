import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { calculateReadinessScores } from "./assessmentScore.js";

type AgentAnswer = { dimension: string; score: number };
type LearningLanguage = "EN" | "BM";

type YouTubeVideo = {
  videoTitle: string;
  videoUrl: string;
  thumbnailUrl: string;
  channelTitle: string;
  duration?: string;
  relevanceStatement?: string;
};

type YouTubeSearchItem = {
  id?: { videoId?: string };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
    };
  };
};

type YouTubeVideoDetails = {
  id?: string;
  snippet?: { defaultLanguage?: string; defaultAudioLanguage?: string };
  contentDetails?: { duration?: string };
  status?: { embeddable?: boolean };
};

const YOUTUBE_API_KEYS = [process.env.YOUTUBE_API_KEY, process.env.YOUTUBE_API_KEY_BACKUP]
  .filter((key): key is string => Boolean(key));

// Tries each configured key in order, falling back on auth/quota errors (403/429).
async function fetchYouTubeWithFallback(buildUrl: (key: string) => string): Promise<Response | null> {
  let lastResponse: Response | null = null;
  for (const key of YOUTUBE_API_KEYS) {
    try {
      const response = await fetch(buildUrl(key), { signal: AbortSignal.timeout(15_000) });
      if (response.ok) return response;
      lastResponse = response;
      if (response.status !== 403 && response.status !== 429) return response;
    } catch {
      // network error — try next key
    }
  }
  return lastResponse;
}

const PROJECTS_BY_DEPARTMENT: Record<string, string[]> = {
  "Network Engineering": [
    "AI-assisted network anomaly detection",
    "Predictive capacity and incident triage",
  ],
  "Data and Analytics": [
    "Enterprise knowledge retrieval and insight generation",
    "Data quality monitoring with AI-assisted remediation",
  ],
  "Cybersecurity and Security Operations": [
    "Security alert summarisation and prioritisation",
    "Threat intelligence investigation assistant",
  ],
  "Digital and Innovation": [
    "Customer journey intelligence prototype",
    "Responsible AI experimentation programme",
  ],
};

const DEFAULT_PROJECTS = [
  "AI workflow discovery and process automation",
  "Responsible AI pilot with measurable business outcomes",
];

const LEARNING_TOPICS: Record<string, string> = {
  cognitiveReadiness: "AI fundamentals and responsible AI",
  behavioralAdoption: "AI adoption and productivity workflows",
  skillsCapability: "prompt engineering, AI tools, and data analytics",
  orgEnvironmentalExposure: "enterprise AI governance and implementation",
  emotionalDisposition: "AI change adoption and practical confidence",
  economicVulnerability: "AI career skills and future-ready technology",
};

const PERSONA_SEARCH_TERMS: Record<string, string> = {
  explorer: "AI Explorer foundational AI learning",
  builder: "AI Builder hands-on AI engineering",
  strategist: "AI Strategist AI business strategy",
  visionary: "AI Visionary enterprise AI transformation",
};

function textResult(value: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(value) }] };
}

function formatDuration(value: string | undefined) {
  if (!value) return undefined;
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return undefined;
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0) + hours * 60;
  const seconds = Number(match[3] ?? 0);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function decodeHtmlEntities(value: string) {
  return value
    .replace(/&#39;|&#x27;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function isEnglishTrainingResult(title: string, description: string) {
  const text = decodeHtmlEntities(`${title} ${description}`).toLowerCase();
  const letters = text.match(/\p{L}/gu) ?? [];
  const nonLatinLetters = letters.filter((letter) => !/[a-z]/i.test(letter)).length;
  const isMostlyLatin = letters.length === 0 || nonLatinLetters / letters.length < 0.25;
  const hasAiTopic = /\b(ai|artificial intelligence|machine learning|generative ai|large language model|llm|chatgpt|automation|prompt engineering|data analytics|data science)\b/.test(text);
  const hasLearningSignal = /\b(course|training|tutorial|learn|workshop|fundamental|explained|guide|how to|skills|engineering|development|series|lecture|talk|webinar|lesson)\b/.test(text);
  return isMostlyLatin && hasAiTopic && hasLearningSignal;
}

async function searchYouTubeLearningVideos(query: string, language: LearningLanguage): Promise<YouTubeVideo[]> {
  if (YOUTUBE_API_KEYS.length === 0) return [];

  const searchResponse = await fetchYouTubeWithFallback((key) => {
    const searchParams = new URLSearchParams({
      part: "snippet",
      type: "video",
      maxResults: "10",
      order: "relevance",
      videoDuration: "medium",
      videoEmbeddable: "true",
      safeSearch: "strict",
      regionCode: "MY",
      relevanceLanguage: language === "BM" ? "ms" : "en",
      q: query,
      key,
    });
    return `https://www.googleapis.com/youtube/v3/search?${searchParams}`;
  });
  if (!searchResponse || !searchResponse.ok) return [];
  const searchData = (await searchResponse.json()) as { items?: YouTubeSearchItem[] };
  const candidates = (searchData.items ?? []).flatMap((item) => {
    const videoId = item.id?.videoId;
    const thumbnailUrl = item.snippet?.thumbnails?.high?.url ?? item.snippet?.thumbnails?.medium?.url;
    if (!videoId || !thumbnailUrl) return [];
    const videoTitle = decodeHtmlEntities(item.snippet?.title ?? "AI learning video");
    const description = item.snippet?.description ?? "";
    if (!isEnglishTrainingResult(videoTitle, description)) return [];
    return [{ videoId, thumbnailUrl, videoTitle, channelTitle: item.snippet?.channelTitle ?? "YouTube" }];
  });
  if (candidates.length === 0) return [];

  const detailsResponse = await fetchYouTubeWithFallback((key) => {
    const detailsParams = new URLSearchParams({
      part: "snippet,contentDetails,status",
      id: candidates.map((candidate) => candidate.videoId).join(","),
      key,
    });
    return `https://www.googleapis.com/youtube/v3/videos?${detailsParams}`;
  });
  const detailsData = detailsResponse?.ok
    ? (await detailsResponse.json()) as { items?: YouTubeVideoDetails[] }
    : { items: [] };
  const detailsById = new Map((detailsData.items ?? []).map((item) => [item.id, item]));

  return candidates.flatMap((candidate) => {
    const details = detailsById.get(candidate.videoId);
    if (details?.status?.embeddable === false) return [];
    const language = details?.snippet?.defaultAudioLanguage ?? details?.snippet?.defaultLanguage;
    if (language && !language.toLowerCase().startsWith("en")) return [];
    return [{
      videoTitle: candidate.videoTitle,
      videoUrl: `https://www.youtube.com/watch?v=${candidate.videoId}`,
      thumbnailUrl: `/api/youtube-thumbnail/${candidate.videoId}`,
      channelTitle: candidate.channelTitle,
      duration: formatDuration(details?.contentDetails?.duration),
    }];
  });
}

function createMcpServer() {
  const server = new McpServer({ name: "tm-workforce-tools", version: "1.0.0" });

  server.registerTool(
    "calculate_readiness_score",
    {
      title: "Calculate AI readiness score",
      description: "Calculates deterministic readiness scores from the structured assessment answers.",
      inputSchema: {
        answers: z.array(z.object({ dimension: z.string(), score: z.number() })),
      },
    },
    async ({ answers }) => textResult(calculateReadinessScores(answers)),
  );

  server.registerTool(
    "get_workforce_context",
    {
      title: "Get workforce context",
      description: "Returns bounded context for a Telekom Malaysia department and role.",
      inputSchema: {
        department: z.string(),
        role: z.string(),
      },
    },
    async ({ department, role }) => textResult({
      department,
      role,
      workforceContext: "Use the employee's readiness profile to guide development and project contribution recommendations.",
      governance: "Recommendations are advisory and require appropriate HR governance before consequential action.",
    }),
  );

  server.registerTool(
    "find_project_matches",
    {
      title: "Find project matches",
      description: "Finds advisory project contribution areas using department and readiness dimensions.",
      inputSchema: {
        department: z.string(),
        role: z.string(),
        dimensionScores: z.record(z.number()),
      },
    },
    async ({ department, role, dimensionScores }) => textResult({
      department,
      role,
      projectMatches: PROJECTS_BY_DEPARTMENT[department] ?? DEFAULT_PROJECTS,
      strongestDimensions: Object.entries(dimensionScores).sort(([, left], [, right]) => right - left).slice(0, 2).map(([dimension]) => dimension),
    }),
  );

  server.registerTool(
    "get_learning_pathway",
    {
      title: "Get learning pathway",
      description: "Returns learning priorities for the lowest readiness dimensions.",
      inputSchema: {
        department: z.string(),
        role: z.string(),
        persona: z.string().default("explorer"),
        dimensionScores: z.record(z.number()),
        language: z.enum(["EN", "BM"]).default("EN"),
      },
    },
    async ({ department, role, persona, dimensionScores, language }) => {
      const priorities = Object.entries(dimensionScores)
        .sort(([, left], [, right]) => left - right)
        .slice(0, 3)
        .map(([dimension, score]) => ({ dimension, score, action: `Targeted development for ${dimension}` }));
      const videoRecommendations = (await Promise.all(
        priorities.map(async (priority) => {
          const topic = LEARNING_TOPICS[priority.dimension] ?? "AI skills training";
          const personaTopic = PERSONA_SEARCH_TERMS[persona] ?? "AI contribution skills";
          const roleVideos = await searchYouTubeLearningVideos(`${role} ${department} ${personaTopic} ${topic} English tutorial`, language);
          const videos = roleVideos.length > 0
            ? roleVideos
            : await searchYouTubeLearningVideos(`${department} ${personaTopic} ${topic} AI training tutorial`, language);
          return { dimension: priority.dimension, videos };
        }),
      )).flatMap((item) => item.videos.map((video) => ({
        dimension: item.dimension,
        ...video,
        relevanceStatement: language === "BM"
          ? `Disyorkan untuk profil ${persona} anda kerana menyokong pembelajaran ${LEARNING_TOPICS[item.dimension] ?? "kemahiran AI"} dalam konteks ${role}.`
          : `Recommended for your ${persona} profile because it supports ${LEARNING_TOPICS[item.dimension] ?? "AI skills"} in the context of your ${role}.`,
      })));
      // Different dimension searches often surface the same popular video; keep only the first occurrence.
      const seenVideoUrls = new Set<string>();
      const dedupedVideoRecommendations = videoRecommendations.filter((video) => {
        if (seenVideoUrls.has(video.videoUrl)) return false;
        seenVideoUrls.add(video.videoUrl);
        return true;
      });
      return textResult({ department, priorities, videoRecommendations: dedupedVideoRecommendations });
    },
  );

  return server;
}

async function readToolResult(client: Client, name: string, arguments_: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: arguments_ });
  const content = (result as { content?: Array<{ type: string; text?: string }> }).content ?? [];
  const text = content.find((item) => item.type === "text")?.text;
  if (!text) throw new Error(`MCP tool ${name} returned no text result`);
  return JSON.parse(text) as Record<string, unknown>;
}

export async function runReadinessMcpWorkflow(input: {
  answers: AgentAnswer[];
  department: string;
  role: string;
  persona?: string;
  language?: LearningLanguage;
}) {
  const server = createMcpServer();
  const client = new Client({ name: "tm-readiness-agent", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  try {
    const score = await readToolResult(client, "calculate_readiness_score", { answers: input.answers });
    const dimensionScores = (score.dimensionScores ?? {}) as Record<string, number>;
    const workforceContext = await readToolResult(client, "get_workforce_context", {
      department: input.department,
      role: input.role,
    });
    const projectMatches = await readToolResult(client, "find_project_matches", {
      department: input.department,
      role: input.role,
      persona: input.persona ?? String((score as { persona?: string }).persona ?? "explorer"),
      dimensionScores,
    });
    const learningPathway = await readToolResult(client, "get_learning_pathway", {
      department: input.department,
      role: input.role,
      dimensionScores,
      language: input.language ?? "EN",
    });

    return { score, workforceContext, projectMatches, learningPathway };
  } finally {
    await client.close();
    await server.close();
  }
}

export async function runWorkforcePlanningMcpWorkflow(input: {
  divisionName: string;
  skillsGap: Array<{ persona: string; current: number; target: number; gap: number }>;
}) {
  const server = createMcpServer();
  const client = new Client({ name: "tm-workforce-planning-agent", version: "1.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const dimensionScores = Object.fromEntries(input.skillsGap.map((gap) => [gap.persona, gap.current]));

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  try {
    const workforceContext = await readToolResult(client, "get_workforce_context", {
      department: input.divisionName,
      role: "HR Workforce Planner",
    });
    const projectMatches = await readToolResult(client, "find_project_matches", {
      department: input.divisionName,
      role: "HR Workforce Planner",
      dimensionScores,
      language: "EN",
    });
    const learningPathway = await readToolResult(client, "get_learning_pathway", {
      department: input.divisionName,
      role: "HR Workforce Planner",
      dimensionScores,
      language: "EN",
    });

    return { workforceContext, projectMatches, learningPathway };
  } finally {
    await client.close();
    await server.close();
  }
}