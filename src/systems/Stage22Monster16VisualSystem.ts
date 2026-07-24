import type { Stage1EnemyAttackPhase } from './Stage1CombatSystem';
import type { AttackKind } from './CombatSystem';

export type Monster16Action =
  | 'wait'
  | 'walk'
  | 'hurt'
  | 'dead'
  | 'hit1'
  | 'hit2'
  | 'hit3'
  | 'hit4';

export type Monster16AttackFamily =
  | 'monster16Hit1'
  | 'monster16Hit2Start'
  | 'monster16Hit2Followup'
  | 'monster16Hit3'
  | 'monster16Hit4Start'
  | 'monster16Hit4Followup';

type ActionDefinition = Readonly<{
  row: number;
  holdTicks: readonly number[];
  loop: boolean;
}>;

export type Monster16VisualModel = {
  action: Monster16Action;
  frameIndex: number;
  actionTick: number;
  frameTick: number;
  elapsedMs: number;
  attackSerial: number;
  facingX: -1 | 1;
  completed: boolean;
};

export type Monster16VisualSnapshot = Readonly<{
  phase: Stage1EnemyAttackPhase;
  attackSerial: number;
  attackAction?: string;
  facingX: -1 | 1;
  moving: boolean;
}>;

export type Monster16AttackVisualEvent = Readonly<{
  family: Monster16AttackFamily;
  offsetX: number;
  offsetY: number;
  facingX: -1 | 1;
  attackKind: AttackKind;
  damage: number;
  attackInterval: number;
  followOwner: boolean;
  lifetimeMs?: number;
}>;

export const Monster16VisualTickMs = 1_000 / 30;
export const Monster16BodyHeight = 170;

const actions: Record<Monster16Action, ActionDefinition> = {
  wait: { row: 0, holdTicks: [2, 2, 2, 3, 2, 4], loop: true },
  walk: { row: 1, holdTicks: [4, 4, 4, 4], loop: true },
  hurt: { row: 2, holdTicks: [15], loop: false },
  dead: { row: 3, holdTicks: [2, 2, 2, 2, 7], loop: false },
  hit1: { row: 4, holdTicks: [2, 2, 2, 2, 2, 10], loop: false },
  hit2: { row: 5, holdTicks: [2, 2, 2, 30], loop: false },
  hit3: { row: 6, holdTicks: [2, 2, 2, 2, 2, 20], loop: false },
  hit4: { row: 7, holdTicks: [2, 2, 2, 25], loop: false },
};

export function createMonster16Visual(): Monster16VisualModel {
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

export function getMonster16AtlasFrame(model: Monster16VisualModel): number {
  return actions[model.action].row * 6 + model.frameIndex;
}

export function getMonster16SpriteOrigin(): Readonly<{ x: number; y: number }> {
  return { x: 0.5, y: 0.5 + 20 / 300 };
}

export function isMonster16AttackAction(action: Monster16Action): boolean {
  return action === 'hit1' || action === 'hit2' || action === 'hit3' || action === 'hit4';
}

export function updateMonster16Visual(
  model: Monster16VisualModel,
  snapshot: Monster16VisualSnapshot,
  deltaMs: number,
): readonly Monster16AttackVisualEvent[] {
  model.facingX = snapshot.facingX;
  selectAction(model, snapshot);
  if (model.completed) return [];
  const events: Monster16AttackVisualEvent[] = [];
  model.elapsedMs += Math.max(0, deltaMs);
  while (model.elapsedMs + 0.0001 >= Monster16VisualTickMs && !model.completed) {
    model.elapsedMs -= Monster16VisualTickMs;
    model.actionTick += 1;
    events.push(...attackEventsAtTick(model));
    advanceFrame(model, snapshot);
  }
  return events;
}

function selectAction(model: Monster16VisualModel, snapshot: Monster16VisualSnapshot): void {
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
    startAction(model, normalizeAttack(snapshot.attackAction, snapshot.attackSerial));
    return;
  }
  if (isMonster16AttackAction(model.action) || model.action === 'hurt') return;
  const locomotion = snapshot.moving ? 'walk' : 'wait';
  if (model.action !== locomotion) startAction(model, locomotion);
}

function normalizeAttack(action: string | undefined, serial: number): Monster16Action {
  if (action === 'hit1' || action === 'hit2' || action === 'hit3' || action === 'hit4') return action;
  const cycle = ((serial - 1) % 4 + 4) % 4;
  return cycle === 1 ? 'hit2' : cycle === 2 ? 'hit3' : cycle === 3 ? 'hit4' : 'hit1';
}

function advanceFrame(model: Monster16VisualModel, snapshot: Monster16VisualSnapshot): void {
  const definition = actions[model.action];
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

function attackEventsAtTick(model: Monster16VisualModel): readonly Monster16AttackVisualEvent[] {
  const side = (distance: number) => model.facingX * distance;
  if (model.action === 'hit1' && model.actionTick === 3) {
    return [event('monster16Hit1', side(240), -40, model.facingX, 'physics', 185, 999)];
  }
  if (model.action === 'hit2' && model.actionTick === 7) {
    return [event('monster16Hit2Start', side(210), -105, model.facingX, 'magic', 68, 999)];
  }
  if (model.action === 'hit2' && model.actionTick === 34) {
    return [event('monster16Hit2Followup', side(260), -40, model.facingX, 'magic', 68, 999)];
  }
  if (model.action === 'hit3' && model.actionTick === 11) {
    return [{
      ...event('monster16Hit3', side(140), -210, model.facingX, 'magic', 47.6, 24),
      followOwner: true,
      lifetimeMs: 7_000,
    }];
  }
  if (model.action === 'hit4' && model.actionTick === 1) {
    return [event('monster16Hit4Start', side(200), -150, model.facingX, 'magic', 57.6, 24)];
  }
  if (model.action === 'hit4' && model.actionTick === 7) {
    return [event('monster16Hit4Followup', side(200), -140, model.facingX, 'magic', 57.6, 24)];
  }
  return [];
}

function event(
  family: Monster16AttackFamily,
  offsetX: number,
  offsetY: number,
  facingX: -1 | 1,
  attackKind: AttackKind,
  damage: number,
  attackInterval: number,
): Monster16AttackVisualEvent {
  return {
    family,
    offsetX,
    offsetY,
    facingX,
    attackKind,
    damage,
    attackInterval,
    followOwner: false,
  };
}

function startAction(model: Monster16VisualModel, action: Monster16Action): void {
  model.action = action;
  model.frameIndex = 0;
  model.actionTick = 0;
  model.frameTick = 0;
  model.elapsedMs = 0;
  model.completed = false;
}
