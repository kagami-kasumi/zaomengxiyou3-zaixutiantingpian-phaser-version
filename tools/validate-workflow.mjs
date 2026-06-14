import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const files = {
  agents: 'AGENTS.md',
  outline: 'TASK_OUTLINE.md',
  board: 'docs/tasks/task-board.md',
  history: 'docs/tasks/task-history.md',
  taskGeneration: 'docs/workflow/task-generation.md',
  verticalSlices: 'docs/tasks/vertical-slices.md',
  mechanics: 'docs/reverse-engineering/mechanics-index.md',
  governanceLog: 'docs/workflow/governance-log.md',
  workflowReadme: 'docs/workflow/README.md',
  documentMap: 'docs/workflow/document-map.md',
  codeQualityGates: 'docs/workflow/code-quality-gates.md',
  srcBoundaries: 'docs/architecture/src-boundaries.md',
  glossary: 'docs/domain/glossary.md',
  languageProcess: 'docs/domain/ubiquitous-language-process.md',
  agentProtocol: 'docs/workflow/agent-protocol.md',
  structureCheck: 'tools/check-structure.mjs',
  packageJson: 'package.json',
  tsconfig: 'tsconfig.json',
  inputSystem: 'src/systems/InputSystem.ts',
  extractionReadme: 'extracted_flash/README_extract.md',
};

const errors = [];
const warnings = [];

const taskDefinitionFields = [
  '任务类型：',
  '目标机制/切片：',
  '输入资料：',
  '输出产物：',
  '完成定义：',
  '验收标准：',
  '禁止范围：',
  '状态更新：',
  '推荐后续任务：',
];

function error(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function filePath(relativePath) {
  return path.join(root, relativePath);
}

function read(relativePath) {
  const absolutePath = filePath(relativePath);
  if (!existsSync(absolutePath)) {
    error(`Missing required file: ${relativePath}`);
    return '';
  }
  return readFileSync(absolutePath, 'utf8');
}

function section(markdown, heading) {
  const start = markdown.indexOf(`## ${heading}`);
  if (start === -1) return '';
  const next = markdown.indexOf('\n## ', start + 1);
  return next === -1 ? markdown.slice(start) : markdown.slice(start, next);
}

function beforeSection(markdown, heading) {
  const start = markdown.indexOf(`## ${heading}`);
  return start === -1 ? markdown : markdown.slice(0, start);
}

function tableRows(markdown, prefixPattern) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => prefixPattern.test(line))
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()));
}

