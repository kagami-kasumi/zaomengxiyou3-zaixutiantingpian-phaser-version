import type { PetBehaviorContext } from './PetBehavior';
import type { PetSkillCastResult, PetSkillTarget } from './PetTypes';
import type { ProjectileVariant } from './ProjectileTypes';
import { recordProjectileHit, spawnProjectileFromTuning } from './ProjectileSystem';
import { consumeDragonDamageCache, type DragonDamageCache } from './PetDragonDamageSystem';
import { refreshMonkeyHorseContextDamage } from './PetMonkeyHorseDamageSystem';
import { getDragonTargetCollisionBounds, toDragonSourceCoordinate } from './PetDragonCollisionSystem';
import { sampleMonkeyHorseWorldHit } from './PetMonkeyHorseCollisionSystem';
import normalTruth from '../assets/pet-monkey-horse-normal.json';
import monkeyEffects from '../assets/pet-monkey-effects.json';
import horseEffects from '../assets/pet-horse-effects.json';
import type { MonkeyHorsePrivateProjectile } from './PetMonkeyHorsePrivateProjectile';
import { advanceHorseAoyiMotion } from './PetHorseAoyiMotion';
import { emitHorseAoyi } from './PetHorseAoyiProjectiles';
import { emitHorseAoyiPrelude } from './PetHorseAoyiPrelude';
import { petTargetEffectPayload } from './PetTargetEffectPayload';
import { bindMonkeyHorseNativeClipClock } from './PetMonkeyHorseNativeClipClock';

/** BasePet private effects. Shared render updates must not advance these handles. */
export class PetMonkeyHorseProjectileSystem {
  private bullets: MonkeyHorsePrivateProjectile[] = [];
  private initialAttack = 0;

  enter(context: PetBehaviorContext): void { this.initialAttack = context.pet.atk; }

  emitHorseAoyi(context: PetBehaviorContext): PetSkillCastResult {
    return emitHorseAoyi(context, entry => this.bullets.push(entry));
  }

  emitHorseAoyiPrelude(context: PetBehaviorContext): void {
    emitHorseAoyiPrelude(context, entry => this.bullets.push(entry));
  }

  emit(context: PetBehaviorContext, target?: Readonly<PetSkillTarget>): PetSkillCastResult {
    const family = context.pet.species;
    if (family !== 'monkey' && family !== 'horse') throw new Error('Unexpected normal projectile family');
    const form = context.pet.form;
    const definition = normalTruth[family].forms[String(form) as keyof typeof normalTruth.monkey.forms];
    if (!definition) throw new Error(`Unknown ${family} normal form ${form}`);
    const { offsetX, offsetY, lastTick, symbol: sourceSymbol } = definition;
    const attackKind = definition.attackKind;
    if (attackKind !== 'physics') throw new Error('Unexpected normal attack kind in source data');
    const cache = refreshNormalDamage(context);
    return context.castSkill(({ roster, runtime, projectiles }) => {
      const projectile = spawnProjectileFromTuning(projectiles, {
        sourceId: context.pet.id, x: toDragonSourceCoordinate(runtime.x),
        y: toDragonSourceCoordinate(runtime.y), facingX: runtime.facingX,
      }, `pet-${family}${form}-normal` as ProjectileVariant, `${family}${form}-normal`, {
        actionName: 'hit1', assetKey: `pet-skill.${family}${form}.normal`, sourceSymbol, runtimeName: sourceSymbol,
        offsetX, offsetY, speedX: 0, speedY: 0, distance: undefined, width: 0, height: 0,
        lifetimeMs: lastTick * 1000 / context.hostFps, damage: cache.hurt, attackKind,
        knockbackX: runtime.facingX * definition.knockback[0], knockbackY: definition.knockback[1],
        hitIntervalFrames: definition.interval, maxHits: definition.maxHits,
      });
      projectile.x = toDragonSourceCoordinate(projectile.x); projectile.y = toDragonSourceCoordinate(projectile.y);
      projectile.petHostTick = 0; projectile.petActionToken = context.actionToken;
      bindMonkeyHorseNativeClipClock(projectile, context);
      projectile.critical = cache.critical; projectile.destroyWhenSourceHurt = false;
      projectiles.projectiles.push(projectile);
      this.bullets.push({ projectile, cache, lastTick, action: 'hit1' });
      return { ok: true, message: `${family}${form} hit1`, pet: roster.pets.find(pet => pet.id === context.pet.id),
        target: target && { ...target }, projectile, damage: cache.hurt, mpBefore: context.pet.mp, mpAfter: context.pet.mp };
    });
  }

