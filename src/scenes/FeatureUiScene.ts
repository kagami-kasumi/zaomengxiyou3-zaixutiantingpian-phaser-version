import Phaser from 'phaser';
// boundary: this overlay owns Phaser composition and host routing only;
// inventory, skill, pet, persistence, and combat-HUD rules remain in systems/bridges.
import {
  createFormalInventoryPage,
  setFormalInventoryOwner,
  type FormalInventoryPageModel,
} from '../systems/FormalInventoryPageSystem';
import type { SaveStorage } from '../systems/SaveSystem';
import {
  createFormalSkillPage,
  getFormalSkillEntryPlayerCount,
  setFormalSkillOwner,
  type FormalSkillPageModel,
} from '../systems/FormalSkillPageSystem';
import {
  createFormalPetPage,
  setFormalPetOwner,
  type FormalPetPageModel,
} from '../systems/FormalPetPageSystem';
import {
  closeFeatureUi,
  switchFeatureUiOwner,
  type FeatureUiOwner,
  type FeatureUiPage,
  type FeatureUiSession,
} from '../systems/FeatureUiHostSystem';
import {
  formalFeatureUiHost,
  P2_BACKPACK_KEY_CODE,
  P2_SKILLS_KEY_CODE,
  getFormalFeatureUiStorageOverride,
  reportFormalFeatureUiFailure,
} from './feature-ui/FormalFeatureUiEntryBridge';
import { createFormalSkillPageView } from './feature-ui/FormalSkillPageView';
import { syncFormalSkillRuntime } from './feature-ui/FormalSkillRuntimeBridge';
import { createFormalPetPageView } from './feature-ui/FormalPetPageView';
import { syncFormalPetRuntime } from './feature-ui/FormalPetRuntimeBridge';
import {
  closeFormalWorkshopPage,
  createFormalWorkshopPage,
  setFormalWorkshopOwner,
  type FormalWorkshopPageModel,
} from '../systems/FormalWorkshopPageSystem';
import { createFormalWorkshopPageView } from './feature-ui/FormalWorkshopPageView';
import {
  cancelFormalMagicWeaponAction,
  createFormalMagicWeaponPage,
  type FormalMagicWeaponPageModel,
} from '../systems/FormalMagicWeaponPageSystem';
import { createFormalMagicWeaponPageView } from './feature-ui/FormalMagicWeaponPageView';
import { syncFormalMagicWeaponRuntime } from './feature-ui/FormalMagicWeaponRuntimeBridge';
import { ensureFeatureUiPageAssets } from './feature-ui/FeatureUiPageAssetBridge';
import { createFormalInventoryPageView } from './feature-ui/FormalInventoryPageView';
import { assertVerifiedStageFeatureHostTruth } from './feature-ui/FormalStageFeatureHostTruth';

const PageKeys: ReadonlyArray<{ keyCode: number; page: FeatureUiPage; owner: FeatureUiOwner }> = [
  { keyCode: Phaser.Input.Keyboard.KeyCodes.C, page: 'backpack', owner: 'p1' },
  { keyCode: Phaser.Input.Keyboard.KeyCodes.V, page: 'skills', owner: 'p1' },
  { keyCode: Phaser.Input.Keyboard.KeyCodes.B, page: 'pets', owner: 'p1' },
  { keyCode: Phaser.Input.Keyboard.KeyCodes.N, page: 'magic-weapon', owner: 'p1' },
  { keyCode: P2_BACKPACK_KEY_CODE, page: 'backpack', owner: 'p2' },
  { keyCode: P2_SKILLS_KEY_CODE, page: 'skills', owner: 'p2' },
  { keyCode: Phaser.Input.Keyboard.KeyCodes.NUMPAD_SUBTRACT, page: 'pets', owner: 'p2' },
];

export class FeatureUiScene extends Phaser.Scene {
  private session?: FeatureUiSession;
  private backpackLayer?: Phaser.GameObjects.Container;
  private inventoryModel?: FormalInventoryPageModel;
  private skillLayer?: Phaser.GameObjects.Container;
  private skillModel?: FormalSkillPageModel;
  private petLayer?: Phaser.GameObjects.Container;
  private petModel?: FormalPetPageModel;
  private workshopLayer?: Phaser.GameObjects.Container;
  private workshopModel?: FormalWorkshopPageModel;
  private workshopFeedbackText?: Phaser.GameObjects.Text;
  private workshopFeedbackTimer?: Phaser.Time.TimerEvent;
  private magicWeaponLayer?: Phaser.GameObjects.Container;
  private magicWeaponModel?: FormalMagicWeaponPageModel;
  private storage?: SaveStorage;
  private finished = false;

  public constructor() {
    super('FeatureUiScene');
  }

  public init(data: FeatureUiSession): void {
    this.session = data;
    this.finished = false;
  }

