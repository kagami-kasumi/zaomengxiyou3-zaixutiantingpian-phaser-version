import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fullFeatureUiAssets } from '../src/assets/AssetManifest';
import {
  bindFormalSkill,
  commitFormalSkillBinding,
  createFormalSkillPage,
  formatFormalPassiveEffect,
  getFormalSkillEntryPlayerCount,
  getFormalSkillPlayer,
  getFormalSkillOwners,
  learnFormalSkill,
  openFormalSkillBinding,
  selectFormalSkill,
  selectFormalSkillSlot,
  selectFormalSkillTab,
  setFormalSkillOwner,
  upgradeFormalPassiveSkill,
  upgradeFormalSkill,
  upgradeFormalSkillTree,
} from '../src/systems/FormalSkillPageSystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import { createDefaultGameSave, createSaveSlot, loadActiveGame } from '../src/systems/SaveSlotSystem';
import type { SaveStorage } from '../src/systems/SaveSystem';
import { HERO_SKILL_TREES } from '../src/systems/SkillUISystem';
import {
  FormalSkillsUpdatedEvent,
  syncFormalSkillRuntime,
} from '../src/scenes/feature-ui/FormalSkillRuntimeBridge';

const root = process.cwd();

function createStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}

function createReadyModel(party = createPartyConfiguration(1, 1)!) {
  const storage = createStorage();
  const save = createDefaultGameSave(new Date('2026-07-24T00:00:00.000Z'), party);
  for (const player of [save.player1, save.player2]) {
    player.level = 20;
    player.skillLearning.heroLevel = 20;
    player.soulCount = 20_000;
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

  assert.equal(openFormalSkillBinding(model, 'slz'), true);
  assert.equal(model.activeTab, 'binding');
  selectFormalSkillSlot(model, 2);
  assert.equal(commitFormalSkillBinding(model, storage), true);
  assert.equal(model.activeTab, 'tree1');
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
  const { storage, model } = createReadyModel(createPartyConfiguration(2, 1, 2)!);
  const p1BindingBefore = model.restored.player1.skillLoadout.slots[0];
  assert.equal(setFormalSkillOwner(model, 'p2'), true);
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
  assert.deepEqual(persisted.player2.skillLoadout[0], {
    skillName: HERO_SKILL_TREES[2][0].skills[0],
    level: 1,
  });
}

function testInsufficientSoulRejectsWithoutMutation(): void {
  const { storage, model } = createReadyModel();
  const player = getFormalSkillPlayer(model);
  player.soulCount = 99;
  assert.equal(upgradeFormalSkillTree(model, storage), false);
  assert.equal(player.soulCount, 99);
  assert.equal(player.skillLearning.trees[0].treeLevel, 0);
  assert.equal(loadActiveGame(storage)?.player1.soulCount, 20_000);
}

function testPartyDrivenOwnerAndHeroFiltering(): void {
  for (const heroId of [1, 2, 3, 4, 5] as const) {
    const { storage, model } = createReadyModel(createPartyConfiguration(1, heroId)!);
    assert.deepEqual(getFormalSkillOwners(model), ['p1']);
    assert.equal(getFormalSkillPlayer(model).progression.heroId, heroId);
    assert.deepEqual(
      HERO_SKILL_TREES[getFormalSkillPlayer(model).progression.heroId],
      HERO_SKILL_TREES[heroId],
    );
    assert.equal(createFormalSkillPage(storage, 'p2'), undefined);
    assert.equal(getFormalSkillEntryPlayerCount(storage, 'p1'), 1);
    assert.equal(getFormalSkillEntryPlayerCount(storage, 'p2'), undefined);
    assert.equal(setFormalSkillOwner(model, 'p2'), false);
    assert.equal(model.owner, 'p1');

    const before = loadActiveGame(storage);
    model.owner = 'p2';
    assert.throws(
      () => upgradeFormalSkillTree(model, storage),
      /active PartyConfiguration member/,
    );
    assert.deepEqual(loadActiveGame(storage), before, 'inactive P2 must not write through a direct call');
  }

  const { storage, model } = createReadyModel(createPartyConfiguration(2, 2, 5)!);
  assert.deepEqual(getFormalSkillOwners(model), ['p1', 'p2']);
  assert.equal(getFormalSkillEntryPlayerCount(storage, 'p2'), 2);
  assert.equal(getFormalSkillPlayer(model).progression.heroId, 2);
  assert.equal(setFormalSkillOwner(model, 'p2'), true);
  assert.equal(getFormalSkillPlayer(model).progression.heroId, 5);
  assert.equal(upgradeFormalSkillTree(model, storage), true);
  assert.equal(loadActiveGame(storage)?.player1.skillLearning.trees[0].treeLevel, 0);
  assert.equal(loadActiveGame(storage)?.player2.skillLearning.trees[0].treeLevel, 1);

  assert.equal(
    createPartyConfiguration(2, 3, 3),
    undefined,
    'the original party contract rejects same-hero co-op before the skill page',
  );
}

function testHudSyncKeepsStableOwnerSlot(): void {
  const { model } = createReadyModel(createPartyConfiguration(2, 1, 2)!);
  assert.equal(setFormalSkillOwner(model, 'p2'), true);
  const runtimePlayers = [
    { slot: 'p1' as const, skill: { loadout: { marker: 'p1-before' } } },
    { slot: 'p2' as const, skill: { loadout: { marker: 'p2-before' } } },
  ];
  const emitted: Array<{ event: string; payload: unknown }> = [];
  const origin = {
    getPlayers: () => runtimePlayers,
    events: {
      emit: (event: string, payload: unknown) => {
        emitted.push({ event, payload });
      },
    },
  };
  syncFormalSkillRuntime(origin as never, model);
  assert.deepEqual(runtimePlayers[0].skill.loadout, { marker: 'p1-before' });
  assert.strictEqual(runtimePlayers[1].skill.loadout, model.restored.player2.skillLoadout);
  assert.equal(emitted[0]?.event, FormalSkillsUpdatedEvent);
  assert.equal((emitted[0]?.payload as { owner?: string }).owner, 'p2');
}

function testTrueSkillAssets(): void {
  for (const key of ['skillHub', 'skillActive', 'skillBind', 'skillPassive'] as const) {
    const asset = fullFeatureUiAssets[key];
    assert.equal(asset.status, 'ready');
    assert.equal(asset.source, 'extracted-flash');
    assert.ok(existsSync(path.join(root, 'public', asset.path)));
  }
  const scene = readFileSync(path.join(root, 'src/scenes/FeatureUiScene.ts'), 'utf8');
  const view = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalSkillPageView.ts'), 'utf8');
  const entry = readFileSync(path.join(root, 'src/scenes/feature-ui/FormalFeatureUiEntryBridge.ts'), 'utf8');
  const pageAssets = readFileSync(path.join(
    root,
    'src/scenes/feature-ui/FeatureUiPageAssetBridge.ts',
  ), 'utf8');
  const styles = readFileSync(path.join(root, 'src/styles.css'), 'utf8');
  const activeBase = readFileSync(path.join(
    root, 'public/assets/ui/feature/skills/native/base/skill-active.svg',
  ), 'utf8');
  const passiveBase = readFileSync(path.join(
    root, 'public/assets/ui/feature/skills/native/base/skill-passive.svg',
  ), 'utf8');
  const stage12 = readFileSync(path.join(root, 'src/scenes/stage12/Stage12GameplayBridge.ts'), 'utf8');
  const heroParty = readFileSync(path.join(root, 'src/scenes/HeroPartyRuntimeBridge.ts'), 'utf8');
  const stage13 = readFileSync(path.join(root, 'src/scenes/stage13/Stage13GameplayBridge.ts'), 'utf8');
  assert.match(scene, /createFormalSkillPageView/);
  assert.match(scene, /syncFormalSkillRuntime/);
  assert.doesNotMatch(view, /add\.rectangle/);
  assert.doesNotMatch(view, /正式心法与技能|绑定到选中槽|升级选中被动|关闭返回/);
  assert.match(view, /getSkillNativeButtonAsset/);
  assert.match(view, /getSkillNativeSpriteAsset/);
  assert.match(view, /P1技能|owner\.toUpperCase\(\)/);
  assert.match(view, /treeNameText/);
  assert.match(view, /createFormalSoulBalanceView\(scene, player\.soulCount, 'skills'\)/);
  assert.match(view, /fontFamily: '"FZCuYuan-M03"'/);
  assert.doesNotMatch(view, /PassiveTableHeaders|被动技能.*当前等级.*当前效果/);
  assert.match(pageAssets, /document\.fonts\.load\('16px "FZCuYuan-M03"'\)/);
  assert.match(styles, /@font-face[\s\S]*font-family: "FZCuYuan-M03"/);
  assert.ok(existsSync(path.join(
    root,
    'public/assets/fonts/FZCuYuan-M03.ttf',
  )));
  assert.doesNotMatch(activeBase, /id="(?:xf1mc|xf2mc|mainskillmc|xfname1|xfname2|upGradebtn)"/);
  assert.doesNotMatch(passiveBase, /id="pskill[1-5]"/);
  for (const characterId of [207, 240, 244, 248, 337, 580, 638]) {
    for (const state of ['up', 'over', 'down']) {
      assert.ok(existsSync(path.join(
        root,
        'public/assets/ui/feature/skills/native/buttons',
        String(characterId),
        `${state}.svg`,
      )));
    }
  }
  for (const frame of [1, 2, 3, 4, 5]) {
    const passiveRowPath = path.join(
      root,
      'public/assets/ui/feature/skills/native/sprites/212',
      `${frame}.svg`,
    );
    assert.ok(existsSync(passiveRowPath));
    assert.doesNotMatch(readFileSync(passiveRowPath, 'utf8'), /id="btn"/);
  }
  assert.match(entry, /getPartyHeroId\(config\.party, owner\)/);
  assert.doesNotMatch(view, /callbacks\.playerCount/);
  assert.match(stage12, /createHeroPartyRuntime/);
  assert.match(heroParty, /FormalSkillsUpdatedEvent/);
  assert.match(stage13, /FormalSkillsUpdatedEvent/);
}

function testPassiveEffectDescriptions(): void {
  assert.equal(formatFormalPassiveEffect(0, 1), '生命上限增加 100');
  assert.equal(formatFormalPassiveEffect(1, 2), '魔法上限增加 200');
  assert.equal(formatFormalPassiveEffect(2, 3), '暴击率增加 3 %');
  assert.equal(formatFormalPassiveEffect(3, 4), '每秒回血增加 12');
  assert.equal(formatFormalPassiveEffect(4, 5), '每秒回魔增加 5');
  assert.equal(formatFormalPassiveEffect(0, 0), '----');
}

testTreeLearnUpgradeBindPassiveAndReload();
testOwnerIsolationAndLockedFeedback();
testInsufficientSoulRejectsWithoutMutation();
testPartyDrivenOwnerAndHeroFiltering();
testHudSyncKeepsStableOwnerSlot();
testTrueSkillAssets();
testPassiveEffectDescriptions();
console.log('Formal skill trees, binding, passive, owner, save, and true asset tests passed.');
