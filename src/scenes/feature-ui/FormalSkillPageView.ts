import Phaser from 'phaser';
// boundary: this view projects FormalSkillPageSystem state into recovered Flash
// display-list geometry; it does not own skill rules, save schema, HUD, or combat runtime.
import {
  fullFeatureUiAssets,
  getSkillNativeButtonAsset,
  getSkillNativeSpriteAsset,
} from '../../assets/AssetManifest';
import {
  commitFormalSkillBinding,
  getFormalLearnedSkills,
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
} from '../../systems/SkillUISystem';
import type { SaveStorage } from '../../systems/SaveSystem';
import {
  BindingSlotCharacters,
  BindingSlotPositions,
  BindingVisualToLoadoutIndex,
  PassiveRowPositions,
  SkillIconCharacterByName,
  SkillIconPositions,
  SkillSelectorCharacterByHero,
  SkillSetButtonPositions,
  SkillTreeFrameByHero,
  SkillUpgradeButtonPositions,
} from './FormalSkillNativeLayout';

type FormalSkillPageCallbacks = {
  playerCount: 1 | 2;
  onOwner: (owner: 'p1' | 'p2') => void;
  onSaved: () => void;
  onClose: () => void;
  onRerender: () => void;
};

type NativeButtonState = 'up' | 'over' | 'down';

export function createFormalSkillPageView(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
): Phaser.GameObjects.Container {
  const objects: Phaser.GameObjects.GameObject[] = [
    scene.add.image(0, 0, fullFeatureUiAssets.skillHub.key).setOrigin(0),
  ];
  renderOwnerSelectors(scene, model, callbacks, objects);
  renderNativeButton(scene, objects, 240, 845.75, 22.8, 84, 31, callbacks.onClose);
  renderNativeButton(scene, objects, 244, 55.9, 551.45, 81, 25, () => {
    selectFormalSkillTab(model, model.bindingReturnTab);
    callbacks.onRerender();
  });
  renderNativeButton(scene, objects, 248, 158.75, 552.45, 79, 24, () => {
    selectFormalSkillTab(model, 'passive');
    callbacks.onRerender();
  });

  const player = getFormalSkillPlayer(model);
  objects.push(nativeText(scene, 805.95, 544, String(player.skillLearning.soulCount), 132, 23, 'right'));

  if (model.activeTab === 'binding') {
    renderBinding(scene, model, storage, callbacks, objects);
  } else if (model.activeTab === 'passive') {
    renderPassive(scene, model, storage, callbacks, objects);
  } else {
    renderActive(scene, model, storage, callbacks, objects);
  }
  return scene.add.container(0, 0, objects).setDepth(20);
}

