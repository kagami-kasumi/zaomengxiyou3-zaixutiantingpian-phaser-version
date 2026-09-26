import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createPetMonkeyHorseAnimationClock } from '../src/systems/PetMonkeyHorseAnimationClock';
import { syncPetMonkeyAnimationView } from '../src/scenes/PetMonkeyAnimationView';
import { syncPetHorseAnimationView } from '../src/scenes/PetHorseAnimationView';
import { petMonkeyBodyAssets } from '../src/assets/PetMonkeyAnimationAssets';
import { petHorseBodyAssets } from '../src/assets/PetHorseAnimationAssets';
import type { PetRuntimeModel } from '../src/systems/PetTypes';

type Case = { direction: number; form: 1 | 2 | 3 | 4; fps: number; local: boolean; hurt: boolean; skills: number; noTarget: boolean; action: string;
  rows: { tick: number; action: string; row: number; column: number; count: number; events: { kind: string }[] }[] };
let compared = 0;
for (const [family, task] of [['monkey', 228], ['horse', 229]] as const) {
  const data = JSON.parse(readFileSync(`local-resources/regima/task-outputs/TASK-SETTINGS-${task}/callback-air/measurement.json`, 'utf8')) as { cases: Case[] };
  for (const sample of data.cases) {
    if (!sample.local || sample.hurt || sample.skills !== -1 || sample.noTarget) continue;
    const clock = createPetMonkeyHorseAnimationClock(family, sample.form);
    clock.select(sample.action, 1);
    for (const row of sample.rows) {
      const events = clock.advance(1000 / sample.fps, sample.fps);
      const actual = clock.snapshot();
      assert.deepEqual([actual.action, actual.row, actual.column, actual.remainingHoldCount],
        [row.action, row.row, row.column, row.count], `${family}${sample.form} ${sample.action} ${sample.fps} tick ${row.tick}`);
      assert.equal(events.some(e => e.eventName === 'hit'), row.events.some(e => e.kind === 'emit'),
        `${family}${sample.form} ${sample.action} hit ${row.tick}`);
      let frame: number | undefined;
      let flipped: boolean | undefined;
      const view = { form: sample.form,
        root: { setPosition: () => {}, setData: () => {} },
        sprite: { setFlipX: (value: boolean) => { flipped = value; }, setVisible: () => {},
          setFrame: (value: number) => { frame = value; } },
      };
      const runtime = { x: 200, y: 300, facingX: sample.direction === 0 ? -1 : 1 } as PetRuntimeModel;
      const sync = family === 'monkey' ? syncPetMonkeyAnimationView : syncPetHorseAnimationView;
      const columns = (family === 'monkey' ? petMonkeyBodyAssets : petHorseBodyAssets)[sample.form].columns;
      // Repeated render calls must project the same host state without advancing it.
      for (let render = 0; render < 2; render++) {
        sync(view as never, runtime, actual);
        assert.equal(frame, row.row * columns + row.column);
        assert.equal(flipped, runtime.facingX > 0);
      }
      compared++;
    }
  }
}
console.log('Monkey/horse source body columns, logical counts, callback phases and completion:', compared, 'native states passed.');
