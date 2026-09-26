import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PetTargetEffects } from '../src/systems/PetTargetEffects';

const source = JSON.parse(readFileSync('local-resources/regima/task-outputs/TASK-SETTINGS-228/fire-air/measurement.json', 'utf8'));
let states = 0;
for (const fps of [20, 24, 30]) for (const selected of [1, 2])
for (const mode of ['expire', 'refresh', 'cancel', 'destroy', 'boundary']) {
  const victims = [1, 2].map(() => {
    const state = { fire: false, owner: true, damage: [] as number[] };
    const effects = new PetTargetEffects(fps, {
      show: () => { state.fire = true; }, hide: () => { state.fire = false; },
      reduceHp: hurt => state.damage.push(hurt),
    });
    return { state, effects };
  });
  const active = victims[selected - 1]!;
  const time = mode === 'boundary' ? fps : fps * 3.6;
  active.effects.add({ name: 'petmonkey_fire', time, hurt: 10 });
  const rows = source.rows.filter((row: any) => row.fps === fps && row.selected === selected && row.mode === mode);
  for (const row of rows) {
    if (mode === 'refresh' && row.tick === fps + 2) active.effects.add({ name: 'petmonkey_fire', time, hurt: 99 });
    if (mode === 'cancel' && row.tick === fps + 3) active.effects.cancel();
    if (mode === 'destroy' && row.tick === fps + 3) { active.effects.destroy(); active.state.owner = false; }
    victims.forEach(v => v.effects.step());
    for (const [index, victim] of victims.entries()) {
      const buff = victim.effects.snapshot('petmonkey_fire');
      assert.deepEqual({ ...victim.state, children: Number(victim.state.fire),
        buff: buff ? { time: buff.time, startTime: buff.startTime, hurt: buff.hurt, isFirst: buff.isFirst } : null },
      row[`p${index + 1}`], `${fps}/${selected}/${mode}/${row.tick}/victim${index + 1}`);
    }
    states++;
  }
}
assert.equal(states, 5950);
console.log(`Target fire model: ${states} original add/refresh/expiry/cancel/destroy states passed; world wiring not covered.`);
