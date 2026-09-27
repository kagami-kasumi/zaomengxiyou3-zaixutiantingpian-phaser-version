import { applyHeroMagicInvulnerability } from '../src/systems/HeroCombatSystem';
import { game } from '../src/main';
import { readHeroPartyPresentationSnapshot, readHeroPartyPetSnapshots } from '../src/scenes/HeroPartyRuntimeBridge';
import { createDefaultGameSave, createSaveSlot, getSaveSlotStorageKey, ActiveSaveSlotStorageKey, loadActiveGame } from '../src/systems/SaveSlotSystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import { updateOwnedPetSystem } from '../src/scenes/test-scene/TestScenePetMagicBridge';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { encodePet } from '../src/systems/SaveSystem';
import { launchFormalFeatureUi } from '../src/scenes/feature-ui/FormalFeatureUiEntryBridge';
let time=0;
const scene=()=>game.scene.getScenes(true).find(s=>readHeroPartyPresentationSnapshot(s));
Object.assign(window,{monsterExperienceProbe:{
 snapshot:()=>({scene:scene()?.scene.key,loading:scene()?.load.isLoading(),heroes:scene()&&readHeroPartyPresentationSnapshot(scene()!),
   parties:(globalThis as any).__xpParties?.filter((p:any)=>!p.destroyed).map((p:any)=>p.members.map((m:any)=>({slot:m.combat.slot,level:m.combat.progression.level,exp:m.combat.progression.currentExp}))),
   rosters:((globalThis as any).__xpRosters??[]).filter((p:any)=>!p.model.destroyed).map((p:any)=>Object.fromEntries(Object.entries(p.rosters).map(([slot,r]:any)=>[slot,r?.pets.map((pet:any)=>[pet.id,pet.exp])]))),
   monsters:(globalThis as any).__xpMonsters?.filter((m:any)=>m.hp>0).map((m:any)=>({id:m.id,type:m.enemyType,hp:m.hp,x:m.x,y:m.y})),
   pets:scene()&&readHeroPartyPetSnapshots(scene()!),boss:(scene() as any)?.bossArena?.boss&&{hp:(scene() as any).bossArena.boss.hp,settlement:(scene() as any).bossArena.boss.experienceBinding?.settlement},
   events:(globalThis as any).__xpEvents??[],save:loadActiveGame(localStorage)}),
 prepare:(owner:'p1'|'p2',pet:boolean,legacy=false)=>{
   const save=createDefaultGameSave(new Date(),createPartyConfiguration(2,1,2)!);
   for(const key of ['player1','player2'] as const){save[key].level=20;save[key].currentExp=0;for(const p of save[key].pets){p.isActive=false;}}
   if(pet){const pets=save[owner==='p1'?'player1':'player2'].pets;
     if(legacy)pets.push(encodePet(createSeedPetRoster().pets.find(p=>p.species==='ufo')!));
     const p=pets.find(p=>p.species===(legacy?'ufo':'monkey'))!;p.isActive=true;p.level=20;p.exp=0;p.atk=10000;save[owner==='p1'?'player1':'player2'].selectedPetIndex=pets.indexOf(p);}
   localStorage.removeItem(getSaveSlotStorageKey(5));createSaveSlot(localStorage,5,save);localStorage.setItem(ActiveSaveSlotStorageKey,'5');
   (globalThis as any).__xpParties=[];(globalThis as any).__xpMonsters=[];(globalThis as any).__xpEvents=[];
   history.replaceState(null,'',location.pathname+'?players=2');
   scene()?.scene.restart({});
 },
 stop:()=>{time=game.loop.now;game.loop.stop();
   for(const party of (globalThis as any).__xpParties??[]) for(const member of party.members) applyHeroMagicInvulnerability(member.combat.combat,{sourceName:'experience-acceptance-survival',totalMs:3600000,remainingMs:3600000});
 },
 step:(count:number)=>{for(let i=0;i<count;i++){time+=1000/30;game.step(time,1000/30);}},
 bossStart:()=>{const s=scene() as any;for(const p of s.playerViews){p.movement.x=600;p.movement.y=350;p.sprite.setPosition(600,350);}s.activateBossFight();},
 bossPetAttack:(slot:'p1'|'p2')=>{const s=scene() as any,b=s.bossArena.boss;if(!b||b.hp<=0)return;
   const key=slot==='p1'?'petRuntime':'p2PetRuntime';
   s[key]=updateOwnedPetSystem({ownerSlot:slot,owner:s.getPlayer(slot),roster:slot==='p1'?s.petRoster:s.p2PetRoster,
     runtime:s[key],targets:[{id:'monster3',x:b.x,y:b.y,isAlive:b.hp>0}],projectiles:s.projectileSystem,
     deltaMs:1000/30,hostFps:30,syncView:()=>{},destroyView:()=>{}});
 },
 petPage:async(slot:'p1'|'p2')=>{const origin=scene()!;game.loop.start(game.step.bind(game));
   return launchFormalFeatureUi(origin,'pets',slot,{originKind:'combat',party:loadActiveGame(localStorage)!.party});},
 petPageState:()=>{const ui=game.scene.getScene('FeatureUiScene') as any;const texts:string[]=[];
   const visit=(o:any)=>{if(typeof o.text==='string')texts.push(o.text);if(o.list)for(const c of o.list)visit(c);};
   if(ui)visit(ui.children);return {active:ui?.scene.isActive(),texts,model:ui?.petModel};},
 keys:(codes:number[])=>{for(const s of game.scene.getScenes(true))for(const code of [65,68,74,75,87,37,39,97,98,38]){const key=s.input.keyboard?.addKey(code);if(key)key.isDown=codes.includes(code);}},
 restart:()=>{(globalThis as any).__xpParties=[];(globalThis as any).__xpMonsters=[];(globalThis as any).__xpEvents=[];scene()?.scene.restart({});},
}});
