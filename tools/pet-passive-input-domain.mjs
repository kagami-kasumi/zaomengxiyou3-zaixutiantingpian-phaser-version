/** Actual production input/codec calls, separate from native oracle generation. */
import assert from 'node:assert/strict';
import { readFileSync,writeFileSync,mkdirSync } from 'node:fs';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),outfile=path.join(root,'.tmp/pet-passive-input-domain.mjs');
await build({stdin:{contents:`export { catchNewPet } from './src/systems/PetRosterSystem';
export { rerollPetGrowthAttributes, returnPetToChild } from './src/systems/PetGrowthSystem';
export { encodePet, decodePet } from './src/systems/SaveSystem';`,resolveDir:root,loader:'ts'},
 bundle:true,platform:'node',format:'esm',outfile,logLevel:'silent',plugins:[{name:'expose-existing-decoder',setup(b){
 b.onLoad({filter:/SaveSystem\.ts$/},args=>({contents:readFileSync(args.path,'utf8')+'\nexport { decodePet };',loader:'ts'}));
 }}]});
const api=await import(pathToFileURL(outfile).href),rows=[];
for(const ownerSlot of ['p1','p2']) {
 for(let technique=0;technique<=8;technique++) for(let warpower=0;warpower<=8;warpower++) {
  const roster={pets:[],selectedIndex:0,message:'',ownerSlot};const pet=api.catchNewPet(roster,'monkey1',10);
  assert(pet);assert.equal(pet.technique,1);assert.equal(pet.warpower,1);
  const reach=value=>{if(value<=4)return value/4;return 1;};
  // First two reroll fields use a disposable perception draw and the selected technique draw.
  const draws=[0,reach(Math.min(technique,4)),reach(Math.min(warpower,4))];
  api.rerollPetGrowthAttributes(pet,()=>draws.shift());
  // Values 5..8 are reachable through actual return-child draws, independently per field.
  if(technique>=5 || warpower>=5) {
   const child={...pet};
   // return-child consumes quality/stat random draws first; use constant witnesses separately.
   for(const value of [technique,warpower].filter(v=>v>=5)) {
    assert(api.returnPetToChild(child,()=>(value-4)/4));assert.equal(child.technique,value);assert.equal(child.warpower,value);
   }
  }
  // Each axis witness is recorded separately; decoder Cartesian product is controlled input.
  for(const value of [technique,warpower].filter(v=>v<=4)) {
   const witness=api.catchNewPet({pets:[],selectedIndex:0,message:''},'monkey1',10);
   api.rerollPetGrowthAttributes(witness,()=>value/4);assert.equal(witness.technique,value);assert.equal(witness.warpower,value);
  }
  pet.technique=technique;pet.warpower=warpower;
  const decoded=api.decodePet(api.encodePet(pet),0,ownerSlot);
  assert.equal(decoded.technique,technique);assert.equal(decoded.warpower,warpower);
  rows.push({ownerSlot,technique,warpower,decoded:[decoded.technique,decoded.warpower]});
 }
}
const external=[];
for(const raw of [-1,0.5,8.9,9,100]) {
 const pet=api.catchNewPet({pets:[],selectedIndex:0,message:''},'monkey1',10);
 pet.technique=pet.warpower=raw;const decoded=api.decodePet(api.encodePet(pet),0,'p1');
 external.push({raw,decoded:[decoded.technique,decoded.warpower]});assert.equal(decoded.technique,Math.max(0,raw));
}
const out=path.join(root,'docs/tasks/evidence/TASK-SETTINGS-243');mkdirSync(out,{recursive:true});
writeFileSync(path.join(out,'production-domain.json'),JSON.stringify({rows,external,
 boundary:'Actual public growth/capture and existing private codec exposed only in bundle; Cartesian codec pairs injected after independent axis reachability witnesses; no native expected generated.'},null,2)+'\n');
console.log('243:162 integer codec pairs, 0..8 production witnesses, 5 external codec boundaries passed');
