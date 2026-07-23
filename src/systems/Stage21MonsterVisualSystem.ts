import type { Stage1EnemyAttackPhase, Stage1EnemyType } from './Stage1CombatSystem';
import type { AttackKind } from './CombatSystem';

export type Stage21MonsterType = Extract<Stage1EnemyType, 6 | 9 | 10 | 19>;
export type Stage21MonsterAction = 'wait' | 'walk' | 'hurt' | 'dead' | 'hit1' | 'hit2' | 'hit3';
export type Stage21AttackFamily =
  | 'monster6Hit1'
  | 'monster6Hit2Start'
  | 'monster6Hit2Rain'
  | 'monster6Hit3'
  | 'monster9Hit1'
  | 'monster10Hit1'
  | 'monster19Hit1';

type ActionDefinition = Readonly<{
  row: number;
  holdTicks: readonly number[];
  loop: boolean;
}>;

export type Stage21MonsterVisualModel = {
  enemyType: Stage21MonsterType;
  action: Stage21MonsterAction;
  frameIndex: number;
  actionTick: number;
  frameTick: number;
  elapsedMs: number;
  attackSerial: number;
  facingX: -1 | 1;
  completed: boolean;
};

export type Stage21MonsterVisualSnapshot = Readonly<{
  phase: Stage1EnemyAttackPhase;
  attackSerial: number;
  facingX: -1 | 1;
  moving: boolean;
}>;

export type Stage21AttackVisualEvent = Readonly<{
  family: Stage21AttackFamily;
  offsetX: number;
  offsetY: number;
  facingX: -1 | 1;
  attackKind: AttackKind;
  damage: number;
  attackInterval: number;
}>;

export const Stage21VisualTickMs = 1_000 / 30;

const sharedActions = {
  wait: { row: 0, holdTicks: [2, 2, 2, 3, 2, 4], loop: true },
  walk: { row: 1, holdTicks: [4, 4, 4, 4], loop: true },
  hurt: { row: 2, holdTicks: [15], loop: false },
  dead: { row: 3, holdTicks: [2, 2, 2, 2, 7], loop: false },
  hit1: { row: 4, holdTicks: [2, 2, 2, 6], loop: false },
} as const satisfies Record<string, ActionDefinition>;

const actionDefinitions: Record<Stage21MonsterType, Partial<Record<Stage21MonsterAction, ActionDefinition>>> = {
  6: {
    ...sharedActions,
    dead: { row: 3, holdTicks: [2, 2, 2, 2, 2, 2, 18], loop: false },
    hit1: { row: 4, holdTicks: [2, 2, 2, 9], loop: false },
    hit2: { row: 5, holdTicks: [2, 2, 19, 50], loop: false },
    hit3: { row: 6, holdTicks: [2, 2, 2, 2, 7, 17], loop: false },
  },
  9: sharedActions,
  10: sharedActions,
  19: {
    ...sharedActions,
    hit1: { row: 4, holdTicks: [2, 2, 2, 1, 1, 8], loop: false },
  },
};

export const Stage21MonsterVisualProvenance = {
  6: { columns: 7, cellWidth: 300, cellHeight: 400, height: 130, offsetX: 0, offsetY: -55 },
  9: { columns: 6, cellWidth: 200, cellHeight: 200, height: 100, offsetX: 9, offsetY: -15 },
  10: { columns: 6, cellWidth: 200, cellHeight: 200, height: 100, offsetX: 22, offsetY: -17 },
  19: { columns: 6, cellWidth: 200, cellHeight: 200, height: 100, offsetX: -35, offsetY: -30 },
} as const;

export function createStage21MonsterVisual(
  enemyType: Stage21MonsterType,
): Stage21MonsterVisualModel {
  return {
    enemyType,
    action: 'wait',
    frameIndex: 0,
    actionTick: 0,
    frameTick: 0,
    elapsedMs: 0,
    attackSerial: 0,
    facingX: -1,
    completed: false,
  };
}

export function getStage21MonsterAtlasFrame(model: Stage21MonsterVisualModel): number {
  const definition = getStage21MonsterActionDefinition(model.enemyType, model.action);
  return definition.row * Stage21MonsterVisualProvenance[model.enemyType].columns + model.frameIndex;
}

export function getStage21MonsterActionDefinition(
  enemyType: Stage21MonsterType,
  action: Stage21MonsterAction,
): ActionDefinition {
  const definition = actionDefinitions[enemyType][action];
  if (!definition) throw new Error(`Stage 2-1 Monster${enemyType} has no ${action} action`);
  return definition;
}

export function getStage21MonsterSpriteOrigin(
  enemyType: Stage21MonsterType,
): Readonly<{ x: number; y: number }> {
  const provenance = Stage21MonsterVisualProvenance[enemyType];
  return {
    x: 0.5 + provenance.offsetX / provenance.cellWidth,
    y: 0.5 - provenance.offsetY / provenance.cellHeight,
  };
}

