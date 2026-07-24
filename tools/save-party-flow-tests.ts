import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { savePartyAssets } from '../src/assets/AssetManifest';
import {
  chooseDraftHero,
  chooseDraftPlayerCount,
  createSaveProfileDraft,
} from '../src/systems/SaveProfileDraftSystem';
import {
  createPartySaveSlot,
  getActiveSaveSlotId,
  getSaveSlotDisplayName,
  inspectSaveSlot,
} from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

const repoRoot = process.cwd();

function createMemoryStorage(): SaveStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

for (const heroId of [1, 2, 3, 4, 5] as const) {
  const storage = createMemoryStorage();
  const initial = createSaveProfileDraft(0);
  assert.equal(inspectSaveSlot(storage, 0).status, 'empty');
  const heroDraft = chooseDraftPlayerCount(initial, 1);
  const result = chooseDraftHero(heroDraft, heroId);
  assert.equal(result.status, 'complete');
  if (result.status !== 'complete') continue;
  assert.equal(createPartySaveSlot(storage, 0, 1, heroId), true);
  assert.equal(inspectSaveSlot(storage, 0).save?.party.members.p1.heroId, heroId);
  assert.match(getSaveSlotDisplayName(inspectSaveSlot(storage, 0)), /^1P /);
}

for (const p1HeroId of [1, 2, 3, 4, 5] as const) {
  for (const p2HeroId of [1, 2, 3, 4, 5] as const) {
    const initial = createSaveProfileDraft(1);
    const p1Draft = chooseDraftPlayerCount(initial, 2);
    const p1Result = chooseDraftHero(p1Draft, p1HeroId);
    assert.equal(p1Result.status, 'awaiting-p2');
    if (p1Result.status !== 'awaiting-p2') continue;
    const p2Result = chooseDraftHero(p1Result.draft, p2HeroId);
    if (p1HeroId === p2HeroId) {
      assert.equal(p2Result.status, 'rejected');
      assert.strictEqual(p2Result.draft, p1Result.draft);
      continue;
    }
    assert.equal(p2Result.status, 'complete');
    if (p2Result.status !== 'complete') continue;
    const storage = createMemoryStorage();
    assert.equal(createPartySaveSlot(storage, 1, 2, p1HeroId, p2HeroId), true);
    const snapshot = inspectSaveSlot(storage, 1);
    assert.equal(snapshot.save?.party.playerCount, 2);
    assert.equal(snapshot.save?.party.members.p1.heroId, p1HeroId);
    assert.equal(snapshot.save?.party.playerCount === 2
      ? snapshot.save.party.members.p2.heroId
      : undefined, p2HeroId);
    assert.match(getSaveSlotDisplayName(snapshot), /^2P /);
  }
}

{
  const storage = createMemoryStorage();
  createSaveProfileDraft(3);
  assert.equal(inspectSaveSlot(storage, 3).status, 'empty', 'opening and cancelling a draft must not write');
  assert.equal(getActiveSaveSlotId(storage), undefined);
}

{
  const storage = createMemoryStorage();
  assert.equal(createPartySaveSlot(storage, 2, 2, 1, 5), true);
  assert.equal(createPartySaveSlot(storage, 2, 2, 1, 5), false, 'rapid duplicate confirmation is idempotent');
  assert.equal(getActiveSaveSlotId(storage), 2);
  assert.equal(inspectSaveSlot(storage, 2).save?.party.playerCount, 2);
}

for (const [name, asset] of Object.entries(savePartyAssets)) {
  const assetPath = path.join(repoRoot, 'public', asset.path);
  assert.ok(existsSync(assetPath), `${name} asset must exist`);
  assert.ok(readFileSync(assetPath).subarray(1, 4).equals(Buffer.from('PNG')), `${name} must be a PNG`);
  assert.equal(asset.status, 'ready');
  assert.equal(asset.source, 'extracted-flash');
  assert.equal(asset.sourcePackage, 'assets/OtherMat1.swf');
}

const sceneSource = readFileSync(path.join(repoRoot, 'src/scenes/SaveSlotScene.ts'), 'utf8');
assert.match(sceneSource, /openCreateFlow\(slotId\)/);
assert.match(sceneSource, /createPartySaveSlot\(/);
assert.match(sceneSource, /keydown-ESC/);
assert.match(sceneSource, /snapshot\.status === 'corrupt'/);
assert.match(sceneSource, /selectSaveSlot\(this\.storage, slotId\)/);
assert.match(sceneSource, /openDeleteConfirmation\(snapshot\.id\)/);
const viewSource = readFileSync(
  path.join(repoRoot, 'src/scenes/save-slot/SavePartyCreationView.ts'),
  'utf8',
);
assert.match(viewSource, /savePartyAssets\.numberUp\.key/);
assert.match(viewSource, /savePartyAssets\.roleUp\.key/);
assert.match(viewSource, /savePartyAssets\.markerP1\.key/);
assert.match(viewSource, /savePartyAssets\.markerP2\.key/);
assert.doesNotMatch(viewSource, /add\.text\(/, 'selection subject must not add modern visible labels');
assert.doesNotMatch(viewSource, /setStrokeStyle/, 'selection subject must not add modern selection borders');

console.log('Save-party draft, all hero combinations, native assets, and scene contracts passed.');
