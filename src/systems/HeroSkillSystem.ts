import {
  findRole2SmbFirstStageProjectile,
  hasActiveProjectileForSource,
  spawnRole2SgqProjectile,
  spawnRole2SmbFirstStageProjectile,
  spawnRole2SmbSecondStageProjectile,
  type ProjectileModel,
  type ProjectileSpawnPoint,
  type ProjectileSystemModel,
} from './ProjectileSystem';
import type { HeroCombatModel } from './HeroCombatSystem';
import type { HeroMovementModel } from './HeroMovementSystem';
import type { HeroNormalAttackModel } from './HeroNormalAttackSystem';
import type { PlayerInputState } from './InputSystem';
import type { AllSkillName } from './SkillUISystem';

export type SkillName = AllSkillName;

export type SkillBinding = {
  skillName: SkillName;
  level: number;
};

export type HeroSkillLoadout = {
  slots: readonly [
    SkillBinding | null,
    SkillBinding | null,
    SkillBinding | null,
    SkillBinding | null,
    SkillBinding | null,
  ];
};

export type HeroSkillActionName = 'hit5' | 'hit4_1' | 'hit4_2';

export type ActiveHeroSkillAction = {
  skillName: SkillName;
  slotIndex: number;
  actionName: HeroSkillActionName;
  projectileId: number;
};

export type HeroSkillModel = {
  mp: number;
  maxMp: number;
  loadout: HeroSkillLoadout;
  activeAction?: ActiveHeroSkillAction;
  lastResult: string;
};

export type HeroSkillCastEvent = {
  skillName: SkillName;
  slotIndex: number;
  actionName: HeroSkillActionName;
  projectile: ProjectileModel;
  mpBefore: number;
  mpAfter: number;
  mpCost: number;
  reentered: boolean;
};

export const Role2SkillTuning = {
  maxMp: 160,
  consumeMpByLevel: [
    66, 160, 208, 276, 364, 493, 703, 759, 801,
    921, 1085, 1133, 1318, 1771, 1884, 1954, 2320, 2667,
  ],
  role2MpScale: 35173 / 25958,
  sgqFactor: 0.55,
  smbFactor: 1.2,
} as const;

export function createTestRole2SkillLoadout(): HeroSkillLoadout {
  return {
    slots: [
      { skillName: 'sgq', level: 1 },
      { skillName: 'smb', level: 1 },
      null,
      null,
      null,
    ],
  };
}

export function createHeroSkillModel(
  loadout: HeroSkillLoadout = createTestRole2SkillLoadout(),
  maxMp: number = Role2SkillTuning.maxMp,
): HeroSkillModel {
  return {
    mp: maxMp,
    maxMp,
    loadout,
    lastResult: 'ready',
  };
}

export function resetHeroSkill(model: HeroSkillModel): void {
  model.mp = model.maxMp;
  model.activeAction = undefined;
  model.lastResult = 'ready';
}

export function getSkillMpCost(binding: SkillBinding): number {
  const levelIndex = Math.min(
    Math.max(Math.floor(binding.level), 1),
    Role2SkillTuning.consumeMpByLevel.length,
  ) - 1;
  const baseCost = Role2SkillTuning.consumeMpByLevel[levelIndex];
  const factor = binding.skillName === 'sgq'
    ? Role2SkillTuning.sgqFactor
    : Role2SkillTuning.smbFactor;

  return Math.floor(baseCost * factor * Role2SkillTuning.role2MpScale);
}

export function requestRole2SkillFromInput(params: {
  skill: HeroSkillModel;
  input: PlayerInputState;
  previousInput: PlayerInputState | undefined;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
  projectiles: ProjectileSystemModel;
}): HeroSkillCastEvent | undefined {
  const requestedSlot = findJustPressedSkillSlot(params.input, params.previousInput);
  syncActiveSkillAction(params.skill, params.projectiles);

  if (requestedSlot === undefined) {
    return undefined;
  }

  const binding = params.skill.loadout.slots[requestedSlot] ?? null;
  if (!binding) {
    params.skill.lastResult = `slot ${requestedSlot}: empty`;
    return undefined;
  }

  if (binding.skillName === 'smb') {
    const reentry = tryCastRole2SmbSecondStage(params, binding, requestedSlot);
    if (reentry) {
      return reentry;
    }
  }

  if (params.combat.state !== 'ready') {
    params.skill.lastResult = `slot ${requestedSlot}: blocked by ${params.combat.state}`;
    return undefined;
  }

  if (params.normalAttack.activeAttack || params.skill.activeAction) {
    params.skill.lastResult = `slot ${requestedSlot}: attacking`;
    return undefined;
  }

  if (hasActiveProjectileForSource(params.projectiles, params.combat.id)) {
    params.skill.lastResult = `slot ${requestedSlot}: projectile active`;
    return undefined;
  }

  if (binding.skillName === 'smb' && !params.movement.grounded) {
    params.skill.lastResult = `slot ${requestedSlot}: smb requires ground`;
    return undefined;
  }

  const mpCost = getSkillMpCost(binding);
  if (params.skill.mp < mpCost) {
    params.skill.lastResult = `slot ${requestedSlot}: mp ${params.skill.mp}/${mpCost}`;
    return undefined;
  }

  if (binding.skillName === 'sgq') {
    return castRole2Sgq(params, binding, requestedSlot, mpCost);
  }
  if (binding.skillName === 'smb') {
    return castRole2SmbFirstStage(params, binding, requestedSlot, mpCost);
  }
  params.skill.lastResult = `slot ${requestedSlot}: ${binding.skillName} not implemented`;
  return undefined;
}

