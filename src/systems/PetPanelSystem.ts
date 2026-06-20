import { PetSkillInfoByKey, PetTuning } from './PetTuning';
import type { PetDragon4QlaoyiComboState, PetRoster, PetSkillSlotView, PetState } from './PetTypes';

function getSelectedPet(roster: PetRoster): PetState | undefined {
  return roster.pets[roster.selectedIndex];
}

function getActivePet(roster: PetRoster): PetState | undefined {
  return roster.pets.find((pet) => pet.isActive && pet.lifetime > 0);
}
export function getPetSkillDisplay(skillKey: string): { name: string; info: string; isKnown: boolean } {
  const info = PetSkillInfoByKey[skillKey];
  if (!info) {
    return {
      name: skillKey || 'unknown',
      info: 'unknown pet skill',
      isKnown: false,
    };
  }

  return { ...info, isKnown: true };
}

export function buildPetSkillSlotViews(pet: PetState): PetSkillSlotView[] {
  const slots: PetSkillSlotView[] = [];
  for (let index = 0; index < PetTuning.skillSlotCount; index += 1) {
    const skillKey = pet.skills[index] ?? '';
    if (skillKey === '') {
      slots.push({
        slot: index + 1,
        skillKey: '',
        name: '',
        info: '',
        isEmpty: true,
        isKnown: true,
      });
      continue;
    }

    const display = getPetSkillDisplay(skillKey);
    slots.push({
      slot: index + 1,
      skillKey,
      name: display.name,
      info: display.info,
      isEmpty: false,
      isKnown: display.isKnown,
    });
  }

  return slots;
}


