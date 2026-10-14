import { and, eq } from "drizzle-orm";
import {
  assessmentAnswersTable,
  assessmentOptionsTable,
  assessmentQuestionsTable,
  assessmentResultsTable,
  assessmentVersionsTable,
  departmentsTable,
  languagesTable,
  organizationsTable,
  personasTable,
  readinessDimensionsTable,
  recommendationVideosTable,
  resultDimensionScoresTable,
  resultPersonaScoresTable,
  resultRecommendationsTable,
  rolesTable,
  assessmentConsentsTable,
  assessmentSessionsTable,
  actionPlanActionsTable,
  actionPlanPhasesTable,
  actionPlansTable,
  analyticsEventsTable,
} from "@workspace/db/schema";

type PersistAnswer = {
  questionId: string;
  questionText: string;
  dimension: string;
  selectedOption: string;
  selectedText: string;
  score: number;
};

type PersistResult = {
  persona: string;
  confidence?: number;
  reasoning?: string;
  narrative?: string;
  recommendations?: Array<{
    title: string;
    description: string;
    videoTitle?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    channelTitle?: string;
    duration?: string;
    relevanceStatement?: string;
  }>;
  overallReadiness: number;
  dimensionScores: Record<string, number>;
  personaScores: Record<string, number>;
};

type PersistInput = {
  clientSessionId?: string;
  department: string;
  role: string;
  assessmentVersion?: string;
  language: "EN" | "BM";
  answers: PersistAnswer[];
  result: PersistResult;
};

const DIMENSION_NAMES: Record<string, { en: string; bm: string }> = {
  cognitiveReadiness: { en: "Cognitive Readiness", bm: "Kesediaan Kognitif" },
  behavioralAdoption: { en: "Behavioral Adoption", bm: "Penggunaan Tingkah Laku" },
  skillsCapability: { en: "Skills Capability", bm: "Keupayaan Kemahiran" },
  orgEnvironmentalExposure: { en: "Organisation / Environmental Exposure", bm: "Organisasi / Persekitaran" },
  emotionalDisposition: { en: "Emotional Disposition", bm: "Kecenderungan Emosi" },
  economicVulnerability: { en: "Economic Vulnerability", bm: "Kerentanan Ekonomi" },
};

const PERSONA_NAMES: Record<string, { en: string; bm: string }> = {
  explorer: { en: "Explorer", bm: "Peneroka" },
  builder: { en: "Builder", bm: "Pembina" },
  strategist: { en: "Strategist", bm: "Strategis" },
  visionary: { en: "Visionary", bm: "Visionari" },
};

function codeFor(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "other";
}

export function persistenceEnabled() {
  return Boolean(process.env.DATABASE_URL);
}

