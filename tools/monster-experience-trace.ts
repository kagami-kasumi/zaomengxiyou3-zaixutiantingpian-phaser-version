import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { acceptMonsterAttackTarget as accept, clearUnavailableMonsterAttackTarget as cleanup,
  selectMonsterAttackTarget as select, settleMonsterExperience, type MonsterAttackTarget } from '../src/systems/MonsterExperienceSystem';
import { createStage1CombatEnemy, updateStage1Enemy } from '../src/systems/Stage1CombatSystem';
import { addMonsterPetTargetEffects, stepMonsterPetTargetEffects } from '../src/systems/MonsterPetTargetEffectSystem';

const source = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-231/source-trace.json', 'utf8'));
const cases = source.cases.map(({ scenario: s, owner, exp }: { scenario: string; owner: number; exp: number }) => {
  const values = [11,11,7,7,7], updates = [0,0,0], dead = new Set<number>(), retired = new Set<number>();
  const pets: Array<MonsterAttackTarget | undefined> = [], positions = [400,400,0,0,0];
  positions[1-owner] = 100;
  let healed = 0, merchant = false, hasPlayer = true, accepted = true;
  const ids = ['h1','h2','old','fresh','other-pet'];
  const actors: MonsterAttackTarget[] = ids.map((id, i) => ({
    kind: i < 2 ? 'hero' : 'pet', runtimeId: id, ownerSlot: (i < 2 ? i : i === 4 ? 1-owner : owner) === 1 ? 'p2' : 'p1',
    petId: i < 2 ? undefined : id,
    position: () => ({ x: positions[i]!, y: 0 }), isDead: () => dead.has(i), isReadyToDestroy: () => retired.has(i),
    currentPet: () => pets[i], addExperience: amount => {
      if (i === owner && !hasPlayer) return;
      values[i]! += amount;
      if (i >= 2) updates[i-2]!++;
    },
    onMonsterDefeated: () => { if (i === owner && merchant) healed += 13; },
  }));
  const [h1,h2,old,fresh,op] = actors, h = actors[owner]!, other = actors[1-owner]!;
  const m = createStage1CombatEnemy({ id: `${s}/${owner}/${exp}`, enemyType: 30, x: 0, y: 0 });
  m.hp = m.maxHp = 1000;
  m.experienceBinding = { settled: false, experience: exp, heroes: () => [h1!,h2!], persist: () => {} };
  const ai = () => select(m, m.x, m.y, s === 'out-of-range' ? 10 : 1000);
  const world = () => { stepMonsterPetTargetEffects(m, 1000/24, 24); updateStage1Enemy({ enemy: m, targets: [], deltaMs: 0 }); };
  if (s === 'none') {}
  else if (s === 'hero') accept(m,h);
  else if (['hero-pet','hero-new-pet','hero-merchant'].includes(s)) {
    pets[owner] = old; accept(m,h);
    if (s === 'hero-new-pet') pets[owner] = fresh;
    merchant = s === 'hero-merchant';
  } else if (s === 'hero-no-player') { hasPlayer = false; accept(m,h); }
  else if (['hero-retired-clear','dead-hero-before-fire','dead-hero-cleared'].includes(s)) {
    accept(m,h); (s === 'hero-retired-clear' ? retired : dead).add(owner);
    if (s !== 'dead-hero-before-fire') cleanup(m);
  } else if (['out-of-range','no-live-heroes'].includes(s)) {
    if (s === 'no-live-heroes') { dead.add(0); dead.add(1); } ai();
  } else {
    pets[owner] = old; pets[1-owner] = op; accept(m,other); accept(m,old);
    if (s === 'later-hero') accept(m,other);
    if (s === 'later-pet') accept(m,op);
    if (s === 'ai-retains') ai();
    if (['dead-before-fire','dead-ai-clear','dead-ai-next'].includes(s)) dead.add(2);
    if (['dead-ai-clear','dead-ai-next'].includes(s)) ai();
    if (s === 'dead-ai-next') ai();
    if (['retired-before-fire','retired-cleared','retired-reselected','old-pet-new-active'].includes(s)) retired.add(2);
    if (s === 'old-pet-new-active') pets[owner] = fresh;
    if (['retired-cleared','retired-reselected'].includes(s)) cleanup(m);
    if (s === 'retired-reselected') ai();
    if (s === 'hurt-ai') { m.experienceBinding.target = undefined; m.phase = 'hurt'; m.phaseRemainingMs = 100; updateStage1Enemy({ enemy:m, targets:[], deltaMs:0 }); }
    if (s === 'frozen-ai') { m.experienceBinding.target = undefined; addMonsterPetTargetEffects(m,[{name:'pethorse_ice',time:100}]); updateStage1Enemy({ enemy:m, targets:[], deltaMs:0 }); }
    if (s.includes('world')) {
      (s === 'dead-world-lethal' ? dead : retired).add(2);
      if (['retired-world-one-wait','retired-world-two-waits'].includes(s)) world();
      if (s === 'retired-world-two-waits') world();
    }
    if (['dodge','protected','miss','accepted-no-info'].includes(s)) {
      accepted = s === 'accepted-no-info'; if (accepted) accept(m,other);
    }
  }
  const target = m.experienceBinding.target?.runtimeId ?? 'none';
  // The real effect consumer performs HP subtraction and calls the death settlement.
  addMonsterPetTargetEffects(m,[{ name:'petmonkey_fire',time:100,hurt:1000 }]);
  if (s.includes('world')) { stepMonsterPetTargetEffects(m,1000,24); updateStage1Enemy({ enemy:m, targets:[], deltaMs:0 }); }
  else { for (let i=0;i<24 && m.phase !== 'dead';i++) stepMonsterPetTargetEffects(m,1000/24,24); }
  assert.equal(m.phase,'dead');
  const first = [...values]; settleMonsterExperience(m); stepMonsterPetTargetEffects(m,1000,24);
  return { id:m.id,scenario:s,owner,exp,target,targetAfter:m.experienceBinding.target?.runtimeId ?? 'none',
    accepted,first,repeat:[...values],healed,action:m.phase,petUpdates:updates,persisted:values.slice(0,2) };
});
mkdirSync('docs/tasks/evidence/TASK-SLICE-238',{recursive:true});
writeFileSync(process.env.MONSTER_EXPERIENCE_TRACE_OUT ?? 'docs/tasks/evidence/TASK-SLICE-238/production-trace.json',JSON.stringify({
  boundary:'Production target state and effect death consumers; controlled actor setters. Real roster/save and attack producers are separate acceptance.', cases },null,2));
