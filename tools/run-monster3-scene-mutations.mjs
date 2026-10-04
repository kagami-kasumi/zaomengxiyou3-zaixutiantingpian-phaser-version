import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const output='docs/tasks/evidence/TASK-SLICE-249B/scene-mutations';mkdirSync(output,{recursive:true});
const run=spawnSync(process.execPath,['tools/run-monster3-browser.mjs'],{encoding:'utf8',timeout:180000,
 env:{...process.env,M3_SCENE:'Stage13Scene',M3_FPS:'30',M3_MODE:'normal',M3_SCENE_MUTATION:'legacy-route',M3_VISUAL:'',M3_VISUAL_MUTATION:'',PET_RECEPTION_SCENE:'',PET_RECEPTION_VISUAL:''}});
writeFileSync(`${output}/legacy-route.log`,run.stdout+run.stderr);
assert.notEqual(run.status,0);assert.match(run.stderr,/AssertionError.*Monster3 must never enter the retired ordinary attack HP path/);
writeFileSync(`${output}/report.json`,JSON.stringify({status:'passed',results:[{mutation:'legacy-route',actualScene:'Stage13Scene',rejectedByRuntimeInvocation:true}]},null,2));
console.log('Retired Monster3 HP route production mutant rejected by actual Stage13 invocation.');
