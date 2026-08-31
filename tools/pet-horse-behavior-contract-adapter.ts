import horseFamilyTruth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-209-pet-horse-family.json';
import type { PlayerSlot } from '../src/systems/InputSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { resolveFormalPetHorseProjectileHits } from '../src/systems/PetHorseCombatSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import type { PetRoster } from '../src/systems/PetTypes';
import type {
  BehaviorRuntimeTraceFrame,
  BehaviorTraceOwnerSlot,
  RangeAttackChainExpected,
} from './behavior-contract-runtime-verifier';

type HorseForm = 1 | 2 | 3 | 4;

export type HorseRangeScenario = Readonly<{
  id: string;
  expected: RangeAttackChainExpected;
  trace: readonly BehaviorRuntimeTraceFrame[];
}>;

const ownerBySlot: Readonly<Record<BehaviorTraceOwnerSlot, Readonly<{ x: number; y: number; facingX: 1 }>>> = {
  p1: { x: 200, y: 300, facingX: 1 },
  p2: { x: 520, y: 300, facingX: 1 },
};

export function collectHorseRangeScenarios(): readonly HorseRangeScenario[] {
  return ([1, 2, 3, 4] as const).flatMap((form) => (
    (['p1', 'p2'] as const).map((slot) => collectHorseRangeScenario(form, slot))
  ));
}

export function collectHorseRangeScenario(
  form: HorseForm,
  ownerSlot: BehaviorTraceOwnerSlot,
): HorseRangeScenario {
  const frozen = horseFamilyTruth.forms[form - 1]!;
  const roster = activateHorse(form);
  const pet = roster.pets.find(({ isActive }) => isActive)!;
  pet.skills = [];
  const runtime = new PetCombatRuntime();
  const projectiles = createProjectileSystem();
  const owner = ownerBySlot[ownerSlot];
  const initialized = runtime.update({ roster, owner, targets: [], projectiles, random: () => 0.1, deltaMs: 0 });
  if (!initialized.runtime) throw new Error(`horse${form} failed to initialize`);
  const targetId = `controlled-target-${ownerSlot}-horse${form}`;
  const target = {
    id: targetId,
    x: initialized.runtime.x + frozen.attackRange + 180,
    y: initialized.runtime.y,
    isAlive: true,
  } as const;
  const combat = createStage1CombatRuntime();
  const enemy = createStage1CombatEnemy({ id: targetId, enemyType: 30, x: target.x, y: target.y });
  const trace: BehaviorRuntimeTraceFrame[] = [];
  let elapsedMs = 0;

  for (let frame = 0; frame <= 50; frame += 1) {
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
    if (!snapshot.runtime) throw new Error(`horse${form} runtime disappeared at frame ${frame}`);
    const actionEvent = runtime.events().find(({ type }) => type === 'action');
    const hpBefore = enemy.hp;
    const damageEvent = resolveFormalPetHorseProjectileHits({
      projectiles,
      combat,
      enemies: [enemy],
      ownerSlotForPet: (petId): PlayerSlot | undefined => petId === pet.id ? ownerSlot : undefined,
      timeMs: elapsedMs,
    })[0];
    const projectile = damageEvent
      ? projectiles.projectiles.find(({ projectileId }) => damageEvent.attackId.startsWith(`${projectileId}:`))
      : projectiles.projectiles[0];
    trace.push(Object.freeze({
      frame,
      elapsedMs,
      ownerSlot,
      consumerPath: 'PetCombatRuntime+formal-horse-hit-resolver',
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
      projectileActionToken: projectile?.petActionToken,
      projectileX: projectile?.x,
      projectileY: projectile?.y,
      projectileElapsedMs: projectile?.elapsedMs,
      attackId: damageEvent?.attackId,
      damageSourceId: damageEvent?.sourceId,
      targetHpBefore: hpBefore,
      targetHpAfter: enemy.hp,
      cleanupReason: damageEvent ? 'hit' : undefined,
    }));
  }

  return Object.freeze({
    id: `horse${form}-${ownerSlot}-range-chain`,
    expected: Object.freeze({
      contractId: `horse${form}.normal`,
      attackRange: frozen.attackRange,
      minimumHitElapsedMs: frozen.actions.normal.emitTiming.holdTick * (1000 / 24),
      petSourceId: pet.id,
      targetId,
    }),
    trace: Object.freeze(trace),
  });
}

export function activateHorse(form: HorseForm): PetRoster {
  const roster = createSeedPetRoster();
  for (const pet of roster.pets) pet.isActive = pet.species === 'horse' && pet.form === form;
  return roster;
}
