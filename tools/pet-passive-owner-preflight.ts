import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { transformSync } from 'esbuild';
import { createHeroPartyRuntimeModel } from '../src/systems/HeroPartyRuntimeSystem';
import { getHeroBaseStats } from '../src/systems/ProgressionSystem';
const path='src/scenes/test-scene/TestSceneHeroPartyRuntimeBridge.ts';
const source=readFileSync(path,'utf8');
const start=source.indexOf('  const players = runtime.compatibilityMembers().map(');
const end=source.indexOf('  if (role1ShadowQa)',start);
if(start<0||end<0) throw Error('Compatibility mapping locator changed');
const mapping=source.slice(start,end).replace(': TestScenePlayerView =>',' =>');
const rows=[];
for(const heroId of [1,2,3,4,5] as const) {
 const model=createHeroPartyRuntimeModel(['p1','p2'].map((slot,index)=>({slot:slot as 'p1'|'p2',heroId,x:100+index*200,y:250,width:48})));
 const markers=model.members.map(()=>({sprite:{},label:{}}));
 const players=new Function('runtime','markers','getHeroBaseStats',transformSync(mapping+'\nreturn players;', {loader:'ts'}).code)({compatibilityMembers:()=>model.members},markers,getHeroBaseStats);
 for(const [index,member] of model.members.entries()) {
  const view=players[index];const before={power:view.currentStats.power,defense:view.currentStats.defense};
  member.combat.effectiveStats.power+=18;member.combat.effectiveStats.defense+=15;
  if(view.currentStats!==member.combat.effectiveStats||view.currentStats.power!==before.power+18||view.currentStats.defense!==before.defense+15) throw Error('Current party attribute binding is stale');
  rows.push({heroId,slot:member.combat.slot,sameCombat:view.combat===member.combat.combat,sameSkill:view.skill===member.combat.skill,sameStats:view.currentStats===member.combat.effectiveStats,before,partyAfter:{power:member.combat.effectiveStats.power,defense:member.combat.effectiveStats.defense},skillBridgeInputAfter:{power:view.currentStats.power,defense:view.currentStats.defense}});
 }
}
const report={status:'current-compatibility-attribute-owner-passed',scope:'Actual production compatibility mapping and actual party model; sprites are inert markers, no Scene/browser or native oracle execution.',source:path,sourceSha256:createHash('sha256').update(source).digest('hex'),rows};
mkdirSync('docs/tasks/evidence/TASK-SLICE-242A',{recursive:true});
writeFileSync('docs/tasks/evidence/TASK-SLICE-242A/owner-binding.json',JSON.stringify(report,null,2)+'\n');
console.log('242A owner binding: 10 hero/slot cases share current power/defense inputs.');

