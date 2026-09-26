import Phaser from 'phaser';
import { createFormalPetHorseBodyBridge } from '../src/scenes/FormalPetHorseBodyBridge';
import { createFormalPetMonkeyBodyBridge } from '../src/scenes/FormalPetMonkeyBodyBridge';
import { getPetHorseEffectUsage } from '../src/assets/PetHorseAnimationAssets';
import { getPetMonkeyEffectUsages } from '../src/assets/PetMonkeyAnimationAssets';
import type { ProjectileModel } from '../src/systems/ProjectileTypes';

type Input = { id: string; family: string; symbol: string; assetKey: string; phaseTick: number;
  rootFrame: number; direction: number; original: string; sourceSha256: string; crop: { left: number; top: number } };
const status = document.querySelector('#status')!, report = document.querySelector('#report')!;
const button = document.querySelector<HTMLButtonElement>('#run')!;
const renderer = new URLSearchParams(location.search).get('renderer') === 'canvas' ? 'canvas' : 'webgl';
const roundPixels = new URLSearchParams(location.search).get('roundPixels') !== 'false';
const inputs: { cases: Input[] } = await fetch('./inputs.json').then(r => r.json());
const rasters = new Map<string, Promise<HTMLImageElement>>();
function image(path: string) {
  let result = rasters.get(path);
  if (!result) {
    result = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(Error(path)); img.src = path;
    });
    rasters.set(path, result);
  }
  return result;
}
function canvas() {
  const c = document.createElement('canvas'); c.width = 940; c.height = 590;
  return c.getContext('2d', { willReadFrequently: true })!;
}
const actualContext = canvas(), expectedContext = canvas();
class Probe extends Phaser.Scene {
  preload() {
    const assets = new Map<string, string>();
    for (const input of inputs.cases) {
      if (input.family === 'horse') {
        for (const f of getPetHorseEffectUsage(input.assetKey)!.asset.frames) assets.set(f.key, f.path);
      } else {
        for (const usage of getPetMonkeyEffectUsages(input.assetKey)) {
          usage.asset.frameKeys.forEach((key, i) => assets.set(key, usage.asset.framePaths[i]!));
          for (const f of usage.nativeDisplay.frames) assets.set(f.key, f.path);
        }
      }
    }
    for (const [key, path] of assets) this.load.image(key, '/'+path.replace(/^\/+/, ''));
  }
  create() {
    const horse = createFormalPetHorseBodyBridge(this), monkey = createFormalPetMonkeyBodyBridge(this);
    button.disabled = false; status.textContent = `${renderer}: 已加载，${inputs.cases.length} 个原生 EXIT 状态待验证。`;
    const frame = () => new Promise<void>(resolve => this.game.events.once('postrender', resolve));
    button.onclick = async () => {
      button.disabled = true;
      const results: any[] = [];
      let residualPixels = 0, maxAlphaError = 0, maxPremultipliedError = 0;
      try {
        for (const [index, input] of inputs.cases.entries()) {
          horse.update([], [], 0); monkey.update([], [], 0);
          const p = { id: index+1, sourceId: 'fixture', assetKey: input.assetKey, sourceSymbol: input.symbol,
            x: 470, y: 300, facingX: -input.direction, petRenderDirection: input.direction,
            petHostTick: input.phaseTick, petNativeFrame: () => input.rootFrame,
            petNativePhaseTick: () => input.phaseTick, elapsedMs: 0, isExpired: false } as unknown as ProjectileModel;
          (input.family === 'horse' ? horse : monkey).update([], [p], 0);
          const original = await image(input.original);
          await frame();
          const snapshot = new Image();
          await new Promise<void>((resolve, reject) => {
            snapshot.onload = () => resolve(); snapshot.onerror = reject; snapshot.src = this.game.canvas.toDataURL('image/png');
          });
          actualContext.clearRect(0,0,940,590); actualContext.drawImage(snapshot,0,0);
          expectedContext.clearRect(0,0,940,590);
          expectedContext.save(); expectedContext.translate(470,300); expectedContext.scale(input.direction,1);
          expectedContext.drawImage(original,input.crop.left,input.crop.top); expectedContext.restore();
          const actual = actualContext.getImageData(0,0,940,590).data;
          const expected = expectedContext.getImageData(0,0,940,590).data;
          let bad = 0, residual = 0, alphaError = 0, premultipliedError = 0;
          for (let n = 0; n < actual.length; n += 4) {
            const da = Math.abs(actual[n+3]! - expected[n+3]!);
            let dc = 0;
            for (let c = 0; c < 3; c++) dc = Math.max(dc,
              Math.abs(actual[n+c]! * actual[n+3]! / 255 - expected[n+c]! * expected[n+3]! / 255));
            if (da || dc) residual++;
            if (da > 2 || dc > 2) bad++;
            alphaError = Math.max(alphaError, da); premultipliedError = Math.max(premultipliedError, dc);
          }
          results.push({ id: input.id, badPixels: bad, residualPixels: residual, alphaError, premultipliedError });
          residualPixels += residual; maxAlphaError = Math.max(maxAlphaError, alphaError);
          maxPremultipliedError = Math.max(maxPremultipliedError, premultipliedError);
          if (index % 16 === 0) status.textContent = `${renderer}: ${index+1}/${inputs.cases.length}，不符 ${results.filter(r => r.badPixels).length}`;
        }
        const failures = results.filter(r => r.badPixels);
        const output = { status: failures.length ? 'failed' : 'passed', renderer, roundPixels, cases: results.length,
          failedCases: failures.length, residualPixels, maxAlphaError, maxPremultipliedError,
          tolerance: 'At most 2/255 per alpha or premultiplied RGB channel; geometry/coverage errors are not waived.',
          scope: 'Actual Phaser shared effect views and GPU/Canvas pixels versus independently captured native EXIT rasters. Isolated effects, not full Scene/HP or body animation.',
          failures: failures.slice(0, 12), results };
        report.textContent = JSON.stringify(output, null, 2);
        status.textContent = `${renderer}: ${output.status}，${results.length} 状态，${failures.length} 不符。`;
      } catch (error) {
        status.textContent = '验证出错'; report.textContent = String(error instanceof Error ? error.stack : error);
      } finally { horse.update([], [], 0); monkey.update([], [], 0); button.disabled = false; }
    };
  }
}
new Phaser.Game({ type: renderer === 'canvas' ? Phaser.CANVAS : Phaser.WEBGL, width: 940, height: 590,
  parent: 'game', transparent: true, pixelArt: false, roundPixels, banner: false,
  audio: { noAudio: true }, fps: { target: 60 }, render: { preserveDrawingBuffer: true }, scene: [Probe] });
