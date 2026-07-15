// boundary: world bridge syncs scene visuals and runtime hooks; it does not own
// monster, projectile, drop, or level domain rules.
import Phaser from 'phaser';
import { GameSettings } from '../../core/GameSettings';
import {
  applyMonster3Hit,
  applyMonster30Hit,
  applyMonster30MagicSnowIce,
  applyMonster30MagicZlHummerStun,
  applyMonster30PetBurn,
  createDamageEvent,
  createMonster30,
  defaultClimbTuning,
  DropTuning,
  getActiveProjectiles,
  getDropPickupAlpha,
  getProjectileAttackId,
  getProjectileHitbox,
  getSpawnCount,
  getSpawnPosition,
  getWorldDrops,
  isBossZoneTriggered,
  isHeroCombatDead,
  isHeroInvulnerable,
  claimMonsterExperienceForCurrentTarget,
  markOwnedPetSkillTriggered,
  markBossTriggered,
  markStopPointWaveSpawned,
  maybeSpawnMedicineDrop,
  pickupMedicineDrop,
  pickupWorldDrop,
  recordProjectileHit,
  requestPetQlfjCounterAttack,
  resolveHitOnce,
  spawnAuraDrop,
  spawnAuraDrops,
  spawnConfiguredMonsterDrop,
  spawnMedicineDrop,
  spawnStrengthStoneDrop,
  updateCloudScrolls,
  updateMonster30,
  updateVerticalClimbCamera,
  updateVerticalClimbSpawn,
  type AuraDropType,
  type AuraTargetSnapshot,
  type CapturablePetTarget,
  type MedicineDropType,
  type Monster30Model,
  type MonsterDropContext,
  type MonsterDropId,
  type InputState,
  type WorldDrop,
} from './TestSceneSystems';
import {
  applyHeroNormalAttackToMonster30s,
  applyMonster30AttackToPlayers,
  getMonster30Bounds,
  getPlayerBounds,
  type CombatBridgeResult,
} from './TestSceneCombatBridge';
import {
  collectAuraDebugActions,
  collectConfiguredDropDebugActions,
  collectMedicineDebugActions,
  isStoneDebugJustDown,
} from './TestSceneDebugKeys';
import { isPlayerSlot } from './TestSceneFormatters';
import { toPhaserRect } from './TestSceneGeometry';
import { tryRole3RjHealOnHit } from '../../systems/Role3DefenseSkillSystem';
import { tryRole1SxLifeSteal } from '../../systems/Role1BasicSkillSystem';
import { isRole3XgqHidden } from '../../systems/Role3MobilitySkillSystem';
import {
  applyRole4PoisonProjectileHit,
  type Role4PoisonTarget,
} from '../../systems/Role4PoisonSkillSystem';
import {
  createAttackFlash,
  createDropView,
  createMonsterView,
  createProjectileEffectView,
  destroyDropView,
  syncDropView,
  syncAttackEffectFrame,
  type AttackEffectView,
  type AttackFlash,
  type MonsterView,
  type ProjectileEffectView,
} from './TestSceneViews';

type CapturablePetTargetView = {
  root: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Ellipse;
  mark: Phaser.GameObjects.Ellipse;
  label: Phaser.GameObjects.Text;
  feedback: Phaser.GameObjects.Text;
};

export function updateMonster30s(this: any, delta: number): void {
    const targets = this.getMonsterTargets();
    const surviving: Monster30Model[] = [];

    for (const monster of this.monster30s) {
      updateMonster30(monster, targets, delta);
      if (monster.hp <= 0) {
        const award = claimMonsterExperienceForCurrentTarget(monster);
        if (award) this.awardMonsterExperience(award.ownerSlot, award.experience);
      }
      if (monster.state !== 'removed') {
        surviving.push(monster);
      } else {
        this.spawnMonster30DropSlice(monster);
      }
    }

    for (const [monster, view] of this.monsterViews) {
      if (monster.state === 'removed') {
        this.destroyMonsterView(view);
        this.monsterViews.delete(monster);
      }
    }

    this.monster30s = surviving;
  }
export function applyAllMonster30Attacks(this: any, time: number): void {
    for (const monster of this.monster30s) {
      this.applySingleMonster30Attack(monster, time);
    }
  }
