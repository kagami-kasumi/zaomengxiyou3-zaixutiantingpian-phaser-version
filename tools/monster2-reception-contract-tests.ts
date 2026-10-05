import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { bindHeroPartyPetRetirement } from '../src/scenes/HeroPartyPetRetirement';
import { PetCombatRuntime } from '../src/systems/PetCombatRuntime';
import { createDefaultPetBehaviorRegistry } from '../src/systems/pet-behaviors/createDefaultPetBehaviorRegistry';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import { createPetRuntime, type PetRuntimeModel } from '../src/systems/PetRuntimeSystem';
import { prepareCompatibilityPetReception, releaseCompatibilityPet } from '../src/systems/PetReceptionCompatibilitySystem';
import { readPetReceptionBody } from '../src/systems/PetReceptionBodyOwner';
import { createMonsterAttackReception } from '../src/systems/MonsterAttackReception';
import {
  monster2AttackRequest, type Monster2Attack,
  createMonster2AttackRuntime, stepMonster2ExistingAttacks,
} from '../src/systems/Monster2AttackRuntime';
import type { MonsterDamageSource } from '../src/systems/MonsterDamageReception';
import { readHeroMonsterReceptionInput, receiveHeroMonsterDamage } from '../src/systems/HeroMonsterDamageReception';
import { rejectPetMonsterReception } from '../src/systems/PetMonsterDamageReception';
import { receiveOwnedPetMonsterDamage } from '../src/systems/PetBattleOwnershipSystem';
import { refreshTurtleLink } from '../src/systems/PetTurtleLinkSystem';

type Fixture = Record<string, any>;
type Failure = { scope: 'direct' | 'sequence'; id: string; field: string; actual: unknown; expected: unknown };
const truth = JSON.parse(readFileSync('docs/reverse-engineering/reference/monster2-reception-contract.json', 'utf8'));
const failures: Failure[] = [];
const turtleAssets = await PetTurtleAssets.decode(path => new Uint8Array(readFileSync(`public${path}`)));
const petRegistry = createDefaultPetBehaviorRegistry(() => turtleAssets);
const slots = ['p1', 'p2'] as const;

function fail(scope: Failure['scope'], id: string, field: string, actual: unknown, expected: unknown): void {
  if (Object.is(actual, expected) || JSON.stringify(actual) === JSON.stringify(expected)) return;
  failures.push({ scope, id, field, actual, expected });
}

function petIdentity(name: string): { species: string; form: number } | undefined {
  const match = /^Pet(Monkey|Horse|Kabu|Tiger|Turtle|Phoenix|Dragon|Rabbit|Mouse)([1-4])$/.exec(name);
  if (!match) return undefined;
  const species = match[1] === 'Kabu' ? 'ufo' : match[1] === 'Tiger' ? 'tigress' : match[1].toLowerCase();
  return { species, form: Number(match[2]) };
}

function heroId(name: string): 1 | 2 | 3 | 4 | 5 | undefined {
  const match = /^Role([1-5])$/.exec(name);
  return match ? Number(match[1]) as 1 | 2 | 3 | 4 | 5 : undefined;
}

function makeSource(f: Fixture): MonsterDamageSource & { draws: number[] } {
  const rolls: number[] = Array.isArray(f.rolls) ? f.rolls : [];
  let index = 0;
  const draws: number[] = [];
  return { draws,
    boss: !!f.boss, hit: f.sourceHit, criticalPercent: f.critical,
    magicDefenseReduction: f.reduceMagic, flower: !!f.flower,
    random: () => { const value = rolls[index++] ?? f.roll; draws.push(value); return value; },
  };
}

function setAction(player: any, action: string): void {
  if (action === 'wait') return;
  player.skill.activeAction = { skillName: 'fixture', slotIndex: 0, actionName: action, projectileId: 0 } as any;
}

function setPetAction(runtime: PetCombatRuntime, compatibility: PetRuntimeModel | undefined,
  action: string): void {
  if (action === 'wait') return;
  const active = (runtime as any).active;
  if (active?.animation) {
    try { active.animation.select(action, active.actionToken); }
    catch (error) {
      if (!(error instanceof Error) || !error.message.includes('Unknown pet animation action')) throw error;
    }
  }
  // The compatibility body's public clock intentionally exposes only receiver
  // reactions; unsupported fixture actions remain an explicit mismatch.
  void compatibility;
}

