import type { PetBehaviorContext } from './PetBehavior';
import type { ProjectileModel } from './ProjectileTypes';
import { spawnProjectileFromTuning, recordProjectileHit } from './ProjectileSystem';
import { getPetDragonEffectFrame } from '../assets/PetDragonAnimationAssets';
import { getDragonTargetCollisionBounds, toDragonSourceCoordinate as twips } from './PetDragonCollisionSystem';
import { sampleDragonEffectCollision } from './PetDragonEffectCollisionSystem';
import { calculateDragonHitHeal, consumeDragonDamageCache, refreshDragonDamageCache,
  type DragonDamageCache } from './PetDragonDamageSystem';

type Action = 'normal' | 'sdcc' | 'ltwj' | 'qlaoyi' | 'aoyi-buff';
type Root = { x: number; y: number; facingX: -1 | 1 };
type Bullet = { projectile: ProjectileModel; cache: DragonDamageCache; action: Action; owner: Root };
type Wave = { remainingMs: number; root: Root; offsets: readonly (readonly [number, number])[] };

/** Private effects owned and stepped by the existing entity session, including delayed waves. */
export class PetDragon23ProjectileSystem {
  private bullets: Bullet[] = [];
  private waves: Wave[] = [];
  constructor(private readonly form: 2 | 3 | 4) {}

  emit(context: PetBehaviorContext, action: Action = 'normal'): void {
    const root = { x: twips(context.runtime.x), y: twips(context.runtime.y), facingX: context.runtime.facingX };
    if (action === 'normal') {
      root.x += root.facingX * (this.form === 4 ? 65 : 30);
      if (this.form === 4) root.y -= 15;
    }
    if (action === 'aoyi-buff') root.facingX = -1;
    if (action === 'sdcc') root.y += 10;
    if (action === 'ltwj') {
      root.y += 40;
      const offsets = [[[-150, -10], [90, -25]], [[-90, -25], [150, -10]],
        [[-270, -25], [210, -10]], [[-210, -25], [270, -10]]] as const;
      offsets.forEach((points, index) => this.waves.push({ remainingMs: (index + 1) * 200, root, offsets: points }));
    }
    this.spawn(context, action, root);
  }

  private spawn(context: PetBehaviorContext, action: Action, root: Root): void {
    if (!context.projectileCombat) throw new Error('Dragon effect requires real projectile combat');
    const symbol = action === 'normal' ? `PetDragon${Math.min(this.form, 3)}Bullet1`
      : action === 'sdcc' ? 'PetDragon2Bullet2' : action === 'qlaoyi' ? 'PetDragonBullet4'
        : action === 'aoyi-buff' ? 'AoyiBuff' : 'PetDragon3Bullet3';
    const asset = getPetDragonEffectFrame(symbol, 1);
    const cache = this.refresh(context, action);
    context.castSkill(({ roster, projectiles }) => {
      const projectile = spawnProjectileFromTuning(projectiles, { sourceId: context.pet.id, ...root,
        x: twips(root.x), y: twips(root.y) },
        action === 'sdcc' ? 'pet-dragon2-sdcc' : action === 'ltwj' ? 'pet-dragon3-ltwj' : 'pet-dragon1-normal',
        `dragon${this.form}-${action}`, {
          actionName: action === 'normal' ? 'hit1' : action === 'sdcc' ? 'hit2'
            : action === 'qlaoyi' ? 'hit4' : action === 'aoyi-buff' ? 'null' : 'hit3',
          assetKey: asset.key, sourceSymbol: symbol, runtimeName: symbol,
          offsetX: 0, offsetY: 0, speedX: 0, speedY: 0, distance: undefined,
          width: asset.width, height: asset.height, lifetimeMs: asset.frameCount * 1000 / context.hostFps,
          damage: cache.hurt, attackKind: action === 'ltwj' || action === 'qlaoyi' ? 'magic' : 'physics',
          knockbackX: action === 'normal' ? 3 : action === 'sdcc' ? 7 : action === 'qlaoyi' ? 1 : 2, knockbackY: -5,
          hitIntervalFrames: action === 'normal' ? 10 : action === 'sdcc' ? 8 : 999, maxHits: 99,
        });
      projectile.petSourceKnockback = { x: projectile.knockbackX, y: projectile.knockbackY, direction: 'direct', direct: projectile.facingX };
      projectile.petHostTick = 0;
      projectile.petActionToken = context.actionToken;
      projectile.critical = cache.critical;
      projectile.destroyWhenSourceHurt = action === 'sdcc' || action === 'aoyi-buff';
      projectiles.projectiles.push(projectile);
      this.bullets.push({ projectile, cache, action, owner: { ...context.runtime } });
      context.emit({ type: `dragon${this.form}-${action}-emitted`, payload: {
        projectileId: projectile.projectileId, x: projectile.x, y: projectile.y, facingX: projectile.facingX, sourcePoint: root, cache,
      } });
      return { ok: true, message: `dragon${this.form} ${action}`, pet: roster.pets.find(p => p.id === context.pet.id), projectile };
    });
  }

