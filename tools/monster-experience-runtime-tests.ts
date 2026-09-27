import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHeroPartyRuntimeModel } from '../src/systems/HeroPartyRuntimeSystem';
import { createHeroPartyExperience } from '../src/systems/HeroPartyExperienceSystem';
import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { createHeroProgression } from '../src/systems/ProgressionSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createStage1CombatEnemy, resolveStage1HeroHit, resolveStage1PetHit } from '../src/systems/Stage1CombatSystem';
import { getMonsterRewardConfig } from '../src/systems/MonsterDefeatRewardSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { persistHeroPartyExperience } from '../src/scenes/HeroPartyExperienceBridge';
import { createDefaultGameSave, createSaveSlot, loadActiveGame } from '../src/systems/SaveSlotSystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import { restoreGameState } from '../src/systems/SaveSystem';
import { createSeedEquipmentRegistry } from '../src/systems/EquipmentSystem';
import { decodeMonkeyHorseCollision, monkeyHorseCollisionAsset } from '../src/assets/PetMonkeyHorseCollisionPackage';
import { bodyGroundFixture } from './pet226-body/ground-fixture';
import { settleMonsterExperience } from '../src/systems/MonsterExperienceSystem';
import { bindLegacyPetExperience } from '../src/systems/PetExperienceTargetSystem';
import { createPetRuntime } from '../src/systems/PetRuntimeSystem';
import { awardMonsterExperienceByTarget } from '../src/systems/PetBattleOwnershipSystem';
import { getPetExperienceToNextLevel } from '../src/systems/PetProgressionSystem';
const assets = await decodeMonkeyHorseCollision(readFileSync(`public${monkeyHorseCollisionAsset.path}`));
const rows: unknown[] = [];
for (const ownerSlot of ['p1','p2'] as const) for (const type of [2,3,4,5,6,7,8,9,10,16,19,30] as const)
for (const branch of ['hero-alone','hero-pet','pet'] as const) {
  const data = new Map<string,string>();
  const storage = { getItem:(key:string)=>data.get(key) ?? null, setItem:(key:string,value:string)=>{data.set(key,value);}, removeItem:(key:string)=>{data.delete(key);} };
  assert.ok(createSaveSlot(storage,0,createDefaultGameSave(new Date(),createPartyConfiguration(2,1,2)!)));
  const rosters = createPlayerPetRosters(), roster = rosters[ownerSlot], pet = roster.pets[0]!;
  pet.isActive = true; pet.level = 10; pet.exp = 0; pet.skills = []; pet.atk = 10000; pet.moveSpeed = 0; pet.critBonusRate = 0;
  const model = createHeroPartyRuntimeModel((['p1','p2'] as const).map(slot=>({slot,heroId:slot==='p1'?1:2,x:300,y:350,width:48,progression:createHeroProgression(slot==='p1'?1:2,10,0)})));
  const runtime = new PetCombatRuntime(), owner = {x:300,y:350,facingX:1 as const}, ground = bodyGroundFixture('monkey',1,250);
  if (branch !== 'hero-alone') runtime.update({ roster, owner, groundEnvironment:ground, targets:[], projectiles:model.projectiles,deltaMs:0,hostFps:24 });
  const party = createHeroPartyExperience(model,slot=>slot===ownerSlot ? runtime.currentAttackTarget(slot) : undefined,
    ()=>persistHeroPartyExperience(storage,model,rosters));
  const origin = runtime.snapshot().runtime ?? {x:300,y:250};
  const enemy = createStage1CombatEnemy({id:`${ownerSlot}/${type}/${branch}`,enemyType:type,x:origin.x+40,y:origin.y});
  enemy.hp = 1; const exp = getMonsterRewardConfig(type).experience; party.bind(enemy,exp);
  let ticks = 0;
  if (branch === 'pet') {
    for (;ticks<200 && enemy.phase !== 'dead';ticks++) {
      const port = createPetProjectileCombatPort({enemies:[enemy],combat:model.combat,ownerSlot,timeMs:ticks*1000/24,random:()=>0.1,
        mask:()=>{throw Error('Must use actual native normal-attack collision');},monkeyHorseCollision:()=>assets});
      runtime.update({roster,owner,groundEnvironment:ground,projectiles:model.projectiles,hostFps:24,deltaMs:1000/24,random:()=>0.1,
        targets:[{id:enemy.id,x:enemy.x,y:enemy.y,isAlive:enemy.hp>0}],projectileCombat:port,
        incomingFeedback:{model:model.incoming,ownerSlot,timeMs:ticks*1000/24}});
    }
  } else {
    assert.ok(resolveStage1HeroHit({runtime:model.combat,enemy,sourceId:ownerSlot,attackId:'actual-direct',actionName:'hit1',attackKind:'physics',
      damage:10000,knockbackX:0,knockbackY:0,timeMs:0,random:()=>0.1}));
  }
  assert.equal(enemy.phase,'dead',enemy.id);
  const heroAmount = branch==='pet' ? 0 : branch==='hero-pet' ? Math.trunc(exp*0.6) : exp;
  const petAmount = branch==='hero-alone' ? 0 : branch==='hero-pet' ? Math.trunc(exp*0.6) : exp;
  const hero = model.members.find(member=>member.combat.slot===ownerSlot)!.combat;
  if(type===2&&branch==='hero-alone') {
    const guard=createStage1CombatEnemy({id:ownerSlot+'/guard',enemyType:2,x:0,y:0});party.bind(guard,7);
    const hit={runtime:model.combat,enemy:guard,sourceId:ownerSlot,attackId:'guard',actionName:'hit1',attackKind:'physics' as const,
      damage:0,knockbackX:0,knockbackY:0,timeMs:0,random:()=>0.1};
    guard.sourceHitProtection={protected:true,dodgeProbability:0};assert.equal(resolveStage1HeroHit(hit),undefined);
    assert.equal(guard.experienceBinding!.target,undefined);
    guard.sourceHitProtection={protected:false,dodgeProbability:1};assert.equal(resolveStage1HeroHit({...hit,attackId:'dodge'}),undefined);
    assert.equal(guard.experienceBinding!.target,undefined);
    guard.sourceHitProtection=undefined;assert.ok(resolveStage1HeroHit({...hit,attackId:'zero'}));
    assert.equal(guard.experienceBinding!.target?.ownerSlot,ownerSlot);
    const missing=awardMonsterExperienceByTarget(rosters,{kind:'pet',ownerSlot,petId:'does-not-exist'},7);
    assert.equal(missing.petExperience,0);assert.equal(pet.exp,0);
    const legacy=createPetRuntime(pet,owner),source=bindLegacyPetExperience(legacy,roster,ownerSlot);
    roster.pets[0]=structuredClone(pet);bindLegacyPetExperience(legacy,roster,ownerSlot);
    assert.equal(roster.pets[0],pet);source.addExperience(1);assert.equal(roster.pets[0]!.exp,1);pet.exp=0;
  }
  assert.equal(hero.progression.currentExp,heroAmount,enemy.id+' hero');
  assert.equal(pet.exp,petAmount,enemy.id+' pet');
  settleMonsterExperience(enemy); assert.equal(pet.exp,petAmount);
  const restored = restoreGameState(loadActiveGame(storage)!,createSeedEquipmentRegistry());
  const saved = ownerSlot==='p1' ? restored.player1 : restored.player2;
  assert.equal(saved.progression.currentExp,heroAmount,enemy.id+' saved hero');
  assert.equal(saved.petRoster.pets.find(p=>p.id===pet.id)?.exp,petAmount,enemy.id+' saved pet');
  rows.push({id:enemy.id,heroAmount,petAmount,ticks,sourceRuntime:enemy.experienceBinding!.settlement!.target.runtimeId,reload:true});
  if (type === 30 && branch === 'pet') {
    const old = runtime.currentAttackTarget(ownerSlot)!;
    const retained = model.projectiles.projectiles.find(p=>p.experienceSource===old)!;
    assert.ok(retained, 'actual emitted projectile captured the session');
    const fresh = structuredClone(pet); fresh.id += '-replacement'; fresh.exp = 0;
    pet.isActive = false; fresh.isActive = true; roster.pets.push(fresh);
    runtime.update({roster,owner,groundEnvironment:ground,targets:[],projectiles:model.projectiles,deltaMs:0,hostFps:24});
    assert.equal(old.isReadyToDestroy(),true);
    assert.ok(model.projectiles.projectiles.every(p=>p.experienceSource?.runtimeId!==old.runtimeId),'normal replacement removes old projectiles');
    assert.notEqual(runtime.currentAttackTarget(ownerSlot)!.runtimeId,old.runtimeId);
    const late = createStage1CombatEnemy({id:enemy.id+'/retained-late',enemyType:30,x:0,y:0}); late.hp=1; party.bind(late,7);
    assert.ok(resolveStage1PetHit({runtime:model.combat,enemy:late,ownerSlot,petId:pet.id,experienceSource:retained.experienceSource,
      attackId:'retained-late',actionName:'hit1',attackKind:'physics',damage:10000,knockbackX:0,knockbackY:0,timeMs:1000}));
    assert.equal(pet.exp,petAmount+7,'retained object gets XP before target cleanup'); assert.equal(fresh.exp,0,'replacement never receives old pet XP');
    const again = restoreGameState(loadActiveGame(storage)!,createSeedEquipmentRegistry());
    const reloaded = ownerSlot==='p1'?again.player1:again.player2;
    assert.equal(reloaded.petRoster.pets.find(p=>p.id===pet.id)?.exp,petAmount+7);
    assert.equal(reloaded.petRoster.pets.find(p=>p.id===fresh.id)?.exp,0);
    rows.push({id:late.id,oldPet:pet.id,newPet:fresh.id,oldXp:pet.exp,newXp:fresh.exp,naturalOldProjectiles:0,
      boundary:'Retained late-hit reference forced after verifying normal runtime cleanup; no claim that removed projectile naturally hits.'});
  }
  if(type===30&&branch==='hero-pet') {
    hero.progression.currentExp=hero.progression.expToNext-1;
    pet.exp=getPetExperienceToNextLevel(pet.level)-1;
    const level=hero.progression.level,petLevel=pet.level;
    const threshold=createStage1CombatEnemy({id:enemy.id+'/level-up',enemyType:30,x:0,y:0});threshold.hp=1;party.bind(threshold,7);
    resolveStage1HeroHit({runtime:model.combat,enemy:threshold,sourceId:ownerSlot,attackId:'level-up',actionName:'hit1',attackKind:'physics',
      damage:10000,knockbackX:0,knockbackY:0,timeMs:1000});
    assert.equal(hero.progression.level,level+1);assert.equal(hero.progression.currentExp,3);
    assert.equal(pet.level,petLevel+1);assert.equal(pet.exp,3);
    const restored=restoreGameState(loadActiveGame(storage)!,createSeedEquipmentRegistry());
    const saved=ownerSlot==='p1'?restored.player1:restored.player2;
    assert.equal(saved.progression.level,level+1);assert.equal(saved.petRoster.pets.find(p=>p.id===pet.id)?.level,petLevel+1);
    rows.push({id:threshold.id,heroLevel:level+1,petLevel:petLevel+1,remainder:3,reload:true});
  }
  runtime.destroy();
}
writeFileSync('docs/tasks/evidence/TASK-SLICE-238/runtime-save-results.json',JSON.stringify({rows},null,2));
console.log(`${rows.length} real progression/roster/save cases; 24 native pet normal-attack collision producers.`);
