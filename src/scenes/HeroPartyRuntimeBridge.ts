// boundary: this bridge owns active hero movement/combat and hero visual updates;
// levels provide only input, environment snapshots, and monster target models.
import Phaser from 'phaser';
import { hasHeroCombatVisual, syncHeroCombatVisual } from './HeroCombatVisualBridge';
import {
  createHeroNormalAttackVisualBridge,
  projectHeroNormalAttackVisualPlayer,
} from './HeroNormalAttackVisualBridge';
import {
  createHeroPartyRuntimeModel,
  destroyHeroPartyRuntime,
  resolveHeroPartyAttacks,
  resolveHeroPartyEnemyAttack,
  setHeroPartySkillLoadout,
  snapshotHeroParty,
  updateHeroPartyRuntime,
  type HeroPartyFrame,
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
  resolveAttacks: (monsterTargets: readonly Stage1CombatEnemy[], timeMs: number) => void;
  resolveEnemyAttack: (enemy: Stage1CombatEnemy, timeMs: number) => void;
  snapshots: () => readonly HeroPartyViewSnapshot[];
  hudSnapshots: () => readonly ReturnType<typeof createStage1CombatPlayerHudSnapshot>[];
  rewardPlayers: () => readonly Readonly<{
    view: Phaser.GameObjects.Image;
    combat: ReturnType<typeof createHeroPartyRuntimeModel>['members'][number]['combat'];
  }>[];
  destroy: () => void;
}>;

export function createHeroPartyRuntime(
  scene: Phaser.Scene,
  views: readonly Phaser.GameObjects.Image[],
  options: Readonly<{
    groundY: number;
    groundPlatformId?: string;
  }>,
): HeroPartyRuntime {
  const restoredSkills = readFormalSkillRuntime(getBrowserStorage());
  const model = createHeroPartyRuntimeModel(views.map((view, index) => ({
    slot: index === 0 ? 'p1' : 'p2',
    heroId: view.getData('heroId'),
    x: view.x,
    y: options.groundY,
    width: view.displayWidth,
    currentPlatformId: options.groundPlatformId,
    skillLoadout: index === 0 ? restoredSkills?.player1.skillLoadout : restoredSkills?.player2?.skillLoadout,
  })));
  const attackVisuals = createHeroNormalAttackVisualBridge(scene);
  let destroyed = false;

  const syncSkills = (payload: FormalSkillsUpdatedPayload) => {
    setHeroPartySkillLoadout(model, payload.owner, payload.skillLoadout);
  };
  scene.events.on(FormalSkillsUpdatedEvent, syncSkills);

  const snapshots = (): readonly HeroPartyViewSnapshot[] => snapshotHeroParty(model).map((snapshot, index) => ({
    ...snapshot,
    view: views[index]!,
  }));

  return {
    update: (frame) => {
      if (destroyed) return;
      updateHeroPartyRuntime(model, frame);
      model.members.forEach((member, index) => {
        const view = views[index];
        if (!view) return;
        view.setPosition(member.movement.x, member.movement.y);
        syncHeroCombatVisual(view, {
          movement: member.movement,
          combat: member.combat.combat,
          normalAttack: member.combat.normalAttack,
          skill: member.combat.skill,
        }, frame.timeMs);
        syncFallbackFeedback(view, member.combat);
      });
      attackVisuals.update(model.members.map((member, index) =>
        projectHeroNormalAttackVisualPlayer(views[index]!, member.combat)), frame.timeMs);
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
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      scene.events.off(FormalSkillsUpdatedEvent, syncSkills);
      attackVisuals.destroy();
      destroyHeroPartyRuntime(model);
    },
  };
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
