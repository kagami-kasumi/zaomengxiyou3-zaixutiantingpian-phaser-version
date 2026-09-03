import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(repoRoot, 'docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json')
const schemaPath = path.join(repoRoot, 'docs/reverse-engineering/ground-truth/schema/pet-family-ground-truth.schema.json')
const baselineIndexPath = 'docs/tasks/evidence/TASK-SETTINGS-213/baseline-index.json'
const taskOutput = 'local-resources/regima/task-outputs/task-settings-213-pet-dragon-family'
const legacyRoot = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'

const sourceSpecs = [
  ['pet-dragon-1', `${legacyRoot}/export/pet/PetDragon1.as`, 'a1d9f80e9fc68784b6d4e63d43cd7703baf53ff4a46ed97eadd129f0e5f3998e'],
  ['pet-dragon-2', `${legacyRoot}/export/pet/PetDragon2.as`, 'c2eaf4311f7d612143397a8339b70e5e5c07119c19f54046fe398fa822354b8f'],
  ['pet-dragon-3', `${legacyRoot}/export/pet/PetDragon3.as`, '83b57dc5e73d355dfb67ca3d83c707e2d50319d524195ea4ef2645099bff25c7'],
  ['pet-dragon-4', `${legacyRoot}/export/pet/PetDragon4.as`, 'b34c427a30308ade65a1c3a7a9b2ae48da98f9dd76005f89325c1f259b0a2403'],
  ['base-pet', `${legacyRoot}/base/BasePet.as`, '29445a84725a475a69d4a779eec57d488a2288a306ae7555e8ce8f5abd622c42'],
  ['base-bullet', `${legacyRoot}/base/BaseBullet.as`, '70ebadf7758400170bca4991053954863d9872cd04ea293dd286534796e32e96'],
  ['follow-base-object-bullet', `${legacyRoot}/export/bullet/FollowBaseObjectBullet.as`, '9072022d9f95ebe7094abe3c7fd6fc340edfab28ac99d4fbc9de46fd3391dbf5'],
  ['special-effect-bullet', `${legacyRoot}/export/bullet/SpecialEffectBullet.as`, '863c64f210f4534c246e84d5bad9d799cd95809f29f982117a877f1dd88be3d0'],
  ['pet-info', `${legacyRoot}/petInfo/PetInfo.as`, 'b9bba062ed38c9e475bb4e1b29dfc2328ba968453ed8d2fe821a403eb4b4dbc2'],
  ['pet-swf', 'local-resources/regima/source/restored-swfs/assets/pet1.swf', '0699a5d3a49ea8024d3635b18c6349f5d7f7cf5f1db869dd18a0a5ee6de60644'],
  ['common-swf', 'local-resources/regima/source/restored-swfs/assets/StageCommon.swf', 'c6fc973d7d606ce4ea177b0ac075844c86a5ee7e493235fa812a029fbe4f29c9'],
]

const expectedForms = ['dragon1', 'dragon2', 'dragon3', 'dragon4']
const expectedActions = [
  'dragon1.normal', 'dragon1.fs',
  'dragon2.normal', 'dragon2.fs', 'dragon2.sdcc',
  'dragon3.normal', 'dragon3.fs', 'dragon3.sdcc', 'dragon3.ltwj',
  'dragon4.normal', 'dragon4.fs', 'dragon4.sdcc', 'dragon4.ltwj', 'dragon4.qlaoyi', 'dragon4.qlaoyi-ltwj-link',
]
const expectedEffects = [
  'PetDragon1Bullet1', 'PetDragon2Bullet1', 'PetDragon2Bullet2',
  'PetDragon3Bullet1', 'PetDragon3Bullet3', 'PetDragonBullet4', 'AoyiBuff', 'dragon-clone',
]

const contractIds = [
  'owner.body', 'owner.effects', 'owner.collision', 'visual.states', 'visual.baselines',
  'runtime.update-order', 'runtime.target-order', 'runtime.target-loss', 'runtime.follow-owner',
  'runtime.follow-target', 'runtime.warp', 'runtime.action-priority', 'runtime.normal-roll',
  'runtime.cooldown-order', 'runtime.hurt', 'runtime.death', 'runtime.destroy',
  'runtime.projectile-collision', 'runtime.attack-id-dedup', 'runtime.damage-pipeline',
  'runtime.heal-on-hit', 'runtime.clone-owner', 'runtime.p1-p2',
  'dragon1.normal', 'dragon1.fs', 'dragon1.fs-expiry-heal',
  'dragon2.normal', 'dragon2.fs', 'dragon2.sdcc',
  'dragon3.normal', 'dragon3.fs', 'dragon3.sdcc', 'dragon3.ltwj', 'dragon3.ltwj-nine-object-wave',
  'dragon4.normal', 'dragon4.fs', 'dragon4.sdcc', 'dragon4.ltwj', 'dragon4.qlaoyi',
  'dragon4.qlaoyi-trigger', 'dragon4.qlaoyi-clones', 'dragon4.qlaoyi-chain', 'dragon4.qlaoyi-no-mp-debit',
  'dragon4.cleanup',
]

