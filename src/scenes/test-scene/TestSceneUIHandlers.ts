// boundary: UI handlers translate keyboard actions to existing systems; they
// do not own inventory, skill, pet, or magic weapon domain rules.
import Phaser from 'phaser';
import {
  assignSkillToSlot,
  buildInventoryPanelLines,
  buildCompactPetPanelLines,
  canLearnSkill,
  canUpgradePassiveSkill,
  canUpgradeSkill,
  canUpgradeTree,
  craftStagedSession,
  closeCraftingSession,
  closePetPanel,
  equipSelectedInventoryEntry,
  findSkillInState,
  getSelectedInventoryEntry,
  getSkillTreeForHero,
  learnSkill,
  moveInventorySelection,
  previewCraftingSession,
  removeStagedCraftingMaterial,
  selectNextInventoryCategory,
  selectOwnedPet,
  setInventoryFocus,
  stageCraftingMaterial,
  syncMagicWeaponFromLoadout,
  toggleInventoryForOwner,
  toggleOwnedPetActive,
  togglePetPanelForOwner,
  unequipSelectedLoadoutSlot,
  upgradeEquippedMagicWeapon,
  upgradePassiveSkill,
  upgradeSkill,
  upgradeTree,
  useOwnedPetConsumable,
  type PlayerInventoryRuntime,
  type PlayerSlot,
  type SkillPanelTab,
  type SkillUIState,
} from './TestSceneSystems';
import { setPetPanelOwnerLabel } from './TestScenePetPanelBridge';
export function handleInventoryUIKeys(this: any): void {
    const p1Pressed = this.inventoryToggleKey && Phaser.Input.Keyboard.JustDown(this.inventoryToggleKey);
    const p2Pressed = this.p2InventoryToggleKey && Phaser.Input.Keyboard.JustDown(this.p2InventoryToggleKey);
    const requestedOwner: PlayerSlot | undefined = p1Pressed ? 'p1' : p2Pressed ? 'p2' : undefined;
    if (requestedOwner) {
      const currentRuntime = getActiveInventoryRuntime(this);
      if (currentRuntime.ui.isOpen) {
        closeCraftingSession(currentRuntime.craftingSession, currentRuntime.store);
      }
      const result = toggleInventoryForOwner(
        this.playerInventoryRuntimes,
        this.inventoryOwner,
        requestedOwner,
      );
      this.inventoryOwner = result.ownerSlot;
      if (result.isOpen) {
        this.p1SkillUI.skillPanelOpen = false;
        this.p2SkillUI.skillPanelOpen = false;
        this.petPanelOpen = false;
        closePetPanel(this.petPanelSession);
      }
    }

    const runtime = getActiveInventoryRuntime(this);
    if (!runtime.ui.isOpen) {
      return;
    }

    if (this.inventoryTabKey && Phaser.Input.Keyboard.JustDown(this.inventoryTabKey)) {
      selectNextInventoryCategory(runtime.ui, runtime.store, 1);
    }

    if (this.inventoryLeftKey && Phaser.Input.Keyboard.JustDown(this.inventoryLeftKey)) {
      setInventoryFocus(runtime.ui, 'inventory');
    }

    if (this.inventoryRightKey && Phaser.Input.Keyboard.JustDown(this.inventoryRightKey)) {
      setInventoryFocus(runtime.ui, 'loadout');
    }

    if (this.inventoryUpKey && Phaser.Input.Keyboard.JustDown(this.inventoryUpKey)) {
      moveInventorySelection(runtime.ui, runtime.store, -1);
    }

    if (this.inventoryDownKey && Phaser.Input.Keyboard.JustDown(this.inventoryDownKey)) {
      moveInventorySelection(runtime.ui, runtime.store, 1);
    }

    if (this.inventoryConfirmKey && Phaser.Input.Keyboard.JustDown(this.inventoryConfirmKey)) {
      if (runtime.ui.focus === 'inventory') {
        if (this.tryUseSelectedPetConsumable()) {
          // Pet consumable handled by the inventory item branch.
        } else if (equipSelectedInventoryEntry({
          ui: runtime.ui,
          store: runtime.store,
          loadout: runtime.loadout,
          heroName: this.getInventoryHeroName(runtime.ownerSlot),
        })) {
          this.syncInventoryHeroStats(runtime.ownerSlot);
        }
      } else if (unequipSelectedLoadoutSlot({
        ui: runtime.ui,
        store: runtime.store,
        loadout: runtime.loadout,
      })) {
        this.syncInventoryHeroStats(runtime.ownerSlot);
      }
    }

    const unequipPressed =
      (this.inventoryBackspaceKey && Phaser.Input.Keyboard.JustDown(this.inventoryBackspaceKey)) ||
      (this.inventoryDeleteKey && Phaser.Input.Keyboard.JustDown(this.inventoryDeleteKey));
    if (unequipPressed && unequipSelectedLoadoutSlot({
      ui: runtime.ui,
      store: runtime.store,
      loadout: runtime.loadout,
    })) {
      this.syncInventoryHeroStats(runtime.ownerSlot);
    }

    if (
      this.inventoryMagicWeaponUpgradeKey &&
      Phaser.Input.Keyboard.JustDown(this.inventoryMagicWeaponUpgradeKey)
    ) {
      this.upgradeCurrentMagicWeapon();
    }

    if (
      this.inventoryCraftStageKey &&
      Phaser.Input.Keyboard.JustDown(this.inventoryCraftStageKey)
    ) {
      if (runtime.ui.focus !== 'inventory') {
        runtime.ui.message = '请先选择背包材料';
      } else {
        const result = stageCraftingMaterial(
          runtime.craftingSession,
          runtime.store,
          getSelectedInventoryEntry(runtime.ui, runtime.store),
        );
        runtime.ui.message = result.message;
      }
    }

    if (
      this.inventoryCraftRemoveKey &&
      Phaser.Input.Keyboard.JustDown(this.inventoryCraftRemoveKey)
    ) {
      const result = removeStagedCraftingMaterial(runtime.craftingSession, runtime.store);
      runtime.ui.message = result.message;
    }

    if (this.inventoryCraftKey && Phaser.Input.Keyboard.JustDown(this.inventoryCraftKey)) {
      const result = craftStagedSession({
        session: runtime.craftingSession,
        store: runtime.store,
        registry: this.equipmentRegistry,
        soul: runtime.magicWeaponSoul,
      });
      runtime.magicWeaponSoul = result.soulAfter;
      runtime.ui.message = result.message;
    }
  }

