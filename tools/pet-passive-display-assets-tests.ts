import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { gunzipSync } from 'node:zlib';
import { petPassivePose, petPassiveProfile } from '../src/assets/PetPassiveAssets';
const read=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const data=read('src/assets/pet-passive.generated.json');
const contract=read('local-resources/regima/task-outputs/TASK-SETTINGS-246/projection-contract.json');
const accepted=read('docs/tasks/evidence/TASK-SETTINGS-246/acceptance.json');
const sha=(p:string)=>createHash('sha256').update(readFileSync(p)).digest('hex');
assert.equal(accepted.status,'accepted');assert.equal(data.contractSha256,accepted.contractSha256);
assert.equal(data.contractSha256,sha('local-resources/regima/task-outputs/TASK-SETTINGS-246/projection-contract.json'));
const native=JSON.parse(gunzipSync(readFileSync('docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz')).toString());
const samples=new Map(contract.samples.map((s:any)=>[s.key,s])),states=new Map(contract.states.map((s:any)=>[s.id,s]));
const images=new Map(data.images.map((s:any)=>[s.key,s]));
for(const img of data.images)assert.equal(sha('public/'+img.path),img.sha256);
assert.deepEqual(data.shapeDefinitions,contract.shapes);
const find=(n:any,t:string):any=>n.type===t?n:n.children.map((c:any)=>find(c,t)).find(Boolean);
const strip=(n:any):any=>{const {characterId,...rest}=n;return {...rest,children:n.children.map(strip)};};
let count=0;
for(const r of native.rows){const [effect,profile]=r.id.split('-'),node=find(r.display,'buff_'+effect);
 if(!node)continue;const pet=['sxkb','fsnl'].includes(effect),host=r.display.children.find((n:any)=>n.name==='host');if(pet&&host.alpha!==1)continue;
 const m=r.hostMatrix,sign=pet?m.a:r.bullets[0].a<0?-1:1,nested=pet?node.children[0].frame:0;
 const key=[effect,profile,node.frame,nested,sign<0?-1:1,m.x%1,m.y%1].join(':');
 const p=petPassivePose(effect,profile,node.frame,nested,sign,m.x,m.y);
 const sample:any=samples.get((states.get(r.id+':'+r.tick+':'+r.phase) as any).key);
 assert.equal((images.get(p.key) as any).sha256,sample.sha256);assert.equal(p.x,Math.floor(m.x)+sample.crop.left);assert.equal(p.y,Math.floor(m.y)+sample.crop.top);
 assert.deepEqual(strip(data.displayTrees[key]),sample.tree);count++;
}
for(const family of ['monkey','horse','dragon','turtle'])for(let form=1;form<=4;form++){
 const profile=petPassiveProfile(family,form);for(const effect of ['sxkb','fsnl'] as const)for(const [x,y] of [[13.137,-24.299],[.499,.501],[-.5,-.5]]){
 const p=petPassivePose(effect,profile,1,1,1,x!,y!);assert(Math.abs(p.offsetX)<=.5&&Math.abs(p.offsetY)<=.5);assert.equal(p.alignment,'pixel-aligned');}}
assert.throws(()=>petPassivePose('sxkb','monkey1',1,1,2,0,0));
assert.throws(()=>petPassiveProfile('unknown',1));assert.throws(()=>petPassivePose('sxkb','unknown',1,1,1,0,0));
writeFileSync('docs/tasks/evidence/TASK-SLICE-245B/asset-consumption.json',JSON.stringify({status:'passed',states:count,images:data.images.length,poses:Object.keys(data.poses).length,metadataTrees:Object.keys(data.displayTrees).length,runtimeSha256:sha('src/assets/pet-passive.generated.json')}));
console.log(`245B assets: ${count} original opaque states, full trees/matrices/filters, ${data.images.length} PNG hashes and bounded alignment passed.`);
