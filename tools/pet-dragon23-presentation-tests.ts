import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createPetDragonPresentationBridge } from '../src/scenes/PetDragonPresentationBridge';
import { getPetDragonBodyAsset, getPetDragonBodyAction } from '../src/assets/PetDragonAnimationAssets';
import index from '../docs/tasks/evidence/TASK-SETTINGS-213/baseline-index.json';
import catalog from '../src/assets/PetDragonAssetFiles.json';

class Display {
  x: number; y: number; key: string; frame = 0; flipX = false; alpha = 1; destroyed = false;
  name = ''; depth = 0; origin = [0, 0]; data: Record<string, unknown> = {};
  constructor(x: number, y: number, key: string) { this.x=x; this.y=y; this.key=key; }
  setOrigin(x: number,y: number) { this.origin=[x,y]; return this; }
  setDepth(v: number) { this.depth=v; return this; }
  setName(v: string) { this.name=v; return this; }
  setPosition(x: number,y: number) { this.x=x; this.y=y; return this; }
  setFrame(v: number) { this.frame=v; return this; }
  setFlipX(v: boolean) { this.flipX=v; return this; }
  setAlpha(v: number) { this.alpha=v; return this; }
  setTexture(v: string) { this.key=v; return this; }
  setData(k: string,v: unknown) { this.data[k]=v; return this; }
  destroy() { this.destroyed=true; }
}
const displays: Display[]=[];
const add=(x:number,y:number,key:string) => { const d=new Display(x,y,key);displays.push(d);return d; };
const view=createPetDragonPresentationBridge({add:{sprite:add,image:add}} as any);
const projections: any[]=[];
const states=index.items.filter(state => state.id.startsWith('dragon2') || state.id.startsWith('dragon3'));
for(const state of states) {
  const form = Number(state.id[6]) as 2 | 3;
  const facingX=state.id.endsWith('.right')?1:-1;
  const clone=state.id.includes('fs-clone');
  const bodyCell='bodyCell' in state ? state.bodyCell : undefined;
  const action=bodyCell?.action ?? (clone?'wait':state.id.split('.')[1]!);
  const effect=state.id[7] === '-';
  const nine=state.id.includes('nine-object-wave');
  const symbol=state.id.startsWith('dragon2-sdcc')?'PetDragon2Bullet2':state.id.startsWith('dragon3-ltwj')?'PetDragon3Bullet3':`PetDragon${form}Bullet1`;
  const asset=getPetDragonBodyAsset(form);
  const timeline=effect?undefined:getPetDragonBodyAction(form,action);
  const column=bodyCell?.column ?? (['wait','walk','hurt'].includes(action)||clone||effect?0
    :action==='normal'?(form===2?3:2):timeline!.cells.length-1);
  const runtime={runtimeKey:'root',petId:'pet',x:clone?370:470,y:clone?300:350,facingX,state:'idle'};
  const entity={petId:'pet',species:'dragon',form,runtime,animation:{row:timeline?.row??0,column},
    ...(clone?{parentRuntimeKey:'parent'}:{})};
  const frame=nine?1:effect?Number(state.id.match(/frame(\d+)/u)![1]):0;
  const offsets=nine?[[0,40],[-150,30],[90,15],[-90,15],[150,30],[-270,15],[210,30],[-210,15],[270,30]]
    :symbol==='PetDragon2Bullet2'?[[0,10]]:symbol==='PetDragon3Bullet3'?[[0,40]]:[[30*facingX,0]];
  view.update([clone?{summons:[entity]}:entity] as any,effect?offsets.map(([x,y],id)=>({
    id,sourceId:'pet',sourceSymbol:symbol,petHostTick:frame,x:470+x,y:350+y,facingX,
  })) as any:[]);
  const layers=displays.filter(d=>!d.destroyed&&(effect?d.name.startsWith('PetDragonProjectile'):d.name.startsWith('PetDragonBody'))).map(d=>{
    const file=catalog.files.find(f=>f.key===d.key)!;
    assert.deepEqual(d.origin,[0,0]);
    return {path:file.path,key:d.key,x:d.x,y:d.y,flipX:d.flipX,alpha:d.alpha,
      ...(effect?{}:{crop:[d.frame%asset.columns*asset.cellWidth,Math.floor(d.frame/asset.columns)*asset.cellHeight,
        (d.frame%asset.columns+1)*asset.cellWidth,(Math.floor(d.frame/asset.columns)+1)*asset.cellHeight]})};
  });
  assert.equal(layers.length,nine?9:1,state.id);
  projections.push({id:state.id,baseline:state.path,layers});
  view.update([],[]);
  assert.ok(displays.every(d=>d.destroyed),'released entity and projectile must leave no display');
}
// Stable runtime keys retain views; distinct P1/P2 keys never share a display.
const snapshot=(key:string,column:number)=>({species:'dragon',form:1,petId:key,
  runtime:{runtimeKey:key,x:100,y:200,facingX:1},animation:{row:0,column}});
view.update([snapshot('p1',0),snapshot('p2',2)] as any,[]);
const live=displays.filter(d=>!d.destroyed);assert.equal(live.length,2);
view.update([snapshot('p1',3)] as any,[]);
assert.equal(live[0]!.frame,3);assert.equal(live[1]!.destroyed,true);
view.destroy();view.destroy();assert.ok(displays.every(d=>d.destroyed));
mkdirSync('docs/tasks/evidence/TASK-SLICE-214D',{recursive:true});
writeFileSync('docs/tasks/evidence/TASK-SLICE-214D/view-projections.json',JSON.stringify({
  scope:'Actual production presenter output; Phaser display protocol capture, independently rendered against original baselines',projections},null,2)+'\n');
console.log(`Dragon23 production presenter: ${projections.length} original states, P1/P2 identity and release passed.`);
execFileSync('python', ['tools/verify-dragon1-presentation.py', '--dragon23'], { stdio: 'inherit' });