  public create(): void {
    if (!this.session || formalFeatureUiHost.active?.originSceneKey !== this.session.originSceneKey) {
      this.scene.stop();
      return;
    }
    this.storage = getFormalFeatureUiStorageOverride() ?? getBrowserStorage();
    try {
      assertVerifiedStageFeatureHostTruth();
      this.renderSession();
      if (this.session.page === 'pets' && !this.petLayer) {
        throw new Error('Formal pet page did not create its verified 932 projection.');
      }
    } catch (error) {
      this.reportFailure('render', error);
      this.scene.stop();
      return;
    }

    if (this.session.originKind === 'combat') {
      for (const binding of PageKeys.filter((binding) => binding.page === this.session?.page)) {
        this.input.keyboard?.addKey(binding.keyCode).on('down', this.closeHost, this);
      }
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.finishSession, this);
  }

  private async switchOwner(owner: FeatureUiOwner): Promise<void> {
    if (!this.session) return;
    const page = this.session.page;
    if (
      page === 'skills'
      && (!this.storage || getFormalSkillEntryPlayerCount(this.storage, owner) === undefined)
    ) {
      return;
    }
    try {
      if (!await ensureFeatureUiPageAssets(this, page, owner, this.storage)) {
        this.reportFailure('page-assets', 'Feature UI scene became inactive while owner assets loaded.');
        return;
      }
    } catch (error) {
      this.reportFailure('page-assets', error);
      return;
    }
    const session = switchFeatureUiOwner(formalFeatureUiHost, owner);
    if (!session) {
      return;
    }
    this.session = session;
    this.renderSession();
  }

  private reportFailure(phase: 'page-assets' | 'render', error: unknown): void {
    if (!this.session) return;
    const origin = this.scene.get(this.session.originSceneKey);
    if (origin) {
      reportFormalFeatureUiFailure(origin, this.session.page, this.session.owner, phase, error);
    }
  }

  private renderSession(): void {
    if (!this.session) return;
    if (this.session.page !== 'magic-weapon') this.destroyMagicWeaponLayer();
    if (this.session.page === 'backpack') {
      this.destroyWorkshopLayer();
      this.skillLayer?.destroy(true);
      this.skillLayer = undefined;
      this.petLayer?.destroy(true);
      this.petLayer = undefined;
      this.renderBackpackPage();
      return;
    }
    if (this.session.page === 'skills') {
      this.destroyWorkshopLayer();
      this.backpackLayer?.destroy(true);
      this.backpackLayer = undefined;
      this.petLayer?.destroy(true);
      this.petLayer = undefined;
      this.renderSkillPage();
      return;
    }
    if (this.session.page === 'pets') {
      this.destroyWorkshopLayer();
      this.backpackLayer?.destroy(true);
      this.backpackLayer = undefined;
      this.skillLayer?.destroy(true);
      this.skillLayer = undefined;
      this.renderPetPage();
      return;
    }
    if (this.session.page === 'workshop') {
      this.backpackLayer?.destroy(true);
      this.backpackLayer = undefined;
      this.skillLayer?.destroy(true);
      this.skillLayer = undefined;
      this.petLayer?.destroy(true);
      this.petLayer = undefined;
      this.renderWorkshopPage();
      return;
    }
    if (this.session.page === 'magic-weapon') {
      this.destroyWorkshopLayer();
      this.backpackLayer?.destroy(true);
      this.backpackLayer = undefined;
      this.skillLayer?.destroy(true);
      this.skillLayer = undefined;
      this.petLayer?.destroy(true);
      this.petLayer = undefined;
      this.renderMagicWeaponPage();
      return;
    }
    this.destroyWorkshopLayer();
    this.backpackLayer?.destroy(true);
    this.backpackLayer = undefined;
    this.skillLayer?.destroy(true);
    this.skillLayer = undefined;
    this.petLayer?.destroy(true);
    this.petLayer = undefined;
  }

  private renderBackpackPage(): void {
    if (!this.session) return;
    this.backpackLayer?.destroy(true);
    const owner = this.session.owner;
    if (!this.inventoryModel && this.storage) {
      this.inventoryModel = createFormalInventoryPage(this.storage, owner);
    }
    if (this.inventoryModel && this.inventoryModel.owner !== owner) {
      setFormalInventoryOwner(this.inventoryModel, owner);
    }

    if (!this.inventoryModel || !this.storage) {
      return;
    }
    this.backpackLayer = createFormalInventoryPageView(
      this,
      this.inventoryModel,
      this.storage,
      {
        onClose: () => this.closeHost(),
        onRerender: () => this.renderBackpackPage(),
      },
      this.session.playerPresentation?.find((snapshot) => snapshot.owner === owner),
    );
  }

  private renderSkillPage(): void {
    if (!this.session) return;
    this.skillLayer?.destroy(true);
    const owner = this.session.owner;
    if (!this.skillModel && this.storage) {
      this.skillModel = createFormalSkillPage(this.storage, owner);
    }
    if (this.skillModel && this.skillModel.owner !== owner) {
      setFormalSkillOwner(this.skillModel, owner);
    }
    if (!this.skillModel || !this.storage) {
      return;
    }
    this.skillLayer = createFormalSkillPageView(this, this.skillModel, this.storage, {
      onOwner: (nextOwner) => this.switchOwner(nextOwner),
      onSaved: () => this.syncSkillRuntime(),
      onClose: () => this.closeHost(),
      onRerender: () => this.renderSkillPage(),
    });
  }

