import { build } from 'esbuild';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
if(!process.env.M30_SCENE || !process.env.M30_FPS || !process.env.M30_MODE) {
  for(const scene of ['TestScene','Stage13Scene'].filter(s=>!process.env.M30_SCENE||process.env.M30_SCENE===s))
  for(const fps of [20,24,30].filter(f=>!process.env.M30_FPS||Number(process.env.M30_FPS)===f))
  for(const mode of ['normal','fatal'].filter(m=>!process.env.M30_MODE||process.env.M30_MODE===m)) {
    const child=spawnSync(process.execPath,[process.argv[1]],{stdio:'inherit',env:{...process.env,M30_SCENE:scene,M30_FPS:String(fps),M30_MODE:mode}});
    if(child.status!==0)process.exit(child.status??1);
  }
  process.exit(0);
}
const dir=path.resolve('dist/__monster30');mkdirSync(dir,{recursive:true});
await build({entryPoints:['tools/monster30-browser-probe.ts'],bundle:true,format:'iife',outfile:path.join(dir,'probe.js'),logLevel:'silent',
 external:['/assets/*'],define:{'import.meta.env.DEV':'false','import.meta.env.PROD':'true','import.meta.env.MODE':'"production"','import.meta.env.BASE_URL':'"/"'},
 plugins:[{name:'observe-production',setup(b){
  b.onLoad({filter:/(?:Monster30System|Stage1CombatSystem|HeroPartyRuntimeBridge|Stage11MonsterVisualBridge)\.ts$/},args=>{
   let s=readFileSync(args.path,'utf8');
   if(args.path.endsWith('Monster30System.ts'))s=s.replace('  return monster;', '  (globalThis as any).monster30Observe?.monsters.push(monster); return monster;');
   if(args.path.endsWith('Stage1CombatSystem.ts'))s=s.replace('  initializeMonsterPetTargetEffects(enemy);', '  (globalThis as any).monster30Observe?.monsters.push(enemy); initializeMonsterPetTargetEffects(enemy);');
   if(args.path.endsWith('HeroPartyRuntimeBridge.ts'))s=s.replace('heroPartyRuntimeByScene.set(scene, runtime);', 'heroPartyRuntimeByScene.set(scene, runtime); (globalThis as any).monster30Observe?.parties.push({scene, runtime, model});');
   if(args.path.endsWith('Stage11MonsterVisualBridge.ts'))s=s.replace('    return view.visual.completed;', `    (globalThis as any).monster30Observe?.views.push({id:(combat as any).id,x:combat.x,y:combat.y,body:view.visual.action,tick:view.visual.actionTick,attacks: view.attacks.map(a=>({id:a.attackId,x:a.image.x,y:a.image.y,frame:a.frameIndex+1,key:a.image.texture.key})), expected:runtime?.attacks.map(a=>({id:a.attackId,x:a.x,y:a.y,frame:a.frame}))});
    return view.visual.completed;`);
   return {loader:'ts',contents:s};
  });
 }}]});
