import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir=path.resolve('dist/__monster_experience');
mkdirSync(dir,{recursive:true});
await build({entryPoints:['tools/monster-experience-browser-probe.ts'],bundle:true,format:'iife',
  outfile:path.join(dir,'probe.js'),logLevel:'silent',plugins:[{name:'observe-production',setup(b){
  b.onLoad({filter:/HeroPartyExperienceSystem\.ts$/},args=>({loader:'ts',contents:readFileSync(args.path,'utf8')
    .replace('  model.combat.experienceHeroes = heroes;', '  ((globalThis as any).__xpParties ??= []).push(model);\n  model.combat.experienceHeroes = heroes;')
    .replace('      monster.experienceBinding ??=', '      if (!monster.experienceBinding) ((globalThis as any).__xpMonsters ??= []).push(monster);\n      monster.experienceBinding ??=')}));
  b.onLoad({filter:/MonsterExperienceSystem\.ts$/},args=>({loader:'ts',contents:readFileSync(args.path,'utf8')
    .replace('  binding.persist();', '  binding.persist();\n  ((globalThis as any).__xpEvents ??= []).push({target:target.runtimeId,kind:target.kind,slot:target.ownerSlot,petId:target.petId,hero:binding.settlement?.heroExperience,pet:binding.settlement?.petExperience});')}));
  b.onLoad({filter:/HeroPartyRuntimeBridge\.ts$/},args=>({loader:'ts',contents:readFileSync(args.path,'utf8')
    .replace('  const experience = createHeroPartyExperience', '  ((globalThis as any).__xpRosters ??= []).push({model,rosters:petRosters});\n  const experience = createHeroPartyExperience')}));
}}],external:['/assets/*'],define:{'import.meta.env.DEV':'false','import.meta.env.PROD':'true','import.meta.env.MODE':'"production"','import.meta.env.BASE_URL':'"/"'}});
writeFileSync(path.join(dir,'index.html'),'<html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="probe.css"></head><body><div id="game"></div><script src="probe.js"></script></body></html>');
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
  const out='docs/tasks/evidence/TASK-SLICE-238/browser';mkdirSync(out,{recursive:true});
  const reports=[];
  const pet=process.env.XP_BROWSER_PET==='1';
  const boss=process.env.XP_BROWSER_BOSS==='1';
  const routes=[['qaStage=1-2','Stage12Scene'],['qaStage=1-3','Stage13Scene'],['qaStage=2-1','Stage21Scene'],['qaBossState=wait','Stage22Scene'],['qaStage=1-1-role1','TestScene']];
  for(const [route,sceneName] of routes.filter(([,name])=>!process.env.XP_BROWSER_SCENE||process.env.XP_BROWSER_SCENE===name)) for(const owner of ['p1','p2']) {
    await command('Page.navigate',{url:`http://127.0.0.1:4174/__monster_experience/index.html?${route}&players=2`});
    let state;
    for(let n=0;n<350;n++){state=await evaluate('window.monsterExperienceProbe?.snapshot()');if(state?.scene===sceneName&&!state.loading)break;await delay(100);}
    assert.equal(state?.scene,sceneName,JSON.stringify({state,errors}));
    await evaluate(`monsterExperienceProbe.prepare('${owner}',${pet},${pet&&sceneName==='TestScene'})`);
    for(let n=0;n<100;n++){await delay(100);state=await evaluate('window.monsterExperienceProbe?.snapshot()');if(state.parties?.flat().some(p=>p.level===20))break;}
    await evaluate('monsterExperienceProbe.stop()');
    if(boss)await evaluate('monsterExperienceProbe.bossStart()');
    const before=state.save;
    for(let n=0;n<1500 && !(boss?state.boss?.settlement?.target.ownerSlot===owner:state.events.some(e=>e.slot===owner));n++) {
      const hero=state.heroes.find(h=>h.slot===owner);
      const enemy=state.monsters?.slice().sort((a,b)=>Math.abs(a.x-hero.x)-Math.abs(b.x-hero.x))[0];
      const distance=enemy?enemy.x-hero.x:500;
      const codes=!pet&&n%4<2?[owner==='p1'?74:97]:[];
      if(Math.abs(distance)>95)codes.push(distance>0?(owner==='p1'?68:39):(owner==='p1'?65:37));
      if(sceneName==='TestScene' && n%8===7)codes.push(owner==='p1'?75:98);
      // Keep the second hero within the camera while using the selected owner's attacks.
      if(codes.includes(68)||codes.includes(39))codes.push(68,39);
      if(codes.includes(65)||codes.includes(37))codes.push(65,37);
      await evaluate(`monsterExperienceProbe.keys(${JSON.stringify(codes)});monsterExperienceProbe.step(8)`);
      if(boss&&pet)await evaluate(`monsterExperienceProbe.bossPetAttack('${owner}')`);
      state=await evaluate('window.monsterExperienceProbe?.snapshot()');
    }
    await evaluate('monsterExperienceProbe.keys([])');
    const suffix=(pet?'-pet':'')+(boss?'-boss':'');
    writeFileSync(path.join(out,`${sceneName}-${owner}${suffix}.json`),JSON.stringify({fixture:'Level-20 active save; pet ATK 10000 when enabled; real key input and pet AI; hero survival protected after scene creation; no HP edits to monsters or injected hits.',before,state,errors},null,2));
    const png=await command('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(out,`${sceneName}-${owner}${suffix}.png`),Buffer.from(png.data,'base64'));
    assert.ok(state.events.some(e=>e.slot===owner),JSON.stringify({sceneName,owner,heroes:state.heroes,monsters:state.monsters,events:state.events,errors}));
    if(pet)assert.ok(state.events.some(e=>e.slot===owner&&e.kind==='pet'));
    if(boss)assert.equal(state.boss?.settlement?.target.ownerSlot,owner,'Real Boss death must settle selected owner');
    await evaluate('monsterExperienceProbe.restart()');
    let restored;
    for(let n=0;n<100;n++){await delay(100);restored=await evaluate('monsterExperienceProbe.step(1);monsterExperienceProbe.snapshot()');if(!restored.loading&&restored.parties?.length)break;}
    await evaluate('monsterExperienceProbe.stop()');
    assert.ok(restored.parties?.length,'Actual scene must finish reload');
    for(const h of restored.parties.flat())assert.equal(h.exp,state.save[h.slot==='p1'?'player1':'player2'].currentExp);
    for(const rosters of restored.rosters)for(const slot of ['p1','p2'])if(rosters[slot])assert.deepEqual(rosters[slot],state.save[slot==='p1'?'player1':'player2'].pets.map(p=>[p.id,p.exp]));
    for(const key of ['player1','player2']) {
      assert.equal(restored.save[key].currentExp,state.save[key].currentExp);
      assert.deepEqual(restored.save[key].pets.map(p=>[p.id,p.exp]),state.save[key].pets.map(p=>[p.id,p.exp]));
    }
    writeFileSync(path.join(out,`${sceneName}-${owner}${suffix}-reload.json`),JSON.stringify(restored,null,2));
    if(process.env.XP_BROWSER_UI==='1'&&pet){
      assert.equal(await evaluate(`monsterExperienceProbe.petPage('${owner}')`),true);
      await delay(300);const page=await evaluate('monsterExperienceProbe.petPageState()');
      assert.ok(page.active);const player=page.model.restored[owner==='p1'?'player1':'player2'];
      const selected=player.petRoster.pets[player.petRoster.selectedIndex];
      assert.ok(page.texts.includes(`${selected.exp}/${selected.expToNext}`),JSON.stringify(page.texts));
      writeFileSync(path.join(out,`${sceneName}-${owner}${suffix}-pet-page.json`),JSON.stringify({petId:selected.id,exp:selected.exp,texts:page.texts},null,2));
      const png=await command('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(out,`${sceneName}-${owner}${suffix}-pet-page.png`),Buffer.from(png.data,'base64'));
    }
    reports.push({sceneName,owner,events:state.events,parties:state.parties});
  }
  writeFileSync(path.join(out,`verification${pet?'-pet':''}${boss?'-boss':''}${process.env.XP_BROWSER_SCENE?'-'+process.env.XP_BROWSER_SCENE:''}.json`),JSON.stringify({reports,errors},null,2));
  assert.equal(errors.length,0,JSON.stringify(errors));
  console.log('Actual scene XP producers passed:',reports.length);
} finally {socket?.close();edge.kill();}
