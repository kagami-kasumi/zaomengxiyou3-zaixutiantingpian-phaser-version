export type GameDifficulty = 0 | 1 | 2;
export type GameFrameRate = 20 | 24 | 30;

export type GlobalSettingsSnapshot = Readonly<{
  difficulty: GameDifficulty;
  bgmEnabled: boolean;
  skillSoundEnabled: boolean;
  frameRate: GameFrameRate;
}>;

export type GlobalSettingsStorage = Readonly<{
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}>;

export const GlobalSettingsStorageKey = 'zaixu-global-settings-v1';
export const DefaultGlobalSettings: GlobalSettingsSnapshot = Object.freeze({
  difficulty: 0,
  bgmEnabled: true,
  skillSoundEnabled: true,
  frameRate: 30,
});

let sessionSettings: GlobalSettingsSnapshot = DefaultGlobalSettings;

export function loadGlobalSettings(
  storage?: GlobalSettingsStorage,
): GlobalSettingsSnapshot {
  if (!storage) return sessionSettings;
  try {
    const encoded = storage.getItem(GlobalSettingsStorageKey);
    sessionSettings = encoded === null
      ? DefaultGlobalSettings
      : decodeGlobalSettings(encoded);
  } catch {
    sessionSettings = DefaultGlobalSettings;
  }
  return sessionSettings;
}

export function getGlobalSettings(): GlobalSettingsSnapshot {
  return sessionSettings;
}

export function cycleGlobalSetting(
  field: 'difficulty' | 'bgmEnabled' | 'skillSoundEnabled' | 'frameRate',
  storage?: GlobalSettingsStorage,
): GlobalSettingsSnapshot {
  const current = sessionSettings;
  if (field === 'difficulty') {
    sessionSettings = { ...current, difficulty: ((current.difficulty + 1) % 3) as GameDifficulty };
  } else if (field === 'bgmEnabled') {
    sessionSettings = { ...current, bgmEnabled: !current.bgmEnabled };
  } else if (field === 'skillSoundEnabled') {
    sessionSettings = { ...current, skillSoundEnabled: !current.skillSoundEnabled };
  } else {
    sessionSettings = {
      ...current,
      frameRate: current.frameRate === 30 ? 24 : current.frameRate === 24 ? 20 : 30,
    };
  }
  persistGlobalSettings(storage);
  return sessionSettings;
}

export function activateGlobalSettingsForTests(
  snapshot: GlobalSettingsSnapshot = DefaultGlobalSettings,
): void {
  sessionSettings = snapshot;
}

function decodeGlobalSettings(encoded: string): GlobalSettingsSnapshot {
  const candidate: unknown = JSON.parse(encoded);
  if (!isRecord(candidate)) return DefaultGlobalSettings;
  if (!isDifficulty(candidate.difficulty)) return DefaultGlobalSettings;
  if (typeof candidate.bgmEnabled !== 'boolean') return DefaultGlobalSettings;
  if (typeof candidate.skillSoundEnabled !== 'boolean') return DefaultGlobalSettings;
  if (!isFrameRate(candidate.frameRate)) return DefaultGlobalSettings;
  return {
    difficulty: candidate.difficulty,
    bgmEnabled: candidate.bgmEnabled,
    skillSoundEnabled: candidate.skillSoundEnabled,
    frameRate: candidate.frameRate,
  };
}

function persistGlobalSettings(storage?: GlobalSettingsStorage): void {
  if (!storage) return;
  try {
    storage.setItem(GlobalSettingsStorageKey, JSON.stringify(sessionSettings));
  } catch {
    // Settings remain valid for the current session when browser persistence is unavailable.
  }
}

function isDifficulty(value: unknown): value is GameDifficulty {
  return value === 0 || value === 1 || value === 2;
}

function isFrameRate(value: unknown): value is GameFrameRate {
  return value === 20 || value === 24 || value === 30;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