export function applySingleMonster30Attack(this: any, monster: Monster30Model, time: number): void {
    const result = applyMonster30AttackToPlayers({
      monster,
      players: this.getPlayers(),
      petRosters: this.playerPetRosters,
      hitRegistry: this.hitRegistry,
      renderedMonsterAttackIds: this.renderedMonsterAttackIds,
      time,
    });
    for (const slot of ['p1', 'p2'] as const) {
      if (!result.damageEvents.some((event) => event.targetId === slot)) continue;
      markOwnedPetSkillTriggered(this.playerPetRosters, slot);
      this.tryPetQlfjCounterAttack(monster, time, slot);
    }
    this.applyCombatBridgeResult(
      result,
      time,
      0xff6b6b,
    );
  }
export function tryPetQlfjCounterAttack(this: any, monster: Monster30Model, time: number, slot: 'p1' | 'p2' = 'p1'): void {
    const roster = this.playerPetRosters[slot];
    const result = requestPetQlfjCounterAttack({
      roster,
      runtime: slot === 'p1' ? this.petRuntime : this.p2PetRuntime,
      targets: [{
        id: monster.id,
        x: monster.x,
        y: monster.y,
        isAlive: monster.state !== 'dead' && monster.state !== 'removed',
      }],
    });
    if (!result.ok || !result.damage) {
      return;
    }

    const damageEvent = createDamageEvent({
      sourceId: result.pet?.id ?? 'pet-qlfj',
      targetId: monster.id,
      attackId: `pet-qlfj-${monster.id}-${time}`,
      actionName: 'qlfj',
      amount: result.damage,
      attackKind: 'physics',
      knockbackX: 0,
      knockbackY: 0,
      occurredAtMs: time,
    });
    if (applyMonster30Hit(monster, damageEvent.amount)) {
      this.lastDamageEvent = damageEvent;
      this.attackFlashes.push(createAttackFlash(
        this,
        new Phaser.Geom.Rectangle(monster.x - 18, monster.y - 48, 36, 42),
        time,
        0xffd166,
      ));
      if (monster.hp <= 0) {
        const award = claimMonsterExperienceForCurrentTarget(monster, slot);
        if (award) this.awardMonsterExperience(award.ownerSlot, award.experience);
      }
    }
  }

export function updateAllMonsterViews(this: any): void {
    for (const monster of this.monster30s) {
      let view = this.monsterViews.get(monster);
      if (!view) {
        view = createMonsterView(this, monster);
        this.monsterViews.set(monster, view);
      }
      this.syncMonsterView(monster, view);
    }

    for (const [monster, view] of this.monsterViews) {
      if (!this.monster30s.includes(monster)) {
        this.destroyMonsterView(view);
        this.monsterViews.delete(monster);
      }
    }
  }
export function syncMonsterView(this: any, monster: Monster30Model, view: MonsterView): void {
    const hpRatio = monster.maxHp === 0 ? 0 : monster.hp / monster.maxHp;
    view.root.setPosition(monster.x, monster.y);
    view.root.setVisible(monster.state !== 'removed');
    view.root.setAlpha(monster.state === 'dead' ? 0.45 : 1);
    view.root.setScale(monster.facingX < 0 ? -1 : 1, 1);
    view.hpFill.width = 82 * hpRatio;
    view.stateText.setText(`${monster.state} | hp:${monster.hp}/${monster.maxHp}`);
    view.body.setFillStyle(getMonsterColor(monster.state));
    view.wingLeft.setAlpha(monster.state === 'hit1' ? 0.95 : 0.7);
    view.wingRight.setAlpha(monster.state === 'hit1' ? 0.95 : 0.7);
    view.eye.setVisible(monster.state !== 'dead' && monster.state !== 'removed');
  }
export function destroyMonsterView(this: any, view: MonsterView): void {
    view.root.destroy();
  }

export function updateCapturablePetTargetViews(this: any): void {
    const activeTargets = this.capturablePetTargets.filter((target: CapturablePetTarget) => !target.removed);
    const activeIds = new Set(activeTargets.map((target: CapturablePetTarget) => target.id));

    for (const target of activeTargets) {
      let view = this.capturablePetTargetViews.get(target.id);
      if (!view) {
        view = this.createCapturablePetTargetView(target);
        this.capturablePetTargetViews.set(target.id, view);
      }
      this.syncCapturablePetTargetView(target, view);
    }

    for (const [targetId, view] of this.capturablePetTargetViews) {
      if (!activeIds.has(targetId)) {
        view.root.destroy(true);
        this.capturablePetTargetViews.delete(targetId);
      }
    }
  }

