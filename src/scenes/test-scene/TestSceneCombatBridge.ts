import Phaser from 'phaser';
import {
  createDamageEvent,
  resolveHitOnce,
  type DamageEvent,
  type HitRegistry,
} from '../../systems/CombatSystem';
import {
  applyHeroDamage,
  isHeroCombatDead,
  type HeroCombatModel,
} from '../../systems/HeroCombatSystem';
import {
  getActiveHeroHitbox,
  type HeroNormalAttackModel,
} from '../../systems/HeroNormalAttackSystem';
import type { HeroMovementModel } from '../../systems/HeroMovementSystem';
import type { PlayerSlot } from '../../systems/InputSystem';
import {
  applyMonster30MagicFlagCounterFromHero,
  applyMonster30Hit,
  getMonster30AttackHitbox,
  type Monster30Model,
} from '../../systems/Monster30System';
import {
  applyOwnedPetDamageRedirect,
  claimMonsterExperienceForCurrentTarget,
  type PlayerPetRosters,
} from '../../systems/PetSystem';

export type CombatBridgePlayer = {
  slot: PlayerSlot;
  movement?: HeroMovementModel;
  combat: HeroCombatModel;
  normalAttack: HeroNormalAttackModel;
};

export type CombatBridgeResult = {
  damageEvents: DamageEvent[];
  flashBounds: Phaser.Geom.Rectangle[];
  monsterAuraTargets: Array<{
    monsterId: string;
    slot: PlayerSlot;
  }>;
  monsterExperienceAwards: Array<{
    monster: Monster30Model;
    slot: PlayerSlot;
    experience: number;
  }>;
};

export function createEmptyCombatBridgeResult(): CombatBridgeResult {
  return {
    damageEvents: [],
    flashBounds: [],
    monsterAuraTargets: [],
    monsterExperienceAwards: [],
  };
}

export function getMonster30Bounds(monster: Monster30Model): Phaser.Geom.Rectangle {
  return new Phaser.Geom.Rectangle(monster.x - 36, monster.y - 28, 72, 56);
}

export function getPlayerBounds(player: CombatBridgePlayer): Phaser.Geom.Rectangle {
  const movement = player.movement;
  if (!movement) {
    return new Phaser.Geom.Rectangle();
  }

  return new Phaser.Geom.Rectangle(movement.x - 24, movement.y - 96, 48, 96);
}

export function applyHeroNormalAttackToMonster30s(params: {
  player: CombatBridgePlayer;
  monsters: readonly Monster30Model[];
  hitRegistry: HitRegistry;
  time: number;
}): CombatBridgeResult {
  const result = createEmptyCombatBridgeResult();
  const { player, monsters, hitRegistry, time } = params;

  if (!player.movement) {
    return result;
  }

  const activeAttack = player.normalAttack.activeAttack;
  const hitbox = getActiveHeroHitbox(player.normalAttack, player.movement, time);
  if (!activeAttack || !hitbox) {
    return result;
  }

  const attackBounds = toPhaserRect(hitbox);
  for (const monster of monsters) {
    if (monster.state === 'dead' || monster.state === 'removed') {
      continue;
    }

    if (!Phaser.Geom.Intersects.RectangleToRectangle(
      attackBounds,
      getMonster30Bounds(monster),
    )) {
      continue;
    }

    const attackId = `${player.slot}-normal-${activeAttack.id}-${monster.id}`;
    if (!resolveHitOnce(hitRegistry, attackId, monster.id)) {
      continue;
    }

    const effectiveDamage = Math.min(activeAttack.damage, monster.hp);
    const damageEvent = createDamageEvent({
      sourceId: player.slot,
      targetId: monster.id,
      attackId,
      actionName: activeAttack.actionName,
      amount: effectiveDamage,
      attackKind: activeAttack.attackKind,
      knockbackX: activeAttack.facingX * 4,
      knockbackY: -2,
      occurredAtMs: time,
    });
    applyMonster30Hit(monster, damageEvent.amount);
    result.damageEvents.push(damageEvent);
    result.monsterAuraTargets.push({ monsterId: monster.id, slot: player.slot });
    if (
      monster.hp <= 0 &&
      !monster.experienceAwardedTo &&
      monster.experience > 0
    ) {
      const award = claimMonsterExperienceForCurrentTarget(monster, player.slot);
      if (!award) continue;
      result.monsterExperienceAwards.push({
        monster,
        slot: award.ownerSlot,
        experience: award.experience,
      });
    }
  }

  return result;
}

export function applyMonster30AttackToPlayers(params: {
  monster: Monster30Model;
  players: readonly CombatBridgePlayer[];
  petRosters?: PlayerPetRosters;
  hitRegistry: HitRegistry;
  renderedMonsterAttackIds: Set<string>;
  time: number;
}): CombatBridgeResult {
  const result = createEmptyCombatBridgeResult();
  const { monster, players, hitRegistry, renderedMonsterAttackIds, time } = params;

  if (monster.state === 'removed') {
    return result;
  }

  const activeAttack = monster.activeAttack;
  const hitbox = getMonster30AttackHitbox(monster);
  if (!activeAttack || !hitbox) {
    return result;
  }

  if (!renderedMonsterAttackIds.has(activeAttack.attackId)) {
    renderedMonsterAttackIds.add(activeAttack.attackId);
    result.flashBounds.push(toPhaserRect(hitbox));
  }

  const attackBounds = toPhaserRect(hitbox);
  for (const player of players) {
    if (!player.movement || isHeroCombatDead(player.combat)) {
      continue;
    }

    if (!Phaser.Geom.Intersects.RectangleToRectangle(
      attackBounds,
      getPlayerBounds(player),
    )) {
      continue;
    }

    if (!resolveHitOnce(hitRegistry, activeAttack.attackId, player.slot)) {
      continue;
    }

    const damageEvent = createDamageEvent({
      sourceId: monster.id,
      targetId: player.slot,
      attackId: activeAttack.attackId,
      actionName: activeAttack.actionName,
      amount: params.petRosters
        ? applyOwnedPetDamageRedirect(params.petRosters, player.slot, activeAttack.damage)
        : activeAttack.damage,
      attackKind: activeAttack.attackKind,
      knockbackX: activeAttack.facingX * activeAttack.knockbackX,
      knockbackY: activeAttack.knockbackY,
      occurredAtMs: time,
    });

    if (applyHeroDamage(player.combat, damageEvent, time)) {
      applyMonster30MagicFlagCounterFromHero(monster, player.combat);
      result.damageEvents.push(damageEvent);
    }
  }

  return result;
}

function toPhaserRect(hitbox: {
  x: number;
  y: number;
  width: number;
  height: number;
}): Phaser.Geom.Rectangle {
  return new Phaser.Geom.Rectangle(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
}
