import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-170b1-equipment-page.json';
const manifest = JSON.parse(readFileSync(path.join(root, manifestPath), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const sha256 = (relativePath) => createHash('sha256').update(readFileSync(path.join(root, relativePath))).digest('hex');

assert(manifest.truthId === 'task-settings-170b1.equipment-page', 'unexpected truthId');
assert(manifest.status === 'verified', 'equipment page truth must be verified');
assert(manifest.stage.width === 940 && manifest.stage.height === 590, 'stage must remain 940x590');
assert(manifest.states.length === 9, 'expected nine owner/page/selection/fashion/lifecycle states');
assert(manifest.displayObjects.length === 63, 'expected complete 63-object scoped display list');
assert(manifest.completeness.unresolved.length === 0, 'verified truth cannot retain unresolved entries');

const stateIds = new Set(manifest.states.map(({ id }) => id));
const objectIds = new Set(manifest.displayObjects.map(({ id }) => id));
assert(stateIds.size === manifest.states.length, 'duplicate state id');
assert(objectIds.size === manifest.displayObjects.length, 'duplicate display object id');
for (const required of ['equipment-page-root', 'inventory-root', 'hero-preview', 'weapon-slot', 'armor-slot', 'title-slot', 'equipment-operation-layer', 'item-operation-layer']) {
  assert(objectIds.has(required), `missing required display object ${required}`);
}
for (const item of manifest.displayObjects) {
  if (item.parentId !== null) assert(objectIds.has(item.parentId), `${item.id} has missing parent ${item.parentId}`);
  assert(item.placements.length === stateIds.size, `${item.id} must enumerate every state`);
  for (const placement of item.placements) assert(stateIds.has(placement.stateId), `${item.id} references unknown state ${placement.stateId}`);
}
for (const stateId of stateIds) {
  const actual = manifest.displayObjects.filter((item) => item.placements.find((placement) => placement.stateId === stateId)?.visible).length;
  assert(actual === manifest.completeness.expectedVisibleObjectCountByState[stateId], `${stateId} visible object count mismatch`);
}
for (const baseline of manifest.baselines) {
  assert(stateIds.has(baseline.stateId), `${baseline.id} references unknown state`);
  assert(sha256(baseline.path) === baseline.sha256, `${baseline.id} hash mismatch`);
  assert(baseline.width === 940 && baseline.height === 590, `${baseline.id} must use the original 940x590 crop`);
}
for (const provenance of manifest.provenance) assert(sha256(provenance.sourcePath) === provenance.sha256, `${provenance.id} hash mismatch`);

const closingVisible = manifest.displayObjects.filter((item) => item.placements.find((placement) => placement.stateId === 'page-closing')?.visible).map(({ id }) => id);
assert(!closingVisible.includes('inventory-root') && !closingVisible.includes('hero-preview'), 'closing state must remove dynamic children');
const selectedEquipment = manifest.displayObjects.find(({ id }) => id === 'equipment-operation-layer');
const selectedItem = manifest.displayObjects.find(({ id }) => id === 'item-operation-layer');
assert(selectedEquipment.placements.filter(({ visible }) => visible).map(({ stateId }) => stateId).join() === 'p1-equipment-selected', 'threebtn visibility drifted');
assert(selectedItem.placements.filter(({ visible }) => visible).map(({ stateId }) => stateId).join() === 'p1-item-selected', 'simplebtn visibility drifted');
const firstSlot = manifest.displayObjects.find(({ id }) => id === 'inventory-slot-00').placements[0];
const secondSlot = manifest.displayObjects.find(({ id }) => id === 'inventory-slot-01').placements[0];
const soulValue = manifest.displayObjects.find(({ id }) => id === 'soul-value');
assert(firstSlot.localMatrix.tx === 0 && firstSlot.localMatrix.ty === 38, 'first PackThings local matrix drifted');
assert(firstSlot.stageBounds.left === 516.2 && firstSlot.stageBounds.top === 152.35, 'first PackThings stage bounds drifted');
assert(secondSlot.localMatrix.tx === 61 && secondSlot.stageBounds.left === 577.2, 'nested 61px column composition drifted');
assert(selectedEquipment.placements[0].localMatrix.tx === 25 && selectedEquipment.placements[0].localMatrix.ty === 25, 'operation layer must remain local to PackThings');
assert(soulValue.sourceIdentity.characterId === 214 && soulValue.sourceIdentity.instanceName === 'txt_lh', 'soul field source identity drifted');
assert(soulValue.render.textStyle.fontFamily === 'FZCuYuan-M03', 'soul field must use the embedded original font');
assert(soulValue.render.textStyle.fontSizePx === 15 && soulValue.render.textStyle.color === '#ffffff', 'soul field size/color drifted');
assert(soulValue.render.textStyle.align === 'left', 'original txt_lh is left aligned');
assert(soulValue.render.textStyle.leftGutterPx === 2 && soulValue.render.textStyle.topGutterPx === 2, 'original txt_lh gutter projection drifted');
assert(soulValue.render.textStyle.useOutlines === true, 'original txt_lh outline mode drifted');

console.log(`Equipment page truth verified: ${manifest.states.length} states, ${manifest.displayObjects.length} objects, all hashes and parent/state counts match.`);