export function createCapturablePetTargetView(this: any,
    target: CapturablePetTarget,
  ): CapturablePetTargetView {
    const root = this.add.container(target.x, target.y);
    const body = this.add.ellipse(0, 0, target.width, target.height, 0x8bcf7a, 0.9);
    const mark = this.add.ellipse(14, -12, 12, 12, 0x182233, 0.9);
    const label = this.add.text(-58, -64, target.monsterId, {
      color: '#dff7ef',
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
    });
    const feedback = this.add.text(-70, -84, target.feedback, {
      color: '#f2c14e',
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
    });

    body.setStrokeStyle(2, 0xdff7ef, 0.85);
    root.add([body, mark, label, feedback]);
    root.setDepth(41);
    return { root, body, mark, label, feedback };
  }

export function syncCapturablePetTargetView(this: any,
    target: CapturablePetTarget,
    view: CapturablePetTargetView,
  ): void {
    view.root.setPosition(target.x, target.y);
    view.body.setScale(1 + Math.sin(this.time.now * 0.005) * 0.03);
    view.label.setText(`${target.monsterId} Lv.${target.level}`);
    view.feedback.setText(target.feedback);
  }

export function updateVerticalClimbLogic(this: any,
    _input: InputState,
    _time: number,
    delta: number,
    previousCameraY: number,
  ): void {
    const playerMinY = this.getPlayerMinY();

    if (!this.verticalClimb.bossTriggered) {
      updateVerticalClimbCamera(
        this.verticalClimb,
        playerMinY,
        delta,
        GameSettings.height,
      );

      const activeMonsterCount = this.monster30s.filter(
        (m: Monster30Model) => m.state !== 'dead' && m.state !== 'removed',
      ).length;
      const alivePlayerCount = this.playerViews.filter(
        (p: any) => p.movement && !isHeroCombatDead(p.combat),
      ).length;
      const activeStopIndexBeforeSpawn = this.verticalClimb.activeStopIndex;
      if (updateVerticalClimbSpawn(this.verticalClimb, delta, activeMonsterCount, alivePlayerCount)) {
        const spawnedCount = this.spawnMonster30Wave();
        if (activeStopIndexBeforeSpawn >= 0) {
          markStopPointWaveSpawned(
            this.verticalClimb,
            activeStopIndexBeforeSpawn,
            spawnedCount,
          );
        }
      }

      if (isBossZoneTriggered(this.verticalClimb, playerMinY)) {
        markBossTriggered(this.verticalClimb);
        this.activateBossFight();
      }
    }

    const cameraDelta = this.verticalClimb.cameraY - previousCameraY;
    if (Math.abs(cameraDelta) > 0.01) {
      updateCloudScrolls(this.verticalClimb, cameraDelta);
    }

    this.applyBossArenaClamp();
  }

export function getPlayerMinY(this: any): number {
    let minY = Number.POSITIVE_INFINITY;
    for (const player of this.playerViews) {
      if (player.movement && !isHeroCombatDead(player.combat)) {
        minY = Math.min(minY, player.movement.y);
      }
    }
    return Number.isFinite(minY) ? minY : defaultClimbTuning.worldHeight;
  }

export function applyBossArenaClamp(this: any): void {
    if (this.bossArena.state !== 'active') {
      return;
    }

    const { arenaBounds } = this.bossArena;
    for (const player of this.playerViews) {
      if (player.movement && !isHeroCombatDead(player.combat)) {
        player.movement.x = Math.min(
          Math.max(player.movement.x, arenaBounds.left + 24),
          arenaBounds.right - 24,
        );
      }
    }
  }

export function spawnMonster30Wave(this: any): number {
    const alivePlayers = this.playerViews.filter(
      (p: any) => p.movement && !isHeroCombatDead(p.combat),
    );
    if (alivePlayers.length === 0) {
      return 0;
    }

    const playerCount = alivePlayers.length;
    const count = getSpawnCount(playerCount);
    const hero = alivePlayers[0];

    for (let i = 0; i < count; i += 1) {
      const pos = getSpawnPosition(
        hero.sprite.x,
        hero.sprite.y,
        () => Math.random(),
      );
      const monster = createMonster30(pos.x, pos.y);
      this.monster30s.push(monster);
    }

    return count;
  }
