import type { ProjectileModel } from './ProjectileSystem';

export type PetId = string;

export type PetState = {
  id: PetId;
  species: string;
  form: number;
  displayName: string;
  level: number;
  exp: number;
  expToNext: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  critBonusRate: number;
  skillDamageBonus: number;
  moveSpeed: number;
  lifetime: number;
  quality: number;
  hpQuality: number;
  mpQuality: number;
  atkQuality: number;
  defQuality: number;
  perception: number;
  technique: number;
  warpower: number;
  isActive: boolean;
  skills: string[];
  magicFlowerBuff?: PetMagicFlowerBuff;
  skillState?: PetSkillState;
  autoBuffState?: PetAutoBuffState;
};

export type PetMagicFlowerBuff = {
  kind: 'magicFlowerAddBuff';
  sourceName: string;
  attackMultiplier: number;
  totalMs: number;
  remainingMs: number;
};

export type PetSkillState = {
  monkey1Xj: PetMonkey1XjSkillState;
  monkey2Lj: PetMonkey2LjSkillState;
  monkey2Xj: PetMonkey2XjSkillState;
  monkey3Lyq: PetMonkey3LyqSkillState;
  monkey3Xj: PetMonkey3XjSkillState;
  monkey3Lj: PetMonkey3LjSkillState;
  monkey4Jgaoyi: PetMonkey4JgaoyiSkillState;
  horse1Sp: PetHorse1SpSkillState;
  horse2Bd: PetHorse2BdSkillState;
  horse3Bz: PetHorse3BzSkillState;
  horse4Tmaoyi: PetHorse4TmaoyiSkillState;
  dragon1Fs: PetDragon1FsSkillState;
  dragon2Sdcc: PetDragon2SdccSkillState;
  dragon3Ltwj: PetDragon3LtwjSkillState;
  dragon4Qlaoyi: PetDragon4QlaoyiSkillState;
  turtle1Sld: PetTurtle1SldSkillState;
  turtle2Txlj: PetTurtle2TxljSkillState;
  lastResult: string;
};

export type PetAutoBuffState = {
  sxkb: PetAutoBuffEffectState;
  fsnl: PetAutoBuffEffectState;
  smjc: PetAutoBuffEffectState;
  mfjc: PetAutoBuffEffectState;
  gjjc: PetAutoBuffEffectState;
  fyjc: PetAutoBuffEffectState;
  lastResult: string;
};

export type PetAutoBuffEffectState = {
  counterMs: number;
  active?: PetAutoBuffActiveEffect;
};

export type PetAutoBuffActiveEffect = {
  kind: 'sxkb' | 'fsnl' | 'smjc' | 'mfjc' | 'gjjc' | 'fyjc';
  bonusPower?: number;
  bonusDefense?: number;
  bonusCritRate?: number;
  bonusSkillDamage?: number;
  bonusMaxHp?: number;
  bonusMaxMp?: number;
  totalMs: number;
  remainingMs: number;
};

export type PetAutoBuffOwnerStats = {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  power: number;
  defense: number;
};

export type PetAutoBuffUpdateResult = {
  triggered: boolean;
  expired: boolean;
  message: string;
  pet?: PetState;
  mpBefore?: number;
  mpAfter?: number;
  bonusPower?: number;
  bonusDefense?: number;
  bonusCritRate?: number;
  bonusSkillDamage?: number;
  bonusMaxHp?: number;
  bonusMaxMp?: number;
};

export type PetMonkey1XjSkillState = {
  releaseReady: boolean;
  cooldownMs: number;
};

export type PetMonkey2LjSkillState = {
  cooldownMs: number;
};

export type PetMonkey2XjSkillState = {
  releaseReady: boolean;
  cooldownMs: number;
};

export type PetMonkey3LyqSkillState = {
  cooldownMs: number;
};

export type PetMonkey3XjSkillState = {
  cooldownMs: number;
};

export type PetMonkey3LjSkillState = {
  releaseReady: boolean;
  cooldownMs: number;
};

export type PetMonkey4JgaoyiSkillState = {
  cooldownMs: number;
};

export type PetHorse1SpSkillState = {
  cooldownMs: number;
};

export type PetHorse2BdSkillState = {
  releaseReady: boolean;
  cooldownMs: number;
};

