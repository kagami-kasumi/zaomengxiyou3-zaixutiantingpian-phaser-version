import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createMonster30, updateMonster30 } from '../src/systems/Monster30System';
// Fixed replay of the historical 226 counterexample. Expected values come from
// 232 BA-01..03 and 241 native world phase, not an alternate modern view order.
const results = [];
for (const fps of [20, 24, 30]) {
  const monster = createMonster30(300, 200); monster.hp = 1;
  monster.state = 'hit1'; monster.attackSerial = 1; monster.stateTimerMs = 500;
  monster.petTargetEffectState!.effects.add({name:'petmonkey_fire',time:fps*2,hurt:1});
  updateMonster30(monster, [], 1000/fps, () => .99, fps);
  assert.equal(monster.state,'dead');
  assert.equal(monster.attackRuntime!.attacks.length,1);
  assert.equal(monster.attackRuntime!.detections.length,0);
  assert.equal(monster.attackRuntime!.body.actionTick,0);
  updateMonster30(monster, [], 1000/fps, () => .99, fps);
  assert.equal(monster.attackRuntime!.detections.length,1);
  results.push({fps,bodyFirstEmission:1,firstDetectionWorld:2,deathActionTickAtSelection:0});
}
const report={status:'passed-production-order-counterexample',results,
  boundary:'Model replay only; actual HP, natural Scene collision and visual evidence are separate TASK-SLICE-240 gates.'};
mkdirSync('docs/tasks/evidence/TASK-SLICE-240',{recursive:true});
writeFileSync('docs/tasks/evidence/TASK-SLICE-240/body-order-preflight.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