export function spawnMonster30DropSlice(this: any, monster: Monster30Model): void {
    const auraTarget = this.monster30AuraTargets.get(monster.id) ??
      this.getInventoryPlayer()?.slot;
    if (auraTarget) {
      spawnAuraDrops({
        model: this.dropSystem,
        monsterX: monster.x,
        monsterY: monster.y,
        targetId: auraTarget,
        gxp: 1,
      });
    }
    this.monster30AuraTargets.delete(monster.id);

    const medicineSpawnY = monster.y + DropTuning.spawnOffsetY;
    maybeSpawnMedicineDrop(
      this.dropSystem,
      monster.x,
      monster.y,
      this.findDropSettleY(monster.x, medicineSpawnY),
    );

    const spawnY = monster.y + DropTuning.spawnOffsetY;
    spawnConfiguredMonsterDrop({
      model: this.dropSystem,
      monsterId: 'Monster30',
      context: this.createCurrentDropContext(),
      x: monster.x,
      monsterY: monster.y,
      settleY: this.findDropSettleY(monster.x, spawnY),
    });
  }

export function createAuraTargetSnapshots(this: any): readonly AuraTargetSnapshot[] {
    return this.playerViews
      .filter((player: any) => player.movement && !isHeroCombatDead(player.combat))
      .map((player: any) => ({
        id: player.slot,
        x: player.movement?.x ?? player.sprite.x,
        y: (player.movement?.y ?? player.sprite.y) - 52,
      }));
  }
export function findDropSettleY(this: any, x: number, spawnY: number): number {
    const surface = this.movementPlatforms
      .filter((platform: any) =>
        x >= platform.left - 24 &&
        x <= platform.right + 24 &&
        platform.top >= spawnY,
      )
      .sort((a: any, b: any) => a.top - b.top)[0];

    if (surface) {
      return Math.max(spawnY, surface.top - 14);
    }

    return Math.max(spawnY, (this.movementBounds.bottom ?? defaultClimbTuning.worldHeight) - 59);
  }

export function handleMedicineDebugKeys(this: any): void {
    for (const type of collectMedicineDebugActions(this.debugKeys)) {
      this.spawnMedicineDropNearP1(type);
    }
  }
export function spawnMedicineDropNearP1(this: any, type: MedicineDropType): void {
    const player = this.getInventoryPlayer();
    const x = player?.movement?.x ?? defaultClimbTuning.worldWidth / 2;
    const monsterY = (player?.movement?.y ?? defaultClimbTuning.worldHeight - 140) + 70;
    const spawnY = monsterY + DropTuning.spawnOffsetY;
    spawnMedicineDrop(
      this.dropSystem,
      type,
      x,
      monsterY,
      this.findDropSettleY(x, spawnY),
    );
  }

export function handleAuraDebugKeys(this: any): void {
    for (const type of collectAuraDebugActions(this.debugKeys)) {
      this.spawnAuraDropNearP1(type);
    }
  }
export function spawnAuraDropNearP1(this: any, type: AuraDropType): void {
    const player = this.getInventoryPlayer();
    const x = player?.movement?.x ?? defaultClimbTuning.worldWidth / 2;
    const y = (player?.movement?.y ?? defaultClimbTuning.worldHeight - 140) - 54;
    spawnAuraDrop({
      model: this.dropSystem,
      auraType: type,
      x,
      y,
      targetId: player?.slot ?? 'p1',
      power: type === 'red' ? 2 : 5,
    });
  }

export function handleStoneDebugKey(this: any): void {
    if (isStoneDebugJustDown(this.debugKeys)) {
      this.spawnStrengthStoneNearP1();
    }
  }

export function spawnStrengthStoneNearP1(this: any): void {
    const player = this.getInventoryPlayer();
    const x = player?.movement?.x ?? defaultClimbTuning.worldWidth / 2;
    const monsterY = (player?.movement?.y ?? defaultClimbTuning.worldHeight - 140) + 70;
    const spawnY = monsterY + DropTuning.spawnOffsetY;
    spawnStrengthStoneDrop(
      this.dropSystem,
      x,
      monsterY,
      this.findDropSettleY(x, spawnY),
    );
  }

