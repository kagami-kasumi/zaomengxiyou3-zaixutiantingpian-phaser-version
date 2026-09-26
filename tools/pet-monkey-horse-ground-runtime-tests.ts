/** Real family/Session wiring against separate original follow and physics seams.
 * Controlled one-step inputs, not a full Scene or combined native body oracle. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { PetBehaviorRegistry } from '../src/systems/PetBehaviorRegistry';
import { MonkeyPetBehavior } from '../src/systems/pet-behaviors/MonkeyPetBehavior';
import { HorsePetBehavior } from '../src/systems/pet-behaviors/HorsePetBehavior';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import type { PetBehaviorContext } from '../src/systems/PetBehavior';

const follow = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/follow-native.json', 'utf8'));
const physics = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SLICE-226/ground-native.json', 'utf8'));
for (const source of follow.sources) assert.equal(createHash('sha256').update(readFileSync(source.path)).digest('hex'), source.fileSha256);
const coordinate = (n: number) => Math.trunc(n * 20) / 20 || 0;
let cases = 0;
for (const row of follow.cases.filter((r: any) => r.phase === 0 && !r.target && r.action === 'wait')) {
  const family: 'monkey' | 'horse' = row.family.startsWith('monkey') ? 'monkey' : 'horse';
  const form = Number(row.family.at(-1)) as 1 | 2 | 3 | 4;
  const roster = createSeedPetRoster();
  roster.pets.forEach(p => { p.isActive = p.species === family && p.form === form; });
  const pet = roster.pets.find(p => p.isActive)!;
  pet.skills = [];
  const behavior = family === 'monkey' ? new MonkeyPetBehavior(form) : new HorsePetBehavior(form);
  let input!: PetBehaviorContext;
  const enter = behavior.enter.bind(behavior);
  behavior.enter = c => { input = c; enter(c); };
  const runtime = new PetCombatRuntime(new PetBehaviorRegistry([{ species: family, form, create: () => behavior }]));
  let reads = 0;
  const frame = { roster, owner: { x: 0, y: 0, facingX: 1 as const }, targets: [], hostFps: row.fps,
    deltaMs: 1000 / row.fps, groundEnvironment: { walls: [], ownerRootOffsetY: 0 },
    random: () => { reads++; throw Error('No-target source branch must not draw RNG'); } };
  runtime.update({ ...frame, deltaMs: 0 });
  assert.equal(runtime.snapshot().runtime!.x, 0);
  assert.equal(runtime.snapshot().runtime!.y, -100, 'Original owner-root spawn');
  assert.equal(runtime.snapshot().groundMotion!.velocityY, 4, 'Original initial velocity');
  // Use the public behavior input port to reproduce the source's controlled root.
  input.relocate(row.before.x, row.before.y);
  runtime.update(frame);
  const direction = row.events.includes('turn-left') ? -1 : row.events.includes('turn-right') ? 1 : 0;
  const motion = physics.cases.find((p: any) => p.family === family && p.form === form
    && p.initialAction === 'wait' && p.mode === 'air' && p.direction === direction && p.tick === 1);
  assert(motion);
  const actual = runtime.snapshot();
  assert.equal(actual.runtime!.x, coordinate(row.after.x + motion.x));
  assert.equal(actual.runtime!.y, coordinate(row.after.y + motion.y));
  assert.equal(actual.groundMotion!.direction, direction);
  assert.equal(actual.groundMotion!.velocityX, motion.vx);
  assert.equal(actual.groundMotion!.velocityY, motion.vy);
  assert.equal(reads, 0);
  runtime.destroy(); cases++;
}
assert.equal(cases, 432);
console.log(`${cases} real family/Session spawn, no-target 640 follow/1000 warp and first physical step cases match separate native seams; full Scene excluded.`);
