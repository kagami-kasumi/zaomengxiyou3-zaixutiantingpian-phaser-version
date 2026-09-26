import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getPetProjectileKnockback } from '../src/systems/PetProjectileKnockback';
const report=JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-230/native.json','utf8'));
const rows=report.rows.filter((r:any)=>r.type==='direction');
assert.equal(rows.length,432);
for(const row of rows) {
  const result=getPetProjectileKnockback({knockbackX:999,knockbackY:999,facingX:row.direct,velocityX:row.bulletSpeed,
    petSourceKnockback:{x:row.inputX,y:-5,direction:row.kind===0?'unchanged':row.kind<=5?'velocity':'direct',direct:row.direct}});
  assert.equal(result!.x===0?0:result!.x,row.x===0?0:row.x,JSON.stringify(row));
  assert.equal(result!.y,row.y);
}
assert.equal(getPetProjectileKnockback({knockbackX:5,knockbackY:-5,facingX:1,velocityX:1,petSourceKnockback:null}),undefined);
console.log('Monster hit direction: 432 original movement/direct/raw rows matched; absent dictionary retained.');
