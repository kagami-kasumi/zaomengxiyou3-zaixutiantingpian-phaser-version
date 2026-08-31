import horseFamilyTruthJson from '../../docs/reverse-engineering/ground-truth/manifests/task-settings-209-pet-horse-family.json';
import {
  getProjectileAttackId,
  getProjectileHitbox,
  recordProjectileHit,
  spawnProjectileFromTuning,
} from './ProjectileSystem';
import type {
  ProjectileModel,
  ProjectileSystemModel,
  ProjectileTuning,
  ProjectileVariant,
} from './ProjectileTypes';
import { getActivePet } from './PetRosterSystem';
import type {
  PetRoster,
  PetRuntimeModel,
  PetSkillCastResult,
  PetSkillRandomSource,
  PetSkillTarget,
  PetState,
} from './PetTypes';
import {
  resolveStage1PetHit,
  type Stage1CombatEnemy,
  type Stage1CombatRuntime,
} from './Stage1CombatSystem';
import type { DamageEvent } from './CombatSystem';
import type { PlayerSlot } from './InputSystem';

export type HorseForm = 1 | 2 | 3 | 4;
export type HorseSkillAction = 'sp' | 'bd' | 'bz' | 'tmaoyi';

type FrozenAction = Readonly<{
  hit: string;
  emitTiming: Readonly<{ holdTick: number }>;
  projectile: string;
  emit: Readonly<{ x: string; y: number }>;
  visibleFrames?: number;
}>;

type FrozenForm = Readonly<{
  id: string;
  attackRange: number;
  actions: Readonly<Record<string, FrozenAction>>;
}>;

const horseFamilyTruth = horseFamilyTruthJson as unknown as Readonly<{
  truthId: string;
  status: string;
  forms: readonly FrozenForm[];
  completeness: Readonly<{ unresolved: readonly unknown[] }>;
}>;

const hostFrameMs = 1000 / 24;
const actionAssetKey = (form: HorseForm, action: 'normal' | HorseSkillAction): string => (
  action === 'tmaoyi'
    ? 'pet-skill.horse4.tmaoyi'
    : `pet-skill.horse${form}.${action}`
);

const variantByAction: Readonly<Record<string, ProjectileVariant>> = {
  '1:normal': 'pet-horse1-normal',
  '1:sp': 'pet-horse1-sp',
  '2:normal': 'pet-horse2-normal',
  '2:bd': 'pet-horse2-bd',
  '2:sp': 'pet-horse2-sp',
  '3:normal': 'pet-horse3-normal',
  '3:bd': 'pet-horse3-bd',
  '3:sp': 'pet-horse3-sp',
  '3:bz': 'pet-horse3-bz',
  '4:normal': 'pet-horse4-normal',
  '4:bd': 'pet-horse4-bd',
  '4:sp': 'pet-horse4-sp',
  '4:bz': 'pet-horse4-bz',
  '4:tmaoyi': 'pet-horse4-tmaoyi',
};

const collisionByForm = {
  1: { width: 31.05, height: 29.95 },
  2: { width: 35, height: 69.95 },
  3: { width: 35, height: 69.95 },
  4: { width: 35, height: 69.95 },
} as const;

assertVerifiedTruth();

export function getPetHorseAttackRange(form: HorseForm): number {
  return getFrozenForm(form).attackRange;
}

export function requestPetHorseBasicAttack(params: Readonly<{
  roster: PetRoster;
  runtime: PetRuntimeModel;
  target: Readonly<PetSkillTarget>;
  actionToken: number;
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}>): PetSkillCastResult {
  const pet = getActiveHorse(params.roster);
  if (!pet) return failure(params.roster, 'No active horse for basic attack');
  const form = pet.form as HorseForm;
  return spawnAction({
    ...params,
    pet,
    form,
    action: 'normal',
    damage: calculateHorseDamage(pet, 'normal', params.random),
  });
}

