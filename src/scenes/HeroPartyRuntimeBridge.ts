import { heroPartyMonster2Targets } from './HeroPartyMonster2Reception';
import { monster30PetTargetProfile } from '../systems/Monster30CollisionSystem';
import { heroPartyMonster3Targets } from './HeroPartyMonster3Reception';
import { bindHeroPartyPetRetirement } from './HeroPartyPetRetirement';
import { createHeroPartyCompatibilityPets } from './HeroPartyCompatibilityPets';
import { createHeroPartyExperience } from '../systems/HeroPartyExperienceSystem';
import { getMonsterRewardConfig } from '../systems/MonsterDefeatRewardSystem';
import { persistHeroPartyExperience } from './HeroPartyExperienceBridge';
import type { PetGroundEnvironment } from '../assets/PetGroundEnvironmentAssets';
import { createPetTurtleCombatBridge } from './PetTurtleCombatBridge';
// boundary: this bridge owns active hero movement/combat and hero visual updates;
// levels provide only input, environment snapshots, and monster target models.
import Phaser from 'phaser';
import type { HeroSkillLoadout } from '../systems/HeroSkillSystem';
import { createRole5NormalAttackProjectileVisualBridge } from './Role5NormalAttackProjectileVisualBridge';
import { createRole1ShadowProjectileVisualBridge } from './Role1ShadowProjectileVisualBridge';
import {
  destroyRole1ShadowVisualViews,
  syncRole1ShadowVisualViews,
  type Role1ShadowView,
} from './Role1ShadowVisualBridge';
import { hasHeroCombatVisual, syncHeroCombatVisual } from './HeroCombatVisualBridge';
import {
  createHeroNormalAttackVisualBridge,
  projectHeroNormalAttackVisualPlayer,
} from './HeroNormalAttackVisualBridge';
import {
  applyHeroPartyEnvironmentHits,
  createHeroPartyRuntimeModel,
  destroyHeroPartyRuntime,
  resolveHeroPartyAttacks,
  resolveHeroPartyEnemyAttack,
  setHeroPartySkillLoadout,
  snapshotHeroParty,
  updateHeroPartyCombatStates,
  updateHeroPartyMovement,
  updateHeroPartyRuntime,
} from '../systems/HeroPartyRuntimeSystem';
import {
  resolveStage1EnemyPetAttack,
  type Stage1CombatEnemy,
} from '../systems/Stage1CombatSystem';
import {
  createCombatHudPetSnapshot,
  createStage1CombatPlayerHudSnapshot,
} from '../systems/Stage1CombatHudSystem';
import { clearRosterPetRabbitJifeng, createSeedPetRoster, getActivePet } from '../systems/PetRosterSystem';
import type { PetRoster } from '../systems/PetTypes';
import type { PetSkillTarget } from '../systems/PetTypes';
import type { ProjectileSystemModel } from '../systems/ProjectileSystem';
import { PetCombatRuntime, type PetCombatSnapshot } from '../systems/PetCombatRuntime';
import type { PetCombatAnimationEvent, PetCombatDamageEvent } from '../systems/PetBehavior';
import { resolveFormalPetMonkeyProjectileHits } from '../systems/PetMonkeyCombatSystem';
import { resolveFormalPetHorseProjectileHits } from '../systems/PetHorseCombatSystem';
import {
  FormalSkillsUpdatedEvent,
  readFormalSkillRuntime,
  type FormalSkillsUpdatedPayload,
} from './feature-ui/FormalSkillRuntimeBridge';
import {
  FormalPetsUpdatedEvent,
  type FormalPetsUpdatedPayload,
} from './feature-ui/FormalPetRuntimeBridge';
import { createFormalPetMonkeyBodyBridge } from './FormalPetMonkeyBodyBridge';
import { createHeroPartyPassiveDisplayBridge } from './HeroPartyPassiveDisplayBridge';
import { createFormalPetHorseBodyBridge } from './FormalPetHorseBodyBridge';
import { createPetDragonPresentationBridge } from './PetDragonPresentationBridge';
import { createPetDragonQaRoster, isPetDragonQaEnabled, isPetDragonQaOwnerProtected } from './PetDragonQaBridge';
import { createCombatFeedbackView } from './CombatFeedbackView';
import { createIncomingDamageFeedbackBridge } from './IncomingDamageFeedbackBridge';
import { createCombatFeedbackQaBridge } from './CombatFeedbackQaBridge';
import { createPetProjectileCombatBridge } from './PetProjectileCombatBridge';
import { createHeroPartyGatherBridge } from './HeroPartyGatherBridge';
import type {
  CreateHeroPartyRuntimeOptions,
  HeroPartyRuntime,
  HeroPartyViewSnapshot,
} from './HeroPartyRuntimeTypes';
export type { CreateHeroPartyRuntimeOptions, HeroPartyRuntime, HeroPartyViewSnapshot } from './HeroPartyRuntimeTypes';

