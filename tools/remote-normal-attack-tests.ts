import assert from 'node:assert/strict';
import { HeroNormalAttackEffectKeys } from '../src/assets/AssetManifest';
import { createHeroMovement } from '../src/systems/HeroMovementSystem';
import {
  createHeroNormalAttack,
  getActiveHeroHitbox,
  setHeroWeaponMode,
  updateHeroNormalAttack,
} from '../src/systems/HeroNormalAttackSystem';
import {
  assertDetachedNormalAttackGeometry,
  getWorldNormalAttackGeometry,
  projectWorldNormalAttackHitbox,
  WorldNormalAttackGeometryByEffect,
} from '../src/systems/HeroNormalAttackGeometry';
import type { PlayerInputState } from '../src/systems/InputSystem';
import {
  createProjectileSystem,
  updateProjectiles,
} from '../src/systems/ProjectileSystem';
import {
  resolveRole5LoongSwordProjectileHits,
  spawnRole5LoongSwordProjectile,
} from '../src/systems/Role5NormalAttackProjectileSystem';
import {
  createStage1CombatEnemy,
  createStage1CombatPlayer,
  createStage1CombatRuntime,
  resolveStage1HeroAttack,
} from '../src/systems/Stage1CombatSystem';
import type { ActiveHeroNormalAttack } from '../src/systems/HeroNormalAttackSystem';
import {
  createHeroPartyRuntimeModel,
  updateHeroPartyRuntime,
} from '../src/systems/HeroPartyRuntimeSystem';
import {
  projectHeroCombatVisualRootPoint,
  projectNormalAttackVisualPoint,
} from '../src/scenes/HeroCombatVisualCoordinates';

function attackInput(attack: boolean): PlayerInputState {
  return {
    slot: 'p1', moveX: 0, down: false, up: false, attack, jump: false,
    skillSlots: [false, false, false, false, false], special: false, magicWeapon: false,
  };
}

function startAttack(heroId: 2 | 4, facingX: -1 | 1) {
  const movement = createHeroMovement(1_000, 500);
  movement.facingX = facingX;
  const model = createHeroNormalAttack(heroId);
  if (heroId === 4) setHeroWeaponMode(model, 'arrow');
  const event = updateHeroNormalAttack(model, attackInput(true), attackInput(false), movement, 0);
  assert.ok(event);
  return { movement, model, attack: event.attack };
}

function testWorldEffectRegistryIsExplicit(): void {
  assert.deepEqual(Object.keys(WorldNormalAttackGeometryByEffect).sort(), [
    HeroNormalAttackEffectKeys.role2Hit1,
    HeroNormalAttackEffectKeys.role2Hit2,
    HeroNormalAttackEffectKeys.role4ArrowHit1,
    HeroNormalAttackEffectKeys.role4ArrowHit3,
  ].sort());
  assert.equal(getWorldNormalAttackGeometry(HeroNormalAttackEffectKeys.role1Hit1), undefined);
  assert.doesNotThrow(() => assertDetachedNormalAttackGeometry(
    HeroNormalAttackEffectKeys.role5SpearRunMissing,
  ));
  assert.throws(
    () => assertDetachedNormalAttackGeometry('normal-attack-effect.future-ranged-without-geometry'),
    /requires explicit world geometry/,
  );
}

function testWorldEffectVisualProjectionConsumesGeometryOwner(): void {
  for (const [heroId, effectKey] of [
    [2, HeroNormalAttackEffectKeys.role2Hit1],
    [2, HeroNormalAttackEffectKeys.role2Hit2],
    [4, HeroNormalAttackEffectKeys.role4ArrowHit1],
    [4, HeroNormalAttackEffectKeys.role4ArrowHit3],
  ] as const) {
    const geometry = getWorldNormalAttackGeometry(effectKey);
    assert.ok(geometry);
    const root = projectHeroCombatVisualRootPoint(heroId, 470, 350);
    const point = projectNormalAttackVisualPoint({ heroId, effectKey, facingX: 1 }, 470, 350);
    assert.deepEqual(point, {
      x: root.x + geometry.forward,
      y: root.y + geometry.rootOffsetY,
    });
  }
}

