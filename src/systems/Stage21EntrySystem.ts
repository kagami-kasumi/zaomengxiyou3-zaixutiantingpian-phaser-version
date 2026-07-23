import { canEnterStage, type StageEntryAccessMode, type StageUnlockProgress } from './StageEntryAccessSystem';

export type Stage21PlayerCount = 1 | 2;
export type Stage21QaEnemyType = 6 | 9 | 10 | 19;
export type Stage21QaOptions = Readonly<{
  fastClear?: boolean;
  noDamage?: boolean;
  holdEnemyType?: Stage21QaEnemyType;
  forcedEnemyState?: 'hurt' | 'dead';
  showcase?: boolean;
}>;

export function canEnterStage21(progress: StageUnlockProgress, accessMode?: StageEntryAccessMode): boolean {
  return canEnterStage(progress, 2, 1, accessMode);
}

export function normalizeStage21PlayerCount(value: unknown): Stage21PlayerCount {
  return value === 2 ? 2 : 1;
}

export function readStage21QaOptions(
  search: string,
  isDevelopment: boolean,
): Stage21QaOptions {
  if (!isDevelopment) return {};
  const params = new URLSearchParams(search);
  const holdEnemy = Number(params.get('qaHoldEnemy'));
  const enemyState = params.get('qaEnemyState');
  return {
    fastClear: params.get('qaFastClear') === '1',
    noDamage: params.get('qaNoDamage') === '1',
    showcase: params.get('qaShowcase') === '1',
    holdEnemyType: holdEnemy === 6 || holdEnemy === 9 || holdEnemy === 10 || holdEnemy === 19
      ? holdEnemy
      : undefined,
    forcedEnemyState: enemyState === 'hurt' || enemyState === 'dead' ? enemyState : undefined,
  };
}
