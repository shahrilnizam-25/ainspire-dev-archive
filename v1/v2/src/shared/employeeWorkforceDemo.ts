import {departmentOptions} from '../data/assessment';
import type {PocRecord} from './poc';
import {workforceDemo} from './workforceAnalytics';
export const workforceTarget=16720;
export const mockAssessmentTotal=5603;
export const mockAiReadyTotal=4258; // 76.0% illustrative readiness, not a measured TM result.
// Explicit mock cohort sizes keep highlighted examples and filtered charts consistent.
// GITD: 503 assessed; GS: 328/400 ready; GNT: 152/400 Builders.
const divisionSizes=[491, 472, 459, 421, 238, 447, 400, 503, 433, 416, 385, 367, 400, 171];
export const divisionMonthlyCounts=[[15, 21, 27, 31, 36, 42, 48, 59, 125, 87], [15, 21, 26, 32, 35, 40, 46, 57, 120, 80], [16, 19, 25, 29, 34, 39, 45, 57, 117, 78], [13, 18, 23, 27, 31, 36, 41, 51, 107, 74], [7, 10, 13, 15, 17, 20, 23, 33, 60, 40], [14, 19, 24, 28, 33, 38, 48, 54, 113, 76], [13, 17, 22, 25, 33, 34, 39, 48, 101, 68], [16, 21, 27, 32, 37, 43, 49, 61, 131, 86], [13, 18, 28, 27, 32, 37, 42, 52, 110, 74], [13, 21, 23, 26, 31, 35, 41, 50, 105, 71], [12, 16, 21, 24, 28, 37, 37, 46, 99, 65], [16, 15, 20, 23, 27, 31, 36, 44, 93, 62], [12, 17, 22, 25, 34, 34, 39, 48, 101, 68], [5, 7, 9, 16, 12, 14, 16, 20, 43, 29]];
const readyCounts=[396, 371, 365, 326, 163, 342, 302, 405, 323, 323, 271, 248, 328, 95];
const builderCounts=[182, 166, 171, 152, 69, 166, 152, 187, 143, 124, 131, 121, 149, 48];
const explorerCounts=[143, 141, 133, 124, 78, 130, 114, 146, 134, 135, 117, 113, 116, 57];
const strategistCounts=[119, 118, 111, 104, 65, 108, 96, 121, 111, 112, 98, 95, 96, 47];
const slots=divisionSizes.flatMap((count,division)=>Array.from({length:count},(_,index)=>({division,index})));
// Shared assessment illustration for Employee and HR dashboards. Never persisted.
export const employeeWorkforceDemo:PocRecord[]=Array.from({length:mockAssessmentTotal},(_,i)=>{
 const base=workforceDemo[i%workforceDemo.length];
 const {division,index}=slots[(i*17)%mockAssessmentTotal];
 const ready=index<readyCounts[division];
 // Varied valid answer patterns illustrate different strengths and learning needs.
 // Every guided-use example passes both safety floors; each learning example misses one.
 const readyScores=[32,18,16,18].map((share,d)=>((i*37+d*23)%100)<share?100:75);
 const learningPatterns=[[75,50,75,50],[50,75,50,75],[75,50,50,75],[50,50,75,75]];
 const scores=ready?readyScores:learningPatterns[index%learningPatterns.length];
 const dimensions={...base.dimensions,aiExposure:scores[0],aiApplication:scores[1],criticalJudgement:scores[2],aiProblemSolving:scores[3]};
 const persona=index<builderCounts[division]?'builder':index<builderCounts[division]+explorerCounts[division]?'explorer':index<builderCounts[division]+explorerCounts[division]+strategistCounts[division]?'strategist':'visionary';
 // Assign each profile a month from the same division/month counts used in the preview.
 const monthSlot=(index+division*31)%divisionSizes[division];
 let month=1,boundary=divisionMonthlyCounts[division][0];
 while(monthSlot>=boundary&&month<10){boundary+=divisionMonthlyCounts[division][month];month++;}
 return {...base,id:'WORKFORCE-MOCK-'+(i+1),employeeName:undefined,persona,dimensions,department:departmentOptions[division],created:`2026-${String(month).padStart(2,'0')}-${String(1+i%7).padStart(2,'0')}T00:00:00Z`,reviewRequired:!ready&&i%7===0,reflection:!ready&&i%14===0?'':'Illustrative reflection',review:undefined,assignments:{},learning:{}};
});

// Contribution examples are a separate small cohort, never replicated across 5,603 profiles.
export function workforceDashboardCohorts(source:'example'|'browser',stored:PocRecord[],department='all'){
 const filter=(records:PocRecord[])=>records.filter(r=>department==='all'||(r.department.trim()||'—')===department);
 return {assessments:filter(source==='example'?employeeWorkforceDemo:stored),contributions:filter(source==='example'?workforceDemo.map((r,i)=>({...r,assignments:Object.fromEntries(Object.entries(r.assignments).map(([id,a])=>[id,{...a,approvalReason:a.approval==='rejected'?'Current workload prevents participation':a.approval==='approved'?'Supported with agreed project time':undefined,decisionDate:a.approval!=='pending'?'2026-10-08T00:00:00Z':undefined,projectOwner:a.confirmed?'POC project owner':undefined}])),development:i%4===3?undefined:{status:(i%4===0?'completed':i%4===1?'started':'recommended') as 'completed'|'started'|'recommended',topic:'Practical AI use',evidence:i%4===0?'Illustrative learning reflection and exercise reference':'',updated:'2026-10-08T00:00:00Z',recordedBy:'POC learning coordinator',basis:(i%8===0?'verified':'self-reported') as 'verified'|'self-reported',capacityHours:i%3===0?2:undefined,capacityConfirmedBy:i%3===0?'POC supervisor':undefined}})):stored)};
}
