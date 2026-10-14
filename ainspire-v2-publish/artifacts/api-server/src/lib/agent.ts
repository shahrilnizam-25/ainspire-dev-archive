import { chatComplete } from "./llm.js";
import { runReadinessMcpWorkflow } from "./mcp.js";

export async function runReadinessAgent(input: {
  answers: Array<{
    questionId: string;
    questionText: string;
    dimension: string;
    selectedOption: string;
    selectedText: string;
    score: number;
  }>;
  department: string;
  role: string;
  assessmentVersion?: string;
  language: "EN" | "BM";
  referenceResult?: Record<string, unknown>;
  languageInstruction: string;
  personaDefinitions: string;
}) {
  const dimensionLabels: Record<string, string> = {
    cognitiveReadiness: "Cognitive Readiness",
    behavioralAdoption: "Behavioral Adoption",
    skillsCapability: "Skills Capability",
    orgEnvironmentalExposure: "Organisation / Environmental Exposure",
    emotionalDisposition: "Emotional Disposition",
    economicVulnerability: "Economic Vulnerability",
  };
  const mcpContext = await runReadinessMcpWorkflow({
    answers: input.answers.map(({ dimension, score }) => ({ dimension, score })),
    department: input.department,
    role: input.role,
    language: input.language,
  });
  const answerSummary = input.answers
    .map((answer) => `Q${answer.questionId} [${dimensionLabels[answer.dimension] ?? answer.dimension}]: ${answer.selectedOption}. "${answer.selectedText}" (score ${answer.score}/4)`)
    .join("\n");

  const canonicalInstruction = input.referenceResult
    ? `\n\n## Canonical English analysis\n${JSON.stringify(input.referenceResult, null, 2)}\n\nFor this ${input.language} response, translate the canonical analysis faithfully. Preserve the persona, scores, evidence, recommendation count and order, and meaning. Do not reclassify, omit recommendations, or invent a different interpretation.`
    : "";
  const prompt = `You are the supervisor agent for Telekom Malaysia's AI workforce readiness programme. Use the MCP tool results below as grounded enterprise context. Produce an advisory readiness profile and secondary AI persona.${input.languageInstruction}${canonicalInstruction}

## Personas
${input.personaDefinitions}

## Employee context
- Department: ${input.department}
- Role: ${input.role}
- Assessment version: ${input.assessmentVersion ?? "unknown"}

## Assessment evidence
${answerSummary}

## MCP tool results
${JSON.stringify(mcpContext, null, 2)}

## Rules
- Treat MCP deterministic scores as authoritative.
- Treat the deterministic persona and persona scores as authoritative; use your persona output only to explain the evidence.
- Use project matches and learning priorities as evidence, not invented facts.
- Use human-readable dimension names; never expose internal keys such as "behavioralAdoption" or "orgEnvironmentalExposure".
- Write readiness and dimension scores as percentages, for example "63%" or "63/100"; never present a bare score without its scale.
- Address the employee directly using "you" and "your"; never refer to them as "this employee".
- Keep recommendation descriptions specific and actionable, and include the selected role and department context.
- Mention the submitted role and department naturally in the narrative when they materially affect the interpretation.
- Recommendations are advisory; do not make employment, promotion, or termination decisions.
- Return ONLY valid JSON with persona, confidence, reasoning, narrative, strengths, developmentGaps, projectFit, resourceAssignmentSignals, and recommendations.
`;

  const raw = await chatComplete(prompt, 2048);
  return { raw, mcpContext };
}

// Translates an already-computed canonical English result into Bahasa Melayu.
// Split into two smaller calls because a single combined response regularly hit
// the token ceiling and truncated mid-JSON, forcing a full re-classification.
const BM_TRANSLATION_RULES = `You are a professional English-to-Bahasa Melayu translator for Telekom Malaysia's AI workforce readiness programme.

Translate the JSON values below into fluent, natural Bahasa Melayu. This is a pure translation task:
- Do not change the meaning, add new information, remove information, or reinterpret the content.
- Do not change how many items are in any array; translate each item 1:1, in the same order.
- Keep "TM", "AI", "API", percentages, and unavoidable technical or product names unchanged.
- Address the reader directly using "anda".`;

export async function translateNarrativeFieldsToBM(
  referenceResult: Record<string, unknown>,
  context: { department: string; role: string },
): Promise<string> {
  const translatable = {
    reasoning: referenceResult.reasoning,
    narrative: referenceResult.narrative,
    strengths: Array.isArray(referenceResult.strengths) ? referenceResult.strengths : [],
    developmentGaps: Array.isArray(referenceResult.developmentGaps) ? referenceResult.developmentGaps : [],
    projectFit: Array.isArray(referenceResult.projectFit) ? referenceResult.projectFit : [],
    resourceAssignmentSignals: Array.isArray(referenceResult.resourceAssignmentSignals) ? referenceResult.resourceAssignmentSignals : [],
  };

  const prompt = `${BM_TRANSLATION_RULES}
- The employee's role is "${context.role}" in "${context.department}" — keep this context natural if it already appears in the text.

## English content to translate
${JSON.stringify(translatable, null, 2)}

## Output rules
Return ONLY valid JSON with exactly these keys: reasoning, narrative, strengths, developmentGaps, projectFit, resourceAssignmentSignals.
`;

  return chatComplete(prompt, 2048);
}

export async function translateRecommendationsToBM(
  recommendations: unknown[],
  context: { department: string; role: string },
): Promise<string> {
  const translatable = recommendations.map((item) => {
    const candidate = (item ?? {}) as Record<string, unknown>;
    return { title: candidate.title ?? "", description: candidate.description ?? "" };
  });

  const prompt = `${BM_TRANSLATION_RULES}
- The employee's role is "${context.role}" in "${context.department}".

## English recommendations to translate
${JSON.stringify(translatable, null, 2)}

## Output rules
Return ONLY valid JSON shaped as {"recommendations": [...]} containing exactly ${translatable.length} objects, each with only "title" and "description", in the same order as the input.
`;

  return chatComplete(prompt, 2048);
}