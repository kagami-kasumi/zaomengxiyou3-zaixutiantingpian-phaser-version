import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { createHeroCombat, applyHeroMagicShield, type HeroMagicShieldKind } from '../src/systems/HeroCombatSystem';
import { createDamageEvent } from '../src/systems/CombatSystem';
import type { PlayerSlot } from '../src/systems/InputSystem';

// Frozen source-derived expectations, not calculated through production formulas.
// BaseHero:795..823; Role3:1201..1222; BaseAddEffect:2711..2755.
export const settlementCases = [
  { id: 'transfer-101', heroHp: 105, petHp: 194 },
  { id: 'invulnerable', protection: true, heroHp: 200, petHp: 200, accepted: false },
  { id: 'magic-invulnerable', magicProtection: true, heroHp: 200, petHp: 200, accepted: false },
  { id: 'dead-hero', initialHp: 0, heroHp: 0, petHp: 200, accepted: false },
  { id: 'full-shield', shield: 200, heroHp: 200, petHp: 200, shieldAfter: 99 },
  { id: 'exact-shield', shield: 101, heroHp: 200, petHp: 200 },
  { id: 'overflow-shield', shield: 50, heroHp: 152, petHp: 197 },
  { id: 'tjgl-overflow', shield: 50, shieldKind: 'role2Tjgl', heroHp: 152, petHp: 197 },
  { id: 'role3-sd1', reduction: .01, heroHp: 106, petHp: 195 },
  { id: 'role3-no-link', reduction: .01, expired: true, heroHp: 101, petHp: 200 },
  { id: 'role3-sd8', reduction: .08, heroHp: 113, petHp: 195 },
  { id: 'role3-overflow', reduction: .01, shield: 50, heroHp: 155, petHp: 197 },
  { id: 'role3-exact-shield', reduction: .01, shield: 99, heroHp: 200, petHp: 200 },
  { id: 'zero', amount: 0, heroHp: 200, petHp: 200 },
  { id: 'lethal-hero', initialHp: 30, heroHp: 0, petHp: 194 },
  { id: 'lethal-pet', initialPetHp: 3, heroHp: 105, petHp: 0 },
  { id: 'dead-pet', initialPetHp: 0, heroHp: 99, petHp: 0 },
  { id: 'expired-link', expired: true, heroHp: 99, petHp: 200 },
] satisfies SettlementCase[];

export type SettlementCase = {
  id: string; amount?: number; initialHp?: number; initialPetHp?: number;
  reduction?: number; shield?: number; shieldKind?: HeroMagicShieldKind;
  protection?: boolean; magicProtection?: boolean; expired?: boolean;
  heroHp: number; petHp: number; accepted?: boolean; shieldAfter?: number;
};

export function createSettlementFixture(row: SettlementCase, slot: PlayerSlot) {
  const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
  const pets = (['p1', 'p2'] as const).map(owner => {
    for (const pet of rosters[owner].pets) pet.isActive = false;
    const pet = rosters[owner].pets.find(p => p.id === (owner === 'p1' ? 'pet-turtle-2' : 'p2-pet-turtle-2'))!;
    pet.isActive = true;
    pet.hp = owner === slot ? row.initialPetHp ?? 200 : 200;
    pet.skillState!.turtle2Txlj.linkRemainingMs = row.expired && owner === slot ? 0 : 1000;
    return pet;
  });
  const hero = createHeroCombat(slot);
  hero.hp = row.initialHp ?? 200;
  hero.maxHp = 200;
  if (hero.hp === 0) hero.state = 'dead';
  if (row.protection) hero.invulnerableUntilMs = 1000;
  if (row.magicProtection) hero.magicInvulnerability = { sourceName: 'fixture', totalMs: 1000, remainingMs: 1000 };
  hero.role3DamageReduction = row.reduction;
  if (row.shield !== undefined) applyHeroMagicShield(hero, {
    kind: row.shieldKind ?? 'magicUmbrellaDefend', sourceName: 'fixture',
    initialAmount: row.shield, remainingAmount: row.shield, totalMs: 1000, remainingMs: 1000,
  });
  const event = createDamageEvent({ sourceId: 'monster30', targetId: slot, attackId: row.id,
    actionName: 'hit1', amount: row.amount ?? 101, attackKind: 'magic',
    knockbackX: 1, knockbackY: 0, occurredAtMs: 0 });
  return { rosters, pets, hero, event, slot };
}

export function settlementSnapshot(fixture: ReturnType<typeof createSettlementFixture>, accepted: boolean) {
  const index = fixture.slot === 'p1' ? 0 : 1;
  return { heroHp: fixture.hero.hp, petHp: fixture.pets[index].hp,
    otherPetHp: fixture.pets[1 - index].hp, accepted,
    shieldAfter: fixture.hero.magicShield?.remainingAmount ?? 0 };
}

export function expectedSettlement(row: SettlementCase) {
  return { heroHp: row.heroHp, petHp: row.petHp, otherPetHp: 200,
    accepted: row.accepted ?? true, shieldAfter: row.shieldAfter ?? 0 };
}