export function requestPetHorseSkill(
  action: HorseSkillAction,
  params: Readonly<{
    roster: PetRoster;
    runtime: PetRuntimeModel;
    targets: readonly PetSkillTarget[];
    projectiles: ProjectileSystemModel;
    random?: PetSkillRandomSource;
    actionToken?: number;
  }>,
): PetSkillCastResult {
  const pet = getActiveHorse(params.roster);
  if (!pet) return failure(params.roster, 'No active horse');
  const form = pet.form as HorseForm;
  const target = params.targets.find(({ isAlive }) => isAlive);
  if (!target) return failure(params.roster, `${pet.displayName} ${action} has no target`, pet);
  if (!pet.skills.includes(action)) return failure(params.roster, `${pet.displayName} has not learned ${action}`, pet);
  const state = pet.skillState;
  if (!state) return failure(params.roster, `${pet.displayName} has no skill state`, pet);
  const distance = Math.hypot(target.x - params.runtime.x, target.y - params.runtime.y);
  const gate = skillGate(action, pet, distance);
  if (gate) return failure(params.roster, `${pet.displayName} ${action} ${gate}`, pet);

  const mpCost = action === 'tmaoyi' ? 30 : 20;
  const mpBefore = pet.mp;
  pet.mp -= mpCost;
  setCooldownAndRelease(state, action);

  if (action === 'tmaoyi') {
    const projectiles = spawnTmaoyiProjectiles(
      pet,
      params.runtime,
      params.targets,
      params.projectiles,
      params.actionToken ?? 0,
      params.random,
    );
    return success(params.roster, pet, target, projectiles[0], projectiles, 0, mpBefore, action);
  }
  const result = spawnAction({
    roster: params.roster,
    runtime: params.runtime,
    target,
    projectiles: params.projectiles,
    random: params.random,
    actionToken: params.actionToken ?? 0,
    pet,
    form,
    action,
    damage: calculateHorseDamage(pet, action, params.random),
  });
  return { ...result, mpBefore, mpAfter: pet.mp };
}

export function resolveFormalPetHorseProjectileHits(params: Readonly<{
  projectiles: ProjectileSystemModel;
  combat: Stage1CombatRuntime;
  enemies: readonly Stage1CombatEnemy[];
  ownerSlotForPet: (petId: string) => PlayerSlot | undefined;
  timeMs: number;
}>): readonly DamageEvent[] {
  const events: DamageEvent[] = [];
  const pendingExplosions: ProjectileModel[] = [];
  for (const projectile of params.projectiles.projectiles) {
    if (!isHorseProjectile(projectile) || projectile.isExpired || projectile.remainingHits <= 0) continue;
    if (projectile.elapsedMs < (projectile.activeAfterMs ?? 0)) continue;
    const ownerSlot = params.ownerSlotForPet(projectile.sourceId);
    if (!ownerSlot) continue;
    const hitbox = getProjectileHitbox(projectile);
    for (const enemy of params.enemies) {
      const tracked = projectile.trackingTargetId === enemy.id;
      if (enemy.phase === 'dead' || (!tracked && !containsPoint(hitbox, enemy))) continue;
      const event = resolveStage1PetHit({
        runtime: params.combat,
        enemy,
        ownerSlot,
        petId: projectile.sourceId,
        attackId: getProjectileAttackId(projectile),
        actionName: projectile.actionName,
        attackKind: projectile.attackKind,
        damage: projectile.damage,
        knockbackX: projectile.knockbackX,
        knockbackY: projectile.knockbackY,
        timeMs: params.timeMs,
      });
      if (!event) continue;
      if (projectile.magicIceMs && projectile.magicIceMs > 0) {
        enemy.petHorseIceRemainingMs = Math.max(enemy.petHorseIceRemainingMs ?? 0, projectile.magicIceMs);
      }
      recordProjectileHit(projectile);
      events.push(event);
      if (projectile.variant === 'pet-horse4-tmaoyi' && projectile.secondStageDamage !== undefined) {
        pendingExplosions.push(createTmaoyiExplosion(params.projectiles, projectile, enemy));
      }
    }
  }
  params.projectiles.projectiles.push(...pendingExplosions);
  return events;
}

export function isHorseProjectile(projectile: Pick<ProjectileModel, 'variant'>): boolean {
  return projectile.variant.startsWith('pet-horse');
}

function spawnAction(params: Readonly<{
  roster: PetRoster;
  runtime: PetRuntimeModel;
  target: Readonly<PetSkillTarget>;
  actionToken: number;
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
  pet: PetState;
  form: HorseForm;
  action: 'normal' | HorseSkillAction;
  damage: number;
}>): PetSkillCastResult {
  const frozen = getFrozenForm(params.form).actions[params.action];
  const variant = variantByAction[`${params.form}:${params.action}`];
  if (!frozen || !variant) return failure(params.roster, `${params.pet.displayName} has no ${params.action}`, params.pet);
  const offsetX = parseDirectionalOffset(frozen.emit.x);
  const collision = collisionByForm[params.form];
  const tuning: ProjectileTuning = {
    actionName: frozen.hit,
    assetKey: actionAssetKey(params.form, params.action),
    sourceSymbol: frozen.projectile,
    runtimeName: frozen.projectile,
    offsetX,
    offsetY: frozen.emit.y,
    speedX: 0,
    speedY: 0,
    distance: undefined,
    width: collision.width,
    height: collision.height,
    lifetimeMs: Math.max((frozen.visibleFrames ?? 8) * hostFrameMs, frozen.emitTiming.holdTick * hostFrameMs + 120),
    damage: params.damage,
    attackKind: 'magic',
    knockbackX: 2,
    knockbackY: -2,
    hitIntervalFrames: hitIntervalFor(frozen.hit),
    maxHits: 1,
  };
  const facingX = params.target.x < params.runtime.x ? -1 : 1;
  const projectile = spawnProjectileFromTuning(
    params.projectiles,
    { sourceId: params.pet.id, x: params.runtime.x, y: params.runtime.y, facingX },
    variant,
    `horse${params.form}-${params.action}`,
    tuning,
  );
  projectile.activeAfterMs = frozen.emitTiming.holdTick * hostFrameMs;
  projectile.trackingTargetId = params.target.id;
  projectile.petActionToken = params.actionToken;
  projectile.destroyWhenSourceHurt = false;
  if (params.action === 'sp' || params.action === 'bd') projectile.magicIceMs = 2_000;
  params.projectiles.projectiles.push(projectile);
  return success(params.roster, params.pet, params.target, projectile, [projectile], params.damage, params.pet.mp, params.action);
}

