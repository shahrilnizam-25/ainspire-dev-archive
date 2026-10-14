import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';
import { translations, type Lang } from '../i18n';

export default function PledgeScreen({
  lang,
  currentIndex,
  totalQuestions,
  onSubmit,
  reflectionRequired = false,
  reflectionProvided = false,
}: {
  lang: Lang;
  currentIndex: number;
  totalQuestions: number;
  onSubmit: () => void;
  reflectionRequired?: boolean;
  reflectionProvided?: boolean;
}) {
  const [consented, setConsented] = useState(false);
  const canSubmit = consented;
  const t = translations[lang];

  return (
    <div className="w-full max-w-3xl px-6 py-8">
      <div className="mb-12 space-y-4">
        <div className="flex justify-between font-mono text-sm font-medium text-muted-foreground">
          <span>{lang === 'BM' ? 'Penilaian lengkap' : 'Assessment complete'}</span>
          <span>{lang === 'BM' ? '6 / 6 jawapan' : '6 / 6 answers'}</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <motion.div className="h-full bg-primary glow-cyan" initial={{ width: '95%' }} animate={{ width: '100%' }} />
        </div>
      </div>

      <div role="status" className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
        {reflectionRequired ? (reflectionProvided ? (lang === 'BM' ? 'Refleksi anda disertakan bersama enam jawapan berstruktur.' : 'Your reflection is included with your six structured answers.') : (lang === 'BM' ? 'Refleksi dilangkau. Petunjuk bercampur akan ditandakan untuk semakan.' : 'Reflection was skipped. Mixed signals will be flagged for review.')) : (lang === 'BM' ? 'Jawapan anda memberikan profil yang jelas. Tiada refleksi tambahan diperlukan.' : 'Your answers provide a clear profile. No additional reflection is needed.')}
      </div>
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-primary">{t.pledgeTitle}</p>
        <blockquote className="mb-8 text-2xl font-medium leading-relaxed text-foreground">
          “{t.pledgeText}”
        </blockquote>

        <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} className="mt-1 h-4 w-4 accent-primary" />
          <span>{t.consentText}</span>
        </label>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => canSubmit && onSubmit()}
          className={`mt-8 flex items-center gap-3 rounded-full px-8 py-3 font-semibold transition-all ${canSubmit ? 'bg-primary text-background shadow-[0_0_20px_rgba(0,212,255,0.35)]' : 'cursor-not-allowed bg-muted text-muted-foreground opacity-50'}`}
        >
          {canSubmit ? <Send className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {t.submitBtn}
        </button>
      </div>
    </div>
  );
}