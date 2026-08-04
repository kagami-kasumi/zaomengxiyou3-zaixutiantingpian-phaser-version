// boundary: this bridge owns active hero movement/combat and hero visual updates;
// levels provide only input, environment snapshots, and monster target models.
import Phaser from 'phaser';
import type { HeroSkillLoadout } from '../systems/HeroSkillSystem';
import { createRole5NormalAttackProjectileVisualBridge } from './Role5NormalAttackProjectileVisualBridge';
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
import { createStage1CombatPlayerHudSnapshot } from '../systems/Stage1CombatHudSystem';
import {
  FormalSkillsUpdatedEvent,
  readFormalSkillRuntime,
  type FormalSkillsUpdatedPayload,
} from './feature-ui/FormalSkillRuntimeBridge';

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
  }>,
): HeroPartyRuntime {
  const restoredSkills = readFormalSkillRuntime(getBrowserStorage());
  const model = createHeroPartyRuntimeModel(views.map((view, index) => ({
    slot: index === 0 ? 'p1' : 'p2',
    heroId: view.getData('heroId'),
    x: view.x,
    y: options.groundY,
    width: options.memberWidth ?? view.displayWidth,
    currentPlatformId: options.groundPlatformId,
    skillLoadout: options.skillLoadoutFor?.(view.getData('heroId'), index)
      ?? (index === 0 ? restoredSkills?.player1.skillLoadout : restoredSkills?.player2?.skillLoadout),
  })));
  const attackVisuals = createHeroNormalAttackVisualBridge(scene);
  const normalAttackProjectileVisuals = createRole5NormalAttackProjectileVisualBridge(scene);
  let destroyed = false;

  const syncSkills = (payload: FormalSkillsUpdatedPayload) => {
    setHeroPartySkillLoadout(model, payload.owner, payload.skillLoadout);
  };
  scene.events.on(FormalSkillsUpdatedEvent, syncSkills);

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
    hudSnapshots: () => model.members.map((member) =>
      createStage1CombatPlayerHudSnapshot(member.combat)),
    rewardPlayers: () => model.members.map((member, index) => ({
      view: views[index]!,
      combat: member.combat,
    })),
    compatibilityMembers: () => model.members,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      scene.events.off(FormalSkillsUpdatedEvent, syncSkills);
      attackVisuals.destroy();
      normalAttackProjectileVisuals.destroy();
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
