import type { PetBehaviorContext, PetBehaviorEvent, PetBehaviorSkillRequest } from './PetBehavior';
import type { PetCombatEntitySession } from './PetCombatEntitySession';
import type {
  PetCombatEntitySnapshot, PetCombatFrame, PetCombatReleaseReason,
  PetCombatSummonHandle, PetCombatSummonRequest,
} from './PetCombatTypes';
import type { PetOwnerSnapshot, PetSkillTarget } from './PetTypes';
import { requestPetMonkeyBasicAttack } from './PetMonkeyCombatSystem';
import { requestPetHorseBasicAttack } from './PetHorseCombatSystem';
import { DefaultGlobalSettings } from './GlobalSettingsSystem';

type ContextPorts = Readonly<{
  spawnSummon: (request: PetCombatSummonRequest, owner: Readonly<PetOwnerSnapshot>) => PetCombatSummonHandle;
  releaseSummon: (handle: PetCombatSummonHandle, reason: PetCombatReleaseReason) => void;
  summonSnapshots: () => readonly PetCombatEntitySnapshot[];
  emit: (event: PetBehaviorEvent) => void;
}>;

export function createPetCombatContext(
  session: PetCombatEntitySession,
  frame: PetCombatFrame,
  targets: readonly Readonly<PetSkillTarget>[],
  ports: ContextPorts,
): PetBehaviorContext {
  const requireLiveSession = (): void => {
    if (session.released) throw new Error(`Pet combat context is released: ${session.runtimeKey}`);
  };
  const requireProjectiles = () => {
    requireLiveSession();
    if (!frame.projectiles) {
      throw new Error(`Pet behavior ${session.pet.species}:${session.pet.form} requires projectiles.`);
    }
    return frame.projectiles;
  };
  const roster = session.parentRuntimeKey
    ? { pets: [session.pet], selectedIndex: 0, message: '' }
    : frame.roster;
  const castAt = (request: PetBehaviorSkillRequest, selected: readonly Readonly<PetSkillTarget>[]) => (
    request({
      roster, runtime: session.runtime, targets: selected, projectiles: requireProjectiles(),
      random: frame.random, actionToken: session.actionToken,
    })
  );
  return Object.freeze({
    pet: session.pet,
    owner: Object.freeze({ ...frame.owner }),
    runtime: Object.freeze({ ...session.runtime }),
    targets: Object.freeze([...targets]), target: session.target,
    actionToken: session.actionToken,
    parentRuntimeKey: session.parentRuntimeKey, sourcePetId: session.sourcePetId,
    deltaMs: frame.deltaMs, random: frame.random ?? Math.random,
    hostFps: frame.hostFps ?? DefaultGlobalSettings.frameRate,
    hostTick: session.hostTick,
    targetAcquiredThisFrame: session.targetAcquiredThisFrame,
    animation: session.animationSnapshot(),
    playAnimation: (action) => {
      requireLiveSession();
      session.playAnimation(action);
    },
    castSkill: (request) => castAt(request, targets),
    castSkillAt: (request, target) => castAt(request, [target]),
    castBasicAttack: () => {
      const projectiles = requireProjectiles();
      if (!session.target) throw new Error('Pet behavior basic attack requires an active runtime and target.');
      const params = {
        roster, runtime: session.runtime, target: session.target,
        actionToken: session.actionToken, projectiles, random: frame.random,
      };
      return session.pet.species === 'horse'
        ? requestPetHorseBasicAttack(params)
        : requestPetMonkeyBasicAttack(params);
    },
    relocate: (x, y) => {
      requireLiveSession();
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new Error('Pet behavior relocation requires a finite active runtime point.');
      }
      session.runtime.x = x;
      session.runtime.y = y;
    },
    spawnSummon: (request) => {
      requireLiveSession();
      if (session.phase !== 'alive') throw new Error('A dead-playing pet cannot summon.');
      return ports.spawnSummon(request, frame.owner);
    },
    releaseSummon: (handle, reason = 'dismissed') => ports.releaseSummon(handle, reason),
    summonSnapshots: () => session.released ? Object.freeze([]) : ports.summonSnapshots(),
    emit: (event) => {
      requireLiveSession();
      ports.emit(Object.freeze({ ...event }));
    },
  });
}
