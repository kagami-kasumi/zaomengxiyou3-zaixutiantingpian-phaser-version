import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const { build } = createRequire(import.meta.url)('esbuild') as typeof import('esbuild');

const sessionFile = 'src/systems/PetCombatEntitySession.ts';
const runtimeFile = 'src/systems/PetCombatRuntime.ts';
const contextFile = 'src/systems/PetCombatContext.ts';
const mutations = [
  { id: 'damage-owner', file: sessionFile,
    from: 'if (event.runtimeKey !== this.runtimeKey) continue;', to: 'if (false) continue;' },
  { id: 'animation-token', file: sessionFile,
    from: 'event.runtimeKey !== this.runtimeKey || event.actionToken !== this.actionToken',
    to: 'event.runtimeKey !== this.runtimeKey' },
  { id: 'child-step', file: runtimeFile,
    from: 'for (const child of this.childrenOf(key)) this.stepEntity(child, frame, eventsOnly);', to: 'void frame;' },
  { id: 'shared-nested-values', file: runtimeFile,
    from: 'structuredClone(request.pet)', to: 'request.pet' },
  { id: 'child-projectile-cleanup', file: sessionFile,
    from: '.filter(({ sourceId }) => sourceId !== this.pet.id)', to: '.filter(() => true)' },
  { id: 'stale-context', file: contextFile,
    from: 'if (session.released) throw', to: 'if (false) throw' },
  { id: 'cascade', file: sessionFile,
    from: 'this.ports.releaseChildren(reason);', to: 'void reason;' },
  { id: 'cross-player-key', file: runtimeFile,
    from: '${identity}:session:${this.instanceId}:${this.nextEntityId++}',
    to: '${identity}:session:shared:${this.nextEntityId++}' },
  { id: 'parent-death-child-events', file: sessionFile,
    from: 'this.ports.stepChildren(frame, true);', to: 'void frame;' },
  { id: 'failed-enter-rollback', file: runtimeFile,
    from: "this.releaseEntity(child, 'dismissed');", to: 'void child;' },
] as const;

const outputDirectory = path.resolve('.tmp/pet-session-mutations');
mkdirSync(outputDirectory, { recursive: true });
const results: Array<{ id: string; rejected: boolean; exitCode: number | null }> = [];
for (const mutation of mutations) {
  const original = readFileSync(mutation.file, 'utf8');
  assert.equal(original.split(mutation.from).length, 2, `${mutation.id}: source locator must be unique`);
  const mutatedFile = path.resolve(mutation.file);
  const result = await build({
    entryPoints: ['tools/pet-combat-session-tests.ts'], bundle: true, write: false,
    platform: 'node', format: 'esm', logLevel: 'silent',
    plugins: [{
      name: `pet-session-${mutation.id}`,
      setup(builder) {
        builder.onLoad({ filter: /PetCombat(EntitySession|Runtime|Context)\.ts$/ }, (args) => {
          if (args.path !== mutatedFile) return undefined;
          return { contents: original.replace(mutation.from, mutation.to), loader: 'ts' };
        });
      },
    }],
  });
  const executable = path.join(outputDirectory, `${mutation.id}.mjs`);
  writeFileSync(executable, result.outputFiles[0]!.text);
  const execution = spawnSync(process.execPath, [executable], { encoding: 'utf8', timeout: 20_000 });
  assert.equal(execution.error, undefined, `${mutation.id}: test process must actually execute`);
  const rejected = execution.status !== 0 && /AssertionError/u.test(execution.stderr);
  results.push({ id: mutation.id, rejected, exitCode: execution.status });
  assert.equal(rejected, true, `${mutation.id}: mutated implementation was not rejected by a contract assertion\n${execution.stderr}`);
}
writeFileSync(path.join(outputDirectory, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(`Pet entity session mutation-kill passed (${results.length} independent implementation mutations).`);
