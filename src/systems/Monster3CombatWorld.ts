import { createMonster3AttackRuntime, syncMonster3BodyState, type Monster3Attack, type Monster3ReceptionPair } from './Monster3AttackRuntime';
import { createMonster3Selection, type Monster3Selection } from './Monster3Selection';
import { stepMonster3World } from './Monster3WorldStep';
import { initializeMonsterPetTargetEffects, isMonsterPetIceActive } from './MonsterPetTargetEffectSystem';
import { clearUnavailableMonsterAttackTarget, selectMonsterAttackTarget } from './MonsterExperienceSystem';
import { getStage1EnemyConfig, type Stage1CombatEnemy } from './Stage1CombatSystem';
import type { MonsterDamageSource } from './MonsterDamageReception';
import type { Stage11MonsterVisualSnapshot } from './Stage11MonsterVisualSystem';

export type Monster3CombatWorldState = {
  action: Stage11MonsterVisualSnapshot['state']; selection: Monster3Selection; source: MonsterDamageSource;
};

export function syncMonster3CombatBody(enemy: Stage1CombatEnemy): void {
  if (!enemy.monster3AttackRuntime || !enemy.monster3WorldState) return;
  syncMonster3BodyState(enemy.monster3AttackRuntime, { id: enemy.id, parentId: '',
    x: enemy.x, y: enemy.y, facingX: enemy.facingX, attackSerial: enemy.attackSerial,
    state: enemy.phase === 'dead' ? 'dead' : enemy.phase === 'hurt' ? 'hurt' : enemy.monster3WorldState.action });
}

/** Stage1 combat-model adapter: coordinates/HP/targets stay on the existing model.
 * Source property defaults are BaseMonster's constructor values (251); Boss Hit
 * is added by the getter, not pre-added to the mutable base value here. */
export function updateMonster3CombatWorld(enemy: Stage1CombatEnemy, options: Readonly<{
  parentId: string; timeMs: number; deltaMs: number; hostFps: number; difficulty: number;
  boss: boolean; flower: boolean; random?: () => number;
  targets: (attack: Monster3Attack) => readonly Monster3ReceptionPair[];
}>): void {
  if (enemy.enemyType !== 3) throw new Error('Monster3 adapter received another family');
  const state = enemy.monster3WorldState ??= {
    action: 'wait', selection: createMonster3Selection(options.hostFps, options.boss, options.difficulty),
    source: { boss: options.boss, hit: 0, criticalPercent: 0, magicDefenseReduction: 0,
      flower: options.flower, random: options.random ?? Math.random },
  };
  state.source.flower = options.flower;
  state.source.random = options.random ?? Math.random;
  const runtime = enemy.monster3AttackRuntime ??= createMonster3AttackRuntime();
  const effects = initializeMonsterPetTargetEffects(enemy);
  const host = {
    id: enemy.id, parentId: options.parentId,
    get x() { return enemy.x; }, get y() { return enemy.y; }, get hp() { return enemy.hp; },
    get facingX() { return enemy.facingX; }, set facingX(value: -1 | 1) { enemy.facingX = value; },
    get attackSerial() { return enemy.attackSerial; }, set attackSerial(value: number) { enemy.attackSerial = value; },
    get state(): Stage11MonsterVisualSnapshot['state'] {
      return enemy.phase === 'dead' ? 'dead' : enemy.phase === 'hurt' ? 'hurt' : state.action;
    },
    set state(value: Stage11MonsterVisualSnapshot['state']) {
      state.action = value;
      enemy.phase = value === 'dead' || value === 'removed' ? 'dead' : value === 'hurt' ? 'hurt'
        : value === 'hit1' || value === 'hit2' ? 'windup' : 'approach';
      // The old timed hitbox is not an additional damage producer.
      enemy.activeAttack = undefined;
    },
  };
  stepMonster3World({ runtime, host, effects, selection: state.selection, source: state.source,
    timeMs: options.timeMs, deltaMs: options.deltaMs, difficulty: options.difficulty, targets: options.targets,
    ready: () => runtime.destroyed,
    readDecisionTarget: () => {
      const target = enemy.experienceBinding?.target;
      if (!target) {
        if (enemy.hp > 0 && !isMonsterPetIceActive(enemy) && ['wait', 'walk'].includes(host.state)) {
          selectMonsterAttackTarget(enemy, enemy.x, enemy.y, 1000);
        }
        // Source selects a missing target after normalWalk; no same-tick attack.
        return undefined;
      }
      return { ...target.position(), dead: target.isDead() };
    },
    afterSelection: () => {
      const moving = host.state === 'walk' && enemy.hp > 0 && !isMonsterPetIceActive(enemy);
      if (enemy.petKnockback?.active) {
        enemy.petKnockback.motion.direction = moving ? enemy.facingX : 0;
        if (!moving) enemy.petKnockback.motion.velocityX = 0;
      }
      else if (moving) enemy.x += enemy.facingX * getStage1EnemyConfig(3).moveSpeed / options.hostFps;
      clearUnavailableMonsterAttackTarget(enemy);
    },
  });
}
