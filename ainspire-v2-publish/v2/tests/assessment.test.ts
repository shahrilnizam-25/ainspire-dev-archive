import {hrDeploymentDemo} from '../src/shared/hrDeploymentDemo';
import {hrLearningCapacityDemo} from '../src/shared/hrLearningCapacityDemo';
import {skillGapSummary} from '../src/shared/skillGaps';
import {employeeLearningDemo,employeeLearningProgress,demoLearningStarts,demoLearningCompletions} from '../src/shared/employeeLearningInsights';
import {hrUpskillingGroups,hrUpskillingEvidenceKey} from '../src/shared/hrUpskilling';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { assessmentQuestionsByLang, ASSESSMENT_VERSION } from '../src/data/assessment';
import { adaptiveDecision, calculateReadinessScores, validateAnswers } from '../src/shared/assessmentLogic';
import {divisionMonthlyCounts,employeeWorkforceDemo,workforceDashboardCohorts} from '../src/shared/employeeWorkforceDemo';
test('HR persona drafts reconcile selected cohorts and honour reviewed personas',()=>{
 const gitd=employeeWorkforceDemo.filter(r=>r.department==='Group IT & Digital (GITD)');
 assert.deepEqual(hrUpskillingGroups(gitd,'all').map(g=>[g.id,g.records.length]),[['explorer',146],['builder',187],['strategist',121],['visionary',49]]);
 assert.equal(hrUpskillingGroups(gitd,'explorer')[0].records.length,146);
 assert.deepEqual(hrUpskillingGroups([],'all'),[]);
 const record={...gitd[0],id:'reviewed-persona',persona:'explorer',review:{persona:'builder' as const,reason:'Practical evidence',reviewer:'Supervisor'}};
 assert.deepEqual(hrUpskillingGroups([record,record],'explorer'),[]);
 assert.equal(hrUpskillingGroups([record,record],'builder')[0].records.length,1);
});
test('HR drafts exclude unresolved or missing evidence from confirmed gaps',()=>{
 const base={...employeeWorkforceDemo[0],id:'pending',persona:'explorer',review:undefined,reviewRequired:true,dimensions:{aiExposure:25,aiApplication:25,criticalJudgement:25,aiProblemSolving:25}};
 const group=hrUpskillingGroups([base],'explorer')[0];
 assert.equal(group.gaps.clarification,1);
 assert.equal(group.gaps.priority,undefined);
 const reviewed={...base,review:{persona:'explorer' as const,reason:'Evidence clarified',reviewer:'Supervisor'}};
 assert.equal(hrUpskillingGroups([reviewed],'explorer')[0].gaps.rows.every(row=>row.gaps.length===1),true);
 assert.equal(hrUpskillingGroups([{...reviewed,dimensions:{}}],'explorer')[0].gaps.clarification,1);
});
test('HR draft identity changes with evidence and selection without mutating profiles',()=>{
 const records=employeeWorkforceDemo.slice(0,2);const before=JSON.stringify(records);
 const key=hrUpskillingEvidenceKey(records,'GITD:explorer:example:EN');
 assert.equal(key,hrUpskillingEvidenceKey([...records].reverse(),'GITD:explorer:example:EN'));
 assert.notEqual(key,hrUpskillingEvidenceKey(records,'GITD:builder:example:EN'));
 assert.notEqual(key,hrUpskillingEvidenceKey([{...records[0],reflection:'New learning need'},records[1]],'GITD:explorer:example:EN'));
 assert.notEqual(key,hrUpskillingEvidenceKey([{...records[0],learning:{course:true}},records[1]],'GITD:explorer:example:EN'));
 hrUpskillingGroups(records,'all');assert.equal(JSON.stringify(records),before);
});
test('learning POC division and month counts reconcile and completions follow starts',()=>{
 assert.equal(employeeLearningDemo.length,14);
 assert.equal(employeeLearningDemo.reduce((s,d)=>s+d.started,0),3600);
 assert.equal(employeeLearningDemo.reduce((s,d)=>s+d.completed,0),2700);
 employeeLearningDemo.forEach(d=>{
  assert.ok(reportingDivisions.includes(d.division as typeof reportingDivisions[number]));
  assert.equal(d.months.reduce((s,m)=>s+m.started,0),d.started);
  assert.equal(d.months.reduce((s,m)=>s+m.completed,0),d.completed);
  let started=0,completed=0;d.months.forEach(m=>{started+=m.started;completed+=m.completed;assert.ok(completed<=started);});
 });
 demoLearningStarts.forEach((n,i)=>assert.equal(employeeLearningDemo.reduce((s,d)=>s+d.months[i].started,0),n));
 demoLearningCompletions.forEach((n,i)=>assert.equal(employeeLearningDemo.reduce((s,d)=>s+d.months[i].completed,0),n));
});
test('browser learning progress deduplicates and includes completed learners as started',()=>{
 const base={...workforceDemo[0],id:'learning-employee'};
 const completed={...base,development:{status:'completed' as const,topic:'AI foundations',evidence:'Course reflection',updated:'2026-10-01',recordedBy:'Employee',basis:'self-reported' as const}};
 const data=employeeLearningProgress([base,completed]);
 assert.equal(data.eligible,1);assert.equal(data.started,1);assert.equal(data.completed,1);assert.equal(data.completion,100);
 assert.equal(employeeLearningProgress([]).completion,null);
});
import {workforceDemo,workforceAnalytics,workforceParticipation} from '../src/shared/workforceAnalytics';
import {workforceCapabilityAverages,isAiReady,divisionDashboardSummary,filterDivision,otherDepartmentsFilter,reportingDivisions} from '../src/shared/divisionAnalytics';
test('guided-use readiness checks complete governed capability scores, safety floors and resolved clarification',()=>{
 const ready={...workforceDemo[0],reviewRequired:false,dimensions:{aiExposure:75,aiApplication:75,criticalJudgement:75,aiProblemSolving:75}};
 assert.ok(isAiReady(ready));
 assert.ok(!isAiReady({...ready,dimensions:{...ready.dimensions,aiExposure:50}}));
 assert.ok(!isAiReady({...ready,dimensions:{aiExposure:100,aiApplication:50,criticalJudgement:100,aiProblemSolving:100}}));
 assert.ok(!isAiReady({...ready,dimensions:{aiExposure:100,aiApplication:100,criticalJudgement:50,aiProblemSolving:100}}));
 assert.ok(!isAiReady({...ready,dimensions:{aiApplication:100,criticalJudgement:100,aiProblemSolving:100}}));
 assert.ok(!isAiReady({...ready,dimensions:{...ready.dimensions,aiExposure:999}}));
 assert.ok(!isAiReady({...ready,reviewRequired:true}));
 assert.ok(isAiReady({...ready,reviewRequired:true,review:{persona:'explorer',reason:'Clarified',reviewer:'Supervisor'}}));
 assert.ok(isAiReady({...ready,persona:'visionary',dimensions:{...ready.dimensions,growthAspiration:25,aiContributionStyle:25}}));
});
test('division reporting reconciles all records, handles ties and applies filters without dropping other departments',()=>{
 assert.equal(reportingDivisions.length,14);const s=divisionDashboardSummary(employeeWorkforceDemo);
 assert.equal(s.ready,4258);assert.equal(s.readyShare.toFixed(1),'76.0');const gitd=s.divisions.find(d=>d.name==='Group IT & Digital (GITD)')!;const gs=s.divisions.find(d=>d.name==='Group Strategy (GS)')!;const gnt=s.divisions.find(d=>d.name==='Group Network Technology (GNT)')!;assert.equal(gitd.count,503);assert.equal(new Set(s.divisions.map(d=>d.count)).size,13);assert.equal(s.divisions.at(-1)?.count,171);assert.equal(gs.ready/gs.count,.82);assert.equal(gnt.builder/gnt.count,.38);assert.equal(s.divisions[0].name,gitd.name);assert.ok(s.divisions.every(d=>d.name===gs.name||d.ready/d.count<.82));assert.ok(s.divisions.every(d=>d.name===gnt.name||d.builder/d.count<.38));assert.equal(s.divisions.reduce((n,d)=>n+d.ready,0),4258);
 assert.equal(s.total,5603);assert.equal(s.active,14);assert.equal(s.divisions.length,14);assert.equal(s.other,0);
 assert.equal(s.divisions.reduce((sum,d)=>sum+d.count,0)+s.other,5603);
 assert.equal(filterDivision(employeeWorkforceDemo,otherDepartmentsFilter).length,s.other);
 const legacy={...employeeWorkforceDemo[0],id:'LEGACY-MMU',department:'MMU'};const retained=divisionDashboardSummary([...employeeWorkforceDemo,legacy]);assert.equal(retained.other,1);assert.equal(retained.total,5604);assert.deepEqual(filterDivision([legacy],otherDepartmentsFilter),[legacy]);
 const selected=filterDivision(employeeWorkforceDemo,'Group IT & Digital (GITD)');assert.ok(selected.length>0);assert.equal(divisionDashboardSummary(selected).active,1);
 const tie=divisionDashboardSummary([{...workforceDemo[0],id:'A',persona:'explorer'},{...workforceDemo[0],id:'B',persona:'builder'}]);assert.equal(tie.dominant.length,2);
 const empty=divisionDashboardSummary([]);assert.equal(empty.readyShare,0);assert.equal(empty.active,0);assert.deepEqual(empty.dominant,[]);
 assert.equal(divisionDashboardSummary([employeeWorkforceDemo[0],employeeWorkforceDemo[0]]).total,1);
});
test('HR shares assessment examples without multiplying contribution records; department and browser sources stay separate',()=>{
 const example=workforceDashboardCohorts('example',[]);
 assert.equal(example.assessments.length,5603);assert.equal(example.contributions.length,24);
 assert.equal(workforceAnalytics(example.assessments).responses.length,0);
 assert.deepEqual(workforceAnalytics(example.contributions).summary,workforceAnalytics(workforceDemo).summary);
 const department='Group IT & Digital (GITD)';const filtered=workforceDashboardCohorts('example',[],department);
 assert.ok(filtered.assessments.length>0);assert.equal(filtered.contributions.length,6);
 assert.ok([...filtered.assessments,...filtered.contributions].every(r=>r.department===department));
 const browser=workforceDashboardCohorts('browser',[workforceDemo[0]],department);
 assert.deepEqual(browser.assessments,[workforceDemo[0]]);assert.deepEqual(browser.contributions,[workforceDemo[0]]);
 assert.deepEqual(workforceDashboardCohorts('browser',[]),{assessments:[],contributions:[]});
 assert.equal(employeeWorkforceDemo.length,5603);
});
function profile(ids: string[], lang: 'EN' | 'BM' = 'EN') {return assessmentQuestionsByLang[lang].map((q,i) => {const o=q.options.find(o=>o.id===ids[i])!; return {questionId:q.id,questionText:q.text,dimension:q.dimension,selectedOption:o.id,selectedText:o.text,score:o.score};});}
test('six bilingual questions, same governed options and scores',()=>{assert.equal(assessmentQuestionsByLang.EN.length,6);assert.equal(assessmentQuestionsByLang.BM.length,6);assert.deepEqual(profile(['B','C','C','C','C','C']).map(a=>[a.dimension,a.selectedOption,a.score]),profile(['B','C','C','C','C','C'],'BM').map(a=>[a.dimension,a.selectedOption,a.score]));});
test('contribution preference has no effect on overall maturity',()=>{const outcomes=['A','B','C','D'].map(style=>calculateReadinessScores(profile(['C','C','C','C',style,'C'])));assert.equal(new Set(outcomes.map(o=>o.overallReadiness)).size,1);assert.ok(outcomes.every(o=>!('aiContributionStyle' in o.dimensionScores)));assert.deepEqual(outcomes.map(o=>o.persona),['builder','builder','strategist','visionary']);});
test('low and high maturity can share a persona; persona is not a score band',()=>{assert.equal(calculateReadinessScores(profile(['B','C','C','B','B','B'])).persona,'builder');assert.equal(calculateReadinessScores(profile(['D','D','D','D','B','D'])).persona,'builder');});
test('one governed prompt for each ambiguity category; consistent profiles bypass',()=>{assert.equal(adaptiveDecision(profile(['D','D','A','D','B','D'])).category,'Capability');assert.equal(adaptiveDecision(profile(['B','B','C','B','B','B'])).category,'Capability');assert.equal(adaptiveDecision(profile(['B','B','D','D','D','D'])).category,'Contribution');assert.equal(adaptiveDecision(profile(['B','A','B','B','A','D'])).category,'Growth');for(const ids of [['A','A','B','A','A','A'],['C','C','C','C','B','C'],['D','D','D','D','C','D'],['D','D','D','D','D','D']])assert.equal(adaptiveDecision(profile(ids)).required,false);});
test('majority of all option combinations proceed directly',()=>{let direct=0;for(let n=0;n<4096;n++){let k=n;const ids=Array.from({length:6},()=>{const id='ABCD'[k%4];k=Math.floor(k/4);return id;});if(!adaptiveDecision(profile(ids)).required)direct++;}assert.ok(direct>2048,`${direct}/4096 bypass reflection`);console.log(`Direct pathway: ${direct}/4096 option combinations (not a measured user population).`);});
test('server reconstructs canonical evidence, rejects duplicate/missing/old answers',()=>{const a=profile(['C','C','C','C','C','C']);assert.equal(validateAnswers(a.map(a=>({...a,score:999,dimension:'fake',selectedText:'fake'})),'EN')[0].score,3);assert.throws(()=>validateAnswers([...a,...a,...a,a[0],a[1]],'EN'));assert.throws(()=>validateAnswers([...a.slice(0,5),a[0]],'EN'));assert.throws(()=>validateAnswers(a.slice(0,5),'EN'));assert.throws(()=>validateAnswers(a.map(a=>({...a,selectedOption:'X'})),'EN'));});
test('real API rejects 20 answers and accepts six; reflection and language preserve baseline',async()=>{
 const {POST}=await import('../app/api/classify/route');const a=profile(['D','D','A','D','B','D']);const base={answers:a,assessmentVersion:ASSESSMENT_VERSION,department:'Finance',role:'Business analyst',lang:'EN'};
 const send=async(b:unknown)=>POST(new Request('https://ainspire.test/api/classify',{method:'POST',body:JSON.stringify(b)}));
 assert.equal((await send({...base,answers:[...a,...a,...a,a[0],a[1]]})).status,400);
 const response=await send({...base,reflection:{category:'Capability',text:'I used AI to draft a report and checked it against the source figures.'}});assert.equal(response.status,200);const en=await response.json() as any;assert.equal(en.engine,'deterministic');assert.equal(en.adaptiveReflection.provided,true);assert.ok(en.reasoning.includes('additional evidence'));
 const bm=await (await send({...base,lang:'BM'})).json() as any;assert.equal(en.persona,bm.persona);assert.equal(en.overallReadiness,bm.overallReadiness);assert.deepEqual(en.dimensionScores,bm.dimensionScores);
 assert.equal((await send({...base,reflection:{category:'Growth',text:'wrong category'}})).status,400);
 assert.equal((await send({...base,reflection:{category:'Capability',text:'x'.repeat(1201)}})).status,400);
});
test('learning videos remain linked without API credentials and on quota failures',async()=>{
 const {getLearningVideos}=await import('../server/youtube');const answers=profile(['B','B','C','B','A','B']);
 const curated=await getLearningVideos('explorer',answers,'EN');assert.equal(curated.length,2);assert.ok(curated.every(v=>/^https:\/\/www.youtube.com\/watch\?v=[\w-]{11}$/.test(v.videoUrl)&&v.thumbnailUrl.startsWith('/api/youtube-thumbnail/')&&v.videoSource==='curated'));
 const original=globalThis.fetch;process.env.YOUTUBE_API_KEY='test-primary';process.env.YOUTUBE_API_KEY_BACKUP='test-backup';let count=0;
 globalThis.fetch=async()=>{count++;return count===1?new Response('',{status:403}):Response.json({items:[{id:{videoId:'short123'},snippet:{title:'Invalid short ID'}},{id:{videoId:'123456789ab'},snippet:{title:'AI learning tutorial',channelTitle:'Test channel'}}]});};
 try {const videos=await getLearningVideos('explorer',answers,'EN');assert.equal(count,2);assert.equal(videos.length,1);assert.equal(videos[0].videoSource,'youtube-api');globalThis.fetch=async()=>new Response('',{status:403});assert.equal((await getLearningVideos('explorer',answers,'BM'))[0].videoSource,'curated');}finally{globalThis.fetch=original;delete process.env.YOUTUBE_API_KEY;delete process.env.YOUTUBE_API_KEY_BACKUP;}
});
test('reference deck conflicting leader and hidden builder receive a single targeted reflection',()=>{
 const leader=adaptiveDecision(profile(['B','B','D','D','D','D']));assert.equal(leader.required,true);assert.equal(leader.category,'Contribution');assert.ok(leader.prompt?.EN);
 const hidden=adaptiveDecision(profile(['B','B','B','B','B','C']));assert.equal(hidden.required,true);assert.equal(hidden.category,'Capability');assert.ok(hidden.prompt?.BM);
});

 test('revisiting and changing early answers preserves all six without duplicates', async () => {
  const {saveAssessmentAnswer}=await import('../src/shared/assessmentNavigation');
  const original=profile(['A','B','C','D','C','B']);
  const changed=profile(['D','B','C','D','C','B'])[0];
  const revised=saveAssessmentAnswer(assessmentQuestionsByLang.EN, original, changed);
  assert.equal(revised.length,6); assert.equal(revised[0].selectedOption,'D');
  assert.deepEqual(revised.slice(1),original.slice(1));
  assert.deepEqual(saveAssessmentAnswer(assessmentQuestionsByLang.EN,revised,changed),revised);
  assert.equal(validateAnswers(revised,'EN').length,6);
  const partial=saveAssessmentAnswer(assessmentQuestionsByLang.EN,original.slice(0,3),changed);
  assert.equal(partial.length,3); assert.equal(partial[2].selectedOption,'C');
 });

