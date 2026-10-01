import assert from 'node:assert/strict';
import { readFileSync,mkdirSync,writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { createRequire } from 'node:module';
const {build}=createRequire(import.meta.url)('esbuild');
const mutations=[
 ['period','PetPassiveSession.ts','this.tCount++ < fps','++this.tCount < fps'],
 ['double-factor','PetPassiveSession.ts','pet.form * factor * technique * 1.05','pet.form * factor * technique * 1.05 * 1.05'],
 ['fixed-fps','PetPassiveSession.ts',') * fps;',') * 24;'],
 ['immediate','PetPassiveSession.ts','[300, 300, 300, 300, 300, 300]','[0, 0, 0, 0, 0, 0]'],
 ['first-only','PetPassiveSession.ts','if (this.counters[index] !== 0','if (index > 0 || this.counters[index] !== 0'],
 ['refresh-value','PetPassiveSession.ts','old.time = time;','old.value = value; old.time = time;'],
 ['missing-input-cap','PetPassiveSession.ts','value > 8 ? 4 : value | 0','value | 0'],
 ['zero-free','PetPassiveSession.ts','pet.mp -= 20;','if (time > 0) pet.mp -= 20;'],
 ['no-public-step','PetCombatEntitySession.ts','this.passive?.check(this.pet','undefined && this.passive?.check(this.pet'],
 ['stun-counts','PetCombatEntitySession.ts','ownsPet && !stunned && !this.parentRuntimeKey','ownsPet && !this.parentRuntimeKey'],
 ['hurt-as-stun','PetCombatEntitySession.ts','const stunned = frame.stunnedRuntimeKeys?.includes(this.runtimeKey) ?? false;','const stunned = this.animation?.snapshot().action === \'hurt\' || (frame.stunnedRuntimeKeys?.includes(this.runtimeKey) ?? false);'],
 ['wrong-owner-port','PetCombatEntitySession.ts','frame.ownerAddPetBuff);','undefined);'],
 ['missing-own-destroy','PetCombatEntitySession.ts','this.passive?.destroy();','/* missing cleanup */'],
 ['skill-bypass','PetMonkeyHorseDamageSystem.ts','context.passiveBonuses?.magic ??','0 ??'],
] as const;
mkdirSync('.tmp/pet-passive-mutations',{recursive:true});const rows:any[]=[];
for(const [name,file,before,after] of mutations) {
 const target=path.resolve('src/systems',file),source=readFileSync(target,'utf8');assert(source.includes(before),name);
 const outfile=path.resolve('.tmp/pet-passive-mutations',name+'.mjs');
 await build({stdin:{contents:"import './tools/pet-passive-tests'; import './tools/pet-passive-runtime-tests';",resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',outfile,logLevel:'silent',plugins:[{name,setup(api:any){api.onLoad({filter:/\.ts$/},(args:any)=>args.path===target?{contents:source.replace(before,after),loader:'ts'}:undefined);}}]});
 const run=spawnSync(process.execPath,[outfile],{encoding:'utf8',env:{...process.env,PET_PASSIVE_MUTATION:name}});
 assert.equal(run.error,undefined);assert.notEqual(run.status,0,name+' survived');assert.match(run.stderr,/AssertionError/,name+': must fail acceptance assertion');rows.push({name,status:'rejected'});
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-242B',{recursive:true});writeFileSync('docs/tasks/evidence/TASK-SLICE-242B/mutations.json',JSON.stringify({status:'passed',rows},null,2)+'\n');
console.log('242B:14 production mutations rejected');