  step(context: PetBehaviorContext): void {
    for (const entry of this.bullets) {
      const p = entry.projectile;
      if (p.isExpired) continue;
      const combat = context.projectileCombat;
      if (!combat) throw new Error('Dragon projectile lost combat port');
      const tick = p.petHostTick!;
      if (tick > 0 && tick % p.hitIntervalFrames === 0) p.hitSerial++;
      const frame = tick + 1;
      const asset = getPetDragonEffectFrame(p.sourceSymbol, frame);
      p.assetKey = asset.key;
      for (const target of context.targets) {
        if (entry.action === 'aoyi-buff') break;
        if (p.isExpired) break;
        const world = combat.target(target.id);
        if (!world?.alive) continue;
        const bounds = getDragonTargetCollisionBounds(world.monsterId, world.x, world.y);
        if (!sampleDragonEffectCollision(p.sourceSymbol, frame, p, p.facingX, bounds).hit) continue;
        entry.cache = consumeDragonDamageCache(entry.cache, {
          accept: cached => combat.hit(p, target.id, cached), refresh: () => this.refresh(context, entry.action),
          onAccepted: refreshed => {
            recordProjectileHit(p);
            if (entry.action === 'qlaoyi' || (this.form === 4 && entry.action === 'normal' && !context.parentRuntimeKey)) return;
            const hpBefore = context.pet.hp;
            const pet = context.pet;
            context.healSelf(entry.action === 'ltwj' ? (pet.maxHp * 0.028 + pet.atk * 0.09 + pet.level * 2) | 0
              : calculateDragonHitHeal(pet.maxHp, pet.atk, pet.level));
            context.emit({ type: `dragon${this.form}-hit-heal`, payload: {
              action: entry.action, projectileId: p.projectileId, targetId: target.id, frame,
              consumed: entry.cache, refreshed, hpBefore, hpAfter: pet.hp,
            } });
          },
        });
        p.damage = entry.cache.hurt; p.critical = entry.cache.critical;
      }
      p.petHostTick = frame; p.elapsedMs = frame * 1000 / context.hostFps;
      if (frame === asset.frameCount || (p.destroyWhenSourceHurt && context.animation?.action === 'hurt')) p.isExpired = true;
      // FollowBaseObjectBullet.step2 follows only after collision and last-frame/hurt cleanup.
      if (!p.isExpired && ['sdcc', 'qlaoyi', 'aoyi-buff'].includes(entry.action)) {
        p.x = twips(p.x + context.runtime.x - entry.owner.x);
        p.y = twips(p.y + context.runtime.y - entry.owner.y);
        p.facingX = context.runtime.facingX;
        entry.owner = { ...context.runtime };
      }
    }
    this.bullets = this.bullets.filter(({ projectile }) => !projectile.isExpired);
    for (const wave of this.waves) {
      wave.remainingMs -= context.deltaMs;
      if (wave.remainingMs <= 1e-7 && context.pet.hp > 0) {
        for (const [x, y] of wave.offsets) this.spawn(context, 'ltwj', {
          ...wave.root, x: wave.root.x + x, y: wave.root.y + y,
        });
      }
    }
    this.waves = this.waves.filter(wave => wave.remainingMs > 1e-7);
  }

  destroy(): void {
    this.waves = [];
    for (const { projectile } of this.bullets) projectile.isExpired = true;
    this.bullets = [];
  }

  private refresh(context: PetBehaviorContext, action: Action): DragonDamageCache {
    const pet = context.pet;
    const power = action === 'aoyi-buff' ? 0 : action === 'normal' ? pet.atk : action === 'sdcc'
      ? (pet.maxHp * 0.03 + pet.atk * 3) * 1.05 : (pet.maxHp * 0.024 + pet.atk * 7.2) * 1.05;
    return refreshDragonDamageCache({ attack: pet.atk, power,
      effectRate: this.form === 4 ? (pet.magicFlowerBuff?.attackMultiplier ?? 1) : 1,
      magicAdd: pet.autoBuffState?.fsnl.active?.bonusSkillDamage ?? 0, gxp: context.isGxp },
    () => context.random() <= pet.critBonusRate + (pet.autoBuffState?.sxkb.active?.bonusCritRate ?? 0));
  }
}
