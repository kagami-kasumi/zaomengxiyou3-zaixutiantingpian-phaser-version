// boundary: pet/magic bridge adapts scene objects to systems; it does not own
// pet or magic weapon progression rules.
import {
  applyMonster30MagicBaguaStun,
  applyMonster30MagicFlagDebuff,
  applyMonster30MagicFlowerDebuff,
  applyMonster30MagicPearlPoison,
  applyMonster30MagicPearlStun,
  applyMonster30MagicSnowIce,
  applyMonster30MagicZlHummerStun,
  clearMonster30MagicBaguaStun,
  clearMonster30MagicFlagDebuff,
  clearMonster30MagicFlowerDebuff,
  clearMonster30MagicPearlPoison,
  clearMonster30MagicPearlStun,
  clearMonster30MagicSnowIce,
  clearMonster30MagicZlHummerStun,
  createHeroCombat,
  createHeroSkillModel,
  getActivePet,
  isBossDead,
  isHeroCombatDead,
  requestPetDragon1FsSkill,
  requestPetDragon2SdccSkill,
  requestPetDragon3LtwjSkill,
  requestPetDragon4QlaoyiSkill,
  requestPetHorse1SpSkill,
  requestPetHorse2BdSkill,
  requestPetHorse3BzSkill,
  requestPetHorse4TmaoyiSkill,
  requestPetMonkey1XjSkill,
  requestPetMonkey2LjSkill,
  requestPetMonkey2XjSkill,
  requestPetMonkey3LjSkill,
  requestPetMonkey3LyqSkill,
  requestPetMonkey3XjSkill,
  requestPetMonkey4JgaoyiSkill,
  requestPetTurtle1SldSkill,
  requestPetTurtle2TxljSkill,
  requestPetTurtle3SybhSkill,
  requestPetTurtle4XwaoyiSkill,
  requestPetUfo1PmsSkill,
  requestPetUfo2SsSkill,
  requestPetUfo3KmskSkill,
  completePetUfo3KmskRising,
  syncPetRuntimeWithRoster,
  updatePetAutoBuffs,
  updatePetRuntime,
  updatePetSkillState,
  type MagicWeaponEnemyTarget,
  type MagicWeaponPlatform,
  type MovementPlatform,
  type PetSkillTarget,
  type PetRoster,
  type PetRuntimeModel,
  type PlayerSlot,
  type ProjectileSystemModel,
} from './TestSceneSystems';
import { updateAdvancedPetSkillChains } from './TestSceneAdvancedPetSkillBridge';
type MagicWeaponPlatformView = { root: Phaser.GameObjects.Container; body: Phaser.GameObjects.Rectangle; glow: Phaser.GameObjects.Rectangle; label: Phaser.GameObjects.Text };
export function updatePetSystem(this: any, delta: number): void {
  const owner = this.getInventoryPlayer();
  this.petRuntime = updateOwnedPetSystem({
    ownerSlot: 'p1',
    owner,
    roster: this.petRoster,
    runtime: this.petRuntime,
    targets: this.createPetSkillTargets(),
    projectiles: this.projectileSystem,
    deltaMs: delta,
    syncView: (pet) => this.syncPetView(pet),
    destroyView: () => this.destroyPetView(),
  });
}

export type OwnedPetSystemInput = {
  ownerSlot: PlayerSlot;
  owner: any;
  roster: PetRoster;
  runtime: PetRuntimeModel | undefined;
  targets: PetSkillTarget[];
  projectiles: ProjectileSystemModel;
  deltaMs: number;
  syncView(pet: NonNullable<ReturnType<typeof getActivePet>>): void;
  destroyView(): void;
};

export function updateOwnedPetSystem(input: OwnedPetSystemInput): PetRuntimeModel | undefined {
  const adapter = {
    ownerSlot: input.ownerSlot,
    getInventoryPlayer: () => input.owner,
    petRoster: input.roster,
    petRuntime: input.runtime,
    projectileSystem: input.projectiles,
    createPetSkillTargets: () => input.targets,
    syncPetView: input.syncView,
    destroyPetView: input.destroyView,
  };
  updatePetSystemForOwner.call(adapter, input.deltaMs);
  return adapter.petRuntime;
}

