// Shared Phaser projection for the pure monster registry. Levels provide only
// spawn commands, environment snapshots, and narrow encounter/reward events.
import Phaser from 'phaser';
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
  update: (heroes: HeroPartyRuntime, timeMs: number, deltaMs: number) => readonly MonsterRuntimeEvent[];
  snapshots: () => readonly MonsterRuntimeSnapshot[];
  destroy: () => void;
}>;

export function createMonsterRuntimeRegistry<View>(options: Readonly<{
  scene: Phaser.Scene;
  platforms: readonly MovementPlatform[];
  views: MonsterViewAdapter<View>;
  onDefeated: (monster: Stage1CombatEnemy) => void;
}>): MonsterRuntimeRegistry {
  const model = createMonsterRuntimeRegistryModel();
  const viewById = new Map<string, View>();
  let destroyed = false;

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
      handleEvents(events);
      return events;
    },
    update: (heroes, timeMs, deltaMs) => {
      if (destroyed) return [];
      const events: MonsterRuntimeEvent[] = [];
      events.push(...updateMonsterRuntimeRegistry(model, {
        targets: heroes.snapshots(),
        platforms: options.platforms,
        deltaMs,
      }));
      const targets = getMonsterCombatTargets(model);
      for (const combat of targets) {
        const view = viewById.get(combat.id);
        if (view) options.views.update(options.scene, view, combat, deltaMs);
        heroes.resolveEnemyAttack(combat, timeMs);
      }
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
      }
      return events;
    },
    snapshots: () => snapshotMonsterRuntimeRegistry(model),
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      for (const view of viewById.values()) options.views.destroy(view);
      viewById.clear();
      destroyMonsterRuntimeRegistry(model);
    },
  };
}
