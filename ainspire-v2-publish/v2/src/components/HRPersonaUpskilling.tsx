import {useEffect,useMemo,useState} from 'react';
import {CalendarDays,CheckCircle2,LoaderCircle,Circle} from 'lucide-react';
import type {Lang} from '../i18n';
import {personalisedPlan,type PocRecord,type PersonaId} from '../shared/poc';
import {primaryContributionRole} from '../shared/contributionRoles';
import {withLearningResources} from '../shared/learningResources';
import {hrUpskillingGroups,hrUpskillingEvidenceKey,type UpskillingPersona} from '../shared/hrUpskilling';
import {skillGapSummary} from '../shared/skillGaps';
import {action,panel} from './WorkforcePanels';
import MetricInfo from './MetricInfo';
const personaNames={explorer:'AI Explorer',builder:'AI Builder',strategist:'AI Strategist',visionary:'AI Visionary'};
const capabilityNames={aiExposure:['AI Exposure','Pendedahan AI'],aiApplication:['AI Application','Aplikasi AI'],criticalJudgement:['Critical Judgement','Pertimbangan Kritikal'],aiProblemSolving:['AI Problem Solving','Penyelesaian Masalah AI']} as const;
const capabilityLearning={aiExposure:['AI foundations & safe use','Asas AI & penggunaan selamat'],aiApplication:['Practical AI application','Aplikasi AI praktikal'],criticalJudgement:['Output checking & responsible AI','Semakan output & AI bertanggungjawab'],aiProblemSolving:['AI problem framing & success measures','Pembingkaian masalah AI & ukuran kejayaan']} as const;
const personaLearning={explorer:['AI foundations, safe prompting and output checking.','Asas AI, prompting selamat dan semakan output.'],builder:['Role-relevant AI development, integration and testing.','Pembangunan AI berkaitan peranan, integrasi dan pengujian.'],strategist:['Problem framing, responsible AI and benefit measurement.','Pembingkaian masalah, AI bertanggungjawab dan pengukuran manfaat.'],visionary:['Responsible adoption, stakeholder engagement and change planning.','Penggunaan bertanggungjawab, penglibatan pihak berkepentingan dan perancangan perubahan.']} as const;
const owners={explorer:['HR/L&D + supervisor','HR/L&D + penyelia'],builder:['Technical mentor + supervisor','Pembimbing teknikal + penyelia'],strategist:['Business SME + supervisor','Pakar domain perniagaan + penyelia'],visionary:['Adoption lead + supervisor','Peneraju penggunaan + penyelia']} as const;
const measures={explorer:['Accepted task output and comparable follow-up capability evidence.','Hasil tugasan diterima dan bukti keupayaan susulan yang sebanding.'],builder:['Tested prototype with documented results and accepted outputs.','Prototaip diuji dengan keputusan direkod dan hasil diterima.'],strategist:['Reviewed use-case proposal with an agreed baseline and success measures.','Cadangan kes penggunaan disemak dengan garis dasar dan ukuran kejayaan dipersetujui.'],visionary:['Reviewed adoption roadmap with measurable pilot objectives and agreed owners.','Pelan penggunaan disemak dengan objektif rintis terukur dan pemilik dipersetujui.']} as const;
type Group=ReturnType<typeof hrUpskillingGroups>[number];

