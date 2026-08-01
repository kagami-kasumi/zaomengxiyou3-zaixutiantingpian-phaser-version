import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  createFormalDevParty,
  createFormalPartyRetryData,
  resolveFormalPartyRuntime,
} from '../src/systems/FormalPartyRuntimeSystem';
import { createPartySaveSlot } from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';
import { createStage1CombatPlayer } from '../src/systems/Stage1CombatSystem';

const repoRoot = process.cwd();

function createMemoryStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

for (const heroId of [1, 2, 3, 4, 5] as const) {
  const storage = createMemoryStorage();
  assert.equal(createPartySaveSlot(storage, 0, 1, heroId), true);
  const runtime = resolveFormalPartyRuntime(storage, undefined, false);
  assert.deepEqual(runtime?.members, [{ slot: 'p1', heroId }]);
  assert.equal(runtime?.playerCount, 1);
  assert.equal(runtime?.source, 'active-save');
  assert.equal(createFormalPartyRetryData(runtime), undefined);
  const combatPlayer = createStage1CombatPlayer('p1', heroId);
  assert.equal(combatPlayer.progression.heroId, heroId);
  assert.equal(combatPlayer.normalAttack.heroId, heroId);
}

{
  const storage = createMemoryStorage();
  assert.equal(createPartySaveSlot(storage, 0, 2, 2, 5), true);
  const runtime = resolveFormalPartyRuntime(
    storage,
    { devParty: createFormalDevParty(1, 4) },
    false,
  );
  assert.deepEqual(runtime?.members, [
    { slot: 'p1', heroId: 2 },
    { slot: 'p2', heroId: 5 },
  ], 'formal entry ignores arbitrary scene payload outside DEV/QA');
  assert.equal(runtime?.playerCount, 2);
}

{
  const storage = createMemoryStorage();
  assert.equal(createPartySaveSlot(storage, 0, 2, 3, 3), false, 'duplicate heroes remain invalid');
  assert.equal(resolveFormalPartyRuntime(storage, undefined, false), undefined);
}

{
  const devParty = createFormalDevParty(2, 1, 4);
  const runtime = resolveFormalPartyRuntime(undefined, { devParty }, true);
  assert.equal(runtime?.source, 'dev-override');
  assert.deepEqual(runtime?.members, [
    { slot: 'p1', heroId: 1 },
    { slot: 'p2', heroId: 4 },
  ]);
  assert.deepEqual(createFormalPartyRetryData(runtime), { devParty });
  assert.equal(
    resolveFormalPartyRuntime(undefined, { devParty }, false),
    undefined,
    'production entry rejects a DEV-only party without an active save',
  );
}

const source = (relativePath: string): string =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8');
for (const relativePath of [
  'src/scenes/TestScene.ts',
  'src/scenes/Stage12Scene.ts',
  'src/scenes/Stage13Scene.ts',
  'src/scenes/Stage21Scene.ts',
  'src/scenes/Stage22Scene.ts',
]) {
  assert.match(source(relativePath), /resolveFormalPartyScene/);
  assert.doesNotMatch(source(relativePath), /data\?\.playerCount/);
}
assert.match(source('src/scenes/PlayableLevelRuntime.ts'), /setData\('heroId'/);
for (const relativePath of ['src/scenes/PlayableLevelRuntime.ts']) {
  assert.match(source(relativePath), /scene\.restart\(retryData\)/);
  assert.doesNotMatch(source(relativePath), /restart\(\{ playerCount \}\)/);
}
for (const stage of ['12', '13', '21', '22']) {
  assert.match(source(`src/scenes/Stage${stage}Scene.ts`), /createPlayableLevelRuntime/);
}
assert.match(source('src/scenes/PlayableLevelRuntime.ts'), /createFormalPartyRetryData/);
assert.match(source('src/scenes/test-scene/TestSceneSaveBridge.ts'), /SAVE disabled for DEV party/);
assert.match(source('src/scenes/Stage11EntryScene.ts'), /if \(!import\.meta\.env\.DEV\)/);

console.log('Formal party runtime, retry, hero coverage, and DEV isolation tests passed.');
