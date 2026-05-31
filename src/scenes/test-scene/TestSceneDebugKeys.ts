import Phaser from 'phaser';
import type { AuraDropType, MedicineDropType, MonsterDropContext, MonsterDropId } from '../../systems/DropSystem';

export type ConfiguredDropDebugKey =
  | 'monster3Boss'
  | 'monster7'
  | 'monster29'
  | 'monster1'
  | 'monster31'
  | 'monster207'
  | 'monster601';

export type TestSceneDebugKeys = {
  medicineSpawnKeys: Record<MedicineDropType, Phaser.Input.Keyboard.Key>;
  auraSpawnKeys: Record<AuraDropType, Phaser.Input.Keyboard.Key>;
  stoneSpawnKey: Phaser.Input.Keyboard.Key;
  configuredDropSpawnKeys: Record<ConfiguredDropDebugKey, Phaser.Input.Keyboard.Key>;
};

export type ConfiguredDropDebugAction = {
  monsterId: MonsterDropId;
  context: MonsterDropContext;
  entryIndex: number;
  forceDrop?: boolean;
};

export function createTestSceneDebugKeys(
  keyboard: Phaser.Input.Keyboard.KeyboardPlugin,
): TestSceneDebugKeys {
  return {
    medicineSpawnKeys: {
      SmallHP: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
      BigHP: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN),
      SmallMP: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT),
    },
    auraSpawnKeys: {
      red: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      white: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
    },
    stoneSpawnKey: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C),
    configuredDropSpawnKeys: {
      monster3Boss: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.N),
      monster7: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M),
      monster29: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.COMMA),
      monster1: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F9),
      monster31: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F10),
      monster207: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F11),
      monster601: keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F12),
    },
  };
}

export function collectMedicineDebugActions(
  keys: TestSceneDebugKeys | undefined,
): MedicineDropType[] {
  if (!keys) {
    return [];
  }

  const actions: MedicineDropType[] = [];
  const types: readonly MedicineDropType[] = ['SmallHP', 'BigHP', 'SmallMP'];
  for (const type of types) {
    if (Phaser.Input.Keyboard.JustDown(keys.medicineSpawnKeys[type])) {
      actions.push(type);
    }
  }

  return actions;
}

export function collectAuraDebugActions(
  keys: TestSceneDebugKeys | undefined,
): AuraDropType[] {
  if (!keys) {
    return [];
  }

  const actions: AuraDropType[] = [];
  const types: readonly AuraDropType[] = ['red', 'white'];
  for (const type of types) {
    if (Phaser.Input.Keyboard.JustDown(keys.auraSpawnKeys[type])) {
      actions.push(type);
    }
  }

  return actions;
}

export function isStoneDebugJustDown(
  keys: TestSceneDebugKeys | undefined,
): boolean {
  return keys ? Phaser.Input.Keyboard.JustDown(keys.stoneSpawnKey) : false;
}

export function collectConfiguredDropDebugActions(
  keys: TestSceneDebugKeys | undefined,
  defaultContext: MonsterDropContext,
): ConfiguredDropDebugAction[] {
  if (!keys) {
    return [];
  }

  const actions: ConfiguredDropDebugAction[] = [];
  const configuredKeys = keys.configuredDropSpawnKeys;
  if (Phaser.Input.Keyboard.JustDown(configuredKeys.monster3Boss)) {
    actions.push({ monsterId: 'Monster3', context: { curStage: 1, curLevel: 1 }, entryIndex: 2 });
  }
  if (Phaser.Input.Keyboard.JustDown(configuredKeys.monster7)) {
    actions.push({ monsterId: 'Monster7', context: defaultContext, entryIndex: 0 });
  }
  if (Phaser.Input.Keyboard.JustDown(configuredKeys.monster29)) {
    actions.push({ monsterId: 'Monster29', context: defaultContext, entryIndex: 0 });
  }
  if (Phaser.Input.Keyboard.JustDown(configuredKeys.monster1)) {
    actions.push({ monsterId: 'Monster1', context: defaultContext, entryIndex: 0 });
  }
  if (Phaser.Input.Keyboard.JustDown(configuredKeys.monster31)) {
    actions.push({ monsterId: 'Monster31', context: defaultContext, entryIndex: 0 });
  }
  if (Phaser.Input.Keyboard.JustDown(configuredKeys.monster207)) {
    actions.push({ monsterId: 'Monster207', context: defaultContext, entryIndex: 0 });
  }
  if (Phaser.Input.Keyboard.JustDown(configuredKeys.monster601)) {
    actions.push({
      monsterId: 'Monster601',
      context: defaultContext,
      entryIndex: 0,
      forceDrop: false,
    });
  }

  return actions;
}
