export type Role5SpearSkillName = 'xlc' | 'lxuanj' | 'xkjz';
export type Role5StatusSkillName = 'yyb' | 'tlj';
export type Role5SwordSkillName = 'pkz' | 'lxj' | 'mlsz';
export type Role5CompanionSkillName = 'lysh' | 'jrjl';
export type Role5SkillName =
  | Role5SpearSkillName
  | Role5StatusSkillName
  | Role5SwordSkillName
  | Role5CompanionSkillName;

export type Role5CompanionArrowState = {
  created: boolean;
  charged: number;
  chargeElapsedMs: number;
};

export type Role5SkillTarget = {
  id: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  alive: boolean;
};

export type Role5SpearSkillAction = {
  skillName: Role5SkillName;
  elapsedMs: number;
  durationMs: number;
  facingX: -1 | 1;
  dashVelocityX?: number;
};

export type Role5SkillRuntime = {
  active?: Role5SpearSkillAction;
  yybRemainingMs: number;
  yybInverted: boolean;
  tljRemainingMs: number;
  loongSwordRemainingMs: number;
  loongSwordLevel: number;
  loongSwordFeijianOpportunities: number;
  lyshArrows: Role5CompanionArrowState;
  jrjlArrows: Role5CompanionArrowState;
  jrjlLevel: number;
};

export function createRole5SkillRuntime(): Role5SkillRuntime {
  return {
    yybRemainingMs: 0,
    yybInverted: false,
    tljRemainingMs: 0,
    loongSwordRemainingMs: 0,
    loongSwordLevel: 0,
    loongSwordFeijianOpportunities: 0,
    lyshArrows: { created: false, charged: 0, chargeElapsedMs: 0 },
    jrjlArrows: { created: false, charged: 0, chargeElapsedMs: 0 },
    jrjlLevel: 0,
  };
}
