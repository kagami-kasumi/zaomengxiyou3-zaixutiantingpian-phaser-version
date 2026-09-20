import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { getPetDragonCollision } from '../src/assets/PetDragonAnimationAssets';
import { getPetGroundEnvironment, type PetGroundEnvironment } from '../src/assets/PetGroundEnvironmentAssets';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { PetBehaviorRegistry } from '../src/systems/PetBehaviorRegistry';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createPetDragon1AnimationClock } from '../src/systems/PetDragonAnimationClock';
import type { PetBehavior, PetBehaviorContext, PetCombatAnimationEvent } from '../src/systems/PetBehavior';

// A Strategy probe supplies verified shape/clock and commands, never a second movement algorithm.
// This proves the production Session seam; actual dragon combat registration belongs to C4.
class GroundProbe implements PetBehavior {
  context!: PetBehaviorContext;
  pending: string | undefined;
  selections = 0;
  createAnimationClock = createPetDragon1AnimationClock;
  groundMovement = () => ({ collision: getPetDragonCollision(1), gravity: 1.5,
    jumpPower: -30, attackRate: 0.7, attackActions: ['normal', 'fs'], immobileGroundActions: ['normal', 'fs'] });
  enter(c: PetBehaviorContext) { this.context = c; }
  canMove(c: PetBehaviorContext) { return c.animation?.action === 'wait' || c.animation?.action === 'walk'; }
  basicAttackRange() { return 150; }
  basicAttack() { return undefined; }
  selectAction() { this.selections++; return this.pending ? { type: this.pending } : undefined; }
  executeAction() { this.pending = undefined; }
  updateEffects(c: PetBehaviorContext) { this.context = c; }
  onDamaged(_e: unknown, c: PetBehaviorContext) { c.playAnimation('hurt'); }
  onAnimationEvent(e: PetCombatAnimationEvent, c: PetBehaviorContext) {
    this.context = c;
    if (e.action === 'fs' && e.eventName === 'hit' && !c.parentRuntimeKey) {
      c.spawnSummon({ pet: c.pet, x: c.runtime.x, y: c.runtime.y, facingX: c.runtime.facingX });
    }
  }
  destroy() {}
}

const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-8,
  `${actual} != ${expected}`);
function setup(hostFps: number, environment: PetGroundEnvironment = { walls: [], ownerRootOffsetY: 0 }) {
  const roster = createSeedPetRoster();
  const pet = roster.pets.find((p) => p.isActive)!;
  pet.moveSpeed = 5;
  const probes: GroundProbe[] = [];
  const runtime = new PetCombatRuntime(new PetBehaviorRegistry([{ species: pet.species, form: pet.form,
    create: () => { const probe = new GroundProbe(); probes.push(probe); return probe; } }]));
  const frame = { roster, owner: { x: 800, y: 0, facingX: 1 as const },
    targets: [] as { id: string; x: number; y: number; isAlive: boolean }[],
    groundEnvironment: environment, hostFps, deltaMs: 1000 / hostFps };
  const initial = runtime.update({ ...frame, deltaMs: 0 });
  close(initial.runtime!.x, 800);
  close(initial.runtime!.y, environment.ownerRootOffsetY - 100);
  close(probes[0]!.context.owner.y, environment.ownerRootOffsetY);
  return { runtime, frame, probes, step: () => runtime.update(frame) };
}

