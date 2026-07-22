import Phaser from 'phaser';
import { fullFeatureUiAssets } from '../../assets/AssetManifest';
import {
  bindFormalSkill,
  formatFormalSkillSummary,
  getFormalLearnedSkills,
  getFormalSkillPlayer,
  learnFormalSkill,
  selectFormalSkill,
  selectFormalSkillSlot,
  selectFormalSkillTab,
  upgradeFormalPassiveSkill,
  upgradeFormalSkill,
  upgradeFormalSkillTree,
  type FormalSkillPageModel,
} from '../../systems/FormalSkillPageSystem';
import { HERO_SKILL_TREES, SkillSlotKeyLabels, type SkillPanelTab } from '../../systems/SkillUISystem';
import type { SaveStorage } from '../../systems/SaveSystem';

type FormalSkillPageCallbacks = {
  playerCount: 1 | 2;
  onOwner: (owner: 'p1' | 'p2') => void;
  onSaved: () => void;
  onClose: () => void;
  onRerender: () => void;
};

const TabLabels: ReadonlyArray<{ tab: SkillPanelTab; label: string }> = [
  { tab: 'tree1', label: '心法一' },
  { tab: 'tree2', label: '心法二' },
  { tab: 'binding', label: '五槽绑定' },
  { tab: 'passive', label: '被动技能' },
];

export function createFormalSkillPageView(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
): Phaser.GameObjects.Container {
  const objects: Phaser.GameObjects.GameObject[] = [];
  objects.push(scene.add.image(0, 0, fullFeatureUiAssets.skillHub.key).setOrigin(0).setAlpha(0.7));
  objects.push(scene.add.rectangle(470, 295, 940, 590, 0x07101b, 0.48));
  objects.push(scene.add.rectangle(470, 295, 900, 548, 0x111a27, 0.86).setStrokeStyle(2, 0xe5bc55));
  objects.push(scene.add.text(470, 34, `${model.owner.toUpperCase()} 正式心法与技能`, {
    color: '#fff0ad', fontFamily: 'Arial, sans-serif', fontSize: '25px', fontStyle: 'bold',
  }).setOrigin(0.5));

  objects.push(...createSkillButton(scene, 84, 70, 92, 32, 'P1 技能', () => callbacks.onOwner('p1')));
  if (callbacks.playerCount === 2) {
    objects.push(...createSkillButton(scene, 184, 70, 92, 32, 'P2 技能', () => callbacks.onOwner('p2')));
  }
  TabLabels.forEach(({ tab, label }, index) => {
    objects.push(...createSkillButton(scene, 330 + index * 125, 78, 112, 34, label, () => {
      selectFormalSkillTab(model, tab);
      callbacks.onRerender();
    }, model.activeTab === tab));
  });

  const subAsset = model.activeTab === 'binding'
    ? fullFeatureUiAssets.skillBind
    : model.activeTab === 'passive'
      ? fullFeatureUiAssets.skillPassive
      : fullFeatureUiAssets.skillActive;
  objects.push(scene.add.image(470, 310, subAsset.key).setOrigin(0.5).setAlpha(0.34));

  if (model.activeTab === 'tree1' || model.activeTab === 'tree2') {
    renderTree(scene, model, storage, callbacks, objects);
  } else if (model.activeTab === 'binding') {
    renderBinding(scene, model, storage, callbacks, objects);
  } else {
    renderPassive(scene, model, storage, callbacks, objects);
  }

  objects.push(scene.add.text(120, 455, formatFormalSkillSummary(model).join('\n'), {
    color: '#dce8f7', fontFamily: 'Arial, sans-serif', fontSize: '14px', lineSpacing: 5,
    wordWrap: { width: 675 },
  }));
  objects.push(...createSkillButton(scene, 850, 520, 130, 40, '关闭返回', callbacks.onClose));
  return scene.add.container(0, 0, objects).setDepth(20);
}

