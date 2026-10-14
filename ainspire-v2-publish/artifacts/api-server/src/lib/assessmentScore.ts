export type ScoredAnswer = {
  dimension: string;
  score: number;
};

export const PERSONA_READINESS_BANDS = {
  explorer: { minimum: 0, maximum: 54 },
  builder: { minimum: 55, maximum: 69 },
  strategist: { minimum: 70, maximum: 84 },
  visionary: { minimum: 85, maximum: 100 },
} as const;

export function calculateReadinessScores(answers: ScoredAnswer[]) {
  const dimensionTotals: Record<string, { total: number; count: number }> = {};
  for (const answer of answers) {
    const current = dimensionTotals[answer.dimension] ?? { total: 0, count: 0 };
    current.total += Math.max(1, Math.min(4, answer.score));
    current.count += 1;
    dimensionTotals[answer.dimension] = current;
  }

  const dimensionScores = Object.fromEntries(
    Object.entries(dimensionTotals).map(([dimension, value]) => [
      dimension,
      Math.round((value.total / (value.count * 4)) * 100),
    ]),
  );
  const overallReadiness = Math.round(
    (answers.reduce((total, answer) => total + Math.max(1, Math.min(4, answer.score)), 0) /
      (answers.length * 4)) * 100,
  );

  const score = (dimension: string) => dimensionScores[dimension] ?? 0;
  const personaScores = {
    explorer: Math.round(score('cognitiveReadiness') * 0.45 + score('emotionalDisposition') * 0.35 + (100 - score('orgEnvironmentalExposure')) * 0.2),
    builder: Math.round(score('skillsCapability') * 0.35 + score('behavioralAdoption') * 0.3 + score('cognitiveReadiness') * 0.2 + score('orgEnvironmentalExposure') * 0.15),
    strategist: Math.round(score('orgEnvironmentalExposure') * 0.4 + score('cognitiveReadiness') * 0.3 + score('economicVulnerability') * 0.2 + score('behavioralAdoption') * 0.1),
    visionary: Math.round(score('orgEnvironmentalExposure') * 0.4 + score('economicVulnerability') * 0.2 + score('behavioralAdoption') * 0.2 + score('emotionalDisposition') * 0.2),
  };
  const persona = (Object.entries(PERSONA_READINESS_BANDS).find(([, band]) => overallReadiness >= band.minimum && overallReadiness <= band.maximum)?.[0] ?? 'explorer') as keyof typeof PERSONA_READINESS_BANDS;

  return { overallReadiness, dimensionScores, personaScores, persona };
}