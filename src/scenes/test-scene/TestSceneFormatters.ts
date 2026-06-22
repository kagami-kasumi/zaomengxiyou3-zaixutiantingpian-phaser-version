// boundary: formatting helpers render debug/status text only; they do not
// mutate scene state or domain models.
import {
  formatHeroProgression,
  getActivePet,
  HeroDisplayNames,
  type BossArenaModel,
  type CapturablePetTarget,
  type HeroCombatModel,
  type HeroEffectiveStats,
  type HeroMovementModel,
  type HeroNormalAttackModel,
  type HeroProgressionModel,
  type HeroSkillCastEvent,
  type HeroSkillModel,
  type InventoryUIState,
  type MagicWeaponPlatform,
  type Monster30Model,
  type PetRoster,
  type PetRuntimeModel,
  type PlayerInputState,
  type PlayerSlot,
  type ProjectileModel,
  type SkillUIState,
  type WorldDrop,
} from './TestSceneSystems';

type FormattablePlayer = {
  progression: HeroProgressionModel;
};
export function formatDropState(drops: readonly WorldDrop[]): string {
  const idle = drops.filter((drop) => drop.state === 'idle');
  if (idle.length === 0) {
    return 'none';
  }

  return idle
    .map((drop) => {
      if (drop.kind === 'aura') {
        return `${drop.auraType}Aura/${drop.phase}/${drop.power}@${Math.round(drop.x)},${Math.round(drop.y)}`;
      }

      return `${drop.bigType}/${drop.fillName}@${Math.round(drop.x)},${Math.round(drop.y)}`;
    })
    .join(', ');
}

export function isPlayerSlot(value: string): value is PlayerSlot {
  return value === 'p1' || value === 'p2';
}

export function formatPlayerInput(label: string, input: PlayerInputState): string {
  return [
    `${label}`,
    `move:${formatMove(input.moveX)}`,
    `attack:${formatPressed(input.attack)}`,
    `jump:${formatPressed(input.jump)}`,
    `skills:${input.skillSlots.map(formatPressedBit).join('')}`,
    `special:${formatPressed(input.special)}`,
    `magic:${formatPressed(input.magicWeapon)}`,
  ].join(' | ');
}

function formatMove(moveX: PlayerInputState['moveX']): string {
  if (moveX < 0) {
    return 'left';
  }

  if (moveX > 0) {
    return 'right';
  }

  return 'neutral';
}

function formatPressed(isPressed: boolean): string {
  return isPressed ? 'on' : 'off';
}

function formatPressedBit(isPressed: boolean): string {
  return isPressed ? '1' : '0';
}

export function formatBossArenaState(arena: BossArenaModel): string {
  if (arena.state === 'inactive') {
    return 'inactive';
  }

  if (arena.state === 'cleared') {
    return 'cleared';
  }

  if (!arena.boss) {
    return 'active (no boss)';
  }

  return [
    arena.state,
    `boss:${arena.boss.state}`,
    `hp:${arena.boss.hp}/${arena.boss.maxHp}`,
    `door:${arena.door.visible ? 'visible' : 'hidden'}`,
  ].join(' | ');
}

export function formatHeroMovementState(movement: HeroMovementModel | undefined): string {
  if (!movement) {
    return 'missing';
  }

  return [
    movement.state,
    movement.grounded ? 'grounded' : 'air',
    `jump:${movement.jumpCount}`,
  ].join(' | ');
}

export function formatMagicWeaponPlatforms(platforms: readonly MagicWeaponPlatform[]): string {
  const active = platforms.filter((platform) => platform.active);
  if (active.length === 0) {
    return 'none';
  }
  return active
    .map((platform) =>
      `${platform.id}@${Math.round(platform.x)},${Math.round(platform.y)} ${Math.ceil(platform.remainingMs)}ms`,
    )
    .join(' | ');
}

export function formatHeroNormalAttackState(model: HeroNormalAttackModel | undefined): string {
  if (!model) {
    return 'missing';
  }

  return [
    `R${model.heroId} ${HeroDisplayNames[model.heroId]}`,
    model.weaponMode,
    model.activeAttack?.actionName ?? 'ready',
    model.activeAttack?.sourceSymbol ?? model.activeAttack?.effectKey ?? 'none',
  ].join(' | ');
}

export function formatHeroSkillState(skill: HeroSkillModel | undefined): string {
  if (!skill) {
    return 'missing';
  }

  const slots = skill.loadout.slots
    .map((binding, index) => `${index}:${binding?.skillName ?? '-'}`)
    .join(' ');

  return [
    `mp:${skill.mp}/${skill.maxMp}`,
    `slots:${slots}`,
    `action:${skill.activeAction?.actionName ?? 'ready'}`,
    skill.lastResult,
  ].join(' | ');
}