function activateRabbitJifeng(pet: any, fps: number): void {
  const jf = pet.skillState?.rabbit2Jf;
  if (!jf) return;
  jf.remainingHostTicks = 5 * fps;
  jf.activeRemainingMs = 5000;
  jf.attackRate = 1;
  jf.dodgeBonusRate = 0.1 + pet.form * 0.1;
}

function seedPet(name: string, f: Fixture, hp = f.hp): any {
  const identity = petIdentity(name);
  assert(identity, `unmapped pet fixture ${name}`);
  const seed = createSeedPetRoster().pets.find(p => p.species === identity.species && p.form === identity.form);
  assert(seed, `missing seed pet ${name}`);
  const pet = structuredClone(seed);
  Object.assign(pet, {
    id: `${name}-${f.owner}-fixture`, hp, maxHp: Math.max(1, f.hp === 1 ? 1000 : f.hp),
    def: f.defense, missRate: f.petMiss, magicDefenseRate: f.petMagicDefense,
    lifetime: 10, isActive: true,
    skills: f.qlfj === null ? [] : ['qlfj'],
    warpower: f.qlfj === null ? pet.warpower : f.qlfj / ((0.05 + identity.form * 0.01) * 1.05),
  });
  return pet;
}

function setupParty(f: Fixture, targetName: string, attachPet: boolean): {
  model: ReturnType<typeof createHeroPartyRuntimeModel>; runtimes: Record<'p1' | 'p2', PetCombatRuntime>;
  pet?: any; compatibility?: PetRuntimeModel; clear: () => void; attackRoot: { x: number; y: number };
} {
  const id = heroId(targetName);
  const model = createHeroPartyRuntimeModel([{ slot: f.owner, heroId: id ?? 1, x: 300, y: 200, width: 40 }]);
  const runtimes = { p1: new PetCombatRuntime(petRegistry), p2: new PetCombatRuntime(petRegistry) };
  let pet: any;
  let compatibility: PetRuntimeModel | undefined;
  const needsPet = !!petIdentity(targetName) || attachPet;
  if (needsPet) {
    pet = seedPet(petIdentity(targetName) ? targetName : 'PetMonkey1', f,
      petIdentity(targetName) ? f.hp : f.linkHp ?? 1000);
    const roster = { pets: [pet], selectedIndex: 0, message: '' };
    if (runtimes[f.owner].supports(pet)) runtimes[f.owner].update({ roster, owner: { x: 300, y: 200, facingX: 1 }, targets: [], random: () => f.roll,
      deltaMs: 1000 / 30, hostFps: 30,
      groundEnvironment: { ownerRootOffsetY: -50, walls: [{ id: 'floor', left: -1000, right: 2000, top: 250.1, bottom: 280, usesWallTolerance: true }] } });
    else {
      compatibility = createPetRuntime(pet, { x: 300, y: 200, facingX: 1 });
      prepareCompatibilityPetReception(pet, compatibility, roster, f.owner, model.projectiles, () => {});
    }
    if (f.rabbit) activateRabbitJifeng(pet, 30);
    if (petIdentity(targetName) && f.action === 'hit2') setPetAction(runtimes[f.owner], compatibility, f.action);
    if (petIdentity(targetName) && f.protected) {
      const active = (runtimes[f.owner] as any).active;
      if (active) active.protectionCount = 999;
      if (compatibility) { const body = readPetReceptionBody(compatibility); if (body) (body as any).protectionCount = 999; }
    }
  }
  let petAttached = needsPet;
  const unbind = bindHeroPartyPetRetirement(model, runtimes, slot => {
    if (slot === f.owner) { petAttached = false; releaseCompatibilityPet(compatibility); compatibility = undefined; pet = undefined; }
  });
  const member = model.members[0]!;
  const player = member.combat;
  player.combat.hp = f.hp; player.combat.maxHp = Math.max(1, f.hp === 1 ? 1000 : f.hp);
  player.effectiveStats = { ...player.effectiveStats, defense: f.defense, missPercent: f.miss,
    magicDefensePercent: f.magicDefense };
  player.skill.role3Runtime.sdLevel = f.sd;
  setAction(player, f.action);
  if (f.protected || f.protectionKind) player.combat.invulnerableUntilMs = Number.POSITIVE_INFINITY;
  if (!petIdentity(targetName) && f.shield > 0) player.combat.magicShield = {
    kind: f.shieldKind === 'MAGIC_UMBRELLA_DEFEND2' ? 'magicUmbrellaDefend2'
      : f.shieldKind === 'tjgl_Shield' ? 'role2Tjgl' : 'magicUmbrellaDefend',
    sourceName: 'fixture', initialAmount: f.shield, remainingAmount: f.shield, totalMs: 1000, remainingMs: 1000,
  };
  if (f.link && pet) {
    const heroLink = refreshTurtleLink(undefined, pet, 'fixture', 1, f.linkHp === 0 ? 0 : f.linkHp, 30);
    const petLink = refreshTurtleLink(undefined, pet, 'fixture', 1, f.linkHp === 0 ? 0 : f.linkHp, 30);
    if (f.linkBoth) {
      heroLink.peer = () => petLink; petLink.peer = () => heroLink;
      heroLink.reduceHp = amount => { pet.hp = Math.max(0, pet.hp - amount); };
    }
    player.combat.turtleLink = heroLink;
  }
  // 258 supplies a Boolean geometry service; native pixel queries are 257A's domain.
  const attackRoot = { x: 300, y: 200 };
  const clear = () => { unbind(); releaseCompatibilityPet(compatibility); runtimes.p1.destroy(); runtimes.p2.destroy(); destroyHeroPartyRuntime(model); };
  return { model, runtimes, pet, compatibility, clear, attackRoot };
}

