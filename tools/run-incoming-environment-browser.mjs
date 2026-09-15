import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { mutations, mutationPlugin } from './incoming-environment-mutations.mjs';

// Isolated browser harness executes both real TestScene damage bridges.
const dir=path.resolve('dist/__environment_probe');
const mutationName=process.argv[process.argv.indexOf('--mutation')+1];
const mutation=process.argv.includes('--mutation') ? mutations.find(m=>m.name===mutationName) : undefined;
if(process.argv.includes('--mutation'))assert.ok(mutation,'unknown mutation');
mkdirSync(dir,{recursive:true});
await build({entryPoints:['tools/incoming-environment-browser-probe.ts'],bundle:true,format:'iife',
  outfile:path.join(dir,'probe.js'),logLevel:'silent',plugins:mutation?[mutationPlugin(mutation)]:[]});
writeFileSync(path.join(dir,'index.html'),'<html><head><link rel="icon" href="data:,"></head><body><script src="probe.js"></script></body></html>');
const port=9438;
const edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check',
  `--remote-debugging-port=${port}`,`--user-data-dir=${path.resolve('.tmp/environment-browser-profile')}`,
  'about:blank',
],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let socket;let id=0;const pending=new Map();const errors=[];
async function command(method,params={}) {
  const key=++id;
  const result=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(key);reject(Error(`CDP timeout: ${method}`));},20000);
    pending.set(key,{resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});
  });
  socket.send(JSON.stringify({id:key,method,params}));return result;
}
async function evaluate(expression) {
  const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
try {
  let pages;
  for(let n=0;n<100;n++) {
    try {pages=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(pages.some(p=>p.type==='page'))break;}catch {}
    await delay(100);
  }
  assert.ok(pages?.some(p=>p.type==='page'),'headless Edge failed to start');
  socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
  await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});
  socket.addEventListener('message',({data})=>{
    const m=JSON.parse(data);
    if(m.id) {const p=pending.get(m.id);pending.delete(m.id);if(m.error)p?.reject(m.error);else p?.resolve(m.result);}
    else if(m.method==='Runtime.exceptionThrown'||(m.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(m.params.type)))errors.push(m);
  });
  await command('Runtime.enable');
  await command('Page.enable');
  await command('Page.navigate',{url:'http://127.0.0.1:4174/__environment_probe/index.html'});
  let ready=false;
  for(let n=0;n<200;n++){ready=await evaluate('window.probeReady === true');if(ready)break;await delay(50);}
  assert.ok(ready,'settlement probe never became ready');
  const rows=await evaluate('window.environmentRows');
  assert.equal(rows.length,24);
  for(const row of rows)assert.deepEqual(row.actual,row.expected,row.id);
  assert.deepEqual(errors,[],'browser warnings/errors');
  const out='docs/tasks/evidence/TASK-SLICE-216B2';
  mkdirSync(out,{recursive:true});
  if(!mutation)writeFileSync(path.join(out,'browser-environment.json'),JSON.stringify({
    scope:'Real ice/fire formal adapters and DEV fire hit adapter; real hazard functions, shared party settlement and loaded fire pixels in Edge; controlled targets, not complete scene/geometry acceptance',
    rows,errors,
  },null,2)+'\n');
  console.log(`216B2 browser: ${rows.length} real consumer/owner/collision cases passed`);
} finally {
  socket?.close();edge.kill();
}