test('video search targets capability gaps, exposes source and uses relevant playable-video filters', async () => {
 const {getLearningVideos}=await import('../server/youtube');
 const answers=profile(['D','D','A','B','C','A']);
 const curated=await getLearningVideos('strategist',answers,'EN');
 assert.equal(curated[0].searchStatus,'curated-no-key');
 assert.ok(curated[0].searchQuery.includes('responsible AI'));
 assert.ok(!curated[0].searchQuery.includes('AI use case'));
 assert.ok(!curated[0].searchQuery.includes('learning pathway'));
 assert.equal(new URL(curated[0].searchUrl).searchParams.get('search_query'),curated[0].searchQuery);
 const softwareContext=await getLearningVideos('builder',answers,'EN',{role:'Software Engineer',department:'Group IT & Digital (GITD)'});
 const hrContext=await getLearningVideos('builder',answers,'EN',{role:'HR Business Partner',department:'Group Human Capital Management (GHCM)'});
 assert.ok(softwareContext[0].searchQuery.includes('spec-driven development'));
 assert.ok(softwareContext[0].searchQuery.includes('responsible AI'));
 assert.ok(hrContext[0].searchQuery.includes('hr business partners'));
 assert.notEqual(softwareContext[0].searchQuery,hrContext[0].searchQuery);
 assert.ok(softwareContext[0].relevanceStatement.includes('Software Engineer'));
 const oldContextKey=process.env.YOUTUBE_API_KEY;const oldContextFetch=globalThis.fetch;
 process.env.YOUTUBE_API_KEY='context-test';
 globalThis.fetch=async(input)=>{const url=new URL(String(input));assert.equal(url.searchParams.get('maxResults'),'10');assert.ok(url.searchParams.get('q')?.includes('hr business partners'));return Response.json({items:[
  {id:{videoId:'abcdefghijk'},snippet:{title:'Generative AI for Everyone',channelTitle:'General Learning'}},
  {id:{videoId:'bcdefghijkl'},snippet:{title:'AI in HR workforce planning',channelTitle:'HR Learning'}},
  {id:{videoId:'cdefghijklm'},snippet:{title:'AI for HR recruiting and employee relations',channelTitle:'HR Learning'}},
  {id:{videoId:'defghijklmn'},snippet:{title:'IBM Replaces HR Department with AI!',channelTitle:'Clickbait Learning'}},
 ]});};
 try{const contextual=await getLearningVideos('builder',answers,'EN',{role:'HR Business Partner',department:'Group Human Capital Management (GHCM)'});assert.equal(contextual.length,2);assert.ok(contextual.every(v=>/\bHR\b/i.test(v.videoTitle)));assert.ok(contextual.every(v=>!v.videoTitle.includes('Replaces HR')));}finally{globalThis.fetch=oldContextFetch;if(oldContextKey===undefined)delete process.env.YOUTUBE_API_KEY;else process.env.YOUTUBE_API_KEY=oldContextKey;}
 const original=globalThis.fetch; process.env.YOUTUBE_API_KEY='test-only';
 globalThis.fetch=async(input)=>{
  const url=new URL(String(input)); assert.equal(url.searchParams.get('order'),'relevance');
  assert.equal(url.searchParams.get('type'),'video'); assert.equal(url.searchParams.get('videoEmbeddable'),'true');
  assert.equal(url.searchParams.get('videoSyndicated'),'true');
  assert.equal(url.searchParams.get('q'),curated[0].searchQuery);
  return Response.json({items:[{id:{videoId:'abcdefghijk'},snippet:{title:'Responsible AI practical course',channelTitle:'Test'}}]});
 };
 try {
  const live=await getLearningVideos('strategist',answers,'EN'); assert.equal(live[0].searchStatus,'live');
  assert.equal(live[0].videoSource,'youtube-api');
  globalThis.fetch=async()=>{throw new Error('network failure');};
  const fallback=await getLearningVideos('strategist',answers,'BM'); assert.equal(fallback[0].searchStatus,'curated-fallback');
  assert.ok(fallback[0].relevanceStatement.includes('Pertimbangan'));
 } finally {globalThis.fetch=original;delete process.env.YOUTUBE_API_KEY;}
});

