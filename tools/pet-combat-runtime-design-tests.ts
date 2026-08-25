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
import { createDefaultPetBehaviorRegistry } from '../src/systems/pet-behaviors/createDefaultPetBehaviorRegistry';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import type { PetRoster, PetState } from '../src/systems/PetTypes';

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

function testDefaultRegistryRunsMonkeyAndHorseRulesThroughOneRuntimeClock(): void {
  const expectedKeys = [
    'monkey:1', 'monkey:2', 'monkey:3', 'monkey:4',
    'horse:1', 'horse:2', 'horse:3', 'horse:4',
  ];
  assert.deepEqual(createDefaultPetBehaviorRegistry().keys(), expectedKeys);

  const cases = [
    ['monkey', 1, 'monkey1-xj'],
    ['monkey', 2, 'monkey2-lj'],
    ['monkey', 3, 'monkey3-lyq'],
    ['monkey', 4, 'monkey4-jgaoyi'],
    ['horse', 1, 'horse1-sp'],
    ['horse', 2, 'horse2-bd'],
    ['horse', 3, 'horse3-bz'],
    ['horse', 4, 'horse4-tmaoyi'],
  ] as const;

  for (const [species, form, expectedAction] of cases) {
    const roster = createSeedPetRoster();
    const pet = activatePet(roster, species, form);
    if (species === 'monkey' && form === 1) pet.skillState!.monkey1Xj.releaseReady = true;
    if (species === 'horse' && form === 2) pet.skillState!.horse2Bd.releaseReady = true;
    const projectiles = createProjectileSystem();
    const runtime = new PetCombatRuntime();

    runtime.update({
      roster,
      owner,
      targets: [{ id: 'target', x: 210, y: 300, isAlive: true }],
      projectiles,
      random: () => 1,
      deltaMs: 16,
    });

    const behaviorEvent = runtime.events().find(({ type }) => type === 'behavior');
    const payload = behaviorEvent?.behaviorEvent?.payload as { action?: string; ok?: boolean } | undefined;
    assert.equal(payload?.action, expectedAction, `${species}:${form} must choose its registered skill`);
    assert.equal(payload?.ok, true, `${species}:${form} must call the existing skill rule successfully`);
    assert.ok(projectiles.projectiles.length > 0, `${species}:${form} must preserve projectile-system ownership`);

    const cooldownAfterCast = getActionCooldown(pet, expectedAction);
    assert.ok(cooldownAfterCast > 0, `${expectedAction} must write the existing cooldown state`);
    runtime.update({
      roster,
      owner,
      targets: [{ id: 'target', x: 210, y: 300, isAlive: true }],
      projectiles,
      deltaMs: 16,
    });
    assert.equal(getActionCooldown(pet, expectedAction), cooldownAfterCast - 16);
    const nextPayload = runtime.events().find(({ type }) => type === 'behavior')
      ?.behaviorEvent?.payload as { action?: string } | undefined;
    assert.notEqual(nextPayload?.action, expectedAction, `${expectedAction} must not repeat while cooling`);
  }
}

function testRealBehaviorRequiresTheSkillExecutionPort(): void {
  const roster = createSeedPetRoster();
  const monkey = activatePet(roster, 'monkey', 2);
  monkey.skillState!.monkey2Lj.cooldownMs = 0;
  const runtime = new PetCombatRuntime();
  assert.throws(
    () => runtime.update({
      roster,
      owner,
      targets: [{ id: 'target', x: 210, y: 300, isAlive: true }],
      deltaMs: 0,
    }),
    /requires projectiles/u,
  );
}

function activatePet(roster: PetRoster, species: string, form: number): PetState {
  let active: PetState | undefined;
  for (const pet of roster.pets) {
    pet.isActive = pet.species === species && pet.form === form;
    if (pet.isActive) active = pet;
  }
  assert.ok(active, `seed roster must contain ${species}:${form}`);
  return active;
}

function getActionCooldown(pet: PetState, action: string): number {
  const state = pet.skillState!;
  switch (action) {
    case 'monkey1-xj': return state.monkey1Xj.cooldownMs;
    case 'monkey2-lj': return state.monkey2Lj.cooldownMs;
    case 'monkey3-lyq': return state.monkey3Lyq.cooldownMs;
    case 'monkey4-jgaoyi': return state.monkey4Jgaoyi.cooldownMs;
    case 'horse1-sp': return state.horse1Sp.cooldownMs;
    case 'horse2-bd': return state.horse2Bd.cooldownMs;
    case 'horse3-bz': return state.horse3Bz.cooldownMs;
    case 'horse4-tmaoyi': return state.horse4Tmaoyi.cooldownMs;
    default: throw new Error(`Unknown tested pet action: ${action}`);
  }
}

testTargetingIsPureAndDeterministic();
testRegistryRejectsDuplicateMissingAndInvalidKeys();
testRuntimeOwnsOrderedLifecycleSnapshotsAndEvents();
testRuntimeRejectsBadFramesAndMissingBehaviorTransactionally();
testRuntimeReplacesBehaviorWhenSamePetChangesForm();
testDefaultRegistryRunsMonkeyAndHorseRulesThroughOneRuntimeClock();
testRealBehaviorRequiresTheSkillExecutionPort();
console.log('Pet combat runtime P1/P1B design contract tests passed.');
