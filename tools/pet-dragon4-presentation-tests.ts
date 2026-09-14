import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createPetDragonPresentationBridge } from '../src/scenes/PetDragonPresentationBridge';
import { getPetDragonBodyAsset, getPetDragonBodyAction } from '../src/assets/PetDragonAnimationAssets';
import index from '../docs/tasks/evidence/TASK-SETTINGS-213/baseline-index.json';
import catalog from '../src/assets/PetDragonAssetFiles.json';

const displays: any[] = [];
const add = (x: number, y: number, key: string) => {
  const d: any = { x, y, key, alpha: 1, frame: 0, destroyed: false };
  for (const [method, property] of [['setName', 'name'], ['setDepth', 'depth'], ['setFlipX', 'flipX'],
    ['setAlpha', 'alpha'], ['setFrame', 'frame'], ['setTexture', 'key']]) d[method!] = (v: unknown) => { d[property!] = v; return d; };
  d.setOrigin = (x: number, y: number) => { d.origin = [x, y]; return d; };
  d.setPosition = (x: number, y: number) => { d.x = x; d.y = y; return d; };
  d.setData = () => d; d.destroy = () => { d.destroyed = true; };
  displays.push(d); return d;
};
const view = createPetDragonPresentationBridge({ add: { sprite: add, image: add } } as any);
const projections: any[] = [];
for (const state of index.items.filter(state => state.id.startsWith('dragon4'))) {
  const facingX = state.id.endsWith('.right') ? 1 : -1;
  const clone = state.id.includes('fs-clone');
  const effect = state.id.startsWith('dragon4-');
  const bodyCell = 'bodyCell' in state ? state.bodyCell : undefined;
  const action = effect || clone ? 'wait' : bodyCell?.action ?? state.id.split('.')[1]!;
  const asset = getPetDragonBodyAsset(4), timeline = getPetDragonBodyAction(4, action);
  const column = bodyCell?.column ?? (['wait', 'walk', 'hurt'].includes(action) ? 0
    : action === 'normal' ? 2 : action === 'qlaoyi' || action === 'sdcc' ? 0 : timeline.cells.length - 1);
  const entity = { petId: 'pet', species: 'dragon', form: 4,
    runtime: { runtimeKey: 'root', x: clone ? 370 : 470, y: clone ? 300 : 350, facingX },
    animation: { row: timeline.row, column }, ...(clone ? { parentRuntimeKey: 'parent' } : {}) };
  const symbol = state.id.includes('aoyi-buff') ? 'AoyiBuff' : 'PetDragonBullet4';
  const frame = effect ? Number(state.id.match(/frame(\d+)/u)![1]) : 0;
  view.update([clone ? { summons: [entity] } : entity] as any, effect ? [{ id: 1, sourceId: 'pet',
    sourceSymbol: symbol, petHostTick: frame, x: 470, y: 350, facingX }] as any : []);
  const layers = displays.filter(d => !d.destroyed && d.name.startsWith(effect ? 'PetDragonProjectile' : 'PetDragonBody')).map(d => {
    assert.deepEqual(d.origin, [0, 0]);
    const file = catalog.files.find(f => f.key === d.key)!;
    return { path: file.path, key: d.key, x: d.x, y: d.y, flipX: d.flipX, alpha: d.alpha,
      ...(effect ? {} : { crop: [d.frame % asset.columns * asset.cellWidth, Math.floor(d.frame / asset.columns) * asset.cellHeight,
        (d.frame % asset.columns + 1) * asset.cellWidth, (Math.floor(d.frame / asset.columns) + 1) * asset.cellHeight] }) };
  });
  assert.equal(layers.length, 1, state.id);
  projections.push({ id: state.id, baseline: state.path, layers });
  view.update([], []); assert.ok(displays.every(d => d.destroyed));
}
view.destroy();
mkdirSync('docs/tasks/evidence/TASK-SLICE-214E', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-214E/view-projections.json', JSON.stringify({
  scope: 'Production presenter calls for all original dragon4 body cells, clone alpha, trigger and AoyiBuff states', projections,
}, null, 2) + '\n');
execFileSync('python', ['tools/verify-dragon1-presentation.py', '--dragon4'], { stdio: 'inherit' });
