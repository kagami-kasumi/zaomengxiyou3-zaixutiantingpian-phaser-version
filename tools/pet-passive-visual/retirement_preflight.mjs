import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { transformSync } from 'esbuild';

// Execute the actual production adapter closure. View/Scene are explicit spies;
// this diagnoses ownership/destruction only, never pixels or complete gameplay.
const rows = [];
for (const family of ['Monkey', 'Horse']) {
  const file = `src/scenes/FormalPet${family}BodyBridge.ts`;
  const source = readFileSync(file, 'utf8');
  const name = `createFormalPet${family}BodyBridge`;
  const start = source.indexOf(`export function ${name}(`);
  assert(start >= 0);
  const code = transformSync(source.slice(start).replace('export function', 'function'), { loader: 'ts' }).code;
  for (const operation of ['rest', 'replace', 'exit']) {
    const roots = [];
    const makeView = (_scene, pet) => {
      const root = { destroyed: false, children: [{ name: 'buff_sxkb', destroyed: false }],
        destroy(recursive) { this.destroyed = true; if (recursive) this.children.forEach(c => c.destroyed = true); } };
      roots.push(root);
      return { root, petId: pet.id, form: pet.form };
    };
    const factory = new Function(`createPet${family}AnimationView`, `isSupportedPet${family}`,
      `syncPet${family}AnimationView`, `${code}\nreturn ${name};`)(makeView, () => true, () => {});
    const scene = { game: { events: { on() {}, off() {} } } };
    const bridge = factory(scene);
    const member = id => ({ slot: 'p1', pet: { id, form: 1 }, snapshot: { runtime: { x: 350, y: 350 }, animation: {} } });
    bridge.update([member('original')], [], 0);
    assert.equal(roots[0].destroyed, false);
    if (operation === 'exit') bridge.destroy();
    else bridge.update(operation === 'rest' ? [] : [member('replacement')], [], 0);
    assert.equal(roots[0].destroyed, true);
    assert.equal(roots[0].children[0].destroyed, true);
    rows.push({ family, operation, immediateRootDestroy: true, immediateAttachmentDestroy: true,
      source: file, sourceSha256: createHash('sha256').update(source).digest('hex') });
    bridge.destroy();
  }
}
const report = { status: 'diagnostic-confirmed', boundary: 'Actual adapter closures with Scene/view spies. The attachment is a marker, not a production six-effect renderer. Exit immediate cleanup is expected; rest/replacement cannot preserve a child fade through current destroy(true). No claim about body fade or complete source rest caller semantics.', rows };
const out = 'docs/tasks/evidence/TASK-SLICE-245';
mkdirSync(out, { recursive: true });
writeFileSync(`${out}/retirement-preflight.json`, JSON.stringify(report, null, 2) + '\n');
console.log(`245 retirement preflight: ${rows.length} actual adapter cases confirm synchronous recursive destruction.`);