const traces: unknown[] = [];
for (const fps of [20, 24, 30]) {
  const s = setup(fps);
  s.probes[0]!.context.relocate(0, 0);
  const half = s.runtime.update({ ...s.frame, deltaMs: 500 / fps });
  close(half.runtime!.x, 0);
  s.runtime.update({ ...s.frame, deltaMs: 500 / fps });
  close(s.runtime.snapshot().runtime!.x, 5);
  close(s.runtime.snapshot().groundMotion!.velocityY, 1.5);
  s.runtime.update({ ...s.frame, deltaMs: 2000 / fps });
  close(s.runtime.snapshot().runtime!.x, 15);
  close(s.runtime.snapshot().runtime!.y, 4.5);
  s.probes[0]!.context.playAnimation('normal');
  const before = s.runtime.snapshot().runtime!.x;
  s.step();
  close(s.runtime.snapshot().runtime!.x, before + 5);
  assert.equal(s.runtime.snapshot().groundMotion!.direction, 1, 'air attack retains direction and speed');
  for (let tick = 1; tick < 16; tick++) s.step();
  assert.equal(s.runtime.snapshot().animation!.action, 'wait');
  traces.push({ fps, case: 'air-normal-completion', snapshot: s.runtime.snapshot() });

  const env = getPetGroundEnvironment(12);
  const floor = env.walls.find((wall) => !wall.throughDown && wall.right - wall.left > 1000)!;
  assert.ok(floor, 'production truth supplies original floor');
  const g = setup(fps, env);
  const rootY = floor.top - 0.1 - getPetDragonCollision(1).height / 2;
  const startX = floor.left + 100;
  g.frame.owner = { x: startX + 800, y: rootY - env.ownerRootOffsetY, facingX: 1 };
  g.probes[0]!.context.relocate(startX, rootY);
  g.step(); g.step();
  assert.equal(g.runtime.snapshot().groundMotion!.standingOn, floor.id);
  g.probes[0]!.context.playAnimation('normal');
  const attackX = g.runtime.snapshot().runtime!.x;
  for (let tick = 1; tick < 16; tick++) {
    g.step(); close(g.runtime.snapshot().runtime!.x, attackX);
  }
  g.step();
  close(g.runtime.snapshot().runtime!.x, attackX + 5);
  assert.equal(g.runtime.snapshot().animation!.action, 'walk', 'completion then landing selects walk same tick');
  traces.push({ fps, case: 'ground-normal-completion', snapshot: g.runtime.snapshot() });
  g.probes[0]!.context.playAnimation('fs');
  for (let tick = 1; tick <= 17; tick++) g.step();
  const born = g.runtime.snapshot().summons![0]!;
  assert.equal(born.animation!.elapsedTicks, 0);
  close(born.groundMotion!.velocityY, 0);
  close(born.runtime.y, rootY);
  const parentX = g.runtime.snapshot().runtime!.x;
  g.step();
  close(g.runtime.snapshot().runtime!.x, parentX + 5);
  close(g.runtime.snapshot().summons![0]!.groundMotion!.velocityY, 1.5);
  traces.push({ fps, case: 'ground-fs-completion-child-first-tick', snapshot: g.runtime.snapshot() });
  // Root and child use the same motion: after their respective attempt ticks both turn toward owner.
  const childProbe = g.probes[1]!;
  childProbe.context.playAnimation('normal');
  const childAttackX = g.runtime.snapshot().summons![0]!.runtime.x;
  g.step();
  close(g.runtime.snapshot().summons![0]!.runtime.x, childAttackX + 5);
  assert.equal(g.runtime.snapshot().summons![0]!.groundMotion!.standingOn, floor.id);
  for (let tick = 1; tick < 16; tick++) g.step();
  close(g.runtime.snapshot().summons![0]!.runtime.x, childAttackX + 10);
  const childKey = born.runtime.runtimeKey;
  g.runtime.update({ ...g.frame, damageEvents: [{ runtimeKey: childKey, amount: 1 }] });
  for (let tick = 1; tick < 8; tick++) g.step();
  assert.equal(g.runtime.snapshot().summons![0]!.groundMotion!.direction, 0);
  close(g.runtime.snapshot().summons![0]!.groundMotion!.velocityX, 0);
  traces.push({ fps, case: 'child-hurt-static', snapshot: g.runtime.snapshot() });

  const a = setup(fps);
  a.probes[0]!.context.relocate(0, 0);
  a.frame.targets = [{ id: 'first', x: -200, y: 0, isAlive: true }];
  a.probes[0]!.pending = 'normal';
  a.step();
  assert.equal(a.probes[0]!.selections, 0, 'new target frame cannot select action');
  assert.equal(a.runtime.snapshot().groundMotion!.direction, 1, 'new search frame follows owner, not new target');
  a.frame.targets[0]!.isAlive = false;
  a.step();
  assert.equal(a.runtime.snapshot().target, undefined);
  assert.equal(a.probes[0]!.selections, 0, 'invalid target frame only clears');
  // Warp preserves prior gravity/direction and then executes this tick physics.
  a.frame.targets = [];
  a.probes[0]!.context.relocate(-1000, 0);
  const oldVy = a.runtime.snapshot().groundMotion!.velocityY;
  a.step();
  close(a.runtime.snapshot().runtime!.x, a.frame.owner.x + 5);
  close(a.runtime.snapshot().runtime!.y, a.frame.owner.y - 30 + oldVy);
  traces.push({ fps, case: 'warp-preserves-motion', snapshot: a.runtime.snapshot() });
  // Close-owner follow static must not cancel an unfinished local animation.
  for (const action of ['normal', 'fs', 'hurt']) {
    const c = setup(fps);
    c.probes[0]!.context.relocate(c.frame.owner.x, c.frame.owner.y);
    c.probes[0]!.context.playAnimation(action);
    c.step();
    assert.equal(c.runtime.snapshot().animation!.action, action);
    const duration = action === 'normal' ? 16 : action === 'fs' ? 18 : 8;
    for (let tick = 1; tick < duration; tick++) c.step();
    assert.equal(c.runtime.snapshot().animation!.action, 'wait');
    if (action === 'hurt') {
      assert.equal(c.runtime.snapshot().groundMotion!.direction, 0);
      close(c.runtime.snapshot().groundMotion!.velocityX, 0);
    }
    traces.push({ fps, case: `air-${action}-near-owner-completion`, snapshot: c.runtime.snapshot() });
    c.runtime.destroy();
  }
  const boundary = setup(fps);
  boundary.probes[0]!.context.relocate(160, 0); // exactly 640
  boundary.step();
  assert.equal(boundary.runtime.snapshot().groundMotion!.direction, 0);
  boundary.frame.targets = [{ id: 'edge', x: 200, y: 0, isAlive: true }];
  boundary.step();
  boundary.frame.targets[0]!.x = boundary.runtime.snapshot().runtime!.x + 1200;
  boundary.frame.targets[0]!.y = boundary.runtime.snapshot().runtime!.y;
  boundary.step();
  assert.equal(boundary.runtime.snapshot().target, undefined);
  boundary.probes[0]!.context.relocate(boundary.frame.owner.x - 1000, 0);
  boundary.step();
  close(boundary.runtime.snapshot().runtime!.x, boundary.frame.owner.x);
  boundary.runtime.destroy();
  const vertical = setup(fps);
  vertical.probes[0]!.context.relocate(800, 301);
  vertical.step();
  close(vertical.runtime.snapshot().runtime!.y, 271);
  close(vertical.runtime.snapshot().groundMotion!.velocityY, -28.5);
  vertical.runtime.destroy();
  const dropFloor = { ...floor, through: true, isThroughWallClass: true };
  const drop = setup(fps, { walls: [dropFloor], ownerRootOffsetY: 0 });
  drop.frame.owner = { x: startX, y: rootY + 100, facingX: 1 };
  drop.probes[0]!.context.relocate(startX, rootY);
  drop.step(); drop.step();
  assert.equal(drop.runtime.snapshot().groundMotion!.standingOn, floor.id);
  drop.step();
  close(drop.runtime.snapshot().runtime!.y, rootY + 21.5);
  assert.equal(drop.runtime.snapshot().groundMotion!.standingOn, undefined);
  drop.runtime.destroy();
  s.runtime.destroy(); g.runtime.destroy(); a.runtime.destroy();
}

