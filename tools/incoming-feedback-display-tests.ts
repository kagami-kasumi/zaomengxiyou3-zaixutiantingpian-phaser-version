import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createIncomingDamageFeedbackView } from '../src/scenes/IncomingDamageFeedbackView';
import { incomingDamageFeedbackAssets, incomingDamageFeedbackProjection } from '../src/assets/IncomingDamageFeedbackAssets';
import { sceneAssetBundles } from '../src/assets/SceneAssetBundles';
import { useIncomingDamageBitmapSampling } from '../src/scenes/IncomingDamageBitmapSampling';

// Independent inputs/oracle: original AIR measurements, never the production projection.
const source = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-215/native/measurement.json', 'utf8'));
assert.equal(incomingDamageFeedbackProjection.sourceManifestSha256,
  createHash('sha256').update(readFileSync('docs/reverse-engineering/ground-truth/manifests/task-settings-215-player-pet-incoming-damage-feedback.json')).digest('hex'));
class Display {
  x: number; y: number; scaleX=1; scaleY=1; alpha=1; depth=0; name=''; data: unknown;
  originX=0.5; originY=0.5; destroyed=false; filter=-1;
  texture={setFilter:(n:number)=>{this.filter=n;}};
  constructor(x:number,y:number,public key='',public list:Display[]=[]) {this.x=x;this.y=y;}
  setOrigin(x:number,y:number) {this.originX=x;this.originY=y;return this;}
  setScale(n:number) {this.scaleX=n;this.scaleY=n;return this;}
  setDepth(n:number) {this.depth=n;return this;}
  setName(n:string) {this.name=n;return this;}
  setData(_key:string,data:unknown) {this.data=data;return this;}
  setAlpha(n:number) {this.alpha=n;return this;}
  setY(n:number) {this.y=n;return this;}
  destroy() {this.destroyed=true;this.list.forEach(d=>d.destroy());}
}
function harness() {
  const containers:Display[]=[];
  let onShutdown:(()=>void)|undefined;
  const scene={add:{
    image:(x:number,y:number,key:string)=>new Display(x,y,key),
    container:(x:number,y:number,children:Display[])=>{
      const d=new Display(x,y,'',children);containers.push(d);return d;
    },
  },events:{once:(_e:string,f:()=>void)=>{onShutdown=f;},off:()=>{onShutdown=undefined;}}};
  const view=createIncomingDamageFeedbackView(scene as any);
  return {view,containers,shutdown:()=>onShutdown?.()};
}
const inputs:any[]=[];
for(const kind of ['hero','pet']) for(const owner of ['P1','P2']) {
  for(const time of [0,.1,.2,.25,.75,1.249,1.25]) inputs.push({
    id:`${kind}-${owner}-${time}`,time,value:123,kind,owner,
    x:owner==='P1'?300:680,y:kind==='hero'?350:430,
  });
}
for(const value of [-12,0,10,1234567890]) inputs.push({
  id:`direct-value-${value}`,time:0,value,kind:'hero',owner:'P1',x:470,y:350,
});
for(const input of inputs) {
  const h=harness();
  h.view.show({eventId:input.id,targetKind:input.kind,ownerSlot:input.owner.toLowerCase(),
    targetId:input.owner,displayValue:input.value,worldAnchor:{x:input.x,y:input.y}});
  h.view.update(input.time*1000);
  const actual=h.containers.filter(d=>!d.destroyed);
  const expected=source.states.find((s:any)=>s.id===input.id).objects;
  assert.equal(actual.length,expected.length,input.id);
  actual.forEach((a,i)=>{
    const e=expected[i];
    assert.equal(a.x,e.x,input.id);
    assert.ok(Math.abs(a.y-e.y)<=.051,input.id);
    assert.ok(Math.abs(a.scaleX-e.scaleX)<.0001,input.id);
    assert.ok(Math.abs(a.alpha-e.alpha)<=1/255,input.id);
    assert.equal(a.list.length,e.children.length);
    a.list.forEach((d,j)=>{
      const child=e.children[j];
      assert.equal(d.key,`combat-feedback.damage.incoming.${child.digit}`);
      assert.equal(d.x,child.x);assert.equal(d.y,child.y);
      assert.equal(d.originX,0);assert.equal(d.originY,0);assert.equal(d.filter,1);
      assert.ok(Math.abs(a.x+d.x*a.scaleX-child.stageBounds.x)<=.051);
      assert.ok(Math.abs(30*a.scaleX-child.stageBounds.width)<=.051);
    });
  });
  h.view.destroy();h.view.destroy();
  assert.ok(h.containers.every(d=>d.destroyed));
}
const h=harness();
const event={eventId:'hit->pet:p1:base:0',targetKind:'pet' as const,ownerSlot:'p1' as const,
  targetId:'pet:p1',displayValue:20,worldAnchor:{x:300,y:430}};
