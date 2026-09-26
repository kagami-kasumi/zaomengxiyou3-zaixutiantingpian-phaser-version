import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { bindMonsterKnockback, disposeMonsterKnockback } from '../src/systems/MonsterKnockbackBinding';
import { getMonsterKnockbackProfile } from '../src/systems/MonsterKnockbackSystem';
import { createStage1CombatEnemy, createStage1CombatRuntime, resolveStage1PetHit, updateStage1Enemy } from '../src/systems/Stage1CombatSystem';
import { createMonster30, updateMonster30 } from '../src/systems/Monster30System';
import { acceptMonsterKnockback } from '../src/systems/MonsterKnockbackBinding';
import { createMonsterPhysics, updateCombatMonsterPhysics } from '../src/systems/MonsterPhysicsSystem';
import type { MonsterDefinitionId } from '../src/systems/MonsterDefinitionCatalog';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { createProjectileSystem, spawnProjectileFromTuning } from '../src/systems/ProjectileSystem';

const truth = JSON.parse(readFileSync('docs/reverse-engineering/ground-truth/manifests/behavior/task-settings-237-monster-knockback-profiles.json','utf8'));
// Existing AI intent resumes after its existing hurt contract, independent of tween lifetime.
{
  const f = fixture(); f.hit();
  f.enemy.phase = 'approach'; f.enemy.petKnockback!.motion.action = 'walk';
  updateStage1Enemy({ enemy: f.enemy, targets: [{ slot: 'p1', x: f.enemy.x, alive: true }], deltaMs: 0 });
  assert.equal(f.enemy.petKnockback!.motion.direction, 0);
  assert.equal(f.enemy.petKnockback!.motion.action, 'wait');
  const flying = createMonster30(400, 150);
  flying.petKnockback = bindMonsterKnockback(getMonsterKnockbackProfile(30, 1, 1), flying, [], () => ({ x: 0, y: 0 }));
  acceptMonsterKnockback(flying.petKnockback, { x: 6, y: -4, timeMs: 0 }, { ...flying, action: 'wait', frozen: false }, 'late');
  flying.petKnockback.motion.tween = undefined;
  flying.petKnockback.motion.velocityX = flying.petKnockback.motion.velocityY = 0;
  const before = flying.y;
  updateMonster30(flying, [{ slot: 'p1', x: 400, y: 200, alive: true }], 50, () => 1, 20, 50);
  assert.ok(flying.y < before, 'recovered flying owner resumes hover');
  assert.equal(flying.petKnockback.motion.y, flying.y, 'hover feeds the next physics owner');
}
let checked = 0;
function fixture(id: MonsterDefinitionId = 7, x = 400) {
  const enemy = createStage1CombatEnemy({ id: 'target', enemyType: id, x, y: 200 });
  const profile = getMonsterKnockbackProfile(id, 1, 1);
  enemy.petKnockback = bindMonsterKnockback(profile, enemy, [], () => ({ x: -100, y: 0 }));
  const physics = createMonsterPhysics({ y: enemy.y, height: profile.profile.collider.height,
    motionMode: profile.profile.flying ? 'flying' : 'grounded' });
  const runtime = createStage1CombatRuntime();
  const hit = (overrides: Partial<Parameters<typeof resolveStage1PetHit>[0]> = {}) => resolveStage1PetHit({
    runtime, enemy, ownerSlot: 'p1', petId: 'pet', attackId: 'attack', actionName: 'hit1',
    attackKind: 'physics', damage: 1, knockbackX: 6, knockbackY: -5, timeMs: 0, ...overrides });
  return { enemy, physics, runtime, hit };
}
for (const id of [2,3,4,5,6,7,8,9,10,16,19,30] as MonsterDefinitionId[])
for (const fps of [20,24,30]) for (const parts of [1,2,4]) for (const ownerSlot of ['p1','p2'] as const) {
  const f = fixture(id); f.hit({ ownerSlot });
  const source = truth.motion.find((r: any) => r.monsterId === id && r.stage === 1 && r.fps === fps && r.mode === 'air' && r.direction === 1);
  for (let tick=1;tick<=24;tick++) {
    for(let part=1;part<=parts;part++) updateCombatMonsterPhysics(f.physics,f.enemy,[],1000/fps/parts,((tick-1)+part/parts)*1000/fps,fps);
    const expected=source.states[tick];
    const label=`${id}/${fps}/${parts}/${ownerSlot}/${tick}`;
    assert.equal(f.enemy.x,expected[0],label+'/x');assert.equal(f.enemy.y,expected[1],label+'/y');
    assert.equal(f.physics.y,f.enemy.y,label+'/physics-owner');
    assert.ok(Math.abs(f.enemy.petKnockback!.motion.velocityX-expected[2])<1e-8,label+'/vx');
    checked++;
  }
}
// Same early host hit is committed after this physics phase, then consumed once next host step.
{
  const f=fixture(); f.hit({knockbackPhase:'early',timeMs:50});
  assert.equal(f.enemy.petKnockback!.active,false);
  updateCombatMonsterPhysics(f.physics,f.enemy,[],50,50,20);
  assert.equal(f.enemy.x,400); assert.equal(f.enemy.petKnockback!.active,true);
  updateCombatMonsterPhysics(f.physics,f.enemy,[],50,100,20);
  assert.equal(f.enemy.x,412);
}
// Source guards and zero damage enter the actual settlement function, not audit replay.
{
  const f=fixture(); const cache={hurt:0,attack:3,critical:false};
  const bullet={cache,protected:true,dodgeProbability:0,random:()=>0.5};
  assert.equal(f.hit({sourceBullet:bullet}),undefined);assert.equal(f.enemy.petKnockback!.active,false);
  assert.ok(f.hit({sourceBullet:{...bullet,protected:false}}));
  assert.equal(f.runtime.audit.damageEvents[0]!.amount,0);assert.equal(f.enemy.petKnockback!.motion.velocityX,12);
  assert.equal(f.hit({knockbackX:-6}),undefined);assert.equal(f.enemy.petKnockback!.motion.velocityX,12);
  assert.ok(f.hit({attackId:'new',ownerSlot:'p2',knockbackX:-6}));assert.equal(f.enemy.petKnockback!.motion.velocityX,-12);
  disposeMonsterKnockback(f.enemy.petKnockback);assert.equal(f.enemy.petKnockback!.motion.tween,undefined);
  f.hit({attackId:'after-dispose'});assert.equal(f.enemy.petKnockback!.active,false);
  const fresh=fixture();assert.equal(fresh.enemy.petKnockback!.active,false,'same id in retry owns fresh state');
}
{
  const f=fixture(); const sourceBullet={cache:{hurt:1,attack:10,critical:false},protected:false,dodgeProbability:1,random:()=>0.5};
  assert.equal(f.hit({sourceBullet}),undefined);
  assert.equal(f.hit({sourceBullet:{...sourceBullet,dodgeProbability:0}}),undefined,'dodge consumes id');
  assert.equal(f.enemy.petKnockback!.active,false);
}
{
  const f=fixture(); f.hit();
  const original=f.enemy.petKnockback!.motion.tween;
  f.enemy.x=f.enemy.petKnockback!.motion.x=119;
  f.hit({attackId:'edge',knockbackX:-6,timeMs:100});
  assert.equal(f.enemy.petKnockback!.motion.velocityX,0);
  assert.equal(f.enemy.petKnockback!.motion.tween,original,'strict edge early-return retains old tween');
  updateCombatMonsterPhysics(f.physics,f.enemy,[],50,150,20);
  assert.ok(f.enemy.x>119,'old positive tween resumes after the outward negative hit');
  f.hit({attackId:'absent',hasKnockback:false,knockbackX:99});
  assert.equal(f.enemy.petKnockback!.motion.tween,original,'absent dictionary performs no write');
  f.enemy.x=f.enemy.petKnockback!.motion.x=400;
  f.hit({attackId:'zero',knockbackX:0,knockbackY:0,timeMs:200});
  assert.equal(f.enemy.petKnockback!.motion.velocityX,0);
  assert.equal(f.enemy.petKnockback!.motion.direction,1);
  assert.notEqual(f.enemy.petKnockback!.motion.tween,original,'zero dictionary replaces old tween');
}
{
  const f=fixture(); const p=spawnProjectileFromTuning(createProjectileSystem(),{sourceId:'p2-dragon',x:400,y:200,facingX:-1},
    'pet-dragon1-normal','native-port',{actionName:'hit1',assetKey:'test',sourceSymbol:'PetDragon1Bullet1',runtimeName:'PetDragon1Bullet1',
      offsetX:0,offsetY:0,speedX:0,speedY:0,distance:undefined,width:10,height:10,lifetimeMs:1000,damage:1,attackKind:'physics',
      knockbackX:6,knockbackY:-5,hitIntervalFrames:10,maxHits:99});
  p.petSourceKnockback={x:6,y:-5,direction:'direct',direct:-1};
  const port=createPetProjectileCombatPort({enemies:[f.enemy],combat:f.runtime,ownerSlot:'p2',timeMs:50,random:()=>.5,
    mask:()=>({width:1,height:1,alpha:[255]})});
  assert.equal(port.hit(p,f.enemy.id,{hurt:1,attack:10,critical:false}),true);
  assert.equal(f.enemy.petKnockback!.active,false);
  assert.equal(port.hit(p,f.enemy.id,{hurt:1,attack:10,critical:false}),false,'native port dedup');
  updateCombatMonsterPhysics(f.physics,f.enemy,[],50,50,20);
  assert.equal(f.enemy.x,400);
  updateCombatMonsterPhysics(f.physics,f.enemy,[],50,100,20);
  assert.equal(f.enemy.x,388,'native direct sign reaches the real model');
}
console.log(`Monster binding: ${checked} native states through actual hit/physics owners; early/late, P1/P2, render partitions, guards and disposal passed.`);
