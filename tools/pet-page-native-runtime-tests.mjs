import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(readFileSync(path.join(
  root,
  'docs/reverse-engineering/ground-truth/manifests/task-settings-175a-pet-page.json',
), 'utf8'));
const view = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalPetPageView.ts'), 'utf8');
const truthProjection = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalPetPageTruth.ts'), 'utf8');
const bundles = readFileSync(path.join(root, 'src/assets/SceneAssetBundles.ts'), 'utf8');
const nativeRoot = path.join(root, 'public/assets/ui/feature/pets/native');

assert.equal(manifest.truthId, 'task-settings-175a.pet-page');
assert.equal(manifest.status, 'verified');
assert.equal(manifest.displayObjects.length, 74);
assert.equal(manifest.states.length, 16);
assert.deepEqual(manifest.completeness.unresolved, []);
assert.match(truthProjection, /task-settings-175a-pet-page\.json/);
assert.match(view, /assertVerifiedPetPageTruth/);
assert.match(view, /getPetTruthBounds/);
assert.match(view, /petTruthObject/);
assert.doesNotMatch(view, /scene\.add\.rectangle/);
assert.doesNotMatch(view, /Arial/);
assert.doesNotMatch(view, /createPetButton|formatFormalPetSummary|正式宠物|八技能展示槽|关闭返回/);
assert.match(bundles, /petNativeUiAssets/);
assert.match(bundles, /petNativeHeadAssets/);
assert.match(bundles, /petNativeSkillAssets/);

for (const relative of [
  'pet-list-row.svg',
  'skill-tooltip.svg',
  'release-confirm.svg',
  'buttons/835/up.png',
  'buttons/835/over.png',
  'buttons/835/down.png',
  'heads/PetMonkeyBmd1.png',
  'skills/petskill_xj.png',
  'quality/1.svg',
  'quality/2.svg',
  'quality/3.svg',
]) {
  assert.ok(existsSync(path.join(nativeRoot, relative)), `Missing native pet asset ${relative}`);
}
assert.equal(readdirSync(path.join(nativeRoot, 'heads')).filter((name) => name.endsWith('.png')).length, 24);
assert.equal(readdirSync(path.join(nativeRoot, 'skills')).filter((name) => name.endsWith('.png')).length, 56);
for (const characterId of [852, 858, 863, 868, 873, 878]) {
  assert.equal(readdirSync(path.join(nativeRoot, 'progress', String(characterId))).length, 20);
}

console.log('Pet-page verified truth projection, native assets, and no-overlay constraints passed.');
