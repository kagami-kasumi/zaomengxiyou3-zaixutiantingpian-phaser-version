import type { AllSkillName } from '../../systems/SkillUISystem';

export const SkillSelectorCharacterByHero: Readonly<Record<number, number>> = {
  1: 218,
  2: 223,
  3: 228,
  4: 233,
  5: 871,
};

export const SkillIconCharacterByName: Readonly<Record<AllSkillName, number>> = {
  blb: 702,
  dgq: 769,
  dj: 722,
  dzj: 810,
  hmz: 635,
  hyjj: 644,
  hytj: 659,
  jdy: 649,
  jdz: 789,
  jgz: 681,
  jhsj: 686,
  jrjl: 859,
  jsp: 754,
  lybj: 815,
  lyfb: 664,
  lys: 654,
  lysh: 842,
  lxj: 846,
  lxuanj: 850,
  mbyj: 779,
  mds: 794,
  mlsz: 863,
  mmw: 820,
  myhc: 676,
  pkz: 835,
  qlj: 800,
  qsez: 625,
  rj: 732,
  sd: 727,
  sgq: 671,
  shy: 712,
  sjt: 696,
  slz: 630,
  smb: 717,
  ssp: 749,
  sx: 620,
  syzq: 742,
  tkj: 805,
  tlj: 839,
  tmc: 764,
  tjgl: 691,
  wdww: 784,
  xbz: 707,
  xgq: 759,
  xkjz: 854,
  xlc: 826,
  yyb: 830,
  zq: 774,
  zz: 615,
  zznh: 737,
};

export const SkillTreeFrameByHero: Readonly<Record<number, readonly [number, number]>> = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8],
  5: [9, 10],
};

export const SkillIconPositions = [
  { x: 375.5, y: 125.55 },
  { x: 375.5, y: 204.2 },
  { x: 375.5, y: 280.15 },
  { x: 375.5, y: 356.15 },
  { x: 375.5, y: 436.2 },
] as const;

export const SkillSetButtonPositions = [
  { x: 784.4, y: 145.65 },
  { x: 784.4, y: 227.65 },
  { x: 784.4, y: 299.65 },
  { x: 784.4, y: 379.7 },
  { x: 784.4, y: 455.5 },
] as const;

export const SkillUpgradeButtonPositions = [
  { x: 855.5, y: 145.65 },
  { x: 855.5, y: 224.65 },
  { x: 855.5, y: 299.65 },
  { x: 855.5, y: 376.7 },
  { x: 855.5, y: 455.5 },
] as const;

export const BindingSlotPositions = [
  { x: 230.95, y: 339 },
  { x: 324.95, y: 339 },
  { x: 416.95, y: 339 },
  { x: 509.95, y: 339 },
  { x: 602.95, y: 339 },
] as const;

export const BindingSlotCharacters = [393, 398, 403, 408, 413] as const;
export const BindingVisualToLoadoutIndex = [0, 2, 3, 4, 1] as const;

export const PassiveRowPositions = [
  { x: 124, y: 144.95 },
  { x: 122, y: 221.95 },
  { x: 122, y: 304.95 },
  { x: 122, y: 381.95 },
  { x: 122, y: 460.95 },
] as const;
