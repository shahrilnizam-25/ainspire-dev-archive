import POCJourney from './POCJourney';
import {usePocRecord} from '../shared/pocStore';
import {personas} from '../data/personas';
import type {AIResult} from '../App';
import type {Lang} from '../i18n';
import {translations} from '../i18n';
import {RefreshCw,Home} from 'lucide-react';
export default function ResultsScreen({lang,resultPersonaId,aiResult,aiError,isReClassifying,onRetake,onReport,onMain,initialStep=null}:{lang:Lang;resultPersonaId:string;aiResult:AIResult|null;aiError:string|null;isReClassifying:boolean;onRetake:()=>void;onReport:()=>void;onMain:()=>void;initialStep?:number|null}){
 const record=usePocRecord(aiResult);const t=translations[lang];
 const overviewHeader=<header className="mb-6">
  <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-lg font-bold tracking-wide text-primary sm:text-xl">AiNspire · {lang==='BM'?'Perjalanan Anda':'Your Journey'}</p><button onClick={onRetake} className="flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-sm hover:border-primary/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><RefreshCw size={16}/>{t.resultsRetake}</button></div>
  <h1 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight sm:text-[30px] lg:text-[32px]">{lang==='BM'?'Kenali potensi anda. Cari sumbangan anda.':'Understand your potential. Find your contribution.'}</h1>
  <button onClick={onMain} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><Home size={17}/>{lang==='BM'?'Kembali ke Halaman Utama':'Back to Main Page'}</button>
 </header>;
 return <div className="w-full max-w-6xl px-4 py-5 sm:px-8">
 {(!aiResult||!record)&&overviewHeader}
 {isReClassifying&&<p role="status" className="mb-4 text-sm text-primary">{t.reClassifyingLabel}</p>}
 {aiResult&&record?<POCJourney result={aiResult} record={record} lang={lang} onReport={onReport} onMain={onMain} overviewHeader={overviewHeader} initialStep={initialStep}/>:<section className="rounded-2xl border border-primary/30 bg-card p-6"><h2 className="text-xl font-bold">{personas[resultPersonaId]?.name}</h2><p className="mt-3 text-sm">{aiError?lang==='BM'?'Keputusan asas tersedia. Cuba semula penilaian untuk cadangan lengkap.':'Baseline result available. Retry the assessment for full recommendations.':lang==='BM'?'Menyediakan cadangan anda…':'Preparing your recommendations…'}</p></section>}
 </div>;
}
