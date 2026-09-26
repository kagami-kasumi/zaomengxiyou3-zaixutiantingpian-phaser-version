import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { recommendation, routes, run, validate } from './check-harness.mjs';

function fixture() {
  const board = '## 当前推荐\n\nPLACEHOLDER\n\n## 待完成任务\n\n| TASK-SLICE-001 | Ready | LINE-ONE |';
  return {
    'AGENTS.md': 'compact 后复核当前合同与改动，继续原 task；次数不触发交接。',
    ...routes,
    'docs/workflow/code-quality-gates.md': 'Compaction is not a stopping condition.',
    'docs/workflow/task-generation.md': '按交付边界拆分。',
    'docs/tasks/task-board.md': board.replace('PLACEHOLDER', recommendation(board)),
    'docs/tasks/feature-lines.md': '| LINE-ONE | Active | scope | TASK-SLICE-001 |',
    'docs/tasks/execution-queue.md': '## 活跃治理执行项\n\n当前为空。',
    'package.json': JSON.stringify({ scripts: {
      'check:harness': 'node --test tools/check-harness.test.mjs && node tools/check-harness.mjs && node tools/run-problem-audit.mjs --validate',
      'check:workflow': 'npm run check:harness && node tools/validate-workflow.mjs',
      'check:workflow:full': 'npm run check:workflow && node tools/validate-asset-annotations.mjs && npm run check:level-architecture',
      'check:all': 'npm run check:workflow:full && npm run check:structure && npm run check:code:full',
      'check:code:full': 'npm run check:ground-truth && npm run test:systems:full && npm run build',
      'test:systems:full': 'node tools/run-system-tests.mjs --full',
    } }),
  };
}

test('valid snapshot and a blocked same-line task are accepted', () => {
  assert.deepEqual(validate(fixture()), []);
  const data = fixture();
  data['docs/tasks/task-board.md'] = data['docs/tasks/task-board.md'].replaceAll('Ready', 'Blocked');
  assert.deepEqual(validate(data), []);
});

test('other same-line blocked tasks do not become extra execution owners', () => {
  const data = fixture();
  data['docs/tasks/task-board.md'] += '\n| TASK-SLICE-002 | Blocked | LINE-ONE |';
  assert.deepEqual(validate(data), []);
  data['docs/tasks/task-board.md'] = data['docs/tasks/task-board.md'].replaceAll('Ready', 'Blocked');
  assert.deepEqual(validate(data), []);
});

const cases = [
  ['full code silently downgraded', 'package.json', text => text.replace('npm run test:systems:full &&', 'npm run test:systems &&'), 'check:code:full'],
  ['full runner silently downgraded', 'package.json', text => text.replace('tools/run-system-tests.mjs --full', 'tools/run-system-tests.mjs --core'), 'test:systems:full'],
  ['quality gate compact conflict', 'docs/workflow/code-quality-gates.md', text => `${text}\nThe first compact is an overrun: finish only the current check.`, 'compact count'],
  ['task generation compact conflict', 'docs/workflow/task-generation.md', text => `${text}\n首次 compact 后必须拆分。`, 'compact count'],
  ['full workflow omitted', 'package.json', text => text.replace('npm run check:workflow:full &&', 'npm run check:workflow &&'), 'check:all'],
  ['duplicate workflow execution', 'package.json', text => text.replace('npm run check:workflow:full &&', 'npm run check:workflow && npm run check:workflow:full &&'), 'check:all'],
  ['stale recommendation', 'docs/tasks/task-board.md', text => text.replace('本节由', '唯一 Ready 仍为 211。\n本节由'), '当前推荐'],
  ['two Ready tasks', 'docs/tasks/task-board.md', text => `${text}\n| TASK-SLICE-002 | Ready | LINE-ONE |`, 'exactly one'],
  ['cross-line task', 'docs/tasks/task-board.md', text => text.replace('LINE-ONE', 'LINE-TWO'), 'belong'],
  ['stale active pointer', 'docs/tasks/feature-lines.md', text => text.replace('001', '002'), 'match board'],
  ['two governance owners', 'docs/tasks/execution-queue.md', text => `${text}\n| PG-001 | Ready |\n| PG-002 | Blocked |`, 'at most one'],
  ['old queue id', 'docs/tasks/execution-queue.md', text => `${text}\n旧 TASK-SLICE-001 已完成。`, 'retain game'],
  ['stricter client rule', 'CLAUDE.md', () => 'warning/error 必须先拆分。', 'delegate'],
  ['contradictory appended rule', 'CLAUDE.md', text => `${text}\nwarning/error 必须先拆分。`, 'delegate'],
  ['compact count limit', 'AGENTS.md', text => `${text}\n允许一次 compact。`, 'compact count'],
  ['first compact forced stop', 'AGENTS.md', text => `${text}\n首次 compact 后不得新增实现。`, 'compact count'],
  ['second compact forced handoff', 'CLAUDE.md', text => `${text}\n第二次 compact 强制交接。`, 'compact count'],
  ['lost full gate', 'package.json', text => text.replace('npm run check:level-architecture', ''), 'retain'],
];
test('repeated compaction allows continuing the same task', () => {
  const data = fixture();
  data['CLAUDE.md'] += '\n第二次 compact 后继续实现；复用已有检查点，保持原任务范围。';
  assert.deepEqual(validate(data), []);
});

for (const [name, file, mutate, expected] of cases) {
  test(`reject ${name}`, () => {
    const data = fixture();
    data[file] = mutate(data[file]);
    assert.ok(validate(data).some(error => error.includes(expected)));
  });
}

test('standalone generation needs no game source or assets, is idempotent and refuses invalid state', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'harness-test-'));
  try {
    const data = { ...fixture(), 'docs/workflow/README.md': '', 'docs/workflow/document-map.md': '',
      'docs/tasks/task-definitions/TASK-SLICE-001.md': '# Contract' };
    for (const [file, text] of Object.entries(data)) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
      writeFileSync(path.join(root, file), text);
    }
    const boardPath = path.join(root, 'docs/tasks/task-board.md');
    writeFileSync(boardPath, data['docs/tasks/task-board.md'].replace('本节由', '旧 Ready 211。\n本节由'));
    assert.throws(() => run(root), /当前推荐/);
    run(root, true);
    const first = readFileSync(boardPath, 'utf8');
    run(root, true);
    assert.equal(readFileSync(boardPath, 'utf8'), first);
    run(root);
    const invalid = `${first}\n| TASK-SLICE-002 | Ready | LINE-ONE |`;
    writeFileSync(boardPath, invalid);
    assert.throws(() => run(root, true), /exactly one/);
    assert.equal(readFileSync(boardPath, 'utf8'), invalid);
    writeFileSync(boardPath, first);
    writeFileSync(path.join(root, 'docs/workflow/README.md'), '[missing](missing.md)');
    assert.throws(() => run(root), /missing link/);
  } finally {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(root).startsWith('harness-test-'));
    rmSync(root, { recursive: true, force: true });
  }
});
