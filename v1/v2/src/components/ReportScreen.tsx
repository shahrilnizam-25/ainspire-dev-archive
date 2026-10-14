import {buildEmployeeReportPdf} from '../shared/employeeReportPdf';
import {profileInsights} from '../shared/profileInsights';
import {primaryContributionRole} from '../shared/contributionRoles';
import {withLearningResources} from '../shared/learningResources';
import {usePocRecord} from '../shared/pocStore';
import {projects,roles,hoursSaved,approvalOf,deliveryOf,benefitNames} from '../shared/poc';
import { dimensionLabelsByLang } from '../data/assessment';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Bot, TrendingUp, CheckCircle, ArrowUpRight, Loader2 } from 'lucide-react';
import { personas } from '../data/personas';
import type { AIResult } from '../App';
import type { Lang } from '../i18n';
import { translations } from '../i18n';

// ── Localised static content ────────────────────────────────────────────────

const DIMENSION_LABELS_I18N = dimensionLabelsByLang;

const STRENGTHS_I18N: Record<Lang, Record<string, string[]>> = {
  EN: {
    explorer:   ['Curiosity-driven experimentation', 'Fast AI tool adoption', 'Cross-domain learning agility', 'Open to iterative feedback'],
    builder:    ['Hands-on AI implementation', 'Technical prototyping', 'Prompt engineering fluency', 'Systematic problem solving'],
    strategist: ['AI vision & alignment', 'Stakeholder communication', 'ROI-focused AI planning', 'Ethical AI governance'],
    visionary:  ['Enterprise AI transformation', 'Executive championing', 'Cross-functional orchestration', 'Long-horizon AI roadmapping'],
  },
  BM: {
    explorer:   ['Eksperimentasi didorong keingintahuan', 'Penggunaan alat AI dengan pantas', 'Ketangkasan pembelajaran merentas domain', 'Terbuka kepada maklum balas berulang'],
    builder:    ['Pelaksanaan AI secara langsung', 'Prototaip teknikal', 'Kemahiran kejuruteraan prompt', 'Penyelesaian masalah secara sistematik'],
    strategist: ['Visi & penjajaran AI', 'Komunikasi pemegang kepentingan', 'Perancangan AI berasaskan ROI', 'Tadbir urus AI beretika'],
    visionary:  ['Transformasi AI perusahaan', 'Penjuaian eksekutif', 'Pengorkestraan merentas fungsi', 'Peta jalan AI jangka panjang'],
  },
};

const GROWTH_I18N: Record<Lang, Record<string, string[]>> = {
  EN: {
    explorer:   ['Structured implementation skills', 'AI project scoping & delivery'],
    builder:    ['Strategic alignment with business goals', 'AI ethics & governance frameworks'],
    strategist: ['Hands-on prompt engineering', 'AI model evaluation techniques'],
    visionary:  ['Deep technical AI literacy', 'Rapid hands-on prototyping'],
  },
  BM: {
    explorer:   ['Kemahiran pelaksanaan berstruktur', 'Skop & penyampaian projek AI'],
    builder:    ['Penjajaran strategik dengan matlamat perniagaan', 'Rangka kerja etika & tadbir urus AI'],
    strategist: ['Kejuruteraan prompt secara langsung', 'Teknik penilaian model AI'],
    visionary:  ['Literasi AI teknikal yang mendalam', 'Prototaip langsung yang pantas'],
  },
};

function getDimensions(scores: Record<string, number> | undefined, lang: Lang) {
  const labels = DIMENSION_LABELS_I18N[lang];
  const fallback = Object.fromEntries(Object.keys(labels).map((key) => [key, 0]));
  const source = scores ?? fallback;
  return Object.entries(labels).filter(([key]) => key !== 'aiContributionStyle').map(([key, label]) => ({ label, score: source[key] ?? 0 }));
}

// ── Component ────────────────────────────────────────────────────────────────

