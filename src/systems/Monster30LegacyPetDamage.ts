import { resolveHitOnce, type HitRegistry } from './CombatSystem';
import { monster30AttackHits, type Monster30AttackHost } from './Monster30AttackRuntime';
import { monster30PetTargetProfile } from './Monster30CollisionSystem';
import { applyPetPhoenixNpIncomingDamage } from './PetPhoenixSkillSystem';
import { recordIncomingDamageFeedback, type IncomingDamageFeedbackTarget } from './IncomingDamageFeedbackSystem';
import type { PetRuntimeModel, PetState } from './PetTypes';

/** Compatibility pets retain their existing roster/runtime owner and Phoenix defense. */
export function applyMonster30LegacyPetDamage(host: Monster30AttackHost, pet: PetState,
  runtime: PetRuntimeModel, registry: HitRegistry, timeMs: number,
  feedback?: IncomingDamageFeedbackTarget): void {
  if (pet.hp <= 0 || !pet.isActive || pet.id !== runtime.petId) return;
  const profile = monster30PetTargetProfile(pet.species, pet.form);
  for (const attack of host.attackRuntime?.detections ?? []) {
    if (!monster30AttackHits(attack, profile, runtime.x, runtime.y)) continue;
    if (!resolveHitOnce(registry, attack.attackId, runtime.runtimeKey)) continue;
    const before = pet.hp, amount = Math.max(1, Math.floor(attack.damage - Math.max(0, pet.def)));
    if (pet.species === 'phoenix') applyPetPhoenixNpIncomingDamage(pet, amount);
    else pet.hp = Math.max(0, pet.hp - amount);
    if (feedback) recordIncomingDamageFeedback({ ...feedback, targetKind: 'pet',
      targetId: pet.id, targetRuntimeId: runtime.runtimeKey, worldAnchor: () => runtime }, {
      sourceId: attack.sourceId, attackId: attack.attackId, producerKind: 'pet-reduce-hp',
      occurredAtMs: timeMs, settledAtMs: timeMs, settledDamage: before - pet.hp,
      hpBefore: before, hpAfter: pet.hp });
    if (pet.hp <= 0) return;
  }
}