import {projects,roles,matchOffers,learningPlan,hoursSaved,canValidate} from '../src/shared/poc';
test('POC catalogue has eight initiatives and seven governed role families',()=>{assert.equal(projects.length,8);assert.equal(roles.length,7);assert.equal(new Set(projects.map(p=>p.id)).size,8);for(const p of projects){assert.equal(p.roleIds.length,3);assert.ok(p.roleIds.every(id=>roles.some(r=>r.id===id)));}});
test('matching requires capability, domain, skills and availability; persona does not grant eligibility',()=>{
 const high={aiApplication:100,aiProblemSolving:100,criticalJudgement:100,aiExposure:100,growthAspiration:100};
 const empty=matchOffers('visionary',high,'Adoption champion',{domain:'',skills:[],hours:0});assert.equal(empty.length,8);assert.ok(empty.every(o=>!o.eligible));
 const qualified=matchOffers('builder',high,'Solution builder',{domain:'Data',skills:['Development','Integration'],hours:2});assert.equal(qualified[0].projectId,'dataops');assert.equal(qualified[0].eligible,true);
 const weak=matchOffers('builder',{...high,aiApplication:25},'Solution builder',{domain:'Data',skills:['Development','Integration'],hours:2});assert.equal(weak.find(o=>o.projectId==='dataops')!.eligible,false);
 const explorer=matchOffers('explorer',high,'AI adopter',{domain:'Finance',skills:['Data preparation'],hours:2});assert.equal(explorer.find(o=>o.projectId==='saring')!.roleId,'R2');assert.equal(explorer.find(o=>o.projectId==='saring')!.eligible,true);
});
test('learning connects weakest capability to the selected role and project',()=>{
 const dimensions={aiApplication:100,criticalJudgement:25,aiProblemSolving:75};const offers=matchOffers('builder',dimensions,'Solution builder',{domain:'Data',skills:['Development'],hours:2});
 const en=learningPlan(offers[0],dimensions,'EN'),bm=learningPlan(offers[0],dimensions,'BM');assert.equal(en.length,3);assert.match(en[0].text,/validation/);assert.deepEqual(en.map(s=>s.id),bm.map(s=>s.id));assert.notEqual(en[0].text,bm[0].text);
});
test('value requires confirmed assignment, submission and evidence; negative improvement stays negative',()=>{
 const outcome={deliverable:'Reviewed pilot',baseline:20,after:14,volume:1000,evidence:'Ticket sample, 1–7 Oct',quality:'Accuracy maintained',status:'submitted' as const};assert.equal(hoursSaved(outcome),100);assert.equal(hoursSaved({...outcome,after:26}),-100);assert.equal(hoursSaved({...outcome,volume:NaN}),null);
 const a={response:'accepted' as const,roleId:'R2' as const,confirmed:true,outcome};assert.equal(canValidate(a),true);assert.equal(canValidate({...a,confirmed:false}),false);assert.equal(canValidate({...a,outcome:{...outcome,evidence:''}}),false);assert.equal(canValidate({...a,outcome:{...outcome,quality:''}}),false);assert.equal(canValidate({...a,outcome:{...outcome,status:'draft'}}),false);
});
test('classification exposes qualitative confidence instead of fixed percentages',async()=>{
 const {classifyPayload}=await import('../server/classify');const res=await classifyPayload({answers:profile(['C','C','C','C','B','C']),assessmentVersion:ASSESSMENT_VERSION,department:'Data',role:'Engineer',lang:'EN'});assert.equal(res.confidence,null);assert.equal(res.confidenceLabel,'consistent-evidence');assert.equal(res.contributionStyle,'B');
});