export type PetHorse3BzSkillState = {
  cooldownMs: number;
};

export type PetHorse4TmaoyiSkillState = {
  cooldownMs: number;
};

export type PetDragon1FsSkillState = {
  cooldownMs: number;
  cloneRemainingMs: number;
};

export type PetDragon2SdccSkillState = {
  cooldownMs: number;
  lastHealOnHit: number;
};

export type PetDragon3LtwjSkillState = {
  cooldownMs: number;
  lastHealOnHit: number;
};

export type PetDragon4QlaoyiComboState = {
  cloneCombo: boolean;
  sdccCombo: boolean;
  ltwjCombo: boolean;
};

export type PetDragon4QlaoyiSkillState = {
  cooldownMs: number;
  lastCombo: PetDragon4QlaoyiComboState;
};

export type PetTurtle1SldSkillState = {
  cooldownMs: number;
  lastHeal: number;
  lastOwnerHeal: number;
};

export type PetTurtle2TxljSkillState = {
  cooldownMs: number;
  linkRemainingMs: number;
  lastOwnerDamageRedirect: number;
  lastOwnerDamageAfterRedirect: number;
  lastOwnerHealBoost: number;
  lastPetHeal: number;
};

export type PetRoster = {
  pets: PetState[];
  selectedIndex: number;
  message: string;
};

export type PetRuntimeState = 'idle' | 'follow' | 'warp';

export type PetRuntimeModel = {
  petId: PetId;
  runtimeKey: string;
  x: number;
  y: number;
  facingX: -1 | 1;
  state: PetRuntimeState;
};

export type PetFormChange = {
  fromForm: number;
  toForm: number;
  fromDisplayName: string;
  toDisplayName: string;
  level: number;
};

export type CapturableMonsterId =
  | 'Monster70'
  | 'Monster71'
  | 'Monster72'
  | 'Monster73'
  | 'Monster74'
  | 'Monster75'
  | 'Monster76'
  | 'Monster77'
  | 'Monster78';

export type CapturablePetDefinition = {
  monsterId: CapturableMonsterId;
  petName: string;
  displayName: string;
  species: string;
  form: number;
  probability: number;
};

export type CapturablePetTarget = {
  id: string;
  monsterId: CapturableMonsterId;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  removed: boolean;
  feedback: string;
};

export type MagicBottleEffect = {
  x: number;
  y: number;
  width: number;
  height: number;
  facingX: -1 | 1;
  ageMs: number;
};

export type MagicBottleCaptureModel = {
  equippedFillName: 'xhhl';
  soul: number;
  effect?: MagicBottleEffect;
  lastResult: string;
};

export type PetConsumableFillName = 'wphhd' | 'wpcsd' | 'djyys' | 'cwjnxld';

export type PetConsumableResult = {
  ok: boolean;
  shouldConsume: boolean;
  message: string;
  pet?: PetState;
  experience?: PetExperienceResult;
  skillReset?: PetSkillResetResult;
};

export type PetExperienceResult = {
  expBefore: number;
  expAfter: number;
  levelBefore: number;
  levelAfter: number;
  levelsGained: number;
  formChanges: PetFormChange[];
  expToNext: number;
  appliedExp: number;
};

export type MonsterExperienceShareResult = {
  heroExperience: number;
  petExperience: number;
  petResult?: PetExperienceResult;
};

export type PetOwnerSnapshot = {
  x: number;
  y: number;
  facingX: -1 | 1;
};

export type PetSkillTarget = {
  id: string;
  x: number;
  y: number;
  isAlive: boolean;
};

export type PetSkillCastResult = {
  ok: boolean;
  message: string;
  pet?: PetState;
  target?: PetSkillTarget;
  projectile?: ProjectileModel;
  damage?: number;
  healOnHit?: number;
  mpBefore?: number;
  mpAfter?: number;
};

export type PetSkillSlotView = {
  slot: number;
  skillKey: string;
  name: string;
  info: string;
  isEmpty: boolean;
  isKnown: boolean;
};

export type PetSkillResetResult = {
  ok: boolean;
  message: string;
  pet: PetState;
  beforeSkills: string[];
  afterSkills: string[];
};

export type PetSkillRandomSource = () => number;

export type PetCounterRandomSource = () => number;
