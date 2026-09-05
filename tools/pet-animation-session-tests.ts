import assert from 'node:assert/strict';
import type { PetBehavior, PetBehaviorContext, PetCombatAnimationEvent } from '../src/systems/PetBehavior';
import { PetBehaviorRegistry } from '../src/systems/PetBehaviorRegistry';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createPetDragon1AnimationClock } from '../src/systems/PetDragonAnimationClock';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';

// A registry probe verifies the shared host clock seam, not the unfinished dragon combat strategy.
class ClockProbe implements PetBehavior {
  context!: PetBehaviorContext;
  pending: string | undefined;
  events: { event: PetCombatAnimationEvent; remaining: number | undefined }[] = [];
  createAnimationClock = createPetDragon1AnimationClock;
  enter(c: PetBehaviorContext): void { this.context = c; }
  canMove(c: PetBehaviorContext): boolean { return c.animation?.action === 'wait' || c.animation?.action === 'walk'; }
  basicAttackRange(): number { return 150; }
  basicAttack(): undefined { return undefined; }
  selectAction() { return this.pending ? { type: this.pending } : undefined; }
  executeAction(): void { this.pending = undefined; }
  updateEffects(c: PetBehaviorContext): void { this.context = c; }
  onDamaged(_e: unknown, c: PetBehaviorContext): void { if (c.pet.hp > 0) c.playAnimation('hurt'); }
  onAnimationEvent(event: PetCombatAnimationEvent, c: PetBehaviorContext): void {
    this.context = c;
    this.events.push({ event, remaining: c.animation?.remainingHoldCount });
    if (event.action === 'fs' && event.eventName === 'hit') {
      c.spawnSummon({ pet: c.pet, x: c.runtime.x + 100, y: c.runtime.y, facingX: 1 });
    }
  }
  destroy(): void {}
}

for (const hostFps of [20, 24, 30]) {
  const roster = createSeedPetRoster();
  const pet = roster.pets.find(({ isActive }) => isActive)!;
  const probes: ClockProbe[] = [];
  const runtime = new PetCombatRuntime(new PetBehaviorRegistry([{
    species: pet.species, form: pet.form,
    create: () => { const probe = new ClockProbe(); probes.push(probe); return probe; },
  }]));
  const frame = { roster, owner: { x: 200, y: 300, facingX: 1 as const }, targets: [], hostFps, deltaMs: 0 };
  const initial = runtime.update(frame);
  const key = initial.runtime!.runtimeKey;
  const step = () => runtime.update({ ...frame, deltaMs: 1000 / hostFps });
  probes[0]!.pending = 'normal';
  for (let tick = 1; tick <= 16; tick++) step();
  const hit = probes[0]!.events.find(({ event }) => event.eventName === 'hit')!;
  assert.equal(hit.remaining, 10, 'callback must run inside enter before countdown changes');
  assert.equal(hit.event.runtimeKey, key);
  assert.equal(runtime.snapshot().animation!.action, 'wait');

  probes[0]!.pending = 'fs';
  for (let tick = 1; tick <= 17; tick++) step();
  const child = runtime.snapshot().summons![0]!;
  assert.equal(child.animation!.elapsedTicks, 0, 'newly emitted child must not step in the creation tick');
  assert.equal(child.animation!.remainingHoldCount, 2);
  const next = step();
  assert.equal(next.summons![0]!.animation!.remainingHoldCount, 1);
  assert.equal(next.animation!.action, 'wait');

  runtime.update({ ...frame, deltaMs: 500 / hostFps,
    damageEvents: [{ runtimeKey: child.runtime.runtimeKey, amount: 1 }] });
  assert.equal(runtime.snapshot().summons![0]!.hp, child.hp, 'partial root tick defers descendant damage');
  runtime.update({ ...frame, deltaMs: 500 / hostFps });
  assert.equal(runtime.snapshot().summons![0]!.hp, child.hp - 1, 'buffered descendant event survives the next input');

  runtime.update({ ...frame, deltaMs: 1000 / hostFps,
    damageEvents: [{ runtimeKey: child.runtime.runtimeKey, amount: child.hp }] });
  assert.equal(runtime.snapshot().summons![0]!.phase, 'dead-playing');
  for (let tick = 1; tick < 16; tick++) step();
  assert.equal(runtime.snapshot().summons!.length, 0, 'private death completes through shared typed event routing');
  assert.equal(runtime.snapshot().petId, pet.id);

  const hitCount = probes[0]!.events.filter(({ event }) => event.eventName === 'hit').length;
  probes[0]!.pending = 'normal';
  runtime.update({ ...frame, deltaMs: 16 * 1000 / hostFps });
  assert.equal(probes[0]!.events.filter(({ event }) => event.eventName === 'hit').length, hitCount + 1,
    'a long render frame must execute intermediate emission exactly once');
  assert.equal(runtime.snapshot().animation!.action, 'wait');

  runtime.update({ ...frame, deltaMs: 1000 / hostFps,
    damageEvents: [{ runtimeKey: key, amount: pet.hp }] });
  assert.equal(runtime.snapshot().phase, 'dead-playing');
  for (let tick = 1; tick < 16; tick++) step();
  assert.equal(runtime.snapshot().petId, undefined, 'root death requires all sixteen original ticks');
  runtime.destroy();
}
console.log('Pet animation session clock: immediate typed enter, snapshot owner, deferred child step and root/private death passed.');
