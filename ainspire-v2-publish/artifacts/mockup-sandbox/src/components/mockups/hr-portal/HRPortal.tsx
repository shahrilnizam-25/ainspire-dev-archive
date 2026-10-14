const TEAM = [
  { name: "Ahmad Faiz", role: "Network Engineer", persona: "Builder", grade: "H", completion: true, score: 84, trend: "+12" },
  { name: "Nurul Ain", role: "Digital Strategy", persona: "Visionary", grade: "G", completion: true, score: 91, trend: "+8" },
  { name: "Razif Hamdan", role: "IT Operations", persona: "Explorer", grade: "F", completion: true, score: 67, trend: "+5" },
  { name: "Siti Hajar", role: "Customer Experience", persona: "Strategist", grade: "H", completion: true, score: 78, trend: "+15" },
  { name: "Danial Arif", role: "Cloud Infrastructure", persona: "Builder", grade: "G", completion: true, score: 82, trend: "+9" },
  { name: "Melissa Ong", role: "Product Management", persona: "Visionary", grade: "I", completion: true, score: 88, trend: "+6" },
  { name: "Hafizuddin", role: "Security Operations", persona: "Strategist", grade: "F", completion: false, score: null, trend: null },
  { name: "Amirul Hakim", role: "Data Analytics", persona: "Explorer", grade: "G", completion: false, score: null, trend: null },
];

const personaColors: Record<string, string> = {
  Explorer: "#f59e0b",
  Builder: "#00d4c8",
  Strategist: "#8b5cf6",
  Visionary: "#ec4899",
};

const personaCounts = TEAM.reduce((acc, m) => {
  if (m.completion) acc[m.persona] = (acc[m.persona] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

export function HRPortal() {
  const completed = TEAM.filter(m => m.completion).length;
  const avgScore = Math.round(TEAM.filter(m => m.score).reduce((s, m) => s + (m.score || 0), 0) / completed);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e1a 0%, #0d1b2e 100%)", padding: "28px 32px", fontFamily: "system-ui, sans-serif", color: "#fff" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(0,212,200,0.7)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Manager View · IT Service Strategy & Orchestration</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 2 }}>Team AI Readiness Dashboard</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Last assessment cycle: July 2026 · 8 direct reports</div>
        </div>
        <button style={{ padding: "10px 18px", background: "rgba(0,212,200,0.1)", border: "1px solid rgba(0,212,200,0.3)", borderRadius: 10, color: "#00d4c8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          ↓ Export Report
        </button>
      </div>

      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { label: "Completion Rate", value: `${Math.round(completed / TEAM.length * 100)}%`, sub: `${completed} of ${TEAM.length} completed`, color: "#00d4c8" },
          { label: "Avg Readiness Score", value: avgScore, sub: "+9 pts vs last cycle", color: "#8b5cf6" },
          { label: "Top Persona", value: "Builder", sub: "3 of 6 completed members", color: "#00d4c8" },
          { label: "At-Risk Members", value: "2", sub: "No assessment completed", color: "#f59e0b" },
        ].map(k => (
          <div key={k.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 8, letterSpacing: "0.3px" }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color, marginBottom: 4 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Persona Dist + Team Table */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>

        {/* Persona donut */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 20, color: "rgba(255,255,255,0.8)" }}>Persona Distribution</div>
          {/* Visual bars */}
          {Object.entries(personaCounts).map(([persona, count]) => (
            <div key={persona} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: personaColors[persona], fontWeight: 600 }}>{persona}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{count} members</span>
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${(count / completed) * 100}%`, background: personaColors[persona], borderRadius: 99, transition: "width 0.6s ease" }} />
              </div>
            </div>
          ))}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
            Based on {completed} completed assessments. 2 pending.
          </div>
        </div>

        {/* Team table */}
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
            Individual Results
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.2)" }}>
                {["Employee", "Role", "Grade", "Persona", "Score", "Trend", "Status"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, letterSpacing: "0.5px" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM.map((m, i) => (
                <tr key={m.name} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: m.completion ? "rgba(0,212,200,0.15)" : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: m.completion ? "#00d4c8" : "rgba(255,255,255,0.3)" }}>
                        {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{m.role}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: "2px 8px", background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>Grade {m.grade}</span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {m.completion ? (
                      <span style={{ fontSize: 12, fontWeight: 600, color: personaColors[m.persona], padding: "3px 10px", background: `${personaColors[m.persona]}18`, borderRadius: 20, border: `1px solid ${personaColors[m.persona]}30` }}>{m.persona}</span>
                    ) : <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: m.score ? (m.score >= 80 ? "#00d4c8" : m.score >= 65 ? "#f59e0b" : "#ef4444") : "rgba(255,255,255,0.25)" }}>
                    {m.score ?? "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {m.trend ? <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>{m.trend} pts</span> : <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {m.completion
                      ? <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", background: "rgba(34,197,94,0.15)", color: "#22c55e", borderRadius: 20 }}>✓ Done</span>
                      : <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", background: "rgba(245,158,11,0.15)", color: "#f59e0b", borderRadius: 20 }}>⏳ Pending</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