export function formatSkillEvent(event: HeroSkillCastEvent | undefined): string {
  if (!event) {
    return 'none';
  }

  return [
    `slot:${event.slotIndex}`,
    event.skillName,
    event.actionName,
    event.reentered ? 'reentry' : 'first',
    `mp:${event.mpBefore}->${event.mpAfter}`,
  ].join(' | ');
}

export function formatHeroCombatState(combat: HeroCombatModel | undefined): string {
  if (!combat) {
    return 'missing';
  }

  const shield = combat.magicShield
    ? ` | shield:${Math.round(combat.magicShield.remainingAmount)}/${Math.round(combat.magicShield.initialAmount)} ${formatSeconds(combat.magicShield.remainingMs)}s`
    : '';
  const invincible = combat.magicInvulnerability
    ? ` | inv:${formatSeconds(combat.magicInvulnerability.remainingMs)}s`
    : '';
  const buff = combat.magicBuff
    ? ` | buff:${combat.magicBuff.kind} atk+${combat.magicBuff.attackBonusPercent}% crit+${combat.magicBuff.critBonusPercent}% ${formatSeconds(combat.magicBuff.remainingMs)}s`
    : '';
  const flower = combat.magicFlowerBuff
    ? ` | flower:+${combat.magicFlowerBuff.attackBonusFlat.toFixed(1)} x${combat.magicFlowerBuff.attackMultiplier.toFixed(2)} ${formatSeconds(combat.magicFlowerBuff.remainingMs)}s`
    : '';
  const flag = combat.magicFlagGuard
    ? ` | flag:${formatSeconds(combat.magicFlagGuard.remainingMs)}s debuff:${formatSeconds(combat.magicFlagGuard.debuffMs)}s`
    : '';
  const role3 = combat.role3DefenseBonus || combat.role3DamageReduction
    ? ` | r3-def:+${combat.role3DefenseBonus ?? 0} reduce:${Math.round((combat.role3DamageReduction ?? 0) * 100)}%`
    : '';
  return [
    combat.state,
    `hp:${combat.hp}/${combat.maxHp}`,
    `last:${combat.lastDamageEvent?.amount ?? 0}`,
  ].join(' | ') + shield + invincible + buff + flower + flag + role3;
}

export function formatHeroProgressionState(
  player: FormattablePlayer | undefined,
  effectiveStats: HeroEffectiveStats | undefined,
): string {
  if (!player || !effectiveStats) {
    return 'missing';
  }

  return [
    formatHeroProgression(player.progression),
    `hp:${effectiveStats.maxHp}`,
    `mp:${effectiveStats.maxMp}`,
    `power:${effectiveStats.power}`,
    `def:${effectiveStats.defense}`,
  ].join(' | ');
}

export function formatSkillUIState(ui: SkillUIState): string {
  return [
    `sel:${ui.selectedSlotIndex}`,
    `panel:${ui.skillPanelOpen ? 'open' : 'closed'}`,
  ].join(' | ');
}

export function formatInventoryUIState(ui: InventoryUIState): string {
  return [
    ui.isOpen ? 'open' : 'closed',
    `cat:${ui.activeCategory}`,
    `focus:${ui.focus}`,
    `sel:${ui.focus === 'inventory' ? ui.selectedIndex : ui.selectedSlotIndex}`,
    ui.message,
  ].join(' | ');
}

export function formatPetState(
  roster: PetRoster,
  runtime: PetRuntimeModel | undefined,
  panelOpen: boolean,
): string {
  const active = getActivePet(roster);
  const flower = active?.magicFlowerBuff
    ? ` flower:x${active.magicFlowerBuff.attackMultiplier.toFixed(2)} ${formatSeconds(active.magicFlowerBuff.remainingMs)}s`
    : '';
  const skill = active?.skillState
    ? ` skills:${active.skills.join(',') || '-'} xj:${active.skillState.monkey1Xj.releaseReady ? 'ready' : 'idle'} cd:${Math.ceil(active.skillState.monkey1Xj.cooldownMs)} ljCd:${Math.ceil(active.skillState.monkey2Lj.cooldownMs)} m2xj:${active.skillState.monkey2Xj.releaseReady ? 'ready' : 'idle'} m2xjCd:${Math.ceil(active.skillState.monkey2Xj.cooldownMs)} lyqCd:${Math.ceil(active.skillState.monkey3Lyq.cooldownMs)} m3xjCd:${Math.ceil(active.skillState.monkey3Xj.cooldownMs)} m3lj:${active.skillState.monkey3Lj.releaseReady ? 'ready' : 'idle'} m3ljCd:${Math.ceil(active.skillState.monkey3Lj.cooldownMs)} m4jgCd:${Math.ceil(active.skillState.monkey4Jgaoyi.cooldownMs)} h1spCd:${Math.ceil(active.skillState.horse1Sp.cooldownMs)} h2bd:${active.skillState.horse2Bd.releaseReady ? 'ready' : 'idle'} h2bdCd:${Math.ceil(active.skillState.horse2Bd.cooldownMs)} h3bzCd:${Math.ceil(active.skillState.horse3Bz.cooldownMs)} h4tmCd:${Math.ceil(active.skillState.horse4Tmaoyi.cooldownMs)} ${active.skillState.lastResult}`
    : '';
  return [
    panelOpen ? 'panel:open' : 'panel:closed',
    active
      ? `active:${active.displayName} F${active.form} Lv.${active.level} exp:${active.exp}/${active.expToNext} hp:${Math.round(active.hp)}/${Math.round(active.maxHp)} mp:${Math.round(active.mp)}/${Math.round(active.maxMp)} atk:${active.atk.toFixed(2)} def:${active.def}${flower}${skill}`
      : 'active:-',
    runtime
      ? `${runtime.state}[${runtime.runtimeKey}]@${Math.round(runtime.x)},${Math.round(runtime.y)}`
      : 'runtime:none',
    roster.message,
  ].join(' | ');
}

