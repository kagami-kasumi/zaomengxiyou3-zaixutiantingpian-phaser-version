import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime, createStage1CombatPlayer } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { bodyGroundFixture } from './pet226-body/ground-fixture';
import { bodyFixtureCollisionAssets } from './pet226-body/body-fixture-collision';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import { createDefaultPetBehaviorRegistry } from '../src/systems/pet-behaviors/createDefaultPetBehaviorRegistry';
import truth from '../src/assets/pet-monkey-horse-damage.json';

const assets = await PetTurtleAssets.decode(p => new Uint8Array(readFileSync(`public${p}`)));
for (const family of ['dragon','turtle','monkey','horse'] as const) for (const slot of ['p1','p2'] as const) {
 const roster=createSeedPetRoster(),pet=roster.pets.find(p=>p.species===family&&p.form===1)!;
 roster.pets.forEach(p=>p.isActive=p===pet);
 Object.assign(pet,{id:`${slot}-${family}`,level:0,mp:1000,maxMp:1000,hp:100,maxHp:1000,atk:100,technique:3,warpower:1,
  critBonusRate:0,skills:['sxkb','fsnl','smjc','mfjc','gjjc','fyjc']});
 const runtime=new PetCombatRuntime(createDefaultPetBehaviorRegistry(()=>assets));
 const projectiles=createProjectileSystem(),combat=createStage1CombatRuntime();
 const owner=createStage1CombatPlayer(slot);
 const frame={roster,owner:{x:300,y:350,facingX:1 as const},ownerCombat:owner.combat,
  ownerStep:owner.stepPetBuffs,ownerAddPetBuff:owner.addPetBuff,targets:[],projectiles,
  hostFps:30,deltaMs:1000/30,random:()=>.01,
  groundEnvironment:family==='monkey'||family==='horse'?bodyGroundFixture(family,1,250):
   {ownerRootOffsetY:0,walls:[{id:'floor',left:-10000,right:10000,top:350,bottom:370,usesWallTolerance:true}]}};
 for(let tick=0;tick<300;tick++)runtime.update(frame);
 assert.equal(pet.mp,880,`${family}/${slot} six automatic costs`);
 assert.equal(runtime.snapshot().passive!.pet.filter(Boolean).length,2);
 assert.equal(owner.petBuffs.effects.filter(Boolean).length,4);
 if(family==='monkey'||family==='horse'){
  // Real learned skill selection, body callback, private projectile and native
  // collision; only target positioning comes from the independent AIR fixture.
  const skill=family==='monkey'?'xj':'sp';pet.skills.push(skill);
  pet.skillState!.monkey1Xj.releaseReady=true;
  const root=runtime.snapshot().runtime!;
  const locked=createStage1CombatEnemy({id:'locked',enemyType:5,x:root.x+(family==='monkey'?350:80),y:root.y});
  const victim=createStage1CombatEnemy({id:'victim',enemyType:5,x:10000,y:10000});locked.hp=victim.hp=1000000;
  const task=family==='monkey'?228:229;
  const collisions=JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SLICE-226/formal-target-collision-${task}/measurement.json`,'utf8')).cases;
  let first:any,positive:any,injected=false;
  for(let tick=0;tick<160&&!combat.audit.damageEvents.length;tick++){
   victim.x=victim.y=10000;
   if(first){locked.x=locked.y=10000;if(first.petHostTick+1===positive.tick){victim.x=first.x+positive.x;victim.y=first.y+positive.y;injected=true;}}
   const port=createPetProjectileCombatPort({enemies:[locked,victim],combat,ownerSlot:slot,timeMs:tick*1000/30,random:()=>.01,
    monkeyHorseCollision:()=>bodyFixtureCollisionAssets,mask:()=>{throw Error('Native fields required');}});
   runtime.update({...frame,projectileCombat:port,targets:[locked,victim].map(e=>({id:e.id,x:e.x,y:e.y,isAlive:true}))});
   if(!first){first=projectiles.projectiles.find(p=>!p.visualOnly&&!p.variant.endsWith('-normal'));if(first){
    positive=collisions.find((c:any)=>c.symbol===first.sourceSymbol&&c.direction===-1&&c.target==='ObjectBaseSprite2'&&c.hit&&c.tick>=2);
    assert(positive);const formula=truth.formulae[family]['1'].hit2;
    const expected=((formula.multiplier*100*truth.skillFactor+94)*2)|0;
    assert.equal(first.damage,expected,`${family} automatic magic and critical reach body projectile`);assert.equal(first.critical,true);
   }}
  }
  assert(first&&injected);assert(victim.hp<1000000);assert.equal(victim.lastHitBy,slot);
  assert(combat.audit.damageEvents.some(e=>e.attackId.startsWith(`${first.projectileId}:${first.sourceAttackId}:`)));
 }
 runtime.destroy();assert.equal(runtime.snapshot().petId,undefined);
}
console.log('242B: eight public family/owner consumers, four real buffed casts/native hits passed');
