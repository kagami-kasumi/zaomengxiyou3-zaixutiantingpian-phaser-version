import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { Stage11EntryScene } from './scenes/Stage11EntryScene';
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
  scene: [BootScene, Stage11EntryScene, TestScene],
};

new Phaser.Game(gameConfig);
