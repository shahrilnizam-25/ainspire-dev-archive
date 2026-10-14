import assert from "node:assert/strict";
import test from "node:test";
import { calculateReadinessScores } from "../src/lib/assessmentScore.ts";

test("calculates overall and dimension readiness percentages", () => {
  const result = calculateReadinessScores([
    { dimension: "cognitiveReadiness", score: 4 },
    { dimension: "cognitiveReadiness", score: 2 },
    { dimension: "skillsCapability", score: 3 },
    { dimension: "skillsCapability", score: 3 },
  ]);

  assert.equal(result.overallReadiness, 75);
  assert.deepEqual(result.dimensionScores, {
    cognitiveReadiness: 75,
    skillsCapability: 75,
  });
  assert.equal(result.persona, 'strategist');
  assert.equal(result.personaScores.explorer, 54);
  assert.equal(result.personaScores.builder, 41);
});

test("clamps invalid scores to the supported one-to-four range", () => {
  const result = calculateReadinessScores([
    { dimension: "cognitiveReadiness", score: 0 },
    { dimension: "skillsCapability", score: 9 },
  ]);

  assert.equal(result.overallReadiness, 63);
  assert.equal(result.dimensionScores.cognitiveReadiness, 25);
  assert.equal(result.dimensionScores.skillsCapability, 100);
  assert.equal(result.persona, 'builder');
});