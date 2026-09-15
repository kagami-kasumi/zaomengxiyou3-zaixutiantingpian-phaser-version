import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

export const mutations = [
  { name: 'owner-ceil', file: 'PetTurtleSkillSystem.ts', edits: [
    ['Math.trunc(normalizedDamage * PetTuning.turtle2TxljOwnerDamageRate)', 'Math.ceil(normalizedDamage * PetTuning.turtle2TxljOwnerDamageRate)'],
  ] },
  { name: 'no-role3-int', file: 'HeroCombatSystem.ts', edits: [
    ['Math.trunc(Math.trunc(amount) * (1 - role3Reduction))', '(Math.trunc(amount) * (1 - role3Reduction))'],
  ] },
  { name: 'redirect-before-protection', file: 'HeroCombatSystem.ts', edits: [
    ['): boolean {\n  if (\n    hero.state', '): boolean {\n  if (redirectDamage) event = { ...event, amount: redirectDamage(event.amount) };\n  redirectDamage = undefined;\n  if (\n    hero.state'],
  ] },
  { name: 'redirect-before-shield', file: 'HeroCombatSystem.ts', edits: [
    ['absorbHeroDamageWithMagicShield(hero, reducedDamage, role3Reduction)', 'absorbHeroDamageWithMagicShield(hero, redirectDamage?.(reducedDamage) ?? reducedDamage, role3Reduction)'],
    ['redirectDamage?.(hpDamage) ?? hpDamage', 'hpDamage'],
  ] },
  { name: 'drop-overflow', file: 'HeroCombatSystem.ts', edits: [
    ['if (overflow <= 0) return undefined;', 'return undefined;'],
  ] },
  { name: 'skip-overflow-reentry', file: 'HeroCombatSystem.ts', edits: [
    ['Math.trunc(overflow * (1 - role3Reduction))', 'overflow'],
  ] },
  { name: 'wrong-owner', file: 'PetBattleOwnershipSystem.ts', edits: [
    ['applyOwnedPetDamageRedirect(rosters, ownerSlot, amount,', "applyOwnedPetDamageRedirect(rosters, 'p1', amount,"],
  ] },
  { name: 'wrong-source-amount', browser: true, file: 'TestSceneCombatBridge.ts', edits: [
    ['activeAttack.damage,', 'activeAttack.damage + 1,'],
  ] },
  { name: 'skip-monster-collision', browser: true, file: 'TestSceneCombatBridge.ts', edits: [
    ['Phaser.Geom.Intersects.RectangleToRectangle(\n      attackBounds,\n      getPlayerBounds(player),', '(() => true)(\n      attackBounds,\n      getPlayerBounds(player),'],
  ] },
  { name: 'skip-boss-hit-registry', browser: true, file: 'TestSceneBossArena.ts', edits: [
    ['!resolveHitOnce(this.hitRegistry, activeAttack.attackId, player.slot)', 'false'],
  ] },
];

export function mutationPlugin(mutation) {
  return { name: 'mutate-settlement-in-memory', setup(b) {
    b.onLoad({ filter: new RegExp(mutation.file.replaceAll('.', '\\.') + '$') }, args => {
      let contents = readFileSync(args.path, 'utf8').replaceAll('\r\n', '\n');
      for (const [before, after] of mutation.edits) {
        assert.ok(contents.includes(before), `stale mutation site: ${mutation.name}`);
        contents = contents.replace(before, after);
      }
      return { contents, loader: 'ts' };
    });
  } };
}
