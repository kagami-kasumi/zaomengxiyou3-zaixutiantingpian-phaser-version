// boundary: save bridge adapts TestScene runtime state to SaveSystem snapshots;
// serialization, validation, and migration rules remain in src/systems/SaveSystem.ts.
import {
  createGameSave,
  getHeroBaseStats,
  loadActiveGame,
  resetHeroCombat,
  resetHeroSkill,
  restoreGameState,
  saveActiveGame,
  setHeroId,
  setHeroProgressionHero,
  syncMagicWeaponFromLoadout,
  type SaveStorage,
} from './TestSceneSystems';

type SceneSaveRuntime = {
  autosaveElapsedMs: number;
  lastResult: string;
};

const AutosaveIntervalMs = 2_000;

export function initializeSceneSave(this: any): void {
  this.saveRuntime = {
    autosaveElapsedMs: 0,
    lastResult: 'SAVE ready',
  } satisfies SceneSaveRuntime;
  this.saveStatusText = this.add.text(12, 12, 'SAVE ready', {
    color: '#9ed7b5',
    fontFamily: 'Arial, sans-serif',
    fontSize: '12px',
  }).setScrollFactor(0).setDepth(120);
  applyFormalPartyHeroes(this);
  if (this.formalPartyRuntime?.source === 'dev-override') {
    setSaveResult(this, 'SAVE disabled for DEV party');
    return;
  }

  const storage = getBrowserStorage();
  if (!storage) {
    setSaveResult(this, 'SAVE unavailable');
    return;
  }
  const save = loadActiveGame(storage);
  if (!save) {
    setSaveResult(this, 'SAVE new game');
    return;
  }
  let restored: ReturnType<typeof restoreGameState>;
  try {
    restored = restoreGameState(save, this.equipmentRegistry);
  } catch {
    setSaveResult(this, 'SAVE invalid data');
    return;
  }
  const player = this.playerViews.find((view: any) => view.slot === 'p1');
  if (!player) {
    setSaveResult(this, 'SAVE load failed: P1 missing');
    return;
  }

  player.progression = restored.progression;
  setHeroId(player.normalAttack, restored.progression.heroId);
  player.baseStats = getHeroBaseStats(restored.progression.heroId, restored.progression.level);
  player.skill.loadout = restored.skillLoadout;
  resetHeroCombat(player.combat);
  resetHeroSkill(player.skill);
  this.p1SkillLearning = restored.skillLearning;
  this.p2SkillLearning = restored.player2.skillLearning;
  this.p1SoulOwner.soulCount = restored.soulCount;
  this.p2SoulOwner.soulCount = restored.player2.soulCount;
  this.playerInventoryRuntimes.p1.store = restored.inventoryStore;
  this.inventoryStore = restored.inventoryStore;
  this.playerInventoryRuntimes.p1.loadout = restored.equipmentLoadout;
  this.playerInventoryRuntimes.p2.store = restored.player2.inventoryStore;
  this.playerInventoryRuntimes.p2.loadout = restored.player2.equipmentLoadout;
  this.petRoster = restored.petRoster;
  this.playerPetRosters.p1 = restored.petRoster;
  this.playerPetRosters.p2 = restored.player2PetRoster;
  this.p2PetRoster = restored.player2PetRoster;
  this.levelUnlockProgress = restored.levelUnlockProgress;
  this.petRuntime = undefined;
  this.p2PetRuntime = undefined;
  this.destroyPetView();
  this.p2PetView?.root.destroy(true);
  this.p2PetView = undefined;
  this.syncPlayerEffectiveStats(player, { refill: true });
  syncMagicWeaponFromLoadout(
    this.playerInventoryRuntimes.p1.magicWeapon,
    this.playerInventoryRuntimes.p1.loadout,
  );
  this.refreshPlayerHeroView(player);
  const player2 = this.playerViews.find((view: any) => view.slot === 'p2');
  if (player2) {
    player2.progression = restored.player2.progression;
    setHeroId(player2.normalAttack, restored.player2.progression.heroId);
    player2.baseStats = getHeroBaseStats(
      restored.player2.progression.heroId,
      restored.player2.progression.level,
    );
    player2.skill.loadout = restored.player2.skillLoadout;
    resetHeroCombat(player2.combat);
    resetHeroSkill(player2.skill);
    this.syncPlayerEffectiveStats(player2, { refill: true });
    syncMagicWeaponFromLoadout(
      this.playerInventoryRuntimes.p2.magicWeapon,
      this.playerInventoryRuntimes.p2.loadout,
    );
    this.refreshPlayerHeroView(player2);
  }
  this.savedPlayer2FeatureState = restored.player2;
  setSaveResult(this, `SAVE loaded ${save.savedAt.slice(0, 10)}`);
}

