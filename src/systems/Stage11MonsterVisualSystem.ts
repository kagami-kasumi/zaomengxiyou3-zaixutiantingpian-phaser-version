import type { Monster3State } from './Monster3System';
import type { Monster30State } from './Monster30System';

export type Stage11MonsterType = 3 | 30;
export type Stage11MonsterAction = 'wait' | 'walk' | 'hurt' | 'dead' | 'hit1' | 'hit2';
export type Stage11MonsterRuntimeState = Monster3State | Monster30State;
export type Stage11AttackFamily = 'monster30Hit1' | 'monster3Hit1' | 'monster3Hit2';

type ActionDefinition = Readonly<{
  row: number;
  holdTicks: readonly number[];
  loop: boolean;
}>;

export type Stage11MonsterVisualModel = {
  enemyType: Stage11MonsterType;
  action: Stage11MonsterAction;
  frameIndex: number;
  actionTick: number;
  frameTick: number;
  elapsedMs: number;
  attackSerial: number;
  facingX: -1 | 1;
  completed: boolean;
};

export type Stage11MonsterVisualSnapshot = Readonly<{
  state: Stage11MonsterRuntimeState;
  attackSerial: number;
  facingX: -1 | 1;
}>;

export type Stage11AttackVisualEvent = Readonly<{
  family: Stage11AttackFamily;
  offsetX: number;
  offsetY: number;
  facingX: -1 | 1;
}>;

export const Stage11VisualTickMs = 1_000 / 30;

const monster3Actions = {
  wait: { row: 0, holdTicks: [2, 2, 2, 3, 2, 4], loop: true },
  walk: { row: 1, holdTicks: [4, 4, 4, 4], loop: true },
  hurt: { row: 2, holdTicks: [15], loop: false },
  dead: { row: 3, holdTicks: [2, 2, 2, 2, 2, 5], loop: false },
  hit1: { row: 4, holdTicks: [2, 2, 2, 1, 1, 7], loop: false },
  hit2: { row: 5, holdTicks: [2, 2, 1, 26], loop: false },
} as const satisfies Record<Stage11MonsterAction, ActionDefinition>;

const monster30Actions = {
  wait: { row: 0, holdTicks: [2, 2, 2, 2, 2, 2], loop: true },
  walk: { row: 0, holdTicks: [2, 2, 2, 2, 2, 2], loop: true },
  hurt: { row: 1, holdTicks: [15], loop: false },
  dead: { row: 2, holdTicks: [2, 2, 2, 2, 6], loop: false },
  hit1: { row: 3, holdTicks: [10], loop: false },
} as const satisfies Partial<Record<Stage11MonsterAction, ActionDefinition>>;

const actionDefinitions = {
  3: monster3Actions,
  30: monster30Actions,
} as const;

export const Stage11MonsterVisualProvenance = {
  3: {
    columns: 6,
    cellWidth: 180,
    cellHeight: 180,
    offsetX: 20,
    offsetY: -5,
    collisionRoot: 'ObjectBaseSprite',
    collisionBounds: { minX: -25, minY: -50, maxX: 24.95, maxY: 49.95 },
  },
  30: {
    columns: 6,
    cellWidth: 150,
    cellHeight: 150,
    offsetX: 5,
    offsetY: -2,
    collisionRoot: 'ObjectBaseSprite7',
    collisionBounds: { minX: -28.5, minY: -21, maxX: 28.475, maxY: 20.95 },
  },
} as const;