export function tryUseSelectedPetConsumable(this: any): boolean {
    const runtime = getActiveInventoryRuntime(this);
    const result = useOwnedPetConsumable({
      runtime,
      roster: this.playerPetRosters[runtime.ownerSlot],
    });
    if (result.rebuildRuntime) {
      if (runtime.ownerSlot === 'p1') this.petRuntime = undefined;
      else this.p2PetRuntime = undefined;
    }
    return result.handled;
  }

export function updateInventoryPanel(this: any): void {
    if (!this.inventoryPanel) {
      return;
    }

    const runtime = getActiveInventoryRuntime(this);
    if (!runtime.ui.isOpen) {
      this.inventoryPanel.container.setVisible(false);
      return;
    }

    this.inventoryPanel.container.setVisible(true);
    const player = this.getPlayers().find((candidate: any) => candidate.slot === runtime.ownerSlot);
    const lines = buildInventoryPanelLines({
      store: runtime.store,
      loadout: runtime.loadout,
      baseStats: player?.baseStats ?? { maxHp: 120, maxMp: 160, power: 0, defense: 0 },
      playerLabel: player?.slot.toUpperCase() ?? 'P1',
      heroName: this.getInventoryHeroName(runtime.ownerSlot),
      ui: runtime.ui,
      magicWeaponSoul: runtime.magicWeaponSoul,
    });
    const crafting = previewCraftingSession(runtime.craftingSession, runtime.magicWeaponSoul);
    const slots = runtime.craftingSession.slots.map(
      (slot, index) => `${index + 1}:${slot?.entry.definition.name ?? '-'}`,
    );
    while (slots.length < 3) slots.push(`${slots.length + 1}:-`);
    lines.push(
      '',
      `Crafting ${runtime.ownerSlot.toUpperCase()} | ${slots.join(' | ')}`,
      '[X 放入] [R 退回末槽] [F 确认] [C/Num/ 关闭并退回]',
      `${crafting.recipe ? `产物:${crafting.recipe.productName}` : '产物:-'} | ${crafting.message}`,
    );
    this.inventoryPanel.text.setText(lines.join('\n'));
  }

