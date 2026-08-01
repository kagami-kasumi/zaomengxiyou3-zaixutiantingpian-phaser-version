import Phaser from 'phaser';
import type { PlayerInputState } from '../systems/InputSystem';
import type { LevelCompletionAttempt } from '../systems/LevelLifecycleSystem';
import { createLevelCompletionAttempt } from './LevelLifecycleBridge';

export type TransferDoorVisualDefinition = Readonly<{
  id: string;
  textureKey: string;
  sourcePackage: string;
  sourceSymbol: string;
  sourceCharacterIds: readonly number[];
  origin: Readonly<{ x: number; y: number }>;
  frames?: readonly string[];
  animationFrames?: readonly string[];
  frameRate?: number;
}>;

export type TransferDoorPlayer = Readonly<{
  view: Phaser.GameObjects.Image;
  input: PlayerInputState;
  eligible: boolean;
}>;

export type TransferDoorView = Readonly<{
  image: Phaser.GameObjects.Image;
  definition: TransferDoorVisualDefinition;
  setAvailable: (available: boolean) => void;
  createCompletionAttempt: (players: readonly TransferDoorPlayer[]) => LevelCompletionAttempt;
  destroy: () => void;
}>;

export function createTransferDoorView(
  scene: Phaser.Scene,
  definition: TransferDoorVisualDefinition,
  x: number,
  y: number,
): TransferDoorView {
  const image = scene.add.sprite(x, y, definition.textureKey)
    .setOrigin(definition.origin.x, definition.origin.y)
    .setName(definition.id)
    .setVisible(false);
  if (definition.animationFrames?.length) {
    const animationKey = `${definition.id}.active`;
    if (!scene.anims.exists(animationKey)) {
      scene.anims.create({
        key: animationKey,
        frames: definition.animationFrames.map((key) => ({ key })),
        frameRate: definition.frameRate ?? 20,
        repeat: -1,
      });
    }
    image.play(animationKey);
  }
  let available = false;
  let destroyed = false;
  return {
    image,
    definition,
    setAvailable: (next) => {
      if (destroyed || next === available) return;
      available = next;
      image.setVisible(next);
    },
    createCompletionAttempt: (players) => createLevelCompletionAttempt(
      available,
      image,
      players.map((player) => ({
        view: player.view,
        upPressed: player.input.up,
        eligible: player.eligible,
      })),
    ),
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      image.destroy();
    },
  };
}