export function handleConfiguredDropDebugKeys(this: any): void {
    const defaultContext = this.createCurrentDropContext();
    for (const action of collectConfiguredDropDebugActions(this.debugKeys, defaultContext)) {
      this.spawnConfiguredDropNearP1(
        action.monsterId,
        action.context,
        action.entryIndex,
        action.forceDrop,
      );
    }
  }

export function spawnConfiguredDropNearP1(this: any,
    monsterId: MonsterDropId,
    context: MonsterDropContext,
    entryIndex: number,
    forceDrop = true,
  ): void {
    const player = this.getInventoryPlayer();
    const x = player?.movement?.x ?? defaultClimbTuning.worldWidth / 2;
    const monsterY = (player?.movement?.y ?? defaultClimbTuning.worldHeight - 140) + 70;
    const spawnY = monsterY + DropTuning.spawnOffsetY;
    const drop = spawnConfiguredMonsterDrop({
      model: this.dropSystem,
      monsterId,
      context,
      x,
      monsterY,
      settleY: this.findDropSettleY(x, spawnY),
      forceDrop,
      entryIndex,
    });

    this.inventoryUI.message = drop
      ? `配置掉落 ${monsterId}: ${drop.fillName}`
      : this.dropSystem.lastMessage;
  }

export function createCurrentDropContext(this: any): MonsterDropContext {
    return {
      curStage: 1,
      curLevel: 1,
    };
  }

export function finalizeCameraPosition(this: any): void {
    this.cameras.main.scrollY = this.verticalClimb.cameraY;
  }

export function updateCloudVisuals(this: any): void {
    const { cloudLayers } = defaultClimbTuning;
    const { cloudScrolls } = this.verticalClimb;

    for (let i = 0; i < this.cloudSprites.length; i += 1) {
      let layer = 0;
      let countAccum = 0;
      for (let l = 0; l < cloudLayers.length; l += 1) {
        countAccum += cloudLayers[l].count;
        if (i < countAccum) {
          layer = l;
          break;
        }
      }
      this.cloudSprites[i].y = this.cloudBaseY[i] + cloudScrolls[layer];
    }
  }

export function applyCombatBridgeResult(this: any,
    result: CombatBridgeResult,
    time: number,
    flashColor = 0xf2c14e,
  ): void {
    for (const damageEvent of result.damageEvents) {
      this.lastDamageEvent = damageEvent;
    }

    for (const flashBounds of result.flashBounds) {
      this.attackFlashes.push(createAttackFlash(this, flashBounds, time, flashColor));
    }

    for (const target of result.monsterAuraTargets) {
      this.monster30AuraTargets.set(target.monsterId, target.slot);
    }

    for (const award of result.monsterExperienceAwards) {
      this.awardMonsterExperience(award.slot, award.experience);
    }
  }
export function applyHeroAttackHit(this: any, player: any, time: number): void {
    const result = applyHeroNormalAttackToMonster30s({
        player,
        monsters: this.getMonster30s(),
        hitRegistry: this.hitRegistry,
        time,
      });
    for (const event of result.damageEvents) {
      if (event.sourceId === player.slot) {
        tryRole1LifeStealForPlayer(player, event.amount, event.attackKind);
        tryRole3HealForPlayer(player);
      }
    }
    this.applyCombatBridgeResult(result, time);
  }
