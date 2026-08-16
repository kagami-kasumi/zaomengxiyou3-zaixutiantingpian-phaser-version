import settingsPageTruth from '../../../docs/reverse-engineering/ground-truth/manifests/task-settings-175g-settings-page.json';

export type SettingsTruthBounds = Readonly<{
  left: number;
  top: number;
  width: number;
  height: number;
}>;

export type SettingsTruthTextStyle = Readonly<{
  fontFamily: string;
  fontSize: number;
  color: string;
  hoverColor?: string;
}>;

type SettingsTruthObject = (typeof settingsPageTruth.displayObjects)[number];

export const SettingsPageTruthId = 'task-settings-175g.settings-page' as const;

export const SettingsTruthObjectIds = {
  root: 'settings-page-root',
  overlay: 'settings-page-root.sprite-134-depth-1',
  overlayHit: 'settings-page-root.sprite-134-depth-1.full-stage-hit-shape',
  close: 'settings-page-root.xClick',
  rows: {
    difficulty: {
      label: 'settings-page-root.text-field-136-depth-3',
      value: 'settings-page-root.difficulty',
      text: 'settings-page-root.difficulty.txt',
    },
    bgmEnabled: {
      label: 'settings-page-root.text-field-137-depth-4',
      value: 'settings-page-root.bgmStay',
      text: 'settings-page-root.bgmStay.txt',
    },
    skillSoundEnabled: {
      label: 'settings-page-root.text-field-138-depth-5',
      value: 'settings-page-root.skillStay',
      text: 'settings-page-root.skillStay.txt',
    },
    frameRate: {
      label: 'settings-page-root.text-field-139-depth-6',
      value: 'settings-page-root.quality',
      text: 'settings-page-root.quality.txt',
    },
    defaultVol: {
      label: 'settings-page-root.text-field-147-depth-17',
      value: 'settings-page-root.defaultVol',
      text: 'settings-page-root.defaultVol.txt',
    },
  },
} as const;

export function assertVerifiedSettingsPageTruth(): void {
  if (settingsPageTruth.truthId !== SettingsPageTruthId
    || settingsPageTruth.status !== 'verified') {
    throw new Error(`${settingsPageTruth.truthId} is not the verified settings-page truth.`);
  }
  if (settingsPageTruth.displayObjects.length !== 19 || settingsPageTruth.states.length !== 23) {
    throw new Error(`${SettingsPageTruthId} completeness drifted.`);
  }
  if (!settingsPageTruth.completeness.displayListMatched
    || !settingsPageTruth.completeness.stateSetMatched
    || settingsPageTruth.completeness.unresolved.length > 0) {
    throw new Error(`${SettingsPageTruthId} contains unresolved or unmatched evidence.`);
  }
}

export function getSettingsTruthBounds(
  id: string,
  stateId = 'normal-default',
): SettingsTruthBounds {
  const placement = findObject(id).placements.find((candidate) => candidate.stateId === stateId);
  if (!placement?.visible || !placement.stageBounds) {
    throw new Error(`${SettingsPageTruthId} ${id} is not visible in ${stateId}.`);
  }
  return placement.stageBounds;
}

export function getSettingsTruthLocalOffset(id: string): Readonly<{ x: number; y: number }> {
  const placement = findObject(id).placements.find(({ visible }) => visible);
  if (!placement) throw new Error(`${SettingsPageTruthId} ${id} has no visible placement.`);
  return { x: placement.localMatrix.tx, y: placement.localMatrix.ty };
}

export function getSettingsTruthTextStyle(id: string): SettingsTruthTextStyle {
  const object = findObject(id) as SettingsTruthObject & {
    render?: { textStyle?: SettingsTruthTextStyle };
  };
  if (!object.render?.textStyle) {
    throw new Error(`${SettingsPageTruthId} ${id} has no text style.`);
  }
  return object.render.textStyle;
}

export function getSettingsTruthStateIds(): readonly string[] {
  assertVerifiedSettingsPageTruth();
  return settingsPageTruth.states.map(({ id }) => id);
}

export function getSettingsTruthCharacterId(id: string): number {
  const characterId = findObject(id).sourceIdentity.characterId;
  if (typeof characterId !== 'number') {
    throw new Error(`${SettingsPageTruthId} ${id} has no character id.`);
  }
  return characterId;
}

function findObject(id: string): SettingsTruthObject {
  assertVerifiedSettingsPageTruth();
  const object = settingsPageTruth.displayObjects.find((candidate) => candidate.id === id);
  if (!object) throw new Error(`${SettingsPageTruthId} is missing ${id}.`);
  return object;
}