function spawnTmaoyiProjectiles(
  pet: PetState,
  runtime: PetRuntimeModel,
  targets: readonly PetSkillTarget[],
  projectiles: ProjectileSystemModel,
  actionToken: number,
  random?: PetSkillRandomSource,
): readonly ProjectileModel[] {
  const alive = targets.filter(({ isAlive }) => isAlive);
  const frozen = getFrozenForm(4).actions.tmaoyi!;
  const hasSp = pet.skills.includes('sp');
  const hasBd = pet.skills.includes('bd');
  const hasBz = pet.skills.includes('bz');
  const damage = calculateHorseDamage(pet, 'sp', random);
  return alive.map((target, index) => {
    const reverseIndex = alive.length - index - 1;
    const projectile = spawnProjectileFromTuning(
      projectiles,
      {
        sourceId: pet.id,
        x: runtime.x + (alive.length / 2 - reverseIndex) * 90,
        y: 50,
        facingX: 1,
      },
      'pet-horse4-tmaoyi',
      'horse4-tmaoyi',
      {
        actionName: 'hit5_1',
        assetKey: actionAssetKey(4, 'tmaoyi'),
        sourceSymbol: frozen.projectile,
        runtimeName: frozen.projectile,
        offsetX: 0,
        offsetY: 0,
        speedX: 0,
        speedY: 1,
        distance: 2_000,
        width: 35,
        height: 69.95,
        lifetimeMs: 10_000,
        damage,
        attackKind: 'magic',
        knockbackX: 0,
        knockbackY: 0,
        hitIntervalFrames: 20,
        maxHits: 1,
      },
    );
    projectile.activeAfterMs = frozen.emitTiming.holdTick * hostFrameMs;
    projectile.petActionToken = actionToken;
    projectile.accelerationY = 1;
    projectile.maxVelocityY = 35;
    projectile.trackingTargetId = hasSp ? target.id : undefined;
    projectile.magicIceMs = hasBd ? 2_400 : undefined;
    projectile.secondStageDamage = hasBz ? calculateHorseDamage(pet, 'bz', random) : undefined;
    projectile.explosionDelayMs = hasBd && hasBz ? 1_000 : 0;
    projectile.destroyWhenSourceHurt = false;
    projectiles.projectiles.push(projectile);
    return projectile;
  });
}

function createTmaoyiExplosion(
  system: ProjectileSystemModel,
  source: ProjectileModel,
  enemy: Stage1CombatEnemy,
): ProjectileModel {
  const projectile = spawnProjectileFromTuning(
    system,
    { sourceId: source.sourceId, x: enemy.x, y: enemy.y, facingX: 1 },
    'pet-horse4-tmaoyi-explode',
    'horse4-tmaoyi-explode',
    {
      actionName: 'hit5_2',
      assetKey: 'pet-skill.horse4.tmaoyi.explode',
      sourceSymbol: 'PetHorse4Bullet5Explode',
      runtimeName: 'PetHorse4Bullet5Explode',
      offsetX: 0,
      offsetY: 0,
      speedX: 0,
      speedY: 0,
      distance: undefined,
      width: 35,
      height: 69.95,
      lifetimeMs: 30 * hostFrameMs + (source.explosionDelayMs ?? 0),
      damage: source.secondStageDamage ?? 0,
      attackKind: 'magic',
      knockbackX: 0,
      knockbackY: 0,
      hitIntervalFrames: 12,
      maxHits: 1,
    },
  );
  projectile.activeAfterMs = source.explosionDelayMs ?? 0;
  projectile.petActionToken = source.petActionToken;
  projectile.trackingTargetId = enemy.id;
  projectile.destroyWhenSourceHurt = false;
  return projectile;
}

