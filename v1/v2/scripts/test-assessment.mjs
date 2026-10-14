import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const out = mkdtempSync(path.join(tmpdir(),'ainspire-tests-'));
const testEnv = {...process.env,NODE_PATH:path.resolve('node_modules')};
for (const name of ['GIGX_API_KEY','TM_APIGATE_CLIENT_ID','TM_APIGATE_CLIENT_SECRET','TM_APIGATE_CHAT_KEY','YOUTUBE_API_KEY','YOUTUBE_API_KEY_BACKUP']) delete testEnv[name];
try {
 const testFiles = ['assessment','gateway','navigation','demoAccess','notifications'];
 const compile = spawnSync(process.execPath,['node_modules/typescript/bin/tsc',...testFiles.map(name=>`tests/${name}.test.ts`),'--outDir',out,'--module','commonjs','--target','es2022','--esModuleInterop','--skipLibCheck','--strict'],{stdio:'inherit'});
 if(compile.status !== 0) process.exitCode = compile.status ?? 1;
 else process.exitCode = spawnSync(process.execPath,['--test',...testFiles.map(name=>path.join(out,`tests/${name}.test.js`))],{stdio:'inherit',env:testEnv}).status ?? 1;
} finally {rmSync(out,{recursive:true,force:true});}
