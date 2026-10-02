import { ensureSceneAssetBundle } from '../src/scenes/SceneAssetBundleBridge';
import { game } from '../src/main';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { FormalPetsUpdatedEvent } from '../src/scenes/feature-ui/FormalPetRuntimeBridge';
import { readHeroPartyPresentationSnapshot,readHeroPartyPetSnapshots } from '../src/scenes/HeroPartyRuntimeBridge';
import { LevelResultAssetKeys } from '../src/assets/AssetManifest';
let time=0;const rosters:any={};let old:any[]=[];
const scene=()=>game.scene.getScenes(true).find(s=>readHeroPartyPresentationSnapshot(s));
const party=()=>(window as any).__passiveParty;
function step(n=1,delta=1000/30){game.loop.stop();time=Math.max(time,game.loop.now);for(let i=0;i<n;i++){game.loop.delta=delta;time+=delta;game.step(time,delta);}}
function texts(){const rows:any[]=[];const visit=(list:any[],visible=true)=>{for(const o of list){const live=visible&&o.visible!==false;if(o.text&&live){const b=o.getBounds();rows.push({text:o.text,x:b.x,y:b.y,width:b.width,height:b.height,visible:live});}if(o.list)visit(o.list,live);}};visit(scene()?.children.list??[]);return rows;}
let oracle:any;const nativeImages=new Map<string,ImageBitmap>();
async function compareVisuals(){
 oracle??=await fetch('oracle.json').then(r=>r.json());
 const s=scene()!,raw=(window as any).__passiveRaw,cam=s.cameras.main;
 if(cam.zoom!==1||cam.rotation!==0)throw Error('Unverified formal camera transform');
 const clips=[...[...raw.pets.values()].map((c:any)=>({...c,host:{x:c.root.x,y:c.root.y,profile:c.profile},sign:c.root.scaleX,alpha:c.root.alpha})),
 ...[...raw.heroes.values()].flat().map((c:any)=>({...c,alpha:1}))];
 const objects:any[]=[];const visit=(list:any[])=>{for(const o of list){objects.push([o,o.visible]);if(o.list)visit(o.list);}};visit(s.children.list);
 const reports=[];const bg=cam.backgroundColor.rgba;
 for(const c of clips){(window as any).pixelProgress={phase:'start',name:c.image.name};
  const frame=Math.max(1,Math.floor(c.elapsed*game.loop.targetFps/1000+1e-8)),h=c.host;
  const prefix=[c.effect,h.profile,frame,c.sign<0?-1:1].join(':')+':';
  const exact=oracle[prefix+[h.x-Math.floor(h.x),h.y-Math.floor(h.y)].join(':')];
  const pose=exact??oracle[prefix+'0:0'];if(!pose)throw Error('Missing independent formal native '+prefix);
  let source=nativeImages.get(pose.file);if(!source){(window as any).pixelProgress={phase:'decode',file:pose.file};const response=await fetch(pose.file);if(!response.ok)throw Error('Native PNG HTTP '+response.status);source=await createImageBitmap(await response.blob());nativeImages.set(pose.file,source);} (window as any).pixelProgress={phase:'render',name:c.image.name};
  for(const [o] of objects)o.visible=false;
  for(let o:any=c.image;o;o=o.parentContainer)o.visible=true;
  cam.setBackgroundColor('#000000');
  const renderer=game.renderer as any;renderer.preRender();game.scene.render(renderer);renderer.postRender();
  const actualCanvas=document.createElement('canvas');actualCanvas.width=940;actualCanvas.height=590;
  const ac=actualCanvas.getContext('2d',{willReadFrequently:true})!;ac.drawImage(game.canvas,0,0);const actual=ac.getImageData(0,0,940,590).data;
  ac.fillStyle='black';ac.fillRect(0,0,940,590);ac.globalAlpha=c.alpha;
  const x=(exact?Math.floor(h.x):Math.round(h.x))+pose.x-cam.scrollX;
  const y=(exact?Math.floor(h.y):Math.round(h.y))+pose.y-cam.scrollY;
  ac.imageSmoothingEnabled=false;ac.drawImage(source,x,y);ac.globalAlpha=1;
  const expected=ac.getImageData(0,0,940,590).data;let bad=0,maxDelta=0,residual=0;
  for(let i=0;i<actual.length;i+=4){let d=0;for(let k=0;k<3;k++)d=Math.max(d,Math.abs(actual[i+k]!-expected[i+k]!));if(d)residual++;if(d>3)bad++;maxDelta=Math.max(maxDelta,d);}
  reports.push({root:c.root&&{x:c.root.x,y:c.root.y,scaleX:c.root.scaleX,scaleY:c.root.scaleY},image:{x:c.image.x,y:c.image.y,scaleX:c.image.scaleX},matrix:c.image.getWorldTransformMatrix().matrix,host:h,scroll:[cam.scrollX,cam.scrollY],name:c.image.name,frame,source:pose.file,x,y,bad,maxDelta,residual,alpha:c.alpha});
 }
 for(const [o,v] of objects)o.visible=v;cam.setBackgroundColor(bg);const renderer=game.renderer as any;renderer.preRender();game.scene.render(renderer);renderer.postRender();
 return reports;
}
Object.assign(window,{passiveProbe:{compareVisuals,
 async settleAssets(){const s=scene()!;for(const m of party().compatibilityMembers())await ensureSceneAssetBundle(s,`combat-hero-${m.combat.normalAttack.heroId}-skills` as any);},
 pump(){if(game.renderer&&game.isRunning)step();},
 ready(){return !!scene()&&!scene()!.load.isLoading();},
 install(family:string,form:number){
  game.loop.stop();const s:any=scene();if(!s)throw Error('No formal scene');
  for(const [i,slot] of ['p1','p2'].entries()){
   const roster=createSeedPetRoster();roster.pets.forEach(p=>{p.id='passive-'+slot+'-'+p.id;p.isActive=p.species===family&&p.form===form;
    if(p.isActive)Object.assign(p,{level:10,technique:3,warpower:1,hp:100+100*i,maxHp:1000,mp:1000,maxMp:1000,atk:1,def:100000,skills:['sxkb','fsnl','smjc','mfjc','gjjc','fyjc']});});
   rosters[slot]=roster;if(s.playerPetRosters){s.playerPetRosters[slot]=roster;if(i===0)s.petRoster=roster;else s.p2PetRoster=roster;}
   s.events.emit(FormalPetsUpdatedEvent,{owner:slot,roster});
  }
  for(const [i,m] of party().compatibilityMembers().entries()){
   Object.assign(m.combat.combat,{hp:333+111*i,maxHp:1000,invulnerableUntilMs:Number.MAX_SAFE_INTEGER});
   Object.assign(m.combat.skill,{mp:77+11*i,maxMp:200});
   Object.assign(m.combat,{mp:77+11*i,maxMp:200});
   Object.assign(m.combat.effectiveStats,{maxHp:1000,maxMp:200,power:101,defense:39});
  }
  step(1,0);
 },
 step,
 pause(n:number){const s=scene()!;s.scene.pause();step(n);s.scene.resume();step(1,0);},
 visuals(){const rows:any[]=[];const visit=(list:any[])=>{for(const o of list){if(o.name?.startsWith('passive:'))rows.push({name:o.name,parent:o.parentContainer?.name??null,projection:o.getData('passiveProjection'),visible:o.visible,alpha:o.alpha});if(o.list)visit(o.list);}};visit(scene()?.children.list??[]);return rows;},
 capture(){step(1,0);return game.canvas.toDataURL('image/png').split(',')[1];},
 snapshot(){return {pixelProgress:(window as any).pixelProgress,visual:(window as any).__passiveDisplay?.snapshot(),scene:scene()?.scene.key,fps:game.loop.targetFps,pets:scene()&&readHeroPartyPetSnapshots(scene()!),
  hud:party()?.hudSnapshots(),heroes:party()?.compatibilityMembers().map((m:any)=>({effects:m.combat.petBuffs,stats:m.combat.effectiveStats,hp:m.combat.combat.hp,mp:m.combat.skill.mp})),
  roster:Object.fromEntries(Object.entries(rosters).map(([slot,r]:any)=>[slot,r.pets.find((p:any)=>p.isActive)])),texts:texts(),
  saves:Object.fromEntries(Object.entries(localStorage))};},
 rest(slot:string){rosters[slot].pets.forEach((p:any)=>p.isActive=false);scene()!.events.emit(FormalPetsUpdatedEvent,{owner:slot,roster:rosters[slot]});step(1,0);},
 fail(){for(const m of party().compatibilityMembers()){m.combat.combat.hp=0;m.combat.combat.state='dead';}step(90);},
 result(action:string){const find=(list:any[]):any=>{for(const o of list){if(o.texture?.key===(action==='retry'?LevelResultAssetKeys.retryUp:LevelResultAssetKeys.backUp))return o;const child=o.list&&find(o.list);if(child)return child;}};
  const s=scene()!;old=[...s.children.list];const button=find(s.children.list);if(!button)throw Error('Missing actual '+action);button.emit('pointerup');step(1,0);},
 oldReleased(){return old.every(o=>!o.scene&&!o.active);},
}});
