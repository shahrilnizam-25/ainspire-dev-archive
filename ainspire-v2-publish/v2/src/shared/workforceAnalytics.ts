import {departmentOptions} from '../data/assessment';
import {approvalOf,deliveryOf,personalisedPlan,projects,benefitNames,type PocRecord,type Benefit,type BenefitCategory} from './poc';
import {primaryContributionRole,employeeProjectOffers} from './contributionRoles';
import {validatedContributionBenefit} from './contributionOutcomes';
export const personaIds=['explorer','builder','strategist','visionary'] as const;
export function profileConfidence(record:PocRecord){return record.review?'high':record.reviewRequired?(record.reflection?'moderate':'clarification'):'high';}
// Use the same priority focus as the employee learning pathway. Counts describe recommendations, not completion.
export function priorityLearning(record:PocRecord,lang:'EN'|'BM'){
 if(!Object.keys(record.dimensions).length)return null;
 const offers=employeeProjectOffers(record);return personalisedPlan(record,offers.find(o=>o.primaryMatch)??offers[0],lang)[0].text;
}
export function workforceAnalytics(input:PocRecord[]){
 const records=[...new Map(input.map(r=>[r.id,r])).values()];
 const personas=personaIds.map(id=>({id,count:records.filter(r=>(r.review?.persona??r.persona)===id).length}));
 const confidence={high:0,moderate:0,clarification:0};records.forEach(r=>confidence[profileConfidence(r)]++);
 const responses=records.flatMap(record=>Object.entries(record.assignments).map(([projectId,assignment])=>({record,projectId,assignment})));
 const interested=responses.filter(r=>r.assignment.response==='accepted');
 const approved=interested.filter(r=>approvalOf(r.assignment)==='approved');
 const assigned=approved.filter(r=>r.assignment.confirmed&&deliveryOf(r.assignment)!=='not-assigned');
 const completed=assigned.filter(r=>deliveryOf(r.assignment)==='completed');
 const summary={interest:interested.length,uniqueInterested:new Set(interested.map(r=>r.record.id)).size,pending:interested.filter(r=>approvalOf(r.assignment)==='pending').length,approved:approved.length,rejected:interested.filter(r=>approvalOf(r.assignment)==='rejected').length,awaitingAssignment:approved.filter(r=>deliveryOf(r.assignment)==='not-assigned').length,assigned:assigned.length,completed:completed.length};
 const benefits=new Map<string,{projectId:string;benefit:Benefit;conflict:boolean;count:number}>();
 responses.forEach(({projectId,assignment})=>{const b=validatedContributionBenefit(assignment);if(!b)return;const key=JSON.stringify([projectId,b.category,b.period.trim().toLowerCase()]);const previous=benefits.get(key);if(previous){previous.count++;if(previous.benefit.amount!==b.amount||previous.benefit.unit!==b.unit)previous.conflict=true;}else benefits.set(key,{projectId,benefit:b,conflict:false,count:1});});
 return {records,personas,confidence,responses,summary,benefits:[...benefits.values()],departments:[...new Set(records.map(r=>r.department.trim()||'—'))].sort((a,b)=>{const ai=(departmentOptions as readonly string[]).indexOf(a);const bi=(departmentOptions as readonly string[]).indexOf(b);return (ai<0?departmentOptions.length:ai)-(bi<0?departmentOptions.length:bi)||a.localeCompare(b);})};
}
export function learningDemand(records:PocRecord[],lang:'EN'|'BM'){
 const counts=new Map<string,number>();records.forEach(r=>{const topic=priorityLearning(r,lang);if(topic)counts.set(topic,(counts.get(topic)??0)+1);});return [...counts].map(([topic,count])=>({topic,count})).sort((a,b)=>b.count-a.count);
}
export function demoWorkforceRecords():PocRecord[]{
 return Array.from({length:24},(_,i)=>{
  const persona=personaIds[i%4];const domain=['IT Operations','Finance','Software Engineering','HR'][Math.floor(i/6)];const department=['Group IT & Digital (GITD)','Group Finance (GF)','Group Network Technology (GNT)','Group Human Capital Management (GHCM)'][Math.floor(i/6)];
  const record:PocRecord={id:'DEMO-'+(i+1),employeeName:'Employee '+String(i+1).padStart(2,'0'),created:`2026-${String(5+Math.floor(i/4)).padStart(2,'0')}-07T00:00:00Z`,persona,department,job:'POC participant',style:'',reviewRequired:i%5===0,reflection:i%10===0?'':'I want to explore practical AI use in my work.',context:{domain,skills:[],hours:0},learning:{},assignments:{},dimensions:{aiExposure:25+(i%4)*25,aiApplication:25+((i+1)%4)*25,criticalJudgement:25+((i+2)%4)*25,aiProblemSolving:25+((i+3)%4)*25}};
  const offers=employeeProjectOffers(record).filter(o=>o.primaryMatch);
  const offer=offers[i%offers.length];const stage=i%6;
  record.assignments[offer.projectId]={roleId:offer.roleId,response:stage===5?'declined':'accepted',approval:stage===0?'pending':stage===1?'rejected':'approved',confirmed:stage>=3&&stage<=4,delivery:stage===4?'completed':stage===3?'in-progress':'not-assigned',manager:stage>0?'Example supervisor':undefined};
  if(stage===4){const a=record.assignments[offer.projectId];const category:BenefitCategory=(['cost-saving','cost-avoidance','productivity','internalisation'] as const)[Math.floor(i/6)];a.benefit={category,description:benefitNames[category].EN+' · illustrative project evidence',amount:category==='productivity'?48:category==='internalisation'?2:category==='cost-saving'?3000:4000,unit:category==='productivity'?'hours':category==='internalisation'?'outputs':'RM',period:'Example measurement period',evidence:'Illustrative owner-approved evidence',owner:'Example project owner',status:'validated',validator:'Example validator'};}
  return record;
 });
}
export const workforceDemo=demoWorkforceRecords();
export const recommendedRole=(record:PocRecord)=>primaryContributionRole(record.review?.persona??record.persona);
export const projectName=(id:string)=>projects.find(p=>p.id===id)?.name??id;

