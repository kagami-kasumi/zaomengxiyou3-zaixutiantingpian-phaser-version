import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(repoRoot, 'docs/reverse-engineering/ground-truth/manifests/task-settings-209-pet-horse-family.json')
const schemaPath = path.join(repoRoot, 'docs/reverse-engineering/ground-truth/schema/pet-family-ground-truth.schema.json')
const visualTruthPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-193c-pet-horse-animation.json'
const legacyRoot = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'

const sourceSpecs = [
  ['pet-horse-1', `${legacyRoot}/export/pet/PetHorse1.as`, '558fb01aa821fd6eb19bfb683df6452f84ef0dfaf3ae4da5ebc3b1eae6a5fc05'],
  ['pet-horse-2', `${legacyRoot}/export/pet/PetHorse2.as`, 'ee5f72352b2af1b12971481d02c855c14e1f2e57e96f108e8ec6ef0e227cd363'],
  ['pet-horse-3', `${legacyRoot}/export/pet/PetHorse3.as`, 'a956e69c4f5d5403274f3bcfa00408b20d1705fb6f7b5fd53a49edd7831104a0'],
  ['pet-horse-4', `${legacyRoot}/export/pet/PetHorse4.as`, '3ccc009f39f2e3508c6a15b06691e55c922b3064827623f6cba905e65e34b599'],
  ['base-pet', `${legacyRoot}/base/BasePet.as`, '29445a84725a475a69d4a779eec57d488a2288a306ae7555e8ce8f5abd622c42'],
  ['base-bullet', `${legacyRoot}/base/BaseBullet.as`, '70ebadf7758400170bca4991053954863d9872cd04ea293dd286534796e32e96'],
  ['base-add-effect', `${legacyRoot}/base/BaseAddEffect.as`, 'aee184ddb61725c4f4268ade44f37effaa9bb632daef16186866f4cc8684d511'],
  ['special-effect-bullet', `${legacyRoot}/export/bullet/SpecialEffectBullet.as`, '863c64f210f4534c246e84d5bad9d799cd95809f29f982117a877f1dd88be3d0'],
  ['follow-base-object-bullet', `${legacyRoot}/export/bullet/FollowBaseObjectBullet.as`, '9072022d9f95ebe7094abe3c7fd6fc340edfab28ac99d4fbc9de46fd3391dbf5'],
  ['enemy-move-bullet', `${legacyRoot}/export/bullet/EnemyMoveBullet.as`, '75bd3d79c9dd683a3a3278133e967946df78cbba1eddb82e6bb8ed85fb7a14d0'],
  ['pet-info', `${legacyRoot}/petInfo/PetInfo.as`, 'b9bba062ed38c9e475bb4e1b29dfc2328ba968453ed8d2fe821a403eb4b4dbc2'],
  ['patch-swf', 'local-resources/regima/source/restored-swfs/assets/20120203.swf', '3383e2f13967cfc33e7a8fd937cf37c407784f769b86beebb15694befcefb832'],
  ['base-swf', 'local-resources/regima/source/restored-swfs/assets/pet1.swf', '0699a5d3a49ea8024d3635b18c6349f5d7f7cf5f1db869dd18a0a5ee6de60644'],
  ['common-swf', 'local-resources/regima/source/restored-swfs/assets/StageCommon.swf', 'c6fc973d7d606ce4ea177b0ac075844c86a5ee7e493235fa812a029fbe4f29c9'],
  ['visual-truth', visualTruthPath, 'fc84794f6da34200936aeb15be6b2b6fea7095a4d5d2fe298420c499b5678db3'],
]

const expectedForms = ['horse1', 'horse2', 'horse3', 'horse4']
const expectedActions = [
  'horse1.normal', 'horse1.sp',
  'horse2.normal', 'horse2.bd', 'horse2.sp',
  'horse3.normal', 'horse3.bd', 'horse3.sp', 'horse3.bz',
  'horse4.normal', 'horse4.bd', 'horse4.sp', 'horse4.bz', 'horse4.tmaoyi',
]
const expectedEffects = [
  'PetHorse1Bullet1', 'PetHorse1Bullet2', 'PetHorse2Bullet1', 'PetHorse2Bullet2',
  'PetHorse3Bullet1', 'PetHorse3Bullet2', 'PetHorse3Bullet3', 'PetHorse3Bullet4',
  'PetHorse4Bullet5', 'PetHorse4Bullet5Explode', 'PetHorseIceEffect', 'AoyiBuff',
]

