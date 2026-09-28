import { applyMonster30Hit, type Monster30Model } from '../../systems/Monster30System';
import type Phaser from 'phaser';
import { createSceneMonsterKnockback } from '../MonsterKnockbackBridge';
import type { Stage1CombatEnemy } from '../../systems/Stage1CombatSystem';
import type { PlayerSlot } from '../../systems/InputSystem';
import type { PetTurtleAssets } from '../../assets/PetTurtleAssets';
import type { HeroPartyRuntime } from '../HeroPartyRuntimeBridge';

/** The sandbox's actual active attack goes through the same pet HP/event owner. */
export function resolveTestSceneTurtleIncoming(runtime: HeroPartyRuntime, monsters: readonly Monster30Model[],
  assets: PetTurtleAssets, timeMs: number): void {
  void assets; // The target colipse comes from the shared verified collision pack.
  for (const enemy of adaptTestScenePetEnemies(monsters, () => {})) {
    runtime.resolvePetEnemyAttack(enemy, timeMs);
  }
}

/** Accessors retain the actual sandbox monster as HP/lifetime owner. */
export function adaptTestScenePetEnemies(monsters: readonly Monster30Model[],
  onHitOwner: (monster: Monster30Model, slot: PlayerSlot) => void, scene?: Phaser.Scene): Stage1CombatEnemy[] {
  return monsters.map(monster => {
    if (scene) monster.petKnockback ??= createSceneMonsterKnockback(scene, 11, 30, monster);
    return {
    id: monster.id, enemyType: 30,
    get attackRuntime() { return monster.attackRuntime; },
    get experienceBinding() { return monster.experienceBinding; },
    set experienceBinding(value) { monster.experienceBinding = value; },
    get petTargetEffectState() { return monster.petTargetEffectState; },
    set petTargetEffectState(value) { monster.petTargetEffectState = value; },
    get petKnockback() { return monster.petKnockback; },
    get x() { return monster.x; }, get y() { return monster.y; },
    get hp() { return monster.hp; },
    set hp(value: number) { applyMonster30Hit(monster, Math.max(0, monster.hp - value)); },
    get maxHp() { return monster.maxHp; },
    get phase() { return monster.state === 'dead' || monster.state === 'removed' ? 'dead' as const
      : monster.state === 'hurt' ? 'hurt' as const : 'approach' as const; },
    // applyMonster30Hit already owns the sandbox hurt/death duration and attack cleanup.
    set phase(_value) {},
    phaseRemainingMs: 0, facingX: monster.facingX, attackSerial: monster.attackSerial,
    set lastHitBy(slot: PlayerSlot | undefined) { if (slot) onHitOwner(monster, slot); },
  }; });
}
