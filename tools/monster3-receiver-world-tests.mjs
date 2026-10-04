import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const outfile = path.join(root, '.tmp/monster3-receiver-world-api.mjs');
await build({ stdin: { contents: `
export { createHeroCombat } from './src/systems/HeroCombatSystem';
export { receiveHeroMonsterDamage } from './src/systems/HeroMonsterDamageReception';
export { receiveOwnedPetMonsterDamage } from './src/systems/PetBattleOwnershipSystem';
export { createMonsterAttackReception, checkMonsterAttackReception } from './src/systems/MonsterAttackReception';
`, resolveDir: root, loader: 'ts' }, bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent' });
const api = await import(pathToFileURL(outfile).href);
const reference = JSON.parse(readFileSync(path.join(root, 'docs/reverse-engineering/reference/monster3-reception-contract.json'), 'utf8'));
const failures = [];
for (const expected of reference.worldExpected) {
  const { owner, boss, attack, mode } = expected;
  const hero = api.createHeroCombat(owner); hero.hp = hero.maxHp = 1000; hero.monsterHitIds = [];
  const pet = { id: 'pet', species: 'monkey', form: 1, hp: 1000, maxHp: 1000, def: 0, lifetime: 10, skills: [] };
  const runtime = { petId: pet.id, runtimeKey: owner + ':pet', x: 0, y: 0, facingX: 1, state: 'idle', monsterHitIds: [] };
  let draws = [], sequence = [], petFather = -1, petAction = 'wait', frame = 0;
  const random = () => { const value = sequence[draws.length] ?? 0.9; draws.push(value); return value; };
  const source = { boss, hit: 0, criticalPercent: mode === 'order' ? 50 : 0,
    magicDefenseReduction: 0, flower: mode === 'flower', random };
  const request = { source, sourceId: 'monster3', attackId: '', actionName: `hit${attack}`,
    power: attack === 1 ? 40 : 18, attackKind: attack === 1 ? 'physics' : 'magic',
    geometryHit: true, bingo: false, difficulty: mode === 'difficulty2' ? 2 : mode === 'difficulty1' ? 1 : 0,
    timeMs: 1000, hostFps: 30, knockbackX: 6, knockbackY: -5 };
  const state = api.createMonsterAttackReception('attack-', attack === 1 ? 999 : 4, request, 99);
  assert.deepEqual(draws, expected.setup);
  const pair = { hero: { ids: hero.monsterHitIds, receive: input => api.receiveHeroMonsterDamage(hero, {
    heroId: 1, action: hero.state === 'hurt' ? 'hurt' : 'wait', sdLevel: 0, gxp: false,
    missRate: mode === 'dodge' ? 1 : 0, defense: 0, magicDefenseRate: 0,
    protected: frame === 1 && mode === 'protected-retry',
  }, input) }, pet: { ids: runtime.monsterHitIds, receive: input => {
    const result = api.receiveOwnedPetMonsterDamage(pet, runtime, { action: petAction,
      protected: petFather >= 0 || (frame === 1 && mode === 'protected-retry'),
      gxp: false, missRate: mode === 'dodge' ? 1 : 0, magicDefenseRate: 0,
      rabbitDodgeActive: false, counterChance: undefined }, input);
    petAction = result.action;
    if (result.protectionTicks !== undefined) petFather = result.protectionTicks;
    return result;
  } } };
  const steps = [], frames = attack === 1 ? 1001 : 7;
  for (frame = 1; frame <= frames; frame++) {
    draws = []; sequence = mode === 'order' ? [0.9, 0.9, 0.1, ...Array(10).fill(0.9)] : [];
    // The original world fixture explicitly releases pre-protection, and keeps Bingo protection.
    api.checkMonsterAttackReception(state, { ...request, geometryHit: !(mode === 'geometry-retry' && frame === 1) }, [pair]);
    if (frame <= 3 || frame >= frames - 2) steps.push({ frame, heroHp: hero.hp, petHp: pet.hp,
      heroIds: [...hero.monsterHitIds], petIds: [...runtime.monsterHitIds], id: state.prefix + state.serial,
      interval: state.interval, count: state.count, max: state.remaining, random: draws,
      sourceHit: source.hit, heroFather: hero.invulnerableUntilMs > request.timeMs
        ? (hero.invulnerableUntilMs - request.timeMs) * request.hostFps / 1000 : -1, petFather });
  }
  try { assert.deepEqual(steps, expected.steps); }
  catch { failures.push({ id: expected.id, actual: steps, expected: expected.steps }); }
}
const output = path.join(root, 'docs/tasks/evidence/TASK-SLICE-249A');
mkdirSync(output, { recursive: true });
writeFileSync(path.join(output, 'world-verification.json'), JSON.stringify({ cases: 64, failures }, null, 2) + '\n');
console.log(JSON.stringify({ cases: 64, failures: failures.length, first: failures.slice(0, 1) }));
assert.equal(failures.length, 0);
