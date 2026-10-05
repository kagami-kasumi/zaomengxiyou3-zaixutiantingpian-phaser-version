import { build } from 'esbuild';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const previewUrl = 'http://127.0.0.1:4174/';
try {
  const response = await fetch(previewUrl, { signal: AbortSignal.timeout(5000) });
  assert(response.ok, `HTTP ${response.status}`);
} catch (error) {
  throw new Error(`Monster3 browser acceptance requires npm run preview at ${previewUrl}`, { cause: error });
}
if(!process.env.M3_SCENE || !process.env.M3_FPS || !process.env.M3_MODE) {
  for(const scene of ['TestScene','Stage13Scene'].filter(s=>!process.env.M3_SCENE||process.env.M3_SCENE===s))
  for(const fps of [20,24,30].filter(f=>!process.env.M3_FPS||Number(process.env.M3_FPS)===f))
  for(const mode of ['normal','fatal'].filter(m=>!process.env.M3_MODE||process.env.M3_MODE===m)) {
    const child=spawnSync(process.execPath,[process.argv[1]],{stdio:'inherit',env:{...process.env,M3_SCENE:scene,M3_FPS:String(fps),M3_MODE:mode}});
    if(child.status!==0)process.exit(child.status??1);
  }
  process.exit(0);
}
const probeDirectory=`__monster3-${process.pid}`;
const dir=path.resolve('dist',probeDirectory);mkdirSync(dir,{recursive:true});
await build({entryPoints:['tools/monster3-browser-probe.ts'],bundle:true,format:'iife',outfile:path.join(dir,'probe.js'),logLevel:'silent',
 external:['/assets/*'],define:{'import.meta.env.DEV':'false','import.meta.env.PROD':'true','import.meta.env.MODE':'"production"','import.meta.env.BASE_URL':'"/"'},
 plugins:[{name:'observe-production',setup(b){
  b.onLoad({filter:/(?:Stage13GameplayBridge|Monster3AttackView|Monster3AttackProjection|TestSceneViews|LevelLifecycleSystem|LevelResultView|Monster3BossCombatAdapter|Monster30System|Stage1CombatSystem|HeroPartyRuntimeBridge|Stage11MonsterVisualBridge)\.ts$/},args=>{
   let s=readFileSync(args.path,'utf8');
   if(args.path.endsWith('HeroPartyRuntimeBridge.ts')) s=s.replace('resolveEnemyAttack: (enemy, timeMs) => {',
     'resolveEnemyAttack: (enemy, timeMs) => { if(enemy.enemyType===3)(globalThis as any).monster3Observe.legacyMonster3Calls++;');
   if(args.path.endsWith('Stage13GameplayBridge.ts')&&process.env.M3_SCENE_MUTATION==='legacy-route') {
    const before='if (monster.combat.enemyType !== 3) heroes.resolveEnemyAttack';
    assert.equal(s.split(before).length,2);s=s.replace(before,'if (true) heroes.resolveEnemyAttack');
   }
   if(process.env.M3_VISUAL_MUTATION) {
    const variants={
      'display-origin':['Monster3AttackView.ts','setOrigin(0, 0)','setOrigin(0.5, 0)'],
      'display-alpha':['Monster3AttackView.ts','setAlpha(1)','setAlpha(0.5)'],
      'display-direction':['Monster3AttackProjection.ts','attack.facingX === -1 ? 1 : -1','attack.facingX === -1 ? -1 : 1'],
      'display-frame':['Monster3AttackProjection.ts','p.frame === attack.frame','p.frame === (attack.frame === 1 ? 2 : attack.frame)'],
    };
    const [file,before,after]=variants[process.env.M3_VISUAL_MUTATION]??[];
    assert(file,'Known display mutant');
    if(args.path.endsWith(file)) {assert.equal(s.split(before).length,2);s=s.replace(before,after);}
   }
   if(args.path.endsWith('TestSceneViews.ts') && process.env.PET_RECEPTION_MUTATION) {
    const variants={direction:['runtime.facingX === 1 ? 1 : 0','runtime.facingX === 1 ? 0 : 1'],registration:['setPosition(pose.x, pose.y)','setPosition(pose.x + 2, pose.y)']};
    const [before,after]=variants[process.env.PET_RECEPTION_MUTATION]??[];
    assert(before && s.split(before).length===2,'Unique production display mutation target');s=s.replace(before,after);
   }
   if(args.path.endsWith('LevelLifecycleSystem.ts'))s+=`\nconst originalFailureUpdate = LevelLifecycle.prototype.updatePartyFailure;
LevelLifecycle.prototype.updatePartyFailure = function(alive, delta) {
 const result = originalFailureUpdate.call(this, alive, delta), o = (globalThis as any).monster3Observe;
 if(o?.failureMode)o.flows.push({tick:o.tick,alive,delta,phase:this.phase,remaining:this.failureDelayRemainingMs});
 return result;
};`;
   if(args.path.endsWith('LevelResultView.ts'))s=s.replace("  const isClear = options.result === 'cleared';", "  const o = (globalThis as any).monster3Observe; if(o?.failureMode)o.results.push({tick:o.tick,result:options.result});\n  const isClear = options.result === 'cleared';");
   if(args.path.endsWith('Monster3BossCombatAdapter.ts'))s=s.replace('  return {', '  const adapter: Stage1CombatEnemy = {').replace(/  };\r?\n}/, '  }; (globalThis as any).monster3Observe?.boss(boss, adapter); return adapter;\n}');
   if(args.path.endsWith('Monster30System.ts'))s=s.replace('  return monster;', '  (globalThis as any).monster3Observe?.monsters.push(monster); return monster;');
   if(args.path.endsWith('Stage1CombatSystem.ts'))s=s.replace('  initializeMonsterPetTargetEffects(enemy);', '  (globalThis as any).monster3Observe?.monsters.push(enemy); initializeMonsterPetTargetEffects(enemy);');
   if(args.path.endsWith('HeroPartyRuntimeBridge.ts'))s=s.replace('heroPartyRuntimeByScene.set(scene, runtime);', 'heroPartyRuntimeByScene.set(scene, runtime); (globalThis as any).monster3Observe?.parties.push({scene, runtime, model, petRosters});');
   if(args.path.endsWith('Stage11MonsterVisualBridge.ts'))s=s.replace('    syncMonster3AttackViews(scene, view.monster3Attacks, runtime);', `    syncMonster3AttackViews(scene, view.monster3Attacks, runtime);
    (globalThis as any).monster3Observe?.views.push({body:view.visual.action,tick:view.visual.actionTick,attacks:[...view.monster3Attacks].map(([id,image])=>({id,key:image.texture.key,x:image.x,y:image.y})),expected:runtime.attacks.map(a=>({id:a.id,action:a.action,frame:a.frame}))});`);
   return {loader:'ts',contents:s};
  });
 }}]});
