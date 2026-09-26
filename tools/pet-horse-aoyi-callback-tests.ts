/** Explicit successful-hit boundary versus original hit5Hit/TweenMax observations. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { emitHorseAoyi } from '../src/systems/PetHorseAoyiProjectiles';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import type { MonkeyHorsePrivateProjectile } from '../src/systems/PetMonkeyHorsePrivateProjectile';
import type { PetBehaviorContext, PetBehaviorSkillRequest } from '../src/systems/PetBehavior';

type Row = { id: string; tick: number; phase: string; bullets: { symbol: string; x: number; y: number; owner: string; a: number }[] };
let cases = 0;
for (const fps of [20, 24, 30]) {
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SETTINGS-229/explosion-air/measurement-${fps}.json`, 'utf8'));
  for (const owner of [1, 2]) for (let skills = 0; skills < 8; skills++)
  for (const mode of ['alive', 'dead-before', 'dead-after', 'ready-only', 'move-reference']) {
    const id = `4-hit5-P${owner}-${skills}-${mode}`;
    const rows = (native.rows as Row[]).filter(r => r.id === id);
    assert.ok(rows.length, id);
    const atHit = rows.find(r => r.tick === 6 && r.phase === 'enter')!.bullets.find(b => b.symbol === 'PetHorse4Bullet5')!;
    const expected = rows.flatMap(r => r.bullets).find(b => b.symbol === 'PetHorse4Bullet5Explode');
    const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'horse' && p.form === 4)!;
    pet.skills = ['tmaoyi']; pet.hp = 100; pet.isActive = true;
    if (skills & 1) pet.skills.push('bd');
    if (skills & 2) pet.skills.push('sp');
    if (skills & 4) pet.skills.push('bz');
    const runtime = { x: owner === 1 ? 300 : 640, y: 350, facingX: 1 as const };
    const projectiles = createProjectileSystem(), entries: MonkeyHorsePrivateProjectile[] = [], jobs: (() => void)[] = [];
    const context = { pet, runtime, hostFps: fps, actionToken: 1, isGxp: false, random: () => 0.75,
      targets: [{ id: 'target', x: 600, y: 350, isAlive: true }],
      castSkill: (request: PetBehaviorSkillRequest) => request({ roster, runtime: runtime as any, projectiles, targets: [] }),
      projectileCombat: { delay: (milliseconds: number, callback: () => void) => {
        const original = native.delays.find((d: any) => d.id === id);
        assert.ok(original); assert.equal(milliseconds, original.delay * 1000); jobs.push(callback);
      } },
    } as unknown as PetBehaviorContext;
    emitHorseAoyi(context, entry => entries.push(entry));
    const falling = entries[0]!.projectile;
    falling.x = atHit.x; falling.y = atHit.y;
    if (mode === 'dead-before') pet.hp = 0;
    entries[0]!.onAccepted!(context);
    if (mode === 'dead-after') pet.hp = 0;
    if (mode === 'ready-only') pet.isActive = false;
    if (mode === 'move-reference') { falling.x += 23; falling.y += 11; }
    assert.equal(jobs.length, skills & 1 && skills & 4 ? 1 : 0);
    jobs.forEach(callback => callback());
    const explosions = projectiles.projectiles.filter(p => p.sourceSymbol === 'PetHorse4Bullet5Explode');
    assert.equal(explosions.length, expected ? 1 : 0, id);
    if (expected) assert.deepEqual([explosions[0]!.x, explosions[0]!.y, explosions[0]!.petRenderDirection],
      [expected.x, expected.y, expected.a], id);
    cases++;
  }
}
console.log(`Horse explosion callback: ${cases} original skill/death/live-reference cases passed (successful hit and timer fire are controlled).`);
