import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime, resolveHeroPartyEnemyAttack } from '../src/systems/HeroPartyRuntimeSystem';
import { addHeroPetBuff, stepHeroPetBuffs, type HeroPetBuffName } from '../src/systems/HeroPetBuffSystem';
import { createStage1CombatEnemy } from '../src/systems/Stage1CombatSystem';
import { createMonster30AttackRuntime } from '../src/systems/Monster30AttackRuntime';
import { createStage1CombatPlayerHudSnapshot } from '../src/systems/Stage1CombatHudSystem';
import { getHeroBaseStats } from '../src/systems/ProgressionSystem';
import { readHeroCurrentStats } from '../src/systems/HeroCurrentStats';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { PetBehaviorRegistry } from '../src/systems/PetBehaviorRegistry';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createSkillLearningState } from '../src/systems/SkillUISystem';
import { applyHeroDirectDamage } from '../src/systems/HeroCombatSystem';
import { createDamageEvent } from '../src/systems/CombatSystem';
import { updateRole1SkillBridge } from '../src/scenes/test-scene/TestSceneRole1SkillBridge';
import { updateRole2SkillBridge } from '../src/scenes/test-scene/TestSceneRole2SkillBridge';
import { updateRole3SkillBridge } from '../src/scenes/test-scene/TestSceneRole3SkillBridge';
import { updateRole4SkillBridge } from '../src/scenes/test-scene/TestSceneRole4SkillBridge';
import { updateRole5SkillBridge } from '../src/scenes/test-scene/TestSceneRole5SkillBridge';
import { petExperienceClosureFixture, petExperienceClosureBindings } from './pet-experience-closure-fixture';