const contractIds = [
  'owner.body', 'owner.effects', 'owner.collision', 'visual.states', 'visual.baselines',
  'runtime.update-order', 'runtime.target-order', 'runtime.target-loss', 'runtime.follow-owner',
  'runtime.follow-target', 'runtime.warp', 'runtime.action-priority', 'runtime.normal-roll',
  'runtime.cooldown-order', 'runtime.hurt', 'runtime.death', 'runtime.destroy',
  'runtime.projectile-collision', 'runtime.attack-id-dedup', 'runtime.damage-pipeline',
  'runtime.ice-effect', 'runtime.p1-p2',
  'horse1.normal', 'horse1.sp',
  'horse2.normal', 'horse2.bd', 'horse2.sp', 'horse2.hurt-release',
  'horse3.normal', 'horse3.bd', 'horse3.sp', 'horse3.bz', 'horse3.hurt-release',
  'horse4.normal', 'horse4.bd', 'horse4.sp', 'horse4.bz', 'horse4.tmaoyi',
  'horse4.hurt-release', 'horse4.tmaoyi-targeting', 'horse4.tmaoyi-ice',
  'horse4.tmaoyi-explosion', 'horse4.tmaoyi-cleanup',
]

const traceFields = [
  'frame', 'timeMs', 'ownerSlot', 'runtimeKey', 'petId', 'petForm', 'targetId',
  'petX', 'petY', 'targetX', 'targetY', 'targetDistance', 'action', 'actionToken',
  'projectileId', 'projectileAction', 'attackId', 'damageSourceId', 'hpBefore',
  'hpAfter', 'animationState', 'cleanupReason',
]

const locator = (file, lines) => ({ file: `${legacyRoot}/${file}`, lines })
const skill = (id, slot, initialCdSeconds, intervalCdSeconds, mp, hit, formula, release) => ({
  id, slot, initialCdSeconds, intervalCdSeconds, mp, hit, formula, release,
})

function action({ hit, bodySequence, holdTick, projectile, emit, projectileType = 'SpecialEffectBullet', ...extra }) {
  return {
    hit,
    emitTiming: { bodySequence, holdTick, clock: 'host tick from BaseBitmapDataClip enterFrame callback' },
    projectile,
    projectileType,
    emit,
    collision: 'BaseBullet.checkAttack each active projectile step; complex target collision -> beMagicAttack',
    attackId: 'snapshot source pet attack id at setRole; target beAttackIdArray de-duplicates the hit',
    ...extra,
  }
}

function form({ id, attackRange, collision, skills, actions, special }) {
  return {
    id,
    speed: 5,
    attackRate: 0.7,
    attackRange,
    collision,
    skills,
    actions,
    ...(special ? { special } : {}),
  }
}

function scenariosFor(id) {
  if (id.startsWith('horse1.')) return ['p1-horse1-range-chain', 'p2-horse1-range-chain', 'p1-horse1-sp', 'p2-horse1-sp']
  if (id.startsWith('horse2.')) return ['p1-horse2-range-chain', 'p2-horse2-range-chain', 'p1-horse2-bd-sp', 'p2-horse2-bd-sp']
  if (id.startsWith('horse3.')) return ['p1-horse3-range-chain', 'p2-horse3-range-chain', 'p1-horse3-bd-sp-bz', 'p2-horse3-bd-sp-bz']
  if (id.startsWith('horse4.tmaoyi')) return ['p1-horse4-tmaoyi-combinations', 'p2-horse4-tmaoyi-combinations', 'formal-horse4-multi-target']
  if (id.startsWith('horse4.')) return ['p1-horse4-range-chain', 'p2-horse4-range-chain', 'p1-horse4-all-skills', 'p2-horse4-all-skills']
  if (id === 'runtime.p1-p2') return ['formal-dual-player-isolation', 'test-scene-dual-player-isolation']
  if (id.includes('destroy') || id.includes('death')) return ['death-replacement-rest-retry-return-reload']
  if (id.startsWith('visual.')) return ['all-horse-actions-visual-truth', 'formal-p1-p2-940x590']
  return ['shared-horse-runtime-contract', 'formal-horse-stage-path']
}