writeFileSync(path.join(dir,'index.html'),'<meta charset="utf-8"><link rel="icon" href="data:,"><style>body{margin:0}#game{width:940px;height:590px}</style><div id="game"></div><script src="probe.js"></script>');
const port=19000+process.pid%10000;
const edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check',
  '--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows',
  `--remote-debugging-port=${port}`,`--user-data-dir=${path.resolve('.tmp/monster-experience-profile-'+port)}`,
  'about:blank',
],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let socket;let verificationPath;let id=0;const pending=new Map();const errors=[];
async function command(method,params={}) {
  if (method === 'Page.captureScreenshot' && (process.env.PARTY_RETIREMENT || process.env.M3_FAILURE)) {
    return { data: await evaluate('monster3Probe.capture()') };
  }
  const key=++id;
  const result=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(key);reject(Error(`CDP timeout: ${method}`));},60000);
    pending.set(key,{resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});
  });
  socket.send(JSON.stringify({id:key,method,params}));return result;
}
async function evaluate(expression) {
  let result;
  try { result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true}); }
  catch(error) { mkdirSync('docs/tasks/evidence/TASK-SLICE-249B/browser',{recursive:true}); writeFileSync('docs/tasks/evidence/TASK-SLICE-249B/browser/last-probe-failure.json',JSON.stringify({expression,error:String(error),errors},null,2)); throw error; }
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
  const out=process.env.PARTY_RETIREMENT ? 'docs/tasks/evidence/TASK-SLICE-259/browser' : process.env.PET_RECEPTION_SCENE||process.env.PET_RECEPTION_VISUAL
    ? 'docs/tasks/evidence/TASK-SLICE-255/browser' : 'docs/tasks/evidence/TASK-SLICE-249B/browser';mkdirSync(out,{recursive:true});
  verificationPath=`${out}/verification-${process.env.M3_SCENE??'all'}-${process.env.M3_FPS??'all'}-${process.env.M3_MODE??'all'}${process.env.M3_FAILURE?'--failure':''}${process.env.M3_VISUAL?'--visual':''}${process.env.M3_PET_SPECIES?'--'+process.env.M3_PET_SPECIES:''}${process.env.M3_VISUAL_MUTATION?'--'+process.env.M3_VISUAL_MUTATION:''}${process.env.M3_SCENE_MUTATION?'--'+process.env.M3_SCENE_MUTATION:''}${process.env.PET_RECEPTION_MUTATION?'--'+process.env.PET_RECEPTION_MUTATION:''}.json`;
  writeFileSync(verificationPath,JSON.stringify({status:'running',startedAt:new Date().toISOString()}));
  const reports=[];
  const routes=[['qaStage=1-1-role1','TestScene'],['qaStage=1-3','Stage13Scene']];
  for(const [route,name] of routes.filter(([,n])=>!process.env.M3_SCENE||process.env.M3_SCENE===n)) for(const fps of (process.env.M3_FPS?[Number(process.env.M3_FPS)]:[20,24,30])) for(const mode of ['normal','fatal'].filter(m=>!process.env.M3_MODE||process.env.M3_MODE===m)) {
    const url=`http://127.0.0.1:4174/${probeDirectory}/index.html?${route}&players=2`;
    await command('Page.navigate',{url:'about:blank'}); await delay(100); await command('Page.navigate',{url});
    await command('Page.bringToFront');
    for(let i=0;i<350;i++){if((await evaluate('window.monster3Probe?.ready()'))?.scene===name)break;await delay(100);}
    await evaluate(`monster3Probe.prepare(${fps},${JSON.stringify(process.env.M3_PET_SPECIES??'monkey')})`);await command('Page.navigate',{url:'about:blank'}); await delay(100); await command('Page.navigate',{url});
    await command('Page.bringToFront');
    let ready;
    for(let i=0;i<350;i++){ready=await evaluate('window.monster3Probe?.ready()');if(ready?.scene===name&&!ready.loading)break;await delay(100);}
    assert.equal(ready?.scene,name,JSON.stringify({ready,errors}));
    if (process.env.PARTY_RETIREMENT) await delay(1000);
    if (process.env.M3_FAILURE) await evaluate('monster3Probe.assetsReady()');
    await evaluate('monster3Probe.restart()');
    for(let i=0;i<350;i++) { ready=await evaluate('monster3Probe.ready()'); if(ready?.scene===name&&!ready.loading&&ready.source==='active-save')break; await delay(100); }
    assert.equal(ready.source,'active-save','Pet journey must restore the real saved rosters');
    if (process.env.PARTY_RETIREMENT || process.env.M3_FAILURE) {
      for (let i = 0; i < 350; i++) { if (await evaluate('monster3Probe.retirementReady()')) break; await delay(100); }
      assert(await evaluate('monster3Probe.retirementReady()'), 'Both real pet owners must finish production asset readiness');
    }
    await evaluate(`monster3Probe.stop('${mode}')`);
    if (process.env.PARTY_RETIREMENT) {
      await evaluate('monster3Probe.step(120)');
      const target = 'docs/tasks/evidence/TASK-SLICE-259/browser'; mkdirSync(target, { recursive: true });
      if (fps === 30) {
        const before = await command('Page.captureScreenshot', { format: 'png' });
        writeFileSync(`${target}/${name}-${fps}-${process.env.M3_PET_SPECIES ?? 'monkey'}-before.png`, Buffer.from(before.data, 'base64'));
      }
      const rows = await evaluate('monster3Probe.retirement()');
      writeFileSync(`${target}/${name}-${fps}-${process.env.M3_PET_SPECIES ?? 'monkey'}.json`, JSON.stringify(rows, null, 2));
      for (const row of rows) {
        assert.equal(row.heroHp, 0); assert.equal(row.remaining, 98);
        for (const key of ['petHpUnchanged', 'lifeUnchanged', 'sessionGone', 'compatibilityGone', 'bodyReleased', 'staleRejected', 'otherPreserved']) assert.equal(row[key], true, key);
      }
      await evaluate('monster3Probe.renderRetirement()');
      const png = await command('Page.captureScreenshot', { format: 'png' });
      writeFileSync(`${target}/${name}-${fps}-${process.env.M3_PET_SPECIES ?? 'monkey'}.png`, Buffer.from(png.data, 'base64'));
      await evaluate('monster3Probe.restart()');
      for (let i = 0; i < 350; i++) { const r = await evaluate('monster3Probe.ready()'); if (r.scene === name && !r.loading) break; await delay(100); }
      await evaluate('monster3Probe.return()');
      for (let i = 0; i < 350; i++) { if ((await evaluate('monster3Probe.ready()')).scenes.includes('HeavenMapScene')) break; await delay(100); }
      assert((await evaluate('monster3Probe.ready()')).scenes.includes('HeavenMapScene'));
      reports.push({ scene: name, fps, retirement: rows }); console.log(`${name}/${fps} synchronous retirement passed`);
      continue;
    }
    if(process.env.PET_RECEPTION_SCENE) {
      const target=`docs/tasks/evidence/TASK-SLICE-255/browser`;mkdirSync(target,{recursive:true});
      const truth=JSON.parse(readFileSync('docs/reverse-engineering/ground-truth/manifests/task-settings-254-pet-reception-behavior.json','utf8'));
      const forms=[...new Set(truth.receptions.map(c=>c.id.split(':')[0]))], captures=[];
      for(const form of forms) {
        const capture=await evaluate(`monster3Probe.compatibilityReception(${JSON.stringify(form)})`);
        captures.push(capture);
        writeFileSync(`${target}/${name}-${fps}.json`,JSON.stringify(captures,null,2));
        assert.equal(capture.result.accepted,true,`${form}: actual Scene reception`);
        assert.equal(capture.hurt.accepted,true); assert.equal(capture.hurtPose.action,'hurt');
        assert.equal(capture.hurtAfter,capture.hurtBefore-capture.hurt.amount);
        assert.equal(capture.pauseHeld,true,'Actual Scene pause preserves compatibility body and protection');
        assert.equal(capture.repeated.action,'hurt');
        assert.equal(capture.repeatAfter.keyFrameIndex,capture.repeatBefore.keyFrameIndex);
        assert.equal(capture.repeatAfter.column,0);
        assert(capture.before.every(hp=>hp>0&&hp<=100),'Actual world update leaves both controlled targets alive');
        assert.deepEqual(capture.immediate,[0,capture.before[1]],'Only the addressed owner loses HP during the controlled reception');
        assert.deepEqual(capture.after[0],{hp:0,lifetime:0,phase:'released'});
        assert(capture.after[1].hp>0&&capture.after[1].hp<=100&&capture.after[1].lifetime===1&&capture.after[1].phase==='alive',
          'P2 remains alive during actual world ticks, which can include other monster damage');
        assert.equal(capture.staleAccepted,false);
        const original=truth.receptions.find(c=>c.id.startsWith(`${form}:`)&&c.id.split(':')[3]==='dead'&&Number(c.id.split(':')[4])===fps);
        const deadline=original.states.find(s=>s.dead).tick;
        assert.equal(capture.states.find(s=>s.p1.phase==='released').tick,deadline,`${form}: source death deadline`);
        assert.equal(capture.secondResult.accepted,true);
        assert.deepEqual(capture.final,[{hp:0,lifetime:0,phase:'released'},{hp:0,lifetime:0,phase:'released'}]);
        assert.equal(capture.secondStates.find(s=>s.p2.phase==='released').tick,deadline,`${form}: P2 source death deadline`);
        assert(capture.secondStates.every(s=>s.p1.phase==='released'));
      }
      const exit=await evaluate('monster3Probe.armCompatibilityExit()');
      await evaluate('monster3Probe.restart()');
      for(let i=0;i<350;i++) {const r=await evaluate('monster3Probe.ready()');if(r?.scene===name&&!r.loading&&r.parties>exit.parties)break;await delay(100);}
      const exited=await evaluate('monster3Probe.verifyCompatibilityExit()');
      assert.deepEqual(exited,[{phase:'released',rejected:true,hpUnchanged:true},{phase:'released',rejected:true,hpUnchanged:true}]);
      writeFileSync(`${target}/${name}-${fps}-exit.json`,JSON.stringify(exited,null,2));
      reports.push({scene:name,fps,scope:'255 controlled actual Scene owner reception and death update',forms:captures.length});
      continue;
    }
    if(process.env.PET_RECEPTION_VISUAL) {
      const visualOut=`docs/tasks/evidence/TASK-SLICE-255/visual/${name}${process.env.PET_RECEPTION_MUTATION?'/mutations/'+process.env.PET_RECEPTION_MUTATION:''}`;mkdirSync(visualOut,{recursive:true});
      const display=JSON.parse(readFileSync('src/assets/pet-reception-body-display.json','utf8'));
      const captures=[];
      for(const pose of display.poses) for(const background of [0,0xffffff]) {
        const capture=await evaluate(`monster3Probe.petVisual(${JSON.stringify({...pose,background})})`);
        const file=`${pose.id}-${background===0?'black':'white'}.png`;
        writeFileSync(`${visualOut}/${file}`,Buffer.from(capture.png.split(',')[1],'base64'));
        captures.push({file,pose,background,actual:capture.actual});
      }
      writeFileSync(`${visualOut}/captures.json`,JSON.stringify(captures,null,2));
      reports.push({scene:name,scope:'255 isolated production pet projection; independent pixel comparison required',poses:captures.length});
      continue;
    }
    if(process.env.M3_VISUAL) {
      const visualOut=`${out}/visual/${name}${process.env.M3_VISUAL_MUTATION?'/mutations/'+process.env.M3_VISUAL_MUTATION:''}`;mkdirSync(visualOut,{recursive:true});
      const contract=JSON.parse(readFileSync('docs/reverse-engineering/reference/monster3-attack-collision-contract.json','utf8'));
      const poses=[];
      for(const attack of contract.attacks) {
        const native=JSON.parse(readFileSync(attack.oracle.path,'utf8'));
        for(const projection of native.projections) {
         for(const background of [0,0xffffff]) {
          const matrix=projection.tree.worldMatrix;
          const pose={action:attack.attack===1?'hit1':'hit2',frame:projection.frame,facingX:projection.sign===1?-1:1,x:matrix.tx,y:matrix.ty,background};
          const capture=await evaluate(`monster3Probe.visual(${JSON.stringify(pose)})`);
          const file=`a${attack.attack}-f${projection.frame}-s${projection.sign}-${background===0?'black':'white'}.png`;
          writeFileSync(`${visualOut}/${file}`,Buffer.from(capture.png.split(',')[1],'base64'));
          poses.push({file,pose,actual:capture.actual});
         }
        }
      }
      writeFileSync(`${visualOut}/captures.json`,JSON.stringify(poses,null,2));
      reports.push({scene:name,scope:'projection capture only; independent native pixel comparison required',poses:poses.length});
      continue;
    }
    const receptionKinds=['hero','pet'];
    let state;
    for(let i=0;i<350;i++) {
      await evaluate('monster3Probe.step(20)');state=await evaluate('monster3Probe.snapshot()');
      assert.equal(state.legacyMonster3Calls,0,'Monster3 must never enter the retired ordinary attack HP path');
      if(i%50===49)console.log(JSON.stringify({progress:true,scene:name,ticks:state.ticks,route:state.route,heroes:state.heroes.map(h=>({slot:h.slot,x:h.x,y:h.y})),events:state.events.length}));
      if(mode==='fatal' && state.events.some(e=>e.sourceDead&&e.settledDamage>0) && state.fatalTrace.length>=12)break;
      if(mode==='normal' && ['p1','p2'].every(slot=>receptionKinds.every(kind=>state.events.some(e=>e.ownerSlot===slot&&e.targetKind===kind))) && ['hit1','hit2'].every(a=>state.actions.includes(a)))break;
    }
    const file=`${name}-${fps}-${mode}${process.env.M3_FAILURE?'--failure':''}${process.env.M3_PET_SPECIES?'--'+process.env.M3_PET_SPECIES:''}`;
    writeFileSync(`${out}/${file}.json`,JSON.stringify(state,null,2));
    const png=await command('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}/${file}.png`,Buffer.from(png.data,'base64'));
    for(const view of state.views) { assert.deepEqual(view.attacks.map(v=>v.id),(view.expected??[]).map(v=>v.id),'Display objects match live attack IDs'); assert(view.attacks.every(v=>v.key.startsWith('monster3-native-')),'Native textures must be loaded'); }
    assert(state.hpChecks.length > 0 && state.hpChecks.every(c=>c.actualAfter===c.loggedAfter), 'Logged reception must match independently sampled current HP');
    if(mode==='fatal') {
      const deadHit=state.events.find(e=>e.sourceDead&&e.settledDamage>0);
      assert(deadHit,'A retained attack must settle real HP after source death');
      const birth=state.fatalTrace.find(t=>t.hp===0&&t.attacks.some(a=>a.age===0&&a.frame===1&&deadHit.attackId.startsWith(a.id+':')));
      assert(birth,'The final body emission precedes same-frame fire death');
      const attack=birth.attacks.find(a=>deadHit.attackId.startsWith(a.id+':'));
      const next=state.fatalTrace.find(t=>t.id===birth.id&&t.tick===birth.tick+1);
      assert(next?.hp===0&&next.attacks.some(a=>a.id===attack.id&&a.age===1&&a.frame===1),'First collision frame advances after source death');
      for(let age=0;age<5;age++) {
        const sample=state.fatalTrace.find(t=>t.id===birth.id&&t.tick===birth.tick+age);
        assert(sample?.hp===0&&sample.attacks.some(a=>a.id===attack.id&&a.age===age&&a.frame===Math.max(1,age)),'Dead source retains every hit1 detection phase');
      }
      const ended=state.fatalTrace.find(t=>t.id===birth.id&&t.tick===birth.tick+5);
      assert(ended&&!ended.attacks.some(a=>a.id===attack.id)&&ended.retained.some(a=>a.id===attack.id&&a.age===5&&a.frame===0&&a.sourceReleased&&a.parentReleased),'Final hit1 frame releases retained source and parent');
      assert(state.hpChecks.some(c=>c.owner===deadHit.ownerSlot&&c.kind===deadHit.targetKind&&c.actualAfter===deadHit.hpAfter&&c.actualAfter<c.actualBefore));
    } else {
    assert(['p1','p2'].every(slot=>receptionKinds.every(kind=>state.hpChecks.some(c=>c.owner===slot&&c.kind===kind&&c.actualAfter<c.actualBefore))), 'Each declared current HP owner must actually lose HP');
    assert(['hit1','hit2'].every(a=>state.actions.includes(a)), 'Both naturally selected attacks must be displayed');
    assert(['p1','p2'].every(slot=>receptionKinds.every(kind=>state.events.some(e=>e.ownerSlot===slot&&e.targetKind===kind))), JSON.stringify({file,pets:state.pets,events:state.events}));
    }
    assert(await evaluate('monster3Probe.pauseCheck()'),'real Scene pause holds body and attacks');
    if(process.env.M3_FAILURE) {
      const initial=await evaluate('monster3Probe.beginFailure()');
      let failed;
      for(let i=0;i<350;i++) {
        await evaluate('monster3Probe.step(20)');failed=await evaluate('monster3Probe.snapshot()');
        if(failed.failure.results.some(r=>r.result==='failed'))break;
      }
      writeFileSync(`${out}/${file}-defeat.json`,JSON.stringify({...failed,fixture:initial},null,2));
      assert(failed.failure.results.some(r=>r.result==='failed'),'Real party defeat must produce the failure UI');
      assert(failed.heroes.every(h=>!h.alive&&h.hp===0),'Both heroes must actually die');
      for(const slot of ['p1','p2'])assert(failed.failure.deaths.some(e=>e.ownerSlot===slot&&e.sourceId&&e.hpBefore>0&&e.hpAfter===0&&e.settledDamage>0),'Real damage settlement must cause each hero death');
      const flows=failed.failure.flows, start=flows.findIndex(f=>f.phase==='failure-pending');
      assert(start>=0);assert.equal(flows[start].remaining,2500);
      let remaining=2500;
      for(const flow of flows.slice(start+1)) {
        remaining=Math.max(0,remaining-flow.delta);
        assert.equal(flow.remaining,remaining,'Real failure countdown consumes each world delta');
        assert.equal(flow.phase,remaining===0?'failed':'failure-pending');
      }
      assert.equal(remaining,0);
      await evaluate('monster3Probe.resumeUi()');
      const defeatPng=await command('Page.captureScreenshot',{format:'png'});writeFileSync(`${out}/${file}-defeat.png`,Buffer.from(defeatPng.data,'base64'));
      await command('Input.dispatchMouseEvent',{type:'mouseMoved',x:385,y:425});
      await delay(100);
      await command('Input.dispatchMouseEvent',{type:'mousePressed',x:385,y:425,button:'left',clickCount:1});
      await delay(100);
      await command('Input.dispatchMouseEvent',{type:'mouseReleased',x:385,y:425,button:'left',clickCount:1});
      await evaluate('monster3Probe.flushUi()');
      for(let i=0;i<350;i++){const r=await evaluate('monster3Probe.ready()');if(r.parties>initial.parties&&!r.loading)break;await delay(100);}
      writeFileSync(`${out}/${file}-retry-ui.json`,JSON.stringify(await evaluate('monster3Probe.retryUi()'),null,2));
      assert((await evaluate('monster3Probe.ready()')).parties>initial.parties,'Native retry button must create a new party');
      assert((await evaluate('monster3Probe.snapshot()')).failure.oldPartyDestroyed,'Native retry must destroy the defeated party');
    } else await evaluate('monster3Probe.restart()');
    await delay(250);
    for(let i=0;i<350;i++){ const r=await evaluate('monster3Probe.ready()'); if(r.scene===name&&!r.loading)break; await delay(100); }
    let reloaded=await evaluate('monster3Probe.snapshot()');
    assert(reloaded.retiredAttackReferences.length>0&&reloaded.retiredAttackReferences.every(a=>a.sourceReleased&&a.parentReleased),'Retained old attack objects release source and parent references');
    assert(reloaded.monsters.slice(0,state.monsters.length).filter(m=>m.runtime).every(m=>m.runtime.destroyed),'Retry releases old attack owners: '+JSON.stringify({file,ready:await evaluate('monster3Probe.ready()'),remaining:reloaded.monsters.slice(0,state.monsters.length).filter(m=>m.runtime&&!m.runtime.destroyed)}));
    if (process.env.M3_FAILURE) {
      await delay(1000);
      for(let i=0;i<350;i++){if(!(await evaluate('monster3Probe.ready()')).loading)break;await delay(100);}
      assert(!(await evaluate('monster3Probe.ready()')).loading, 'Retry assets must finish before map navigation');
    }
    await evaluate('monster3Probe.return()');await delay(150);
    reloaded=await evaluate('monster3Probe.snapshot()');assert(reloaded.monsters.every(m=>!m.runtime||m.runtime.destroyed),'Return releases all attack owners: '+JSON.stringify({ready:await evaluate('monster3Probe.ready()'),remaining:reloaded.monsters.filter(m=>m.runtime&&!m.runtime.destroyed)}));
    assert((await evaluate('monster3Probe.ready()')).scenes.includes('HeavenMapScene'),'Return uses the formal map route');
    await evaluate('monster3Probe.reenter()');
    for(let i=0;i<350;i++){const r=await evaluate('monster3Probe.ready()'); if(r.scene===name&&!r.loading)break;await delay(100);}
    const reentered=await evaluate('monster3Probe.snapshot()'); assert.equal(reentered.scene,name);
    assert.equal(reentered.heroes.length,2); assert(reentered.monsters.slice(0,state.monsters.length).every(m=>!m.runtime||m.runtime.destroyed));
    reports.push({file,mapReentry:true,eventCapture:'first-observation',pauseEntry:true,retryCleanup:true,returnCleanup:true,frames:state.ticks,events:state.events.length,sourceDeadHits:state.events.filter(e=>e.sourceDead).length,owners:[...new Set(state.events.map(e=>e.ownerSlot))],displayStates:state.views.length,actions:state.actions,hpChecks:state.hpChecks.length,scope: { scene: name, fps, mode, nativePixelComparison: false, failureDefeatRoute: !!process.env.M3_FAILURE }});
    console.log(JSON.stringify(reports.at(-1)));
  }
  assert.equal(errors.length,0,JSON.stringify(errors));writeFileSync(verificationPath,JSON.stringify({status:'passed',reports,errors},null,2));
} catch(error) {
  if(verificationPath)writeFileSync(verificationPath,JSON.stringify({status:'failed',message:String(error),errors},null,2));
  throw error;
} finally {socket?.close();edge.kill();}
