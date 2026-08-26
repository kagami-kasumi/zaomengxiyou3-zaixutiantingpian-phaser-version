import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(repoRoot, 'docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json')
const schemaPath = path.join(repoRoot, 'docs/reverse-engineering/ground-truth/schema/pet-family-ground-truth.schema.json')
const visualTruthPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-193a-pet-monkey-animation.json'
const legacyRoot = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'

const sourceSpecs = [
  ['pet-monkey-1', `${legacyRoot}/export/pet/PetMonkey1.as`, 'bc82b14bd316389841fe2267f4382354fae820a56fa0c868a2fa62aa80cb20dd'],
  ['pet-monkey-2', `${legacyRoot}/export/pet/PetMonkey2.as`, '855283fddf3f988f0848460fc304d1802e2a8d83e3aa89b813281cc608afaa43'],
  ['pet-monkey-3', `${legacyRoot}/export/pet/PetMonkey3.as`, '4ad78699aebbfbc78e9be70f09bde8e434d8d3eee513a5338d3e906cde0d6bdc'],
  ['pet-monkey-4', `${legacyRoot}/export/pet/PetMonkey4.as`, '9c81aa42be60053ca202f8519ce905a1cf40f2060597569fbea5096cb936e72e'],
  ['base-pet', `${legacyRoot}/base/BasePet.as`, '29445a84725a475a69d4a779eec57d488a2288a306ae7555e8ce8f5abd622c42'],
  ['base-bullet', `${legacyRoot}/base/BaseBullet.as`, '70ebadf7758400170bca4991053954863d9872cd04ea293dd286534796e32e96'],
  ['pet-info', `${legacyRoot}/petInfo/PetInfo.as`, 'b9bba062ed38c9e475bb4e1b29dfc2328ba968453ed8d2fe821a403eb4b4dbc2'],
  ['collision-owner', 'local-resources/regima/source/restored-swfs/assets/StageCommon.swf', 'c6fc973d7d606ce4ea177b0ac075844c86a5ee7e493235fa812a029fbe4f29c9'],
  ['visual-truth', visualTruthPath, '0541f6bab5cf572c5c58180a84633a8e2517d0ba9643323c83f5937ea0d43b80']
]

const contractIds = [
  'owner.body', 'owner.effects', 'owner.collision', 'visual.states', 'visual.baselines',
  'runtime.update-order', 'runtime.target-order', 'runtime.target-loss', 'runtime.follow-owner',
  'runtime.follow-target', 'runtime.warp', 'runtime.action-priority', 'runtime.normal-roll',
  'runtime.cooldown-order', 'runtime.auto-buff', 'runtime.hurt', 'runtime.death',
  'runtime.destroy', 'runtime.projectile-collision', 'runtime.attack-id-dedup',
  'runtime.damage-pipeline', 'runtime.p1-p2',
  'monkey1.normal', 'monkey1.xj', 'monkey1.hurt-release',
  'monkey2.normal', 'monkey2.lj', 'monkey2.xj', 'monkey2.hurt-release',
  'monkey3.normal', 'monkey3.lyq', 'monkey3.xj', 'monkey3.lj', 'monkey3.hurt-release',
  'monkey4.normal', 'monkey4.lyq', 'monkey4.xj', 'monkey4.lj', 'monkey4.jgaoyi',
  'monkey4.hurt-release', 'monkey4.jgaoyi-chain'
]

const locator = (file, lines) => ({ file: `${legacyRoot}/${file}`, lines })
const skill = (id, slot, initialCdSeconds, intervalCdSeconds, mp, hit, formula, release) => ({
  id, slot, initialCdSeconds, intervalCdSeconds, mp, hit, formula, release
})

function form({ id, attackRange, collision, skills, actions, special }) {
  return {
    id,
    speed: 5,
    attackRate: 0.7,
    attackRange,
    collision,
    skills,
    actions,
    ...(special ? { special } : {})
  }
}

