// boundary: advanced pet skill bridge only schedules confirmed skill-system calls;
// it does not own damage formulas, cooldowns, persistent effects, or combo rules.
import {
  getAdvancedPetSkillPriority,
  requestPetMouse1ScSkill,
  requestPetMouse4HxfbSkill,
  requestPetMouse4ZsaoyiSkill,
  requestPetPhoenix1NpSkill,
  requestPetPhoenix2BshnSkill,
  requestPetPhoenix3DhlySkill,
  requestPetPhoenix4ZqaoyiSkill,
  requestPetRabbit1YgSkill,
  requestPetRabbit2JfSkill,
  requestPetRabbit3BsSkill,
  requestPetRabbit4YsaoyiSkill,
  requestPetTiger1HySkill,
  requestPetTiger2SxhzSkill,
  requestPetTiger3HsqjSkill,
  requestPetTiger4BhaoyiSkill,
  updatePetMouse4ZsaoyiCombo,
  updatePetRabbitPersistentEffects,
  updatePetTiger4BhaoyiCombo,
  type PetAutoBuffOwnerStats,
  type PetState,
} from './TestSceneSystems';

export function updateAdvancedPetSkillChains(
  scene: any,
  activePet: PetState,
  ownerStats: PetAutoBuffOwnerStats,
  deltaMs: number,
): boolean {
  updatePetRabbitPersistentEffects({ roster: scene.petRoster, ownerStats, deltaMs });
  const targets = scene.createPetSkillTargets();

  if ((activePet.skillState?.mouse4Zsaoyi.comboStep ?? 0) > 0) {
    updatePetMouse4ZsaoyiCombo({
      roster: scene.petRoster,
      runtime: scene.petRuntime,
      targets,
      projectiles: scene.projectileSystem,
      deltaMs,
    });
    scene.syncPetView(activePet);
    return true;
  }
  if ((activePet.skillState?.tiger4Bhaoyi.comboStep ?? 0) > 0) {
    updatePetTiger4BhaoyiCombo({
      roster: scene.petRoster,
      runtime: scene.petRuntime,
      targets,
      projectiles: scene.projectileSystem,
      deltaMs,
    });
    scene.syncPetView(activePet);
    return true;
  }
  if ((activePet.skillState?.phoenix1Np.transformationRemainingMs ?? 0) > 0) {
    scene.syncPetView(activePet);
    return true;
  }

  if (activePet.species === 'phoenix') {
    return updatePhoenixChain(scene, activePet, targets);
  }
  if (activePet.species === 'rabbit') {
    return updateRabbitChain(scene, activePet, ownerStats, targets);
  }
  if (activePet.species === 'mouse') {
    return updateMouseChain(scene, activePet, targets);
  }
  if (activePet.species === 'tigress') {
    return updateTigerChain(scene, activePet, targets);
  }
  return false;
}

function updatePhoenixChain(scene: any, pet: PetState, targets: any[]): boolean {
  for (const skill of getAdvancedPetSkillPriority('phoenix')) {
    if (skill === 'np' && pet.hp > 0 && pet.hp / pet.maxHp <= 0.2 && ready(pet.skillState?.phoenix1Np.cooldownMs)
      && requestPetPhoenix1NpSkill({ roster: scene.petRoster }).ok) return sync(scene, pet);
    if (skill === 'bshn' && pet.form >= 2 && ready(pet.skillState?.phoenix2Bshn.cooldownMs)
      && requestPetPhoenix2BshnSkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
    if (skill === 'dhly' && pet.form >= 3 && ready(pet.skillState?.phoenix3Dhly.cooldownMs)
      && requestPetPhoenix3DhlySkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
    if (skill === 'zqaoyi' && pet.form === 4 && ready(pet.skillState?.phoenix4Zqaoyi.cooldownMs)
      && requestPetPhoenix4ZqaoyiSkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets }).ok) return sync(scene, pet);
  }
  return false;
}

function updateRabbitChain(scene: any, pet: PetState, ownerStats: PetAutoBuffOwnerStats, targets: any[]): boolean {
  for (const skill of getAdvancedPetSkillPriority('rabbit')) {
    if (skill === 'yg' && pet.skillState?.rabbit1Yg.releaseReady && ready(pet.skillState.rabbit1Yg.cooldownMs)
      && requestPetRabbit1YgSkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
    if (skill === 'jf' && pet.form >= 2 && ready(pet.skillState?.rabbit2Jf.cooldownMs)
      && requestPetRabbit2JfSkill({ roster: scene.petRoster }).ok) return sync(scene, pet);
    if (skill === 'bs' && pet.form >= 3 && ready(pet.skillState?.rabbit3Bs.cooldownMs)
      && requestPetRabbit3BsSkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
    if (skill === 'ysaoyi' && pet.form === 4 && ready(pet.skillState?.rabbit4Ysaoyi.cooldownMs)
      && requestPetRabbit4YsaoyiSkill({ roster: scene.petRoster, runtime: scene.petRuntime, ownerStats }).ok) return sync(scene, pet);
  }
  return false;
}

function updateMouseChain(scene: any, pet: PetState, targets: any[]): boolean {
  for (const skill of getAdvancedPetSkillPriority('mouse')) {
    if (skill === 'sc' && ready(pet.skillState?.mouse1Sc.cooldownMs)
      && requestPetMouse1ScSkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
    if (skill === 'hxfb' && pet.form >= 4 && ready(pet.skillState?.mouse4Hxfb.cooldownMs)
      && requestPetMouse4HxfbSkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
    if (skill === 'zsaoyi' && pet.form === 4 && ready(pet.skillState?.mouse4Zsaoyi.cooldownMs)
      && requestPetMouse4ZsaoyiSkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
  }
  return false;
}

function updateTigerChain(scene: any, pet: PetState, targets: any[]): boolean {
  for (const skill of getAdvancedPetSkillPriority('tigress')) {
    if (skill === 'hy' && ready(pet.skillState?.tiger1Hy.cooldownMs)
      && requestPetTiger1HySkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
    if (skill === 'sxhz' && pet.form >= 2 && ready(pet.skillState?.tiger2Sxhz.cooldownMs)
      && requestPetTiger2SxhzSkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
    if (skill === 'hsqj' && pet.form >= 3 && ready(pet.skillState?.tiger3Hsqj.cooldownMs)
      && requestPetTiger3HsqjSkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
    if (skill === 'bhaoyi' && pet.form === 4 && ready(pet.skillState?.tiger4Bhaoyi.cooldownMs)
      && requestPetTiger4BhaoyiSkill({ roster: scene.petRoster, runtime: scene.petRuntime, targets, projectiles: scene.projectileSystem }).ok) return sync(scene, pet);
  }
  return false;
}

function ready(cooldownMs: number | undefined): boolean {
  return (cooldownMs ?? Number.POSITIVE_INFINITY) <= 0;
}

function sync(scene: any, pet: PetState): true {
  scene.syncPetView(pet);
  return true;
}
