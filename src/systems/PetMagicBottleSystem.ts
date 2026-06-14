import { CapturablePetDefinitions, PetTuning } from './PetTuning';
import { catchNewPet } from './PetRosterSystem';
import type {
  CapturablePetTarget,
  MagicBottleCaptureModel,
  MagicBottleEffect,
  PetOwnerSnapshot,
  PetRoster,
} from './PetTypes';
export function createMagicBottleCaptureModel(initialSoul = 8_000): MagicBottleCaptureModel {
  return {
    equippedFillName: 'xhhl',
    soul: initialSoul,
    lastResult: 'xhhl ready',
  };
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

