import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const validateOnly = process.argv.includes('--validate');

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) throw new Error(`Missing required file: ${relativePath}`);
  return readFileSync(absolutePath, 'utf8');
}

function section(markdown, heading) {
  const start = markdown.indexOf(`## ${heading}`);
  if (start === -1) return '';
  const next = markdown.indexOf('\n## ', start + 1);
  return next === -1 ? markdown.slice(start) : markdown.slice(start, next);
}

function activeProblemRows(problemGovernance) {
  return section(problemGovernance, '活跃问题索引')
    .split(/\r?\n/)
    .filter((line) => /^\|\s*PG-\d{3}\s/.test(line))
    .map((line) => {
      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
      const id = cells[0]?.match(/PG-\d{3}/)?.[0] ?? '';
      const record = cells[2]?.replaceAll('`', '') ?? '';
      return {
        id,
        status: cells[1] ?? '',
        record: `docs/workflow/${record}`,
      };
    });
}

function changedFiles() {
  const commands = [
    ['diff', '--name-only', '--diff-filter=ACMR'],
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
    ['ls-files', '--others', '--exclude-standard'],
  ];
  const results = new Set();
  for (const args of commands) {
    try {
      const output = execFileSync('git', args, {
        cwd: root,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      for (const line of output.split(/\r?\n/).map((value) => value.trim()).filter(Boolean)) {
        results.add(line.replaceAll('\\', '/'));
      }
    } catch {
      // A repository without HEAD may reject a diff command; the remaining sources still apply.
    }
  }
  return [...results].sort();
}

function auditContractExcerpt(problemText) {
  const feedback = section(problemText, '7. 适用触发与反馈记录');
  return feedback
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('|') && !line.startsWith('## 7.'))
    .slice(0, 12);
}

function validateContracts(problemGovernance, problemAudit, methodObservation, rows) {
  const errors = [];
  for (const requiredText of [
    '## 职责边界',
    '## 任务收尾审计',
    '## PG 归档评估',
    '## 集中审计记录',
    'MO-002',
    'npm run audit:problems',
  ]) {
    if (!problemAudit.includes(requiredText)) errors.push(`problem-audit.md must mention: ${requiredText}`);
  }
  for (const requiredText of ['problem-audit.md', 'npm run audit:problems']) {
    if (!problemGovernance.includes(requiredText)) errors.push(`problem-governance.md must mention: ${requiredText}`);
  }
  for (const requiredText of ['PG 关闭样本', '同一份证据']) {
    if (!methodObservation.includes(requiredText)) errors.push(`method-observation.md must mention: ${requiredText}`);
  }
  if (rows.length === 0) errors.push('problem-governance.md must contain at least one active PG record.');

  for (const row of rows) {
    if (!existsSync(path.join(root, row.record))) {
      errors.push(`${row.id} audit record is missing: ${row.record}`);
      continue;
    }
    const text = read(row.record);
    const contract = section(text, '7. 适用触发与反馈记录');
    if (!contract.includes('触发条件：')) errors.push(`${row.record} must declare 触发条件：.`);
    if (!contract.includes('效果检查：')) errors.push(`${row.record} must declare 效果检查：.`);
    if (!text.includes('## 6. 关闭标准')) errors.push(`${row.record} must retain its PG closing contract.`);
  }

  if (errors.length > 0) {
    console.error('Problem audit validation failed:');
    for (const message of errors) console.error(`- ${message}`);
    process.exit(1);
  }
  console.log(`Problem audit validation passed (${rows.length} active PG contracts).`);
}

const problemGovernance = read('docs/workflow/problem-governance.md');
const problemAudit = read('docs/workflow/problem-audit.md');
const methodObservation = read('docs/workflow/method-observation.md');
const rows = activeProblemRows(problemGovernance);

if (validateOnly) {
  validateContracts(problemGovernance, problemAudit, methodObservation, rows);
  process.exit(0);
}

console.log('Active PG audit packet');
console.log('Changed files:');
const changes = changedFiles();
if (changes.length === 0) console.log('- (no tracked or untracked workspace changes detected)');
for (const changedFile of changes) console.log(`- ${changedFile}`);

console.log('\nCandidate contracts (semantic trigger review is required):');
for (const row of rows) {
  console.log(`\n${row.id} | ${row.status} | ${row.record}`);
  const excerpt = auditContractExcerpt(read(row.record));
  for (const line of excerpt) console.log(`  ${line}`);
}

console.log('\nRecord one compact result in docs/workflow/problem-audit.md.');
console.log('A result may count as both an MO sample and a PG closing sample when the same evidence satisfies both contracts.');
console.log('Archive a PG in the same task only after every PG closing gate passes and no counterevidence remains.');
