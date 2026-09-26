import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createMonster30, updateMonster30 } from '../src/systems/Monster30System';
import { adaptTestScenePetEnemies } from '../src/scenes/test-scene/TestScenePetEnemyAdapter';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';
import { createStage1CombatRuntime } from '../src/systems/Stage1CombatSystem';
import { claimMonsterExperienceForCurrentTarget } from '../src/systems/PetBattleOwnershipSystem';
import type { ProjectileModel } from '../src/systems/ProjectileTypes';

const monster = createMonster30(300, 200); monster.hp = monster.maxHp = 1000;
const target = { slot: 'p2' as const, x: 300, y: 200 };
updateMonster30(monster, [target], 1000 / 24, () => 0.99, 24);
let lastDirectOwner: string | undefined;
const enemy = adaptTestScenePetEnemies([monster], (_monster, slot) => { lastDirectOwner = slot; })[0]!;
const port = createPetProjectileCombatPort({ enemies: [enemy], combat: createStage1CombatRuntime(), ownerSlot: 'p1',
  timeMs: 0, random: () => 0.75, mask: () => { throw new Error('Controlled accepted collision boundary'); } });
const bullet = { projectileId: 'fire', sourceAttackId: 'fire-action', sourceId: 'p1-monkey', hitSerial: 0,
  actionName: 'hit2', attackKind: 'physics', knockbackX: 0, knockbackY: 0,
  petTargetEffects: [{ name: 'petmonkey_fire', time: 100, hurt: 10000 }] } as ProjectileModel;
assert.equal(port.hit(bullet, enemy.id, { hurt: 40, attack: 40, critical: false }), true);
for (let tick = 0; tick < 24; tick++) updateMonster30(monster, [target], 1000 / 24, () => 0.99, 24);
assert.equal(monster.state, 'dead');
const award = claimMonsterExperienceForCurrentTarget(monster);
assert.equal(lastDirectOwner, 'p1'); assert.equal(award?.ownerSlot, 'p2');
const report = { status: 'confirmed-modern-ownership-gap-not-acceptance', lastDirectOwner,
  aiTarget: monster.targetSlot, awardedOwner: award?.ownerSlot,
  limitations: 'Controlled collision boundary; source attacker kind, retained pet identity, XP share and retarget branches require TASK-SETTINGS-231.' };
mkdirSync('docs/tasks/evidence/TASK-SLICE-226', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-226/target-owner-preflight.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