function renderOwnerSelectors(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  callbacks: FormalSkillPageCallbacks,
  objects: Phaser.GameObjects.GameObject[],
): void {
  const owners = callbacks.playerCount === 2 ? (['p1', 'p2'] as const) : (['p1'] as const);
  owners.forEach((owner, index) => {
    const player = owner === 'p1' ? model.restored.player1 : model.restored.player2;
    const characterId = SkillSelectorCharacterByHero[player.progression.heroId];
    const selector = scene.add.image(
      50 + index * 90,
      14.85,
      getSkillNativeSpriteAsset(characterId, owner === model.owner ? 2 : 1).key,
    ).setOrigin(0).setInteractive({ useHandCursor: true });
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
  objects.push(scene.add.image(34, 84, fullFeatureUiAssets.skillActive.key).setOrigin(0));
  const player = getFormalSkillPlayer(model);
  const treeIndex = model.activeTab === 'tree2' ? 1 : 0;
  const tree = HERO_SKILL_TREES[player.progression.heroId][treeIndex];
  const treeState = player.skillLearning.trees[treeIndex];
  const frame = SkillTreeFrameByHero[player.progression.heroId][treeIndex];
  objects.push(scene.add.image(
    272.35,
    124.2,
    getSkillNativeSpriteAsset(865, frame).key,
  ).setOrigin(0));

  renderTreeSelector(scene, model, objects, 0, 57.65, 151, () => callbacks.onRerender());
  renderTreeSelector(scene, model, objects, 1, 57.65, 351, () => callbacks.onRerender());
  renderTreeFields(scene, model, storage, callbacks, objects);

  tree.skills.forEach((skillName, index) => {
    const learned = treeState.learnedSkills.find((entry) => entry.skillName === skillName);
    const skillFrame = learned ? 3 : index < treeState.treeLevel ? 2 : 1;
    const position = SkillIconPositions[index];
    const icon = scene.add.image(
      position.x,
      position.y,
      getSkillNativeSpriteAsset(SkillIconCharacterByName[skillName], skillFrame).key,
    ).setOrigin(0);
    if (skillFrame !== 1) {
      icon.setInteractive({ useHandCursor: true }).on('pointerup', () => {
        selectFormalSkill(model, index);
        if (!learned) runSaved(learnFormalSkill(model, storage), callbacks);
        else callbacks.onRerender();
      });
    }
    objects.push(icon);
    if (!learned) return;
    objects.push(nativeText(scene, position.x + 35, position.y + 48, `LV.${learned.level}`, 55, 17));
    const setPosition = SkillSetButtonPositions[index];
    renderNativeButton(scene, objects, 638, setPosition.x, setPosition.y, 41, 25, () => {
      if (openFormalSkillBinding(model, skillName)) callbacks.onRerender();
    });
    const upgradePosition = SkillUpgradeButtonPositions[index];
    renderNativeButton(scene, objects, 580, upgradePosition.x, upgradePosition.y, 48, 28, () => {
      selectFormalSkill(model, index);
      runSaved(upgradeFormalSkill(model, storage), callbacks);
    });
  });
}

function renderTreeSelector(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  objects: Phaser.GameObjects.GameObject[],
  treeIndex: 0 | 1,
  x: number,
  y: number,
  onChanged: () => void,
): void {
  const zone = scene.add.zone(x + 32.5, y + 32.5, 65, 65).setInteractive({ useHandCursor: true });
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
): void {
  const player = getFormalSkillPlayer(model);
  player.skillLearning.trees.forEach((state, index) => {
    const y = index === 0 ? 228.2 : 427.15;
    const costY = index === 0 ? 255.2 : 454.15;
    objects.push(nativeText(scene, 129.95, y, String(state.treeLevel), 55, 21));
    objects.push(nativeText(
      scene,
      162.95,
      costY,
      state.treeLevel >= 5 ? '----' : String(TREE_UPGRADE_COSTS[state.treeLevel] ?? '----'),
      78,
      21,
    ));
    if (state.treeLevel >= 5) return;
    renderNativeButton(scene, objects, 580, 136.95, index === 0 ? 191.35 : 391.35, 48, 28, () => {
      selectFormalSkillTab(model, index === 0 ? 'tree1' : 'tree2');
      model.bindingReturnTab = index === 0 ? 'tree1' : 'tree2';
      runSaved(upgradeFormalSkillTree(model, storage), callbacks);
    });
  });
}

function renderBinding(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
  objects: Phaser.GameObjects.GameObject[],
): void {
  objects.push(scene.add.image(208, 110, fullFeatureUiAssets.skillBind.key).setOrigin(0));
  const player = getFormalSkillPlayer(model);
  const selected = getFormalLearnedSkills(model)[model.selectedSkillIndex];
  const slotFrame = model.owner === 'p1' ? 1 : 2;

  BindingSlotPositions.forEach((position, visualIndex) => {
    objects.push(scene.add.image(
      position.x,
      position.y,
      getSkillNativeSpriteAsset(BindingSlotCharacters[visualIndex], slotFrame).key,
    ).setOrigin(0));
    const loadoutIndex = BindingVisualToLoadoutIndex[visualIndex];
    const binding = player.skillLoadout.slots[loadoutIndex];
    if (binding) {
      objects.push(scene.add.image(
        position.x + 5,
        position.y + 5,
        getSkillNativeSpriteAsset(SkillIconCharacterByName[binding.skillName], 3).key,
      ).setOrigin(0));
    }
    const zone = scene.add.zone(position.x + 38, position.y + 38, 76, 76)
      .setInteractive({ useHandCursor: true });
    zone.on('pointerup', () => {
      selectFormalSkillSlot(model, loadoutIndex);
      callbacks.onRerender();
    });
    objects.push(zone);
  });

  if (selected) {
    const source = scene.add.image(
      421.95,
      233,
      getSkillNativeSpriteAsset(SkillIconCharacterByName[selected.skillName], 3).key,
    ).setOrigin(0).setInteractive({ useHandCursor: true });
    scene.input.setDraggable(source);
    source.on('drag', (_pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
      source.setPosition(dragX, dragY);
    });
    source.on('dragend', () => {
      const centerX = source.x + source.width / 2;
      const centerY = source.y + source.height / 2;
      const visualIndex = BindingSlotPositions.findIndex((position) =>
        centerX >= position.x && centerX <= position.x + 76
        && centerY >= position.y && centerY <= position.y + 76);
      if (visualIndex >= 0) selectFormalSkillSlot(model, BindingVisualToLoadoutIndex[visualIndex]);
      callbacks.onRerender();
    });
    objects.push(source);
  }

  renderNativeButton(scene, objects, 337, 660.45, 117.05, 40, 44, () => {
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
  objects.push(scene.add.image(116, 83, fullFeatureUiAssets.skillPassive.key).setOrigin(0));
  const player = getFormalSkillPlayer(model);
  player.skillLearning.passiveSkills.forEach((level, index) => {
    const position = PassiveRowPositions[index];
    objects.push(scene.add.image(
      position.x,
      position.y,
      getSkillNativeSpriteAsset(212, index + 1).key,
    ).setOrigin(0));
    const nextLevel = level + 1;
    objects.push(nativeText(scene, position.x + 89, position.y + 2.1, String(level), 58, 30));
    objects.push(nativeText(scene, position.x + 172, position.y + 4.1, passiveEffect(index, level), 167, 30));
    objects.push(nativeText(scene, position.x + 355.95, position.y + 4.75, passiveEffect(index, nextLevel), 180, 30));
    objects.push(nativeText(scene, position.x + 652.95, position.y - 0.95, String(nextLevel * 5000), 80, 30));
    if (level >= 5) return;
    renderNativeButton(scene, objects, 207, position.x + 567.95, position.y - 3.6, 48, 28, () => {
      selectFormalSkill(model, index);
      runSaved(upgradeFormalPassiveSkill(model, storage), callbacks);
    });
  });
}

function passiveEffect(index: number, level: number): string {
  if (level <= 0) return '----';
  if (index < 2) return String(level * 100);
  if (index === 2) return `${level}%`;
  if (index === 3) return String(Math.trunc(level * 3));
  return String(level);
}

function renderNativeButton(
  scene: Phaser.Scene,
  objects: Phaser.GameObjects.GameObject[],
  characterId: number,
  x: number,
  y: number,
  width: number,
  height: number,
  onClick: () => void,
): void {
  const image = scene.add.image(x, y, getSkillNativeButtonAsset(characterId, 'up').key)
    .setOrigin(0)
    .setInteractive(new Phaser.Geom.Rectangle(0, 0, width, height), Phaser.Geom.Rectangle.Contains);
  const setState = (state: NativeButtonState) =>
    image.setTexture(getSkillNativeButtonAsset(characterId, state).key);
  image.on('pointerover', () => setState('over'));
  image.on('pointerout', () => setState('up'));
  image.on('pointerdown', () => setState('down'));
  image.on('pointerup', () => {
    setState('over');
    onClick();
  });
  objects.push(image);
}

function nativeText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  width: number,
  height: number,
  align: 'left' | 'center' | 'right' = 'center',
): Phaser.GameObjects.Text {
  return scene.add.text(x, y, value, {
    color: '#ffffff',
    fontFamily: '"Microsoft YaHei", sans-serif',
    fontSize: '16px',
    align,
    fixedWidth: width,
    fixedHeight: height,
  });
}

function runSaved(success: boolean, callbacks: FormalSkillPageCallbacks): void {
  if (success) callbacks.onSaved();
  callbacks.onRerender();
}
