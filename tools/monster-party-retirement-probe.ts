import { monster3AttackHits, monster3AttackRequest, type Monster3Attack } from '../src/systems/Monster3AttackRuntime';
import { monster3TargetProfile } from '../src/systems/Monster3CollisionSystem';
import { checkMonsterAttackReception } from '../src/systems/MonsterAttackReception';
import { readPetReceptionBody } from '../src/systems/PetReceptionBodyOwner';

/** Controlled collision placement in the loaded production Scene; not natural AI reachability. */
export function probePartyRetirement(p: any) {
  const rows = [];
  for (const slot of ['p1', 'p2'] as const) {
    const member = p.model.members.find((m: any) => m.combat.slot === slot);
    const pet = p.petRosters[slot].pets.find((x: any) => x.isActive);
    const pose = p.runtime.petSnapshots()[slot]?.runtime ?? p.runtime.compatibilityPetRuntime(slot);
    if (!pose) throw Error('Scene must have a real current pet');
    const body = readPetReceptionBody(p.runtime.compatibilityPetRuntime(slot));
    const source = pet.species === 'ufo' ? 'Kabu' : 'Monkey';
    const attack: Monster3Attack = { id: `retire-${slot}`, action: 'hit1', x: pose.x, y: pose.y,
      facingX: -1, frame: 3, age: 3, parentId: p.scene.scene.key,
      source: { boss: true, hit: 0, criticalPercent: 0, magicDefenseReduction: 0, flower: false, random: () => 0.9 },
      reception: { prefix: `retire-${slot}:`, serial: 1, count: 0, remaining: 99, interval: 999 } };
    member.movement.x = pose.x; member.movement.y = pose.y + 50;
    Object.assign(member.combat.combat, { hp: 1, state: 'ready', invulnerableUntilMs: 0, magicInvulnerability: undefined, magicShield: undefined });
    Object.assign(member.combat.effectiveStats, { defense: 0, missPercent: 0 });
    let found = false;
    for (let dx = -150; dx <= 150 && !found; dx += 5) for (let dy = -150; dy <= 150; dy += 5) {
      attack.x = pose.x + dx; attack.y = pose.y + dy;
      if (monster3AttackHits(attack, monster3TargetProfile(`Role${member.combat.normalAttack.heroId}`), pose.x, pose.y)
        && monster3AttackHits(attack, monster3TargetProfile(`Pet${source}${pet.form}`), pose.x, pose.y)) {
        found = true; break;
      }
    }
    if (!found) throw Error('No controlled common overlap');
    const pairs = p.runtime.monster3Targets(attack), pair = pairs[slot === 'p1' ? 0 : 1];
    if (!pair.pet) throw Error('Actual party must expose current target');
    const hp = pet.hp, life = pet.lifetime;
    const otherSlot = slot === 'p1' ? 'p2' : 'p1';
    const otherBefore = p.runtime.petSnapshots()[otherSlot]?.runtime?.runtimeKey ?? p.runtime.compatibilityPetRuntime(otherSlot)?.runtimeKey;
    const request = { ...monster3AttackRequest(attack, p.scene.time.now, p.scene.game.loop.targetFps, 0), power: 29 };
    checkMonsterAttackReception(attack.reception, request, [pair]);
    rows.push({ slot, heroHp: member.combat.combat.hp, petHpUnchanged: pet.hp === hp,
      lifeUnchanged: pet.lifetime === life, remaining: attack.reception.remaining,
      sessionGone: !p.runtime.petSnapshots()[slot]?.runtime, compatibilityGone: !p.runtime.compatibilityPetRuntime(slot),
      bodyReleased: !body || body.snapshot().phase === 'released',
      staleRejected: !pair.pet.receive({ ...request, attackId: 'stale' }).accepted,
      otherPreserved: otherBefore === (p.runtime.petSnapshots()[otherSlot]?.runtime?.runtimeKey ?? p.runtime.compatibilityPetRuntime(otherSlot)?.runtimeKey),
    });
  }
  return rows;
}
