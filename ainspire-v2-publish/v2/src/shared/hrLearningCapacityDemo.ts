import type {PocRecord} from './poc';
import {employeeLearningDemo} from './employeeLearningInsights';
// Explicit illustrative learning/capacity records, never persisted or used as project assignments.
export function hrLearningCapacityDemo(records:PocRecord[]):PocRecord[]{
 const positions=new Map<string,number>();let completedIndex=0;
 return records.map((record,index)=>{
  const position=positions.get(record.department)??0;positions.set(record.department,position+1);
  const totals=employeeLearningDemo.find(row=>row.division===record.department);
  const status=totals&&position<totals.completed?'completed':totals&&position<totals.started?'started':'recommended';
  const verified=status==='completed'&&completedIndex++%10<7;
  const available=index%4===0;
  return {...record,development:{status,topic:'Persona-aligned AI learning',evidence:status==='completed'?'POC sample · illustrative course completion and practical exercise reference':'',updated:'2026-10-10T00:00:00Z',recordedBy:'POC learning coordinator',basis:verified?'verified':'self-reported',capacityHours:available?[2,4,6][index%3]:undefined,capacityConfirmedBy:available?'POC supervisor · simulated confirmation':undefined}};
 });
}