function applyFormalPartyHeroes(scene: any): void {
  for (const member of scene.formalPartyRuntime?.members ?? []) {
    const player = scene.playerViews.find((view: any) => view.slot === member.slot);
    if (!player) continue;
    setHeroProgressionHero(player.progression, member.heroId);
    setHeroId(player.normalAttack, member.heroId);
    player.baseStats = getHeroBaseStats(member.heroId, player.progression.level);
    scene.syncPlayerEffectiveStats(player, { refill: true });
    scene.refreshPlayerHeroView(player);
  }
}

export function updateSceneSave(this: any, deltaMs: number): void {
  if (this.formalPartyRuntime?.source === 'dev-override') return;
  const runtime = this.saveRuntime as SceneSaveRuntime | undefined;
  const storage = getBrowserStorage();
  if (!runtime || !storage) return;
  runtime.autosaveElapsedMs += Math.max(0, deltaMs);
  if (runtime.autosaveElapsedMs < AutosaveIntervalMs) return;
  runtime.autosaveElapsedMs %= AutosaveIntervalMs;
  saveSceneNow.call(this, storage);
}

export function saveSceneNow(this: any, storage?: SaveStorage): void {
  if (this.formalPartyRuntime?.source === 'dev-override') return;
  const activeStorage = storage ?? getRequiredBrowserStorage();
  const player = this.playerViews.find((view: any) => view.slot === 'p1');
  if (!player) return;
  const player2 = this.playerViews.find((view: any) => view.slot === 'p2');
  const savedPlayer2 = this.savedPlayer2FeatureState;
  try {
    const activeSave = loadActiveGame(activeStorage);
    const activeParty = activeSave?.party;
    const saved = saveActiveGame(activeStorage, createGameSave({
      party: activeParty,
      progression: player.progression,
      soulCount: this.p1SoulOwner.soulCount,
      skillLoadout: player.skill.loadout,
      skillLearning: this.p1SkillLearning,
      inventoryStore: this.playerInventoryRuntimes.p1.store,
      immortalityFlags: activeSave?.player1.immortalityFlags,
      equipmentLoadout: this.playerInventoryRuntimes.p1.loadout,
      petRoster: this.petRoster,
      player2Progression: player2?.progression ?? savedPlayer2?.progression,
      player2SoulCount: this.p2SoulOwner.soulCount,
      player2SkillLoadout: player2?.skill.loadout ?? savedPlayer2?.skillLoadout,
      player2SkillLearning: this.p2SkillLearning,
      player2InventoryStore: this.playerInventoryRuntimes.p2.store,
      player2ImmortalityFlags: activeSave?.player2.immortalityFlags,
      player2EquipmentLoadout: this.playerInventoryRuntimes.p2.loadout,
      player2PetRoster: this.playerPetRosters.p2,
      levelUnlockProgress: this.levelUnlockProgress,
    }));
    setSaveResult(this, saved ? 'SAVE autosaved' : 'SAVE slot unavailable');
  } catch {
    setSaveResult(this, 'SAVE write failed');
  }
}

function setSaveResult(scene: any, message: string): void {
  if (scene.saveRuntime) scene.saveRuntime.lastResult = message;
  scene.saveStatusText?.setText(message);
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function getRequiredBrowserStorage(): SaveStorage {
  const storage = getBrowserStorage();
  if (!storage) throw new Error('localStorage unavailable');
  return storage;
}
