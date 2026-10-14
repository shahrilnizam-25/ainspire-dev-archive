import {Info,ChevronDown,Sparkles,Workflow,ShieldCheck,Lightbulb} from 'lucide-react';
import MetricInfo from './MetricInfo';
import type {Lang} from '../i18n';
import type {PocRecord} from '../shared/poc';
import {divisionDashboardSummary,workforceCapabilityAverages} from '../shared/divisionAnalytics';
const panel='min-w-0 rounded-2xl border border-primary/20 bg-card/90 p-4';

const heading='text-xl font-bold leading-snug text-primary';
const supporting='text-sm font-semibold leading-6 text-muted-foreground';
const disclosure='flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary';

export default function EmployeeReadinessGuide({records,lang}:{records:PocRecord[];lang:Lang}){
 const data=divisionDashboardSummary(records);const tr=(en:string,bm:string)=>lang==='BM'?bm:en;
 const remaining=data.total-data.ready;const averages=workforceCapabilityAverages(records);
 const capabilities=[
  {Icon:Sparkles,title:tr('AI Exposure','Pendedahan AI'),meaning:tr('Familiarity with AI tools and their limitations','Kebiasaan dengan alat AI dan batasannya')},
  {Icon:Workflow,title:tr('AI Application','Aplikasi AI'),meaning:tr('Ability to apply AI to practical work tasks','Keupayaan menggunakan AI untuk tugasan kerja praktikal')},
  {Icon:ShieldCheck,title:tr('Critical Judgement','Pertimbangan Kritis'),meaning:tr('Ability to verify AI outputs, assess risks and protect sensitive information','Keupayaan mengesahkan hasil AI, menilai risiko dan melindungi maklumat sensitif')},
  {Icon:Lightbulb,title:tr('AI Problem Solving','Penyelesaian Masalah AI'),meaning:tr('Ability to define a problem, test an AI approach and identify success measures','Keupayaan mentakrifkan masalah, menguji pendekatan AI dan mengenal pasti ukuran kejayaan')},
 ];
 const counts=[
  {value:data.total,label:tr('Employees have taken the AI assessment','Pekerja telah menjalani penilaian AI'),info:tr('Unique employees with a completed assessment in the selected dataset. Repeat assessments are counted once per employee.','Pekerja unik dengan penilaian lengkap dalam set data dipilih. Penilaian berulang dikira sekali bagi setiap pekerja.')},
  {value:data.ready,label:tr('Employees ready to apply AI with guidance','Pekerja sedia menggunakan AI dengan bimbingan'),info:tr('Employees meeting the POC readiness criteria. This supports guided participation; it does not imply expert status or automatic project assignment.','Pekerja yang memenuhi kriteria kesediaan POC. Ini menyokong penyertaan berpandu; ia tidak bermakna status pakar atau penugasan projek automatik.')},
  {value:remaining,label:tr('Employees who may benefit from AI learning or reassessment','Pekerja yang boleh mendapat manfaat daripada pembelajaran AI atau penilaian semula'),info:tr('Employees who have not yet met all readiness criteria. Support may include learning, guided practice or clarification; reassessment is needed only where appropriate.','Pekerja yang belum memenuhi semua kriteria kesediaan. Sokongan boleh merangkumi pembelajaran, amalan berpandu atau penjelasan; penilaian semula hanya apabila sesuai.')},
 ];
 return <div className="readiness-overview">
  <section className={panel+' readiness-overview-panel'} aria-labelledby="workforce-readiness-title">
   <h3 id="workforce-readiness-title" className={heading}>{tr('Our Workforce’s AI Readiness','Kesediaan AI Tenaga Kerja Kita')} <MetricInfo label={tr('Our Workforce’s AI Readiness','Kesediaan AI Tenaga Kerja Kita')} text={tr('Percentage of assessed employees meeting the POC criteria for applying AI with guidance.','Peratus pekerja dinilai yang memenuhi kriteria POC untuk menggunakan AI dengan bimbingan.')}/></h3>
   <div className="pb-3 pt-3">
    <p className={supporting}>{tr('Ready to Apply AI with Guidance','Sedia Menggunakan AI dengan Bimbingan')}</p>
    <p className="mt-3 text-5xl font-black leading-tight text-emerald-300">{data.total?data.readyShare.toFixed(1)+'%':'—'}</p>
    {data.total>0&&<div role="progressbar" aria-label={tr('Assessed employees meeting guided-use readiness criteria','Pekerja dinilai yang memenuhi kriteria kesediaan penggunaan berpandu')} aria-valuenow={Number(data.readyShare.toFixed(1))} aria-valuemin={0} aria-valuemax={100} className="mt-3 flex h-2 overflow-hidden rounded-full bg-white/10"><span className="bg-emerald-400" style={{width:data.readyShare+'%'}}/><span className="bg-amber-400" style={{width:100-data.readyShare+'%'}}/></div>}
    <details className="mt-3">
     <summary className={disclosure}><Info size={17} aria-hidden="true"/>{tr('How the % is calculated','Bagaimana % dikira')}<ChevronDown size={16} aria-hidden="true"/></summary>
     <div className="space-y-3 py-3 text-sm leading-6 text-muted-foreground">
      {data.total>0?<p className="font-bold text-foreground">{data.ready.toLocaleString()} ÷ {data.total.toLocaleString()} × 100 = {data.readyShare.toFixed(1)}%</p>:<p>{tr('Readiness is available after employees complete the assessment.','Kesediaan tersedia selepas pekerja melengkapkan penilaian.')}</p>}
      <ul className="list-disc space-y-2 pl-5"><li>{tr('Four-capability average of at least 75/100.','Purata empat keupayaan sekurang-kurangnya 75/100.')}</li><li>{tr('AI Application and Critical Judgement each at least 75/100.','Aplikasi AI dan Pertimbangan Kritis masing-masing sekurang-kurangnya 75/100.')}</li><li>{tr('All four scores complete and any required clarification reviewed.','Keempat-empat skor lengkap dan penjelasan diperlukan telah disemak.')}</li></ul>
      <p>{tr('This is the share of assessed employees meeting POC criteria, rather than an average assessment score or a certification.','Ini bahagian pekerja dinilai yang memenuhi kriteria POC, bukan purata skor penilaian atau pensijilan.')}</p>
     </div>
    </details>
    <div className="mt-2 border-t border-white/15">{counts.map(({value,label,info})=><div key={label} className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-3 border-b border-white/10 py-2.5 last:border-b-0 sm:grid-cols-[6rem_minmax(0,1fr)]"><strong className="text-2xl font-black tabular-nums text-foreground">{value.toLocaleString()}</strong><p className="text-sm leading-6 text-foreground/85">{label} <MetricInfo label={label} text={info}/></p></div>)}</div>
   </div>
   <details className="border-t border-white/15 pt-2">
    <summary className={disclosure}>{tr('What support may help?','Apakah sokongan yang boleh membantu?')}<ChevronDown size={16} aria-hidden="true"/></summary>
    <div className="space-y-3 py-3 text-sm leading-6 text-muted-foreground"><p>{tr('HR and supervisors can help identify suitable learning, guided practice, profile clarification or reassessment when appropriate.','HR dan penyelia boleh membantu mengenal pasti pembelajaran, amalan berpandu, penjelasan profil atau penilaian semula yang sesuai.')}</p><p>{tr('This count includes employees who have not yet met all criteria. It does not mean everyone needs reassessment or cannot contribute.','Bilangan ini termasuk pekerja yang belum memenuhi semua kriteria. Ini tidak bermakna semua perlu dinilai semula atau tidak boleh menyumbang.')}</p></div>
   </details>
  </section>
  <section className={panel+' readiness-overview-panel'} aria-labelledby="readiness-meaning-title">
   <h3 id="readiness-meaning-title" className={heading}>{tr('What AI Readiness Means?','Apakah Maksud Kesediaan AI?')} <MetricInfo label={tr('What AI Readiness Means?','Apakah Maksud Kesediaan AI?')} text={tr('These four capability areas identify strengths and learning needs. Each bar shows the average assessment score out of 100, separately from the percentage of employees meeting readiness criteria.','Empat bidang keupayaan ini mengenal pasti kekuatan dan keperluan pembelajaran. Setiap bar menunjukkan purata skor penilaian daripada 100, berbeza daripada peratus pekerja yang memenuhi kriteria kesediaan.')}/></h3>
   <div className="pb-3 pt-3">
    <p className={supporting}>{tr('Four Assessment Capability Areas','Empat Bidang Keupayaan Penilaian')}</p>
    <div className="mt-1">{capabilities.map(({Icon,title,meaning},index)=>{const average=averages[index].average;return <div key={title} className="flex items-start gap-2.5 border-b border-white/10 py-2.5 last:border-b-0"><Icon size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true"/><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h4 className="text-base font-bold text-foreground">{title}</h4><span className="shrink-0 text-sm font-bold tabular-nums text-primary">{average===null?'—':average.toFixed(0)+'/100'}</span></div>{average!==null&&<div role="meter" aria-label={title+' · '+tr('workforce average','purata tenaga kerja')} aria-valuenow={Number(average.toFixed(1))} aria-valuemin={0} aria-valuemax={100} className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-primary" style={{width:average+'%'}}/></div>}<p className="mt-1 text-sm leading-5 text-muted-foreground">{meaning}</p></div></div>;})}</div>
   </div>
   <details className="border-t border-white/15 pt-2">
    <summary className={disclosure}>{tr('How the capability scores work?','Bagaimanakah skor keupayaan berfungsi?')}<ChevronDown size={16} aria-hidden="true"/></summary>
    <div className="space-y-3 py-3 text-sm leading-6 text-muted-foreground"><p>{tr('One question per capability. The four answer options map to 25, 50, 75 or 100 points.','Satu soalan bagi setiap keupayaan. Empat pilihan jawapan dipetakan kepada 25, 50, 75 atau 100 mata.')}</p><p>{tr('Each bar averages valid assessment-response scores for that capability in the selected dataset. Missing or invalid scores are excluded; no data is shown as a dash. These averages are separate from the percentage of employees meeting readiness criteria.','Setiap bar mempuratakan skor respons penilaian yang sah bagi keupayaan tersebut dalam set data dipilih. Skor tidak lengkap atau tidak sah dikecualikan; tiada data ditunjukkan sebagai sengkang. Purata ini berbeza daripada peratus pekerja yang memenuhi kriteria kesediaan.')}</p><p>{tr('Scores reflect assessment responses and help guide development. They are not independently tested proficiency scores.','Skor mencerminkan respons penilaian dan membantu pembangunan. Ia bukan skor kemahiran yang diuji secara bebas.')}</p></div>
   </details>
  </section>
 </div>;
}
