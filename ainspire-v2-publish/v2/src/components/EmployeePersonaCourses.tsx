import {useState} from 'react';
import {LockKeyhole,Play} from 'lucide-react';
import type {Lang} from '../i18n';
import type {PersonaId} from '../shared/poc';
import {personas} from '../data/personas';
import {withLearningResources} from '../shared/learningResources';
import {panel,action,employeePrimaryAction} from './WorkforcePanels';

const catalogue:Record<PersonaId,{title:string;bm:string;objective:string;objectiveBM:string}[]>={
 explorer:[
  {title:'AI Foundations',bm:'Asas AI',objective:'Understand AI tools, limitations and safe use.',objectiveBM:'Fahami alat AI, batasan dan penggunaan selamat.'},
  {title:'Prompting for Everyday Work',bm:'Prompt untuk Kerja Harian',objective:'Write clear prompts for practical work tasks.',objectiveBM:'Tulis prompt yang jelas untuk tugasan kerja praktikal.'},
  {title:'Checking AI Outputs',bm:'Menyemak Output AI',objective:'Evaluate output quality and verify accuracy.',objectiveBM:'Nilai kualiti output dan sahkan ketepatan.'},
 ],
 builder:[
  {title:'Building AI Applications',bm:'Membina Aplikasi AI',objective:'Build a small AI solution with clear inputs and outputs.',objectiveBM:'Bina penyelesaian AI kecil dengan input dan output jelas.'},
  {title:'AI Workflow Integration',bm:'Integrasi Aliran Kerja AI',objective:'Explore connecting AI tools to a practical workflow.',objectiveBM:'Teroka penyambungan alat AI kepada aliran kerja praktikal.'},
  {title:'Testing AI Solutions',bm:'Menguji Penyelesaian AI',objective:'Evaluate quality, reliability and safety.',objectiveBM:'Nilai kualiti, kebolehpercayaan dan keselamatan.'},
 ],
 strategist:[
  {title:'AI Use-Case Design',bm:'Reka Bentuk Kes Penggunaan AI',objective:'Define a business problem and suitable AI approach.',objectiveBM:'Takrif masalah perniagaan dan pendekatan AI sesuai.'},
  {title:'Responsible AI & Governance',bm:'AI Bertanggungjawab & Tadbir Urus',objective:'Assess risks, controls and accountability.',objectiveBM:'Nilai risiko, kawalan dan akauntabiliti.'},
  {title:'Measuring Business Value',bm:'Mengukur Nilai Perniagaan',objective:'Set baselines and meaningful success measures.',objectiveBM:'Tetapkan garis dasar dan ukuran kejayaan bermakna.'},
 ],
 visionary:[
  {title:'AI Strategy & Innovation',bm:'Strategi & Inovasi AI',objective:'Identify AI opportunities linked to organisational goals.',objectiveBM:'Kenal pasti peluang AI selaras matlamat organisasi.'},
  {title:'Leading AI Adoption',bm:'Menerajui Penggunaan AI',objective:'Help teams adopt AI responsibly.',objectiveBM:'Bantu pasukan menggunakan AI secara bertanggungjawab.'},
  {title:'Scaling Responsible AI',bm:'Memperluas AI Bertanggungjawab',objective:'Plan sustainable adoption and governance.',objectiveBM:'Rancang penggunaan mampan dan tadbir urus.'},
 ],
};
export default function EmployeePersonaCourses({lang,assessed,persona,onStart}:{lang:Lang;assessed:boolean;persona?:PersonaId;onStart?:()=>void}){
 const [selected,setSelected]=useState<PersonaId>(persona??'explorer');const tr=(en:string,bm:string)=>lang==='BM'?bm:en;
 const recommendations=catalogue[selected];
 // Locked entries never render an anchor or a video URL. Mock cohorts cannot unlock them.
 const resources=assessed?withLearningResources(recommendations.map(c=>({title:c.title,description:c.objective})),selected):null;
 return <details className={panel}><summary className="cursor-pointer text-xl font-bold text-primary">{tr('Explore Recommended Learning Courses by AI Persona','Teroka Kursus Pembelajaran Disyorkan mengikut Persona AI')}</summary>
 {!assessed&&<div className="mt-5 rounded-xl border border-primary/30 bg-primary/5 p-4"><p className="flex items-start gap-2 text-sm leading-6"><LockKeyhole size={18} className="mt-1 shrink-0 text-primary" aria-hidden="true"/>{tr('Complete your AI assessment to access learning videos.','Lengkapkan penilaian AI anda untuk mengakses video pembelajaran.')}</p>{onStart&&<button className={employeePrimaryAction+' mt-3 max-w-full'} onClick={onStart}>{tr('Start My AI Assessment →','Mulakan Penilaian AI Saya →')}</button>}</div>}
 <div className="mt-5 flex flex-wrap gap-3" aria-label={tr('Explore persona learning examples','Teroka contoh pembelajaran persona')}>{(Object.keys(catalogue) as PersonaId[]).map(id=><button key={id} className={action+(selected===id?' ring-2 ring-primary':'')} aria-pressed={selected===id} onClick={()=>setSelected(id)}>{personas[id].name}{assessed&&persona===id&&<span className="text-xs">· {tr('Your persona','Persona anda')}</span>}</button>)}</div>
 <div className="mt-5" aria-live="polite"><h4 className="text-lg font-bold text-primary">{personas[selected].name}</h4><ol className="mt-3 space-y-4">{recommendations.map((course,i)=>{const video=resources?.[i];return <li key={course.title} className="border-t border-white/10 pt-4"><p className="text-base font-bold">{i+1}. {tr(course.title,course.bm)}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{tr(course.objective,course.objectiveBM)}</p>{video?<a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-start gap-2 rounded text-sm font-semibold leading-6 text-primary underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"><Play size={16} className="mt-1 shrink-0" aria-hidden="true"/>{video.videoLinkKind==='search'?tr('Find a relevant YouTube video','Cari video YouTube berkaitan'):video.videoTitle} ↗</a>:<p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><LockKeyhole size={16} aria-hidden="true"/>{tr('Video locked · Complete assessment','Video dikunci · Lengkapkan penilaian')}</p>}</li>;})}</ol></div>
 <p className="mt-5 text-xs leading-6 text-muted-foreground">{tr('Introductory video resources by persona, not accredited certification courses. Your AI Profile provides personalised recommendations based on assessment evidence and reflection.','Sumber video pengenalan mengikut persona, bukan kursus pensijilan bertauliah. Profil AI menyediakan cadangan peribadi berdasarkan bukti penilaian dan refleksi.')}</p>
 </details>;
}