  emitMonkeySkill(context: PetBehaviorContext, skill: 'xj' | 'lj' | 'lyq', target: Readonly<PetSkillTarget>): PetSkillCastResult {
    const form = context.pet.form;
    const action = form === 1 ? 'hit2' : form === 2 ? skill === 'lj' ? 'hit2' : 'hit3'
      : skill === 'lyq' ? 'hit2' : skill === 'xj' ? 'hit3' : 'hit4';
    const definition = monkeyEffects.effects.find(row => row.form === form && row.action === action);
    if (context.pet.species !== 'monkey' || !definition) throw new Error(`Unknown monkey skill ${form}/${skill}`);
    return this.emitSkill(context, skill, action, definition, target);
  }

  emitHorseSkill(context: PetBehaviorContext, skill: 'sp' | 'bd' | 'bz', target: Readonly<PetSkillTarget>): PetSkillCastResult {
    const form = context.pet.form;
    const action = form === 1 ? 'hit2' : skill === 'bd' ? 'hit2' : skill === 'sp' ? 'hit3' : 'hit4';
    const definition = horseEffects.effects.find(row => row.form === form && row.action === action);
    if (context.pet.species !== 'horse' || !definition) throw new Error(`Unknown horse skill ${form}/${skill}`);
    if (skill === 'bd') context.protectFromHits(15);
    return this.emitSkill(context, skill, action, definition, target);
  }

  private emitSkill(context: PetBehaviorContext, skill: string, action: string,
    definition: typeof monkeyEffects.effects[number], target: Readonly<PetSkillTarget>): PetSkillCastResult {
    const family = context.pet.species, form = context.pet.form;
    const attackKind = definition.attackKind;
    if (attackKind !== 'physics' && attackKind !== 'magic') throw new Error('Unknown pet skill attack kind');
    return context.castSkill(({ roster, runtime, projectiles }) => {
      const created = definition.effects.map(effect => {
        // setDisable precedes setAction: these prelude effects never roll or damage.
        const cache = effect.disabled ? { hurt: 0, attack: 0, critical: false }
          : refreshMonkeyHorseContextDamage(context, action);
        const lastTick = effect.timed ? effect.lifetime * context.hostFps : effect.lifetime;
        const visualForm = family === 'monkey' ? Math.min(form, 3) : form;
        const variant = `pet-${family}${visualForm}-${skill}` as ProjectileVariant;
        const projectile = spawnProjectileFromTuning(projectiles, { sourceId: context.pet.id,
          x: toDragonSourceCoordinate(runtime.x), y: toDragonSourceCoordinate(runtime.y), facingX: runtime.facingX },
        variant, effect.symbol, { actionName: action, assetKey: `pet-skill.${family}${visualForm}.${skill}`,
          sourceSymbol: effect.symbol, runtimeName: effect.symbol, offsetX: effect.offsetX, offsetY: effect.offsetY,
          speedX: 0, speedY: 0, distance: undefined, width: 0, height: 0,
          lifetimeMs: lastTick * 1000 / context.hostFps, damage: cache.hurt, attackKind,
          knockbackX: runtime.facingX * definition.knockback[0]!, knockbackY: definition.knockback[1]!,
          hitIntervalFrames: definition.interval, maxHits: definition.maxHits });
        projectile.x = toDragonSourceCoordinate(projectile.x); projectile.y = toDragonSourceCoordinate(projectile.y);
        projectile.petHostTick = 0; projectile.petActionToken = context.actionToken;
        bindMonkeyHorseNativeClipClock(projectile, context);
        projectile.critical = cache.critical; projectile.visualOnly = effect.disabled;
        projectile.petTargetEffects = petTargetEffectPayload(context, action, this.initialAttack);
        projectile.destroyWhenSourceHurt = effect.cut;
        projectiles.projectiles.push(projectile);
        this.bullets.push({ projectile, cache, lastTick, action, timed: effect.timed, follows: effect.follows,
          sourceX: toDragonSourceCoordinate(runtime.x), sourceY: toDragonSourceCoordinate(runtime.y),
          sourceMatrixA: runtime.rootScaleX ?? 1 });
        return projectile;
      });
      const state = context.pet.skillState;
      if (state && family === 'monkey' && skill === 'xj') {
        if (form === 1) state.monkey1Xj.releaseReady = false;
        else if (form === 2) state.monkey2Xj.releaseReady = false;
        else state.monkey3Lj.releaseReady = false;
      }
      if (state && family === 'horse' && skill === 'bd') state.horse2Bd.releaseReady = false;
      const projectile = created.find(p => !p.visualOnly)!;
      return { ok: true, message: `${family}${form} ${action}`, pet: roster.pets.find(p => p.id === context.pet.id),
        target: { ...target }, projectile, projectiles: created, damage: projectile.damage,
        mpBefore: context.pet.mp, mpAfter: context.pet.mp };
    });
  }

