import { PetSkillEffectKeys } from '../assets/AssetManifest';
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
} from './PetTypes';
import {
  resolveStage1PetHit,
  type Stage1CombatEnemy,
  type Stage1CombatRuntime,
} from './Stage1CombatSystem';
import type { DamageEvent } from './CombatSystem';
import type { PlayerSlot } from './InputSystem';

type MonkeyForm = 1 | 2 | 3 | 4;

const normalByForm: Readonly<Record<MonkeyForm, Readonly<{
  variant: ProjectileVariant;
  assetKey: string;
  sourceSymbol: string;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
  hitFrame: number;
}>>> = {
  1: { variant: 'pet-monkey1-normal', assetKey: PetSkillEffectKeys.monkey1Normal, sourceSymbol: 'PetMonkey1Bullet1', offsetX: 45, offsetY: -25, width: 31.05, height: 29.95, hitFrame: 10 },
  2: { variant: 'pet-monkey2-normal', assetKey: PetSkillEffectKeys.monkey2Normal, sourceSymbol: 'PetMonkey2Bullet1', offsetX: 65, offsetY: -30, width: 35, height: 69.95, hitFrame: 8 },
  3: { variant: 'pet-monkey3-normal', assetKey: PetSkillEffectKeys.monkey3Normal, sourceSymbol: 'PetMonkey3Bullet1', offsetX: 100, offsetY: -40, width: 49.95, height: 99.95, hitFrame: 8 },
  4: { variant: 'pet-monkey4-normal', assetKey: PetSkillEffectKeys.monkey4Normal, sourceSymbol: 'PetMonkey3Bullet1', offsetX: 100, offsetY: -40, width: 49.95, height: 99.95, hitFrame: 8 },
};

export function requestPetMonkeyBasicAttack(params: Readonly<{
  roster: PetRoster;
  runtime: PetRuntimeModel;
  target: Readonly<PetSkillTarget>;
  projectiles: ProjectileSystemModel;
  random?: PetSkillRandomSource;
}>): PetSkillCastResult {
  const pet = getActivePet(params.roster);
  if (!pet || pet.species !== 'monkey' || !isMonkeyForm(pet.form)) {
    return { ok: false, message: 'No active monkey for basic attack' };
  }
  const definition = normalByForm[pet.form];
  const crit = (params.random?.() ?? 1) <= pet.critBonusRate ? 2 : 1;
  const flowerRate = pet.magicFlowerBuff?.attackMultiplier ?? 1;
  const damage = pet.atk * flowerRate * crit * (1 + pet.skillDamageBonus);
  const tuning: ProjectileTuning = {
    actionName: 'hit1',
    assetKey: definition.assetKey,
    sourceSymbol: definition.sourceSymbol,
    runtimeName: definition.sourceSymbol,
    offsetX: definition.offsetX,
    offsetY: definition.offsetY,
    speedX: 0,
    speedY: 0,
    distance: undefined,
    width: definition.width,
    height: definition.height,
    lifetimeMs: Math.max(420, definition.hitFrame * (1000 / 24) + 80),
    damage,
    attackKind: 'magic',
    knockbackX: 2,
    knockbackY: -2,
    hitIntervalFrames: definition.hitFrame,
    maxHits: 1,
  };
  const projectile = spawnProjectileFromTuning(
    params.projectiles,
    {
      sourceId: pet.id,
      x: params.runtime.x,
      y: params.runtime.y,
      facingX: params.target.x < params.runtime.x ? -1 : 1,
    },
    definition.variant,
    `monkey${pet.form}-normal`,
    tuning,
  );
  projectile.destroyWhenSourceHurt = false;
  projectile.trackingTargetId = params.target.id;
  params.projectiles.projectiles.push(projectile);
  return {
    ok: true,
    message: `${pet.displayName} normal -> ${params.target.id} ${damage.toFixed(1)}`,
    pet,
    target: { ...params.target },
    projectile,
    damage,
    mpBefore: pet.mp,
    mpAfter: pet.mp,
  };
}

export function resolveFormalPetMonkeyProjectileHits(params: Readonly<{
  projectiles: ProjectileSystemModel;
  combat: Stage1CombatRuntime;
  enemies: readonly Stage1CombatEnemy[];
  ownerSlotForPet: (petId: string) => PlayerSlot | undefined;
  timeMs: number;
}>): readonly DamageEvent[] {
  const events: DamageEvent[] = [];
  for (const projectile of params.projectiles.projectiles) {
    if (!projectile.variant.startsWith('pet-monkey') || projectile.isExpired) continue;
    if (!isAtVerifiedHitFrame(projectile) || projectile.remainingHits <= 0) continue;
    const ownerSlot = params.ownerSlotForPet(projectile.sourceId);
    if (!ownerSlot) continue;
    const hitbox = getProjectileHitbox(projectile);
    for (const enemy of params.enemies) {
      if (enemy.phase === 'dead' || !containsPoint(hitbox, enemy)) continue;
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
      recordProjectileHit(projectile);
      events.push(event);
    }
  }
  return events;
}

export function isMonkeyProjectile(projectile: Pick<ProjectileModel, 'variant'>): boolean {
  return projectile.variant.startsWith('pet-monkey');
}

function containsPoint(
  hitbox: Readonly<{ x: number; y: number; width: number; height: number }>,
  point: Readonly<{ x: number; y: number }>,
): boolean {
  return point.x >= hitbox.x
    && point.x <= hitbox.x + hitbox.width
    && point.y >= hitbox.y
    && point.y <= hitbox.y + hitbox.height;
}

function isMonkeyForm(form: number): form is MonkeyForm {
  return Number.isInteger(form) && form >= 1 && form <= 4;
}

function isAtVerifiedHitFrame(projectile: ProjectileModel): boolean {
  const hitFrameByVariant: Readonly<Record<string, number>> = {
    'pet-monkey1-normal': 10,
    'pet-monkey2-normal': 8,
    'pet-monkey3-normal': 8,
    'pet-monkey4-normal': 8,
    'pet-monkey1-xj': 11,
    'pet-monkey2-lj': 1,
    'pet-monkey2-xj': 10,
    'pet-monkey3-lyq': 2,
    'pet-monkey3-xj': 10,
    'pet-monkey3-lj': 1,
    'pet-monkey4-jgaoyi': 5,
  };
  const hitFrame = hitFrameByVariant[projectile.variant];
  return hitFrame !== undefined && projectile.elapsedMs >= hitFrame * (1000 / 24);
}
