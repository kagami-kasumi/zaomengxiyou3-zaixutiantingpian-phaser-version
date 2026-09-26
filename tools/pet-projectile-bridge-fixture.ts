import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createPetWorldDelayBridge } from '../src/scenes/PetWorldDelayBridge';
import { createPetWorldDisplayBridge } from '../src/scenes/PetWorldDisplayBridge';
import { createPetProjectileCombatPort } from '../src/systems/PetProjectileCombatSystem';

// Execute the actual bridge function, including listener ordering and cleanup.
// Asset loading/readback is outside this explicit successful-hit fixture.
const ts: typeof import('typescript') = createRequire(import.meta.url)('typescript');
const source = readFileSync('src/scenes/PetProjectileCombatBridge.ts', 'utf8');
const tree = ts.createSourceFile('PetProjectileCombatBridge.ts', source, ts.ScriptTarget.Latest, true);
const declaration = tree.statements.filter(ts.isFunctionDeclaration).find(f => f.name?.text === 'createPetProjectileCombatBridge');
assert.ok(declaration);
const code = ts.transpileModule(declaration.getText(tree).replace(/^export /, ''),
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const excluded = () => { throw new Error('Asset loading/readback is outside paused-birth fixture'); };
export const createTestPetProjectileCombatBridge = new Function('createPetWorldDelayBridge', 'createPetWorldDisplayBridge',
  'createPetProjectileCombatPort', 'getPetDragonEffectFrame', 'ensureSceneAssetBundle', 'hasMonkeyHorseAssets', 'requireMonkeyHorseAssets',
  code + '\nreturn createPetProjectileCombatBridge;')(
  createPetWorldDelayBridge, createPetWorldDisplayBridge, createPetProjectileCombatPort, excluded, excluded, excluded, excluded,
) as typeof import('../src/scenes/PetProjectileCombatBridge').createPetProjectileCombatBridge;
