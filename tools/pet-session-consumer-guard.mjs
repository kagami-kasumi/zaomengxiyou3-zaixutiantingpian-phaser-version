// Existing unmigrated families retain exactly one legacy adapter call until their own tasks.
const legacyFollow = 'src/scenes/test-scene/TestScenePetMagicBridge.ts';

export function petSessionConsumerViolations(file, source) {
  const failures = [];
  if (/new PetCombatEntitySession\s*\(/u.test(source)) failures.push('private session construction outside Runtime');
  if (/(?:orderedFirstTarget|chasePetRuntimeTarget|tickActivePetSkillState)\s*\(/u.test(source)) {
    failures.push('consumer owns shared targeting, movement or cooldown');
  }
  const followCalls = [...source.matchAll(/updatePetRuntime\s*\(/gu)].length;
  if (followCalls > (file === legacyFollow ? 1 : 0)) failures.push('consumer owns public following');
  if (/\b(?:phase|sessionPhase|state)\s*=(?!=)\s*['"]dead-playing['"]/u.test(source)) {
    failures.push('consumer owns pet death phase');
  }
  return failures.map((failure) => `${file}: ${failure}`);
}
