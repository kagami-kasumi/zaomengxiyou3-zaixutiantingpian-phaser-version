import Phaser from 'phaser';
// boundary: this view projects verified skill-page geometry and forwards pointer intents;
// skill rules, save schema, HUD, and combat runtime remain in systems.
import {
  fullFeatureUiAssets,
  getSkillNativeButtonAsset,
  getSkillNativeSpriteAsset,
} from '../../assets/AssetManifest';
import {
  commitFormalSkillBinding,
  formatFormalPassiveEffect,
  getFormalLearnedSkills,
  getFormalSkillOwners,
  getFormalSkillPlayer,
  learnFormalSkill,
  openFormalSkillBinding,
  selectFormalSkill,
  selectFormalSkillSlot,
  selectFormalSkillTab,
  upgradeFormalPassiveSkill,
  upgradeFormalSkill,
  upgradeFormalSkillTree,
  type FormalSkillPageModel,
} from '../../systems/FormalSkillPageSystem';
import {
  HERO_SKILL_TREES,
  TREE_UPGRADE_COSTS,
  type AllSkillName,
} from '../../systems/SkillUISystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import { createFormalSoulBalanceView } from './FormalSoulBalanceView';
import {
  assertVerifiedSkillPagesTruth,
  getSkillOwnerSelectorBounds,
  getSkillSelectorCharacterId,
  getSkillTreeChildId,
  getSkillTreeRootId,
  getSkillTruthBounds,
  getSkillTruthCharacterId,
  getSkillTruthFrame,
  getSkillTruthStateIds,
  SkillPagesTruthId,
} from './FormalSkillPageTruth';

type FormalSkillPageCallbacks = {
  onOwner: (owner: 'p1' | 'p2') => void;
  onSaved: () => void;
  onClose: () => void;
  onRerender: () => void;
};

type NativeButtonState = 'up' | 'over' | 'down';
const NativeFont = 'FZCuYuan-M03, Microsoft YaHei, sans-serif';

export function createFormalSkillPageView(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
): Phaser.GameObjects.Container {
  assertVerifiedSkillPagesTruth();
  const objects: Phaser.GameObjects.GameObject[] = [
    truthImage(scene, 'skill-hub-root', fullFeatureUiAssets.skillHub.key),
  ];
  renderOwnerSelectors(scene, model, callbacks, objects);
  renderNativeButton(scene, objects, 'skill-hub-root.btnback-240-depth-3', 240, callbacks.onClose);
  renderNativeButton(scene, objects, 'skill-hub-root.activebtn-244-depth-5', 244, () => {
    selectFormalSkillTab(model, model.bindingReturnTab);
    callbacks.onRerender();
  });
  renderNativeButton(scene, objects, 'skill-hub-root.passivebtn-248-depth-8', 248, () => {
    selectFormalSkillTab(model, 'passive');
    callbacks.onRerender();
  });

  const player = getFormalSkillPlayer(model);
  objects.push(createFormalSoulBalanceView(scene, player.soulCount, 'skills'));
  if (model.activeTab === 'binding') renderBinding(scene, model, storage, callbacks, objects);
  else if (model.activeTab === 'passive') renderPassive(scene, model, storage, callbacks, objects);
  else renderActive(scene, model, storage, callbacks, objects);

  return scene.add.container(0, 0, objects).setDepth(20)
    .setData('skillPagesTruthId', SkillPagesTruthId)
    .setData('skillPagesTruthState', currentTruthState(model));
}

function renderOwnerSelectors(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  callbacks: FormalSkillPageCallbacks,
  objects: Phaser.GameObjects.GameObject[],
): void {
  getFormalSkillOwners(model).forEach((owner, index) => {
    const player = owner === 'p1' ? model.restored.player1 : model.restored.player2;
    const bounds = getSkillOwnerSelectorBounds(index);
    const selector = scene.add.image(
      bounds.left,
      bounds.top,
      getSkillNativeSpriteAsset(
        getSkillSelectorCharacterId(player.progression.heroId),
        owner === model.owner ? 2 : 1,
      ).key,
    ).setOrigin(0).setDisplaySize(bounds.width, bounds.height)
      .setInteractive({ useHandCursor: true })
      .setData('skillTruthObject', `owner-selector-${index}`);
    selector.on('pointerup', () => callbacks.onOwner(owner));
    objects.push(selector);
  });
}

