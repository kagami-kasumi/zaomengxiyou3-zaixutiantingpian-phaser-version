import { getPetExperienceToNextLevel } from './PetProgressionSystem';
import { createPetSkillState } from './PetSkillStateSystem';
import type { PetSkillRandomSource, PetState } from './PetTypes';

export type PetGrowthAttributeSnapshot = Pick<PetState, 'perception' | 'technique' | 'warpower'>;

export type PetEvolutionResult = {
  shouldConsume: boolean;
  rebuildRuntime: boolean;
  formChanged: boolean;
  ultimateAdded: boolean;
  message: string;
};

type ChildQualityAndStats = Pick<
  PetState,
  'hpQuality' | 'mpQuality' | 'atkQuality' | 'defQuality' | 'maxHp' | 'maxMp' | 'atk' | 'def'
>;

const PetFormOneDisplayNames: Record<string, string> = {
  monkey: '火丸', horse: '雪球', ufo: '小飞', tigress: '虎丸', turtle: '龟布',
  phoenix: '雀蛋', dragon: '龙仔', rabbit: '月兔', roomhorse: '炎马',
  mouse: '子鼠元帅', neat: '丑牛元帅', nian: '小年兽', terribletiger: '寅虎元帅',
};

const PetFormFourDisplayNames: Record<string, string> = {
  monkey: '烈焰金刚', horse: '极寒天马', tigress: '白虎战神', turtle: '玄武大帝',
  phoenix: '朱雀女皇', dragon: '青龙妖圣', rabbit: '冰霜月神', roomhorse: '烈迦',
  mouse: '子鼠大元帅', neat: '丑牛大元帅', nian: '年兽', terribletiger: '寅虎大元帅',
};

const PetUltimateSkills: Record<string, string> = {
  monkey: 'jgaoyi', horse: 'tmaoyi', dragon: 'qlaoyi', tigress: 'bhaoyi',
  phoenix: 'zqaoyi', turtle: 'xwaoyi', rabbit: 'ysaoyi', mouse: 'zsaoyi',
  neat: 'cnaoyi', terribletiger: 'yhaoyi',
};

export function rerollPetGrowthAttribute(
  currentValue: number,
  quality: number,
  random: PetSkillRandomSource = Math.random,
): number {
  if (currentValue >= 5) {
    if (random() <= 0.6) return currentValue - 1;
    if (random() <= 0.35 && currentValue <= 7) return currentValue + 1;
    if (random() <= 0.2 && currentValue <= 6) return currentValue + 2;
    return Math.round(random() * 5) + 3;
  }
  return Math.round(random() * 4) + (quality === 1 ? 1 : 0);
}

export function rerollPetGrowthAttributes(
  pet: PetState,
  random: PetSkillRandomSource = Math.random,
): { before: PetGrowthAttributeSnapshot; after: PetGrowthAttributeSnapshot } {
  const before = snapshotGrowthAttributes(pet);
  pet.perception = rerollPetGrowthAttribute(pet.perception, pet.quality, random);
  pet.technique = rerollPetGrowthAttribute(pet.technique, pet.quality, random);
  pet.warpower = rerollPetGrowthAttribute(pet.warpower, pet.quality, random);
  return { before, after: snapshotGrowthAttributes(pet) };
}

export function returnPetToChild(
  pet: PetState,
  random: PetSkillRandomSource = Math.random,
): boolean {
  const child = createChildQualityAndStats(pet.species, random);
  if (!child) return false;
  pet.level = 1;
  pet.form = 1;
  pet.displayName = PetFormOneDisplayNames[pet.species] ?? pet.displayName;
  pet.exp = 0;
  pet.expToNext = getPetExperienceToNextLevel(1);
  pet.quality = 1;
  pet.hpQuality = child.hpQuality;
  pet.mpQuality = child.mpQuality;
  pet.atkQuality = child.atkQuality;
  pet.defQuality = child.defQuality;
  pet.maxHp = child.maxHp;
  pet.hp = child.maxHp;
  pet.maxMp = child.maxMp;
  pet.mp = child.maxMp;
  pet.atk = child.atk;
  pet.def = child.def;
  pet.perception = 4 + Math.round(random() * 3);
  pet.warpower = 4 + Math.round(random() * 4);
  pet.technique = 4 + Math.round(random() * 4);

  // BaseHero.changePet() replaces the AS3 combat entity. Rebuild the modern
  // transient state while keeping PetInfo-owned skills/lifetime/deployment.
  pet.critBonusRate = 0;
  pet.skillDamageBonus = 0;
  pet.skillState = createPetSkillState();
  delete pet.autoBuffState;
  delete pet.magicFlowerBuff;
  return true;
}