for (const level of [11, 12, 13, 21, 22] as const) {
  const env = getPetGroundEnvironment(level);
  assert.equal(env.walls.length, ({11:20,12:4,13:4,21:8,22:7})[level]);
  assert.equal(new Set(env.walls.map((wall) => wall.id)).size, env.walls.length);
  const path = level === 11 ? 'src/scenes/test-scene/TestSceneHeroPartyRuntimeBridge.ts'
    : `src/scenes/stage${level}/Stage${level}GameplayBridge.ts`;
  const consumer = readFileSync(path, 'utf8');
  assert.ok(consumer.includes(`getPetGroundEnvironment(${level})`));
  assert.ok(consumer.includes(level === 11 ? 'groundEnvironmentFor: () => petGroundEnvironment' : 'petGroundEnvironment,'));
}
const bridge = readFileSync('src/scenes/HeroPartyRuntimeBridge.ts', 'utf8').replaceAll('\r\n', '\n');
assert.ok(bridge.includes('frame.environmentFor(index, model.members[index]!.movement).petGroundEnvironment'));
assert.equal(bridge.split('groundEnvironment: frame.groundEnvironmentFor?.(index)').length - 1, 2);
// Execute the actual production closure (only TypeScript erasure), with real runtimes.
// This avoids booting Phaser while testing the P1/P2 forwarding body, rather than copying it.
const ts = createRequire(import.meta.url)('typescript') as typeof import('typescript');
const start = bridge.indexOf('  function updatePets(frame:');
const end = bridge.indexOf('\n}\n\nfunction syncFallbackFeedback', start);
assert.ok(start > 0 && end > start);
const closure = ts.transpileModule(bridge.slice(start, end), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const p1 = setup(20, getPetGroundEnvironment(12));
const p2 = setup(20, getPetGroundEnvironment(21));
const snapshots: Record<string, ReturnType<PetCombatRuntime['snapshot']>> = {};
const updateProductionPets = new Function('model', 'petRosters', 'petCombatRuntimes', 'petCombatSnapshots',
  'pendingPetDamageEvents', 'pendingPetAnimationEvents', 'scene', 'petProjectileCombat', 'petDragonPresentation', 'isPetDragonQaEnabled', 'petTurtle', `${closure}\nreturn updatePets;`)(
  { members: [p1, p2].map((p, index) => ({ movement: p.frame.owner,
    combat: { slot: index === 0 ? 'p1' : 'p2', combat: { state: 'ready' } } })) },
  { p1: p1.frame.roster, p2: p2.frame.roster }, { p1: p1.runtime, p2: p2.runtime }, snapshots,
  { p1: [], p2: [] }, { p1: [], p2: [] }, { game: { loop: { targetFps: 20 } } },
  (input: Omit<Parameters<typeof createPetProjectileCombatPort>[0], 'mask'>) => createPetProjectileCombatPort({
    ...input, mask: () => { throw new Error('Movement-only probe must not request a hit mask'); },
  }),
  { update() {} },
  () => false,
  { readyRoster: (roster: any) => roster, update() {} },
) as (frame: unknown) => void;
const requested: number[] = [];
for (const [index, p] of [p1, p2].entries()) {
  const environment = getPetGroundEnvironment(index === 0 ? 12 : 21);
  const wall = environment.walls.find((w) => !w.throughDown && w.right - w.left > 500)!;
  const y = wall.top - 0.1 - getPetDragonCollision(1).height / 2;
  p.frame.owner.x = wall.left + 200;
  p.frame.owner.y = y - environment.ownerRootOffsetY;
  p.probes[0]!.context.relocate(p.frame.owner.x, y);
}
for (let i = 0; i < 2; i++) updateProductionPets({ targets: [], projectiles: { projectiles: [] }, deltaMs: 50, timeMs: i * 50,
  groundEnvironmentFor: (index: number) => { requested.push(index); return getPetGroundEnvironment(index === 0 ? 12 : 21); } });
// Each frame supplies the environment to the entity and the read-only owner projection.
assert.deepEqual(requested, [0, 1, 0, 1, 0, 1, 0, 1]);
assert.ok(snapshots.p1!.groundMotion!.standingOn?.startsWith('level12-'));
assert.ok(snapshots.p2!.groundMotion!.standingOn?.startsWith('level21-'));
assert.notEqual(snapshots.p1!.runtime!.runtimeKey, snapshots.p2!.runtime!.runtimeKey);
traces.push({ case: 'production-updatePets-p1-p2', snapshots });
p1.runtime.destroy(); p2.runtime.destroy();
const directory = 'docs/tasks/evidence/TASK-SLICE-214C3';
mkdirSync(directory, { recursive: true });
writeFileSync(`${directory}/movement-traces.json`, JSON.stringify({
  scope: 'Production Runtime/Session with registry probe; verified five-level environment adapter; no dragon combat or visual completion claim',
  traces,
}, null, 2) + '\n');
console.log('Ground Session: 20/24/30fps root/child motion, ground/air completion, hurt, birth, warp, sticky AI and five-level forwarding passed.');