const traceFields = [
  'frame', 'timeMs', 'ownerSlot', 'runtimeKey', 'petId', 'petForm', 'targetId',
  'petX', 'petY', 'targetX', 'targetY', 'targetDistance', 'action', 'actionToken',
  'projectileId', 'projectileAction', 'attackId', 'damageSourceId', 'hpBefore',
  'hpAfter', 'petHpBefore', 'petHpAfter', 'mpBefore', 'mpAfter', 'cloneId',
  'animationState', 'cleanupReason',
]

const locator = (file, lines) => ({ file: `${legacyRoot}/${file}`, lines })
const skill = (id, slot, initialCdSeconds, intervalCdSeconds, mpGate, mpDebit, hit, formula, release) => ({
  id, slot, initialCdSeconds, intervalCdSeconds, mpGate, mpDebit, hit, formula, release,
})

function action({ hit, bodyRow, bodyFrames, holds, emitTiming, projectile, projectileType = 'SpecialEffectBullet', emit, ...extra }) {
  return {
    hit, bodyRow, bodyFrames, holds, emitTiming, projectile, projectileType, emit,
    collision: projectile ? 'BaseBullet.checkAttack each active projectile step; complex target collision -> beMagicAttack' : 'not applicable',
    attackId: projectile ? 'snapshot source pet attack id at setRole; target beAttackIdArray de-duplicates the hit' : 'not applicable',
    ...extra,
  }
}

function commonForm(id, collision, actions, skills, special) {
  return { id, speed: 5, attackRate: 0.8, attackRange: 150, collision, skills, actions, ...(special ? { special } : {}) }
}

function expectedFieldsFor(id) {
  if (id.endsWith('.normal')) return ['attackRange', 'attackRate', 'actions.normal.emitTiming', 'actions.normal.projectile', 'actions.normal.emit']
  if (id.includes('qlaoyi')) return ['forms.dragon4.skills.qlaoyi', 'forms.dragon4.actions.qlaoyi', 'forms.dragon4.special.qlaoyi']
  if (/^dragon[1-4]\.(fs|sdcc|ltwj)$/.test(id)) return [`forms.${id.split('.')[0]}.skills.${id.split('.')[1]}`, `forms.${id.split('.')[0]}.actions.${id.split('.')[1]}`]
  if (id.startsWith('owner.')) return ['owners', 'sources']
  if (id.startsWith('visual.')) return ['visualTruth']
  return [`sharedRuntime.${id.replace('runtime.', '')}`]
}

function scenariosFor(id) {
  const form = id.match(/^dragon([1-4])\./)?.[1]
  if (id.endsWith('.normal')) return [`p1-dragon${form}-range-chain`, `p2-dragon${form}-range-chain`]
  if (id.includes('qlaoyi')) return ['p1-dragon4-qlaoyi-combinations', 'p2-dragon4-qlaoyi-combinations', 'formal-dragon4-four-clone-chain']
  if (form) return [`p1-dragon${form}-all-skills`, `p2-dragon${form}-all-skills`]
  if (id === 'runtime.p1-p2') return ['formal-dual-player-isolation', 'test-scene-dual-player-isolation']
  if (id.includes('destroy') || id.includes('death') || id.includes('clone-owner')) return ['death-replacement-rest-retry-return-reload']
  if (id.startsWith('visual.')) return ['all-dragon-key-ticks-940x590', 'formal-p1-p2-940x590']
  return ['shared-dragon-runtime-contract', 'formal-dragon-stage-path']
}

function assertionFor(id) {
  if (id.endsWith('.normal')) return 'No action or projectile before distance <= 150; distance decreases first, then one token-linked verified projectile reaches pet-source damage and cleanup.'
  if (id.includes('ltwj-nine')) return 'One cast creates 1 + 2 + 2 + 2 + 2 = 9 independently identified hit3 objects at 0/0.2/0.4/0.6/0.8 seconds.'
  if (id.includes('qlaoyi-no-mp')) return 'The 30 MP value gates qlaoyi but the original releSkill4 path does not debit MP; a debit mutation must fail.'
  if (id.includes('qlaoyi')) return 'Ticks 12/24/36/48, trigger object, optional clones, sdcc-before-ltwj chain, damage/heal, and cleanup match the frozen combination.'
  if (id === 'runtime.heal-on-hit') return 'Normal/sdcc uses floor(SHp*0.018 + atk*0.18 + level*2); each ltwj hit uses floor(SHp*0.028 + atk*0.09 + level*2), capped by SHp.'
  if (id === 'runtime.p1-p2') return 'Runtime, target, cooldown, clone, projectile, source, damage, heal, and cleanup state never cross player slots.'
  return 'The independent black-box trace equals the frozen expected field semantics and is observed by the declared consumer.'
}

function acceptanceMatrix() {
  return contractIds.map((id) => ({
    id,
    expectedFields: expectedFieldsFor(id),
    controlledScenarios: scenariosFor(id),
    traceFields,
    semanticAssertions: [assertionFor(id)],
    actualSource: 'black-box runtime trace; expected values are read only from task-settings-213.pet-dragon-family',
  }))
}

