import EmployeeBenefits from './EmployeeBenefits';
import PoweredByFooter from './PoweredByFooter';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Mail,
         Brain, Users, BriefcaseBusiness, LineChart } from 'lucide-react';
import { translations, type Lang } from '../i18n';

/* ─── Trust badges ─────────────────────────────────────────────────────────── */
const TRUST_BADGES = [
  { icon: Brain, label: 'AI Insights', bmLabel: 'Cerapan AI' },
  { icon: Users, label: 'Employee Growth', bmLabel: 'Kemajuan Pekerja' },
  { icon: BriefcaseBusiness, label: 'Project Contribution', bmLabel: 'Sumbangan Projek' },
  { icon: LineChart, label: 'Workforce Readiness', bmLabel: 'Kesediaan Tenaga Kerja' },
];

export default function LandingScreen({
  lang,
  onStart,
  onContact,
  onStatistics,
}: {
  lang: Lang;
  onStart: () => void;
  onContact: () => void;
  onStatistics: () => void;
}) {
  const t = translations[lang];
  const assetBase = '/';

  return (
    <div className="w-full max-w-5xl flex flex-col items-center text-center relative">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        className="relative w-full"
        style={{ minHeight: '660px' }}
      >
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

          {/* TM logo + approved AiNspire wordmark */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mb-5 flex items-center justify-center gap-1 sm:gap-1.5"
          >
            <div
              className="relative shrink-0 overflow-hidden"
              style={{ width: 'clamp(48px, 9vw, 64px)', aspectRatio: '540 / 266' }}
            >
              <img
                src={`${assetBase}tm-logo-official.png`}
                alt="Telekom Malaysia"
                width={600}
                height={600}
                className="absolute h-auto"
                style={{ width: '111.111%', maxWidth: 'none', left: '-5.556%', top: '-62.782%', filter: 'brightness(0) invert(1)' }}
              />
            </div>
            <img
              src={`${assetBase}ainspire-logo-transparent.png`}
              alt="AiNspire — stylized A with a cyan spark above the i"
              width={2172}
              height={724}
              className="h-auto shrink-0 object-contain"
              style={{ width: 'min(252px, calc(60vw - 72px))', filter: 'brightness(1.12) saturate(1.08) drop-shadow(0 0 2px rgba(0,0,0,0.4)) drop-shadow(1px 3px 5px rgba(0,0,0,0.65))' }}
            />
          </motion.div>

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

      <EmployeeBenefits lang={lang} />


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

        <p className="text-sm font-medium text-slate-100" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.9)' }}>{t.beginSub}</p>

        <div className="flex flex-col sm:flex-row gap-3 mt-1">

          <motion.button
            onClick={onStatistics}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-cyan-300/70 bg-slate-950/85 hover:bg-slate-900 text-white font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            style={{ boxShadow: '0 0 16px rgba(34,211,238,0.18), 0 3px 12px rgba(0,0,0,0.45)' }}
          >
            <LineChart className="w-4 h-4 text-cyan-300" />
            {t.statsBtn}
          </motion.button>

          <motion.button
            onClick={onContact}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-6 py-3 rounded-full border border-cyan-300/70 bg-slate-950/85 hover:bg-slate-900 text-white font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            style={{ boxShadow: '0 0 16px rgba(34,211,238,0.18), 0 3px 12px rgba(0,0,0,0.45)' }}
          >
            <Mail className="w-4 h-4 text-cyan-300" />
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
              className="flex items-center gap-2 text-slate-100 text-xs font-semibold"
              style={{ textShadow: '0 2px 5px rgba(0,0,0,0.9)' }}
            >
              <Icon className="w-4 h-4 text-cyan-300" />
              {lang === 'EN' ? b.label : b.bmLabel}
            </motion.div>
          );
        })}
      </motion.div>

      <PoweredByFooter/>
    </div>
  );
}
