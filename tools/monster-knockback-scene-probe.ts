// Test fixture UI stays outside the game canvas and outside production builds.
import { game } from '../src/main';
import { createStage1CombatRuntime, resolveStage1PetHit } from '../src/systems/Stage1CombatSystem';
import { adaptTestScenePetEnemies } from '../src/scenes/test-scene/TestScenePetEnemyAdapter';
import { spawnProjectileFromTuning } from '../src/systems/ProjectileSystem';
import { getActivePet } from '../src/systems/PetRosterSystem';
const records: any[] = [], hits: any[] = [], frames: any[] = [];
const parties = new Map<any, any>();
const fixtureRuntime = createStage1CombatRuntime();
let serial = 0, recording = false, exported = false;
let firstSpawnAt = 0, startAt = 0, progressed = 0, lastFixtureHit = 0, finished = false;
let lifecyclePhase = 0;
let legacyShots = 0;
const lifecycle: any[] = [];
const panel = document.createElement('section');
panel.style.cssText = 'position:fixed;left:0;top:0;z-index:10000;background:#fff;color:#000;font:12px monospace;max-height:240px;overflow:auto';
document.body.append(panel);
const output = document.createElement('pre');
function button(label: string, run: () => void) { const b = document.createElement('button'); b.textContent = label; b.onclick = run; panel.append(b); }
const state = () => ({ hits: hits.slice(-8), frames: frames.slice(-1), totalFrames: frames.length,
  models: records.map(r => ({ level: r.level, type: r.type, id: r.owner.id, x: r.owner.x, y: r.owner.y,
    action: r.owner.phase ?? r.owner.state, active: r.binding.active, disposed: r.binding.disposed,
    vx: r.binding.motion.velocityX, vy: r.binding.motion.velocityY })) });
