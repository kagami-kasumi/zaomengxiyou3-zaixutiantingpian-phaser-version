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
import { lockHeroMovementForSkill } from './HeroMovementSystem';
import type { HeroNormalAttackModel } from './HeroNormalAttackSystem';
import type { PlayerInputState } from './InputSystem';
import type { AllSkillName } from './SkillUISystem';
import {
  spawnRole2ShadowXbzProjectile,
  spawnRole2XbzProjectile,
} from './Role2XbzSkillSystem';
import {
  applyRole2Myhc,
  applyRole2Tjgl,
  spawnRole2SupportEffect,
  type Role2SupportTarget,
} from './Role2SupportSkillSystem';
import {
  applyRole2JgzControl,
  consumeRole2NextDamageMultiplier,
  spawnRole2JgzEffect,
  type Role2ControlTarget,
} from './Role2ControlSkillSystem';
import {
  createRole2SkillRuntime,
  type Role2SkillRuntimeModel,
} from './Role2SkillRuntimeSystem';
import { startRole2Jhsj } from './Role2JhsjSkillSystem';
import { castRole2Shy } from './Role2ShadowSkillSystem';
import { getRole2SjtDamageMultiplier } from './Role2PassiveSkillSystem';
import {
  createRole3SkillRuntime,
  type Role3SkillRuntimeModel,
} from './Role3DefenseSkillSystem';
import {
  createRole1SkillRuntime,
  type Role1SkillRuntimeModel,
} from './Role1BasicSkillSystem';
import {
  createRole4PoisonSkillRuntime,
  type Role4PoisonSkillRuntime,
} from './Role4PoisonSkillSystem';
import {
  createRole4VoodooDollRuntime,
  type Role4VoodooDollRuntime,
} from './Role4VoodooDollSystem';
import {
  createRole4PoisonChainRuntime,
  type Role4PoisonChainRuntime,
} from './Role4PoisonChainSystem';
import {
  createRole4MobilitySkillRuntime,
  type Role4MobilitySkillRuntime,
} from './Role4MobilitySkillSystem';
import {
  createRole4FinisherSkillRuntime,
  type Role4FinisherSkillRuntime,
} from './Role4FinisherSkillSystem';

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

export type HeroSkillActionName =
  | 'hit3' | 'hit4' | 'hit4_1' | 'hit4_2' | 'hit5'
  | 'hit6' | 'hit7' | 'hit8' | 'hit9' | 'hit10' | 'hit11' | 'hit12';

export type ActiveHeroSkillAction = {
  skillName: SkillName;
  slotIndex: number;
  actionName: HeroSkillActionName;
  projectileId: number;
  damageMultiplier?: number;
};

export type HeroSkillModel = {
  mp: number;
  maxMp: number;
  loadout: HeroSkillLoadout;
  activeAction?: ActiveHeroSkillAction;
  lastResult: string;
  learnedRole2Skills: {
    blbLevel: number;
    sjtLevel: number;
    shyLevel: number;
  };
  role2Runtime: Role2SkillRuntimeModel;
  role1Runtime: Role1SkillRuntimeModel;
  role3Runtime: Role3SkillRuntimeModel;
  role4Runtime: Role4PoisonSkillRuntime;
  role4VoodooRuntime: Role4VoodooDollRuntime;
  role4PoisonChainRuntime: Role4PoisonChainRuntime;
  role4MobilityRuntime: Role4MobilitySkillRuntime;
  role4FinisherRuntime: Role4FinisherSkillRuntime;
  isGxp: boolean;
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
  xbzFactor: 0.65,
  myhcFactor: 1.2,
  jgzFactor: 0.6,
  tjglFactor: 1,
  jhsjFactor: 1.1,
  shyFactor: 0.55,
} as const;

export function createTestRole2SkillLoadout(): HeroSkillLoadout {
  return {
    slots: [
      { skillName: 'sgq', level: 1 },
      { skillName: 'smb', level: 1 },
      { skillName: 'xbz', level: 1 },
      null,
      null,
    ],
  };
}

export function createTestRole1SkillLoadout(): HeroSkillLoadout {
  return {
    slots: [
      { skillName: 'slz', level: 1 },
      null,
      null,
      null,
      null,
    ],
  };
}

export function createTestRole3SkillLoadout(): HeroSkillLoadout {
  return {
    slots: [
      { skillName: 'dj', level: 1 },
      { skillName: 'sd', level: 1 },
      { skillName: 'zznh', level: 1 },
      { skillName: 'syzq', level: 1 },
      { skillName: 'ssp', level: 1 },
    ],
  };
}

