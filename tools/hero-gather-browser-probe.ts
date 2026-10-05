import { game } from '../src/main';
import { ensureSceneAssetBundle } from '../src/scenes/SceneAssetBundleBridge';
import { createDefaultGameSave, createSaveSlot, getSaveSlotStorageKey, ActiveSaveSlotStorageKey } from '../src/systems/SaveSlotSystem';
import { createPartyConfiguration } from '../src/systems/PartyConfigurationSystem';

type AnyRecord = Record<string, any>;
const observed: AnyRecord = {
  parties: [], stages: [], traces: [], ticks: 0, prepared: false,
};
(globalThis as any).heroGatherObserve = observed; (globalThis as any).heroGatherGame = game;
let time = 0;
let fps = 30;
const active = () => [...observed.stages].reverse().find((s: any) => s.scene?.scene?.isActive?.() || s.scene?.scene?.isPaused?.());
const activeParty = () => {
  const stage = active();
  return observed.parties.find((p: any) => p.scene === stage?.scene && !p.model.destroyed);
};
const step = (count = 1, delta = 1000 / fps) => {
  for (let i = 0; i < count; i++) {
    time += delta;
    game.loop.time = time;
    game.loop.delta = delta;
    game.step(time, delta);
    observed.ticks++;
  }
};
const snapshot = () => {
  const s = active();
  const party = activeParty();
  return {
    scene: s?.scene?.scene?.key,
    fps: s?.scene?.game?.loop?.targetFps,
    gameTime: s?.scene?.game?.loop?.time,
    sceneTime: s?.scene?.time?.now,
    ticks: observed.ticks,
    heroes: party?.model?.members?.map((m: any) => ({slot:m.combat.slot,x:m.movement.x,y:m.movement.y,rootY:m.movement.y-50})) ?? [],
    traces: observed.traces.slice(-40),
    traceCount: observed.traces.length,
    gather: activeParty()?.runtime?.gather?.snapshot?.(),
    partyCount: observed.parties.length,
  };
};
const readPose = () => {
  const party = activeParty();
  return party?.model.members.map((member: any, index: number) => ({
    slot: member.combat.slot, heroId: member.combat.normalAttack.heroId,
    rootX: member.movement.x, rootY: member.movement.y - 50,
    x: member.movement.x, y: member.movement.y,
    velocityX: member.movement.velocityX, velocityY: member.movement.velocityY,
    previousInput: party.model.movement.members[index]?.previousInput,
  })) ?? [];
};
Object.assign(window, { heroGatherProbe: {
  prepare(requestedFps = 30) {
    // Isolated headless profile only: the real map requires an active save.
    localStorage.removeItem(getSaveSlotStorageKey(1));
    createSaveSlot(localStorage, 1, createDefaultGameSave(new Date(), createPartyConfiguration(2, 1, 2)!));
    localStorage.setItem(ActiveSaveSlotStorageKey, '1');
    fps = requestedFps; time = 0; observed.ticks = 0; observed.traces.length = 0;
    observed.prepared = true;
    return { fps, route: 'qaStage=1-2', source: 'Stage12Scene' };
  },
  configure(requestedFps = 30) {
    fps = requestedFps;
    game.loop.targetFps = requestedFps;
    game.loop.stop();
    time = game.loop.time;
    game.loop.delta = 0;
    return { fps, time, loopRunning: game.loop.isRunning };
  },
  ready: () => ({ scene: active()?.scene?.scene?.key, loading: active()?.scene?.load?.isLoading?.(), stages: observed.stages.length, parties: observed.parties.length, activeScenes: game.scene.getScenes(true).map((s: any) => s.scene.key),
    loaders: game.scene.getScenes(true).map((s:any)=>({scene:s.scene.key,loading:s.load.isLoading(),progress:s.load.progress,pending:s.load.list.size,inflight:s.load.inflight.size})),
    running:game.loop.running,paused:game.isPaused,visibility:document.visibilityState }),
  pumpLoading() {
    if (!game.scene.isActive('BootScene')) return;
    game.loop.stop();
    time = Math.max(time, game.loop.time);
    step(1);
  },
  step,
  snapshot() {
    const result = snapshot();
    if (result.heroes.length !== 2) throw Error(`expected two heroes, got ${result.heroes.length}`);
    return result;
  },
  pause() { const s = active(); s?.scene?.scene?.pause(); return snapshot(); },
  resume() { const s = active(); s?.scene?.scene?.resume(); return snapshot(); },
  restart() { const s = active(); s?.scene?.scene?.restart({}); return snapshot(); },
  request(endX: number, endY: number, slots?: readonly ('p1' | 'p2')[]) {
    observed.fixture = { endX, endY, slots: slots ?? ['p1', 'p2'] };
    observed.traces.push({ phase: 'test-gather-request', endX, endY, slots: observed.fixture.slots });
    return true;
  },
  resetTrace() { observed.traces.length = 0; },
  resetFixture(moves: readonly number[] = [1, -1]) {
    const party = activeParty();
    if (!party) throw Error('active Stage12 party unavailable');
    const poses = [{ x: 300, y: 350 }, { x: 350, y: 230 }];
    active()?.scene?.cameras?.main && (active().scene.cameras.main.scrollX = 0);
    party.model.members.forEach((member: any, index: number) => {
      member.movement.x = poses[index].x; member.movement.y = poses[index].y;
      member.movement.velocityX = 0; member.movement.velocityY = 0;
      member.movement.grounded = false; member.movement.currentPlatformId = undefined;
      member.movement.runningDirection = 0; party.model.movement.members[index].previousInput = undefined;
    });
    observed.moves = [...moves];
    return this.pose();
  },
  pose: readPose,
  fail() {
    const party = activeParty();
    if (!party) throw Error('active Stage12 party unavailable');
    const now = game.loop.time;
    party.runtime.applyEnvironmentHits(party.model.members.map((member: any) => ({
      target: member.combat.slot, damage: member.combat.combat.hp + 1, knockbackX: 0,
      bounds: { left: -10000, right: 10000 }, deathReason: 'unknown',
      source: { hazardId: 'hero-gather-probe', attackId: 1, kind: 'fire-thorn', timeMs: now },
    })));
    return this.pose();
  },
  activateResult(which: 'retry' | 'back') {
    const scene = active()?.scene;
    const x = which === 'retry' ? 305.95 : 470.95;
    const findButton = (children: readonly any[]): any => children.flatMap((child: any) => [child, ...(child.list ?? [])]).reduce((found: any, child: any) => found ?? (Math.abs(child.x - x) < 1 && child.input?.enabled ? child : undefined), undefined);
    const button = findButton(scene?.children.list ?? []);
    if (!button) throw Error(`result ${which} button unavailable`);
    button.emit('pointerdown'); button.emit('pointerup');
    return { which, activeScenes: game.scene.getScenes(true).map((s: any) => s.scene.key) };
  },
  capture() { return snapshot(); },
  async assetsReady() { await ensureSceneAssetBundle(active().scene, 'combat-hero-1-skills'); return true; },
} });
observed.pose = readPose;

