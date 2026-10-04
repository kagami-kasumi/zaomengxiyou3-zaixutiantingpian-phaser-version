import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createPlayerPetRosters } from '../src/systems/PetOwnershipSystem';
import { requestPetRabbit2JfSkill, updatePetRabbitPersistentEffects } from '../src/systems/PetRabbitSkillSystem';
import { clearPetRabbitJifeng, createPetSkillState, isPetRabbitJifengActive } from '../src/systems/PetSkillStateSystem';
import { releaseSelectedPet, restSelectedPet, setSelectedPetActive } from '../src/systems/PetRosterSystem';
import { evolvePetWithItem, returnPetToChild } from '../src/systems/PetGrowthSystem';
import { resetTestSceneEncounter } from '../src/scenes/test-scene/TestSceneEncounterReset';

type Fixture = { form: number; owner: number; fps: number; mode: string };
type ReferenceCase = { id: number; fixture: Fixture; accepted: boolean; mp: number; stateCount: number;
  witnesses: { index: number; active: boolean; duration: number | null }[] };
const contract = JSON.parse(readFileSync('docs/reverse-engineering/reference/pet-reception-input-contract.json', 'utf8'));
const rows: object[] = [];
for (const c of contract.effectBoundaryCases as ReferenceCase[]) {
  const { form, owner, fps, mode } = c.fixture;
  const roster = createPlayerPetRosters()[owner === 1 ? 'p1' : 'p2'];
  const pet = roster.pets[0]!; pet.species = 'rabbit'; pet.form = form;
  pet.skills = mode === 'no-skill' ? [] : ['jf'];
  pet.mp = mode === 'low-mp' ? 19 : mode === 'exact-mp' ? 20 : 100;
  const release = () => {
    // Source fixtures invoke releSkill1 directly; clear only scheduler CD to
    // exercise its equivalent accepted release, not to assert full rabbit AI.
    pet.skillState!.rabbit2Jf.cooldownMs = 0;
    return requestPetRabbit2JfSkill({ roster, hostFps: fps }).ok;
  };
  assert.equal(release(), c.accepted);
  const states: boolean[] = [isPetRabbitJifengActive(pet)];
  if (c.accepted) assert.equal(pet.skillState!.rabbit2Jf.remainingHostTicks, c.witnesses[0]!.duration);
  const duration = fps * (form === 2 ? 5 : 10);
  const total = duration + 3 + (mode === 'refresh-mid' ? Math.floor(duration / 2) : 0);
  if (mode === 'refresh-first') { assert.equal(release(), true); states.push(isPetRabbitJifengActive(pet)); }
  for (let tick = 0; tick < total; tick++) {
    if (mode === 'refresh-mid' && tick === Math.floor(duration / 2)) {
      assert.equal(release(), true); states.push(isPetRabbitJifengActive(pet));
    }
    if (mode === 'pause' && tick === 2) {
      for (let paused = 0; paused < 7; paused++) {
        updatePetRabbitPersistentEffects({ roster, deltaMs: 0, hostFps: fps });
        states.push(isPetRabbitJifengActive(pet));
      }
    }
    if ((mode === 'destroy' || mode === 'reenter') && tick === 2) {
      clearPetRabbitJifeng(pet); states.push(isPetRabbitJifengActive(pet));
      if (mode === 'reenter') pet.skillState = createPetSkillState();
    }
    updatePetRabbitPersistentEffects({ roster, deltaMs: 1000 / fps, hostFps: fps });
    states.push(isPetRabbitJifengActive(pet));
  }
  assert.equal(states.length, c.stateCount);
  assert.equal(pet.mp, c.mp);
  for (const witness of c.witnesses) assert.equal(states[witness.index], witness.active, JSON.stringify({ fixture: c.fixture, witness }));
  assert.equal(pet.skillState!.rabbit2Jf.dodgeBonusRate, 0);
  rows.push({ id: c.id, witnesses: c.witnesses.map(w => ({ index: w.index, active: states[w.index] })) });
}
// Delta partitioning must not lose the first source tick or fractional ticks.
for (const fps of [20, 24, 30]) {
  const a = createPlayerPetRosters().p1, b = createPlayerPetRosters().p2;
  for (const roster of [a, b]) {
    Object.assign(roster.pets[0]!, { species: 'rabbit', form: 2, skills: ['jf'], mp: 100 });
    assert.equal(requestPetRabbit2JfSkill({ roster, hostFps: fps }).ok, true);
  }
  const elapsed = (fps * 5 + 1) * 1000 / fps;
  updatePetRabbitPersistentEffects({ roster: a, deltaMs: elapsed, hostFps: fps });
  for (let i = 0; i < (fps * 5 + 1) * 4; i++) updatePetRabbitPersistentEffects({ roster: b, deltaMs: 250 / fps, hostFps: fps });
  assert.equal(isPetRabbitJifengActive(a.pets[0]!), false);
  assert.equal(isPetRabbitJifengActive(b.pets[0]!), false);
  b.pets[0]!.skillState!.rabbit2Jf.cooldownMs = 10_000;
  assert.equal(isPetRabbitJifengActive(b.pets[0]!), false, 'Cooldown must not revive an expired effect');
}
// Exercise actual roster/growth owners, keeping the other player's effect live.
for (const slot of ['p1', 'p2'] as const) {
  for (const transition of ['rest', 'replace', 'release', 'child', 'evolve'] as const) {
    const rosters = createPlayerPetRosters({ includeSkillShowcase: true });
    for (const roster of Object.values(rosters)) {
      Object.assign(roster.pets[0]!, { species: 'rabbit', form: 3, skills: ['jf'], mp: 100 });
      assert.equal(requestPetRabbit2JfSkill({ roster, hostFps: 30 }).ok, true);
    }
    const roster = rosters[slot], pet = roster.pets[0]!;
    assert.equal(setSelectedPetActive(roster), true);
    assert.equal(isPetRabbitJifengActive(pet), true, 'Reselecting the same pet keeps its effect');
    if (transition === 'rest') assert.equal(restSelectedPet(roster), true);
    if (transition === 'replace') { roster.selectedIndex = 1; assert.equal(setSelectedPetActive(roster), true); }
    if (transition === 'release') assert.equal(releaseSelectedPet(roster), pet);
    if (transition === 'child') assert.equal(returnPetToChild(pet, () => 0.5), true);
    if (transition === 'evolve') assert.equal(evolvePetWithItem(pet).rebuildRuntime, true);
    assert.equal(isPetRabbitJifengActive(pet), false, transition);
    assert.equal(pet.skillState!.rabbit2Jf.remainingHostTicks, 0);
    assert.equal(pet.skillState!.rabbit2Jf.pendingHostTicks, 0);
    assert.equal(pet.skillState!.rabbit2Jf.refreshPending, false);
    assert.equal(isPetRabbitJifengActive(rosters[slot === 'p1' ? 'p2' : 'p1'].pets[0]!), true);
  }
}
const out = 'docs/tasks/evidence/TASK-SLICE-253'; mkdirSync(out, { recursive: true });
const resetRosters = createPlayerPetRosters();
for (const roster of Object.values(resetRosters)) {
  Object.assign(roster.pets[0]!, { species: 'rabbit', form: 2, skills: ['jf'], mp: 100 });
  assert.equal(requestPetRabbit2JfSkill({ roster, hostFps: 30 }).ok, true);
}
const scene: any = { petRoster: resetRosters.p1, p2PetRoster: resetRosters.p2,
  monster30AuraTargets: new Map(), renderedMonsterAttackIds: new Set(), capturablePetTargetViews: new Map(),
  magicBottleEffectViews: new Map(), magicWeaponPlatformViews: new Map() };
resetTestSceneEncounter(scene, 590);
for (const roster of Object.values(resetRosters)) assert.equal(isPetRabbitJifengActive(roster.pets[0]!), false);
writeFileSync(`${out}/jifeng-clock.json`, JSON.stringify({ status: 'effect-clock-verified-owner-lifecycle-pending', cases: rows.length, rows }, null, 2));
console.log(`Jifeng existing-state clock: ${rows.length} native timelines / 1134 boundary witnesses and split-delta checks passed.`);
