import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
const output = 'docs/tasks/evidence/TASK-SLICE-249B/owner-mutations';
mkdirSync(output, { recursive: true });
const adapter = 'src/scenes/HeroPartyMonster3Reception.ts';
const variants = [
 ['owner-slot',adapter,'pet-reception-compatibility-tests', [['slot = player.slot;',"slot = 'p1' as const;"]]],
 ['stale-runtime',adapter,'monster3-compatibility-target-tests', [['readCompatibility?.(slot) === compatibility','true'],['current === compatibility','true']]],
 ['stale-roster',adapter,'monster3-compatibility-target-tests', [['readPet(slot) === pet','true']]],
 ['destroyed-scene',adapter,'monster3-compatibility-target-tests', [['!destroyed() && ','']]],
 ['wrong-profile',adapter,'monster3-owner-profile-tests', [['monster3TargetProfile(`Pet${sourceName}${pet.form}`)',"monster3TargetProfile('Role1')"]]],
 ['retain-source','src/systems/Monster3AttackRuntime.ts','monster3-attack-lifetime-tests',[['attack.source = undefined;','// retained source']]],
 ['retain-parent','src/systems/Monster3AttackRuntime.ts','monster3-attack-lifetime-tests',[['attack.parentId = undefined;','// retained parent']]],
];
const results = [];
for(const [name,file,suite,replacements] of variants) {
 const outfile=path.resolve('.tmp',`monster3-owner-${name}.mjs`);
 await build({entryPoints:[`tools/${suite}.ts`],bundle:true,platform:'node',format:'esm',outfile,logLevel:'silent',plugins:[{
  name:'isolated-production-mutant',setup(api){api.onLoad({filter:/\.ts$/},args=>{
   if(path.resolve(args.path)!==path.resolve(file))return;
   let source=readFileSync(args.path,'utf8');
   for(const [before,after] of replacements){assert(source.includes(before),`${name}: target absent`);source=source.replaceAll(before,after);}
   return {contents:source,loader:'ts'};
  });}
 }]});
 const run=spawnSync(process.execPath,[outfile],{encoding:'utf8',timeout:60000});
 assert.notEqual(run.status,0,`${name}: mutant survived`);assert.match(run.stderr,/AssertionError/,`${name}: not a behavioral assertion`);
 writeFileSync(`${output}/${name}.log`,run.stdout+run.stderr);results.push({name,suite,rejected:true});
}
writeFileSync(`${output}/report.json`,JSON.stringify({status:'passed',results},null,2));
console.log('Seven current-owner/profile/source-lifecycle production mutants rejected; source files unchanged.');