export default function HRPersonaUpskilling({records,division,divisions,onDivisionChange,demo,lang}:{records:PocRecord[];division:string;divisions:string[];onDivisionChange:(division:string)=>void;demo:boolean;lang:Lang}){
 const tr=(en:string,bm:string)=>lang==='BM'?bm:en;
 const [persona,setPersona]=useState<UpskillingPersona>('explorer');
 const [draft,setDraft]=useState<{key:string;groups:Group[];revision:number}|null>(null);
 const groups=useMemo(()=>hrUpskillingGroups(records,persona),[records,persona]);
 const scopeKey=useMemo(()=>hrUpskillingEvidenceKey(records,JSON.stringify([division,persona,demo,lang])),[records,division,persona,demo,lang]);
 const [generation,setGeneration]=useState<{key:string;revision:number}|null>(null);
 const [progress,setProgress]=useState(3);
 const busy=generation?.key===scopeKey&&progress<3;
 const current=!busy&&draft?.key===scopeKey;
 const phases=[tr('Review selected assessment evidence','Semak bukti penilaian dipilih'),tr('Check capability gaps and clarification needs','Semak jurang keupayaan dan keperluan penjelasan'),tr('Prepare persona-aligned 90-day draft','Sediakan draf 90 hari mengikut persona')];
 useEffect(()=>{
  if(!generation||generation.key!==scopeKey)return;
  let timer:ReturnType<typeof setTimeout>;
  // Each checkpoint completes its rule-based work before advancing.
  const selectedRecords=records;
  timer=setTimeout(()=>{
   setProgress(1);
   const analysed=hrUpskillingGroups(selectedRecords,persona);
   timer=setTimeout(()=>{
    setProgress(2);
    timer=setTimeout(()=>{
     setDraft(previous=>({key:scopeKey,groups:analysed,revision:(previous?.revision??0)+1}));
     setProgress(3);
    },700);
   },700);
  },700);
  return()=>clearTimeout(timer);
 },[scopeKey,generation?.key,generation?.revision,records,persona]);
 return <section id="hr-learning-plan" tabIndex={-1} className={panel} aria-labelledby="hr-upskilling-title" aria-busy={busy}>
  <h3 id="hr-upskilling-title" className="flex items-center gap-3 text-lg font-bold text-primary"><CalendarDays aria-hidden="true" size={24}/>{tr('90-Day Upskilling Plans','Pelan Peningkatan Kemahiran 90 Hari')}<MetricInfo label={tr('90-Day Upskilling Plans','Pelan Peningkatan Kemahiran 90 Hari')} text={tr('POC drafts use governed persona guidance, recorded capability gaps and employee reflection. HR reviews the draft; persona selection does not reclassify employees.','Draf POC menggunakan panduan persona, jurang keupayaan direkod dan refleksi pekerja. HR menyemak draf; pilihan persona tidak mengelaskan semula pekerja.')}/></h3>
  <p className="mt-3 text-sm leading-6 text-muted-foreground">{tr('Choose a division and AI persona. Generate a draft for HR review.','Pilih bahagian dan persona AI. Jana draf untuk semakan HR.')}</p>
  <div className="mt-5 flex flex-wrap items-end gap-4"><label className="min-w-0 max-w-full text-sm font-semibold">{tr('Division','Bahagian')}<select className="mt-2 block max-w-full rounded-xl border border-primary/30 bg-card p-3 text-sm" value={division} disabled={busy} onChange={e=>onDivisionChange(e.target.value)}><option value="all">{tr('All divisions','Semua bahagian')}</option>{divisions.map(d=><option key={d}>{d}</option>)}</select></label><label className="text-sm font-semibold">{tr('AI Persona','Persona AI')}<select className="mt-2 block max-w-full rounded-xl border border-primary/30 bg-card p-3 text-sm" value={persona} disabled={busy} onChange={e=>setPersona(e.target.value as UpskillingPersona)}>{Object.entries(personaNames).map(([id,name])=><option key={id} value={id}>{name}</option>)}<option value="all">{tr('All AI Personas','Semua Persona AI')}</option></select></label><button type="button" disabled={!groups.length||busy} className={action+' min-h-12 disabled:opacity-40'} onClick={()=>{setProgress(0);setGeneration(previous=>({key:scopeKey,revision:(previous?.revision??0)+1}));}}>{busy?tr('Preparing Draft…','Menyediakan Draf…'):persona==='all'?tr('Generate Draft Plans','Jana Draf Pelan'):tr('Generate Draft Plan','Jana Draf Pelan')} →</button><button type="button" disabled={!draft&&!generation} className={action+' min-h-12 disabled:opacity-40'} onClick={()=>{setGeneration(null);setProgress(3);setDraft(null);}}>{tr('Clear','Kosongkan')}</button></div>
  {generation?.key===scopeKey&&<div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4"><p className="text-sm font-bold text-primary">{tr('Draft preparation · rule-based analysis','Penyediaan draf · analisis berasaskan peraturan')}</p><ol className="mt-3 grid gap-3 lg:grid-cols-3">{phases.map((label,index)=>{const done=progress>index;const active=progress===index;const Icon=done?CheckCircle2:active?LoaderCircle:Circle;return <li key={label} className="flex items-start gap-2 text-sm leading-6"><Icon size={18} aria-hidden="true" className={'mt-1 shrink-0 '+(active?'motion-safe:animate-spin text-primary':done?'text-primary':'text-muted-foreground')}/><span>{label}<span className="block text-xs text-muted-foreground">{done?tr('Complete','Selesai'):active?tr('In progress','Sedang berlangsung'):tr('Waiting','Menunggu')}</span></span></li>;})}</ol></div>}
  <p role="status" className="mt-4 text-sm leading-6 text-muted-foreground">{busy?tr(`Step ${progress+1} of 3 · ${phases[progress]}.`,`Langkah ${progress+1} daripada 3 · ${phases[progress]}.`):!groups.length?tr('No assessed profiles match this selection. Choose another persona or division.','Tiada profil dinilai sepadan dengan pilihan ini. Pilih persona atau bahagian lain.'):current?tr(`${draft.groups.length} draft plan(s) generated · awaiting HR review.`,`${draft.groups.length} draf pelan dijana · menunggu semakan HR.`):draft?tr('Selection or evidence changed. Generate a fresh draft for the current cohort.','Pilihan atau bukti berubah. Jana draf baharu bagi cohort semasa.'):tr(`${groups.reduce((sum,g)=>sum+g.records.length,0).toLocaleString()} assessed profiles in this selection · ready to generate a draft.`,`${groups.reduce((sum,g)=>sum+g.records.length,0).toLocaleString()} profil dinilai dalam pilihan ini · sedia untuk menjana draf.`)}</p>
  {current&&draft.groups.map((group,index)=><PersonaDraft key={draft.revision+group.id} group={group} lang={lang} open={index===0}/>)}
 </section>;
}
function PersonaDraft({group,lang,open}:{group:Group;lang:Lang;open:boolean}){
 const tr=(en:string,bm:string)=>lang==='BM'?bm:en;const local=(text:readonly[string,string])=>text[lang==='BM'?1:0];
 const {id,records,gaps}=group;const role=primaryContributionRole(id);const [expanded,setExpanded]=useState(false);const [limit,setLimit]=useState(10);
 const priority=gaps.priority;const focus=priority?local(capabilityLearning[priority.dimension as keyof typeof capabilityLearning]):local(personaLearning[id]);
 return <details open={open||undefined} className="mt-5 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5"><summary className="cursor-pointer text-base font-bold text-primary">{personaNames[id]} · {role.name[lang]}</summary><p className="mt-3 text-sm text-muted-foreground">{records.length.toLocaleString()} {tr('assessed profiles','profil dinilai')} · {gaps.clarification.toLocaleString()} {tr('require evidence clarification before finalising the plan','memerlukan penjelasan bukti sebelum memuktamadkan pelan')}</p>
  {priority?<p className="mt-3 text-sm"><strong>{tr('Priority learning focus','Fokus pembelajaran utama')}: </strong>{focus} · {priority.gaps.length.toLocaleString()} / {priority.assessed.toLocaleString()} {tr('profiles with usable evidence below the 75/100 POC baseline','profil dengan bukti boleh digunakan di bawah garis dasar POC 75/100')}</p>:<p className="mt-3 text-sm text-muted-foreground">{tr('No confirmed below-baseline gap in this cohort. Use role-relevant development or clarify missing evidence.','Tiada jurang bawah garis dasar disahkan bagi cohort ini. Gunakan pembangunan berkaitan peranan atau jelaskan bukti yang tiada.')}</p>}
  <div className="mt-5 grid gap-4 lg:grid-cols-3">{[
   {period:tr('Days 1–30 · Learn','Hari 1–30 · Belajar'),task:priority?tr(`Start with ${focus}. Add role-relevant learning and review reflections.`,`Mulakan dengan ${focus}. Tambah pembelajaran berkaitan peranan dan semak refleksi.`):local(personaLearning[id])},
   {period:tr('Days 31–60 · Practise','Hari 31–60 · Berlatih'),task:role.task[lang]},
   {period:tr('Days 61–90 · Review','Hari 61–90 · Semak'),task:tr('Review accepted task outputs and comparable follow-up capability evidence against the starting gap.','Semak hasil tugasan diterima dan bukti keupayaan susulan sebanding terhadap jurang awal.')}
  ].map(step=><section key={step.period} className="min-w-0 rounded-xl border border-primary/20 bg-card p-4"><h4 className="font-bold text-primary">{step.period}</h4><p className="mt-3 text-sm leading-6">{step.task}</p></section>)}</div>
  <p className="mt-4 text-sm"><strong>{tr('Suggested owner','Pemilik dicadangkan')}: </strong>{local(owners[id])}</p><p className="mt-3 text-sm leading-6"><strong>{tr('Success measure','Ukuran kejayaan')}: </strong>{local(measures[id])}</p><p className="mt-3 text-xs leading-6 text-muted-foreground">{tr('Practical work may be a supervised exercise. Project participation still requires employee interest, supervisor approval and confirmed capacity.','Kerja praktikal boleh berupa latihan diselia. Penyertaan projek masih memerlukan minat pekerja, kelulusan penyelia dan kapasiti disahkan.')}</p>
  <details className="mt-4 border-t border-primary/20 pt-3" onToggle={e=>setExpanded(e.currentTarget.open)}><summary className="cursor-pointer text-sm font-semibold text-primary">{tr('Employee personalisation · details on demand','Pemperibadian pekerja · butiran atas permintaan')}</summary>{expanded&&<><div className="mt-4 space-y-3">{records.slice(0,limit).map(record=><EmployeeDraft key={record.id} record={record} persona={id} lang={lang}/>)}</div><p className="mt-3 text-xs text-muted-foreground" aria-live="polite">{Math.min(limit,records.length)} / {records.length.toLocaleString()} {tr('profiles shown','profil dipaparkan')}</p>{limit<records.length&&<button type="button" className={action+' mt-3'} onClick={()=>setLimit(n=>n+10)}>{tr('Show More Employees','Tunjukkan Lagi Pekerja')}</button>}</>}</details>
 </details>;
}
function EmployeeDraft({record,persona,lang}:{record:PocRecord;persona:PersonaId;lang:Lang}){
 const tr=(en:string,bm:string)=>lang==='BM'?bm:en;const local=(text:readonly[string,string])=>text[lang==='BM'?1:0];
 const gaps=skillGapSummary([record]);const priority=gaps.priority;
 const recommendations=withLearningResources(personalisedPlan(record,undefined,lang).map(item=>({title:item.text,description:''})),persona);
 const completed=Object.values(record.learning).filter(Boolean).length;
 return <details className="rounded-lg border border-primary/20 bg-card p-4"><summary className="cursor-pointer text-sm font-bold text-primary">{record.employeeName||record.id}<span className="mt-1 block font-normal text-muted-foreground">{record.department} · {record.job}</span></summary><p className="mt-3 text-sm"><strong>{tr('Contribution role','Peranan sumbangan')}: </strong>{primaryContributionRole(persona).name[lang]}</p>
  <p className="mt-3 text-sm leading-6"><strong>{tr('Starting evidence','Bukti awal')}: </strong>{gaps.clarification?tr('Clarify missing or inconsistent evidence before confirming capability targets.','Jelaskan bukti tiada atau tidak konsisten sebelum mengesahkan sasaran keupayaan.'):priority?`${local(capabilityNames[priority.dimension as keyof typeof capabilityNames])} · ${record.dimensions[priority.dimension]}/100 → ${priority.target}/100 ${tr('POC baseline','garis dasar POC')}`:tr('No confirmed below-baseline score; develop practical evidence for the intended role.','Tiada skor bawah garis dasar disahkan; bangunkan bukti praktikal bagi peranan sasaran.')}</p>
  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground"><strong>{tr('Reflection','Refleksi')}: </strong>{record.reflection||tr('Not recorded; request reflection.','Belum direkod; minta refleksi.')}</p><p className="mt-3 text-xs text-muted-foreground">{tr('Recorded learning','Pembelajaran direkod')}: {record.development?.status??'—'} · {completed} {tr('self-reported learning actions marked complete','tindakan pembelajaran laporan kendiri ditandakan selesai')}</p>
  <p className="mt-3 text-sm font-semibold">{tr('Suggested learning','Pembelajaran dicadangkan')}</p><ul className="mt-2 space-y-2">{recommendations.map(rec=><li key={rec.videoUrl}><a href={rec.videoUrl} target="_blank" rel="noreferrer" className="text-sm leading-6 text-primary underline underline-offset-4">{rec.title} ↗</a></li>)}</ul><p className="mt-3 text-xs leading-6 text-muted-foreground">{tr('Reflection informs learning guidance; it adds no capability score points. HR reviews prior learning before agreeing the next course.','Refleksi memaklumkan panduan pembelajaran; tidak menambah mata keupayaan. HR menyemak pembelajaran terdahulu sebelum mempersetujui kursus seterusnya.')}</p>
 </details>;
}
