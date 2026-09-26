/** Actual private owner against original world-pause traces; target damage and canvas excluded. */
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { createPetWorldDisplayBridge } from '../src/scenes/PetWorldDisplayBridge';
import { PetMonkeyHorseProjectileSystem } from '../src/systems/PetMonkeyHorseProjectileSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { bodyFixtureCollisionAssets, noTargetBodyFixturePort } from './pet226-body/body-fixture-collision';
import type { PetBehaviorContext, PetBehaviorSkillRequest } from '../src/systems/PetBehavior';

export const monkeyWorldPauseVariants = [[1, 'normal'], [2, 'normal'], [3, 'normal'], [4, 'normal'],
  [1, 'xj'], [2, 'lj'], [2, 'xj'], [3, 'lyq'], [3, 'xj'], [3, 'lj'],
  [4, 'lyq'], [4, 'xj'], [4, 'lj']] as const;
const flatten = (phase: any): number[] => (phase.frame ? [phase.frame] : []).concat(...(phase.children ?? []).map(flatten));
export function collectMonkeyWorldPauseCases() {
  const results: any[] = [];
  for (const fps of [20, 24, 30]) {
    const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SLICE-226/monkey-world-pause-air/measurement-${fps}.json`, 'utf8')).rows;
    for (const [form, skill] of monkeyWorldPauseVariants) for (const owner of ['P1', 'P2']) for (const direction of [0, 1]) {
      for (const mode of ['natural', 'pause']) {
        const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'monkey' && p.form === form)!;
        const start = native.find((r: any) => r.tick === 1 && r.id.endsWith(`-${owner}-${direction}-${mode}`)).source;
        const runtime = { x: start.x, y: start.y, rootScaleX: start.a, facingX: direction === 0 ? -1 : 1 };
        const events = new EventEmitter(), clock = createPetWorldDisplayBridge({ game: { events, loop: { targetFps: fps } } } as any);
        const manager = new PetMonkeyHorseProjectileSystem(), projectiles = createProjectileSystem();
        const selected = new Map<string, number[]>();
        const assets = Object.create(bodyFixtureCollisionAssets) as typeof bodyFixtureCollisionAssets;
        assets.fieldAt = (family, symbol, tick, sign) => {
          const field = bodyFixtureCollisionAssets.fieldAt(family, symbol, tick, sign);
          selected.set(symbol, flatten(JSON.parse(field.phaseKey.split('|')[1]!)));
          return field;
        };
        const target = { id: 'target', x: 0, y: 0, isAlive: true };
        const context = { pet, runtime, hostFps: fps, actionToken: 1, random: () => 0.75, isGxp: false,
          targets: [target], animation: { action: 'wait' }, emit: () => {}, protectFromHits: () => {},
          castSkill: (request: PetBehaviorSkillRequest) => request({ roster, runtime: runtime as any, projectiles, targets: [] }),
          projectileCombat: { ...noTargetBodyFixturePort, monkeyHorseCollision: () => assets, displayTick: clock.readTick },
        } as unknown as PetBehaviorContext;
        if (skill === 'normal') manager.emit(context, target); else manager.emitMonkeySkill(context, skill, target);
        const tracks = projectiles.projectiles.map(p => {
          const rows = native.filter((r: any) => r.id === `${p.sourceSymbol}-${owner}-${direction}-${mode}`);
          assert.equal(rows.length, 280);
          return { p, rows, birth: { x: p.x, y: p.y }, firstMismatch: undefined as number | undefined,
            firstPhaseMismatch: undefined as number | undefined, actualDeath: undefined as number | undefined };
        });
        assert.ok(tracks.length);
        for (let index = 0; index < 280; index++) {
          const source = tracks[0]!.rows[index];
          events.emit('prestep', source.tick * 1000 / fps, 1000 / fps);
          Object.assign(runtime, { x: source.source.x, y: source.source.y, rootScaleX: source.source.a });
          selected.clear();
          if (!source.paused) manager.step(context);
          for (const t of tracks) {
            const row = t.rows[index], initial = t.rows[0].before, p = t.p;
            const expectedPhase = !row.paused && !row.before.dead && !row.before.disabled ? row.before.phaseFrames : undefined;
            if (JSON.stringify(selected.get(p.sourceSymbol!)) !== JSON.stringify(expectedPhase) && t.firstPhaseMismatch === undefined) t.firstPhaseMismatch = row.tick;
            const actual = [p.x - t.birth.x, p.y - t.birth.y, p.petRenderDirection ?? -p.facingX, p.isExpired];
            const expected = [row.state.x - initial.x, row.state.y - initial.y, row.state.a, row.state.dead];
            if (JSON.stringify(actual) !== JSON.stringify(expected) && t.firstMismatch === undefined) t.firstMismatch = row.tick;
            if (p.isExpired && t.actualDeath === undefined) t.actualDeath = row.tick;
          }
        }
        for (const t of tracks) {
          if (mode === 'natural') {
            assert.equal(t.firstMismatch, undefined, `${fps}/${form}/${skill}/${t.p.sourceSymbol}: natural motion/cleanup`);
            assert.equal(t.firstPhaseMismatch, undefined, 'natural collision phase');
          }
          results.push({ fps, form, skill, owner, direction, mode, symbol: t.p.sourceSymbol,
            expectedDeath: t.rows.find((r: any) => r.state.dead)?.tick,
            actualDeath: t.actualDeath, firstMismatch: t.firstMismatch, firstPhaseMismatch: t.firstPhaseMismatch });
        }
        manager.destroy(); clock.destroy();
      }
    }
  }
  return results;
}
