import {build} from 'esbuild';
import {spawn} from 'node:child_process';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir='dist/__pet_passive',out='docs/tasks/evidence/TASK-SLICE-242B';mkdirSync(dir,{recursive:true});mkdirSync(out,{recursive:true});
await build({entryPoints:['tools/pet-passive-browser/probe.ts'],bundle:true,format:'iife',outfile:dir+'/probe.js',external:['/assets/*'],logLevel:'silent',
 define:{'import.meta.env.DEV':'false','import.meta.env.PROD':'true','import.meta.env.MODE':'"production"','import.meta.env.BASE_URL':'"/"'},
 plugins:[{name:'observe-existing-party',setup(b){b.onLoad({filter:/HeroPartyRuntimeBridge\.ts$/},args=>({loader:'ts',contents:readFileSync(args.path,'utf8').replace('heroPartyRuntimeByScene.set(scene, runtime);','heroPartyRuntimeByScene.set(scene, runtime); (globalThis as any).__passiveParty = runtime;')}));}}]});
writeFileSync(dir+'/index.html','<html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="probe.css"></head><body><div id="game"></div><script src="probe.js"></script></body></html>');
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
async function until(expression, description) {
  for (let i = 0; i < 600; i++) {
    if (await evaluate(expression)) return;
    // The probe already owns a manual Game clock for pixel comparisons. Keep
    // readiness on that same clock instead of waiting on a stalled headless RAF.
    await evaluate('window.passiveProbe?.pump()');
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
   phase=scene;await command('Page.navigate',{url:`http://127.0.0.1:4174/__pet_passive/index.html?${route}&players=2`});
   await until(`window.passiveProbe?.snapshot().scene==='${scene}'`,scene);
   await until('passiveProbe.ready()','background assets');
   const family=index%2?'horse':'monkey',form=index%4+1;index++;
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
   await evaluate('passiveProbe.step(1)');const active=await evaluate('passiveProbe.snapshot()');
   for(const hero of active.heroes)assert.equal(hero.effects.effects.filter(Boolean).length,4);
   for(const hud of active.hud){assert(active.texts.some(t=>t.text===hud.hpText),scene+' visible hero HP');assert(active.texts.some(t=>t.text===hud.mpText),scene+' visible hero MP');assert(active.texts.some(t=>t.text===hud.pet.hpText),scene+' visible pet HP');assert(active.texts.some(t=>t.text===hud.pet.mpText),scene+' visible pet MP');}
   writeFileSync(`${out}/active-${scene}.png`,Buffer.from(await evaluate('passiveProbe.capture()'),'base64'));
   await evaluate('passiveProbe.step(5,0)');const paused=await evaluate('passiveProbe.snapshot()');assert.deepEqual(paused.pets.p1.passive,active.pets.p1.passive);
   await evaluate("passiveProbe.rest('p1');passiveProbe.step(1)");const resting=await evaluate('passiveProbe.snapshot()');assert.equal(resting.pets.p1.petId,undefined);assert(resting.heroes[0].effects.effects.some(Boolean));
   await evaluate('passiveProbe.step(500)');const expired=await evaluate('passiveProbe.snapshot()');assert(expired.heroes[0].effects.effects.every(e=>e===null));
   writeFileSync(`${out}/expired-${scene}.png`,Buffer.from(await evaluate('passiveProbe.capture()'),'base64'));
   await evaluate('passiveProbe.fail();passiveProbe.result("retry")');await until(`passiveProbe.snapshot().scene==='${scene}'`,'actual retry');assert(await evaluate('passiveProbe.oldReleased()'));
   await until('passiveProbe.ready()','retry background assets');
   await evaluate('passiveProbe.fail();passiveProbe.result("back")');await until('!passiveProbe.snapshot().scene','actual back');assert(await evaluate('passiveProbe.oldReleased()'));
   reports.push({scene,family,form,before,trigger,active,expired,retry:true,back:true});
  }
  assert.deepEqual(errors,[]);writeFileSync(out+'/browser.json',JSON.stringify({status:'passed',viewport:{width:940,height:590},capture:'actual-game-canvas',reports,errors},null,2)+'\n');
}finally{
 writeFileSync(out+'/browser-diagnostic.json',JSON.stringify({phase,errors,failedRequests,completed:reports.length},null,2));
 if(socket?.readyState===WebSocket.OPEN)await command('Browser.close').catch(()=>{});socket?.close();edge.kill();
}
