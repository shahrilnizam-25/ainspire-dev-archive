const RECORDS = [
  { id: "TM-048391", name: "Ts. Soo Chern Tien", division: "IT Strategy & Orchestration", grade: "I", persona: "Strategist", score: 88, date: "2026-07-18", cycle: "Q3 2026", status: "Complete" },
  { id: "TM-031204", name: "Ahmad Faiz bin Zulkifli", division: "Network Engineering", grade: "H", persona: "Builder", score: 84, date: "2026-07-17", cycle: "Q3 2026", status: "Complete" },
  { id: "TM-052011", name: "Nurul Ain Syahirah", division: "Digital & Innovation", grade: "G", persona: "Visionary", score: 91, date: "2026-07-17", cycle: "Q3 2026", status: "Complete" },
  { id: "TM-029874", name: "Razif bin Hamdan", division: "IT Strategy & Orchestration", grade: "F", persona: "Explorer", score: 67, date: "2026-07-16", cycle: "Q3 2026", status: "Complete" },
  { id: "TM-044532", name: "Siti Hajar binti Mahmud", division: "Customer Experience", grade: "H", persona: "Strategist", score: 78, date: "2026-07-15", cycle: "Q3 2026", status: "Complete" },
  { id: "TM-038871", name: "Danial Arif bin Roslan", division: "Network Engineering", grade: "G", persona: "Builder", score: 82, date: "2026-07-14", cycle: "Q3 2026", status: "Complete" },
  { id: "TM-061102", name: "Melissa Ong Hui Ling", division: "Digital & Innovation", grade: "I", persona: "Visionary", score: 88, date: "2026-07-14", cycle: "Q3 2026", status: "Complete" },
  { id: "TM-017665", name: "Hafizuddin bin Mohd Noor", division: "IT Strategy & Orchestration", grade: "F", persona: null, score: null, date: "—", cycle: "Q3 2026", status: "Pending" },
  { id: "TM-055430", name: "Amirul Hakim bin Ismail", division: "Finance & Strategy", grade: "G", persona: null, score: null, date: "—", cycle: "Q3 2026", status: "Pending" },
  { id: "TM-022190", name: "Wan Farah binti Zakaria", division: "Human Capital", grade: "H", persona: "Strategist", score: 74, date: "2026-07-12", cycle: "Q3 2026", status: "Complete" },
];

const personaColors: Record<string, string> = {
  Explorer: "#f59e0b", Builder: "#00d4c8", Strategist: "#8b5cf6", Visionary: "#ec4899",
};