function createContractMatrix() {
  return contractIds.map(id => {
    if (id.startsWith('visual.')) return { id, modernOwner: 'PetMonkeyAnimationAssets -> FormalPetMonkeyBodyBridge', status: 'implemented-isolated', verification: '193A truth/baseline + 193B visual test; 208 formal action binding' }
    if (id.startsWith('owner.')) return { id, modernOwner: 'AssetManifest / combat-common / pet runtime bridge', status: 'partial', verification: '208 owner and load-precedence gates' }
    if (id.startsWith('monkey')) return { id, modernOwner: 'MonkeyPetBehavior + PetSystem + FormalPetMonkeyBodyBridge', status: id === 'monkey4.jgaoyi-chain' || id === 'monkey4.hurt-release' ? 'gap' : 'partial', verification: `208 deterministic ${id} scenario for P1 and P2` }
    return { id, modernOwner: 'PetCombatRuntime + MonkeyPetBehavior + formal pet bridge', status: 'gap-or-partial', verification: `208 P1R ${id} automated and formal runtime observation` }
  })
}

async function sha256(relativePath) {
  return createHash('sha256').update(await readFile(path.join(repoRoot, relativePath))).digest('hex')
}

async function buildTruth() {
  const sources = []
  for (const [id, file, expectedSha256] of sourceSpecs) {
    const actualSha256 = await sha256(file)
    if (actualSha256 !== expectedSha256) throw new Error(`${id} source hash changed: ${actualSha256}`)
    sources.push({ id, file, sha256: actualSha256 })
  }

  const contractMatrix = createContractMatrix()
  return {
    schemaVersion: 1,
    truthId: 'task-settings-207.pet-monkey-family',
    status: 'verified',
    taskId: 'TASK-SETTINGS-207',
    sources,
    visualTruth: {
      manifest: visualTruthPath,
      truthId: 'task-settings-193a.pet-monkey-animation',
      stateCount: 626,
      displayObjectCount: 20,
      baselineCount: 626,
      unresolvedCount: 0,
      role: '逐对象、逐方向、逐动作、逐关键帧视觉与命中发射点的唯一原版机器真值'
    },
    owners: [
      { form: 'monkey1', bodyClass: 'PetMonkeyBmd1', bodyOwner: 'assets/20120203.swf', collisionClass: 'ObjectBaseSprite3', collisionCharacterId: 103 },
      { form: 'monkey2', bodyClass: 'PetMonkeyBmd2', bodyOwner: 'assets/20120203.swf', collisionClass: 'ObjectBaseSprite4', collisionCharacterId: 101 },
      { form: 'monkey3', bodyClass: 'PetMonkeyBmd3', bodyOwner: 'assets/20120203.swf', collisionClass: 'ObjectBaseSprite', collisionCharacterId: 105 },
      { form: 'monkey4', bodyClass: 'PetMonkeyBmd4', bodyOwner: 'assets/pet1.swf', collisionClass: 'ObjectBaseSprite', collisionCharacterId: 105 }
    ],
    sharedRuntime: {
      updateOrder: ['projectile-step', 'passive', 'ai', 'passive-upgrade', 'cooldown-decrement', 'time-count', 'owner-warp', 'base-step'],
      targeting: { source: 'gc.obbsiteArray = gc.pWorld.monsterArray', selection: 'first element within distance <= 1200', order: 'stable monster insertion/spawn order', loss: 'dead or distance >= 1200 clears target without same-frame reselection' },
      cadence: { aiActionCheck: 'once per frameClips interval', decisionPriority: ['skill1', 'skill2', 'skill3', 'skill4', 'once-per-second attack/follow branch'], normalBranch: 'random <= 0.7 => normal; otherwise new random < 0.3 => wait; otherwise follow target' },
      movement: { ownerFollowRange: 640, targetSearchRange: 1200, warpDistance: 1000, warpDestination: 'owner.x, owner.y - 30' },
      cooldown: 'AI reads current CD first; countSkillCD decrements positive slots afterward',
      hurt: 'reduceHp applies defense/hurt processing; monkey override sets hurt-release trigger after super.reduceHp, including a lethal hit; death phase still wins',
      projectile: 'hero/pet bullets scan monsterArray.concat(likeMonsterArray), de-duplicate by attackId, call target.beMagicAttack, and respect hitMaxCount/attackInterval',
      damage: 'bullet snapshots source getRealPower(curAction); BasePet real power is atk * 2.8, then target defense/countHurt/reduceHp apply',
      death: 'HP <= 0 sets dead; single mode decrements life; otherwise death/hurt body action resolves',
      destroy: 'destroy body/effects, mark destroyed, fade/remove after one second, destroy all bullets, clear owner pet slot and protected references',
      locators: [locator('base/BasePet.as', '141-215,305-397,566-746,865-934,1009-1043,1075-1086,1150-1189'), locator('base/BaseBullet.as', '105-133,225-371,382,427-461,486-496,554-557')]
    },
    forms: [
      form({
        id: 'monkey1', attackRange: 40, collision: 'ObjectBaseSprite3',
        skills: [skill('xj', 1, 2, 3, 20, 'hit2', '(2.6 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp && hurtRelease')],
        actions: {
          normal: { hit: 'hit1', frameCount: 10, emit: { x: 'direction * 45', y: -25 }, projectile: 'PetMonkey1Bullet1' },
          xj: { hit: 'hit2', frameCount: 11, emit: { x: 'direction * 45', y: -80 }, projectile: 'PetMonkey1Bullet2', followsPet: true, lifetimeSeconds: 4, clearsHurtRelease: true }
        }
      }),
      form({
        id: 'monkey2', attackRange: 70, collision: 'ObjectBaseSprite4',
        skills: [
          skill('lj', 1, 2, 3, 20, 'hit2', '(4.2 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp'),
          skill('xj', 2, 2, 7, 20, 'hit3', '(2.6 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp && hurtRelease')
        ],
        actions: {
          normal: { hit: 'hit1', frameCount: 8, emit: { x: 'direction * 65', y: -30 }, projectile: 'PetMonkey2Bullet1' },
          lj: { hit: 'hit2', frameCount: 1, prelude: { projectile: 'PetMonkey2Bullet2_1', disabled: true, behindPet: true, x: 'direction * 15', y: -15 }, damage: { projectile: 'PetMonkey2Bullet2_2', x: 0, y: 0 } },
          xj: { hit: 'hit3', frameCount: 10, emit: { x: 'direction * 45', y: -70 }, projectile: 'PetMonkey1Bullet2', followsPet: true, lifetimeSeconds: 4, clearsHurtRelease: true }
        }
      }),
      form({
        id: 'monkey3', attackRange: 150, collision: 'ObjectBaseSprite',
        skills: [
          skill('lyq', 1, 2, 3, 20, 'hit2', '(6.8 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp && targetDistance <= 400'),
          skill('xj', 2, 2, 7, 20, 'hit3', '(2.6 * atk * 1.05) * GXP(1|1.2)', 'learned && mp'),
          skill('lj', 3, 4, 9, 20, 'hit4', '(4.2 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp && hurtRelease')
        ],
        actions: {
          normal: { hit: 'hit1', frameCount: 8, emit: { x: 'direction * 100', y: -40 }, projectile: 'PetMonkey3Bullet1' },
          lyq: { hit: 'hit2', frameCount: 2, emit: { x: 'direction * 35', y: -60 }, projectile: 'PetMonkey3Bullet2' },
          xj: { hit: 'hit3', frameCount: 10, emit: { x: 'direction * 45', y: -50 }, projectile: 'PetMonkey1Bullet2', followsPet: true, lifetimeSeconds: 4, clearsHurtRelease: true },
          lj: { hit: 'hit4', frameCount: 1, prelude: { projectile: 'PetMonkey3Bullet4_1', disabled: true, behindPet: true, x: 0, y: -15 }, damage: { projectile: 'PetMonkey3Bullet4_2', x: 'direction * 10', y: -15 } }
        }
      }),
      form({
        id: 'monkey4', attackRange: 150, collision: 'ObjectBaseSprite',
        skills: [
          skill('lyq', 1, 2, 3, 20, 'hit2', 'monkey3.lyq * hurtBaseEffectRate', 'learned && mp && targetDistance <= 400'),
          skill('xj', 2, 2, 7, 20, 'hit3', '(2.6 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2) * hurtBaseEffectRate', 'learned && mp'),
          skill('lj', 3, 4, 6, 20, 'hit4', 'monkey3.lj * hurtBaseEffectRate', 'learned && mp && hurtRelease'),
          skill('jgaoyi', 4, 10, 24, 30, 'hit5', '0', 'target && learned && mp')
        ],
        actions: {
          normal: { hit: 'hit1', formula: 'monkey3.normal * hurtBaseEffectRate' },
          lyq: { hit: 'hit2', visualAndProjectile: 'same as monkey3' },
          xj: { hit: 'hit3', visualAndProjectile: 'same as monkey3' },
          lj: { hit: 'hit4', visualAndProjectile: 'same as monkey3' },
          jgaoyi: { hit: 'hit5', directDamage: 0, chainCount: 5 }
        },
        special: {
          jgaoyi: { visibleMonsterXExclusive: [20, 920], target: 'uniform random visible monster', teleport: 'target.x + random(-50..50), target.y - 30', intermediate: 'if xj learned call xj; then independently if lj learned call lj else normal', final: 'lyq if learned else normal', finish: 'return to owner.x, owner.y - 50 and wait', hurtCancelsChain: true }
        }
      })
    ],
    collisionProfiles: [
      { class: 'ObjectBaseSprite4', characterId: 101, forms: ['monkey2'], width: 35, height: 69.95, registration: { x: 17.5, y: 35 }, export: 'local-resources/regima/task-outputs/task-settings-207-pet-monkey-family/collision-svg/DefineSprite_101_ObjectBaseSprite4/1.svg' },
      { class: 'ObjectBaseSprite3', characterId: 103, forms: ['monkey1'], width: 31.05, height: 29.95, registration: { x: 15.55, y: 15 }, export: 'local-resources/regima/task-outputs/task-settings-207-pet-monkey-family/collision-svg/DefineSprite_103_ObjectBaseSprite3/1.svg' },
      { class: 'ObjectBaseSprite', characterId: 105, forms: ['monkey3', 'monkey4'], width: 49.95, height: 99.95, registration: { x: 25, y: 50 }, export: 'local-resources/regima/task-outputs/task-settings-207-pet-monkey-family/collision-svg/DefineSprite_105_ObjectBaseSprite/1.svg' }
    ],
    playerLifecycle: {
      sharedLogic: 'both player pets use BasePet owner/single gates and the same AI/action/CD/damage rules',
      ownerPrecedence: 'owner pet slot is cleared only by that pet destroy path; sourceRole/attackId retain player ownership for bullet damage',
      independentState: ['target', 'cooldowns', 'hurt-release flags', 'active projectiles', 'jgaoyi chain counter'],
      destruction: 'each pet destroys only its own bullet array, body/effects and owner slot'
    },
    modernConsumers: [
      { contract: 'visual.states', owner: 'PetMonkeyAnimationAssets', consumer: 'FormalPetMonkeyBodyBridge', status: 'implemented' },
      { contract: 'runtime.update-order', owner: 'PetCombatRuntime', consumer: 'none', status: 'gap', note: 'runtime class has no formal Scene references' },
      { contract: 'runtime.action-priority', owner: 'MonkeyPetBehavior', consumer: 'PetCombatRuntime', status: 'partial', note: 'no legacy cadence, attack-rate/wait/follow branch' },
      { contract: 'runtime.projectile-collision', owner: 'PetSystem request*', consumer: 'TestScenePetMagicBridge', status: 'gap', note: 'skills resolve immediately; no original hit-event projectile pipeline' },
      { contract: 'runtime.damage-pipeline', owner: 'PetSystem tuning', consumer: 'TestScenePetMagicBridge', status: 'modern-exception', note: 'current tuning is not original formula truth' },
      { contract: 'monkey4.hurt-release', owner: 'MonkeyPetBehavior.onDamaged', consumer: 'monkey3Lj release state', status: 'gap', note: 'form 4 does not arm the inherited original release' },
      { contract: 'monkey4.jgaoyi-chain', owner: 'MonkeyPetBehavior/PetSystem', consumer: 'none', status: 'gap', note: 'original five-step target/teleport/skill chain absent' },
      { contract: 'runtime.p1-p2', owner: 'PetCombatRuntime', consumer: 'none', status: 'gap', note: 'no formal dual-player runtime ownership consumer' }
    ],
    contractMatrix,
    p1rAcceptance: {
      taskId: 'TASK-SLICE-208',
      requiredTruthId: 'task-settings-207.pet-monkey-family',
      requiredVisualTruthId: 'task-settings-193a.pet-monkey-animation',
      contractIds,
      requiredScenarios: ['P1 monkey1..4 full lifecycle', 'P2 monkey1..4 full lifecycle', 'stable target order', 'all normal/skill hit events', 'hurt-release including monkey4', 'jgaoyi five-step chain', 'death and owner-isolated destruction']
    },
    completeness: { declaredContractIds: contractIds, manifestContractIds: contractMatrix.map(item => item.id), p1rContractIds: [...contractIds], unresolved: [] }
  }
}

