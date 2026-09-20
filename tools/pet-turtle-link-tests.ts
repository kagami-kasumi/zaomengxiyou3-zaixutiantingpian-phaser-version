import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createDefaultPetBehaviorRegistry } from '../src/systems/pet-behaviors/createDefaultPetBehaviorRegistry';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createHeroCombat, applyHeroDamage, applyHeroMagicShield } from '../src/systems/HeroCombatSystem';
import { applyHeroHealing, updateHeroTurtleLink, isTurtleLinkPaired, refreshTurtleLink, stepTurtleLink } from '../src/systems/PetTurtleLinkSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createStage1CombatRuntime, createStage1CombatEnemy, createStage1CombatPlayer,
  resolveStage1EnemyAttack } from '../src/systems/Stage1CombatSystem';
import type { PetCombatFrame } from '../src/systems/PetCombatTypes';

const assets = await PetTurtleAssets.decode(path => new Uint8Array(readFileSync(`public${path}`)));
const registry = createDefaultPetBehaviorRegistry(() => assets);
const native = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-221/settlement-trace.json', 'utf8'));
for (const source of native.sources) assert.equal(createHash('sha256').update(readFileSync(source.path)).digest('hex'), source.sha256);
const reports: unknown[] = [];
const buffNative = JSON.parse(gunzipSync(readFileSync('docs/tasks/evidence/TASK-SETTINGS-222A/buff-native.json.gz')).toString());
let buffStates = 0;
for (const id of new Set<string>(buffNative.rows.map((row: any) => row.id))) {
  const pet = createSeedPetRoster().pets.find(p => p.species === 'turtle' && p.form === 2)!;
  let heroBuff = refreshTurtleLink(undefined, pet, id, 0, 168, 24);
  let petBuff = refreshTurtleLink(undefined, pet, id, 0, 168, 24);
  for (const row of buffNative.rows.filter((row: any) => row.id === id)) {
    if (id.startsWith('buffrefresh') && row.tick === 48) {
      heroBuff = refreshTurtleLink(heroBuff, pet, id, 99, 168, 24);
      petBuff = refreshTurtleLink(petBuff, pet, id, 99, 168, 24);
    }
    if (row.tick > 0) { stepTurtleLink(heroBuff); stepTurtleLink(petBuff); }
    const expected = row.display.children.map((owner: any) => owner.children.filter((c: any) => c.name === 'PetTurtle2Buff'));
    assert.deepEqual([heroBuff, petBuff].map(b => Number(b.active && b.started)), expected.map((a: any[]) => a.length), `${id}/${row.tick}`);
    for (const children of expected) for (const child of children) assert.deepEqual(assets.linkOffset(),
      { x: child.matrix.tx, y: child.matrix.ty }, 'Production placement consumes the native owner matrix');
    buffStates++;
  }
}
function setup(form: 2 | 3 | 4 = 2, owner: 'p1' | 'p2' = 'p1', fps = 24) {
  const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'turtle' && p.form === form)!;
  roster.pets.forEach(p => { p.isActive = p === pet; });
  Object.assign(pet, { id: `${owner}-turtle${form}`, hp: 200, maxHp: 1000, mp: 1000, maxMp: 1000,
    atk: 100, technique: 1.25, warpower: 1.975, skills: ['txlj'], critBonusRate: 0 });
  const hero = createHeroCombat(owner); hero.hp = 200; hero.maxHp = 1000;
  const runtime = new PetCombatRuntime(registry), projectiles = createProjectileSystem();
  const frame: PetCombatFrame = { roster, owner: { x: 0, y: 0, facingX: 1 }, ownerCombat: hero,
    targets: [{ id: 'far', x: 1000, y: -30, isAlive: true }], projectiles, random: () => 0.5,
    hostFps: fps, deltaMs: 1000 / fps,
    groundEnvironment: { ownerRootOffsetY: 0, walls: [{ id: 'floor', left: -10000, right: 10000,
      top: 0.1, bottom: 20, usesWallTolerance: true }] },
    projectileCombat: { mask: () => { throw Error('legacy mask'); }, target: () => undefined,
      hit: () => assert.fail('Geometry miss cannot hit') } };
  runtime.update({ ...frame, deltaMs: 0 }); pet.skillState!.turtle2Txlj.cooldownMs = 0;
  const step = (extra: Partial<PetCombatFrame> = {}) => {
    updateHeroTurtleLink(hero, frame.deltaMs);
    return runtime.update({ ...frame, ...extra });
  };
  step(); const before = runtime.snapshot().animation;
  step();
  assert(hero.turtleLink, 'Production selection must create both buffs');
  assert.equal(hero.turtleLink.value, 6, 'uint(5*1.25*1.05)');
  assert.equal(hero.turtleLink.durationTicks, 7 * fps, 'uint(4*1.975) before multiplying FPS');
  assert.equal(pet.mp, 980);
  assert.equal(runtime.snapshot().animation?.action, before?.action, 'TXLJ has no body action');
  assert.equal(projectiles.projectiles.length, 0, 'TXLJ cannot create a damaging projectile');
  assert.equal(runtime.snapshot().protectedFromHits, true);
  assert(Math.abs(pet.skillState!.turtle2Txlj.cooldownMs - (20000 - 1000 / fps)) < 1e-6);
  return { roster, pet, hero, runtime, frame, projectiles, step };
}
const damage = (amount: number) => ({ sourceId: 'enemy', targetId: 'p1', attackId: 'attack',
  amount, attackKind: 'physics' as const, knockbackX: 0, knockbackY: 0, occurredAtMs: 1000 });

