/** Read-only input applicability diagnostic. Exit 0 means reproduction, not gameplay acceptance. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';

const read = path => readFileSync(path, 'utf8');
const truthPath = 'docs/reverse-engineering/ground-truth/manifests/behavior/task-settings-230-monster-knockback.json';
const collisionPath = 'docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json';
const truth = JSON.parse(read(truthPath));
const collision = JSON.parse(read(collisionPath));
const sha = path => createHash('sha256').update(readFileSync(path)).digest('hex');
const sourceRoot = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts';
const basePath = `${sourceRoot}/base/BaseMonster.as`;
assert.match(read(basePath), /this\.colipse\.scaleX \*= 2;/);
assert.equal(truth.status, 'verified');
assert.equal(collision.status, 'verified');
const profiles = truth.monsterProfiles.map(profile => {
  assert.equal(sha(profile.path), profile.sha256);
  const source = read(profile.path);
  const runtime = collision.monsterMappings.find(row => row.monsterId === profile.id);
  assert(runtime);
  assert.equal(runtime.sourceSha256, profile.sha256);
  const trajectory = truth.motion.find(row => row.shape === profile.collider && row.mode === 'air'
    && row.direction === 1 && row.fps === 24);
  assert(trajectory);
  const gravity = source.match(/this\.graity = ([\d.]+);/);
  // Preserve every assignment: Monster9/10/19 branch on gc.curStage; this
  // diagnostic must not silently treat the first regex match as final value.
  const horizontalSpeedAssignments = [...source.matchAll(/this\.horizenSpeed = ([\d.]+);/g)]
    .map(match => ({ value: Number(match[1]), line: source.slice(0, match.index).split('\n').length }));
  return { monsterId: profile.id, source: profile.path, sha256: profile.sha256,
    explicitGravity: gravity ? Number(gravity[1]) : null,
    horizontalSpeedAssignments,
    sourceMotionId: trajectory.id, probeCollider: trajectory.collider, runtimeBounds: runtime.runtimeBounds,
    colliderMatches: trajectory.collider.width === runtime.runtimeBounds.width
      && trajectory.collider.height === runtime.runtimeBounds.height
      && trajectory.collider.x === runtime.runtimeBounds.left && trajectory.collider.y === runtime.runtimeBounds.top };
});
const mismatches = profiles.filter(row => !row.colliderMatches);
assert.deepEqual(mismatches.map(row => row.monsterId), [2, 3, 4, 5, 6, 7, 8, 9, 10, 16, 19]);
const flyer = profiles.find(row => row.monsterId === 30);
assert.equal(flyer.explicitGravity, 0);
assert.equal(flyer.colliderMatches, true); // .5 in subclass × 2 in base constructor.
assert.match(read('tools/monster-knockback-source/capture.py'), /graity:Number=1\.5/);
const trajectory = truth.motion.find(row => row.id === flyer.sourceMotionId);
assert(Math.abs(trajectory.states[1][3] - (-5 + 1.5) * .8) < 1e-12);
const report = {
  status: 'input-applicability-blocked',
  scope: 'Static original constructor facts plus existing native observations; no new native runtime or modern trajectory claim.',
  inputs: [truthPath, collisionPath, basePath, 'tools/monster-knockback-source/capture.py',
    'tools/monster-knockback-source/Probe.as'].map(path => ({ path, sha256: sha(path) })),
  profiles, colliderMismatchCount: mismatches.length,
  gravityCounterexample: { monsterId: 30, initialVy: -5, probeGravity: 1.5, constructorGravity: 0,
    observedProbeFirstVy: trajectory.states[1][3],
    sourceFormulaDerivedFirstVy: -4,
    derivation: 'BaseObject.move: vy += graity; BaseMonster.step hurt: vy *= .8; abs(vy)>4 false at -4.',
    evidenceLevel: 'Source-formula derivation only; actual constructor-profile native trajectory still required.' },
  retained: '230 controlled shared-method observations remain valid in their stated fixture scope; 217/218 spatial truth is not disproved.',
};
const output = 'docs/tasks/evidence/TASK-SLICE-236';
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/profile-preflight.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(`236 input diagnostic: ${mismatches.length}/12 collider profiles differ; Monster30 gravity differs. No implementation acceptance.`);