export async function persistClassification(input: PersistInput): Promise<string | null> {
  if (!persistenceEnabled()) return null;

  const { db } = await import("@workspace/db");
  const sessionId = await db.transaction(async (tx) => {
    await tx.insert(languagesTable).values([
      { code: "EN", name: "English" },
      { code: "BM", name: "Bahasa Melayu" },
    ]).onConflictDoNothing();

    await tx.insert(organizationsTable).values({ code: "TM", name: "Telekom Malaysia" }).onConflictDoNothing();
    const [organization] = await tx.select().from(organizationsTable).where(eq(organizationsTable.code, "TM")).limit(1);
    if (!organization) throw new Error("Unable to create default organization");

    const versionCode = input.assessmentVersion ?? "unknown";
    await tx.insert(assessmentVersionsTable).values({
      code: versionCode,
      name: `Assessment ${versionCode}`,
      status: "active",
      minimumQuestions: input.answers.length,
      maximumQuestions: input.answers.length,
    }).onConflictDoNothing();
    const [version] = await tx.select().from(assessmentVersionsTable).where(eq(assessmentVersionsTable.code, versionCode)).limit(1);
    if (!version) throw new Error("Unable to create assessment version");

    const dimensionIds = new Map<string, string>();
    for (const dimensionCode of Object.keys(input.result.dimensionScores)) {
      const names = DIMENSION_NAMES[dimensionCode] ?? { en: dimensionCode, bm: dimensionCode };
      await tx.insert(readinessDimensionsTable).values({ code: dimensionCode, nameEn: names.en, nameBm: names.bm }).onConflictDoNothing();
      const [dimension] = await tx.select().from(readinessDimensionsTable).where(eq(readinessDimensionsTable.code, dimensionCode)).limit(1);
      if (dimension) dimensionIds.set(dimensionCode, dimension.id);
    }

    await tx.insert(personasTable).values(Object.entries(PERSONA_NAMES).map(([code, names]) => ({
      code,
      nameEn: names.en,
      nameBm: names.bm,
    }))).onConflictDoNothing();
    if (!PERSONA_NAMES[input.result.persona]) {
      await tx.insert(personasTable).values({ code: input.result.persona, nameEn: input.result.persona, nameBm: input.result.persona }).onConflictDoNothing();
    }
    await tx.insert(departmentsTable).values({ organizationId: organization.id, code: codeFor(input.department), name: input.department }).onConflictDoNothing();
    const [department] = await tx.select().from(departmentsTable).where(and(eq(departmentsTable.organizationId, organization.id), eq(departmentsTable.code, codeFor(input.department)))).limit(1);
    await tx.insert(rolesTable).values({ organizationId: organization.id, departmentId: department?.id, code: codeFor(input.role), name: input.role }).onConflictDoNothing();
    const [role] = await tx.select().from(rolesTable).where(and(eq(rolesTable.organizationId, organization.id), eq(rolesTable.code, codeFor(input.role)))).limit(1);

    let session = input.clientSessionId
      ? (await tx.select().from(assessmentSessionsTable).where(eq(assessmentSessionsTable.clientSessionId, input.clientSessionId)).limit(1))[0]
      : undefined;
    if (!session) {
      [session] = await tx.insert(assessmentSessionsTable).values({
        organizationId: organization.id,
        assessmentVersionId: version.id,
        departmentId: department?.id,
        submittedDepartmentName: input.department,
        roleId: role?.id,
        submittedRoleName: input.role,
        languageStarted: input.language,
        clientSessionId: input.clientSessionId,
        status: "completed",
        submittedAt: new Date(),
        completedAt: new Date(),
      }).returning();
    }
    if (!session) throw new Error("Unable to create assessment session");

    for (let index = 0; index < input.answers.length; index += 1) {
      const answer = input.answers[index];
      const dimensionId = dimensionIds.get(answer.dimension);
      if (!dimensionId) continue;
      await tx.insert(assessmentQuestionsTable).values({
        assessmentVersionId: version.id,
        dimensionId,
        questionCode: answer.questionId,
        questionNumber: index + 1,
        textEn: answer.questionText,
        textBm: answer.questionText,
      }).onConflictDoNothing();
      const [question] = await tx.select().from(assessmentQuestionsTable).where(and(eq(assessmentQuestionsTable.assessmentVersionId, version.id), eq(assessmentQuestionsTable.questionCode, answer.questionId))).limit(1);
      if (!question) continue;
      await tx.insert(assessmentOptionsTable).values({
        questionId: question.id,
        optionCode: answer.selectedOption,
        textEn: answer.selectedText,
        textBm: answer.selectedText,
        score: answer.score,
      }).onConflictDoNothing();
      const [option] = await tx.select().from(assessmentOptionsTable).where(and(eq(assessmentOptionsTable.questionId, question.id), eq(assessmentOptionsTable.optionCode, answer.selectedOption))).limit(1);
      if (!option) continue;
      await tx.insert(assessmentAnswersTable).values({
        assessmentSessionId: session.id,
        questionId: question.id,
        selectedOptionId: option.id,
        questionNumber: index + 1,
        selectedOptionCode: answer.selectedOption,
        score: answer.score,
      }).onConflictDoNothing();
    }

    await tx.insert(assessmentConsentsTable).values({
      assessmentSessionId: session.id,
      consentType: "assessment-submission",
      consentVersion: input.assessmentVersion ?? "unknown",
      accepted: true,
    }).onConflictDoNothing();

    const existingResult = (await tx.select().from(assessmentResultsTable).where(and(eq(assessmentResultsTable.assessmentSessionId, session.id), eq(assessmentResultsTable.languageCode, input.language))).limit(1))[0];
    const result = existingResult ?? (await tx.insert(assessmentResultsTable).values({
      assessmentSessionId: session.id,
      languageCode: input.language,
      isCanonical: input.language === "EN",
      personaCode: input.result.persona,
      overallReadiness: input.result.overallReadiness,
      confidence: input.result.confidence?.toString(),
      reasoning: input.result.reasoning,
      narrative: input.result.narrative,
      modelName: process.env.TM_LLM_MODEL ?? "gpt-oss-20b",
      generationStatus: "completed",
    }).returning())[0];
    if (!result) throw new Error("Unable to create assessment result");

    for (const [dimensionCode, score] of Object.entries(input.result.dimensionScores)) {
      const dimensionId = dimensionIds.get(dimensionCode);
      if (!dimensionId) continue;
      await tx.insert(resultDimensionScoresTable).values({ assessmentResultId: result.id, dimensionId, score, percentage: score }).onConflictDoNothing();
    }
    for (const [personaCode, score] of Object.entries(input.result.personaScores)) {
      await tx.insert(resultPersonaScoresTable).values({ assessmentResultId: result.id, personaCode, score }).onConflictDoNothing();
    }
    for (const [index, recommendation] of (input.result.recommendations ?? []).entries()) {
      const [savedRecommendation] = await tx.insert(resultRecommendationsTable).values({
        assessmentResultId: result.id,
        sequenceNumber: index + 1,
        title: recommendation.title,
        description: recommendation.description,
        source: "llm",
      }).onConflictDoNothing().returning();
      if (savedRecommendation && recommendation.videoUrl && recommendation.videoTitle && recommendation.thumbnailUrl) {
        await tx.insert(recommendationVideosTable).values({
          recommendationId: savedRecommendation.id,
          videoId: recommendation.videoUrl.split("v=")[1] ?? recommendation.videoUrl,
          videoUrl: recommendation.videoUrl,
          thumbnailUrl: recommendation.thumbnailUrl,
          videoTitle: recommendation.videoTitle,
          channelTitle: recommendation.channelTitle,
          duration: recommendation.duration,
          relevanceStatement: recommendation.relevanceStatement,
        }).onConflictDoNothing();
      }
    }
    return session.id;
  });
  return sessionId;
}