export function upgradeCurrentMagicWeapon(this: any): void {
    const runtime = getActiveInventoryRuntime(this);
    const result = upgradeEquippedMagicWeapon({
      loadout: runtime.loadout,
      soul: runtime.magicWeaponSoul,
    });
    runtime.magicWeaponSoul = result.soulAfter;
    runtime.ui.message = result.message;
    if (!result.ok) {
      return;
    }

    this.syncInventoryHeroStats(runtime.ownerSlot);
    syncMagicWeaponFromLoadout(runtime.magicWeapon, runtime.loadout);
  }

export function handlePetUIKeys(this: any): void {
    if (this.p1SkillUI.skillPanelOpen || this.p2SkillUI.skillPanelOpen) {
      return;
    }

    const p1Pressed = this.petPanelToggleKey && Phaser.Input.Keyboard.JustDown(this.petPanelToggleKey);
    const p2Pressed = this.p2PetPanelToggleKey && Phaser.Input.Keyboard.JustDown(this.p2PetPanelToggleKey);
    const owner: PlayerSlot | undefined = p1Pressed ? 'p1' : p2Pressed ? 'p2' : undefined;
    if (!owner) return;

    this.petPanelOpen = togglePetPanelForOwner(
      this.petPanelSession,
      this.playerPetRosters,
      owner,
    );
    if (this.petPanelOpen) {
      this.playerInventoryRuntimes.p1.ui.isOpen = false;
      this.playerInventoryRuntimes.p2.ui.isOpen = false;
      this.p1SkillUI.skillPanelOpen = false;
      this.p2SkillUI.skillPanelOpen = false;
    }
  }

export function selectPetFromPanel(this: any, direction: 1 | -1): void {
  const owner = this.petPanelSession.owner as PlayerSlot | undefined;
  if (!this.petPanelOpen || !owner) return;
  selectOwnedPet(this.playerPetRosters, owner, direction);
}

export function togglePetFromPanel(this: any): void {
  const owner = this.petPanelSession.owner as PlayerSlot | undefined;
  if (!this.petPanelOpen || !owner) return;
  toggleOwnedPetActive(this.playerPetRosters, owner);
  if (owner === 'p1') this.petRuntime = undefined;
  else this.p2PetRuntime = undefined;
}

export function updatePetPanel(this: any): void {
    if (!this.petPanel) {
      return;
    }

    if (!this.petPanelOpen) {
      this.petPanel.container.setVisible(false);
      return;
    }

    this.petPanel.container.setVisible(true);
    const owner = this.petPanelSession.owner as PlayerSlot | undefined;
    if (!owner) {
      this.petPanelOpen = false;
      this.petPanel.container.setVisible(false);
      return;
    }
    const roster = this.playerPetRosters[owner];
    setPetPanelOwnerLabel(this.petPanel, owner);
    this.petPanel.text.setText(buildCompactPetPanelLines(roster).join('\n'));
  }

