import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { decodeMonkeyHorseCollision, monkeyHorseCollisionAsset } from '../src/assets/PetMonkeyHorseCollisionPackage';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import type { ProjectileModel } from '../src/systems/ProjectileTypes';
import { bodyGroundFixture } from './pet226-body/ground-fixture';

type Bullet = { symbol: string; birthTick: number; dead: boolean; phaseFrames: number[];
  x: number; y: number; d: number; a: number; disabled: boolean; cut: boolean; ttl: number };
type Row = { id: string; tick: number; phase: string; x: number; y: number; bullets: Bullet[] };
export async function verifyFamilySkillProjectiles(family: 'monkey' | 'horse'): Promise<void> {
const task = family === 'monkey' ? 228 : 229;
const assets = await decodeMonkeyHorseCollision(readFileSync(`public${monkeyHorseCollisionAsset.path}`));
const native = new Map<number, Row[]>();
for (const fps of [20, 24, 30]) native.set(fps, JSON.parse(readFileSync(
  `local-resources/regima/task-outputs/TASK-SETTINGS-${task}/joint-air/measurement-${fps}.json`, 'utf8')).rows);
const collision = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SLICE-226/formal-target-collision-${task}/measurement.json`, 'utf8')).cases as {
  symbol: string; tick: number; target: string; direction: number; hit: boolean; x: number; y: number;
}[];
const damage = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SLICE-226/damage-air/measurement.json', 'utf8')).cases;
const skills = family === 'monkey' ? [['xj'], ['lj', 'xj'], ['lyq', 'xj', 'lj'], ['lyq', 'xj', 'lj']]
  : [['sp'], ['bd', 'sp'], ['bd', 'sp', 'bz'], ['bd', 'sp', 'bz']];
let cases = 0, states = 0;
for (const form of [1, 2, 3, 4]) for (const [skillIndex, skill] of skills[form - 1]!.entries())
for (const fps of [20, 24, 30]) for (const ownerSlot of ['p1', 'p2'] as const) for (const parts of [1, 4]) {
  const action = `hit${skillIndex + 2}`;
  const rows = native.get(fps)!.filter(r => r.id === `${form}-${action}-P${ownerSlot[1]}--1` && r.phase === 'enter');
  const born = rows.find(r => r.bullets.length)!;
  const active = born.bullets.find(b => !b.disabled)!;
  const lastAge = rows.find(r => r.bullets.some(b => b.symbol === active.symbol && b.birthTick === active.birthTick && b.dead))!.tick - active.birthTick;
  const positive = collision.find(c => c.symbol === active.symbol && c.direction === -1 && c.target === 'ObjectBaseSprite2'
    && c.hit && c.tick >= 2 && c.tick < lastAge);
  assert.ok(positive, `independent native positive ${form}/${skill}`);
  const power = (atk: number) => damage.find((r: any) => r.family === family && r.form === form && r.action === action
    && r.atk === atk && r.magic === 0 && !r.gxp && r.flower === 1 && !r.critical).result.hurt;
  const source = readFileSync(`local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/Pet${family === 'monkey' ? 'Monkey' : 'Horse'}${form}.as`, 'utf8');
  const interval = Number(source.split(`this.attackBackInfoDict["${action}"] =`)[1]!.match(/"attackInterval":(\d+)/)![1]);
  const dictionary = source.split(`this.attackBackInfoDict["${action}"] =`)[1]!.split('\n         };')[0]!;
  const addEffectName = dictionary.match(/"name":BaseAddEffect\.(PETMONKEY_FIRE|PETHORSE_ICE)/)?.[1];
  const effectDuration = addEffectName ? Number(dictionary.match(/"time":([^,\n]+)/)![1]!
    .replace('gc.frameClips', '').replace('*', '').trim()) * fps : 0;
  const roster = createSeedPetRoster();
  for (const pet of roster.pets) pet.isActive = pet.species === family && pet.form === form;
  const pet = roster.pets.find(p => p.isActive)!;
  pet.skills = [skill as typeof pet.skills[number]]; pet.mp = 20; pet.moveSpeed = 0; pet.critBonusRate = 0; pet.atk = 17;
  pet.skillState!.monkey1Xj.releaseReady = true; pet.skillState!.monkey2Xj.releaseReady = true;
  pet.skillState!.monkey3Lj.releaseReady = true; pet.skillState!.horse2Bd.releaseReady = true;
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const owner = { x: 300, y: 350, facingX: 1 as const };
  const groundEnvironment = bodyGroundFixture(family, form as 1 | 2 | 3 | 4, owner.y - 100);
  runtime.update({ roster, owner, groundEnvironment, targets: [], projectiles, deltaMs: 0, hostFps: fps });
  const origin = runtime.snapshot().runtime!;
  const locked = createStage1CombatEnemy({ id: 'locked', enemyType: 5, x: origin.x + (family === 'monkey' ? 350 : 80), y: origin.y });
  const other = createStage1CombatEnemy({ id: 'other', enemyType: 5, x: 10000, y: 10000 });
  locked.hp = other.hp = 1000000;
  const origins = new Map<string, number>();
  const birthRoots = new Map<string, { x: number; y: number }>();
  let first: ProjectileModel | undefined, injected = false, tick = 0;
  for (; tick < lastAge + 50; tick++) {
    other.x = other.y = 10000;
    if (first) {
      locked.x = locked.y = 10000;
      if (!injected && first.petHostTick! + 1 === positive.tick) {
        // Native oracle stores target-root displacement relative to the effect root.
        other.x = first.x + positive.x;
        other.y = first.y + positive.y;
        pet.atk = 123.75; // The accepted hit consumes the old cache, then refreshes from current stats.
        injected = true;
      }
    }
    const port = createPetProjectileCombatPort({ enemies: [locked, other], combat, ownerSlot,
      timeMs: tick * 1000 / fps, random: () => 0.75,
    displayTick: () => tick,
      mask: () => { throw new Error('Skills must consume native collision fields'); }, monkeyHorseCollision: () => assets });
    for (let part = 0; part < parts; part++) {
      const rootBeforeBody = runtime.snapshot().runtime!;
      runtime.update({ roster, owner, groundEnvironment, projectiles, hostFps: fps,
        deltaMs: 1000 / fps / parts, random: () => 0.75, projectileCombat: port,
        targets: [locked, other].map(e => ({ id: e.id, x: e.x, y: e.y, isAlive: true })) });
      for (const p of projectiles.projectiles) if (!birthRoots.has(p.id)) birthRoots.set(p.id, rootBeforeBody);
    }
    for (const p of projectiles.projectiles.filter(p => !p.variant.endsWith('-normal'))) {
      if (!origins.has(p.id)) {
        origins.set(p.id, tick);
        const original = born.bullets.find(b => b.symbol === p.sourceSymbol)!;
        assert.ok(original);
        assert.equal(p.petHostTick, 0, 'body birth must not step');
        assert.equal(p.visualOnly, original.disabled);
        assert.equal(p.destroyWhenSourceHurt, original.cut);
        assert.equal(p.damage, original.disabled ? 0 : power(pet.atk), 'native initial damage cache');
        assert.deepEqual(p.petTargetEffects, !addEffectName ? [] : [{ name: addEffectName.toLowerCase(), time: effectDuration,
          ...(family === 'monkey' ? { hurt: form === 4 ? 17 * 1.5 : 17 / 10 } : {}) }], 'source target-effect dictionary and constructor attack seed');
        // The native joint isolates the offset from the emitting body root.
        // Ground motion is live here; compare that original offset at the real
        // callback entrance, before this host's subsequent physical movement.
        const birthRoot = birthRoots.get(p.id)!;
        assert.equal(p.x - birthRoot.x, (original.x - born.x) / original.d);
        assert.equal(p.y - birthRoot.y, original.y - born.y);
        if (!p.visualOnly && !first) first = p;
      }
      const original = born.bullets.find(b => b.symbol === p.sourceSymbol)!;
      const expected = rows.find(r => r.tick - original.birthTick === p.petHostTick)?.bullets
        .find(b => b.symbol === original.symbol && b.birthTick === original.birthTick);
      assert.ok(expected, 'joint trace covers age');
      assert.equal(p.isExpired, expected.dead, `${form}/${skill}/${fps} age ${p.petHostTick}`);
      const checks = p.petHostTick! - (original.ttl > 0 && p.isExpired ? 1 : 0);
      assert.equal(p.hitSerial, p.visualOnly ? 0 : Math.floor(Math.max(0, checks - 1) / interval),
        'BaseBullet renews ID before target checks after the source interval');
      if (!p.isExpired) {
        const field = assets.fieldAt(family, p.sourceSymbol, p.petHostTick!, -1);
        const frames: number[] = [];
        const collect = (node: { frame?: number; children?: typeof node[] }) => {
          if (node.frame != null) frames.push(node.frame); node.children?.forEach(collect);
        };
        collect(JSON.parse(field.phaseKey.split('|')[1]!));
        assert.deepEqual(frames, expected.phaseFrames, 'native recursive phase');
      }
      states++;
    }
    if (first && projectiles.projectiles.every(p => p.isExpired) && runtime.snapshot().animation?.action === 'wait') break;
  }
  assert.ok(first && injected);
  assert.equal(locked.hp, 1000000, 'far locked target must not bypass collision');
  assert.ok(other.hp < 1000000, `${form}/${skill}: untracked intersecting monster receives actual damage`);
  assert.equal(other.lastHitBy, ownerSlot);
  const effectName = family === 'monkey' ? 'petmonkey_fire' : 'pethorse_ice';
  assert.equal(locked.petTargetEffectState!.effects.snapshot(effectName), undefined,
    'far locked target must not receive an effect');
  const targetEffect = other.petTargetEffectState!.effects.snapshot(effectName);
  assert.equal(!!targetEffect, !!addEffectName, 'actual native hit writes the effect onto its victim');
  if (targetEffect) {
    assert.equal(targetEffect.time, effectDuration);
    assert.equal(targetEffect.hurt, family === 'monkey' ? form === 4 ? 17 * 1.5 : 17 / 10 : undefined);
  }
  assert.equal(first.damage, power(123.75), 'accepted skill hit refreshes the original cache');
  assert.ok(combat.audit.damageEvents.some(e => e.attackId.startsWith(`${first!.projectileId}:${first!.sourceAttackId}:`)),
    'real effect ID owns damage');
  assert.ok(projectiles.projectiles.every(p => p.isExpired), 'all callback-born effects finish');
  runtime.destroy();
  assert.deepEqual(other.petTargetEffectState!.effects.snapshot(effectName), targetEffect,
    'source release cannot remove the victim-owned effect');
  cases++;
}
console.log(`${family} skill projectiles: ${cases} Runtime cases; ${states} native phase/lifetime states passed.`);
}
