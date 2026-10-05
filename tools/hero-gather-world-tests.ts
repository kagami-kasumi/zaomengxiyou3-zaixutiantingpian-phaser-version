import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHeroPartyGatherControl } from '../src/systems/HeroGatherCoordinateSystem';
import {
  createHeroPartyRuntimeModel,
  updateHeroPartyMovement,
} from '../src/systems/HeroPartyRuntimeSystem';
import { heroSourceMovementProfile } from '../src/systems/HeroSourceMovementSystem';
import type { PlayerInputState } from '../src/systems/InputSystem';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const motionContract = read('docs/reverse-engineering/reference/hero-gather-motion-contract.json');
const coordinateContract = read('docs/reverse-engineering/reference/monster2-gather-coordinate-contract.json');
assert.equal(motionContract.status, 'verified-bounded-motion-inputs');
assert.equal(coordinateContract.status, 'verified-bounded-coordinate');
assert.deepEqual(motionContract.stateColumns, [
  'tick', 'x', 'y', 'vx', 'vy', 'dead', 'ready', 'parent', 'paused', 'sourceReady',
  'worldHeroes', 'worldMonsters',
]);

const rows = new Map<string, any>();
for (const trajectory of motionContract.trajectories) {
  for (const state of trajectory.states) {
    rows.set([trajectory.profile, trajectory.fps, trajectory.owner, trajectory.mode,
      trajectory.slot, state[0]].join(':'), state);
  }
}
assert.equal(motionContract.trajectories.length, 936);
assert.equal(rows.size, motionContract.acceptance.runs[0].controlledHeroStates);
assert.deepEqual(coordinateContract.stateColumns, [
  'tick', 'x', 'y', 'vx', 'vy', 'dead', 'ready', 'parent', 'paused', 'sourceReady',
]);
assert.equal(coordinateContract.trajectories.length, 144);
const legacyRows = new Map<string, any>();
const legacyStates = coordinateContract.trajectories.reduce((count: number, trajectory: any) => {
  for (const state of trajectory.states) {
    assert.equal(state.length, coordinateContract.stateColumns.length);
    legacyRows.set([0, trajectory.fps, trajectory.owners, trajectory.mode,
      trajectory.slot, state[0]].join(':'), state);
  }
  return count + trajectory.states.length;
}, 0);
assert.equal(legacyStates, coordinateContract.acceptance.sharedHeroStates);

const input = (slot: 1 | 2, moveX: -1 | 0 | 1): PlayerInputState => ({
  slot: slot === 1 ? 'p1' : 'p2', moveX, down: false, up: false, attack: false,
  jump: false, skillSlots: [false, false, false, false, false], special: false, magicWeapon: false,
});
const equalNumber = (actual: number, expected: number, label: string) => {
  assert.ok(Math.abs(actual - expected) <= 1e-8,
    `${label}: expected ${expected}, got ${actual}`);
};

