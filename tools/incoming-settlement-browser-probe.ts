import { createIncomingDamageFeedbackModel } from '../src/systems/IncomingDamageFeedbackSystem';
import { createPetRuntime } from '../src/systems/PetRuntimeSystem';
import { applyMonster30AttackToPlayers } from '../src/scenes/test-scene/TestSceneCombatBridge';
import { applyBossAttack } from '../src/scenes/test-scene/TestSceneBossArena';
import { createMonster30, getMonster30AttackHitbox } from '../src/systems/Monster30System';
import { createMonster3, getMonster3AttackHitbox } from '../src/systems/Monster3System';
import { createHeroMovement } from '../src/systems/HeroMovementSystem';
import { createHeroNormalAttack } from '../src/systems/HeroNormalAttackSystem';
import { createHitRegistry, resolveHitOnce } from '../src/systems/CombatSystem';
import { createSettlementFixture, expectedSettlement, settlementCases, settlementSnapshot } from './incoming-settlement-cases';

// Real TestScene consumers and Phaser rectangle collision, with controlled active attacks.
// No mocked settlement/collision and no claim of full scene or rendered combat acceptance.
const rows: unknown[] = [];
const incomingRows: unknown[] = [];
for (const kind of ['monster30', 'monster3'] as const) {
  for (const slot of ['p1', 'p2'] as const) {
    for (const row of settlementCases) for (const gate of ['hit', 'miss', 'duplicate'] as const) {
      const f = createSettlementFixture(row, slot);
      const monster = kind === 'monster30' ? createMonster30(0, 0, 'fixture-monster30') : createMonster3(0, 0);
      monster.state = 'hit1';
      monster.activeAttack = {
        id: 1, attackId: row.id, actionName: 'hit1', damage: f.event.amount, attackKind: 'magic',
        elapsedMs: 1, hitboxActiveFromMs: 0, hitboxActiveUntilMs: 10,
        facingX: 1, knockbackX: 0, knockbackY: 0,
      };
      const hitbox = kind === 'monster30'
        ? getMonster30AttackHitbox(monster as ReturnType<typeof createMonster30>)!
        : getMonster3AttackHitbox(monster as ReturnType<typeof createMonster3>)!;
      const player = { slot, combat: f.hero, normalAttack: createHeroNormalAttack('role1'),
        movement: createHeroMovement(gate === 'miss' ? 10000 : hitbox.x + hitbox.width / 2, hitbox.y + hitbox.height / 2 + 48) };
      const incoming = createIncomingDamageFeedbackModel();
      f.hero.incomingFeedback = { model: incoming, targetKind: 'hero', ownerSlot: slot, targetId: slot,
        targetRuntimeId: `${incoming.runtimeId}:${slot}`, worldAnchor: () => ({ x: player.movement.x, y: player.movement.y }) };
      const petRuntime = createPetRuntime(f.pets[slot === 'p1' ? 0 : 1], { x: 123, y: 234, facingX: 1 });
      const hitRegistry = createHitRegistry();
      if (gate === 'duplicate') resolveHitOnce(hitRegistry, row.id, slot);
      let accepted = false;
      if (kind === 'monster30') {
        accepted = applyMonster30AttackToPlayers({ monster: monster as ReturnType<typeof createMonster30>,
          players: [player], petRosters: f.rosters, petRuntimes: { [slot]: petRuntime }, hitRegistry, renderedMonsterAttackIds: new Set(), time: 0,
        }).damageEvents.length === 1;
      } else {
        const context = { getBossArena: () => ({ boss: monster }), getPlayers: () => [player],
          playerPetRosters: f.rosters, petRuntime: slot === 'p1' ? petRuntime : undefined, p2PetRuntime: slot === 'p2' ? petRuntime : undefined, hitRegistry, renderedMonsterAttackIds: new Set(), lastDamageEvent: undefined };
        applyBossAttack.call(context, 0);
        accepted = context.lastDamageEvent !== undefined;
      }
      const expected = gate === 'hit' ? expectedSettlement(row) : {
        heroHp: row.initialHp ?? 200, petHp: row.initialPetHp ?? 200,
        otherPetHp: 200, accepted: false, shieldAfter: row.shield ?? 0,
      };
      incomingRows.push({ id: `${kind}/${slot}/${row.id}/${gate}`, slot, caseId: row.id, gate,
        heroAnchor: { x: player.movement.x, y: player.movement.y }, petAnchor: { x: petRuntime.x, y: petRuntime.y }, events: incoming.trace });
      rows.push({ id: `${kind}/${slot}/${row.id}/${gate}`, actual: settlementSnapshot(f, accepted), expected });
    }
  }
}
Object.assign(window, { settlementRows: rows, incomingRows, probeReady: true });
