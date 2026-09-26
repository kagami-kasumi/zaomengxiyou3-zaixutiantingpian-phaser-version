import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetTargetEffects } from '../src/systems/PetTargetEffects';

let states = 0;
for (const fps of [20, 24, 30]) {
  const source = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SETTINGS-229/ice-air/measurement-${fps}.json`, 'utf8'));
  const ids = [...new Set<string>(source.rows.map((row: any) => row.id))];
  for (const id of ids) {
    const rows = source.rows.filter((row: any) => row.id === id);
    const { mode, owner, hero } = rows[0];
    if (mode === 'repeat-show') continue; // Native probe mutates isFirst directly; not a gameplay add call.
    const victims = [1, 2].map(() => {
      const state = { ice: false, stopped: false, locked: false, staticCalls: 0, owner: true };
      const effects = new PetTargetEffects(fps, {
        show: () => { state.ice = state.stopped = true;
          if (hero) { state.locked = true; state.staticCalls++; } },
        hide: () => { state.ice = state.stopped = state.locked = false; },
        reduceHp: () => { throw new Error('Ice cannot deal periodic damage'); },
      });
      return { state, effects };
    });
    const active = victims[owner - 1]!;
    active.effects.add({ name: 'pethorse_ice', time: fps * 2.4 });
    for (const row of rows) {
      if (mode === 'refresh' && row.tick === fps + 2) active.effects.add({ name: 'pethorse_ice', time: fps * 2.4 });
      if (mode === 'cancel' && row.tick === fps + 3) active.effects.cancel();
      if (mode === 'destroy' && row.tick === fps + 3) { active.effects.destroy(); active.state.owner = false; }
      victims.forEach(v => v.effects.step());
      for (const [index, victim] of victims.entries()) {
        const native = row[`p${index + 1}`], buff = victim.effects.snapshot('pethorse_ice');
        for (const [key, actual] of Object.entries(victim.state)) assert.equal(actual, native[key], `${id}/${row.tick}/${key}`);
        assert.deepEqual(buff ? { time: buff.time, startTime: buff.startTime, isFirst: buff.isFirst } : null, native.buff);
      }
      states++;
    }
  }
}
assert.equal(states, 17904);
console.log(`Target ice model: ${states} original state transitions passed; display geometry/animation and world wiring excluded.`);
