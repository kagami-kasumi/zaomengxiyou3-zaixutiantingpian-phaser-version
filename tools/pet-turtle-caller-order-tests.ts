import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { PetTurtleAssets } from '../src/assets/PetTurtleAssets';
import type { PetBehaviorContext, PetBehaviorEvent } from '../src/systems/PetBehavior';
import { TurtlePetBehavior } from '../src/systems/pet-behaviors/TurtlePetBehavior';
import { createProjectileSystem } from '../src/systems/ProjectileSystem';
import { createSeedPetRoster } from '../src/systems/PetRosterSystem';
import type { PetRuntimeModel } from '../src/systems/PetTypes';

type NativeCall = {
  scenario: string;
  tick: number;
  bullet: {
    symbol: string;
    action: 'hit1' | 'hit2';
    x: number;
    y: number;
    a: -1 | 1;
    d: -1 | 1;
    frame: number;
    last: boolean;
  };
  tree: { matrix: { a: number; b: number; c: number; d: number; tx: number; ty: number } };
};

const nativePath = 'docs/tasks/evidence/TASK-SLICE-224A2/native-caller-order.json';
const native = JSON.parse(readFileSync(nativePath, 'utf8')) as {
  calls: NativeCall[];
  sourceFiles: Record<string, string>;
  originalBasePetSha256: string;
};
assert.equal(createHash('sha256').update(readFileSync(
  'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BasePet.as')).digest('hex'),
native.originalBasePetSha256);

for (const [relative, expected] of Object.entries(native.sourceFiles)) {
  const actual = createHash('sha256').update(readFileSync(relative)).digest('hex');
  assert.equal(actual, expected, `native fixture source hash: ${relative}`);
}

const assets = await PetTurtleAssets.decode(path => new Uint8Array(readFileSync(`public${path}`)));
const events: { type: string; payload?: Record<string, unknown> }[] = [];

function createContext(
  form: 1 | 2 | 3 | 4,
  action: 'hit1' | 'hit2',
  owner: 1 | 2,
) {
  const roster = createSeedPetRoster();
  const pet = roster.pets.find(candidate => candidate.species === 'turtle' && candidate.form === form)!;
  assert(pet);
  roster.pets.forEach(candidate => { candidate.isActive = candidate === pet; });
  Object.assign(pet, {
    id: `p${owner}-turtle${form}`,
    hp: 100,
    maxHp: 1000,
    mp: 1000,
    maxMp: 1000,
    atk: 100,
    critBonusRate: 0,
    skills: action === 'hit2' ? ['sld'] : [],
  });
  const projectiles = createProjectileSystem();
  const runtime: PetRuntimeModel = {
    petId: pet.id,
    runtimeKey: `${pet.id}:caller-order`,
    x: 300,
    y: 400,
    facingX: 1,
    rootScaleX: 1,
    state: 'idle',
  };
  const projectileCombat = {
    mask: () => { throw new Error('caller-order test must not use the legacy mask port'); },
    target: () => undefined,
    hit: () => false,
  } as any;
  const cast = (request: any) => request({
    roster,
    runtime,
    targets: [],
    projectiles,
    random: () => 0.5,
    actionToken: 7,
  });
  const context = {
    pet,
    owner: { x: 600, y: 400, facingX: 1 },
    runtime,
    targets: [],
    actionToken: 7,
    sourcePetId: pet.id,
    deltaMs: 1000 / 24,
    hostFps: 24,
    hostTick: 0,
    targetAcquiredThisFrame: false,
    isLocalOwner: true,
    grounded: false,
    projectileCombat,
    isGxp: false,
    random: () => 0.5,
    castSkill: cast,
    castSkillAt: cast,
    castBasicAttack: () => ({ ok: false, message: 'not used', pet }),
    relocate: (x: number, y: number) => { runtime.x = x; runtime.y = y; },
    face: (direction: -1 | 1) => { runtime.facingX = direction; },
    setRootScaleX: (sign: -1 | 1) => { runtime.rootScaleX = sign; },
    healSelf: (hp: number) => { pet.hp = Math.min(pet.maxHp, pet.hp + (hp | 0)); },
    linkOwner: () => { throw new Error('Caller fixture has no TXLJ release'); },
    healLinkedOwner: () => {}, // Native caller fixtures here are explicitly unlinked.
    spendMp: (amount: number) => { if (pet.mp < amount) return false; pet.mp -= amount; return true; },
    protectFromHits: () => {},
    setSkillCooldown: () => {},
    releaseSelf: () => {},
    playAnimation: () => {},
    spawnSummon: () => { throw new Error('caller-order test does not spawn summons'); },
    releaseSummon: () => {},
    summonSnapshots: () => [],
    emit: (event: PetBehaviorEvent) => { events.push(event); },
  } as unknown as PetBehaviorContext;
  return { pet, projectiles, runtime, context };
}

