import { game } from '../src/main';
import { readIncomingDamageFeedbackTrace } from '../src/scenes/IncomingDamageFeedbackBridge';
import { readHeroPartyPresentationSnapshot } from '../src/scenes/HeroPartyRuntimeBridge';

// Test-only browser entry: real application entrypoint, scenes, assets and gameplay.
// Exposes inspection and deterministic frame/input driving, never fabricated damage events.
let time = 0;
Object.assign(window, { incomingGameProbe: {
  snapshot: () => {
    const scene = game.scene.getScenes(true).find(s => !['BootScene', 'FeatureUiScene'].includes(s.scene.key));
    if (!scene) return { scene: undefined };
    return { scene: scene.scene.key, loading: scene.load.isLoading(), timeMs: scene.time.now, camera: { x: scene.cameras.main.scrollX, y: scene.cameras.main.scrollY },
      heroes: readHeroPartyPresentationSnapshot(scene),
      trace: readIncomingDamageFeedbackTrace(scene),
      objects: scene.children.list.filter(o => o.name.startsWith('IncomingDamage:')).map(o => {
        const c = o as Phaser.GameObjects.Container;
        return { name: c.name, x: c.x, y: c.y, scaleX: c.scaleX, alpha: c.alpha,
          event: c.getData('incomingDamage'), glyphs: c.list.map(g => (g as Phaser.GameObjects.Image).texture.key) };
      }),
      pets: JSON.parse(game.canvas.dataset.petDragonQa ?? 'null'),
    };
  },
  stop: () => { time = game.loop.now; game.loop.stop(); },
  step: (count: number) => {
    for (let i = 0; i < count; i++) { time += 1000 / 30; game.step(time, 1000 / 30); }
  },
  keys: (codes: number[], down: boolean) => {
    for (const scene of game.scene.getScenes(true)) for (const code of codes) {
      const key = scene.input.keyboard?.addKey(code); if (key) key.isDown = down;
    }
  },
  image: () => game.canvas.toDataURL('image/png'),
  restart: () => {
    const scene = game.scene.getScenes(true).find(s => readHeroPartyPresentationSnapshot(s));
    scene?.scene.restart(scene.sys.settings.data);
  },
  returnToSaves: () => { game.scene.getScenes(true).find(s => readHeroPartyPresentationSnapshot(s))?.scene.start('SaveSlotScene'); },
} });
