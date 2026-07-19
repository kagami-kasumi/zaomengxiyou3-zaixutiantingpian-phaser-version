import { closeCraftingSession } from '../../systems/CraftingSystem';
import type { PlayerSlot } from '../../systems/InputSystem';
import { closePetPanel } from '../../systems/PetOwnershipSystem';

export type CraftingEntryView = {
  container: Phaser.GameObjects.Container;
};

export function createCraftingEntryView(this: any): CraftingEntryView {
  const scene = this;
  const container = scene.add.container(24, 76).setScrollFactor(0).setDepth(90);
  const background = scene.add.rectangle(0, 0, 190, 46, 0x24130a, 0.94)
    .setOrigin(0, 0)
    .setStrokeStyle(2, 0xd9a441)
    .setInteractive({ useHandCursor: true });
  const label = scene.add.text(95, 23, '地图菜单 · 炼丹炉', {
    color: '#fff0b5',
    fontFamily: 'Arial, sans-serif',
    fontSize: '17px',
    fontStyle: 'bold',
  }).setOrigin(0.5, 0.5);
  background.on('pointerover', () => background.setFillStyle(0x4a2a12, 0.98));
  background.on('pointerout', () => background.setFillStyle(0x24130a, 0.94));
  background.on('pointerdown', () => openCraftingFromMap(scene, 'p1'));
  container.add([background, label]);
  return { container };
}

export function updateCraftingEntryView(scene: any, view: CraftingEntryView): void {
  view.container.setVisible(!isCraftingOpen(scene));
}

export function openCraftingFromMap(scene: any, ownerSlot: PlayerSlot): boolean {
  if (ownerSlot === 'p2' && scene.playerCount !== 2) return false;
  if (scene.p1SkillUI) scene.p1SkillUI.skillPanelOpen = false;
  if (scene.p2SkillUI) scene.p2SkillUI.skillPanelOpen = false;
  if (scene.petPanelSession) closePetPanel(scene.petPanelSession);
  scene.petPanelOpen = false;
  const current = scene.playerInventoryRuntimes[scene.inventoryOwner];
  if (current.ownerSlot !== ownerSlot) {
    closeCraftingSession(current.craftingSession, current.store);
  }
  scene.playerInventoryRuntimes.p1.ui.isOpen = ownerSlot === 'p1';
  scene.playerInventoryRuntimes.p2.ui.isOpen = ownerSlot === 'p2';
  scene.inventoryOwner = ownerSlot;
  return true;
}

export function closeCraftingToMap(scene: any): void {
  for (const ownerSlot of ['p1', 'p2'] as const) {
    const runtime = scene.playerInventoryRuntimes[ownerSlot];
    const result = closeCraftingSession(runtime.craftingSession, runtime.store);
    runtime.ui.message = result.message;
    runtime.ui.isOpen = false;
  }
}

export function isCraftingOpen(scene: any): boolean {
  return scene.playerInventoryRuntimes.p1.ui.isOpen || scene.playerInventoryRuntimes.p2.ui.isOpen;
}
