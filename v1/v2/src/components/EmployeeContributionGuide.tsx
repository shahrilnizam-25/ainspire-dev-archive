import {BookOpen, ChevronDown, Info} from 'lucide-react';
import type {Lang} from '../i18n';
import {personas} from '../data/personas';
import {personaIds} from '../shared/workforceAnalytics';
import {primaryContributionRole} from '../shared/contributionRoles';

const guideColours={explorer:'#67e8f9',builder:'#a5b4fc',strategist:'#d8b4fe',visionary:'#fde68a'};

export default function EmployeeContributionGuide({lang}:{lang:Lang}){
 const tr=(en:string,bm:string)=>lang==='BM'?bm:en;
 const title=tr('How You Can Contribute','Cara Anda Boleh Menyumbang');
 return <details className="group min-w-0 rounded-2xl border-2 border-white/65 bg-card p-5 sm:p-6">
  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-slate-300 [&::-webkit-details-marker]:hidden">
   <span className="flex items-center gap-3"><BookOpen size={24} className="shrink-0 text-slate-300" aria-hidden="true"/><span><span className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{tr('Employee Guide','Panduan Pekerja')}</span><span className="block text-xl font-bold sm:text-2xl">{title}</span></span></span>
   <ChevronDown size={20} className="shrink-0 text-slate-300 transition-transform group-open:rotate-180" aria-hidden="true"/>
  </summary>
  <p className="mt-2 text-sm leading-6 text-slate-300">{tr('Understand how each AI persona connects to a contribution role.','Fahami bagaimana setiap persona AI berkaitan dengan peranan sumbangan.')}</p>
  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{personaIds.map(id=>{
   const p=personas[id];const Icon=p.icon;const colour=guideColours[id];
   return <article key={id} className="relative min-w-0 overflow-hidden rounded-xl border border-slate-400/25 bg-background/40 p-5">
    <div className="absolute inset-x-0 top-0 h-1" style={{backgroundColor:colour}}/>
    <span className="mb-4 inline-flex rounded-xl border p-3" style={{color:colour,borderColor:colour+'40',backgroundColor:colour+'10'}}><Icon size={28} aria-hidden="true"/></span>
    <h4 className="text-xl font-black leading-7" style={{color:colour}}>{p.name}</h4>
    <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{tr('Contribution Role','Peranan Sumbangan')}</p>
    <p className="mt-2 text-base font-semibold leading-7 text-slate-100">{primaryContributionRole(id).name[lang]}</p>
   </article>;
  })}</div>
  <p className="mt-5 flex items-start gap-2 border-t border-slate-400/20 pt-4 text-sm leading-6 text-slate-300"><Info size={19} className="mt-1 shrink-0 text-slate-400" aria-hidden="true"/>{tr('View your AI Profile, follow your learning pathway, and show interest in a suitable project.','Lihat Profil AI anda, ikuti laluan pembelajaran, dan nyatakan minat dalam projek yang sesuai.')}</p>
 </details>;
}