function expectedFieldsFor(id) {
  if (id.endsWith('.normal')) return ['attackRange', 'attackRate', 'actions.normal.emitTiming', 'actions.normal.projectile', 'actions.normal.emit']
  if (id.includes('tmaoyi')) return ['skills.tmaoyi', 'actions.tmaoyi', 'special.tmaoyi']
  if (/^horse[1-4]\.(sp|bd|bz)$/.test(id)) return [`skills.${id.split('.')[1]}`, `actions.${id.split('.')[1]}`]
  if (id.includes('hurt-release')) return ['skills.bd.release', 'actions.bd.clearsHurtRelease']
  if (id.startsWith('owner.')) return ['owners', 'sources']
  if (id.startsWith('visual.')) return ['visualTruth']
  return [`sharedRuntime.${id.replace('runtime.', '')}`]
}

function assertionFor(id) {
  if (id.endsWith('.normal')) return 'No action or projectile before verified range entry; distance decreases first, then one token-linked projectile reaches damage and cleanup.'
  if (id.includes('hurt-release')) return 'A damage event arms bd once, the verified bd projectile clears the flag, and P1/P2 flags remain isolated.'
  if (id.includes('tmaoyi')) return 'Target count, optional tracking, ice, delayed/immediate explosion, damage reuse, and destruction follow the frozen skill combination.'
  if (id === 'runtime.attack-id-dedup') return 'The same projectile attack id cannot decrease the same target HP twice before its interval rotates the id.'
  if (id === 'runtime.damage-pipeline') return 'A pet-owned source snapshot reaches actual monster HP decrease; emitted animation alone is not success.'
  if (id === 'runtime.p1-p2') return 'Runtime, target, cooldown, projectile, source, damage, and cleanup state never cross player slots.'
  return 'The black-box trace equals the frozen field semantics and the declared formal consumer observes the result.'
}

function createAcceptanceMatrix() {
  return contractIds.map((id) => ({
    id,
    expectedFields: expectedFieldsFor(id),
    controlledScenarios: scenariosFor(id),
    traceFields,
    semanticAssertions: [assertionFor(id)],
    actualSource: 'black-box runtime trace; expected values are read only from task-settings-209.pet-horse-family',
  }))
}

function createContractMatrix() {
  return contractIds.map((id) => {
    if (id.startsWith('visual.')) return { id, modernOwner: 'PetHorseAnimationAssets -> PetHorseAnimationView', status: 'implemented-isolated', verification: '193C truth/baseline + 193D isolated animation tests; 210 binds actions to combat tokens' }
    if (id.startsWith('owner.')) return { id, modernOwner: 'AssetManifest / combat-common / formal horse view', status: 'partial', verification: '210 load-precedence and source-owner mutation gate' }
    if (id.startsWith('horse')) return { id, modernOwner: 'HorsePetBehavior + PetCombatRuntime + formal horse bridge', status: 'gap-or-partial', verification: `210 deterministic ${id} P1/P2 trace and formal runtime scenario` }
    return { id, modernOwner: 'PetCombatRuntime + HorsePetBehavior + public party/formal bridge', status: 'gap-or-partial', verification: `210 field-level ${id} assertion and formal runtime observation` }
  })
}

async function sha256(relativePath) {
  return createHash('sha256').update(await readFile(path.join(repoRoot, relativePath))).digest('hex')
}

async function assertSourceFacts() {
  const basePet = await readFile(path.join(repoRoot, `${legacyRoot}/base/BasePet.as`), 'utf8')
  for (const fact of ['protected var attackRange:uint = 150', 'Math.random() <= this.attackRate', 'Math.random() < 0.3', 'this.followTarget()', '>= 1000']) {
    if (!basePet.includes(fact)) throw new Error(`BasePet fact changed: ${fact}`)
  }
  const horse4 = await readFile(path.join(repoRoot, `${legacyRoot}/export/pet/PetHorse4.as`), 'utf8')
  for (const fact of ['new EnemyMoveBullet("PetHorse4Bullet5")', 'setMoveTarget(_loc4_)', 'TweenMax.delayedCall(1', 'setAction("hit5_2")', 'setDestroyInCount(gc.frameClips * 10)']) {
    if (!horse4.includes(fact)) throw new Error(`PetHorse4 fact changed: ${fact}`)
  }
}

