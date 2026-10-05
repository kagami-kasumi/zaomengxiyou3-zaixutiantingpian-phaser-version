import { createMonster2AttackRuntime, syncMonster2BodyState, type Monster2Attack, type Monster2ReceptionPair, type Monster2RawSpawn } from './Monster2AttackRuntime';
import { createMonster2Selection, type Monster2Selection } from './Monster2Selection';
import { stepMonster2World } from './Monster2WorldStep';
import { initializeMonsterPetTargetEffects, isMonsterPetIceActive } from './MonsterPetTargetEffectSystem';
import { clearUnavailableMonsterAttackTarget, selectMonsterAttackTarget } from './MonsterExperienceSystem';
import { type Stage1CombatEnemy } from './Stage1CombatSystem';
import type { MonsterDamageSource } from './MonsterDamageReception';
import type { Stage12MonsterAction } from './Stage12MonsterVisualSystem';

export type Monster2CombatWorldState = {
  action: Stage12MonsterAction; selection: Monster2Selection; source: MonsterDamageSource;
};

export function syncMonster2CombatBody(enemy: Stage1CombatEnemy): void {
  if (!enemy.monster2AttackRuntime || !enemy.monster2WorldState) return;
  syncMonster2BodyState(enemy.monster2AttackRuntime, { id: enemy.id, parentId: '',
    x: enemy.x, y: enemy.y, facingX: enemy.facingX, attackSerial: enemy.attackSerial,
    state: enemy.phase === 'dead' ? 'dead' : enemy.phase === 'hurt' ? 'hurt' : enemy.monster2WorldState.action });
}

/** Stage1 combat-model adapter: coordinates/HP/targets stay on the existing model.
 * Source property defaults are BaseMonster's constructor values (256/258); Boss Hit
 * is added by the getter, not pre-added to the mutable base value here. */
export function updateMonster2CombatWorld(enemy: Stage1CombatEnemy, options: Readonly<{
  parentId: string; timeMs: number; deltaMs: number; hostFps: number; difficulty: number;
  boss: boolean; flower: boolean; random?: () => number;
  targets: (attack: Monster2Attack) => readonly Monster2ReceptionPair[];
  emitRaw: (spawn: Monster2RawSpawn) => void;
  gather: (point: Readonly<{ x: number; y: number }>) => void;
}>): void {
  if (enemy.enemyType !== 2) throw new Error('Monster2 adapter received another family');
  const state = enemy.monster2WorldState ??= {
    action: 'wait', selection: createMonster2Selection(options.hostFps, options.boss, options.difficulty),
    source: { boss: options.boss, hit: 0, criticalPercent: 0, magicDefenseReduction: 0,
      flower: options.flower, random: options.random ?? Math.random },
  };
  state.source.flower = options.flower;
  state.source.random = options.random ?? Math.random;
  const runtime = enemy.monster2AttackRuntime ??= createMonster2AttackRuntime();
  const effects = initializeMonsterPetTargetEffects(enemy);
  const host = {
    id: enemy.id, parentId: options.parentId,
    get x() { return enemy.x; }, get y() { return enemy.y; }, get hp() { return enemy.hp; },
    get facingX() { return enemy.facingX; }, set facingX(value: -1 | 1) { enemy.facingX = value; },
    get attackSerial() { return enemy.attackSerial; }, set attackSerial(value: number) { enemy.attackSerial = value; },
    get state(): Stage12MonsterAction {
      return enemy.phase === 'dead' ? 'dead' : enemy.phase === 'hurt' ? 'hurt' : state.action;
    },
    set state(value: Stage12MonsterAction) {
      state.action = value;
      enemy.phase = value === 'dead' ? 'dead' : value === 'hurt' ? 'hurt'
        : value === 'hit1' || value === 'hit2' ? 'windup' : 'approach';
      // The old timed hitbox is not an additional damage producer.
      enemy.activeAttack = undefined;
    },
  };
  stepMonster2World({ runtime, host, effects, selection: state.selection, source: state.source,
    timeMs: options.timeMs, deltaMs: options.deltaMs, difficulty: options.difficulty, targets: options.targets,
    emitRaw: options.emitRaw, gather: options.gather,
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
      else if (moving) enemy.x += enemy.facingX * 5;
      clearUnavailableMonsterAttackTarget(enemy);
    },
  });
}