function updatePetSystemForOwner(this: any, delta: number): void {
    const owner = this.getInventoryPlayer();
    if (!owner?.movement || isHeroCombatDead(owner.combat)) {
      this.petRuntime = undefined;
      this.destroyPetView();
      return;
    }

    this.petRuntime = syncPetRuntimeWithRoster(
      this.petRoster,
      this.petRuntime,
      {
        x: owner.movement.x,
        y: owner.movement.y,
        facingX: owner.movement.facingX,
      },
    );

    const activePet = getActivePet(this.petRoster);
    if (!this.petRuntime || !activePet) {
      this.destroyPetView();
      return;
    }

    updatePetRuntime(
      this.petRuntime,
      activePet,
      {
        x: owner.movement.x,
        y: owner.movement.y,
        facingX: owner.movement.facingX,
      },
      delta,
    );
    const petAutoBuffOwnerStats = {
      hp: owner.combat.hp,
      maxHp: owner.combat.maxHp,
      mp: owner.skill.mp,
      maxMp: owner.skill.maxMp,
      power: owner.baseStats.power,
      defense: owner.baseStats.defense,
    };
    updatePetAutoBuffs({
      roster: this.petRoster,
      ownerStats: petAutoBuffOwnerStats,
      deltaMs: delta,
    });
    owner.combat.hp = petAutoBuffOwnerStats.hp;
    owner.combat.maxHp = petAutoBuffOwnerStats.maxHp;
    owner.skill.mp = petAutoBuffOwnerStats.mp;
    owner.skill.maxMp = petAutoBuffOwnerStats.maxMp;
    owner.baseStats.power = petAutoBuffOwnerStats.power;
    owner.baseStats.defense = petAutoBuffOwnerStats.defense;
    updatePetSkillState(this.petRoster, delta);
    if (updateAdvancedPetSkillChains(this, activePet, petAutoBuffOwnerStats, delta)) {
      owner.combat.hp = petAutoBuffOwnerStats.hp;
      return;
    }
    if (
      activePet.skillState?.monkey1Xj.releaseReady &&
      activePet.skillState.monkey1Xj.cooldownMs <= 0
    ) {
      requestPetMonkey1XjSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
    }
    if (
      activePet.species === 'monkey' &&
      activePet.form === 2 &&
      (activePet.skillState?.monkey2Lj.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetMonkey2LjSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'monkey' &&
      activePet.form === 2 &&
      activePet.skillState?.monkey2Xj.releaseReady &&
      activePet.skillState.monkey2Xj.cooldownMs <= 0
    ) {
      requestPetMonkey2XjSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
    }
    if (
      activePet.species === 'monkey' &&
      activePet.form === 3 &&
      (activePet.skillState?.monkey3Lyq.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetMonkey3LyqSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'monkey' &&
      activePet.form === 3 &&
      (activePet.skillState?.monkey3Xj.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetMonkey3XjSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'monkey' &&
      activePet.form === 3 &&
      activePet.skillState?.monkey3Lj.releaseReady &&
      activePet.skillState.monkey3Lj.cooldownMs <= 0
    ) {
      requestPetMonkey3LjSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
    }
    if (
      activePet.species === 'monkey' &&
      activePet.form === 4 &&
      (activePet.skillState?.monkey4Jgaoyi.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetMonkey4JgaoyiSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'horse' &&
      activePet.form === 1 &&
      (activePet.skillState?.horse1Sp.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetHorse1SpSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'horse' &&
      activePet.form === 2 &&
      activePet.skillState?.horse2Bd.releaseReady &&
      activePet.skillState.horse2Bd.cooldownMs <= 0
    ) {
      const result = requestPetHorse2BdSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'horse' &&
      activePet.form === 3 &&
      (activePet.skillState?.horse3Bz.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetHorse3BzSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'horse' &&
      activePet.form === 4 &&
      (activePet.skillState?.horse4Tmaoyi.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetHorse4TmaoyiSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'dragon' &&
      activePet.form === 1 &&
      (activePet.skillState?.dragon1Fs.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetDragon1FsSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'dragon' &&
      activePet.form === 2 &&
      (activePet.skillState?.dragon2Sdcc.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetDragon2SdccSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'dragon' &&
      activePet.form === 3 &&
      (activePet.skillState?.dragon3Ltwj.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetDragon3LtwjSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'dragon' &&
      activePet.form === 4 &&
      (activePet.skillState?.dragon4Qlaoyi.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetDragon4QlaoyiSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    // ─── turtle chain ───
    if (
      activePet.species === 'turtle' &&
      activePet.form === 4 &&
      (activePet.skillState?.turtle4Xwaoyi.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetTurtle4XwaoyiSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
        ownerStats: petAutoBuffOwnerStats,
      });
      if (result.ok) {
        owner.combat.hp = petAutoBuffOwnerStats.hp;
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'turtle' &&
      activePet.form === 3 &&
      (activePet.skillState?.turtle3Sybh.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetTurtle3SybhSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'turtle' &&
      activePet.form !== 3 &&
      activePet.skills.includes('sld') &&
      (activePet.skillState?.turtle1Sld.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetTurtle1SldSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
        ownerStats: petAutoBuffOwnerStats,
      });
      if (result.ok) {
        owner.combat.hp = petAutoBuffOwnerStats.hp;
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'turtle' &&
      activePet.form === 2 &&
      (activePet.skillState?.turtle2Txlj.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetTurtle2TxljSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    // ─── UFO chain ───
    if (
      activePet.species === 'ufo' &&
      activePet.form >= 1 &&
      (activePet.skillState?.ufo1Pms.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetUfo1PmsSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'ufo' &&
      activePet.form >= 2 &&
      (activePet.skillState?.ufo2Ss.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0
    ) {
      const result = requestPetUfo2SsSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
      });
      if (result.ok && this.petRuntime) {
        this.petRuntime.x = result.teleportX ?? this.petRuntime.x;
        this.petRuntime.y = result.teleportY ?? this.petRuntime.y;
        this.syncPetView(activePet);
        return;
      }
    }
    // ufo3/kmsk: check rising completion first (must happen before new skill trigger)
    if (
      activePet.species === 'ufo' &&
      activePet.form >= 3 &&
      activePet.skillState?.ufo3Kmsk.risingMs !== undefined &&
      activePet.skillState.ufo3Kmsk.risingMs <= 0 &&
      activePet.skillState.ufo3Kmsk.risingTotalMs > 0
    ) {
      const result = completePetUfo3KmskRising({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    if (
      activePet.species === 'ufo' &&
      activePet.form >= 3 &&
      (activePet.skillState?.ufo3Kmsk.cooldownMs ?? Number.POSITIVE_INFINITY) <= 0 &&
      (activePet.skillState?.ufo3Kmsk.risingMs ?? 0) <= 0
    ) {
      const result = requestPetUfo3KmskSkill({
        roster: this.petRoster,
        runtime: this.petRuntime,
        targets: this.createPetSkillTargets(),
        projectiles: this.projectileSystem,
      });
      if (result.ok) {
        this.syncPetView(activePet);
        return;
      }
    }
    this.syncPetView(activePet);
  }
export function getActiveMovementPlatforms(this: any): MovementPlatform[] {
    const magicPlatforms = this.magicWeapon.platforms
      .filter((platform: any) => platform.active)
      .map((platform: any) => ({
        id: platform.id,
        kind: 'through' as const,
        left: platform.x - platform.width / 2,
        right: platform.x + platform.width / 2,
        top: platform.y,
      }));
    return [...this.movementPlatforms, ...magicPlatforms];
  }

export function syncMagicWeaponPlatformViews(this: any): void {
    const activeIds = new Set<string>();

    for (const platform of this.magicWeapon.platforms) {
      if (!platform.active) {
        continue;
      }
      activeIds.add(platform.id);
      const view = this.getOrCreateMagicWeaponPlatformView(platform);
      this.syncMagicWeaponPlatformView(view, platform);
    }

    for (const [id, view] of this.magicWeaponPlatformViews) {
      if (activeIds.has(id)) {
        continue;
      }
      view.root.destroy();
      this.magicWeaponPlatformViews.delete(id);
    }
  }

export function getOrCreateMagicWeaponPlatformView(this: any, 
    platform: MagicWeaponPlatform,
  ): MagicWeaponPlatformView {
    const existing = this.magicWeaponPlatformViews.get(platform.id);
    if (existing) {
      return existing;
    }

    const root = this.add.container(platform.x, platform.y).setDepth(18);
    const glow = this.add.rectangle(0, 0, platform.width + 18, 12, 0x8ff4ff, 0.18);
    const body = this.add.rectangle(0, 0, platform.width, Math.max(6, platform.height), 0x7ee7ff, 0.78);
    const label = this.add.text(0, -18, 'MagicBigBottleData', {
      color: '#dffaff',
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
    }).setOrigin(0.5, 0.5);
    root.add([glow, body, label]);

    const view = { root, body, glow, label };
    this.magicWeaponPlatformViews.set(platform.id, view);
    return view;
  }

export function syncMagicWeaponPlatformView(this: any, 
    view: MagicWeaponPlatformView,
    platform: MagicWeaponPlatform,
  ): void {
    const remainingRatio = Math.max(0, platform.remainingMs / platform.totalMs);
    view.root.setPosition(platform.x, platform.y);
    view.body.setSize(platform.width, Math.max(6, platform.height));
    view.glow.setSize(platform.width + 18, 12);
    view.body.setFillStyle(0x7ee7ff, 0.62 + remainingRatio * 0.24);
    view.glow.setFillStyle(0x8ff4ff, 0.1 + remainingRatio * 0.18);
    view.label.setAlpha(0.35 + remainingRatio * 0.45);
  }

export function createFallbackMagicWeaponTarget(this: any) {
    return {
      combat: createHeroCombat('magic-platform-fallback'),
      skill: createHeroSkillModel(),
    };
  }
export function createMagicWeaponEnemyTargets(this: any): MagicWeaponEnemyTarget[] {
    const targets: MagicWeaponEnemyTarget[] = this.monster30s.map((monster: any) => ({
      id: monster.id,
      x: monster.x,
      y: monster.y,
      isAlive: monster.state !== 'dead' && monster.state !== 'removed',
      applyMagicFlowerDebuff: (debuff: any) =>
        applyMonster30MagicFlowerDebuff(monster, {
          kind: 'magicFlowerDebuff',
          sourceName: debuff.sourceName,
          damageMultiplier: debuff.damageMultiplier,
          totalMs: debuff.totalMs,
          remainingMs: debuff.remainingMs,
        }),
      clearMagicFlowerDebuff: () => clearMonster30MagicFlowerDebuff(monster),
      applyMagicFlagDebuff: (debuff: any) =>
        applyMonster30MagicFlagDebuff(monster, {
          sourceName: debuff.sourceName,
          totalMs: debuff.totalMs,
          remainingMs: debuff.remainingMs,
        }),
      clearMagicFlagDebuff: () => clearMonster30MagicFlagDebuff(monster),
      applyMagicBaguaStun: (effect: any) =>
        applyMonster30MagicBaguaStun(monster, {
          sourceName: effect.sourceName,
          totalMs: effect.totalMs,
          remainingMs: effect.remainingMs,
        }),
      clearMagicBaguaStun: () => clearMonster30MagicBaguaStun(monster),
      applyMagicZlHummerStun: (effect: any) =>
        applyMonster30MagicZlHummerStun(monster, {
          sourceName: effect.sourceName,
          totalMs: effect.totalMs,
          remainingMs: effect.remainingMs,
        }),
      clearMagicZlHummerStun: () => clearMonster30MagicZlHummerStun(monster),
      applyMagicSnowIce: (effect: any) =>
        applyMonster30MagicSnowIce(monster, {
          sourceName: effect.sourceName,
          totalMs: effect.totalMs,
          remainingMs: effect.remainingMs,
        }),
      clearMagicSnowIce: () => clearMonster30MagicSnowIce(monster),
      applyMagicPearlStun: (effect: any) =>
        applyMonster30MagicPearlStun(monster, {
          sourceName: effect.sourceName,
          totalMs: effect.totalMs,
          remainingMs: effect.remainingMs,
        }),
      clearMagicPearlStun: () => clearMonster30MagicPearlStun(monster),
      applyMagicPearlPoison: (effect: any) =>
        applyMonster30MagicPearlPoison(monster, {
          sourceName: effect.sourceName,
          totalMs: effect.totalMs,
          remainingMs: effect.remainingMs,
          damagePerSecond: effect.damagePerSecond,
        }),
      clearMagicPearlPoison: () => clearMonster30MagicPearlPoison(monster),
    }));

    if (this.bossArena.state === 'active' && this.bossArena.boss) {
      targets.push({
        id: 'monster3',
        x: this.bossArena.boss.x,
        y: this.bossArena.boss.y,
        isAlive: !isBossDead(this.bossArena.boss),
      });
    }

    return targets;
  }

export function getActiveMagicWeaponPets(this: any): NonNullable<ReturnType<typeof getActivePet>>[] {
    const activePet = getActivePet(this.petRoster);
    return activePet ? [activePet] : [];
  }
