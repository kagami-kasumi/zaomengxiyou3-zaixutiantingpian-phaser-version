// boundary: UI handlers translate keyboard actions to existing systems; they
// do not own inventory, skill, pet, or magic weapon domain rules.
import Phaser from 'phaser';
import {
  assignSkillToSlot,
  buildInventoryPanelLines,
  buildPetPanelLines,
  canLearnSkill,
  canUpgradePassiveSkill,
  canUpgradeSkill,
  canUpgradeTree,
  consumeStackByFillName,
  equipSelectedInventoryEntry,
  findSkillInState,
  getSelectedInventoryEntry,
  getSkillTreeForHero,
  isPetConsumableFillName,
  learnSkill,
  moveInventorySelection,
  selectNextInventoryCategory,
  selectPet,
  setInventoryFocus,
  syncMagicWeaponFromLoadout,
  toggleInventoryUI,
  toggleSelectedPetActive,
  unequipSelectedLoadoutSlot,
  upgradeEquippedMagicWeapon,
  upgradePassiveSkill,
  upgradeSkill,
  upgradeTree,
  usePetConsumable,
  type PlayerSlot,
  type SkillPanelTab,
  type SkillUIState,
} from './TestSceneSystems';
export function handleInventoryUIKeys(this: any): void {
    if (this.inventoryToggleKey && Phaser.Input.Keyboard.JustDown(this.inventoryToggleKey)) {
      toggleInventoryUI(this.inventoryUI);
      if (this.inventoryUI.isOpen) {
        this.p1SkillUI.skillPanelOpen = false;
        this.p2SkillUI.skillPanelOpen = false;
        this.petPanelOpen = false;
      }
    }

    if (!this.inventoryUI.isOpen) {
      return;
    }

    if (this.inventoryTabKey && Phaser.Input.Keyboard.JustDown(this.inventoryTabKey)) {
      selectNextInventoryCategory(this.inventoryUI, this.inventoryStore, 1);
    }

    if (this.inventoryLeftKey && Phaser.Input.Keyboard.JustDown(this.inventoryLeftKey)) {
      setInventoryFocus(this.inventoryUI, 'inventory');
    }

    if (this.inventoryRightKey && Phaser.Input.Keyboard.JustDown(this.inventoryRightKey)) {
      setInventoryFocus(this.inventoryUI, 'loadout');
    }

    if (this.inventoryUpKey && Phaser.Input.Keyboard.JustDown(this.inventoryUpKey)) {
      moveInventorySelection(this.inventoryUI, this.inventoryStore, -1);
    }

    if (this.inventoryDownKey && Phaser.Input.Keyboard.JustDown(this.inventoryDownKey)) {
      moveInventorySelection(this.inventoryUI, this.inventoryStore, 1);
    }

    if (this.inventoryConfirmKey && Phaser.Input.Keyboard.JustDown(this.inventoryConfirmKey)) {
      if (this.inventoryUI.focus === 'inventory') {
        if (this.tryUseSelectedPetConsumable()) {
          // Pet consumable handled by the inventory item branch.
        } else if (equipSelectedInventoryEntry({
          ui: this.inventoryUI,
          store: this.inventoryStore,
          loadout: this.equipmentLoadout,
          heroName: this.getInventoryHeroName(),
        })) {
          this.syncInventoryHeroStats();
        }
      } else if (unequipSelectedLoadoutSlot({
        ui: this.inventoryUI,
        store: this.inventoryStore,
        loadout: this.equipmentLoadout,
      })) {
        this.syncInventoryHeroStats();
      }
    }

    const unequipPressed =
      (this.inventoryBackspaceKey && Phaser.Input.Keyboard.JustDown(this.inventoryBackspaceKey)) ||
      (this.inventoryDeleteKey && Phaser.Input.Keyboard.JustDown(this.inventoryDeleteKey));
    if (unequipPressed && unequipSelectedLoadoutSlot({
      ui: this.inventoryUI,
      store: this.inventoryStore,
      loadout: this.equipmentLoadout,
    })) {
      this.syncInventoryHeroStats();
    }

    if (
      this.inventoryMagicWeaponUpgradeKey &&
      Phaser.Input.Keyboard.JustDown(this.inventoryMagicWeaponUpgradeKey)
    ) {
      this.upgradeCurrentMagicWeapon();
    }
  }

