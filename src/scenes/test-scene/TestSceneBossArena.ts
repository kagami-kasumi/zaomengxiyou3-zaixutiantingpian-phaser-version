import Phaser from 'phaser';
// boundary: this bridge adapts the Stage 1-1 boss view, combat events, arena flow,
// and shared monster runtime; it does not own gravity, reward probabilities,
// pickup seeking, damage formulas, or progression rules.
import {
  activateBossArena,
  applyOwnedPetDamageRedirect,
  applyHeroDamage,
  applyMonster3Hit,
  checkBossArenaTrigger,
  calculateStage1HeroDamage,
  calculateStage1IncomingDamage,
  createDamageEvent,
  getActiveHeroHitbox,
  getMonster3AttackHitbox,
  isBossDead,
  isHeroCombatDead,
  isMonster3Removed,
  revealTransferDoor,
  resolveHitOnce,
  tryClearArena,
  updateMonster3,
  updateMonsterPhysics,
  createMonsterDefeatRewardRuntime,
  settleMonsterDefeatRewards,
  DropTuning,
  type InputState,
  type PlayerSlot,
} from './TestSceneSystems';
import { getPlayerBounds } from './TestSceneCombatBridge';
import { toPhaserRect } from './TestSceneGeometry';
import { createAttackFlash } from './TestSceneViews';
export function updateBossArena(this: any, input: InputState, time: number, delta: number): void {
    if (this.bossArena.state === 'cleared') {
      return;
    }

    if (this.bossArena.state === 'inactive') {
      for (const player of this.playerViews) {
        if (!player.movement || isHeroCombatDead(player.combat)) {
          continue;
        }

        if (checkBossArenaTrigger(this.bossArena, player.sprite.x, player.sprite.y)) {
          this.activateBossFight();
          break;
        }
      }
      return;
    }

    if (this.bossArena.state === 'active' && this.bossArena.boss) {
      updateMonsterPhysics(
        this.bossArena.boss.physics,
        this.bossArena.boss.x,
        this.movementPlatforms,
        delta,
      );
      this.bossArena.boss.y = this.bossArena.boss.physics.y;
      updateMonster3(
        this.bossArena.boss,
        this.getMonster3Targets(),
        delta,
      );

      if (!this.bossSpawnedOnce && this.bossArena.boss.state !== 'dead') {
        this.bossSpawnedOnce = true;
      }

      this.applyBossAttack(time);

      if (isBossDead(this.bossArena.boss) && !this.bossArena.door.visible) {
        const boss = this.bossArena.boss;
        const owner = boss.lastHitBy ?? this.getInventoryPlayer()?.slot;
        if (owner) {
          this.monsterDefeatRewardRuntime ??= createMonsterDefeatRewardRuntime();
          const spawnY = boss.y + DropTuning.spawnOffsetY;
          const rewards = settleMonsterDefeatRewards({
            runtime: this.monsterDefeatRewardRuntime,
            dropSystem: this.dropSystem,
            defeatId: 'stage11-monster3-boss',
            enemyType: 3,
            owner,
            x: boss.x,
            y: boss.y,
            settleY: this.findDropSettleY(boss.x, spawnY),
            configuredItem: {
              monsterId: 'Monster3',
              context: this.createCurrentDropContext(),
            },
          });
          if (rewards) this.awardMonsterExperience(rewards.experience.owner, rewards.experience.amount);
        }
        revealTransferDoor(this.bossArena);
        if (this.bossDoorView) {
          this.bossDoorView.door.setVisible(true);
        }
      }

      for (const player of this.playerViews) {
        if (!player.movement || isHeroCombatDead(player.combat)) {
          continue;
        }

        if (tryClearArena(
          this.bossArena,
          player.sprite.x,
          player.sprite.y,
          input[player.slot as PlayerSlot].up,
        )) {
          this.showClearOverlay();
          return;
        }
      }
    }
  }

export function activateBossFight(this: any): void {
    if (this.bossArena.state !== 'inactive') {
      return;
    }

    activateBossArena(this.bossArena);
    this.arenaWasActive = true;
    this.bossSpawnedOnce = true;

    if (this.bossView) {
      this.bossView.body.setVisible(true);
      this.bossView.crown.setVisible(true);
      this.bossView.eye.setVisible(true);
      this.bossView.hpTrack.setVisible(true);
      this.bossView.hpFill.setVisible(true);
      this.bossView.label.setVisible(true);
      this.bossView.stateText.setVisible(true);
    }
  }

export function getMonster3Targets(this: any): readonly { slot: PlayerSlot; x: number; y: number }[] {
    return this.getPlayers()
      .filter((player: any) => player.movement !== undefined && !isHeroCombatDead(player.combat))
      .map((player: any) => ({
        slot: player.slot,
        x: player.sprite.x,
        y: player.sprite.y,
      }));
  }

