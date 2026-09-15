import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { applyPetTurtleTxljOwnerDamage } from '../src/systems/PetTurtleSkillSystem';
import { createHeroCombat, applyHeroDamage, applyHeroMagicShield } from '../src/systems/HeroCombatSystem';
import { createDamageEvent } from '../src/systems/CombatSystem';

// Existing active-link state, followed by real exported settlement calls.
// This is a boundary probe, not a claim of browser or original-game execution.
function linkedPet() {
  const roster=createSeedPetRoster();
  for(const pet of roster.pets)pet.isActive=false;
  const pet=roster.pets.find(p=>p.id==='pet-turtle-2')!;
  pet.isActive=true;pet.hp=200;
  pet.skillState!.turtle2Txlj.linkRemainingMs=1000;
  return {roster,pet};
}
function damage(amount:number) {
  return createDamageEvent({attackId:'probe-hit',targetId:'p1',sourceId:'monster30',
    actionName:'hit1',amount,attackKind:'physical',knockbackX:0,knockbackY:0,occurredAtMs:0});
}
const truth=JSON.parse(readFileSync('docs/reverse-engineering/ground-truth/manifests/task-settings-215-player-pet-incoming-damage-feedback.json','utf8'));
const fixture=truth.behavior.fixtures.find((f:any)=>f.id==='hero-petturtle-transfer');
assert.equal(truth.status,'verified');
const linked=linkedPet();
const transfer=applyPetTurtleTxljOwnerDamage(linked.roster,101);
const rows:any[]=[{id:'transfer-101',expected:{ownerDamage:fixture.expected.heroDamageAfterTransfer,petDamage:fixture.expected.petDamage},
  actual:{ownerDamage:transfer.ownerDamage,petDamage:transfer.petDamage}}];
for(const mode of ['invulnerable','full-shield']) {
  const {roster,pet}=linkedPet();
  const hero=createHeroCombat('p1');hero.hp=200;hero.maxHp=200;
  if(mode==='invulnerable')hero.invulnerableUntilMs=1000;
  else applyHeroMagicShield(hero,{kind:'magicUmbrellaDefend',sourceName:'probe',initialAmount:200,
    remainingAmount:200,totalMs:1000,remainingMs:1000});
  // The order below is the current TestSceneCombatBridge/BossArena call order.
  const redirect=applyPetTurtleTxljOwnerDamage(roster,101);
  const accepted=applyHeroDamage(hero,damage(redirect.ownerDamage),0);
  rows.push({id:mode,expected:{heroHp:200,petHp:200},actual:{heroHp:hero.hp,petHp:pet.hp},accepted});
}
const hero=createHeroCombat('p1');hero.hp=200;hero.maxHp=200;hero.role3DamageReduction=.01;
applyHeroDamage(hero,damage(101),0);
rows.push({id:'role3-int-boundary',expected:{hp:101},actual:{hp:hero.hp},
  source:'Role3.as:1201..1222 int param1 *= reduceHurt; sd level1 only, no flat defense'});
const out='docs/tasks/evidence/TASK-SLICE-216B';
mkdirSync(out,{recursive:true});
if(!process.argv.includes('--verify'))writeFileSync(out+'/settlement-preflight.json',JSON.stringify({
  scope:'Real exported settlement functions plus explicitly identified current TestScene caller ordering; not gameplay trace',
  rows,
},null,2)+'\n');
console.log(JSON.stringify(rows,null,2));
if(process.argv.includes('--verify'))for(const row of rows)assert.deepEqual(row.actual,row.expected,row.id);
