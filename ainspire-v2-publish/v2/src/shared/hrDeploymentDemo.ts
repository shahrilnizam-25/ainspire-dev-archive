import {projects,type PocRecord,type Assignment} from './poc';
import {isAiReady} from './divisionAnalytics';
import {primaryContributionRole} from './contributionRoles';
// Standalone deployment illustration; no browser records, assignments or benefits are written.
export function hrDeploymentDemo(records:PocRecord[]):PocRecord[]{
 return records.filter(isAiReady).slice(0,1000).map((r,i)=>{
  const role=primaryContributionRole(r.review?.persona??r.persona).roleIds[0];
  const choices=projects.filter(p=>p.roleIds.includes(role));const project=choices[i%choices.length];
  const approval=i<360?'pending':i<460?'rejected':'approved';
  const assigned=i>=640;const delivery=assigned?(i>=880?'completed':'in-progress'):'not-assigned';
  const assignment:Assignment={response:'accepted',roleId:role,approval,confirmed:assigned,delivery,manager:approval==='pending'?undefined:'POC supervisor',approvalReason:approval==='approved'?'POC sample · participation supported with agreed project time':approval==='rejected'?'POC sample · current workload prevents participation':undefined,decisionDate:approval==='pending'?undefined:'2026-10-08T00:00:00Z',projectOwner:assigned?'POC project owner':undefined};
  return {...r,employeeName:`POC Employee ${String(i+1).padStart(4,'0')}`,capacity:i%4===0?{hours:[2,4,6][i%3],confirmedBy:'POC supervisor · simulated confirmation',updated:'2026-10-08T00:00:00Z'}:undefined,assignments:{[project.id]:assignment}};
 });
}
