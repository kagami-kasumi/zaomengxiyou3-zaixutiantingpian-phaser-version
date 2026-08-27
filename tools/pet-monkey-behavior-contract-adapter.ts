import monkeyFamilyTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json';
import type { PlayerSlot } from '../src/systems/InputSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { resolveFormalPetMonkeyProjectileHits } from '../src/systems/PetMonkeyCombatSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import type { PetRoster, PetState } from '../src/systems/PetTypes';
import type {
  BehaviorRuntimeTraceFrame,
  BehaviorTraceOwnerSlot,
  RangeAttackChainExpected,
} from './behavior-contract-runtime-verifier';

type MonkeyForm = 1 | 2 | 3 | 4;

export type MonkeyRangeScenario = Readonly<{
  id: string;
  expected: RangeAttackChainExpected;
  trace: readonly BehaviorRuntimeTraceFrame[];
}>;

const ownerBySlot: Readonly<Record<BehaviorTraceOwnerSlot, Readonly<{ x: number; y: number; facingX: 1 }>>> = {
  p1: { x: 200, y: 300, facingX: 1 },
  p2: { x: 520, y: 300, facingX: 1 },
};

export function collectMonkeyRangeScenarios(): readonly MonkeyRangeScenario[] {
  return ([1, 2, 3, 4] as const).flatMap((form) => (
    (['p1', 'p2'] as const).map((ownerSlot) => collectMonkeyRangeScenario(form, ownerSlot))
  ));
}

export function collectMonkeyRangeScenario(
  form: MonkeyForm,
  ownerSlot: BehaviorTraceOwnerSlot,
): MonkeyRangeScenario {
  const frozenForm = monkeyFamilyTruth.forms[form - 1]!;
  const roster = activateMonkey(form);
  const pet = roster.pets.find((candidate) => candidate.isActive)!;
  disableAllMonkeySkills(pet);
  const runtime = new PetCombatRuntime();
  const projectiles = createProjectileSystem();
  const owner = ownerBySlot[ownerSlot];
  const initialized = runtime.update({ roster, owner, targets: [], projectiles, random: () => 0.1, deltaMs: 0 });
  if (!initialized.runtime) throw new Error(`monkey${form} failed to initialize`);
  const targetId = `controlled-target-${ownerSlot}-monkey${form}`;
  const target = {
    id: targetId,
    x: initialized.runtime.x + frozenForm.attackRange + 180,
    y: initialized.runtime.y,
    isAlive: true,
  } as const;
  const combat = createStage1CombatRuntime();
  const enemy = createStage1CombatEnemy({ id: targetId, enemyType: 30, x: target.x, y: target.y });
  const trace: BehaviorRuntimeTraceFrame[] = [];
  let elapsedMs = 0;
  let previousProjectileId: string | undefined;

  for (let frame = 0; frame <= 40; frame += 1) {
    const deltaMs = frame === 0 ? 0 : 100;
    elapsedMs += deltaMs;
    if (frame > 0) updateProjectiles(projectiles, [{ id: pet.id, state: 'ready' }], deltaMs);
    const snapshot = runtime.update({
      roster,
      owner,
      targets: [target],
      projectiles,
      random: () => 0.1,
      deltaMs,
    });
    if (!snapshot.runtime) throw new Error(`monkey${form} runtime disappeared in frame ${frame}`);
    const runtimeEvents = runtime.events();
    const actionEvent = runtimeEvents.find(({ type }) => type === 'action');
    const hpBefore = enemy.hp;
    const damageEvents = resolveFormalPetMonkeyProjectileHits({
      projectiles,
      combat,
      enemies: [enemy],
      ownerSlotForPet: (petId): PlayerSlot | undefined => petId === pet.id ? ownerSlot : undefined,
      timeMs: elapsedMs,
    });
    const damageEvent = damageEvents[0];
    const projectile = damageEvent
      ? projectiles.projectiles.find(({ projectileId }) => damageEvent.attackId.startsWith(`${projectileId}:`))
      : projectiles.projectiles[0];
    const cleanupReason = previousProjectileId && !projectiles.projectiles.some(({ projectileId }) => projectileId === previousProjectileId)
      ? 'expired' as const
      : damageEvent ? 'hit' as const : undefined;
    trace.push(Object.freeze({
      frame,
      elapsedMs,
      ownerSlot,
      consumerPath: 'PetCombatRuntime+formal-hit-resolver',
      runtimeKey: snapshot.runtime.runtimeKey,
      petId: pet.id,
      petX: snapshot.runtime.x,
      petY: snapshot.runtime.y,
      targetId,
      targetX: target.x,
      targetY: target.y,
      distance: Math.hypot(target.x - snapshot.runtime.x, target.y - snapshot.runtime.y),
      action: actionEvent?.action?.type,
      actionToken: actionEvent?.actionToken,
      projectileId: projectile?.projectileId,
      projectileX: projectile?.x,
      projectileY: projectile?.y,
      projectileElapsedMs: projectile?.elapsedMs,
      attackId: damageEvent?.attackId,
      damageSourceId: damageEvent?.sourceId,
      targetHpBefore: hpBefore,
      targetHpAfter: enemy.hp,
      cleanupReason,
    }));
    previousProjectileId = projectile?.projectileId;
  }

  return Object.freeze({
    id: `monkey${form}-${ownerSlot}-range-chain`,
    expected: Object.freeze({
      contractId: `monkey${form}.normal`,
      attackRange: frozenForm.attackRange,
      minimumHitElapsedMs: frozenForm.actions.normal.frameCount * (1000 / 24),
      petSourceId: pet.id,
      targetId,
    }),
    trace: Object.freeze(trace),
  });
}

function activateMonkey(form: MonkeyForm): PetRoster {
  const roster = createSeedPetRoster();
  for (const pet of roster.pets) pet.isActive = pet.species === 'monkey' && pet.form === form;
  return roster;
}

function disableAllMonkeySkills(pet: PetState): void {
  pet.skills = ['tsml'];
  const state = pet.skillState!;
  state.monkey1Xj.releaseReady = false;
  state.monkey2Xj.releaseReady = false;
  state.monkey3Lj.releaseReady = false;
  state.monkey1Xj.cooldownMs = 99_999;
  state.monkey2Lj.cooldownMs = 99_999;
  state.monkey2Xj.cooldownMs = 99_999;
  state.monkey3Lyq.cooldownMs = 99_999;
  state.monkey3Xj.cooldownMs = 99_999;
  state.monkey3Lj.cooldownMs = 99_999;
  state.monkey4Jgaoyi.cooldownMs = 99_999;
}