import {recommendedOffers,personalisedPlan,approveAssignment,progressAssignment,approvalOf,deliveryOf,validBenefit,validateBenefit,type PocRecord,type Benefit} from '../src/shared/poc';
const demoRecord:PocRecord={id:'test',created:'2026-10-06',persona:'builder',dimensions:{aiExposure:75,aiApplication:75,criticalJudgement:75,aiProblemSolving:75,growthAspiration:75},style:'B',reviewRequired:false,reflection:'',department:'GITD',job:'Engineer',context:{domain:'',skills:[],hours:0},learning:{},assignments:{}};
test('compact journey recommends automatically without claiming domain skills or eligibility',()=>{
 const offers=recommendedOffers(demoRecord);assert.equal(offers.length,8);assert.ok(offers.every(o=>!o.eligible&&o.gaps.includes('supervisor-validation')));assert.equal(offers[0].roleId,'R3');assert.ok(projects.find(p=>p.id===offers[0].projectId)!.roleIds.includes(offers[0].roleId));
 const scores={...demoRecord.dimensions};const plan=personalisedPlan({...demoRecord,reflection:'I need to learn governance and risk.'},offers[0],'EN');assert.match(plan[0].text,/responsible AI/);assert.deepEqual(demoRecord.dimensions,scores);
 const supported=personalisedPlan({...demoRecord,reviewRequired:true},offers[0],'EN');assert.match(supported[1].text,/mentor/);
});
test('acceptance routes to supervisor; approval and assignment are separate sequential states',()=>{
 const pending={response:'accepted' as const,roleId:'R3' as const,confirmed:false,approval:'pending' as const,delivery:'not-assigned' as const};
 assert.throws(()=>progressAssignment(pending,'assigned'));assert.throws(()=>approveAssignment(pending,'approved','','reason'));
 const approved=approveAssignment(pending,'approved','Demo supervisor','Mentor and availability confirmed');assert.equal(approvalOf(approved),'approved');assert.equal(deliveryOf(approved),'not-assigned');assert.equal(approved.confirmed,false);
 assert.throws(()=>progressAssignment(approved,'completed'));const assigned=progressAssignment(approved,'assigned');const started=progressAssignment(assigned,'in-progress');assert.equal(deliveryOf(progressAssignment(started,'completed')),'completed');
 const rejected=approveAssignment(pending,'rejected','Demo supervisor','No capacity');assert.throws(()=>progressAssignment(rejected,'assigned'));assert.throws(()=>approveAssignment({...pending,response:'declined'},'approved','Demo supervisor','reason'));
 assert.equal(approvalOf({...pending,approval:undefined,confirmed:true}),'approved');
});
test('benefit categories enforce units and cannot validate before completed approved delivery',()=>{
 const benefit:Benefit={category:'cost-avoidance',description:'Avoided an external support request',amount:5000,unit:'RM',period:'October POC',evidence:'Approved quote and internal delivery comparison',owner:'Demo project owner',status:'submitted'};
 assert.equal(validBenefit(benefit),true);assert.equal(validBenefit({...benefit,unit:'hours'}),false);assert.equal(validBenefit({...benefit,evidence:''}),false);assert.equal(validBenefit({...benefit,amount:NaN}),false);
 const a={response:'accepted' as const,roleId:'R3' as const,confirmed:true,approval:'approved' as const,delivery:'completed' as const,benefit};
 assert.throws(()=>validateBenefit({...a,delivery:'assigned'},'Demo Finance'));assert.throws(()=>validateBenefit({...a,approval:'rejected'},'Demo Finance'));assert.throws(()=>validateBenefit(a,''));assert.equal(validateBenefit(a,'Demo Finance').benefit!.status,'validated');
 assert.equal(validBenefit({...benefit,category:'productivity',unit:'hours'}),true);assert.equal(validBenefit({...benefit,category:'internalisation',unit:'outputs'}),true);assert.equal(validBenefit({...benefit,category:'productivity'}),false);
});