function tryCastRole2SmbSecondStage(
  params: {
    skill: HeroSkillModel;
    projectiles: ProjectileSystemModel;
    combat: HeroCombatModel;
  },
  binding: SkillBinding,
  requestedSlot: number,
): HeroSkillCastEvent | undefined {
  const activeAction = params.skill.activeAction;
  if (
    !activeAction ||
    activeAction.skillName !== 'smb' ||
    activeAction.slotIndex !== requestedSlot ||
    activeAction.actionName !== 'hit4_1'
  ) {
    return undefined;
  }

  const firstStageProjectile = findRole2SmbFirstStageProjectile(
    params.projectiles,
    params.combat.id,
  );
  if (!firstStageProjectile) {
    params.skill.lastResult = `slot ${requestedSlot}: smb first stage missing`;
    return undefined;
  }

  if (params.combat.state !== 'ready') {
    params.skill.lastResult = `slot ${requestedSlot}: blocked by ${params.combat.state}`;
    return undefined;
  }

  const mpBefore = params.skill.mp;
  const projectile = spawnRole2SmbSecondStageProjectile(
    params.projectiles,
    firstStageProjectile,
  );
  params.skill.activeAction = {
    skillName: binding.skillName,
    slotIndex: requestedSlot,
    actionName: 'hit4_2',
    projectileId: projectile.id,
  };
  params.skill.lastResult = `slot ${requestedSlot}: smb hit4_2 mp ${params.skill.mp}/${params.skill.maxMp}`;

  return {
    skillName: binding.skillName,
    slotIndex: requestedSlot,
    actionName: 'hit4_2',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost: 0,
    reentered: true,
  };
}

function castRole2Sgq(
  params: {
    skill: HeroSkillModel;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
  },
  binding: SkillBinding,
  slotIndex: number,
  mpCost: number,
): HeroSkillCastEvent {
  return castRole2ProjectileSkill(
    params,
    binding,
    slotIndex,
    mpCost,
    'hit5',
    spawnRole2SgqProjectile,
  );
}

function castRole2SmbFirstStage(
  params: {
    skill: HeroSkillModel;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
  },
  binding: SkillBinding,
  slotIndex: number,
  mpCost: number,
): HeroSkillCastEvent {
  return castRole2ProjectileSkill(
    params,
    binding,
    slotIndex,
    mpCost,
    'hit4_1',
    spawnRole2SmbFirstStageProjectile,
  );
}

function castRole2ProjectileSkill(
  params: {
    skill: HeroSkillModel;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
  },
  binding: SkillBinding,
  slotIndex: number,
  mpCost: number,
  actionName: HeroSkillActionName,
  spawnProjectile: (
    system: ProjectileSystemModel,
    spawnPoint: ProjectileSpawnPoint,
  ) => ProjectileModel,
): HeroSkillCastEvent {
  const mpBefore = params.skill.mp;
  const spawnPoint = {
    sourceId: params.combat.id,
    x: params.movement.x,
    y: params.movement.y,
    facingX: params.movement.facingX,
  } as const;
  const projectile = spawnProjectile(params.projectiles, spawnPoint);

  params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  params.skill.activeAction = {
    skillName: binding.skillName,
    slotIndex,
    actionName,
    projectileId: projectile.id,
  };
  params.skill.lastResult = `slot ${slotIndex}: ${binding.skillName} ${actionName} mp ${params.skill.mp}/${params.skill.maxMp}`;

  return {
    skillName: binding.skillName,
    slotIndex,
    actionName,
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function syncActiveSkillAction(
  skill: HeroSkillModel,
  projectiles: ProjectileSystemModel,
): void {
  const activeAction = skill.activeAction;
  if (!activeAction) {
    return;
  }

  const projectileStillActive = projectiles.projectiles.some((projectile) =>
    projectile.id === activeAction.projectileId && !projectile.isExpired
  );
  if (!projectileStillActive) {
    skill.activeAction = undefined;
  }
}

function findJustPressedSkillSlot(
  input: PlayerInputState,
  previousInput: PlayerInputState | undefined,
): number | undefined {
  for (let slot = 0; slot < input.skillSlots.length; slot += 1) {
    const isPressed = input.skillSlots[slot] ?? false;
    const wasPressed = previousInput?.skillSlots[slot] ?? false;
    if (isPressed && !wasPressed) {
      return slot;
    }
  }

  return undefined;
}