export function createTestRole4SkillLoadout(): HeroSkillLoadout {
  return {
    slots: [
      { skillName: 'qlj', level: 1 },
      { skillName: 'tkj', level: 1 },
      { skillName: 'dzj', level: 1 },
      { skillName: 'mbyj', level: 1 },
      { skillName: 'wdww', level: 1 },
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
    learnedRole2Skills: { blbLevel: 0, sjtLevel: 0, shyLevel: 0 },
    role2Runtime: createRole2SkillRuntime(),
    role1Runtime: createRole1SkillRuntime(),
    role3Runtime: createRole3SkillRuntime(),
    role4Runtime: createRole4PoisonSkillRuntime(),
    role4VoodooRuntime: createRole4VoodooDollRuntime(),
    role4PoisonChainRuntime: createRole4PoisonChainRuntime(),
    role4MobilityRuntime: createRole4MobilitySkillRuntime(),
    role4FinisherRuntime: createRole4FinisherSkillRuntime(),
    isGxp: false,
  };
}

export function resetHeroSkill(model: HeroSkillModel): void {
  model.mp = model.maxMp;
  model.activeAction = undefined;
  model.lastResult = 'ready';
  model.role2Runtime = createRole2SkillRuntime();
  model.role1Runtime = createRole1SkillRuntime();
  model.role3Runtime = createRole3SkillRuntime();
  model.role4Runtime = createRole4PoisonSkillRuntime();
  model.role4VoodooRuntime = createRole4VoodooDollRuntime();
  model.role4PoisonChainRuntime = createRole4PoisonChainRuntime();
  model.role4MobilityRuntime = createRole4MobilitySkillRuntime();
  model.role4FinisherRuntime = createRole4FinisherSkillRuntime();
}

export function getSkillMpCost(binding: SkillBinding): number {
  const levelIndex = Math.min(
    Math.max(Math.floor(binding.level), 1),
    Role2SkillTuning.consumeMpByLevel.length,
  ) - 1;
  const baseCost = Role2SkillTuning.consumeMpByLevel[levelIndex];
  const factorBySkill: Partial<Record<SkillName, number>> = {
    sgq: Role2SkillTuning.sgqFactor,
    smb: Role2SkillTuning.smbFactor,
    xbz: Role2SkillTuning.xbzFactor,
    myhc: Role2SkillTuning.myhcFactor,
    jgz: Role2SkillTuning.jgzFactor,
    tjgl: Role2SkillTuning.tjglFactor,
    jhsj: Role2SkillTuning.jhsjFactor,
    shy: Role2SkillTuning.shyFactor,
  };
  const factor = factorBySkill[binding.skillName] ?? Role2SkillTuning.smbFactor;

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
  sourcePower: number;
  supportTargets?: readonly Role2SupportTarget[];
  controlTargets?: readonly Role2ControlTarget[];
  timeMs?: number;
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

  if (binding.skillName === 'shy' && params.skill.role2Runtime.shadow) {
    return castRole2ShySkill(params, binding, requestedSlot, 0);
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
  if (binding.skillName === 'xbz') {
    return castRole2Xbz(params, binding, requestedSlot, mpCost);
  }
  if (binding.skillName === 'myhc') {
    return castRole2Myhc(params, binding, requestedSlot, mpCost);
  }
  if (binding.skillName === 'jgz') {
    return castRole2Jgz(params, binding, requestedSlot, mpCost);
  }
  if (binding.skillName === 'tjgl') {
    return castRole2Tjgl(params, binding, requestedSlot, mpCost);
  }
  if (binding.skillName === 'jhsj') {
    return castRole2Jhsj(params, binding, requestedSlot, mpCost);
  }
  if (binding.skillName === 'shy') {
    return castRole2ShySkill(params, binding, requestedSlot, mpCost);
  }
  if (binding.skillName === 'blb' || binding.skillName === 'sjt') {
    params.skill.lastResult = `slot ${requestedSlot}: ${binding.skillName} is passive`;
    return undefined;
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
  projectile.damage *= activeAction.damageMultiplier ?? 1;
  params.skill.activeAction = {
    skillName: binding.skillName,
    slotIndex: requestedSlot,
    actionName: 'hit4_2',
    projectileId: projectile.id,
    damageMultiplier: activeAction.damageMultiplier,
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

function castRole2Xbz(
  params: {
    skill: HeroSkillModel;
    movement: HeroMovementModel;
    combat: HeroCombatModel;
    projectiles: ProjectileSystemModel;
    sourcePower: number;
    timeMs?: number;
  },
  binding: SkillBinding,
  slotIndex: number,
  mpCost: number,
): HeroSkillCastEvent {
  const mpBefore = params.skill.mp;
  const damageMultiplier = takeRole2DamageMultiplier(params.skill);
  lockHeroMovementForSkill(params.movement, params.timeMs ?? 0, 900, true);
  const projectile = spawnRole2XbzProjectile(
    params.projectiles,
    {
      sourceId: params.combat.id,
      x: params.movement.x,
      y: params.movement.y,
      facingX: params.movement.facingX,
    },
    binding.level,
    params.sourcePower,
  );
  projectile.damage *= damageMultiplier;
  const shadow = params.skill.role2Runtime.shadow;
  if (shadow) {
    const shadowProjectile = spawnRole2ShadowXbzProjectile(
      params.projectiles,
      { sourceId: shadow.id, x: shadow.x, y: shadow.y, facingX: shadow.facingX },
      params.skill.learnedRole2Skills.shyLevel,
      params.sourcePower,
      damageMultiplier,
    );
    params.skill.role2Runtime.spawnedProjectiles.push(shadowProjectile);
  }
  params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  params.skill.activeAction = {
    skillName: binding.skillName,
    slotIndex,
    actionName: 'hit3',
    projectileId: projectile.id,
  };
  params.skill.lastResult = `slot ${slotIndex}: xbz hit3 mp ${params.skill.mp}/${params.skill.maxMp}`;

  return {
    skillName: binding.skillName,
    slotIndex,
    actionName: 'hit3',
    projectile,
    mpBefore,
    mpAfter: params.skill.mp,
    mpCost,
    reentered: false,
  };
}

function castRole2Myhc(
  params: Role2CastParams,
  binding: SkillBinding,
  slotIndex: number,
  mpCost: number,
): HeroSkillCastEvent {
  lockHeroMovementForSkill(params.movement, params.timeMs ?? 0, 720, true);
  const projectile = spawnRole2SupportEffect(params.projectiles, spawnPoint(params), 'myhc');
  applyRole2Myhc({
    runtime: params.skill.role2Runtime,
    centerX: projectile.x,
    centerY: projectile.y,
    level: binding.level,
    casterMaxHp: params.combat.maxHp,
    targets: params.supportTargets ?? [],
  });
  const shadow = params.skill.role2Runtime.shadow;
  if (shadow) {
    const shadowProjectile = spawnRole2SupportEffect(
      params.projectiles,
      { sourceId: shadow.id, x: shadow.x, y: shadow.y, facingX: shadow.facingX },
      'myhc',
      true,
    );
    applyRole2Myhc({
      runtime: params.skill.role2Runtime,
      centerX: shadowProjectile.x,
      centerY: shadowProjectile.y,
      level: binding.level,
      casterMaxHp: params.combat.maxHp,
      targets: params.supportTargets ?? [],
    });
    params.skill.role2Runtime.spawnedProjectiles.push(shadowProjectile);
  }
  return finishRole2Cast(params, binding, slotIndex, mpCost, 'hit6', projectile);
}

function castRole2Jgz(
  params: Role2CastParams,
  binding: SkillBinding,
  slotIndex: number,
  mpCost: number,
): HeroSkillCastEvent {
  lockHeroMovementForSkill(params.movement, params.timeMs ?? 0, 1_250, false);
  const projectile = spawnRole2JgzEffect(params.projectiles, spawnPoint(params));
  applyRole2JgzControl({
    runtime: params.skill.role2Runtime,
    casterX: params.movement.x,
    casterY: params.movement.y,
    facingX: params.movement.facingX,
    level: binding.level,
    targets: params.controlTargets ?? [],
  });
  return finishRole2Cast(params, binding, slotIndex, mpCost, 'hit7', projectile);
}

function castRole2Tjgl(
  params: Role2CastParams,
  binding: SkillBinding,
  slotIndex: number,
  mpCost: number,
): HeroSkillCastEvent {
  lockHeroMovementForSkill(params.movement, params.timeMs ?? 0, 900, true);
  const projectile = spawnRole2SupportEffect(params.projectiles, spawnPoint(params), 'tjgl');
  applyRole2Tjgl({
    centerX: projectile.x,
    centerY: projectile.y,
    level: binding.level,
    isGxp: params.skill.isGxp,
    targets: params.supportTargets ?? [],
    casterCombat: params.combat,
    applyShield: true,
  });
  const shadow = params.skill.role2Runtime.shadow;
  if (shadow) {
    const shadowProjectile = spawnRole2SupportEffect(
      params.projectiles,
      { sourceId: shadow.id, x: shadow.x, y: shadow.y, facingX: shadow.facingX },
      'tjgl',
      true,
    );
    applyRole2Tjgl({
      centerX: shadowProjectile.x,
      centerY: shadowProjectile.y,
      level: params.skill.learnedRole2Skills.shyLevel,
      isGxp: params.skill.isGxp,
      targets: params.supportTargets ?? [],
      applyShield: false,
      coefficientMultiplier: 0.55,
    });
    params.skill.role2Runtime.spawnedProjectiles.push(shadowProjectile);
  }
  return finishRole2Cast(params, binding, slotIndex, mpCost, 'hit8', projectile);
}

function castRole2Jhsj(
  params: Role2CastParams,
  binding: SkillBinding,
  slotIndex: number,
  mpCost: number,
): HeroSkillCastEvent {
  lockHeroMovementForSkill(params.movement, params.timeMs ?? 0, 1_100, true);
  const projectile = startRole2Jhsj({
    runtime: params.skill.role2Runtime,
    system: params.projectiles,
    spawnPoint: spawnPoint(params),
    skillLevel: binding.level,
    shyLevel: params.skill.learnedRole2Skills.shyLevel,
    sourcePower: params.sourcePower,
    damageMultiplier: takeRole2DamageMultiplier(params.skill),
  });
  return finishRole2Cast(params, binding, slotIndex, mpCost, 'hit9', projectile);
}

function castRole2ShySkill(
  params: Role2CastParams,
  binding: SkillBinding,
  slotIndex: number,
  mpCost: number,
): HeroSkillCastEvent {
  params.skill.learnedRole2Skills.shyLevel = binding.level;
  const mpBefore = params.skill.mp;
  const result = castRole2Shy({
    runtime: params.skill.role2Runtime,
    system: params.projectiles,
    spawnPoint: spawnPoint(params),
    movement: params.movement,
  });
  if (result.created) params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  params.skill.lastResult = result.created ? 'shy shadow created' : 'shy shadow recalled';
  return {
    skillName: binding.skillName, slotIndex, actionName: 'hit10', projectile: result.projectile,
    mpBefore, mpAfter: params.skill.mp, mpCost: result.created ? mpCost : 0, reentered: !result.created,
  };
}

type Role2CastParams = {
  skill: HeroSkillModel;
  movement: HeroMovementModel;
  combat: HeroCombatModel;
  projectiles: ProjectileSystemModel;
  sourcePower: number;
  supportTargets?: readonly Role2SupportTarget[];
  controlTargets?: readonly Role2ControlTarget[];
  timeMs?: number;
};

function finishRole2Cast(
  params: Role2CastParams,
  binding: SkillBinding,
  slotIndex: number,
  mpCost: number,
  actionName: HeroSkillActionName,
  projectile: ProjectileModel,
): HeroSkillCastEvent {
  const mpBefore = params.skill.mp;
  params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  params.skill.activeAction = { skillName: binding.skillName, slotIndex, actionName, projectileId: projectile.id };
  params.skill.lastResult = `slot ${slotIndex}: ${binding.skillName} ${actionName} mp ${params.skill.mp}/${params.skill.maxMp}`;
  return { skillName: binding.skillName, slotIndex, actionName, projectile, mpBefore, mpAfter: params.skill.mp, mpCost, reentered: false };
}

function spawnPoint(params: Pick<Role2CastParams, 'combat' | 'movement'>): ProjectileSpawnPoint {
  return { sourceId: params.combat.id, x: params.movement.x, y: params.movement.y, facingX: params.movement.facingX };
}

function takeRole2DamageMultiplier(skill: HeroSkillModel): number {
  return getRole2SjtDamageMultiplier(skill.learnedRole2Skills.sjtLevel) *
    consumeRole2NextDamageMultiplier(skill.role2Runtime);
}

export function takeRole2NormalAttackExtraMultiplier(skill: HeroSkillModel): number {
  return consumeRole2NextDamageMultiplier(skill.role2Runtime);
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
  const damageMultiplier = takeRole2DamageMultiplier(params.skill);
  projectile.damage *= damageMultiplier;

  params.skill.mp = Math.max(0, params.skill.mp - mpCost);
  params.skill.activeAction = {
    skillName: binding.skillName,
    slotIndex,
    actionName,
    projectileId: projectile.id,
    damageMultiplier,
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
