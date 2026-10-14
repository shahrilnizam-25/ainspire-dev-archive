import { Router } from "express";
import { runReadinessAgent, translateNarrativeFieldsToBM, translateRecommendationsToBM } from "../lib/agent.js";
import { calculateReadinessScores } from "../lib/assessmentScore.js";
import { persistClassification } from "../lib/persistence.js";

const router = Router();

type AnswerItem = {
  questionId: string;
  questionText: string;
  dimension: string;
  selectedOption: string;
  selectedText: string;
  score: number;
};

const PERSONA_DEFS: Record<string, string> = {
  explorer: "curious and experimental, discovering AI tools and building foundational confidence",
  builder: "technically hands-on, implementing and integrating AI solutions",
  strategist: "business-aligned, leading AI projects and connecting technology to outcomes",
  visionary: "transformational, shaping long-term AI direction and inspiring change",
};

const LANG_LABELS: Record<string, string> = {
  EN: "English",
  BM: "Bahasa Melayu (Malay)",
};

router.post("/classify", async (req, res) => {
  const { answers, lang, department, role, assessmentVersion, referenceResult, clientSessionId } = req.body as {
    answers: AnswerItem[];
    lang?: string;
    department?: string;
    role?: string;
    assessmentVersion?: string;
    clientSessionId?: string;
    referenceResult?: Record<string, unknown>;
  };

  req.log.info(
    {
      event: "classify_started",
      answersCount: Array.isArray(answers) ? answers.length : 0,
      lang: lang ?? "EN",
      department: department ?? "",
      assessmentVersion: assessmentVersion ?? "",
    },
    "Starting AI readiness classification",
  );

  if (!Array.isArray(answers) || answers.length !== 20) {
    return res.status(400).json({ error: "exactly 20 assessment answers are required" });
  }

  function parseJsonObject(raw: string): Record<string, unknown> {
    const unfenced = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const start = unfenced.indexOf("{");
    const end = unfenced.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("LLM response did not contain a complete JSON object");
    return JSON.parse(unfenced.slice(start, end + 1)) as Record<string, unknown>;
  }

  // Closes any string/array/object left open when the model hit its token ceiling.
  function closeOpenJsonStructures(text: string): string {
    const stack: string[] = [];
    let inString = false;
    let escaped = false;
    for (const character of text) {
      if (escaped) { escaped = false; continue; }
      if (character === "\\") { if (inString) escaped = true; continue; }
      if (character === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (character === "{" || character === "[") stack.push(character);
      else if (character === "}" || character === "]") stack.pop();
    }
    let repaired = inString ? `${text}"` : text;
    repaired = repaired.replace(/,\s*$/, "");
    while (stack.length > 0) repaired += stack.pop() === "{" ? "}" : "]";
    return repaired;
  }

  // Truncated translations are still useful, so trim back property by property
  // until the remaining prefix parses instead of discarding the whole response.
  function parseJsonObjectLoose(raw: string): Record<string, unknown> {
    try {
      return parseJsonObject(raw);
    } catch {
      const unfenced = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const start = unfenced.indexOf("{");
      if (start < 0) throw new Error("LLM response did not contain a JSON object");
      let candidate = unfenced.slice(start);
      for (let attempt = 0; attempt < 200; attempt += 1) {
        try {
          return JSON.parse(closeOpenJsonStructures(candidate)) as Record<string, unknown>;
        } catch {
          const lastComma = candidate.lastIndexOf(",");
          if (lastComma <= 0) break;
          candidate = candidate.slice(0, lastComma);
        }
      }
      throw new Error("LLM response could not be recovered into a JSON object");
    }
  }

  function videoFields(video: Record<string, unknown> | undefined) {
    if (!video) return {};
    return {
      videoTitle: typeof video.videoTitle === "string" ? video.videoTitle : undefined,
      relevanceStatement: typeof video.relevanceStatement === "string" ? video.relevanceStatement : undefined,
      videoUrl: typeof video.videoUrl === "string" ? video.videoUrl : undefined,
      thumbnailUrl: typeof video.thumbnailUrl === "string" ? video.thumbnailUrl : undefined,
      channelTitle: typeof video.channelTitle === "string" ? video.channelTitle : undefined,
      duration: typeof video.duration === "string" ? video.duration : undefined,
    };
  }

  const localizedDimensions: Record<string, string> = lang === "BM"
    ? {
      cognitiveReadiness: "Kesediaan Kognitif",
      behavioralAdoption: "Penggunaan Tingkah Laku",
      skillsCapability: "Keupayaan Kemahiran",
      orgEnvironmentalExposure: "Organisasi / Persekitaran",
      emotionalDisposition: "Kecenderungan Emosi",
      economicVulnerability: "Kerentanan Ekonomi",
    }
    : {
      cognitiveReadiness: "Cognitive Readiness",
      behavioralAdoption: "Behavioral Adoption",
      skillsCapability: "Skills Capability",
      orgEnvironmentalExposure: "Organisation / Environmental Exposure",
      emotionalDisposition: "Emotional Disposition",
      economicVulnerability: "Economic Vulnerability",
    };

  function sanitizeUserText(value: unknown) {
    if (typeof value !== "string") return value;
    let sanitized = value;
    for (const [key, label] of Object.entries(localizedDimensions)) {
      sanitized = sanitized.replace(new RegExp(key, "g"), label);
    }
    const questionLabels: Record<string, string> = {
      cognitive: localizedDimensions.cognitiveReadiness,
      behavior: localizedDimensions.behavioralAdoption,
      skills: localizedDimensions.skillsCapability,
      environment: localizedDimensions.orgEnvironmentalExposure,
      emotion: localizedDimensions.emotionalDisposition,
      economic: localizedDimensions.economicVulnerability,
    };
    sanitized = sanitized.replace(/Q(cognitive|behavior|skills|environment|emotion|economic)-0?(\d+)/gi, (_match, key: string, number: string) =>
      `${questionLabels[key.toLowerCase()] ?? key} question ${number}`,
    );
    sanitized = sanitized.replace(/\b(readiness|score)\s+of\s+(\d{1,3})(?!\d)(?!%)/gi, "$1 of $2%");
    sanitized = sanitized.replace(/(Cognitive Readiness|Behavioral Adoption|Skills Capability|Organisation \/ Environmental Exposure|Emotional Disposition|Economic Vulnerability)\s*\((\d{1,3})\)/g, "$1 ($2%)");
    return lang === "BM"
      ? sanitized.replace(/\bthis employee\b/gi, "anda").replace(/\bthe employee's\b/gi, "anda").replace(/\bthe employee\b/gi, "anda")
      : sanitized.replace(/\bthis employee\b/gi, "you").replace(/\bthe employee's\b/gi, "your").replace(/\bthe employee\b/gi, "you");
  }

  function sanitizeTextArray(value: unknown) {
    return Array.isArray(value) ? value.map((item) => sanitizeUserText(item)) : value;
  }

  function normalizeRecommendations(value: unknown, fallback: unknown, videos: unknown): Array<{ title: string; description: string; videoTitle?: string; videoUrl?: string; thumbnailUrl?: string; channelTitle?: string; duration?: string }> {
    const primary = Array.isArray(value) ? value : [];
    const fallbackItems = Array.isArray(fallback) ? fallback : [];
    const videoItems = Array.isArray(videos) ? videos : [];
    const defaultDescription = lang === "BM"
      ? "Langkah seterusnya yang disyorkan berdasarkan profil kesediaan AI anda."
      : "Recommended next step based on your AI readiness profile.";
    const normalizeSource = (source: unknown[]) => source.flatMap((item, index) => {
      if (typeof item === "string" && item.trim()) {
        return [{ title: item.trim(), description: defaultDescription, ...videoFields(videoItems[index]) }];
      }
      if (!item || typeof item !== "object") return [];
      const candidate = item as Record<string, unknown>;
      const title = [candidate.title, candidate.name, candidate.course, candidate.recommendation]
        .find((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
      const fallbackTitle = typeof candidate.action === "string"
        ? (lang === "BM" ? `Pembangunan disasarkan untuk ${localizedDimensions[String(candidate.dimension)] ?? "kesediaan AI"}` : candidate.action)
        : undefined;
      const description = [candidate.description, candidate.reason, candidate.why, candidate.justification, candidate.detail]
        .find((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
      if (!title && !fallbackTitle) return [];
      return [{
        title: (title ?? fallbackTitle as string).trim(),
        description: description?.trim() ?? defaultDescription,
        ...videoFields(videoItems[index]),
      }];
    });
    const normalizedPrimary = normalizeSource(primary);
    return normalizedPrimary.length > 0 ? normalizedPrimary : normalizeSource(fallbackItems);
  }
  if (!department || !role) {
    return res.status(400).json({ error: "department and role are required" });
  }
  if (lang && !["EN", "BM"].includes(lang)) {
    return res.status(400).json({ error: "lang must be EN or BM" });
  }
  if (answers.some((answer) => !answer.questionId || !answer.dimension || !answer.selectedOption || typeof answer.score !== "number")) {
    return res.status(400).json({ error: "assessment answers are incomplete" });
  }
  const requiredDepartment = department;
  const requiredRole = role;

  const mcqSummary = answers
    .map((answer) =>
      `Q${answer.questionId} [${answer.dimension}]: "${answer.questionText}"\nSelected: ${answer.selectedOption}. "${answer.selectedText}" (score ${answer.score}/4)`,
    )
    .join("\n\n");
  const outputLang = LANG_LABELS[lang ?? "EN"] ?? LANG_LABELS.EN;
  const langInstruction = lang && lang !== "EN"
    ? `\n\nAll narrative, reasoning, recommendation, strength, gap, project-fit, and assignment-signal text must be written entirely in ${outputLang}. Use natural Bahasa Melayu sentence structure and do not mix English except for TM, AI, API, and unavoidable technical or product names.`
    : "";

  const scores = calculateReadinessScores(answers);
  const validPersonas = ["explorer", "builder", "strategist", "visionary"];
  if (!validPersonas.includes(String(scores.persona))) scores.persona = "explorer";

  async function persistResult(result: Record<string, unknown>) {
    try {
      await persistClassification({
        clientSessionId,
        department: requiredDepartment,
        role: requiredRole,
        assessmentVersion,
        language: lang === "BM" ? "BM" : "EN",
        answers,
        result: {
          persona: String(result.persona ?? scores.persona),
          confidence: typeof result.confidence === "number" ? result.confidence : undefined,
          reasoning: typeof result.reasoning === "string" ? result.reasoning : undefined,
          narrative: typeof result.narrative === "string" ? result.narrative : undefined,
          recommendations: Array.isArray(result.recommendations) ? result.recommendations as Array<{ title: string; description: string; videoTitle?: string; videoUrl?: string; thumbnailUrl?: string; channelTitle?: string; duration?: string; relevanceStatement?: string }> : [],
          overallReadiness: scores.overallReadiness,
          dimensionScores: scores.dimensionScores,
          personaScores: scores.personaScores,
        },
      });
    } catch (persistenceError) {
      req.log.error({ event: "classification_persistence_failed", err: persistenceError }, "Classification succeeded but database persistence failed");
    }
  }

  // BM always derives from the canonical EN result. Translation chunks degrade
  // individually, so persona, scores, recommendation count, and video metadata
  // stay identical to EN even when the model misbehaves.
  if (lang === "BM" && referenceResult && typeof referenceResult.narrative === "string" && typeof referenceResult.reasoning === "string") {
    const translateChunk = async (label: string, run: () => Promise<string>): Promise<Record<string, unknown> | null> => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          return parseJsonObjectLoose(await run());
        } catch (chunkError) {
          req.log.warn({ event: "classify_translate_chunk_failed", label, attempt, err: chunkError }, "BM translation chunk failed");
        }
      }
      return null;
    };

    const referenceRecommendations = Array.isArray(referenceResult.recommendations) ? referenceResult.recommendations : [];
    const [narrativeBlock, recommendationBlock] = await Promise.all([
      translateChunk("narrative", () => translateNarrativeFieldsToBM(referenceResult, { department, role })),
      referenceRecommendations.length > 0
        ? translateChunk("recommendations", () => translateRecommendationsToBM(referenceRecommendations, { department, role }))
        : Promise.resolve<Record<string, unknown> | null>({ recommendations: [] }),
    ]);

    const translatedRecommendations = Array.isArray(recommendationBlock?.recommendations) ? recommendationBlock.recommendations : [];
    const recommendations = referenceRecommendations.map((item, index) => {
      const base = (item ?? {}) as Record<string, unknown>;
      const translatedItem = (translatedRecommendations[index] ?? {}) as Record<string, unknown>;
      return {
        ...base,
        title: typeof translatedItem.title === "string" && translatedItem.title.trim() ? translatedItem.title.trim() : base.title,
        description: typeof translatedItem.description === "string" && translatedItem.description.trim() ? translatedItem.description.trim() : base.description,
      };
    });
    const pickArray = (value: unknown, fallback: unknown) => (Array.isArray(value) ? value : Array.isArray(fallback) ? fallback : []);
    const translatedText = (value: unknown, fallback: string) =>
      typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;

    const translatedResult = {
      persona: referenceResult.persona,
      confidence: referenceResult.confidence,
      reasoning: translatedText(narrativeBlock?.reasoning, "Profil kesediaan anda dinilai merentas enam dimensi."),
      narrative: translatedText(
        narrativeBlock?.narrative,
        `Profil anda sebagai ${role} dalam ${department} menunjukkan laluan pembangunan AI yang jelas berdasarkan skor kesediaan anda.`,
      ),
      strengths: pickArray(narrativeBlock?.strengths, referenceResult.strengths),
      developmentGaps: pickArray(narrativeBlock?.developmentGaps, referenceResult.developmentGaps),
      projectFit: pickArray(narrativeBlock?.projectFit, referenceResult.projectFit),
      resourceAssignmentSignals: pickArray(narrativeBlock?.resourceAssignmentSignals, referenceResult.resourceAssignmentSignals),
      recommendations,
    };

    req.log.info(
      {
        event: "classify_translate_success",
        persona: translatedResult.persona,
        narrativeTranslated: narrativeBlock !== null,
        recommendationsTranslated: recommendationBlock !== null,
      },
      "BM result derived from canonical EN result",
    );
    await persistResult(translatedResult);
    return res.json({ ...translatedResult, assessmentVersion, department, role, ...scores });
  }

  try {
    const agentRun = await runReadinessAgent({
      answers,
      department,
      role,
      assessmentVersion,
      language: lang === "BM" ? "BM" : "EN",
      referenceResult,
      languageInstruction: langInstruction,
      personaDefinitions: Object.entries(PERSONA_DEFS).map(([key, description]) => `- ${key}: ${description}`).join("\n"),
    });
    let result: Record<string, unknown>;
    let modelOutputWasInvalid = false;
    try {
      result = parseJsonObject(agentRun.raw);
    } catch (parseError) {
      modelOutputWasInvalid = true;
      req.log.warn({ event: "classify_model_output_invalid", err: parseError }, "Using deterministic fallback for invalid model JSON");
      result = {
        persona: scores.persona,
        confidence: 0.7,
        reasoning: lang === "BM"
          ? "Profil ini menggunakan skor kesediaan berstruktur merentas enam dimensi kerana output model tidak dapat distrukturkan."
          : "This profile uses the structured readiness scores across six dimensions because the model output could not be structured.",
        narrative: lang === "BM"
          ? `Profil anda sebagai ${role} dalam ${department} menunjukkan laluan pembangunan AI yang jelas berdasarkan skor kesediaan anda.`
          : `Your profile as a ${role} in ${department} shows a clear AI development path based on your readiness scores.`,
        recommendations: [],
        strengths: [],
        developmentGaps: [],
        projectFit: [],
        resourceAssignmentSignals: [],
      };
    }

    if (!validPersonas.includes(String(scores.persona))) scores.persona = "explorer";
    result.persona = scores.persona;
    if (typeof result.confidence !== "number") {
      result.confidence = 0.7;
    } else {
      const rawConfidence = result.confidence > 1 ? result.confidence / 100 : result.confidence;
      result.confidence = Math.max(0, Math.min(1, rawConfidence));
    }
    if (lang === "BM" && typeof referenceResult?.confidence === "number") {
      result.confidence = referenceResult.confidence;
    }
    result.reasoning = sanitizeUserText(result.reasoning) ?? (lang === "BM" ? "Profil kesediaan anda dinilai merentas enam dimensi." : "Your readiness profile was evaluated across the six dimensions.");
    result.narrative = sanitizeUserText(result.narrative) ?? (lang === "BM" ? "Profil anda menunjukkan peluang praktikal untuk mengembangkan sumbangan AI anda." : "Your profile highlights practical opportunities to grow your AI contribution.");
    result.strengths = sanitizeTextArray(result.strengths);
    result.developmentGaps = sanitizeTextArray(result.developmentGaps);
    result.projectFit = sanitizeTextArray(result.projectFit);
    result.resourceAssignmentSignals = sanitizeTextArray(result.resourceAssignmentSignals);
    if (!String(result.narrative).toLowerCase().includes(role.toLowerCase()) && !String(result.narrative).toLowerCase().includes(department.toLowerCase())) {
      result.narrative = lang === "BM"
        ? `${result.narrative} Peranan semasa anda sebagai ${role} dalam ${department} telah digunakan sebagai konteks untuk profil ini.`
        : `${result.narrative} Your current role as ${role} in ${department} was included as context for this profile.`;
    }
    const learningPathway = agentRun.mcpContext.learningPathway as { priorities?: unknown; videoRecommendations?: unknown };
    const normalizedRecommendations = normalizeRecommendations(
      result.recommendations,
      lang === "BM" && !modelOutputWasInvalid && Array.isArray(referenceResult?.recommendations) ? referenceResult.recommendations : learningPathway.priorities,
      learningPathway.videoRecommendations,
    );
    if (lang === "BM" && Array.isArray(referenceResult?.recommendations) && normalizedRecommendations.length < referenceResult.recommendations.length) {
      const missing = referenceResult.recommendations.length - normalizedRecommendations.length;
      for (let index = 0; index < missing; index += 1) {
        normalizedRecommendations.push({
          title: `Cadangan pembelajaran AI ${normalizedRecommendations.length + 1}`,
          description: "Langkah ini disyorkan berdasarkan profil kesediaan AI anda.",
        });
      }
    }
    result.recommendations = normalizedRecommendations;
    if (!Array.isArray(result.strengths)) result.strengths = [];
    if (!Array.isArray(result.developmentGaps)) result.developmentGaps = [];
    if (!Array.isArray(result.projectFit)) result.projectFit = [];
    if (!Array.isArray(result.resourceAssignmentSignals)) result.resourceAssignmentSignals = [];

    await persistResult(result);
    req.log.info({ event: "classify_success", persona: result.persona, confidence: result.confidence }, "AI readiness classification completed");
    return res.json({ ...result, assessmentVersion, department, role, ...scores });
  } catch (err) {
    req.log.error({ event: "classify_failed", err }, "AI readiness classification failed");
    return res.status(500).json({ error: "AI classification failed", details: String(err) });
  }
});

export default router;
