/** Private effect algorithm versus original lifecycle traces; full Session timing is tested separately. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetMonkeyHorseProjectileSystem } from '../src/systems/PetMonkeyHorseProjectileSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import type { PetBehaviorContext, PetBehaviorSkillRequest } from '../src/systems/PetBehavior';
import { bodyFixtureCollisionAssets } from './pet226-body/body-fixture-collision';

type State = { symbol: string; x: number; y: number; a: number; d: number; dead: boolean;
  calls: { kind: string; x: number; y: number; a?: number; dead?: boolean }[] };
type Row = { id: string; tick: number; phase: string; source: { x: number; y: number; a: -1 | 1; action: string }; state: State };
export function verifyFamilyEffectFollow(family: 'monkey' | 'horse'): void {
const task = family === 'monkey' ? 228 : 229;
const variants = family === 'monkey' ? [[1, 'xj'], [2, 'lj'], [3, 'lyq'], [3, 'lj']] as const
  : [[1, 'sp'], [2, 'bd'], [2, 'sp'], [3, 'bd'], [3, 'sp'], [3, 'bz'], [4, 'bd'], [4, 'sp'], [4, 'bz']] as const;
let cases = 0, states = 0;
for (const fps of [20, 24, 30]) {
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SETTINGS-${task}/lifecycle-air/measurement-${fps}.json`, 'utf8')).rows as Row[];
  for (const [form, skill] of variants)
  for (const owner of ['P1', 'P2']) for (const facingX of [-1, 1] as const)
  for (const mode of ['natural', 'move-hurt', 'explicit-destroy']) {
    const roster = createSeedPetRoster();
    for (const pet of roster.pets) pet.isActive = pet.species === family && pet.form === form;
    const pet = roster.pets.find(p => p.isActive)!;
    const sourceStart = native.find(r => r.phase === 'enter' && r.tick === 1
      && r.id.endsWith(`-${owner}-${facingX === -1 ? 0 : 1}-${mode}`))!.source;
    const runtime = { x: sourceStart.x, y: sourceStart.y, facingX, rootScaleX: sourceStart.a };
    const projectiles = createProjectileSystem(), manager = new PetMonkeyHorseProjectileSystem();
    const hits: { symbol: string; x: number; y: number; a: number }[] = [];
    let selected = '', direction = 1;
    const assets = Object.create(bodyFixtureCollisionAssets) as typeof bodyFixtureCollisionAssets;
    assets.fieldAt = (family, symbol, age, sign) => {
      selected = symbol; direction = sign;
      return bodyFixtureCollisionAssets.fieldAt(family, symbol, age, sign);
    };
    const context = { pet, runtime, hostFps: fps, isGxp: false, random: () => 0.75, actionToken: 1,
      targets: [{ id: 'target', x: 0, y: 0, isAlive: true }], animation: { action: 'wait' }, emit: () => {}, protectFromHits: () => {},
      castSkill: (request: PetBehaviorSkillRequest) => request({ roster, runtime: runtime as any, projectiles, targets: [] }),
      projectileCombat: { monkeyHorseCollision: () => assets, target: () => {
        const p = projectiles.projectiles.find(p => p.sourceSymbol === selected);
        assert.ok(p, 'Disabled effects cannot enter target lookup without a collision phase');
        hits.push({ symbol: selected, x: p.x, y: p.y, a: direction }); return undefined;
      } },
    } as unknown as PetBehaviorContext;
    const target = { id: 'target', x: 0, y: 0, isAlive: true };
    if (family === 'monkey') manager.emitMonkeySkill(context, skill as 'xj' | 'lj' | 'lyq', target);
    else manager.emitHorseSkill(context, skill as 'sp' | 'bd' | 'bz', target);
    const suffix = family === 'horse' ? (skill === 'bd' || form === 1 ? '_follow' : '_special') : '';
    const initial = new Map(projectiles.projectiles.map(p => [p.sourceSymbol, { x: p.x, y: p.y }]));
    const histories = new Map(projectiles.projectiles.map(p => [p.sourceSymbol,
      native.filter(r => r.id === `${p.sourceSymbol}${suffix}-${owner}-${facingX === -1 ? 0 : 1}-${mode}`)]));
    for (let tick = 1; tick <= fps * 4; tick++) {
      const firstRows = histories.values().next().value!;
      const row = firstRows.find(r => r.tick === tick && r.phase === 'enter')!;
      assert.ok(row);
      runtime.x = row.source.x; runtime.y = row.source.y; runtime.rootScaleX = row.source.a;
      (context.animation as { action: string }).action = row.source.action;
      hits.length = 0;
      if (mode === 'explicit-destroy' && tick === 8) manager.destroy();
      manager.step(context);
      for (const p of projectiles.projectiles) {
        const history = histories.get(p.sourceSymbol)!;
        const created = history.find(r => r.phase === 'created')!.state;
        const expected = history.find(r => r.tick === tick && r.phase === 'enter')!.state;
        const birth = initial.get(p.sourceSymbol)!;
        assert.deepEqual([p.x - birth.x, p.y - birth.y, p.petRenderDirection ?? -p.facingX, p.isExpired],
          [expected.x - created.x, expected.y - created.y, expected.a, expected.dead],
          `${fps}/${p.sourceSymbol}/${owner}/${facingX}/${mode}/${tick}`);
        const attack = expected.calls.find(c => c.kind === 'attack' && !c.dead);
        const hit = hits.find(h => h.symbol === p.sourceSymbol);
        assert.equal(!!hit, !!attack, 'disabled/destroyed effects cannot enter target collision');
        if (hit && attack) assert.deepEqual([hit.x - birth.x, hit.y - birth.y, hit.a],
          [attack.x - created.x, attack.y - created.y, attack.a], 'collision precedes follow/root flip');
        assert.equal(p.facingX, facingX, 'root flip cannot rewrite source attack direction');
        states++;
      }
      if (projectiles.projectiles.every(p => p.isExpired)) break;
    }
    manager.destroy(); cases++;
  }
}
console.log(`${family} effect follow: ${cases} cases; ${states} source motion/hurt/cleanup states passed (pause excluded).`);
}