export function createStage11MonsterVisual(
  enemyType: Stage11MonsterType,
): Stage11MonsterVisualModel {
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

export function getStage11MonsterActionDefinition(
  enemyType: Stage11MonsterType,
  action: Stage11MonsterAction,
): ActionDefinition {
  const definition = actionDefinitions[enemyType][action as keyof typeof actionDefinitions[typeof enemyType]];
  if (!definition) throw new Error(`Stage 1-1 Monster${enemyType} has no ${action} action`);
  return definition;
}

export function getStage11MonsterAtlasFrame(model: Stage11MonsterVisualModel): number {
  const definition = getStage11MonsterActionDefinition(model.enemyType, model.action);
  return definition.row * Stage11MonsterVisualProvenance[model.enemyType].columns + model.frameIndex;
}

export function getStage11MonsterSpriteOrigin(
  enemyType: Stage11MonsterType,
): Readonly<{ x: number; y: number }> {
  const provenance = Stage11MonsterVisualProvenance[enemyType];
  return {
    x: 0.5 + provenance.offsetX / provenance.cellWidth,
    y: 0.5 - provenance.offsetY / provenance.cellHeight,
  };
}

export function updateStage11MonsterVisual(
  model: Stage11MonsterVisualModel,
  snapshot: Stage11MonsterVisualSnapshot,
  deltaMs: number,
): readonly Stage11AttackVisualEvent[] {
  model.facingX = snapshot.facingX;
  selectAction(model, snapshot);
  if (model.completed) return [];

  const events: Stage11AttackVisualEvent[] = [];
  model.elapsedMs += Math.max(0, deltaMs);
  while (model.elapsedMs + 0.0001 >= Stage11VisualTickMs && !model.completed) {
    model.elapsedMs -= Stage11VisualTickMs;
    model.actionTick += 1;
    events.push(...attackEventsAtTick(model));
    advanceFrame(model, snapshot);
  }
  return events;
}

function selectAction(
  model: Stage11MonsterVisualModel,
  snapshot: Stage11MonsterVisualSnapshot,
): void {
  if (snapshot.state === 'dead' || snapshot.state === 'removed') {
    if (model.action !== 'dead') startAction(model, 'dead');
    return;
  }
  if (snapshot.state === 'hurt') {
    if (model.action !== 'hurt') startAction(model, 'hurt');
    return;
  }
  if (
    snapshot.attackSerial !== model.attackSerial
    && (snapshot.state === 'hit1' || snapshot.state === 'hit2')
  ) {
    model.attackSerial = snapshot.attackSerial;
    startAction(model, snapshot.state);
    return;
  }
  if (isAttack(model.action) || model.action === 'hurt') return;
  const locomotion = snapshot.state === 'walk' ? 'walk' : 'wait';
  if (model.action !== locomotion) startAction(model, locomotion);
}

function advanceFrame(
  model: Stage11MonsterVisualModel,
  snapshot: Stage11MonsterVisualSnapshot,
): void {
  const definition = getStage11MonsterActionDefinition(model.enemyType, model.action);
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
  startAction(model, snapshot.state === 'walk' ? 'walk' : 'wait');
}

function attackEventsAtTick(model: Stage11MonsterVisualModel): Stage11AttackVisualEvent[] {
  if (model.enemyType === 30 && model.action === 'hit1' && model.actionTick === 1) {
    return [{ family: 'monster30Hit1', offsetX: 0, offsetY: 0, facingX: model.facingX }];
  }
  if (model.enemyType === 3 && model.action === 'hit1' && model.actionTick === 7) {
    return [{
      family: 'monster3Hit1',
      offsetX: model.facingX * 105,
      offsetY: -60,
      facingX: model.facingX,
    }];
  }
  if (model.enemyType === 3 && model.action === 'hit2' && model.actionTick === 6) {
    return [{
      family: 'monster3Hit2',
      offsetX: model.facingX * 155,
      offsetY: -30,
      facingX: model.facingX,
    }];
  }
  return [];
}

function startAction(model: Stage11MonsterVisualModel, action: Stage11MonsterAction): void {
  model.action = action;
  model.frameIndex = 0;
  model.actionTick = 0;
  model.frameTick = 0;
  model.elapsedMs = 0;
  model.completed = false;
}

function isAttack(action: Stage11MonsterAction): boolean {
  return action === 'hit1' || action === 'hit2';
}