async function sha256(relativePath) {
  return createHash('sha256').update(await readFile(path.join(repoRoot, relativePath))).digest('hex')
}

async function assertSourceFacts() {
  const basePet = await readFile(path.join(repoRoot, `${legacyRoot}/base/BasePet.as`), 'utf8')
  for (const fact of ['protected var attackRate:Number = 0.8', 'protected var attackRange:uint = 150', 'Math.random() <= this.attackRate', 'Math.random() < 0.3', 'this.followTarget()', '>= 1000']) {
    if (!basePet.includes(fact)) throw new Error(`BasePet fact changed: ${fact}`)
  }
  const dragon3 = await readFile(path.join(repoRoot, `${legacyRoot}/export/pet/PetDragon3.as`), 'utf8')
  for (const fact of ['TweenMax.delayedCall(0.2', 'TweenMax.delayedCall(0.8', 'new SpecialEffectBullet("PetDragon3Bullet3")']) {
    if (!dragon3.includes(fact)) throw new Error(`PetDragon3 fact changed: ${fact}`)
  }
  const dragon4 = await readFile(path.join(repoRoot, `${legacyRoot}/export/pet/PetDragon4.as`), 'utf8')
  for (const fact of ['getCurFrameCount() == 48', 'getCurFrameCount() == 12', 'new FollowBaseObjectBullet("PetDragonBullet4")', 'this.isAoyi = true']) {
    if (!dragon4.includes(fact)) throw new Error(`PetDragon4 fact changed: ${fact}`)
  }
  if (/releSkill4\(\)[\s\S]{0,700}_petInfo\.setMp/u.test(dragon4)) throw new Error('PetDragon4 qlaoyi unexpectedly acquired an MP debit')
}

function visualObject(id, characterId, frameCount, symbolClass, kind, extra = {}) {
  return {
    id, parentId: null, depth: kind === 'body-atlas' ? 0 : 1, objectType: kind,
    sourceIdentity: { provenanceId: 'pet-swf', characterId, symbolClass, instanceName: null },
    frameCount, owner: 'assets/pet1.swf', recursiveDisplayList: 'FFDec selected sprite export resolves the visible child tree for every frame',
    ...extra,
  }
}

async function spriteFrames(characterId, symbol, sourcePrefix = 'pet1') {
  const directory = `${taskOutput}/${sourcePrefix}-svg/DefineSprite_${characterId}_${symbol}`
  const files = (await readdir(path.join(repoRoot, directory))).filter((name) => name.endsWith('.svg')).sort((a, b) => Number.parseInt(a) - Number.parseInt(b))
  return Promise.all(files.map(async (file) => {
    const value = await readFile(path.join(repoRoot, directory, file), 'utf8')
    const rootTag = value.match(/<svg\b[^>]*>/u)?.[0]
    const matrix = value.match(/<g transform="matrix\(([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+), ([-\d.]+)\)"/u)?.slice(1).map(Number)
    const width = Number(rootTag?.match(/width="([\d.]+)px"/u)?.[1])
    const height = Number(rootTag?.match(/height="([\d.]+)px"/u)?.[1])
    if (!matrix || !Number.isFinite(width) || !Number.isFinite(height)) throw new Error(`Cannot parse visual geometry: ${directory}/${file}`)
    return { frame: Number.parseInt(file), localMatrix: { a: matrix[0], b: matrix[1], c: matrix[2], d: matrix[3], tx: matrix[4], ty: matrix[5] }, registrationPoint: { x: matrix[4], y: matrix[5] }, visibleBounds: { left: -matrix[4], top: -matrix[5], width, height }, filters: [], mask: null, blendMode: 'normal' }
  }))
}