// Fast and slow responses must both finish the full visible analysis sequence.
import {analysisProgress} from '../src/shared/analysisTiming';
test('analysis waits for all four phases and the prepared response', () => {
  assert.equal(analysisProgress(100, true).sequenceComplete, false);
  assert.deepEqual(analysisProgress(7500, true).completedSteps, [0, 1, 2]);
  assert.equal(analysisProgress(9999, true).sequenceComplete, false);
  assert.equal(analysisProgress(30000, false).sequenceComplete, false);
  assert.equal(analysisProgress(30000, false).progressPercent, 96);
  assert.deepEqual(analysisProgress(10000, true).completedSteps, [0, 1, 2, 3]);
  assert.equal(analysisProgress(10000, true).progressPercent, 100);
  assert.equal(analysisProgress(30000, true).sequenceComplete, true);
});

test('every learning recommendation receives a distinct relevant link, including restored assessments',async()=>{
 const {withLearningResources}=await import('../src/shared/learningResources');
 const {getLearningContext}=await import('../server/mcpLearning');
 const recommendations=[{title:'Introduction to Generative AI',description:'',videoUrl:'https://www.youtube.com/watch?v=G2fqAlgmoPo'},{title:'Prompt Engineering Fundamentals',description:'',videoUrl:'https://www.youtube.com/watch?v=GElCu2kUlRs'},...getLearningContext('explorer')];
 const linked=withLearningResources(recommendations,'explorer');
 assert.equal(new Set(linked.map(r=>r.videoUrl)).size,linked.length);
 assert.equal(linked[0].videoUrl,'https://www.youtube.com/watch?v=G2fqAlgmoPo');
 assert.ok(linked[2].videoTitle.includes('Responsible'));
 assert.ok(linked.every(r=>r.videoLinkKind==='video'));
 for(const persona of ['explorer','builder','strategist','visionary'])for(const bm of [false,true]){
  const rows=withLearningResources(getLearningContext(persona,bm),persona);
  assert.equal(new Set(rows.map(r=>r.videoUrl)).size,rows.length);
  assert.ok(rows.every(r=>r.videoUrl.startsWith('https://www.youtube.com/')));
 }
});

