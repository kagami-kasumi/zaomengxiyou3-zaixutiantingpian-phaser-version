import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir=path.resolve('dist/__incoming_gameplay');
mkdirSync(dir,{recursive:true});
await build({entryPoints:['tools/incoming-feedback-gameplay-probe.ts'],bundle:true,format:'iife',
  outfile:path.join(dir,'probe.js'),logLevel:'silent',external:['/assets/*'],define:{'import.meta.env.DEV':'false','import.meta.env.PROD':'true','import.meta.env.MODE':'"production"','import.meta.env.BASE_URL':'"/"'}});
writeFileSync(path.join(dir,'index.html'),'<html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="probe.css"></head><body><div id="game"></div><script src="probe.js"></script></body></html>');
const port=9439;
const edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check',
  `--remote-debugging-port=${port}`,`--user-data-dir=${path.resolve('.tmp/incoming-gameplay-profile')}`,
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
  await command('Emulation.setDeviceMetricsOverride',{width:940,height:590,deviceScaleFactor:1,mobile:false});
  const out='docs/tasks/evidence/TASK-SLICE-216B';mkdirSync(out,{recursive:true});
  const reports=[];
  for (const [route,sceneName] of [['qaStage=1-2','Stage12Scene'],['qaStage=1-3','Stage13Scene'],['qaStage=2-1','Stage21Scene'],['qaBossState=wait','Stage22Scene'],['qaStage=1-1-role1','TestScene']]) {
    await command('Page.navigate',{url:`http://127.0.0.1:4174/__incoming_gameplay/index.html?${route}&players=2&qaPetDragon=1&qaPetDragonMortal=1`});
    let state;
    for(let n=0;n<300;n++){state=await evaluate('window.incomingGameProbe?.snapshot()');if(state?.scene===sceneName&&!state.loading)break;await delay(100);}
    assert.equal(state?.scene,sceneName,JSON.stringify({state,errors}));
    await evaluate('incomingGameProbe.stop(); incomingGameProbe.keys([68,39],true)');
    const samples=[];let retreated=false;
    for(let n=0;n<150;n++) {
      await evaluate('incomingGameProbe.step(10)');
      state=await evaluate('incomingGameProbe.snapshot()');
      if(state.trace?.length) samples.push(state);
      if(state.trace?.some(e=>e.targetKind==='hero')&&!retreated){retreated=true;await evaluate('incomingGameProbe.keys([68,39],false);incomingGameProbe.keys([65,37],true);incomingGameProbe.step(25);incomingGameProbe.keys([65,37],false)');}
      if(state.objects?.some(o=>o.event.targetKind==='hero')&&(sceneName!=='Stage12Scene'||state.objects?.some(o=>o.event.targetKind==='pet')))break;
    }
    writeFileSync(path.join(out,`gameplay-${sceneName}.json`),JSON.stringify({state,samples},null,2)+'\n');
    const png=await command('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(out,`gameplay-${sceneName}.png`),Buffer.from(png.data,'base64'));
    console.log(JSON.stringify({scene:state.scene,trace:state.trace?.length,objects:state.objects?.length,errorCount:errors.length}));
    assert.ok(state.trace?.some(e=>e.targetKind==='hero'),`${sceneName}: no real hero hit`);
    if(sceneName==='Stage12Scene') assert.ok(state.trace?.some(e=>e.targetKind==='pet'),`${sceneName}: no real pet hit`);
    // Independent ANumber source parameters, already sampled by task 215. No production projection import.
    let checked=0;
    for(const sample of samples) for(const o of sample.objects) {
      const e=sample.trace.find(e=>e.eventId===o.event.eventId);assert.ok(e);
      const age=Math.max(0,(sample.timeMs-o.event.displayStartedAtMs)/1000);
      const alpha=(1-Math.min(1,Math.max(0,age-.25)))**2;
      assert.ok(Math.abs(o.scaleX-(1+3*(1-Math.min(1,age/.2))**2))<.0001,`${sceneName}: pop age ${age}`);
      assert.ok(Math.abs(o.alpha-alpha)<.0001,`${sceneName}: alpha age ${age}`);
      assert.equal(o.x,(e.worldAnchor.x-20)|0);
      assert.ok(Math.abs(o.y-(((e.worldAnchor.y-60)|0)-100*(1-alpha)))<.0001);
      assert.deepEqual(o.glyphs,[...String(e.displayValue)].map(d=>`combat-feedback.damage.incoming.${Number(d)||0}`));
      assert.equal(o.event.ownerSlot,e.ownerSlot);checked++;
    }
    const oldIds=state.trace.map(e=>e.eventId);
    await evaluate('incomingGameProbe.restart();incomingGameProbe.step(1)');
    let restart=await evaluate('incomingGameProbe.snapshot()');
    for(let n=0;n<300&&restart.loading;n++){await delay(100);restart=await evaluate('incomingGameProbe.snapshot()');}
    assert.equal(restart.scene,sceneName);assert.equal(restart.trace.length,0);assert.equal(restart.objects.length,0);
    await evaluate('incomingGameProbe.returnToSaves();incomingGameProbe.step(1)');
    const returned=await evaluate('incomingGameProbe.snapshot()');
    assert.equal(returned.scene,'SaveSlotScene');assert.equal(returned.trace.length,0);assert.equal(returned.objects.length,0);
    reports.push({scene:sceneName,producerKinds:[...new Set(state.trace.map(e=>e.producerKind))],owners:[...new Set(state.trace.map(e=>e.ownerSlot))],events:oldIds.length,visualStatesChecked:checked,restart,returned});
  }
  await command('Page.reload');
  let reloaded;
  for(let n=0;n<300;n++){reloaded=await evaluate('window.incomingGameProbe?.snapshot()');if(reloaded?.scene==='TestScene'){await evaluate('incomingGameProbe.stop()');break;}await delay(100);}
  assert.equal(reloaded.scene,'TestScene');assert.equal(reloaded.trace.length,0);assert.equal(reloaded.objects.length,0);
  assert.deepEqual(errors,[]);
  writeFileSync(path.join(out,'gameplay-verification.json'),JSON.stringify({status:'passed',viewport:{width:940,height:590},reports,reloaded,errors},null,2)+'\n');

} finally {
  socket?.close();edge.kill();
}
