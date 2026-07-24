import Phaser from 'phaser';
import {
  createFeatureUiHostModel,
  openFeatureUi,
  type FeatureUiOriginKind,
  type FeatureUiOwner,
  type FeatureUiPage,
} from '../../systems/FeatureUiHostSystem';
import { getPartyHeroId, type PartyConfiguration } from '../../systems/PartyConfigurationSystem';
import {
  ensureSceneAssetBundle,
  type BundleLoadFeedback,
} from '../SceneAssetBundleBridge';

export const formalFeatureUiHost = createFeatureUiHostModel();
export const P2_BACKPACK_KEY_CODE = 111;
export const P2_SKILLS_KEY_CODE = 106;

type FeatureUiEntryConfig = {
  originKind: FeatureUiOriginKind;
  party: PartyConfiguration;
};

type FeatureUiKeyBinding = {
  keyboard: Phaser.Input.Keyboard.KeyboardPlugin;
  handler: (event: KeyboardEvent) => void;
};

export function installFormalFeatureUiEntries(
  scene: Phaser.Scene,
  config: FeatureUiEntryConfig,
): void {
  const keyboard = scene.input.keyboard;
  if (!keyboard) return;
  const bindings: FeatureUiKeyBinding[] = [];
  bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.C, 'backpack', 'p1', config);
  bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.V, 'skills', 'p1', config);
  bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.B, 'pets', 'p1', config);
  bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.N, 'magic-weapon', 'p1', config);
  if (config.party.playerCount === 2) {
    bindFeatureKey(scene, keyboard, bindings, P2_BACKPACK_KEY_CODE, 'backpack', 'p2', config);
    bindFeatureKey(scene, keyboard, bindings, P2_SKILLS_KEY_CODE, 'skills', 'p2', config);
    bindFeatureKey(scene, keyboard, bindings, Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT, 'pets', 'p2', config);
  }
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    for (const binding of bindings) binding.keyboard.off('keydown', binding.handler);
  });
}

export async function launchFormalFeatureUi(
  scene: Phaser.Scene,
  page: FeatureUiPage,
  owner: FeatureUiOwner,
  config: FeatureUiEntryConfig,
  feedback?: BundleLoadFeedback,
): Promise<boolean> {
  if (getPartyHeroId(config.party, owner) === undefined) return false;
  try {
    await ensureSceneAssetBundle(scene, 'feature-ui', feedback);
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
  scene.scene.pause(scene.scene.key);
  return true;
}

function bindFeatureKey(
  scene: Phaser.Scene,
  keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
  bindings: FeatureUiKeyBinding[],
  keyCode: number,
  page: FeatureUiPage,
  owner: FeatureUiOwner,
  config: FeatureUiEntryConfig,
): void {
  // Listen at plugin level so formal entries coexist with legacy panels that
  // already own the same Phaser Key objects (notably V/B in TestScene).
  const handler = (event: KeyboardEvent) => {
    if (event.keyCode === keyCode) void launchFormalFeatureUi(scene, page, owner, config);
  };
  keyboard.on('keydown', handler);
  bindings.push({ keyboard, handler });
}
