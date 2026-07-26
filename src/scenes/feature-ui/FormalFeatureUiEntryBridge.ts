import Phaser from 'phaser';
import {
  stageFeatureEntryButtonAssets,
} from '../../assets/AssetManifest';
import {
  createFeatureUiHostModel,
  openFeatureUi,
  type FeatureUiOriginKind,
  type FeatureUiOwner,
  type FeatureUiPage,
} from '../../systems/FeatureUiHostSystem';
import { getFeatureUiAssetBundleId } from '../../assets/SceneAssetBundles';
import { getPartyHeroId, type PartyConfiguration } from '../../systems/PartyConfigurationSystem';
import { loadActiveGame } from '../../systems/SaveSlotSystem';
import {
  routeStageFeatureEntry,
  type StageFeatureEntry,
  type StageFeatureEntrySource,
} from '../../systems/StageFeatureEntryRouterSystem';
import {
  ensureSceneAssetBundle,
  type BundleLoadFeedback,
} from '../SceneAssetBundleBridge';

export const formalFeatureUiHost = createFeatureUiHostModel();
export const P2_BACKPACK_KEY_CODE = 111;
export const P2_SKILLS_KEY_CODE = 106;
export const StageFeatureSettingsRequestedEvent = 'stage-feature-settings-requested';
export const StageFeatureEntryBlockedEvent = 'stage-feature-entry-blocked';

export type FeatureUiEntryConfig = {
  originKind: FeatureUiOriginKind;
  party: PartyConfiguration;
  blocksInventoryPages?: boolean;
  blocksPetPage?: boolean;
};

type FeatureUiKeyBinding = {
  keyboard: Phaser.Input.Keyboard.KeyboardPlugin;
  handler: (event: KeyboardEvent) => void;
};

type EntryButtonSpec = Readonly<{
  entry: StageFeatureEntry;
  x: number;
  y: number;
  assets: typeof stageFeatureEntryButtonAssets[keyof typeof stageFeatureEntryButtonAssets];
}>;

const EntryButtonSpecs: readonly EntryButtonSpec[] = [
  { entry: 'settings', x: 63.65, y: 563.15, assets: stageFeatureEntryButtonAssets.settings },
  { entry: 'backpack', x: 32.9, y: 540.5, assets: stageFeatureEntryButtonAssets.backpack },
  { entry: 'skills', x: 28.5, y: 504.85, assets: stageFeatureEntryButtonAssets.skills },
  { entry: 'magic-weapon', x: 55.15, y: 475.4, assets: stageFeatureEntryButtonAssets.magicWeapon },
  { entry: 'pets', x: 91.35, y: 472.65, assets: stageFeatureEntryButtonAssets.pets },
];

const ownerAliveByScene = new WeakMap<Phaser.Scene, Map<FeatureUiOwner, boolean>>();

export function installFormalFeatureUiEntries(
  scene: Phaser.Scene,
  config: FeatureUiEntryConfig,
): void {
  const keyboard = scene.input.keyboard;
  const bindings: FeatureUiKeyBinding[] = [];
  const buttons: Phaser.GameObjects.GameObject[] = [];
  if (keyboard) {
    bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.ESC, 'settings', 'p1', config);
    bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.C, 'backpack', 'p1', config);
    bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.V, 'skills', 'p1', config);
    bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.B, 'pets', 'p1', config);
    bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.N, 'magic-weapon', 'p1', config);
    if (config.party.playerCount === 2) {
      bindFeatureKey(scene, keyboard, bindings, P2_BACKPACK_KEY_CODE, 'backpack', 'p2', config);
      bindFeatureKey(scene, keyboard, bindings, P2_SKILLS_KEY_CODE, 'skills', 'p2', config);
      bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT, 'pets', 'p2', config);
    }
  }
  if (config.originKind === 'combat') {
    buttons.push(...createStageFeatureEntryButtons(scene, 'p1', config));
    if (config.party.playerCount === 2) {
      buttons.push(...createStageFeatureEntryButtons(scene, 'p2', config));
    }
  }
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    for (const binding of bindings) binding.keyboard.off('keydown', binding.handler);
    for (const button of buttons) button.destroy();
    ownerAliveByScene.delete(scene);
  });
}

export function setStageFeatureEntryOwnerAlive(
  scene: Phaser.Scene,
  owner: FeatureUiOwner,
  alive: boolean,
): void {
  const states = ownerAliveByScene.get(scene) ?? new Map<FeatureUiOwner, boolean>();
  states.set(owner, alive);
  ownerAliveByScene.set(scene, states);
}

