import { AuthoritativeEquipmentCatalog } from './EquipmentCatalog';
import { createEquipmentMakingDefinitionRegistry } from './EquipmentMakingRegistry';
import { EquipmentVisualCatalog } from './EquipmentPreviewSystem';
import {
  canEquipInstance,
  createEmptyEquipmentLoadout,
  createSeedEquipmentRegistry,
  getEquipmentSlotForType,
  HeroNamesById,
  type EquipmentInstance,
  type EquipmentSlot,
} from './EquipmentSystem';
import { createPartyConfiguration } from './PartyConfigurationSystem';
import { createDefaultGameSave, createSaveSlot } from './SaveSlotSystem';
import type { SaveStorage } from './SaveSystem';
import { createInventoryItemDefinitionRegistry } from './InventoryResourceCatalog';

export type EquipmentPageQaCase =
  | 'equipped'
  | 'empty'
  | 'role4-shovel'
  | 'role4-arrow'
  | 'role5-frame'
  | 'character-520'
  | 'character-521'
  | 'title'
  | 'unchanged'
  | 'tooltip-instance'
  | 'fmtstx-defect'
  | 'mksddf-defect';

export type EquipmentPageQaOptions = Readonly<{
  roleId: 1 | 2 | 3 | 4 | 5;
  owner: 'p1' | 'p2';
  fixtureCase: EquipmentPageQaCase;
  soulCount: number;
}>;

const QaCases = new Set<EquipmentPageQaCase>([
  'equipped', 'empty', 'role4-shovel', 'role4-arrow', 'role5-frame',
  'character-520', 'character-521', 'title', 'unchanged', 'fmtstx-defect', 'mksddf-defect',
  'tooltip-instance',
]);
const QaEquipmentRegistry = createEquipmentMakingDefinitionRegistry(
  createInventoryItemDefinitionRegistry(createSeedEquipmentRegistry()),
);

export function readEquipmentPageQaOptions(
  search: string,
  allowed: boolean,
): EquipmentPageQaOptions | undefined {
  if (!allowed) return undefined;
  const params = new URLSearchParams(search);
  const roleId = Number(params.get('qaEquipmentRole'));
  const owner = params.get('qaEquipmentOwner') === 'p2' ? 'p2' : 'p1';
  const fixtureCase = params.get('qaEquipmentCase') as EquipmentPageQaCase | null;
  const requestedSoulCount = Number(params.get('qaEquipmentSoul') ?? 0);
  if (!Number.isInteger(roleId) || roleId < 1 || roleId > 5 || !fixtureCase || !QaCases.has(fixtureCase)) {
    return undefined;
  }
  const soulCount = Number.isSafeInteger(requestedSoulCount) && requestedSoulCount >= 0
    ? requestedSoulCount
    : 0;
  return { roleId: roleId as EquipmentPageQaOptions['roleId'], owner, fixtureCase, soulCount };
}

export function createEquipmentPageQaStorage(options: EquipmentPageQaOptions): SaveStorage {
  const storage = createMemoryStorage();
  const p1Role = options.owner === 'p1' ? options.roleId : 1;
  const p2Role = options.owner === 'p2' ? options.roleId : 2;
  const party = createPartyConfiguration(2, p1Role, p2Role)!;
  const save = createDefaultGameSave(new Date('2026-08-12T00:00:00.000Z'), party);
  const target = options.owner === 'p1' ? save.player1 : save.player2;
  target.equipment = encodeFixtureLoadout(options);
  target.soulCount = options.soulCount;
  if (!createSaveSlot(storage, 0, save)) throw new Error('Failed to create equipment QA fixture save.');
  return storage;
}

export function getEquipmentPageQaFillNames(options: EquipmentPageQaOptions): readonly string[] {
  return Object.values(encodeFixtureLoadout(options)).flatMap((entry) => entry ? [entry.fillName] : []);
}

function encodeFixtureLoadout(options: EquipmentPageQaOptions) {
  const loadout = createEmptyEquipmentLoadout();
  if (options.fixtureCase === 'empty') return encodeLoadout(loadout);
  for (const slot of Object.keys(loadout) as EquipmentSlot[]) {
    const fillName = findCompatibleFillName(options.roleId, slot);
    if (fillName) loadout[slot] = instance(fillName);
  }
  applyRepresentativeCase(loadout, options);
  return encodeLoadout(loadout);
}

