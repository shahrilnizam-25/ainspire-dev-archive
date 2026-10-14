import {Lightbulb,UsersRound,Network,BriefcaseBusiness} from 'lucide-react';
import type {Lang} from '../i18n';
import type {PocRecord} from '../shared/poc';
import {personas} from '../data/personas';
import {workforceAnalytics,workforceLearningSummary} from '../shared/workforceAnalytics';
import {AnalyticsPanel} from './WorkforcePanels';

export default function WorkforceHighlights({records,lang,planning=false}:{records:PocRecord[];lang:Lang;planning?:boolean}){
 const a=workforceAnalytics(records);const learning=workforceLearningSummary(a.records,lang);const tr=(en:string,bm:string)=>lang==='BM'?bm:en;
 const dominant=[...a.personas].sort((a,b)=>b.count-a.count)[0];const tied=a.personas.filter(p=>p.count===dominant.count);const reviews=a.records.filter(r=>r.reviewRequired&&!r.review).length;
 if(!a.records.length)return <AnalyticsPanel title={tr('Workforce Highlights','Sorotan Tenaga Kerja')}><p className="text-sm text-muted-foreground">{tr('Complete an assessment to see workforce insights.','Lengkapkan penilaian untuk melihat dapatan tenaga kerja.')}</p></AnalyticsPanel>;
 const items=planning?[
 {title:tr(`${reviews.toLocaleString()} profiles need review`,`${reviews.toLocaleString()} profil memerlukan semakan`),text:tr('Clarify assessment evidence with employees and supervisors.','Jelaskan bukti penilaian bersama pekerja dan penyelia.')},
 {title:learning.mostRecommended?tr(`${learning.mostRecommended.count.toLocaleString()} employees share a priority topic`,`${learning.mostRecommended.count.toLocaleString()} pekerja berkongsi topik utama`):tr('Learning guidance needs assessment evidence','Panduan pembelajaran memerlukan bukti penilaian'),text:learning.mostRecommended?.topic??tr('Review incomplete assessment dimensions.','Semak dimensi penilaian yang tidak lengkap.')},
 {title:tr(`${a.departments.length} divisions represented`,`${a.departments.length} bahagian diwakili`),text:tr('Compare persona mix and learning demand before planning support.','Bandingkan gabungan persona dan permintaan pembelajaran sebelum merancang sokongan.')}
 ]:[
 {title:tied.length===1?tr(`${personas[dominant.id].name} is the most common persona`,`${personas[dominant.id].name} ialah persona paling lazim`):tr('A shared lead across AI personas','Persona AI berkongsi kedudukan utama'),text:tr(`${tied.map(p=>personas[p.id].name).join(' · ')} · ${(dominant.count/a.records.length*100).toFixed(1)}% of assessed profiles`,`${tied.map(p=>personas[p.id].name).join(' · ')} · ${(dominant.count/a.records.length*100).toFixed(1)}% profil dinilai`)},
 {title:tr(`${a.departments.length} divisions represented`,`${a.departments.length} bahagian diwakili`),text:tr('Explore the division mix for an aggregated overview.','Teroka gabungan bahagian untuk gambaran agregat.')},
 {title:tr('Every persona has a contribution role','Setiap persona mempunyai peranan sumbangan'),text:tr('Different strengths support research, development, value and adoption.','Kekuatan berbeza menyokong penyelidikan, pembangunan, nilai dan penerimaan.')}
 ];
 return <AnalyticsPanel highlight={!planning} highlightLabel={tr('Key Highlight','Sorotan Utama')} title={planning?tr('Assessment Planning Attention','Perhatian Perancangan Penilaian'):tr('Workforce Highlights','Sorotan Tenaga Kerja')} info={tr('Observations derived from the selected assessment profiles. Persona distribution is not a capability ranking.','Pemerhatian diperoleh daripada profil penilaian dipilih. Taburan persona bukan kedudukan keupayaan.')}><div className="space-y-3">{items.map((item,index)=>{const Icon=planning?Lightbulb:[UsersRound,Network,BriefcaseBusiness][index];const color=['#22d3ee','#34d399','#c084fc'][index];return <div key={item.title} className="flex items-start gap-4 rounded-xl border bg-gradient-to-r from-primary/5 to-background/60 p-4" style={{borderColor:planning?color+'35':'rgba(255,255,255,0.20)'}}><span className="shrink-0 rounded-xl p-3" style={{color:planning?color:'#ffffff',background:planning?color+'15':'rgba(255,255,255,0.10)'}}><Icon className="h-6 w-6" aria-hidden="true"/></span><div><h4 className="text-base font-bold leading-6">{item.title}</h4><p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p></div></div>;})}</div></AnalyticsPanel>;
}