function calculateHorseDamage(
  pet: PetState,
  action: 'normal' | Exclude<HorseSkillAction, 'tmaoyi'>,
  random?: PetSkillRandomSource,
): number {
  const base = action === 'normal' ? pet.atk : (action === 'bz' ? 6.6 : 3.6) * pet.atk * 1.05;
  const magicAdd = pet.autoBuffState?.fsnl.active?.bonusSkillDamage ?? 0;
  const crit = (random?.() ?? 1) <= pet.critBonusRate ? 2 : 1;
  const gxp = pet.skills.includes('gxp') ? 1.2 : 1;
  const flower = pet.form === 4 ? (pet.magicFlowerBuff?.attackMultiplier ?? 1) : 1;
  return (base + magicAdd) * crit * gxp * flower;
}

function skillGate(action: HorseSkillAction, pet: PetState, distance: number): string | undefined {
  const state = pet.skillState!;
  if (pet.mp < (action === 'tmaoyi' ? 30 : 20)) return 'mp-not-enough';
  if (action === 'sp' && (distance < 50 || distance > 100)) return 'range-rejected';
  if (action === 'bz' && distance > 250) return 'range-rejected';
  if (action === 'bd' && !state.horse2Bd.releaseReady) return 'hurt-release-not-ready';
  const cooldown = action === 'sp'
    ? state.horse1Sp.cooldownMs
    : action === 'bd'
      ? state.horse2Bd.cooldownMs
      : action === 'bz'
        ? state.horse3Bz.cooldownMs
        : state.horse4Tmaoyi.cooldownMs;
  return cooldown > 0 ? 'cooling' : undefined;
}

function setCooldownAndRelease(state: NonNullable<PetState['skillState']>, action: HorseSkillAction): void {
  if (action === 'sp') state.horse1Sp.cooldownMs = 4_000;
  if (action === 'bd') {
    state.horse2Bd.cooldownMs = 2_000;
    state.horse2Bd.releaseReady = false;
  }
  if (action === 'bz') state.horse3Bz.cooldownMs = 6_000;
  if (action === 'tmaoyi') state.horse4Tmaoyi.cooldownMs = 24_000;
}

function success(
  roster: PetRoster,
  pet: PetState,
  target: Readonly<PetSkillTarget>,
  projectile: ProjectileModel | undefined,
  projectiles: readonly ProjectileModel[],
  damage: number,
  mpBefore: number,
  action: string,
): PetSkillCastResult {
  const message = `${pet.displayName} ${action} -> ${target.id}`;
  roster.message = message;
  if (pet.skillState) pet.skillState.lastResult = message;
  return { ok: true, message, pet, target: { ...target }, projectile, projectiles: [...projectiles], damage, mpBefore, mpAfter: pet.mp };
}

function failure(roster: PetRoster, message: string, pet?: PetState): PetSkillCastResult {
  roster.message = message;
  if (pet?.skillState) pet.skillState.lastResult = message;
  return { ok: false, message, pet };
}

function getActiveHorse(roster: PetRoster): PetState | undefined {
  const pet = getActivePet(roster);
  return pet?.species === 'horse' && isHorseForm(pet.form) ? pet : undefined;
}

function getFrozenForm(form: HorseForm): FrozenForm {
  const frozen = horseFamilyTruth.forms[form - 1];
  if (!frozen || frozen.id !== `horse${form}`) throw new Error(`Missing frozen horse${form} truth.`);
  return frozen;
}

function parseDirectionalOffset(value: string): number {
  const match = /direction \* (\d+)/u.exec(value);
  return match ? Number(match[1]) : 0;
}

function hitIntervalFor(hit: string): number {
  return ({ hit1: 999, hit2: 24, hit3: 21, hit4: 12, hit5_1: 20, hit5_2: 12 } as const)[hit as 'hit1'] ?? 999;
}

function containsPoint(
  hitbox: Readonly<{ x: number; y: number; width: number; height: number }>,
  point: Readonly<{ x: number; y: number }>,
): boolean {
  return point.x >= hitbox.x && point.x <= hitbox.x + hitbox.width
    && point.y >= hitbox.y && point.y <= hitbox.y + hitbox.height;
}

function isHorseForm(form: number): form is HorseForm {
  return Number.isInteger(form) && form >= 1 && form <= 4;
}

function assertVerifiedTruth(): void {
  if (horseFamilyTruth.truthId !== 'task-settings-209.pet-horse-family'
    || horseFamilyTruth.status !== 'verified'
    || horseFamilyTruth.forms.length !== 4
    || horseFamilyTruth.completeness.unresolved.length > 0) {
    throw new Error('Horse combat requires the verified TASK-SETTINGS-209 truth with unresolved=[].');
  }
}