export function tryUseSelectedPetConsumable(this: any): boolean {
    const selected = getSelectedInventoryEntry(this.inventoryUI, this.inventoryStore);
    if (
      this.inventoryUI.activeCategory !== 'items' ||
      !selected ||
      selected.kind !== 'stack' ||
      !isPetConsumableFillName(selected.definition.fillName)
    ) {
      return false;
    }

    const result = usePetConsumable(this.petRoster, selected.definition.fillName);
    if (!result.shouldConsume) {
      this.inventoryUI.message = result.message;
      return true;
    }

    const consume = consumeStackByFillName(
      this.inventoryStore,
      selected.definition.fillName,
      1,
    );
    this.inventoryUI.message = consume.ok
      ? `${consume.message}；${result.message}`
      : consume.message;
    return true;
  }

export function updateInventoryPanel(this: any): void {
    if (!this.inventoryPanel) {
      return;
    }

    if (!this.inventoryUI.isOpen) {
      this.inventoryPanel.container.setVisible(false);
      return;
    }

    this.inventoryPanel.container.setVisible(true);
    const player = this.getInventoryPlayer();
    const lines = buildInventoryPanelLines({
      store: this.inventoryStore,
      loadout: this.equipmentLoadout,
      baseStats: player?.baseStats ?? { maxHp: 120, maxMp: 160, power: 0, defense: 0 },
      playerLabel: player?.slot.toUpperCase() ?? 'P1',
      heroName: this.getInventoryHeroName(),
      ui: this.inventoryUI,
      magicWeaponSoul: this.magicWeaponSoul,
    });
    this.inventoryPanel.text.setText(lines.join('\n'));
  }

export function upgradeCurrentMagicWeapon(this: any): void {
    const result = upgradeEquippedMagicWeapon({
      loadout: this.equipmentLoadout,
      soul: this.magicWeaponSoul,
    });
    this.magicWeaponSoul = result.soulAfter;
    this.inventoryUI.message = result.message;
    if (!result.ok) {
      return;
    }

    this.syncInventoryHeroStats();
    syncMagicWeaponFromLoadout(this.magicWeapon, this.equipmentLoadout);
  }

export function handlePetUIKeys(this: any): void {
    if (this.p1SkillUI.skillPanelOpen || this.p2SkillUI.skillPanelOpen) {
      return;
    }

    if (this.petPanelToggleKey && Phaser.Input.Keyboard.JustDown(this.petPanelToggleKey)) {
      this.petPanelOpen = !this.petPanelOpen;
      if (this.petPanelOpen) {
        this.inventoryUI.isOpen = false;
        this.p1SkillUI.skillPanelOpen = false;
        this.p2SkillUI.skillPanelOpen = false;
        this.petRoster.message = 'Pet panel opened';
      } else {
        this.petRoster.message = 'Pet panel closed';
      }
    }

    if (!this.petPanelOpen) {
      return;
    }

    if (this.petPanelUpKey && Phaser.Input.Keyboard.JustDown(this.petPanelUpKey)) {
      selectPet(this.petRoster, -1);
    }

    if (this.petPanelDownKey && Phaser.Input.Keyboard.JustDown(this.petPanelDownKey)) {
      selectPet(this.petRoster, 1);
    }

    if (this.petPanelConfirmKey && Phaser.Input.Keyboard.JustDown(this.petPanelConfirmKey)) {
      toggleSelectedPetActive(this.petRoster);
      this.petRuntime = undefined;
    }
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
    this.petPanel.text.setText(buildPetPanelLines(this.petRoster).join('\n'));
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





