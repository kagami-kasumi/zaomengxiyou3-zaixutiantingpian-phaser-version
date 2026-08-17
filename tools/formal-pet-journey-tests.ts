import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createFeatureUiFailureSignal, FeatureUiFailureEvent } from '../src/systems/FeatureUiFailureSystem';
import {
  closeFeatureUi,
  createFeatureUiHostModel,
  openFeatureUi,
} from '../src/systems/FeatureUiHostSystem';
import {
  cancelFormalPetRelease,
  changeFormalPetPage,
  createFormalPetPage,
  deployFormalPet,
  getFormalPetPageCount,
  getFormalPetPlayer,
  releaseFormalPet,
  restFormalPet,
  selectFormalPet,
} from '../src/systems/FormalPetPageSystem';
import {
  createHeavenMapSnapshot,
  HeavenMapNodeDefinitions,
  HeavenMapStage22NodeDefinition,
} from '../src/systems/HeavenMapSystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import {
  createDefaultGameSave,
  createSaveSlot,
  loadActiveGame,
} from '../src/systems/SaveSlotSystem';
import { routeStageFeatureEntry } from '../src/systems/StageFeatureEntryRouterSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

class RestartableMemoryStorage implements SaveStorage {
  public constructor(public readonly values = new Map<string, string>()) {}

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }

  public restart(): RestartableMemoryStorage {
    return new RestartableMemoryStorage(new Map(this.values));
  }
}

const storage = new RestartableMemoryStorage();
const party = createPartyConfiguration(2, 2, 5);
assert.ok(party);
const save = createDefaultGameSave(new Date('2026-08-17T00:00:00.000Z'), party);
save.levelUnlockProgress = { unlockedStage: 2, unlockedLevel: 2 };
for (const [owner, player] of [['p1', save.player1], ['p2', save.player2]] as const) {
  const seed = player.pets[0];
  assert.ok(seed);
  player.pets = Array.from({ length: 10 }, (_, index) => ({
    ...structuredClone(seed),
    id: `journey-${owner}-pet-${index + 1}`,
    displayName: `${owner.toUpperCase()} 宠物 ${index + 1}`,
    isActive: index === 0,
    skills: index === 5 ? ['tsml', 'xj', 'lj'] : [...seed.skills],
  }));
  player.selectedPetIndex = 0;
}
assert.equal(createSaveSlot(storage, 0, save), true);

// Cold restart must select the real current-schema slot before map and combat routes are exercised.
const coldStorage = storage.restart();
const coldSave = loadActiveGame(coldStorage);
assert.ok(coldSave);
assert.deepEqual(coldSave.party, party);
const mapSnapshot = createHeavenMapSnapshot(coldSave.levelUnlockProgress);
assert.equal(mapSnapshot.at(-1)?.routeKey, 'Stage22Scene');
assert.equal(mapSnapshot.at(-1)?.status, 'current');
const runtimeSceneKeys = [...HeavenMapNodeDefinitions, HeavenMapStage22NodeDefinition]
  .flatMap((node) => node.routeKey ? [node.routeKey] : []);
assert.deepEqual(runtimeSceneKeys, [
  'TestScene',
  'Stage12Scene',
  'Stage13Scene',
  'Stage21Scene',
  'Stage22Scene',
]);

for (const originSceneKey of runtimeSceneKeys) {
  for (const owner of ['p1', 'p2'] as const) {
    const route = routeStageFeatureEntry(
      { entry: 'pets', owner, source: 'pointer' },
      { playerCount: 2, ownerAlive: true, magicWeaponEquipped: false },
    );
    assert.equal(route.status, 'open-page', `${originSceneKey} ${owner} pet entry must route`);
    if (route.status !== 'open-page') continue;

    const host = createFeatureUiHostModel();
    const opened = openFeatureUi(host, {
      page: route.page,
      owner: route.owner,
      originSceneKey,
      originKind: 'combat',
      playerCount: 2,
    });
    assert.equal(opened.status, 'opened');

    const model = createFormalPetPage(coldStorage, owner);
    assert.ok(model);
    assert.equal(getFormalPetPageCount(model), 2);
    changeFormalPetPage(model, coldStorage, 1);
    selectFormalPet(model, coldStorage, 0);
    assert.equal(getFormalPetPlayer(model).petRoster.selectedIndex, 5);
    assert.equal(deployFormalPet(model, coldStorage), true);
    assert.equal(restFormalPet(model, coldStorage), true);
    assert.equal(releaseFormalPet(model, coldStorage), false, 'first release click arms confirmation');
    assert.ok(model.releaseArmedPetId);
    cancelFormalPetRelease(model);
    assert.equal(model.releaseArmedPetId, undefined);

    assert.equal(closeFeatureUi(host)?.originSceneKey, originSceneKey);
    assert.equal(host.active, undefined);
    assert.equal(openFeatureUi(host, opened.session).status, 'opened', 'page can reopen after returning');
    assert.equal(closeFeatureUi(host)?.owner, owner);
  }
}

const reloaded = coldStorage.restart();
for (const owner of ['p1', 'p2'] as const) {
  const model = createFormalPetPage(reloaded, owner);
  assert.ok(model);
  assert.equal(getFormalPetPlayer(model).petRoster.selectedIndex, 5);
  assert.equal(getFormalPetPlayer(model).petRoster.pets.length, 10);
}

// Bundle, page-asset, and render failures share one stable, assertion-friendly signal.
assert.equal(FeatureUiFailureEvent, 'feature-ui-failed');
for (const phase of ['bundle', 'page-assets', 'render'] as const) {
  assert.deepEqual(createFeatureUiFailureSignal({
    phase,
    page: 'pets',
    owner: 'p2',
    originSceneKey: 'Stage22Scene',
    error: new Error(`${phase} failed`),
  }), {
    phase,
    page: 'pets',
    owner: 'p2',
    originSceneKey: 'Stage22Scene',
    message: `${phase} failed`,
  });
}

const source = (relativePath: string): string => readFileSync(path.join(process.cwd(), relativePath), 'utf8');
const runtimeBridge = source('src/scenes/PlayableLevelRuntime.ts');
const entryBridge = source('src/scenes/feature-ui/FormalFeatureUiEntryBridge.ts');
const featureScene = source('src/scenes/FeatureUiScene.ts');
const petView = source('src/scenes/feature-ui/FormalPetPageView.ts');
assert.match(runtimeBridge, /installFormalFeatureUiEntries/);
assert.match(entryBridge, /reportFormalFeatureUiFailure\(scene, page, owner, 'bundle', error\)/);
assert.match(entryBridge, /reportFormalFeatureUiFailure\(scene, page, owner, 'page-assets', error\)/);
assert.match(featureScene, /this\.reportFailure\('render', error\)/);
assert.match(petView, /icon\.on\('pointerover'/, 'skill hover remains wired to the verified tooltip');
assert.match(petView, /release-confirm-overlay/);
assert.match(petView, /petPageTruthId', 'task-settings-175a\.pet-page'/);

console.log('Formal cold-start five-stage P1/P2 pet page journey and observable failure tests passed.');
