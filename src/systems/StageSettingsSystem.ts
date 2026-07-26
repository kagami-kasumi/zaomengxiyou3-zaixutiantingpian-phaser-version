import {
  getGlobalSettings,
  loadGlobalSettings,
  setGlobalSoundEnabled,
  type GlobalSettingsStorage,
} from './GlobalSettingsSystem';

export type StageSpawnSpeed = 1 | 2 | 4;
export type StageSettingsPage = 'settings' | 'help-action' | 'help-pet';

export type StageSettingsModel = {
  page: StageSettingsPage;
  spawnSpeed: StageSpawnSpeed;
};

export function createStageSettingsModel(
  storage?: GlobalSettingsStorage,
): StageSettingsModel {
  loadGlobalSettings(storage);
  return { page: 'settings', spawnSpeed: 1 };
}

export function isStageSoundEnabled(): boolean {
  const settings = getGlobalSettings();
  return settings.bgmEnabled && settings.skillSoundEnabled;
}

export function toggleStageSound(
  storage?: GlobalSettingsStorage,
): boolean {
  const enabled = !isStageSoundEnabled();
  setGlobalSoundEnabled(enabled, storage);
  return enabled;
}

export function cycleStageSpawnSpeed(model: StageSettingsModel): StageSpawnSpeed {
  model.spawnSpeed = model.spawnSpeed === 1 ? 2 : model.spawnSpeed === 2 ? 4 : 1;
  return model.spawnSpeed;
}

export function openStageHelp(model: StageSettingsModel): void {
  model.page = 'help-action';
}

export function showStageHelpFrame(
  model: StageSettingsModel,
  frame: 'action' | 'pet',
): void {
  model.page = frame === 'action' ? 'help-action' : 'help-pet';
}

export function closeStageHelp(model: StageSettingsModel): void {
  model.page = 'settings';
}
