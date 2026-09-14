import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import type { PetCombatFrame } from '../src/systems/PetCombatTypes';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createProjectileSystem, updateProjectiles } from '../src/systems/ProjectileSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';

const alpha = execFileSync('python', ['-c', 'from PIL import Image; import sys; sys.stdout.buffer.write(Image.open(sys.argv[1]).convert("RGBA").getchannel("A").tobytes())', 'public/assets/pets/dragon/effects/PetDragon1Bullet1/1.png']);
export function createDragonRuntimeFixture(skills: string[], fps = 24, owner: 'p1' | 'p2' = 'p1', form = 4, record: (trace: unknown) => void = () => {}) {
  const roster = createSeedPetRoster();
  const pet = roster.pets.find(p => p.species === 'dragon' && p.form === form)!;
  roster.pets.forEach(p => p.isActive = p === pet);
  Object.assign(pet, { id: `${owner}-dragon${form}`, hp: 200, maxHp: 1000, mp: 1000, maxMp: 1000,
    atk: 100, def: 20, level: 1, skills });
  const runtime = new PetCombatRuntime(), projectiles = createProjectileSystem(), combat = createStage1CombatRuntime();
  const enemy = createStage1CombatEnemy({ id: 'target', enemyType: 2, x: 100, y: -15 });
  enemy.hp = enemy.maxHp = 100_000_000;
  const frame: PetCombatFrame = { roster, owner: { x: 0, y: 0, facingX: 1 },
    targets: [{ id: enemy.id, x: enemy.x, y: enemy.y, isAlive: true }], projectiles,
    hostFps: fps, deltaMs: 1000 / fps, random: () => 0.5,
    groundEnvironment: { ownerRootOffsetY: 0, walls: [{ id: 'floor', left: -10000, right: 10000,
      top: 0.1, bottom: 20, usesWallTolerance: true }] } };
  runtime.update({ ...frame, deltaMs: 0 });
  let tick = 0;
  const events: any[] = [];
  const frames: unknown[] = [];
  const step = (extra: Partial<PetCombatFrame> = {}) => {
    tick++;
    updateProjectiles(projectiles, [], frame.deltaMs);
    const snapshot = runtime.update({ ...frame, projectileCombat: createPetProjectileCombatPort({
      combat, enemies: [enemy], ownerSlot: owner, timeMs: tick * 1000 / fps, random: () => 0.5,
      mask: () => { if (form === 1) return {width:67,height:53,alpha}; throw new Error('Later forms must use independent original fields'); },
    }), ...extra });
    events.push(...runtime.events().map(event => ({ tick, event })));
    frames.push({ tick, timeMs: tick * 1000 / fps, owner, petId: pet.id,
      runtimeKey: snapshot.runtime?.runtimeKey, runtime: snapshot.runtime, target: snapshot.target,
      distance: snapshot.runtime && snapshot.target
        ? Math.hypot(snapshot.runtime.x - snapshot.target.x, snapshot.runtime.y - snapshot.target.y) : undefined,
      animation: snapshot.animation, hp: pet.hp, mp: pet.mp,
      projectiles: projectiles.projectiles.filter(p=>!p.isExpired).map(p=>({
        id:p.projectileId, sourceId:p.sourceId, symbol:p.sourceSymbol, action:p.actionName, token:p.petActionToken,
        frame:p.petHostTick, x:p.x, y:p.y, facingX:p.facingX,
      })), damageCount: combat.audit.damageEvents.length });
    return snapshot;
  };
  const until = (predicate: () => boolean, limit = 700) => {
    for (let i = 0; !predicate() && i < limit; i++) step();
    assert.ok(predicate(), `timeout dragon4 ${skills}`);
  };
  const named = (name: string) => events.filter(e => e.event.behaviorEvent?.type === name);
  const finish = (name: string) => {
    runtime.destroy();
    events.push(...runtime.events().map(event=>({tick,event})));
    assert.ok(projectiles.projectiles.every(p => p.isExpired), 'root release clears all descendants and delayed effects');
    record({ name, form, fps, owner, events, frames, damage: combat.audit.damageEvents, hp: pet.hp, mp: pet.mp,
      cleanup: { destroyed:runtime.snapshot().destroyed, summons:runtime.snapshot().summons?.length,
        activeProjectiles:projectiles.projectiles.filter(p=>!p.isExpired).length } });
  };
  return { pet, roster, runtime, projectiles, combat, enemy, frame, events, step, until, named, finish, tick: () => tick };
}