const heroPartyRuntimeByScene = new WeakMap<Phaser.Scene, HeroPartyRuntime>();

export function readHeroPartyPresentationSnapshot(
  scene: Phaser.Scene,
): readonly Omit<HeroPartyViewSnapshot, 'view'>[] | undefined {
  return heroPartyRuntimeByScene.get(scene)?.snapshots().map(({ view: _view, ...snapshot }) => snapshot);
}

export function readHeroPartyExperience(scene: Phaser.Scene) {
  return heroPartyRuntimeByScene.get(scene)?.experience;
}

export function readHeroPartyPetSnapshots(scene: Phaser.Scene) {
  return heroPartyRuntimeByScene.get(scene)?.petSnapshots();
}

export function createHeroPartyRuntime(
  scene: Phaser.Scene,
  views: readonly Phaser.GameObjects.Image[],
  options: CreateHeroPartyRuntimeOptions,
): HeroPartyRuntime {
  const role1ShadowQa = isFormalRole1ShadowQaEnabled();
  const mayRestoreActiveSave = options.restoreActiveSave
    ?? views.every((view) => view.getData('formalPartySource') !== 'dev-override');
  const restoredState = mayRestoreActiveSave
    ? readFormalSkillRuntime(getBrowserStorage())
    : undefined;
  const petRosters: Partial<Record<'p1' | 'p2', PetRoster>> = {
    p1: restoredState?.player1.petRoster,
    p2: restoredState?.player2.petRoster,
  };
  if (!mayRestoreActiveSave) {
    if (isPetDragonQaEnabled()) {
      petRosters.p1 = createPetDragonQaRoster('p1');
      petRosters.p2 = createPetDragonQaRoster('p2');
    }
    const qaHorseForm = readFormalHorseQaForm();
    if (qaHorseForm) {
      petRosters.p1 = createFormalHorseQaRoster('p1', qaHorseForm);
      petRosters.p2 = createFormalHorseQaRoster('p2', qaHorseForm);
    }
  }
  const model = createHeroPartyRuntimeModel(views.map((view, index) => ({
    slot: index === 0 ? 'p1' : 'p2',
    heroId: view.getData('heroId'),
    x: view.x,
    y: options.groundY,
    width: options.memberWidth ?? view.displayWidth,
    currentPlatformId: options.groundPlatformId,
    progression: index === 0
      ? restoredState?.player1.progression
      : restoredState?.player2.progression,
    equipmentLoadout: index === 0
      ? restoredState?.player1.equipmentLoadout
      : restoredState?.player2.equipmentLoadout,
    skillLoadout: role1ShadowQa
      && view.getData('formalPartySource') === 'dev-override'
      && view.getData('heroId') === 1
      ? createFormalRole1ShadowQaLoadout()
      : options.skillLoadoutFor?.(view.getData('heroId'), index)
        ?? (index === 0 ? restoredState?.player1.skillLoadout : restoredState?.player2.skillLoadout),
  })));
  if (!mayRestoreActiveSave && isPetDragonQaOwnerProtected()) {
    for (const member of model.members) member.combat.combat.invulnerableUntilMs = Number.POSITIVE_INFINITY;
  }
  if (role1ShadowQa) {
    for (const member of model.members) {
      if (member.combat.normalAttack.heroId !== 1) continue;
      member.combat.maxMp = 2_000;
      member.combat.mp = 2_000;
      member.combat.skill.maxMp = 2_000;
      member.combat.skill.mp = 2_000;
    }
  }
  const gather = createHeroPartyGatherBridge(scene, model);
  const attackVisuals = createHeroNormalAttackVisualBridge(scene);
  const normalAttackProjectileVisuals = createRole5NormalAttackProjectileVisualBridge(scene);
  const role1ShadowProjectileVisuals = createRole1ShadowProjectileVisualBridge(scene);
  const role1ShadowViews = new Map<string, Role1ShadowView>();
  const combatFeedbackView = createCombatFeedbackView(scene, model.combat.feedback);
  const incomingFeedback = createIncomingDamageFeedbackBridge(scene, model.incoming);
  const combatFeedbackQa = createCombatFeedbackQaBridge(scene, model.combat.feedback);
  const petProjectileCombat = createPetProjectileCombatBridge(scene);
  const petDragonPresentation = createPetDragonPresentationBridge(scene);
  const petTurtle = createPetTurtleCombatBridge(scene);
  const formalPetMonkeyBodies = createFormalPetMonkeyBodyBridge(scene);
  const formalPetHorseBodies = createFormalPetHorseBodyBridge(scene);
  const passiveDisplay = createHeroPartyPassiveDisplayBridge(scene);
  let destroyed = false;
  const compatibilityPets = createHeroPartyCompatibilityPets(scene);
  const compatibilityPetRuntime = options.legacyPetRuntime ?? compatibilityPets.runtime;
  const petCombatRuntimes = {
    p1: new PetCombatRuntime(petTurtle.registry),
    p2: new PetCombatRuntime(petTurtle.registry),
  };
  const petCombatSnapshots: Partial<Record<'p1' | 'p2', PetCombatSnapshot>> = {};
  const pendingPetAnimationEvents: Partial<Record<'p1' | 'p2', PetCombatAnimationEvent[]>> = {};
  const pendingPetDamageEvents: Partial<Record<'p1' | 'p2', PetCombatDamageEvent[]>> = {};
  let petPresentationOwners: NonNullable<Parameters<typeof petTurtle.update>[2]> = [];
  const unbindPetRetirement = bindHeroPartyPetRetirement(model, petCombatRuntimes, slot => {
    compatibilityPets.clear(slot);
    options.releaseLegacyPet?.(slot);
    const roster = petRosters[slot];
    if (roster) clearRosterPetRabbitJifeng(roster);
    petCombatSnapshots[slot] = petCombatRuntimes[slot].snapshot();
    pendingPetAnimationEvents[slot] = [];
    pendingPetDamageEvents[slot] = [];
    formalPetMonkeyBodies?.releaseSlot(slot);
    formalPetHorseBodies?.releaseSlot(slot);
    passiveDisplay.sync(Object.values(petCombatSnapshots));
    petDragonPresentation.update(Object.values(petCombatSnapshots), model.projectiles.projectiles);
    petTurtle.update(petCombatSnapshots, model.projectiles.projectiles,
      petPresentationOwners.map(owner => ({ ...owner, turtleLinkVisible: owner.slot === slot ? false : owner.turtleLinkVisible })));
  });

  const syncSkills = (payload: FormalSkillsUpdatedPayload) => {
    setHeroPartySkillLoadout(model, payload.owner, payload.skillLoadout);
  };
  const syncPets = (payload: FormalPetsUpdatedPayload) => {
    petRosters[payload.owner] = payload.roster;
  };
  scene.events.on(FormalSkillsUpdatedEvent, syncSkills);
  scene.events.on(FormalPetsUpdatedEvent, syncPets);

  const snapshots = (): readonly HeroPartyViewSnapshot[] => snapshotHeroParty(model).map((snapshot, index) => ({
    ...snapshot,
    view: views[index]!,
  }));

  const syncVisuals = (timeMs: number): void => {
    model.members.forEach((member, index) => {
      const view = views[index];
      if (!view) return;
      view.setPosition(member.movement.x, member.movement.y);
      syncHeroCombatVisual(view, {
        movement: member.movement,
        combat: member.combat.combat,
        normalAttack: member.combat.normalAttack,
        skill: member.combat.skill,
      }, timeMs);
      syncFallbackFeedback(view, member.combat);
    });
    attackVisuals.update(model.members.map((member, index) =>
      projectHeroNormalAttackVisualPlayer(views[index]!, member.combat)), timeMs);
    normalAttackProjectileVisuals.update(model.projectiles.projectiles);
    role1ShadowProjectileVisuals.update(model.projectiles.projectiles);
    syncRole1ShadowVisualViews({
      scene,
      shadows: model.members.flatMap((member) =>
        member.combat.normalAttack.heroId === 1
          ? member.combat.skill.role1ShadowRuntime.shadows
          : []),
      views: role1ShadowViews,
    });
    const emittedAnimationEvents = formalPetMonkeyBodies?.update(model.members.map((member) => ({
      slot: member.combat.slot,
      pet: getActivePet(petRosters[member.combat.slot] ?? { pets: [], selectedIndex: 0, message: '' }),
      snapshot: petCombatSnapshots[member.combat.slot] ?? { destroyed: false },
    })), model.projectiles.projectiles, timeMs) ?? [];
    for (const event of emittedAnimationEvents) {
      const slot = model.members.find((member) => (
        petCombatSnapshots[member.combat.slot]?.runtime?.runtimeKey === event.runtimeKey
      ))?.combat.slot;
      if (slot) pendingPetAnimationEvents[slot] = [...(pendingPetAnimationEvents[slot] ?? []), event];
    }
    const emittedHorseAnimationEvents = formalPetHorseBodies?.update(model.members.map((member) => ({
      slot: member.combat.slot,
      pet: getActivePet(petRosters[member.combat.slot] ?? { pets: [], selectedIndex: 0, message: '' }),
      snapshot: petCombatSnapshots[member.combat.slot] ?? { destroyed: false },
    })), model.projectiles.projectiles, timeMs) ?? [];
    for (const event of emittedHorseAnimationEvents) {
      const slot = model.members.find((member) => (
        petCombatSnapshots[member.combat.slot]?.runtime?.runtimeKey === event.runtimeKey
      ))?.combat.slot;
      if (slot) pendingPetAnimationEvents[slot] = [...(pendingPetAnimationEvents[slot] ?? []), event];
    }
    passiveDisplay.sync(Object.values(petCombatSnapshots));
    if (role1ShadowQa) {
      scene.game.canvas.dataset.formalRole1ShadowQa = JSON.stringify(model.members
        .filter((member) => member.combat.normalAttack.heroId === 1)
        .map((member) => ({
          slot: member.combat.slot,
          facingX: member.movement.facingX,
          lastResult: member.combat.skill.lastResult,
          shadows: member.combat.skill.role1ShadowRuntime.shadows.map((shadow) => ({
            id: shadow.id,
            sourceId: shadow.sourceId,
            action: shadow.action,
            actionTick: shadow.actionTick,
            candidate: shadow.candidate,
            viewFrame: role1ShadowViews.get(shadow.id)?.sprite.frame.name,
          })),
        })));
    }
  };

  const experience = createHeroPartyExperience(model, slot => petCombatRuntimes[slot].currentAttackTarget(slot)
    ?? options.legacyPetExperience?.(slot) ?? compatibilityPets.experience(slot),
    () => { if (mayRestoreActiveSave) persistHeroPartyExperience(getBrowserStorage(), model, petRosters); }, options.awardHeroExperience);
  const runtime: HeroPartyRuntime = {
    gather,
    experience,
    update: (frame) => {
      for (const enemy of frame.monsterTargets ?? []) experience.bind(enemy, getMonsterRewardConfig(enemy.enemyType).experience);
      if (destroyed) return;
      const activePetSources = (['p1', 'p2'] as const).flatMap((slot) => {
        const pet = getActivePet(petRosters[slot] ?? { pets: [], selectedIndex: 0, message: '' });
        return pet ? [{ id: pet.id, state: pet.hp <= 0 ? 'dead' as const : 'ready' as const }] : [];
      });
      updateHeroPartyRuntime(model, { ...frame, projectileSources: activePetSources });
      updatePets({
        combatEnemies: frame.monsterTargets,
        targets: (frame.monsterTargets ?? []).map((target) => ({
          id: target.id,
          x: target.x,
          y: target.y,
          isAlive: target.phase !== 'dead',
        })),
        projectiles: model.projectiles,
        timeMs: frame.timeMs,
        deltaMs: frame.deltaMs,
        random: frame.random,
        groundEnvironmentFor: (index) => frame.environmentFor(index, model.members[index]!.movement).petGroundEnvironment,
      });
      syncVisuals(frame.timeMs);
      combatFeedbackView.update();
      combatFeedbackQa.sync();
    },
    updateMovement: (frame) => updateHeroPartyMovement(model, frame),
    updateCombatStates: (frame) => updateHeroPartyCombatStates(model, frame),
    syncVisuals,
    applyEnvironmentHits: (hits) => {
      applyHeroPartyEnvironmentHits(model, hits);
      model.members.forEach((member, index) => {
        const view = views[index];
        if (!view) return;
        view.setPosition(member.movement.x, member.movement.y);
        syncFallbackFeedback(view, member.combat);
      });
    },
    resolveAttacks: (monsterTargets, timeMs) => {
      for (const enemy of monsterTargets) experience.bind(enemy, getMonsterRewardConfig(enemy.enemyType).experience);
      resolveHeroPartyAttacks(model, monsterTargets, timeMs);
      resolveFormalPetMonkeyProjectileHits({
        projectiles: model.projectiles,
        combat: model.combat,
        enemies: monsterTargets,
        ownerSlotForPet: () => undefined,
        timeMs,
      });
      resolveFormalPetHorseProjectileHits({
        projectiles: model.projectiles,
        combat: model.combat,
        enemies: monsterTargets,
        ownerSlotForPet: () => undefined,
        timeMs,
      });
      combatFeedbackView.flush();
      combatFeedbackQa.sync();
    },
    resolveEnemyAttack: (enemy, timeMs) => {
      resolveHeroPartyEnemyAttack(model, enemy, timeMs);
      resolvePetEnemyAttack(enemy, timeMs);
      model.members.forEach((member, index) => {
        const view = views[index];
        if (view) syncFallbackFeedback(view, member.combat);
      });
    },
    monster3Targets: attack => heroPartyMonster3Targets(model, petCombatRuntimes,
      slot => petRosters[slot] ? getActivePet(petRosters[slot]) : undefined, () => destroyed, attack, compatibilityPetRuntime),
    monster2Targets: attack => heroPartyMonster2Targets(model, petCombatRuntimes,
      slot => petRosters[slot] ? getActivePet(petRosters[slot]) : undefined, () => destroyed, attack, compatibilityPetRuntime),
    resolvePetEnemyAttack,
    snapshots,
    petSnapshots: () => Object.freeze({ ...petCombatSnapshots }),
    hudSnapshots: () => model.members.map((member) => {
      const roster = petRosters[member.combat.slot];
      return createStage1CombatPlayerHudSnapshot(
        member.combat,
        createCombatHudPetSnapshot(roster ? getActivePet(roster) : undefined),
      );
    }),
    rewardPlayers: () => model.members.map((member, index) => ({
      view: views[index]!,
      combat: member.combat,
    })),
    compatibilityMembers: () => model.members,
    compatibilityPetRuntime,
    highestCombo: () => model.combat.feedback.highestCombo,
    updatePets,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      unbindPetRetirement();
      scene.events.off(FormalSkillsUpdatedEvent, syncSkills);
      scene.events.off(FormalPetsUpdatedEvent, syncPets);
      gather.destroy();
      attackVisuals.destroy();
      normalAttackProjectileVisuals.destroy();
      role1ShadowProjectileVisuals.destroy();
      destroyRole1ShadowVisualViews(role1ShadowViews);
      formalPetMonkeyBodies?.destroy();
      formalPetHorseBodies?.destroy();
      petDragonPresentation.destroy();
      petTurtle.destroy();
      petProjectileCombat.destroy();
      if (isPetDragonQaEnabled()) delete scene.game.canvas.dataset.petDragonQa;
      combatFeedbackView.destroy();
      passiveDisplay.destroy();
      incomingFeedback.destroy();
      combatFeedbackQa.destroy();
      petCombatRuntimes.p1.destroy();
      petCombatRuntimes.p2.destroy();
      compatibilityPets.destroy();
      for (const roster of Object.values(petRosters)) clearRosterPetRabbitJifeng(roster);
      if (role1ShadowQa) delete scene.game.canvas.dataset.formalRole1ShadowQa;
      destroyHeroPartyRuntime(model);
      heroPartyRuntimeByScene.delete(scene);
    },
  };
  heroPartyRuntimeByScene.set(scene, runtime);
  return runtime;

  function resolvePetEnemyAttack(enemy: Stage1CombatEnemy, timeMs: number,
    accepts?: (snapshot: PetCombatSnapshot) => boolean): void {
      for (const slot of ['p1', 'p2'] as const) {
        const pet = getActivePet(petRosters[slot] ?? { pets: [], selectedIndex: 0, message: '' });
        const snapshot = petCombatSnapshots[slot];
        if (!pet || !snapshot?.runtime || (accepts && !accepts(snapshot))) continue;
        const event = resolveStage1EnemyPetAttack({
          runtime: model.combat,
          enemy,
          timeMs,
          target: {
            runtimeKey: snapshot.runtime.runtimeKey,
            x: snapshot.runtime.x,
            y: snapshot.runtime.y,
            collisionProfile: enemy.enemyType === 30 && snapshot.species && snapshot.form
              ? monster30PetTargetProfile(snapshot.species, snapshot.form) : undefined,
            defense: pet.def,
            hp: pet.hp,
            protectedFromHits: snapshot.protectedFromHits,
          },
        });
        if (event && enemy.enemyType === 30) {
          petCombatSnapshots[slot] = petCombatRuntimes[slot].applyDamageEvents([event], timeMs);
        } else if (event) pendingPetDamageEvents[slot] = [...(pendingPetDamageEvents[slot] ?? []), event];
      }
  }

  function updatePets(frame: Readonly<{
    targets: readonly PetSkillTarget[];
    combatEnemies?: readonly Stage1CombatEnemy[];
    projectiles: ProjectileSystemModel;
    timeMs: number;
    deltaMs: number;
    random?: () => number;
    groundEnvironmentFor?: (index: number) => PetGroundEnvironment | undefined;
  }>): void {
    for (const enemy of frame.combatEnemies ?? []) experience.bind(enemy, getMonsterRewardConfig(enemy.enemyType).experience);
    for (const [index, member] of model.members.entries()) {
      const slot = member.combat.slot;
      const groundEnvironment = frame.groundEnvironmentFor?.(index);
      let roster = petProjectileCombat.readyRoster(petTurtle.readyRoster(petRosters[slot]));
      const activePet = roster && getActivePet(roster);
      if (!options.legacyPetRuntime) compatibilityPets.update(member, roster, frame);
      if (activePet && !petCombatRuntimes[slot].supports(activePet)) {
        roster = undefined; // The shared compatibility owner steps these families.
      }
      if (!roster || member.combat.combat.state === 'dead') {
        petCombatSnapshots[slot] = petCombatRuntimes[slot].update({
          roster: { pets: [], selectedIndex: 0, message: '' },
          owner: { x: member.movement.x, y: member.movement.y, facingX: member.movement.facingX },
          targets: [],
          projectiles: frame.projectiles,
          damageEvents: pendingPetDamageEvents[slot],
          incomingFeedback: { model: model.incoming, ownerSlot: slot, timeMs: frame.timeMs },
          deltaMs: frame.deltaMs,
          hostFps: scene.game.loop.targetFps,
          ownerStep: () => passiveDisplay.ownerStep(member, groundEnvironment?.ownerRootOffsetY ?? 0),
          passiveVisual: passiveDisplay.petSignal,
        ownerAddPetBuff: member.combat.addPetBuff,
          groundEnvironment,
          projectileCombat: petProjectileCombat({ combat: model.combat, enemies: frame.combatEnemies ?? [],
            ownerSlot: slot, timeMs: frame.timeMs, random: frame.random ?? Math.random }),
        });
        pendingPetDamageEvents[slot] = [];
        continue;
      }
      petCombatSnapshots[slot] = petCombatRuntimes[slot].update({
        roster,
        ownerCombat: member.combat.combat,
        owner: { x: member.movement.x, y: member.movement.y, facingX: member.movement.facingX },
        targets: frame.targets,
        projectiles: frame.projectiles,
        random: frame.random,
        damageEvents: pendingPetDamageEvents[slot],
        incomingFeedback: { model: model.incoming, ownerSlot: slot, timeMs: frame.timeMs },
        animationEvents: pendingPetAnimationEvents[slot],
        deltaMs: frame.deltaMs,
        hostFps: scene.game.loop.targetFps,
        ownerStep: () => passiveDisplay.ownerStep(member, groundEnvironment?.ownerRootOffsetY ?? 0),
        passiveVisual: passiveDisplay.petSignal,
        ownerAddPetBuff: member.combat.addPetBuff,
        groundEnvironment,
        projectileCombat: petProjectileCombat({ combat: model.combat, enemies: frame.combatEnemies ?? [],
          ownerSlot: slot, timeMs: frame.timeMs, random: frame.random ?? Math.random }),
      });
      pendingPetDamageEvents[slot] = [];
      pendingPetAnimationEvents[slot] = [];
    }
    petDragonPresentation.update(Object.values(petCombatSnapshots), frame.projectiles.projectiles);
    petPresentationOwners = model.members.map((member, index) => ({
      slot: member.combat.slot, x: member.movement.x,
      y: member.movement.y + (frame.groundEnvironmentFor?.(index)?.ownerRootOffsetY ?? 0),
      turtleLinkVisible: !!(member.combat.combat.turtleLink?.active && member.combat.combat.turtleLink.started),
    }));
    petTurtle.update(petCombatSnapshots, frame.projectiles.projectiles, petPresentationOwners);
    if (isPetDragonQaEnabled()) scene.game.canvas.dataset.petDragonQa = JSON.stringify({
      snapshots: petCombatSnapshots,
      damage: model.combat.audit.damageEvents.slice(-60),
      pets: Object.fromEntries(Object.entries(petRosters).map(([slot, roster]) => [slot, getActivePet(roster!)])),
    });
  }
}

