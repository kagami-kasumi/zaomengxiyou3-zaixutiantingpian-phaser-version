import { rmSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import * as esbuild from 'esbuild';

const repoRoot = path.resolve(import.meta.dirname, '..');
const outDir = path.join(repoRoot, '.tmp', 'system-tests');
const requestedTests = process.argv.slice(2);
const bundledTests = requestedTests.length > 0
  ? requestedTests
  : [
      'system-tests',
      'level-lifecycle-tests',
      'level-result-tests',
      'crafting-tests',
      'stage11-resource-tests',
      'stage11-flow-tests',
      'stage12-resource-tests',
      'stage12-monster-visual-tests',
      'stage12-flow-tests',
      'stage12-traversal-tests',
      'stage12-fb-enter-tests',
      'stage13-resource-tests',
      'stage13-monster-visual-tests',
      'five-stage-monster-visual-regression-tests',
      'stage13-flow-tests',
      'stage13-traversal-tests',
      'stage21-tests',
      'stage22-tests',
      'stage1-combat-tests',
      'remote-normal-attack-tests',
      'stage1-hud-tests',
      'role1-combat-visual-tests',
      'role2-combat-visual-tests',
      'hero-combat-visual-coordinate-tests',
      'stage-feature-entry-tests',
      'save-slot-tests',
      'heaven-map-tests',
      'immortality-tests',
      'formal-shop-tests',
      'formal-settings-tests',
      'formal-task-tests',
      'feature-ui-host-tests',
      'dual-player-feature-save-tests',
      'party-save-tests',
      'save-schema-tests',
      'save-workshop-tests',
      'player-soul-system-tests',
      'save-party-flow-tests',
      'formal-inventory-tests',
      'equipment-tooltip-runtime-tests',
      'equipment-catalog-tests',
      'equipment-preview-catalog-tests',
      'equipment-workshop-transaction-closure-tests',
      'inventory-dynamic-ui-resource-tests',
      'formal-skill-tests',
      'formal-pet-tests',
      'formal-pet-journey-tests',
      'pet-monkey-family-runtime-tests',
      'formal-workshop-host-tests',
      'formal-workshop-inventory-grid-tests',
      'formal-workshop-native-left-page-tests',
      'formal-strengthening-tests',
      'formal-resolution-tests',
      'formal-making-tests',
      'formal-magic-weapon-tests',
      'formal-game-loop-journey-tests',
      'pre-stage23-save-journey-tests',
      'formal-party-runtime-tests',
      'hero-party-runtime-tests',
      'hero-progression-runtime-tests',
      'monster-runtime-tests',
      'asset-bundle-tests',
      'stage-asset-ownership-tests',
      'monster-asset-ownership-tests',
    ];

rmSync(outDir, { recursive: true, force: true });
await esbuild.build({
  entryPoints: bundledTests.map((name) => path.join(repoRoot, 'tools', `${name}.ts`)),
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: outDir,
  logLevel: 'silent',
});

for (const name of bundledTests) {
  await import(pathToFileURL(path.join(outDir, `${name}.js`)).href);
}
