import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle2, ChevronDown } from 'lucide-react';
import type { Lang } from '../i18n';
import { translations } from '../i18n';

export default function ContactScreen({
  lang,
  onBack,
}: {
  lang: Lang;
  onBack: () => void;
}) {
  const t = translations[lang];
  const PURPOSE_OPTIONS = t.contactPurposeOptions as readonly string[];

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  const canSubmit = name.trim() && email.trim() && purpose && message.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    // Build mailto link
    const subject = encodeURIComponent(`[AiNspire] ${purpose} – from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nPurpose: ${purpose}\n\n${message}`
    );
    window.open(`mailto:ctsoo@tm.com.my?subject=${subject}&body=${body}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-5xl px-6 py-10 flex flex-col items-center">

      {/* ── Back Button ── */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        onClick={onBack}
        className="self-start flex items-center gap-2 mb-6 px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-muted-foreground hover:text-white transition-all"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {t.backToMain}
      </motion.button>

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          <span className="text-white">{t.contactTitle1} </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#00B4D8] to-secondary drop-shadow-[0_0_30px_rgba(0,212,255,0.35)]">
            {t.contactTitle2}
          </span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {t.contactSubtitle}
        </p>
      </motion.div>

      <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-6 items-start">

        {/* ─── Form Panel ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="md:col-span-3 rounded-2xl border border-card-border/60 bg-card/40 backdrop-blur-sm p-7"
        >
          {/* Section label */}
          <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-1">{t.contactFormLabel}</p>
          <h2 className="text-2xl font-bold text-foreground mb-6">{t.contactFormTitle}</h2>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-4 py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{t.contactSentTitle}</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {t.contactSentDesc}
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.contactNameLabel}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.contactNamePlaceholder}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-background/60 border border-card-border/80 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.contactEmailLabel}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@tm.com.my"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-background/60 border border-card-border/80 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                />
              </div>

              {/* Purpose dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.contactPurposeLabel}</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-background/60 border border-card-border/80 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
                    style={{ color: purpose ? 'var(--foreground)' : 'rgba(var(--muted-foreground-rgb, 148 163 184) / 0.5)' }}
                  >
                    <span className={purpose ? 'text-foreground' : 'text-muted-foreground/50'}>
                      {purpose || t.contactPurposePlaceholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${selectOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {selectOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-20 mt-1 w-full rounded-xl bg-[#0f1f35] border border-card-border/80 shadow-xl overflow-hidden"
                    >
                      {PURPOSE_OPTIONS.map((opt) => (
                        <li
                          key={opt}
                          onClick={() => { setPurpose(opt); setSelectOpen(false); }}
                          className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-primary/10 hover:text-primary ${
                            purpose === opt ? 'text-primary bg-primary/5' : 'text-foreground'
                          }`}
                        >
                          {opt}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.contactMsgLabel}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.contactMsgPlaceholder}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-background/60 border border-card-border/80 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all resize-none leading-relaxed"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className="group mt-1 w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-sm overflow-hidden relative transition-all hover:shadow-[0_0_40px_rgba(0,212,255,0.4)] disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out rounded-xl" />
                <Send className="relative w-4 h-4" />
                <span className="relative">{t.contactSendBtn}</span>
              </button>
            </form>
          )}
        </motion.div>

        {/* ─── Contact Info Panel ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="md:col-span-2 flex flex-col gap-4"
        >
          {/* Email card */}
          <div className="flex items-start gap-4 p-5 rounded-2xl border border-primary/25 bg-primary/5 backdrop-blur-sm">
            <div className="w-12 h-12 shrink-0 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-2">{t.contactEmailCardLabel}</p>
              <p className="text-sm font-semibold text-foreground">Ts. Soo Chern Tien</p>
              <p className="text-xs text-muted-foreground mt-0.5">IT Service Strategy &amp; Orchestration</p>
              <p className="text-xs text-muted-foreground">IT as a Service (ITaaS)</p>
              <a
                href="mailto:ctsoo@tm.com.my"
                className="inline-block mt-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors break-all"
              >
                ctsoo@tm.com.my
              </a>
            </div>
          </div>

          {/* Info card */}
          <div className="p-5 rounded-2xl border border-card-border/60 bg-card/40 backdrop-blur-sm">
            <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase mb-3">{t.contactPurposeGuide}</p>
            <ul className="flex flex-col gap-2.5">
              {(t.contactPurposeOptions as readonly string[]).map((label, idx) => (
                <li key={label} className="flex items-start gap-2">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                  <span className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground/80">{label}</span>
                    {' — '}
                    {(t.contactPurposeDescs as readonly string[])[idx]}
                  </span>
                </li>
              ))}
            </ul>
          </div>

        </motion.div>

      </div>

      {/* Bottom back button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10"
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-muted-foreground hover:text-white transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t.backToMain}
        </button>
      </motion.div>

    </div>
  );
}
