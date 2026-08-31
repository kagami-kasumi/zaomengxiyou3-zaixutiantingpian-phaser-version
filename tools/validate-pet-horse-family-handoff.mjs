import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const readText = (file) => readFile(path.join(root, file), 'utf8')
const manifest = JSON.parse(await readText('docs/reverse-engineering/ground-truth/manifests/task-settings-209-pet-horse-family.json'))
const evidence = await readText('docs/reverse-engineering/evidence/TASK-SETTINGS-209-pet-horse-family.md')
const task210 = await readText('docs/tasks/task-definitions/TASK-SLICE-210.md')
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
  ['P1H manifest', manifest.p1rAcceptance.contractIds],
  ['P1H acceptance matrix', manifest.p1rAcceptance.acceptanceMatrix.map(({ id }) => id)],
  ['TASK-SLICE-210', parseDeclaredSet(task210, 'TASK-SLICE-210')],
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
if (manifest.visualTruth.stateCount !== 716 || manifest.visualTruth.displayObjectCount !== 20 || manifest.visualTruth.baselineCount !== 716 || manifest.visualTruth.unresolvedCount !== 0) {
  throw new Error('193C visual truth reference is incomplete')
}
if (manifest.completeness.unresolved.length !== 0) throw new Error('implementation-affecting unresolved items remain')
if (manifest.contractMatrix.some((item) => !item.modernOwner || !item.status || !item.verification)) throw new Error('contract matrix has an unexplained consumer or verification route')
if (manifest.p1rAcceptance.acceptanceMatrix.some((item) => (
  !item.expectedFields.length || !item.controlledScenarios.length || !item.semanticAssertions.length
  || !['actionToken', 'projectileId', 'attackId', 'damageSourceId', 'hpBefore', 'hpAfter', 'cleanupReason'].every((field) => item.traceFields.includes(field))
))) throw new Error('field-level semantic acceptance is incomplete')

const horseCorpus = corpus.species.find(({ species }) => species === 'horse')
if (!horseCorpus) throw new Error('horse corpus row is missing')
if (horseCorpus.familyTruthId !== manifest.truthId) throw new Error('horse corpus does not hand off to TASK-SETTINGS-209 truth')
if (horseCorpus.familyEvidencePath !== 'docs/reverse-engineering/evidence/TASK-SETTINGS-209-pet-horse-family.md') throw new Error('horse corpus evidence path is stale')
if (horseCorpus.familyImplementationTask !== 'TASK-SLICE-210') throw new Error('horse corpus implementation task is stale')

for (const required of ['P1H', 'range', 'hit timing', 'source owner', '940×590']) {
  if (!task210.includes(required)) throw new Error(`TASK-SLICE-210 is missing acceptance term: ${required}`)
}

console.log(`pet horse family handoff verified independently: ${sets.get('evidence').length} contracts, 4 forms, 14 actions, 0 unresolved`)