export default function ReportScreen({
  lang,
  resultPersonaId,
  aiResult,
  userRole,
  isReClassifying,
  onBack,
}: {
  lang: Lang;
  resultPersonaId: string;
  aiResult: AIResult | null;
  userRole: string;
  isReClassifying: boolean;
  onBack: () => void;
}) {
  const pocRecord = usePocRecord(aiResult);
  resultPersonaId = pocRecord?.review?.persona ?? resultPersonaId;
  const persona = personas[resultPersonaId];
  if (!persona) return null;

  const t = translations[lang];
  const confidence = pocRecord?.review ? (lang==='BM'?'Disemak oleh HR':'Reviewed by HR') : aiResult?.adaptiveReflection?.required ? (lang==='BM'?'Semakan disyorkan':'Review recommended') : (lang==='BM'?'Bukti konsisten':'Consistent evidence');
  const dimensions = getDimensions(aiResult?.dimensionScores, lang);
  const learningRecommendations=withLearningResources(aiResult?.recommendations??[],resultPersonaId);
  const contributionRole=primaryContributionRole(resultPersonaId);
  const Icon = persona.icon;
  const insights=aiResult?.dimensionScores?profileInsights(aiResult.dimensionScores,lang):null;
  const strengths = insights?insights.strengths.map(s=>`${s.label}: ${s.text}`):aiResult?.strengths ?? STRENGTHS_I18N[lang]?.[resultPersonaId] ?? STRENGTHS_I18N.EN.explorer;
  const growth    = insights?insights.growth.map(s=>`${s.label}: ${s.text}`):aiResult?.developmentGaps ?? GROWTH_I18N[lang]?.[resultPersonaId]    ?? GROWTH_I18N.EN.explorer;

  const reportRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || isDownloading) return;
    setIsDownloading(true);

    try {
      const {default:jsPDF}=await import('jspdf');
      const logoNode=reportRef.current.querySelector<HTMLImageElement>('img[alt="AiNspire"]');
      let logo:string|undefined;
      if(logoNode){
        try{
          await logoNode.decode();
          const canvas=document.createElement('canvas');canvas.width=logoNode.naturalWidth;canvas.height=logoNode.naturalHeight;
          canvas.getContext('2d')?.drawImage(logoNode,0,0);logo=canvas.toDataURL('image/png');
        }catch{ /* Keep the readable text brand if the image cannot be loaded. */ }
      }
      const fontBuffers=await Promise.all(['/fonts/report-sans.ttf','/fonts/report-sans-bold.ttf'].map(async url=>{const response=await fetch(url);if(!response.ok)throw new Error('Report font could not be loaded. Please retry.');return new Uint8Array(await response.arrayBuffer());}));
      const base64=(bytes:Uint8Array)=>{let value='';for(let i=0;i<bytes.length;i+=8192)value+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(value);};
      const fonts={normal:base64(fontBuffers[0]),bold:base64(fontBuffers[1])};
      const pdf=buildEmployeeReportPdf(new jsPDF({orientation:'portrait',unit:'mm',format:'a4'}),{
        lang,name:pocRecord?.employeeName||'',division:pocRecord?.department||'',position:pocRecord?.job||userRole,
        date:new Date(pocRecord?.created??Date.now()).toLocaleDateString(lang==='BM'?'ms-MY':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Kuala_Lumpur'}),
        persona:persona.name,confidence,narrative:aiResult?.narrative??t.reportFallbackNarrative,
        reasoning:aiResult?.reasoning??t.reportFallbackReasoning,reflection:pocRecord?.reflection||'',
        role:contributionRole.name[lang],roleReason:contributionRole.reason[lang],roleTask:contributionRole.task[lang],
        dimensions,strengths,growth,learning:learningRecommendations,logo,fonts,
        contributions:pocRecord?Object.entries(pocRecord.assignments).flatMap(([id,a])=>{
          const project=projects.find(p=>p.id===id)?.name??id;
          const status=a.response==='declined'?(lang==='BM'?'Projek dilangkau':'Project skipped'):approvalOf(a)==='pending'?(lang==='BM'?'Menunggu kelulusan penyelia':'Awaiting supervisor approval'):approvalOf(a)==='rejected'?(lang==='BM'?'Ditolak penyelia':'Supervisor rejected'):deliveryOf(a)==='not-assigned'?(lang==='BM'?'Diluluskan - menunggu penugasan':'Approved - awaiting assignment'):deliveryOf(a);
          return [project+' - '+status,...(a.benefit?[benefitNames[a.benefit.category][lang]+' / '+a.benefit.amount.toLocaleString()+' '+a.benefit.unit+' / '+(a.benefit.status==='validated'?(lang==='BM'?'Disahkan':'Validated'):(lang==='BM'?'Belum disahkan':'Unvalidated'))]:[]),...(a.outcome&&!a.benefit?[a.outcome.deliverable+' / '+(hoursSaved(a.outcome)?.toFixed(2)??'—')+' '+(lang==='BM'?'jam tugasan':'task-hours')+' / '+(a.outcome.status==='validated'?(lang==='BM'?'Disahkan':'Validated'):(lang==='BM'?'Belum disahkan':'Unvalidated'))]:[])];
        }):[]
      });

      const safeName = (userRole || 'AI-Persona').replace(/[^a-zA-Z0-9]/g, '_');
      pdf.save(`AiNspire_Report_${safeName}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert(`PDF download failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // ── Updating overlay (shown while re-classifying) ──
  const UpdatingBadge = () => (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold mb-6 self-center"
    >
      <Loader2 className="w-3.5 h-3.5 animate-spin" />
      {t.reClassifyingLabel ?? 'Updating content…'}
    </motion.div>
  );

  return (
    <div className="w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 flex flex-col">

        {/* Top nav */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.reportBackToResults}
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || isReClassifying}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all disabled:opacity-50"
            style={{
              background: `${persona.color}18`,
              border: `1px solid ${persona.color}50`,
              color: persona.color,
            }}
          >
            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? (t.reportGenerating ?? 'Generating…') : t.reportDownload}
          </button>
        </motion.div>

        {/* Updating badge */}
        {isReClassifying && <UpdatingBadge />}

        <p className="mb-6 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm leading-6 text-muted-foreground">{lang==='BM'?'Laporan PDF menggunakan halaman berasingan untuk profil AI, kekuatan dan keperluan pembelajaran, serta laluan pembelajaran anda.':'Your PDF has separate pages for your AI profile, strengths and learning needs, and personalised learning pathway.'}</p>
        {/* Report card */}
        <motion.div
          ref={reportRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl overflow-hidden border border-card-border relative"
          style={{ background: 'var(--card)', boxShadow: '0 32px 80px rgba(0,0,0,0.4)' }}
        >
          {/* Dimming overlay while re-classifying */}
          {isReClassifying && (
            <div className="absolute inset-0 z-10 bg-background/40 backdrop-blur-[2px] flex items-center justify-center rounded-3xl pointer-events-none">
              <Loader2 className="w-8 h-8 animate-spin text-primary opacity-60" />
            </div>
          )}

          {/* Header band */}
          <div
            className="px-5 py-7 sm:px-8 flex flex-wrap items-start justify-between gap-y-5"
            style={{
              background: 'linear-gradient(135deg, #0a0e1a 0%, #0d2640 100%)',
              borderBottom: `1px solid ${persona.color}30`,
            }}
          >
            <div>
              {/* TM + AiNspire branding */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm text-white" style={{ background: 'linear-gradient(135deg, #0066cc, #00a3e0)' }}>TM</div>
                <div>
                  <img src="/ainspire-logo-transparent.png" alt="AiNspire" width={2172} height={724} className="h-10 w-auto object-contain"/>
                  <div className="text-xs font-semibold tracking-widest uppercase mt-0.5" style={{ color: 'rgba(0,212,200,0.8)' }}>{t.reportBrandSub}</div>
                </div>
              </div>
              <div className="text-2xl font-black text-white mb-1">{t.reportTitle}</div>
              <div className="text-sm font-medium mb-1" style={{ color: `${persona.color}cc` }}>
                {userRole || t.reportTMEmployee}
              </div>
              <div className="text-xs text-white/40">
                {t.reportAssessmentDate}: {new Date().toLocaleDateString(lang === 'BM' ? 'ms-MY' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                {' · '}{aiResult?.engine === 'tm-llm' ? t.reportPoweredByLabel : (lang === 'BM' ? 'Profil berstruktur AiNspire' : 'AiNspire structured profile')}
              </div>
            </div>

            {/* Persona badge */}
            <div className="text-right flex-shrink-0 ml-6">
              <div className="text-sm font-bold uppercase tracking-wider text-white/40 mb-2">{t.reportAiPersona}</div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 ml-auto"
                style={{ background: `${persona.color}18`, border: `1px solid ${persona.color}50` }}
              >
                <Icon className="w-8 h-8" style={{ color: persona.color }} />
              </div>
              <div className="text-2xl font-black" style={{ color: persona.color }}>{persona.name}</div>
              <div className="text-xs text-white/40 mt-1">
                {t.reportConfidence}&nbsp;
                <span className="font-bold text-green-400">{confidence}</span>
              </div>
            </div>
          </div>

          <div className="px-5 py-7 sm:px-8 space-y-8">
            {pocRecord && <section className="rounded-xl border border-primary/20 p-4"><h3 className="font-bold text-primary">{lang==='BM'?'Sumbangan POC':'POC Contribution'} · {pocRecord.id}</h3><p className="mt-2 text-xs text-muted-foreground">{lang==='BM'?'Rekod dalam pelayar · hasil contoh, bukan penugasan produksi':'Browser-local record · illustrative outcomes, not production assignments'}</p>{Object.entries(pocRecord.assignments).map(([id,a])=><div key={id} className="mt-3 text-sm"><strong>{projects.find(p=>p.id===id)?.name}</strong><p className="mt-1 text-xs text-muted-foreground">{roles.find(r=>r.id===a.roleId)?.task[lang]}</p><p>{a.response==='declined'?(lang==='BM'?'Ditolak':'Declined'):approvalOf(a)==='pending'?(lang==='BM'?'Menunggu penyelia':'Awaiting supervisor'):approvalOf(a)==='rejected'?(lang==='BM'?'Ditolak penyelia':'Supervisor rejected'):deliveryOf(a)}</p>{a.benefit&&<p>{benefitNames[a.benefit.category][lang]} · {a.benefit.amount.toLocaleString()} {a.benefit.unit} · {a.benefit.status==='validated'?(lang==='BM'?'Disahkan':'Validated'):(lang==='BM'?'Belum disahkan':'Unvalidated')}</p>}{a.outcome&&!a.benefit&&<p>{a.outcome.deliverable} · {hoursSaved(a.outcome)?.toFixed(2)} {lang==='BM'?'jam tugasan':'task-hours'} · {a.outcome.status==='validated'?(lang==='BM'?'Disahkan':'Validated'):(lang==='BM'?'Belum disahkan':'Unvalidated')}</p>}</div>)}</section>}


            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm"><h3 className="text-xs font-bold uppercase tracking-wider text-primary">{lang==='BM'?'Peranan Sumbangan AI Disyorkan':'Recommended AI Contribution Role'}</h3><p className="mt-2 text-lg font-bold">{contributionRole.name[lang]}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{contributionRole.reason[lang]}</p><p className="mt-2 text-xs leading-6 text-muted-foreground">{contributionRole.task[lang]}</p></div>
            {/* Dimension scores */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: persona.color }} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{t.reportDimensions}</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {dimensions.map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm text-muted-foreground">{d.label}</span>
                      <span className="text-sm font-bold" style={{ color: persona.color }}>{d.score}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${d.score}/100` }}
                        transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
                        style={{ background: `linear-gradient(90deg, ${persona.color}80, ${persona.color})` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Narrative + Reasoning */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl border" style={{ background: `${persona.color}08`, borderColor: `${persona.color}25` }}>
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-3.5 h-3.5" style={{ color: persona.color }} />
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: persona.color }}>{t.reportNarrativeLabel}</span>
                </div>
                <p className="text-base text-foreground/85 leading-7">
                  {aiResult?.narrative ?? t.reportFallbackNarrative}
                </p>
              </div>

              <div className="p-5 rounded-2xl border border-white/8 bg-white/3">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{t.reportReasoningLabel}</span>
                </div>
                <p className="text-base text-foreground/85 leading-7">
                  {aiResult?.reasoning ?? t.reportFallbackReasoning}
                </p>
              </div>
            </div>

            {/* Strengths + Growth */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{t.reportStrengths}</h3>
                </div>
                <div className="space-y-2">
                  {strengths.map((s) => (
                    <div key={s} className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#f59e0b' }} />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{t.reportGrowthAreas}</h3>
                </div>
                <div className="space-y-2">
                  {growth.map((g) => (
                    <div key={g} className="flex items-center gap-3">
                      <ArrowUpRight className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{g}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Learning path */}
            {aiResult && aiResult.recommendations.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8b5cf6' }} />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{t.reportLearningPath}</h3>
                  <span className="text-xs text-muted-foreground ml-1">{t.reportTailoredFor} {contributionRole.name[lang]}</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {learningRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-xl border border-white/8 bg-white/2">
                      <div
                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                        style={{ background: `${persona.color}20`, color: persona.color, border: `1px solid ${persona.color}40` }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <a href={rec.videoUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-foreground mb-0.5 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{rec.title}</a>
                        <div className="text-xs text-muted-foreground leading-relaxed">{rec.description}</div>
                        <a href={rec.videoUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">{rec.videoLinkKind==='search'?(lang==='BM'?'Teroka video berkaitan':'Explore related videos'):(lang==='BM'?'Tonton di YouTube':'Watch on YouTube')} · {rec.videoTitle} ↗</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-4 border-t border-white/8 flex items-center justify-between">
              <div className="text-xs text-muted-foreground/60">
                {t.reportFooter}
              </div>
              <div className="text-xs text-muted-foreground/60">
                Telekom Malaysia Berhad · {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Download button — bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mt-8"
        >
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloading || isReClassifying}
            className="flex items-center gap-3 px-8 py-4 rounded-full font-bold text-base transition-all disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${persona.color}22, ${persona.color}12)`,
              border: `2px solid ${persona.color}50`,
              color: persona.color,
              boxShadow: `0 0 30px ${persona.color}20`,
            }}
          >
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            {isDownloading ? (t.reportGenerating ?? 'Generating…') : t.reportSaveBtn}
          </button>
        </motion.div>
    </div>
  );
}
