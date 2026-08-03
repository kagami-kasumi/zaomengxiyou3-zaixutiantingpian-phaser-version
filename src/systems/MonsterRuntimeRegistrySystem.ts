import type { MovementPlatform } from './HeroMovementSystem';
import {
  createStage1CombatEnemy,
  updateStage1Enemy,
  type Stage1CombatEnemy,
  type Stage1EnemyType,
} from './Stage1CombatSystem';
import {
  createMonsterPhysics,
  updateMonsterPhysics,
  type MonsterPhysicsModel,
} from './MonsterPhysicsSystem';

export type MonsterSpawnCommand = Readonly<{
  encounterId: string;
  spawnId: string;
  monsterDefinitionId: Stage1EnemyType;
  x: number;
  y: number;
}>;

export type MonsterRuntimeSnapshot = Readonly<{
  id: string;
  encounterId: string;
  spawnId: string;
  monsterDefinitionId: Stage1EnemyType;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  phase: Stage1CombatEnemy['phase'];
}>;

export type MonsterRuntimeEvent =
  | Readonly<{ type: 'spawned'; monster: MonsterRuntimeSnapshot }>
  | Readonly<{ type: 'defeated'; monster: MonsterRuntimeSnapshot }>
  | Readonly<{ type: 'cleared' }>;

export type MonsterRuntimeFrame = Readonly<{
  targets: readonly Readonly<{ slot: 'p1' | 'p2'; x: number; alive: boolean }>[];
  platforms: readonly MovementPlatform[];
  deltaMs: number;
}>;

type MonsterRuntime = {
  encounterId: string;
  spawnId: string;
  combat: Stage1CombatEnemy;
  physics: MonsterPhysicsModel;
  defeatReported: boolean;
};

export type MonsterRuntimeRegistryModel = {
  monsters: Map<string, MonsterRuntime>;
  destroyed: boolean;
};

export function createMonsterRuntimeRegistryModel(): MonsterRuntimeRegistryModel {
  return { monsters: new Map(), destroyed: false };
}

export function spawnMonsters(
  registry: MonsterRuntimeRegistryModel,
  commands: readonly MonsterSpawnCommand[],
): readonly MonsterRuntimeEvent[] {
  if (registry.destroyed) return [];
  const events: MonsterRuntimeEvent[] = [];
  for (const command of commands) {
    if (registry.monsters.has(command.spawnId)) continue;
    const physics = createMonsterPhysics({ y: command.y, height: 100 });
    const runtime: MonsterRuntime = {
      encounterId: command.encounterId,
      spawnId: command.spawnId,
      combat: createStage1CombatEnemy({
        id: command.spawnId,
        enemyType: command.monsterDefinitionId,
        x: command.x,
        y: physics.y,
      }),
      physics,
      defeatReported: false,
    };
    registry.monsters.set(command.spawnId, runtime);
    events.push({ type: 'spawned', monster: snapshot(runtime) });
  }
  return events;
}

export function updateMonsterRuntimeRegistry(
  registry: MonsterRuntimeRegistryModel,
  frame: MonsterRuntimeFrame,
): readonly MonsterRuntimeEvent[] {
  if (registry.destroyed) return [];
  for (const runtime of registry.monsters.values()) {
    updateMonsterPhysics(runtime.physics, runtime.combat.x, frame.platforms, frame.deltaMs);
    runtime.combat.y = runtime.physics.y;
    updateStage1Enemy({ enemy: runtime.combat, targets: frame.targets, deltaMs: frame.deltaMs });
  }
  return collectDefeatEvents(registry);
}

export function collectDefeatEvents(
  registry: MonsterRuntimeRegistryModel,
): readonly MonsterRuntimeEvent[] {
  if (registry.destroyed) return [];
  const events: MonsterRuntimeEvent[] = [];
  for (const runtime of registry.monsters.values()) {
    if (runtime.combat.phase !== 'dead' || runtime.defeatReported) continue;
    runtime.defeatReported = true;
    events.push({ type: 'defeated', monster: snapshot(runtime) });
  }
  return events;
}

export function getMonsterCombatTargets(
  registry: MonsterRuntimeRegistryModel,
): readonly Stage1CombatEnemy[] {
  return registry.destroyed ? [] : [...registry.monsters.values()].map((runtime) => runtime.combat);
}

export function snapshotMonsterRuntimeRegistry(
  registry: MonsterRuntimeRegistryModel,
): readonly MonsterRuntimeSnapshot[] {
  return registry.destroyed ? [] : [...registry.monsters.values()].map(snapshot);
}

export function removeMonster(
  registry: MonsterRuntimeRegistryModel,
  id: string,
): readonly MonsterRuntimeEvent[] {
  if (registry.destroyed || !registry.monsters.delete(id)) return [];
  return registry.monsters.size === 0 ? [{ type: 'cleared' }] : [];
}

export function destroyMonsterRuntimeRegistry(registry: MonsterRuntimeRegistryModel): void {
  if (registry.destroyed) return;
  registry.destroyed = true;
  registry.monsters.clear();
}

function snapshot(runtime: MonsterRuntime): MonsterRuntimeSnapshot {
  return {
    id: runtime.combat.id,
    encounterId: runtime.encounterId,
    spawnId: runtime.spawnId,
    monsterDefinitionId: runtime.combat.enemyType,
    x: runtime.combat.x,
    y: runtime.combat.y,
    hp: runtime.combat.hp,
    maxHp: runtime.combat.maxHp,
    phase: runtime.combat.phase,
  };
}
