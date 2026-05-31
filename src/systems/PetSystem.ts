export type PetId = string;

export type PetState = {
  id: PetId;
  species: string;
  form: number;
  displayName: string;
  level: number;
  exp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  moveSpeed: number;
  lifetime: number;
  quality: number;
  perception: number;
  technique: number;
  warpower: number;
  isActive: boolean;
  skills: string[];
  magicFlowerBuff?: PetMagicFlowerBuff;
};

export type PetMagicFlowerBuff = {
  kind: 'magicFlowerAddBuff';
  sourceName: string;
  attackMultiplier: number;
  totalMs: number;
  remainingMs: number;
};

export type PetRoster = {
  pets: PetState[];
  selectedIndex: number;
  message: string;
};

export type PetRuntimeState = 'idle' | 'follow' | 'warp';

export type PetRuntimeModel = {
  petId: PetId;
  x: number;
  y: number;
  facingX: -1 | 1;
  state: PetRuntimeState;
};

export type CapturableMonsterId =
  | 'Monster70'
  | 'Monster71'
  | 'Monster72'
  | 'Monster73'
  | 'Monster74'
  | 'Monster75'
  | 'Monster76'
  | 'Monster77'
  | 'Monster78';

export type CapturablePetDefinition = {
  monsterId: CapturableMonsterId;
  petName: string;
  displayName: string;
  species: string;
  form: number;
  probability: number;
};

export type CapturablePetTarget = {
  id: string;
  monsterId: CapturableMonsterId;
  x: number;
  y: number;
  width: number;
  height: number;
  level: number;
  removed: boolean;
  feedback: string;
};

export type MagicBottleEffect = {
  x: number;
  y: number;
  width: number;
  height: number;
  facingX: -1 | 1;
  ageMs: number;
};

export type MagicBottleCaptureModel = {
  equippedFillName: 'xhhl';
  soul: number;
  effect?: MagicBottleEffect;
  lastResult: string;
};

export type PetConsumableFillName = 'wphhd' | 'wpcsd' | 'djyys';

export type PetConsumableResult = {
  ok: boolean;
  shouldConsume: boolean;
  message: string;
  pet?: PetState;
};

export type PetOwnerSnapshot = {
  x: number;
  y: number;
  facingX: -1 | 1;
};

export const PetTuning = {
  maxSeats: 10,
  followMinDistance: 64,
  followOffsetX: 58,
  followOffsetY: 18,
  warpDistance: 1000,
  warpOffsetY: -30,
  magicBottleSoulCost: 5000,
  magicBottleEffectOffsetX: 70,
  magicBottleEffectWidth: 112,
  magicBottleEffectHeight: 86,
  magicBottleEffectLifetimeMs: 2_000,
  petLifetimeRecover: 20,
  petExperienceStoneExp: 30_000,
} as const;

export const CapturablePetDefinitions: Record<CapturableMonsterId, CapturablePetDefinition> = {
  Monster70: createCapturablePetDefinition('Monster70', 'horse1', '小马', 'horse', 1, 0.4),
  Monster71: createCapturablePetDefinition('Monster71', 'horse2', '小马', 'horse', 2, 0.7),
  Monster72: createCapturablePetDefinition('Monster72', 'monkey1', '小猴', 'monkey', 1, 0.4),
  Monster73: createCapturablePetDefinition('Monster73', 'monkey2', '小猴', 'monkey', 2, 0.7),
  Monster74: createCapturablePetDefinition('Monster74', 'tigress1', '小虎', 'tigress', 1, 0.4),
  Monster75: createCapturablePetDefinition('Monster75', 'turtle1', '小龟', 'turtle', 1, 0.4),
  Monster76: createCapturablePetDefinition('Monster76', 'phoenix1', '小雀', 'phoenix', 1, 0.4),
  Monster77: createCapturablePetDefinition('Monster77', 'dragon1', '小龙', 'dragon', 1, 0.4),
  Monster78: createCapturablePetDefinition('Monster78', 'rabbit1', '小兔', 'rabbit', 1, 0.4),
};

export function createSeedPetRoster(): PetRoster {
  return {
    pets: [
      {
        id: 'pet-monkey-1',
        species: 'monkey',
        form: 1,
        displayName: '小猴',
        level: 1,
        exp: 0,
        hp: 180,
        maxHp: 180,
        mp: 150,
        maxMp: 150,
        atk: 20,
        def: 6,
        moveSpeed: 5,
        lifetime: 100,
        quality: 1,
        perception: 1,
        technique: 1,
        warpower: 1,
        isActive: true,
        skills: ['tsml'],
      },
    ],
    selectedIndex: 0,
    message: 'Pet ready',
  };
}

