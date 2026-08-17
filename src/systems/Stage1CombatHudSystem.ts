import type { PlayerSlot } from './InputSystem';
import { ProgressionTuning } from './ProgressionSystem';
import type { HeroSkillModel } from './HeroSkillSystem';
import type { HeroId } from './HeroNormalAttackSystem';
import type { PetState } from './PetTypes';
import { getStage1EnemyConfig, type Stage1CombatEnemy, type Stage1CombatPlayer } from './Stage1CombatSystem';

export type CombatHudSkillBinding = Readonly<{
  skillName: string;
  level: number;
  usableState?: 'ready' | 'active' | 'unavailable';
}>;

export type CombatHudPlayerSource = Readonly<{
  slot: PlayerSlot;
  heroId?: HeroId;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  level: number;
  currentExp: number;
  expToNext: number;
  isMaxLevel: boolean;
  skillBindings: readonly (CombatHudSkillBinding | null)[];
  warriorEnergy?: number;
  magicWeaponAvailable?: boolean;
  pet?: CombatHudPetSnapshot;
}>;

export type CombatHudPetSnapshot = Readonly<{
  id: string;
  nativeHeadName: string;
  level: number;
  hp: number;
  maxHp: number;
  hpText: string;
  hpFrame: number;
  mp: number;
  maxMp: number;
  mpText: string;
  mpFrame: number;
}>;

export type CombatHudSkillSlot = Readonly<{
  binding: CombatHudSkillBinding | null;
  displayKey: string;
  sourceIndex: number;
}>;

export type CombatHudPlayerSnapshot = Readonly<{
  slot: PlayerSlot;
  heroId?: HeroId;
  hp: number;
  maxHp: number;
  hpRatio: number;
  hpText: string;
  mp: number;
  maxMp: number;
  mpRatio: number;
  mpText: string;
  level: number;
  expRatio: number;
  expText: string;
  skillSlots: readonly CombatHudSkillSlot[];
  warriorEnergy?: number;
  specialReady: boolean;
  magicWeaponAvailable: boolean;
  pet?: CombatHudPetSnapshot;
}>;

export type CombatHudEnemySnapshot = Readonly<{
  enemyId: string;
  displayName: string;
  hp: number;
  maxHp: number;
  spawnOrder: number;
  isBoss: boolean;
}>;

export type CombatHudBossBar = {
  enemyId: string;
  displayName: string;
  spawnOrder: number;
  hpRatio: number;
  trailingRatio: number;
  trailingTarget: number;
  trailingRemainingMs: number;
};

export type CombatHudBossRuntime = {
  bars: Map<string, CombatHudBossBar>;
};

const DISPLAY_SOURCE_INDEXES = [0, 2, 3, 4, 1] as const;
const PLAYER_KEYS: Record<PlayerSlot, readonly string[]> = {
  p1: ['Y', 'U', 'I', 'O', 'L'],
  p2: ['8', '4', '5', '6', '3'],
};

export function createCombatHudPlayerSnapshot(
  source: CombatHudPlayerSource,
): CombatHudPlayerSnapshot {
  const isMaxLevel = source.isMaxLevel;
  return {
    slot: source.slot,
    heroId: source.heroId,
    hp: source.hp,
    maxHp: source.maxHp,
    hpRatio: safeRatio(source.hp, source.maxHp),
    hpText: `${integerText(source.hp)}/${integerText(source.maxHp)}`,
    mp: source.mp,
    maxMp: source.maxMp,
    mpRatio: safeRatio(source.mp, source.maxMp),
    mpText: `${integerText(source.mp)}/${integerText(source.maxMp)}`,
    level: Math.max(1, Math.floor(source.level)),
    expRatio: isMaxLevel ? 1 : safeRatio(source.currentExp, source.expToNext),
    expText: isMaxLevel
      ? 'MAX'
      : `${integerText(source.currentExp)}/${integerText(source.expToNext)}`,
    skillSlots: DISPLAY_SOURCE_INDEXES.map((sourceIndex, displayIndex) => ({
      binding: source.skillBindings[sourceIndex] ?? null,
      displayKey: PLAYER_KEYS[source.slot][displayIndex] ?? '',
      sourceIndex,
    })),
    warriorEnergy: source.warriorEnergy,
    specialReady: source.warriorEnergy !== undefined && source.warriorEnergy >= 100,
    magicWeaponAvailable: source.magicWeaponAvailable ?? false,
    pet: source.pet,
  };
}

