import type { EquipmentDefinition } from './EquipmentSystem';
import {
  addEquipmentByFillName,
  addStackByFillName,
  type InventoryStore,
} from './InventorySystem';

export type DropBigType = 'zb' | 'dj';

export type DropTableEntry = {
  fillName: string;
  bigType: DropBigType;
  quantity?: number;
};

export type MedicineDropType = 'SmallHP' | 'BigHP' | 'SmallMP';

export type MedicineDropDefinition = {
  type: MedicineDropType;
  cname: 'SHp' | 'BHp' | 'SMp';
  label: string;
  restoreTarget: 'hp' | 'mp';
  restoreRatio: number;
  color: number;
};

export type WorldDropState = 'idle' | 'picked';

type BaseWorldDrop = {
  id: string;
  serial: number;
  x: number;
  y: number;
  spawnY: number;
  settleY: number;
  state: WorldDropState;
  ageMs: number;
  pickupElapsedMs: number;
  pickupStartY: number;
  feedback: string;
};

export type ItemWorldDrop = BaseWorldDrop & {
  kind: 'item';
  fillName: string;
  bigType: DropBigType;
  quantity: number;
};

export type MedicineWorldDrop = BaseWorldDrop & {
  kind: 'medicine';
  fillName: MedicineDropType;
  bigType: 'medicine';
  quantity: 1;
  medicine: MedicineDropDefinition;
};

export type WorldDrop = ItemWorldDrop | MedicineWorldDrop;

export type DropSystemModel = {
  drops: WorldDrop[];
  nextDropSerial: number;
  lastMessage: string;
};

export type DropPickupResult = {
  ok: boolean;
  message: string;
  drop: ItemWorldDrop;
};

export type MedicinePickupResult = {
  ok: boolean;
  message: string;
  drop: MedicineWorldDrop;
  target: 'hp' | 'mp';
  before: number;
  after: number;
  amount: number;
};

export const DropTuning = {
  spawnOffsetY: -100,
  fallSpeed: 360,
  pickupFadeMs: 650,
  pickupFloatY: 58,
  pickupWidth: 76,
  pickupHeight: 92,
  medicineLifetimeMs: 60_000,
} as const;

export const Monster30DropEntries: readonly DropTableEntry[] = [
  { fillName: 'ptdcz', bigType: 'zb' },
  { fillName: 'sms1', bigType: 'dj', quantity: 1 },
];

export const MedicineDropDefinitions: Record<MedicineDropType, MedicineDropDefinition> = {
  SmallHP: {
    type: 'SmallHP',
    cname: 'SHp',
    label: 'Small HP',
    restoreTarget: 'hp',
    restoreRatio: 0.25,
    color: 0xe3646d,
  },
  BigHP: {
    type: 'BigHP',
    cname: 'BHp',
    label: 'Big HP',
    restoreTarget: 'hp',
    restoreRatio: 0.5,
    color: 0xf0898e,
  },
  SmallMP: {
    type: 'SmallMP',
    cname: 'SMp',
    label: 'Small MP',
    restoreTarget: 'mp',
    restoreRatio: 0.25,
    color: 0x74c0fc,
  },
};

export function createDropSystem(): DropSystemModel {
  return {
    drops: [],
    nextDropSerial: 1,
    lastMessage: 'drop: none',
  };
}

export function spawnWorldDrop(
  model: DropSystemModel,
  entry: DropTableEntry,
  x: number,
  monsterY: number,
  settleY: number,
): WorldDrop {
  const spawnY = monsterY + DropTuning.spawnOffsetY;
  const drop: WorldDrop = {
    id: `drop-${model.nextDropSerial}`,
    serial: model.nextDropSerial,
    kind: 'item',
    fillName: entry.fillName,
    bigType: entry.bigType,
    quantity: entry.quantity ?? 1,
    x,
    y: spawnY,
    spawnY,
    settleY: Math.max(spawnY, settleY),
    state: 'idle',
    ageMs: 0,
    pickupElapsedMs: 0,
    pickupStartY: spawnY,
    feedback: '',
  };
  model.nextDropSerial += 1;
  model.drops.push(drop);
  model.lastMessage = `掉落 ${drop.fillName}`;
  return drop;
}

export function spawnMedicineDrop(
  model: DropSystemModel,
  type: MedicineDropType,
  x: number,
  monsterY: number,
  settleY: number,
): MedicineWorldDrop {
  const spawnY = monsterY + DropTuning.spawnOffsetY;
  const medicine = MedicineDropDefinitions[type];
  const drop: MedicineWorldDrop = {
    id: `drop-${model.nextDropSerial}`,
    serial: model.nextDropSerial,
    kind: 'medicine',
    fillName: type,
    bigType: 'medicine',
    quantity: 1,
    medicine,
    x,
    y: spawnY,
    spawnY,
    settleY: Math.max(spawnY, settleY),
    state: 'idle',
    ageMs: 0,
    pickupElapsedMs: 0,
    pickupStartY: spawnY,
    feedback: '',
  };
  model.nextDropSerial += 1;
  model.drops.push(drop);
  model.lastMessage = `掉落 ${medicine.label}`;
  return drop;
}

