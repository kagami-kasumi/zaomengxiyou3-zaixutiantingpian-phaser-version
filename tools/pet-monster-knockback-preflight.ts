/** Diagnostic reproduction, not a passing gameplay gate. No source files are changed. */
import { mkdirSync, writeFileSync } from 'node:fs';
import { createStage1CombatRuntime, createStage1CombatEnemy, resolveStage1PetHit } from '../src/systems/Stage1CombatSystem';
import { createMonsterPhysics, updateMonsterPhysics } from '../src/systems/MonsterPhysicsSystem';

const runtime = createStage1CombatRuntime();
const enemy = createStage1CombatEnemy({ id: 'dyn-monster', enemyType: 7, x: 300, y: 420 });
const physics = createMonsterPhysics({ y: 420, height: 100 });
const snapshot = () => ({ x: enemy.x, y: enemy.y, velocityY: physics.velocityY, hp: enemy.hp });
const before = snapshot();
const event = resolveStage1PetHit({ runtime, enemy, ownerSlot: 'p1', petId: 'pet-monkey',
  attackId: 'pet-monkey-hit-1', actionName: 'hit1', attackKind: 'physics', damage: 10,
  knockbackX: 6, knockbackY: -5, timeMs: 1000 });
const afterHit = { ...snapshot(), event };
updateMonsterPhysics(physics, enemy.x, [], 1000 / 60);
enemy.y = physics.y;
const report = { status: 'diagnostic-only', before, afterHit, afterFrame: snapshot(),
  audit: runtime.audit.damageEvents,
  scope: 'Actual shared pet hit function followed by shared physics. No scene or native full trajectory claim.' };
mkdirSync('docs/tasks/evidence/TASK-SLICE-226', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/monster-knockback-preflight.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