test('employee persona-role mapping stays stable across project interest and preserves legacy records',async()=>{
 const {primaryContributionRole,employeeProjectOffers}=await import('../src/shared/contributionRoles');
 const expected={explorer:'Research & Insight Contributor',builder:'Development & Automation Contributor',strategist:'Use Case & Value Contributor',visionary:'Adoption & Transformation Contributor'};
 const {projects}=await import('../src/shared/poc');
 for(const [persona,name] of Object.entries(expected)){
  const record={...demoRecord,persona};const snapshot=JSON.stringify(record);
  const role=primaryContributionRole(persona);assert.equal(role.name.EN,name);
  const offers=employeeProjectOffers(record);assert.equal(offers.length,8);assert.ok(offers.some(o=>o.primaryMatch));
  for(const offer of offers.filter(o=>o.primaryMatch)){
   assert.ok(role.roleIds.includes(offer.roleId));assert.ok(projects.find(p=>p.id===offer.projectId)!.roleIds.includes(offer.roleId));assert.equal(offer.eligible,false);
  }
  const interested:PocRecord={...record,assignments:{saring:{response:'accepted',roleId:'R5',approval:'pending',confirmed:false}}};
  assert.equal(primaryContributionRole(interested.persona).name.EN,name);
  assert.deepEqual(employeeProjectOffers(interested),offers);
  assert.equal(JSON.stringify(record),snapshot);assert.equal(interested.assignments.saring.roleId,'R5');
 }
 const reviewed:PocRecord={...demoRecord,review:{persona:'visionary',reason:'reviewed',reviewer:'Supervisor'}};
 assert.ok(employeeProjectOffers(reviewed).filter(o=>o.primaryMatch).every(o=>o.roleId==='R6'));
});

 test('employee contribution counts separate interest, approval, assignment and completion',async()=>{
  const {contributionStatistics}=await import('../src/shared/contributionOutcomes');
  const base={response:'accepted' as const,roleId:'R2' as const,confirmed:false};
  assert.deepEqual(contributionStatistics({assignments:{}}),{interest:0,pending:0,assigned:0,completed:0});
  const assignments={pending:base,approved:{...base,approval:'approved' as const},assigned:{...base,approval:'approved' as const,confirmed:true,delivery:'assigned' as const},completed:{...base,approval:'approved' as const,confirmed:true,delivery:'completed' as const},rejected:{...base,approval:'rejected' as const},skipped:{...base,response:'declined' as const},legacy:{...base,confirmed:true}};
  const snapshot=JSON.stringify(assignments);
  assert.deepEqual(contributionStatistics({assignments}),{interest:6,pending:1,assigned:3,completed:1});
  assert.equal(JSON.stringify(assignments),snapshot);
 });
 test('contribution benefits expose amounts only after completed approved validated delivery',async()=>{
  const {validatedContributionBenefit}=await import('../src/shared/contributionOutcomes');
  const a={response:'accepted' as const,roleId:'R2' as const,approval:'approved' as const,confirmed:true,delivery:'completed' as const,benefit:{category:'productivity' as const,description:'Saved effort',amount:8,unit:'hours' as const,period:'Pilot',evidence:'Time logs',owner:'Project owner',status:'validated' as const,validator:'Supervisor'}};
  assert.equal(validatedContributionBenefit(a)?.amount,8);
  assert.equal(validatedContributionBenefit({...a,benefit:{...a.benefit,status:'submitted'}}),undefined);
  assert.equal(validatedContributionBenefit({...a,delivery:'in-progress'}),undefined);
  assert.equal(validatedContributionBenefit({...a,approval:'pending'}),undefined);
  assert.equal(validatedContributionBenefit({...a,response:'declined'}),undefined);
  assert.equal(validatedContributionBenefit({...a,benefit:{...a.benefit,amount:NaN}}),undefined);
 });
 test('workforce totals reconcile statuses, unique employees and repeat assessments without mutation',async()=>{
  const {workforceAnalytics,workforceDemo,learningDemand}=await import('../src/shared/workforceAnalytics');
  const snapshot=JSON.stringify(workforceDemo);const a=workforceAnalytics([...workforceDemo,workforceDemo[0]]);
  assert.equal(a.records.length,24);assert.equal(a.personas.reduce((n,p)=>n+p.count,0),24);
  assert.equal(a.summary.interest,20);assert.equal(a.summary.uniqueInterested,20);assert.equal(a.summary.pending,4);assert.equal(a.summary.rejected,4);assert.equal(a.summary.approved,12);assert.equal(a.summary.awaitingAssignment,4);assert.equal(a.summary.assigned,8);assert.equal(a.summary.completed,4);
  assert.equal(learningDemand(a.records,'EN').reduce((n,r)=>n+r.count,0),24);
  const subset=a.records.filter(r=>r.department==='Group Finance (GF)');assert.equal(workforceAnalytics(subset).records.length,6);assert.equal(learningDemand(subset,'EN').reduce((n,r)=>n+r.count,0),6);
  assert.equal(JSON.stringify(workforceDemo),snapshot);assert.equal(workforceAnalytics([]).summary.interest,0);
 });
 test('HR benefit aggregation counts repeated project periods once and flags conflicting values',async()=>{
  const {workforceAnalytics,workforceDemo}=await import('../src/shared/workforceAnalytics');
  const r=structuredClone(workforceDemo[4]);const projectId=Object.keys(r.assignments)[0];const copy=structuredClone(r);copy.id='OTHER-EMPLOYEE';
  const a=workforceAnalytics([r,copy]);assert.equal(a.benefits.length,1);assert.equal(a.benefits[0].count,2);assert.equal(a.benefits[0].conflict,false);
  copy.assignments[projectId].benefit!.amount+=1;assert.equal(workforceAnalytics([r,copy]).benefits[0].conflict,true);
  copy.assignments[projectId].benefit!.status='submitted';assert.equal(workforceAnalytics([r,copy]).benefits[0].count,1);
  assert.equal(workforceAnalytics([r,{...r,id:'SECOND-INTEREST',assignments:{...r.assignments,'saring':{response:'accepted',roleId:'R2',confirmed:false}}}]).summary.uniqueInterested,2);
 });

 test('profile insight placement follows scores and separates ambition from capability',async()=>{
 const {profileInsights}=await import('../src/shared/profileInsights');
 const r=profileInsights({aiExposure:25,aiApplication:50,criticalJudgement:25,aiProblemSolving:50,growthAspiration:100,aiContributionStyle:100},'EN');
 assert.deepEqual(r.strengths.map(s=>s.key),['growthAspiration']);assert.equal(r.growth.length,4);assert.match(r.strengths[0].text,/ambition/);
 const high=profileInsights({aiExposure:75,aiApplication:100},'BM');assert.equal(high.strengths.length,2);assert.equal(high.growth.length,0);assert.equal(high.strengths[0].label,'Pendedahan AI');
 assert.deepEqual(profileInsights({aiExposure:NaN,aiApplication:999},'EN'),{strengths:[],growth:[]});
 });

 test('participation charts deduplicate profiles, preserve department counts and use Malaysia calendar months',async()=>{
 const {workforceParticipation,workforceDemo}=await import('../src/shared/workforceAnalytics');
 const first={...workforceDemo[0],created:'2026-05-31T17:00:00Z'};
 const second={...workforceDemo[1],created:'2026-06-02T00:00:00Z'};
 const undated={...workforceDemo[2],created:'invalid'};
 const r=workforceParticipation([first,first,second,undated]);
 assert.deepEqual(r.months,[{month:'2026-06',count:2,cumulative:2}]);assert.equal(r.undated,1);assert.equal(r.departments.reduce((n,d)=>n+d.count,0),3);
 const demo=workforceParticipation(workforceDemo);assert.equal(demo.months.length,6);assert.equal(demo.months.at(-1)?.cumulative,24);
 assert.deepEqual(workforceParticipation([]),{months:[],undated:0,departments:[]});
 });

 test('employee workforce mock reconciles the approved total without changing HR data',async()=>{
 const {employeeWorkforceDemo,mockAssessmentTotal,workforceTarget}=await import('../src/shared/employeeWorkforceDemo');
 const {workforceAnalytics,workforceParticipation,workforceDemo,learningDemand}=await import('../src/shared/workforceAnalytics');
 const a=workforceAnalytics(employeeWorkforceDemo);assert.equal(a.records.length,5603);assert.equal(mockAssessmentTotal,5603);assert.equal(workforceTarget,16720);assert.equal(a.personas.reduce((n,p)=>n+p.count,0),5603);assert.equal(a.departments.length,14);
 const participation=workforceParticipation(employeeWorkforceDemo);assert.equal(participation.months.at(-1)?.cumulative,5603);assert.equal(participation.months.at(-1)?.count,958);assert.equal(participation.departments.reduce((n,d)=>n+d.count,0),5603);assert.equal(learningDemand(a.records,'EN').reduce((n,t)=>n+t.count,0),5603);assert.equal(workforceDemo.length,24);assert.ok(a.records.every(r=>Object.keys(r.assignments).length===0));
 });

 test('learning summary reconciles unique employees, missing guidance and persona topics',async()=>{
 const {workforceLearningSummary,workforceDemo}=await import('../src/shared/workforceAnalytics');
 const eligible=workforceDemo[0];const missing={...workforceDemo[1],dimensions:{}};const r=workforceLearningSummary([eligible,eligible,missing],'EN');
 assert.equal(r.total,1);assert.equal(r.coverage,50);assert.equal(r.topics.reduce((n,t)=>n+t.count,0),1);assert.equal(r.personas.reduce((n,p)=>n+p.count,0),1);assert.equal(r.mostRecommended?.count,1);
 const empty=workforceLearningSummary([],'BM');assert.equal(empty.total,0);assert.equal(empty.coverage,0);assert.equal(empty.mostRecommended,null);
 const {employeeWorkforceDemo}=await import('../src/shared/employeeWorkforceDemo');const mock=workforceLearningSummary(employeeWorkforceDemo,'EN');assert.equal(mock.total,5603);assert.equal(mock.coverage,100);assert.equal(mock.personas.reduce((n,p)=>n+p.count,0),5603);
 });

