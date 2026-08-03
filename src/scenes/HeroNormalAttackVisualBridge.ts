// boundary: normal-attack views adapt active attack models to Phaser display objects;
// they do not own attack timing, damage, combo, or input rules.
import Phaser from 'phaser';
import {
  getRole5NormalAttackVisualAsset,
  HeroNormalAttackEffectKeys,
  role1NormalAttackAssets,
  role2NormalAttackAssets,
  role3NormalAttackAssets,
  role4NormalAttackAssets,
  role5NormalAttackAssets,
} from '../assets/AssetManifest';
import type {
  ActiveHeroNormalAttack,
  HeroId,
  HeroNormalAttackModel,
} from '../systems/HeroNormalAttackSystem';
import type { PlayerSlot } from '../systems/InputSystem';
import { isRole5LoongSwordProjectileAttack } from '../systems/Role5NormalAttackProjectileSystem';
import type { Stage1CombatPlayer } from '../systems/Stage1CombatSystem';
import {
  projectNormalAttackVisualPoint,
  projectNormalAttackOriginX,
  shouldFlipNormalAttackVisual,
} from './HeroCombatVisualCoordinates';

export type AttackEffectView = {
  slot: PlayerSlot;
  attack: ActiveHeroNormalAttack;
  shape: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Ellipse | Phaser.GameObjects.Image;
  label: Phaser.GameObjects.Text;
  frameKeys?: readonly string[];
  secondaryShape?: Phaser.GameObjects.Image;
  secondaryFrameKeys?: readonly string[];
};

export type HeroNormalAttackVisualPlayer = Readonly<{
  slot: PlayerSlot;
  x: number;
  y: number;
  normalAttack: HeroNormalAttackModel;
  effectColor: number;
  role5SwordEnhanced?: boolean;
}>;

export type HeroNormalAttackVisualHandle = Readonly<{
  update: (players: readonly HeroNormalAttackVisualPlayer[], timeMs: number) => void;
  destroy: () => void;
}>;

export function getHeroNormalAttackEffectColor(heroId: HeroId): number {
  return [0, 0xf4d35e, 0xf3f6ff, 0xee8f55, 0x74c0fc, 0x91f5d6][heroId]!;
}

export function projectHeroNormalAttackVisualPlayer(
  view: Pick<Phaser.GameObjects.Image, 'x' | 'y'>,
  player: Pick<Stage1CombatPlayer, 'slot' | 'normalAttack' | 'skill'>,
): HeroNormalAttackVisualPlayer {
  return {
    slot: player.slot,
    x: view.x,
    y: view.y,
    normalAttack: player.normalAttack,
    effectColor: getHeroNormalAttackEffectColor(player.normalAttack.heroId),
    role5SwordEnhanced: player.skill.role5Runtime.loongSwordRemainingMs > 0,
  };
}

export function createHeroNormalAttackVisualBridge(
  scene: Phaser.Scene,
): HeroNormalAttackVisualHandle {
  const views: AttackEffectView[] = [];
  const lastAttackIds = new Map<PlayerSlot, number>();

  return {
    update: (players, timeMs) => {
      for (const player of players) {
        const attack = player.normalAttack.activeAttack;
        if (!attack || lastAttackIds.get(player.slot) === attack.id) continue;
        lastAttackIds.set(player.slot, attack.id);
        if (isRole5LoongSwordProjectileAttack(attack, player.role5SwordEnhanced ?? false)) continue;
        views.push(createAttackEffectView(
          scene,
          player,
          attack,
          player.effectColor,
          player.role5SwordEnhanced,
        ));
      }
      updateAttackEffectViews(views, players, timeMs);
    },
    destroy: () => {
      for (const view of views) destroyAttackEffectView(view);
      views.length = 0;
      lastAttackIds.clear();
    },
  };
}

