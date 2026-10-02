import Phaser from 'phaser';
import { installCanvasSpriteExtentFix } from '../src/core/PhaserCanvasSprite';
import { petAttachedDisplayLifecycle } from '../src/scenes/PetAttachedDisplayLifecycle';
import { createFormalPetMonkeyBodyBridge } from '../src/scenes/FormalPetMonkeyBodyBridge';
import { createFormalPetHorseBodyBridge } from '../src/scenes/FormalPetHorseBodyBridge';
import { petMonkeyBodyAssets } from '../src/assets/PetMonkeyAnimationAssets';
import { petHorseBodyAssets } from '../src/assets/PetHorseAnimationAssets';

const inputs = await fetch('/inputs.json').then(r => r.json());
const renderer = new URLSearchParams(location.search).get('renderer') === 'canvas' ? Phaser.CANVAS : Phaser.WEBGL;
function ensure(ok: unknown, label: string): asserts ok { if (!ok) throw Error(label); }
function canvas() { const c = document.createElement('canvas'); c.width = 940; c.height = 590; return c.getContext('2d', { willReadFrequently: true })!; }
const expected = canvas(), actual = canvas();
class Probe extends Phaser.Scene {
  preload() {
    for (const [key, path] of Object.entries(inputs.images)) this.load.image(key, path as string);
    for (const asset of [petMonkeyBodyAssets[1], petHorseBodyAssets[1]]) {
      this.load.spritesheet(asset.key, '/' + asset.path.replace(/^\/+/, ''), { frameWidth: asset.cellWidth, frameHeight: asset.cellHeight });
    }
  }
  create() {
    if ((window as any).restartOnly) { (window as any).restartComplete = true; return; }
    setTimeout(() => this.run().then(result => (window as any).result = result).catch(e => (window as any).result = { error: e.stack }), 0);
  }
  async run() {
    this.game.loop.stop();
    let time = this.game.loop.now;
    const step = (delta: number) => { time += delta; this.game.step(time, delta); };
    const results: any[] = [];
    for (const family of ['monkey', 'horse']) for (const input of new URLSearchParams(location.search).has('journeyOnly') ? [] : inputs.cases) {
      const baselineListeners = this.game.events.listenerCount('prestep');
      const bridge = family === 'monkey' ? createFormalPetMonkeyBodyBridge(this) : createFormalPetHorseBodyBridge(this);
      const lifecycle = petAttachedDisplayLifecycle(this);
      const slot = input.owner === 1 ? 'p1' : 'p2', key = family + ':' + input.id;
      const members: any[] = [{ slot, pet: { id: key, species: family, form: 1 }, snapshot: {
        runtime: { runtimeKey: key, x: input.x, y: 350, facingX: input.direction === 0 ? 1 : -1 },
        animation: { action: 'wait', row: 0, column: 0, keyFrameIndex: 0, complete: false },
      } }];
      bridge.update(members, [], 0);
      const root = this.children.list.find(o => o instanceof Phaser.GameObjects.Container) as Phaser.GameObjects.Container;
      ensure(root, 'actual adapter root');
      const body = root.list[0] as Phaser.GameObjects.Sprite;
      ensure(body.texture.key.startsWith('pet'), 'real body texture');
      // The original 244 oracle intentionally excludes host bodies. Isolate the
      // attachment layer for comparison, while retaining the actual body object.
      body.setVisible(false);
      const image = this.add.image(0, 0, input.frames[0].key).setOrigin(0, 0);
      lifecycle.attach(key, input.effect, { object: image, display: elapsed => {
        const frame = Math.floor(elapsed * 24 / 1000 + 1e-8);
        if (frame >= 99) return false;
        const f = input.frames[frame];
        image.setTexture(f.key).setPosition(f.crop.left - input.x, f.crop.top - 350);
        return true;
      } });
      let maxChannel = 0, badPixels = 0, residualPixels = 0;
      for (const row of input.rows) {
        if (row.tick > 1) step(1000 / 24);
        if (row.tick === 3 && input.scenario === 'host-destroy') {
          // Exercise the real adapter rest path; it must retire this root.
          bridge.update([], [], time);
          ensure(!body.scene, 'body removed at retirement');
          ensure(!!image.scene, 'attachment retained at retirement');
        }
        if (row.tick === 3 && input.scenario === 'world-pause') this.scene.pause();
        if (row.tick === 41 && input.scenario === 'world-pause') this.scene.resume();
        step(0);
        const bitmap = await createImageBitmap(this.game.canvas);
        actual.clearRect(0, 0, 940, 590); actual.drawImage(bitmap, 0, 0); bitmap.close();
        expected.clearRect(0, 0, 940, 590);
        expected.drawImage(this.textures.get(row.key).getSourceImage() as HTMLImageElement, row.crop.left, row.crop.top);
        const a = actual.getImageData(0, 0, 940, 590).data, b = expected.getImageData(0, 0, 940, 590).data;
        const wordsA = new Uint32Array(a.buffer), wordsB = new Uint32Array(b.buffer);
        let bad = 0, residual = 0, max = 0;
        for (let i = 0; i < a.length; i += 4) {
          if (wordsA[i / 4] === wordsB[i / 4]) continue;
          let d = Math.abs(a[i + 3]! - b[i + 3]!);
          for (let c = 0; c < 3; c++) d = Math.max(d, Math.abs(a[i + c]! * a[i + 3]! / 255 - b[i + c]! * b[i + 3]! / 255));
          if (d > 0) residual++; if (d > 3) bad++; max = Math.max(max, d);
        }
        maxChannel = Math.max(maxChannel, max); badPixels += bad; residualPixels += residual;
        ensure(bad === 0, `${family}/${input.id}/${row.tick}: pixels=${bad} max=${max}`);
        if (input.scenario === 'host-destroy' && row.tick === 12 && input.owner === 1 && input.direction === 0) {
          (window as any).representative = this.game.canvas.toDataURL('image/png');
        }
        if (row.tick % 8 === 0) await new Promise(resolve => setTimeout(resolve, 0));
      }
      bridge.destroy(); bridge.destroy();
      ensure(lifecycle.snapshot().length === 0, 'adapter disposal clears retired roots');
      step(0);
      lifecycle.destroy(); lifecycle.destroy();
      ensure(this.game.events.listenerCount('prestep') === baselineListeners, 'no display listener leak');
      ensure(this.children.list.length === 0, 'no display object leak');
      results.push({ family, id: input.id, states: input.rows.length, maxChannel, badPixels, residualPixels });
    }
    const journeys: any[] = [];
    for (const family of ['monkey', 'horse']) {
      const baselineDisplayListeners = this.game.events.listenerCount('prestep');
      const create = family === 'monkey' ? createFormalPetMonkeyBodyBridge : createFormalPetHorseBodyBridge;
      const bridge = create(this), lifecycle = petAttachedDisplayLifecycle(this);
      const member = (slot: string, key: string, x: number): any => ({ slot, pet: { id: 'same-roster-id', species: family, form: 1 },
        snapshot: { runtime: { runtimeKey: key, x, y: 350, facingX: 1 }, animation: { action: 'wait', row: 0, column: 0, keyFrameIndex: 0 } } });
      const members = [member('p1', 'owner1-old', 350), member('p2', 'owner2', 550)];
      bridge.update(members, [], time);
      const roots = this.children.list.filter(o => o instanceof Phaser.GameObjects.Container) as Phaser.GameObjects.Container[];
      const bodies = roots.map(root => root.list[0] as Phaser.GameObjects.Sprite);
      roots.forEach((root, i) => {
        bodies[i]!.setVisible(false);
        const f = inputs.cases[0].frames[0];
        lifecycle.attach(members[i].snapshot.runtime.runtimeKey, 'sxkb', {
          object: this.add.image(f.crop.left - 350, f.crop.top - 350, f.key).setOrigin(0, 0), display: () => true,
        });
      });
      step(100);
      bridge.update([members[1]], [], time);
      ensure(!bodies[0]!.scene && !!bodies[1]!.scene, 'retirement releases only its body');
      step(100);
      ensure(roots[0]!.alpha < 1 && roots[1]!.alpha === 1, 'simultaneous owners isolated');
      members[0] = member('p1', 'owner1-new', 250);
      bridge.update(members, [], time);
      ensure(lifecycle.snapshot().length === 3, 'same pet id / new runtime retains old display independently');
      ensure(roots[0]!.x === 350, 'retired world registration does not follow new pet');
      bridge.destroy(); bridge.destroy(); step(0);
      ensure(!lifecycle.snapshot().length && this.children.list.length === 0, 'adapter exit clears current and retired displays');
      // An actual Phaser restart must invoke shutdown even while the Scene is
      // paused. Reuse the same Scene instance, matching formal retry semantics.
      const retryBridge = create(this);
      retryBridge.update([member('p1', 'before-retry', 350)], [], time);
      const f = inputs.cases[0].frames[0];
      lifecycle.attach('before-retry', 'sxkb', { object: this.add.image(0, 0, f.key), display: () => true });
      retryBridge.update([], [], time);
      (window as any).restartOnly = true; (window as any).restartComplete = false;
      this.scene.pause(); this.scene.restart(); step(0);
      for (let i = 0; i < 100 && !(window as any).restartComplete; i++) { await new Promise(r => setTimeout(r, 10)); step(0); }
      ensure((window as any).restartComplete, 'actual Phaser restart completed');
      ensure(!lifecycle.snapshot().length, 'retry disposes old lifecycle');
      ensure(this.game.events.listenerCount('prestep') === baselineDisplayListeners,
        `retry removes old display listener: ${this.game.events.listenerCount('prestep')} / ${baselineDisplayListeners}`);
      retryBridge.destroy();
      const restarted = create(this), fresh = petAttachedDisplayLifecycle(this);
      restarted.update([member('p1', 'after-retry', 350)], [], time);
      ensure(fresh !== lifecycle && fresh.snapshot().length === 1, 'same Scene gets fresh display owner');
      restarted.destroy(); fresh.destroy(); step(0);
      const pixels = this.game.canvas.getContext('2d') as CanvasRenderingContext2D | null;
      if (pixels) ensure(!pixels.getImageData(0, 0, 940, 590).data.some((value, i) => i % 4 === 3 && value), 'Canvas exit is transparent');
      journeys.push({ family, simultaneousOwners: true, samePetNewRuntime: true, actualSceneRestart: true, cleanup: true });
    }
    return { status: 'passed', renderer, results, journeys };
  }
}
new Phaser.Game({ type: renderer, width: 940, height: 590, transparent: true, banner: false,
  audio: { noAudio: true }, render: { roundPixels: false, antialias: false, preserveDrawingBuffer: true },
  callbacks: { postBoot: installCanvasSpriteExtentFix }, scene: Probe });
