import type { MonsterExperienceBinding } from './MonsterExperienceSystem';
import type { MonsterKnockbackBinding } from './MonsterKnockbackBinding';
import type { MonsterPetTargetEffectState } from './MonsterPetTargetEffectSystem';
import type { AttackKind } from './CombatSystem';
import type { PlayerSlot } from './InputSystem';

export type Monster30State = 'wait' | 'walk' | 'hurt' | 'hit1' | 'dead' | 'removed';

export type Monster30Target = {
  slot: PlayerSlot;
  x: number;
  y: number;
};

export type Monster30Model = {
  attackRuntime?: import('./Monster30AttackRuntime').Monster30AttackRuntime;
  experienceBinding?: MonsterExperienceBinding;
  petKnockback?: MonsterKnockbackBinding;
  petTargetEffectState?: MonsterPetTargetEffectState;
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  experience: number;
  experienceAwardedTo?: PlayerSlot;
  state: Monster30State;
  facingX: -1 | 1;
  targetSlot?: PlayerSlot;
  stateTimerMs: number;
  attackDecisionTimerMs: number;
  attackSerial: number;
  activeAttack?: Monster30ActiveAttack;
  magicFlowerDebuff?: MonsterMagicFlowerDebuff;
  magicFlagDebuff?: MonsterMagicFlagDebuff;
  magicBaguaStun?: MonsterMagicBaguaStun;
  magicZlHummerStun?: MonsterMagicZlHummerStun;
  magicSnowIce?: MonsterMagicSnowIce;
  magicPearlStun?: MonsterMagicPearlStun;
  magicPearlPoison?: MonsterMagicPearlPoison;
  role4MbyjStun?: MonsterRole4MbyjStun;
  petBurn?: MonsterPetBurn;
};

export type MonsterMagicFlowerDebuff = {
  kind: 'magicFlowerDebuff';
  sourceName: string;
  damageMultiplier: number;
  totalMs: number;
  remainingMs: number;
};

export type MonsterMagicFlagDebuff = {
  kind: 'magicFlagDebuff';
  sourceName: string;
  hitMultiplier: number;
  hpDamageRatePerSecond: number;
  totalMs: number;
  remainingMs: number;
  tickCarryMs: number;
  lastTickDamage: number;
};

export type MonsterMagicBaguaStun = {
  kind: 'magicBaguaStun';
  sourceName: string;
  totalMs: number;
  remainingMs: number;
};

export type MonsterMagicZlHummerStun = {
  kind: 'magicZlHummerStun';
  sourceName: string;
  totalMs: number;
  remainingMs: number;
};

export type MonsterMagicSnowIce = {
  kind: 'magicSnowIce';
  sourceName: string;
  totalMs: number;
  remainingMs: number;
};

export type MonsterMagicPearlStun = {
  kind: 'magicPearlStun';
  sourceName: string;
  totalMs: number;
  remainingMs: number;
};

export type MonsterMagicPearlPoison = {
  kind: 'magicPearlPoison';
  sourceName: string;
  damagePerSecond: number;
  totalMs: number;
  remainingMs: number;
  tickCarryMs: number;
  lastTickDamage: number;
};

export type MonsterPetBurn = {
  kind: 'petBurn';
  sourceName: string;
  damagePerSecond: number;
  totalMs: number;
  remainingMs: number;
  tickCarryMs: number;
  lastTickDamage: number;
};

export type MonsterRole4MbyjStun = {
  kind: 'role4MbyjStun';
  sourceName: 'mbyj';
  totalMs: number;
  remainingMs: number;
};

export type Monster30ActiveAttack = {
  id: number;
  attackId: string;
  actionName: 'hit1';
  elapsedMs: number;
  hitboxActiveFromMs: number;
  hitboxActiveUntilMs: number;
  damage: number;
  attackKind: AttackKind;
  knockbackX: number;
  knockbackY: number;
  facingX: -1 | 1;
};