export function applyProjectileHits(this: any, time: number): void {
    for (const monster of this.monster30s) {
      if (monster.state === 'dead' || monster.state === 'removed') {
        continue;
      }

      const monsterBounds = getMonster30Bounds(monster);
      for (const projectile of getActiveProjectiles(this.projectileSystem)) {
        if (projectile.visualOnly || projectile.elapsedMs < (projectile.activeAfterMs ?? 0)) continue;
        const hitbox = getProjectileHitbox(projectile);
        const attackBounds = toPhaserRect(hitbox);

        if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, monsterBounds)) {
          continue;
        }

        const attackId = getProjectileAttackId(projectile);
        if (!resolveHitOnce(this.hitRegistry, attackId, monster.id)) {
          continue;
        }

        const effectiveDamage = Math.min(projectile.damage, monster.hp);
        const damageEvent = createDamageEvent({
          sourceId: projectile.sourceId,
          targetId: monster.id,
          attackId,
          actionName: projectile.actionName,
          amount: effectiveDamage,
          attackKind: projectile.attackKind,
          knockbackX: projectile.facingX * projectile.knockbackX,
          knockbackY: projectile.knockbackY,
          occurredAtMs: time,
        });

        if (applyMonster30Hit(monster, damageEvent.amount)) {
          if (projectile.magicStunMs && projectile.magicStunMs > 0) {
            applyMonster30MagicZlHummerStun(monster, {
              sourceName: projectile.runtimeName,
              totalMs: projectile.magicStunMs,
            });
          }
          if (projectile.magicIceMs && projectile.magicIceMs > 0) {
            applyMonster30MagicSnowIce(monster, {
              sourceName: projectile.runtimeName,
              totalMs: projectile.magicIceMs,
            });
          }
          if (projectile.petBurnMs && projectile.petBurnDamage !== undefined) {
            applyMonster30PetBurn(monster, {
              sourceName: projectile.runtimeName,
              totalMs: projectile.petBurnMs,
              damagePerSecond: projectile.petBurnDamage,
            });
          }
          const playerProjectileOwner = isPlayerSlot(projectile.sourceId)
            ? projectile.sourceId
            : undefined;
          if (playerProjectileOwner) {
            const owner = this.getPlayer(playerProjectileOwner);
            const poisonTarget: Role4PoisonTarget = {
              id: monster.id,
              isAlive: monster.state !== 'dead' && monster.state !== 'removed',
              applyDamage: (amount: number) => {
                const applied = Math.min(Math.max(0, amount), monster.hp);
                monster.targetSlot = playerProjectileOwner;
                applyMonster30Hit(monster, applied);
                poisonTarget.isAlive = monster.state !== 'dead' && monster.state !== 'removed';
                return applied;
              },
            };
            applyRole4PoisonProjectileHit({
              runtime: owner.skill.role4Runtime,
              projectile,
              target: poisonTarget,
              hero: owner.combat,
              sourcePower: owner.baseStats.power,
            });
            this.monster30AuraTargets.set(monster.id, projectile.sourceId);
            tryRole1LifeStealForPlayer(
              this.getPlayer(playerProjectileOwner),
              damageEvent.amount,
              damageEvent.attackKind,
            );
            tryRole3HealForPlayer(this.getPlayer(playerProjectileOwner));
          }
          if (monster.hp <= 0) {
            const award = claimMonsterExperienceForCurrentTarget(
              monster,
              playerProjectileOwner,
            );
            if (award) this.awardMonsterExperience(award.ownerSlot, award.experience);
          }
          this.lastDamageEvent = damageEvent;
          recordProjectileHit(projectile);
          this.attackFlashes.push(createAttackFlash(this, attackBounds, time, 0x7ee7ff));
        }
      }
    }

    if (this.bossArena.state === 'active' && this.bossArena.boss) {
      const bossBounds = this.getBossBounds();
      for (const projectile of getActiveProjectiles(this.projectileSystem)) {
        if (projectile.visualOnly || projectile.elapsedMs < (projectile.activeAfterMs ?? 0)) continue;
        const hitbox = getProjectileHitbox(projectile);
        const attackBounds = toPhaserRect(hitbox);

        if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, bossBounds)) {
          continue;
        }

        const attackId = getProjectileAttackId(projectile);
        if (!resolveHitOnce(this.hitRegistry, attackId, 'monster3')) {
          continue;
        }

        const effectiveDamage = Math.min(projectile.damage, this.bossArena.boss.hp);
        const damageEvent = createDamageEvent({
          sourceId: projectile.sourceId,
          targetId: 'monster3',
          attackId,
          actionName: projectile.actionName,
          amount: effectiveDamage,
          attackKind: projectile.attackKind,
          knockbackX: projectile.facingX * projectile.knockbackX,
          knockbackY: projectile.knockbackY,
          occurredAtMs: time,
        });

        if (applyMonster3Hit(this.bossArena.boss, damageEvent.amount)) {
          if (isPlayerSlot(projectile.sourceId)) {
            tryRole1LifeStealForPlayer(
              this.getPlayer(projectile.sourceId),
              damageEvent.amount,
              damageEvent.attackKind,
            );
            tryRole3HealForPlayer(this.getPlayer(projectile.sourceId));
          }
          this.lastDamageEvent = damageEvent;
          recordProjectileHit(projectile);
          this.attackFlashes.push(createAttackFlash(this, attackBounds, time, 0x7ee7ff));
        }
      }
    }
  }
