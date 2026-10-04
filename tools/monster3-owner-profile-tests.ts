import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createPetRuntime } from '../src/systems/PetRuntimeSystem';
import { attachPetReceptionBody } from '../src/systems/PetReceptionBodyOwner';
import { heroPartyMonster3Targets } from '../src/scenes/HeroPartyMonster3Reception';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { monster3AttackRequest, type Monster3Attack } from '../src/systems/Monster3AttackRuntime';

const contract = JSON.parse(readFileSync('docs/reverse-engineering/reference/monster3-attack-collision-contract.json', 'utf8'));
assert.equal(contract.status, 'verified');
let cases = 0;
// Three actual compatibility owners cover all three native pet profile shapes.
for (const [species, form, sourceType] of [['ufo', 1, 'PetKabu1'], ['ufo', 3, 'PetKabu3'], ['mouse', 1, 'PetMouse1']] as const) {
  const model = createHeroPartyRuntimeModel([{ slot: 'p1', heroId: 1, x: 0, y: 0, width: 40 }]);
  const sessions = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const pet = structuredClone(createSeedPetRoster().pets.find(p => p.species === species && p.form === form)!);
  Object.assign(pet, { hp: 1e9, maxHp: 1e9, def: 0, skills: [], missRate: 0, magicDefenseRate: 0 });
  const runtime = createPetRuntime(pet, { x: 0, y: 0, facingX: 1 });
  const body = attachPetReceptionBody(pet, runtime, { setStatic() {}, cleanup() {}, release() {} });
  const profile = contract.profiles.find((p: { types: string[] }) => p.types.includes(sourceType)).id;
  for (const number of [1, 2]) {
    const native = JSON.parse(readFileSync(`docs/tasks/evidence/TASK-SETTINGS-248/attack${number}/native.json`, 'utf8'));
    for (const row of native.cases.filter((r: { profile: string }) => r.profile === profile)) {
      runtime.x = row.targetRoot.x; runtime.y = row.targetRoot.y;
      const attack: Monster3Attack = { id: 'profile-boundary', action: number === 1 ? 'hit1' : 'hit2',
        x: row.sourceRoot.x, y: row.sourceRoot.y, facingX: row.sign === 1 ? -1 : 1,
        frame: row.frame, age: row.frame, parentId: 'world',
        source: { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0, flower: false, random: () => 0.9 },
        reception: { prefix: 'profile:', serial: 1, count: 0, interval: 999, remaining: 99 } };
      const target = heroPartyMonster3Targets(model, sessions, () => pet, () => false, attack, () => runtime)[0]!.pet!;
      const before = pet.hp;
      const result = target.receive(monster3AttackRequest(attack, 1000, 30, 2));
      assert.equal(result.accepted, row.hit, `${sourceType}/${number}/${row.id}`);
      assert.equal(pet.hp, before - result.amount);
      cases++;
    }
  }
  body.release('owner-exit'); sessions.p1.destroy(); sessions.p2.destroy(); destroyHeroPartyRuntime(model);
}
assert.equal(cases, 105660);
console.log(`Monster3 current-owner profile adapter: ${cases} native pet-shape cases match actual HP reception.`);