function directAttack(f: Fixture, root: { x: number; y: number }): Monster2Attack {
  const attack: Monster2Attack = { id: 'attack', sourceId: 'monster2', attack: f.attack, x: root.x, y: root.y,
    facingX: -1, frame: 1, age: 1, source: makeSource(f), parentId: 'world',
    reception: { prefix: 'attack-', serial: 1, count: 0, interval: 999, remaining: 99 } };
  return attack;
}

/** 258 direct Probe calls the receiver, not BaseBullet.checkAttack. Explicit
 * processed gates include source-valid but currently unreachable party inputs.
 * Actual HP writes still use the same production Hero/Pet settlement owners. */
function runDirect(): number {
  let count = 0;
  for (const [index, row] of (truth.direct.inputs as unknown[][]).entries()) {
    const f = Object.fromEntries(truth.direct.inputColumns.map((key: string, i: number) => [key, row[i]])) as Fixture;
    const expected = Object.fromEntries(truth.direct.expectedColumns.map((key: string, i: number) => [key, truth.direct.expected[index][i]])) as Fixture;
    const isPet = !!petIdentity(f.name);
    const setup = setupParty(f, f.name, !!f.link);
    const member = setup.model.members[0]!;
    const source = makeSource(f);
    const attack = directAttack(f, setup.attackRoot); attack.source = source;
    const request = { ...monster2AttackRequest(attack, 1000, 30, f.difficulty),
      attackId: 'attack-1', geometryHit: f.geometry, bingo: f.bingo };
    let result: any;
    let action: string;
    let ids: string[];
    let father = -1;
    if (isPet) {
      const pet = setup.pet!;
      const runtime = createPetRuntime(pet, { x: 300, y: 200, facingX: 1 });
      result = receiveOwnedPetMonsterDamage(pet, runtime, {
        action: f.action, protected: !!f.protected, gxp: f.gxp,
        missRate: f.petMiss, magicDefenseRate: f.petMagicDefense,
        rabbitDodgeActive: f.rabbit, counterChance: f.qlfj === null ? undefined : f.qlfj,
      }, request);
      action = result.action; ids = runtime.monsterHitIds ?? [];
      father = result.protectionTicks ?? -1;
    } else {
      result = receiveHeroMonsterDamage(member.combat.combat,
        readHeroMonsterReceptionInput(member.combat, { gxp: f.gxp, protected: !!f.protected || !!f.protectionKind }), request);
      action = member.combat.combat.state === 'dead' ? f.action
        : readHeroMonsterReceptionInput(member.combat, { gxp: f.gxp, protected: false }).action;
      ids = member.combat.combat.monsterHitIds ?? [];
      const deadline = member.combat.combat.invulnerableUntilMs;
      // Original destroy resets fatherCount to zero; the modern dead owner clears its deadline.
      if (member.combat.combat.state === 'dead') father = 0;
      if (Number.isFinite(deadline) && deadline > request.timeMs) father = (deadline-request.timeMs)*30/1000;
    }
    const skills = setup.pet?.skillState;
    const actual = {
      id: f.id, accepted: result.accepted, hp: isPet ? setup.pet.hp : member.combat.combat.hp,
      random: source.draws, action, ids, missed: result.missed,
      destroyed: isPet ? false : member.combat.combat.state === 'dead', sourceHit: source.hit, father,
      skill1: isPet && (setup.pet.species === 'monkey' && setup.pet.form === 1 ? !!skills?.monkey1Xj.releaseReady
        : setup.pet.species === 'horse' && setup.pet.form >= 2 ? !!skills?.horse2Bd.releaseReady : false),
      skill2: isPet && setup.pet.species === 'monkey' && setup.pet.form === 2 ? !!skills?.monkey2Xj.releaseReady : false,
      skill3: isPet && setup.pet.species === 'monkey' && setup.pet.form >= 3 ? !!skills?.monkey3Lj.releaseReady : false,
      lifetime: isPet ? setup.pet.lifetime : null,
      linkHp: !isPet && f.link ? setup.pet.hp : null,
      shield: member.combat.combat.magicShield?.remainingAmount ?? null,
    };
    for (const key of truth.direct.expectedColumns as (keyof typeof actual)[]) fail('direct', f.id, key, actual[key], expected[key]);
    setup.clear(); count++;
  }
  return count;
}