export function PersistentDB() {
  const total = RECORDS.length;
  const completed = RECORDS.filter(r => r.status === "Complete").length;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0e1a 0%, #0d1b2e 100%)", padding: "28px 32px", fontFamily: "system-ui, sans-serif", color: "#fff" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(0,212,200,0.7)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 4 }}>Feature 2 · Persistent Assessment Database</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 2 }}>Assessment Results Store</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>PostgreSQL · Every assessment saved permanently with full audit trail</div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ padding: "9px 16px", background: "rgba(0,212,200,0.1)", border: "1px solid rgba(0,212,200,0.25)", borderRadius: 10, color: "#00d4c8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>↓ Export CSV</button>
          <button style={{ padding: "9px 16px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 10, color: "#8b5cf6", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>⚙ Manage Cycles</button>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "Total Records", value: total, color: "#fff" },
          { label: "Completed", value: completed, color: "#22c55e" },
          { label: "Pending", value: total - completed, color: "#f59e0b" },
          { label: "Assessment Cycles", value: 1, color: "#00d4c8" },
          { label: "Avg Score", value: Math.round(RECORDS.filter(r => r.score).reduce((s, r) => s + (r.score || 0), 0) / completed), color: "#8b5cf6" },
        ].map(k => (
          <div key={k.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>{k.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <input defaultValue="Search by name, ID, division..." style={{ flex: 1, padding: "9px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "rgba(255,255,255,0.4)", fontSize: 13, outline: "none" }} />
        {["All Personas", "Q3 2026", "All Divisions", "All Grades"].map(f => (
          <select key={f} style={{ padding: "9px 14px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "rgba(255,255,255,0.6)", fontSize: 12, outline: "none", cursor: "pointer" }}>
            <option>{f}</option>
          </select>
        ))}
      </div>

      {/* Records table */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,0,0,0.25)" }}>
              {["Employee ID", "Name", "Division", "Grade", "Persona", "Score", "Date", "Cycle", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECORDS.map((r, i) => (
              <tr key={r.id} style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}>
                <td style={{ padding: "11px 14px", fontSize: 12, fontWeight: 700, color: "rgba(0,212,200,0.8)", fontFamily: "monospace" }}>{r.id}</td>
                <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 600 }}>{r.name}</td>
                <td style={{ padding: "11px 14px", fontSize: 11, color: "rgba(255,255,255,0.5)", maxWidth: 160 }}><div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.division}</div></td>
                <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>Grade {r.grade}</span></td>
                <td style={{ padding: "11px 14px" }}>
                  {r.persona
                    ? <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", background: `${personaColors[r.persona]}18`, color: personaColors[r.persona], borderRadius: 20, border: `1px solid ${personaColors[r.persona]}30` }}>{r.persona}</span>
                    : <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>—</span>}
                </td>
                <td style={{ padding: "11px 14px", fontSize: 15, fontWeight: 800, color: r.score ? (r.score >= 85 ? "#22c55e" : r.score >= 70 ? "#00d4c8" : "#f59e0b") : "rgba(255,255,255,0.2)" }}>
                  {r.score ?? "—"}
                </td>
                <td style={{ padding: "11px 14px", fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>{r.date}</td>
                <td style={{ padding: "11px 14px" }}><span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", background: "rgba(0,212,200,0.1)", color: "#00d4c8", borderRadius: 6 }}>{r.cycle}</span></td>
                <td style={{ padding: "11px 14px" }}>
                  {r.status === "Complete"
                    ? <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", background: "rgba(34,197,94,0.15)", color: "#22c55e", borderRadius: 20 }}>✓ Complete</span>
                    : <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", background: "rgba(245,158,11,0.12)", color: "#f59e0b", borderRadius: 20 }}>⏳ Pending</span>}
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={{ fontSize: 11, padding: "4px 10px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>View</button>
                    {r.status === "Complete" && <button style={{ fontSize: 11, padding: "4px 10px", background: "rgba(0,212,200,0.08)", border: "1px solid rgba(0,212,200,0.2)", borderRadius: 6, color: "#00d4c8", cursor: "pointer" }}>PDF</button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Showing 10 of 1,234 records · Page 1 of 124</div>
          <div style={{ display: "flex", gap: 6 }}>
            {["← Prev", "1", "2", "3", "...", "124", "Next →"].map(p => (
              <button key={p} style={{ padding: "5px 10px", background: p === "1" ? "rgba(0,212,200,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${p === "1" ? "rgba(0,212,200,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 6, color: p === "1" ? "#00d4c8" : "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* DB schema hint */}
      <div style={{ marginTop: 16, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 18px", display: "flex", gap: 32 }}>
        <div>
          <div style={{ fontSize: 10, color: "rgba(0,212,200,0.6)", fontWeight: 700, letterSpacing: "1px", marginBottom: 6 }}>TABLE: assessment_results</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", lineHeight: 1.8 }}>
            id · employee_id · name · division · grade · persona · confidence_score · responses (JSONB) · completed_at · cycle_id
          </div>
        </div>
        <div style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", paddingLeft: 32 }}>
          <div style={{ fontSize: 10, color: "rgba(139,92,246,0.7)", fontWeight: 700, letterSpacing: "1px", marginBottom: 6 }}>STORAGE: PostgreSQL (Replit DB)</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", lineHeight: 1.8 }}>
            Encrypted at rest · Audit log · Row-level security by division · Daily backups
          </div>
        </div>
      </div>
    </div>
  );
}
