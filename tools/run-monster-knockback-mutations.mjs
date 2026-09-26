import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
const mutations=[
  ['no-consumer','Stage1CombatSystem.ts','if (params.hasKnockback !== false) acceptMonsterKnockback','if (false) acceptMonsterKnockback'],
  ['wrong-units','MonsterKnockbackSystem.ts','motion.velocityX = x * 2;','motion.velocityX = x * 2 / 24;'],
  ['early-consumed-now','MonsterKnockbackBinding.ts',"if (phase === 'early')",'if (false)'],
  ['duplicate-displacement','MonsterKnockbackSystem.ts','const flags = movementFlags(profile, motion.action);','motion.x += motion.velocityX; const flags = movementFlags(profile, motion.action);'],
  ['skip-cleanup','MonsterKnockbackBinding.ts','binding.disposed = true; binding.active = false; binding.pendingMs = 0;','return;'],
  ['force-completed-tween','MonsterKnockbackSystem.ts','if (t === 1) motion.tween = undefined;','/* keep rewriting endpoint */'],
  ['cancel-old-at-edge','MonsterKnockbackSystem.ts','motion.velocityX = 0;\n    return;','motion.velocityX = 0; motion.tween = undefined;\n    return;'],
  ['wrong-direct','PetProjectileKnockback.ts',"source.direct ?? projectile.facingX : 1","1 : 1"],
];
const out=path.resolve('.tmp/monster-knockback-mutations');mkdirSync(out,{recursive:true});
const killed=[];
for(const [name,file,before,after] of mutations) {
  const outfile=path.join(out,name+'.mjs');let changed=false;
  await build({stdin:{contents:"import './tools/monster-knockback-tests.ts'; import './tools/monster-knockback-binding-tests.ts';",resolveDir:process.cwd(),loader:'ts'},bundle:true,format:'esm',platform:'node',outfile,logLevel:'silent',
    plugins:[{name:'production-mutation',setup(b){b.onLoad({filter:/\.ts$/},args=>{
      if(path.basename(args.path)!==file)return;
      const source=readFileSync(args.path,'utf8');assert.ok(source.includes(before),`stale mutation ${name}`);changed=true;
      return {contents:source.replace(before,after),loader:'ts'};
    });}}]});
  assert.ok(changed);
  const run=spawnSync(process.execPath,[outfile],{encoding:'utf8',windowsHide:true});
  assert.notEqual(run.status,0,`escaped mutation: ${name}`);
  assert.match(run.stderr,/AssertionError/,`non-assertion failure ${name}: ${run.stderr}`);
  killed.push(name);
}
const evidence='docs/tasks/evidence/TASK-SLICE-236';mkdirSync(evidence,{recursive:true});
writeFileSync(evidence+'/production-mutations.json',JSON.stringify({status:'passed',killed,scope:'In-memory edits of actual hit, motion, phase, direction and disposal production modules; unchanged native oracle.'},null,2)+'\n');
console.log(`${killed.length} actual monster knockback production mutations rejected.`);
