import { enterMonster2AttackDisplay } from '../systems/Monster2AttackRuntime';
import { updateMonster2CombatWorld } from '../systems/Monster2CombatWorld';
import { getGlobalSettings } from '../systems/GlobalSettingsSystem';
import { createMonster2RawDisplayBridge } from './Monster2RawDisplayBridge';
import { getMonsterRewardConfig } from '../systems/MonsterDefeatRewardSystem';
// Shared Phaser projection for the pure monster registry. Levels provide only
// spawn commands, environment snapshots, and narrow encounter/reward events.
import Phaser from 'phaser';
import { createSceneMonsterKnockback } from './MonsterKnockbackBridge';
import type { MovementPlatform } from '../systems/HeroMovementSystem';
import {
  collectDefeatEvents,
  createMonsterRuntimeRegistryModel,
  destroyMonsterRuntimeRegistry,
  getMonsterCombatTargets,
  removeMonster,
  snapshotMonsterRuntimeRegistry,
  spawnMonsters,
  updateMonsterRuntimeRegistry,
  type MonsterRuntimeEvent,
  type MonsterRuntimeSnapshot,
  type MonsterSpawnCommand,
} from '../systems/MonsterRuntimeRegistrySystem';
import type { Stage1CombatEnemy } from '../systems/Stage1CombatSystem';
import type { HeroPartyRuntime } from './HeroPartyRuntimeBridge';

export type MonsterViewAdapter<View> = Readonly<{
  create: (scene: Phaser.Scene, monster: MonsterRuntimeSnapshot) => View;
  update: (scene: Phaser.Scene, view: View, combat: Stage1CombatEnemy, deltaMs: number) => boolean;
  destroy: (view: View) => void;
}>;

export type MonsterRuntimeRegistry = Readonly<{
  spawn: (commands: readonly MonsterSpawnCommand[]) => readonly MonsterRuntimeEvent[];
  update: (heroes: HeroPartyRuntime, timeMs: number, deltaMs: number,
    afterMonsterStep?: () => void) => readonly MonsterRuntimeEvent[];
  snapshots: () => readonly MonsterRuntimeSnapshot[];
  combatTargets: () => readonly Stage1CombatEnemy[];
  destroy: () => void;
}>;

export function createMonsterRuntimeRegistry<View>(options: Readonly<{
  level?: 11 | 12 | 13 | 21 | 22;
  scene: Phaser.Scene;
  platforms: readonly MovementPlatform[];
  views: MonsterViewAdapter<View>;
  onDefeated: (monster: Stage1CombatEnemy) => void;
  onRemoved?: (monster: Stage1CombatEnemy) => void;
}>): MonsterRuntimeRegistry {
  const model = createMonsterRuntimeRegistryModel();
  const viewById = new Map<string, View>();
  const rawDisplay = options.level === 12 ? createMonster2RawDisplayBridge(options.scene) : undefined;
  let destroyed = false;
  const pauseAttacks = () => {
    for (const combat of getMonsterCombatTargets(model)) if (combat.monster2AttackRuntime) {
      enterMonster2AttackDisplay(combat.monster2AttackRuntime);
      const view = viewById.get(combat.id);
      if (view) options.views.update(options.scene, view, combat, 0);
    }
  };
  options.scene.events.on(Phaser.Scenes.Events.PAUSE, pauseAttacks);


  const handleEvents = (events: readonly MonsterRuntimeEvent[]): void => {
    for (const event of events) {
      if (event.type === 'spawned') {
        viewById.set(event.monster.id, options.views.create(options.scene, event.monster));
      }
    }
  };

  return {
    spawn: (commands) => {
      const events = spawnMonsters(model, commands);
      if (options.level) for (const combat of getMonsterCombatTargets(model)) {
        combat.petKnockback ??= createSceneMonsterKnockback(options.scene, options.level, combat.enemyType, combat);
      }
      handleEvents(events);
      return events;
    },
    update: (heroes, timeMs, deltaMs, afterMonsterStep) => {
      if (destroyed) return [];
      for (const enemy of getMonsterCombatTargets(model)) heroes.experience.bind(enemy, getMonsterRewardConfig(enemy.enemyType).experience);
      const events: MonsterRuntimeEvent[] = [];
      events.push(...updateMonsterRuntimeRegistry(model, {
        updateMonster2: enemy => {
          if (!rawDisplay) throw new Error('Unregistered Monster2 scene consumer');
          updateMonster2CombatWorld(enemy, { parentId: options.scene.sys.settings.key, timeMs, deltaMs,
            hostFps: options.scene.game.loop.targetFps, difficulty: getGlobalSettings().difficulty,
            boss: true, flower: false, targets: heroes.monster2Targets,
            emitRaw: rawDisplay.emit, gather: heroes.gather.request });
        },
        timeMs,
        hostFps: options.scene.game.loop.targetFps,
        targets: heroes.snapshots(),
        platforms: options.platforms,
        deltaMs,
      }));
      const targets = getMonsterCombatTargets(model);
      for (const combat of targets) {
        const view = viewById.get(combat.id);
        if (view) options.views.update(options.scene, view, combat, deltaMs);
        if (combat.enemyType !== 2) heroes.resolveEnemyAttack(combat, timeMs);
      }
      // Stage1-2's source world puts monster requests/reception before the hero
      // step. The callback is one complete owner update, never a second physics
      // pass. Other level callers retain their established scheduling.
      afterMonsterStep?.();
      heroes.resolveAttacks(targets, timeMs);
      events.push(...collectDefeatEvents(model));
      for (const event of events) {
        if (event.type !== 'defeated') continue;
        const combat = targets.find((candidate) => candidate.id === event.monster.id);
        if (combat) options.onDefeated(combat);
      }
      for (const combat of targets) {
        if (combat.phase !== 'dead') continue;
        const view = viewById.get(combat.id);
        if (view && !options.views.update(options.scene, view, combat, 0)) continue;
        if (view) options.views.destroy(view);
        viewById.delete(combat.id);
        events.push(...removeMonster(model, combat.id));
        options.onRemoved?.(combat);
      }
      return events;
    },
    snapshots: () => snapshotMonsterRuntimeRegistry(model),
    combatTargets: () => getMonsterCombatTargets(model),
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      rawDisplay?.destroy();
      options.scene.events.off(Phaser.Scenes.Events.PAUSE, pauseAttacks);
      for (const view of viewById.values()) options.views.destroy(view);
      viewById.clear();
      destroyMonsterRuntimeRegistry(model);
    },
  };
}
