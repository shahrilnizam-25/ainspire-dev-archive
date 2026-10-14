export function SSOLogin() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0a0e1a 0%, #0d1b2e 50%, #0a1628 100%)" }}>
      {/* Background glow */}
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 600, background: "radial-gradient(circle, rgba(0,212,200,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ width: 460, padding: "48px 44px", background: "rgba(13,27,46,0.95)", border: "1px solid rgba(0,212,200,0.2)", borderRadius: 20, boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,200,0.05)", backdropFilter: "blur(20px)", position: "relative" }}>

        {/* TM Logo + Brand */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            {/* TM logo placeholder */}
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "linear-gradient(135deg, #0066cc, #00a3e0)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#fff", letterSpacing: -1 }}>TM</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>AiNspire</div>
              <div style={{ fontSize: 11, color: "rgba(0,212,200,0.8)", letterSpacing: "0.8px", textTransform: "uppercase" }}>AI Readiness Platform</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Sign in with your TM corporate credentials</div>
        </div>

        {/* Microsoft SSO Button */}
        <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "14px 20px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginBottom: 20, transition: "all 0.2s" }}>
          <svg width="20" height="20" viewBox="0 0 21 21" fill="none">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
          </svg>
          Continue with Microsoft (TM SSO)
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Manual form */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 6, letterSpacing: "0.3px" }}>TM Employee ID / Email</label>
          <div style={{ position: "relative" }}>
            <input
              defaultValue="ts.soocherntien@tm.com.my"
              style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,212,200,0.3)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 6, letterSpacing: "0.3px" }}>Password</label>
          <input
            type="password"
            defaultValue="••••••••••"
            style={{ width: "100%", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <button style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #00d4c8, #0099cc)", border: "none", borderRadius: 12, color: "#0a0e1a", fontSize: 14, fontWeight: 700, cursor: "pointer", marginBottom: 20, letterSpacing: "0.3px" }}>
          Sign In & Begin Assessment
        </button>

        {/* Role auto-fill notice */}
        <div style={{ background: "rgba(0,212,200,0.08)", border: "1px solid rgba(0,212,200,0.2)", borderRadius: 10, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 16 }}>✦</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(0,212,200,0.9)", marginBottom: 2 }}>Auto-filled from your TM profile</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>Your name, division, grade, and cost centre are pre-loaded — no manual entry needed.</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
          Secured by TM Active Directory · IT Service Strategy & Orchestration
        </div>
      </div>
    </div>
  );
}
