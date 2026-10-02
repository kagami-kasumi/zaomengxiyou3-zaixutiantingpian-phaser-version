import { createServer } from 'node:http';
import { mutationPlugin } from './pet-passive-display-mutations.mjs';
const mutant=process.argv.find(a=>a.startsWith('--mutant='))?.split('=')[1];
const firstOnly=process.argv.includes('--first-only');
const familyArg=process.argv.find(a=>a.startsWith('--family='))?.split('=')[1];
import {gunzipSync} from 'node:zlib';
import {copyFileSync} from 'node:fs';
import {build} from 'esbuild';
import {spawn} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir='.tmp/pet-passive-formal'+(mutant?'-'+mutant:familyArg?'-'+familyArg:firstOnly?'-first-phase':''),out='docs/tasks/evidence/TASK-SLICE-245B'+(mutant?'/'+mutant:familyArg?'/family-'+familyArg:firstOnly?'/first-phase':'');mkdirSync(dir,{recursive:true});mkdirSync(out,{recursive:true});
const source=JSON.parse(gunzipSync(readFileSync('docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz')));
const oracle={};const find=(n,t)=>n.type===t?n:n.children.map(c=>find(c,t)).find(Boolean);
for(const r of source.rows){const [effect,profile]=r.id.split('-'),node=find(r.display,'buff_'+effect),pet=['sxkb','fsnl'].includes(effect);
 if(!node)continue;const host=r.display.children.find(n=>n.name==='host');if(pet&&host.alpha!==1)continue;
 const sign=pet?r.hostMatrix.a:r.bullets[0].a<0?-1:1;
 const fx=r.hostMatrix.x-Math.floor(r.hostMatrix.x),fy=r.hostMatrix.y-Math.floor(r.hostMatrix.y);
 const key=[effect,profile,node.frame,sign<0?-1:1,fx,fy].join(':');
 if(!oracle[key]){const file='native-'+r.captureSha256+'.png';copyFileSync(r.capture,dir+'/'+file);oracle[key]={file,x:r.crop.left-Math.floor(r.hostMatrix.x),y:r.crop.top-Math.floor(r.hostMatrix.y)};}}
writeFileSync(dir+'/oracle.json',JSON.stringify(oracle));
await build({entryPoints:['tools/pet-passive-formal-probe.ts'],bundle:true,format:'iife',outfile:dir+'/probe.js',external:['/assets/*'],logLevel:'silent',
 define:{'import.meta.env.DEV':'false','import.meta.env.PROD':'true','import.meta.env.MODE':'"production"','import.meta.env.BASE_URL':'"/"'},
 plugins:[...(mutant?[mutationPlugin(mutant)]:[]),{name:'observe-existing-party',setup(b){b.onLoad({filter:/PetPassiveDisplayBridge\.ts$/},args=>({loader:'ts',contents:readFileSync(args.path,'utf8').replace('constructor(private readonly scene: Phaser.Scene) {','constructor(private readonly scene: Phaser.Scene) { (globalThis as any).__passiveRaw=this;')}));b.onLoad({filter:/HeroPartyRuntimeBridge\.ts$/},args=>({loader:'ts',contents:readFileSync(args.path,'utf8').replace('const passiveDisplay = createHeroPartyPassiveDisplayBridge(scene);','const passiveDisplay = createHeroPartyPassiveDisplayBridge(scene); (globalThis as any).__passiveDisplay = passiveDisplay;').replace('heroPartyRuntimeByScene.set(scene, runtime);','heroPartyRuntimeByScene.set(scene, runtime); (globalThis as any).__passiveParty = runtime;')}));}}]});
