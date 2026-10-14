import {divisionOptions} from '../data/assessment';
import type {PocRecord} from './poc';
import {workforceAnalytics} from './workforceAnalytics';

export const reportingDivisions=divisionOptions;
export const otherDepartmentsFilter='__other_departments';
export const readinessDimensions=['aiExposure','aiApplication','criticalJudgement','aiProblemSolving'] as const;
// POC screening for guided workplace use; persona, confidence and aspiration add no points.
export function isAiReady(record:PocRecord){
 const scores=readinessDimensions.map(d=>record.dimensions[d]);
 if(scores.some(v=>typeof v!=='number'||![25,50,75,100].includes(v)))return false;
 if(record.reviewRequired&&!record.review)return false;
 return scores.reduce((sum,v)=>sum+v,0)/4>=75&&record.dimensions.aiApplication>=75&&record.dimensions.criticalJudgement>=75;
}
export function isReportingDivision(department:string){return (reportingDivisions as readonly string[]).includes(department.trim());}
export function filterDivision(records:PocRecord[],division:string){
 return workforceAnalytics(records).records.filter(r=>division==='all'||(division===otherDepartmentsFilter?!isReportingDivision(r.department):r.department.trim()===division));
}
export function divisionDashboardSummary(input:PocRecord[]){
 const a=workforceAnalytics(input);const total=a.records.length;const ready=a.records.filter(isAiReady).length;
 const divisions=reportingDivisions.map(name=>{const records=a.records.filter(r=>r.department.trim()===name);const n=records.length;return {name,count:n,ready:records.filter(isAiReady).length,builder:records.filter(r=>(r.review?.persona??r.persona)==='builder').length};}).sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name));
 const maximum=Math.max(0,...a.personas.map(p=>p.count));
 return {total,ready,readyShare:total?ready/total*100:0,dominant:maximum?a.personas.filter(p=>p.count===maximum):[],divisions,active:divisions.filter(d=>d.count>0).length,other:total-divisions.reduce((sum,d)=>sum+d.count,0)};
}

// Each capability uses only valid answers in the deduplicated selected cohort.
export function workforceCapabilityAverages(input:PocRecord[]){
 const records=workforceAnalytics(input).records;
 return readinessDimensions.map(dimension=>{
  const scores=records.map(r=>r.dimensions[dimension]).filter((v):v is number=>typeof v==='number'&&[25,50,75,100].includes(v));
  return {dimension,count:scores.length,average:scores.length?scores.reduce((sum,v)=>sum+v,0)/scores.length:null};
 });
}