export function getStage21MonsterFootY(enemyType: Stage21MonsterType, rootY: number): number {
  return rootY + Stage21MonsterVisualProvenance[enemyType].height / 2;
}

export function chooseStage21MonsterAttack(
  enemyType: Stage21MonsterType,
  attackSerial: number,
): Stage21MonsterAction {
  if (enemyType !== 6) return 'hit1';
  const cycle = ((attackSerial - 1) % 3 + 3) % 3;
  return cycle === 1 ? 'hit2' : cycle === 2 ? 'hit3' : 'hit1';
}

export function isStage21MonsterAttackAction(action: Stage21MonsterAction): boolean {
  return isAttack(action);
}

export function updateStage21MonsterVisual(
  model: Stage21MonsterVisualModel,
  snapshot: Stage21MonsterVisualSnapshot,
  deltaMs: number,
): readonly Stage21AttackVisualEvent[] {
  model.facingX = snapshot.facingX;
  selectAction(model, snapshot);
  if (model.completed) return [];

  const events: Stage21AttackVisualEvent[] = [];
  model.elapsedMs += Math.max(0, deltaMs);
  while (model.elapsedMs + 0.0001 >= Stage21VisualTickMs && !model.completed) {
    model.elapsedMs -= Stage21VisualTickMs;
    model.actionTick += 1;
    events.push(...attackEventsAtTick(model));
    advanceFrame(model, snapshot);
  }
  return events;
}

function selectAction(
  model: Stage21MonsterVisualModel,
  snapshot: Stage21MonsterVisualSnapshot,
): void {
  if (snapshot.phase === 'dead') {
    if (model.action !== 'dead') startAction(model, 'dead');
    return;
  }
  if (snapshot.phase === 'hurt') {
    if (model.action !== 'hurt') startAction(model, 'hurt');
    return;
  }
  if (snapshot.attackSerial !== model.attackSerial) {
    model.attackSerial = snapshot.attackSerial;
    startAction(model, chooseStage21MonsterAttack(model.enemyType, snapshot.attackSerial));
    return;
  }
  if (isAttack(model.action) || model.action === 'hurt') return;
  const locomotion = snapshot.moving ? 'walk' : 'wait';
  if (model.action !== locomotion) startAction(model, locomotion);
}

function advanceFrame(
  model: Stage21MonsterVisualModel,
  snapshot: Stage21MonsterVisualSnapshot,
): void {
  const definition = getStage21MonsterActionDefinition(model.enemyType, model.action);
  model.frameTick += 1;
  if (model.frameTick < definition.holdTicks[model.frameIndex]!) return;
  model.frameTick = 0;
  model.frameIndex += 1;
  if (model.frameIndex < definition.holdTicks.length) return;
  if (definition.loop) {
    model.frameIndex = 0;
    model.actionTick = 0;
    return;
  }
  if (model.action === 'dead') {
    model.frameIndex = definition.holdTicks.length - 1;
    model.completed = true;
    return;
  }
  startAction(model, snapshot.moving ? 'walk' : 'wait');
}

function attackEventsAtTick(model: Stage21MonsterVisualModel): Stage21AttackVisualEvent[] {
  const direction = model.facingX;
  const side = (distance: number) => direction * distance;
  if (model.action === 'hit1' && model.actionTick === 7) {
    if (model.enemyType === 6) {
      return [event('monster6Hit1', side(155), -70, direction, 'physics', 157, 999)];
    }
    if (model.enemyType === 9) {
      return [event('monster9Hit1', side(85), -82, direction, 'physics', 90, 666)];
    }
    if (model.enemyType === 10) {
      return [event('monster10Hit1', side(65), -71, direction, 'physics', 90, 666)];
    }
    return [event('monster19Hit1', side(105), -30, direction, 'magic', 36, 999)];
  }
  if (model.action === 'hit2' && model.actionTick === 1) {
    return [event('monster6Hit2Start', side(45), -90, direction, 'magic', 112, 999)];
  }
  if (model.action === 'hit2' && model.actionTick === 44) {
    return [-200, 0, 200].map((offsetX) =>
      event('monster6Hit2Rain', offsetX, -500, direction, 'magic', 22, 4));
  }
  if (model.action === 'hit3' && model.actionTick === 16) {
    return [event('monster6Hit3', side(55), -95, direction, 'magic', 37, 12)];
  }
  return [];
}

function event(
  family: Stage21AttackFamily,
  offsetX: number,
  offsetY: number,
  facingX: -1 | 1,
  attackKind: AttackKind,
  damage: number,
  attackInterval: number,
): Stage21AttackVisualEvent {
  return { family, offsetX, offsetY, facingX, attackKind, damage, attackInterval };
}

function startAction(model: Stage21MonsterVisualModel, action: Stage21MonsterAction): void {
  model.action = action;
  model.frameIndex = 0;
  model.actionTick = 0;
  model.frameTick = 0;
  model.elapsedMs = 0;
  model.completed = false;
}

function isAttack(action: Stage21MonsterAction): boolean {
  return action === 'hit1' || action === 'hit2' || action === 'hit3';
}