function testRole2WorldHitboxUsesReleasePointAndFacing(): void {
  const right = startAttack(2, 1);
  const rightHitbox = getActiveHeroHitbox(right.model, right.movement, 50);
  assert.deepEqual(rightHitbox, { x: 951.5, y: 365.05, width: 591.5, height: 179.4 });
  right.movement.x = 1_300;
  assert.deepEqual(
    getActiveHeroHitbox(right.model, right.movement, 50),
    rightHitbox,
    'detached Role2 effect must not follow later hero movement',
  );

  const left = startAttack(2, -1);
  assert.deepEqual(
    getActiveHeroHitbox(left.model, left.movement, 50),
    { x: 457, y: 365.05, width: 591.5, height: 179.4 },
  );
}

function testRole4ArrowUsesWorldGeometryWhileShovelDoesNot(): void {
  const arrow = startAttack(4, 1);
  assert.deepEqual(
    getActiveHeroHitbox(arrow.model, arrow.movement, 50),
    { x: 715.6, y: 406, width: 533.4, height: 108 },
  );

  const shovelMovement = createHeroMovement(1_000, 500);
  const shovel = createHeroNormalAttack(4);
  updateHeroNormalAttack(shovel, attackInput(true), attackInput(false), shovelMovement, 0);
  const before = getActiveHeroHitbox(shovel, shovelMovement, 50);
  shovelMovement.x += 100;
  const after = getActiveHeroHitbox(shovel, shovelMovement, 50);
  assert.ok(before && after);
  assert.equal(after.x - before.x, 100, 'FollowBaseObjectBullet melee geometry still follows the hero');
}

function testFormalCombatResolvesFarWorldEffectOnceWithoutRearLeak(): void {
  const runtime = createStage1CombatRuntime();
  const player = createStage1CombatPlayer('p1', 2);
  const movement = createHeroMovement(1_000, 500);
  movement.facingX = 1;
  updateHeroNormalAttack(player.normalAttack, attackInput(true), attackInput(false), movement, 0);
  const near = createStage1CombatEnemy({ id: 'near', enemyType: 30, x: 1_120, y: 500 });
  const far = createStage1CombatEnemy({ id: 'far', enemyType: 30, x: 1_480, y: 500 });
  const behind = createStage1CombatEnemy({ id: 'behind', enemyType: 30, x: 900, y: 500 });
  const outside = createStage1CombatEnemy({ id: 'outside', enemyType: 30, x: 1_560, y: 500 });

  const events = resolveStage1HeroAttack({
    runtime, player, movement, enemies: [near, far, behind, outside], timeMs: 50,
  });
  assert.deepEqual(events.map((event) => event.targetId), ['near', 'far']);
  assert.equal(far.hp, far.maxHp - 26, 'Role2 magic damage reaches beyond the old 170-unit hero range');
  assert.equal(behind.hp, behind.maxHp, 'small visual registration overhang must not become rear targeting');
  assert.equal(outside.hp, outside.maxHp);
  assert.equal(resolveStage1HeroAttack({
    runtime, player, movement, enemies: [far], timeMs: 60,
  }).length, 0, 'world attack keeps per-target hit idempotency');
}

function testProjectionRejectsUnknownEffects(): void {
  assert.equal(projectWorldNormalAttackHitbox({
    heroId: 1,
    effectKey: HeroNormalAttackEffectKeys.role1Hit1,
    facingX: 1,
    spawnX: 0,
    spawnY: 0,
  }), undefined);
}