export function createMagicBottleCaptureModel(initialSoul = 8_000): MagicBottleCaptureModel {
  return {
    equippedFillName: 'xhhl',
    soul: initialSoul,
    lastResult: 'xhhl ready',
  };
}

export function getSelectedPet(roster: PetRoster): PetState | undefined {
  return roster.pets[roster.selectedIndex];
}

export function getActivePet(roster: PetRoster): PetState | undefined {
  return roster.pets.find((pet) => pet.isActive && pet.lifetime > 0);
}

export function getCurrentPet(roster: PetRoster): PetState | undefined {
  return roster.pets.find((pet) => pet.isActive);
}

export function selectPet(roster: PetRoster, direction: 1 | -1): void {
  if (roster.pets.length === 0) {
    roster.selectedIndex = 0;
    roster.message = 'No pets';
    return;
  }

  roster.selectedIndex =
    (roster.selectedIndex + direction + roster.pets.length) % roster.pets.length;
  roster.message = `Selected ${roster.pets[roster.selectedIndex].displayName}`;
}

export function setSelectedPetActive(roster: PetRoster): boolean {
  const selected = getSelectedPet(roster);
  if (!selected) {
    roster.message = 'No pet selected';
    return false;
  }

  if (selected.hp <= 0) {
    roster.message = `${selected.displayName} needs rest`;
    return false;
  }

  if (selected.lifetime <= 0) {
    roster.message = `${selected.displayName} has no lifetime`;
    return false;
  }

  for (const pet of roster.pets) {
    pet.isActive = pet.id === selected.id;
  }
  roster.message = `${selected.displayName} deployed`;
  return true;
}

export function restSelectedPet(roster: PetRoster): boolean {
  const selected = getSelectedPet(roster);
  if (!selected) {
    roster.message = 'No pet selected';
    return false;
  }

  selected.isActive = false;
  roster.message = `${selected.displayName} resting`;
  return true;
}

export function toggleSelectedPetActive(roster: PetRoster): boolean {
  const selected = getSelectedPet(roster);
  if (!selected) {
    roster.message = 'No pet selected';
    return false;
  }

  return selected.isActive ? restSelectedPet(roster) : setSelectedPetActive(roster);
}

export function catchNewPet(
  roster: PetRoster,
  petName: string,
  level = 1,
): PetState | undefined {
  if (roster.pets.length >= PetTuning.maxSeats) {
    roster.message = '宠物栏已满！';
    return undefined;
  }

  const definition = findCapturablePetDefinitionByPetName(petName);
  const pet = createPetStateFromDefinition(
    definition ?? createFallbackPetDefinition(petName),
    level,
    roster.pets.length + 1,
  );
  roster.pets.push(pet);
  roster.selectedIndex = roster.pets.length - 1;
  roster.message = `捕捉成功：${pet.displayName}`;
  return pet;
}

export function requestMagicBottleCapture(params: {
  model: MagicBottleCaptureModel;
  owner: PetOwnerSnapshot;
  inputMagicWeapon: boolean;
  previousInputMagicWeapon: boolean;
}): boolean {
  if (!params.inputMagicWeapon || params.previousInputMagicWeapon) {
    return false;
  }

  if (params.model.soul < PetTuning.magicBottleSoulCost) {
    params.model.lastResult = '灵魂不足5000，无法捕捉！';
    params.model.effect = undefined;
    return false;
  }

  params.model.effect = {
    x: params.owner.x + params.owner.facingX * PetTuning.magicBottleEffectOffsetX,
    y: params.owner.y - 54,
    width: PetTuning.magicBottleEffectWidth,
    height: PetTuning.magicBottleEffectHeight,
    facingX: params.owner.facingX,
    ageMs: 0,
  };
  params.model.lastResult = '宣花葫芦投掷';
  return true;
}

export function updateMagicBottleCapture(
  model: MagicBottleCaptureModel,
  deltaMs: number,
): void {
  if (!model.effect) {
    return;
  }

  model.effect.ageMs += deltaMs;
  if (model.effect.ageMs >= PetTuning.magicBottleEffectLifetimeMs) {
    model.effect = undefined;
    model.lastResult = '宣花葫芦待机';
  }
}

