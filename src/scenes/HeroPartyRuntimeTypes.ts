import type Phaser from 'phaser';
import type { PetGroundEnvironment } from '../assets/PetGroundEnvironmentAssets';
import type { HeroSkillLoadout } from '../systems/HeroSkillSystem';
import type {
  HeroPartyEnvironmentHit,
  HeroPartyFrame,
  HeroRuntimeSnapshot,
} from '../systems/HeroPartyRuntimeSystem';
import type { Stage1CombatEnemy } from '../systems/Stage1CombatSystem';
import type { PetSkillTarget } from '../systems/PetTypes';
import type { ProjectileSystemModel } from '../systems/ProjectileSystem';
import type { PetCombatSnapshot } from '../systems/PetCombatRuntime';
import type { createHeroPartyRuntimeModel } from '../systems/HeroPartyRuntimeSystem';
import type { createStage1CombatPlayerHudSnapshot } from '../systems/Stage1CombatHudSystem';

export type HeroPartyViewSnapshot = HeroRuntimeSnapshot & Readonly<{
  view: Phaser.GameObjects.Image;
}>;

export type HeroPartyRuntime = Readonly<{
  gather: ReturnType<typeof import('../systems/HeroGatherCoordinateSystem').createHeroPartyGatherControl>;
  experience: ReturnType<typeof import('../systems/HeroPartyExperienceSystem').createHeroPartyExperience>;
  update: (frame: HeroPartyFrame) => void;
  updateMovement: (frame: HeroPartyFrame) => void;
  updateCombatStates: (frame: Omit<HeroPartyFrame, 'inputs'>) => void;
  syncVisuals: (timeMs: number) => void;
  applyEnvironmentHits: (hits: readonly HeroPartyEnvironmentHit[]) => void;
  resolveAttacks: (monsterTargets: readonly Stage1CombatEnemy[], timeMs: number) => void;
  resolveEnemyAttack: (enemy: Stage1CombatEnemy, timeMs: number) => void;
  monster3Targets: (attack: Parameters<typeof import('./HeroPartyMonster3Reception').heroPartyMonster3Targets>[4]) => ReturnType<typeof import('./HeroPartyMonster3Reception').heroPartyMonster3Targets>;
  monster2Targets: (attack: Parameters<typeof import('./HeroPartyMonster2Reception').heroPartyMonster2Targets>[4]) => ReturnType<typeof import('./HeroPartyMonster2Reception').heroPartyMonster2Targets>;
  resolvePetEnemyAttack: (enemy: Stage1CombatEnemy, timeMs: number,
    accepts?: (snapshot: PetCombatSnapshot) => boolean) => void;
  updatePets: (frame: Readonly<{
    targets: readonly PetSkillTarget[];
    combatEnemies?: readonly Stage1CombatEnemy[];
    projectiles: ProjectileSystemModel;
    timeMs: number;
    deltaMs: number;
    random?: () => number;
    groundEnvironmentFor?: (index: number) => PetGroundEnvironment | undefined;
  }>) => void;
  snapshots: () => readonly HeroPartyViewSnapshot[];
  petSnapshots: () => Readonly<Partial<Record<'p1' | 'p2', PetCombatSnapshot>>>;
  hudSnapshots: () => readonly ReturnType<typeof createStage1CombatPlayerHudSnapshot>[];
  rewardPlayers: () => readonly Readonly<{
    view: Phaser.GameObjects.Image;
    combat: ReturnType<typeof createHeroPartyRuntimeModel>['members'][number]['combat'];
  }>[];
  compatibilityMembers: () => ReturnType<typeof createHeroPartyRuntimeModel>['members'];
  compatibilityPetRuntime: (slot: 'p1' | 'p2') => import('../systems/PetTypes').PetRuntimeModel | undefined;
  highestCombo: () => number;
  destroy: () => void;
}>;

export type CreateHeroPartyRuntimeOptions = Readonly<{
  groundY: number;
  groundPlatformId?: string;
  memberWidth?: number;
  skillLoadoutFor?: (heroId: number, index: number) => HeroSkillLoadout | undefined;
  restoreActiveSave?: boolean;
  awardHeroExperience?: (slot: 'p1' | 'p2', amount: number) => void;
  legacyPetExperience?: (slot: 'p1' | 'p2') => ReturnType<import('../systems/PetCombatRuntime').PetCombatRuntime['currentAttackTarget']>;
  legacyPetRuntime?: (slot: 'p1' | 'p2') => import('../systems/PetTypes').PetRuntimeModel | undefined;
  releaseLegacyPet?: (slot: 'p1' | 'p2') => void;
}>;
