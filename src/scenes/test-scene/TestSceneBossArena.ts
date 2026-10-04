import { adaptMonster3BossCombat } from '../../systems/Monster3BossCombatAdapter';
import { updateMonster3CombatWorld, syncMonster3CombatBody } from '../../systems/Monster3CombatWorld';
import { getGlobalSettings } from '../../systems/GlobalSettingsSystem';
import { bindTestSceneMonsterExperience, acceptTestSceneMonsterAttacker } from './TestSceneExperienceBridge';
﻿import Phaser from 'phaser';
import { updateTestSceneBossPhysics } from './TestSceneMonsterKnockbackBridge';
// boundary: this bridge adapts the Stage 1-1 boss view, combat events, arena flow,
// and shared monster runtime; it does not own gravity, reward probabilities,
// pickup seeking, damage formulas, or progression rules.
import {
  activateBossArena,
  applyMonster3Hit,
  checkBossArenaTrigger,
  calculateStage1HeroDamage,
  createDamageEvent,
  getActiveHeroHitbox,
  isBossDead,
  isHeroCombatDead,
  revealTransferDoor,
  resolveHitOnce,
  createMonsterDefeatRewardRuntime,
  settleMonsterDefeatRewards,
  DropTuning,
  type InputState,
  type PlayerSlot,
} from './TestSceneSystems';
import type { Stage11FlowModel } from '../../systems/Stage11FlowSystem';
import { toPhaserRect } from './TestSceneGeometry';
import {
  setStage11MonsterViewVisible,
  updateStage11MonsterView,
} from '../stage11/Stage11MonsterVisualBridge';
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
      bindTestSceneMonsterExperience(this, this.bossArena.boss, 7);
      updateTestSceneBossPhysics(this, this.bossArena.boss, this.movementPlatforms, delta, time);
      updateMonster3CombatWorld(adaptMonster3BossCombat(this.bossArena.boss), {
        parentId: 'stage11', timeMs: time, deltaMs: delta, hostFps: this.game.loop.targetFps,
        difficulty: getGlobalSettings().difficulty, boss: true, flower: false,
        targets: this.heroPartyRuntime.monster3Targets,
      });

      if (!this.bossSpawnedOnce && this.bossArena.boss.state !== 'dead') {
        this.bossSpawnedOnce = true;
      }


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
          void rewards; // Experience is synchronous at the first death transition.
        }
        revealTransferDoor(this.bossArena);
        if (this.bossDoorView) {
          this.bossDoorView.setAvailable(true);
        }
      }

      const flow = this.stage11Flow as Stage11FlowModel | undefined;
      if (flow && this.bossDoorView && flow.tryComplete(this.bossDoorView.createCompletionAttempt(
        this.playerViews.map((player: any) => ({
          view: player.sprite,
          input: input[player.slot as PlayerSlot],
          eligible: Boolean(player.movement) && !isHeroCombatDead(player.combat),
        })),
      ))) {
        this.bossArena.state = 'cleared';
        return;
      }
    }
  }

export function activateBossFight(this: any): void {
    if (this.bossArena.state !== 'inactive') {
      return;
    }

    activateBossArena(this.bossArena);
    if (this.bossArena.boss) bindTestSceneMonsterExperience(this, this.bossArena.boss, 7);
    this.arenaWasActive = true;
    this.bossSpawnedOnce = true;

    if (this.bossView) {
      setStage11MonsterViewVisible(this.bossView, true);
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
    acceptTestSceneMonsterAttacker(this, boss, 7, player.slot);
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

export function updateBossArenaVisuals(this: any, deltaMs: number): void {
    const bossArena = this.getBossArena();
    const boss = bossArena.boss;
    if (!boss || !this.bossView || !this.bossArenaLabel) {
      return;
    }
    syncMonster3CombatBody(adaptMonster3BossCombat(boss));

    if (bossArena.state === 'inactive') {
      this.bossArenaLabel.setText('');
      return;
    }

    if (bossArena.state === 'cleared') {
      this.bossArenaLabel.setText('CLEARED');
      const completed = updateStage11MonsterView(this, this.bossView, boss, deltaMs);
      if (completed) setStage11MonsterViewVisible(this.bossView, false);
      return;
    }

    if (!this.arenaWasActive) {
      return;
    }

    updateStage11MonsterView(this, this.bossView, boss, deltaMs);
    this.bossArenaLabel.setText(
      boss.state === 'dead' ? 'BOSS DEFEATED — enter the door' :
      'BOSS FIGHT',
    );
  }
