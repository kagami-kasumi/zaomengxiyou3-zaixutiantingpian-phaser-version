import type { Stage1EnemyAttackPhase } from './Stage1CombatSystem';

export type Stage13Monster5Action = 'wait' | 'walk' | 'hurt' | 'dead' | 'hit1' | 'hit2' | 'hit3';
export type Stage13Monster5AttackFamily =
  | 'monster5Hit1'
  | 'monster5Hit2Start'
  | 'monster5Hit2End'
  | 'monster5Hit3';

type ActionDefinition = Readonly<{
  row: number;
  holdTicks: readonly number[];
  frameOrder?: readonly number[];
  loop: boolean;
}>;

export type Stage13Monster5VisualModel = {
  action: Stage13Monster5Action;
  frameIndex: number;
  actionTick: number;
  frameTick: number;
  elapsedMs: number;
  attackSerial: number;
  facingX: -1 | 1;
  completed: boolean;
};

export type Stage13Monster5VisualSnapshot = Readonly<{
  phase: Stage1EnemyAttackPhase;
  attackSerial: number;
  facingX: -1 | 1;
  moving: boolean;
}>;

export type Stage13Monster5AttackVisualEvent = Readonly<{
  family: Stage13Monster5AttackFamily;
  offsetX: number;
  offsetY: number;
  facingX: -1 | 1;
}>;

export const Stage13Monster5VisualTickMs = 1_000 / 30;

const actionDefinitions = {
  wait: { row: 0, holdTicks: [2, 2, 2, 3, 2, 4], loop: true },
  walk: { row: 1, holdTicks: [4, 4, 4, 4], loop: true },
  hurt: { row: 2, holdTicks: [15], loop: false },
  dead: { row: 3, holdTicks: [2, 2, 2, 2, 2, 14], loop: false },
  hit1: { row: 4, holdTicks: [2, 2, 2, 2, 7], loop: false },
  hit2: { row: 5, holdTicks: [2, 2, 9, 2, 12], loop: false },
  hit3: {
    row: 6,
    holdTicks: Array.from({ length: 16 }, () => 1),
    frameOrder: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3, 0, 1, 2, 3],
    loop: false,
  },
} as const satisfies Record<Stage13Monster5Action, ActionDefinition>;

export const Stage13Monster5VisualProvenance = {
  columns: 6,
  cellWidth: 350,
  cellHeight: 350,
  offsetX: 30,
  offsetY: -55,
  collisionRoot: 'ObjectBaseSprite2',
  collisionBounds: { minX: -30, minY: -65, maxX: 29.95, maxY: 64.95 },
} as const;

export function createStage13Monster5Visual(): Stage13Monster5VisualModel {
  return {
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

export function getStage13Monster5ActionDefinition(
  action: Stage13Monster5Action,
): ActionDefinition {
  return actionDefinitions[action];
}

export function getStage13Monster5AtlasFrame(model: Stage13Monster5VisualModel): number {
  const definition: ActionDefinition = actionDefinitions[model.action];
  const visualFrame = definition.frameOrder?.[model.frameIndex] ?? model.frameIndex;
  return definition.row * Stage13Monster5VisualProvenance.columns + visualFrame;
}

export function getStage13Monster5SpriteOrigin(): Readonly<{ x: number; y: number }> {
  const source = Stage13Monster5VisualProvenance;
  return {
    x: 0.5 + source.offsetX / source.cellWidth,
    y: 0.5 - source.offsetY / source.cellHeight,
  };
}

export function chooseStage13Monster5Attack(attackSerial: number): Stage13Monster5Action {
  const phase = attackSerial % 3;
  return phase === 1 ? 'hit1' : phase === 2 ? 'hit2' : 'hit3';
}

export function updateStage13Monster5Visual(
  model: Stage13Monster5VisualModel,
  snapshot: Stage13Monster5VisualSnapshot,
  deltaMs: number,
): readonly Stage13Monster5AttackVisualEvent[] {
  model.facingX = snapshot.facingX;
  selectAction(model, snapshot);
  if (model.completed) return [];
  const events: Stage13Monster5AttackVisualEvent[] = [];
  model.elapsedMs += Math.max(0, deltaMs);
  while (model.elapsedMs + 0.0001 >= Stage13Monster5VisualTickMs && !model.completed) {
    model.elapsedMs -= Stage13Monster5VisualTickMs;
    model.actionTick += 1;
    events.push(...attackEventsAtTick(model));
    advanceFrame(model, snapshot);
  }
  return events;
}

function selectAction(
  model: Stage13Monster5VisualModel,
  snapshot: Stage13Monster5VisualSnapshot,
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
    startAction(model, chooseStage13Monster5Attack(snapshot.attackSerial));
    return;
  }
  if (isAttack(model.action) || model.action === 'hurt') return;
  const locomotion = snapshot.moving ? 'walk' : 'wait';
  if (model.action !== locomotion) startAction(model, locomotion);
}

function advanceFrame(
  model: Stage13Monster5VisualModel,
  snapshot: Stage13Monster5VisualSnapshot,
): void {
  const definition = actionDefinitions[model.action];
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

function attackEventsAtTick(
  model: Stage13Monster5VisualModel,
): readonly Stage13Monster5AttackVisualEvent[] {
  const side = (distance: number) => model.facingX * distance;
  if (model.action === 'hit1' && model.actionTick === 7) {
    return [event('monster5Hit1', side(155), -165, model.facingX)];
  }
  if (model.action === 'hit2' && model.actionTick === 5) {
    return [event('monster5Hit2Start', side(75), -280, model.facingX)];
  }
  if (model.action === 'hit2' && model.actionTick === 15) {
    return [event('monster5Hit2End', side(245), -95, model.facingX)];
  }
  if (model.action === 'hit3' && model.actionTick === 1) {
    return [event('monster5Hit3', side(210), -80, model.facingX)];
  }
  return [];
}

function event(
  family: Stage13Monster5AttackFamily,
  offsetX: number,
  offsetY: number,
  facingX: -1 | 1,
): Stage13Monster5AttackVisualEvent {
  return { family, offsetX, offsetY, facingX };
}

function startAction(model: Stage13Monster5VisualModel, action: Stage13Monster5Action): void {
  model.action = action;
  model.frameIndex = 0;
  model.actionTick = 0;
  model.frameTick = 0;
  model.elapsedMs = 0;
  model.completed = false;
}

function isAttack(action: Stage13Monster5Action): boolean {
  return action === 'hit1' || action === 'hit2' || action === 'hit3';
}