export function buildPetPanelLines(
  roster: PetRoster,
  controlHint = '[鼠标] 选择 / 出战 / 休息',
): string[] {
  const lines: string[] = [];
  const selected = getSelectedPet(roster);
  const active = getActivePet(roster);

  lines.push(`══ PETS ${roster.pets.length}/${PetTuning.maxSeats} ══`);
  lines.push(`Active: ${active ? active.displayName : '-'}`);
  lines.push(`Message: ${roster.message}`);
  lines.push('');
  lines.push('List');

  if (roster.pets.length === 0) {
    lines.push('  - empty -');
  } else {
    for (let i = 0; i < roster.pets.length; i += 1) {
      const pet = roster.pets[i];
      const pointer = i === roster.selectedIndex ? '▶' : ' ';
      const activeMark = pet.isActive ? '(出战)' : '';
      lines.push(
        `${pointer}${pet.displayName}${activeMark} F${pet.form} Lv.${pet.level} HP ${pet.hp}/${pet.maxHp} Life ${pet.lifetime}/100`,
      );
    }
  }

  lines.push('');
  lines.push('Selected');
  if (selected) {
    lines.push(`Species: ${selected.species}${selected.form}  Quality:${selected.quality}`);
    lines.push(`MP ${selected.mp}/${selected.maxMp}  ATK ${selected.atk}  DEF ${selected.def}  CRIT +${((selected.critBonusRate ?? 0) * 100).toFixed(2)}%  SKILL +${(selected.skillDamageBonus ?? 0).toFixed(1)}`);
    lines.push(`EXP ${selected.exp}/${formatPetNextExperience(selected)}`);
    lines.push(`悟 ${selected.perception}  技 ${selected.technique}  战 ${selected.warpower}`);
    lines.push(`资质 HP ${selected.hpQuality}  MP ${selected.mpQuality}  ATK ${selected.atkQuality}  DEF ${selected.defQuality}`);
    lines.push(`Skills: ${selected.skills.length > 0 ? selected.skills.join(', ') : '-'}`);
    for (const slot of buildPetSkillSlotViews(selected)) {
      lines.push(
        `Slot ${slot.slot}: ${slot.isEmpty ? '-' : `${slot.skillKey} ${slot.name}${slot.isKnown ? '' : ' (unknown)'}`}`,
      );
    }
    const skillState = selected.skillState;
    if (skillState) {
      lines.push(`XJ ready:${skillState.monkey1Xj.releaseReady ? 'Y' : 'N'} cd:${Math.ceil(skillState.monkey1Xj.cooldownMs)}ms`);
      lines.push(`LJ cd:${Math.ceil(skillState.monkey2Lj.cooldownMs)}ms`);
      lines.push(`M2 XJ ready:${skillState.monkey2Xj.releaseReady ? 'Y' : 'N'} cd:${Math.ceil(skillState.monkey2Xj.cooldownMs)}ms`);
      lines.push(`M3 LYQ cd:${Math.ceil(skillState.monkey3Lyq.cooldownMs)}ms`);
      lines.push(`M3 XJ cd:${Math.ceil(skillState.monkey3Xj.cooldownMs)}ms`);
      lines.push(`M3 LJ ready:${skillState.monkey3Lj.releaseReady ? 'Y' : 'N'} cd:${Math.ceil(skillState.monkey3Lj.cooldownMs)}ms`);
      lines.push(`M4 JGAOYI cd:${Math.ceil(skillState.monkey4Jgaoyi.cooldownMs)}ms`);
      lines.push(`H1 SP cd:${Math.ceil(skillState.horse1Sp.cooldownMs)}ms`);
      lines.push(`H2 BD ready:${skillState.horse2Bd.releaseReady ? 'Y' : 'N'} cd:${Math.ceil(skillState.horse2Bd.cooldownMs)}ms`);
      lines.push(`H3 BZ cd:${Math.ceil(skillState.horse3Bz.cooldownMs)}ms`);
      lines.push(`H4 TMAOYI cd:${Math.ceil(skillState.horse4Tmaoyi.cooldownMs)}ms`);
      lines.push(`D1 FS cd:${Math.ceil(skillState.dragon1Fs.cooldownMs)}ms clone:${formatPetAutoBuffMs(skillState.dragon1Fs.cloneRemainingMs)}`);
      lines.push(`D2 SDCC cd:${Math.ceil(skillState.dragon2Sdcc.cooldownMs)}ms heal:${skillState.dragon2Sdcc.lastHealOnHit}`);
      lines.push(`D3 LTWJ cd:${Math.ceil(skillState.dragon3Ltwj.cooldownMs)}ms heal:${skillState.dragon3Ltwj.lastHealOnHit}`);
      lines.push(`D4 QLAOYI cd:${Math.ceil(skillState.dragon4Qlaoyi.cooldownMs)}ms combo:${formatPetDragon4QlaoyiCombo(skillState.dragon4Qlaoyi.lastCombo)}`);
      lines.push(`T1 SLD cd:${Math.ceil(skillState.turtle1Sld.cooldownMs)}ms heal:${skillState.turtle1Sld.lastHeal}`);
      lines.push(`T2 TXLJ cd:${Math.ceil(skillState.turtle2Txlj.cooldownMs)}ms link:${formatPetAutoBuffMs(skillState.turtle2Txlj.linkRemainingMs)} dmg:${skillState.turtle2Txlj.lastOwnerDamageAfterRedirect}/${skillState.turtle2Txlj.lastOwnerDamageRedirect} heal:${skillState.turtle2Txlj.lastOwnerHealBoost}/${skillState.turtle2Txlj.lastPetHeal}`);
      lines.push(`Last skill: ${skillState.lastResult}`);
    }
    const autoBuffState = selected.autoBuffState;
    if (autoBuffState) {
      const sxkbActive = autoBuffState.sxkb.active;
      const fsnlActive = autoBuffState.fsnl.active;
      const smjcActive = autoBuffState.smjc.active;
      const mfjcActive = autoBuffState.mfjc.active;
      const gjjcActive = autoBuffState.gjjc.active;
      const fyjcActive = autoBuffState.fyjc.active;
      lines.push(
        `SXKB ${sxkbActive ? `+${((sxkbActive.bonusCritRate ?? 0) * 100).toFixed(2)}% ${formatPetAutoBuffMs(sxkbActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.sxkb.counterMs)}`}`,
      );
      lines.push(
        `FSNL ${fsnlActive ? `+${(fsnlActive.bonusSkillDamage ?? 0).toFixed(1)} ${formatPetAutoBuffMs(fsnlActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.fsnl.counterMs)}`}`,
      );
      lines.push(
        `SMJC ${smjcActive ? `+${(smjcActive.bonusMaxHp ?? 0).toFixed(1)} ${formatPetAutoBuffMs(smjcActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.smjc.counterMs)}`}`,
      );
      lines.push(
        `MFJC ${mfjcActive ? `+${(mfjcActive.bonusMaxMp ?? 0).toFixed(1)} ${formatPetAutoBuffMs(mfjcActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.mfjc.counterMs)}`}`,
      );
      lines.push(
        `GJJC ${gjjcActive ? `+${(gjjcActive.bonusPower ?? 0).toFixed(1)} ${formatPetAutoBuffMs(gjjcActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.gjjc.counterMs)}`}`,
      );
      lines.push(
        `FYJC ${fyjcActive ? `+${(fyjcActive.bonusDefense ?? 0).toFixed(1)} ${formatPetAutoBuffMs(fyjcActive.remainingMs)}` : `wait:${formatPetAutoBuffMs(autoBuffState.fyjc.counterMs)}`}`,
      );
      lines.push(`Last auto: ${autoBuffState.lastResult}`);
    }
  } else {
    lines.push('-');
  }

  lines.push('');
  lines.push(controlHint);
  return lines;
}

