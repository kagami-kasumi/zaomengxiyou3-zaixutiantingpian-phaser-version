// boundary: this module projects verified monkey animation truth into Phaser;
// pet ownership, combat, damage, cooldowns, and save state remain with existing systems.
import Phaser from 'phaser';
import {
  getPetMonkeyBodyActionForProjectile,
  petMonkeyBodyAssets,
  type PetMonkeyBodyAction,
} from '../assets/PetMonkeyAnimationAssets';
import type { PetRuntimeModel, PetState } from '../systems/PetTypes';
import type { ProjectileModel } from '../systems/ProjectileSystem';

export type PetMonkeyAnimationView = Readonly<{
  kind: 'monkey-native';
  root: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite;
  petId: string;
  form: 1 | 2 | 3 | 4;
  runtime: PetMonkeyAnimationClock;
}>;

export type PetMonkeyAnimationClock = {
  action: string;
  actionStartedMs: number;
  lastHp: number;
  lastProjectileId?: number;
  deadFinished: boolean;
};

export function isSupportedPetMonkey(pet: Pick<PetState, 'species' | 'form'>): boolean {
  return pet.species === 'monkey' && Number.isInteger(pet.form) && pet.form >= 1 && pet.form <= 4;
}

export function createPetMonkeyAnimationView(
  scene: Phaser.Scene,
  pet: PetState,
  x: number,
  y: number,
  timeMs = scene.time.now,
): PetMonkeyAnimationView {
  if (!isSupportedPetMonkey(pet)) throw new Error(`Unsupported monkey form ${pet.form}.`);
  const form = pet.form as 1 | 2 | 3 | 4;
  const asset = petMonkeyBodyAssets[form];
  const root = scene.add.container(x, y).setDepth(42);
  const sprite = scene.add.sprite(0, 0, asset.key, 0)
    .setOrigin(asset.registrationOrigin.x, asset.registrationOrigin.y);
  root.add(sprite);
  return {
    kind: 'monkey-native',
    root,
    sprite,
    petId: pet.id,
    form,
    runtime: {
      action: 'wait',
      actionStartedMs: timeMs,
      lastHp: pet.hp,
      deadFinished: false,
    },
  };
}

export function syncPetMonkeyAnimationView(
  view: PetMonkeyAnimationView,
  pet: PetState,
  runtime: PetRuntimeModel,
  projectiles: readonly ProjectileModel[],
  timeMs: number,
  hostFps: number,
): void {
  const asset = petMonkeyBodyAssets[view.form];
  view.root.setPosition(runtime.x, runtime.y);
  view.sprite.setFlipX(runtime.facingX > 0);

  const newestProjectile = projectiles
    .filter((projectile) => projectile.sourceId === pet.id)
    .sort((left, right) => right.id - left.id)[0];
  const projectileAction = newestProjectile
    ? getPetMonkeyBodyActionForProjectile(view.form, newestProjectile.assetKey)
    : undefined;
  if (pet.hp <= 0) {
    startAction(view.runtime, 'dead', timeMs);
  } else if (pet.hp < view.runtime.lastHp) {
    startAction(view.runtime, 'hurt', timeMs);
  } else if (
    projectileAction
    && newestProjectile
    && newestProjectile.id !== view.runtime.lastProjectileId
  ) {
    startAction(view.runtime, projectileAction, timeMs);
    view.runtime.lastProjectileId = newestProjectile.id;
  }
  view.runtime.lastHp = pet.hp;

  let action = asset.actions[view.runtime.action];
  if (!action) {
    startAction(view.runtime, runtime.state === 'follow' ? 'walk' : 'wait', timeMs);
    action = asset.actions[view.runtime.action];
  }
  if (!action) throw new Error(`Monkey form ${view.form} has no ${view.runtime.action} truth action.`);

  const tickMs = 1000 / normalizeHostFps(hostFps);
  let elapsedTicks = Math.max(0, Math.floor((timeMs - view.runtime.actionStartedMs) / tickMs));
  const totalTicks = action.holds.reduce((sum, hold) => sum + hold, 0);
  if (!action.loops && elapsedTicks >= totalTicks) {
    if (action.id === 'dead') {
      view.runtime.deadFinished = true;
      view.sprite.setVisible(false);
      return;
    }
    startAction(view.runtime, runtime.state === 'follow' ? 'walk' : 'wait', timeMs);
    action = asset.actions[view.runtime.action]!;
    elapsedTicks = 0;
  }
  view.sprite.setVisible(true);
  const actionTick = action.loops && totalTicks > 0 ? elapsedTicks % totalTicks : elapsedTicks;
  const sequence = getSequenceAtTick(action, actionTick);
  const frame = action.row * asset.columns + action.cells[sequence]!;
  view.sprite.setFrame(frame);
  view.root.setData('petMonkeyTruthState', `body.monkey${view.form}.${action.id}.seq${String(sequence + 1).padStart(2, '0')}.${runtime.facingX > 0 ? 'right' : 'left'}`);
}

function startAction(clock: PetMonkeyAnimationClock, action: string, timeMs: number): void {
  if (clock.action === 'dead' && action !== 'dead') return;
  if (clock.action === action && action === 'dead') return;
  clock.action = action;
  clock.actionStartedMs = timeMs;
  clock.deadFinished = false;
}

function getSequenceAtTick(action: PetMonkeyBodyAction, tick: number): number {
  let cursor = 0;
  for (let index = 0; index < action.holds.length; index += 1) {
    cursor += action.holds[index]!;
    if (tick < cursor) return index;
  }
  return action.holds.length - 1;
}

function normalizeHostFps(value: number): number {
  if (value <= 22) return 20;
  if (value <= 27) return 24;
  return 30;
}
