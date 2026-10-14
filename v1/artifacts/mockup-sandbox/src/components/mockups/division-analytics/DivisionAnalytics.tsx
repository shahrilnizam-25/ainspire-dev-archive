const DIVISIONS = [
  { name: "IT Strategy & Orchestration", short: "ITaaS", total: 120, completed: 108, avgScore: 82, topPersona: "Strategist", readiness: 88 },
  { name: "Network Engineering", short: "NetEng", total: 340, completed: 271, avgScore: 71, topPersona: "Builder", readiness: 74 },
  { name: "Customer Experience", short: "CX", total: 210, completed: 189, avgScore: 76, topPersona: "Explorer", readiness: 79 },
  { name: "Digital & Innovation", short: "D&I", total: 95, completed: 90, avgScore: 91, topPersona: "Visionary", readiness: 94 },
  { name: "Wholesale & International", short: "W&I", total: 180, completed: 126, avgScore: 68, topPersona: "Explorer", readiness: 71 },
  { name: "Finance & Strategy", short: "Fin", total: 140, completed: 119, avgScore: 74, topPersona: "Strategist", readiness: 77 },
  { name: "Human Capital", short: "HC", total: 88, completed: 70, avgScore: 72, topPersona: "Strategist", readiness: 75 },
  { name: "Corporate Communications", short: "CorpComm", total: 60, completed: 51, avgScore: 78, topPersona: "Visionary", readiness: 82 },
];

const personaColors: Record<string, string> = {
  Explorer: "#f59e0b",
  Builder: "#00d4c8",
  Strategist: "#8b5cf6",
  Visionary: "#ec4899",
};

const monthlyTrend = [
  { month: "Jan", score: 61 }, { month: "Feb", score: 64 }, { month: "Mar", score: 67 },
  { month: "Apr", score: 70 }, { month: "May", score: 73 }, { month: "Jun", score: 77 },
  { month: "Jul", score: 80 },
];

const maxScore = 100;
const maxBar = Math.max(...monthlyTrend.map(m => m.score));

export function DivisionAnalytics() {
  const totalEmployees = DIVISIONS.reduce((s, d) => s + d.total, 0);
  const totalCompleted = DIVISIONS.reduce((s, d) => s + d.completed, 0);
  const avgReadiness = Math.round(DIVISIONS.reduce((s, d) => s + d.readiness, 0) / DIVISIONS.length);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e1a 0%, #0d1b2e 100%)", padding: "28px 32px", fontFamily: "system-ui, sans-serif", color: "#fff" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 11, color: "rgba(0,212,200,0.7)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>GCTO Office · Enterprise AI Readiness</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 2 }}>Division-Level Analytics</div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Q3 2026 · {DIVISIONS.length} divisions · {totalEmployees.toLocaleString()} employees</div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "Total Employees", value: totalEmployees.toLocaleString(), sub: "Across 8 divisions", color: "#fff" },
          { label: "Assessments Done", value: `${Math.round(totalCompleted / totalEmployees * 100)}%`, sub: `${totalCompleted.toLocaleString()} completed`, color: "#00d4c8" },
          { label: "Avg Readiness Index", value: `${avgReadiness}`, sub: "↑ +11 pts QoQ", color: "#22c55e" },
          { label: "High-Readiness Divs", value: "3", sub: "Score ≥ 85", color: "#8b5cf6" },
        ].map(k => (
          <div key={k.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.color, marginBottom: 2 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginBottom: 20 }}>

        {/* Division table */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 13, fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Division Breakdown</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Click a row to drill down →</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                {["Division", "Headcount", "Completion", "Avg Score", "Top Persona", "Readiness Index"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.5px" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DIVISIONS.sort((a, b) => b.readiness - a.readiness).map((d, i) => {
                const pct = Math.round(d.completed / d.total * 100);
                const isHigh = d.readiness >= 85;
                return (
                  <tr key={d.name} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: isHigh ? "rgba(0,212,200,0.04)" : (i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)"), cursor: "pointer" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{d.name}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{d.short}</div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{d.total.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: pct >= 85 ? "#22c55e" : pct >= 70 ? "#00d4c8" : "#f59e0b", borderRadius: 99 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: pct >= 85 ? "#22c55e" : pct >= 70 ? "#00d4c8" : "#f59e0b", minWidth: 34 }}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 14, fontWeight: 700, color: d.avgScore >= 80 ? "#00d4c8" : d.avgScore >= 70 ? "#f59e0b" : "#ef4444" }}>{d.avgScore}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", background: `${personaColors[d.topPersona]}18`, color: personaColors[d.topPersona], borderRadius: 20, border: `1px solid ${personaColors[d.topPersona]}30` }}>{d.topPersona}</span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: d.readiness >= 85 ? "#22c55e" : d.readiness >= 75 ? "#00d4c8" : "#f59e0b" }}>{d.readiness}</span>
                        {isHigh && <span style={{ fontSize: 9, fontWeight: 700, padding: "1px 6px", background: "rgba(34,197,94,0.15)", color: "#22c55e", borderRadius: 10 }}>HIGH</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Right panel: trend */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Monthly trend */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px", flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Org-Wide Readiness Trend</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, marginBottom: 8 }}>
              {monthlyTrend.map((m, i) => (
                <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>{m.score}</div>
                  <div style={{ width: "100%", background: i === monthlyTrend.length - 1 ? "#00d4c8" : "rgba(0,212,200,0.3)", borderRadius: "4px 4px 0 0", height: `${(m.score / maxBar) * 80}px`, transition: "height 0.5s ease" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {monthlyTrend.map(m => <div key={m.month} style={{ flex: 1, textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{m.month}</div>)}
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(0,212,200,0.7)", fontWeight: 600 }}>↑ +19 pts improvement since Jan 2026</div>
          </div>

          {/* Legend */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: "rgba(255,255,255,0.7)" }}>Readiness Index</div>
            {[{ range: "≥ 85", label: "High", color: "#22c55e" }, { range: "75–84", label: "Moderate", color: "#00d4c8" }, { range: "< 75", label: "Needs Action", color: "#f59e0b" }].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{r.label}</span>
                </div>
                <span style={{ fontSize: 12, color: r.color, fontWeight: 600 }}>{r.range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
        AiNspire · Division Analytics · Data refreshed daily · Q3 2026
      </div>
    </div>
  );
}