export function createCombatHudPetSnapshot(pet: PetState | undefined): CombatHudPetSnapshot | undefined {
  if (!pet || !pet.isActive || pet.lifetime <= 0) return undefined;
  return {
    id: pet.id,
    nativeHeadName: `${pet.species}${pet.form}`,
    level: Math.max(1, Math.floor(pet.level)),
    hp: finiteNonNegative(pet.hp),
    maxHp: finiteNonNegative(pet.maxHp),
    hpText: `${integerText(pet.hp)}/${integerText(pet.maxHp)}`,
    hpFrame: petBarFrame(pet.hp, pet.maxHp),
    mp: finiteNonNegative(pet.mp),
    maxMp: finiteNonNegative(pet.maxMp),
    mpText: `${integerText(pet.mp)}/${integerText(pet.maxMp)}`,
    mpFrame: petBarFrame(pet.mp, pet.maxMp),
  };
}

export function createStage1CombatPlayerHudSnapshot(
  player: Stage1CombatPlayer,
  pet?: CombatHudPetSnapshot,
): CombatHudPlayerSnapshot {
  return createCombatHudPlayerSnapshot({
    slot: player.slot,
    heroId: player.normalAttack.heroId,
    hp: player.combat.hp,
    maxHp: player.combat.maxHp,
    mp: player.mp,
    maxMp: player.maxMp,
    level: player.progression.level,
    currentExp: player.progression.currentExp,
    expToNext: player.progression.expToNext,
    isMaxLevel: player.progression.level >= ProgressionTuning.maxLevel,
    skillBindings: createCombatHudSkillBindings(player.skill),
    warriorEnergy: player.warriorEnergy,
    pet,
  });
}

export function createCombatHudSkillBindings(
  skill: HeroSkillModel,
): readonly (CombatHudSkillBinding | null)[] {
  return skill.loadout.slots.map((binding, slotIndex) => binding ? {
    ...binding,
    usableState: skill.activeAction
      ? skill.activeAction.slotIndex === slotIndex ? 'active' : 'unavailable'
      : 'ready',
  } : null);
}

export function createStage1CombatEnemyHudSnapshot(
  enemy: Stage1CombatEnemy,
  spawnOrder: number,
): CombatHudEnemySnapshot {
  const config = getStage1EnemyConfig(enemy.enemyType);
  return {
    enemyId: enemy.id,
    displayName: config.displayName,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    spawnOrder,
    isBoss: config.isBoss,
  };
}

export function createCombatHudBossRuntime(): CombatHudBossRuntime {
  return { bars: new Map() };
}

export function updateCombatHudBossRuntime(
  runtime: CombatHudBossRuntime,
  enemies: readonly CombatHudEnemySnapshot[],
  deltaMs: number,
): readonly CombatHudBossBar[] {
  const visibleIds = new Set<string>();
  for (const enemy of enemies) {
    if (!enemy.isBoss) continue;
    visibleIds.add(enemy.enemyId);
    const hpRatio = safeRatio(enemy.hp, enemy.maxHp);
    const current = runtime.bars.get(enemy.enemyId);
    if (!current) {
      runtime.bars.set(enemy.enemyId, {
        enemyId: enemy.enemyId,
        displayName: enemy.displayName,
        spawnOrder: enemy.spawnOrder,
        hpRatio,
        trailingRatio: hpRatio,
        trailingTarget: hpRatio,
        trailingRemainingMs: 0,
      });
      continue;
    }
    current.displayName = enemy.displayName;
    current.spawnOrder = enemy.spawnOrder;
    if (current.trailingTarget !== hpRatio) {
      current.trailingTarget = hpRatio;
      current.trailingRemainingMs = 800;
    }
    current.hpRatio = hpRatio;
    const progress = current.trailingRemainingMs <= 0
      ? 1
      : Math.min(1, Math.max(0, deltaMs) / current.trailingRemainingMs);
    current.trailingRatio = approachLinear(current.trailingRatio, hpRatio, progress);
    current.trailingRemainingMs = Math.max(0, current.trailingRemainingMs - Math.max(0, deltaMs));
  }

  for (const enemyId of runtime.bars.keys()) {
    if (!visibleIds.has(enemyId)) runtime.bars.delete(enemyId);
  }

  return [...runtime.bars.values()].sort((left, right) =>
    left.spawnOrder - right.spawnOrder || left.enemyId.localeCompare(right.enemyId));
}

export function clearCombatHudBossRuntime(runtime: CombatHudBossRuntime): void {
  runtime.bars.clear();
}

function safeRatio(current: number, maximum: number): number {
  if (!Number.isFinite(current) || !Number.isFinite(maximum) || maximum <= 0) return 0;
  return Math.min(1, Math.max(0, current / maximum));
}

function integerText(value: number): string {
  return String(Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0);
}

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function petBarFrame(current: number, maximum: number): number {
  return Math.max(1, 25 - Math.round(25 * safeRatio(current, maximum)));
}

function approachLinear(current: number, target: number, progress: number): number {
  const step = Math.min(1, Math.max(0, progress));
  return current + (target - current) * step;
}
