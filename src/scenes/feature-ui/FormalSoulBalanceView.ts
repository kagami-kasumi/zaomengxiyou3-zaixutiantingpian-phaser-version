import Phaser from 'phaser';
import { fullFeatureUiAssets } from '../../assets/AssetManifest';

export type FormalSoulBalanceSource = 'skills' | 'workshop' | 'standalone';

const SourceTextFields: Record<FormalSoulBalanceSource, {
  x: number;
  y: number;
  badge?: Readonly<{ x: number; y: number }>;
}> = {
  // OtherMat1.swf character 250 / txtlh character 249.
  skills: { x: 805.95, y: 543.95 },
  // backpack1.swf character 119 / txtlh character 103. The root sprite has
  // an exported -0.45px X translation. Its text baseline is 0.05px lower.
  workshop: { x: 801.55, y: 550.15 },
  // Reusable lower-right projection for pages that consume souls but do not
  // already carry the original emblem in their recovered root artwork.
  standalone: {
    x: 805.95,
    y: 543.95,
    // OtherMat1.swf character 250 / shape 236 PatternID_236_2.
    badge: { x: 732, y: 504.95 },
  },
};

const FieldWidth = 135;
const DigitCellWidth = 16;
const DigitHeight = 31;
const DigitAdvances = [14.25, 9.2, 14.25, 14.25, 14.25, 14.25, 14.25, 13.4, 14.25, 14.25] as const;

// Shared projection for the player-owned soul balance. It uses the original
// embedded FZCuYuan-M03 outlines and Flash advances instead of browser text,
// preserving the authored glyphs, scale, baseline, and right alignment.
export function createFormalSoulBalanceView(
  scene: Phaser.Scene,
  value: number,
  source: FormalSoulBalanceSource,
): Phaser.GameObjects.Container {
  const field = SourceTextFields[source];
  const badge = field.badge
    ? scene.add.image(field.badge.x, field.badge.y, fullFeatureUiAssets.soulBadge.key)
      .setOrigin(0)
    : undefined;
  const digits = String(Math.max(0, Math.trunc(value))).split('').map(Number);
  const textWidth = digits.reduce((width, digit) => width + DigitAdvances[digit]!, 0);
  let cursorX = field.x + FieldWidth - textWidth;
  const glyphs = digits.map((digit) => {
    const cropX = digit * DigitCellWidth;
    const glyph = scene.add.image(cursorX - cropX, field.y, fullFeatureUiAssets.soulDigits.key)
      .setOrigin(0)
      .setCrop(cropX, 0, DigitCellWidth, DigitHeight);
    cursorX += DigitAdvances[digit]!;
    return glyph;
  });
  return scene.add.container(0, 0, badge ? [badge, ...glyphs] : glyphs)
    .setData('formalSoulBalance', true)
    .setData('formalSoulBalanceSource', source);
}
