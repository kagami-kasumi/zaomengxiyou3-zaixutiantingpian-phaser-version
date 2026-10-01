import assert from 'node:assert/strict';
import { mkdirSync,writeFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createHeroPartyRuntimeModel,destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { bodyGroundFixture } from './pet226-body/ground-fixture';
import { noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';
import { refreshMonkeyHorseContextDamage } from '../src/systems/PetMonkeyHorseDamageSystem';
import damageTruth from '../src/assets/pet-monkey-horse-damage.json';
import { encodePet,createGameSave,serializeGameSave,parseGameSave,restoreGameState } from '../src/systems/SaveSystem';
const rows:any[]=[];
for(const family of ['monkey','horse'] as const) for(const form of [1,2,3,4] as const)
for(const fps of [20,24,30]) {
 const model=createHeroPartyRuntimeModel(['p1','p2'].map((slot,index)=>({slot:slot as 'p1'|'p2',heroId:1,x:200+index*400,y:250,width:48})));
 const runtimes=[new PetCombatRuntime(),new PetCombatRuntime()];
 const rosters=model.members.map(()=>{const r=createSeedPetRoster();r.pets.forEach(p=>p.isActive=p.species===family&&p.form===form);return r;});
 const pets=rosters.map(r=>r.pets.find(p=>p.isActive)!);
 pets.forEach((p,index)=>Object.assign(p,{skills:['sxkb','fsnl','smjc','mfjc','gjjc','fyjc'],level:10,technique:3,warpower:1,
  hp:100,maxHp:1000,mp:index?119:120,maxMp:index?119:120,atk:100,critBonusRate:.1}));
 const frames=model.members.map((m,index)=>({roster:rosters[index]!,owner:{x:m.movement.x,y:250,facingX:1 as const},
  ownerCombat:m.combat.combat,ownerStep:m.combat.stepPetBuffs,ownerAddPetBuff:m.combat.addPetBuff,
  targets:[],projectiles:model.projectiles,projectileCombat:noTargetBodyFixturePort,random:()=>.2,
  hostFps:fps,deltaMs:1000/fps,groundEnvironment:bodyGroundFixture(family,form,250)}));
 const tick=()=>runtimes.forEach((r,index)=>r.update(frames[index]!));
 tick();const p1=runtimes[0]!,session=(p1 as any).active;
 const base=model.members.map(m=>m.combat.effectiveStats.power);
 const paused=JSON.stringify(p1.snapshot().passive);p1.update({...frames[0]!,deltaMs:0});assert.equal(JSON.stringify(p1.snapshot().passive),paused);
 // Hurt is an animation gate, not a stun. Stun freezes checks, but not recovery.
 session.playAnimation('hurt');tick();assert.equal(p1.snapshot().passive!.counts[0],298);
 const key=p1.snapshot().runtime!.runtimeKey;
 const count=p1.snapshot().passive!.counts[0];
 for(let i=0;i<fps+1;i++)p1.update({...frames[0]!,stunnedRuntimeKeys:[key]});
 assert.equal(p1.snapshot().passive!.counts[0],count);assert(pets[0]!.hp>100);
 for(let i=0;i<298;i++)tick();
 assert.deepEqual(p1.snapshot().passive!.counts,[4320,5400,5400,5400,5400,5400]);
 assert.equal(pets[0]!.mp,0);assert.equal(pets[1]!.mp,19);
 assert.equal(model.members[0]!.combat.petBuffs.effects.length,4);
 assert.equal(model.members[1]!.combat.petBuffs.effects.length,3);
 assert.equal(model.members[0]!.combat.effectiveStats.power,base[0],'new hero buffs wait until next owner step');
 tick();assert.equal(model.members[0]!.combat.effectiveStats.power,(base[0]!+form*6*3*1.05)|0);
 // Actual session context must provide effects to the production skill damage consumer.
 const context=session.context(frames[0],[]);
 for(const [action,formula] of Object.entries((damageTruth.formulae[family] as any)[String(form)]) as any) {
  let expected=formula.normal?100:formula.multiplier*100*damageTruth.skillFactor;
  if(formula.magic)expected+=(form*30*3*1.05)>>>0;
  if(formula.critical)expected*=.2<=.1+form*.07*3*.27*1.05?2:1;
  assert.equal(refreshMonkeyHorseContextDamage(context,action).hurt,expected|0,`${family}${form}/${action}`);
 }
 const saved=encodePet(pets[0]!);assert(!('passive' in saved));assert(!('autoBuffState' in saved));
 // Public save producer/parser/restorer, with unrelated hero inputs using their
 // supported default branch. Rehydrated sessions must not inherit active buffs.
 const serialized=serializeGameSave(createGameSave({petRoster:rosters[0],player2PetRoster:rosters[1]} as any));
 const parsed=parseGameSave(serialized)!;
 for(const player of [parsed.player1,parsed.player2])for(const pet of player.pets){
  assert(!('autoBuffState' in pet));assert(!('passive' in pet));
 }
 const loaded=restoreGameState(parsed,{});
 for(const [index,r] of [loaded.petRoster,loaded.player2PetRoster].entries()){
  const restored=new PetCombatRuntime();restored.update({...frames[index]!,roster:r,deltaMs:0});
  assert.deepEqual(restored.snapshot().passive!.counts,[300,300,300,300,300,300]);
  assert.deepEqual(restored.snapshot().passive!.pet,[]);restored.destroy();
 }
 const heroCount=model.members[0]!.combat.petBuffs.count;
 pets[0]!.isActive=false;p1.update(frames[0]!);assert.equal(p1.snapshot().petId,undefined);
 assert.equal(model.members[0]!.combat.petBuffs.count,heroCount+1);assert(model.members[0]!.combat.petBuffs.effects.some(Boolean));
 assert.deepEqual(session.passive.snapshot().pet,[],'old own effects destroyed');
 const hp=pets[0]!.hp;for(let i=0;i<fps*20;i++)p1.update(frames[0]!);
 assert.equal(pets[0]!.hp,hp,'resting roster never ticks');assert(model.members[0]!.combat.petBuffs.effects.every(e=>e===null));
 pets[0]!.isActive=true;p1.update({...frames[0]!,deltaMs:0});assert.deepEqual(p1.snapshot().passive!.counts,[300,300,300,300,300,300]);
 // Retained dying source session steps only until real animation release.
 pets[0]!.hp=0;const deathStart=p1.snapshot().passive!.counts[0]!;p1.update(frames[0]!);
 assert.equal(p1.snapshot().passive?.counts[0],deathStart-1);
 for(let i=0;i<300;i++)p1.update(frames[0]!);assert.equal(p1.snapshot().petId,undefined);
 runtimes.forEach(r=>r.destroy());destroyHeroPartyRuntime(model);assert(model.members.every(m=>m.combat.petBuffs.effects.length===0));
 rows.push({family,form,fps,owners:2,status:'passed'});
}
if(!process.env.PET_PASSIVE_MUTATION){mkdirSync('docs/tasks/evidence/TASK-SLICE-242B',{recursive:true});writeFileSync('docs/tasks/evidence/TASK-SLICE-242B/runtime.json',JSON.stringify({status:'passed',rows},null,2)+'\n');}
console.log('242B:24 two-owner actual family sessions, skill consumers, stun/hurt/pause/rest/death/save passed');
