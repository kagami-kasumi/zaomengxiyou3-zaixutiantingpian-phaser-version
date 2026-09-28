import { ensureSceneAssetBundle, startSceneWithBundle } from '../src/scenes/SceneAssetBundleBridge';
import { game } from '../src/main';
import { createDefaultGameSave, createSaveSlot, getSaveSlotStorageKey, ActiveSaveSlotStorageKey } from '../src/systems/SaveSlotSystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { encodePet } from '../src/systems/SaveSystem';

import { createStage11MonsterView, updateStage11MonsterView, destroyStage11MonsterView, readStage11AttackGeometry } from '../src/scenes/stage11/Stage11MonsterVisualBridge';
import { createMonster30AttackRuntime } from '../src/systems/Monster30AttackRuntime';
let visualFixture: any, reentry: any;
const observed = { parties: [] as any[], monsters: [] as any[], views: [] as any[] };
Object.assign(globalThis, { monster30Observe: observed });
let time = 0, ticks = 0, fatal = false;
const injected = new Set<any>();
const active = () => observed.parties.find(p => !p.model.destroyed && p.scene.scene.isActive());
const events = new Map<string, any>();
Object.assign(window, { monster30Probe: {
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
  ready: () => ({ scene: active()?.scene.scene.key, loading: active()?.scene.load.isLoading(), scenes: game.scene.getScenes(true).map(s => s.scene.key), parties: observed.parties.length }),
  async stop(mode: string) {
    if(mode==='fatal') await ensureSceneAssetBundle(active().scene,'pet-monkey-horse');
    game.loop.stop(); time = game.loop.now; fatal = mode === 'fatal';
    for (const m of active().model.members) m.combat.combat.hp = m.combat.combat.maxHp = 10000;
  },
  step(count: number) {
    const p = active(); if (!p) return;
    const fps = p.scene.game.loop.targetFps;
    for (let i = 0; i < count; i++) {
      const monsters = observed.monsters.filter(m => m.hp > 0 && (m.enemyType === 30 || m.state));
      for (const monster of monsters) {
        if (fatal && !injected.has(monster) && monster.attackRuntime?.body.action === 'hit1'
          && monster.attackRuntime.body.actionTick === 0
          && p.model.members.some((member:any) => Math.abs(member.movement.x-monster.x)<70
            && Math.abs(member.movement.y-50-monster.y)<60)) {
          // Controlled same-frame first-fire boundary, matching 232's fresh effect clock; never moves a target.
          monster.petTargetEffectState.effects.count = 0; monster.hp = 1; monster.petTargetEffectState.effects.add({ name: 'petmonkey_fire', time: fps * 2, hurt: 1 });
          injected.add(monster);
        }
      }
      for (const member of p.model.members) {
        // Survival fixture for reaching the existing fourth encounter; no collision/protection override.
        member.combat.combat.hp = member.combat.combat.maxHp = 10000;
        member.combat.progression.currentExp = 0;
        const candidates = monsters.length ? monsters : observed.monsters.filter(m=>m.hp>0&&!m.attackRuntime?.destroyed);
        const nearest = candidates.slice().sort((a, b) => Math.abs(a.x - member.movement.x) - Math.abs(b.x - member.movement.x))[0];
        const dx = nearest ? nearest.x - member.movement.x : 500;
        const codes = member.combat.slot === 'p1' ? [65, 68, 75] : [37, 39, 98];
        p.scene.input.keyboard.addKey(codes[0]).isDown = dx < -45;
        p.scene.input.keyboard.addKey(codes[1]).isDown = dx > 45;
        p.scene.input.keyboard.addKey(codes[2]).isDown = ticks % 37 < 5;
        p.scene.input.keyboard.addKey(member.combat.slot === 'p1' ? 74 : 97).isDown = monsters.length === 0 && ticks % 12 < 6;
      }
      time += 1000 / fps; game.step(time, 1000 / fps); ticks++;
      for (const e of p.model.incoming.trace) if (e.sourceId && observed.monsters.some(m => m.id === e.sourceId && (m.enemyType === 30 || m.state))) {
        const monster = observed.monsters.find(m => m.id === e.sourceId);
        if (!events.has(e.eventId)) events.set(e.eventId, { ...e, sourceDead: monster?.hp === 0 });
      }
    }
  },
  snapshot: () => ({ scene: active()?.scene.scene.key, fps: active()?.scene.game.loop.targetFps,
    ticks, events: [...events.values()], injected: injected.size,
    views: observed.views.slice(-200),
    heroes: active()?.runtime.snapshots().map(({ view: _view, ...s }: any) => s),
    monsters: observed.monsters.map(m => ({ id: m.id, hp: m.hp, x: m.x, y: m.y, state: m.state ?? m.phase,
      runtime: m.attackRuntime && { destroyed: m.attackRuntime.destroyed, body: m.attackRuntime.body, attacks: m.attackRuntime.attacks } })) }),
  async visual(frame: number, sign: -1 | 1) {
    if (!visualFixture) {
      const scene = active().scene;
      const visible = scene.children.list.map((object: any) => [object, object.visible]);
      visible.forEach(([object]: any) => object.setVisible?.(false));
      scene.scene.pause();
      game.scene.add('Monster30VisualQA', {key:'Monster30VisualQA'}, true); game.step(time,0);
      const renderScene = game.scene.getScene('Monster30VisualQA');
      const view = createStage11MonsterView(renderScene, 30, 470, 295, readStage11AttackGeometry(scene));
      visualFixture = {scene:renderScene, sourceScene:scene, visible, view};
    }
    const {scene, view} = visualFixture;
    const runtime = createMonster30AttackRuntime();
    runtime.attacks = [{attackId:'visual',sourceId:'visual',x:470,y:295,facingX:sign === 1 ? -1 : 1,
      frame,age:frame-1,damage:15,attackKind:'physics',actionName:'hit1',knockbackX:6,knockbackY:-5}];
    updateStage11MonsterView(scene, view, {x:470,y:295,state:'wait',facingX:-1,attackSerial:0,attackRuntime:runtime}, 0);
    view.sprite.setVisible(false); game.step(time += 1, 1); game.step(time += 1, 1);
    const textureCanvas=document.createElement('canvas'); textureCanvas.width=254;textureCanvas.height=144; textureCanvas.getContext('2d')!.drawImage(view.attacks[0].image.texture.getSourceImage() as HTMLImageElement,0,0);
    const texturePng=textureCanvas.toDataURL();
    const png = await new Promise<string>(resolve => { game.renderer.snapshot((image: any) => resolve(image.src)); game.step(time += 17,17); });
    return {png,texturePng,scenes:game.scene.getScenes(true).map(s=>s.scene.key),visible:scene.sys.settings.visible,children:scene.children.list.length,image:{visible:view.attacks[0].image.visible,alpha:view.attacks[0].image.alpha,width:view.attacks[0].image.width,flags:view.attacks[0].image.renderFlags},camera:{width:scene.cameras.main.width,height:scene.cameras.main.height,visible:scene.cameras.main.visible,scrollX:scene.cameras.main.scrollX,scrollY:scene.cameras.main.scrollY},frame,sign,texture:view.attacks[0].image.texture.key,root:[view.attacks[0].image.x,view.attacks[0].image.y]};
  },
  endVisual() {
    if (!visualFixture) return;
    const {sourceScene:scene,visible,view} = visualFixture;
    game.scene.remove('Monster30VisualQA');
    destroyStage11MonsterView(view); visible.forEach(([object, value]: any) => object.setVisible?.(value));
    scene.scene.resume(); game.step(time, 0); visualFixture = undefined;
  },
  pauseCheck() {
    const scene = active().scene, expected = structuredClone(observed.monsters.map(m => m.attackRuntime));
    for(const r of expected) if(r&&!r.destroyed) r.attacks = r.attacks.map((a:any)=>({...a,frame:Math.min(10,a.age+1)}));
    const before = JSON.stringify(expected);
    scene.scene.pause(); for(let i=0;i<3;i++) {time += 1000 / game.loop.targetFps; game.step(time,1000 / game.loop.targetFps);}
    const after = JSON.stringify(observed.monsters.map(m => m.attackRuntime)); scene.scene.resume(); game.step(time, 0); return before === after;
  },
  restart() { active()?.scene.scene.restart({}); game.step(time += 1,1); game.loop.start(game.step.bind(game)); },
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
