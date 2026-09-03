import truthJson from '../../docs/reverse-engineering/ground-truth/manifests/task-settings-211-combat-hit-feedback.json';

type TruthDisplayObject = Readonly<{
  sourceIdentity: Readonly<{
    characterId: number | null;
    symbolClass: string | null;
  }>;
}>;

type CombatHitFeedbackTruth = Readonly<{
  truthId: string;
  status: string;
  states: readonly Readonly<{ id: string }>[];
  displayObjects: readonly TruthDisplayObject[];
  completeness: Readonly<{
    displayListMatched: boolean;
    stateSetMatched: boolean;
    unresolved: readonly unknown[];
  }>;
}>;

const truth = truthJson as unknown as CombatHitFeedbackTruth;

export const CombatHitFeedbackTruthId = 'task-settings-211.combat-hit-feedback';

export const CombatHitFeedbackAssetKeys = {
  batter: 'combat-feedback.combo.batter',
  ordinaryDigit: (digit: number) => `combat-feedback.damage.ordinary.${digit}`,
  criticalDigit: (digit: number) => `combat-feedback.damage.critical.${digit}`,
  comboDigitFrame: (digit: number, frame: number) => `combat-feedback.combo.${digit}.frame-${frame}`,
} as const;

export const combatHitFeedbackAssets = {
  batter: asset(CombatHitFeedbackAssetKeys.batter, '/assets/ui/combat-feedback/batter.png'),
  ordinaryDigits: Array.from({ length: 10 }, (_, digit) => asset(
    CombatHitFeedbackAssetKeys.ordinaryDigit(digit),
    `/assets/ui/combat-feedback/damage/ordinary/${digit}.png`,
  )),
  criticalDigits: Array.from({ length: 10 }, (_, digit) => asset(
    CombatHitFeedbackAssetKeys.criticalDigit(digit),
    `/assets/ui/combat-feedback/damage/critical/${digit}.png`,
  )),
  comboDigitFrames: Array.from({ length: 10 }, (_, digit) =>
    Array.from({ length: 5 }, (_, index) => asset(
      CombatHitFeedbackAssetKeys.comboDigitFrame(digit, index + 1),
      `/assets/ui/combat-feedback/combo/${digit}/${index + 1}.png`,
    ))).flat(),
} as const;

assertVerifiedTruth();

function asset(key: string, path: string): Readonly<{ key: string; path: string }> {
  return { key, path };
}

function assertVerifiedTruth(): void {
  if (truth.truthId !== CombatHitFeedbackTruthId || truth.status !== 'verified') {
    throw new Error(`Combat hit feedback truth is not verified: ${truth.truthId}/${truth.status}`);
  }
  if (!truth.completeness.displayListMatched
    || !truth.completeness.stateSetMatched
    || truth.completeness.unresolved.length > 0
    || truth.states.length !== 23) {
    throw new Error('Combat hit feedback truth completeness failed.');
  }
  const symbols = new Set(truth.displayObjects.map(({ sourceIdentity }) => sourceIdentity.symbolClass));
  for (const prefix of ['hurtnum', 'bnum', 'num']) {
    if (![...symbols].some((symbol) => symbol?.startsWith(prefix))) {
      throw new Error(`Combat hit feedback truth is missing the ${prefix} family.`);
    }
  }
  if (!symbols.has('export.Batter')) {
    throw new Error('Combat hit feedback truth is missing export.Batter.');
  }
}
