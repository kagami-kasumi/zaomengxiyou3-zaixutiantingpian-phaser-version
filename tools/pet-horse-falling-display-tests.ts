import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { readFileSync } from 'node:fs';
import { createFormalPetHorseBodyBridge } from '../src/scenes/FormalPetHorseBodyBridge';
import { getPetHorseEffectUsage } from '../src/assets/PetHorseAnimationAssets';
import { requireRuntimeAssetOwner } from '../src/systems/AssetBundleCoordinator';
import { createPetWorldDisplayBridge } from '../src/scenes/PetWorldDisplayBridge';
import { bindMonkeyHorseNativeClipClock } from '../src/systems/PetMonkeyHorseNativeClipClock';

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'));
const native = read('local-resources/regima/task-outputs/TASK-SLICE-226/horse-aoyi-collision-source/measurement.json');
const truth = read('docs/reverse-engineering/ground-truth/manifests/task-settings-229-pet-horse-collision-phase.json').naturalDisplay;
const phases = new Map<number, number>();
for (const row of native.cases) {
  const frame = JSON.parse(row.phaseKey.split('|')[1]).children[0].frame;
  if (phases.has(row.tick)) assert.equal(phases.get(row.tick), frame);
  phases.set(row.tick, frame);
}
const usage = getPetHorseEffectUsage('pet-skill.horse4.tmaoyi')!;
for (let frame = 1; frame <= 8; frame++) {
  const original = truth.baselines.find((b: any) => b.path.endsWith(`/PetHorse4Bullet5-_1_${frame}_.png`));
  const asset = usage.asset.frames[frame - 1]!;
  assert.equal(createHash('sha256').update(readFileSync(`public/${asset.path}`)).digest('hex'), original.sha256);
  assert.equal(requireRuntimeAssetOwner(asset.key), 'pet-monkey-horse');
  assert.deepEqual(asset.registrationOrigin, { x: -original.crop.left / original.width, y: -original.crop.top / original.height });
}
let checked = 0;
for (const fps of [20, 24, 30]) for (const owner of ['p1', 'p2']) {
  const images: any[] = [], events = new EventEmitter();
  const scene: any = { game: { events, loop: { targetFps: fps } }, add: { image(x: number, y: number, key: string) {
    const image: any = { x, y, key };
    image.setTexture = (key: string) => { image.key = key; return image; };
    image.setOrigin = (x: number, y: number) => { image.origin = { x, y }; return image; };
    image.setPosition = (x: number, y: number) => { image.x = x; image.y = y; return image; };
    for (const method of ['setDepth', 'setFlipX', 'setScale']) image[method] = () => image;
    image.destroy = () => { image.destroyed = true; };
    images.push(image); return image;
  } } };
  const bridge = createFormalPetHorseBodyBridge(scene);
  const p: any = { id: 1, sourceId: `${owner}-horse4`, assetKey: 'pet-skill.horse4.tmaoyi',
    sourceSymbol: 'PetHorse4Bullet5', x: 300, y: -80, petHostTick: 0, elapsedMs: 0, isExpired: false };
  for (const [tick, frame] of phases) {
    p.petHostTick = tick; p.elapsedMs = tick * 1000 / fps; p.y += 1;
    bridge.update([], [p], p.elapsedMs);
    assert.equal(images[0].key, `pet-horse-aoyi-falling-${frame}`, `${fps}/${owner}/${tick}`);
    const baseline = truth.baselines.find((b: any) => b.path.endsWith(`/PetHorse4Bullet5-_1_${frame}_.png`));
    assert.deepEqual(images[0].origin, { x: -baseline.crop.left / baseline.width, y: -baseline.crop.top / baseline.height });
    assert.equal(images[0].x, p.x); assert.equal(images[0].y, p.y);
    checked++;
  }
  p.petHostTick = 321;
  assert.throws(() => bridge.update([], [p], p.elapsedMs), /Unknown horse display phase/);
  bridge.destroy();
  assert.equal(images[0].destroyed, true); assert.equal(events.listenerCount('poststep'), 0);
  // Keep the combat age frozen while the actual Game bridge and view continue.
  const clock = createPetWorldDisplayBridge(scene), pausedView = createFormalPetHorseBodyBridge(scene);
  p.petHostTick = 2; p.elapsedMs = 2 * 1000 / fps;
  bindMonkeyHorseNativeClipClock(p, { pet: { species: 'horse' }, projectileCombat: { displayTick: clock.readTick } } as any);
  pausedView.update([], [p], p.elapsedMs);
  for (const [tick, frame] of phases) {
    if (tick > 0) events.emit('prestep', tick * 1000 / fps, 1000 / fps);
    events.emit('poststep', tick * 1000 / fps, 1000 / fps);
    assert.equal(images[1].key, `pet-horse-aoyi-falling-${frame}`, `paused/${fps}/${owner}/${tick}`);
    assert.equal(p.petHostTick, 2);
  }
  pausedView.destroy(); clock.destroy();
  assert.equal(images[1].destroyed, true);
  assert.equal(events.listenerCount('poststep'), 0); assert.equal(events.listenerCount('prestep'), 0);
}
console.log(`Horse falling view: ${checked} native host phases and ${checked} display-only paused phases, eight original rasters/registrations and shared bundle passed; full lifecycle/canvas excluded.`);
