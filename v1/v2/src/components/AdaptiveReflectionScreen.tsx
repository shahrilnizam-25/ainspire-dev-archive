import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';
import type { Lang } from '../i18n';
import type { AdaptiveDecision, ReflectionEvidence } from '../shared/assessmentLogic';
export default function AdaptiveReflectionScreen({ lang, decision, onContinue }: { lang: Lang; decision: AdaptiveDecision; onContinue: (reflection: ReflectionEvidence | null) => void }) {
 const [text, setText] = useState(''); const bm = lang === 'BM';
 return <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-3xl px-6 py-8">
  <div className="mb-8 flex items-center gap-3 text-primary"><MessageSquare /><span className="font-mono text-xs font-bold uppercase tracking-widest">{bm ? 'Refleksi Adaptif' : 'Adaptive Reflection'} · {decision.category === 'Capability' ? (bm ? 'Keupayaan' : 'Capability') : decision.category === 'Contribution' ? (bm ? 'Sumbangan' : 'Contribution') : (bm ? 'Pembangunan' : 'Growth')}</span></div>
  <h2 className="mb-4 text-3xl md:text-4xl font-bold">{bm ? 'Satu soalan untuk memahami anda dengan lebih baik.' : 'One question to understand you better.'}</h2>
  <p className="mb-8 text-muted-foreground">{bm ? 'Jawapan anda menunjukkan beberapa petunjuk berbeza. Contoh ringkas membantu menjelaskan profil anda. Ini bukan peperiksaan.' : 'Your answers show a few mixed signals. A short example helps clarify your profile. This is not an exam.'}</p>
  <div className="rounded-2xl border border-primary/20 bg-card p-6 md:p-8">
   <label htmlFor="adaptive-reflection" className="block mb-5 text-xl font-medium leading-relaxed">{decision.prompt?.[lang]}</label>
   <textarea id="adaptive-reflection" value={text} onChange={e => setText(e.target.value)} maxLength={1200} rows={5} placeholder={bm ? 'Satu atau dua ayat sudah memadai…' : 'One or two sentences is enough…'} className="w-full resize-y rounded-xl border border-card-border bg-background p-4 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
   <div className="mt-2 text-right text-xs text-muted-foreground">{text.length}/1200</div>
   <div className="mt-6 flex flex-wrap items-center gap-4">
    <button type="button" disabled={!text.trim()} onClick={() => onContinue({ category: decision.category!, text: text.trim() })} className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-background disabled:opacity-40">{bm ? 'Teruskan' : 'Continue'}<ArrowRight className="h-4 w-4" /></button>
    <button type="button" onClick={() => onContinue(null)} className="px-4 py-3 text-sm text-muted-foreground hover:text-white">{bm ? 'Langkau buat masa ini' : 'Skip for now'}</button>
   </div>
  </div>
 </motion.div>;
}
