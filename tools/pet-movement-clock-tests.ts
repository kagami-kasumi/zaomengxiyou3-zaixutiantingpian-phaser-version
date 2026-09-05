import assert from 'node:assert/strict';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { PetBehaviorRegistry } from '../src/systems/PetBehaviorRegistry';
import type { PetBehavior, PetBehaviorContext } from '../src/systems/PetBehavior';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createPetRuntime, chasePetRuntimeTarget, updatePetRuntime } from '../src/systems/PetRuntimeSystem';
import type { PetCombatFrame } from '../src/systems/PetCombatTypes';

class WalkingProbe implements PetBehavior {
  context!: PetBehaviorContext;
  enter(c: PetBehaviorContext): void { this.context = c; }
  canMove(): boolean { return true; }
  basicAttackRange(): number { return 150; }
  basicAttack(): undefined { return undefined; }
  selectAction(): undefined { return undefined; }
  executeAction(): void {}
  updateEffects(c: PetBehaviorContext): void { this.context = c; }
  onDamaged(): void {}
  onAnimationEvent(): void {}
  destroy(): void {}
}

for (const hostFps of [20, 24, 30]) {
  // Different values prove per-pet data is retained; they are not claims about
  // additional original pet species. Source-grounded speed=5 is checked separately.
  for (const speed of [3, 5, 8]) {
    const roster = createSeedPetRoster();
    const pet = roster.pets.find((p) => p.isActive)!;
    pet.moveSpeed = speed;
    const owner = { x: 200, y: 300, facingX: 1 as const };
    const target = { id: 'east', x: 800, y: 270, isAlive: true };
    const initial = createPetRuntime(pet, owner);
    const whole = { ...initial };
    const fractional = { ...initial };
    chasePetRuntimeTarget(whole, pet, target, 150, 1000 / hostFps, hostFps);
    for (let i = 0; i < 4; i++) {
      chasePetRuntimeTarget(fractional, pet, target, 150, 250 / hostFps, hostFps);
    }
    assert.equal(whole.x - initial.x, speed);
    assert.ok(Math.abs(whole.x - fractional.x) < 1e-9);
    assert.equal(whole.y, initial.y);
    const follow = { ...initial, x: -100, y: owner.y - 18 };
    updatePetRuntime(follow, pet, owner, 1000 / hostFps, hostFps);
    assert.equal(follow.x, -100 + speed, 'follow and chase must use the same clock units');

    const probes: WalkingProbe[] = [];
    const runtime = new PetCombatRuntime(new PetBehaviorRegistry([{
      species: pet.species, form: pet.form,
      create: () => { const probe = new WalkingProbe(); probes.push(probe); return probe; },
    }]));
    const frame: PetCombatFrame = { roster, owner, targets: [target], deltaMs: 0, hostFps };
    const start = runtime.update(frame).runtime!;
    probes[0]!.context.spawnSummon({ pet, x: 300, y: target.y, facingX: 1 });
    const after = runtime.update({ ...frame, deltaMs: 1000 / hostFps });
    assert.equal(after.runtime!.x - start.x, speed, 'root session must consume supplied host clock');
    assert.equal(after.summons![0]!.runtime.x - 300, speed, 'private session must inherit supplied clock');
    const changedFps = hostFps === 20 ? 30 : 20;
    const next = runtime.update({ ...frame, hostFps: changedFps, deltaMs: 1000 / changedFps });
    assert.equal(next.runtime!.x - after.runtime!.x, speed, 'settings change must not retain old clock');
    for (const bad of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
      assert.throws(() => runtime.update({ ...frame, hostFps: bad }), /hostFps/);
    }
    runtime.destroy();
  }
}
console.log('Pet movement clock: per-pet speed, 20/24/30fps, fractional delta, root/private routing and clock changes passed.');