function testRole5LoongSwordThreeStagesAndEnemyMoveFrames(): void {
  const expected = [
    ['hit18', 'role5-loong-sword-hit1', HeroNormalAttackEffectKeys.role5SwordHit1Enhanced, 54.8, 1.6],
    ['hit19', 'role5-loong-sword-hit2', HeroNormalAttackEffectKeys.role5SwordHit2Enhanced, 50.2, -12.65],
    ['hit20', 'role5-loong-sword-hit3', HeroNormalAttackEffectKeys.role5SwordHit3Enhanced, 43.5, 2.7],
  ] as const;
  for (const [actionName, variant, assetKey, offsetX, offsetY] of expected) {
    const projectiles = createProjectileSystem();
    const projectile = spawnRole5LoongSwordProjectile(
      projectiles,
      { sourceId: 'p1', x: 100, y: 500, facingX: 1 },
      role5Attack(actionName, 1),
      true,
    );
    assert.ok(projectile);
    assert.equal(projectile.variant, variant);
    assert.equal(projectile.assetKey, assetKey);
    assert.equal(projectile.actionName, `${actionName}_1`);
    assert.equal(projectile.x, 100 + offsetX);
    assert.equal(projectile.y, 500 + offsetY);
  }

  const projectiles = createProjectileSystem();
  const projectile = spawnRole5LoongSwordProjectile(
    projectiles,
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    role5Attack('hit18', 1),
    true,
  )!;
  updateProjectiles(projectiles, [{ id: 'p1', state: 'ready' }], 1_000 / 60);
  assert.equal(projectile.x, 62.8, 'first EnemyMove frame uses the initial speed 8');
  assert.equal(projectile.velocityX, 10.4, 'acceleration is applied after movement');
  assert.ok(Math.abs(projectile.remainingDistance! - 689.6) < 1e-9,
    'distance is deducted with the post-acceleration speed like EnemyMoveBullet');
  for (let frame = 1; frame < 21; frame += 1) {
    updateProjectiles(projectiles, [{ id: 'p1', state: 'ready' }], 1_000 / 60);
  }
  assert.equal(projectiles.projectiles.length, 0, 'projectile expires after crossing the 700 distance budget');
  assert.ok(Math.abs(projectile.x - 726.8) < 1e-8, 'final AS3-style full frame lands after 672 travelled units');
}

function testRole5LoongSwordFacingStateAndFormalRuntimeDispatch(): void {
  const projectiles = createProjectileSystem();
  const left = spawnRole5LoongSwordProjectile(
    projectiles,
    { sourceId: 'p2', x: 900, y: 500, facingX: -1 },
    role5Attack('hit18', -1),
    true,
  )!;
  updateProjectiles(projectiles, [{ id: 'p2', state: 'ready' }], 1_000 / 60);
  assert.equal(left.x, 837.2);
  assert.equal(left.velocityX, -10.4);
  assert.equal(spawnRole5LoongSwordProjectile(
    createProjectileSystem(),
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    role5Attack('hit18', 1),
    false,
  ), undefined, 'ordinary sword state keeps the Follow normal attack contract');
  assert.equal(spawnRole5LoongSwordProjectile(
    createProjectileSystem(),
    { sourceId: 'p1', x: 0, y: 0, facingX: 1 },
    role5Attack('hit21', 1),
    true,
  ), undefined, 'enhanced fourth hit remains outside the moving-projectile family');

  const runtime = createHeroPartyRuntimeModel([
    { slot: 'p1', heroId: 5, x: 100, y: 500, width: 48, currentPlatformId: 'ground' },
  ]);
  runtime.members[0]!.combat.skill.role5Runtime.loongSwordRemainingMs = 1_000;
  updateHeroPartyRuntime(runtime, {
    timeMs: 0,
    deltaMs: 1_000 / 60,
    inputs: [attackInput(true)],
    environmentFor: () => ({
      platforms: [{ id: 'ground', kind: 'solid', left: 0, right: 1_000, top: 500 }],
      bounds: { left: 0, right: 1_000 },
    }),
  });
  assert.equal(runtime.projectiles.projectiles[0]?.variant, 'role5-loong-sword-hit1',
    'formal shared HeroPartyRuntime dispatches the same projectile system');
}

