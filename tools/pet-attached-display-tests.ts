import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { PetAttachedDisplayLifecycle } from '../src/scenes/PetAttachedDisplayLifecycle';

class ObjectSpy extends EventEmitter {
  destroyed = false;
  destroy() { if (!this.destroyed) { this.destroyed = true; this.emit('destroy'); } }
}
class RootSpy extends ObjectSpy {
  x = 350; y = 350; alpha = 1; children: ObjectSpy[] = [];
  add(o: ObjectSpy) { this.children.push(o); }
  setAlpha(alpha: number) { this.alpha = alpha; }
  override destroy() { this.children.forEach(o => o.destroy()); super.destroy(); }
}
function fixture() {
  const scene = { game: { events: new EventEmitter() }, events: new EventEmitter() };
  const lifecycle = new PetAttachedDisplayLifecycle(scene as any);
  return { scene, lifecycle, tick: (delta: number) => scene.game.events.emit('prestep', 0, delta) };
}
const path = 'docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz';
const native = JSON.parse(gunzipSync(readFileSync(path)).toString());
const byId = new Map<string, any[]>();
for (const row of native.rows) {
  const list = byId.get(row.id) ?? []; list.push(row); byId.set(row.id, list);
}
const find = (node: any, type: string): any => node.type === type ? node
  : node.children.map((n: any) => find(n, type)).find(Boolean);
let comparisons = 0;
const reports: any[] = [];
for (const effect of ['sxkb', 'fsnl']) for (const owner of [1, 2]) for (const direction of [0, 1])
for (const scenario of ['cycle', 'host-destroy', 'effect-destroy', 'world-pause']) {
  const id = `${effect}-monkey1-p${owner}-d${direction}-${scenario}`;
  const rows = byId.get(id)!;
  assert(rows, id);
  const { scene, lifecycle, tick } = fixture();
  const root = new RootSpy(), body = new ObjectSpy(), image = new ObjectSpy();
  root.x = owner === 1 ? 350 : 550; root.add(body);
  lifecycle.register(id, root as any, body as any);
  let frame = 1;
  lifecycle.attach(id, effect, { object: image as any, display: elapsed => {
    frame = 1 + Math.floor(elapsed * 24 / 1000 + 1e-8);
    return frame < 100;
  } });
  for (const row of rows.filter((r: any) => r.phase !== 'added-before-step')) {
    if (row.tick > 1) tick(1000 / 24);
    if (row.tick === 3 && scenario === 'host-destroy') lifecycle.retire(root as any);
    // effect-destroy destroys only the numerical container; it does not hide
    // these two clips. Scene pause similarly must not stop the Game display.
    const expected = find(row.display, `buff_${effect}`);
    const actual = !image.destroyed;
    assert.equal(actual, !!expected, `${id}:${row.tick}:visible`);
    if (expected) assert.equal(frame, expected.frame, `${id}:${row.tick}:frame`);
    const sourceHost = row.display.children.find((c: any) => c.name === 'host');
    if (sourceHost) {
      assert.equal(root.alpha, sourceHost.alpha, `${id}:${row.tick}:alpha`);
      assert.equal(root.x, row.hostMatrix.x); assert.equal(root.y, row.hostMatrix.y);
    } else if (scenario === 'host-destroy') assert(root.destroyed);
    if (scenario === 'host-destroy' && row.tick >= 3) assert(body.destroyed);
    comparisons++;
  }
  scene.events.emit('shutdown'); lifecycle.destroy();
  assert.equal(scene.game.events.listenerCount('prestep'), 0);
  assert.equal(lifecycle.snapshot().length, 0);
  reports.push({ id, states: rows.length - 1 });
}
// Two identities, natural clip completion during retirement, and shutdown.
{
  const { lifecycle, tick, scene } = fixture();
  const roots = [new RootSpy(), new RootSpy()];
  roots.forEach((root, i) => {
    const body = new ObjectSpy(); root.add(body); lifecycle.register(`p${i}`, root as any, body as any);
    lifecycle.attach(`p${i}`, 'clip', { object: new ObjectSpy() as any, display: elapsed => elapsed < 990 });
  });
  tick(900); lifecycle.retire(roots[0] as any); tick(100);
  assert.equal(lifecycle.snapshot()[0]!.alpha, Math.floor(.81 * 256) / 256);
  assert.equal(lifecycle.snapshot()[1]!.alpha, 1);
  assert(!roots[0]!.destroyed, 'empty retiring root follows its original one-second tween');
  assert(lifecycle.snapshot().every(r => !r.attachments.length));
  tick(900); assert(roots[0]!.destroyed); assert(!roots[1]!.destroyed);
  scene.events.emit('shutdown'); assert(roots[1]!.destroyed);
  assert.equal(scene.game.events.listenerCount('prestep'), 0);
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-245A', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-245A/lifecycle.json', JSON.stringify({
  status: 'passed', boundary: 'Production lifecycle with explicit Scene/objects spies; original native frame/alpha/tree oracle. Actual adapters and renderer are checked separately.',
  comparisons, reports,
}, null, 2) + '\n');
console.log(`245A attached display: ${reports.length} native scenarios / ${comparisons} states, identity and cleanup passed.`);
