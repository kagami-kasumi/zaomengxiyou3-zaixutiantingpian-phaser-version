import { readFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const readText = (file) => readFile(path.join(root, file), 'utf8')
const manifest = JSON.parse(await readText('docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json'))
const evidence = await readText('docs/reverse-engineering/evidence/TASK-SETTINGS-213-pet-dragon-family.md')
const task214 = await readText('docs/tasks/task-definitions/TASK-SLICE-214.md')
const baselineIndex = JSON.parse(await readText('docs/tasks/evidence/TASK-SETTINGS-213/baseline-index.json'))
const corpus = JSON.parse(await readText('docs/reverse-engineering/pet-animation-corpus.json'))

function parseDeclaredSet(text, owner) {
  const match = text.match(/CONTRACT_SET:([^\r\n`]+)/u)
  if (!match) throw new Error(`${owner} is missing CONTRACT_SET`)
  const ids = match[1].trim().split('|')
  if (new Set(ids).size !== ids.length) throw new Error(`${owner} CONTRACT_SET contains duplicates`)
  return ids
}

const sets = new Map([
  ['evidence', parseDeclaredSet(evidence, 'evidence')],
  ['manifest matrix', manifest.contractMatrix.map(({ id }) => id)],
  ['manifest completeness', manifest.completeness.manifestContractIds],
  ['P1G manifest', manifest.p1rAcceptance.contractIds],
  ['P1G acceptance matrix', manifest.p1rAcceptance.acceptanceMatrix.map(({ id }) => id)],
  ['TASK-SLICE-214', parseDeclaredSet(task214, 'TASK-SLICE-214')],
])
const expected = JSON.stringify(sets.get('evidence'))
for (const [owner, ids] of sets) if (JSON.stringify(ids) !== expected) throw new Error(`${owner} contract set differs from evidence declaration`)

for (const key of ['Forms', 'Actions', 'Effects']) {
  const expectedKey = `expected${key}`
  const extractedKey = `extracted${key}`
  if (JSON.stringify(manifest.completeness[expectedKey]) !== JSON.stringify(manifest.completeness[extractedKey])) {
    throw new Error(`${expectedKey} differs from ${extractedKey}`)
  }
}
if (manifest.visualTruth.baselineCount !== 111 || manifest.visualTruth.displayObjectCount !== 11 || manifest.visualTruth.unresolved.length !== 0) {
  throw new Error('dragon visual truth is incomplete')
}
if (JSON.stringify(baselineIndex.expectedIds) !== JSON.stringify(baselineIndex.extractedIds) || baselineIndex.items.length !== 111 || baselineIndex.unresolved.length !== 0) {
  throw new Error('dragon baseline set is incomplete')
}
if (manifest.completeness.unresolved.length !== 0) throw new Error('implementation-affecting unresolved items remain')
if (manifest.contractMatrix.some((item) => !item.modernOwner || !item.status || !item.verification)) throw new Error('contract matrix has an unexplained consumer or verification route')
if (manifest.p1rAcceptance.acceptanceMatrix.some((item) => (
  !item.expectedFields.length || !item.controlledScenarios.length || !item.semanticAssertions.length
  || !['actionToken', 'projectileId', 'attackId', 'damageSourceId', 'hpBefore', 'hpAfter', 'cleanupReason'].every((field) => item.traceFields.includes(field))
))) throw new Error('field-level semantic acceptance is incomplete')

if (manifest.forms.some(({ attackRange }) => attackRange !== 150)) throw new Error('one or more dragon normal attack ranges differ from 150')
if (manifest.forms.find(({ id }) => id === 'dragon3')?.actions.ltwj.projectileCount !== 9) throw new Error('dragon3 ltwj is not the verified nine-object wave')
const dragon4 = manifest.forms.find(({ id }) => id === 'dragon4')
if (!dragon4?.special.qlaoyi.noMpDebit || dragon4.skills.find(({ id }) => id === 'qlaoyi')?.mpDebit.amount !== 0) throw new Error('qlaoyi does not preserve gate-only MP semantics')
if (dragon4.actions.qlaoyi.emitTiming.cloneTicks.join(',') !== '12,24,36,48') throw new Error('qlaoyi clone ticks differ from evidence')

const dragonCorpus = corpus.species.find(({ species }) => species === 'dragon')
if (!dragonCorpus) throw new Error('dragon corpus row is missing')
if (dragonCorpus.familyTruthId !== manifest.truthId) throw new Error('dragon corpus does not hand off to TASK-SETTINGS-213 truth')
if (dragonCorpus.familyEvidencePath !== 'docs/reverse-engineering/evidence/TASK-SETTINGS-213-pet-dragon-family.md') throw new Error('dragon corpus evidence path is stale')
if (dragonCorpus.familyImplementationTask !== 'TASK-SLICE-214') throw new Error('dragon corpus implementation task is stale')

for (const required of ['P1G', 'range', 'hit', 'source', 'ltwj', 'qlaoyi', '940×590']) {
  if (!task214.includes(required)) throw new Error(`TASK-SLICE-214 is missing acceptance term: ${required}`)
}

console.log(`pet dragon family handoff verified independently: ${sets.get('evidence').length} contracts, 4 forms, 15 actions, 111 baselines, 0 unresolved`)
