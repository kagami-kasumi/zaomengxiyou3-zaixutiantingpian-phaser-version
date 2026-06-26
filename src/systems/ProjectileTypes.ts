import type { AttackKind } from './CombatSystem';

export type ProjectileSourceState = 'ready' | 'hurt' | 'dead';

export type ProjectileSourceSnapshot = {
  id: string;
  state: ProjectileSourceState;
};

export type ProjectileSpawnPoint = {
  sourceId: string;
  x: number;
  y: number;
  facingX: -1 | 1;
};

export type ProjectileModel = {
  id: number;
  projectileId: string;
  variant: ProjectileVariant;
  sourceId: string;
  sourceAttackId: string;
  actionName: string;
  assetKey: string;
  sourceSymbol: string;
  runtimeName: string;
  x: number;
  y: number;
  facingX: -1 | 1;
  velocityX: number;
  velocityY: number;
  remainingDistance: number | undefined;
  width: number;
  height: number;
  damage: number;
  attackKind: AttackKind;
  knockbackX: number;
  knockbackY: number;
  elapsedMs: number;
  activeAfterMs?: number;
  lifetimeMs: number;
  hitIntervalFrames: number;
  nextHitSerialAtFrame: number;
  hitSerial: number;
  remainingHits: number;
  magicStunMs?: number;
  magicIceMs?: number;
  trackingTargetId?: string;
  petHealOnHit?: number;
  petComboTags?: string[];
  explosionDelayMs?: number;
  secondStageDamage?: number;
  secondStageMagicIceMs?: number;
  petBurnMs?: number;
  petBurnDamage?: number;
  role4Poison?: {
    skillName: 'zq' | 'jdz';
    level: number;
    durationMs: number;
    damagePerSecond: number;
  };
  visualOnly?: boolean;
  destroyWhenSourceHurt: boolean;
  hasSpawnedSecondStage: boolean;
  isExpired: boolean;
};

export type ProjectileSystemModel = {
  projectiles: ProjectileModel[];
  projectileSerial: number;
  sourceAttackSerialBySource: Record<string, number>;
};

export type ProjectileTuning = {
  actionName: string;
  assetKey: string;
  sourceSymbol: string;
  runtimeName: string;
  offsetX: number;
  offsetY: number;
  speedX: number;
  speedY: number;
  distance: number | undefined;
  width: number;
  height: number;
  lifetimeMs: number;
  damage: number;
  attackKind: AttackKind;
  knockbackX: number;
  knockbackY: number;
  hitIntervalFrames: number;
  maxHits: number;
};

export type ProjectileVariant =
  | 'role1-slz-hit6'
  | 'role1-hytj-hit7'
  | 'role1-lyfb-hit8'
  | 'role1-lyfb-hit8-2'
  | 'role1-lyfb-shadow-hit8-1'
  | 'role1-lyfb-shadow-hit8-2-1'
  | 'role1-lys-hit9'
  | 'role1-jdy-hit11-1'
  | 'role1-jdy-hit11-2'
  | 'role1-qsez-hit13'
  | 'role1-zz-hit14-1'
  | 'role1-zz-hit14-2'
  | 'role1-shadow-zz-hit14-1'
  | 'role1-shadow-zz-hit14-2'
  | 'role1-hmz-hit10-2'
  | 'role1-hmz-hit10-4'
  | 'role1-hyjj-hit12'
  | 'role1-hyjj-hit12-1'
  | 'role2-sgq-hit5'
  | 'role2-smb-hit4-1'
  | 'role2-smb-hit4-2'
  | 'role2-xbz-hit3'
  | 'role2-myhc'
  | 'role2-shadow-myhc'
  | 'role2-jgz'
  | 'role2-tjgl'
  | 'role2-shadow-tjgl'
  | 'role2-jhsj-cast'
  | 'role2-jhsj-hit9-1'
  | 'role2-jhsj-hit9-2'
  | 'role2-shadow-jhsj-hit9-1-2'
  | 'role2-shadow-jhsj-hit9-2-2'
  | 'role2-shy-shadow'
  | 'role2-shy-recall'
  | 'role2-shadow-xbz-hit3-2'
  | 'role3-dj-hit4'
  | 'role3-sd-hit5'
  | 'role3-zznh-hit6'
  | 'role3-syzq-hit7-1'
  | 'role3-syzq-hit7-2'
  | 'role3-ssp-hit8-1'
  | 'role3-ssp-hit8-2'
  | 'role3-jsp-hit9'
  | 'role3-dgq-hit10'
  | 'role3-xgq-cast'
  | 'role3-xgq-hit11'
  | 'role3-tmc-hit12-1'
  | 'role3-tmc-hit12-2'
  | 'role4-zq-shovel-hit4'
  | 'role4-zq-arrow-hit4'
  | 'role4-jdz-hit7-1'
  | 'role4-jdz-hit7-2'
  | 'role4-wdww-hit5'
  | 'role4-wdww-doll'
  | 'role4-mbyj-hit6'
  | 'role4-qlj-shovel-hit8'
  | 'role4-qlj-arrow-hit8-1'
  | 'role4-qlj-arrow-hit8-2'
  | 'role4-tkj-shovel-hit9-1'
  | 'role4-tkj-shovel-hit9-2'
  | 'role4-tkj-arrow-hit9-1'
  | 'role4-tkj-arrow-hit9-2'
  | 'role4-dzj-shovel-hit10'
  | 'role4-dzj-arrow-hit10-1'
  | 'role4-dzj-arrow-hit10-2'
  | 'role4-lybj-marker'
  | 'role4-mmw-shovel-hit12'
  | 'role4-mmw-arrow-hit12-1'
  | 'role4-mmw-arrow-hit12-2'
  | 'role4-mmw-arrow-hit12-3'
  | 'magic-weapon-sword2'
  | 'magic-weapon-qpj-active'
  | 'magic-weapon-qpj-auto'
  | 'magic-weapon-pearl-bullet1'
  | 'magic-weapon-pearl-bullet2'
  | 'magic-weapon-pearl-bullet3'
  | 'magic-weapon-zltc'
  | 'magic-weapon-snow'
  | 'pet-monkey1-xj'
  | 'pet-monkey2-lj'
  | 'pet-monkey2-xj'
  | 'pet-monkey3-lyq'
  | 'pet-monkey3-xj'
  | 'pet-monkey3-lj'
  | 'pet-monkey4-jgaoyi'
  | 'pet-horse1-sp'
  | 'pet-horse2-bd'
  | 'pet-horse3-bz'
  | 'pet-horse4-tmaoyi'
  | 'pet-horse4-tmaoyi-explode'
  | 'pet-dragon1-fs'
  | 'pet-dragon2-sdcc'
  | 'pet-dragon3-ltwj'
  | 'pet-dragon4-qlaoyi'
  | 'pet-turtle1-sld'
  | 'pet-turtle3-sybh'
  | 'pet-turtle4-xwaoyi'
  | 'pet-ufo1-pms'
  | 'pet-ufo3-kmsk'
  | 'pet-tiger1-hy'
  | 'pet-tiger2-sxhz'
  | 'pet-tiger3-hsqj'
  | 'pet-phoenix2-bshn'
  | 'pet-phoenix3-dhly'
  | 'pet-rabbit1-yg'
  | 'pet-rabbit3-bs'
  | 'pet-mouse1-sc'
  | 'pet-mouse4-hxfb';