let checked = 0;
let checkedLegacy = 0;
for (const profile of [0, 1, 2, 3, 4, 5, 6]) {
  const legacy = profile === 0;
  const expectedStates = legacy ? legacyRows : rows;
  const modes = legacy
    ? [...new Set(coordinateContract.trajectories.map((trajectory: any) => trajectory.mode))]
    : motionContract.scope.modes;
  for (const fps of [20, 24, 30]) {
    for (const owner of [1, 2, 3]) {
      for (const mode of modes) {
        const slots = owner === 3 ? [1, 2] as const : [owner] as const;
        const party = createHeroPartyRuntimeModel(slots.map(slot => ({
          slot: slot === 1 ? 'p1' as const : 'p2' as const,
          heroId: profile === 0 || profile <= 4 ? (profile || 1) as 1 | 2 | 3 | 4 : 5,
          x: mode === 'screen-left' ? 10 : mode === 'screen-right' ? 930 : slot === 1 ? 100 : 700,
          y: mode === 'wall' ? 310 : slot === 1 ? 350 : 230,
          width: 60,
        })));
        const tween = createHeroPartyGatherControl(party);
        const detached = new Set<number>();
        const sourceDestroyed = { value: false };
        const pauseAt = Math.floor(fps / 4);
        const resumeAt = Math.floor(3 * fps / 4);
        const target = { x: 400, y: 250 };
        const sourceProfileBase = profile === 0
          ? { ...heroSourceMovementProfile(1), walk: 5, run: 10 }
          : profile === 6
          ? { ...heroSourceMovementProfile(5), walk: 6, run: 10 }
          : heroSourceMovementProfile(profile <= 4 ? profile : 5);
        const sourceProfile = { ...sourceProfileBase, gravity: mode === 'gravity' ? 1.5 : 0 };
        const walls = mode === 'wall' ? [{ id: 'wall', left: -1000, right: 2000, top: 290,
          bottom: 320, usesWallTolerance: true }] : [];
        for (const member of party.members) {
          if (mode === 'wall') member.movement.velocityY = 10 * fps;
        }
        for (let tick = 0; tick <= fps * 2; tick++) {
          tween.advance(tick / fps);
          if (tick === pauseAt && mode === 'pause') tween.pause();
          if (tick === pauseAt && mode === 'hero-dead') {
            for (const member of party.members) member.combat.combat.state = 'dead';
          }
          if (tick === pauseAt && (mode === 'hero-destroy' || mode === 'scene-exit')) {
            for (const member of party.members) detached.add(member.combat.slot === 'p1' ? 1 : 2);
          }
          if (tick === pauseAt && (mode === 'source-destroy' || mode === 'scene-exit')) {
            sourceDestroyed.value = true;
          }
          if (tick === pauseAt && mode === 'scene-exit') tween.destroy();
          if (tick === resumeAt && mode === 'pause') tween.resume();
          if (tick === 1) tween.request(target);
          if (tick === pauseAt && mode === 'overwrite') tween.request({ x: 600, y: 150 });
          const paused = mode === 'pause' && tick >= pauseAt && tick < resumeAt;
          const removed = detached.size > 0 && tick >= pauseAt;
          if (!paused && !removed && !party.destroyed) {
            const move = mode === 'move' ? 1 : mode === 'run' ? 1 : 0;
            for (const [index, member] of party.members.entries()) {
              if (move && mode === 'run') {
                const direction = (slots[index] === 1 ? 1 : -1) as -1 | 1;
                member.movement.runningDirection = direction;
                member.movement.lastDirectionTap = direction;
                party.movement.members[index].previousInput = input(slots[index] as 1 | 2, direction);
              }
            }
            updateHeroPartyMovement(party, {
              timeMs: tick / fps * 1000,
              deltaMs: 1000 / fps,
              inputs: slots.map(slot => input(slot as 1 | 2, (slot === 1 ? move : -move) as -1 | 0 | 1)),
              environmentFor: () => ({
                platforms: [], bounds: { left: -1000, right: 2000 },
                sourceMotion: { hostFps: fps, profile: sourceProfile, walls,
                  screenLeft: 20, screenRight: 920 },
              }),
            });
          }
          const worldHeroes = removed ? 0 : slots.length;
          const worldMonsters = sourceDestroyed.value ? 0 : 1;
          for (const [index, member] of party.members.entries()) {
            const slot = slots[index];
            const expected = expectedStates.get([profile, fps, owner, mode, slot, tick].join(':'));
            assert.ok(expected, `missing frozen state profile=${profile} fps=${fps} owner=${owner} mode=${mode} slot=${slot} tick=${tick}`);
            const [expectedTick, x, y, vx, vy, dead, ready, parent, expectedPaused, sourceReady,
              expectedHeroes, expectedMonsters] = expected;
            assert.equal(expectedTick, tick);
            equalNumber(member.movement.x, x, `${profile}/${fps}/${owner}/${mode}/${slot}/${tick}/x`);
            equalNumber(member.movement.y - 50, y, `${profile}/${fps}/${owner}/${mode}/${slot}/${tick}/y`);
            equalNumber(member.movement.velocityX / fps, vx, `${profile}/${fps}/${owner}/${mode}/${slot}/${tick}/vx`);
            equalNumber(member.movement.velocityY / fps, vy, `${profile}/${fps}/${owner}/${mode}/${slot}/${tick}/vy`);
            assert.equal(member.combat.combat.state === 'dead', dead);
            assert.equal(removed, ready);
            assert.equal(!removed, parent);
            assert.equal(paused, expectedPaused);
            assert.equal(sourceDestroyed.value, sourceReady);
            if (!legacy) {
              assert.equal(worldHeroes, expectedHeroes);
              assert.equal(worldMonsters, expectedMonsters);
              checked++;
            } else {
              checkedLegacy++;
            }
          }
        }
      }
    }
  }
}

assert.equal(checked, motionContract.acceptance.runs[0].controlledHeroStates);
assert.equal(checkedLegacy, coordinateContract.acceptance.sharedHeroStates);
console.log(`Hero gather world: profile0 legacy=${checkedLegacy} shared states; profiles1-6 modern=${checked} frozen hero states.`);
