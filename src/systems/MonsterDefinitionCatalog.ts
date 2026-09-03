import type { AttackKind } from './CombatSystem';

export type MonsterDefinitionId = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 16 | 19 | 30;

export type MonsterCombatDefinition = Readonly<{
  enemyType: MonsterDefinitionId;
  maxHp: number;
  physicalDefense: number;
  moveSpeed: number;
  attackRange: number;
  attackKind: AttackKind;
  attackDamage: number;
  actionName: string;
  windupMs: number;
  activeMs: number;
  recoveryMs: number;
  isBoss: boolean;
  displayName: string;
  feedbackHeight: number;
}>;

export const monsterDefinitionCatalog = {
  2: definition(2, 1_500, 8, 28, 96, 'physics', 29, 'hit1', 360, 180, 620, true, '顺风耳', 190),
  3: definition(3, 926, 5, 240, 150, 'physics', 40, 'hit1', 300, 220, 600, true, '巫鹰', 180),
  4: definition(4, 1_481, 8, 27, 112, 'physics', 49, 'hit1', 420, 200, 680, true, '千里眼', 190),
  5: definition(5, 2_788, 14, 26, 125, 'physics', 147, 'hit1', 520, 220, 760, true, '巨灵神', 350),
  6: definition(6, 4_957, 19, 30, 157, 'physics', 157, 'hit1', 520, 220, 760, true, 'Monster6', 400),
  7: definition(7, 200, 3, 35, 78, 'physics', 18, 'hit1', 300, 150, 520, false, 'Monster7', 150),
  8: definition(8, 300, 4, 33, 82, 'physics', 18, 'hit1', 320, 160, 540, false, 'Monster8', 150),
  9: definition(9, 1_613, 27, 27, 200, 'physics', 90, 'hit1', 420, 200, 680, false, 'Monster9', 200),
  10: definition(10, 1_500, 27, 27, 200, 'physics', 90, 'hit1', 420, 200, 680, false, 'Monster10', 200),
  16: definition(16, 24_189, 34, 5, 150, 'physics', 185, 'hit1', 420, 200, 680, true, 'Monster16', 300),
  19: definition(19, 1_531, 27, 27, 200, 'magic', 36, 'hit1', 420, 200, 680, false, 'Monster19', 200),
  30: definition(30, 150, 3, 420, 250, 'physics', 15, 'hit1', 420, 145, 480, false, 'Monster30', 150),
} as const satisfies Readonly<Record<MonsterDefinitionId, MonsterCombatDefinition>>;

export function getMonsterDefinition(monsterId: MonsterDefinitionId): MonsterCombatDefinition {
  return monsterDefinitionCatalog[monsterId];
}

function definition(
  enemyType: MonsterDefinitionId,
  maxHp: number,
  physicalDefense: number,
  moveSpeed: number,
  attackRange: number,
  attackKind: AttackKind,
  attackDamage: number,
  actionName: string,
  windupMs: number,
  activeMs: number,
  recoveryMs: number,
  isBoss: boolean,
  displayName: string,
  feedbackHeight: number,
): MonsterCombatDefinition {
  return {
    enemyType,
    maxHp,
    physicalDefense,
    moveSpeed,
    attackRange,
    attackKind,
    attackDamage,
    actionName,
    windupMs,
    activeMs,
    recoveryMs,
    isBoss,
    displayName,
    feedbackHeight,
  };
}