test('HR learning progress keeps unrecorded, started, completed and verified evidence distinct',async()=>{
 const {saveDevelopment,developmentSummary}=await import('../src/shared/hrInsights');
 const {workforceDemo}=await import('../src/shared/workforceAnalytics');
 const record=workforceDemo[0];
 const base={status:'completed' as const,topic:'Practical AI',evidence:'Exercise reflection',recordedBy:'POC coordinator',updated:'2026-10-08',basis:'self-reported' as const};
 assert.throws(()=>saveDevelopment(record,{...base,evidence:''}));
 assert.throws(()=>saveDevelopment(record,{...base,capacityHours:2}));
 assert.throws(()=>saveDevelopment(record,{...base,capacityHours:41,capacityConfirmedBy:'Supervisor'}));
 const completed=saveDevelopment(record,base);
 const verified=saveDevelopment({...record,id:'verified'},{...base,basis:'verified',capacityHours:2,capacityConfirmedBy:'Supervisor'});
 const started=saveDevelopment({...record,id:'started'},{...base,status:'started',evidence:''});
 const summary=developmentSummary([completed,completed,verified,started,{...record,id:'unrecorded'}]);
 assert.deepEqual(summary,{total:4,recorded:3,started:1,completed:2,verified:1,available:1});
 assert.equal(record.development,undefined);
});

test('project-owner assignment requires approval and confirmed capacity and preserves decision evidence',async()=>{
 const {approveAssignment,confirmProjectAssignment,deliveryOf}=await import('../src/shared/poc');
 const pending={response:'accepted' as const,roleId:'R2' as const,confirmed:false};
 assert.throws(()=>confirmProjectAssignment(pending,'Owner',2));
 const approved=approveAssignment(pending,'approved','Supervisor','Capacity agreed');
 assert.ok(approved.decisionDate);
 assert.throws(()=>confirmProjectAssignment(approved,'',2));
 assert.throws(()=>confirmProjectAssignment(approved,'Owner',0));
 const assigned=confirmProjectAssignment(approved,'Owner',2);
 assert.equal(assigned.projectOwner,'Owner');assert.equal(deliveryOf(assigned),'assigned');assert.equal(assigned.approvalReason,'Capacity agreed');
 const rejected=approveAssignment(pending,'rejected','Supervisor','No capacity');assert.throws(()=>confirmProjectAssignment(rejected,'Owner',2));
});

test('supervisor approval records capacity without assigning or creating learning completion',async()=>{
 const {recordSupervisorDecision,agreedCapacity,capacityConfirmedBy}=await import('../src/shared/supervisorReview');
 const {developmentSummary}=await import('../src/shared/hrInsights');
 const {workforceDemo}=await import('../src/shared/workforceAnalytics');
 const record={...workforceDemo[0],development:undefined,assignments:{saring:{response:'accepted' as const,roleId:'R2' as const,confirmed:false}}};
 assert.throws(()=>recordSupervisorDecision(record,'saring','approved','Supervisor','Supported',0));
 assert.throws(()=>recordSupervisorDecision(record,'saring','approved','Supervisor','Supported',41));
 assert.throws(()=>recordSupervisorDecision(record,'saring','approved','','Supported',2));
 const approved=recordSupervisorDecision(record,'saring','approved','Supervisor','Supported with time',2);
 assert.equal(agreedCapacity(approved),2);assert.equal(capacityConfirmedBy(approved),'Supervisor');
 assert.equal(approved.assignments.saring.confirmed,false);assert.equal(approved.assignments.saring.approval,'approved');
 assert.equal(approved.development,undefined);assert.equal(developmentSummary([approved]).available,1);
 assert.equal(record.assignments.saring.confirmed,false);assert.equal(record.capacity,undefined);
 const rejected=recordSupervisorDecision(record,'saring','rejected','Supervisor','Current workload',0);
 assert.equal(rejected.assignments.saring.approval,'rejected');assert.equal(rejected.capacity,undefined);
});

