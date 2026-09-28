import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
import {pauseMonster30AttackDisplay} from '../src/systems/Monster30AttackRuntime';
import {createMonster30,updateMonster30} from '../src/systems/Monster30System';
import {createStage1CombatEnemy,updateStage1Enemy} from '../src/systems/Stage1CombatSystem';
import {stepMonsterPetTargetEffects} from '../src/systems/MonsterPetTargetEffectSystem';
const phaseBytes=readFileSync('docs/tasks/evidence/TASK-SETTINGS-241/phase.json');
const contract=JSON.parse(readFileSync('docs/reverse-engineering/reference/monster30-attack-collision-contract.json','utf8'));
assert.equal(createHash('sha256').update(phaseBytes).digest('hex'),contract.phaseTrace.sha256);
const native=JSON.parse(phaseBytes.toString('utf8'));
let checked=0;
for(const owner of ['sandbox','formal']) for(const scenario of ['normal','pause']) for(const fps of [20,24,30]) {
 const sandbox=createMonster30(300,200);sandbox.state='hit1';sandbox.stateTimerMs=10000;sandbox.attackSerial=1;
 const formal=createStage1CombatEnemy({id:'phase',enemyType:30,x:300,y:200});formal.phase='windup';formal.phaseRemainingMs=10000;formal.attackSerial=1;
 const host=owner==='sandbox'?sandbox:formal;
 for(let tick=1;tick<=18;tick++) {
  if(scenario==='pause'&&tick===4)pauseMonster30AttackDisplay(host);
  if(!(scenario==='pause'&&tick>=4&&tick<=6)) {
   if(owner==='sandbox')updateMonster30(sandbox,[],1000/fps,()=>1,fps);
   else {stepMonsterPetTargetEffects(formal,1000/fps,fps);updateStage1Enemy({enemy:formal,targets:[],deltaMs:1000/fps});}
  }
  const row=native.rows.find((r:any)=>r.fps===fps&&r.scenario===scenario&&r.tick===tick&&r.phase==='exit');
  assert.deepEqual(host.attackRuntime?.attacks.map(a=>a.frame)??[],row.bullets.filter((b:any)=>!b.ready).map((b:any)=>b.frame),`${owner}/${fps}/${scenario}/${tick}`);
  checked++;
 }
}
writeFileSync('docs/tasks/evidence/TASK-SLICE-240/native-phase.json',JSON.stringify({status:'passed',checked,source:'241 live AIR EXIT_FRAME trace',boundary:'Both actual model owners, normal/world-pause display lifetime; collision checks are separately validated.'},null,2));
console.log(`Monster30: ${checked} actual-owner display phases match independent AIR EXIT_FRAME`);