// Independent AS3 slice output, including unilateral buffs, integer boundaries and caps.
for (const row of native.cases) {
  const [owner, amount, mask, healing] = row.id.split('-');
  const s = setup(2, owner === '1' ? 'p1' : 'p2');
  const buff = s.hero.turtleLink!;
  buff.active = (Number(mask) & 1) !== 0;
  buff.peer!()!.active = (Number(mask) & 2) !== 0;
  if (healing === 'true') applyHeroHealing(s.hero, Number(amount));
  else applyHeroDamage(s.hero, damage(Number(amount)), 1000);
  assert.equal(s.hero.hp, row.hp, `${row.id} hero`);
  assert.equal(s.pet.hp, row.petHp, `${row.id} pet`);
  reports.push({ id: row.id, hp: s.hero.hp, petHp: s.pet.hp });
  s.runtime.destroy();
}

for (const form of [2, 3, 4] as const) for (const owner of ['p1', 'p2'] as const) {
  for (const absorbed of [0, 100, 101, 200]) {
    const s = setup(form, owner);
    if (absorbed) applyHeroMagicShield(s.hero, { kind: 'magicUmbrellaDefend', sourceName: 'shield',
      initialAmount: absorbed, remainingAmount: absorbed, remainingMs: 10000, totalMs: 10000 });
    applyHeroDamage(s.hero, damage(absorbed === 100 ? 201 : 101), 1000);
    assert.deepEqual([s.hero.hp, s.pet.hp], absorbed >= 101 ? [200, 200] : [105, 194], 'Shield precedes TXLJ');
    s.runtime.destroy();
  }
  const s = setup(form, owner), other = setup(form, owner === 'p1' ? 'p2' : 'p1');
  applyHeroHealing(s.hero, 101.9);
  assert.deepEqual([s.hero.hp, s.pet.hp, other.hero.hp, other.pet.hp], [306, 306, 200, 200]);
  assert.throws(() => s.step({ ownerCombat: other.hero }), /owner cannot change/, 'Reject P1/P2 port crossover');
  s.hero.hp = s.pet.hp = 990;
  applyHeroHealing(s.hero, 101);
  assert.deepEqual([s.hero.hp, s.pet.hp], [1000, 1000]);
  s.hero.hp = s.pet.hp = 200;
  s.pet.skills = ['sld', 'txlj']; s.pet.skillState!.turtle1Sld.cooldownMs = 0;
  let ownerHeals = 0;
  for (let i = 0; i < 50; i++) {
    const root = s.runtime.snapshot().runtime!;
    s.step({ targets: [{ id: 'far', x: root.x + 100, y: root.y, isAlive: true }] });
    for (const event of s.runtime.events()) if (event.behaviorEvent?.type === 'turtle-linked-owner-healed') {
      ownerHeals++; assert.equal((event.behaviorEvent.payload as any).notification, form === 4 ? 'event' : 'direct');
    }
    if (ownerHeals) break;
  }
  assert.equal(ownerHeals, 1);
  assert.deepEqual([s.hero.hp, s.pet.hp], [305, 305], 'SLD heals once on creation, even on geometry miss; no 1.05 echo');
  assert.deepEqual([other.hero.hp, other.pet.hp], [200, 200], 'SLD owner isolation');
  s.runtime.destroy(); other.runtime.destroy();
  assert(!isTurtleLinkPaired(s.hero.turtleLink));
  assert(s.hero.turtleLink?.active, 'Original BasePet.destroy clears only its own buff; hero residue expires independently');
  s.hero.hp = 200; applyHeroHealing(s.hero, 101);
  assert.equal(s.hero.hp, 301, 'Released pet cannot receive or echo healing');
}

