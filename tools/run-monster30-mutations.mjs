import {build} from 'esbuild';
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
const mutations = [
 ['pause-display','Monster30AttackRuntime.ts',s=>s.replace('frame: Math.min(10, attack.age + 1)','frame: attack.frame')],
 ['effects-first','MonsterPetTargetEffectSystem.ts',s=>s.replace('beforeEffects?.(state.iceVisible);','').replace('state.effects.step(hostFps);','state.effects.step(hostFps); beforeEffects?.(state.iceVisible);')],
 ['display-only','Monster30AttackRuntime.ts',s=>s.replace('return sampleMonster30Collision(', 'return false && sampleMonster30Collision(')],
 ['death-clears','Monster30AttackRuntime.ts',s=>s.replace('if (runtime.destroyed) return;', "if (runtime.destroyed) return; if ((host.state ?? host.phase) === 'dead') runtime.attacks = [];")],
 ['repeat-spawn','Monster30AttackRuntime.ts',s=>s.replace('runtime.attacks = survivors;', 'runtime.attacks = survivors; if (survivors.length) runtime.attacks.push({...survivors[0],age:0,frame:1});')],
 ['destroy-keeps','Monster30AttackRuntime.ts',s=>s.replace('runtime.destroyed = true; runtime.attacks = []; runtime.detections = [];','runtime.destroyed = true;')],
 ['same-tick-hit','Monster30AttackRuntime.ts',s=>s.replace("actionName: 'hit1', attackKind: 'physics', knockbackX: 6, knockbackY: -5 });", "actionName: 'hit1', attackKind: 'physics', knockbackX: 6, knockbackY: -5 }); runtime.detections.push(runtime.attacks[runtime.attacks.length-1]!);")],
];
mkdirSync('.tmp/monster30-mutations',{recursive:true});
const results=[];
for(const [name,file,mutate] of mutations) {
 let applied=0;
 const outfile=`.tmp/monster30-mutations/${name}.mjs`;
 await build({entryPoints:[name==='pause-display'?'tools/monster30-phase-tests.ts':'tools/monster30-lifecycle-tests.ts'],bundle:true,platform:'node',format:'esm',outfile,
  plugins:[{name:'bounded-production-mutation',setup(b){b.onLoad({filter:/\.ts$/},args=>{
   if(!args.path.endsWith(file))return;
   const original=readFileSync(args.path,'utf8'),contents=mutate(original);assert.notEqual(contents,original);applied++;
   return {contents,loader:'ts'};
  });}}]});
 assert.equal(applied,1);
 const result=spawnSync(process.execPath,[outfile],{encoding:'utf8'});
 assert.notEqual(result.status,0,`survived: ${name}`);
 assert.match(result.stderr,/AssertionError/,'Only an assertion rejection counts, not a harness error');
 results.push({name,rejected:true,assertion:result.stderr.split('AssertionError')[1]?.slice(0,220)});
}
writeFileSync('docs/tasks/evidence/TASK-SLICE-240/mutations.json',JSON.stringify({status:'passed',results},null,2));
console.log('Monster30: seven production source mutations rejected by independent expected assertions');