function renderActive(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
  objects: Phaser.GameObjects.GameObject[],
): void {
  objects.push(truthImage(scene, 'active-page-root', fullFeatureUiAssets.skillActive.key));
  const player = getFormalSkillPlayer(model);
  const treeIndex = model.activeTab === 'tree2' ? 1 : 0;
  const tree = HERO_SKILL_TREES[player.progression.heroId][treeIndex];
  const treeState = player.skillLearning.trees[treeIndex];
  const treeRootId = getSkillTreeRootId(player.progression.heroId, treeIndex);
  objects.push(nativeSprite(scene, treeRootId, getSkillTruthFrame(treeRootId)));

  const selectorIds = [
    'active-page-root.xf1mc-597-depth-17',
    'active-page-root.xf2mc-608-depth-19',
  ] as const;
  selectorIds.forEach((id) => objects.push(nativeSprite(scene, id, player.progression.heroId)));
  addTruthText(scene, objects, 'active-page-root.xfname1-866-depth-62',
    HERO_SKILL_TREES[player.progression.heroId][0].name);
  addTruthText(scene, objects, 'active-page-root.xfname2-867-depth-63',
    HERO_SKILL_TREES[player.progression.heroId][1].name);
  renderTreeSelector(scene, model, objects, 0, selectorIds[0], callbacks.onRerender);
  renderTreeSelector(scene, model, objects, 1, selectorIds[1], callbacks.onRerender);
  renderTreeFields(scene, model, storage, callbacks, objects, treeIndex);

  tree.skills.forEach((skillName, index) => {
    const learned = treeState.learnedSkills.find((entry) => entry.skillName === skillName);
    const skillFrame = learned ? 3 : index < treeState.treeLevel ? 2 : 1;
    const skillId = getSkillTreeChildId(player.progression.heroId, treeIndex, 'skill', index);
    const icon = nativeSprite(scene, skillId, skillFrame);
    if (skillFrame !== 1) {
      icon.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        selectFormalSkill(model, index);
        if (!learned) runSaved(learnFormalSkill(model, storage), callbacks);
        else callbacks.onRerender();
      });
    }
    objects.push(icon);
    if (!learned) return;

    const bounds = getSkillTruthBounds(skillId);
    objects.push(nativeText(scene, bounds.left + 35, bounds.top + 48, `LV.${learned.level}`, 55, 17));
    renderNativeButton(
      scene,
      objects,
      getSkillTreeChildId(player.progression.heroId, treeIndex, 'skillset', index),
      638,
      () => {
        if (openFormalSkillBinding(model, skillName)) callbacks.onRerender();
      },
    );
    renderNativeButton(
      scene,
      objects,
      getSkillTreeChildId(player.progression.heroId, treeIndex, 'upgrade', index),
      580,
      () => {
        selectFormalSkill(model, index);
        runSaved(upgradeFormalSkill(model, storage), callbacks);
      },
    );
  });
}

function renderTreeSelector(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  objects: Phaser.GameObjects.GameObject[],
  treeIndex: 0 | 1,
  truthObjectId: string,
  onChanged: () => void,
): void {
  const bounds = getSkillTruthBounds(truthObjectId);
  const zone = scene.add.zone(
    bounds.left + bounds.width / 2,
    bounds.top + bounds.height / 2,
    bounds.width,
    bounds.height,
  ).setInteractive({ useHandCursor: true }).setData('skillTruthObject', truthObjectId);
  zone.on('pointerup', () => {
    selectFormalSkillTab(model, treeIndex === 0 ? 'tree1' : 'tree2');
    model.bindingReturnTab = treeIndex === 0 ? 'tree1' : 'tree2';
    onChanged();
  });
  objects.push(zone);
}

function renderTreeFields(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
  objects: Phaser.GameObjects.GameObject[],
  activeTreeIndex: 0 | 1,
): void {
  const player = getFormalSkillPlayer(model);
  const fieldIds = [
    ['active-page-root.leveltxt1-582-depth-12', 'active-page-root.lhtxt1-583-depth-13'],
    ['active-page-root.leveltxt2-585-depth-15', 'active-page-root.lhtxt2-586-depth-16'],
  ] as const;
  player.skillLearning.trees.forEach((state, index) => {
    addTruthText(scene, objects, fieldIds[index][0], String(state.treeLevel));
    addTruthText(
      scene,
      objects,
      fieldIds[index][1],
      state.treeLevel >= 5 ? '----' : String(TREE_UPGRADE_COSTS[state.treeLevel] ?? '----'),
    );
  });
  if (player.skillLearning.trees[activeTreeIndex].treeLevel >= 5) return;
  renderNativeButton(scene, objects, 'active-page-root.upGradebtn-580-depth-9', 580, () => {
    runSaved(upgradeFormalSkillTree(model, storage), callbacks);
  });
}