async function buildTruth() {
  await assertSourceFacts()
  const sources = []
  for (const [id, file, expectedSha256] of sourceSpecs) {
    const actualSha256 = await sha256(file)
    if (actualSha256 !== expectedSha256) throw new Error(`${id} source hash changed: ${actualSha256}`)
    sources.push({ id, file, sha256: actualSha256 })
  }
  const baselineIndex = JSON.parse(await readFile(path.join(repoRoot, baselineIndexPath), 'utf8'))
  const baselineIndexSha256 = await sha256(baselineIndexPath)
  const effects = [
    [542, 'PetDragon1Bullet1', 11], [547, 'PetDragon2Bullet1', 15], [563, 'PetDragon2Bullet2', 30],
    [572, 'PetDragon3Bullet1', 21], [603, 'PetDragon3Bullet3', 10], [539, 'PetDragonBullet4', 48],
  ]
  const displayObjects = [
    visualObject('dragon1-body', 9, 5, 'PetDragonBmd1', 'body-atlas', { cell: { width: 150, height: 150 }, offset: { x: 1, y: -5 } }),
    visualObject('dragon2-body', 13, 7, 'PetDragonBmd2', 'body-atlas', { cell: { width: 200, height: 200 }, offset: { x: 1, y: -5 } }),
    visualObject('dragon3-body', 16, 8, 'PetDragonBmd3', 'body-atlas', { cell: { width: 250, height: 250 }, offset: { x: 1, y: -15 } }),
    visualObject('dragon4-body', 23, 10, 'PetDragonBmd4', 'body-atlas', { cell: { width: 300, height: 250 }, offset: { x: 31, y: -25 } }),
  ]
  for (const [characterId, symbol, frameCount] of effects) {
    const frames = await spriteFrames(characterId, symbol)
    if (frames.length !== frameCount) throw new Error(`${symbol} frame count changed: ${frames.length}`)
    displayObjects.push(visualObject(symbol, characterId, frameCount, symbol, 'movie-clip', { frames }))
  }
  displayObjects.push({
    ...visualObject('AoyiBuff', 120, 14, 'AoyiBuff', 'movie-clip', { frames: await spriteFrames(120, 'AoyiBuff', 'common') }),
    owner: 'assets/StageCommon.swf', depth: 1,
  })

  const normal = (projectile, row, frames, holds, sequence, count, emit) => action({ hit: 'hit1', bodyRow: row, bodyFrames: frames, holds, emitTiming: { sequence, holdTick: count, clock: 'BaseBitmapDataClip host tick' }, projectile, emit, visibleFrames: displayObjects.find(({ id }) => id === projectile)?.frameCount, destroy: 'last visual frame' })
  const clone = (form, row, frames, holds, alpha, seconds) => action({ hit: 'hit2', bodyRow: row, bodyFrames: frames, holds, emitTiming: { sequence: frames - 1, holdTick: 2, clock: 'BaseBitmapDataClip host tick' }, projectile: null, emit: { x: 'pet.x + deterministic fixture for random(-150..150)', y: -50 }, cloneForm: form, cloneAlpha: alpha, durationSeconds: seconds, owner: 'same sourceRole; private fenshenArray' })
  const sdcc = (row, frames, holds) => action({ hit: 'hit3 body -> hit2 projectile', bodyRow: row, bodyFrames: frames, holds, emitTiming: { sequence: 0, holdTick: 24, clock: 'BaseBitmapDataClip host tick' }, projectile: 'PetDragon2Bullet2', projectileType: 'FollowBaseObjectBullet', emit: { x: 0, y: 10 }, followsPet: true, visibleFrames: 30, destroy: 'last visual frame' })
  const ltwj = (row, frames, holds) => action({ hit: 'hit4 body -> hit3 projectile', bodyRow: row, bodyFrames: frames, holds, emitTiming: { sequence: 2, holdTick: 20, clock: 'BaseBitmapDataClip host tick' }, projectile: 'PetDragon3Bullet3', emit: { x: 0, y: 40 }, visibleFrames: 10, waves: [{ delaySeconds: 0, offsets: [[0, 0]] }, { delaySeconds: 0.2, offsets: [[-150, -10], [90, -25]] }, { delaySeconds: 0.4, offsets: [[-90, -25], [150, -10]] }, { delaySeconds: 0.6, offsets: [[-270, -25], [210, -10]] }, { delaySeconds: 0.8, offsets: [[-210, -25], [270, -10]] }], projectileCount: 9, destroy: 'each object last visual frame' })
  const forms = [
    commonForm('dragon1', 'ObjectBaseSprite3', {
      normal: normal('PetDragon1Bullet1', 3, 4, [2, 2, 2, 10], 3, 10, { x: 'direction * 30', y: 0 }),
      fs: clone('dragon1', 4, 5, [2, 2, 2, 2, 10], 0.5, 10),
    }, [skill('fs', 1, 2.5, 10, 20, { amount: 20, lookupKey: 'fs' }, 'hit2', '0 direct damage; clone attacks independently; owner heals 3.6% SHp on timed expiry', 'learned && mp; target not required')]),
    commonForm('dragon2', 'ObjectBaseSprite4', {
      normal: normal('PetDragon2Bullet1', 4, 4, [2, 2, 2, 10], 3, 10, { x: 'direction * 30', y: 0 }),
      fs: clone('dragon2', 5, 5, [2, 2, 2, 2, 10], 0.5, 10),
      sdcc: sdcc(6, 1, [30]),
    }, [
      skill('fs', 1, 2.5, 10, 20, { amount: 20, lookupKey: 'fs' }, 'hit2', '0 direct damage; 10-second clone', 'learned && mp; target not required'),
      skill('sdcc', 2, 3, 3.6, 20, { amount: 20, lookupKey: 'sp', numericEquivalent: true }, 'hit3/hit2', '(0.03*SHp + 3*atk)*1.05 + magicAdd, then crit and GXP', 'learned && mp && targetDistance <= 300'),
    ]),
    commonForm('dragon3', 'ObjectBaseSprite4', {
      normal: normal('PetDragon3Bullet1', 4, 6, [2, 2, 7, 2, 2, 10], 2, 7, { x: 'direction * 30', y: 0 }),
      fs: clone('dragon3', 5, 5, [2, 2, 2, 2, 10], 0.5, 10),
      sdcc: sdcc(6, 1, [30]),
      ltwj: ltwj(7, 3, [2, 2, 30]),
    }, [
      skill('fs', 1, 2.5, 10, 20, { amount: 20, lookupKey: 'sp', numericEquivalent: true }, 'hit2', '0 direct damage; 10-second clone', 'learned && mp; target not required'),
      skill('sdcc', 2, 3, 3.6, 20, { amount: 20, lookupKey: 'sp', numericEquivalent: true }, 'hit3/hit2', '(0.03*SHp + 3*atk)*1.05 + magicAdd, then crit and GXP', 'learned && mp && targetDistance <= 300'),
      skill('ltwj', 3, 5, 5, 20, { amount: 20, lookupKey: 'sp', numericEquivalent: true }, 'hit4/hit3', '(0.024*SHp + 7.2*atk)*1.05 + magicAdd, then crit and GXP per object', 'learned && mp && targetDistance <= 500'),
    ]),
    commonForm('dragon4', 'ObjectBaseSprite4', {
      normal: normal('PetDragon3Bullet1', 4, 6, [2, 2, 7, 2, 2, 10], 2, 7, { x: 'direction * 65', y: -15 }),
      fs: clone('dragon4', 5, 5, [2, 2, 2, 2, 10], 0.6, 12),
      sdcc: sdcc(6, 1, [30]),
      ltwj: ltwj(7, 3, [2, 2, 30]),
      qlaoyi: action({ hit: 'hit5 body; hit4 trigger', bodyRow: 8, bodyFrames: 1, holds: [48], emitTiming: { cloneTicks: [12, 24, 36, 48], triggerTick: 48, clock: 'BaseBitmapDataClip host tick' }, projectile: 'PetDragonBullet4', projectileType: 'FollowBaseObjectBullet', emit: { x: 0, y: 0 }, visibleFrames: 48, followsPet: true, triggerDamage: 'hit4 reuses ltwj formula * hurtBaseEffectRate; setHurtCanCutDownEffect(false)', destroy: 'last visual frame' }),
      'qlaoyi-ltwj-link': action({ hit: 'hit6 -> free ltwj', bodyRow: 9, bodyFrames: 2, holds: [2, 40], emitTiming: { sequence: 1, transition: 'releSkill3WithoutMana', clock: 'BaseBitmapDataClip host tick / standInObj early release' }, projectile: 'PetDragon3Bullet3', emit: { x: 0, y: 40 }, projectileCount: 9 }),
    }, [
      skill('fs', 1, 2.5, 10, 20, { amount: 20, lookupKey: 'fs' }, 'hit2', '0 direct damage; 12-second stronger clone copies skills', 'learned && mp && target'),
      skill('sdcc', 2, 3, 3.6, 20, { amount: 20, lookupKey: 'sdcc' }, 'hit3/hit2', 'dragon3 sdcc * hurtBaseEffectRate', 'learned && mp && targetDistance <= 180'),
      skill('ltwj', 3, 5, 5, 20, { amount: 20, lookupKey: 'ltwj' }, 'hit4/hit3', 'dragon3 ltwj * hurtBaseEffectRate per object', 'learned && mp && targetDistance <= 220'),
      skill('qlaoyi', 4, 15, 24, 30, { amount: 0, lookupKey: null, originalQuirk: 'gate-only; releSkill4 has no MP debit' }, 'hit5/hit4', 'body hit5=0; tick-48 trigger uses ltwj hit4 formula; optional clone skill chains', 'learned && mp >= 30 && targetDistance <= 200'),
    ], {
      qlaoyi: {
        bodyTicks: 48,
        aoyiBuff: 'disabled FollowBaseObjectBullet(AoyiBuff), action null, owner-following',
        cloneTicks: [12, 24, 36, 48],
        cloneDirections: ['right', 'left', 'right', 'left'],
        cloneGate: 'fs learned',
        cloneStats: 'HP=currentHP*20, SHp=HP*20, MP=currentMP*99, SMp=MP*99; copies atk/def/crit/level/moveSpeed/name/skills; isFight=1',
        cloneDurationSeconds: 12,
        chain: 'each clone and the owner prefer free sdcc; after hit3 completes, free ltwj follows when learned. Without sdcc but with ltwj, hit6 bridges to free ltwj.',
        trigger: 'tick 48 creates PetDragonBullet4 hit4 regardless of fs; hit4 damage uses ltwj formula even though qlaoyi body damage is zero',
        noMpDebit: true,
      },
    }),
  ]

  const matrix = contractIds.map((id) => {
    if (id.startsWith('visual.')) return { id, modernOwner: 'future PetDragonAnimationAssets -> formal/TestScene dragon view', status: 'gap', verification: '214 consumes 213 visualTruth and 940x590 baselines' }
    if (id.startsWith('owner.')) return { id, modernOwner: 'AssetManifest / future formal dragon view', status: 'partial', verification: '214 source-owner mutation gate and load-precedence check' }
    if (id.startsWith('dragon')) return { id, modernOwner: 'future DragonPetBehavior + PetCombatRuntime', status: 'gap-or-placeholder', verification: `214 deterministic ${id} P1/P2 trace` }
    return { id, modernOwner: 'PetCombatRuntime + future DragonPetBehavior + public party/formal bridge', status: id.startsWith('runtime.') ? 'partial-or-gap' : 'gap', verification: `214 field-level ${id} assertion and formal runtime observation` }
  })
  const acceptance = acceptanceMatrix()
  return {
    schemaVersion: 1,
    truthId: 'task-settings-213.pet-dragon-family',
    status: 'verified',
    taskId: 'TASK-SETTINGS-213',
    sources: [...sources, { id: 'baseline-index', file: baselineIndexPath, sha256: baselineIndexSha256 }],
    visualTruth: {
      stage: baselineIndex.stage,
      baselineIndex: baselineIndexPath,
      baselineCount: baselineIndex.items.length,
      expectedBaselineIds: baselineIndex.expectedIds,
      extractedBaselineIds: baselineIndex.extractedIds,
      displayObjectCount: displayObjects.length,
      displayObjects,
      directions: ['left', 'right'],
      clocks: ['BaseBitmapDataClip host tick for body atlases', 'one stage tick per ordinary MovieClip frame', 'TweenMax seconds for delayed ltwj waves'],
      ownerPrecedence: 'dragon bodies and attack objects have one exact SymbolClass owner in assets/pet1.swf; collision and shared AoyiBuff come from already-loaded StageCommon.swf',
      filters: 'none on body/effects; clone alpha is 0.5 for forms 1..3 and 0.6 for form 4',
      masks: 'none in selected FFDec frame exports',
      unresolved: [],
    },
    owners: [
      { form: 'dragon1', bodyClass: 'PetDragonBmd1', bodyOwner: 'assets/pet1.swf', bodyCharacterId: 9, collisionClass: 'ObjectBaseSprite3', collisionCharacterId: 103 },
      { form: 'dragon2', bodyClass: 'PetDragonBmd2', bodyOwner: 'assets/pet1.swf', bodyCharacterId: 13, collisionClass: 'ObjectBaseSprite4', collisionCharacterId: 101 },
      { form: 'dragon3', bodyClass: 'PetDragonBmd3', bodyOwner: 'assets/pet1.swf', bodyCharacterId: 16, collisionClass: 'ObjectBaseSprite4', collisionCharacterId: 101 },
      { form: 'dragon4', bodyClass: 'PetDragonBmd4', bodyOwner: 'assets/pet1.swf', bodyCharacterId: 23, collisionClass: 'ObjectBaseSprite4', collisionCharacterId: 101 },
    ],
    sharedRuntime: {
      'update-order': ['private-projectile-step', 'passive', 'ai', 'passive-upgrade', 'cooldown-decrement', 'time-count', 'owner-warp', 'base-step'],
      'target-order': 'first gc.obbsiteArray entry within distance <= 1200; stable insertion/spawn order',
      'target-loss': 'dead or distance >= 1200 clears target without same-frame reselection',
      'follow-owner': 'without a target, once per frameClips: move toward owner only beyond distance 640, else wait',
      'follow-target': 'outside 150 attack range or failed second normal roll: face target and use shared movement',
      warp: 'distance from owner >= 1000 and neither attacking nor hurt: root becomes owner.x, owner.y - 30; no warp clip',
      'action-priority': ['skill1 fs', 'skill2 sdcc', 'skill3 ltwj', 'skill4 qlaoyi', 'once-per-second normal/follow branch'],
      'normal-roll': 'within attackRange=150: random <= 0.8 attacks; otherwise a new random < 0.3 waits; otherwise follows target',
      'cooldown-order': 'AI reads current CD first; positive active-pet cooldown slots decrement afterward',
      hurt: 'shared reduceHp selects hurt only for surviving attacks unless qlfj counter triggers; dragon adds no hurt-release override',
      death: 'HP <= 0 enters dead; body frame-over destroys the pet and decrements lifetime in single game',
      destroy: 'owner destroys private clones and bullets; clones fade/remove without clearing the sourceRole pet slot; repeated runtime cleanup must be idempotent',
      'projectile-collision': 'hero/pet bullets scan monsterArray.concat(likeMonsterArray); complex collision invokes beMagicAttack and optional hit callback',
      'attack-id-dedup': 'bullet snapshots source attackId at setRole; target beAttackIdArray rejects repeats until attackInterval rotates the bullet id',
      'damage-pipeline': 'source pet getRealPower(action) plus target defense/countHurt/reduceHp produces actual HP decrease; normal hit1 is physics, sdcc/ltwj hit2/hit3/hit4 use declared kinds',
      'heal-on-hit': 'normal and sdcc callbacks heal floor(SHp*0.018 + atk*0.18 + level*2); every ltwj object heals floor(SHp*0.028 + atk*0.09 + level*2)',
      'clone-owner': 'each clone owns its own attack ids/projectiles but remains private to the source pet fenshenArray and same sourceRole slot',
      'p1-p2': 'single-game or matching sourceRole.sid owns emits/network actions; clones and bullets retain source role identity and private lifecycle',
      locators: [
        locator('base/BasePet.as', '141-215,305-397,566-746,865-934,1009-1086,1150-1189'),
        locator('base/BaseBullet.as', '105-133,225-371,427-496,554-600'),
        locator('export/pet/PetDragon1.as', '21-472'), locator('export/pet/PetDragon2.as', '21-566'),
        locator('export/pet/PetDragon3.as', '21-696'), locator('export/pet/PetDragon4.as', '23-991'),
      ],
    },
    forms,
    collisionProfiles: [
      { class: 'ObjectBaseSprite3', characterId: 103, forms: ['dragon1'], width: 31.05, height: 29.95, registration: { x: 15.55, y: 15 }, source: 'assets/StageCommon.swf character 103', export: `${taskOutput}/collision-svg/DefineSprite_103_ObjectBaseSprite3/1.svg` },
      { class: 'ObjectBaseSprite4', characterId: 101, forms: ['dragon2', 'dragon3', 'dragon4'], width: 35, height: 69.95, registration: { x: 17.5, y: 35 }, source: 'assets/StageCommon.swf character 101', export: `${taskOutput}/collision-svg/DefineSprite_101_ObjectBaseSprite4/1.svg` },
    ],
    playerLifecycle: {
      sharedLogic: 'both slots must use the same BasePet-derived contract and one public PetCombatRuntime per slot',
      ownerPrecedence: 'pet1 owns every declared dragon body/effect; StageCommon owns collision; runtime identity is the active pet owned by its player slot',
      independentState: ['target', 'cooldowns', 'active clones', 'clone timers', 'qlaoyi isAoyi chain', 'active projectiles', 'delayed ltwj callbacks', 'damage/heal'],
      destruction: 'replacement, rest, retry, return, reload, and death clear only the matching slot runtime, clones, callbacks, effects, projectiles, and source snapshots',
    },
    modernConsumers: [
      { contract: 'owner.body', owner: 'AssetManifest', consumer: 'formal scene bundles', status: 'catalogued-not-rendered', note: 'symbol ids exist but there is no dragon body bridge' },
      { contract: 'runtime.update-order', owner: 'PetCombatRuntime', consumer: 'HeroPartyRuntimeBridge p1/p2 and TestScene bridge', status: 'implemented-shared' },
      { contract: 'runtime.action-priority', owner: 'createDefaultPetBehaviorRegistry', consumer: 'PetCombatRuntime', status: 'gap', note: 'only monkey and horse behavior families are registered' },
      { contract: 'runtime.normal-roll', owner: 'PetCombatRuntime', consumer: 'future DragonPetBehavior', status: 'gap', note: 'no DragonPetBehavior supplies attackRange/action semantics' },
      { contract: 'runtime.projectile-collision', owner: 'PetSystem requestPetDragon*', consumer: 'TestScenePetMagicBridge', status: 'legacy-placeholder', note: 'immediate request path is not action-token/hit-frame driven' },
      { contract: 'dragon3.ltwj-nine-object-wave', owner: 'PetTuning.dragon3LtwjProjectileCount', consumer: 'PetSystem', status: 'incorrect', note: 'modern placeholder count is 4; original count is 9' },
      { contract: 'dragon4.qlaoyi-no-mp-debit', owner: 'requestPetDragon4QlaoyiSkill', consumer: 'PetSystem', status: 'incorrect', note: 'modern path debits 30 MP; original uses 30 only as a gate' },
      { contract: 'runtime.damage-pipeline', owner: 'PetSystem/ProjectileSystem', consumer: 'TestScenePetMagicBridge', status: 'placeholder', note: 'formal dragon hit resolution is absent' },
      { contract: 'visual.states', owner: 'none', consumer: 'formal five stages and TestScene', status: 'gap', note: 'no dragon animation/view bridge consumes the restored states' },
      { contract: 'runtime.p1-p2', owner: 'HeroPartyRuntimeBridge petCombatRuntimes', consumer: 'formal five stages', status: 'partial', note: 'runtime slots exist but dragon Behavior, body/effects, projectile-source damage, heal, and clone lifecycle are not connected' },
    ],
    contractMatrix: matrix,
    p1rAcceptance: {
      taskId: 'TASK-SLICE-214', systemDesign: 'docs/architecture/system-designs/pet.md', systemDesignGate: 'P1G',
      requiredTruthId: 'task-settings-213.pet-dragon-family', contractIds, traceFields, acceptanceMatrix: acceptance,
      requiredScenarios: [
        'P1/P2 dragon1..4 start beyond 150, chase, enter range, emit the verified normal object, collide, decrease HP, heal the source pet, and clean up',
        'P1/P2 every inherited skill with exact priority, CD/MP/distance gates, body hold tick, projectile count, damage/heal, and cleanup',
        'dragon4 qlaoyi with no inherited skills, ltwj only, sdcc only, fs only, fs+ltwj, fs+sdcc, and fs+sdcc+ltwj; verify four clone ticks and gate-only MP',
        'range, verified hit timing, source owner, ltwj count, and qlaoyi MP-debit mutation-kill',
        'death, replacement, rest, retry, return, and reload with slot-isolated idempotent clone/projectile/callback cleanup',
        'TestScene and at least one formal 940x590 stage share runtime/projectile-source behavior with zero console warning/error',
      ],
    },
    completeness: {
      expectedForms, extractedForms: forms.map(({ id }) => id), expectedActions,
      extractedActions: forms.flatMap(({ id, actions }) => Object.keys(actions).map((name) => `${id}.${name}`)),
      expectedEffects, extractedEffects: ['PetDragon1Bullet1', 'PetDragon2Bullet1', 'PetDragon2Bullet2', 'PetDragon3Bullet1', 'PetDragon3Bullet3', 'PetDragonBullet4', 'AoyiBuff', 'dragon-clone'],
      declaredContractIds: contractIds, manifestContractIds: matrix.map(({ id }) => id), p1rContractIds: acceptance.map(({ id }) => id), unresolved: [],
    },
  }
}

