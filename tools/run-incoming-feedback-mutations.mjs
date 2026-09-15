import { build } from 'esbuild';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';

const root=path.resolve('.tmp/incoming-display-mutations');
mkdirSync(root,{recursive:true});
const fields={
  stride:['digitStride',21],anchor:['anchorOffset',{x:-19,y:-60}],
  pop:['popScale',3],popTime:['popSeconds',.3],delay:['delaySeconds',.2],
  rise:['risePixels',90],fadeTime:['fadeSeconds',.8],destroy:['destroySeconds',1.3],
};
const mutations=[...Object.entries(fields).map(([name,[field,value]])=>({name,field,value})),
  {name:'source-hash',rootField:'sourceManifestSha256',value:'0'.repeat(64)},
  {name:'owner-anchor',before:'input.worldAnchor.x + animation.anchorOffset.x',after:'input.worldAnchor.x + animation.anchorOffset.x + 380'},
  {name:'duplicate-id',before:'shown.has(input.eventId)',after:'false'},
  {name:'merged-producers',before:'shown.has(input.eventId)',after:'shown.size > 0'},
  {name:'destroy-leak',before:'entry.view.destroy(true);',after:'/* missing cleanup */'},
];
const killed=[];
for(const mutation of mutations){
  const outfile=path.join(root,mutation.name+'.mjs');
  await build({entryPoints:['tools/incoming-feedback-display-tests.ts'],bundle:true,platform:'node',format:'esm',
    outfile,logLevel:'silent',plugins:[{name:'mutate-actual-producer-display',setup(b){
      b.onLoad({filter:/IncomingDamageFeedbackProjection.json$/},args=>{
        if(!mutation.field&&!mutation.rootField)return;
        const json=JSON.parse(readFileSync(args.path,'utf8'));
        if(mutation.rootField)json[mutation.rootField]=mutation.value;
        else json.animation[mutation.field]=mutation.value;
        return {contents:JSON.stringify(json),loader:'json'};
      });
      b.onLoad({filter:/IncomingDamageFeedbackView.ts$/},args=>{
        if(!mutation.before)return;
        const source=readFileSync(args.path,'utf8');
        assert.ok(source.includes(mutation.before),'stale mutation site');
        return {contents:source.replace(mutation.before,mutation.after),loader:'ts'};
      });
    }}]});
  const result=spawnSync(process.execPath,[outfile],{encoding:'utf8',windowsHide:true});
  assert.notEqual(result.status,0,`escaped production mutation: ${mutation.name}`);
  assert.match(result.stderr,/AssertionError/,`not an assertion failure: ${mutation.name}\n${result.stderr}`);
  killed.push(mutation.name);
}
const out='docs/tasks/evidence/TASK-SLICE-216A';
mkdirSync(out,{recursive:true});
writeFileSync(out+'/implementation-mutations.json',JSON.stringify({
  scope:'In-memory mutations of production projection/view; independent original-measurement test; source and normal reports never edited',
  killed,
},null,2)+'\n');
console.log(`216A: ${killed.length} production field/owner/identity/lifecycle mutations killed`);