type PersistActionPlanInput = {
  divisionName: string;
  teamSize: number;
  dominantPersona: string;
  result: {
    planTitle?: string;
    executiveSummary?: string;
    phases?: Array<{
      phase?: number;
      title?: string;
      days?: string;
      objective?: string;
      successMetric?: string;
      actions?: Array<{ action?: string; owner?: string; effort?: string }>;
    }>;
  };
};

export async function persistActionPlan(input: PersistActionPlanInput): Promise<string | null> {
  if (!persistenceEnabled()) return null;
  const { db } = await import("@workspace/db");
  return db.transaction(async (tx) => {
    await tx.insert(organizationsTable).values({ code: "TM", name: "Telekom Malaysia" }).onConflictDoNothing();
    const [organization] = await tx.select().from(organizationsTable).where(eq(organizationsTable.code, "TM")).limit(1);
    if (!organization) throw new Error("Unable to create default organization");
    await tx.insert(departmentsTable).values({ organizationId: organization.id, code: codeFor(input.divisionName), name: input.divisionName }).onConflictDoNothing();
    const [department] = await tx.select().from(departmentsTable).where(and(eq(departmentsTable.organizationId, organization.id), eq(departmentsTable.code, codeFor(input.divisionName)))).limit(1);
    await tx.insert(personasTable).values(Object.entries(PERSONA_NAMES).map(([code, names]) => ({ code, nameEn: names.en, nameBm: names.bm }))).onConflictDoNothing();
    const [actionPlan] = await tx.insert(actionPlansTable).values({
      organizationId: organization.id,
      departmentId: department?.id,
      title: input.result.planTitle ?? `90-day AI action plan for ${input.divisionName}`,
      executiveSummary: input.result.executiveSummary,
      dominantPersona: input.dominantPersona,
      teamSize: input.teamSize,
      status: "draft",
      generatedByModel: process.env.TM_LLM_MODEL ?? "gpt-oss-20b",
    }).returning();
    if (!actionPlan) throw new Error("Unable to create action plan");
    for (const [index, phase] of (input.result.phases ?? []).entries()) {
      const [savedPhase] = await tx.insert(actionPlanPhasesTable).values({
        actionPlanId: actionPlan.id,
        phaseNumber: phase.phase ?? index + 1,
        title: phase.title ?? `Phase ${index + 1}`,
        daysLabel: phase.days ?? `Days ${index * 30 + 1}-${(index + 1) * 30}`,
        objective: phase.objective,
        successMetric: phase.successMetric,
      }).returning();
      if (!savedPhase) continue;
      for (const action of phase.actions ?? []) {
        if (!action.action) continue;
        await tx.insert(actionPlanActionsTable).values({
          phaseId: savedPhase.id,
          actionText: action.action,
          ownerType: action.owner ?? "Manager",
          effortLevel: action.effort ?? "Medium",
        });
      }
    }
    return actionPlan.id;
  });
}

export async function persistAnalyticsEvent(input: {
  eventId?: string;
  sessionId?: string;
  assessmentSessionId?: string;
  eventName: string;
  eventCategory: string;
  screenName?: string;
  languageCode?: string;
  properties?: Record<string, unknown>;
  route?: string;
  durationMs?: number;
  success?: boolean;
  errorCode?: string;
  correlationId?: string;
}): Promise<string | null> {
  if (!persistenceEnabled()) return null;
  const { db } = await import("@workspace/db");
  const [event] = await db.insert(analyticsEventsTable).values({
    eventId: input.eventId,
    sessionId: input.sessionId,
    assessmentSessionId: input.assessmentSessionId,
    eventName: input.eventName,
    eventCategory: input.eventCategory,
    screenName: input.screenName,
    languageCode: input.languageCode,
    properties: input.properties,
    route: input.route,
    durationMs: input.durationMs,
    success: input.success,
    errorCode: input.errorCode,
    correlationId: input.correlationId,
  }).returning({ id: analyticsEventsTable.id });
  return event?.id ?? null;
}