async function validate(truth) {
  const errors = []
  const schema = JSON.parse(await readFile(schemaPath, 'utf8'))
  for (const key of schema.required) if (!(key in truth)) errors.push(`schema.required.${key}`)
  const allowed = new Set(Object.keys(schema.properties))
  for (const key of Object.keys(truth)) if (!allowed.has(key)) errors.push(`schema.additionalProperties.${key}`)
  for (const [key, rule] of Object.entries(schema.properties)) {
    if (rule.const !== undefined && truth[key] !== rule.const) errors.push(`schema.const.${key}`)
    if (rule.type === 'array' && (!Array.isArray(truth[key]) || (rule.minItems !== undefined && truth[key].length < rule.minItems) || (rule.maxItems !== undefined && truth[key].length > rule.maxItems))) errors.push(`schema.array.${key}`)
  }
  if (truth.schemaVersion !== 1 || truth.truthId !== 'task-settings-207.pet-monkey-family' || truth.status !== 'verified') errors.push('identity')
  if (truth.sources.length !== 9 || truth.owners.length !== 4 || truth.forms.length !== 4 || truth.collisionProfiles.length !== 3) errors.push('cardinality')
  if (truth.visualTruth.stateCount !== 626 || truth.visualTruth.baselineCount !== 626 || truth.visualTruth.unresolvedCount !== 0) errors.push('visual truth')
  const expected = JSON.stringify(contractIds)
  for (const key of ['declaredContractIds', 'manifestContractIds', 'p1rContractIds']) if (JSON.stringify(truth.completeness[key]) !== expected) errors.push(`completeness.${key}`)
  if (JSON.stringify(truth.p1rAcceptance.contractIds) !== expected || truth.completeness.unresolved.length !== 0) errors.push('P1R closure')
  if (JSON.stringify(truth.contractMatrix.map(item => item.id)) !== expected || truth.contractMatrix.some(item => !item.modernOwner || !item.verification)) errors.push('contract consumer matrix')
  const m4 = truth.forms.find(item => item.id === 'monkey4')
  if (m4.skills.find(item => item.id === 'lj')?.intervalCdSeconds !== 6 || m4.actions.jgaoyi.chainCount !== 5 || !m4.special.jgaoyi.intermediate.includes('independently')) errors.push('monkey4 critical branch')
  const m3xj = truth.forms.find(item => item.id === 'monkey3').skills.find(item => item.id === 'xj')
  if (m3xj.formula.includes('crit') || m3xj.formula.includes('magicAdd')) errors.push('monkey3 xj formula')
  if (!truth.modernConsumers.some(item => item.contract === 'monkey4.hurt-release' && item.status === 'gap')) errors.push('modern gap matrix')
  if (errors.length) throw new Error(`pet monkey family truth invalid: ${errors.join(', ')}`)
}

async function main() {
  const truth = await buildTruth()
  await validate(truth)
  if (process.argv.includes('--self-test')) {
    const mutated = structuredClone(truth)
    mutated.forms.find(item => item.id === 'monkey4').skills.find(item => item.id === 'lj').intervalCdSeconds = 9
    try { await validate(mutated) } catch { console.log('pet monkey family schema and mutation self-test passed'); return }
    throw new Error('mutation self-test failed to reject monkey4 lj cooldown change')
  }
  const serialized = `${JSON.stringify(truth, null, 2)}\n`
  if (process.argv.includes('--check')) {
    const existing = await readFile(outputPath, 'utf8')
    if (existing !== serialized) throw new Error('pet monkey family truth is stale; run npm run generate:pet-monkey-family-truth')
    console.log(`pet monkey family truth verified: ${contractIds.length} contracts, 4 forms, 0 unresolved`)
    return
  }
  await writeFile(outputPath, serialized)
  console.log(`wrote ${path.relative(repoRoot, outputPath)}`)
}

await main()
