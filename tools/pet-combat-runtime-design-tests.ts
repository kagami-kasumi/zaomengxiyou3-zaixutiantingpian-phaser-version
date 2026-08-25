import assert from 'node:assert/strict';
import type {
  PetBehavior,
  PetBehaviorAction,
  PetBehaviorContext,
  PetBehaviorDestroyReason,
} from '../src/systems/PetBehavior';
import { PetBehaviorRegistry } from '../src/systems/PetBehaviorRegistry';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { PetCombatTargeting } from '../src/systems/PetCombatTargeting';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';

const owner = { x: 200, y: 300, facingX: 1 as const };

class RecordingBehavior implements PetBehavior {
  constructor(
    private readonly name: string,
    private readonly trace: string[],
    private readonly shouldAct = true,
  ) {}

  enter(context: PetBehaviorContext): void {
    this.trace.push(`${this.name}:enter:${context.pet.id}`);
    context.emit({ type: `${this.name}-entered` });
  }

  selectAction(context: PetBehaviorContext): PetBehaviorAction | undefined {
    this.trace.push(`${this.name}:select:${context.runtime.state}:${context.target?.id ?? 'none'}`);
    return this.shouldAct ? { type: 'basic-attack' } : undefined;
  }

  executeAction(action: PetBehaviorAction, context: PetBehaviorContext): void {
    this.trace.push(`${this.name}:execute:${action.type}`);
    context.emit({ type: `${this.name}-executed`, payload: action.type });
  }

  updateEffects(context: PetBehaviorContext): void {
    this.trace.push(`${this.name}:effects:${context.deltaMs}`);
    context.emit({ type: `${this.name}-effects` });
  }

  destroy(reason: PetBehaviorDestroyReason): void {
    this.trace.push(`${this.name}:destroy:${reason}`);
  }
}

function testTargetingIsPureAndDeterministic(): void {
  const targeting = new PetCombatTargeting();
  const targets = [
    { id: 'dead-near', x: 1, y: 0, isAlive: false },
    { id: 'first-tie', x: 3, y: 4, isAlive: true },
    { id: 'second-tie', x: -3, y: -4, isAlive: true },
  ] as const;

  assert.deepEqual(targeting.livingTargets(targets).map(({ id }) => id), ['first-tie', 'second-tie']);
  assert.equal(targeting.nearestTarget({ x: 0, y: 0 }, targets)?.id, 'first-tie');
  assert.equal(targeting.nearestTarget(undefined, targets)?.id, 'first-tie');
  assert.equal(targeting.distance({ x: 0, y: 0 }, { x: 3, y: 4 }), 5);
  assert.equal(targeting.facing({ x: 0, y: 0 }, { x: -1, y: 0 }, 1), -1);
  assert.equal(targeting.facing({ x: 0, y: 0 }, { x: 0, y: 1 }, -1), -1);
  assert.equal(targets[0].isAlive, false, 'target filtering must not mutate source snapshots');
}

function testRegistryRejectsDuplicateMissingAndInvalidKeys(): void {
  const trace: string[] = [];
  const registry = new PetBehaviorRegistry();
  registry.register('monkey', 1, () => new RecordingBehavior('m1', trace));
  assert.deepEqual(registry.keys(), ['monkey:1']);
  assert.notStrictEqual(registry.resolve('monkey', 1), registry.resolve('monkey', 1));
  assert.throws(
    () => registry.register('monkey', 1, () => new RecordingBehavior('duplicate', trace)),
    /Duplicate pet behavior registration/u,
  );
  assert.throws(() => registry.resolve('horse', 1), /Missing pet behavior registration/u);
  assert.throws(() => registry.has('', 1), /species must not be empty/u);
  assert.throws(() => registry.has('monkey', 0), /positive integer/u);
}

