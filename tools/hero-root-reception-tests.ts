import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { heroPartyMonster3Targets } from '../src/scenes/HeroPartyMonster3Reception';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { monster3AttackRequest, type Monster3Attack } from '../src/systems/Monster3AttackRuntime';

const observations = [1, 2].flatMap(number => JSON.parse(readFileSync(
  `docs/tasks/evidence/TASK-SETTINGS-248/attack${number}/native.json`, 'utf8')).cases
  .filter((row: any) => row.profile === 'hero-ObjectBaseSprite').map((row: any) => ({ number, ...row })));
assert.equal(observations.length, 35220);
let cases = 0;
for (const heroId of [1, 2, 3, 4, 5] as const) {
  const party = createHeroPartyRuntimeModel(['p1', 'p2'].map(slot => ({
    slot: slot as 'p1' | 'p2', heroId, x: 0, y: 50, width: 60,
  })));
  const pets = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  for (const row of observations) {
    for (const member of party.members) {
      member.movement.x = row.targetRoot.x;
      member.movement.y = row.targetRoot.y + 50;
      Object.assign(member.combat.combat, { hp: 1e9, maxHp: 1e9, state: 'ready', invulnerableUntilMs: 0 });
      Object.assign(member.combat.effectiveStats, { defense: 0, missPercent: 0, magicDefensePercent: 0 });
      member.combat.combat.monsterHitIds = [];
    }
    const attack: Monster3Attack = { id: row.id, action: row.number === 1 ? 'hit1' : 'hit2',
      x: row.sourceRoot.x, y: row.sourceRoot.y, facingX: row.sign === 1 ? -1 : 1,
      frame: row.frame, age: row.frame, parentId: 'world',
      source: { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0, flower: false, random: () => 0.9 },
      reception: { prefix: 'root:', serial: 1, count: 0, interval: 999, remaining: 99 } };
    const targets = heroPartyMonster3Targets(party, pets, () => undefined, () => false, attack);
    for (const [index, target] of targets.entries()) {
      assert.equal(target.hero.receive(monster3AttackRequest(attack, 1000, 30, 0)).accepted,
        row.hit, `${heroId}/p${index + 1}/${row.number}/${row.id}: native root must consume modern feet-50`);
      cases++;
    }
  }
  pets.p1.destroy(); pets.p2.destroy(); destroyHeroPartyRuntime(party);
}
assert.equal(cases, 352200);
console.log(`Hero source-root reception: ${cases} native cases through five actual hero types / P1+P2.`);