async function buildTruth() {
  await assertSourceFacts()
  const sources = []
  for (const [id, file, expectedSha256] of sourceSpecs) {
    const actualSha256 = await sha256(file)
    if (actualSha256 !== expectedSha256) throw new Error(`${id} source hash changed: ${actualSha256}`)
    sources.push({ id, file, sha256: actualSha256 })
  }
  const visualTruth = JSON.parse(await readFile(path.join(repoRoot, visualTruthPath), 'utf8'))
  const contractMatrix = createContractMatrix()
  const acceptanceMatrix = createAcceptanceMatrix()
  const forms = [
    form({
      id: 'horse1', attackRange: 40, collision: 'ObjectBaseSprite3',
      skills: [skill('sp', 1, 2, 2, 20, 'hit2', '(3.6 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp && 50 <= targetDistance <= 100')],
      actions: {
        normal: action({ hit: 'hit1', bodySequence: 5, holdTick: 8, projectile: 'PetHorse1Bullet1', emit: { x: 'direction * 45', y: -25 }, visibleFrames: 5, destroy: 'last visual frame' }),
        sp: action({ hit: 'hit2', bodySequence: 4, holdTick: 8, projectile: 'PetHorse1Bullet2', projectileType: 'FollowBaseObjectBullet', emit: { x: 'direction * 40', y: -15 }, visibleFrames: 8, followsPet: true, iceSeconds: 2, destroy: 'last visual frame' }),
      },
    }),
    form({
      id: 'horse2', attackRange: 70, collision: 'ObjectBaseSprite4',
      skills: [
        skill('bd', 1, 2, 2, 20, 'hit2', '(3.6 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp && hurtRelease'),
        skill('sp', 2, 3, 4, 20, 'hit3', '(3.6 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp && 50 <= targetDistance <= 100'),
      ],
      actions: {
        normal: action({ hit: 'hit1', bodySequence: 3, holdTick: 20, projectile: 'PetHorse2Bullet1', emit: { x: 'direction * 70', y: -90 }, visibleFrames: 14, destroy: 'last visual frame' }),
        bd: action({ hit: 'hit2', bodySequence: 1, holdTick: 15, projectile: 'PetHorse2Bullet2', projectileType: 'FollowBaseObjectBullet', emit: { x: 'direction * 85', y: -95 }, visibleFrames: 45, followsPet: true, iceSeconds: 2, hurtCannotCancel: true, clearsHurtRelease: true, setYourFatherTicks: 15, destroy: 'last visual frame' }),
        sp: action({ hit: 'hit3', bodySequence: 3, holdTick: 1, projectile: 'PetHorse1Bullet2', emit: { x: 'direction * 60', y: -25 }, visibleFrames: 8, destroy: 'last visual frame' }),
      },
    }),
    form({
      id: 'horse3', attackRange: 150, collision: 'ObjectBaseSprite4',
      skills: [
        skill('bd', 1, 2, 2, 20, 'hit2', '(3.6 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp && hurtRelease'),
        skill('sp', 2, 3, 4, 20, 'hit3', '(3.6 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp && 50 <= targetDistance <= 100'),
        skill('bz', 3, 5, 6, 20, 'hit4', '(6.6 * atk * 1.05 + magicAdd) * crit(1|2) * GXP(1|1.2)', 'learned && mp && targetDistance <= 250'),
      ],
      actions: {
        normal: action({ hit: 'hit1', bodySequence: 3, holdTick: 20, projectile: 'PetHorse3Bullet1', emit: { x: 'direction * 150', y: -140 }, visibleFrames: 20, destroy: 'last visual frame' }),
        bd: action({ hit: 'hit2', bodySequence: 1, holdTick: 15, projectile: 'PetHorse3Bullet2', projectileType: 'FollowBaseObjectBullet', emit: { x: 'direction * 70', y: -85 }, visibleFrames: 15, followsPet: true, iceSeconds: 2, hurtCannotCancel: true, clearsHurtRelease: true, setYourFatherTicks: 15, destroy: 'last visual frame' }),
        sp: action({ hit: 'hit3', bodySequence: 3, holdTick: 1, projectile: 'PetHorse3Bullet3', emit: { x: 'direction * 80', y: -45 }, visibleFrames: 8, destroy: 'last visual frame' }),
        bz: action({ hit: 'hit4', bodySequence: 3, holdTick: 20, projectile: 'PetHorse3Bullet4', emit: { x: 'direction * 55', y: -50 }, visibleFrames: 31, destroy: 'last visual frame' }),
      },
    }),
    form({
      id: 'horse4', attackRange: 150, collision: 'ObjectBaseSprite4',
      skills: [
        skill('bd', 1, 2, 2, 20, 'hit2', 'horse3.bd * hurtBaseEffectRate', 'learned && mp && hurtRelease'),
        skill('sp', 2, 3, 4, 20, 'hit3', 'horse3.sp * hurtBaseEffectRate', 'learned && mp && 50 <= targetDistance <= 100'),
        skill('bz', 3, 5, 6, 20, 'hit4', 'horse3.bz * hurtBaseEffectRate', 'learned && mp && targetDistance <= 250'),
        skill('tmaoyi', 4, 15, 24, 30, 'hit5', 'body hit is 0; hit5_1 reuses sp and hit5_2 reuses bz, both * hurtBaseEffectRate', 'target && learned && mp'),
      ],
      actions: {
        normal: action({ hit: 'hit1', bodySequence: 3, holdTick: 20, projectile: 'PetHorse3Bullet1', emit: { x: 'direction * 150', y: -140 }, formula: 'horse3.normal * hurtBaseEffectRate', visibleFrames: 20, destroy: 'last visual frame' }),
        bd: action({ hit: 'hit2', bodySequence: 1, holdTick: 15, projectile: 'PetHorse3Bullet2', projectileType: 'FollowBaseObjectBullet', emit: { x: 'direction * 70', y: -85 }, visibleFrames: 15, followsPet: true, iceSeconds: 2, hurtCannotCancel: true, clearsHurtRelease: true, setYourFatherTicks: 15, destroy: 'last visual frame' }),
        sp: action({ hit: 'hit3', bodySequence: 3, holdTick: 1, projectile: 'PetHorse3Bullet3', emit: { x: 'direction * 80', y: -45 }, visibleFrames: 8, destroy: 'last visual frame' }),
        bz: action({ hit: 'hit4', bodySequence: 3, holdTick: 20, projectile: 'PetHorse3Bullet4', emit: { x: 'direction * 55', y: -50 }, visibleFrames: 31, destroy: 'last visual frame' }),
        tmaoyi: action({ hit: 'hit5', bodySequence: 3, holdTick: 10, projectile: 'PetHorse4Bullet5', projectileType: 'EnemyMoveBullet', emit: { x: 'horse.x + (monsterCount / 2 - reverseIndex) * 90', y: 50 }, rootFrames: 1, nestedFrames: 8, destroy: 'distance 2000 or frameClips * 10; root last-frame destruction disabled' }),
      },
      special: {
        tmaoyi: {
          sourceTargets: 'snapshot gc.pWorld.monsterArray length; iterate reverse array order; one falling object per entry',
          tracking: 'only when sp is learned: setMoveTarget(matched monster); otherwise gravity-only fall',
          movement: 'initial speed (0,1), acceleration (0,1), vertical speed capped at 35',
          hit5_1: { hitMaxCount: 1, attackInterval: 20, damage: 'sp formula', ice: 'bd learned => PETHORSE_ICE for frameClips * 2.4' },
          explosion: { gate: 'bz learned', projectile: 'PetHorse4Bullet5Explode', action: 'hit5_2', damage: 'bz formula', delay: 'bd learned => 1 second; otherwise immediate', guard: 'pet must still be alive at creation time', destroy: 'last of 30 visual frames' },
          prelude: { aoyiBuff: 'disabled FollowBaseObjectBullet(AoyiBuff)', setYourFatherTicks: 20 },
        },
      },
    }),
  ]

  return {
    schemaVersion: 1,
    truthId: 'task-settings-209.pet-horse-family',
    status: 'verified',
    taskId: 'TASK-SETTINGS-209',
    sources,
    visualTruth: {
      manifest: visualTruthPath,
      truthId: visualTruth.truthId,
      stateCount: visualTruth.states.length,
      displayObjectCount: visualTruth.displayObjects.length,
      baselineCount: visualTruth.baselines.length,
      unresolvedCount: visualTruth.completeness.unresolved.length,
      role: 'horse1..4 body/action/effect recursive timelines, matrices, registration, visible bounds, owner precedence and original baselines',
    },
    owners: [
      { form: 'horse1', bodyClass: 'PetHorseBmd1', bodyOwner: 'assets/20120203.swf', bodyCharacterId: 17, collisionClass: 'ObjectBaseSprite3', collisionCharacterId: 103 },
      { form: 'horse2', bodyClass: 'PetHorseBmd2', bodyOwner: 'assets/20120203.swf', bodyCharacterId: 15, collisionClass: 'ObjectBaseSprite4', collisionCharacterId: 101 },
      { form: 'horse3', bodyClass: 'PetHorseBmd3', bodyOwner: 'assets/20120203.swf', bodyCharacterId: 12, collisionClass: 'ObjectBaseSprite4', collisionCharacterId: 101 },
      { form: 'horse4', bodyClass: 'PetHorseBmd4', bodyOwner: 'assets/pet1.swf', bodyCharacterId: 19, collisionClass: 'ObjectBaseSprite4', collisionCharacterId: 101 },
    ],
    sharedRuntime: {
      'update-order': ['projectile-step', 'passive', 'ai', 'passive-upgrade', 'cooldown-decrement', 'time-count', 'owner-warp', 'base-step'],
      'target-order': 'first gc.obbsiteArray entry within distance <= 1200; stable insertion/spawn order',
      'target-loss': 'dead or distance >= 1200 clears target without same-frame reselection',
      'follow-owner': 'without a target, once per frameClips: move toward owner only beyond distance 640, else wait',
      'follow-target': 'outside attack range or failed second normal roll: face target and use shared movement',
      warp: 'distance from owner >= 1000 and neither attacking nor hurt: root becomes owner.x, owner.y - 30; no warp clip',
      'action-priority': ['skill1', 'skill2', 'skill3', 'skill4', 'once-per-second normal/follow branch'],
      'normal-roll': 'within form attackRange: random <= 0.7 attacks; otherwise a new random < 0.3 waits; otherwise follows target',
      'cooldown-order': 'AI reads current CD first; positive active-pet cooldown slots decrement afterward',
      hurt: 'reduceHp runs shared defense/hurt/death logic, then horse2..4 arm bd hurtRelease even on the lethal call; death phase wins presentation',
      death: 'HP <= 0 enters dead action; body frame-over destroys the pet',
      destroy: 'destroy body/effects and every private bullet, fade/remove after one second, clear only the owning role pet slot and protected references',
      'projectile-collision': 'hero/pet bullets scan monsterArray.concat(likeMonsterArray); complex collision invokes beMagicAttack and optional hit callback',
      'attack-id-dedup': 'bullet snapshots source attackId at setRole; target beAttackIdArray rejects repeats until attackInterval rotates the bullet id',
      'damage-pipeline': 'bullet snapshots getRealPower(action).hurt/qixue plus pet atk * 2.8; target defense/countHurt/reduceHp produces actual HP decrease',
      'ice-effect': 'PETHORSE_ICE adds one PetHorseIceEffect child sized to target collision, stops BBDC, and removes/resumes on expiry',
      'p1-p2': 'single-game or matching sourceRole.sid owns emit/network action; bullets retain source pet/role identity and private lifecycle',
      locators: [
        locator('base/BasePet.as', '141-215,305-397,566-746,865-934,1009-1086,1150-1189'),
        locator('base/BaseBullet.as', '105-133,225-371,427-496,554-600'),
        locator('base/BaseAddEffect.as', '2947-2987,3467-3470'),
      ],
    },
    forms,
    collisionProfiles: [
      { class: 'ObjectBaseSprite3', characterId: 103, forms: ['horse1'], width: 31.05, height: 29.95, registration: { x: 15.55, y: 15 }, source: 'assets/StageCommon.swf character 103', export: 'local-resources/regima/task-outputs/task-settings-207-pet-monkey-family/collision-svg/DefineSprite_103_ObjectBaseSprite3/1.svg' },
      { class: 'ObjectBaseSprite4', characterId: 101, forms: ['horse2', 'horse3', 'horse4'], width: 35, height: 69.95, registration: { x: 17.5, y: 35 }, source: 'assets/StageCommon.swf character 101', export: 'local-resources/regima/task-outputs/task-settings-207-pet-monkey-family/collision-svg/DefineSprite_101_ObjectBaseSprite4/1.svg' },
    ],
    playerLifecycle: {
      sharedLogic: 'both player slots use the same BasePet AI/action/CD/damage rules and one public PetCombatRuntime per slot',
      ownerPrecedence: 'body/effect source precedence is fixed by ApplicationDomain load order; runtime source identity remains the active pet owned by that slot',
      independentState: ['target', 'cooldowns', 'bd hurtRelease', 'active projectiles', 'tmaoyi target snapshot', 'delayed explosion callbacks', 'ice-effect expiry'],
      destruction: 'replacement, rest, retry, return, reload, and death destroy only the matching slot runtime effects and projectiles; repeated destroy is idempotent',
    },
    modernConsumers: [
      { contract: 'visual.states', owner: 'PetHorseAnimationAssets', consumer: 'PetHorseAnimationView / FormalPetHorseBodyBridge', status: 'implemented-isolated', note: '193D renders truth but the bridge is not driven by PetCombatSnapshot/action tokens' },
      { contract: 'runtime.update-order', owner: 'PetCombatRuntime', consumer: 'HeroPartyRuntimeBridge p1/p2 and TestSceneHeroPartyRuntimeBridge', status: 'implemented-shared' },
      { contract: 'runtime.action-priority', owner: 'HorsePetBehavior', consumer: 'PetCombatRuntime', status: 'gap', note: 'selects only one form-labelled skill and omits inherited bd/sp/bz priority and legacy distance gates' },
      { contract: 'runtime.normal-roll', owner: 'HorsePetBehavior.basicAttack', consumer: 'PetCombatRuntime', status: 'gap', note: 'basicAttack emits a string-only event with no range/roll/chase semantics' },
      { contract: 'runtime.projectile-collision', owner: 'PetSystem request*', consumer: 'TestScenePetMagicBridge', status: 'gap', note: 'horse skills resolve through legacy immediate requests rather than verified horse action/projectile hit timing' },
      { contract: 'runtime.damage-pipeline', owner: 'PetSystem tuning', consumer: 'TestScenePetMagicBridge / formal combat', status: 'modern-exception', note: 'current horse tuning is not the original family formula and formal horse hit resolution is absent' },
      { contract: 'horse4.tmaoyi', owner: 'requestPetHorse4TmaoyiSkill', consumer: 'HorsePetBehavior', status: 'gap', note: 'current request lacks per-monster falling objects and sp/bd/bz composition' },
      { contract: 'runtime.p1-p2', owner: 'HeroPartyRuntimeBridge petCombatRuntimes', consumer: 'formal five stages', status: 'partial', note: 'runtime slots exist, but horse body/effects and formal damage are not linked to snapshots' },
      { contract: 'visual.states', owner: 'FormalPetHorseBodyBridge', consumer: 'formal five stages', status: 'legacy-duplicate', note: 'still owns a separate PetRuntimeSystem presentation path; 210 must remove the duplicate owner' },
    ],
    contractMatrix,
    p1rAcceptance: {
      taskId: 'TASK-SLICE-210',
      systemDesign: 'docs/architecture/system-designs/pet.md',
      systemDesignGate: 'P1H',
      requiredTruthId: 'task-settings-209.pet-horse-family',
      requiredVisualTruthId: 'task-settings-193c.pet-horse-animation',
      contractIds,
      traceFields,
      acceptanceMatrix,
      requiredScenarios: [
        'P1/P2 horse1..4 start beyond 40/70/150/150, chase, enter range, emit verified normal object, collide, decrease HP, and clean up',
        'P1/P2 every inherited and form skill with CD/MP/distance/hurt gates and verified emit timing',
        'horse4 tmaoyi with no inherited skills, sp only, bz only, bd+bz, and sp+bd+bz across multiple monsters',
        'range, verified normal hit timing, and source owner mutation-kill',
        'death, replacement, rest, retry, return, and reload with isolated idempotent cleanup',
        'TestScene and at least one formal 940x590 stage share runtime/projectile-source behavior with zero console warning/error',
      ],
    },
    completeness: {
      expectedForms,
      extractedForms: forms.map(({ id }) => id),
      expectedActions,
      extractedActions: forms.flatMap(({ id, actions }) => Object.keys(actions).map((name) => `${id}.${name}`)),
      expectedEffects,
      extractedEffects: [...new Set(forms.flatMap(({ actions }) => Object.values(actions).map(({ projectile }) => projectile)).concat(['PetHorse4Bullet5Explode', 'PetHorseIceEffect', 'AoyiBuff']))],
      declaredContractIds: contractIds,
      manifestContractIds: contractMatrix.map(({ id }) => id),
      p1rContractIds: acceptanceMatrix.map(({ id }) => id),
      unresolved: [],
    },
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
    if (rule.pattern !== undefined && !new RegExp(rule.pattern, 'u').test(truth[key])) errors.push(`schema.pattern.${key}`)
    if (rule.type === 'array' && (!Array.isArray(truth[key]) || (rule.minItems !== undefined && truth[key].length < rule.minItems) || (rule.maxItems !== undefined && truth[key].length > rule.maxItems))) errors.push(`schema.array.${key}`)
  }
  if (truth.truthId !== 'task-settings-209.pet-horse-family' || truth.taskId !== 'TASK-SETTINGS-209' || truth.status !== 'verified') errors.push('identity')
  if (truth.sources.length !== sourceSpecs.length || truth.owners.length !== 4 || truth.forms.length !== 4 || truth.collisionProfiles.length !== 2) errors.push('cardinality')
  if (truth.visualTruth.stateCount !== 716 || truth.visualTruth.displayObjectCount !== 20 || truth.visualTruth.baselineCount !== 716 || truth.visualTruth.unresolvedCount !== 0) errors.push('visual truth')
  for (const key of ['expectedForms', 'expectedActions', 'expectedEffects']) {
    const extractedKey = key.replace('expected', 'extracted')
    if (JSON.stringify(truth.completeness[key]) !== JSON.stringify(truth.completeness[extractedKey])) errors.push(`completeness.${key}`)
  }
  const expected = JSON.stringify(contractIds)
  for (const key of ['declaredContractIds', 'manifestContractIds', 'p1rContractIds']) if (JSON.stringify(truth.completeness[key]) !== expected) errors.push(`completeness.${key}`)
  if (truth.completeness.unresolved.length !== 0 || JSON.stringify(truth.p1rAcceptance.contractIds) !== expected) errors.push('P1R closure')
  if (truth.contractMatrix.some((item) => !item.modernOwner || !item.status || !item.verification)) errors.push('contract consumer matrix')
  if (truth.p1rAcceptance.acceptanceMatrix.some((item) => !item.expectedFields.length || !item.controlledScenarios.length || !item.traceFields.includes('hpAfter') || !item.semanticAssertions.length)) errors.push('field-level acceptance')
  const ranges = truth.forms.map(({ attackRange }) => attackRange)
  if (JSON.stringify(ranges) !== JSON.stringify([40, 70, 150, 150])) errors.push('normal attack ranges')
  const horse4 = truth.forms.find(({ id }) => id === 'horse4')
  if (horse4.actions.tmaoyi.emitTiming.bodySequence !== 3 || horse4.actions.tmaoyi.emitTiming.holdTick !== 10) errors.push('tmaoyi emit timing')
  if (horse4.special.tmaoyi.explosion.delay !== 'bd learned => 1 second; otherwise immediate') errors.push('tmaoyi explosion branch')
  if (!truth.modernConsumers.some(({ contract, status }) => contract === 'runtime.normal-roll' && status === 'gap')) errors.push('modern gap matrix')
  if (errors.length) throw new Error(`pet horse family truth invalid: ${errors.join(', ')}`)
}

