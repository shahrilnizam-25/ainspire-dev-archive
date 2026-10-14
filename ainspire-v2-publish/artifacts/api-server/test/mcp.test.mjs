import assert from "node:assert/strict";
import test from "node:test";
import { runReadinessMcpWorkflow } from "../dist/index.mjs";

test("runs the readiness workflow through MCP tools", async () => {
  const result = await runReadinessMcpWorkflow({
    department: "Network Engineering",
    role: "Network Engineer",
    answers: [
      { dimension: "cognitiveReadiness", score: 4 },
      { dimension: "skillsCapability", score: 2 },
      { dimension: "behavioralAdoption", score: 3 },
    ],
  });

  assert.deepEqual(result.score, {
    overallReadiness: 75,
    dimensionScores: {
      cognitiveReadiness: 100,
      skillsCapability: 50,
      behavioralAdoption: 75,
    },
    personaScores: {
      explorer: 65,
      builder: 60,
      strategist: 38,
      visionary: 15,
    },
    persona: "strategist",
  });
  assert.deepEqual(result.workforceContext, {
    department: "Network Engineering",
    role: "Network Engineer",
    workforceContext: "Use the employee's readiness profile to guide development and project contribution recommendations.",
    governance: "Recommendations are advisory and require appropriate HR governance before consequential action.",
  });
  assert.deepEqual(result.projectMatches.projectMatches, [
    "AI-assisted network anomaly detection",
    "Predictive capacity and incident triage",
  ]);
  assert.equal(Array.isArray(result.learningPathway.priorities), true);
});
