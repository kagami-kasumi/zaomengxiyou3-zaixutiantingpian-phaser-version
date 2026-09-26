/** Diagnostic: source-native ordinary pause versus the actual private owner, not an acceptance gate. */
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { createPetWorldDisplayBridge } from '../src/scenes/PetWorldDisplayBridge';
import { PetMonkeyHorseProjectileSystem } from '../src/systems/PetMonkeyHorseProjectileSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { bodyFixtureCollisionAssets, noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';
import type { PetBehaviorContext, PetBehaviorSkillRequest } from '../src/systems/PetBehavior';

const variants = [[1, 'normal'], [2, 'normal'], [3, 'normal'], [4, 'normal'],
  [1, 'sp'], [2, 'bd'], [2, 'sp'], [3, 'bd'], [3, 'sp'], [3, 'bz'], [4, 'bd'], [4, 'sp'], [4, 'bz']] as const;
const flatten = (phase: any): number[] => (phase.frame ? [phase.frame] : []).concat(...(phase.children ?? []).map(flatten));
export function collectHorseWorldPauseCases() {
const results: any[] = [];
for (const suffix of ['', '-long']) for (const fps of [20, 24, 30]) {
  const endTick = suffix ? 192 : 128;
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SLICE-226/horse-world-pause-air${suffix}/measurement-${fps}.json`, 'utf8')).rows;
  for (const [form, skill] of variants) for (const owner of ['P1', 'P2']) for (const direction of [0, 1]) {
    for (const mode of ['natural', 'pause']) {
      const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'horse' && p.form === form)!;
      const start = native.find((r: any) => r.tick === 1 && r.id.endsWith(`-${owner}-${direction}-${mode}`)).source;
      const runtime = { x: start.x, y: start.y, rootScaleX: start.a, facingX: direction === 0 ? -1 : 1 };
      const events = new EventEmitter(), clock = createPetWorldDisplayBridge({ game: { events, loop: { targetFps: fps } } } as any);
      const manager = new PetMonkeyHorseProjectileSystem(), projectiles = createProjectileSystem();
      let selectedPhase: number[] | undefined;
      const assets = Object.create(bodyFixtureCollisionAssets) as typeof bodyFixtureCollisionAssets;
      assets.fieldAt = (family, symbol, tick, direction) => {
        const field = bodyFixtureCollisionAssets.fieldAt(family, symbol, tick, direction);
        selectedPhase = flatten(JSON.parse(field.phaseKey.split('|')[1]!));
        return field;
      };
      const target = { id: 'target', x: 0, y: 0, isAlive: true };
      const context = { pet, runtime, hostFps: fps, actionToken: 1, random: () => 0.75, isGxp: false,
        targets: [target], animation: { action: 'wait' }, emit: () => {}, protectFromHits: () => {},
        castSkill: (request: PetBehaviorSkillRequest) => request({ roster, runtime: runtime as any, projectiles, targets: [] }),
        projectileCombat: { ...noTargetBodyFixturePort, monkeyHorseCollision: () => assets, displayTick: clock.readTick },
      } as unknown as PetBehaviorContext;
      if (skill === 'normal') manager.emit(context, target); else manager.emitHorseSkill(context, skill, target);
      const p = projectiles.projectiles[0]!;
      const kind = skill === 'bd' || skill === 'sp' && form === 1 ? 'follow' : 'special';
      const rows = native.filter((r: any) => r.id === `${p.sourceSymbol}_${kind}-${owner}-${direction}-${mode}`);
      assert.equal(rows.length, endTick);
      let firstMismatch: number | undefined, firstPhaseMismatch: number | undefined, actualDeath: number | undefined;
      for (const row of rows) {
        events.emit('prestep', row.tick * 1000 / fps, 1000 / fps);
        Object.assign(runtime, { x: row.source.x, y: row.source.y, rootScaleX: row.source.a });
        selectedPhase = undefined;
        if (!row.paused) manager.step(context);
        const expectedPhase = !row.paused && !row.before.dead ? row.before.phaseFrames : undefined;
        if (JSON.stringify(selectedPhase) !== JSON.stringify(expectedPhase) && firstPhaseMismatch === undefined) firstPhaseMismatch = row.tick;
        if (p.isExpired && actualDeath === undefined) actualDeath = row.tick;
        if (p.isExpired !== row.state.dead && firstMismatch === undefined) firstMismatch = row.tick;
      }
      const expectedDeath = rows.find((r: any) => r.state.dead)?.tick;
      if (mode === 'natural') {
        assert.equal(firstMismatch, undefined, `${fps}/${form}/${skill}/${owner}/${direction}: baseline`);
        assert.equal(firstPhaseMismatch, undefined, 'natural collision phase baseline');
      }
      results.push({ suffix, fps, form, skill, owner, direction, mode, expectedDeath, actualDeath, firstMismatch, firstPhaseMismatch });
      manager.destroy(); clock.destroy();
    }
  }
}
return results;
}