export function formatCapturablePetTargets(targets: readonly CapturablePetTarget[]): string {
  const alive = targets.filter((target) => !target.removed);
  if (alive.length === 0) {
    return 'none';
  }

  return alive
    .map((target) =>
      `${target.monsterId} Lv.${target.level}@${Math.round(target.x)},${Math.round(target.y)} ${target.feedback}`
    )
    .join(', ');
}

export function formatProjectileState(projectiles: readonly ProjectileModel[]): string {
  if (projectiles.length === 0) {
    return 'none';
  }

  const shownProjectiles = projectiles.slice(0, 8);
  const shown = shownProjectiles
    .map((projectile) => [
      projectile.sourceId,
      projectile.actionName,
      projectile.runtimeName,
      `serial:${projectile.hitSerial}`,
      `hits:${projectile.remainingHits}`,
    ].join('/'))
    .join(', ');
  return projectiles.length > shownProjectiles.length
    ? `${shown}, ... +${projectiles.length - shownProjectiles.length}`
    : shown;
}

export function formatHeroLabel(
  slot: PlayerSlot,
  model: HeroNormalAttackModel,
  combat: HeroCombatModel,
): string {
  const shield = combat.magicShield
    ? ` S${Math.round(combat.magicShield.remainingAmount)}`
    : '';
  const invincible = combat.magicInvulnerability ? ' INV' : '';
  const buff = combat.magicBuff ? ` ${combat.magicBuff.kind}` : '';
  const flower = combat.magicFlowerBuff ? ' flower' : '';
  const flag = combat.magicFlagGuard ? ' flag' : '';
  return `${slot.toUpperCase()} R${model.heroId} ${HeroDisplayNames[model.heroId]} HP ${combat.hp}/${combat.maxHp}${shield}${invincible}${buff}${flower}${flag}`;
}

export function formatMonsterMagicFlowerDebuff(monster: Monster30Model): string {
  const debuff = monster.magicFlowerDebuff;
  if (!debuff) {
    return '';
  }

  return ` flower:x${debuff.damageMultiplier.toFixed(3)} ${formatSeconds(debuff.remainingMs)}s`;
}

export function formatMonsterMagicFlagDebuff(monster: Monster30Model): string {
  const debuff = monster.magicFlagDebuff;
  if (!debuff) {
    return '';
  }

  return ` flag:hitx${debuff.hitMultiplier.toFixed(2)} ${formatSeconds(debuff.remainingMs)}s tick:${debuff.lastTickDamage.toFixed(1)}`;
}

export function formatMonsterMagicPearlEffects(monster: Monster30Model): string {
  const parts: string[] = [];
  if (monster.magicBaguaStun) {
    parts.push(`bagua-stun:${formatSeconds(monster.magicBaguaStun.remainingMs)}s`);
  }
  if (monster.magicZlHummerStun) {
    parts.push(`zltc-stun:${formatSeconds(monster.magicZlHummerStun.remainingMs)}s`);
  }
  if (monster.magicSnowIce) {
    parts.push(`snow-ice:${formatSeconds(monster.magicSnowIce.remainingMs)}s`);
  }
  if (monster.magicPearlStun) {
    parts.push(`pearl-stun:${formatSeconds(monster.magicPearlStun.remainingMs)}s`);
  }
  if (monster.magicPearlPoison) {
    parts.push(
      `pearl-poison:${formatSeconds(monster.magicPearlPoison.remainingMs)}s tick:${monster.magicPearlPoison.lastTickDamage.toFixed(1)}`,
    );
  }
  return parts.length > 0 ? ` ${parts.join(' ')}` : '';
}

function formatSeconds(ms: number): string {
  return (ms / 1000).toFixed(ms % 1000 === 0 ? 0 : 1);
}




