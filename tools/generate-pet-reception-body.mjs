import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const sourcePath = 'docs/reverse-engineering/ground-truth/manifests/task-settings-254-pet-reception-behavior.json';
const raw = readFileSync(sourcePath);
const truth = JSON.parse(raw);
assert.equal(truth.status, 'verified');
assert.deepEqual(truth.unresolved, []);
assert.equal(truth.forms.length, 19);
const forms = Object.fromEntries(truth.forms.map(form => {
  const wait = /case "wait":([\s\S]*?)(?:case |default:)/.exec(form.setActionSource)?.[1];
  const waitRow = Number(/setFramePointY\((\d+)\)/.exec(wait ?? '')?.[1]);
  assert.equal(waitRow, 0, `${form.id}: unsupported wait entry`);
  const hit1 = /case "hit1":([\s\S]*?)(?:case |default:)/.exec(form.setActionSource)?.[1];
  const counterRow = Number(/setFramePointY\((\d+)\)/.exec(hit1 ?? '')?.[1]);
  assert.ok(Number.isInteger(counterRow) && hit1.includes(`if(_loc2_.y != ${counterRow})`),
    `${form.id}: unsupported counter entry`);
  const actions = Object.fromEntries(form.actions.map(action => {
    const guard = /if\((_loc2_\.x != 0 && )?_loc2_\.y != (\d+)\)/.exec(action.entrySource);
    assert.ok(guard, `${form.id}: unsupported row guard`);
    assert.equal(Number(guard[2]), action.row);
    assert.match(action.endSource, action.action === 'hurt' ? /this\.setStatic\(\);[\s\S]*this\.setAction\("wait"\)/ : /this\.destroy\(\)/);
    return [action.action, { row: action.row, requiresNonzeroColumn: !!guard[1],
      resetTigerCombo: action.entrySource.includes('this.aoyiStep = 0;'),
      resetMouseCombo: action.entrySource.includes('this._aoyiStep = 0;'),
      endPhoenixAoyi: action.entrySource.includes('this.doWhenAoyiOver();') }];
  }));
  const guardCases = truth.clock.filter(c => c.id.startsWith(`${form.id}:hit2:hurt:`));
  assert.ok(!guardCases.length || (guardCases.length === 3 && guardCases.every(c => c.ignored)));
  return [form.id, { cell: form.cell, owner: form.selectedOwner, waitRow, counterRow,
    counts: form.allFrameCounts, holds: form.allFrameStopCounts,
    ignoreHurtDuringHit2: guardCases.length > 0, actions }];
}));
const result = JSON.stringify({ truthId: truth.truthId,
  sourceSha256: createHash('sha256').update(raw).digest('hex'), forms }, null, 2) + '\n';
const output = 'src/assets/pet-reception-body.json';
if (process.argv.includes('--check')) assert.equal(readFileSync(output, 'utf8'), result);
else writeFileSync(output, result);
console.log(`Pet reception source data: 19 forms (${process.argv.includes('--check') ? 'checked' : 'generated'}).`);