function applyRepresentativeCase(
  loadout: ReturnType<typeof createEmptyEquipmentLoadout>,
  options: EquipmentPageQaOptions,
): void {
  const items = Object.values(EquipmentVisualCatalog);
  let fillName: string | undefined;
  if (options.fixtureCase === 'tooltip-instance') {
    loadout.weapon = instance('_clj', 3, { power: 234 });
    return;
  }
  if (options.fixtureCase === 'role4-shovel' || options.fixtureCase === 'role4-arrow') {
    fillName = items.find((item) => item.preview.mode === 'role4-dual-body-branch')?.fillName;
    if (fillName) loadout.armor = instance(fillName);
    if (options.fixtureCase === 'role4-arrow') {
      const weapon = items.find((item) => item.preview.role === 4 && item.slot === 'weapon'
        && [4, 5, 9, 998].includes(AuthoritativeEquipmentCatalog[item.fillName]?.showId ?? -1));
      if (weapon) loadout.weapon = instance(weapon.fillName);
    }
    return;
  }
  if (options.fixtureCase === 'role5-frame') {
    fillName = items.find((item) => item.preview.mode === 'role5-dynamic-fashion-layers'
      && item.slot === 'weapon')?.fillName;
  } else if (options.fixtureCase === 'character-520' || options.fixtureCase === 'character-521') {
    const characterId = options.fixtureCase === 'character-520' ? 520 : 521;
    fillName = items.find((item) => item.preview.resources?.some(
      (resource) => resource.characterId === characterId,
    ))?.fillName;
  } else if (options.fixtureCase === 'title') {
    fillName = items.find((item) => item.preview.mode === 'title-overlay' && item.fillName !== 'mksddf')?.fillName;
  } else if (options.fixtureCase === 'unchanged') {
    fillName = items.find((item) => item.preview.mode === 'no-head-preview-change')?.fillName;
  } else if (options.fixtureCase === 'fmtstx-defect') {
    fillName = 'fmtstx';
  } else if (options.fixtureCase === 'mksddf-defect') {
    fillName = 'mksddf';
  }
  if (!fillName) return;
  const definition = QaEquipmentRegistry[fillName];
  const slot = definition ? getEquipmentSlotForType(definition.type) : undefined;
  if (slot) loadout[slot] = instance(fillName);
}

function findCompatibleFillName(roleId: number, slot: EquipmentSlot): string | undefined {
  const heroName = HeroNamesById[roleId]!;
  const definitions = Object.values(QaEquipmentRegistry);
  return definitions.find((definition) => {
    if (getEquipmentSlotForType(definition.type) !== slot) return false;
    return canEquipInstance(createEmptyEquipmentLoadout(), instance(definition.fillName), heroName) === true;
  })?.fillName ?? definitions.find((definition) => getEquipmentSlotForType(definition.type) === slot)?.fillName;
}

function instance(
  fillName: string,
  strengthLevel?: number,
  baseStatsOverride?: EquipmentInstance['baseStatsOverride'],
): EquipmentInstance {
  return {
    kind: 'equipment',
    instanceId: `qa-${fillName}`,
    definition: QaEquipmentRegistry[fillName]!,
    quantity: 1,
    ...(strengthLevel ? { strengthLevel } : {}),
    ...(baseStatsOverride ? { baseStatsOverride } : {}),
  };
}

function encodeLoadout(loadout: ReturnType<typeof createEmptyEquipmentLoadout>) {
  return Object.fromEntries(Object.entries(loadout).map(([slot, value]) => [
    slot,
    value ? {
      fillName: value.definition.fillName,
      instanceId: value.instanceId,
      ...(value.strengthLevel ? { strengthLevel: value.strengthLevel } : {}),
      ...(value.baseStatsOverride ? { baseStatsOverride: value.baseStatsOverride } : {}),
    } : null,
  ])) as ReturnType<typeof createDefaultGameSave>['player1']['equipment'];
}

function createMemoryStorage(): SaveStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
}