export function resolveMagicBottleCaptureHit(params: {
  model: MagicBottleCaptureModel;
  roster: PetRoster;
  targets: readonly CapturablePetTarget[];
  random?: () => number;
}): CapturablePetTarget | undefined {
  const effect = params.model.effect;
  if (!effect) {
    return undefined;
  }

  const target = params.targets.find((candidate) =>
    !candidate.removed && rectanglesOverlap(effect, candidate)
  );
  if (!target) {
    return undefined;
  }

  const definition = CapturablePetDefinitions[target.monsterId];
  params.model.soul = Math.max(0, params.model.soul - PetTuning.magicBottleSoulCost);
  params.model.effect = undefined;

  if ((params.random ?? Math.random)() > definition.probability) {
    target.feedback = '捕捉失败！';
    params.model.lastResult = `捕捉失败！${definition.petName}`;
    return target;
  }

  const pet = catchNewPet(params.roster, definition.petName, target.level);
  if (!pet) {
    target.feedback = '宠物栏已满！';
    params.model.lastResult = '宠物栏已满！';
    return target;
  }

  target.removed = true;
  target.feedback = '捕捉成功！';
  params.model.lastResult = `捕捉成功！${pet.displayName}`;
  return target;
}

export function isPetConsumableFillName(fillName: string): fillName is PetConsumableFillName {
  return fillName === 'wphhd' || fillName === 'wpcsd' || fillName === 'djyys';
}

export function usePetConsumable(
  roster: PetRoster,
  fillName: PetConsumableFillName,
): PetConsumableResult {
  const pet = getCurrentPet(roster);
  if (!pet) {
    const message = '没有出战宠物，不能使用宠物道具';
    roster.message = message;
    return { ok: false, shouldConsume: false, message };
  }

  if (fillName === 'wpcsd') {
    const before = pet.lifetime;
    pet.lifetime = Math.min(100, pet.lifetime + PetTuning.petLifetimeRecover);
    const message = `${pet.displayName} 寿命 ${before}->${pet.lifetime}`;
    roster.message = message;
    return { ok: true, shouldConsume: true, message, pet };
  }

  if (fillName === 'wphhd') {
    pet.hp = pet.maxHp;
    pet.mp = pet.maxMp;
    pet.lifetime = Math.max(1, pet.lifetime);
    const message = `${pet.displayName} 状态已恢复`;
    roster.message = message;
    return { ok: true, shouldConsume: true, message, pet };
  }

  pet.exp += PetTuning.petExperienceStoneExp;
  const message = `${pet.displayName} 经验 +${PetTuning.petExperienceStoneExp}`;
  roster.message = message;
  return { ok: true, shouldConsume: true, message, pet };
}

export function createPetRuntime(
  pet: PetState,
  owner: PetOwnerSnapshot,
): PetRuntimeModel {
  return {
    petId: pet.id,
    x: owner.x - owner.facingX * PetTuning.followOffsetX,
    y: owner.y + PetTuning.warpOffsetY,
    facingX: owner.facingX,
    state: 'idle',
  };
}

export function syncPetRuntimeWithRoster(
  roster: PetRoster,
  runtime: PetRuntimeModel | undefined,
  owner: PetOwnerSnapshot,
): PetRuntimeModel | undefined {
  const activePet = getActivePet(roster);
  if (!activePet) {
    return undefined;
  }

  if (!runtime || runtime.petId !== activePet.id) {
    return createPetRuntime(activePet, owner);
  }

  return runtime;
}

export function updatePetRuntime(
  runtime: PetRuntimeModel,
  pet: PetState,
  owner: PetOwnerSnapshot,
  deltaMs: number,
): void {
  const desiredX = owner.x - owner.facingX * PetTuning.followOffsetX;
  const desiredY = owner.y - PetTuning.followOffsetY;
  const dx = desiredX - runtime.x;
  const dy = desiredY - runtime.y;
  const distance = Math.hypot(dx, dy);

  runtime.facingX = dx < 0 ? -1 : dx > 0 ? 1 : owner.facingX;

  if (distance >= PetTuning.warpDistance) {
    runtime.x = owner.x;
    runtime.y = owner.y + PetTuning.warpOffsetY;
    runtime.state = 'warp';
    return;
  }

  if (distance <= PetTuning.followMinDistance) {
    runtime.state = 'idle';
    return;
  }

  const speedPxPerSecond = pet.moveSpeed * 90;
  const step = Math.min(distance, speedPxPerSecond * (deltaMs / 1000));
  runtime.x += (dx / distance) * step;
  runtime.y += (dy / distance) * step;
  runtime.state = 'follow';
}