export async function launchFormalFeatureUi(
  scene: Phaser.Scene,
  page: FeatureUiPage,
  owner: FeatureUiOwner,
  config: FeatureUiEntryConfig,
  feedback?: BundleLoadFeedback,
): Promise<boolean> {
  const heroId = getPartyHeroId(config.party, owner);
  if (heroId === undefined) return false;
  try {
    await ensureSceneAssetBundle(
      scene,
      getFeatureUiAssetBundleId(page, heroId),
      feedback,
    );
  } catch {
    return false;
  }
  if (!scene.scene.isActive(scene.scene.key)) return false;
  const result = openFeatureUi(formalFeatureUiHost, {
    page,
    owner,
    originSceneKey: scene.scene.key,
    originKind: config.originKind,
    playerCount: config.party.playerCount,
  });
  if (result.status !== 'opened') return false;

  scene.scene.launch('FeatureUiScene', result.session);
  scene.scene.bringToTop('FeatureUiScene');
  scene.scene.pause(scene.scene.key);
  return true;
}

export function launchStageSettings(
  scene: Phaser.Scene,
  config: FeatureUiEntryConfig,
): boolean {
  if (config.originKind !== 'combat') return false;
  if (formalFeatureUiHost.active || scene.scene.isActive('StageSettingsScene')) return false;
  scene.scene.launch('StageSettingsScene', { originSceneKey: scene.scene.key });
  scene.scene.bringToTop('StageSettingsScene');
  scene.scene.pause(scene.scene.key);
  return true;
}

function bindFeatureKey(
  scene: Phaser.Scene,
  keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
  bindings: FeatureUiKeyBinding[],
  keyCode: number,
  entry: StageFeatureEntry,
  owner: FeatureUiOwner,
  config: FeatureUiEntryConfig,
): void {
  // Listen at plugin level so formal entries coexist with legacy panels that
  // already own the same Phaser Key objects (notably V/B in TestScene).
  const handler = (event: KeyboardEvent) => {
    if (event.keyCode === keyCode) void routeFeatureEntry(scene, entry, owner, 'keyboard', config);
  };
  keyboard.on('keydown', handler);
  bindings.push({ keyboard, handler });
}

function createStageFeatureEntryButtons(
  scene: Phaser.Scene,
  owner: FeatureUiOwner,
  config: FeatureUiEntryConfig,
): Phaser.GameObjects.GameObject[] {
  return EntryButtonSpecs.flatMap((spec) => {
    const x = owner === 'p1' ? spec.x : 920 - spec.x;
    const button = scene.add.image(x, spec.y, spec.assets.up.key)
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(114);
    button.setName(`stage-feature-entry-${owner}-${spec.entry}`);
    const hit = scene.add.zone(
      x,
      spec.y,
      31,
      35,
    )
      .setDepth(115)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    hit.setName(`stage-feature-entry-hit-${owner}-${spec.entry}`);
    hit.on('pointerover', () => button.setTexture(spec.assets.over.key));
    hit.on('pointerout', () => button.setTexture(spec.assets.up.key));
    hit.on('pointerdown', () => button.setTexture(spec.assets.down.key));
    hit.on('pointerup', () => {
      button.setTexture(spec.assets.over.key);
      void routeFeatureEntry(scene, spec.entry, owner, 'pointer', config);
    });
    return [button, hit];
  });
}

async function routeFeatureEntry(
  scene: Phaser.Scene,
  entry: StageFeatureEntry,
  owner: FeatureUiOwner,
  source: StageFeatureEntrySource,
  config: FeatureUiEntryConfig,
): Promise<void> {
  const route = routeStageFeatureEntry(
    { entry, owner, source },
    {
      playerCount: config.party.playerCount,
      ownerAlive: ownerAliveByScene.get(scene)?.get(owner) ?? true,
      magicWeaponEquipped: readMagicWeaponEquipped(owner),
      blocksInventoryPages: config.blocksInventoryPages,
      blocksPetPage: config.blocksPetPage,
    },
  );
  if (route.status === 'blocked') {
    scene.events.emit(StageFeatureEntryBlockedEvent, route);
    return;
  }
  if (route.status === 'settings-pending') {
    scene.events.emit(StageFeatureSettingsRequestedEvent, route);
    launchStageSettings(scene, config);
    return;
  }
  await launchFormalFeatureUi(scene, route.page, route.owner, config);
}

function readMagicWeaponEquipped(owner: FeatureUiOwner): boolean {
  try {
    const save = loadActiveGame(window.localStorage);
    const player = owner === 'p1' ? save?.player1 : save?.player2;
    return player?.equipment.magicWeapon !== null && player?.equipment.magicWeapon !== undefined;
  } catch {
    return false;
  }
}
