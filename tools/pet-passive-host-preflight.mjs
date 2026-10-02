import { EventEmitter } from 'node:events';
import { build } from 'esbuild';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { transformSync } from 'esbuild';

await build({entryPoints:['src/scenes/PetAttachedDisplayLifecycle.ts'],bundle:true,platform:'node',format:'esm',outfile:'.tmp/pet-passive-host-lifecycle.mjs',logLevel:'silent'});
const {petAttachedDisplayLifecycle}=await import(pathToFileURL(path.resolve('.tmp/pet-passive-host-lifecycle.mjs')).href);

// Actual adapter closures with explicit display spies; no visual acceptance claim.
const rows = [];
for (const family of ['Dragon', 'Turtle']) {
  const file = `src/scenes/Pet${family}${family === 'Dragon' ? 'Presentation' : 'Combat'}Bridge.ts`;
  const name = `createPet${family}${family === 'Dragon' ? 'Presentation' : 'Combat'}Bridge`;
  const source = readFileSync(file, 'utf8');
  const code = transformSync(source.slice(source.indexOf(`export function ${name}`)).replace('export function', 'function'), { loader: 'ts' }).code;
  for (const operation of ['rest', 'replace', 'exit']) {
    const displays = [];
    const make = () => {
      const view = Object.assign(new EventEmitter(), { alpha:1, list:[], destroyed:false, update(){}, destroy(){if(this.destroyed)return;this.destroyed=true;for(const child of this.list)child.destroy();this.emit('destroy');} });
      view.add=child=>{view.list.push(child);child.parentContainer=view;};view.body=view;
      for (const method of ['setOrigin', 'setDepth', 'setName', 'setPosition', 'setFlipX', 'setFrame', 'setAlpha', 'setData']) view[method] = () => view;
      displays.push(view); return view;
    };
    const inputs = { petAttachedDisplayLifecycle,
      getPetDragonBodyAsset: () => ({ key: 'explicit-test-body', columns: 1 }),
      getPetDragonBodyPlacement: (_form, _direction, runtime) => runtime,
      getPetDragonCloneAlpha: () => 0.5,
      createDefaultPetBehaviorRegistry: () => ({}),
      requireTurtleAssets: () => ({ body: () => ({ id: 'explicit-test-body' }), linkOffset: () => ({ x: 0, y: 0 }) }),
      createPetTurtlePresentationBridge: make,
    };
    const factory = new Function(...Object.keys(inputs), `${code}\nreturn ${name};`)(...Object.values(inputs));
    const scene = { add: { sprite: make, container:make }, game:{events:new EventEmitter()}, events:new EventEmitter(), cameras: { main: { scrollX: 0, scrollY: 0 } } };
    const bridge = factory(scene);
    const snapshot = key => ({ species: family.toLowerCase(), form: 1, petId: key,
      runtime: { runtimeKey: key, x: 350, y: 350, facingX: 1 }, animation: { row: 0, column: 0 } });
    const update = key => bridge.update(family === 'Dragon' ? (key ? [snapshot(key)] : []) : (key ? { p1: snapshot(key) } : {}), []);
    update('original');
    assert.equal(displays[0].destroyed, false);
    const lifecycle=petAttachedDisplayLifecycle(scene),attachment=make();
    lifecycle.attach('original','probe',{object:attachment,display:()=>true});
    if (operation === 'exit') bridge.destroy(); else update(operation === 'replace' ? 'replacement' : undefined);
    assert.equal(displays[0].destroyed, true);
    assert.equal(attachment.destroyed,operation==='exit');
    scene.game.events.emit('prestep',1000,1000);assert.equal(attachment.destroyed,true);
    rows.push({ family, operation, oldDisplayImmediatelyDestroyed:true, attachmentRetiresIndependently:true, file,
      sha256: createHash('sha256').update(source).digest('hex') });
    bridge.destroy();scene.events.emit('shutdown');assert.equal(lifecycle.snapshot().length,0);
  }
}
const out = 'docs/tasks/evidence/TASK-SLICE-245B';
mkdirSync(out, { recursive: true });
writeFileSync(`${out}/host-preflight.json`, JSON.stringify({
  boundary: 'Actual Dragon/Turtle bridge control flow, explicit renderer/resource spies. Checks immediate body disposal, real common attachment retirement and shutdown; render spies do not prove pixels or a formal journey.', rows,
}, null, 2) + '\n');
console.log(`245B host preflight: ${rows.length} actual bridge cases confirm immediate display disposal.`);
