import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const manifest = JSON.parse(await readFile(path.join(root, 'docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json'), 'utf8'))
const evidence = await readFile(path.join(root, 'docs/reverse-engineering/evidence/TASK-SETTINGS-207-pet-monkey-family.md'), 'utf8')
const task208 = await readFile(path.join(root, 'docs/tasks/task-definitions/TASK-SLICE-208.md'), 'utf8')

function parseDeclaredSet(text, owner) {
  const match = text.match(/CONTRACT_SET:([^\r\n]+)/)
  if (!match) throw new Error(`${owner} is missing CONTRACT_SET`)
  const ids = match[1].trim().replace(/`+$/, '').split('|')
  if (new Set(ids).size !== ids.length) throw new Error(`${owner} CONTRACT_SET contains duplicates`)
  return ids
}

const sets = new Map([
  ['evidence', parseDeclaredSet(evidence, 'evidence')],
  ['manifest matrix', manifest.contractMatrix.map(item => item.id)],
  ['manifest completeness', manifest.completeness.manifestContractIds],
  ['P1R manifest', manifest.p1rAcceptance.contractIds],
  ['TASK-SLICE-208', parseDeclaredSet(task208, 'TASK-SLICE-208')]
])
const expected = JSON.stringify(sets.get('evidence'))
for (const [owner, ids] of sets) if (JSON.stringify(ids) !== expected) throw new Error(`${owner} contract set differs from evidence declaration`)
if (manifest.visualTruth.stateCount !== 626 || manifest.visualTruth.baselineCount !== 626 || manifest.visualTruth.unresolvedCount !== 0) throw new Error('visual baseline set is incomplete')
if (manifest.contractMatrix.some(item => !item.modernOwner || !item.status || !item.verification)) throw new Error('contract matrix has an unexplained consumer or verification route')
console.log(`pet monkey family handoff verified independently: ${sets.get('evidence').length} contracts across evidence, matrix, manifest and TASK-SLICE-208`)