export function updatePlayerCombatVisual(this: any, player: any, time: number): void {
    if (isHeroCombatDead(player.combat)) {
      player.sprite.setAlpha(0.42);
      player.sprite.setTint(0x697386);
      return;
    }

    if (isRole3XgqHidden(player.skill.role3Runtime)) {
      player.sprite.setAlpha(0);
      return;
    }

    player.sprite.setAlpha(isHeroInvulnerable(player.combat, time) ? 0.72 : 1);
    player.sprite.setTint(
      player.combat.state === 'hurt'
        ? 0xff7f7f
        : getHeroTint(player.normalAttack.heroId),
    );
  }

export function updateProjectileEffectViews(this: any): void {
    const activeProjectiles = getActiveProjectiles(this.projectileSystem);
    const activeIds = new Set(activeProjectiles.map((projectile) => projectile.id));
    const activeViews: ProjectileEffectView[] = [];

    for (const projectile of activeProjectiles) {
      const hasView = this.projectileEffectViews.some((view: ProjectileEffectView) =>
        view.projectileId === projectile.id
      );
      if (!hasView) {
        this.projectileEffectViews.push(createProjectileEffectView(this, projectile));
      }
    }

    for (const view of this.projectileEffectViews) {
      const projectile = activeProjectiles.find((candidate) => candidate.id === view.projectileId);
      if (!projectile || !activeIds.has(view.projectileId)) {
        view.shape.destroy();
        view.core.destroy();
        view.label.destroy();
        continue;
      }

      const lifetimeRatio = Math.min(projectile.elapsedMs / projectile.lifetimeMs, 1);
      const pulse = 1 + (projectile.hitSerial % 2) * 0.08;
      view.shape.setPosition(projectile.x, projectile.y);
      view.core.setPosition(projectile.x, projectile.y);
      view.label.setPosition(projectile.x - 62, projectile.y - projectile.height / 2 - 18);
      view.shape.setScale(pulse, pulse);
      view.core.setScale(1 + Math.sin(lifetimeRatio * Math.PI * 6) * 0.08);
      view.shape.setAlpha(Math.max(0.08, 0.3 * (1 - lifetimeRatio)));
      view.core.setAlpha(Math.max(0.1, 0.36 * (1 - lifetimeRatio * 0.5)));
      view.label.setAlpha(Math.max(0.2, 1 - lifetimeRatio));
      activeViews.push(view);
    }

    this.projectileEffectViews = activeViews;
  }

export function handleDropPickup(this: any): void {
    const player = this.getInventoryPlayer();
    if (!player?.movement || isHeroCombatDead(player.combat)) {
      return;
    }

    const playerBounds = getPlayerBounds(player);
    for (const drop of getWorldDrops(this.dropSystem)) {
      if (drop.state !== 'idle') {
        continue;
      }

      if (!Phaser.Geom.Intersects.RectangleToRectangle(
        playerBounds,
        this.getDropBounds(drop),
      )) {
        continue;
      }

      if (drop.kind === 'medicine') {
        const result = pickupMedicineDrop({
          model: this.dropSystem,
          drop,
          currentHp: player.combat.hp,
          maxHp: player.combat.maxHp,
          currentMp: player.skill.mp,
          maxMp: player.skill.maxMp,
        });
        if (result.ok) {
          if (result.target === 'hp') {
            player.combat.hp = result.after;
          } else {
            player.skill.mp = result.after;
          }
          this.refreshPlayerHeroView(player);
        }
        this.inventoryUI.message = result.message;
      } else if (drop.kind === 'aura') {
        continue;
      } else {
        const result = pickupWorldDrop(
          this.dropSystem,
          drop,
          this.inventoryStore,
          this.equipmentRegistry,
        );
        this.inventoryUI.message = result.message;
      }
    }
  }

