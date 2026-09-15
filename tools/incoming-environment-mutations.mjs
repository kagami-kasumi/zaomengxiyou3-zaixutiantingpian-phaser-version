export { mutationPlugin } from './incoming-settlement-mutations.mjs';
export const mutations = [
  { name: 'drop-entry-int', file: 'HeroCombatSystem.ts', edits: [
    ['Math.trunc(Math.trunc(amount) * (1 - role3Reduction))', 'Math.trunc(amount * (1 - role3Reduction))'],
  ] },
  { name: 'drop-all-int', file: 'HeroCombatSystem.ts', edits: [
    ['Math.trunc(Math.trunc(amount) * (1 - role3Reduction))', '(amount * (1 - role3Reduction))'],
  ] },
  { name: 'bypass-shield', file: 'HeroCombatSystem.ts', edits: [
    ['absorbHeroDamageWithMagicShield(hero, reducedDamage, role3Reduction)', 'reducedDamage'],
  ] },
  { name: 'drop-overflow', file: 'HeroCombatSystem.ts', edits: [
    ['if (overflow <= 0) return undefined;', 'return undefined;'],
  ] },
  { name: 'normal-hit-window', file: 'HeroCombatSystem.ts', edits: [
    ["if (hero.state === 'dead' || hero.magicInvulnerability) return false;", "if (hero.state === 'dead' || hero.magicInvulnerability || timeMs < hero.invulnerableUntilMs) return false;"],
  ] },
  { name: 'wrong-owner', file: 'HeroPartyRuntimeSystem.ts', edits: [
    ['candidate.combat.slot === hit.target', "candidate.combat.slot === 'p1'"],
  ] },
  { name: 'wrong-source', file: 'HeroPartyRuntimeSystem.ts', edits: [
    ["sourceId: source?.hazardId ?? 'environment-direct'", "sourceId: 'wrong-source'"],
  ] },
  { name: 'drop-time', file: 'HeroPartyRuntimeSystem.ts', edits: [
    ['occurredAtMs: source?.timeMs ?? 0', 'occurredAtMs: 0'],
  ] },
  { name: 'role3-forced-hurt', file: 'HeroCombatSystem.ts', edits: [
    ['remainingDamage > 0 && !hero.role3KnockbackImmune', 'remainingDamage > 0'],
  ] },
  { name: 'late-ice-protection', file: 'Stage21IceHazardSystem.ts', edits: [
    ['target.isYourFather || ', ''],
    ['hazard.hitKeys.add(hitKey);', 'hazard.hitKeys.add(hitKey); if (target.isYourFather) continue;'],
  ] },
  ...['Stage21GameplayBridge.ts', 'Stage22GameplayBridge.ts', 'Stage22DevGameplayBridge.ts'].map(file => ({
    name: `fixed-protection-${file}`, file, browser: true,
    edits: [['isYourFather: hero.environmentProtected', 'isYourFather: false']],
  })),
];
