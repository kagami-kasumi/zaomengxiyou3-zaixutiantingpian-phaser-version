import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const routes = {
  'CLAUDE.md': '结构检查与 warning/error 处理以 [AGENTS.md 必须遵守第 7 条](./AGENTS.md#必须遵守) 为准；先运行 `npm run check:structure`，不在客户端入口另设更严格的拆分条件。',
  'docs/workflow/agent-protocol.md': '- 结构检查与 warning/error 处理以 [AGENTS.md 必须遵守第 7 条](../../AGENTS.md#必须遵守) 为准；先运行 `npm run check:structure`，本协议不重复定义拆分条件。',
};

export function section(text, heading) {
  return text.match(new RegExp(`^## ${heading}\\r?\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'))?.[1].trim() ?? '';
}

export function rows(text, prefix) {
  return text.split(/\r?\n/).filter(line => line.startsWith(`| ${prefix}`))
    .map(line => line.split('|').slice(1, -1).map(cell => cell.trim()));
}

export function recommendation(board, featureLines = '') {
  const tasks = rows(board, 'TASK-');
  let current = tasks.filter(row => row[1] === 'Ready');
  if (current.length === 0) {
    const active = rows(featureLines, 'LINE-').find(row => row[1] === 'Active');
    current = tasks.filter(row => row[1] === 'Blocked' && (!active || active[3].includes(row[0])));
  }
  if (current.length !== 1) throw new Error('task-board must select exactly one Ready task or current Blocked task');
  const [id, status] = current[0];
  return `\`${id}\` 是当前 ${status} 游戏执行项。执行合同见 [定义](task-definitions/${id}.md)。\n\n本节由 \`npm run generate:harness\` 从下方状态表生成；历史事件见工作流治理日志。`;
}

export function validate(documents, { checkSnapshot = true } = {}) {
  const errors = [];
  const board = documents['docs/tasks/task-board.md'];
  const queue = documents['docs/tasks/execution-queue.md'];
  const lines = rows(documents['docs/tasks/feature-lines.md'], 'LINE-');
  const active = lines.filter(row => row[1] === 'Active');
  const tasks = rows(board, 'TASK-');
  const current = tasks.filter(row => ['Ready', 'Blocked'].includes(row[1]));
  try {
    const expected = recommendation(board, documents['docs/tasks/feature-lines.md']);
    if (checkSnapshot && section(board, '当前推荐') !== expected) errors.push('当前推荐 must match generated snapshot; run npm run generate:harness');
  } catch (error) { errors.push(error.message); }
  if (active.length !== 1) errors.push('feature-lines must have exactly one Active line');
  if (current.some(row => row[2] !== active[0]?.[0])) errors.push('current task must belong to Active line');
  const ready = current.filter(row => row[1] === 'Ready');
  const selected = ready.length ? ready : current.filter(row => active[0]?.[3].includes(row[0]));
  if (selected.length !== 1 || !active[0]?.[3].includes(selected[0][0])) errors.push('Active line current task must match board');
  const governance = rows(section(queue, '活跃治理执行项'), '').filter(row => row.some(cell => /PG-\d{3}/.test(cell)));
  if (governance.filter(row => row.some(cell => /^(Ready|Blocked)$/.test(cell))).length > 1) errors.push('queue must have at most one Ready/Blocked governance item');
  if (/TASK-(?:[A-Z]+-)?\d+/.test(queue)) errors.push('execution-queue must not retain game task ids');
  for (const [file, expected] of Object.entries(routes)) {
    const directives = documents[file].split(/\r?\n/).filter(line => /warning.*error|error.*warning/.test(line));
    // A post-change quality criterion may mention new warnings, but must not redefine pre-edit decisions.
    const decisions = directives.filter(line => /先|拆分|处理/.test(line));
    if (decisions.length !== 1 || decisions[0] !== expected) errors.push(`${file}: structure decisions must delegate to AGENTS rule 7`);
  }
  for (const file of ['AGENTS.md', 'CLAUDE.md', 'docs/workflow/agent-protocol.md']) {
    if (/优先\s*compact/.test(documents[file])) errors.push(`${file}: compact must lead to safe handoff, not continued implementation`);
  }
  const scripts = JSON.parse(documents['package.json']).scripts;
  if (scripts['check:harness'] !== 'node --test tools/check-harness.test.mjs && node tools/check-harness.mjs && node tools/run-problem-audit.mjs --validate') errors.push('check:harness must retain its isolated checks');
  if (!scripts['check:workflow']?.startsWith('npm run check:harness && node tools/validate-workflow.mjs &&')) errors.push('check:workflow must include harness and legacy validation');
  for (const gate of ['node tools/validate-asset-annotations.mjs', 'npm run check:level-architecture']) {
    if (!scripts['check:workflow']?.includes(gate)) errors.push(`check:workflow must retain ${gate}`);
  }
  return errors;
}

const files = ['AGENTS.md', 'CLAUDE.md', 'docs/workflow/agent-protocol.md', 'docs/workflow/README.md',
  'docs/workflow/document-map.md', 'docs/tasks/task-board.md', 'docs/tasks/execution-queue.md',
  'docs/tasks/feature-lines.md', 'package.json'];

export function run(root, write = false) {
  const documents = Object.fromEntries(files.map(file => [file, readFileSync(path.join(root, file), 'utf8')]));
  const errors = validate(documents, { checkSnapshot: !write });
  for (const [file, text] of Object.entries(documents)) {
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].split('#')[0];
      if (!target || /^[a-z]+:/i.test(target)) continue;
      if (!existsSync(path.resolve(root, path.dirname(file), target))) errors.push(`${file}: missing link ${target}`);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  if (write) {
    const file = 'docs/tasks/task-board.md';
    const updated = documents[file].replace(/(^## 当前推荐\r?\n)[\s\S]*?(?=^## )/m,
      `$1\n${recommendation(documents[file], documents['docs/tasks/feature-lines.md'])}\n\n`);
    writeFileSync(path.join(root, file), updated, 'utf8');
  }
  console.log(`Harness validation passed${write ? '; current recommendation generated' : ''}. No game source or asset corpus checks run.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { run(process.cwd(), process.argv.includes('--write')); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