async function validate(truth) {
  const errors = []
  const schema = JSON.parse(await readFile(schemaPath, 'utf8'))
  for (const key of schema.required) if (!(key in truth)) errors.push(`schema.required.${key}`)
  const allowed = new Set(Object.keys(schema.properties))
  for (const key of Object.keys(truth)) if (!allowed.has(key)) errors.push(`schema.additionalProperties.${key}`)
  if (truth.truthId !== 'task-settings-213.pet-dragon-family' || truth.taskId !== 'TASK-SETTINGS-213' || truth.status !== 'verified') errors.push('identity')
  if (truth.owners.length !== 4 || truth.forms.length !== 4 || truth.collisionProfiles.length !== 2) errors.push('cardinality')
  if (truth.visualTruth.baselineCount !== 111 || truth.visualTruth.displayObjectCount !== 11 || truth.visualTruth.unresolved.length !== 0) errors.push('visual truth')
  for (const key of ['expectedForms', 'expectedActions', 'expectedEffects']) {
    const extractedKey = key.replace('expected', 'extracted')
    if (JSON.stringify(truth.completeness[key]) !== JSON.stringify(truth.completeness[extractedKey])) errors.push(`completeness.${key}`)
  }
  const expected = JSON.stringify(contractIds)
  for (const key of ['declaredContractIds', 'manifestContractIds', 'p1rContractIds']) if (JSON.stringify(truth.completeness[key]) !== expected) errors.push(`completeness.${key}`)
  if (truth.completeness.unresolved.length !== 0 || JSON.stringify(truth.p1rAcceptance.contractIds) !== expected) errors.push('P1G closure')
  if (truth.contractMatrix.some((item) => !item.modernOwner || !item.status || !item.verification)) errors.push('contract consumer matrix')
  if (truth.p1rAcceptance.acceptanceMatrix.some((item) => !item.expectedFields.length || !item.controlledScenarios.length || !item.traceFields.includes('hpAfter') || !item.semanticAssertions.length)) errors.push('field-level acceptance')
  if (JSON.stringify(truth.forms.map(({ attackRange }) => attackRange)) !== JSON.stringify([150, 150, 150, 150])) errors.push('normal attack ranges')
  if (truth.forms.find(({ id }) => id === 'dragon3').actions.ltwj.projectileCount !== 9) errors.push('ltwj projectile count')
  const qlaoyi = truth.forms.find(({ id }) => id === 'dragon4')
  if (!qlaoyi.special.qlaoyi.noMpDebit || qlaoyi.skills.find(({ id }) => id === 'qlaoyi').mpDebit.amount !== 0) errors.push('qlaoyi gate-only MP')
  if (errors.length) throw new Error(`pet dragon family truth invalid: ${errors.join(', ')}`)
}