function testRuntimeOwnsOrderedLifecycleSnapshotsAndEvents(): void {
  const trace: string[] = [];
  const roster = createSeedPetRoster();
  const registry = new PetBehaviorRegistry([
    { species: 'monkey', form: 1, create: () => new RecordingBehavior('m1', trace) },
    { species: 'monkey', form: 2, create: () => new RecordingBehavior('m2', trace, false) },
  ]);
  const runtime = new PetCombatRuntime(registry);

  const firstSnapshot = runtime.update({
    roster,
    owner,
    targets: [
      { id: 'dead', x: 190, y: 300, isAlive: false },
      { id: 'far', x: 600, y: 300, isAlive: true },
      { id: 'near', x: 250, y: 300, isAlive: true },
    ],
    deltaMs: 16,
  });
  assert.deepEqual(trace, [
    'm1:enter:pet-monkey-1',
    'm1:select:idle:near',
    'm1:execute:basic-attack',
    'm1:effects:16',
  ]);
  assert.equal(firstSnapshot.petId, 'pet-monkey-1');
  assert.equal(firstSnapshot.target?.id, 'near');
  assert.equal(firstSnapshot.runtime?.state, 'idle');
  assert.equal(Object.isFrozen(firstSnapshot), true);
  assert.equal(Object.isFrozen(firstSnapshot.runtime), true);
  assert.deepEqual(runtime.events().map(({ type }) => type), [
    'activated', 'behavior', 'behavior', 'action', 'behavior',
  ]);
  assert.equal(Object.isFrozen(runtime.events()), true);
  assert.ok(runtime.events().every(Object.isFrozen));

  roster.pets[0]!.isActive = false;
  roster.pets[1]!.isActive = true;
  runtime.update({ roster, owner, targets: [], deltaMs: 20 });
  assert.deepEqual(trace.slice(4), [
    'm1:destroy:replaced',
    'm2:enter:pet-monkey-2',
    'm2:select:idle:none',
    'm2:effects:20',
  ]);
  assert.deepEqual(runtime.events().map(({ type }) => type), [
    'deactivated', 'activated', 'behavior', 'behavior',
  ]);

  roster.pets[1]!.hp = 0;
  runtime.update({ roster, owner, targets: [], deltaMs: 16 });
  assert.equal(runtime.snapshot().petId, undefined);
  assert.deepEqual(trace.slice(-1), ['m2:destroy:inactive']);
  assert.deepEqual(runtime.events().map(({ type, reason }) => [type, reason]), [
    ['deactivated', 'inactive'],
  ]);

  runtime.destroy();
  runtime.destroy();
  assert.deepEqual(runtime.events().map(({ type }) => type), ['destroyed']);
  assert.equal(runtime.snapshot().destroyed, true);
  runtime.update({ roster, owner, targets: [], deltaMs: Number.NaN });
  assert.deepEqual(runtime.events().map(({ type }) => type), ['destroyed']);
}

function testRuntimeRejectsBadFramesAndMissingBehaviorTransactionally(): void {
  const roster = createSeedPetRoster();
  const runtime = new PetCombatRuntime(new PetBehaviorRegistry());
  assert.throws(
    () => runtime.update({ roster, owner, targets: [], deltaMs: 16 }),
    /Missing pet behavior registration/u,
  );
  assert.equal(runtime.snapshot().petId, undefined, 'failed resolution must not install partial runtime state');

  const validRuntime = new PetCombatRuntime(new PetBehaviorRegistry([
    {
      species: 'monkey',
      form: 1,
      create: () => new RecordingBehavior('valid', [], false),
    },
  ]));
  assert.throws(
    () => validRuntime.update({ roster, owner, targets: [], deltaMs: -1 }),
    /finite and non-negative/u,
  );
  assert.throws(
    () => validRuntime.update({
      roster,
      owner,
      targets: [{ id: 'bad', x: Number.NaN, y: 0, isAlive: true }],
      deltaMs: 0,
    }),
    /target coordinates must be finite/u,
  );
}

function testRuntimeReplacesBehaviorWhenSamePetChangesForm(): void {
  const trace: string[] = [];
  const roster = createSeedPetRoster();
  const runtime = new PetCombatRuntime(new PetBehaviorRegistry([
    { species: 'monkey', form: 1, create: () => new RecordingBehavior('form1', trace, false) },
    { species: 'monkey', form: 2, create: () => new RecordingBehavior('form2', trace, false) },
  ]));
  runtime.update({ roster, owner, targets: [], deltaMs: 0 });
  roster.pets[0]!.form = 2;
  runtime.update({ roster, owner, targets: [], deltaMs: 0 });
  assert.ok(trace.includes('form1:destroy:replaced'));
  assert.ok(trace.includes('form2:enter:pet-monkey-1'));
  assert.equal(runtime.snapshot().form, 2);
}

testTargetingIsPureAndDeterministic();
testRegistryRejectsDuplicateMissingAndInvalidKeys();
testRuntimeOwnsOrderedLifecycleSnapshotsAndEvents();
testRuntimeRejectsBadFramesAndMissingBehaviorTransactionally();
testRuntimeReplacesBehaviorWhenSamePetChangesForm();
console.log('Pet combat runtime P1 design contract tests passed.');