assert.equal(h.view.show(event),true);
assert.equal(h.view.show(event),false);
assert.equal(h.view.show({...event,eventId:'hit->pet:p1:extra:1'}),true);
assert.equal(h.view.show({...event,eventId:'hit->pet:p2:base:0',ownerSlot:'p2',targetId:'pet:p2',worldAnchor:{x:680,y:430}}),true);
assert.equal(h.containers.length,3);
h.view.destroyEvent(event.eventId);
assert.ok(h.containers[0]!.destroyed);
assert.equal(h.containers[1]!.destroyed,false);
h.view.update(750);h.view.update(500);
assert.ok(h.containers.every(d=>d.destroyed));
assert.equal(h.view.show(event),false,'replay stays rejected after natural destruction');
h.view.show({...event,eventId:'shutdown'});
h.shutdown();
assert.ok(h.containers.every(d=>d.destroyed));
assert.equal(h.view.show({...event,eventId:'after-shutdown'}),false);
const fresh=harness();
assert.equal(fresh.view.show(event),true,'new scene accepts its own session ids');
assert.throws(()=>fresh.view.show({...event,eventId:'nan',displayValue:NaN}));
assert.throws(()=>fresh.view.show({...event,eventId:'overflow',displayValue:2_147_483_648}));
fresh.view.destroy();
// ANumber.as aNumImage(param3:int,param4:int): conversion is after adding the world offset.
const fractional=harness();
fractional.view.show({...event,eventId:'fractional',worldAnchor:{x:300.75,y:430.5}});
assert.equal(fractional.containers[0]!.x,280);
assert.equal(fractional.containers[0]!.y,370);
fractional.view.show({...event,eventId:'negative-fractional',worldAnchor:{x:19.5,y:59.5}});
assert.equal(fractional.containers[1]!.x,0);
assert.equal(fractional.containers[1]!.y,0);
fractional.view.destroy();
// The local render adaptation must never leak camera/matrix changes into other game objects.
for(const throws of [false,true]) {
  const camera={roundPixels:true,renderRoundPixels:true,zoomX:1,zoomY:1};
  const parent={tx:280,ty:290};
  const render=function() {
    assert.equal(camera.roundPixels,false);
    assert.equal(camera.renderRoundPixels,false);
    assert.equal(parent.tx,280.01);assert.equal(parent.ty,290.01);
    if(throws)throw Error('renderer failure');
  };
  const image={renderCanvas:render,renderWebGL:render};
  useIncomingDamageBitmapSampling(image as any);
  for(const mode of ['renderCanvas','renderWebGL'] as const) {
    if(throws)assert.throws(()=>(image[mode] as any)({},image,camera,parent),/renderer failure/);
    else (image[mode] as any)({},image,camera,parent);
    assert.deepEqual(camera,{roundPixels:true,renderRoundPixels:true,zoomX:1,zoomY:1});
    assert.deepEqual(parent,{tx:280,ty:290});
  }
}
for(const asset of incomingDamageFeedbackAssets) {
  const hash=createHash('sha256').update(readFileSync('public'+asset.path)).digest('hex');
  assert.equal(hash,asset.sha256);
  const owners=Object.entries(sceneAssetBundles).filter(([,bundle])=>bundle.assets.some(a=>a.key===asset.key));
  assert.deepEqual(owners.map(([owner])=>owner),['combat-common']);
}
console.log(`216A: ${inputs.length} original measured states, producer display identity, cleanup and single-bundle ownership passed`);
