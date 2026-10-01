import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { PetPassiveSession, readPetAptitude } from '../src/systems/PetPassiveSession';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createHeroPartyRuntimeModel } from '../src/systems/HeroPartyRuntimeSystem';
import { addHeroPetBuff, stepHeroPetBuffs } from '../src/systems/HeroPetBuffSystem';
function equal(a:any,b:any,label='',key=''):void {
 if(key==='value'&&typeof a==='number'&&typeof b==='number') {assert(Math.abs(a-b)<=1e-12*Math.max(1,Math.abs(b)),label);return;}
 if(a&&b&&typeof a==='object'&&typeof b==='object') {
  assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort(),label);
  for(const k of Object.keys(a))equal(a[k],b[k],label,k);
 } else assert.deepEqual(a,b,label);
}
const original=JSON.parse(readFileSync('docs/reverse-engineering/reference/pet-passive-auto-buff-contract.json','utf8'));
const extra=JSON.parse(readFileSync('docs/reverse-engineering/reference/pet-passive-input-contract.json','utf8'));
const covered:string[]=[];
function setup(form=1,fps=24,technique=3,warpower=1) {
 const pet=createSeedPetRoster().pets[0]!;
 Object.assign(pet,{form,level:10,hp:100,maxHp:1000,mp:1000,maxMp:1000,technique,warpower,skills:[]});
 const p=createHeroPartyRuntimeModel([{slot:'p1',heroId:1,x:0,y:0,width:48}]).members[0]!.combat;
 Object.assign(p.combat,{hp:333,maxHp:1000});Object.assign(p.skill,{mp:77,maxMp:200});
 Object.assign(p.effectiveStats,{power:101,defense:39,maxHp:1000,maxMp:200});
 const passive=new PetPassiveSession();
 const ready=()=>{(passive as any).counters=[0,0,0,0,0,0];};
 const learn=()=>{pet.skills=['sxkb','fsnl','smjc','mfjc','gjjc','fyjc'];};
 const check=()=>passive.check(pet,fps,(name,v,time)=>addHeroPetBuff(p,name,v,time));
 const step=(stun=false)=>{passive.recover(pet,fps);if(!stun)check();passive.refresh(pet);passive.stepEffects();};
 const hero=()=>p.petBuffs.effects.map(e=>{if(!e)return null;const copy:any={...e};if(copy.isFirst)delete copy.startTime;return copy;});
 const stats=()=>[p.combat.hp,p.skill.mp,p.combat.maxHp,p.skill.maxMp,p.effectiveStats.power,p.effectiveStats.defense];
 const state=()=>({pet:passive.snapshot().pet,hero:hero(),stats:stats(),magic:passive.bonuses().magic,crit:.2<=.1+passive.bonuses().crit});
 return {pet,p,passive,ready,learn,check,step,hero,stats,state};
}
for(const c of original.expectedCases) {
 const {input:i,result:r}=c;const a=setup(i.form,i.fps);const s=a.passive;
 if(c.id.startsWith('gate/')) {
  a.pet.mp=i.mp;if(i.learned)a.learn();if(i.ready)a.ready();a.step();
  const actual={hp:a.pet.hp,mp:a.pet.mp,...s.snapshot(),hero:a.hero(),magic:s.bonuses().magic,crit:.2<=.1+s.bonuses().crit};
  const {events,...expected}=r;equal(actual,expected,c.id);
 } else if(c.id.startsWith('period/')) {
  a.pet.mp=10;if(i.mode==='dead')a.pet.hp=0;
  for(let tick=1;tick<=2*(i.fps+1)+1;tick++) {
   if(i.mode==='refresh'&&tick===i.fps+1)a.pet.level=25;
   if(i.mode!=='pause')a.step(i.mode==='stun');
   const e=r.find((row:any)=>row.tick===tick);
   if(e) {const snap=s.snapshot();equal({tick,hp:a.pet.hp,mp:a.pet.mp,ehp:snap.ehp,emp:snap.emp,counts:snap.counts},e,c.id);}
  }
 } else if(c.id.startsWith('initial/')) {
  a.learn();let first=0;for(let t=1;t<=301;t++){a.step();if(!first&&s.bonuses().crit)first=t;}
  equal({first,counts:s.snapshot().counts},r,c.id);
 } else if(c.id.startsWith('cooldown/')) {
  a.learn();a.ready();a.pet.mp=a.pet.maxMp=100000;
  for(let tick=1;tick<=5402;tick++){a.step();const e=r.find((row:any)=>row.tick===tick);if(e)equal({tick,counts:s.snapshot().counts},e,c.id);}
 } else if(c.id.startsWith('effects/')) {
  a.learn();a.ready();a.step();equal(a.stats(),r.initial);
  for(let tick=0;tick<=i.duration+2;tick++){stepHeroPetBuffs(a.p);const e=r.rows.find((x:any)=>x.tick===tick);if(e)equal({tick,stats:a.stats(),effects:a.hero()},e,c.id);}
 } else if(c.id.startsWith('level/')) {
  a.pet.level=i.level;s.refresh(a.pet);equal({hp:s.snapshot().ehp,mp:s.snapshot().emp},r);
 } else if(c.id==='refresh'||c.id==='expiry') {
  s.add('gjjc',7,3);s.stepEffects();s.add('gjjc',99,5);
  if(c.id==='refresh')equal(s.snapshot().pet,r);
  else for(const row of r){s.stepEffects();equal(s.snapshot().pet,row);}
 } else if(c.id==='no-effect') {
  a.learn();a.ready();s.destroy();a.check();equal({mp:a.pet.mp,counts:s.snapshot().counts,hero:a.hero()},r);
 } else if(c.id==='caps') {
  a.pet.hp=a.pet.mp=999;(s as any).tCount=24;s.refresh(a.pet);a.step();
  assert.equal(a.pet.hp,r.hp);assert.equal(a.pet.mp,r.mp);equal(s.snapshot().counts,r.counts);
 } else if(c.id==='destroy-replace') {
  a.learn();a.ready();a.step();const before=a.hero();s.destroy();equal(before,r.heroBefore);equal(a.hero(),r.heroAfter);equal(new PetPassiveSession().snapshot().counts,r.newCounts);equal(s.snapshot().pet,[]);
 } else if(c.id==='active-only') {
  const rest=setup();for(let tick=0;tick<30;tick++)a.step();
  equal({active:s.snapshot().counts,resting:rest.passive.snapshot().counts,activeHp:a.pet.hp,restingHp:rest.pet.hp},r);
 } else throw new Error('Uncovered '+c.id);
 covered.push(c.id);
}
for(const c of extra.expectedCases) {
 const {input:i,result:r}=c;
 if(c.id.startsWith('domain/')) {
  const a=setup(i.form,i.fps,i.technique,i.warpower);a.learn();a.ready();a.check();
  equal(a.state(),r.enrolled,c.id);
  assert.equal(a.pet.mp,r.mp);equal(a.passive.snapshot().counts,r.counts);
  for(let tick=0;tick<=r.rows.at(-1).tick;tick++) {
   stepHeroPetBuffs(a.p);a.passive.stepEffects();const e=r.rows.find((row:any)=>row.tick===tick);
   if(e)equal({tick,state:a.state()},e,c.id);
  }
 } else if(c.id.startsWith('getter/')) {
  assert.equal(readPetAptitude(i.raw),r.technique);assert.equal(readPetAptitude(i.raw),r.warpower);
 } else if(c.id.startsWith('setter/')) {
  // Source setter probes are input-boundary evidence, not a new modern save setter.
  assert.equal(readPetAptitude(i.raw>>>0),r.technique);assert.equal(i.raw>>>0,r.stored.technique);
 } else if(c.id.startsWith('refresh/')) {
  const s=new PetPassiveSession();s.add('gjjc',7,i.time);s.stepEffects();s.add('gjjc',99,i.refreshTime);
  equal(s.snapshot().pet,r.initial);for(const row of r.rows){s.stepEffects();equal(s.snapshot().pet,row);}
 } else throw new Error('Uncovered '+c.id);
 covered.push('243/'+c.id);
}
assert.equal(covered.length,1717);assert.equal(new Set(covered).size,1717);
if(!process.env.PET_PASSIVE_MUTATION){mkdirSync('docs/tasks/evidence/TASK-SLICE-242B',{recursive:true});writeFileSync('docs/tasks/evidence/TASK-SLICE-242B/native-consumption.json',JSON.stringify({status:'passed',covered},null,2)+'\n');}
console.log('242B:1717 source cases consumed; setter probes retain explicit input-boundary scope.');