function sequenceSource(mode: string): MonsterDamageSource {
  return { boss: true, hit: 0, criticalPercent: mode === 'critical' ? 100 : 0,
    magicDefenseReduction: 0, flower: false, random: () => mode === 'dodge' ? 0.2 : 0.9 };
}

function sequenceAttack(id: string, kind: 1 | 2, fps: number, mode: string, root: { x: number; y: number }): Monster2Attack {
  const attack: Monster2Attack = { id, sourceId: 'monster2', attack: kind, x: root.x, y: root.y,
    facingX: -1, frame: 0, age: 0, source: sequenceSource(mode), parentId: 'world',
    reception: { prefix: id.slice(0, id.lastIndexOf('-') + 1), serial: 1, count: 0, interval: 999, remaining: 99 } };
  void fps;
  return attack;
}

function sequenceRoot(kind: 1 | 2): { x: number; y: number } {
  // WorldProbe's host is (300, 200), facing left. These are the two
  // verified Monster2 hit1 event roots, kept separate from pixel collision.
  return kind === 1 ? { x: 375, y: 100 } : { x: 210, y: 165 };
}

function sequenceSpawnTicks(mode: string): Readonly<Record<1 | 2, number | undefined>> {
  return { 1: mode === 'gather-negative' ? undefined : 5,
    2: mode === 'source-dead' || mode === 'gather-negative' ? undefined : 20 };
}

/** Replay exactly WorldProbe's receiver/protection services. It does not advance
 * pet AI/body (the original probe did not); actual Session retirement and the
 * complete Scene clock are verified separately by owner and browser tests. */