export function evolvePetWithItem(pet: PetState): PetEvolutionResult {
  if (pet.form === 4) {
    return {
      shouldConsume: false, rebuildRuntime: false, formChanged: false, ultimateAdded: false,
      message: `${pet.displayName} 已经是第四形态`,
    };
  }
  if (pet.form !== 3) {
    return {
      shouldConsume: true, rebuildRuntime: false, formChanged: false, ultimateAdded: false,
      message: `${pet.displayName} 当前形态无法进化，道具已消耗`,
    };
  }

  reweightPassiveStatsForFormChange(pet, 3, 4);
  pet.form = 4;
  pet.displayName = PetFormFourDisplayNames[pet.species] ?? pet.displayName;
  const ultimateSkill = PetUltimateSkills[pet.species];
  const ultimateAdded = Boolean(ultimateSkill) && pet.skills.length < 8;
  if (ultimateSkill && ultimateAdded) pet.skills.push(ultimateSkill);
  pet.critBonusRate = 0;
  pet.skillDamageBonus = 0;
  pet.skillState = createPetSkillState();
  delete pet.autoBuffState;
  delete pet.magicFlowerBuff;
  return {
    shouldConsume: true,
    rebuildRuntime: true,
    formChanged: true,
    ultimateAdded,
    message: ultimateAdded
      ? `${pet.displayName} 进化成功并领悟 ${ultimateSkill}`
      : `${pet.displayName} 进化成功${ultimateSkill ? '，技能槽已满' : ''}`,
  };
}

function createChildQualityAndStats(
  species: string,
  random: PetSkillRandomSource,
): ChildQualityAndStats | undefined {
  if (species === 'monkey') return fixedChild(1040, 1040, 1040, 1040, 150, 20, 6);
  if (species === 'horse') return fixedChild(949, 1222, 1105, 520, 200, 25, 6);
  if (species === 'ufo') return fixedChild(1170, 1040, 1170, 351, 150, 30, 8);
  if (species === 'tigress') return fixedChild(1300, 1040, 1300, 520, 150, 30, 8);
  if (species === 'turtle') return fixedChild(1560, 910, 1170, 611, 150, 25, 10);
  if (species === 'phoenix') return fixedChild(1170, 1170, 1300, 520, 200, 32, 6);
  if (species === 'dragon') return fixedChild(1430, 780, 1430, 520, 200, 30, 8);
  if (species === 'rabbit') {
    return randomChild(random, 800, 300, 500, 400, 800, 300, 200, 200, 200, 30, 5);
  }
  if (species === 'roomhorse') {
    return randomChild(random, 700, 500, 550, 440, 1000, 300, 200, 200, 800, 50, 10);
  }
  if (species === 'mouse' || species === 'neat' || species === 'nian' || species === 'terribletiger') {
    return randomChild(random, 700, 500, 250, 440, 1000, 300, 200, 200, 800, 50, 10);
  }
  return undefined;
}

function fixedChild(
  hpQuality: number,
  mpQuality: number,
  atkQuality: number,
  defQuality: number,
  maxMp: number,
  atk: number,
  def: number,
): ChildQualityAndStats {
  return { hpQuality, mpQuality, atkQuality, defQuality, maxHp: 840, maxMp, atk, def };
}

function randomChild(
  random: PetSkillRandomSource,
  hpBase: number,
  hpRange: number,
  mpBase: number,
  mpRange: number,
  atkBase: number,
  atkRange: number,
  defBase: number,
  defRange: number,
  maxMp: number,
  atk: number,
  def: number,
): ChildQualityAndStats {
  return {
    hpQuality: Math.trunc((hpBase + Math.round(random() * hpRange)) * 1.3),
    mpQuality: Math.trunc((mpBase + Math.round(random() * mpRange)) * 1.3),
    atkQuality: Math.trunc((atkBase + Math.round(random() * atkRange)) * 1.3),
    defQuality: Math.trunc((defBase + Math.round(random() * defRange)) * 1.3),
    maxHp: 840, maxMp, atk, def,
  };
}

function snapshotGrowthAttributes(pet: PetState): PetGrowthAttributeSnapshot {
  return { perception: pet.perception, technique: pet.technique, warpower: pet.warpower };
}

function reweightPassiveStatsForFormChange(pet: PetState, oldForm: number, newForm: number): void {
  for (const skill of pet.skills) {
    if (skill === 'tsml') {
      pet.atk += (newForm - oldForm) * 6 * pet.warpower;
    } else if (skill === 'zrsh') {
      pet.def += (newForm - oldForm) * 4 * pet.technique;
    } else if (skill === 'smzf') {
      const oldBonus = oldForm * 50 * pet.warpower;
      const newBonus = newForm * 50 * pet.warpower;
      if (pet.hp > oldBonus) pet.hp -= oldBonus;
      pet.hp += newBonus;
      pet.maxHp += newBonus - oldBonus;
    } else if (skill === 'mfby') {
      const oldBonus = oldForm * 50 * pet.technique;
      const newBonus = newForm * 50 * pet.technique;
      if (pet.mp > oldBonus) pet.mp -= oldBonus;
      pet.mp += newBonus;
      pet.maxMp += newBonus - oldBonus;
    }
  }
}
