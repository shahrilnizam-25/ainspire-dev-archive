export const ANALYSIS_PHASE_MS = 2500;
export const ANALYSIS_COMPLETION_HOLD_MS = 900;
/** The presentation finishes only after every phase and the response are ready. */
export function analysisProgress(elapsedMs: number, resultReady: boolean) {
  const elapsed = Math.max(0, elapsedMs);
  const sequenceComplete = elapsed >= 4 * ANALYSIS_PHASE_MS && resultReady;
  return {
    activeStep: Math.min(3, Math.floor(elapsed / ANALYSIS_PHASE_MS)),
    completedSteps: [0, 1, 2, 3].filter(i => i === 3 ? sequenceComplete : elapsed >= (i + 1) * ANALYSIS_PHASE_MS),
    sequenceComplete,
    progressPercent: sequenceComplete ? 100 : Math.min(96, Math.round(elapsed / (4 * ANALYSIS_PHASE_MS) * 96)),
  };
}
