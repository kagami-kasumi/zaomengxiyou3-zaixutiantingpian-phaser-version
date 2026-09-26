import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetMonkeyHorseProjectileSystem } from '../src/systems/PetMonkeyHorseProjectileSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import type { PetBehaviorContext, PetBehaviorSkillRequest } from '../src/systems/PetBehavior';

let cases = 0, states = 0;
for (const fps of [20, 24, 30]) {
  const native = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SETTINGS-229/lifecycle-air/measurement-${fps}.json`, 'utf8'));
  for (const owner of ['P1', 'P2']) for (const mode of ['natural', 'move-hurt', 'explicit-destroy']) {
    // Actual addAoyiBuff fixes direction to 0; direction-1 fixture is not a caller case.
    const rows = native.rows.filter((row: any) => row.id === `AoyiBuff_follow-${owner}-0-${mode}`);
    const born = rows.find((row: any) => row.phase === 'created').state;
    const first = rows.find((row: any) => row.phase === 'enter').source;
    const roster = createSeedPetRoster(), pet = roster.pets.find(p => p.species === 'horse' && p.form === 4)!;
    const runtime = { x: first.x, y: first.y, rootScaleX: first.a, facingX: -1 as const };
    const projectiles = createProjectileSystem(), manager = new PetMonkeyHorseProjectileSystem();
    const context = { pet, runtime, hostFps: fps, actionToken: 1, targets: [{ id: 'target' }],
      animation: { action: 'wait' }, emit: () => {},
      castSkill: (request: PetBehaviorSkillRequest) => request({ roster, runtime: runtime as any, projectiles, targets: [] }),
      projectileCombat: { monkeyHorseCollision: () => ({ fieldAt() { throw new Error('Disabled prelude must not sample collision'); } }),
        target() { throw new Error('Disabled prelude must not query target'); }, hit() { throw new Error('Disabled prelude must not damage'); } },
    } as unknown as PetBehaviorContext;
    manager.emitHorseAoyiPrelude(context);
    const p = projectiles.projectiles[0]!;
    const start = { x: p.x, y: p.y };
    assert.deepEqual(start, { x: first.x, y: first.y });
    for (const row of rows.filter((row: any) => row.phase === 'enter' && row.tick <= 16)) {
      runtime.x = row.source.x; runtime.y = row.source.y; runtime.rootScaleX = row.source.a;
      (context.animation as { action: string }).action = row.source.action;
      if (mode === 'explicit-destroy' && row.tick === 8) manager.destroy();
      manager.step(context);
      assert.deepEqual([p.x - start.x, p.y - start.y, p.petRenderDirection, p.isExpired],
        [row.state.x - born.x, row.state.y - born.y, row.state.a, row.state.dead], `${fps}/${owner}/${mode}/${row.tick}`);
      states++;
    }
    manager.destroy(); cases++;
  }
}
console.log(`AoyiBuff private owner: ${cases} cases/${states} native motion, root flip, hurt and destruction states; disabled collision rejects every query. Pause/full scene excluded.`);