(globalThis as any).__knockbackProbe = {
  bind(scene: any, level: number, type: number, owner: any, binding: any) { records.push({ scene, level, type, owner, binding }); firstSpawnAt ||= performance.now(); },
  heroes(scene: any, runtime: any) { parties.set(scene, runtime); },
  hit(p: any) { recording = true; hits.push({ target: p.enemy.id, owner: p.ownerSlot, phase: p.knockbackPhase ?? 'late', x: p.enemy.x, y: p.enemy.y, time: p.timeMs }); },
};
button('前进700（夹具）', () => { for (const [scene, party] of parties) if (scene.scene.isActive()) {
  for (const member of party.compatibilityMembers()) { member.movement.x += 700; }
} });
for (const slot of ['p1', 'p2'] as const) button(`${slot}真实结算命中`, () => {
  const r = records.findLast(r => !r.binding.disposed && r.scene.scene.isActive() && (r.owner.hp ?? 0) > 0);
  if (!r) return;
  const enemy = r.owner.phase ? r.owner : adaptTestScenePetEnemies([r.owner], () => {}, r.scene)[0];
  recording = true;
  resolveStage1PetHit({ runtime: fixtureRuntime, enemy, ownerSlot: slot, petId: `${slot}-fixture`,
    attackId: `fixture-${++serial}`, actionName: 'normal', attackKind: 'physics', damage: 0,
    knockbackX: slot === 'p1' ? 6 : -6, knockbackY: -4, timeMs: r.scene.time.now, knockbackPhase: 'late' });
});
button('重试实际场景', () => { const scene: any = game.scene.getScenes(true).find(s => s.sys.settings.key !== 'BootScene'); scene?.scene.restart(scene.sys.settings.data); });
button('返回存档场景', () => { const scene: any = game.scene.getScenes(true)[0]; scene?.scene.start('SaveSlotScene'); });
button('隐藏观察面板', () => { panel.style.display = 'none'; });
button('导出观察', () => { exported = true; output.textContent = JSON.stringify({ ...state(), hits, frames }); });
panel.append(output);
game.events.on('poststep', () => {
  if (new URLSearchParams(location.search).has('auto') && !finished) {
    const now = performance.now();
    if ([...parties.keys()].some(scene => scene.scene.isActive())) startAt ||= now;
    if (startAt && !firstSpawnAt && now - startAt > 4000 + progressed * 1500 && progressed < 4) {
      for (const [scene, party] of parties) if (scene.scene.isActive()) {
        for (const member of party.compatibilityMembers()) member.movement.x += 700;
      }
      progressed++;
    }
    const legacyBoss = new URLSearchParams(location.search).has('boss3');
    if (legacyBoss && startAt && now - startAt > 4000 + legacyShots * 1500 && legacyShots < 4) {
      const scene: any = [...parties.keys()].find(s => s.sys.settings.key === 'TestScene' && s.scene.isActive());
      if (scene) {
        scene.activateBossFight();
        const boss = scene.bossArena.boss;
        if (boss) {
          // Controlled position tests the existing WorldBridge collision/dedup/late
          // settlement path, not pet targeting or family projectile visuals.
          const sourcePet = getActivePet(legacyShots % 2 ? scene.p2PetRoster : scene.petRoster);
          if (!sourcePet) return;
          scene.projectileSystem.projectiles.push(spawnProjectileFromTuning(scene.projectileSystem, { sourceId: sourcePet.id, x: boss.x, y: boss.y, facingX: legacyShots % 2 ? -1 : 1 },
            'pet-monkey1-normal', `legacy-fixture-${legacyShots}`, { actionName: 'hit1', assetKey: '', sourceSymbol: 'PetMonkey1Bullet1', runtimeName: 'PetMonkey1Bullet1',
              offsetX: 0, offsetY: 0, speedX: 0, speedY: 0, distance: undefined, width: 100, height: 100, lifetimeMs: 300,
              damage: 1, attackKind: 'physics', knockbackX: 6, knockbackY: -4, hitIntervalFrames: 10, maxHits: 99 }));
          recording = true; legacyShots++;
        }
      }
    }
    if (!legacyBoss && firstSpawnAt && now - firstSpawnAt > 1500 && now - lastFixtureHit > 1500) {
      const buttons = [...panel.querySelectorAll('button')];
      buttons.find(b => b.textContent === `${serial % 2 ? 'p2' : 'p1'}真实结算命中`)?.click();
      lastFixtureHit = now;
    }
    if (firstSpawnAt && now - firstSpawnAt > 11000) {
      finished = true; exported = true;
      output.textContent = JSON.stringify({ ...state(), hits, frames, finished: true });
    }
  }
  if (finished && new URLSearchParams(location.search).has('lifecycle')) {
    const since = performance.now() - firstSpawnAt;
    const scene = records.findLast(r => r.scene.scene.isActive())?.scene;
    if (since > 13000 && lifecyclePhase === 0 && scene) {
      lifecycle.push({ action: 'before-retry', count: records.length });
      scene.scene.restart(scene.sys.settings.data); lifecyclePhase = 1;
    } else if (since > 15500 && lifecyclePhase === 1) {
      lifecycle.push({ action: 'after-retry', oldDisposed: records.slice(0, lifecycle[0].count).every(r => r.binding.disposed) });
      scene?.scene.start('SaveSlotScene'); lifecyclePhase = 2;
    } else if (since > 17500 && lifecyclePhase === 2) {
      lifecycle.push({ action: 'after-return', allDisposed: records.every(r => r.binding.disposed),
        activeScenes: game.scene.getScenes(true).map(s => s.sys.settings.key) });
      lifecyclePhase = 3;
      output.textContent = JSON.stringify({ ...state(), hits, frames, finished: true, lifecycle });
    }
  }
  if (recording && frames.length < 1000) frames.push(records.filter(r => !r.binding.disposed).map(r => ({
    id: r.owner.id, type: r.type, time: r.scene.time.now, x: r.owner.x, y: r.owner.y, mx: r.binding.motion.x,
    my: r.binding.motion.y + r.binding.sourceOffsetY, vx: r.binding.motion.velocityX, vy: r.binding.motion.velocityY,
    action: r.owner.phase ?? r.owner.state, pending: r.binding.pendingHits.length,
    displayMatches: r.scene.children.list.some((v: any) => v.name === `Monster${r.type}` && v.x === r.owner.x && v.y === r.owner.y),
  })));
  if (!exported) output.textContent = JSON.stringify(state(), null, 1);
});
