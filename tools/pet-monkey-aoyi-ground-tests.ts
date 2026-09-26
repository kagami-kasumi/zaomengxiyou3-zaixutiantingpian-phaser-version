/** Coupled original body/ground trace. Explicit release entrance, real Session. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { PetBehaviorRegistry } from '../src/systems/PetBehaviorRegistry';
import { MonkeyPetBehavior } from '../src/systems/pet-behaviors/MonkeyPetBehavior';
import { getPetMonkeyHorseGroundDefinition } from '../src/systems/PetMonkeyHorseGroundDefinition';
import { getPetMonkeyHorseActionAliases } from '../src/systems/PetMonkeyHorseAnimationClock';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { bodyFixtureCollisionAssets } from './pet226-body/body-fixture-collision';
import { bodyGroundFixture } from './pet226-body/ground-fixture';
import type { PetBehavior } from '../src/systems/PetBehavior';
import type { PetProjectileCombatPort } from '../src/systems/PetProjectileCombatPort';
import { PetTuning } from '../src/systems/PetTuning';

const native = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SLICE-226/aoyi-ground-air/measurement.json', 'utf8'));
for (const source of native.sources) assert.equal(createHash('sha256').update(readFileSync(source.path)).digest('hex'), source.fileSha256);
for (const [path, hash] of Object.entries(native.inputHashes)) assert.equal(createHash('sha256').update(readFileSync(path)).digest('hex'), hash);
const prospective = process.env.PET226_PROSPECTIVE_GROUND === '1';
const aliases = getPetMonkeyHorseActionAliases('monkey', 4);
const failures: unknown[] = [];
let states = 0, cases = 0;
for (const sample of native.cases)
for (const parts of sample.owner === 1 && ['static', 'empty', 'hurt', 'counter'].includes(sample.mode)
  && sample.choose === 0 && sample.side === .5 - 1e-10 ? [1, 2, 4] : [1]) {
  const roster = createSeedPetRoster();
  roster.pets.forEach(p => { p.isActive = p.species === 'monkey' && p.form === 4; });
  const pet = roster.pets.find(p => p.isActive)!;
  pet.id = `p${sample.owner}-${pet.id}`;
  pet.skills = ['jgaoyi', ...(['lyq', 'xj', 'lj'] as const).filter((_, index) => sample.skills & (1 << index))];
  if (sample.mode === 'counter') pet.skills.push('qlfj');
  pet.hp = pet.maxHp = 100; pet.warpower = 1;
  pet.mp = 1000; pet.critBonusRate = 0;
  for (const key of ['monkey3Lyq', 'monkey3Xj', 'monkey3Lj'] as const) pet.skillState![key].cooldownMs = 1e9;
  const behavior: PetBehavior = new MonkeyPetBehavior(4);
  // Development diagnostic only: identify coupling errors before enabling the
  // production hook. Acceptance must use the actual family definition.
  if (prospective) behavior.groundMovement = () => getPetMonkeyHorseGroundDefinition('monkey', 4);
  assert(behavior.groundMovement, 'Monkey4 production ground hook is required for acceptance');
  let forceRelease = false;
  const select = behavior.selectAction.bind(behavior);
  behavior.selectAction = context => {
    if (forceRelease) { forceRelease = false; return { type: 'monkey4-jgaoyi' }; }
    // The source probe disables regular skill eligibility and explicitly enters
    // aoyi after settling; body callbacks still read its three learned skills.
    return context.animation?.action === 'wait' || context.animation?.action === 'walk' ? undefined : select(context);
  };
  const runtime = new PetCombatRuntime(new PetBehaviorRegistry([{ species: 'monkey', form: 4, create: () => behavior }]));
  const projectiles = createProjectileSystem();
  const targets = native.inputs.targets.map((t: any) => ({ ...t, isAlive: !(sample.mode === 'dead-first' && t.id === 'B') }));
  let ordered = sample.mode === 'empty' ? [] : [...targets];
  let scale = 1, translate = 0, randomCalls = 0, counterRoll = false;
  const random = () => {
    const value = randomCalls++ % 2 === 0 ? sample.choose : sample.side;
    if (counterRoll) { counterRoll = false; return 0; }
    return value;
  };
  const port: PetProjectileCombatPort = {
    monkeyHorseCollision: () => bodyFixtureCollisionAssets,
    target: id => { const t = targets.find((t: any) => t.id === id)!; return { monsterId: 30, x: t.x, y: t.y, alive: t.isAlive }; },
    mask: () => { throw Error('No target damage in original body/ground probe'); }, hit: () => false,
    monstersInParentSpace: () => ordered.map((t: any) => ({ ...t,
      colliderLeft: Math.min(...t.localBounds.map((edge: number) => translate + scale * (Math.round(edge * 20) / 20 * t.scaleX + t.x))) })),
  };
  const frame = { roster, owner: { x: 300, y: 350, facingX: 1 as const }, targets, projectiles,
    projectileCombat: port, hostFps: sample.fps, deltaMs: 1000 / sample.fps,
    groundEnvironment: bodyGroundFixture('monkey', 4, 350), random };
  runtime.update({ ...frame, deltaMs: 0 });
  for (let n = 0; n < sample.settled.ticks; n++) runtime.update(frame);
  const settled = runtime.snapshot();
  assert.deepEqual([settled.runtime!.x, settled.runtime!.y, settled.groundMotion!.velocityX, settled.groundMotion!.velocityY],
    [sample.settled.x, sample.settled.y, sample.settled.vx, sample.settled.vy]);
  forceRelease = true;
  let nativeCacheReads = 0;
  for (const row of sample.rows) {
    if (row.tick === 32) {
      if (sample.mode === 'enter' || sample.mode === 'leave-enter') targets[0].x = native.inputs.targets[0].x + 80;
      if (sample.mode === 'leave-enter') targets[1].x = native.inputs.targets[1].x + 1000;
      if (sample.mode === 'reorder') ordered.reverse();
      if (sample.mode === 'empty-reenter') ordered = [];
      if (sample.mode === 'scene-shift') translate = 10;
      if (sample.mode === 'scene-flip') { translate = 940; scale = -1; }
    }
    if (row.tick === 58 && sample.mode === 'empty-reenter') ordered = [...targets];
    nativeCacheReads += 2 * row.events.filter((e: any) => e.kind === 'emit' && ['doHit4_2', 'doHit2', 'doHit3', 'doHit1'].includes(e.name)).length;
    const priorIds = new Set(projectiles.projectiles.map(p => p.id));
    counterRoll = sample.mode === 'counter' && row.tick === 9;
    for (let part = 0; part < parts; part++) runtime.update({ ...frame, deltaMs: frame.deltaMs / parts,
      damageEvents: ['hurt', 'counter'].includes(sample.mode) && row.tick === 9 && part === 0
        ? [{ runtimeKey: runtime.snapshot().runtime!.runtimeKey, amount: 1, reactsToHit: true }] : [] });
    const actual = runtime.snapshot();
    const got = [actual.runtime!.x, actual.runtime!.y, actual.groundMotion!.velocityX, actual.groundMotion!.velocityY,
      !!actual.groundMotion!.standingOn, actual.animation!.row, actual.animation!.column, actual.animation!.remainingHoldCount,
      actual.target?.id ?? null, randomCalls, actual.runtime!.facingX,
      aliases[actual.animation!.action] ?? actual.animation!.action];
    const expected = [row.x, row.y, row.vx, row.vy, row.standing, row.row, row.column, row.count,
      row.target, row.randomAfter + nativeCacheReads, row.direction === 0 ? -1 : 1, row.action];
    const born = projectiles.projectiles.filter(p => !priorIds.has(p.id)).map(p => [p.x, p.y]);
    const expectedBirths = row.events.filter((e: any) => e.kind === 'emit').map((e: any) => [e.x, e.y]);
    assert.equal(pet.mp, 1000 - PetTuning.monkey4JgaoyiMpCost, 'No-use-mana chain spends only the original release cost');
    if (sample.mode === 'counter') assert.equal(pet.hp, row.tick >= 9 ? 99 : 100);
    if (JSON.stringify(got) !== JSON.stringify(expected) || JSON.stringify(born) !== JSON.stringify(expectedBirths))
      failures.push({ fps: sample.fps, owner: sample.owner, mode: sample.mode, skills: sample.skills, parts,
        choose: sample.choose, side: sample.side, tick: row.tick, got, expected, born, expectedBirths });
    states++;
    if (row.action === 'wait') break;
  }
  runtime.destroy(); cases++;
}
if (prospective) {
  writeFileSync('docs/tasks/evidence/TASK-SLICE-226/aoyi-ground-prospective.json', JSON.stringify({
    status: 'diagnostic-ground-hook-injected-not-acceptance', states, failedStates: failures.length, samples: failures.slice(0, 40),
  }, null, 2));
  console.log(`${states} coupled aoyi states; ${failures.length} mismatches with prospective ground hook (diagnostic only).`);
} else {
  assert.deepEqual(failures.slice(0, 10), []);
  console.log(`${cases} coupled aoyi cases/${states} states match original body, motion, target/RNG, hurt/empty and floor; explicit release, no Scene/damage claim.`);
}
