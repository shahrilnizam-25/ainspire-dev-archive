import type {PocRecord,PersonaId} from './poc';
import {personaIds,workforceAnalytics} from './workforceAnalytics';
import {skillGapSummary} from './skillGaps';
export type UpskillingPersona=PersonaId|'all';
export function hrUpskillingGroups(input:PocRecord[],persona:UpskillingPersona){
 const records=workforceAnalytics(input).records;
 return (persona==='all'?personaIds:[persona]).map(id=>{
  const cohort=records.filter(r=>(r.review?.persona??r.persona)===id);
  const gaps=skillGapSummary(cohort);
  return {id,records:cohort,gaps};
 }).filter(group=>group.records.length>0);
}
// Include every input used by the draft so changed evidence cannot display an old plan.
export function hrUpskillingEvidenceKey(records:PocRecord[],scope:string){
 return JSON.stringify([scope,[...records].sort((a,b)=>a.id.localeCompare(b.id)).map(r=>[r.id,r.employeeName,r.department,r.persona,r.reviewRequired,r.review,r.dimensions,r.reflection,r.learning,r.development])]);
}
