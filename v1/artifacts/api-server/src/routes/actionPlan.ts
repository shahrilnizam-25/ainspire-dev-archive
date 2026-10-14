import { Router } from "express";
import { chatComplete } from "../lib/llm.js";
import { runWorkforcePlanningMcpWorkflow } from "../lib/mcp.js";
import { persistActionPlan } from "../lib/persistence.js";

const router = Router();

function parseActionPlanJson(raw: string): Record<string, unknown> {
  const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const start = cleaned.indexOf("{");
  if (start < 0) throw new Error("Action plan response did not contain a JSON object");
  let candidate = cleaned.slice(start);
  for (let attempt = 0; attempt < 200; attempt += 1) {
    try {
      return JSON.parse(candidate) as Record<string, unknown>;
    } catch {
      const lastComma = candidate.lastIndexOf(",");
      if (lastComma <= 0) break;
      candidate = candidate.slice(0, lastComma);
      let inString = false;
      let escaped = false;
      const stack: string[] = [];
      for (const character of candidate) {
        if (escaped) { escaped = false; continue; }
        if (character === "\\") { if (inString) escaped = true; continue; }
        if (character === '"') { inString = !inString; continue; }
        if (inString) continue;
        if (character === "{" || character === "[") stack.push(character);
        else if (character === "}" || character === "]") stack.pop();
      }
      candidate = `${inString ? `${candidate}"` : candidate}${stack.reverse().map((item) => item === "{" ? "}" : "]").join("")}`;
    }
  }
  throw new Error("Action plan response could not be recovered into JSON");
}

router.post("/action-plan", async (req, res) => {
  const { distribution, teamSize, divisionName, skillsGap, dominantPersona } = req.body as {
    distribution: Record<string, number>;
    teamSize: number;
    divisionName: string;
    dominantPersona: string;
    skillsGap: Array<{ persona: string; current: number; target: number; gap: number }>;
  };
  const safeDistribution = distribution && typeof distribution === "object" ? distribution : {};
  const safeSkillsGap = Array.isArray(skillsGap) ? skillsGap : [];
  const safeDivisionName = divisionName || "IT Strategy & Orchestration";
  const safeTeamSize = typeof teamSize === "number" ? teamSize : 0;
  const safeDominantPersona = dominantPersona || "explorer";

  req.log.info(
    {
      event: "action_plan_started",
      teamSize: safeTeamSize,
      divisionName: safeDivisionName,
      dominantPersona: safeDominantPersona,
      skillsGapCount: safeSkillsGap.length,
    },
    "Starting action plan generation",
  );

  const gapSummary = safeSkillsGap
    .map(g => `  - ${g.persona}: currently ${g.current}% → target ${g.target}% (gap: ${g.gap > 0 ? `+${g.gap}` : g.gap}%)`)
    .join("\n");

  const distSummary = Object.entries(safeDistribution)
    .map(([p, pct]) => `  - ${p}: ${pct}%`)
    .join("\n");

  const prompt = `You are an expert AI Workforce Development Strategist for Telekom Malaysia. Generate a comprehensive, actionable 90-day team AI upskilling action plan based on the team data below.

## Team Context
- Division / Team: ${safeDivisionName}
- Team Size: ${safeTeamSize} employees assessed
- Dominant AI Persona: ${safeDominantPersona}

## Current Persona Distribution
${distSummary}

## Skills Gap (Current vs HR Target)
${gapSummary.length > 0 ? gapSummary : "  - No target set yet; recommend a balanced distribution"}

## Instructions
Create a structured 90-day action plan with exactly 3 phases (Phase 1: Days 1–30, Phase 2: Days 31–60, Phase 3: Days 61–90).

For each phase provide:
- A compelling phase title
- A one-sentence phase objective
- 3–4 specific, concrete actions (not vague suggestions) tailored to this team's persona mix and skills gap
- A measurable success metric for the phase

Tailor the actions to the specific persona gaps — e.g., if Explorer % is above target, recommend structured implementation programmes; if Builder % is low, recommend hands-on AI engineering workshops.

Respond ONLY with valid JSON, no markdown:
{
  "planTitle": "string — compelling title for this team's 90-day plan",
  "executiveSummary": "2-3 sentence summary of the plan's rationale and expected outcomes",
  "phases": [
    {
      "phase": 1,
      "title": "string",
      "days": "Days 1–30",
      "objective": "string",
      "actions": [
        { "action": "string", "owner": "HR / Manager / Employee", "effort": "Low|Medium|High", "personas": ["explorer","builder"] }
      ],
      "successMetric": "string — specific measurable outcome"
    }
  ],
  "keyRisks": ["string", "string"],
  "expectedOutcome": "string — what the persona distribution should look like after 90 days"
}`;

  try {
    const mcpContext = await runWorkforcePlanningMcpWorkflow({
      divisionName: safeDivisionName,
      skillsGap: safeSkillsGap,
    });
    const raw = await chatComplete(`${prompt}\n\n## MCP workforce context\n${JSON.stringify(mcpContext, null, 2)}`, 2048);
    const result = parseActionPlanJson(raw);

    try {
      await persistActionPlan({
        divisionName: safeDivisionName,
        teamSize: safeTeamSize,
        dominantPersona: safeDominantPersona,
        result,
      });
    } catch (persistenceError) {
      req.log.error({ event: "action_plan_persistence_failed", err: persistenceError }, "Action plan generated but database persistence failed");
    }

    req.log.info({ event: "action_plan_success" }, "Action plan generation completed");

    return res.json(result);
  } catch (err) {
    req.log.error({ event: "action_plan_failed", err }, "Action plan generation failed");
    return res.status(500).json({ error: "Action plan generation failed", details: String(err) });
  }
});

export default router;