console.log(`Produced ${cases.length} production state traces; independent Python expected verifier required.`);

const selection = JSON.parse(readFileSync('docs/reverse-engineering/reference/monster-target-selection-contract.json','utf8'));
for (const fixture of selection.fixtures) {
  const heroes: MonsterAttackTarget[] = ['p1','p2'].map((slot,i)=>({kind:'hero',ownerSlot:slot as 'p1'|'p2',runtimeId:slot,
    position:()=>({x:fixture[slot][0],y:fixture[slot][1]}),isDead:()=>fixture.states[i]==='dead',isReadyToDestroy:()=>fixture.states[i]==='retired',addExperience:()=>{}}));
  const old: MonsterAttackTarget = {kind:'pet',ownerSlot:'p1',runtimeId:'old',position:()=>({x:0,y:0}),
    isDead:()=>fixture.sequence.includes('dead'),isReadyToDestroy:()=>fixture.sequence.includes('retired'),addExperience:()=>{}};
  const host = { experienceBinding:{target:undefined as MonsterAttackTarget|undefined,settled:false,experience:1,
    heroes:()=>heroes.filter((_,i)=>fixture.states[i]!=='missing'),persist:()=>{}} };
  const ai=()=>select(host,0,0,fixture.radius);
  if (fixture.sequence==='retain-live') { accept(host,old); ai(); }
  else if (fixture.sequence.includes('dead')) {accept(host,old);ai();if(fixture.sequence==='reselect-dead')ai();}
  else if (fixture.sequence.includes('retired')) {accept(host,old);cleanup(host);if(fixture.sequence==='reselect-retired')ai();}
  else if (!['blocked','hurt'].includes(fixture.sequence)) ai();
  assert.equal(host.experienceBinding.target?.runtimeId ?? null,fixture.expected,fixture.id);
}
console.log(`Verified ${selection.fixtures.length} independent native selection fixtures.`);
