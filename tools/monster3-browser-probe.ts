import { ensureSceneAssetBundle, startSceneWithBundle } from '../src/scenes/SceneAssetBundleBridge';
import { game } from '../src/main';
import { createDefaultGameSave, createSaveSlot, getSaveSlotStorageKey, ActiveSaveSlotStorageKey } from '../src/systems/SaveSlotSystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import { getActivePet, createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { encodePet } from '../src/systems/SaveSystem';
import { stage11Navigation } from './monster3-stage11-navigation';
import { captureMonster3Projection } from './monster3-visual-probe';
import { capturePetReceptionProjection } from './pet-reception-visual-probe';
import { readPetReceptionBody } from '../src/systems/PetReceptionBodyOwner';
import { monster3AttackRequest, type Monster3Attack } from '../src/systems/Monster3AttackRuntime';

import { createStage11MonsterView, updateStage11MonsterView, destroyStage11MonsterView, readStage11AttackGeometry } from '../src/scenes/stage11/Stage11MonsterVisualBridge';

let reentry: any;
const bosses = new WeakSet<object>();
const observed = { parties: [] as any[], monsters: [] as any[], views: [] as any[],
  legacyMonster3Calls: 0,
  failureMode: false, tick: 0, flows: [] as any[], results: [] as any[], deaths: [] as any[],
  boss(source: object, adapter: any) {
    if (!bosses.has(source)) { bosses.add(source); this.monsters.push(adapter); }
  },
};
Object.assign(globalThis, { monster3Observe: observed });
let time = 0, ticks = 0, fatal = false;
const injected = new Set<any>();
const active = () => observed.parties.find(p => !p.model.destroyed && p.scene.scene.isActive());
const events = new Map<string, any>();
const hpChecks: any[] = [];
const sampledIds = new Set<string>();
const seenAttacks = new WeakSet<object>();
const attackReferences: { runtime: any; attack: any }[] = [];
const fatalTrace: any[] = [];
let failureParty: any;
let compatibilityExit: any;
Object.assign(window, { monster3Probe: {
  armCompatibilityExit() {
    const p = active(), fps = p.scene.game.loop.targetFps;
    for (const slot of ['p1', 'p2']) Object.assign(p.petRosters[slot].pets[0], { hp: 100, lifetime: 2 });
    time += 1000 / fps; game.step(time, 1000 / fps);
    compatibilityExit = ['p1', 'p2'].map(slot => {
      const runtime = p.runtime.compatibilityPetRuntime(slot), body = readPetReceptionBody(runtime)!;
      if (!body || body.snapshot().phase !== 'alive') throw Error('Exit fixture must hold an active owner');
      return { body, target: body.target(() => true, () => { throw Error('Exited owner queried counter'); }), hp: body.pet.hp };
    });
    return { parties: observed.parties.length };
  },
  verifyCompatibilityExit() {
    return compatibilityExit.map((entry: any) => ({ phase: entry.body.snapshot().phase,
      rejected: !entry.target.receive({}).accepted, hpUnchanged: entry.body.pet.hp === entry.hp }));
  },
  compatibilityReception(form: string) {
    const p = active(), fps = p.scene.game.loop.targetFps;
    const match = /^(\w+)([1-4])$/.exec(form)!;
    for (const slot of ['p1', 'p2']) {
      const pet = structuredClone(createSeedPetRoster().pets[0]!);
      Object.assign(pet, { id: 'same-compatibility-id', species: match[1], form: Number(match[2]),
        hp: 100, maxHp: 100, lifetime: 1, def: 0, skills: [], missRate: 0, magicDefenseRate: 0, isActive: true });
      p.petRosters[slot].pets.splice(0, p.petRosters[slot].pets.length, pet);
      p.petRosters[slot].selectedIndex = 0;
    }
    const step = () => { time += 1000 / fps; game.loop.delta = 1000 / fps; game.step(time, 1000 / fps); };
    step();
    const entries = ['p1', 'p2'].map(slot => {
      const runtime = p.runtime.compatibilityPetRuntime(slot), pet = p.petRosters[slot].pets[0];
      if (!runtime || !readPetReceptionBody(runtime)) throw Error(`${form}/${slot}: Scene did not bind compatibility body`);
      runtime.x = 300; runtime.y = 200;
      return { runtime, pet, body: readPetReceptionBody(runtime)! };
    });
    const attack: Monster3Attack = { id: `scene-255-${form}`, action: 'hit1', x: 300, y: 140,
      facingX: -1, frame: 3, age: 3, parentId: 'world',
      source: { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0, flower: false, random: () => 0.9 },
      reception: { prefix: 'scene-255:', serial: 1, count: 0, remaining: 99, interval: 999 } };
    const pairs = p.runtime.monster3Targets(attack);
    const hurtBefore = entries[0].pet.hp;
    const hurt = pairs[0].pet.receive({ ...monster3AttackRequest(attack, time, fps, 2), power: 1 });
    const hurtAfter = entries[0].pet.hp, hurtPose = entries[0].body.snapshot();
    const pausedBefore = JSON.stringify(entries.map(e=>e.body.snapshot()));
    p.scene.scene.pause(); step(); step(); p.scene.scene.resume();
    const pauseHeld = pausedBefore === JSON.stringify(entries.map(e=>e.body.snapshot()));
    step();
    attack.x = entries[0].runtime.x; attack.y = entries[0].runtime.y - 60;
    const repeatBefore = entries[0].body.snapshot();
    const repeated = pairs[0].pet.receive({ ...monster3AttackRequest(attack, time, fps, 2), power: 1 });
    const repeatAfter = entries[0].body.snapshot();
    const before = entries.map(e => e.pet.hp);
    const result = pairs[0].pet.receive({ ...monster3AttackRequest(attack, time, fps, 2), power: 1000 });
    const immediate = entries.map(e => e.pet.hp);
    const states = [{ tick: 0, p1: entries[0].body.snapshot(), p2: entries[1].body.snapshot() }];
    for (let tick = 1; tick <= 20; tick++) { step(); states.push({ tick, p1: entries[0].body.snapshot(), p2: entries[1].body.snapshot() }); }
    const after = entries.map(e => ({ hp: e.pet.hp, lifetime: e.pet.lifetime, phase: e.body.snapshot().phase }));
    attack.x = entries[1].runtime.x; attack.y = entries[1].runtime.y - 60;
    const secondResult = pairs[1].pet.receive({ ...monster3AttackRequest(attack, time, fps, 2), power: 1000 });
    const secondStates = [{ tick: 0, p1: entries[0].body.snapshot(), p2: entries[1].body.snapshot() }];
    for (let tick = 1; tick <= 20; tick++) { step(); secondStates.push({ tick, p1: entries[0].body.snapshot(), p2: entries[1].body.snapshot() }); }
    return { form, fps, hurtBefore, hurtAfter, hurt, hurtPose, pauseHeld, repeated, repeatBefore, repeatAfter,
      before, immediate, after, result, states, secondResult, secondStates,
      final: entries.map(e => ({ hp: e.pet.hp, lifetime: e.pet.lifetime, phase: e.body.snapshot().phase })),
      staleAccepted: pairs[0].pet.receive({ ...monster3AttackRequest(attack, time, fps, 2), power: 1000 }).accepted };
  },
  petVisual(pose: Parameters<typeof capturePetReceptionProjection>[1]) { return capturePetReceptionProjection(active().scene, pose); },
  visual(pose: Parameters<typeof captureMonster3Projection>[1]) { return captureMonster3Projection(active().scene,pose); },
  prepare(fps: number, species: string) {
    localStorage.setItem('zaixu-global-settings-v1', JSON.stringify({ difficulty: 0, bgmEnabled: false, skillSoundEnabled: false, frameRate: fps }));
    const save = createDefaultGameSave(new Date(), createPartyConfiguration(2, 1, 2)!);
    for (const key of ['player1', 'player2'] as const) {
      const seeds = createSeedPetRoster().pets;
      seeds.forEach(p => { p.isActive = p.species === species && p.form === 1; p.hp = p.maxHp = 10000; p.skills = []; });
      save[key].pets = seeds.map(encodePet); save[key].selectedPetIndex = seeds.findIndex(p => p.isActive);
    }
    localStorage.removeItem(getSaveSlotStorageKey(1)); createSaveSlot(localStorage, 1, save);
    localStorage.setItem(ActiveSaveSlotStorageKey, '1');
  },
  ready: () => ({ scene: active()?.scene.scene.key, loading: active()?.scene.load.isLoading(), scenes: game.scene.getScenes(true).map(s => s.scene.key), parties: observed.parties.length, source: active()?.runtime.rewardPlayers()[0]?.view.getData('formalPartySource') }),
  async stop(mode: string) {
    if(mode==='fatal') await ensureSceneAssetBundle(active().scene,'pet-monkey-horse');
    game.loop.stop(); time = game.loop.now; fatal = mode === 'fatal';
    let seed = 0x249b; Math.random = () => { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 4294967296; };
    for (const m of active().model.members) m.combat.combat.hp = m.combat.combat.maxHp = 1000000;
  },
  step(count: number) {
    const p = active(); if (!p) return;
    const fps = p.scene.game.loop.targetFps;
    for (let i = 0; i < count; i++) {
      if (active() !== p) break;
      const monsters = observed.monsters.filter(m => m.hp > 0 && m.enemyType === 3);
      for (const monster of monsters) {
        if (fatal && !injected.has(monster) && monster.monster3AttackRuntime?.body.action === 'hit1'
          && monster.monster3AttackRuntime.body.actionTick === 6
          && p.model.members.some((member:any) => Math.abs(member.movement.x-monster.x)<70
            && Math.abs(member.movement.y-50-monster.y)<60)) {
          // Controlled same-frame first-fire boundary, matching 232's fresh effect clock; never moves a target.
          monster.petTargetEffectState.effects.count = 0; monster.hp = 1; monster.petTargetEffectState.effects.add({ name: 'petmonkey_fire', time: fps * 2, hurt: 1 });
          injected.add(monster);
        }
      }
      for (const member of p.model.members) {
        // Survival fixture for reaching the existing fourth encounter; no collision/protection override.
        // HP is not rewritten during combat; reception events retain actual HP transitions.
        member.combat.progression.currentExp = 0;
        const candidates = monsters.length ? monsters : observed.monsters.filter(m=>m.hp>0
          && !m.monster3AttackRuntime?.destroyed && !m.attackRuntime?.destroyed
          && (p.scene.scene.key !== 'TestScene' || p.scene.monster30s.includes(m)));
        const nearest = candidates.slice().sort((a, b) => Math.abs(a.x - member.movement.x) - Math.abs(b.x - member.movement.x))[0];
        const exposureDistance = p.scene.scene.key === 'TestScene' || p.runtime.compatibilityPetRuntime(member.combat.slot) ? 100 : 260;
        const approachOffset = monsters.length ? (member.combat.slot === 'p1' ? 1 : -1)
          * (ticks % 360 < 180 ? exposureDistance : -exposureDistance) : 0;
        const climb = p.scene.scene.key === 'TestScene'
          && (!monsters.length || nearest && Math.abs(nearest.y - member.movement.y) > 180)
          ? stage11Navigation(p.scene, member.movement, ticks, fps,
            !!nearest && Math.abs(nearest.y - member.movement.y) <= 140) : undefined;
        const petPosition = p.runtime.petSnapshots()[member.combat.slot]?.runtime;
        const bringPetUp = p.scene.scene.key === 'TestScene' && monsters.length && !climb
          && petPosition && petPosition.y - member.movement.y > 100;
        const dx = bringPetUp ? (petPosition.x > 470 ? 24 : 916) - member.movement.x
          : climb?.dx ?? (nearest ? nearest.x + approachOffset - member.movement.x : 500);
        const codes = member.combat.slot === 'p1' ? [65, 68, 75] : [37, 39, 98];
        const tolerance = climb ? 8 : 45;
        p.scene.input.keyboard.addKey(codes[0]).isDown = dx < -tolerance;
        p.scene.input.keyboard.addKey(codes[1]).isDown = dx > tolerance;
        const combatJump = p.scene.scene.key === 'TestScene' ? ticks % (fps * 4) < 3 : ticks % 37 < 5;
        p.scene.input.keyboard.addKey(codes[2]).isDown = bringPetUp ? ticks % (fps * 2) < 3
          : climb?.jump ?? (monsters.length === 0 && combatJump);
        p.scene.input.keyboard.addKey(member.combat.slot === 'p1' ? 74 : 97).isDown = monsters.length === 0 && ticks % 12 < 6;
      }
      const beforeHp = Object.fromEntries(p.model.members.map((m:any)=>[m.combat.slot, {
        hero:m.combat.combat.hp, pet:p.petRosters[m.combat.slot] && getActivePet(p.petRosters[m.combat.slot])?.hp,
      }]));
      observed.tick = ticks;
      time += 1000 / fps; game.loop.delta = 1000 / fps; game.step(time, 1000 / fps); ticks++;
      for(const monster of observed.monsters) for(const attack of monster.monster3AttackRuntime?.attacks ?? []) {
        if(!seenAttacks.has(attack)) { seenAttacks.add(attack); attackReferences.push({runtime:monster.monster3AttackRuntime,attack}); }
      }
      if(fatal && fatalTrace.length<60) for(const monster of injected) {
        const runtime=monster.monster3AttackRuntime;
        fatalTrace.push({tick:ticks,id:monster.id,hp:monster.hp,body:runtime.body.action,
          attacks:runtime.attacks.map((a:any)=>({id:a.id,age:a.age,frame:a.frame})),
          retained:attackReferences.filter(r=>r.runtime===runtime).map(({attack:a})=>({id:a.id,age:a.age,frame:a.frame,
            sourceReleased:a.source===undefined,parentReleased:a.parentId===undefined}))});
      }
      const fresh = p.model.incoming.trace.filter((e:any)=>!sampledIds.has(e.eventId));
      if(observed.failureMode) observed.deaths.push(...fresh.filter((e:any)=>e.targetKind==='hero'&&e.hpAfter===0));
      for(const e of fresh) sampledIds.add(e.eventId);
      for(const slot of ['p1','p2']) for(const kind of ['hero','pet']) {
        const received = fresh.filter((e:any)=>e.ownerSlot===slot&&e.targetKind===kind);
        if(!received.some((e:any)=>observed.monsters.some(m=>m.id===e.sourceId&&m.enemyType===3)))continue;
        const actual = kind==='hero' ? p.model.members.find((m:any)=>m.combat.slot===slot)?.combat.combat.hp
          : p.petRosters[slot] && getActivePet(p.petRosters[slot])?.hp;
        hpChecks.push({owner:slot,kind,actualBefore:beforeHp[slot][kind],actualAfter:actual,loggedAfter:received.at(-1).hpAfter});
      }
      for (const e of p.model.incoming.trace) if (e.sourceId && observed.monsters.some(m => m.id === e.sourceId && m.enemyType === 3)) {
        const monster = observed.monsters.find(m => m.id === e.sourceId);
        if (!events.has(e.eventId)) events.set(e.eventId, { ...e, sourceDead: monster?.hp === 0 });
      }
    }
  },
  snapshot: () => ({ scene: active()?.scene.scene.key, fps: active()?.scene.game.loop.targetFps,
    legacyMonster3Calls: observed.legacyMonster3Calls,
    failure: { enabled: observed.failureMode, flows: observed.flows, results: observed.results,
      deaths: observed.deaths, oldPartyDestroyed: failureParty?.model.destroyed },
    retiredAttackReferences: attackReferences.filter(r=>r.runtime.destroyed).map(({attack})=>({id:attack.id,
      sourceReleased:attack.source===undefined,parentReleased:attack.parentId===undefined})),
    ticks, hpChecks, events: [...events.values()], injected: injected.size, fatalTrace,
    views: observed.views.slice(-200),
    actions: [...new Set(observed.views.flatMap(v => v.expected.map((a: any) => a.action)))],
    pets: active()?.runtime.petSnapshots(),
    route: active()?.model.members.map((m:any)=>({slot:m.combat.slot,platform:m.movement.currentPlatformId,grounded:m.movement.grounded})),
    heroes: active()?.runtime.snapshots().map(({ view: _view, ...s }: any) => s),
    monsters: observed.monsters.map(m => ({ id: m.id, hp: m.hp, x: m.x, y: m.y, state: m.state ?? m.phase,
      runtime: m.monster3AttackRuntime && { destroyed: m.monster3AttackRuntime.destroyed, body: m.monster3AttackRuntime.body, attacks: m.monster3AttackRuntime.attacks } })) }),
  pauseCheck() {
    const scene = active().scene, expected = JSON.parse(JSON.stringify(observed.monsters.map(m => m.monster3AttackRuntime)));
    for(const r of expected) if(r&&!r.destroyed) r.attacks = r.attacks.map((a:any)=>({...a,frame:Math.min(a.action === 'hit1' ? 5 : 10,a.age+1)}));
    const before = JSON.stringify(expected);
    scene.scene.pause(); for(let i=0;i<3;i++) {time += 1000 / game.loop.targetFps; game.step(time,1000 / game.loop.targetFps);}
    const after = JSON.stringify(observed.monsters.map(m => m.monster3AttackRuntime)); scene.scene.resume(); game.step(time, 0); return before === after;
  },
  beginFailure() {
    failureParty = active(); observed.failureMode = true;
    const hpBefore = failureParty.model.members.map((m:any)=>({slot:m.combat.slot,hp:m.combat.combat.hp}));
    for (const member of failureParty.model.members) member.combat.combat.hp = 1;
    return { tick: ticks, parties: observed.parties.length, hpBefore, fixtureHp: 1 };
  },
  resumeUi() { game.loop.start(game.step.bind(game)); },
  flushUi() {
    game.loop.stop(); const delta=1000/game.loop.targetFps;
    time+=delta; game.loop.delta=delta; game.step(time,delta); game.loop.start(game.step.bind(game));
  },
  retryUi() {
    const scene=active()?.scene, buttons:any[]=[];
    const visit=(objects:any[])=>{for(const o of objects){if(o.input)buttons.push({key:o.texture?.key,
      enabled:o.input.enabled,bounds:o.getBounds?.(),scrollX:o.scrollFactorX,scrollY:o.scrollFactorY});if(o.list)visit(o.list);}};
    if(scene)visit(scene.children.list);
    return {loopRunning:game.loop.running,inputEnabled:scene?.input.enabled,buttons,
      pointer:scene&&{x:scene.input.activePointer.x,y:scene.input.activePointer.y},
      camera:scene&&{x:scene.cameras.main.scrollX,y:scene.cameras.main.scrollY},
      canvas:game.canvas.getBoundingClientRect().toJSON()};
  },
  restart() { game.loop.stop(); time = Math.max(time,game.loop.now); active()?.scene.scene.restart({}); game.step(time += 1,1); game.loop.start(game.step.bind(game)); },
  async return() {
    const scene=active()!.scene; reentry={key:scene.scene.key,data:scene.sys.settings.data};
    game.loop.start(game.step.bind(game));
    await startSceneWithBundle(scene,'HeavenMapScene'); game.step(time += 1,1);
  },
  async reenter() {
    await startSceneWithBundle(game.scene.getScene('HeavenMapScene'),reentry.key,reentry.data);
    game.step(time += 1,1);
  },
} });