async function main() {
  const truth = await buildTruth()
  await validate(truth)
  if (process.argv.includes('--self-test')) {
    for (const mutation of [
      (copy) => { copy.forms.find(({ id }) => id === 'horse3').attackRange = 70 },
      (copy) => { copy.forms.find(({ id }) => id === 'horse4').actions.tmaoyi.emitTiming.holdTick = 9 },
      (copy) => { copy.p1rAcceptance.acceptanceMatrix.find(({ id }) => id === 'runtime.damage-pipeline').traceFields = [] },
    ]) {
      const mutated = structuredClone(truth)
      mutation(mutated)
      let rejected = false
      try { await validate(mutated) } catch { rejected = true }
      if (!rejected) throw new Error('mutation self-test failed to reject a critical horse contract change')
    }
    console.log('pet horse family schema and critical-field mutation self-test passed')
    return
  }
  const serialized = `${JSON.stringify(truth, null, 2)}\n`
  if (process.argv.includes('--check')) {
    const existing = await readFile(outputPath, 'utf8')
    if (existing !== serialized) throw new Error('pet horse family truth is stale; run npm run generate:pet-horse-family-truth')
    console.log(`pet horse family truth verified: ${contractIds.length} contracts, 4 forms, 0 unresolved`)
    return
  }
  await writeFile(outputPath, serialized)
  console.log(`wrote ${path.relative(repoRoot, outputPath)}`)
}

await main()