writeFileSync(path.join(dir,'index.html'),'<meta charset="utf-8"><link rel="icon" href="data:,"><style>body{margin:0}#game{width:940px;height:590px}</style><div id="game"></div><script src="probe.js"></script>');
const port=19000+process.pid%10000;
const edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check',
  `--remote-debugging-port=${port}`,`--user-data-dir=${path.resolve('.tmp/monster-experience-profile-'+port)}`,
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
  const out='docs/tasks/evidence/TASK-SLICE-240/browser';mkdirSync(out,{recursive:true});
  const reports=[];
  const routes=[['qaStage=1-1-role1','TestScene'],['qaStage=1-3','Stage13Scene']];
  for(const [route,name] of routes.filter(([,n])=>!process.env.M30_SCENE||process.env.M30_SCENE===n)) for(const fps of (process.env.M30_FPS?[Number(process.env.M30_FPS)]:[20,24,30])) for(const mode of ['normal','fatal'].filter(m=>!process.env.M30_MODE||process.env.M30_MODE===m)) {
    const url=`http://127.0.0.1:4174/__monster30/index.html?${route}&players=2`;
    await command('Page.navigate',{url:'about:blank'}); await delay(100); await command('Page.navigate',{url});
    for(let i=0;i<350;i++){if((await evaluate('window.monster30Probe?.ready()'))?.scene===name)break;await delay(100);}
    await evaluate(`monster30Probe.prepare(${fps},'monkey')`);await command('Page.navigate',{url:'about:blank'}); await delay(100); await command('Page.navigate',{url});
    let ready;
    for(let i=0;i<350;i++){ready=await evaluate('window.monster30Probe?.ready()');if(ready?.scene===name&&!ready.loading)break;await delay(100);}
    assert.equal(ready?.scene,name,JSON.stringify({ready,errors}));
    await evaluate(`monster30Probe.stop('${mode}')`);
    let state;
    for(let i=0;i<350;i++) {
      await evaluate('monster30Probe.step(20)');state=await evaluate('monster30Probe.snapshot()');
      if(state.events.filter(e=>mode==='normal'||e.sourceDead).some(e=>e.ownerSlot==='p1')&&state.events.filter(e=>mode==='normal'||e.sourceDead).some(e=>e.ownerSlot==='p2'))break;
    }
    const file=`${name}-${fps}-${mode}`;
    writeFileSync(`${out}/${file}.json`,JSON.stringify(state,null,2));
    const png=await command('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}/${file}.png`,Buffer.from(png.data,'base64'));
    for(const view of state.views)assert.deepEqual(view.attacks.map(({key,...v})=>v),view.expected??[],'Read-only display must match source-owned live attacks');
    assert(['p1','p2'].every(slot=>state.events.some(e=>e.ownerSlot===slot&&(mode==='normal'||e.sourceDead))),JSON.stringify({file,events:state.events.slice(-10),injected:state.injected,heroes:state.heroes,monsters:state.monsters.slice(-8),errors}));
    assert(await evaluate('monster30Probe.pauseCheck()'),'real Scene pause holds body and attacks');
    if(process.env.M30_VISUAL) {
      mkdirSync(`${out}/visual`,{recursive:true});
      for(const sign of [1,-1]) for(let frame=1;frame<=10;frame++) {
        const info=await evaluate(`monster30Probe.visual(${frame},${sign})`); if(frame===1)console.log(JSON.stringify({...info,png:undefined,texturePng:undefined}));
        writeFileSync(`${out}/visual/f${frame}-s${sign}.png`,Buffer.from(info.png.split(',')[1],'base64')); if(frame===1)writeFileSync(`${out}/visual/texture.png`,Buffer.from(info.texturePng.split(',')[1],'base64'));
      }
      await evaluate('monster30Probe.endVisual()');
    }
    await evaluate('monster30Probe.restart()');await delay(250);
    for(let i=0;i<350;i++){ const r=await evaluate('monster30Probe.ready()'); if(r.scene===name&&!r.loading)break; await delay(100); }
    let reloaded=await evaluate('monster30Probe.snapshot()');
    assert(reloaded.monsters.slice(0,state.monsters.length).filter(m=>m.runtime).every(m=>m.runtime.destroyed),'Retry releases old attack owners: '+JSON.stringify({file,ready:await evaluate('monster30Probe.ready()'),remaining:reloaded.monsters.slice(0,state.monsters.length).filter(m=>m.runtime&&!m.runtime.destroyed)}));
    await evaluate('monster30Probe.return()');await delay(150);
    reloaded=await evaluate('monster30Probe.snapshot()');assert(reloaded.monsters.every(m=>!m.runtime||m.runtime.destroyed),'Return releases all attack owners: '+JSON.stringify({ready:await evaluate('monster30Probe.ready()'),remaining:reloaded.monsters.filter(m=>m.runtime&&!m.runtime.destroyed)}));
    assert((await evaluate('monster30Probe.ready()')).scenes.includes('HeavenMapScene'),'Return uses the formal map route');
    await evaluate('monster30Probe.reenter()');
    for(let i=0;i<350;i++){const r=await evaluate('monster30Probe.ready()'); if(r.scene===name&&!r.loading)break;await delay(100);}
    const reentered=await evaluate('monster30Probe.snapshot()'); assert.equal(reentered.scene,name);
    assert.equal(reentered.heroes.length,2); assert(reentered.monsters.slice(0,state.monsters.length).every(m=>!m.runtime||m.runtime.destroyed));
    reports.push({file,mapReentry:true,eventCapture:'first-observation',pauseEntry:true,retryCleanup:true,returnCleanup:true,frames:state.ticks,events:state.events.length,sourceDeadHits:state.events.filter(e=>e.sourceDead).length,owners:[...new Set(state.events.map(e=>e.ownerSlot))],displayStates:state.views.length});
    console.log(JSON.stringify(reports.at(-1)));
  }
  assert.equal(errors.length,0,JSON.stringify(errors));writeFileSync(`${out}/verification-${process.env.M30_SCENE??'all'}-${process.env.M30_FPS??'all'}-${process.env.M30_MODE??'all'}.json`,JSON.stringify({status:'passed',reports,errors},null,2));
} finally {socket?.close();edge.kill();}
