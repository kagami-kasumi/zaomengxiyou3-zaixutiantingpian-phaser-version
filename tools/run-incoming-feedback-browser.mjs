import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

// A local test page in ignored dist. Never part of the application router or production source build.
const dir=path.resolve('dist/__incoming_probe');
const mutation=process.argv.includes('--mutation');
mkdirSync(dir,{recursive:true});
await build({entryPoints:['tools/incoming-feedback-browser-probe.ts'],bundle:true,format:'iife',
  outfile:path.join(dir,'probe.js'),logLevel:'silent',plugins:mutation?[{
    name:'disable-native-sampling',
    setup(b){b.onLoad({filter:/IncomingDamageBitmapSampling.ts$/},()=>({
      contents:'export function useIncomingDamageBitmapSampling() {}',loader:'ts',
    }));},
  }]:[]});
writeFileSync(path.join(dir,'index.html'),'<html><head><link rel="icon" href="data:,"></head><body style="margin:0"><script src="probe.js"></script></body></html>');
const out=path.resolve('.tmp/verification-images/TASK-SLICE-216A',mutation?'browser-no-sampling':'browser');
mkdirSync(out,{recursive:true});
const port=9436;
const edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check',
  '--disable-background-timer-throttling','--disable-renderer-backgrounding',
  '--enable-unsafe-swiftshader',
  `--remote-debugging-port=${port}`,`--user-data-dir=${path.resolve('.tmp/incoming-browser-profile')}`,
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
  const inputs=[];
  for(const kind of ['hero','pet']) for(const owner of ['P1','P2']) for(const t of [0,.1,.2,.25,.75,1.249,1.25])
    inputs.push({id:`${kind}-${owner}-${t}`,t,displayValue:123,targetKind:kind,ownerSlot:owner.toLowerCase(),
      worldAnchor:{x:owner==='P1'?300:680,y:kind==='hero'?350:430}});
  for(const n of [-12,0,10,1234567890])inputs.push({id:`direct-value-${n}`,t:0,displayValue:n,
    targetKind:'hero',ownerSlot:'p1',worldAnchor:{x:470,y:350}});
  inputs.push({id:'explicit-destroy',t:0,displayValue:123,targetKind:'hero',ownerSlot:'p1',worldAnchor:{x:470,y:350},destroy:true});
  inputs.push({id:'camera-hero-P2',sourceId:'hero-P2-0.2',t:.2,displayValue:123,targetKind:'hero',ownerSlot:'p2',
    worldAnchor:{x:803,y:395},cameraX:123,cameraY:45});
  const runs=[];
  for(const renderer of ['webgl','canvas']) {
    await command('Page.navigate',{url:`http://127.0.0.1:4174/__incoming_probe/index.html?renderer=${renderer}`});
    let ready=false;
    for(let n=0;n<200;n++){ready=await evaluate('window.probeReady === true');if(ready)break;await delay(50);}
    assert.ok(ready,'probe never became ready');
    for(const input of inputs) {
      const call={...input,eventId:input.id,targetId:`${input.targetKind}-${input.ownerSlot}`};
      await evaluate(`incomingProbe.show(${JSON.stringify(call)},${input.t});${input.destroy?'incomingProbe.destroy();':''}`);
      await evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
      const objects=await evaluate('incomingProbe.measure()');
      const png=await evaluate('incomingProbe.image()');
      const imagePath=path.join(out,`${renderer}-${input.id}.png`);
      writeFileSync(imagePath,Buffer.from(png.split(',')[1],'base64'));
      runs.push({id:input.id,sourceId:input.sourceId,renderer,objects,cameraX:input.cameraX??0,cameraY:input.cameraY??0,
        imagePath:path.relative(process.cwd(),imagePath).replaceAll('\\','/')});
    }
  }
  assert.deepEqual(errors,[],'browser warnings/errors');
  writeFileSync(path.join(out,'measurement.json'),JSON.stringify({scope:'Actual production Phaser view, display API only; no damage execution claim',runs,errors},null,2)+'\n');
  console.log(`216A browser: ${runs.length} actual Phaser WebGL/Canvas states, zero warning/error`);
} finally {
  socket?.close();edge.kill();
}
