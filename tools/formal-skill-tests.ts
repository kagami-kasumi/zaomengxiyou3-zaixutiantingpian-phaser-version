import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fullFeatureUiAssets } from '../src/assets/AssetManifest';
import {
  bindFormalSkill,
  createFormalSkillPage,
  getFormalSkillPlayer,
  learnFormalSkill,
  selectFormalSkill,
  selectFormalSkillSlot,
  selectFormalSkillTab,
  setFormalSkillOwner,
  upgradeFormalPassiveSkill,
  upgradeFormalSkill,
  upgradeFormalSkillTree,
} from '../src/systems/FormalSkillPageSystem';
import { createDefaultGameSave, createSaveSlot, loadActiveGame } from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';

const root = process.cwd();

function createStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function createReadyModel() {
  const storage = createStorage();
  const save = createDefaultGameSave();
  for (const player of [save.player1, save.player2]) {
    player.level = 20;
    player.skillLearning.heroLevel = 20;
    player.skillLearning.soulCount = 20_000;
  }
  assert.equal(createSaveSlot(storage, 0, save), true);
  const model = createFormalSkillPage(storage, 'p1');
  assert.ok(model);
  return { storage, model };
}

function testTreeLearnUpgradeBindPassiveAndReload(): void {
  const { storage, model } = createReadyModel();
  assert.equal(upgradeFormalSkillTree(model, storage), true);
  assert.equal(learnFormalSkill(model, storage), true);
  assert.equal(getFormalSkillPlayer(model).skillLearning.trees[0].learnedSkills[0]?.skillName, 'slz');

  selectFormalSkillTab(model, 'binding');
  selectFormalSkill(model, 0);
  selectFormalSkillSlot(model, 2);
  assert.equal(bindFormalSkill(model, storage), true);
  assert.equal(getFormalSkillPlayer(model).skillLoadout.slots[2]?.skillName, 'slz');

  selectFormalSkillTab(model, 'tree1');
  selectFormalSkill(model, 0);
  assert.equal(upgradeFormalSkill(model, storage), true);
  assert.deepEqual(getFormalSkillPlayer(model).skillLoadout.slots[2], { skillName: 'slz', level: 2 });

  selectFormalSkillTab(model, 'passive');
  selectFormalSkill(model, 0);
  assert.equal(upgradeFormalPassiveSkill(model, storage), true);
  assert.equal(getFormalSkillPlayer(model).skillLearning.passiveSkills[0], 1);

  const reloaded = createFormalSkillPage(storage, 'p1');
  assert.ok(reloaded);
  assert.deepEqual(reloaded.restored.player1.skillLoadout.slots[2], { skillName: 'slz', level: 2 });
  assert.equal(reloaded.restored.player1.skillLearning.passiveSkills[0], 1);
}

function testOwnerIsolationAndLockedFeedback(): void {
  const { storage, model } = createReadyModel();
  const p1BindingBefore = model.restored.player1.skillLoadout.slots[0];
  setFormalSkillOwner(model, 'p2');
  assert.equal(upgradeFormalSkillTree(model, storage), true);
  selectFormalSkill(model, 4);
  assert.equal(learnFormalSkill(model, storage), false);
  assert.match(model.message, /心法等级/);
  selectFormalSkill(model, 0);
  assert.equal(learnFormalSkill(model, storage), true);
  selectFormalSkillTab(model, 'binding');
  selectFormalSkillSlot(model, 0);
  assert.equal(bindFormalSkill(model, storage), true);

  const persisted = loadActiveGame(storage);
  assert.ok(persisted);
  assert.deepEqual(persisted.player1.skillLoadout[0], p1BindingBefore);
  assert.deepEqual(persisted.player2.skillLoadout[0], { skillName: 'slz', level: 1 });
}

function testTrueSkillAssets(): void {
  for (const key of ['skillHub', 'skillActive', 'skillBind', 'skillPassive'] as const) {
    const asset = fullFeatureUiAssets[key];
    assert.equal(asset.status, 'ready');
    assert.equal(asset.source, 'extracted-flash');
    assert.ok(existsSync(path.join(root, 'public', asset.path)));
  }
  const scene = readFileSync(path.join(root, 'src/scenes/FeatureUiScene.ts'), 'utf8');
  const map = readFileSync(path.join(root, 'src/scenes/HeavenMapScene.ts'), 'utf8');
  const stage12 = readFileSync(path.join(root, 'src/scenes/stage12/Stage12GameplayBridge.ts'), 'utf8');
  const stage13 = readFileSync(path.join(root, 'src/scenes/stage13/Stage13GameplayBridge.ts'), 'utf8');
  assert.match(scene, /createFormalSkillPageView/);
  assert.match(scene, /syncFormalSkillRuntime/);
  assert.match(map, /originKind: 'map', playerCount: 2/);
  assert.match(stage12, /FormalSkillsUpdatedEvent/);
  assert.match(stage13, /FormalSkillsUpdatedEvent/);
}

testTreeLearnUpgradeBindPassiveAndReload();
testOwnerIsolationAndLockedFeedback();
testTrueSkillAssets();
console.log('Formal skill trees, binding, passive, owner, save, and true asset tests passed.');
