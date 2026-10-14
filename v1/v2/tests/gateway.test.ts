import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { assessmentQuestionsByLang, ASSESSMENT_VERSION } from '../src/data/assessment';
test('optional reflection reaches LLM; LLM cannot override persona or structured scores',async()=>{
 const previous = Object.fromEntries(['GIGX_API_KEY','TM_APIGATE_CLIENT_ID','TM_APIGATE_CLIENT_SECRET','TM_APIGATE_CHAT_KEY'].map(name=>[name,process.env[name]]));
 delete process.env.GIGX_API_KEY;
 process.env.TM_APIGATE_CLIENT_ID='test-only';process.env.TM_APIGATE_CLIENT_SECRET='test-only';process.env.TM_APIGATE_CHAT_KEY='test-only';
 let prompt='';const originalFetch=globalThis.fetch;
 globalThis.fetch=async(input,init)=>{if(String(input).endsWith('/token'))return Response.json({access_token:'mock',expires_in:3600});const payload=JSON.parse(String(init?.body));prompt=payload.messages[0].content;const object=JSON.stringify({persona:'visionary',overallReadiness:999,strengths:['Fabricated expertise'],developmentGaps:[],reasoning:'Mixed capability evidence needs review. Reflection describes checking source figures.',narrative:'A practical development path.'});return Response.json({choices:[{message:{content:`<think>Reconcile supplementary reflection without changing scores.</think>\n\`\`\`json\n${object}\n\`\`\`\nCompleted.`}}]});};
 try { const { classifyPayload }=await import('../server/classify');const ids=['D','D','A','D','B','D'];const answers=assessmentQuestionsByLang.EN.map((q,i)=>({questionId:q.id,selectedOption:ids[i]}));const r=await classifyPayload({answers,assessmentVersion:ASSESSMENT_VERSION,department:'Finance',role:'Analyst',lang:'EN',reflection:{category:'Capability',text:'I checked source figures myself.'}});assert.ok(prompt.includes('I checked source figures myself.'));assert.equal(r.persona,'builder');assert.notEqual(r.overallReadiness,999);assert.equal(r.engine,'tm-llm');assert.deepEqual(r.modelProviderTrace,{gigx:'not-configured',apiGate:'responded'});assert.ok(!r.strengths.includes('Fabricated expertise'));assert.ok(r.developmentGaps.some(s=>s.startsWith('Critical Judgement:'))); } finally {globalThis.fetch=originalFetch;for(const [name,value] of Object.entries(previous))value===undefined?delete process.env[name]:process.env[name]=value;}
});

test('GiGX is the primary OpenAI-compatible provider', async () => {
 const names = ['GIGX_API_KEY','GIGX_API_URL','GIGX_LLM_MODEL','TM_APIGATE_CLIENT_ID','TM_APIGATE_CLIENT_SECRET','TM_APIGATE_CHAT_KEY'] as const;
 const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
 const originalFetch = globalThis.fetch;
 process.env.GIGX_API_KEY = 'mock-gigx-key';
 process.env.GIGX_LLM_MODEL = 'qwen3-vl-4b-instruct';
 for (const name of names.slice(3)) delete process.env[name];
 globalThis.fetch = async (input, init) => {
  assert.equal(String(input), 'https://gigx.nexa-dev.tm.com.my/llm/v1/chat/completions');
  const request = JSON.parse(String(init?.body));
  assert.equal(request.model, 'qwen3-vl-4b-instruct');
  assert.equal(request.temperature, 0);
  assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer mock-gigx-key');
  return Response.json({choices:[{message:{content:'primary response'}}]});
 };
 try {
    const {chatComplete,chatCompleteWithTrace,configuredChatProvider}=await import('../server/tmGateway');
  assert.equal(configuredChatProvider(),'gigx');
  assert.equal(await chatComplete('test prompt',64),'primary response');
    const traced=await chatCompleteWithTrace('test prompt',64);
    assert.equal(traced.content,'primary response');
    assert.deepEqual(traced.providerTrace,{gigx:'responded',apiGate:'not-configured'});
 } finally {
  globalThis.fetch=originalFetch;
  for(const name of names) previous[name]===undefined?delete process.env[name]:process.env[name]=previous[name]!;
 }
});

test('GiGX failures fall back to API Gateway', async () => {
 const names = ['GIGX_API_KEY','GIGX_API_URL','TM_APIGATE_TOKEN_URL','TM_APIGATE_API_URL','TM_APIGATE_CLIENT_ID','TM_APIGATE_CLIENT_SECRET','TM_APIGATE_CHAT_KEY'] as const;
 const previous = Object.fromEntries(names.map(name => [name, process.env[name]]));
 const originalFetch = globalThis.fetch;
 Object.assign(process.env,{GIGX_API_KEY:'mock-gigx-key',TM_APIGATE_CLIENT_ID:'mock-client',TM_APIGATE_CLIENT_SECRET:'mock-secret',TM_APIGATE_CHAT_KEY:'mock-chat-key'});
 let gigxCalls=0;
 globalThis.fetch = async (input, init) => {
  const url=String(input);
  if(url.endsWith('/token')) return Response.json({access_token:'mock-token',expires_in:3600});
  if(url.includes('gigx.nexa-dev')) {gigxCalls+=1;return new Response('unavailable',{status:503});}
  assert.equal(new Headers(init?.headers).get('authorization'),'Bearer mock-token');
  return Response.json({choices:[{message:{content:'fallback response'}}]});
 };
 try {
    const {chatCompleteWithTrace,configuredChatProvider}=await import('../server/tmGateway');
  assert.equal(configuredChatProvider(),'gigx-with-apigate-fallback');
    const traced=await chatCompleteWithTrace('test prompt',64);
    assert.equal(traced.content,'fallback response');
    assert.deepEqual(traced.providerTrace,{gigx:'failed',apiGate:'responded'});
  assert.equal(gigxCalls,2);
 } finally {
  globalThis.fetch=originalFetch;
  for(const name of names) previous[name]===undefined?delete process.env[name]:process.env[name]=previous[name]!;
 }
});

test('GiGX retries one transient 503 before accepting a successful response', async () => {
 const names=['GIGX_API_KEY','TM_APIGATE_CLIENT_ID','TM_APIGATE_CLIENT_SECRET','TM_APIGATE_CHAT_KEY'] as const;
 const previous=Object.fromEntries(names.map(name=>[name,process.env[name]]));const originalFetch=globalThis.fetch;let calls=0;
 process.env.GIGX_API_KEY='mock-gigx-key';for(const name of names.slice(1))delete process.env[name];
 globalThis.fetch=async()=>{calls+=1;return calls===1?new Response('temporarily unavailable',{status:503}):Response.json({choices:[{message:{content:'retried response'}}]});};
 try{const {chatCompleteWithTrace}=await import('../server/tmGateway');const result=await chatCompleteWithTrace('test prompt',64);assert.equal(result.content,'retried response');assert.equal(calls,2);assert.deepEqual(result.providerTrace,{gigx:'responded',apiGate:'not-configured'});}
 finally{globalThis.fetch=originalFetch;for(const name of names)previous[name]===undefined?delete process.env[name]:process.env[name]=previous[name]!;}
});