export function maybeSpawnMedicineDrop(
  model: DropSystemModel,
  x: number,
  monsterY: number,
  settleY: number,
  random: () => number = Math.random,
): MedicineWorldDrop | undefined {
  const type = rollMedicineDropType(random);
  if (!type) {
    return undefined;
  }

  return spawnMedicineDrop(model, type, x, monsterY, settleY);
}

export function rollMedicineDropType(
  random: () => number = Math.random,
): MedicineDropType | undefined {
  if (random() >= 0.5) {
    const hpRoll = random();
    if (hpRoll <= 0.2) {
      if (hpRoll <= 0.1) {
        return random() >= 0.55 ? 'SmallHP' : 'BigHP';
      }
      return 'SmallHP';
    }
  } else if (random() <= 0.25) {
    return 'SmallMP';
  }

  return undefined;
}

export function updateWorldDrops(model: DropSystemModel, deltaMs: number): void {
  for (const drop of model.drops) {
    drop.ageMs += deltaMs;
    if (drop.state === 'idle') {
      drop.y = Math.min(drop.settleY, drop.y + DropTuning.fallSpeed * (deltaMs / 1000));
    } else {
      drop.pickupElapsedMs += deltaMs;
      const progress = Math.min(drop.pickupElapsedMs / DropTuning.pickupFadeMs, 1);
      drop.y = drop.pickupStartY - DropTuning.pickupFloatY * progress;
    }
  }

  model.drops = model.drops.filter(
    (drop) =>
      (drop.state === 'idle' &&
        (drop.kind === 'item' || drop.ageMs < DropTuning.medicineLifetimeMs)) ||
      (drop.state !== 'idle' && drop.pickupElapsedMs < DropTuning.pickupFadeMs),
  );
}

export function pickupWorldDrop(
  model: DropSystemModel,
  drop: ItemWorldDrop,
  store: InventoryStore,
  registry: Record<string, EquipmentDefinition>,
): DropPickupResult {
  if (drop.state !== 'idle') {
    return { ok: false, message: '掉落已经拾取中', drop };
  }

  const definition = registry[drop.fillName];
  if (!definition) {
    const message = `缺少掉落定义 ${drop.fillName}`;
    model.lastMessage = message;
    return { ok: false, message, drop };
  }

  if (drop.bigType === 'zb') {
    const instance = addEquipmentByFillName(store, registry, drop.fillName);
    if (!instance) {
      const message = `装备背包已满，无法拾取 ${definition.name}`;
      model.lastMessage = message;
      return { ok: false, message, drop };
    }
  } else {
    const stack = addStackByFillName(store, registry, drop.fillName, drop.quantity);
    if (!stack) {
      const message = `道具背包已满，无法拾取 ${definition.name}`;
      model.lastMessage = message;
      return { ok: false, message, drop };
    }
  }

  const message = drop.quantity > 1
    ? `拾取 ${definition.name} x${drop.quantity}`
    : `拾取 ${definition.name}`;
  markDropPicked(drop, message);
  model.lastMessage = message;
  return { ok: true, message, drop };
}

export function pickupMedicineDrop(params: {
  model: DropSystemModel;
  drop: MedicineWorldDrop;
  currentHp: number;
  maxHp: number;
  currentMp: number;
  maxMp: number;
}): MedicinePickupResult {
  const { drop } = params;
  if (drop.state !== 'idle') {
    return {
      ok: false,
      message: '药品已经拾取中',
      drop,
      target: drop.medicine.restoreTarget,
      before: 0,
      after: 0,
      amount: 0,
    };
  }

  const target = drop.medicine.restoreTarget;
  const maxValue = target === 'hp' ? params.maxHp : params.maxMp;
  const before = target === 'hp' ? params.currentHp : params.currentMp;
  const amount = Math.floor(maxValue * drop.medicine.restoreRatio);
  const after = Math.min(maxValue, before + amount);
  const message = `${drop.medicine.label} ${target.toUpperCase()} ${before}->${after}`;

  markDropPicked(drop, message);
  params.model.lastMessage = message;
  return {
    ok: true,
    message,
    drop,
    target,
    before,
    after,
    amount: after - before,
  };
}

export function getWorldDrops(model: DropSystemModel): readonly WorldDrop[] {
  return model.drops;
}

export function getDropPickupAlpha(drop: WorldDrop): number {
  if (drop.state === 'idle') {
    return 1;
  }

  return Math.max(0, 1 - drop.pickupElapsedMs / DropTuning.pickupFadeMs);
}

function markDropPicked(drop: WorldDrop, message: string): void {
  drop.state = 'picked';
  drop.pickupElapsedMs = 0;
  drop.pickupStartY = drop.y;
  drop.feedback = message;
}
