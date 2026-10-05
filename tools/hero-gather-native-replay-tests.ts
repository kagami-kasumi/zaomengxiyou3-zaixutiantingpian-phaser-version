import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHeroPartyRuntimeModel, updateHeroPartyMovement, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { createHeroPartyGatherControl } from '../src/systems/HeroGatherCoordinateSystem';
import { heroSourceMovementProfile } from '../src/systems/HeroSourceMovementSystem';
import type { PlayerInputState } from '../src/systems/InputSystem';

// Replay the frozen AIR clock/input observations. This checks production numeric
// behavior at real observed timestamps; it is not a new native-clock or Scene run.
let groups = 0, worlds = 0, exits = 0, tweenSamples = 0;
const compare = (actual: number, expected: number, label: string) =>
  assert(Math.abs(actual - expected) < 1e-8, `${label}: ${actual} != ${expected}`);
for (const run of ['shared', 'shared-repeat']) {
  const source = JSON.parse(readFileSync(`docs/tasks/evidence/TASK-SETTINGS-257B/${run}.json`, 'utf8'));
  for (const fps of [20, 24, 30]) for (const owner of [1, 2, 3]) {
    const rows = source.rows.filter((r: any) => r.native && r.fps === fps && r.owner === owner);
    assert(rows.length);
    const slots = owner === 3 ? [1, 2] : [owner];
    const party = createHeroPartyRuntimeModel(slots.map(slot => ({
      slot: slot === 1 ? 'p1' : 'p2', heroId: 1,
      x: slot === 1 ? 100 : 700, y: slot === 1 ? 350 : 230, width: 60,
    })));
    const gather = createHeroPartyGatherControl(party);
    const retainedMembers = [...party.members];
    const at = Math.floor(fps / 4), resume = Math.floor(3 * fps / 4);
    let frame: any[] = [];
    for (const row of rows) {
      frame.push(row);
      if (row.phase !== 'exit') continue;
      const tick = row.tick;
      const label = `${run}/${fps}/${owner}/${tick}`;
      gather.advance(row.time);
      // Callback rows may still carry the preceding world tick. Frame grouping
      // follows the actual EXIT boundary, never equal tick numbers alone.
      for (const sample of frame.filter(r => r.phase === 'tween')) {
        const idx = slots.indexOf(sample.sampleSlot);
        const expected = sample.positions.find((p: any) => p.slot === sample.sampleSlot);
        compare(retainedMembers[idx]!.movement.x, expected.x, label+'/tween/x');
        compare(retainedMembers[idx]!.movement.y - 50, expected.y, label+'/tween/y');
        tweenSamples++;
      }
      if (tick === at) gather.pause();
      if (tick === resume) gather.resume();
      if (tick === 1) gather.request({ x: 400, y: 250 });
      if (tick === fps * 2) gather.request({ x: 600, y: 150 });
      if (tick === fps * 2 + 1) gather.request({ x: 650, y: 180 });
      if (tick === fps * 2 + 2) {
        party.members[0]!.combat.combat.state = 'dead';
        party.members[0]!.movement.velocityX = 0;
      }
      if (tick === fps * 4) { gather.destroy(); destroyHeroPartyRuntime(party); }
      const world = frame.filter(r => r.phase === 'world');
      assert(world.length <= 1, label+'/world uniqueness');
      if (world.length) {
        updateHeroPartyMovement(party, {
          timeMs: row.time * 1000, deltaMs: 1000 / fps,
          inputs: slots.map((slot): PlayerInputState => ({
            slot: slot === 1 ? 'p1' : 'p2', moveX: slot === 1 ? 1 : -1,
            up: false, down: false, jump: false, attack: false, skillSlots: [], special: false, magicWeapon: false,
          })),
          environmentFor: () => ({ platforms: [], bounds: { left: 20, right: 920 },
            sourceMotion: { hostFps: fps, profile: { ...heroSourceMovementProfile(1), walk: 5, gravity: 0 },
              walls: [], screenLeft: 20, screenRight: 920 } }),
        });
        worlds++;
      }
      for (const [idx, slot] of slots.entries()) {
        const expected = row.positions.find((p: any) => p.slot === slot);
        const movement = retainedMembers[idx]!.movement;
        compare(movement.x, expected.x, label+`/p${slot}/exit/x`);
        compare(movement.y - 50, expected.y, label+`/p${slot}/exit/y`);
        compare(movement.velocityX / fps, expected.vx, label+`/p${slot}/exit/vx`);
        compare(movement.velocityY / fps, expected.vy, label+`/p${slot}/exit/vy`);
      }
      assert.equal(gather.snapshot().paused, at <= tick && tick < resume);
      assert.equal(gather.snapshot().disposed, tick >= fps * 4);
      frame = [];
      exits++;
    }
    assert.equal(frame.length, 0);
    groups++;
  }
}
assert.equal(groups, 18);
assert(worlds > 0 && tweenSamples > 0);
console.log(`Hero gather frozen native replay: ${groups} source runs, ${worlds} world / ${exits} EXIT / ${tweenSamples} callback samples. Browser scheduling is a separate gate.`);