  step(context: PetBehaviorContext): void {
    if (!this.bullets.length) return;
    const combat = context.projectileCombat;
    if (!combat?.monkeyHorseCollision) throw new Error('Monkey/horse normal projectile requires prepared collision resources');
    const assets = combat.monkeyHorseCollision();
    const family = context.pet.species;
    if (family !== 'monkey' && family !== 'horse') throw new Error('Unexpected normal projectile owner');
    for (const entry of this.bullets) {
      const p = entry.projectile;
      if (p.isExpired) continue;
      const age = p.petHostTick! + 1;
      const phaseTick = p.petNativePhaseTick?.() ?? age;
      // Actual body-born joint trace: birth=frame1, first step=frame1, second step=frame2.
      const direction = p.petRenderDirection ?? -p.facingX as -1 | 1;
      // TTL reaches zero in BaseBullet.step, before checkAttack. Last-frame effects expire after it.
      if (entry.timed && age === entry.lastTick) p.isExpired = true;
      if (!p.visualOnly && !p.isExpired && age > 1 && (age - 1) % p.hitIntervalFrames === 0) p.hitSerial++;
      if (!p.visualOnly) {
        const field = assets.fieldAt(family, p.sourceSymbol, phaseTick, direction);
        p.width = field.bounds.width; p.height = field.bounds.height;
      }
      for (const target of p.visualOnly ? [] : context.targets) {
        if (p.isExpired) break;
        const world = combat.target(target.id);
        if (!world?.alive) continue;
        const bounds = getDragonTargetCollisionBounds(world.monsterId, 0, 0);
        const mapping = assets.data.monsterTargets.mappings.find(row => row.monsterId === world.monsterId);
        const targetIndex = assets.data.monsterTargets.symbols.findIndex(row => row.symbol === mapping?.symbol);
        if (targetIndex < 0) throw new Error(`Unknown monkey/horse collision target ${world.monsterId}`);
        if (!sampleMonkeyHorseWorldHit(assets, { family, symbol: p.sourceSymbol, nativeTick: phaseTick, direction, sourceRoot: p },
          { x: world.x, y: world.y, bounds, shape: { kind: 'runtime', index: targetIndex } }).hit) continue;
        entry.cache = consumeDragonDamageCache(entry.cache, {
          accept: cache => combat.hit(p, target.id, cache), refresh: () => refreshMonkeyHorseContextDamage(context, entry.action),
          onAccepted: () => { entry.onAccepted?.(context); recordProjectileHit(p); },
        });
        p.damage = entry.cache.hurt; p.critical = entry.cache.critical;
      }
      if (entry.motion) {
        const target = entry.motion.targetId
          ? (entry.retainedTarget ? entry.retainedTarget() : combat.target(entry.motion.targetId)) : undefined;
        advanceHorseAoyiMotion(p, entry.motion, target);
        p.velocityX = entry.motion.speedX; p.velocityY = entry.motion.speedY;
        p.remainingDistance = entry.motion.distance; p.trackingTargetId = entry.motion.targetId;
      }
      p.petHostTick = age; p.elapsedMs = age * 1000 / context.hostFps;
      if ((p.petNativeFrame?.() ?? age) === entry.lastTick) p.isExpired = true;
      if (p.destroyWhenSourceHurt && context.animation?.action === 'hurt') p.isExpired = true;
      // FollowBaseObjectBullet applies displacement and root matrix only after the whole base step2.
      if (entry.follows && !p.isExpired) {
        const x = toDragonSourceCoordinate(context.runtime.x), y = toDragonSourceCoordinate(context.runtime.y);
        p.x = toDragonSourceCoordinate(p.x + x - entry.sourceX!);
        p.y = toDragonSourceCoordinate(p.y + y - entry.sourceY!);
        entry.sourceX = x; entry.sourceY = y;
        const matrixA = context.runtime.rootScaleX ?? 1;
        if (matrixA !== entry.sourceMatrixA) {
          p.petRenderDirection = matrixA;
          entry.sourceMatrixA = matrixA;
        }
      }
      context.emit({ type: entry.action === 'hit1' ? 'monkey-horse-normal-step' : 'monkey-horse-skill-step', payload: { projectileId: p.projectileId, age,
        x: p.x, y: p.y, expired: p.isExpired, remainingHits: p.remainingHits } });
    }
    this.bullets = this.bullets.filter(entry => !entry.projectile.isExpired);
  }

  destroy(): void {
    for (const entry of this.bullets) entry.projectile.isExpired = true;
    this.bullets = [];
  }
}

function refreshNormalDamage(context: PetBehaviorContext): DragonDamageCache {
  return refreshMonkeyHorseContextDamage(context, 'hit1');
}
