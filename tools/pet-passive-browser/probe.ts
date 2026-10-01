import { game } from '../../src/main';
import { createSeedPetRoster } from '../../src/systems/PetRosterSystem';
import { FormalPetsUpdatedEvent } from '../../src/scenes/feature-ui/FormalPetRuntimeBridge';
import { readHeroPartyPresentationSnapshot,readHeroPartyPetSnapshots } from '../../src/scenes/HeroPartyRuntimeBridge';
import { LevelResultAssetKeys } from '../../src/assets/AssetManifest';
let time=0;const rosters:any={};let old:any[]=[];
const scene=()=>game.scene.getScenes(true).find(s=>readHeroPartyPresentationSnapshot(s));
const party=()=>(window as any).__passiveParty;
function step(n=1,delta=1000/30){game.loop.stop();time=Math.max(time,game.loop.now);for(let i=0;i<n;i++){game.loop.delta=delta;time+=delta;game.step(time,delta);}}
function texts(){const rows:any[]=[];const visit=(list:any[],visible=true)=>{for(const o of list){const live=visible&&o.visible!==false;if(o.text&&live){const b=o.getBounds();rows.push({text:o.text,x:b.x,y:b.y,width:b.width,height:b.height,visible:live});}if(o.list)visit(o.list,live);}};visit(scene()?.children.list??[]);return rows;}
Object.assign(window,{passiveProbe:{
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
 capture(){step(1,0);return game.canvas.toDataURL('image/png').split(',')[1];},
 snapshot(){return {scene:scene()?.scene.key,fps:game.loop.targetFps,pets:scene()&&readHeroPartyPetSnapshots(scene()!),
  hud:party()?.hudSnapshots(),heroes:party()?.compatibilityMembers().map((m:any)=>({effects:m.combat.petBuffs,stats:m.combat.effectiveStats,hp:m.combat.combat.hp,mp:m.combat.skill.mp})),
  roster:Object.fromEntries(Object.entries(rosters).map(([slot,r]:any)=>[slot,r.pets.find((p:any)=>p.isActive)])),texts:texts(),
  saves:Object.fromEntries(Object.entries(localStorage))};},
 rest(slot:string){rosters[slot].pets.forEach((p:any)=>p.isActive=false);scene()!.events.emit(FormalPetsUpdatedEvent,{owner:slot,roster:rosters[slot]});step(1,0);},
 fail(){for(const m of party().compatibilityMembers()){m.combat.combat.hp=0;m.combat.combat.state='dead';}step(90);},
 result(action:string){const find=(list:any[]):any=>{for(const o of list){if(o.texture?.key===(action==='retry'?LevelResultAssetKeys.retryUp:LevelResultAssetKeys.backUp))return o;const child=o.list&&find(o.list);if(child)return child;}};
  const s=scene()!;old=[...s.children.list];const button=find(s.children.list);if(!button)throw Error('Missing actual '+action);button.emit('pointerup');step(1,0);},
 oldReleased(){return old.every(o=>!o.scene&&!o.active);},
}});