export function createAttackEffectView(
  scene: Phaser.Scene,
  player: Pick<HeroNormalAttackVisualPlayer, 'slot' | 'x' | 'y'>,
  attack: ActiveHeroNormalAttack,
  effectColor: number,
  role5SwordEnhanced = false,
): AttackEffectView {
  const visualPoint = projectNormalAttackVisualPoint(
    attack,
    attack.followsHero ? player.x : attack.spawnX,
    attack.followsHero ? player.y : attack.spawnY,
  );
  const role5Asset = getRole5NormalAttackVisualAsset(attack.effectKey, role5SwordEnhanced);
  const frameAsset = role1NormalAttackAssets[attack.effectKey as keyof typeof role1NormalAttackAssets]
    ?? role2NormalAttackAssets[attack.effectKey as keyof typeof role2NormalAttackAssets]
    ?? role3NormalAttackAssets[attack.effectKey as keyof typeof role3NormalAttackAssets]
    ?? role4NormalAttackAssets[attack.effectKey as keyof typeof role4NormalAttackAssets]
    ?? role5Asset;
  const role1Asset = role1NormalAttackAssets[attack.effectKey as keyof typeof role1NormalAttackAssets];
  const role2Asset = role2NormalAttackAssets[attack.effectKey as keyof typeof role2NormalAttackAssets];
  const role3Asset = role3NormalAttackAssets[attack.effectKey as keyof typeof role3NormalAttackAssets];
  const role4Asset = role4NormalAttackAssets[attack.effectKey as keyof typeof role4NormalAttackAssets];
  const suppressMissingRole5RunEffect = attack.effectKey === HeroNormalAttackEffectKeys.role5SpearRunMissing;
  const flipX = shouldFlipNormalAttackVisual(attack);
  const registrationOriginX = role1Asset?.registrationOrigin.x ?? role2Asset?.registrationOrigin.x
    ?? role3Asset?.registrationOrigin.x ?? role4Asset?.registrationOrigin.x
    ?? role5Asset?.registrationOrigin.x ?? 0.5;
  const shape = frameAsset
    ? scene.add.image(visualPoint.x, visualPoint.y, frameAsset.frameKeys[0])
      .setFlipX(flipX)
      .setOrigin(
        projectNormalAttackOriginX(registrationOriginX, flipX),
        role1Asset?.registrationOrigin.y ?? role2Asset?.registrationOrigin.y
          ?? role3Asset?.registrationOrigin.y ?? role4Asset?.registrationOrigin.y
          ?? role5Asset?.registrationOrigin.y ?? 0.5,
      )
    : suppressMissingRole5RunEffect
      ? scene.add.ellipse(player.x, player.y, 1, 1, 0xffffff, 0)
      : attack.followsHero
        ? scene.add.ellipse(visualPoint.x, visualPoint.y, 86, 36, effectColor, 0.35)
        : scene.add.rectangle(visualPoint.x, visualPoint.y, 102, 42, effectColor, 0.28);
  const label = scene.add.text(
    visualPoint.x,
    visualPoint.y - 48,
    frameAsset || suppressMissingRole5RunEffect ? '' : attack.actionName,
    { color: '#f3f6ff', fontFamily: 'Arial, sans-serif', fontSize: '13px' },
  );

  if ('setStrokeStyle' in shape) shape.setStrokeStyle(2, effectColor, 0.9);

  const role5BaseAsset = role5SwordEnhanced && attack.effectKey === HeroNormalAttackEffectKeys.role5SwordHit4
    ? role5NormalAttackAssets[HeroNormalAttackEffectKeys.role5SwordHit4]
    : undefined;
  const secondaryShape = role5BaseAsset
    ? scene.add.image(visualPoint.x, visualPoint.y, role5BaseAsset.frameKeys[0]!)
      .setFlipX(flipX)
      .setOrigin(
        projectNormalAttackOriginX(role5BaseAsset.registrationOrigin.x, flipX),
        role5BaseAsset.registrationOrigin.y,
      )
    : undefined;

  return {
    slot: player.slot,
    attack,
    shape,
    label,
    frameKeys: frameAsset?.frameKeys,
    secondaryShape,
    secondaryFrameKeys: role5BaseAsset?.frameKeys,
  };
}

export function syncAttackEffectFrame(effectView: AttackEffectView, timeMs: number): void {
  if (!effectView.frameKeys || !(effectView.shape instanceof Phaser.GameObjects.Image)) return;
  const duration = effectView.attack.endsAtMs - effectView.attack.startedAtMs;
  const progress = Math.min(Math.max((timeMs - effectView.attack.startedAtMs) / duration, 0), 0.999);
  const frameIndex = Math.floor(progress * effectView.frameKeys.length);
  effectView.shape.setTexture(effectView.frameKeys[frameIndex]);
  if (effectView.secondaryShape && effectView.secondaryFrameKeys) {
    const secondaryIndex = Math.floor(progress * effectView.secondaryFrameKeys.length);
    effectView.secondaryShape.setTexture(effectView.secondaryFrameKeys[secondaryIndex]);
  }
}

function updateAttackEffectViews(
  views: AttackEffectView[],
  players: readonly Pick<HeroNormalAttackVisualPlayer, 'slot' | 'x' | 'y'>[],
  timeMs: number,
): void {
  for (let index = views.length - 1; index >= 0; index -= 1) {
    const view = views[index]!;
    if (timeMs >= view.attack.endsAtMs) {
      destroyAttackEffectView(view);
      views.splice(index, 1);
      continue;
    }
    syncAttackEffectFrame(view, timeMs);
    const player = players.find((candidate) => candidate.slot === view.slot);
    if (player && view.attack.followsHero) {
      const point = projectNormalAttackVisualPoint(view.attack, player.x, player.y);
      view.shape.setPosition(point.x, point.y);
      view.secondaryShape?.setPosition(point.x, point.y);
      view.label.setPosition(point.x, point.y - 48);
    }
    const remainingRatio = (view.attack.endsAtMs - timeMs)
      / (view.attack.endsAtMs - view.attack.startedAtMs);
    view.shape.setAlpha(view.frameKeys ? Math.max(0.2, remainingRatio) : Math.max(0.1, remainingRatio * 0.5));
    view.secondaryShape?.setAlpha(Math.max(0.2, remainingRatio));
    view.label.setAlpha(Math.max(0.15, remainingRatio));
  }
}

function destroyAttackEffectView(view: AttackEffectView): void {
  view.shape.destroy();
  view.secondaryShape?.destroy();
  view.label.destroy();
}
