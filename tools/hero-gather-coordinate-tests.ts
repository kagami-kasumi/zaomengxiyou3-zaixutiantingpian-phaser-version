import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { HeroGatherCoordinateSystem } from '../src/systems/HeroGatherCoordinateSystem';
import { createHeroPartyRuntimeModel } from '../src/systems/HeroPartyRuntimeSystem';
import { toDragonSourceCoordinate as twip } from '../src/systems/PetDragonCollisionSystem';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const contract = read('docs/reverse-engineering/reference/monster2-gather-coordinate-contract.json');
assert.equal(contract.status, 'verified-bounded-coordinate');
assert.equal(contract.rules.durationSeconds, 1);
const rows = read('docs/tasks/evidence/TASK-SETTINGS-257B/controlled.json').rows;
let checked = 0;
// Original library-only cases deliberately provide movement/detach as explicit
// services. This checks the production tween on real HeroParty movement objects,
// not the yet-unverified full shared-physics or formal Scene integration.
for (const fps of [20, 24, 30]) for (const owner of [1, 2, 3]) for (const mode of contract.scope.libraryModes) {
  const slots = owner === 3 ? [1, 2] : [owner];
  const party = createHeroPartyRuntimeModel(slots.map(slot => ({ slot: slot === 1 ? 'p1' as const : 'p2' as const,
    heroId: 1 as const, x: slot === 1 ? 100 : 700, y: slot === 1 ? 300 : 180, width: 60 })));
  const system = new HeroGatherCoordinateSystem();
  for (const member of party.members) system.request(member.movement, 400, 250);
  const move = () => party.members.forEach((member, i) => {
    member.movement.x = twip(member.movement.x + (slots[i] === 1 ? 5 : -5));
    member.movement.y = twip(member.movement.y + 2);
  });
  for (let tick = 0; tick <= fps * 2; tick++) {
    if (mode === 'move-before' && tick) move();
    system.advance(tick / fps);
    if (mode === 'move-after' && tick) move();
    if (tick === Math.floor(fps / 4)) {
      if (mode === 'pause') system.pause();
      if (mode === 'overwrite') for (const member of party.members) system.request(member.movement, 600, 150);
      if (mode === 'kill') system.destroy();
    }
    if (mode === 'pause' && tick === Math.floor(3 * fps / 4)) system.resume();
    for (const [i, member] of party.members.entries()) {
      const expected = rows.find((r: any) => r.fps === fps && r.owner === owner && r.mode === mode
        && r.slot === slots[i] && r.tick === tick);
      assert(expected);
      assert.deepEqual([member.movement.x, member.movement.y], [expected.x, expected.y],
        JSON.stringify({ fps, owner, mode, slot: slots[i], tick }));
      checked++;
    }
  }
}
assert.equal(checked, contract.acceptance.libraryStates);
console.log(`Hero gather: ${checked} original-library coordinate states; shared physics and Scene acceptance remain separate.`);
