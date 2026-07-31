import type { Stage1EnemyAttackPhase, Stage1EnemyType } from './Stage1CombatSystem';

export type Stage12MonsterType = Extract<Stage1EnemyType, 2 | 4 | 7 | 8>;
export type Stage12MonsterAction = 'wait' | 'walk' | 'hurt' | 'dead' | 'hit1' | 'hit2';
export type Stage12AttackFamily =
  | 'monster2Hit1Start'
  | 'monster2Hit1End'
  | 'monster2Hit2'
  | 'monster4Hit1'
  | 'monster4Hit2Start'
  | 'monster4Hit2End'
  | 'monster7Hit1'
  | 'monster8Hit1'
  | 'monster8Hit2';

type ActionDefinition = Readonly<{
  row: number;
  holdTicks: readonly number[];
  frameOrder?: readonly number[];
  loop: boolean;
}>;

export type Stage12MonsterVisualModel = {
  enemyType: Stage12MonsterType;
  action: Stage12MonsterAction;
  frameIndex: number;
  actionTick: number;
  frameTick: number;
  elapsedMs: number;
  attackSerial: number;
  facingX: -1 | 1;
  completed: boolean;
};

export type Stage12MonsterVisualSnapshot = Readonly<{
  phase: Stage1EnemyAttackPhase;
  attackSerial: number;
  facingX: -1 | 1;
  moving: boolean;
}>;

export type Stage12AttackVisualEvent = Readonly<{
  family: Stage12AttackFamily;
  offsetX: number;
  offsetY: number;
  facingX: -1 | 1;
  disabled: boolean;
}>;

export const Stage12VisualTickMs = 1_000 / 30;

const common = {
  wait: { row: 0, holdTicks: [2, 2, 2, 3, 2, 4], loop: true },
  walk: { row: 1, holdTicks: [4, 4, 4, 4], loop: true },
  hurt: { row: 2, holdTicks: [15], loop: false },
} as const satisfies Record<string, ActionDefinition>;

const actionDefinitions: Record<
  Stage12MonsterType,
  Partial<Record<Stage12MonsterAction, ActionDefinition>>
> = {
  2: {
    ...common,
    dead: { row: 3, holdTicks: [2, 2, 2, 2, 2, 7], loop: false },
    hit1: { row: 4, holdTicks: [2, 2, 15, 16], loop: false },
    hit2: { row: 5, holdTicks: [2, 2, 2, 14], loop: false },
  },
  4: {
    wait: { row: 0, holdTicks: [2, 3, 4, 3, 3], loop: true },
    walk: common.walk,
    hurt: common.hurt,
    dead: { row: 3, holdTicks: [2, 2, 2, 2, 8], loop: false },
    hit1: { row: 4, holdTicks: [4, 4, 4, 2, 7], loop: false },
    hit2: { row: 5, holdTicks: [2, 2, 2, 2, 29, 23], loop: false },
  },
  7: {
    ...common,
    dead: { row: 3, holdTicks: [2, 2, 2, 2, 7], loop: false },
    hit1: { row: 4, holdTicks: [2, 2, 2, 4], loop: false },
  },
  8: {
    ...common,
    dead: { row: 3, holdTicks: [2, 2, 2, 2, 7], loop: false },
    hit1: { row: 4, holdTicks: [2, 2, 2, 2, 5], loop: false },
    hit2: {
      row: 5,
      holdTicks: [1, 1, 1, 1, 1, 1, 1, 1],
      frameOrder: [0, 1, 2, 3, 0, 1, 2, 3],
      loop: false,
    },
  },
};

export const Stage12MonsterVisualProvenance = {
  2: { columns: 6, cellWidth: 190, cellHeight: 190, offsetX: -20, offsetY: -10 },
  4: { columns: 6, cellWidth: 190, cellHeight: 190, offsetX: 0, offsetY: -10 },
  7: { columns: 6, cellWidth: 150, cellHeight: 150, offsetX: 3, offsetY: 0 },
  8: { columns: 6, cellWidth: 150, cellHeight: 150, offsetX: 14, offsetY: 7 },
} as const;

