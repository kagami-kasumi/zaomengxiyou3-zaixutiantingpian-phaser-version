import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHorseAoyiMotion, advanceHorseAoyiMotion } from '../src/systems/PetHorseAoyiMotion';

type State = { x: number; y: number; dead: boolean; vx: number; vy: number; distance: number; ttl: number; target: string | null };
type Row = { id: string; tick: number; phase: string; paused?: boolean;
  target?: { x: number; y: number; dead: boolean }; state: State };
let cases = 0, states = 0;
for (const fps of [20, 24, 30]) for (const trajectory of ['death-at-9', 'above', 'below', 'alternating']) {
  const path = trajectory === 'death-at-9'
    ? `local-resources/regima/task-outputs/TASK-SETTINGS-229/lifecycle-air/measurement-${fps}.json`
    : `local-resources/regima/task-outputs/TASK-SLICE-226/horse-aoyi-live-${trajectory}/measurement-${fps}.json`;
  const native = JSON.parse(readFileSync(path, 'utf8')).rows as Row[];
  const births = native.filter(r => r.phase === 'created' && r.id.startsWith('PetHorse4Bullet5_'));
  for (const birth of births) {
    const p = { x: birth.state.x, y: birth.state.y, isExpired: false };
    const motion = createHorseAoyiMotion(birth.state.target ?? undefined);
    let ttl = fps * 10;
    for (const row of native.filter(r => r.id === birth.id && r.phase === 'enter')) {
      if (!p.isExpired) {
        if (row.id.endsWith('explicit-destroy') && row.tick === 8) p.isExpired = true;
        else if (!row.paused) {
          // BaseBullet TTL runs before EnemyMove's movement; motion does not own that clock.
          if (--ttl === 0) p.isExpired = true;
          advanceHorseAoyiMotion(p, motion, row.target && { ...row.target, alive: !row.target.dead });
        }
      }
      const expected = row.state;
      assert.deepEqual([p.x, p.y, p.isExpired, motion.speedX || 0, motion.speedY, motion.distance, motion.targetId ?? null, ttl],
        [expected.x, expected.y, expected.dead, expected.vx, expected.vy, expected.distance, expected.target, expected.ttl],
        `${fps}/${trajectory}/${row.id}/${row.tick}`);
      states++;
    }
    cases++;
  }
}
console.log(`Horse aoyi motion: ${cases} cases; ${states} original movement/TTL-boundary states passed (world collision excluded).`);
