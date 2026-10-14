import type {PocRecord} from './poc';
import {workforceAnalytics,workforceLearningSummary} from './workforceAnalytics';
import {reportingDivisions} from './divisionAnalytics';

export const learningMonths=Array.from({length:10},(_,i)=>`2026-${String(i+1).padStart(2,'0')}`);
export const demoLearningStarts=[90,120,180,220,270,320,380,460,740,820];
export const demoLearningCompletions=[40,70,110,150,190,230,280,350,570,710];
const demoDivisions=[['GITD',390,310],['unifi',360,270],['TM One',330,250],['TM Global',300,225],['BiTech',290,215],['TM R&D',270,200],['GNT',260,195],['GF',250,185],['GHCM',240,180],['GIS',230,170],['GS',220,160],['GP',200,150],['LSIP',160,120],['GIA',100,70]] as const;
// Distribute each month across remaining division totals, preserving both margins.
export function learningMatrix(rows:number[],columns:number[]){
 if(rows.reduce((a,b)=>a+b,0)!==columns.reduce((a,b)=>a+b,0))throw Error('Learning totals must reconcile.');
 const remaining=[...rows];const matrix=rows.map(()=>columns.map(()=>0));
 columns.forEach((count,m)=>{
  const total=remaining.reduce((a,b)=>a+b,0);const quotas=remaining.map(n=>total?n*count/total:0);
  const values=quotas.map(Math.floor);const extra=count-values.reduce((a,b)=>a+b,0);
  quotas.map((q,i)=>({i,fraction:q-values[i]})).sort((a,b)=>b.fraction-a.fraction||a.i-b.i).slice(0,extra).forEach(({i})=>values[i]++);
  values.forEach((v,i)=>{matrix[i][m]=v;remaining[i]-=v;});
 });return matrix;
}
const startMatrix=learningMatrix(demoDivisions.map(d=>d[1]),demoLearningStarts);
const completionMatrix=learningMatrix(demoDivisions.map(d=>d[2]),demoLearningCompletions);
export const employeeLearningDemo=demoDivisions.map(([short,started,completed],i)=>({division:reportingDivisions.find(d=>d===short||d.endsWith(`(${short})`))??short,short,started,completed,months:learningMonths.map((month,m)=>({month,started:startMatrix[i][m],completed:completionMatrix[i][m]}))}));
export function employeeLearningProgress(input:PocRecord[]){
 const records=workforceAnalytics(input).records;
 const eligible=records.filter(r=>workforceLearningSummary([r],'EN').total>0);
 const started=eligible.filter(r=>['started','completed'].includes(r.development?.status??'')).length;
 const completed=eligible.filter(r=>r.development?.status==='completed').length;
 return {eligible:eligible.length,started,completed,participation:eligible.length?started/eligible.length*100:null,completion:started?completed/started*100:null};
}
