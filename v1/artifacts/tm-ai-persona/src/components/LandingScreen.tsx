import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Brain, BarChart3, Route, TrendingUp, Mail,
         Shield, Users, Lock, LineChart } from 'lucide-react';
import { translations, type Lang } from '../i18n';

/* ─── Trust badges ─────────────────────────────────────────────────────────── */
const TRUST_BADGES = [
  { icon: Shield,    label: 'AI-Driven' },
  { icon: Users,     label: 'Employee-Centric' },
  { icon: Lock,      label: 'Secure & Trusted' },
  { icon: LineChart, label: 'Future-Ready' },
];

export default function LandingScreen({
  lang,
  onStart,
  onStats,
  onContact,
}: {
  lang: Lang;
  onStart: () => void;
  onStats: () => void;
  onContact: () => void;
}) {
  const t = translations[lang];
  const assetBase = import.meta.env.BASE_URL;

  const FEATURES = [
    { icon: Brain,     label: t.feature1Label, desc: t.feature1Desc },
    { icon: Route,     label: t.feature2Label, desc: t.feature2Desc },
    { icon: BarChart3, label: t.feature3Label, desc: t.feature3Desc },
  ];

  return (
    /* Page wrapper — identical base colour to hero fade-to, zero seam */
    <div
      className="w-full max-w-5xl flex flex-col items-center text-center relative"
      style={{ background: '#030712' }}
    >

      {/* ══════════════════════════════════════════════════════════════════
          HERO SECTION — full-width seamless background
          • Hero image fills the entire block edge-to-edge
          • Strong side fades blend image edges into #030712
          • Top gradient keeps text legible; bottom fades into page
          • No floating badges — clean minimalist hero
      ══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        className="relative w-full overflow-hidden"
        style={{ minHeight: '660px', background: '#030712' }}
      >
        {/* Hero image */}
        <img
          src={`${assetBase}hero-v5.jpg`}
          alt="AI future portal — KL skyline"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center center' }}
        />

        {/* Primary overlay — top dark, mid clear, bottom fades to #030712 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom,' +
              ' rgba(3,7,18,0.90)  0%,' +
              ' rgba(3,7,18,0.72) 14%,' +
              ' rgba(3,7,18,0.30) 30%,' +
              ' rgba(3,7,18,0.04) 46%,' +
              ' transparent        56%,' +
              ' transparent        66%,' +
              ' rgba(3,7,18,0.68) 80%,' +
              ' rgba(3,7,18,1)   100%)',
          }}
        />

        {/* Side fades — strong, cover any narrow-image edge artefacts fully */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to right,' +
              ' rgba(3,7,18,1)    0%,' +
              ' rgba(3,7,18,0.80) 4%,' +
              ' rgba(3,7,18,0.30) 10%,' +
              ' transparent       20%,' +
              ' transparent       80%,' +
              ' rgba(3,7,18,0.30) 90%,' +
              ' rgba(3,7,18,0.80) 96%,' +
              ' rgba(3,7,18,1)   100%)',
          }}
        />

        {/* ── Text block ── */}
        <div className="relative z-10 w-full flex flex-col items-center text-center px-6 pt-8">

          {/* Platform pill */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.0 }}
            className="mb-4"
          >
            <div
              className="inline-flex items-center px-5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
              style={{
                background: 'rgba(8,16,40,0.72)',
                border: '1px solid rgba(0,212,255,0.25)',
                color: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 0 16px rgba(0,212,255,0.08)',
              }}
            >
              {t.platformLabel}
            </div>
          </motion.div>

          {/* TM logo + AiNspire pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mb-3 flex items-center gap-3"
          >
            <img
              src={`${assetBase}tm-logo-official.png`}
              alt="Telekom Malaysia"
              className="w-auto object-contain"
              style={{ height: 'clamp(2.4rem, 4.5vw, 3.2rem)' }}
            />
            <div className="relative">
              <div
                className="absolute inset-0 rounded-full blur-xl"
                style={{ background: 'radial-gradient(ellipse at center, rgba(0,180,255,0.18) 0%, rgba(139,92,246,0.12) 60%, transparent 100%)' }}
              />
              <div
                className="relative flex items-center select-none px-5 py-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,20,40,0.70) 0%, rgba(10,5,30,0.78) 100%)',
                  border: '1.5px solid rgba(0,212,255,0.38)',
                  boxShadow: '0 0 24px rgba(0,212,255,0.14), 0 0 40px rgba(139,92,246,0.10), inset 0 1px 0 rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span
                  className="font-black tracking-tight leading-none"
                  style={{
                    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                    background: 'linear-gradient(135deg, #a5f3fc 0%, #22d3ee 40%, #00b4d8 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >Ai</span>
                <span
                  className="font-black tracking-tight leading-none"
                  style={{
                    fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                    background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #8b5cf6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 10px rgba(167,139,250,0.60))',
                  }}
                >Nspire</span>
              </div>
            </div>
          </motion.div>

          {/* ── Tagline — below logo pill, above headline ── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.14 }}
            className="text-xs uppercase tracking-[0.18em] font-semibold mb-5"
            style={{
              color: 'rgba(0,212,255,0.72)',
              textShadow: '1px 2px 6px rgba(0,0,0,0.70)',
            }}
          >
            {t.description}{' '}
            <span style={{ color: 'rgba(0,212,255,0.95)', fontWeight: 700 }}>{t.descriptionBold}</span>
          </motion.p>

          {/* ── Headline — with bottom-right text shadow ── */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-2 leading-[1.05]"
            style={{
              textShadow: '2px 3px 12px rgba(0,0,0,0.85), 4px 6px 24px rgba(0,0,0,0.55)',
            }}
          >
            <span className="text-white">{t.headline1} </span>
            <span style={{
                color: '#FFFFFF',
                /* Layered glow: tight bright cyan core → wide soft halo → hard dark base */
                filter:
                  'drop-shadow(0 0 8px rgba(0,230,255,1)) ' +
                  'drop-shadow(0 0 24px rgba(0,210,255,0.75)) ' +
                  'drop-shadow(2px 4px 10px rgba(0,0,0,1))',
              }}
            >
              {t.headlineAccent}
            </span>
            <br />
            {/* ── Subheadline — with bottom-right text shadow ── */}
            <span
              className="text-white/80 text-4xl md:text-5xl font-bold"
              style={{
                textShadow: '2px 3px 10px rgba(0,0,0,0.85), 4px 5px 20px rgba(0,0,0,0.55)',
              }}
            >
              {t.headline2}
            </span>
          </motion.h1>

        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          FEATURE COLUMNS
          • Negative margin — overlaps the hero bottom fade
          • Semi-transparent glassy background blends into #030712
          • NO hard top border — replaced by subtle gradient highlight
          • Bottom edges fade naturally into the page background
          • Upward glow shadow for floating depth
      ══════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.48 }}
        className="w-full overflow-hidden relative z-10"
        style={{
          marginTop: '-56px',
          /* Semi-transparent so the hero glow bleeds through the top */
          background:
            'linear-gradient(to bottom,' +
            ' rgba(3,7,18,0.55)  0%,' +
            ' rgba(3,7,18,0.82) 35%,' +
            ' rgba(3,7,18,0.92) 100%)',
          border: 'none',
          backdropFilter: 'blur(20px)',
          /* Upward cyan+purple glow instead of a hard border */
          boxShadow:
            '0 -16px 48px rgba(0,212,255,0.12),' +
            '0  -6px 20px rgba(139,92,246,0.09),' +
            '0   8px 40px rgba(0,0,0,0.60)',
        }}
      >
        {/* Gradient top-edge highlight — replaces hard border */}
        <div
          style={{
            height: '1px',
            background:
              'linear-gradient(to right,' +
              ' transparent 0%,' +
              ' rgba(0,212,255,0.45) 25%,' +
              ' rgba(167,139,250,0.45) 75%,' +
              ' transparent 100%)',
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            /* Alternate icon accent colours for differentiation */
            const iconColors = ['text-cyan-400', 'text-violet-400', 'text-sky-400'];
            const iconBg = [
              'rgba(0,212,255,0.10)',
              'rgba(139,92,246,0.12)',
              'rgba(56,189,248,0.10)',
            ];
            const iconBorder = [
              'rgba(0,212,255,0.22)',
              'rgba(167,139,250,0.22)',
              'rgba(56,189,248,0.22)',
            ];
            const headingColors = ['#22d3ee', '#a78bfa', '#38bdf8'];
            return (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.54 + i * 0.08 }}
                className="flex items-start gap-4 p-5 text-left"
                style={{
                  /* Column bottom also fades gently */
                  background:
                    'linear-gradient(to bottom, transparent 0%, rgba(3,7,18,0.18) 100%)',
                }}
              >
                <div
                  className="flex-shrink-0 p-2.5 rounded-xl mt-0.5"
                  style={{
                    background: iconBg[i],
                    border: `1px solid ${iconBorder[i]}`,
                    boxShadow: `0 0 14px ${iconBg[i]}`,
                  }}
                >
                  <Icon className={`w-5 h-5 ${iconColors[i]}`} />
                </div>
                <div>
                  <div
                    className="font-bold text-sm mb-1"
                    style={{ color: headingColors[i] }}
                  >
                    {f.label}
                  </div>
                  <div className="text-xs text-white/45 leading-relaxed">{f.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom edge — fades into page background */}
        <div
          style={{
            height: '32px',
            background:
              'linear-gradient(to bottom, transparent, rgba(3,7,18,1))',
          }}
        />
      </motion.div>

      {/* ══════════════════════════════════════════════
          CTA BUTTONS
      ══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.70 }}
        className="flex flex-col items-center gap-4 w-full mb-10 mt-4 px-6"
      >
        <motion.button
          onClick={onStart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex items-center gap-3 px-10 py-4 rounded-full font-bold text-lg overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #00d4ff, #0099cc)',
            boxShadow: '0 0 40px rgba(0,212,255,0.35)',
            color: '#000e1a',
          }}
        >
          <Sparkles className="w-5 h-5" />
          {t.beginBtn}
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        <p className="text-xs text-muted-foreground font-mono">{t.beginSub}</p>

        <div className="flex flex-col sm:flex-row gap-3 mt-1">
          <motion.button
            onClick={onStats}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-sm transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            {t.statsBtn}
          </motion.button>

          <motion.button
            onClick={onContact}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white font-semibold text-sm transition-all"
          >
            <Mail className="w-4 h-4" />
            {t.contactBtn}
          </motion.button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════
          TRUST BADGES ROW
      ══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.86 }}
        className="w-full flex flex-wrap justify-center gap-8 pt-6 pb-10 border-t border-white/8 px-6"
      >
        {TRUST_BADGES.map((b, i) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.90 + i * 0.07 }}
              className="flex items-center gap-2 text-white/50 text-xs font-semibold"
            >
              <Icon className="w-4 h-4 text-primary/60" />
              {b.label}
            </motion.div>
          );
        })}
      </motion.div>

      {/* Powered by */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.08 }}
        className="mb-8 text-xs text-muted-foreground/50 font-mono"
      >
        {t.poweredBy}
      </motion.div>
    </div>
  );
}