for (const fps of [20, 24, 30]) {
  const s = setup(2, 'p1', fps), originalHero = s.hero.turtleLink!, originalPet = originalHero.peer!()!;
  assert(originalPet.started && !originalHero.started, 'Hero steps before pet; fresh hero buff displays next tick');
  s.step(); assert(originalHero.started);
  for (let i = 0; i < 10; i++) s.step();
  s.pet.technique = 2; s.pet.skillState!.turtle2Txlj.cooldownMs = 0;
  s.step();
  assert.equal(s.hero.turtleLink, originalHero, 'No duplicate hero buff on refresh');
  assert.equal(originalHero.peer!(), originalPet, 'No duplicate pet buff on refresh');
  assert.equal(originalHero.value, 6, 'Refresh does not overwrite original value');
  assert.equal(originalPet.age, 1); assert.equal(originalHero.age, 0);
  s.pet.skills = [];
  for (let i = 0; i < 7 * fps - 1; i++) s.step();
  assert(originalHero.active && originalPet.active);
  s.step(); assert(!originalPet.active && originalHero.active, 'Pet expiry then hero expiry in the next owner phase');
  s.step(); assert(!originalHero.active);
  s.runtime.destroy();
}

// Formal enemy resolver must consume the same HeroCombat model without a scene-only redirect callback.
{
  const s = setup(), combat = createStage1CombatRuntime();
  const player = createStage1CombatPlayer('p1'); player.combat = s.hero;
  const enemy = createStage1CombatEnemy({ id: 'formal', enemyType: 2, x: 0, y: 0 });
  enemy.phase = 'active'; enemy.activeAttack = { attackId: 'formal-1', actionName: 'hit1',
    damage: 101, attackKind: 'magic', attackRange: 100, knockbackX: 0, knockbackY: 0 } as any;
  const events = resolveStage1EnemyAttack({ runtime: combat, enemy, players: [{ player, x: 0 }], timeMs: 1000 });
  assert.equal(events.length, 1); assert.deepEqual([s.hero.hp, s.pet.hp], [105, 194]);
  resolveStage1EnemyAttack({ runtime: combat, enemy, players: [{ player, x: 0 }], timeMs: 2000 });
  assert.deepEqual([s.hero.hp, s.pet.hp], [105, 194], 'Repeated attack identity is rejected');
  s.runtime.destroy();
}
if (!process.env.TURTLE_LINK_MUTATION) {
  const out = 'docs/tasks/evidence/TASK-SLICE-224A3'; mkdirSync(out, { recursive: true });
  writeFileSync(`${out}/link-trace.json`, JSON.stringify({ status: 'passed', nativeCases: reports,
    buffStates, forms: [2, 3, 4], owners: ['p1', 'p2'], fps: [20, 24, 30] }, null, 2) + '\n');
}
console.log(`Turtle link: ${reports.length} source settlements, dual-owner SLD, shields, refresh, expiry and formal resolver passed`);
