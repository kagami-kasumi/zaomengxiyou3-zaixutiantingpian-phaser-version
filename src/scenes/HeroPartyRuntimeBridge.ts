// boundary: this bridge owns active hero movement/combat and hero visual updates;
// levels provide only input, environment snapshots, and monster target models.
import Phaser from 'phaser';
import type { HeroSkillLoadout } from '../systems/HeroSkillSystem';
import { createRole5NormalAttackProjectileVisualBridge } from './Role5NormalAttackProjectileVisualBridge';
import { createRole1ShadowProjectileVisualBridge } from './Role1ShadowProjectileVisualBridge';
import {
  destroyRole1ShadowVisualViews,
  syncRole1ShadowVisualViews,
  type Role1ShadowView,
} from './Role1ShadowVisualBridge';
import { hasHeroCombatVisual, syncHeroCombatVisual } from './HeroCombatVisualBridge';
import {
  createHeroNormalAttackVisualBridge,
  projectHeroNormalAttackVisualPlayer,
} from './HeroNormalAttackVisualBridge';
import {
  applyHeroPartyEnvironmentHits,
  createHeroPartyRuntimeModel,
  destroyHeroPartyRuntime,
  resolveHeroPartyAttacks,
  resolveHeroPartyEnemyAttack,
  setHeroPartySkillLoadout,
  snapshotHeroParty,
  updateHeroPartyCombatStates,
  updateHeroPartyMovement,
  updateHeroPartyRuntime,
  type HeroPartyFrame,
  type HeroPartyEnvironmentHit,
  type HeroRuntimeSnapshot,
} from '../systems/HeroPartyRuntimeSystem';
import type { Stage1CombatEnemy } from '../systems/Stage1CombatSystem';
import {
  createCombatHudPetSnapshot,
  createStage1CombatPlayerHudSnapshot,
} from '../systems/Stage1CombatHudSystem';
import { getActivePet } from '../systems/PetRosterSystem';
import type { PetRoster } from '../systems/PetTypes';
import {
  FormalSkillsUpdatedEvent,
  readFormalSkillRuntime,
  type FormalSkillsUpdatedPayload,
} from './feature-ui/FormalSkillRuntimeBridge';
import {
  FormalPetsUpdatedEvent,
  type FormalPetsUpdatedPayload,
} from './feature-ui/FormalPetRuntimeBridge';
import { createFormalPetMonkeyBodyBridge } from './FormalPetMonkeyBodyBridge';
import { createFormalPetHorseBodyBridge } from './FormalPetHorseBodyBridge';

export type HeroPartyViewSnapshot = HeroRuntimeSnapshot & Readonly<{
  view: Phaser.GameObjects.Image;
}>;

export type HeroPartyRuntime = Readonly<{
  update: (frame: HeroPartyFrame) => void;
  updateMovement: (frame: HeroPartyFrame) => void;
  updateCombatStates: (frame: Omit<HeroPartyFrame, 'inputs'>) => void;
  syncVisuals: (timeMs: number) => void;
  applyEnvironmentHits: (hits: readonly HeroPartyEnvironmentHit[]) => void;
  resolveAttacks: (monsterTargets: readonly Stage1CombatEnemy[], timeMs: number) => void;
  resolveEnemyAttack: (enemy: Stage1CombatEnemy, timeMs: number) => void;
  snapshots: () => readonly HeroPartyViewSnapshot[];
  hudSnapshots: () => readonly ReturnType<typeof createStage1CombatPlayerHudSnapshot>[];
  rewardPlayers: () => readonly Readonly<{
    view: Phaser.GameObjects.Image;
    combat: ReturnType<typeof createHeroPartyRuntimeModel>['members'][number]['combat'];
  }>[];
  compatibilityMembers: () => ReturnType<typeof createHeroPartyRuntimeModel>['members'];
  destroy: () => void;
}>;

const heroPartyRuntimeByScene = new WeakMap<Phaser.Scene, HeroPartyRuntime>();

export function readHeroPartyPresentationSnapshot(
  scene: Phaser.Scene,
): readonly Omit<HeroPartyViewSnapshot, 'view'>[] | undefined {
  return heroPartyRuntimeByScene.get(scene)?.snapshots().map(({ view: _view, ...snapshot }) => snapshot);
}