function renderTree(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
  objects: Phaser.GameObjects.GameObject[],
): void {
  const player = getFormalSkillPlayer(model);
  const treeIndex = model.activeTab === 'tree1' ? 0 : 1;
  const tree = HERO_SKILL_TREES[player.progression.heroId][treeIndex];
  const treeState = player.skillLearning.trees[treeIndex];
  objects.push(scene.add.text(150, 124, `${tree.name} · Lv.${treeState.treeLevel}/5`, {
    color: '#ffe59a', fontFamily: 'Arial, sans-serif', fontSize: '19px', fontStyle: 'bold',
  }));
  tree.skills.forEach((skillName, index) => {
    const learned = treeState.learnedSkills.find((entry) => entry.skillName === skillName);
    objects.push(...createSkillButton(
      scene, 185 + index * 140, 205, 124, 64,
      `${skillName}\n${learned ? `Lv.${learned.level}` : index < treeState.treeLevel ? '可学习' : '未解锁'}`,
      () => { selectFormalSkill(model, index); callbacks.onRerender(); },
      model.selectedSkillIndex === index,
    ));
  });
  objects.push(...createSkillButton(scene, 300, 330, 150, 42, '升级心法', () => runSaved(
    upgradeFormalSkillTree(model, storage), callbacks,
  )));
  objects.push(...createSkillButton(scene, 470, 330, 150, 42, '学习选中', () => runSaved(
    learnFormalSkill(model, storage), callbacks,
  )));
  objects.push(...createSkillButton(scene, 640, 330, 150, 42, '升级技能', () => runSaved(
    upgradeFormalSkill(model, storage), callbacks,
  )));
}

function renderBinding(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
  objects: Phaser.GameObjects.GameObject[],
): void {
  const player = getFormalSkillPlayer(model);
  const learned = getFormalLearnedSkills(model);
  objects.push(scene.add.text(125, 122, '已学主动技能', {
    color: '#ffe59a', fontFamily: 'Arial, sans-serif', fontSize: '18px', fontStyle: 'bold',
  }));
  learned.slice(0, 10).forEach((entry, index) => {
    const col = index % 5;
    const row = Math.floor(index / 5);
    objects.push(...createSkillButton(
      scene, 180 + col * 130, 180 + row * 54, 116, 42,
      `${entry.skillName} Lv.${entry.level}`,
      () => { selectFormalSkill(model, index); callbacks.onRerender(); },
      model.selectedSkillIndex === index,
    ));
  });
  player.skillLoadout.slots.forEach((binding, index) => {
    objects.push(...createSkillButton(
      scene, 210 + index * 130, 325, 116, 52,
      `${SkillSlotKeyLabels[model.owner][index]}\n${binding?.skillName ?? '空'}`,
      () => { selectFormalSkillSlot(model, index); callbacks.onRerender(); },
      model.selectedSlotIndex === index,
    ));
  });
  objects.push(...createSkillButton(scene, 470, 397, 180, 42, '绑定到选中槽', () => runSaved(
    bindFormalSkill(model, storage), callbacks,
  )));
}

function renderPassive(
  scene: Phaser.Scene,
  model: FormalSkillPageModel,
  storage: SaveStorage,
  callbacks: FormalSkillPageCallbacks,
  objects: Phaser.GameObjects.GameObject[],
): void {
  const levels = getFormalSkillPlayer(model).skillLearning.passiveSkills;
  levels.forEach((level, index) => {
    objects.push(...createSkillButton(
      scene, 190 + index * 140, 225, 124, 68,
      `被动 ${index + 1}\nLv.${level}/5`,
      () => { selectFormalSkill(model, index); callbacks.onRerender(); },
      model.selectedSkillIndex === index,
    ));
  });
  objects.push(...createSkillButton(scene, 470, 340, 190, 44, '升级选中被动', () => runSaved(
    upgradeFormalPassiveSkill(model, storage), callbacks,
  )));
}

function runSaved(success: boolean, callbacks: FormalSkillPageCallbacks): void {
  if (success) callbacks.onSaved();
  callbacks.onRerender();
}

function createSkillButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  onClick: () => void,
  selected = false,
): Phaser.GameObjects.GameObject[] {
  const background = scene.add.rectangle(x, y, width, height, selected ? 0x765b27 : 0x24364d, 0.98)
    .setStrokeStyle(selected ? 3 : 1, selected ? 0xffdc75 : 0xc9d6e8)
    .setInteractive({ useHandCursor: true });
  const text = scene.add.text(x, y, label, {
    color: '#ffffff', fontFamily: 'Arial, sans-serif', fontSize: '13px', align: 'center',
  }).setOrigin(0.5);
  background.on('pointerdown', onClick);
  return [background, text];
}
