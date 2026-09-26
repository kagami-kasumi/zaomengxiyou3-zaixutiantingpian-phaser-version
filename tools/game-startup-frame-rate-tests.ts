import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { loadGlobalSettings, GlobalSettingsStorageKey, DefaultGlobalSettings,
  activateGlobalSettingsForTests } from '../src/systems/GlobalSettingsSystem';

// Execute the actual startup config while replacing scene constructors, not its fps expression.
const ts: typeof import('typescript') = createRequire(import.meta.url)('typescript');
const source = readFileSync('src/main.ts', 'utf8');
const tree = ts.createSourceFile('main.ts', source, ts.ScriptTarget.Latest, true);
const declaration = tree.statements.filter(ts.isVariableStatement)
  .flatMap(statement => [...statement.declarationList.declarations])
  .find(declaration => declaration.name.getText(tree) === 'gameConfig');
assert.ok(declaration?.initializer);
const scenes = tree.statements.filter(ts.isImportDeclaration).flatMap(statement => {
  const imports = statement.importClause?.namedBindings;
  return imports && ts.isNamedImports(imports)
    ? imports.elements.map(element => element.name.text).filter(name => name.endsWith('Scene')) : [];
});
const configCode = ts.transpileModule(`const config = ${declaration.initializer.getText(tree)};`,
  { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const evaluate = new Function('Phaser', 'window', 'loadGlobalSettings', ...scenes, configCode + '\nreturn config;');
function config(encoded: string | null) {
  return evaluate({ AUTO: 0, Scale: { FIT: 1, CENTER_BOTH: 2 } }, { localStorage: {
    getItem(key: string) { assert.equal(key, GlobalSettingsStorageKey); return encoded; },
    setItem() { throw new Error('Startup must not rewrite settings'); },
  } }, loadGlobalSettings, ...scenes.map(() => class {}));
}
for (const fps of [20, 24, 30]) {
  assert.equal(config(JSON.stringify({ ...DefaultGlobalSettings, frameRate: fps })).fps.target, fps);
}
assert.equal(config(null).fps.target, 30);
assert.equal(config('{').fps.target, 30);
assert.equal(config(JSON.stringify({ ...DefaultGlobalSettings, frameRate: 60 })).fps.target, 30);
activateGlobalSettingsForTests();
console.log('Actual startup config: persisted 20/24/30, default, corrupt and unsupported FPS passed; no settings writes.');