function syncFallbackFeedback(
  view: Phaser.GameObjects.Image,
  player: ReturnType<typeof createHeroPartyRuntimeModel>['members'][number]['combat'],
): void {
  if (hasHeroCombatVisual(view)) return;
  if (player.combat.state === 'dead') view.setTint(0x555555);
  else if (player.combat.state === 'hurt') view.setTint(0xff8888);
  else if (player.normalAttack.activeAttack) view.setTint(0xffdf80);
  else view.clearTint();
}

function getBrowserStorage(): Storage | undefined {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

function readFormalHorseQaForm(): 1 | 2 | 3 | 4 | undefined {
  const local = globalThis.location?.hostname === 'localhost'
    || globalThis.location?.hostname === '127.0.0.1';
  if (!local) return undefined;
  const value = Number(new URLSearchParams(globalThis.location?.search ?? '').get('qaPetHorse'));
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : undefined;
}

function createFormalHorseQaRoster(owner: 'p1' | 'p2', form: 1 | 2 | 3 | 4): PetRoster {
  const roster = createSeedPetRoster();
  roster.pets.forEach((pet) => {
    pet.isActive = pet.species === 'horse' && pet.form === form;
    pet.id = `${owner}-${pet.id}`;
  });
  roster.selectedIndex = roster.pets.findIndex(({ isActive }) => isActive);
  roster.message = `${owner.toUpperCase()} horse${form} formal QA`;
  return roster;
}

function isFormalRole1ShadowQaEnabled(): boolean {
  const local = globalThis.location?.hostname === 'localhost'
    || globalThis.location?.hostname === '127.0.0.1';
  return local && new URLSearchParams(globalThis.location?.search ?? '').get('qaRole1Shadow') === '1';
}

function createFormalRole1ShadowQaLoadout(): HeroSkillLoadout {
  return {
    slots: [
      null,
      null,
      { skillName: 'lyfb', level: 7 },
      { skillName: 'qsez', level: 7 },
      { skillName: 'zz', level: 7 },
    ],
  };
}
