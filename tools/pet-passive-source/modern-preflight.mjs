/** Re-run the existing 96-case party diagnostic without rewriting historical evidence. */
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { build } from 'esbuild';
const root=path.resolve(import.meta.dirname,'../..');
const source=readFileSync(path.join(root,'tools/pet-monkey-horse-passive-preflight.ts'),'utf8');
const output='docs/tasks/evidence/TASK-SETTINGS-235/actual-party-preflight.json';
assert(source.includes('docs/tasks/evidence/TASK-SLICE-226/passive-party-preflight.json'));
const adapted="import { bodyGroundFixture } from './pet226-body/ground-fixture';\n"+source.replace('createSeedPetRoster }', 'createSeedPetRoster, getActivePet }').replace("new Function('model',", "new Function('getActivePet', 'options', 'model',").replace('    model, rosters, runtimes,', '    getActivePet, { legacyPetExperience: false }, model, rosters, runtimes,').replace('update({ targets: []', 'update({ groundEnvironmentFor: () => bodyGroundFixture(family, form, 250), targets: []');
const bundle=path.join(root,'.tmp/pet-passive-source/modern-preflight.mjs');
await build({stdin:{contents:adapted.replace('docs/tasks/evidence/TASK-SLICE-226/passive-party-preflight.json',output),
 resolveDir:path.join(root,'tools'),sourcefile:'pet-monkey-horse-passive-preflight.ts',loader:'ts'},
 bundle:true,platform:'node',format:'esm',outfile:bundle,logLevel:'silent'});
await import(pathToFileURL(bundle).href);
const report=JSON.parse(readFileSync(path.join(root,output),'utf8'));
assert.equal(report.rows.length,96);
assert(report.rows.every(row=>row.mpBefore===row.mpAfter));
report.fixtureAdaptations=['bind production getActivePet and current options.legacyPetExperience=false; verified body ground fixture; empty enemy world'];
report.diagnosticSourceSha256=createHash('sha256').update(source).digest('hex');
report.ownerSourceSha256=createHash('sha256').update(readFileSync(path.join(root,'src/scenes/HeroPartyRuntimeBridge.ts'))).digest('hex');
report.status='current-production-entry-gap-reproduced; not native oracle or modern acceptance';
writeFileSync(path.join(root,output),JSON.stringify(report,null,2)+'\n');
console.log('235:96 current party ready cases reproduced; no MP debit.');