export function applyBossAttack(this: any, time: number): void {
    const boss = this.getBossArena().boss;
    if (!boss) {
      return;
    }

    const hitbox = getMonster3AttackHitbox(boss);
    const activeAttack = boss.activeAttack;
    if (!hitbox || !activeAttack) {
      if (boss.state === 'hit1' || boss.state === 'hit2') {
        this.renderedMonsterAttackIds.add(activeAttack?.attackId ?? '');
      }
      return;
    }

    if (!this.renderedMonsterAttackIds.has(activeAttack.attackId)) {
      this.renderedMonsterAttackIds.add(activeAttack.attackId);
      this.attackFlashes.push(createAttackFlash(this, toPhaserRect(hitbox), time, 0xff4444));
    }

    const attackBounds = toPhaserRect(hitbox);
    for (const player of this.getPlayers()) {
      if (!player.movement || isHeroCombatDead(player.combat)) {
        continue;
      }

      if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, getPlayerBounds(player))) {
        continue;
      }

      if (!resolveHitOnce(this.hitRegistry, activeAttack.attackId, player.slot)) {
        continue;
      }

      const damageEvent = createDamageEvent({
        sourceId: 'monster3',
        targetId: player.slot,
        attackId: activeAttack.attackId,
        actionName: activeAttack.actionName,
        amount: applyOwnedPetDamageRedirect(
          this.playerPetRosters,
          player.slot,
          calculateStage1IncomingDamage(
            activeAttack.attackKind,
            activeAttack.damage,
            player.baseStats?.defense ?? 0,
          ),
        ),
        attackKind: activeAttack.attackKind,
        knockbackX: activeAttack.facingX * activeAttack.knockbackX,
        knockbackY: activeAttack.knockbackY,
        occurredAtMs: time,
      });

      if (applyHeroDamage(player.combat, damageEvent, time)) {
        this.lastDamageEvent = damageEvent;
      }
    }
  }

export function applyPlayerHitOnBoss(this: any, player: any, time: number): void {
    const boss = this.getBossArena().boss;
    if (!boss || !player.movement || isBossDead(boss)) {
      return;
    }

    const activeAttack = player.normalAttack.activeAttack;
    const hitbox = getActiveHeroHitbox(player.normalAttack, player.movement, time);
    if (!activeAttack || !hitbox) {
      return;
    }

    const attackId = `${player.slot}-vs-boss-${activeAttack.id}`;
    const attackBounds = toPhaserRect(hitbox);
    const bossBounds = this.getBossBounds();

    if (!Phaser.Geom.Intersects.RectangleToRectangle(attackBounds, bossBounds)) {
      return;
    }

    if (!resolveHitOnce(this.hitRegistry, attackId, 'monster3')) {
      return;
    }

    const damageEvent = createDamageEvent({
      sourceId: player.slot,
      targetId: 'monster3',
      attackId,
      actionName: activeAttack.actionName,
      amount: calculateStage1HeroDamage(3, activeAttack.attackKind, activeAttack.damage),
      attackKind: activeAttack.attackKind,
      knockbackX: activeAttack.facingX * 4,
      knockbackY: -2,
      occurredAtMs: time,
    });
    this.lastDamageEvent = damageEvent;
    boss.lastHitBy = player.slot;
    applyMonster3Hit(boss, damageEvent.amount);
  }

export function getBossBounds(this: any): Phaser.Geom.Rectangle {
    const boss = this.bossArena.boss;
    if (!boss) {
      return new Phaser.Geom.Rectangle();
    }

    return new Phaser.Geom.Rectangle(boss.x - 45, boss.y - 35, 90, 70);
  }

export function updateBossHitByPlayers(this: any, time: number): void {
    const bossArena = this.getBossArena();
    if (bossArena.state !== 'active' || !bossArena.boss) {
      return;
    }

    for (const player of this.getPlayers()) {
      if (player.movement && !isHeroCombatDead(player.combat)) {
        this.applyPlayerHitOnBoss(player, time);
      }
    }
  }

export function updateBossArenaVisuals(this: any): void {
    const bossArena = this.getBossArena();
    const boss = bossArena.boss;
    if (!boss || !this.bossView || !this.bossArenaLabel) {
      return;
    }

    if (bossArena.state === 'inactive') {
      this.bossArenaLabel.setText('');
      return;
    }

    if (bossArena.state === 'cleared') {
      this.bossArenaLabel.setText('CLEARED');
      this.bossView.body.setAlpha(0.3);
      this.bossView.crown.setAlpha(0.3);
      this.bossView.eye.setVisible(false);
      return;
    }

    if (!this.arenaWasActive) {
      return;
    }

    const hpRatio = boss.maxHp === 0 ? 0 : boss.hp / boss.maxHp;
    this.bossView.body.setPosition(boss.x, boss.y);
    this.bossView.crown.setPosition(boss.x, boss.y - 36);
    this.bossView.eye.setPosition(boss.x + 12, boss.y - 12);
    this.bossView.hpTrack.setPosition(boss.x - 48, boss.y - 55);
    this.bossView.hpFill.setPosition(boss.x - 48, boss.y - 55);
    this.bossView.label.setPosition(boss.x - 58, boss.y - 80);
    this.bossView.stateText.setPosition(boss.x - 58, boss.y - 64);
    this.bossView.hpFill.width = 96 * hpRatio;
    this.bossView.body.setScale(boss.facingX < 0 ? -1 : 1, 1);
    this.bossView.stateText.setText(`state:${boss.state} | hp:${boss.hp}/${boss.maxHp}`);
    this.bossView.body.setFillStyle(
      boss.state === 'hurt' ? 0xc96a6a :
      boss.state === 'dead' ? 0x606b7b :
      0x8b2252,
    );
    this.bossView.eye.setVisible(boss.state !== 'dead' && !isMonster3Removed(boss));
    this.bossArenaLabel.setText(
      boss.state === 'dead' ? 'BOSS DEFEATED — enter the door' :
      'BOSS FIGHT',
    );
  }