export function updateDropViews(this: any): void {
    const activeDrops = getWorldDrops(this.dropSystem);
    const activeIds = new Set(activeDrops.map((drop) => drop.id));

    for (const drop of activeDrops) {
      let view = this.dropViews.get(drop.id);
      if (!view) {
        view = createDropView(this, drop, this.getDropLabel(drop));
        this.dropViews.set(drop.id, view);
      }

      syncDropView(drop, view, getDropPickupAlpha(drop), this.getDropLabel(drop));
    }

    for (const [dropId, view] of this.dropViews) {
      if (!activeIds.has(dropId)) {
        destroyDropView(view);
        this.dropViews.delete(dropId);
      }
    }
  }
export function getDropBounds(this: any, drop: WorldDrop): Phaser.Geom.Rectangle {
    return new Phaser.Geom.Rectangle(
      drop.x - DropTuning.pickupWidth / 2,
      drop.y - DropTuning.pickupHeight / 2,
      DropTuning.pickupWidth,
      DropTuning.pickupHeight,
    );
  }
export function getDropLabel(this: any, drop: WorldDrop): string {
    if (drop.kind === 'medicine') {
      return drop.medicine.label;
    }

    if (drop.kind === 'aura') {
      return drop.auraType === 'red' ? `Red aura +${drop.power}` : `White aura +${drop.power}`;
    }

    const name = this.equipmentRegistry[drop.fillName]?.name ?? drop.fillName;
    return drop.quantity > 1 ? `${name} x${drop.quantity}` : name;
  }
export function updateAttackEffectViews(this: any, time: number): void {
    const activeViews: AttackEffectView[] = [];

    for (const effectView of this.attackEffectViews) {
      if (time >= effectView.attack.endsAtMs) {
        effectView.shape.destroy();
        effectView.label.destroy();
        continue;
      }

      syncAttackEffectFrame(effectView, time);

      const player = this.playerViews.find((view: any) => view.slot === effectView.slot);
      if (player && player.movement && effectView.attack.followsHero) {
        const progress = (time - effectView.attack.startedAtMs) /
          (effectView.attack.endsAtMs - effectView.attack.startedAtMs);
        const sweep = 28 * Math.min(Math.max(progress, 0), 1);
        effectView.shape.setPosition(
          player.sprite.x + effectView.attack.facingX * (78 + sweep),
          player.sprite.y - 80,
        );
        effectView.label.setPosition(
          player.sprite.x + effectView.attack.facingX * 54,
          player.sprite.y - 128,
        );
      }

      const remainingRatio = (effectView.attack.endsAtMs - time) /
        (effectView.attack.endsAtMs - effectView.attack.startedAtMs);
      effectView.shape.setAlpha(effectView.frameKeys ? Math.max(0.2, remainingRatio) : Math.max(0.1, remainingRatio * 0.5));
      effectView.label.setAlpha(Math.max(0.15, remainingRatio));
      activeViews.push(effectView);
    }

    this.attackEffectViews = activeViews;
  }
export function updateAttackFlashes(this: any, time: number): void {
    const activeFlashes: AttackFlash[] = [];

    for (const flash of this.attackFlashes) {
      if (time >= flash.expiresAt) {
        flash.shape.destroy();
        continue;
      }

      activeFlashes.push(flash);
    }

    this.attackFlashes = activeFlashes;
  }


function getHeroTint(heroId: number): number {
  switch (heroId) {
    case 1:
      return 0xf4d35e;
    case 2:
      return 0xf3f6ff;
    case 3:
      return 0xee8f55;
    case 4:
      return 0x74c0fc;
    case 5:
      return 0x91f5d6;
    default:
      return 0xf3f6ff;
  }
}

function tryRole3HealForPlayer(player: any): void {
  if (!player || player.normalAttack.heroId !== 3) return;
  tryRole3RjHealOnHit({
    runtime: player.skill.role3Runtime,
    combat: player.combat,
    sourcePower: player.baseStats.power,
  });
}

function tryRole1LifeStealForPlayer(
  player: any,
  actualDamage: number,
  attackKind: 'physics' | 'magic',
): void {
  if (!player || player.normalAttack.heroId !== 1) return;
  tryRole1SxLifeSteal({
    runtime: player.skill.role1Runtime,
    combat: player.combat,
    actualDamage,
    attackKind,
  });
}

function getMonsterColor(state: Monster30Model['state']): number {
  switch (state) {
    case 'hurt':
      return 0xc96a6a;
    case 'hit1':
      return 0x9d6b9b;
    case 'dead':
      return 0x606b7b;
    default:
      return 0x7b4e79;
  }
}