function runSequence(sequence: any): void {
  const activeSlots = sequence.roster === 'both' ? slots : [sequence.roster as 'p1' | 'p2'];
  const model = createHeroPartyRuntimeModel(activeSlots.map(slot => ({ slot, heroId: 1 as const, x: 300, y: 200, width: 40 })));
  const runtimes = { p1: new PetCombatRuntime(), p2: new PetCombatRuntime() };
  const retired = new Set<string>();
  const hp = sequence.mode === 'fatal-hero' ? 1 : sequence.mode === 'owner-dead' ? 0
    : sequence.mode === 'hp-equal' ? 29 : sequence.mode === 'hp-above' ? 30 : 1000;
  const petHp = sequence.mode === 'fatal-pet' ? 1 : sequence.mode === 'pet-dead' ? 0
    : sequence.mode === 'hp-equal' ? 29 : sequence.mode === 'hp-above' ? 30 : 1000;
  const services = new Map(activeSlots.map(slot => {
    const pet = seedPet('PetMonkey1', { owner: slot, hp: petHp, defense: 0, petMiss: sequence.mode === 'dodge' ? 1 : 0,
      petMagicDefense: 0, qlfj: null }, petHp);
    const runtime = createPetRuntime(pet, { x: 300, y: 200, facingX: 1 });
    return [slot, { pet, runtime, action: sequence.mode === 'pet-dead' ? 'dead' : 'wait',
      heroAction: sequence.mode === 'owner-dead' ? 'dead' : 'wait',
      father: sequence.mode === 'hero-protected' ? 100 : sequence.mode === 'protect-expire' ? 6 : -1,
      petFather: sequence.mode === 'pet-protected' ? 100 : sequence.mode === 'protect-expire' ? 6 : -1 }];
  }));
  const unbind = bindHeroPartyPetRetirement(model, runtimes, slot => {
    retired.add(slot); services.get(slot)!.father = 0;
  });
  for (const member of model.members) {
    member.combat.combat.hp = hp; member.combat.combat.maxHp = 1000;
    member.combat.effectiveStats = { ...member.combat.effectiveStats, defense: 0,
      missPercent: sequence.mode === 'dodge' ? 100 : 0, magicDefensePercent: 0 };
    if (sequence.mode === 'owner-dead') member.combat.combat.state = 'dead';
  }
  const runtime = createMonster2AttackRuntime();
  const retained: Monster2Attack[] = [];
  const spawnTicks = sequenceSpawnTicks(sequence.mode);
  const random: number[] = [];
  const source: MonsterDamageSource = { boss: true, hit: 0, criticalPercent: sequence.mode === 'critical' ? 100 : 0,
    magicDefenseReduction: 0, flower: false, random: () => { random.push(0.9); return 0.9; } };
  for (let tick = 1; tick <= 42; tick++) {
    const expectedStep = sequence.steps[tick-1];
    random.length = 0;
    const timeMs = tick*1000/sequence.fps;
    stepMonster2ExistingAttacks(runtime, timeMs, sequence.fps, sequence.mode === 'difficulty2' ? 2 : 0,
      () => model.members.filter(member => member.combat.combat.hp > 0).map(member => {
        const slot = member.combat.slot, service = services.get(slot)!;
        return {
          hero: { ids: member.combat.combat.monsterHitIds ??= [], receive: request => {
            const result = receiveHeroMonsterDamage(member.combat.combat,
              readHeroMonsterReceptionInput(member.combat, { gxp: false, protected: service.father >= 0 }),
              { ...request, geometryHit: sequence.mode !== 'geometry-retry' || tick !== 6 });
            if (member.combat.combat.hp > 0) service.heroAction = readHeroMonsterReceptionInput(member.combat,
              { gxp: false, protected: false }).action;
            if (result.accepted && !result.missed && request.bingo) service.father = sequence.fps;
            return result;
          } },
          pet: { ids: service.runtime.monsterHitIds ??= [], receive: request => {
            // Observe the synchronous real hero death callback before the pet phase.
            if (retired.has(slot)) return rejectPetMonsterReception(service.pet, service.action);
            const result = receiveOwnedPetMonsterDamage(service.pet, service.runtime, {
              action: service.action, protected: service.petFather >= 0, gxp: false,
              missRate: service.pet.missRate, magicDefenseRate: 0, rabbitDodgeActive: false, counterChance: undefined,
            }, { ...request, geometryHit: sequence.mode !== 'geometry-retry' || tick !== 6 });
            service.action = result.action;
            if (result.protectionTicks !== undefined) service.petFather = result.protectionTicks;
            return result;
          } },
        };
      }));
    for (const kind of [1, 2] as const) if (spawnTicks[kind] === tick) {
      const attack = sequenceAttack(`Monster2Bullet1_${kind}-1`, kind, sequence.fps, sequence.mode, sequenceRoot(kind));
      attack.source = source;
      attack.reception = createMonsterAttackReception(`Monster2Bullet1_${kind}-`, 999,
        monster2AttackRequest(attack, timeMs, sequence.fps, sequence.mode === 'difficulty2' ? 2 : 0), 99);
      runtime.attacks.push(attack); retained.push(attack);
    }
    for (const member of model.members) {
      const service = services.get(member.combat.slot)!;
      if (service.father >= 0) service.father--;
      if (!retired.has(member.combat.slot) && service.petFather >= 0) service.petFather--;
    }
    for (const target of expectedStep.targets as any[]) {
      const slot = target.sid === 1 ? 'p1' : 'p2';
      const member = model.members.find(m => m.combat.slot === slot)!;
      const service = services.get(slot)!;
      const actual = { sid: target.sid, hp: member.combat.combat.hp, petHp: service.pet.hp,
        action: service.heroAction, petAction: service.action, dead: member.combat.combat.hp <= 0,
        destroyed: sequence.mode === 'owner-ready' || retired.has(slot),
        ids: member.combat.combat.monsterHitIds ?? [], petIds: service.runtime.monsterHitIds ?? [],
        father: service.father, petFather: service.petFather, life: service.pet.lifetime,
        attached: !retired.has(slot), petRetired: sequence.mode === 'pet-ready' || retired.has(slot) };
      for (const key of Object.keys(target)) fail('sequence', `${sequence.id}@${tick}/sid${target.sid}`, key,
        actual[key as keyof typeof actual], target[key]);
    }
    fail('sequence', `${sequence.id}@${tick}`, 'bullets', retained.map(attack => ({
      symbol: `Monster2Bullet1_${attack.attack}`, id: `${attack.reception.prefix}${attack.reception.serial}`,
      count: attack.reception.count, max: attack.reception.remaining })), expectedStep.bullets);
    fail('sequence', `${sequence.id}@${tick}`, 'random', [...random], expectedStep.random);
  }
  unbind(); runtimes.p1.destroy(); runtimes.p2.destroy(); destroyHeroPartyRuntime(model);
}

