import type Phaser from 'phaser';
import {
  syncRole1ShadowVisualViews,
  type Role1ShadowView,
} from '../Role1ShadowVisualBridge';
import type { Role1ShadowModel } from '../../systems/Role1ShadowSkillSystem';
import { projectRole1ShadowVisual } from '../../systems/Role1ShadowVisualSystem';
import { isRole1ShadowQaEnabled } from './TestSceneConfig';

export function syncRole1ShadowVisuals(scene: Phaser.Scene & Record<string, any>): void {
  const views: Map<string, Role1ShadowView> = scene.role1ShadowVisuals ?? new Map<string, Role1ShadowView>();
  scene.role1ShadowVisuals = views;
  const shadows: Role1ShadowModel[] = [];
  for (const player of scene.playerViews ?? []) {
    if (player.normalAttack?.heroId !== 1) continue;
    shadows.push(...player.skill.role1ShadowRuntime.shadows as Role1ShadowModel[]);
  }
  syncRole1ShadowVisualViews({ scene, shadows, views });
  if (isRole1ShadowQaEnabled()) {
    scene.game.canvas.dataset.role1ShadowQaPlayers = JSON.stringify((scene.playerViews ?? [])
      .filter((player: any) => player.normalAttack?.heroId === 1)
      .map((player: any) => ({
        slot: player.slot,
        facingX: player.movement?.facingX,
        combatState: player.combat?.state,
        loadout: player.skill.loadout.slots.map((binding: any) => binding?.skillName ?? null),
        lastResult: player.skill.lastResult,
        shadowActionRemainingMs: player.skill.role1ShadowRuntime.actionRemainingMs,
      })));
    scene.game.canvas.dataset.role1ShadowQa = JSON.stringify(shadows.map((shadow) => ({
      id: shadow.id,
      sourceId: shadow.sourceId,
      action: shadow.action,
      actionTick: shadow.actionTick,
      candidate: shadow.candidate,
      remainingTicks: shadow.remainingTicks,
      textureKey: views.get(shadow.id)?.sprite.texture.key,
      textureFrame: views.get(shadow.id)?.sprite.frame.name,
      ...projectRole1ShadowVisual(shadow),
    })));
  }
}
