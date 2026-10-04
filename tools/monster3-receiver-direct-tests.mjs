import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const outfile = path.join(root, '.tmp/monster3-receiver-test-api.mjs');
await build({ stdin: { contents: `
export { createHeroCombat } from './src/systems/HeroCombatSystem';
export { receiveHeroMonsterDamage } from './src/systems/HeroMonsterDamageReception';
export { receiveOwnedPetMonsterDamage, settleOwnedPetHpDamage } from './src/systems/PetBattleOwnershipSystem';
export { refreshTurtleLink } from './src/systems/PetTurtleLinkSystem';
`, resolveDir: root, loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent' });
const api = await import(pathToFileURL(outfile).href);
const reference = JSON.parse(readFileSync(path.join(root, 'docs/reverse-engineering/reference/monster3-reception-contract.json'), 'utf8'));
const unpack = (fields, row) => Object.fromEntries(fields.map((field, i) => [field, row[i]]));
const failures = [];
for (let index = 0; index < reference.inputs.rows.length; index++) {
  const f = unpack(reference.inputs.fields, reference.inputs.rows[index]);
  const expected = unpack(reference.expected.fields, reference.expected.rows[index]);
  assert.equal(f.id, expected.id);
  const draws = [], rolls = f.rolls ?? Array(10).fill(f.roll);
  const random = () => { const value = rolls[draws.length] ?? f.roll; draws.push(value); return value; };
  const source = { boss: f.boss, hit: f.sourceHit, criticalPercent: f.critical,
    flower: f.flower, magicDefenseReduction: f.reduceMagic, random };
  const request = { source, sourceId: 'monster3', attackId: 'attack-1', actionName: `hit${f.attack}`,
    power: f.attack === 1 ? 40 : 18, attackKind: f.attack === 1 ? 'physics' : 'magic',
    geometryHit: f.geometry, bingo: f.bingo, difficulty: f.difficulty,
    timeMs: 1000, hostFps: 30, knockbackX: 6, knockbackY: -5 };
  let actual;
  if (f.name.startsWith('Role')) {
    const hero = api.createHeroCombat(f.owner);
    hero.hp = f.hp; hero.maxHp = 1000;
    const linkedPet = { hp: f.linkHp, maxHp: 1000 };
    if (f.shield) hero.magicShield = { kind: f.shieldKind === 'MAGIC_UMBRELLA_DEFEND' ? 'magicUmbrellaDefend'
      : 'role2Tjgl', remainingAmount: f.shield, initialAmount: f.shield, totalMs: 1000, remainingMs: 1000, sourceName: 'fixture' };
    if (f.link) {
      const buff = api.refreshTurtleLink(undefined, linkedPet, 'linked', 0, 1000, 30);
      const peer = api.refreshTurtleLink(undefined, linkedPet, 'linked', 0, 1000, 30);
      buff.peer = () => f.linkBoth ? peer : undefined; peer.peer = () => buff;
      buff.reduceHp = amount => api.settleOwnedPetHpDamage(linkedPet, amount);
      hero.turtleLink = buff;
    }
    const result = api.receiveHeroMonsterDamage(hero, { heroId: Number(f.name.slice(4)), action: f.action,
      sdLevel: f.sd, gxp: f.gxp, missRate: f.miss / 100, defense: f.defense,
      magicDefenseRate: f.magicDefense / 100, protected: f.protected || !!f.protectionKind }, request);
    actual = { id: f.id, accepted: result.accepted, hp: hero.hp, random: draws,
      action: hero.state === 'hurt' ? 'hurt' : f.action, ids: hero.monsterHitIds ?? [],
      missed: result.missed, destroyed: hero.state === 'dead', sourceHit: source.hit,
      father: Number.isFinite(hero.invulnerableUntilMs) && hero.invulnerableUntilMs > request.timeMs
        ? Math.round((hero.invulnerableUntilMs - request.timeMs) * request.hostFps / 1000) : -1,
      skill1: false, skill2: false, skill3: false, lifetime: null,
      linkHp: f.link ? linkedPet.hp : null, shield: hero.magicShield?.remainingAmount ?? null };
  } else {
    const species = f.name.slice(3, -1).toLowerCase().replace('kabu', 'ufo');
    const pet = { id: f.id, species, form: Number(f.name.slice(-1)), hp: f.hp, maxHp: 1000,
      def: f.defense, lifetime: 10, skills: f.qlfj === null ? [] : ['qlfj'] };
    const runtime = { petId: pet.id, runtimeKey: f.id, x: 0, y: 0, facingX: 1, state: 'idle' };
    const result = api.receiveOwnedPetMonsterDamage(pet, runtime, { action: f.action, protected: f.protected,
      gxp: f.gxp, missRate: f.petMiss, magicDefenseRate: f.petMagicDefense,
      rabbitDodgeActive: f.rabbit, counterChance: f.qlfj ?? undefined }, request);
    actual = { id: f.id, accepted: result.accepted, hp: pet.hp, random: draws,
      action: result.action, ids: runtime.monsterHitIds ?? [],
      missed: result.missed, destroyed: false, sourceHit: source.hit, father: result.protectionTicks ?? -1,
      skill1: !!(pet.skillState?.monkey1Xj.releaseReady || pet.skillState?.horse2Bd.releaseReady),
      skill2: !!pet.skillState?.monkey2Xj.releaseReady, skill3: !!pet.skillState?.monkey3Lj.releaseReady,
      lifetime: pet.lifetime, linkHp: null, shield: null };
  }
  try { assert.deepEqual(actual, expected); }
  catch { failures.push({ id: f.id, differences: Object.keys(expected).filter(key => JSON.stringify(actual[key]) !== JSON.stringify(expected[key]))
    .map(key => ({ key, expected: expected[key], actual: actual[key] })) }); }
}
const output = path.join(root, 'docs/tasks/evidence/TASK-SLICE-249A');
mkdirSync(output, { recursive: true });
writeFileSync(path.join(output, 'direct-verification.json'), JSON.stringify({ cases: reference.inputs.rows.length, failures }, null, 2) + '\n');
console.log(JSON.stringify({ cases: reference.inputs.rows.length, failures: failures.length, first: failures.slice(0, 4) }));
assert.equal(failures.length, 0, 'Production reception differs from 251 direct expected');
