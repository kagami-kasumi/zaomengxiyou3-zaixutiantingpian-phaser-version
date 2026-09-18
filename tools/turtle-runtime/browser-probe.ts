import Phaser from 'phaser';
import { ensureSceneAssetBundle } from '../../src/scenes/SceneAssetBundleBridge';
import { requireTurtleAssets, hasTurtleAssets } from '../../src/scenes/PetTurtleAssetBridge';
import { createPetTurtlePresentationBridge } from '../../src/scenes/PetTurtlePresentationBridge';
import { petTurtleBundleAssets, turtleAssetKey, turtleManifest } from '../../src/assets/PetTurtleAssetCatalog';

declare global { interface Window { turtleProbe: Record<string, unknown>; turtleDisplayRows: Record<string, unknown>[];
  turtleShow: (id: string) => void;
  turtleShowNative: (url?: string) => Promise<void>; } }
window.turtleProbe = { state: 'loading' };
window.turtleDisplayRows = [];
const pause = () => new Promise<void>(resolve => setTimeout(resolve, 0));
const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
interface NativeVisual {
  mode: string; nativeId: string; nativeSha256: string; expectedSha256: string; nativeUrl: string;
  approvedPixels: { x: number; y: number; candidate: number[] }[];
}
function canvasContext() {
  const canvas = document.createElement('canvas'); canvas.width = 940; canvas.height = 590;
  return canvas.getContext('2d', { willReadFrequently: true })!;
}
let shutdownRejected = false;
class CancelledLoad extends Phaser.Scene {
  constructor() { super('CancelledTurtleLoad'); }
  create() {
    const request = ensureSceneAssetBundle(this, 'pet-turtle');
    setTimeout(() => this.scene.stop(), 1);
    void request.then(() => { throw new Error('Stopped scene published resources'); }).catch(error => {
      shutdownRejected = /shut down|cancelled/.test(String(error)) && !hasTurtleAssets(this);
      this.game.scene.start('TurtleResourceProbe');
    });
  }
}
async function hash(bytes: Uint8Array) {
  const copy = new Uint8Array(bytes.length); copy.set(bytes);
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', copy))).map(n => n.toString(16).padStart(2, '0')).join('');
}
async function verifySceneReentry(parent: Phaser.Scene) {
  const assets = requireTurtleAssets(parent), key = 'TurtleResourceReentry';
  let complete: () => void, fail: (error: unknown) => void, loads = 0;
  class Reentry extends Phaser.Scene {
    constructor() { super(key); }
    create() {
      this.load.on('filecomplete', () => loads++);
      void ensureSceneAssetBundle(this, 'pet-turtle').then(async () => {
        assert(requireTurtleAssets(this) === assets, 'restarted scene lost shared asset identity');
        const view = createPetTurtlePresentationBridge(this, assets);
        view.update('body:turtle1-r0-c0-d0-P1');
        await new Promise<void>(resolve => {
          this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => resolve());
          this.scene.stop();
        });
        assert(!this.textures.getTextureKeys().some(k => k.startsWith('pet-turtle-presentation:')), 'shutdown retained presentation texture');
        let rejected = false; try { view.update('body:turtle1-r0-c0-d0-P1'); } catch { rejected = true; }
        assert(rejected, 'scene shutdown did not release presenter');
        complete();
      }).catch(error => fail(error));
    }
  }
  parent.game.scene.add(key, new Reentry());
  for (let entry = 0; entry < 2; entry++) {
    const finished = new Promise<void>((resolve, reject) => { complete = resolve; fail = reject; });
    parent.game.scene.start(key); await finished;
  }
  parent.game.scene.remove(key);
  assert(loads === 0, 'restarted scene reloaded cached turtle resources');
}
class Probe extends Phaser.Scene {
  constructor() { super('TurtleResourceProbe'); }
  create() { void this.run().catch(error => { window.turtleProbe = { state: 'failed', error: String(error), stack: error.stack }; }); }
  private async run() {
    assert(shutdownRejected, 'scene shutdown did not reject incomplete load');
    let files = 0;
    this.load.on('filecomplete', () => files++);
    // Corrupt bytes after actual HTTP load, before production decoder. A retry must
    // fetch the invalidated transaction, rather than return a false cache hit.
    this.load.once('complete', () => this.cache.binary.add(turtleAssetKey(turtleManifest.packages.body.path), new ArrayBuffer(3)));
    let failure = false;
    try { await ensureSceneAssetBundle(this, 'pet-turtle'); } catch { failure = true; }
    assert(failure && !hasTurtleAssets(this), 'corrupt package was published as ready');
    assert(petTurtleBundleAssets.every(a => !this.cache.binary.exists(a.key)), 'failed transaction retained bytes');
    const start = files;
    await Promise.all([ensureSceneAssetBundle(this, 'pet-turtle'), ensureSceneAssetBundle(this, 'pet-turtle')]);
    assert(files - start === 650, 'concurrent requests loaded duplicate assets');
    const assets = requireTurtleAssets(this), loaded = files;
    await ensureSceneAssetBundle(this, 'pet-turtle');
    assert(files === loaded && assets === requireTurtleAssets(this), 'repeat entry lost shared resource identity');
    await verifySceneReentry(this);
    if (new URLSearchParams(location.search).has('lifecycleOnly')) {
      window.turtleProbe = { state: 'passed', mode: 'lifecycle', files, sceneRestartIdentity: true,
        shutdownPresenterReleased: true, shutdownRejected, repeatCacheIdentity: true,
        failedDecodeRetried: true, concurrentDeduplicated: true };
      return;
    }
    const presenter = createPetTurtlePresentationBridge(this, assets);
    window.turtleShow = id => { presenter.update(id); };
    const oracle = await (await fetch('./visual-oracle.json')).json() as NativeVisual[];
    const expected = new Map(oracle.map(r => [`${r.mode}:${r.nativeId}`, r]));
    const native = canvasContext(), displayed = canvasContext();
    const nativeTexture = this.textures.addCanvas('turtle-native-oracle', native.canvas)!;
    const nativeView = this.add.image(0, 0, nativeTexture).setOrigin(0, 0).setDepth(1000).setVisible(false);
    const showNative = (visible: boolean) => {
      nativeView.setVisible(visible);
      for (const child of this.children.list) if (child.name.startsWith('pet-turtle-presentation:')) {
        (child as Phaser.GameObjects.Image).setVisible(!visible);
      }
    };
    const readDisplay = async () => {
      await new Promise<void>(resolve => this.game.events.once(Phaser.Core.Events.POST_RENDER, () => resolve()));
      displayed.clearRect(0, 0, 940, 590); displayed.drawImage(this.game.canvas, 0, 0);
      return displayed.getImageData(0, 0, 940, 590).data;
    };
    let count = 0;
    for (const [mode, pack] of assets.packages) for (const state of pack.states) {
      const reference = expected.get(`${mode}:${state.nativeId}`)!;
      assert(/^[a-f0-9]{64}$/.test(reference.nativeSha256), 'missing independent native digest');
      const nativeImage = new Image(); nativeImage.src = reference.nativeUrl; await nativeImage.decode();
      native.clearRect(0, 0, 940, 590); native.drawImage(nativeImage, 0, 0);
      for (const pixel of reference.approvedPixels) {
        const data = native.createImageData(1, 1); data.data.set(pixel.candidate);
        native.putImageData(data, pixel.x, pixel.y);
      }
      // Render the independent native PNG with the same display backend. Mixing
      // WebGL and Canvas 2D here introduces unrelated one-channel rounding.
      nativeTexture.refresh(); showNative(true);
      const nativePixels = await readDisplay();
      showNative(false);
      const bytes = presenter.update(state.id);
      assert(await hash(bytes) === reference.expectedSha256, `browser native projection ${state.id}`);
      const actualPixels = await readDisplay();
      const actualDisplaySha256 = await hash(new Uint8Array(actualPixels.buffer));
      const nativeDisplaySha256 = await hash(new Uint8Array(nativePixels.buffer));
      if (actualDisplaySha256 !== nativeDisplaySha256) {
        let different = 0, maxDelta = 0; const examples = [];
        for (let i = 0; i < actualPixels.length; i += 4) {
          if (actualPixels.slice(i, i + 4).some((v, j) => v !== nativePixels[i + j])) {
            different++; for (let c = 0; c < 4; c++) maxDelta = Math.max(maxDelta, Math.abs(actualPixels[i + c]! - nativePixels[i + c]!));
            if (examples.length < 5) examples.push({ x: i / 4 % 940, y: Math.floor(i / 4 / 940), a: [...actualPixels.slice(i, i + 4)], b: [...nativePixels.slice(i, i + 4)] });
          }
        }
        throw new Error(`Phaser displayed native pixels ${state.id}: ${JSON.stringify({ renderer: this.game.renderer.type, different, maxDelta, examples })}`);
      }
      window.turtleDisplayRows.push({ stateId: state.id, actualDisplaySha256, nativeDisplaySha256,
        differentDisplayPixels: 0, approvedSourcePixels: reference.approvedPixels.length });
      count++;
      if (count % 100 === 0) { window.turtleProbe = { state: 'verifying', count, files }; await pause(); }
    }
    assert(count === 11572, 'browser state coverage');
    presenter.destroy(); presenter.destroy();
    assert(!this.textures.getTextureKeys().some(k => k.startsWith('pet-turtle-presentation:')), 'presentation texture leak');
    let released = false; try { presenter.update(assets.states.keys().next().value!); } catch { released = true; }
    assert(released, 'released presenter still renders');
    const again = createPetTurtlePresentationBridge(this, assets);
    window.turtleShow = id => { again.update(id); };
    window.turtleShowNative = async url => {
      if (!url) { showNative(false); return; }
      const reference = new Image(); reference.src = url; await reference.decode();
      native.clearRect(0, 0, 940, 590); native.drawImage(reference, 0, 0);
      nativeTexture.refresh(); showNative(true);
    };
    again.update('body:turtle4-r0-c0-d0-P2');
    const samples = [...assets.states.values()].filter(s => s.groups.length > 1 && s.groups.some(g => g.paintParts.length > 1));
    window.turtleProbe = { state: 'passed', count, displayedStates: count,
      renderer: this.game.renderer.type === Phaser.WEBGL ? 'Phaser WebGL' : 'Phaser Canvas',
      files, failedDecodeRetried: true, concurrentDeduplicated: true,
      repeatCacheIdentity: true, sceneRestartIdentity: true, shutdownPresenterReleased: true,
      shutdownRejected, releasedPresenterRejected: true, sample: samples[0]?.id,
      frames: ['body:turtle4-r0-c0-d0-P2', samples[0]?.id,
        [...assets.states.keys()].find(id => id.startsWith('buff:') && id.endsWith(':40'))] };
  }
}
new Phaser.Game({ type: Phaser.AUTO, width: 940, height: 590, backgroundColor: '#101724',
  pixelArt: false, roundPixels: true, banner: false, audio: { noAudio: true },
  scene: [CancelledLoad, Probe], render: { preserveDrawingBuffer: true }, fps: { target: 60 } });