export function createHeroPartyRuntime(
  scene: Phaser.Scene,
  views: readonly Phaser.GameObjects.Image[],
  options: Readonly<{
    groundY: number;
    groundPlatformId?: string;
    memberWidth?: number;
    skillLoadoutFor?: (
      heroId: number,
      index: number,
    ) => HeroSkillLoadout | undefined;
    restoreActiveSave?: boolean;
  }>,
): HeroPartyRuntime {
  const role1ShadowQa = isFormalRole1ShadowQaEnabled();
  const mayRestoreActiveSave = options.restoreActiveSave
    ?? views.every((view) => view.getData('formalPartySource') !== 'dev-override');
  const restoredState = mayRestoreActiveSave
    ? readFormalSkillRuntime(getBrowserStorage())
    : undefined;
  const petRosters: Partial<Record<'p1' | 'p2', PetRoster>> = {
    p1: restoredState?.player1.petRoster,
    p2: restoredState?.player2.petRoster,
  };
  const model = createHeroPartyRuntimeModel(views.map((view, index) => ({
    slot: index === 0 ? 'p1' : 'p2',
    heroId: view.getData('heroId'),
    x: view.x,
    y: options.groundY,
    width: options.memberWidth ?? view.displayWidth,
    currentPlatformId: options.groundPlatformId,
    progression: index === 0
      ? restoredState?.player1.progression
      : restoredState?.player2.progression,
    equipmentLoadout: index === 0
      ? restoredState?.player1.equipmentLoadout
      : restoredState?.player2.equipmentLoadout,
    skillLoadout: role1ShadowQa
      && view.getData('formalPartySource') === 'dev-override'
      && view.getData('heroId') === 1
      ? createFormalRole1ShadowQaLoadout()
      : options.skillLoadoutFor?.(view.getData('heroId'), index)
        ?? (index === 0 ? restoredState?.player1.skillLoadout : restoredState?.player2.skillLoadout),
  })));
  if (role1ShadowQa) {
    for (const member of model.members) {
      if (member.combat.normalAttack.heroId !== 1) continue;
      member.combat.maxMp = 2_000;
      member.combat.mp = 2_000;
      member.combat.skill.maxMp = 2_000;
      member.combat.skill.mp = 2_000;
    }
  }
  const attackVisuals = createHeroNormalAttackVisualBridge(scene);
  const normalAttackProjectileVisuals = createRole5NormalAttackProjectileVisualBridge(scene);
  const role1ShadowProjectileVisuals = createRole1ShadowProjectileVisualBridge(scene);
  const role1ShadowViews = new Map<string, Role1ShadowView>();
  const formalPetMonkeyBodies = scene.scene.key === 'TestScene'
    ? undefined
    : createFormalPetMonkeyBodyBridge(scene, (slot) => petRosters[slot]);
  const formalPetHorseBodies = scene.scene.key === 'TestScene'
    ? undefined
    : createFormalPetHorseBodyBridge(scene, (slot) => petRosters[slot]);
  let destroyed = false;

  const syncSkills = (payload: FormalSkillsUpdatedPayload) => {
    setHeroPartySkillLoadout(model, payload.owner, payload.skillLoadout);
  };
  const syncPets = (payload: FormalPetsUpdatedPayload) => {
    petRosters[payload.owner] = payload.roster;
  };
  scene.events.on(FormalSkillsUpdatedEvent, syncSkills);
  scene.events.on(FormalPetsUpdatedEvent, syncPets);

  const snapshots = (): readonly HeroPartyViewSnapshot[] => snapshotHeroParty(model).map((snapshot, index) => ({
    ...snapshot,
    view: views[index]!,
  }));

  const syncVisuals = (timeMs: number): void => {
    model.members.forEach((member, index) => {
      const view = views[index];
      if (!view) return;
      view.setPosition(member.movement.x, member.movement.y);
      syncHeroCombatVisual(view, {
        movement: member.movement,
        combat: member.combat.combat,
        normalAttack: member.combat.normalAttack,
        skill: member.combat.skill,
      }, timeMs);
      syncFallbackFeedback(view, member.combat);
    });
    attackVisuals.update(model.members.map((member, index) =>
      projectHeroNormalAttackVisualPlayer(views[index]!, member.combat)), timeMs);
    normalAttackProjectileVisuals.update(model.projectiles.projectiles);
    role1ShadowProjectileVisuals.update(model.projectiles.projectiles);
    syncRole1ShadowVisualViews({
      scene,
      shadows: model.members.flatMap((member) =>
        member.combat.normalAttack.heroId === 1
          ? member.combat.skill.role1ShadowRuntime.shadows
          : []),
      views: role1ShadowViews,
    });
    formalPetMonkeyBodies?.update(model.members.map((member) => ({
      slot: member.combat.slot,
      x: member.movement.x,
      y: member.movement.y,
      facingX: member.movement.facingX,
      dead: member.combat.combat.state === 'dead',
    })), timeMs);
    formalPetHorseBodies?.update(model.members.map((member) => ({
      slot: member.combat.slot,
      x: member.movement.x,
      y: member.movement.y,
      facingX: member.movement.facingX,
      dead: member.combat.combat.state === 'dead',
    })), timeMs);
    if (role1ShadowQa) {
      scene.game.canvas.dataset.formalRole1ShadowQa = JSON.stringify(model.members
        .filter((member) => member.combat.normalAttack.heroId === 1)
        .map((member) => ({
          slot: member.combat.slot,
          facingX: member.movement.facingX,
          lastResult: member.combat.skill.lastResult,
          shadows: member.combat.skill.role1ShadowRuntime.shadows.map((shadow) => ({
            id: shadow.id,
            sourceId: shadow.sourceId,
            action: shadow.action,
            actionTick: shadow.actionTick,
            candidate: shadow.candidate,
            viewFrame: role1ShadowViews.get(shadow.id)?.sprite.frame.name,
          })),
        })));
    }
  };

  const runtime: HeroPartyRuntime = {
    update: (frame) => {
      if (destroyed) return;
      updateHeroPartyRuntime(model, frame);
      syncVisuals(frame.timeMs);
    },
    updateMovement: (frame) => updateHeroPartyMovement(model, frame),
    updateCombatStates: (frame) => updateHeroPartyCombatStates(model, frame),
    syncVisuals,
    applyEnvironmentHits: (hits) => {
      applyHeroPartyEnvironmentHits(model, hits);
      model.members.forEach((member, index) => {
        const view = views[index];
        if (!view) return;
        view.setPosition(member.movement.x, member.movement.y);
        syncFallbackFeedback(view, member.combat);
      });
    },
    resolveAttacks: (monsterTargets, timeMs) => resolveHeroPartyAttacks(model, monsterTargets, timeMs),
    resolveEnemyAttack: (enemy, timeMs) => {
      resolveHeroPartyEnemyAttack(model, enemy, timeMs);
      model.members.forEach((member, index) => {
        const view = views[index];
        if (view) syncFallbackFeedback(view, member.combat);
      });
    },
    snapshots,
    hudSnapshots: () => model.members.map((member) => {
      const roster = petRosters[member.combat.slot];
      return createStage1CombatPlayerHudSnapshot(
        member.combat,
        createCombatHudPetSnapshot(roster ? getActivePet(roster) : undefined),
      );
    }),
    rewardPlayers: () => model.members.map((member, index) => ({
      view: views[index]!,
      combat: member.combat,
    })),
    compatibilityMembers: () => model.members,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      scene.events.off(FormalSkillsUpdatedEvent, syncSkills);
      scene.events.off(FormalPetsUpdatedEvent, syncPets);
      attackVisuals.destroy();
      normalAttackProjectileVisuals.destroy();
      role1ShadowProjectileVisuals.destroy();
      destroyRole1ShadowVisualViews(role1ShadowViews);
      formalPetMonkeyBodies?.destroy();
      formalPetHorseBodies?.destroy();
      if (role1ShadowQa) delete scene.game.canvas.dataset.formalRole1ShadowQa;
      destroyHeroPartyRuntime(model);
      heroPartyRuntimeByScene.delete(scene);
    },
  };
  heroPartyRuntimeByScene.set(scene, runtime);
  return runtime;
}

function syncFallbackFeedback(
  view: Phaser.GameObjects.Image,
  player: ReturnType<typeof createHeroPartyRuntimeModel>['members'][number]['combat'],
): void {
  if (hasHeroCombatVisual(view)) return;
  if (player.combat.state === 'dead') view.setTint(0x555555);
  else if (player.combat.state === 'hurt') view.setTint(0xff8888);
  else if (player.normalAttack.activeAttack) view.setTint(0xffdf80);
  else view.clearTint();
}

function getBrowserStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function isFormalRole1ShadowQaEnabled(): boolean {
  const local = globalThis.location?.hostname === 'localhost'
    || globalThis.location?.hostname === '127.0.0.1';
  return local && new URLSearchParams(globalThis.location?.search ?? '').get('qaRole1Shadow') === '1';
}

function createFormalRole1ShadowQaLoadout(): HeroSkillLoadout {
  return {
    slots: [
      null,
      null,
      { skillName: 'lyfb', level: 7 },
      { skillName: 'qsez', level: 7 },
      { skillName: 'zz', level: 7 },
    ],
  };
}