writeFileSync(dir+'/index.html','<html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="probe.css"></head><body><div id="game"></div><script src="probe.js"></script></body></html>');
const server=createServer((req,res)=>{try{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html';const base=path.resolve(relative.startsWith('assets/')?'public':dir);const file=path.resolve(base,relative);if(!file.startsWith(base+path.sep))throw Error('path');res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.json')?'application/json':file.endsWith('.png')?'image/png':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.jpg')?'image/jpeg':file.endsWith('.webp')?'image/webp':file.endsWith('.html')?'text/html':'application/octet-stream');res.end(readFileSync(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const appPort=server.address().port;
const port = 9451 + process.pid % 1000;
const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--no-first-run', '--no-default-browser-check', '--window-size=940,680',
  `--remote-debugging-port=${port}`, `--user-data-dir=${path.resolve(`.tmp/pet-passive-profile-${process.pid}`)}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket, id = 0;
const pending = new Map(), errors = [], reports = [], journeys = [];
const failedRequests = [], contexts = [], requestUrls = new Map();
let phase = 'startup';
async function command(method, params = {}) {
  const key = ++id;
  const result = new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(key); reject(Error(`CDP timeout ${method}: ${params.expression ?? phase}`)); }, 60000);
    pending.set(key, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
  });
  socket.send(JSON.stringify({ id: key, method, params })); return result;
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function settleAssets(){
 await evaluate('window.assetsReady=false;window.assetsError=null;passiveProbe.settleAssets().then(()=>window.assetsReady=true).catch(e=>window.assetsError=String(e));true');
 await until('window.assetsReady||window.assetsError','hero background bundles');assert.equal(await evaluate('window.assetsError'),null);
}
async function compareVisuals(){
 await evaluate('window.pixelResult=null;window.pixelError=null;passiveProbe.compareVisuals().then(r=>window.pixelResult=r).catch(e=>window.pixelError=e.stack);true');
 await until('window.pixelResult||window.pixelError','native pixel projection',false);
 const error=await evaluate('window.pixelError');assert(!error,error);
 return evaluate('window.pixelResult');
}
async function until(expression, description, pump=true) {
  for (let i = 0; i < 600; i++) {
    assert.equal(errors.length,0,JSON.stringify(errors));if (await evaluate(expression)) return;
    // The probe already owns a manual Game clock for pixel comparisons. Keep
    // readiness on that same clock instead of waiting on a stalled headless RAF.
    if(pump)await evaluate('window.passiveProbe?.pump()');else if(i%50===0)console.log('pixel wait '+phase+': '+JSON.stringify(await evaluate('window.pixelProgress')));
    await delay(100);
  }
  const snapshot = await evaluate('window.passiveProbe?.snapshot()');
  writeFileSync(`${out}/timeout-diagnostic.json`, JSON.stringify({ description, expression, phase, snapshot, errors, failedRequests }, null, 2) + '\n');
  throw Error(`Timeout ${description}: ${JSON.stringify(errors)}`);
}
try {
  let page;
  for (let i = 0; i < 100; i++) {
    try { page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(row => row.type === 'page'); } catch {}
    if (page) break; await delay(100);
  }
  assert(page);
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) { const waiter = pending.get(message.id); pending.delete(message.id); if (message.error) waiter?.reject(message.error); else waiter?.resolve(message.result); }
    else if (message.method === 'Runtime.exceptionThrown') errors.push({ ...message.params, phase });
    else if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) errors.push({ ...message.params, phase });
    else if (message.method === 'Runtime.executionContextCreated') contexts.push({ ...message.params.context, phase });
    else if (message.method === 'Network.requestWillBeSent') requestUrls.set(message.params.requestId, message.params.request.url);
    else if (message.method === 'Network.loadingFailed') failedRequests.push({ ...message.params,
      url: requestUrls.get(message.params.requestId), phase });
  });
  await command('Runtime.enable'); await command('Page.enable'); await command('Network.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 940, height: 590, deviceScaleFactor: 1, mobile: false });
  let index=0;
  for(const [route,scene] of [['qaStage=1-1-role1','TestScene'],['qaStage=1-2','Stage12Scene'],['qaStage=1-3','Stage13Scene'],['qaStage=2-1','Stage21Scene'],['qaBossState=wait&qaNoDamage=1','Stage22Scene']]){
   phase=scene;await command('Page.navigate',{url:`http://127.0.0.1:${appPort}/index.html?${route}&players=2`});
   await until(`window.passiveProbe?.snapshot().scene==='${scene}'`,scene);
   await until('window.passiveProbe?.ready()','background assets');await settleAssets();
   if(familyArg&&index>0)break;const family=familyArg??(index%2?'horse':'monkey'),form=familyArg==='turtle'?3:index%4+1;index++;
   await evaluate(`passiveProbe.install('${family}',${form})`);
   await until(`Object.values(passiveProbe.snapshot().pets??{}).filter(p=>p.species==='${family}'&&p.petId?.startsWith('passive-')).length===2`,'both new pet owners');
   let before=await evaluate('passiveProbe.snapshot()');
   const count=before.pets.p1.passive.counts[0];assert(count>0&&count<=300);
   await evaluate(`passiveProbe.step(${count-1})`);before=await evaluate('passiveProbe.snapshot()');
   assert.equal(before.pets.p1.passive.counts[0],1);
   assert.equal(before.pets.p2.passive.counts[0],1);
   assert(before.heroes.every(h=>h.effects.effects.every(e=>e===null)));
   writeFileSync(`${out}/before-${scene}.png`,Buffer.from(await evaluate('passiveProbe.capture()'),'base64'));
   await evaluate('passiveProbe.step(1)');const trigger=await evaluate('passiveProbe.snapshot()');
   assert.deepEqual(trigger.pets.p1.passive.counts,[4320,5400,5400,5400,5400,5400]);
   assert.equal(trigger.roster.p1.mp,before.roster.p1.mp-120);
   if(firstOnly){
    assert.equal(trigger.visual.pets.length,4);assert.equal(trigger.visual.heroes.length,0);
    const firstPixels=await compareVisuals();assert.equal(firstPixels.length,4);assert(firstPixels.every(p=>p.bad===0),JSON.stringify(firstPixels));
    writeFileSync(`${out}/first-${scene}.png`,Buffer.from(await evaluate('passiveProbe.capture()'),'base64'));
    await evaluate('passiveProbe.step(1);passiveProbe.pause(3)');
    const paused=await evaluate('passiveProbe.snapshot()'),pausedPixels=await compareVisuals();assert.equal(pausedPixels.length,12);assert(pausedPixels.every(p=>p.bad===0),JSON.stringify(pausedPixels));
    reports.push({scene,family,form,trigger,firstPixels,paused,pausedPixels});console.log(scene+': first/pause native pixels passed');continue;
   }
   await evaluate('passiveProbe.step(1)');const active=await evaluate('passiveProbe.snapshot()');
   for(const hero of active.heroes)assert.equal(hero.effects.effects.filter(Boolean).length,4);
   for(const hud of active.hud){assert(active.texts.some(t=>t.text===hud.hpText),scene+' visible hero HP');assert(active.texts.some(t=>t.text===hud.mpText),scene+' visible hero MP');assert(active.texts.some(t=>t.text===hud.pet.hpText),scene+' visible pet HP');assert(active.texts.some(t=>t.text===hud.pet.mpText),scene+' visible pet MP');}
   const activePixels=await compareVisuals();assert(activePixels.every(p=>p.bad===0),'formal-native-pixels '+JSON.stringify(activePixels));
   writeFileSync(`${out}/active-${scene}.png`,Buffer.from(await evaluate('passiveProbe.capture()'),'base64'));
   await evaluate('passiveProbe.step(5,0)');const zeroDelta=await evaluate('passiveProbe.snapshot()');assert.deepEqual(zeroDelta.pets.p1.passive,active.pets.p1.passive);
   assert.equal(active.visual.pets.length,4);assert.equal(active.visual.heroes.length,8);
   const visualRows=await evaluate('passiveProbe.visuals()');assert.equal(visualRows.length,12);for(const v of visualRows){assert(Math.abs(v.projection.offsetX)<=.5&&Math.abs(v.projection.offsetY)<=.5);}
   await evaluate('passiveProbe.pause(3)');const paused=await evaluate('passiveProbe.snapshot()');assert.deepEqual(paused.visual.heroes,zeroDelta.visual.heroes);assert(paused.visual.pets[0].frame>zeroDelta.visual.pets[0].frame);
   writeFileSync(`${out}/paused-${scene}.png`,Buffer.from(await evaluate('passiveProbe.capture()'),'base64'));
   await evaluate("passiveProbe.rest('p1');passiveProbe.step(1)");const resting=await evaluate('passiveProbe.snapshot()');assert.equal(resting.pets.p1.petId,undefined);assert(resting.heroes[0].effects.effects.some(Boolean));assert.equal(resting.visual.heroes.filter(h=>h.id==='p1').length,4,'pet-rest-owner-survival');
   const restPixels=await compareVisuals();assert(restPixels.every(p=>p.bad===0),JSON.stringify(restPixels));
   writeFileSync(`${out}/rest-${scene}.png`,Buffer.from(await evaluate('passiveProbe.capture()'),'base64'));
   await evaluate(`passiveProbe.install('${family}',${form===4?1:form+1})`);const swapped=await evaluate('passiveProbe.snapshot()');assert.equal(swapped.visual.heroes.filter(h=>h.id==='p1').length,4);
   await evaluate('passiveProbe.step(800)');const expired=await evaluate('passiveProbe.snapshot()');assert(expired.heroes[0].effects.effects.every(e=>e===null));assert.equal(expired.visual.pets.length,0);assert.equal(expired.visual.heroes.length,0);
   writeFileSync(`${out}/expired-${scene}.png`,Buffer.from(await evaluate('passiveProbe.capture()'),'base64'));
   await evaluate('passiveProbe.fail();passiveProbe.result("retry")');await until(`window.passiveProbe?.snapshot().scene==='${scene}'`,'actual retry');assert(await evaluate('passiveProbe.oldReleased()'));
   await until('window.passiveProbe?.ready()','retry background assets');await settleAssets();
   await evaluate('passiveProbe.fail();passiveProbe.result("back")');await until('!passiveProbe.snapshot().scene','actual back');assert(await evaluate('passiveProbe.oldReleased()'));
   await command('Page.reload');await until(`window.passiveProbe?.snapshot().scene==='${scene}'`,'reload');await until('window.passiveProbe?.ready()','reload assets');await settleAssets();const reloaded=await evaluate('passiveProbe.snapshot()');assert.equal(reloaded.visual.pets.length,0);assert.equal(reloaded.visual.heroes.length,0);
   console.log(scene+': formal lifecycle and native pixels passed');
   reports.push({scene,family,form,before,trigger,active,paused,resting,swapped,expired,visualRows,activePixels,restPixels,retry:true,back:true,reload:true});
  }
  assert.deepEqual(errors,[]);writeFileSync(out+'/formal-browser.json',JSON.stringify({status:'passed',viewport:{width:940,height:590},capture:'actual-game-canvas',reports,errors},null,2)+'\n');
}catch(error){const expected={'rest-clears-owner':'pet-rest-owner-survival','local-rounding':'formal-native-pixels','roster-snapshot-mismatch':'Duplicate pet display identity'}[mutant];if(!expected||!String(error).includes(expected))throw error;writeFileSync(out+'/mutation.json',JSON.stringify({status:'rejected',mutant,error:String(error)}));console.log(mutant+': rejected '+expected);}finally{
 writeFileSync(out+'/formal-browser-diagnostic.json',JSON.stringify({phase,errors,failedRequests,completed:reports.length},null,2));
 if(socket?.readyState===WebSocket.OPEN)await command('Browser.close').catch(()=>{});socket?.close();edge.kill();server.closeAllConnections();await new Promise(r=>server.close(r));
}
