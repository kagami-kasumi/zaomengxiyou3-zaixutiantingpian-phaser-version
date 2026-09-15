import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { mutations, mutationPlugin } from './incoming-settlement-mutations.mjs';

// Isolated browser harness executes both real TestScene damage bridges.
const dir=path.resolve('dist/__settlement_probe');
const mutationName=process.argv[process.argv.indexOf('--mutation')+1];
const mutation=process.argv.includes('--mutation') ? mutations.find(m=>m.name===mutationName) : undefined;
if(process.argv.includes('--mutation'))assert.ok(mutation,'unknown mutation');
mkdirSync(dir,{recursive:true});
await build({entryPoints:['tools/incoming-settlement-browser-probe.ts'],bundle:true,format:'iife',
  outfile:path.join(dir,'probe.js'),logLevel:'silent',plugins:mutation?[mutationPlugin(mutation)]:[]});
writeFileSync(path.join(dir,'index.html'),'<html><head><link rel="icon" href="data:,"></head><body><script src="probe.js"></script></body></html>');
const port=9437;
const edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check',
  `--remote-debugging-port=${port}`,`--user-data-dir=${path.resolve('.tmp/settlement-browser-profile')}`,
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
  await command('Page.navigate',{url:'http://127.0.0.1:4174/__settlement_probe/index.html'});
  let ready=false;
  for(let n=0;n<200;n++){ready=await evaluate('window.probeReady === true');if(ready)break;await delay(50);}
  assert.ok(ready,'settlement probe never became ready');
  const rows=await evaluate('window.settlementRows');
  assert.equal(rows.length,216);
  for(const row of rows)assert.deepEqual(row.actual,row.expected,row.id);
  const incomingRows=await evaluate('window.incomingRows');
  const values={'transfer-101':[95,6], 'overflow-shield':[48,3], 'tjgl-overflow':[48,3],
    'role3-sd1':[94,5], 'role3-no-link':[99], 'role3-sd8':[87,5], 'role3-overflow':[45,3],
    zero:[0], 'lethal-hero':[95,6], 'lethal-pet':[95,6], 'dead-pet':[101], 'expired-link':[101]};
  for(const row of incomingRows) {
    const expected=row.gate==='hit' ? values[row.caseId]??[] : [];
    assert.equal(row.events.length,expected.length,row.id);
    for(const event of row.events) {
      assert.equal(event.ownerSlot,row.slot,row.id);
      assert.equal(event.attackId,row.caseId,row.id);
      assert.equal(event.occurredAtMs,0,row.id);assert.equal(event.settledAtMs,0,row.id);
      const pet=event.targetKind==='pet';
      assert.equal(event.producerKind,pet?'turtle-transfer':'hero-reduce-hp',row.id);
      assert.equal(event.displayValue,expected[pet?1:0],row.id);
      assert.deepEqual(event.worldAnchor,pet?row.petAnchor:row.heroAnchor,row.id);
    }
  }
  if(!mutation)writeFileSync('docs/tasks/evidence/TASK-SLICE-216B/testscene-producers.json',JSON.stringify({
    scope:'Controlled active attacks through real TestScene Monster30/Monster3 collision and settlement adapters; no full-scene turtle visual claim',rows:incomingRows},null,2)+'\n');
  assert.deepEqual(errors,[],'browser warnings/errors');
  const out='docs/tasks/evidence/TASK-SLICE-216B1';
  mkdirSync(out,{recursive:true});
  if(!mutation)writeFileSync(path.join(out,'browser-settlement.json'),JSON.stringify({
    scope:'Real TestScene Monster30/Monster3 consumers and Phaser collision in Edge; controlled attack state, not full scene or visual acceptance',
    rows,errors,
  },null,2)+'\n');
  console.log(`216B1 browser: ${rows.length} real consumer/owner/collision cases passed`);
} finally {
  socket?.close();edge.kill();
}