const ts = createRequire(import.meta.url)('typescript');
const truth = JSON.parse(readFileSync('docs/reverse-engineering/reference/pet-passive-auto-buff-contract.json', 'utf8'));
const rows: any[] = [];
const party = (heroId: any = 1) => createHeroPartyRuntimeModel(['p1', 'p2'].map((slot, index) => ({
  slot: slot as 'p1' | 'p2', heroId, x: 100 + 200 * index, y: 250, width: 48,
})));
function stats(player: any) {
  return [player.combat.hp, player.skill.mp, player.combat.maxHp, player.skill.maxMp,
    player.effectiveStats.power, player.effectiveStats.defense];
}
function initialize(player: any, initial: number[]) {
  [player.combat.hp, player.skill.mp, player.combat.maxHp, player.skill.maxMp,
    player.effectiveStats.power, player.effectiveStats.defense] = initial;
  Object.assign(player.effectiveStats, { maxHp: player.combat.maxHp, maxMp: player.skill.maxMp });
  player.mp = player.skill.mp; player.maxMp = player.skill.maxMp;
}
for (const test of truth.expectedCases.filter((test: any) => test.id.startsWith('effects/'))) {
  const model = party(), player = model.members[0]!.combat;
  initialize(player, test.result.initial);
  for (const effect of test.result.rows[0].effects) addHeroPetBuff(player, effect.name, effect.value, effect.time);
  const host = new PetCombatRuntime();
  for (let tick = 0; tick <= test.input.duration + 2; tick++) {
    host.update({ roster: { pets: [], selectedIndex: 0, message: '' }, owner: { x: 0, y: 0, facingX: 1 },
      targets: [], deltaMs: 1000 / test.input.fps, hostFps: test.input.fps, ownerStep: player.stepPetBuffs });
    const expected = test.result.rows.find((row: any) => row.tick === tick);
    if (expected) {
      assert.deepEqual(stats(player), expected.stats, `${test.id}/${tick}/stats`);
      assert.deepEqual(player.petBuffs.effects, expected.effects, `${test.id}/${tick}/effects`);
      const hud = createStage1CombatPlayerHudSnapshot(player);
      assert.equal(hud.hp, expected.stats[0]); assert.equal(hud.mp, expected.stats[1]);
      assert.equal(model.members[1]!.combat.petBuffs.count, 0, 'other owner remains untouched');
    }
  }
  rows.push({ id: test.id, status: 'passed' });
}
{
  const player = party().members[0]!.combat;
  addHeroPetBuff(player, 'gjjc', 7, 3); stepHeroPetBuffs(player);
  const power = player.effectiveStats.power;
  addHeroPetBuff(player, 'gjjc', 99, 5);
  assert.deepEqual(player.petBuffs.effects, truth.expectedCases.find((test: any) => test.id === 'refresh').result);
  const expected = truth.expectedCases.find((test: any) => test.id === 'expiry').result;
  for (const effects of expected) { stepHeroPetBuffs(player); assert.deepEqual(player.petBuffs.effects, effects); }
  assert.equal(player.effectiveStats.power, power - 7);
  rows.push({ id: 'refresh/expiry', status: 'passed' });
}
// Use the saved production compatibility mapping, including its live getters.
{
  const player = party().members[0]!.combat, roster = createSeedPetRoster();
  const observed: number[] = [];
  const registry = new PetBehaviorRegistry();
  for (const pet of roster.pets) registry.register(pet.species, pet.form, () => ({
    usesHostTicks: true, enter() {}, canMove: () => false, selectAction: () => undefined,
    basicAttack: () => undefined, executeAction() {}, updateEffects() {}, onDamaged() {},
    onAnimationEvent() {}, destroy() {}, beforeActions() { observed.push(player.effectiveStats.power); },
  }));
  const host = new PetCombatRuntime(registry), base = player.effectiveStats.power;
  addHeroPetBuff(player, 'gjjc', 7, 8);
  const frame = { roster, owner: { x: 0, y: 0, facingX: 1 as const }, targets: [],
    deltaMs: 1000 / 24, hostFps: 24, ownerStep: player.stepPetBuffs };
  host.update(frame);
  assert.equal(observed[0], base + 7, 'actual pet session observes the preceding hero property phase');
  const retained = player.petBuffs.effects[0];
  roster.pets.forEach(pet => { pet.isActive = false; });
  host.update(frame);
  assert.equal(player.petBuffs.effects[0], retained, 'rest retains the hero effect object');
  roster.pets[1]!.isActive = true;
  host.update(frame);
  assert.equal(player.petBuffs.effects[0], retained, 'replacement retains the hero effect object');
  assert.equal(player.petBuffs.count, 3);
  assert.equal(observed.at(-1), base + 7);
  host.destroy();
  assert.equal(player.petBuffs.effects[0], retained, 'pet runtime release does not own hero cleanup');
  rows.push({ id: 'actual-session/owner-before-pet-rest-replace', status: 'passed' });
}
const viewSource = readFileSync('src/scenes/test-scene/TestSceneHeroPartyRuntimeBridge.ts', 'utf8');
const viewStart = viewSource.indexOf('  const players = runtime.compatibilityMembers().map(');
const viewEnd = viewSource.indexOf('  if (role1ShadowQa)', viewStart);
const viewMapping = ts.transpileModule(viewSource.slice(viewStart, viewEnd) + '\nreturn players;',
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
function views(model: any) {
  return new Function('runtime', 'markers', 'getHeroBaseStats', viewMapping)(
    { compatibilityMembers: () => model.members }, model.members.map(() => ({ sprite: {}, label: {} })), getHeroBaseStats);
}
const input = (slot: 'p1' | 'p2', cast: boolean) => ({ slot, moveX: 0, down: false, up: false, attack: false,
  jump: false, special: false, magicWeapon: false, skillSlots: [cast, false, false, false, false] });
const bridges = [updateRole1SkillBridge, updateRole2SkillBridge, updateRole3SkillBridge, updateRole4SkillBridge, updateRole5SkillBridge];
const names = ['lyfb', 'xbz', 'jsp', 'qlj', 'xlc'];
for (const heroId of [1, 2, 3, 4, 5]) {
 for (const slot of ['p1', 'p2'] as const) {
  function cast(buff: boolean) {
    const model = party(heroId), player = model.members.find(member => member.combat.slot === slot)!.combat, compatibility = views(model);
    initialize(player, [333, 1000, 1000, 1000, 101, 39]);
    if (buff) { addHeroPetBuff(player, 'gjjc', 18.9, 200); stepHeroPetBuffs(player); }
    assert.equal(compatibility[slot === 'p1' ? 0 : 1].currentStats, player.effectiveStats);
    assert.equal(readHeroCurrentStats(compatibility[slot === 'p1' ? 0 : 1]), player.effectiveStats);
    assert.equal(readHeroCurrentStats(compatibility[1]), model.members[1]!.combat.effectiveStats);
    player.skill.loadout.slots[0] = { skillName: names[heroId - 1], level: 1 } as any;
    const learning = createSkillLearningState(90);
    learning.trees[0].learnedSkills.push({ skillName: names[heroId - 1] as any, level: 1 });
    learning.trees[1].learnedSkills.push({ skillName: names[heroId - 1] as any, level: 1 });
    const projectiles = createProjectileSystem();
    const result = (bridges[heroId - 1] as any)({ players: compatibility,
      input: { p1: input('p1', slot === 'p1'), p2: input('p2', slot === 'p2') }, previousInput: undefined,
      projectiles, monsters: [], petRosters: { p1: { pets: [] }, p2: { pets: [] } }, petRuntimes: {},
      skillLearning: { p1: learning, p2: learning }, timeMs: 1000, deltaMs: 0 });
    const events = Array.isArray(result) ? result : result.castEvents;
    assert(events.length > 0, `real Role${heroId} skill must cast`);
    const damage = projectiles.projectiles.map(projectile => projectile.damage);
    assert(damage.length > 0, `real Role${heroId} skill must spawn damage`);
    return damage;
  }
  const base = cast(false), buffed = cast(true);
  assert(buffed.some((damage, index) => damage > base[index]!), `Role${heroId} actual damage reads current power`);
  rows.push({ id: `skill/role${heroId}/${slot}`, base, buffed });
 }
}
// Use a previously measured native hit fixture, then run the real hero defense settlement.
const collision = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-241/native.json', 'utf8')).cases
  .find((row: any) => row.profile === 'hero-ObjectBaseSprite' && row.hit);
for (const slot of ['p1', 'p2'] as const) {
  function hurt(buff: boolean) {
    const model = party(), member = model.members.find(member => member.combat.slot === slot)!;
    const player = member.combat;
    initialize(player, [333, 77, 1000, 200, 101, 39]);
    member.movement.x = collision.targetRoot.x; member.movement.y = collision.targetRoot.y + 50;
    if (buff) { addHeroPetBuff(player, 'fyjc', 15.75, 200); stepHeroPetBuffs(player); }
    const enemy = createStage1CombatEnemy({ id: `defense-${slot}`, enemyType: 30, x: collision.sourceRoot.x, y: collision.sourceRoot.y });
    enemy.attackRuntime = createMonster30AttackRuntime();
    enemy.attackRuntime.detections.push({ attackId: `defense-${slot}`, sourceId: enemy.id,
      x: collision.sourceRoot.x, y: collision.sourceRoot.y, facingX: collision.sign, frame: collision.frame,
      age: 0, damage: 120, attackKind: 'physics', actionName: 'hit1', knockbackX: 0, knockbackY: 0 });
    resolveHeroPartyEnemyAttack(model, enemy, 1000);
    const event = model.combat.audit.damageEvents.find(event => event.targetId === slot);
    assert(event, 'actual collision must enter shared defense settlement');
    assert.equal(333 - player.combat.hp, event.amount);
    return event.amount;
  }
  assert.equal(hurt(false), 81); assert.equal(hurt(true), 66);
  rows.push({ id: `actual-defense/${slot}`, base: 81, buffed: 66, collisionFixture: collision.id });
}
// Read the real five-entry common party closure; no pet is required for expiry.
const source = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8').replaceAll('\r\n', '\n');
const start = source.indexOf('  function updatePets(frame:');
const closure = ts.transpileModule(source.slice(start, source.indexOf('\n}\n\nfunction syncFallbackFeedback', start)),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
for (const stage of [11, 12, 13, 21, 22]) {
  const model = party(), player = model.members[0]!.combat;
  addHeroPetBuff(player, 'fyjc', 15.75, 3);
  const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const update = new Function('model', 'petRosters', 'petCombatRuntimes', 'petCombatSnapshots',
    'pendingPetDamageEvents', 'pendingPetAnimationEvents', 'scene', 'petProjectileCombat',
    'petDragonPresentation', 'isPetDragonQaEnabled', 'petTurtle', 'experienceDependencies',
    petExperienceClosureBindings + closure + '\nreturn updatePets;')(
    model, {}, runtimes, {}, {}, {}, { game: { loop: { targetFps: 24 } } },
    Object.assign(() => ({}), { readyRoster: (roster: any) => roster }), { update() {} }, () => false,
    { readyRoster: (roster: any) => roster, update() {} }, petExperienceClosureFixture);
  update({ targets: [], projectiles: model.projectiles, timeMs: 0, deltaMs: 0 });
  assert.equal(player.petBuffs.count, 0, 'pause must not step hero effects');
  const base = player.effectiveStats.defense;
  update({ targets: [], projectiles: model.projectiles, timeMs: 1, deltaMs: 1000 / 48 });
  assert.equal(player.petBuffs.count, 0, 'subframe must not step');
  update({ targets: [], projectiles: model.projectiles, timeMs: 2, deltaMs: 1000 / 48 });
  assert.equal(player.effectiveStats.defense, (base + 15.75) | 0);
  update({ targets: [], projectiles: model.projectiles, timeMs: 3, deltaMs: 1000 / 12 });
  assert.equal(player.petBuffs.count, 3, 'batched render frame shares the slot host clock');
  assert.equal(player.effectiveStats.defense, base - 1, 'source int expiry is not exact restore');
  addHeroPetBuff(player, 'smjc', 220.5, 200); stepHeroPetBuffs(player);
  destroyHeroPartyRuntime(model);
  assert.deepEqual(player.petBuffs.effects, [], 'exit clears owner state despite retained references');
  rows.push({ id: `common-entry/${stage}`, status: 'passed', scope: 'common production closure; no scene/browser' });
}
{
  const model = party(), player = model.members[0]!.combat;
  addHeroPetBuff(player, 'smjc', 220.5, 200); stepHeroPetBuffs(player);
  applyHeroDirectDamage(player.combat, createDamageEvent({ sourceId: 'test-hazard', targetId: 'p1', attackId: 'death',
    attackKind: 'physics', amount: 99999, actionName: 'death', knockbackX: 0, occurredAtMs: 0 }), 0);
  assert.deepEqual(player.petBuffs.effects, []);
  assert.equal(player.combat.hp, 0, 'death cleanup must not resurrect owner');
}
if (!process.env.PET_BUFF_MUTATION) {
  mkdirSync('docs/tasks/evidence/TASK-SLICE-242A', { recursive: true });
  writeFileSync('docs/tasks/evidence/TASK-SLICE-242A/production-tests.json', JSON.stringify({ status: 'passed', rows }, null, 2) + '\n');
}
console.log(`242A: ${rows.length} native/skill/common-owner groups passed.`);
