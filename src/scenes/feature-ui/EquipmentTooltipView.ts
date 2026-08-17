import Phaser from 'phaser';

import type { EquipmentInstance } from '../../systems/EquipmentSystem';
import {
  createEquipmentTooltipPresentation,
  placeEquipmentTooltip,
} from '../../systems/EquipmentTooltipSystem';

export type EquipmentTooltipView = Readonly<{
  root: Phaser.GameObjects.Container;
  show: (instance: EquipmentInstance, pointerX: number, pointerY: number) => void;
  move: (pointerX: number, pointerY: number) => void;
  hide: () => void;
}>;

const FontFamily = 'FZCuYuan-M03, Arial, sans-serif';

export function createEquipmentTooltipView(scene: Phaser.Scene): EquipmentTooltipView {
  const root = scene.add.container(0, 0).setVisible(false).setName('equipment-truth-tooltip-root');
  let size: Readonly<{ width: number; height: number }> | undefined;

  const move = (pointerX: number, pointerY: number): void => {
    if (!size) return;
    const placement = placeEquipmentTooltip(pointerX, pointerY, size);
    root.setPosition(placement.x, placement.y);
  };

  const show = (instance: EquipmentInstance, pointerX: number, pointerY: number): void => {
    const presentation = createEquipmentTooltipPresentation(instance);
    root.removeAll(true);
    size = presentation;
    const background = scene.add.graphics();
    background.fillStyle(0x000000, 0.7).fillRoundedRect(0, 0, presentation.width, presentation.height, 5);
    background.lineStyle(1, 0xffffff, 1).strokeRoundedRect(0.5, 0.5, presentation.width - 1, presentation.height - 1, 5);
    root.add(background);
    root.add(scene.add.text(20, 10, presentation.name, {
      color: presentation.nameColor,
      fontFamily: FontFamily,
      fontSize: '16px',
    }));
    let row = 1;
    presentation.rows.forEach((item) => {
      const y = 10 + row * 25;
      if (item.kind === 'metadata') {
        const label = scene.add.text(20, y - 1, item.label ?? '', {
          color: '#000000', fontFamily: FontFamily, fontSize: '16px', fontStyle: 'bold',
          stroke: '#ffffff', strokeThickness: 2,
        });
        const labelWidth = estimatedWidth(item.label ?? '', 16) + 10;
        const line = scene.add.graphics().lineStyle(2, 0xffffff, 1)
          .lineBetween(20 + labelWidth - 4, y + 20, 96 + labelWidth, y + 20);
        const value = scene.add.text(20 + labelWidth, y, `  ${item.value}`, {
          color: item.color, fontFamily: FontFamily, fontSize: '16px',
        });
        root.add([label, line, value]);
      } else {
        root.add(scene.add.text(20, y, item.value, {
          color: item.color, fontFamily: FontFamily, fontSize: '16px', fontStyle: 'bold',
        }));
      }
      row += 1;
    });
    presentation.instructionLines.forEach((line, index) => {
      root.add(scene.add.text(20, 10 + row * 25 + index * 17, line, {
        color: '#ffffff', fontFamily: FontFamily, fontSize: '14px',
      }));
    });
    const instructionHeight = presentation.instructionLines.length * 17 + 10;
    root.add(scene.add.text(
      20,
      10 + row * 25 + Math.round(instructionHeight / 25) * 25,
      presentation.soulValue,
      { color: '#ff9933', fontFamily: FontFamily, fontSize: '14px' },
    ));
    const placement = placeEquipmentTooltip(pointerX, pointerY, presentation);
    root.setPosition(placement.x, placement.y).setVisible(true);
  };

  const hide = (): void => {
    root.setVisible(false);
    root.removeAll(true);
    size = undefined;
  };

  return { root, show, move, hide };
}

function estimatedWidth(copy: string, size: number): number {
  return [...copy].reduce((sum, char) => sum + (/^[\x00-\xff]$/.test(char) ? size * 0.56 : size), 0);
}