export function applyPetMagicFlowerBuff(
  pet: PetState,
  buff: PetMagicFlowerBuff,
): void {
  pet.magicFlowerBuff = {
    ...buff,
    attackMultiplier: Math.max(1, buff.attackMultiplier),
    totalMs: Math.max(0, buff.totalMs),
    remainingMs: Math.max(0, buff.remainingMs),
  };
}

export function clearPetMagicFlowerBuff(pet: PetState): void {
  pet.magicFlowerBuff = undefined;
}

export function buildPetPanelLines(roster: PetRoster): string[] {
  const lines: string[] = [];
  const selected = getSelectedPet(roster);
  const active = getActivePet(roster);

  lines.push(`══ PETS ${roster.pets.length}/${PetTuning.maxSeats} ══`);
  lines.push(`Active: ${active ? active.displayName : '-'}`);
  lines.push(`Message: ${roster.message}`);
  lines.push('');
  lines.push('List');

  if (roster.pets.length === 0) {
    lines.push('  - empty -');
  } else {
    for (let i = 0; i < roster.pets.length; i += 1) {
      const pet = roster.pets[i];
      const pointer = i === roster.selectedIndex ? '▶' : ' ';
      const activeMark = pet.isActive ? '(出战)' : '';
      lines.push(
        `${pointer}${pet.displayName}${activeMark} Lv.${pet.level} HP ${pet.hp}/${pet.maxHp} Life ${pet.lifetime}/100`,
      );
    }
  }

  lines.push('');
  lines.push('Selected');
  if (selected) {
    lines.push(`Species: ${selected.species}${selected.form}  Quality:${selected.quality}`);
    lines.push(`MP ${selected.mp}/${selected.maxMp}  ATK ${selected.atk}  DEF ${selected.def}`);
    lines.push(`EXP ${selected.exp}`);
    lines.push(`悟 ${selected.perception}  技 ${selected.technique}  战 ${selected.warpower}`);
    lines.push(`Skills: ${selected.skills.length > 0 ? selected.skills.join(', ') : '-'}`);
  } else {
    lines.push('-');
  }

  lines.push('');
  lines.push('[↑/↓] select  [Enter] 出战/休息  [B] close');
  return lines;
}

function createCapturablePetDefinition(
  monsterId: CapturableMonsterId,
  petName: string,
  displayName: string,
  species: string,
  form: number,
  probability: number,
): CapturablePetDefinition {
  return { monsterId, petName, displayName, species, form, probability };
}

function findCapturablePetDefinitionByPetName(
  petName: string,
): CapturablePetDefinition | undefined {
  return Object.values(CapturablePetDefinitions).find((definition) =>
    definition.petName === petName
  );
}

function createFallbackPetDefinition(petName: string): CapturablePetDefinition {
  const form = Number.parseInt(petName.match(/\d+$/)?.[0] ?? '1', 10);
  const species = petName.replace(/\d+$/, '') || petName;
  return createCapturablePetDefinition('Monster72', petName, petName, species, form, 1);
}

function createPetStateFromDefinition(
  definition: CapturablePetDefinition,
  level: number,
  serial: number,
): PetState {
  const normalizedLevel = Math.max(1, Math.floor(level));
  const maxHp = 160 + normalizedLevel * 20;
  const maxMp = 120 + normalizedLevel * 12;

  return {
    id: `pet-${definition.petName}-${serial}`,
    species: definition.species,
    form: definition.form,
    displayName: definition.displayName,
    level: normalizedLevel,
    exp: 0,
    hp: maxHp,
    maxHp,
    mp: maxMp,
    maxMp,
    atk: 16 + normalizedLevel * 4,
    def: 5 + normalizedLevel,
    moveSpeed: 5,
    lifetime: 100,
    quality: normalizedLevel === 1 ? 1 : 2,
    perception: 1,
    technique: 1,
    warpower: 1,
    isActive: false,
    skills: ['tsml'],
  };
}

function rectanglesOverlap(
  effect: MagicBottleEffect,
  target: CapturablePetTarget,
): boolean {
  const effectLeft = effect.x - effect.width / 2;
  const effectRight = effect.x + effect.width / 2;
  const effectTop = effect.y - effect.height / 2;
  const effectBottom = effect.y + effect.height / 2;
  const targetLeft = target.x - target.width / 2;
  const targetRight = target.x + target.width / 2;
  const targetTop = target.y - target.height / 2;
  const targetBottom = target.y + target.height / 2;

  return effectLeft <= targetRight &&
    effectRight >= targetLeft &&
    effectTop <= targetBottom &&
    effectBottom >= targetTop;
}