function taskDefinitions(markdown) {
  return [...markdown.matchAll(/^###\s+(TASK-(?:[A-Z]+-)?\d+[A-Z]?)/gm)].map((match) => match[1]);
}

function taskBlocks(markdown) {
  const matches = [...markdown.matchAll(/^###\s+(TASK-(?:[A-Z]+-)?\d+[A-Z]?)/gm)];
  return matches.map((match, index) => {
    const next = matches[index + 1]?.index ?? markdown.length;
    return {
      id: match[1],
      text: markdown.slice(match.index, next),
    };
  });
}

function duplicateIds(ids) {
  const seen = new Set();
  const duplicates = new Set();
  for (const id of ids) {
    if (seen.has(id)) duplicates.add(id);
    seen.add(id);
  }
  return [...duplicates];
}

function compareIdSets(label, rowIds, definitionIds) {
  const rowSet = new Set(rowIds);
  const definitionSet = new Set(definitionIds);
  const missingDefinitions = rowIds.filter((id) => !definitionSet.has(id));
  const missingRows = definitionIds.filter((id) => !rowSet.has(id));

  if (missingDefinitions.length > 0) {
    error(`${label}: task rows missing definitions: ${missingDefinitions.join(', ')}`);
  }
  if (missingRows.length > 0) {
    error(`${label}: definitions missing task rows: ${missingRows.join(', ')}`);
  }
}

function extractRefs(text, prefix) {
  const pattern = new RegExp(`${prefix}-\\d{3}`, 'g');
  return [...new Set(text.match(pattern) ?? [])];
}

function parseMechanics(markdown) {
  const overview = section(markdown, '总览');
  const rows = tableRows(overview, /^\|\s*M-\d{3}\s*\|/);
  const map = new Map();
  for (const row of rows) {
    const [id, name, reverseStatus, reproductionStatus] = row;
    map.set(id, { id, name, reverseStatus, reproductionStatus, row });
  }
  return map;
}

function parseTaskRows(markdown) {
  const taskSection = section(markdown, '待完成任务');
  return tableRows(taskSection, /^\|\s*TASK-/).map((row) => ({
    id: row[0],
    status: row[1],
    type: row[2],
    goal: row[3],
    targetRefs: row[4],
    output: row[5],
    next: row[6],
    row,
  }));
}

function parseGlossary(markdown) {
  const tableSection = section(markdown, '统一语言表');
  return tableRows(tableSection, /^\|\s*[^|-]/)
    .filter((row) => row.length >= 6 && row[0] !== '中文概念')
    .map((row) => ({
      concept: row[0],
      recommendedName: row[1].replaceAll('`', '').trim(),
      type: row[2],
      context: row[3],
      description: row[4],
      forbiddenAliases: row[5]
        .split(',')
        .map((alias) => alias.replaceAll('`', '').trim())
        .filter(Boolean),
    }));
}

function assertRequiredFiles() {
  for (const requiredPath of Object.values(files)) {
    if (!existsSync(filePath(requiredPath))) {
      error(`Missing required file: ${requiredPath}`);
    }
  }
  if (existsSync(filePath('docs/tasks/task-generation.md'))) {
    error('Old task generation path still exists: docs/tasks/task-generation.md');
  }
}

function checkBoardShape(board, taskRows, taskDefinitionIds, taskBlockList) {
  const rowIds = taskRows.map((row) => row.id);

  if (taskRows.length === 0) {
    error('task-board.md has no unfinished task rows.');
  }
  if (board.includes('TASK-DOCS-')) {
    error('task-board.md must not contain TASK-DOCS-* workflow tasks.');
  }
  if (board.includes('docs/tasks/task-generation.md')) {
    error('task-board.md references old path docs/tasks/task-generation.md.');
  }
  if (board.includes('## 已完成任务') || board.includes('## 执行记录')) {
    error('task-board.md should not contain completed-task sections or execution history.');
  }

  compareIdSets('task-board.md', rowIds, taskDefinitionIds);

  for (const id of duplicateIds(rowIds)) error(`task-board.md has duplicate task row: ${id}`);
  for (const id of duplicateIds(taskDefinitionIds)) error(`task-board.md has duplicate task definition: ${id}`);

  for (const row of taskRows) {
    if (row.status === 'Done') {
      error(`${row.id} is Done but still appears in task-board.md; move it to task-history.md.`);
    }
    if (row.id.startsWith('TASK-DOCS-')) {
      error(`${row.id} is a workflow task and must not appear in task-board.md.`);
    }
    if (extractRefs(row.targetRefs, 'M').length === 0 && extractRefs(row.targetRefs, 'VS').length === 0) {
      error(`${row.id} target refs must include at least one M-* or VS-* id.`);
    }
    if (row.status === 'Blocked' && !/阻塞[:：]/.test(row.next)) {
      error(`${row.id} is Blocked but its table next-step cell does not include an explicit 阻塞 reason.`);
    }
  }

  for (const block of taskBlockList) {
    for (const field of taskDefinitionFields) {
      if (!block.text.includes(field)) {
        error(`${block.id} definition is missing required field: ${field}`);
      }
    }
    const row = taskRows.find((candidate) => candidate.id === block.id);
    if (row?.status === 'Blocked' && !block.text.includes('阻塞原因：')) {
      error(`${block.id} is Blocked but its definition is missing 阻塞原因：`);
    }
  }
}

function checkRecommendations(board, taskRows) {
  const recommendationSection = section(board, '当前推荐');
  const recommendedIds = [
    ...new Set([...recommendationSection.matchAll(/`(TASK-(?:[A-Z]+-)?\d+[A-Z]?)`/g)].map((match) => match[1])),
  ];
  const readyIds = taskRows.filter((row) => row.status === 'Ready').map((row) => row.id);

  if (recommendedIds.length === 0) {
    error('task-board.md has no current recommended task ids.');
  }
  for (const id of recommendedIds) {
    const row = taskRows.find((candidate) => candidate.id === id);
    if (!row) {
      error(`Recommended task does not exist in task-board.md: ${id}`);
    } else if (row.status !== 'Ready') {
      error(`Recommended task is not Ready: ${id} is ${row.status}`);
    }
  }
  for (const id of readyIds) {
    if (!recommendedIds.includes(id)) {
      warn(`Ready task is not listed in 当前推荐: ${id}`);
    }
  }

  return recommendedIds;
}

function checkHistory(history, boardIds) {
  const historyTaskSection = section(history, '已完成任务');
  const historyDefinitionsOnly = beforeSection(section(history, '已完成任务定义'), '执行记录');
  const historyRows = tableRows(historyTaskSection, /^\|\s*TASK-/);
  const historyIds = historyRows.map((row) => row[0]);
  const historyDefinitionIds = taskDefinitions(historyDefinitionsOnly);

  compareIdSets('task-history.md', historyIds, historyDefinitionIds);

  for (const id of duplicateIds(historyIds)) error(`task-history.md has duplicate task row: ${id}`);
  for (const id of duplicateIds(historyDefinitionIds)) error(`task-history.md has duplicate task definition: ${id}`);
  for (const id of boardIds) {
    if (historyIds.includes(id)) {
      error(`Task appears in both board and history: ${id}`);
    }
  }

  return { historyRows, historyDefinitionIds };
}

function checkRefs(taskRows, mechanics, verticalSlices) {
  const mechanicIds = new Set(mechanics.keys());
  const sliceIds = new Set(extractRefs(verticalSlices, 'VS'));

  for (const row of taskRows) {
    for (const id of extractRefs(row.targetRefs, 'M')) {
      if (!mechanicIds.has(id)) {
        error(`${row.id} references missing mechanic id: ${id}`);
      }
    }
    for (const id of extractRefs(row.targetRefs, 'VS')) {
      if (!sliceIds.has(id)) {
        error(`${row.id} references missing vertical slice id: ${id}`);
      }
    }
  }
}

function checkReadyDependencies(taskRows, mechanics) {
  for (const row of taskRows) {
    if (row.status !== 'Ready') continue;
    if (row.type !== 'TASK-ARCH' && row.type !== 'TASK-SLICE') continue;

    for (const id of extractRefs(row.targetRefs, 'M')) {
      const mechanic = mechanics.get(id);
      if (!mechanic) continue;
      if (mechanic.reverseStatus === '未扒' || mechanic.reverseStatus === '暂缓') {
        error(`${row.id} is Ready but depends on ${id} ${mechanic.name}, whose reverse status is ${mechanic.reverseStatus}.`);
      } else if (mechanic.reverseStatus === '部分已扒') {
        warn(`${row.id} is Ready but depends on ${id} ${mechanic.name}, whose reverse status is only 部分已扒.`);
      }
    }
  }
}

function checkStartupRules(agents, outline) {
  if (!agents.includes('默认不要读取 `docs/tasks/task-history.md`')) {
    error('AGENTS.md must state that task-history.md is not read by default.');
  }
  const startupRule = agents.match(/1\.\s+先读[^\n]+/u)?.[0] ?? '';
  if (startupRule.includes('task-history.md')) {
    error('AGENTS.md startup rule must not require reading task-history.md.');
  }
  if (!outline.includes('默认不读') || !outline.includes('docs/tasks/task-history.md')) {
    error('TASK_OUTLINE.md should state that task-history.md is not read by default.');
  }
  if (!agents.includes('冷启动阅读分流')) {
    error('AGENTS.md should contain the cold-start reading decision table.');
  }
}

function checkUtf8ReadingRules(agents, claude, workflowReadme) {
  for (const [name, text] of [
    ['AGENTS.md', agents],
    ['CLAUDE.md', claude],
    ['docs/workflow/README.md', workflowReadme],
  ]) {
    if (!text.includes('Get-Content -Encoding UTF8 -LiteralPath')) {
      error(`${name} must require PowerShell UTF-8 reads with Get-Content -Encoding UTF8 -LiteralPath.`);
    }
  }

  if (!agents.includes('乱码') || !workflowReadme.includes('mojibake')) {
    error('Workflow docs must tell agents to stop and reread as UTF-8 when text output is garbled.');
  }
  if (!agents.includes('rg -n') || !agents.includes('Select-Object -First/-Skip/-Last')) {
    error('AGENTS.md must require targeted snippet reads instead of broad full-document reads.');
  }
}

function checkWorkflowSeparation(mechanics) {
  if (/任务生成规范|task-generation|工作流脚手架/.test(mechanics)) {
    error('mechanics-index.md should not contain workflow scaffolding entries.');
  }
}

function checkGovernanceLog(workflowFiles, governanceLog) {
  const latestDate = workflowFiles
    .map((relativePath) => statSync(filePath(relativePath)).mtime)
    .sort((a, b) => b.getTime() - a.getTime())[0]
    ?.toISOString()
    .slice(0, 10);

  if (latestDate && !governanceLog.includes(latestDate)) {
    warn(`workflow files were modified on ${latestDate}, but governance-log.md has no matching date entry.`);
  }
}

function checkCodeQualityGates(packageJsonText, codeQualityGates, claude) {
  let packageJson;
  try {
    packageJson = JSON.parse(packageJsonText);
  } catch {
    error('package.json must be valid JSON.');
    return;
  }

  const scripts = packageJson.scripts ?? {};
  for (const scriptName of ['test:systems', 'check:code', 'check:structure', 'check:all']) {
    if (typeof scripts[scriptName] !== 'string') {
      error(`package.json is missing required script: ${scriptName}`);
    }
  }

  for (const requiredText of [
    'stable ID',
    'Visual testing',
    'npm run test:systems',
    'npm run build',
    'npm run check:structure',
    'npm run check:all',
    'Structural Gates',
    'File size limits',
  ]) {
    if (!codeQualityGates.includes(requiredText)) {
      error(`code-quality-gates.md must mention: ${requiredText}`);
    }
  }

  if (!claude.includes('npm run test:systems') || !claude.includes('code-quality-gates.md')) {
    error('CLAUDE.md must point agents at system tests and code-quality-gates.md.');
  }
  if (!claude.includes('check:structure')) {
    error('CLAUDE.md must reference npm run check:structure for structural gates.');
  }

  if (!existsSync(filePath(files.structureCheck))) {
    error(`Missing structural check script: ${files.structureCheck}`);
  }
}

function checkSourceBoundaryDocs(tsconfig, srcBoundaries, mechanics, inputSystem) {
  if (tsconfig.includes('"noUnusedParameters": true')) {
    if (!srcBoundaries.includes('_time') || !srcBoundaries.includes('noUnusedParameters')) {
      error('src-boundaries.md must document the Phaser unused-parameter convention while noUnusedParameters is enabled.');
    }
  }

  const directionMechanic = [...parseMechanics(mechanics).values()].find((mechanic) => mechanic.id === 'M-009');
  if (directionMechanic?.reproductionStatus === '已复现' && /cursors\.left|cursors\.right/.test(inputSystem)) {
    warn('M-009 is marked 已复现, but InputSystem.ts still appears to read cursor arrows in the current single-player path.');
  }
}

function checkDomainLanguage(glossary, languageProcess, srcTexts) {
  const entries = parseGlossary(glossary);
  const recommendedNames = new Set();

  if (entries.length === 0) {
    error('glossary.md must contain at least one unified-language table row.');
  }

  for (const entry of entries) {
    if (!entry.concept || !entry.recommendedName || !entry.type || !entry.context || !entry.description) {
      error(`glossary.md has an incomplete row for concept: ${entry.concept || '(missing concept)'}`);
    }
    if (recommendedNames.has(entry.recommendedName)) {
      error(`glossary.md has duplicate recommended code name: ${entry.recommendedName}`);
    }
    recommendedNames.add(entry.recommendedName);
  }

  if (!languageProcess.includes('更新流程') || !languageProcess.includes('禁止规则')) {
    error('ubiquitous-language-process.md must document update flow and forbidden-name rules.');
  }

  const combinedSrc = srcTexts.join('\n');
  for (const entry of entries) {
    for (const alias of entry.forbiddenAliases) {
      if (!alias) continue;
      const aliasPattern = new RegExp(`\\b${alias}\\b`);
      if (aliasPattern.test(combinedSrc)) {
        warn(`Forbidden alias appears in src/: ${alias}. Preferred name: ${entry.recommendedName}`);
      }
    }
  }
}

assertRequiredFiles();

const agents = read(files.agents);
const claude = read('CLAUDE.md');
const outline = read(files.outline);
const board = read(files.board);
const history = read(files.history);
const mechanicsText = read(files.mechanics);
const verticalSlices = read(files.verticalSlices);
const governanceLog = read(files.governanceLog);
const workflowReadme = read(files.workflowReadme);
const packageJsonText = read(files.packageJson);
const codeQualityGates = read(files.codeQualityGates);
const tsconfig = read(files.tsconfig);
const srcBoundaries = read(files.srcBoundaries);
const inputSystem = read(files.inputSystem);
const glossary = read(files.glossary);
const languageProcess = read(files.languageProcess);

const taskRows = parseTaskRows(board);
const boardIds = taskRows.map((row) => row.id);
const boardDefinitionSection = section(board, '任务完成定义');
const boardDefinitionIds = taskDefinitions(boardDefinitionSection);
const taskBlockList = taskBlocks(boardDefinitionSection);
const mechanics = parseMechanics(mechanicsText);

checkBoardShape(board, taskRows, boardDefinitionIds, taskBlockList);
const recommendedIds = checkRecommendations(board, taskRows);
const { historyRows, historyDefinitionIds } = checkHistory(history, boardIds);
checkRefs(taskRows, mechanics, verticalSlices);
checkReadyDependencies(taskRows, mechanics);
checkStartupRules(agents, outline);
checkUtf8ReadingRules(agents, claude, workflowReadme);
checkWorkflowSeparation(mechanicsText);
checkGovernanceLog([files.taskGeneration, files.workflowReadme, files.documentMap, files.codeQualityGates], governanceLog);
checkCodeQualityGates(packageJsonText, codeQualityGates, claude);
checkSourceBoundaryDocs(tsconfig, srcBoundaries, mechanicsText, inputSystem);
checkDomainLanguage(glossary, languageProcess, [inputSystem]);

const agentProtocol = read(files.agentProtocol);
if (agentProtocol && !agentProtocol.includes('check:structure')) {
  error('agent-protocol.md must include structural gate rules (check:structure before adding to existing files).');
}

if (warnings.length > 0) {
  console.warn('Workflow validation warnings:');
  for (const message of warnings) {
    console.warn(`- ${message}`);
  }
}

if (errors.length > 0) {
  console.error('Workflow validation failed:');
  for (const message of errors) {
    console.error(`- ${message}`);
  }
  process.exit(1);
}

console.log('Workflow validation passed.');
console.log(`- task-board: ${taskRows.length} unfinished tasks, ${boardDefinitionIds.length} definitions`);
console.log(`- task-history: ${historyRows.length} completed tasks, ${historyDefinitionIds.length} definitions`);
console.log(`- current recommendations: ${recommendedIds.join(', ')}`);