async function main() {
  const truth = await buildTruth()
  await validate(truth)
  if (process.argv.includes('--self-test')) {
    for (const mutation of [
      (copy) => { copy.forms.find(({ id }) => id === 'dragon2').attackRange = 300 },
      (copy) => { copy.forms.find(({ id }) => id === 'dragon3').actions.ltwj.projectileCount = 4 },
      (copy) => { copy.forms.find(({ id }) => id === 'dragon4').skills.find(({ id }) => id === 'qlaoyi').mpDebit.amount = 30 },
      (copy) => { copy.p1rAcceptance.acceptanceMatrix.find(({ id }) => id === 'runtime.damage-pipeline').traceFields = [] },
    ]) {
      const mutated = structuredClone(truth)
      mutation(mutated)
      let rejected = false
      try { await validate(mutated) } catch { rejected = true }
      if (!rejected) throw new Error('mutation self-test failed to reject a critical dragon contract change')
    }
    console.log('pet dragon family schema and range/count/MP/source-field mutation self-test passed')
    return
  }
  const serialized = `${JSON.stringify(truth, null, 2)}\n`
  if (process.argv.includes('--check')) {
    const existing = await readFile(outputPath, 'utf8')
    if (existing !== serialized) throw new Error('pet dragon family truth is stale; run npm run generate:pet-dragon-family-truth')
    console.log(`pet dragon family truth verified: ${contractIds.length} contracts, 4 forms, 111 baselines, 0 unresolved`)
    return
  }
  await writeFile(outputPath, serialized)
  console.log(`wrote ${path.relative(repoRoot, outputPath)}`)
}

await main()
