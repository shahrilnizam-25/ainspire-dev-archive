import { Brain, Route, BarChart3, ArrowRight, Sparkles, Shield, Users, Lock, LineChart, TrendingUp, Mail } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    label: 'AI-Powered Classification',
    desc: 'Claude AI analyses your skills and work style to classify your unique AI persona with precision.',
  },
  {
    icon: Route,
    label: 'AI Personalized Learning Pathway',
    desc: 'Receive a curated learning roadmap tailored to your persona and career aspirations.',
  },
  {
    icon: BarChart3,
    label: 'Workforce Analytics',
    desc: 'Aggregate insights help HR leaders understand team-wide AI readiness at a glance.',
  },
];

const TRUST_BADGES = [
  { icon: Shield,    label: 'AI-Driven' },
  { icon: Users,     label: 'Employee-Centric' },
  { icon: Lock,      label: 'Secure & Trusted' },
  { icon: LineChart, label: 'Future-Ready' },
];

export function NewLayout() {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{ background: '#030712', color: 'white', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="w-full max-w-5xl flex flex-col items-center text-center px-6">

        {/* ── Platform pill ── */}
        <div className="mt-10 mb-5">
          <div
            className="inline-flex items-center px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{
              background: 'rgba(8,16,40,0.80)',
              border: '1px solid rgba(0,212,255,0.25)',
              color: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 16px rgba(0,212,255,0.08)',
            }}
          >
            TM AI WORKFORCE INTELLIGENT PLATFORM
          </div>
        </div>

        {/* ── TM logo + AiNspire pill ── */}
        <div className="mb-4 flex items-center gap-3">
          <img
            src="/__mockup/images/tm-logo-official.png"
            alt="Telekom Malaysia"
            style={{ height: '3rem', width: 'auto', objectFit: 'contain' }}
          />
          <div
            className="flex items-center select-none px-5 py-2 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(0,20,40,0.75) 0%, rgba(10,5,30,0.82) 100%)',
              border: '1.5px solid rgba(0,212,255,0.38)',
              boxShadow: '0 0 24px rgba(0,212,255,0.14), 0 0 40px rgba(139,92,246,0.10), inset 0 1px 0 rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span
              className="font-black tracking-tight leading-none"
              style={{
                fontSize: '2rem',
                background: 'linear-gradient(135deg, #a5f3fc 0%, #22d3ee 40%, #00b4d8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >Ai</span>
            <span
              className="font-black tracking-tight leading-none"
              style={{
                fontSize: '2rem',
                background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 10px rgba(167,139,250,0.60))',
              }}
            >Nspire</span>
          </div>
        </div>

        {/* ── Headline ── */}
        <h1
          className="font-black tracking-tight leading-tight mb-3"
          style={{ fontSize: 'clamp(2.4rem, 6vw, 4.2rem)' }}
        >
          <span style={{ color: 'white' }}>Discover Your </span>
          <span style={{
            background: 'linear-gradient(90deg, #00d4ff, #00b4d8, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 24px rgba(0,212,255,0.45))',
          }}>AI Persona</span>
          <br />
          <span style={{ color: 'rgba(255,255,255,0.78)', fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', fontWeight: 700 }}>
            with Personalized Learning Pathway
          </span>
        </h1>

        {/* ── Description ── */}
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', marginBottom: '0' }}>
          An AI-powered assessment to discover your unique role in{' '}
          <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Telekom Malaysia's AI future.</strong>
        </p>

        {/* ── Hero image — full width, sits directly below the description ── */}
        <div
          className="w-full relative"
          style={{ marginTop: '2rem' }}
        >
          <img
            src="https://2f3d5185-9e55-482d-afd3-489e1fed81b3-00-o299btkgxxi.pike.replit.dev/hero-v2.jpg"
            alt="AI future portal"
            style={{
              width: '100%',
              display: 'block',
              objectFit: 'cover',
              objectPosition: 'center center',
              maxHeight: '380px',
              borderRadius: '12px 12px 0 0',
            }}
          />
          {/* Bottom fade so the hero bleeds into the feature strip */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              background: 'linear-gradient(to bottom, transparent, rgba(3,7,18,1))',
              borderRadius: '0 0 0 0',
            }}
          />
        </div>

        {/* ── Feature columns — pulled up to touch / slightly overlap hero's fade ── */}
        <div
          className="w-full"
          style={{
            marginTop: '-2px',
            background: 'rgba(6,12,30,0.90)',
            border: '1px solid rgba(0,212,255,0.14)',
            borderTop: '1px solid rgba(0,212,255,0.20)',
            backdropFilter: 'blur(14px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
            borderRadius: '0 0 12px 12px',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              borderTop: 'none',
            }}
          >
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    padding: '1.25rem',
                    textAlign: 'left',
                    borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      padding: '0.6rem',
                      borderRadius: '0.75rem',
                      background: 'rgba(0,212,255,0.09)',
                      border: '1px solid rgba(0,212,255,0.20)',
                      boxShadow: '0 0 12px rgba(0,212,255,0.08)',
                      marginTop: '2px',
                    }}
                  >
                    <Icon style={{ width: '1.2rem', height: '1.2rem', color: '#22d3ee' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'white', marginBottom: '0.25rem' }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6 }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CTA buttons ── */}
        <div className="flex flex-col items-center gap-4 w-full mb-10 mt-8">
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem 2.5rem',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '1.1rem',
              background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
              boxShadow: '0 0 40px rgba(0,212,255,0.35)',
              color: '#000e1a',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Sparkles style={{ width: '1.2rem', height: '1.2rem' }} />
            Begin Your AI Journey
            <ArrowRight style={{ width: '1.2rem', height: '1.2rem' }} />
          </button>

          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>
            Takes 5–7 minutes · Confidential · Powered by Claude AI
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem', borderRadius: '9999px',
                border: '1px solid rgba(0,212,255,0.30)', background: 'rgba(0,212,255,0.05)',
                color: '#22d3ee', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              <TrendingUp style={{ width: '1rem', height: '1rem' }} />
              View Statistics
            </button>
            <button
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.75rem 1.5rem', borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.55)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              }}
            >
              <Mail style={{ width: '1rem', height: '1rem' }} />
              Contact Us
            </button>
          </div>
        </div>

        {/* ── Trust badges ── */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '2rem',
            padding: '1.5rem 1.5rem 2.5rem',
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {TRUST_BADGES.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.label}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', fontWeight: 600 }}
              >
                <Icon style={{ width: '1rem', height: '1rem', color: 'rgba(0,212,255,0.55)' }} />
                {b.label}
              </div>
            );
          })}
        </div>

        {/* Powered by */}
        <div style={{ marginBottom: '2rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
          Powered by Claude AI · Anthropic · © 2025 Telekom Malaysia
        </div>

      </div>
    </div>
  );
}