// Count one retained profile per employee ID. Dates describe the selected cohort, not all TM assessments.
export function workforceParticipation(input:PocRecord[],period?:{start:string;end:string}){
 const a=workforceAnalytics(input);const counts=new Map<string,number>();let undated=0;const monthFormatter=new Intl.DateTimeFormat('en',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit'});
 a.records.forEach(r=>{const date=new Date(r.created);if(!Number.isFinite(date.getTime())){undated++;return;}const key=monthFormatter.formatToParts(date);const year=key.find(p=>p.type==='year')!.value;const m=key.find(p=>p.type==='month')!.value;counts.set(year+'-'+m,(counts.get(year+'-'+m)??0)+1);});
 if(period){const start=new Date(period.start+'-01T00:00:00Z');const end=new Date(period.end+'-01T00:00:00Z');if(Number.isFinite(start.getTime())&&Number.isFinite(end.getTime())&&end>=start){for(const key of counts.keys()){if(key<period.start||key>period.end)counts.delete(key);}for(const d=new Date(start);d<=end;d.setUTCMonth(d.getUTCMonth()+1)){const key=d.toISOString().slice(0,7);if(!counts.has(key))counts.set(key,0);}}}
 let cumulative=0;const months=[...counts].sort(([a],[b])=>a.localeCompare(b)).map(([month,count])=>({month,count,cumulative:cumulative+=count}));
 return {months,undated,departments:a.departments.map(label=>({label,count:a.records.filter(r=>(r.department.trim()||'—')===label).length}))};
}

export function workforceLearningSummary(input:PocRecord[],lang:'EN'|'BM'){
 const records=workforceAnalytics(input).records;
 const eligible=records.filter(r=>priorityLearning(r,lang)!==null);
 const topics=learningDemand(eligible,lang);
 return {total:eligible.length,coverage:records.length?eligible.length/records.length*100:0,mostRecommended:topics[0]??null,topics,personas:personaIds.map(id=>{const cohort=eligible.filter(r=>(r.review?.persona??r.persona)===id);return {id,count:cohort.length,topics:learningDemand(cohort,lang)};})};
}