function renderBinding(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
  objects: Phaser.GameObjects.GameObject[],
): void {
  objects.push(truthImage(scene, 'bind-page-root', fullFeatureUiAssets.skillBind.key));
  const player = getFormalSkillPlayer(model);
  const selected = getFormalLearnedSkills(model)[model.selectedSkillIndex];
  const slotFrame = model.owner === 'p1' ? 1 : 2;
  const slotIds = [
    'bind-page-root.Ymc-393-depth-6',
    'bind-page-root.Umc-398-depth-8',
    'bind-page-root.Imc-403-depth-10',
    'bind-page-root.Omc-408-depth-12',
    'bind-page-root.Lmc-413-depth-14',
  ] as const;
  const visualToLoadoutIndex = [0, 2, 3, 4, 1] as const;

  slotIds.forEach((slotId, visualIndex) => {
    const bounds = getSkillTruthBounds(slotId);
    objects.push(nativeSprite(scene, slotId, slotFrame));
    const loadoutIndex = visualToLoadoutIndex[visualIndex];
    const binding = player.skillLoadout.slots[loadoutIndex];
    if (binding) {
      objects.push(scene.add.image(
        bounds.left + 5,
        bounds.top + 5,
        getSkillNativeSpriteAsset(skillCharacterId(binding.skillName), 3).key,
      ).setOrigin(0).setData('skillTruthObject', `bind-page-root.slot-${visualIndex}-skill`));
    }
    const zone = scene.add.zone(
      bounds.left + bounds.width / 2,
      bounds.top + bounds.height / 2,
      bounds.width,
      bounds.height,
    ).setInteractive({ useHandCursor: true }).setData('skillTruthObject', slotId);
    zone.on('pointerup', () => {
      selectFormalSkillSlot(model, loadoutIndex);
      callbacks.onRerender();
    });
    objects.push(zone);
  });

  if (selected) {
    const sourceId = 'bind-page-root.source-skill';
    const bounds = getSkillTruthBounds(sourceId);
    const source = scene.add.image(
      bounds.left,
      bounds.top,
      getSkillNativeSpriteAsset(skillCharacterId(selected.skillName), 3).key,
    ).setOrigin(0).setDisplaySize(bounds.width, bounds.height)
      .setInteractive({ useHandCursor: true }).setData('skillTruthObject', sourceId);
    scene.input.setDraggable(source);
    source.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      source.setPosition(dragX, dragY);
    });
    source.on('dragend', () => {
      const centerX = source.x + source.displayWidth / 2;
      const centerY = source.y + source.displayHeight / 2;
      const visualIndex = slotIds.findIndex((id) => {
        const slot = getSkillTruthBounds(id);
        return centerX >= slot.left && centerX <= slot.left + slot.width
          && centerY >= slot.top && centerY <= slot.top + slot.height;
      });
      if (visualIndex >= 0) selectFormalSkillSlot(model, visualToLoadoutIndex[visualIndex]);
      callbacks.onRerender();
    });
    objects.push(source);
  }

  renderNativeButton(scene, objects, 'bind-page-root.x_btn-337-depth-4', 337, () => {
    runSaved(commitFormalSkillBinding(model, storage), callbacks);
  });
}

function renderPassive(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
  objects: Phaser.GameObjects.GameObject[],
): void {
  objects.push(truthImage(scene, 'passive-page-root', fullFeatureUiAssets.skillPassive.key));
  getFormalSkillPlayer(model).skillLearning.passiveSkills.forEach((level, index) => {
    const rowId = `passive-page-root.pskill${index + 1}`;
    objects.push(nativeSprite(scene, rowId, index + 1));
    const nextLevel = level + 1;
    addTruthText(scene, objects, `${rowId}.curslevel-202-depth-3`, String(level));
    addTruthText(scene, objects, `${rowId}.lastvalue-204-depth-5`, formatFormalPassiveEffect(index, level));
    addTruthText(scene, objects, `${rowId}.attvalue-203-depth-4`, formatFormalPassiveEffect(index, nextLevel));
    addTruthText(scene, objects, `${rowId}.wantlh-201-depth-2`, String(nextLevel * 5000));
    if (level >= 5) return;
    renderNativeButton(scene, objects, `${rowId}.btn-207-depth-6`, 207, () => {
      selectFormalSkill(model, index);
      runSaved(upgradeFormalPassiveSkill(model, storage), callbacks);
    });
  });
}