function testRole5LoongSwordTrajectoryHitsAndPlayerIsolation(): void {
  const projectiles = createProjectileSystem();
  spawnRole5LoongSwordProjectile(
    projectiles,
    { sourceId: 'p1', x: 0, y: 500, facingX: 1 },
    role5Attack('hit18', 1, 1),
    true,
  );
  const combat = createStage1CombatRuntime();
  const behind = createStage1CombatEnemy({ id: 'behind', enemyType: 30, x: -100, y: 500 });
  const near = createStage1CombatEnemy({ id: 'near', enemyType: 30, x: 100, y: 500 });
  const far = createStage1CombatEnemy({ id: 'far', enemyType: 30, x: 500, y: 500 });
  const outside = createStage1CombatEnemy({ id: 'outside', enemyType: 30, x: 800, y: 500 });
  const above = createStage1CombatEnemy({ id: 'above', enemyType: 30, x: 100, y: 400 });
  const below = createStage1CombatEnemy({ id: 'below', enemyType: 30, x: 100, y: 600 });
  const enemies = [behind, near, far, outside, above, below];
  let now = 0;
  for (let frame = 0; frame < 21; frame += 1) {
    resolveRole5LoongSwordProjectileHits({ projectiles, combat, enemies, timeMs: now });
    resolveRole5LoongSwordProjectileHits({ projectiles, combat, enemies, timeMs: now });
    updateProjectiles(projectiles, [{ id: 'p1', state: 'ready' }], 1_000 / 60);
    now += 1_000 / 60;
  }
  assert.equal(behind.hp, behind.maxHp);
  assert.equal(outside.hp, outside.maxHp);
  assert.equal(above.hp, above.maxHp, 'same X but vertically separated target is not hit');
  assert.equal(below.hp, below.maxHp, 'same X but vertically separated target is not hit');
  assert.equal(near.hp, near.maxHp - 29, 'near target is hit once despite repeated overlap checks');
  assert.equal(far.hp, far.maxHp - 29, 'far target is hit when the projectile reaches its trajectory');

  const isolated = createProjectileSystem();
  spawnRole5LoongSwordProjectile(isolated, { sourceId: 'p1', x: 0, y: 500, facingX: 1 }, role5Attack('hit18', 1, 2), true);
  spawnRole5LoongSwordProjectile(isolated, { sourceId: 'p2', x: 280, y: 500, facingX: -1 }, role5Attack('hit18', -1, 2), true);
  const sharedTarget = createStage1CombatEnemy({ id: 'shared', enemyType: 30, x: 140, y: 500 });
  const isolatedCombat = createStage1CombatRuntime();
  resolveRole5LoongSwordProjectileHits({ projectiles: isolated, combat: isolatedCombat, enemies: [sharedTarget], timeMs: 0 });
  assert.equal(isolatedCombat.audit.damageEvents.length, 2);
  assert.deepEqual(new Set(isolatedCombat.audit.damageEvents.map((event) => event.sourceId)), new Set(['p1', 'p2']));

  const lethalProjectiles = createProjectileSystem();
  spawnRole5LoongSwordProjectile(
    lethalProjectiles,
    { sourceId: 'p2', x: 0, y: 500, facingX: 1 },
    role5Attack('hit18', 1, 3),
    true,
  );
  const dying = createStage1CombatEnemy({ id: 'dying', enemyType: 30, x: 100, y: 500 });
  dying.hp = 10;
  const lethalCombat = createStage1CombatRuntime();
  const lethalEvents = resolveRole5LoongSwordProjectileHits({
    projectiles: lethalProjectiles,
    combat: lethalCombat,
    enemies: [dying],
    timeMs: 0,
  });
  assert.equal(lethalEvents[0]?.amount, 10, 'shared settlement clamps lethal damage to remaining HP');
  assert.equal(dying.phase, 'dead');
  assert.equal(dying.lastHitBy, 'p2', 'shared settlement preserves reward ownership');
  assert.deepEqual(
    [lethalEvents[0]?.knockbackX, lethalEvents[0]?.knockbackY],
    [0, -2],
    'shared settlement preserves projectile knockback',
  );
}

function role5Attack(
  actionName: string,
  facingX: -1 | 1,
  id = 1,
): ActiveHeroNormalAttack {
  return {
    id, heroId: 5, actionName,
    effectKey: HeroNormalAttackEffectKeys.role5SwordHit1,
    sourceSymbol: 'swordhit1', followsHero: true,
    startedAtMs: 0, hitboxActiveFromMs: 0, hitboxActiveUntilMs: 150, endsAtMs: 190,
    facingX, spawnX: 0, spawnY: 500,
    hitboxOffsetX: 44, hitboxOffsetY: -72, hitboxWidth: 195, hitboxHeight: 112,
    damage: 32, attackKind: 'physics',
  };
}

testWorldEffectRegistryIsExplicit();
testWorldEffectVisualProjectionConsumesGeometryOwner();
testRole2WorldHitboxUsesReleasePointAndFacing();
testRole4ArrowUsesWorldGeometryWhileShovelDoesNot();
testFormalCombatResolvesFarWorldEffectOnceWithoutRearLeak();
testProjectionRejectsUnknownEffects();
testRole5LoongSwordThreeStagesAndEnemyMoveFrames();
testRole5LoongSwordFacingStateAndFormalRuntimeDispatch();
testRole5LoongSwordTrajectoryHitsAndPlayerIsolation();

console.log('Remote normal attack world effects and Role5 moving-projectile tests passed.');
