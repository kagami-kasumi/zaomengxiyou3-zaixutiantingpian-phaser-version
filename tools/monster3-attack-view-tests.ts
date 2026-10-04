import assert from 'node:assert/strict';
import { syncMonster3AttackViews, destroyMonster3AttackViews } from '../src/scenes/stage11/Monster3AttackView';
import { createMonster3AttackRuntime, stepMonster3AttackBody, destroyMonster3Attacks } from '../src/systems/Monster3AttackRuntime';

// Rendering-port contract only: native pixel equivalence belongs to the 248
// oracle and formal browser acceptance, not this deliberately minimal port.
let created = 0, destroyed = 0;
const scene: any = { add: { image: (x: number, y: number, key: string) => {
  created++;
  return { x, y, key, alpha: 0, flipX: true,
    setName() { return this; }, setOrigin() { return this; }, setDepth() { return this; },
    setTexture(value: string) { this.key = value; return this; },
    setPosition(x: number, y: number) { this.x = x; this.y = y; return this; },
    setFlipX(value: boolean) { this.flipX = value; return this; },
    setAlpha(value: number) { this.alpha = value; return this; },
    destroy() { destroyed++; },
  };
} } };
for (const action of ['hit1', 'hit2'] as const) for (const facingX of [-1, 1] as const) {
  const runtime = createMonster3AttackRuntime();
  const host = { id: 'source', parentId: 'world', x: 300, y: 200, state: action, facingX, attackSerial: 1 };
  const source = { boss: true, hit: 0, criticalPercent: 0, flower: false, magicDefenseReduction: 0, random: () => 0.97 };
  for (let i = 0; i < (action === 'hit1' ? 7 : 6); i++) stepMonster3AttackBody(runtime, host, false, source, i * 1000 / 30, 30, 0);
  const views = new Map();
  const before = created;
  syncMonster3AttackViews(scene, views, runtime);
  const image = views.get(runtime.attacks[0]!.id);
  const snapshot = JSON.stringify(runtime);
  for (let i = 0; i < 10; i++) syncMonster3AttackViews(scene, views, runtime);
  assert.equal(JSON.stringify(runtime), snapshot, 'paint must not mutate body, source, IDs, age or frame');
  assert.equal(created, before + 1, 'paint reuses the live object');
  assert.equal(views.get(runtime.attacks[0]!.id), image);
  assert.equal(image.flipX, false, 'native direction is already rasterized');
  assert.equal(image.alpha, 1, 'native child alpha is already rasterized');
  destroyMonster3Attacks(runtime);
  syncMonster3AttackViews(scene, views, runtime);
  assert.equal(views.size, 0);
  const destroyedBefore = destroyed;
  destroyMonster3AttackViews(views);
  assert.equal(destroyed, destroyedBefore, 'repeated teardown is idempotent');
}
assert.equal(created, 4); assert.equal(destroyed, 4);
console.log('Monster3 rendering port: both actions/directions, repeated paint immutability, object reuse and teardown passed.');