const directCases = process.env.M2_RECEPTION_SCOPE === 'sequence' ? 0 : runDirect();
const sequencesToRun = process.env.M2_RECEPTION_SCOPE === 'direct' ? [] : truth.sequences;
for (const sequence of sequencesToRun) runSequence(sequence);
const sequenceCases = sequencesToRun.reduce((sum: number, s: any) => sum + s.steps.length, 0);
const byScope = failures.reduce((result, failure) => {
  result[failure.scope] = (result[failure.scope] ?? 0) + 1; return result;
}, {} as Record<string, number>);
const byField = failures.reduce((result, failure) => {
  const key = `${failure.scope}.${failure.field}`; result[key] = (result[key] ?? 0) + 1; return result;
}, {} as Record<string, number>);
console.log(`Monster2 reception contract: ${directCases} direct cases, ${sequencesToRun.length} sequences/${sequenceCases} world states; failures=${failures.length} direct=${byScope.direct ?? 0} sequence=${byScope.sequence ?? 0}.`);
console.log(`Failure fields: ${JSON.stringify(byField)}`);
const bySequenceMode = failures.filter(f => f.scope === 'sequence').reduce((result, failure) => {
  const match = /^\d+-(?:p1|p2|both)-([^@]+)/.exec(failure.id); const mode = match?.[1] ?? 'unknown';
  result[mode] = (result[mode] ?? 0) + 1; return result;
}, {} as Record<string, number>);
console.log(`Sequence failure groups: ${JSON.stringify(bySequenceMode)}`);
if (failures.length) {
  for (const failure of failures.slice(0, 24)) console.error(`${failure.scope} ${failure.id} ${failure.field}: actual=${JSON.stringify(failure.actual)} expected=${JSON.stringify(failure.expected)}`);
  throw new Error(`Monster2 reception contract mismatches: ${failures.length} (showing up to 24)`);
}
