import Phaser from 'phaser';
import type { Stage1CombatEnemy } from '../../systems/Stage1CombatSystem';
import type { Stage13EnemyType } from '../../systems/Stage13FlowSystem';
import {
  createStage11MonsterView,
  destroyStage11MonsterView,
  readStage11AttackGeometry,
  updateStage11MonsterView,
  type Stage11AttackGeometryRegistry,
  type Stage11MonsterView,
} from '../stage11/Stage11MonsterVisualBridge';
import {
  createStage12MonsterView,
  destroyStage12MonsterView,
  readStage12AttackGeometry,
  updateStage12MonsterView,
  type Stage12AttackGeometryRegistry,
  type Stage12MonsterView,
} from '../stage12/Stage12MonsterVisualBridge';
import {
  createStage13Monster5View,
  destroyStage13Monster5View,
  readStage13Monster5AttackGeometry,
  updateStage13Monster5View,
  type Stage13Monster5AttackGeometry,
  type Stage13Monster5View,
} from './Stage13Monster5VisualBridge';

export type Stage13MonsterGeometryRegistry = Readonly<{
  stage11: Stage11AttackGeometryRegistry;
  stage12: Stage12AttackGeometryRegistry;
  monster5: Stage13Monster5AttackGeometry;
}>;

export type Stage13MonsterView =
  | Readonly<{ kind: 'stage11'; view: Stage11MonsterView }>
  | Readonly<{ kind: 'stage12'; view: Stage12MonsterView }>
  | Readonly<{ kind: 'monster5'; view: Stage13Monster5View }>;

export function readStage13MonsterGeometry(
  scene: Phaser.Scene,
): Stage13MonsterGeometryRegistry {
  return {
    stage11: readStage11AttackGeometry(scene),
    stage12: readStage12AttackGeometry(scene),
    monster5: readStage13Monster5AttackGeometry(scene),
  };
}

export function createStage13MonsterView(
  scene: Phaser.Scene,
  enemyType: Stage13EnemyType,
  x: number,
  y: number,
  geometry: Stage13MonsterGeometryRegistry,
): Stage13MonsterView {
  if (enemyType === 3 || enemyType === 30) {
    return { kind: 'stage11', view: createStage11MonsterView(scene, enemyType, x, y, geometry.stage11) };
  }
  if (enemyType === 7 || enemyType === 8) {
    return { kind: 'stage12', view: createStage12MonsterView(scene, enemyType, x, y, geometry.stage12) };
  }
  return { kind: 'monster5', view: createStage13Monster5View(scene, x, y, geometry.monster5) };
}

export function updateStage13MonsterView(
  scene: Phaser.Scene,
  view: Stage13MonsterView,
  combat: Stage1CombatEnemy,
  deltaMs: number,
): boolean {
  if (view.kind === 'stage12') {
    return updateStage12MonsterView(scene, view.view, combat, deltaMs);
  }
  if (view.kind === 'monster5') {
    return updateStage13Monster5View(scene, view.view, combat, deltaMs);
  }
  const attackState = combat.enemyType === 3 && combat.attackSerial % 2 === 0 ? 'hit2' : 'hit1';
  const state = combat.phase === 'dead' ? 'dead'
    : combat.phase === 'hurt' ? 'hurt'
      : combat.phase === 'approach' ? 'walk'
        : combat.phase === 'windup' || combat.phase === 'active' ? attackState : 'wait';
  return updateStage11MonsterView(scene, view.view, {
    x: combat.x,
    y: combat.y,
    state,
    facingX: combat.facingX,
    attackSerial: combat.attackSerial,
  }, deltaMs);
}

export function destroyStage13MonsterView(view: Stage13MonsterView): void {
  if (view.kind === 'stage11') destroyStage11MonsterView(view.view);
  else if (view.kind === 'stage12') destroyStage12MonsterView(view.view);
  else destroyStage13Monster5View(view.view);
}
