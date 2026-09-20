import assert from 'node:assert/strict';
import { readFileSync, mkdirSync } from 'node:fs';
import { writeFileSync } from './write-dragon-evidence';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatRuntime, createStage1CombatEnemy } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { createMonster30 } from '../src/systems/Monster30System';
import { adaptTestScenePetEnemies } from '../src/scenes/test-scene/TestScenePetEnemyAdapter';
import { createPetDragonPresentationBridge } from '../src/scenes/PetDragonPresentationBridge';

const alpha=execFileSync('python',['-c','from PIL import Image; import sys; sys.stdout.buffer.write(Image.open(sys.argv[1]).convert("RGBA").getchannel("A").tobytes())','public/assets/pets/dragon/effects/PetDragon1Bullet1/1.png']);
const source=readFileSync('src/scenes/HeroPartyRuntimeBridge.ts','utf8').replaceAll('\r\n','\n');
const start=source.indexOf('  function updatePets(frame:');
const end=source.indexOf('\n}\n\nfunction syncFallbackFeedback',start);
const ts=createRequire(import.meta.url)('typescript');
const closure=ts.transpileModule(source.slice(start,end),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
const rows:any[]=[];
for(const entry of ['formal','TestScene']) for(const reason of ['retry','return','reload']) {
  const displays:any[]=[];
  const add=(x:number,y:number,key:string)=>{
    const display:any={x,y,key,destroyed:false};
    for(const method of ['setOrigin','setDepth','setName','setFrame','setFlipX','setAlpha','setTexture','setData'])
      display[method]=(...args:any[])=>{display[method]=display[method];display[method+'Value']=args;return display;};
    display.setPosition=(x:number,y:number)=>{display.x=x;display.y=y;return display;};
    display.destroy=()=>{display.destroyed=true;};displays.push(display);return display;
  };
  const presentation=createPetDragonPresentationBridge({add:{sprite:add,image:add}} as any);
  const rosters=Object.fromEntries(['p1','p2'].map(slot=>{
    const roster=createSeedPetRoster();
    roster.pets.forEach(p=>{p.id=slot+'-'+p.id;p.isActive=p.species==='dragon'&&p.form===1;
      if(p.isActive)Object.assign(p,{hp:500,maxHp:1000,mp:1000,maxMp:1000,atk:100,skills:['fs']});});
    return [slot,roster];
  }));
  const runtimes={p1:new PetCombatRuntime(),p2:new PetCombatRuntime()};
  const snapshots:any={};
  const combat=createStage1CombatRuntime();
  const model={combat,members:['p1','p2'].map(slot=>({movement:{x:0,y:0,facingX:1},combat:{slot,combat:{state:'ready'}}}))};
  const projectiles=createProjectileSystem();
  const monster=createMonster30(100,-15);monster.hp=monster.maxHp=1000000;
  const owners:string[]=[];
  const formalEnemy=createStage1CombatEnemy({id:monster.id,enemyType:30,x:monster.x,y:monster.y});
  formalEnemy.hp=formalEnemy.maxHp=1000000;
  const enemies=entry==='TestScene'?adaptTestScenePetEnemies([monster],(_monster,slot)=>owners.push(slot)):[formalEnemy];
  const update=new Function('model','petRosters','petCombatRuntimes','petCombatSnapshots','pendingPetDamageEvents',
    'pendingPetAnimationEvents','scene','petProjectileCombat','petDragonPresentation','isPetDragonQaEnabled','petTurtle',closure+'\nreturn updatePets;')(
      model,rosters,runtimes,snapshots,{p1:[],p2:[]},{p1:[],p2:[]},{game:{loop:{targetFps:24}}},
      (input:any)=>createPetProjectileCombatPort({...input,mask:()=>({width:67,height:53,alpha})}),presentation,()=>false,{readyRoster:(roster:any)=>roster,update(){}});
  let tick=0;
  const step=()=>{
    tick++;
    updateProjectiles(projectiles,[],1000/24);
    update({targets:[{id:monster.id,x:monster.x,y:monster.y,isAlive:monster.hp>0}],combatEnemies:enemies,
      projectiles,timeMs:tick*1000/24,deltaMs:1000/24,random:()=>0.5,
      groundEnvironmentFor:()=>({ownerRootOffsetY:0,walls:[{id:'floor',left:-10000,right:10000,top:0,bottom:20,usesWallTolerance:true}]})});
  };
  for(let i=0;i<140;i++)step();
  assert.ok(enemies[0]!.hp<enemies[0]!.maxHp,'actual enemy HP must decrease');
  assert.ok(combat.audit.damageEvents.some(e=>e.sourceId.startsWith('p1-'))&&combat.audit.damageEvents.some(e=>e.sourceId.startsWith('p2-')));
  if(entry==='TestScene') {
    assert.ok(owners.includes('p1')&&owners.includes('p2'));
    assert.equal(monster.state,'hurt');assert.ok(monster.stateTimerMs>0,'sandbox owns hurt duration');
  }
  assert.ok(snapshots.p1.summons.length&&snapshots.p2.summons.length,'both owners have real private entities');
  assert.ok(displays.filter(d=>!d.destroyed).length>=4);
  const oldKey=snapshots.p1.runtime.runtimeKey;
  // Rest/replacement retain other slot, remove old source tree and its displays.
  const p1=rosters.p1!.pets.find(p=>p.isActive)!;
  p1.isActive=false;step();assert.equal(snapshots.p1.runtime,undefined);
  assert.ok(snapshots.p2.runtime);
  assert.ok(!projectiles.projectiles.some(p=>p.sourceId===p1.id&&!p.isExpired));
  p1.isActive=true;step();assert.notEqual(snapshots.p1.runtime.runtimeKey,oldKey);
  const replacement={...p1,id:p1.id+'-replacement'};rosters.p1!.pets=[replacement];step();
  assert.equal(snapshots.p1.petId,replacement.id);
  // Existing owner-dead branch keeps a pet session but suppresses new targets.
  model.members[0]!.combat.combat.state='dead';step();assert.ok(snapshots.p1.runtime);
  {
    runtimes.p1.destroy();runtimes.p2.destroy();presentation.destroy();
    assert.ok(displays.every(d=>d.destroyed));
    assert.ok(projectiles.projectiles.every(p=>p.isExpired));
    rows.push({entry,reason,oldKey,damage:combat.audit.damageEvents.length,
      owners:[...new Set(combat.audit.damageEvents.map(event=>event.sourceId.split('-')[0]))],
      monsterHp:enemies[0]!.hp,monsterState:enemies[0]!.phase,remainingDisplays:0,remainingProjectiles:0});
  }
  const next=new PetCombatRuntime();
  const first=next.update({roster:rosters.p1!,owner:{x:0,y:0,facingX:1},targets:[],deltaMs:0,
    groundEnvironment:{ownerRootOffsetY:0,walls:[]}});
  assert.notEqual(first.runtime!.runtimeKey,oldKey);assert.equal(first.summons!.length,0);next.destroy();
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-214C5',{recursive:true});
writeFileSync('docs/tasks/evidence/TASK-SLICE-214C5/consumer-traces.json',JSON.stringify({
  scope:'Actual production updatePets closure, Runtime, presenter and Monster30 adapter. Scene route wiring separately covered by formal journey tests.',rows},null,2)+'\n');
console.log('Dragon1 production consumers: shared P1/P2 combat, real sandbox HP, rest/replacement and disposal passed.');
