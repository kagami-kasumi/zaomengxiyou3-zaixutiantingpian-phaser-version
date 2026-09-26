import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const input = 'docs/reverse-engineering/ground-truth/manifests/behavior/task-settings-237-monster-knockback-profiles.json';
const bytes = readFileSync(input);
const truth = JSON.parse(bytes);
if (truth.status !== 'verified' || truth.unresolved.length) throw new Error('Unverified monster profiles');
const profiles = truth.profiles.filter(row => row.fps === 24).map(({ fps, ...row }) => row);
for (const row of truth.profiles) {
  const { fps, ...fields } = row;
  const reference = profiles.find(p => p.monsterId === row.monsterId && p.stage === row.stage && p.level === row.level);
  if (JSON.stringify(fields) !== JSON.stringify(reference)) throw new Error('Constructor fields unexpectedly depend on FPS');
}
const output = JSON.stringify({ truthId: truth.truthId,
  sourceSha256: createHash('sha256').update(bytes).digest('hex'), profiles }, null, 2) + '\n';
const dest = 'src/assets/monster-knockback-profiles.json';
if (process.argv.includes('--check')) {
  if (readFileSync(dest, 'utf8') !== output) throw new Error('Stale monster profiles');
} else writeFileSync(dest, output);
console.log(`Monster profiles: ${profiles.length} constructor contexts; FPS-independent fields only.`);
