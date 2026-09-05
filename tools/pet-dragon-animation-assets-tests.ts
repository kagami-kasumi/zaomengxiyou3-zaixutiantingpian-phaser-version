import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import truth from '../docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json';
import index from '../docs/tasks/evidence/TASK-SETTINGS-213/baseline-index.json';
import files from '../src/assets/PetDragonAssetFiles.json';
import { getPetDragonBodyAsset, getPetDragonBodyAction, getPetDragonBodyFrame,
  getPetDragonBodyPlacement, getPetDragonEffectFrame, getPetDragonEffectPlacement,
  getPetDragonCollision, petDragonBundleAssets } from '../src/assets/PetDragonAnimationAssets';
import { requireRuntimeAssetOwner } from '../src/systems/AssetBundleCoordinator';

assert.equal(files.files.length, 153);
for (const file of files.files) {
  assert.equal(requireRuntimeAssetOwner(file.key), 'combat-common');
  assert.equal(createHash('sha256').update(readFileSync(`public${file.path}`)).digest('hex'), file.sha256);
}
assert.equal(new Set(petDragonBundleAssets.map((a) => a.path)).size, files.files.length);
let ticks = 0;
for (const timeline of truth.visualTruth.bodyTimelines) {
  const form = timeline.form;
  const asset = getPetDragonBodyAsset(form);
  assert.equal(getPetDragonCollision(form).forms.includes(`dragon${form}`), true);
  for (const action of timeline.actions) {
    for (const cell of action.cells) {
      for (let tick = cell.firstHostTick; tick <= cell.lastHostTick; tick++) {
        const frame = getPetDragonBodyFrame(form, action.id, tick - 1);
        assert.equal(frame.frame, action.row * asset.columns + cell.column);
        assert.equal(frame.remainingHoldCount, cell.lastHostTick - tick + 1);
        assert.equal(frame.complete, false);
        ticks++;
      }
    }
    const end = getPetDragonBodyFrame(form, action.id, action.totalHostTicks);
    assert.equal(end.complete, !action.loops);
    assert.equal(end.column, action.loops ? 0 : action.cells.length - 1);
  }
}
assert.throws(() => getPetDragonBodyAsset(0));
assert.throws(() => getPetDragonBodyAction(1, 'qlaoyi'));
assert.throws(() => getPetDragonEffectFrame('PetDragonBullet4', 49));
assert.throws(() => getPetDragonBodyFrame(1, 'wait', NaN));

const root = index.stage.fixtureRoot;
type Layer = { path: string; x: number; y: number; flipX: boolean; crop?: number[]; alpha?: number; key: string };
function bodyLayer(form: number, action: string, column: number, direction: 'left' | 'right', at = root, alpha = 1): Layer {
  const asset = getPetDragonBodyAsset(form);
  const cell = getPetDragonBodyAction(form, action);
  return { path: asset.path, key: asset.key, ...getPetDragonBodyPlacement(form, direction, at), alpha,
    crop: [column * asset.cellWidth, cell.row * asset.cellHeight, (column + 1) * asset.cellWidth, (cell.row + 1) * asset.cellHeight] };
}
function effectLayer(symbol: string, frame: number, direction: 'left' | 'right', offset = { x: 0, y: 0 }): Layer {
  const asset = getPetDragonEffectFrame(symbol, frame);
  return { path: asset.path, key: asset.key, ...getPetDragonEffectPlacement(symbol, frame, direction, root, offset) };
}
const projections = index.items.map((state) => {
  const direction = state.id.endsWith('.right') ? 'right' : 'left';
  let layers: Layer[];
  if ('bodyCell' in state && state.bodyCell) {
    const cell = state.bodyCell;
    layers = [bodyLayer(cell.form, cell.action, cell.column, direction)];
  } else if (/^dragon[1-4]\./u.test(state.id)) {
    const [, digit, action] = state.id.match(/^dragon([1-4])\.(.+)\.(left|right)$/u)!;
    const form = Number(digit);
    if (action === 'fs-clone-active') {
      // Same deterministic clone fixture as the frozen original baseline, not a runtime spawn rule.
      layers = [bodyLayer(form, 'wait', 0, direction, { x: 370, y: 300 }, truth.forms[form - 1].actions.fs.cloneAlpha)];
    } else {
      const body = getPetDragonBodyAction(form, action);
      const cast = truth.forms[form - 1].actions[action as 'normal'];
      const column = ['wait', 'walk', 'hurt'].includes(action) ? 0
        : action === 'normal' ? cast.emitTiming.sequence : body.cells.length - 1;
      layers = [bodyLayer(form, action, column, direction)];
    }
  } else if (state.id.includes('nine-object-wave')) {
    const action = truth.forms[2].actions.ltwj;
    layers = action.waves.flatMap((wave) => wave.offsets.map(([x, y]) =>
      effectLayer(action.projectile, 1, direction, { x: x + action.emit.x, y: y + action.emit.y })));
  } else if (state.id.includes('aoyi-buff')) {
    const frame = Number(state.id.match(/frame(\d+)/u)![1]);
    layers = [effectLayer('AoyiBuff', frame, direction)];
  } else {
    const [, digit, name, number] = state.id.match(/^dragon([1-4])-(.+)\.frame(\d+)\./u)!;
    const form = truth.forms[Number(digit) - 1];
    const action = form.actions[name as 'normal'];
    const offsetX = typeof action.emit.x === 'number' ? action.emit.x : Number(action.emit.x.match(/(\d+)/u)![1]);
    layers = [effectLayer(action.projectile, Number(number), direction, { x: offsetX, y: action.emit.y })];
  }
  return { id: state.id, baseline: state.path, layers };
});
assert.equal(projections.length, 345);
mkdirSync('docs/tasks/evidence/TASK-SLICE-214A', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-214A/asset-projections.json', JSON.stringify({
  truthId: truth.truthId, scope: 'object projection through production asset queries; not a formal gameplay run', ticksChecked: ticks, projections,
}, null, 2) + '\n');
console.log(`dragon asset queries passed: 153 exact files, 345 projections, ${ticks} host ticks, unique combat-common owner`);
