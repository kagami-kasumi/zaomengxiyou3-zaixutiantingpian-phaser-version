import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { HeroGatherCoordinateSystem } from '../src/systems/HeroGatherCoordinateSystem';
import { createHeroPartyRuntimeModel, updateHeroPartyMovement } from '../src/systems/HeroPartyRuntimeSystem';
import type { PlayerInputState } from '../src/systems/InputSystem';

const contract = JSON.parse(readFileSync('docs/reverse-engineering/reference/monster2-gather-coordinate-contract.json', 'utf8'));
assert.equal(contract.status, 'verified-bounded-coordinate');
const observations = [];
for (const fps of [20, 24, 30]) for (const slot of [1, 2]) {
  const source = contract.trajectories.find((t: any) => t.fps === fps && t.owners === slot && t.slot === slot && t.mode === 'move');
  const party = createHeroPartyRuntimeModel([{ slot: slot === 1 ? 'p1' : 'p2', heroId: 1,
    x: slot === 1 ? 100 : 700, y: slot === 1 ? 300 : 180, width: 60 }]);
  const member = party.members[0]!;
  const system = new HeroGatherCoordinateSystem();
  const input: PlayerInputState = { slot: slot === 1 ? 'p1' : 'p2', moveX: slot === 1 ? 1 : -1,
    down: false, up: false, attack: false, jump: false, skillSlots: [], special: false, magicWeapon: false };
  // Preserve a grounded, zero-gravity diagnostic by supplying a real horizontal
  // platform at this actor's feet. This is a controlled environment, not a claim
  // about Stage12 level geometry. Invoke the actual HeroParty movement owner.
  updateHeroPartyMovement(party, { inputs: [input], timeMs: 0, deltaMs: 1000 / fps,
    environmentFor: () => ({ bounds: { left: -10, right: 950 },
      platforms: [{ id: 'diagnostic-ground', kind: 'solid', left: -1000, right: 2000, top: member.movement.y }] }) });
  const expectedX = source.states[0][1];
  const actualX = member.movement.x;
  assert.notEqual(actualX, expectedX, 'If the known physical gap is fixed, replace this diagnostic with full acceptance');
  // The exact tween alone is not evidence that this world composition matches.
  system.request(member.movement, 400, 250);
  system.advance(1 / fps);
  observations.push({ fps, slot, phase: 'world-before-first-request', expectedX, actualX,
    difference: actualX - expectedX, modernPixelsPerTick: 360 / fps, originalPixelsPerTick: 5,
    controllerAttachedToActualMovement: true });
}
const report = { status: 'confirmed-production-input-gap', classification: 'diagnostic-not-acceptance',
  source: 'monster2-gather-coordinate-contract.json#/trajectories move tick0', observations,
  boundary: 'Only controlled horizontal movement. Gravity, wall snap, role-specific construction and root mapping require separate evidence.' };
const directory = 'docs/tasks/evidence/TASK-SLICE-260A';
mkdirSync(directory, { recursive: true });
writeFileSync(`${directory}/owner-preflight.json`, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
