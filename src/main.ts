import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { FeatureUiScene } from './scenes/FeatureUiScene';
import { HeavenMapScene } from './scenes/HeavenMapScene';
import { SaveSlotScene } from './scenes/SaveSlotScene';
import { Stage11EntryScene } from './scenes/Stage11EntryScene';
import { Stage12Scene } from './scenes/Stage12Scene';
import { Stage13Scene } from './scenes/Stage13Scene';
import { Stage21Scene } from './scenes/Stage21Scene';
import { Stage22DevScene } from './scenes/Stage22DevScene';
import { Stage22Scene } from './scenes/Stage22Scene';
import { Stage51TransitionScene } from './scenes/Stage51TransitionScene';
import { TestScene } from './scenes/TestScene';
import './styles.css';

const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: 940,
  height: 590,
  backgroundColor: '#101724',
  pixelArt: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, SaveSlotScene, HeavenMapScene, FeatureUiScene, Stage11EntryScene, TestScene, Stage12Scene, Stage13Scene, Stage21Scene, Stage22Scene, Stage22DevScene, Stage51TransitionScene],
};

export const game = new Phaser.Game(gameConfig);
if (import.meta.env.DEV) {
  Reflect.set(document.getElementById('game')!, 'phaserGame', game);
}
