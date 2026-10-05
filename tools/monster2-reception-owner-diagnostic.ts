import assert from 'node:assert/strict';
import {writeFileSync,mkdirSync} from 'node:fs';
import {checkMonsterAttackReception} from '../src/systems/MonsterAttackReception';
import {monster3AttackHits} from '../src/systems/Monster3AttackRuntime';
import { heroPartyMonster3Targets } from '../src/scenes/HeroPartyMonster3Reception';
import { bindHeroPartyPetRetirement } from '../src/scenes/HeroPartyPetRetirement';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { monster3AttackRequest, type Monster3Attack } from '../src/systems/Monster3AttackRuntime';

// Owner adapter test; placement is controlled and is not a natural Scene journey.
const model = createHeroPartyRuntimeModel(['p1', 'p2'].map(slot => ({
  slot: slot as 'p1' | 'p2', heroId: 1, x: 300, y: 200, width: 40,
})));
const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
const unbind = bindHeroPartyPetRetirement(model, runtimes, () => {});
const pets = Object.fromEntries(['p1', 'p2'].map(slot => {
  const pet = structuredClone(createSeedPetRoster().pets.find(p => p.species === 'monkey' && p.form === 1)!);
  pet.id = `${slot}-pet`; pet.isActive = true;
  return [slot, pet];
})) as Record<'p1' | 'p2', ReturnType<typeof createSeedPetRoster>['pets'][number]>;
for (const slot of ['p1', 'p2'] as const) for (let tick = 0; tick < 120; tick++) runtimes[slot].update({
  roster: { pets: [pets[slot]], selectedIndex: 0, message: '' },
  owner: { x: 300, y: 200, facingX: 1 }, targets: [], random: () => 0.99,
  deltaMs: 1000 / 30, hostFps: 30,
  groundEnvironment: { ownerRootOffsetY: -50, walls: [{ id: 'floor', left: -1000, right: 2000,
    top: 250.1, bottom: 280, usesWallTolerance: true }] },
});

const rows=[];
for(const slot of ['p1','p2'] as const){
 const member=model.members.find(m=>m.combat.slot===slot)!,player=member.combat;
 player.combat.hp=1;player.combat.maxHp=1000;player.effectiveStats.defense=0;player.effectiveStats.missPercent=0;
 const pet=pets[slot];pet.hp=pet.maxHp=1000;
 const pose=runtimes[slot].snapshot().runtime!;
 member.movement.x=pose.x;member.movement.y=pose.y+50;
 const attack:Monster3Attack={id:'diagnostic',action:'hit1',x:pose.x,y:pose.y,facingX:-1,frame:3,age:3,parentId:'world',
 source:{boss:true,hit:0,criticalPercent:0,magicDefenseReduction:0,flower:false,random:()=>0.9},
 reception:{prefix:'diagnostic-'+slot,serial:1,count:0,remaining:99,interval:999}};
 let found=false;
 for(let dx=-150;dx<=150&&!found;dx+=5)for(let dy=-150;dy<=150;dy+=5){
  attack.x=pose.x+dx;attack.y=pose.y+dy;
  if(monster3AttackHits(attack,'hero-ObjectBaseSprite',pose.x,pose.y)&&monster3AttackHits(attack,'pet-ObjectBaseSprite3',pose.x,pose.y)){found=true;break;}
 }
 assert(found,'controlled common overlap must exist');
 const pairs=heroPartyMonster3Targets(model,runtimes,s=>pets[s],()=>false,attack);
 const pair=pairs[slot==='p1'?0:1]!;
 assert(pair.pet);
 // Source damage is explicitly Monster2 power29; existing shared production receivers are under diagnosis.
 const request={...monster3AttackRequest(attack,1000,30,0),power:29};
 const before=pet.hp;
 checkMonsterAttackReception(attack.reception,request,[pair]);
 rows.push({slot,heroHp:player.combat.hp,heroState:player.combat.state,petBefore:before,petAfter:pet.hp,
  petRuntimeStillPresent:!!runtimes[slot].snapshot().runtime,remaining:attack.reception.remaining,
  sourceExpectedPetHp:before,sourceExpectedRemaining:98});
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-259',{recursive:true});
writeFileSync('docs/tasks/evidence/TASK-SLICE-259/modern-retirement-diagnostic.json',JSON.stringify({status:'diagnostic-not-acceptance',boundary:'Real current party adapters/HP owners and controlled common collision pose; not a Scene journey',rows},null,2));
unbind();
runtimes.p1.destroy();runtimes.p2.destroy();destroyHeroPartyRuntime(model);
console.log(JSON.stringify(rows));
