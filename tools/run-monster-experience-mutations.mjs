import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
const out='docs/tasks/evidence/TASK-SLICE-238/mutations';mkdirSync(out,{recursive:true});
const edits = {
  'no-attacker-write':['host.experienceBinding.target = target','host.experienceBinding.target = undefined'],
  'equal-shares':['experience * 0.6','experience * 0.5'],
  'current-pet':['target.addExperience(amount);','(binding.heroes().find(hero => hero.ownerSlot === target.ownerSlot)?.currentPet?.() ?? target).addExperience(amount);'],
  'duplicate':['if (!binding || binding.settled) return;','if (!binding) return;'],
  'no-retired-clear':['target.isDead() || target.isReadyToDestroy()','target.isDead()'],
  'always-reselect':['if (binding.target) {','if (false && binding.target) {'],
  'numeric-sort':['String(distances[index]) < String(distances[chosen])','distances[index]! < distances[chosen]!'],
};
const reports=[];
for (const [name,[from,to]] of Object.entries(edits)) {
  const file=path.resolve('.tmp',`monster-xp-${name}.mjs`),trace=path.resolve(out,`${name}.json`);
  await build({entryPoints:['tools/monster-experience-trace.ts'],bundle:true,platform:'node',format:'esm',outfile:file,logLevel:'silent',
    plugins:[{name:'mutation',setup(b){b.onLoad({filter:/MonsterExperienceSystem\.ts$/},args=>{
      const source=readFileSync(args.path,'utf8');assert.ok(source.includes(from),name);return {contents:source.replace(from,to),loader:'ts'};
    });}}]});
  const run=spawnSync(process.execPath,[file],{encoding:'utf8',env:{...process.env,MONSTER_EXPERIENCE_TRACE_OUT:trace}});
  const verify=run.status===0?spawnSync('python',['-B','tools/verify-monster-experience.py',trace],{encoding:'utf8'}):run;
  assert.notEqual(verify.status,0,`Survived: ${name}`);
  reports.push({name,rejected:true,reason:(verify.stderr||verify.stdout).slice(-2200)});
}
for(const [name,filter,from,to] of [
  ['lost-projectile-source',/PetProjectileCombatSystem\.ts$/,'experienceSource: projectile.experienceSource','experienceSource: undefined'],
  ['p2-saved-as-p1',/HeroPartyExperienceBridge\.ts$/,"member.combat.slot === 'p1' ? 'player1' : 'player2'","member.combat.slot === 'p1' ? 'player1' : 'player1'"],
  ['legacy-stale-roster',/PetExperienceTargetSystem\.ts$/,'roster.pets[index] = existing.pet;','/* stale roster */'],
]) {
  const file=path.resolve('.tmp',`monster-xp-${name}.mjs`);
  await build({entryPoints:['tools/monster-experience-runtime-tests.ts'],bundle:true,platform:'node',format:'esm',outfile:file,logLevel:'silent',
    plugins:[{name:'consumer-mutation',setup(b){b.onLoad({filter},args=>{const source=readFileSync(args.path,'utf8');
      assert.ok(source.includes(from),name);return {contents:source.replace(from,to),loader:'ts'};});}}]});
  const run=spawnSync(process.execPath,[file],{encoding:'utf8'});assert.notEqual(run.status,0,`Survived: ${name}`);
  reports.push({name,rejected:true,reason:(run.stderr||run.stdout).slice(-2200)});
}
writeFileSync(path.join(out,'verification.json'),JSON.stringify({reports},null,2));
console.log(`${reports.length} production mutations rejected.`);