test('skill gaps use capability requirements, exclude clarification and deduplicate profiles',()=>{
 const low={...workforceDemo[0],id:'low',reviewRequired:false,persona:'visionary',dimensions:{aiExposure:75,aiApplication:50,criticalJudgement:50,aiProblemSolving:100}};
 const ready={...low,id:'ready',persona:'explorer',dimensions:{aiExposure:75,aiApplication:75,criticalJudgement:75,aiProblemSolving:75}};
 const uncertain={...low,id:'uncertain',reviewRequired:true,review:undefined};
 const missing={...ready,id:'missing',dimensions:{aiExposure:75,criticalJudgement:75,aiProblemSolving:75}};
 const s=skillGapSummary([low,low,ready,uncertain,missing]);
 assert.equal(s.total,4);assert.equal(s.clarification,2);
 const application=s.rows.find(r=>r.dimension==='aiApplication')!;
 assert.equal(application.gaps.length,1);assert.equal(application.assessed,2);assert.equal(application.share,50);assert.equal(application.clarification.length,2);
 assert.equal(skillGapSummary([{...low,persona:'explorer'}]).priority?.gaps.length,1);
 const role=skillGapSummary([low,ready],'R2');assert.equal(role.rows.length,1);assert.equal(role.rows[0].target,50);assert.equal(role.rows[0].gaps.length,0);
 const solution=skillGapSummary([low,ready],'R3');assert.equal(solution.priority?.dimension,'aiApplication');assert.equal(solution.priority?.target,75);
 const clarified=skillGapSummary([{...uncertain,review:{persona:'visionary',reviewer:'HR',reason:'Clarified'}}]);assert.equal(clarified.clarification,0);assert.equal(clarified.priority?.gaps.length,1);
 const empty=skillGapSummary([]);assert.equal(empty.priority,undefined);assert.ok(empty.rows.every(r=>r.share===0));
});

test('capability averages use selected unique profiles and exclude missing or invalid answers',()=>{
 const a={...workforceDemo[0],id:'average-a',dimensions:{aiExposure:100,aiApplication:75,criticalJudgement:50,aiProblemSolving:25}};
 const b={...workforceDemo[1],id:'average-b',dimensions:{aiExposure:50,aiApplication:999,criticalJudgement:100}};
 const result=workforceCapabilityAverages([a,b,a]);
 assert.deepEqual(result.map(r=>[r.average,r.count]),[[75,2],[75,1],[75,2],[25,1]]);
 assert.deepEqual(workforceCapabilityAverages([]).map(r=>r.average),[null,null,null,null]);
 assert.equal(workforceCapabilityAverages([b])[3].average,null);
});

test('varied workforce examples preserve division readiness counts and valid capability averages',()=>{
 const averages=workforceCapabilityAverages(employeeWorkforceDemo);
 assert.ok(averages.every(r=>r.count===5603&&r.average!==null));
 assert.equal(new Set(averages.map(r=>Math.round(r.average!))).size,4);
 assert.equal(divisionDashboardSummary(employeeWorkforceDemo).ready,4258);
 assert.ok(employeeWorkforceDemo.every(r=>Object.values(r.dimensions).every(v=>[25,50,75,100].includes(v))));
});

test('Jan–Oct workforce trend reconciles every division, month and readiness highlight',()=>{
 const period={start:'2026-01',end:'2026-10'};
 const expected=[180,240,310,360,420,480,550,680,1425,958];
 const all=workforceParticipation(employeeWorkforceDemo,period);
 assert.deepEqual(all.months.map(m=>m.count),expected);assert.equal(all.months.at(-1)?.cumulative,5603);
 reportingDivisions.forEach((division,i)=>{
  const records=filterDivision(employeeWorkforceDemo,division);const trend=workforceParticipation(records,period);
  assert.deepEqual(trend.months.map(m=>m.count),divisionMonthlyCounts[i]);
  assert.equal(trend.months.length,10);assert.equal(trend.months.reduce((sum,m)=>sum+m.count,0),records.length);
 });
 assert.equal(divisionDashboardSummary(employeeWorkforceDemo).ready,4258);
 assert.equal(workforceParticipation([],period).months.length,10);
 assert.ok(workforceParticipation([],period).months.every(m=>m.count===0&&m.cumulative===0));
});

test('workforce learning-capacity simulation reconciles 5603 employees and every division without mutation',()=>{
 const before=JSON.stringify(employeeWorkforceDemo);
 const records=hrLearningCapacityDemo(employeeWorkforceDemo);
 assert.equal(records.length,5603);
 assert.equal(records.filter(r=>r.development?.status==='completed').length,2700);
 assert.equal(records.filter(r=>r.development?.status==='started').length,900);
 assert.equal(records.filter(r=>r.development?.status==='recommended').length,2003);
 assert.equal(records.filter(r=>r.development?.capacityConfirmedBy).length,1401);
 assert.equal(records.filter(r=>r.development?.status==='completed'&&r.development.basis==='verified').length,1890);
 for(const row of employeeLearningDemo){
  const cohort=records.filter(r=>r.department===row.division);
  assert.equal(cohort.filter(r=>r.development?.status==='completed').length,row.completed);
  assert.equal(cohort.filter(r=>r.development?.status!=='recommended').length,row.started);
 }
 assert.equal(JSON.stringify(employeeWorkforceDemo),before);
 assert.equal(records.flatMap(r=>Object.keys(r.assignments)).length,0);
});

test('deployment simulation reconciles 1000 interests, approval stages and capacity without adding benefits',()=>{
 const records=hrDeploymentDemo(employeeWorkforceDemo);
 const a=workforceAnalytics(records);
 assert.equal(records.length,1000);
 assert.equal(a.summary.interest,1000);
 assert.equal(a.summary.pending,360);
 assert.equal(a.summary.approved,540);
 assert.equal(a.summary.rejected,100);
 assert.equal(a.summary.awaitingAssignment,180);
 assert.equal(a.summary.assigned,360);
 assert.equal(a.summary.completed,120);
 assert.equal(records.filter(r=>r.capacity).length,250);
 assert.equal(a.benefits.length,0);
 for(const row of records){const assignment=Object.values(row.assignments)[0];assert.equal(assignment.confirmed,assignment.delivery!=='not-assigned');}
});

import {hrOutcomeDemo} from '../src/shared/hrOutcomeDemo';
test('outcome simulation links completed deployment contributions and deduplicates project benefits',()=>{
 const deployment=hrDeploymentDemo(employeeWorkforceDemo);
 const before=JSON.stringify(deployment);
 const records=hrOutcomeDemo(deployment);
 const a=workforceAnalytics(records);
 assert.equal(a.summary.completed,120);
 assert.equal(a.benefits.length,28);
 const total=(category:string)=>a.benefits.filter(b=>b.benefit.category===category).reduce((n,b)=>n+b.benefit.amount,0);
 assert.equal(total('cost-avoidance'),400000);
 assert.equal(total('cost-saving'),480000);
 assert.equal(total('productivity'),8800);
 assert.equal(total('internalisation'),176);
 assert.equal(new Set(a.benefits.map(b=>b.projectId)).size,7);
 assert.ok(a.benefits.every(b=>!b.conflict));
 const evidence=a.responses.find(r=>r.assignment.benefit)!;
 const duplicate={...evidence.record,id:'duplicate-outcome-evidence'};
 assert.equal(workforceAnalytics([...records,duplicate]).benefits.length,28);
 assert.equal(JSON.stringify(deployment),before);
});
