import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { createPetWorldDisplayBridge } from '../src/scenes/PetWorldDisplayBridge';
import { PetMonkeyHorseProjectileSystem } from '../src/systems/PetMonkeyHorseProjectileSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { bodyFixtureCollisionAssets, noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';
import type { PetBehaviorContext, PetBehaviorSkillRequest } from '../src/systems/PetBehavior';

const flatten = (phase: any): number[] => (phase.frame ? [phase.frame] : []).concat(...(phase.children ?? []).map(flatten));
let cases = 0, states = 0;
for (const trajectory of ['above', 'death-at-9']) for (const fps of [20, 24, 30]) {
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SLICE-226/horse-world-pause-air-aoyi-${trajectory}/measurement-${fps}.json`, 'utf8')).rows;
  for (const owner of ['P1', 'P2']) for (const direction of [0, 1]) for (const mode of ['natural', 'pause'])
  for (const kind of ['enemy', 'tracking']) {
    const id = `PetHorse4Bullet5_${kind}-${owner}-${direction}-${mode}`;
    const rows = native.filter((r: any) => r.id === id);
    assert.equal(rows.length, 480);
    const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'horse' && p.form === 4)!;
    pet.skills = kind === 'tracking' ? ['tmaoyi', 'sp'] : ['tmaoyi'];
    const start = rows[0].source, target = { id: `target-${owner}`, x: 0, y: 0, isAlive: true };
    const runtime = { x: start.x, y: start.y, rootScaleX: start.a, facingX: direction === 0 ? -1 : 1 };
    const events = new EventEmitter(), clock = createPetWorldDisplayBridge({ game: { events, loop: { targetFps: fps } } } as any);
    const manager = new PetMonkeyHorseProjectileSystem(), projectiles = createProjectileSystem();
    let selected: number[] | undefined;
    const assets = Object.create(bodyFixtureCollisionAssets) as typeof bodyFixtureCollisionAssets;
    assets.fieldAt = (family, symbol, tick, sign) => {
      const field = bodyFixtureCollisionAssets.fieldAt(family, symbol, tick, sign);
      selected = flatten(JSON.parse(field.phaseKey.split('|')[1]!)); return field;
    };
    const context = { pet, runtime, hostFps: fps, actionToken: 1, random: () => 0.75, isGxp: false,
      targets: [], animation: { action: 'wait' }, emit: () => {},
      castSkill: (request: PetBehaviorSkillRequest) => request({ roster, runtime: runtime as any, projectiles, targets: [] }),
      projectileCombat: { ...noTargetBodyFixturePort, monkeyHorseCollision: () => assets,
        displayTick: clock.readTick, monstersInParentSpace: () => [target], target: () => ({ ...target, alive: target.isAlive }) },
    } as unknown as PetBehaviorContext;
    manager.emitHorseAoyi(context);
    const p = projectiles.projectiles[0]!;
    // Match the independent constructor fixture's start; body birth coordinates
    // are separately checked by the actual Runtime/native three-target test.
    p.x = rows[0].before.x; p.y = rows[0].before.y;
    for (const row of rows) {
      events.emit('prestep', row.tick * 1000 / fps, 1000 / fps);
      Object.assign(target, { x: row.target.x, y: row.target.y, isAlive: !row.target.dead });
      selected = undefined;
      if (!row.paused) manager.step(context);
      assert.deepEqual([p.x, p.y, p.isExpired, p.velocityX || 0, p.velocityY, p.remainingDistance,
        p.trackingTargetId ?? null, fps * 10 - p.petHostTick!],
      [row.state.x, row.state.y, row.state.dead, row.state.vx, row.state.vy, row.state.distance, row.state.target, row.state.ttl],
      `${trajectory}/${fps}/${id}/${row.tick}`);
      assert.deepEqual(selected, !row.paused && !row.before.dead ? row.before.phaseFrames : undefined, 'recursive collision phase');
      states++;
    }
    manager.destroy(); clock.destroy(); cases++;
  }
}
assert.equal(cases, 96); assert.equal(states, 46080);
console.log(`${cases} horse falling private-owner cases/${states} native ordinary-pause motion, TTL, target loss and collision phases; hit/delayed birth/canvas excluded.`);
