import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(readFileSync(path.join(
  root,
  'docs/reverse-engineering/ground-truth/manifests/task-settings-201-pet-combat-hud-head.json',
), 'utf8'));
const outputDirectory = path.join(root, 'docs/tasks/evidence/TASK-SLICE-202');
const representatives = ['monkey2', 'horse4', 'ufo3', 'tigress4', 'turtle4', 'phoenix4', 'dragon4', 'rabbit4', 'mouse4'];

if (manifest.truthId !== 'task-settings-201.pet-combat-hud-head'
  || manifest.status !== 'verified'
  || manifest.completeness.unresolved.length > 0) {
  throw new Error('TASK-SETTINGS-201 head truth is not verified.');
}

const rows = representatives.map((petName) => {
  const state = manifest.states.find((candidate) => candidate.id === `${petName}-p1`);
  const object = manifest.displayObjects.find((candidate) =>
    candidate.id.startsWith(`pet-combat-hud-head.${petName}.character-`));
  const baseline = manifest.baselines.find((candidate) => candidate.id === state?.baselineId);
  const characterId = object?.sourceIdentity.characterId;
  if (!state || !object || !baseline || !characterId) throw new Error(`Missing ${petName} evidence.`);
  const baselineFile = path.join(root, baseline.path);
  const runtimeFile = path.join(root, `public/assets/ui/combat-hud/pet/heads/${characterId}.png`);
  const baselineBytes = readFileSync(baselineFile);
  const runtimeBytes = readFileSync(runtimeFile);
  const baselineHash = sha256(baselineBytes);
  const runtimeHash = sha256(runtimeBytes);
  if (baselineHash !== baseline.sha256 || runtimeHash !== baselineHash) {
    throw new Error(`${petName} runtime asset differs from its verified baseline.`);
  }
  return {
    petName,
    frame: state.frame,
    characterId,
    baselineHash,
    runtimeHash,
    width: baseline.width,
    height: baseline.height,
    crop: baseline.crop,
    dataUrl: `data:image/png;base64,${runtimeBytes.toString('base64')}`,
  };
});

mkdirSync(outputDirectory, { recursive: true });
writeFileSync(path.join(outputDirectory, 'representative-head-runtime-diff.json'), `${JSON.stringify({
  truthId: manifest.truthId,
  comparison: 'verified baseline bytes versus runtime bundle bytes',
  pixelDifference: 0,
  rows: rows.map(({ dataUrl: _, ...row }) => row),
}, null, 2)}\n`);

const rowHeight = 116;
const svgHeight = 58 + rows.length * rowHeight;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="${svgHeight}" viewBox="0 0 620 ${svgHeight}">
  <rect width="620" height="${svgHeight}" fill="#171b24"/>
  <style>text{font-family:Arial,sans-serif;fill:#eef2f8}.small{font-size:12px;fill:#aeb9ca}.label{font-size:15px;font-weight:bold}</style>
  <text x="18" y="26" class="label">TASK-SLICE-202 verified baseline / runtime / 50% overlay</text>
  <text x="18" y="45" class="small">Nine species representatives; runtime bytes equal the frame-selective original baseline (pixel diff 0).</text>
  ${rows.map((row, index) => {
    const y = 58 + index * rowHeight;
    return `<g transform="translate(0 ${y})">
      <text x="18" y="18" class="label">${row.petName} · frame ${row.frame} · child ${row.characterId}</text>
      <rect x="178" y="4" width="105" height="94" fill="#303746"/><image href="${row.dataUrl}" x="178" y="4" width="105" height="94"/>
      <rect x="301" y="4" width="105" height="94" fill="#303746"/><image href="${row.dataUrl}" x="301" y="4" width="105" height="94"/>
      <rect x="424" y="4" width="105" height="94" fill="#303746"/><image href="${row.dataUrl}" x="424" y="4" width="105" height="94" opacity="0.5"/><image href="${row.dataUrl}" x="424" y="4" width="105" height="94" opacity="0.5"/>
      <text x="196" y="112" class="small">original</text><text x="321" y="112" class="small">runtime</text><text x="448" y="112" class="small">overlay</text>
    </g>`;
  }).join('\n')}
</svg>\n`;
writeFileSync(path.join(outputDirectory, 'representative-head-runtime-comparison.svg'), svg);
console.log(`Generated ${rows.length} representative head comparisons with zero byte/pixel difference.`);

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}