export function createStage12MonsterVisual(
  enemyType: Stage12MonsterType,
): Stage12MonsterVisualModel {
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

export function getStage12MonsterActionDefinition(
  enemyType: Stage12MonsterType,
  action: Stage12MonsterAction,
): ActionDefinition {
  const definition = actionDefinitions[enemyType][action];
  if (!definition) throw new Error(`Stage 1-2 Monster${enemyType} has no ${action} action`);
  return definition;
}

export function getStage12MonsterAtlasFrame(model: Stage12MonsterVisualModel): number {
  const definition = getStage12MonsterActionDefinition(model.enemyType, model.action);
  const visualFrame = definition.frameOrder?.[model.frameIndex] ?? model.frameIndex;
  return definition.row * Stage12MonsterVisualProvenance[model.enemyType].columns + visualFrame;
}

export function getStage12MonsterSpriteOrigin(
  enemyType: Stage12MonsterType,
): Readonly<{ x: number; y: number }> {
  const provenance = Stage12MonsterVisualProvenance[enemyType];
  return {
    x: 0.5 + provenance.offsetX / provenance.cellWidth,
    y: 0.5 - provenance.offsetY / provenance.cellHeight,
  };
}

export function chooseStage12MonsterAttack(
  enemyType: Stage12MonsterType,
  attackSerial: number,
): Stage12MonsterAction {
  if (enemyType === 7) return 'hit1';
  return attackSerial % 2 === 0 ? 'hit2' : 'hit1';
}

export function updateStage12MonsterVisual(
  model: Stage12MonsterVisualModel,
  snapshot: Stage12MonsterVisualSnapshot,
  deltaMs: number,
): readonly Stage12AttackVisualEvent[] {
  model.facingX = snapshot.facingX;
  selectAction(model, snapshot);
  if (model.completed) return [];

  const events: Stage12AttackVisualEvent[] = [];
  model.elapsedMs += Math.max(0, deltaMs);
  while (model.elapsedMs + 0.0001 >= Stage12VisualTickMs && !model.completed) {
    model.elapsedMs -= Stage12VisualTickMs;
    model.actionTick += 1;
    events.push(...attackEventsAtTick(model));
    advanceFrame(model, snapshot);
  }
  return events;
}

function selectAction(
  model: Stage12MonsterVisualModel,
  snapshot: Stage12MonsterVisualSnapshot,
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
    startAction(model, chooseStage12MonsterAttack(model.enemyType, snapshot.attackSerial));
    return;
  }
  if (model.action === 'hit1' || model.action === 'hit2' || model.action === 'hurt') return;
  const locomotion = snapshot.moving ? 'walk' : 'wait';
  if (model.action !== locomotion) startAction(model, locomotion);
}

function advanceFrame(
  model: Stage12MonsterVisualModel,
  snapshot: Stage12MonsterVisualSnapshot,
): void {
  const definition = getStage12MonsterActionDefinition(model.enemyType, model.action);
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

function attackEventsAtTick(model: Stage12MonsterVisualModel): Stage12AttackVisualEvent[] {
  const side = (distance: number) => model.facingX * distance;
  if (model.enemyType === 2 && model.action === 'hit1' && model.actionTick === 5) {
    return [event('monster2Hit1Start', side(-75), -100, model.facingX)];
  }
  if (model.enemyType === 2 && model.action === 'hit1' && model.actionTick === 20) {
    return [event('monster2Hit1End', side(90), -35, model.facingX)];
  }
  if (model.enemyType === 2 && model.action === 'hit2' && model.actionTick === 7) {
    return [event('monster2Hit2', side(35), -80, model.facingX)];
  }
  if (model.enemyType === 4 && model.action === 'hit1' && model.actionTick === 14) {
    return [event('monster4Hit1', side(155), 0, model.facingX)];
  }
  if (model.enemyType === 4 && model.action === 'hit2' && model.actionTick === 7) {
    return [event('monster4Hit2Start', side(40), -70, model.facingX, true)];
  }
  if (model.enemyType === 4 && model.action === 'hit2' && model.actionTick === 29) {
    return [event('monster4Hit2End', side(195), -50, model.facingX)];
  }
  if (model.enemyType === 7 && model.action === 'hit1' && model.actionTick === 5) {
    return [event('monster7Hit1', side(80), -86, model.facingX)];
  }
  if (model.enemyType === 8 && model.action === 'hit1' && model.actionTick === 9) {
    return [event('monster8Hit1', side(97), -85, model.facingX)];
  }
  if (model.enemyType === 8 && model.action === 'hit2' && model.actionTick === 1) {
    return [event('monster8Hit2', side(46), -30, model.facingX)];
  }
  return [];
}

function event(
  family: Stage12AttackFamily,
  offsetX: number,
  offsetY: number,
  facingX: -1 | 1,
  disabled = false,
): Stage12AttackVisualEvent {
  return { family, offsetX, offsetY, facingX, disabled };
}

function startAction(model: Stage12MonsterVisualModel, action: Stage12MonsterAction): void {
  model.action = action;
  model.frameIndex = 0;
  model.actionTick = 0;
  model.frameTick = 0;
  model.elapsedMs = 0;
  model.completed = false;
}