export function handleSkillUIKeys(this: any): void {
    this.handleSkillUIForPlayer(
      'p1',
      this.p1SkillPanelKey,
      this.p1LoadoutCycleKey,
      this.p1SkillUI,
    );
    this.handleSkillUIForPlayer(
      'p2',
      this.p2SkillPanelKey,
      this.p2LoadoutCycleKey,
      this.p2SkillUI,
    );

    const p1Open = this.p1SkillUI.skillPanelOpen;
    const p2Open = this.p2SkillUI.skillPanelOpen;
    if (!p1Open && !p2Open) return;

    const activeSlot: PlayerSlot = p1Open ? 'p1' : 'p2';
    const activeUI = p1Open ? this.p1SkillUI : this.p2SkillUI;
    const activeLearning = p1Open ? this.p1SkillLearning : this.p2SkillLearning;
    const activePlayer = this.playerViews.find((p: { slot: PlayerSlot }) => p.slot === activeSlot);
    activeUI.message = '';

    if (this.panelTabKey && Phaser.Input.Keyboard.JustDown(this.panelTabKey)) {
      const tabs: SkillPanelTab[] = ['tree1', 'tree2', 'binding', 'passive'];
      const idx = tabs.indexOf(activeUI.activeTab);
      activeUI.activeTab = tabs[(idx + 1) % tabs.length];
      activeUI.selectedSkillIndex = 0;
    }

    if (this.panelSkillSelectKeys) {
      for (let i = 0; i < this.panelSkillSelectKeys.length; i += 1) {
        if (Phaser.Input.Keyboard.JustDown(this.panelSkillSelectKeys[i])) {
          if (activeUI.activeTab === 'passive') {
            activeUI.selectedSkillIndex = i;
          } else {
            activeUI.selectedSkillIndex = i;
          }
        }
      }
    }

    const heroId = activePlayer?.normalAttack.heroId ?? 2;

    if (this.panelTreeUpgradeKey && Phaser.Input.Keyboard.JustDown(this.panelTreeUpgradeKey)) {
      const treeIdx = activeUI.activeTab === 'tree2' ? 1 : 0;
      if (upgradeTree(activeLearning, treeIdx)) {
        activeUI.message = `Tree ${treeIdx + 1} upgraded to Lv.${activeLearning.trees[treeIdx].treeLevel}`;
      } else {
        activeUI.message = String(canUpgradeTree(activeLearning, treeIdx));
      }
    }

    if (this.panelLearnKey && Phaser.Input.Keyboard.JustDown(this.panelLearnKey)) {
      const treeIdx = activeUI.activeTab === 'tree2' ? 1 : 0;
      const skillIdx = activeUI.selectedSkillIndex;
      const result = learnSkill(activeLearning, heroId, treeIdx, skillIdx);
      if (result) {
        activeUI.message = `Learned ${result}!`;
      } else {
        activeUI.message = String(canLearnSkill(activeLearning, heroId, treeIdx, skillIdx));
      }
    }

    if (this.panelUpgradeKey && Phaser.Input.Keyboard.JustDown(this.panelUpgradeKey)) {
      const treeIdx = activeUI.activeTab === 'tree2' ? 1 : 0;
      const treeConfig = getSkillTreeForHero(heroId, treeIdx);
      if (treeConfig) {
        const skillName = treeConfig.skills[activeUI.selectedSkillIndex];
        if (upgradeSkill(activeLearning, skillName)) {
          const entry = findSkillInState(activeLearning, skillName);
          activeUI.message = `${skillName} upgraded to Lv.${entry?.level}`;
        } else {
          activeUI.message = String(canUpgradeSkill(activeLearning, skillName));
        }
      }
    }

    if (this.panelBindKey && Phaser.Input.Keyboard.JustDown(this.panelBindKey)) {
      if (activePlayer) {
        const treeIdx = activeUI.activeTab === 'tree2' ? 1 : 0;
        const treeConfig = getSkillTreeForHero(heroId, treeIdx);
        if (treeConfig) {
          const skillName = treeConfig.skills[activeUI.selectedSkillIndex];
          const found = findSkillInState(activeLearning, skillName);
          if (found) {
            activePlayer.skill.loadout = assignSkillToSlot(
              activePlayer.skill.loadout,
              activeUI.selectedSlotIndex,
              skillName,
              found.level,
            );
            activeUI.message = `Bound ${skillName} to slot ${activeUI.selectedSlotIndex}`;
          } else {
            activeUI.message = `${skillName} not learned yet`;
          }
        }
      }
    }

    if (this.panelPassiveKey && Phaser.Input.Keyboard.JustDown(this.panelPassiveKey)) {
      const slotIdx = activeUI.selectedSkillIndex;
      if (upgradePassiveSkill(activeLearning, slotIdx)) {
        activeUI.message = `Passive ${slotIdx + 1} upgraded to Lv.${activeLearning.passiveSkills[slotIdx]}`;
      } else {
        activeUI.message = String(canUpgradePassiveSkill(activeLearning, slotIdx));
      }
    }
  }

export function handleSkillUIForPlayer(this: any, 
    _slot: PlayerSlot,
    panelKey: Phaser.Input.Keyboard.Key | undefined,
    cycleKey: Phaser.Input.Keyboard.Key | undefined,
    ui: SkillUIState,
  ): void {
    if (panelKey && Phaser.Input.Keyboard.JustDown(panelKey)) {
      ui.skillPanelOpen = !ui.skillPanelOpen;
      ui.message = '';
      if (ui.skillPanelOpen) {
        ui.activeTab = 'tree1';
        ui.selectedSkillIndex = 0;
      }
    }

    if (cycleKey && Phaser.Input.Keyboard.JustDown(cycleKey)) {
      ui.selectedSlotIndex = (ui.selectedSlotIndex + 1) % 5;
    }
  }

function getActiveInventoryRuntime(scene: any): PlayerInventoryRuntime {
  return scene.playerInventoryRuntimes[scene.inventoryOwner];
}