export function buildCompactPetPanelLines(roster: PetRoster): string[] {
  const selected = getSelectedPet(roster);
  const active = getActivePet(roster);
  const lines = [
    `数量 ${roster.pets.length}/${PetTuning.maxSeats}  出战 ${active?.displayName ?? '-'}`,
    roster.message,
    '',
    '宠物列表（当前附近）',
  ];
  const start = Math.max(0, Math.min(roster.selectedIndex - 2, roster.pets.length - 5));
  for (let index = start; index < Math.min(roster.pets.length, start + 5); index += 1) {
    const pet = roster.pets[index];
    lines.push(`${index === roster.selectedIndex ? '▶' : ' '} ${pet.displayName} F${pet.form} Lv.${pet.level}${pet.isActive ? ' [出战]' : ''}`);
  }
  if (!selected) {
    lines.push('', '没有可选择的宠物');
    return lines;
  }
  lines.push(
    '',
    `HP ${selected.hp}/${selected.maxHp}  MP ${selected.mp}/${selected.maxMp}`,
    `ATK ${selected.atk}  DEF ${selected.def}  LIFE ${selected.lifetime}/100`,
    `悟 ${selected.perception}  技 ${selected.technique}  战 ${selected.warpower}`,
    `技能 ${selected.skills.length > 0 ? selected.skills.join(' / ') : '-'}`,
    '',
    '请使用下方鼠标按钮操作',
  );
  return lines;
}


function getPetDragon4QlaoyiComboTags(combo: PetDragon4QlaoyiComboState): string[] {
  const tags: string[] = [];
  if (combo.cloneCombo) {
    tags.push('fs-clone');
  }
  if (combo.sdccCombo) {
    tags.push('sdcc-charge');
  }
  if (combo.ltwjCombo) {
    tags.push('ltwj-multi');
  }
  return tags;
}

function formatPetDragon4QlaoyiCombo(combo: PetDragon4QlaoyiComboState): string {
  const tags = getPetDragon4QlaoyiComboTags(combo);
  return tags.length > 0 ? tags.join('+') : '-';
}

function formatPetNextExperience(pet: PetState): string {
  return Number.isFinite(pet.expToNext) ? String(pet.expToNext) : 'MAX';
}

function formatPetAutoBuffMs(value: number): string {
  return `${Math.max(0, value / 1000).toFixed(1)}s`;
}