  private syncSkillRuntime(): void {
    if (!this.session || !this.skillModel) return;
    const origin = this.scene.get(this.session.originSceneKey);
    if (origin) syncFormalSkillRuntime(origin, this.skillModel);
  }

  private renderPetPage(): void {
    if (!this.session) return;
    this.petLayer?.destroy(true);
    const owner = this.session.owner;
    if (!this.petModel && this.storage) {
      this.petModel = createFormalPetPage(this.storage, owner);
    }
    if (this.petModel && this.petModel.owner !== owner) {
      setFormalPetOwner(this.petModel, owner);
    }
    if (!this.petModel || !this.storage) {
      return;
    }
    this.petLayer = createFormalPetPageView(this, this.petModel, this.storage, {
      playerCount: this.session.playerCount,
      onOwner: (nextOwner) => this.switchOwner(nextOwner),
      onSaved: () => this.syncPetRuntime(),
      onClose: () => this.closeHost(),
      onRerender: () => this.renderPetPage(),
    });
  }

  private syncPetRuntime(): void {
    if (!this.session || !this.petModel) return;
    const origin = this.scene.get(this.session.originSceneKey);
    if (origin) syncFormalPetRuntime(origin, this.petModel);
  }

  private renderWorkshopPage(): void {
    if (!this.session) return;
    this.workshopLayer?.destroy(true);
    const owner = this.session.owner;
    if (!this.workshopModel && this.storage) this.workshopModel = createFormalWorkshopPage(this.storage, owner);
    if (this.workshopModel && this.workshopModel.owner !== owner) setFormalWorkshopOwner(this.workshopModel, owner);
    if (!this.workshopModel || !this.storage) {
      return;
    }
    this.workshopLayer = createFormalWorkshopPageView(this, this.workshopModel, this.storage, {
      playerCount: this.session.playerCount,
      onOwner: (nextOwner) => this.switchOwner(nextOwner),
      onClose: () => this.closeHost(),
      onFeedback: (message) => this.showWorkshopFeedback(message),
      onRerender: () => this.renderWorkshopPage(),
    });
  }

  private showWorkshopFeedback(message: string): void {
    this.workshopFeedbackTimer?.remove(false);
    this.workshopFeedbackText?.destroy();
    this.workshopFeedbackText = this.add.text(470, 66, message, {
      color: '#fff4b0',
      fontFamily: 'FZCuYuan-M03, Arial, sans-serif',
      fontSize: '18px',
      stroke: '#321507',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(40).setData('workshopGlobalFeedback', true);
    this.workshopFeedbackTimer = this.time.delayedCall(1_800, () => {
      this.workshopFeedbackText?.destroy();
      this.workshopFeedbackText = undefined;
      this.workshopFeedbackTimer = undefined;
    });
  }

  private destroyWorkshopLayer(): void {
    if (this.workshopModel) closeFormalWorkshopPage(this.workshopModel);
    this.workshopLayer?.destroy(true);
    this.workshopLayer = undefined;
    this.workshopFeedbackText?.destroy();
    this.workshopFeedbackText = undefined;
    this.workshopFeedbackTimer?.remove(false);
    this.workshopFeedbackTimer = undefined;
  }

  private renderMagicWeaponPage(): void {
    if (!this.session) return;
    this.magicWeaponLayer?.destroy(true);
    if (!this.magicWeaponModel && this.storage) this.magicWeaponModel = createFormalMagicWeaponPage(this.storage);
    if (!this.magicWeaponModel || !this.storage) {
      return;
    }
    this.magicWeaponLayer = createFormalMagicWeaponPageView(this, this.magicWeaponModel, this.storage, {
      onSaved: () => this.syncMagicWeaponRuntime(),
      onClose: () => this.closeHost(),
      onRerender: () => this.renderMagicWeaponPage(),
    });
  }

  private syncMagicWeaponRuntime(): void {
    if (!this.session || !this.magicWeaponModel) return;
    const origin = this.scene.get(this.session.originSceneKey);
    if (origin) syncFormalMagicWeaponRuntime(origin, this.magicWeaponModel);
  }

  private destroyMagicWeaponLayer(): void {
    if (this.magicWeaponModel?.pending) cancelFormalMagicWeaponAction(this.magicWeaponModel);
    this.magicWeaponLayer?.destroy(true);
    this.magicWeaponLayer = undefined;
  }

  private closeHost(): void {
    if (this.finished) return;
    this.scene.stop();
  }

  private finishSession(): void {
    if (this.finished) return;
    this.finished = true;
    if (this.workshopModel) closeFormalWorkshopPage(this.workshopModel);
    this.destroyMagicWeaponLayer();
    const session = closeFeatureUi(formalFeatureUiHost) ?? this.session;
    if (!session) return;
    if (this.scene.isPaused(session.originSceneKey)) this.scene.resume(session.originSceneKey);
    this.session = undefined;
    this.inventoryModel = undefined;
    this.skillModel = undefined;
    this.petModel = undefined;
    this.workshopModel = undefined;
    this.magicWeaponModel = undefined;
  }
}

function getBrowserStorage(): SaveStorage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}
