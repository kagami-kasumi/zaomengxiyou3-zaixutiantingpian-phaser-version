import assert from 'node:assert/strict';
import type { PlayerInputState, PlayerSlot } from '../src/systems/InputSystem';
import {
  applyHeroPartyEnvironmentHits,
  createHeroPartyRuntimeModel,
  destroyHeroPartyRuntime,
  resolveHeroPartyAttacks,
  resolveHeroPartyEnemyAttack,
  setHeroPartySkillLoadout,
  snapshotHeroParty,
  updateHeroPartyRuntime,
} from '../src/systems/HeroPartyRuntimeSystem';
import {
  createStage1CombatEnemy,
  getStage1EnemyConfig,
  updateStage1Enemy,
} from '../src/systems/Stage1CombatSystem';
import { createTestRole1SkillLoadout } from '../src/systems/HeroSkillSystem';

const input = (slot: PlayerSlot, options: Partial<PlayerInputState> = {}): PlayerInputState => ({
  slot,
  moveX: 0,
  down: false,
  up: false,
  attack: false,
  jump: false,
  skillSlots: [false, false, false, false, false],
  special: false,
  magicWeapon: false,
  ...options,
});

function createRuntime() {
  return createHeroPartyRuntimeModel([
    { slot: 'p1', heroId: 1, x: 100, y: 500, width: 60, currentPlatformId: 'ground' },
    { slot: 'p2', heroId: 2, x: 160, y: 500, width: 60, currentPlatformId: 'ground' },
  ]);
}

function update(runtime: ReturnType<typeof createRuntime>, inputs: readonly PlayerInputState[], timeMs: number, deltaMs: number): void {
  updateHeroPartyRuntime(runtime, {
    inputs,
    timeMs,
    deltaMs,
    environmentFor: () => ({
      platforms: [{ id: 'ground', left: -500, right: 1_500, top: 500 }],
      bounds: { left: -500, right: 1_500, bottom: 500 },
    }),
  });
}

function testPartyOwnsMovementCombatAndSkills(): void {
  const runtime = createRuntime();
  update(runtime, [input('p1', { moveX: 1 }), input('p2')], 1_000, 100);
  assert.ok(snapshotHeroParty(runtime)[0]!.x > 100, 'party runtime advances hero movement');

  const loadout = createTestRole1SkillLoadout();
  setHeroPartySkillLoadout(runtime, 'p1', loadout);
  assert.strictEqual(runtime.members[0]!.combat.skill.loadout, loadout);

  update(runtime, [input('p1', { attack: true }), input('p2')], 1_100, 0);
  const heroX = snapshotHeroParty(runtime)[0]!.x;
  const enemy = createStage1CombatEnemy({ id: 'pilot-target', enemyType: 30, x: heroX + 80, y: 500 });
  resolveHeroPartyAttacks(runtime, [enemy], 1_150);
  assert.equal(enemy.hp, 123, 'party runtime resolves the shared Role1 attack window');

  update(runtime, [input('p1'), input('p2', { attack: true })], 1_200, 0);
  const secondHeroX = snapshotHeroParty(runtime)[1]!.x;
  const secondEnemy = createStage1CombatEnemy({
    id: 'pilot-target-p2', enemyType: 30, x: secondHeroX + 80, y: 500,
  });
  resolveHeroPartyAttacks(runtime, [secondEnemy], 1_250);
  assert.ok(secondEnemy.hp < secondEnemy.maxHp, 'party runtime resolves P2 attack independently');
}

function testEnemyDamageAndIdempotentDestroy(): void {
  const runtime = createRuntime();
  const enemy = createStage1CombatEnemy({ id: 'pilot-attacker', enemyType: 7, x: 120, y: 500 });
  const targets = snapshotHeroParty(runtime);
  updateStage1Enemy({ enemy, targets, deltaMs: 0 });
  updateStage1Enemy({ enemy, targets, deltaMs: getStage1EnemyConfig(7).windupMs });
  resolveHeroPartyEnemyAttack(runtime, enemy, 2_000);
  assert.ok(snapshotHeroParty(runtime)[0]!.hp < snapshotHeroParty(runtime)[0]!.maxHp);

  destroyHeroPartyRuntime(runtime);
  destroyHeroPartyRuntime(runtime);
  assert.deepEqual(snapshotHeroParty(runtime), []);
  update(runtime, [input('p1', { moveX: 1 }), input('p2')], 3_000, 100);
  assert.deepEqual(snapshotHeroParty(runtime), [], 'destroyed runtime ignores later frames');
}

function testEnvironmentHitOwnsDamageKnockbackAndDeath(): void {
  const runtime = createRuntime();
  applyHeroPartyEnvironmentHits(runtime, [{
    target: 'p1',
    damage: 10,
    knockbackX: -50,
    bounds: { left: 80, right: 200 },
    deathReason: 'movement-trap',
  }]);
  const hurt = snapshotHeroParty(runtime)[0]!;
  assert.equal(hurt.hp, hurt.maxHp - 10);
  assert.equal(hurt.x, 80, 'environment knockback clamps inside the supplied level bounds');
  assert.equal(runtime.members[0]!.combat.combat.state, 'hurt');

  applyHeroPartyEnvironmentHits(runtime, [{
    target: 'p1',
    damage: hurt.maxHp,
    knockbackX: 200,
    bounds: { left: 80, right: 200 },
    deathReason: 'movement-trap',
  }]);
  const dead = snapshotHeroParty(runtime)[0]!;
  assert.equal(dead.hp, 0);
  assert.equal(dead.x, 200);
  assert.equal(dead.deathReason, 'movement-trap');
  assert.equal(dead.alive, false);
}

testPartyOwnsMovementCombatAndSkills();
testEnemyDamageAndIdempotentDestroy();
testEnvironmentHitOwnsDamageKnockbackAndDeath();
console.log('Hero party runtime movement, combat, skills, snapshots, and destroy tests passed.');