function renderNativeButton(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  truthObjectId: string,
  characterId: number,
  onClick: () => void,
): void {
  if (getSkillTruthCharacterId(truthObjectId) !== characterId) {
    throw new Error(`Skill truth character mismatch for ${truthObjectId}.`);
  }
  const bounds = getSkillTruthBounds(truthObjectId);
  const image = scene.add.image(bounds.left, bounds.top, getSkillNativeButtonAsset(characterId, 'up').key)
    .setOrigin(0).setDisplaySize(bounds.width, bounds.height)
    .setInteractive(new Phaser.Geom.Rectangle(0, 0, bounds.width, bounds.height), Phaser.Geom.Rectangle.Contains)
    .setData('skillTruthObject', truthObjectId);
  const setState = (state: NativeButtonState) => image
    .setTexture(getSkillNativeButtonAsset(characterId, state).key)
    .setDisplaySize(bounds.width, bounds.height);
  image.on('pointerover', () => setState('over'));
  image.on('pointerout', () => setState('up'));
  image.on('pointerdown', () => setState('down'));
  image.on('pointerup', () => {
    onClick();
    if (image.active) setState('over');
  });
  objects.push(image);
}

function nativeSprite(scene: Phaser.Scene, id: string, frame: number): Phaser.GameObjects.Image {
  const bounds = getSkillTruthBounds(id);
  return scene.add.image(
    bounds.left,
    bounds.top,
    getSkillNativeSpriteAsset(getSkillTruthCharacterId(id), frame).key,
  ).setOrigin(0).setDisplaySize(bounds.width, bounds.height).setData('skillTruthObject', id);
}

function truthImage(scene: Phaser.Scene, id: string, texture: string): Phaser.GameObjects.Image {
  const bounds = getSkillTruthBounds(id);
  return scene.add.image(bounds.left, bounds.top, texture).setOrigin(0)
    .setDisplaySize(bounds.width, bounds.height).setData('skillTruthObject', id);
}

function addTruthText(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  id: string,
  value: string,
): void {
  const bounds = getSkillTruthBounds(id);
  objects.push(nativeText(scene, bounds.left, bounds.top, value, bounds.width, bounds.height)
    .setData('skillTruthObject', id));
}

function nativeText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  width: number,
  height: number,
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, {
    color: '#ffffff',
    fontFamily: NativeFont,
    fontSize: '16px',
    align: 'center',
    fixedWidth: width,
    fixedHeight: height,
  });
}

function skillCharacterId(skillName: AllSkillName): number {
  for (const [heroKey, trees] of Object.entries(HERO_SKILL_TREES)) {
    for (const [treeIndex, tree] of trees.entries()) {
      const skillIndex = tree.skills.indexOf(skillName);
      if (skillIndex >= 0) {
        return getSkillTruthCharacterId(getSkillTreeChildId(
          Number(heroKey),
          treeIndex as 0 | 1,
          'skill',
          skillIndex,
        ));
      }
    }
  }
  throw new Error(`${SkillPagesTruthId} has no icon mapping for ${skillName}.`);
}

function currentTruthState(model: FormalSkillPageModel): string {
  if (model.activeTab === 'binding') return model.owner === 'p1' ? 'bind-p1' : 'bind-p2';
  if (model.activeTab === 'passive') return model.owner === 'p1' ? 'passive-p1' : 'passive-p2';
  const player = getFormalSkillPlayer(model);
  const prefix = `active-role${player.progression.heroId}-${model.activeTab}-`;
  return getSkillTruthStateIds().find((id) => id.startsWith(prefix)) ?? 'hub-active-p1';
}

function runSaved(success: boolean, callbacks: FormalSkillPageCallbacks): void {
  if (success) callbacks.onSaved();
  callbacks.onRerender();
}