function scenarioCalls(id: string): NativeCall[] {
  return native.calls.filter(call => call.scenario === id);
}

for (const form of [1, 2, 3, 4] as const) {
  for (const owner of [1, 2] as const) {
    for (const action of ['hit1', 'hit2'] as const) {
      const scenario = `${action === 'hit1' ? 'normal' : 'sld'}-${form}-${owner}-7`;
      const expected = scenarioCalls(scenario);
      assert(expected.length > 0, `missing native caller scenario ${scenario}`);
      const setup = createContext(form, action, owner);
      const behavior = new TurtlePetBehavior(assets, form);
      const before = setup.pet.hp;
      behavior.onAnimationEvent({ runtimeKey: setup.runtime.runtimeKey, actionToken: 7,
        eventName: 'hit', action }, setup.context);
      const created = events.pop()!;
      assert.equal(created.type, 'turtle-projectile-created');
      const createdPayload = created.payload!;
      const projectile = setup.projectiles.projectiles[0]!;
      assert.equal(createdPayload.symbol, expected[0]!.bullet.symbol, `${scenario} symbol`);
      assert.equal(createdPayload.action, expected[0]!.bullet.action, `${scenario} action`);
      assert.deepEqual(createdPayload.sourceRoot, { x: 300, y: 400 }, `${scenario} source root`);
      assert.equal(projectile.x, expected[0]!.bullet.x, `${scenario} first x`);
      assert.equal(projectile.y, expected[0]!.bullet.y, `${scenario} first y`);
      assert.equal(setup.pet.hp, action === 'hit2' ? 205 : before, `${scenario} creation heal`);

      for (let index = 0; index < expected.length; index++) {
        behavior.beforeActions?.(setup.context);
        const step = events.pop();
        assert(step && step.type === 'turtle-projectile-step', `${scenario} caller ${index}`);
        const payload = step.payload!;
        const call = expected[index]!;
        assert.equal(payload.nativeTick, call.bullet.frame - 1, `${scenario} native tick ${index}`);
        assert.equal(payload.x, call.bullet.x, `${scenario} checkAttack x ${index}`);
        assert.equal(payload.y, call.bullet.y, `${scenario} checkAttack y ${index}`);
        assert.equal(payload.facingX, -call.bullet.a, `${scenario} checkAttack matrix/facing ${index}`);
        const tree = assets.effect(call.bullet.symbol, call.bullet.frame - 1, 1, 1).meta.tree!;
        assert.deepEqual(tree.matrix, call.tree.matrix, `${scenario} display root matrix ${index}`);
        if ((call.tick === 13 || call.tick === 14) && action === 'hit2') {
          setup.runtime.facingX = call.tick === 13 ? -1 : 1;
        }
        if (call.tick === 15 && action === 'hit2') {
          // Original probe moves/flips after tick 15's collision caller.
          setup.runtime.x += 40;
          setup.runtime.y -= 10;
          setup.runtime.rootScaleX = -1;
        }
        if (call.tick === 16 && action === 'hit2') setup.runtime.rootScaleX = 1;
      }
      assert.equal(setup.projectiles.projectiles[0]?.isExpired, true, `${scenario} lifetime terminal`);
      behavior.destroy();
      assert.equal(setup.projectiles.projectiles[0]?.isExpired, true, `${scenario} destroy cleanup`);
    }
  }
}

assert.equal(native.calls.length, 332, 'native caller fixture cardinality');
console.log(`Turtle caller order: ${native.calls.length} native calls, 16 scenarios, source hashes and lifecycle/follow/root-matrix checks passed`);
