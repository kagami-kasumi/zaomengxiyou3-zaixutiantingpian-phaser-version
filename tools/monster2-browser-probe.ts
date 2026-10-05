import './hero-gather-browser-probe';
import { captureMonster2AttackViews } from './monster2-visual-browser-probe';
import { captureMonster2RawDisplay } from './monster2-raw-visual-probe';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
const root = globalThis as any;
root.monster2Events = [];
root.monster2PetHitIds = {p1: [], p2: []};
root.monster2PetReceptionTrace = [];
root.monster2Non2FixtureApplied = false;
root.monster2PetMode = false;
const snapshot = () => {
  const o = root.monster2Observe;
  const party = root.heroGatherObserve?.parties?.find((p:any)=>p.scene===o?.scene&&!p.model.destroyed);
  const pets = Object.fromEntries(['p1','p2'].map(slot => {
    const roster = party?.petRosters?.[slot];
    const pet = roster?.pets?.find((candidate:any)=>candidate.isActive) ?? roster?.pets?.[roster?.selectedIndex ?? 0];
    const session = party?.runtime?.petSnapshots?.()?.[slot];
    const liveIds = ((session?.runtime?.runtimeKey && party?.petCombatRuntimes?.[slot])
      ?.currentMonsterReceptionTarget(session.runtime.runtimeKey, ()=>undefined)?.ids?.slice() ?? []);
    for (const id of liveIds) if (!root.monster2PetHitIds[slot].includes(id)) root.monster2PetHitIds[slot].push(id);
    return [slot, pet ? { id:pet.id, hp:pet.hp, maxHp:pet.maxHp, species:pet.species, form:pet.form,
      runtimeKey:session?.runtime?.runtimeKey, petId:session?.petId, phase:session?.phase,
      runtimeX:session?.runtime?.x, runtimeY:session?.runtime?.y, runtimeFacingX:session?.runtime?.facingX, runtimeState:session?.runtime?.state,
      sessionHitIds:root.monster2PetHitIds[slot].slice(),
      sessionTarget:session?.target ? {x:session.target.x,y:session.target.y} : undefined } : undefined];
  }));
  return { scene:o?.scene.scene.key, heroes:o?.heroes.compatibilityMembers().map((m:any)=>({
    slot:m.combat.slot,hp:m.combat.combat.hp,state:m.combat.combat.state,x:m.movement.x,y:m.movement.y,
    hitIds:[...(m.combat.combat.monsterHitIds ?? [])]})), pets,
    monsters:o?.monsters.combatTargets().map((m:any)=>({id:m.id,type:m.enemyType,x:m.x,y:m.y,hp:m.hp,
      action:m.monster2WorldState?.action,serial:m.attackSerial,oldAttack:!!m.activeAttack,
      body:m.monster2AttackRuntime?.body.action,
      attacks:m.monster2AttackRuntime?.attacks.map((a:any)=>({id:a.id,frame:a.frame,age:a.age,kind:a.attack}))})),
    raw:o?.scene.children.list.filter((v:any)=>v.name==='Monster2Bullet2').map((v:any)=>({active:v.active,visible:v.visible,key:v.texture.key,x:v.x,y:v.y})),
    gather:o?.heroes.gather.snapshot(),events:root.monster2Events.slice(),petReceptionTrace:root.monster2PetReceptionTrace.slice(),non2FixtureApplied:root.monster2Non2FixtureApplied };
};
root.monster2Probe = {
  snapshot,
  captureVisuals: async () => {
    const registered = await captureMonster2AttackViews(root.monster2Observe.scene);
    const raw = await captureMonster2RawDisplay(root.monster2Observe.scene);
    return { root: registered.root, states: [...registered.states, ...raw.states], frame14Exit: raw.frame14Exit };
  },
  prepare(fps:number, slots:string[], pets=false, keepOtherMonsters=false) {
    root.monster2PetMode = pets;
    root.monster2KeepOtherMonsters = keepOtherMonsters;
    root.heroGatherProbe.prepare(fps); root.heroGatherProbe.configure(fps);
    const o=root.monster2Observe;
    // Controlled encounter entry; production spawner/AI/body/HP remain active.
    o.flow.nextStopPointIdx=4;o.flow.activeStopPointIdx=undefined;o.flow.activeSpawners=[];o.flow.aliveEnemies.clear();
    o.scene.cameras.main.scrollX=3800;
    const party=root.heroGatherObserve.parties.find((p:any)=>p.scene===o.scene&&!p.model.destroyed);
    for(const [i,m] of party.model.members.entries()) {
      m.movement.x=4665+i*20;m.movement.y=400;m.movement.velocityX=0;m.movement.velocityY=0;
      m.combat.combat.hp=m.combat.combat.maxHp=slots.includes(m.combat.slot)?10000:0;
      m.combat.combat.state=slots.includes(m.combat.slot)?'idle':'dead';
      let roster = party.petRosters?.[m.combat.slot];
      let activePet = roster?.pets?.find((candidate:any)=>candidate.isActive);
      if (root.monster2PetMode && !activePet && slots.includes(m.combat.slot)) {
        const seed = structuredClone(createSeedPetRoster().pets.find((candidate:any)=>candidate.species === 'monkey' && candidate.form === 1));
        if (!seed) throw new Error(`Missing formal Monkey1 seed for ${m.combat.slot}`);
        seed.id = `qa-monster2-${m.combat.slot}-monkey1`; seed.hp = seed.maxHp = 10000; seed.isActive = true;
        roster = { pets:[seed], selectedIndex:0, message:'' };
        party.petRosters[m.combat.slot] = roster;
        activePet = seed;
      }
      if (root.monster2PetMode && activePet && slots.includes(m.combat.slot)) { activePet.hp = activePet.maxHp = 10000; activePet.isActive = true; }
      m.combat.effectiveStats.defense=0;m.combat.effectiveStats.missPercent=0;
    }
    root.heroGatherObserve.moves=[0,0];root.monster2Events.length=0;root.monster2PetHitIds={p1:[],p2:[]};root.monster2PetReceptionTrace=[];root.monster2Non2FixtureApplied=false;
    return snapshot();
  },
  step(count=1) {
    root.heroGatherProbe.step(count);
    if (!root.monster2Non2FixtureApplied && !root.monster2KeepOtherMonsters) {
      const non2 = root.monster2Observe?.monsters?.combatTargets?.().filter((enemy:any)=>enemy.enemyType !== 2) ?? [];
      if (root.monster2PetMode && non2.length) { for (const enemy of non2) { enemy.hp = 0; enemy.phase = 'dead'; } root.monster2Non2FixtureApplied = true; }
    }
    return snapshot();
  },
  pause(){root.heroGatherProbe.pause();root.heroGatherProbe.step(1);return snapshot();},
  resume(){root.heroGatherProbe.resume();root.heroGatherProbe.step(1);return snapshot();},
};
