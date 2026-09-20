import type { PetTurtleAssets } from '../assets/PetTurtleAssets';
import type { PetBehaviorContext } from './PetBehavior';
import type { ProjectileModel } from './ProjectileTypes';
import { spawnProjectileFromTuning, recordProjectileHit } from './ProjectileSystem';
import { consumeDragonDamageCache, type DragonDamageCache } from './PetDragonDamageSystem';
import { getPetTurtleNoncriticalPower, refreshPetTurtleDamage } from './PetTurtleDamageSystem';
import { samplePetTurtleHit } from './PetTurtleCollisionSystem';

/** Private effect handles, advanced only by the public entity session. */
export class PetTurtleProjectileSystem {
  private bullets: { projectile: ProjectileModel; cache: DragonDamageCache; action: 'hit1' | 'hit2';
    sourceX: number; sourceY: number; sourceMatrixA: -1 | 1; lastTick: number }[] = [];
  constructor(private readonly assets: PetTurtleAssets) {}

  emit(context: PetBehaviorContext, action: 'hit1' | 'hit2'): void {
    if (!context.projectileCombat) throw new Error('Turtle requires a real projectile combat port');
    const form = context.pet.form, sld = action === 'hit2';
    const symbol = sld ? 'PetTurtle1Bullet2' : form === 1 ? 'PetTurtle1Bullet1' : 'PetTurtle2Bullet1';
    const offset = sld ? (form === 1 ? [75, -125] : form === 2 ? [80, -125] : [75, -115])
      : form === 1 ? [85, -40] : form === 2 ? [95, -60] : [140, -75];
    const tree = this.assets.effect(symbol, 0, 1, 1).meta.tree!;
    const lastTick = tree.totalFrames;
    if (!lastTick || !tree.localBounds) throw new Error(`Missing turtle effect lifetime ${symbol}`);
    const cache = refreshPetTurtleDamage(context, action);
    context.castSkill(({ roster, runtime, projectiles }) => {
      const projectile = spawnProjectileFromTuning(projectiles, {
        sourceId: context.pet.id, x: twip(runtime.x), y: twip(runtime.y), facingX: runtime.facingX,
      }, sld ? 'pet-turtle-sld' : 'pet-turtle-normal', sld ? 'turtle-sld' : 'turtle-normal', {
        actionName: action, assetKey: '', sourceSymbol: symbol, runtimeName: symbol,
        offsetX: offset[0]!, offsetY: offset[1]!, speedX: 0, speedY: 0, distance: undefined,
        width: tree.localBounds!.width, height: tree.localBounds!.height,
        lifetimeMs: lastTick * 1000 / context.hostFps, damage: cache.hurt,
        attackKind: !sld || form === 4 ? 'physics' : 'magic',
        knockbackX: runtime.facingX * (sld ? form === 4 ? 6 : 10 : 6), knockbackY: sld ? 0 : -5,
        hitIntervalFrames: sld && form === 1 ? 7 : 999, maxHits: 99,
      });
      projectile.petHostTick = 0; projectile.petActionToken = context.actionToken;
      projectile.critical = cache.critical; projectile.destroyWhenSourceHurt = false;
      projectiles.projectiles.push(projectile);
      this.bullets.push({ projectile, cache, action, sourceX: twip(runtime.x), sourceY: twip(runtime.y),
        sourceMatrixA: runtime.rootScaleX ?? 1, lastTick });
      const hpBefore = context.pet.hp;
      if (sld) context.healSelf(getPetTurtleNoncriticalPower(context, action) >>> 0);
      context.emit({ type: 'turtle-projectile-created', payload: {
        projectileId: projectile.projectileId, sourceId: context.pet.id, symbol, action,
        sourceRoot: { x: twip(runtime.x), y: twip(runtime.y) },
        x: projectile.x, y: projectile.y, hpBefore, hpAfter: context.pet.hp, cache,
      } });
      return { ok: true, message: `turtle ${action}`, pet: roster.pets.find(p => p.id === context.pet.id), projectile };
    });
  }

  step(context: PetBehaviorContext): void {
    if (!this.bullets.length) return;
    const combat = context.projectileCombat;
    if (!combat) throw new Error('Turtle projectile lost its combat port');
    for (const entry of this.bullets) {
      const p = entry.projectile;
      if (p.isExpired) continue;
      const tick = p.petHostTick!;
      if (tick > 0 && tick % p.hitIntervalFrames === 0) p.hitSerial++;
      for (const target of context.targets) {
        if (p.isExpired) break;
        const world = combat.target(target.id);
        if (!world?.alive) continue;
        const sample = samplePetTurtleHit(this.assets, {
          symbol: p.sourceSymbol, nativeTick: tick, root: p, facingX: p.facingX,
        }, world);
        if (!sample.hit) continue;
        entry.cache = consumeDragonDamageCache(entry.cache, {
          accept: cached => combat.hit(p, target.id, cached),
          refresh: () => refreshPetTurtleDamage(context, entry.action),
          onAccepted: () => { recordProjectileHit(p); },
        });
        p.damage = entry.cache.hurt; p.critical = entry.cache.critical;
      }
      context.emit({ type: 'turtle-projectile-step', payload: {
        projectileId: p.projectileId, nativeTick: tick, x: p.x, y: p.y, facingX: p.facingX, hitSerial: p.hitSerial,
      } });
      p.petHostTick = tick + 1; p.elapsedMs = (tick + 1) * 1000 / context.hostFps;
      if (tick + 1 === entry.lastTick) p.isExpired = true;
      // FollowBaseObjectBullet applies root/matrix changes AFTER BaseBullet's checkAttack.
      if (entry.action === 'hit2' && !p.isExpired) {
        const x = twip(context.runtime.x), y = twip(context.runtime.y);
        p.x = twip(p.x + x - entry.sourceX); p.y = twip(p.y + y - entry.sourceY);
        entry.sourceX = x; entry.sourceY = y;
        // BasePet turns the body BBDC, not its root matrix. A body turn alone
        // must not flip an already-created FollowBaseObjectBullet.
        const matrixA = context.runtime.rootScaleX ?? 1;
        if (matrixA !== entry.sourceMatrixA) {
          p.facingX = -matrixA as -1 | 1;
          entry.sourceMatrixA = matrixA;
        }
      }
    }
    this.bullets = this.bullets.filter(entry => !entry.projectile.isExpired);
  }

  destroy(): void {
    for (const { projectile } of this.bullets) projectile.isExpired = true;
    this.bullets = [];
  }
}
const twip = (value: number) => Math.round(value * 20) / 20;
