const LEARNING = [
  { title: "AI Strategy for Technology Leaders", provider: "LinkedIn Learning", duration: "4h 20m", level: "Intermediate", badge: "Recommended" },
  { title: "Generative AI in Telecom Networks", provider: "TM Academy", duration: "2h 45m", level: "Beginner", badge: "TM Exclusive" },
  { title: "Prompt Engineering Masterclass", provider: "Coursera", duration: "6h 00m", level: "Intermediate", badge: null },
  { title: "AI Product Management", provider: "LinkedIn Learning", duration: "3h 10m", level: "Advanced", badge: null },
];

export function PDFReport() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif", color: "#1e293b" }}>

      {/* Header band */}
      <div style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0d2640 100%)", padding: "32px 48px 28px", color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -60, top: -60, width: 300, height: 300, background: "radial-gradient(circle, rgba(0,212,200,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0066cc, #00a3e0)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, color: "#fff" }}>TM</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>AiNspire · Personalised AI Readiness Report</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>Ts. Soo Chern Tien</div>
            <div style={{ fontSize: 14, color: "rgba(0,212,200,0.9)", marginBottom: 4 }}>IT Service Strategy & Orchestration · IT as a Service (ITaaS)</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Assessment Date: 18 July 2026 · Employee ID: TM-048391</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.5px" }}>AI PERSONA</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#00d4c8", marginBottom: 4 }}>Strategist</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Confidence Score</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#22c55e" }}>88%</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "32px 48px" }}>

        {/* Score bar */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "24px 28px", marginBottom: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
          {[
            { label: "AI Awareness", score: 85, color: "#00d4c8" },
            { label: "Practical Application", score: 78, color: "#8b5cf6" },
            { label: "Strategic Thinking", score: 92, color: "#00d4c8" },
            { label: "Collaboration & Ethics", score: 88, color: "#22c55e" },
          ].map(d => (
            <div key={d.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{d.label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.score}%</span>
              </div>
              <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99 }}>
                <div style={{ height: "100%", width: `${d.score}%`, background: `linear-gradient(90deg, ${d.color}88, ${d.color})`, borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>

          {/* AI Narrative */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4c8" }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", letterSpacing: "0.3px" }}>AI Assessment Narrative</div>
            </div>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.75, margin: 0 }}>
              You demonstrate a <strong style={{ color: "#0a0e1a" }}>strong strategic grasp of AI</strong> and can translate complex AI concepts into concrete business value for Telekom Malaysia's digital transformation agenda. Your answers reveal a natural inclination towards <strong style={{ color: "#0a0e1a" }}>orchestrating AI initiatives</strong> across teams rather than pure hands-on implementation.
            </p>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.75, marginTop: 12, marginBottom: 0 }}>
              To accelerate growth, focus on deepening <em>technical literacy</em> in Generative AI tooling and agentic workflows — this will close the gap between your strategic vision and execution capability.
            </p>
          </div>

          {/* Key Strengths */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "24px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#8b5cf6" }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", letterSpacing: "0.3px" }}>Key Strengths & Growth Areas</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              {["AI vision & strategy alignment", "Cross-functional collaboration", "Ethical AI awareness", "Stakeholder communication"].map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: "#22c55e" }}>✓</span>
                  <span style={{ fontSize: 13, color: "#475569" }}>{s}</span>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 12 }}>
              {["Hands-on prompt engineering", "AI model evaluation techniques"].map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: "#f59e0b" }}>↑</span>
                  <span style={{ fontSize: 13, color: "#475569" }}><em>Grow: </em>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Learning pathway */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec4899" }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Recommended Learning Pathway</div>
            </div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Tailored for Strategist persona</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {LEARNING.map(c => (
              <div key={c.title} style={{ display: "flex", gap: 14, padding: "14px 16px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #0a0e1a, #0d2640)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 16 }}>📘</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#1e293b", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>{c.provider} · {c.duration} · {c.level}</div>
                  {c.badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", background: c.badge === "TM Exclusive" ? "rgba(0,212,200,0.12)" : "rgba(139,92,246,0.12)", color: c.badge === "TM Exclusive" ? "#00d4c8" : "#8b5cf6", borderRadius: 20 }}>{c.badge}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "#94a3b8" }}>
          Generated by AiNspire · Powered by Claude AI · Confidential — For personal development use only
        </div>
      </div>
    </div>
  );
}
