import { existsSync, readFileSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();

const files = {
  agents: 'AGENTS.md',
  outline: 'TASK_OUTLINE.md',
  board: 'docs/tasks/task-board.md',
  history: 'docs/tasks/task-history.md',
  featureLines: 'docs/tasks/feature-lines.md',
  taskGeneration: 'docs/workflow/task-generation.md',
  verticalSlices: 'docs/tasks/vertical-slices.md',
  mechanics: 'docs/reverse-engineering/mechanics-index.md',
  governanceLog: 'docs/workflow/governance-log.md',
  workflowReadme: 'docs/workflow/README.md',
  documentMap: 'docs/workflow/document-map.md',
  codeQualityGates: 'docs/workflow/code-quality-gates.md',
  reviewProtocol: 'docs/workflow/review-protocol.md',
  problemGovernance: 'docs/workflow/problem-governance.md',
  problem001: 'docs/workflow/problems/PG-001-共享技能规则重复定义.md',
  problem002: 'docs/workflow/problems/PG-002-功能条线提前关闭.md',
  srcBoundaries: 'docs/architecture/src-boundaries.md',
  glossary: 'docs/domain/glossary.md',
  languageProcess: 'docs/domain/ubiquitous-language-process.md',
  agentProtocol: 'docs/workflow/agent-protocol.md',
  reverseEngineeringAgent: '.claude/agents/reverse-engineering-researcher.md',
  implementationAgent: '.claude/agents/modern-implementation-engineer.md',
  reviewAgent: '.claude/agents/engineering-reviewer.md',
  workflowAgent: '.claude/agents/workflow-steward.md',
  structureCheck: 'tools/check-structure.mjs',
  packageJson: 'package.json',
  tsconfig: 'tsconfig.json',
  inputSystem: 'src/systems/InputSystem.ts',
  extractionReadme: 'local-resources/regima/legacy-extraction/README_extract.md',
};

const errors = [];
const warnings = [];

const taskDefinitionFields = [
  '任务类型：',
  '功能条线：',
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

function extractLineRefs(text) {
  return [...new Set(text.match(/LINE-[A-Z0-9-]+/g) ?? [])];
}

function parseFeatureLineRows(markdown) {
  const overview = section(markdown, '功能条线总览');
  return tableRows(overview, /^\|\s*LINE-[A-Z0-9-]+\s*\|/).map((row) => ({
    id: row[0],
    status: row[1],
    scope: row[2],
    currentTask: row[3].replaceAll('`', '').trim(),
    coverage: row[4].replaceAll('`', '').trim(),
    blocker: row[5],
    closureEvidence: row[6],
    row,
  }));
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
    featureLine: row[2],
    type: row[3],
    goal: row[4],
    targetRefs: row[5],
    output: row[6],
    next: row[7],
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
    if (row && !extractLineRefs(block.text).includes(row.featureLine)) {
      error(`${block.id} definition must reference its feature line: ${row.featureLine}`);
    }
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
    } else if (row.status !== 'Ready' && row.status !== 'Blocked') {
      error(`Recommended task is neither Ready nor Blocked: ${id} is ${row.status}`);
    }
  }
  for (const id of readyIds) {
    if (!recommendedIds.includes(id)) {
      warn(`Ready task is not listed in 当前推荐: ${id}`);
    }
  }

  return recommendedIds;
}

function featureLineInvariantErrors(featureLines, taskRows, recommendedIds) {
  const invariantErrors = [];
  const lineIds = featureLines.map((line) => line.id);
  const activeLines = featureLines.filter((line) => line.status === 'Active');
  const unfinishedLines = featureLines.filter((line) => line.status !== 'Done');
  const activeLine = activeLines[0];

  if (featureLines.length === 0) {
    invariantErrors.push('feature-lines.md has no feature line rows.');
    return invariantErrors;
  }
  for (const id of duplicateIds(lineIds)) {
    invariantErrors.push(`feature-lines.md has duplicate line id: ${id}`);
  }
  for (const line of featureLines) {
    if (!['Active', 'Planned', 'Done'].includes(line.status)) {
      invariantErrors.push(`${line.id} has invalid feature line status: ${line.status}`);
    }
  }
  if (unfinishedLines.length > 0 && activeLines.length !== 1) {
    invariantErrors.push(`feature-lines.md must have exactly one Active line while unfinished lines exist; found ${activeLines.length}.`);
  }

  for (const task of taskRows) {
    if (!lineIds.includes(task.featureLine)) {
      invariantErrors.push(`${task.id} references missing feature line: ${task.featureLine || '(missing)'}`);
    }
    if ((task.status === 'Ready' || task.status === 'Blocked') && task.featureLine !== activeLine?.id) {
      invariantErrors.push(`${task.id} is ${task.status} outside the Active feature line ${activeLine?.id ?? '(none)'}.`);
    }
  }

  if (activeLine) {
    const currentTask = taskRows.find((task) => task.id === activeLine.currentTask);
    if (!currentTask) {
      invariantErrors.push(`${activeLine.id} current task does not exist in task-board.md: ${activeLine.currentTask}`);
    } else {
      if (currentTask.featureLine !== activeLine.id) {
        invariantErrors.push(`${activeLine.id} current task belongs to ${currentTask.featureLine}: ${currentTask.id}`);
      }
      if (currentTask.status !== 'Ready' && currentTask.status !== 'Blocked') {
        invariantErrors.push(`${activeLine.id} current task must be Ready or Blocked: ${currentTask.id} is ${currentTask.status}`);
      }
    }
    if (recommendedIds.length !== 1 || recommendedIds[0] !== activeLine.currentTask) {
      invariantErrors.push(`${activeLine.id} current task must be the only current recommendation: ${activeLine.currentTask}`);
    }
    for (const recommendedId of recommendedIds) {
      const recommendedTask = taskRows.find((task) => task.id === recommendedId);
      if (recommendedTask && recommendedTask.featureLine !== activeLine.id) {
        invariantErrors.push(`Recommended task ${recommendedId} is outside the Active feature line ${activeLine.id}.`);
      }
    }
  }

  for (const line of featureLines.filter((candidate) => candidate.status === 'Done')) {
    const unfinishedTask = taskRows.find((task) => task.featureLine === line.id);
    if (unfinishedTask) {
      invariantErrors.push(`${line.id} is Done but still has unfinished task: ${unfinishedTask.id}`);
    }
    if (!line.coverage || /待建立/.test(line.coverage)) {
      invariantErrors.push(`${line.id} is Done without a coverage ledger.`);
    }
    if (!line.closureEvidence || /未开始|待/.test(line.closureEvidence)) {
      invariantErrors.push(`${line.id} is Done without concrete closure evidence.`);
    }
  }

  const blockedCurrentTask = activeLine
    ? taskRows.find((task) => task.id === activeLine.currentTask && task.status === 'Blocked')
    : undefined;
  if (blockedCurrentTask) {
    const otherReadyTask = taskRows.find((task) => task.status === 'Ready');
    if (otherReadyTask) {
      invariantErrors.push(`${blockedCurrentTask.id} is the blocked Active task, but ${otherReadyTask.id} is Ready; resolve the same-line blocker instead of switching.`);
    }
  }

  return invariantErrors;
}

function checkFeatureLineInvariantSamples() {
  const active = {
    id: 'LINE-A', status: 'Active', currentTask: 'TASK-SETTINGS-900', coverage: 'coverage-a.md', closureEvidence: '待关闭',
  };
  const planned = {
    id: 'LINE-B', status: 'Planned', currentTask: 'TASK-SETTINGS-901', coverage: '待建立', closureEvidence: '未开始',
  };
  const activeTask = { id: 'TASK-SETTINGS-900', status: 'Ready', featureLine: 'LINE-A' };
  const plannedTask = { id: 'TASK-SETTINGS-901', status: 'Planned', featureLine: 'LINE-B' };

  const validErrors = featureLineInvariantErrors([active, planned], [activeTask, plannedTask], [activeTask.id]);
  if (validErrors.length > 0) {
    error(`Feature-line positive sample failed: ${validErrors.join(' | ')}`);
  }

  const samples = [
    {
      name: 'double Active',
      lines: [active, { ...planned, status: 'Active' }],
      tasks: [activeTask, plannedTask],
      recommendations: [activeTask.id],
      expected: 'exactly one Active',
    },
    {
      name: 'Ready task outside Active line',
      lines: [active, planned],
      tasks: [activeTask, { ...plannedTask, status: 'Ready' }],
      recommendations: [activeTask.id],
      expected: 'outside the Active feature line',
    },
    {
      name: 'cross-line recommendation',
      lines: [active, planned],
      tasks: [activeTask, plannedTask],
      recommendations: [plannedTask.id],
      expected: 'only current recommendation',
    },
    {
      name: 'Done line with unfinished task',
      lines: [active, { ...planned, status: 'Done', coverage: 'coverage-b.md', closureEvidence: 'verified' }],
      tasks: [activeTask, plannedTask],
      recommendations: [activeTask.id],
      expected: 'Done but still has unfinished task',
    },
    {
      name: 'blocked line switches to another Ready task',
      lines: [active, planned],
      tasks: [{ ...activeTask, status: 'Blocked' }, { ...plannedTask, status: 'Ready' }],
      recommendations: [activeTask.id],
      expected: 'resolve the same-line blocker',
    },
  ];

  for (const sample of samples) {
    const sampleErrors = featureLineInvariantErrors(sample.lines, sample.tasks, sample.recommendations);
    if (!sampleErrors.some((message) => message.includes(sample.expected))) {
      error(`Feature-line negative sample did not fail as expected (${sample.name}): ${sample.expected}`);
    }
  }
}

function checkFeatureLines(featureLinesText, featureLines, taskRows, recommendedIds) {
  for (const message of featureLineInvariantErrors(featureLines, taskRows, recommendedIds)) {
    error(message);
  }

  if (!featureLinesText.includes('WIP=1') || !featureLinesText.includes('阻塞')) {
    error('feature-lines.md must document strict WIP=1 and same-line blocker handling.');
  }

  for (const line of featureLines.filter((candidate) => candidate.status === 'Active')) {
    if (!line.coverage || /待建立/.test(line.coverage)) {
      error(`${line.id} Active line must reference a coverage ledger.`);
      continue;
    }
    const coveragePath = path.join('docs/tasks', line.coverage);
    if (!existsSync(filePath(coveragePath))) {
      error(`${line.id} coverage ledger does not exist: ${coveragePath}`);
    }
  }

  checkFeatureLineInvariantSamples();
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

function checkFeatureLineRouting(agents, claude, outline, workflowReadme, documentMap, agentProtocol, taskGeneration) {
  for (const [name, text] of [
    ['AGENTS.md', agents],
    ['CLAUDE.md', claude],
    ['TASK_OUTLINE.md', outline],
    ['docs/workflow/README.md', workflowReadme],
    ['docs/workflow/document-map.md', documentMap],
    ['docs/workflow/agent-protocol.md', agentProtocol],
    ['docs/workflow/task-generation.md', taskGeneration],
  ]) {
    if (!text.includes('feature-lines.md')) {
      error(`${name} must route formal game work through docs/tasks/feature-lines.md.`);
    }
  }
  if (!agentProtocol.includes('WIP=1') || !agentProtocol.includes('阻塞')) {
    error('agent-protocol.md must enforce strict feature-line WIP=1 and same-line blocker handling.');
  }
  if (!taskGeneration.includes('WIP=1') || !taskGeneration.includes('不得切线')) {
    error('task-generation.md must enforce strict WIP=1 and prohibit cross-line task generation.');
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

function checkRegimaRouting(agents, outline, board, workflowReadme, documentMap) {
  const visualRoot = 'local-resources/regima/source/restored-swfs/';
  for (const [name, text] of [
    ['AGENTS.md', agents],
    ['TASK_OUTLINE.md', outline],
    ['docs/workflow/README.md', workflowReadme],
    ['docs/workflow/document-map.md', documentMap],
  ]) {
    if (!text.includes(visualRoot)) {
      error(`${name} must route visual resource research through ${visualRoot}.`);
    }
  }

  const unfinishedTasks = taskBlocks(section(board, '任务完成定义'));
  const craftingVisualTasks = unfinishedTasks.filter((task) =>
    task.text.includes('crafting-ui-index.md'),
  );
  for (const task of craftingVisualTasks) {
    if (!task.text.includes(visualRoot)) {
      error(`${task.id} must use ${visualRoot} as its visual source entry.`);
    }
  }

  const craftingUiResearchTask = unfinishedTasks
    .find((task) => task.id === 'TASK-SETTINGS-044')?.text ?? '';
  if (craftingUiResearchTask && !craftingUiResearchTask.includes('只作旧提取交叉对照')) {
    error('TASK-SETTINGS-044 must mark local-resources/regima/legacy-extraction visual exports as legacy cross-check evidence.');
  }
}

function checkRetiredLegacyRootName() {
  const retiredName = ['extracted', 'flash'].join('_');
  try {
    const matches = execFileSync('git', ['grep', '-n', '-I', '-e', retiredName], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    if (matches) {
      error(`Retired legacy root name is still referenced by tracked files:\n${matches}`);
    }
  } catch (caught) {
    if (caught?.status !== 1) {
      error(`Unable to verify retired legacy root references: ${caught?.message ?? caught}`);
    }
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
    'Shared definition ownership',
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

function checkReviewProtocol(reviewProtocol, agents, claude, workflowReadme, documentMap) {
  for (const requiredText of [
    '适用范围',
    '评审原则',
    '必读资料',
    '评审流程',
    '输出格式',
    '严重程度',
    '评分维度',
    '整改落点',
  ]) {
    if (!reviewProtocol.includes(requiredText)) {
      error(`review-protocol.md must mention: ${requiredText}`);
    }
  }

  for (const [name, text] of [
    ['AGENTS.md', agents],
    ['CLAUDE.md', claude],
    ['docs/workflow/README.md', workflowReadme],
    ['docs/workflow/document-map.md', documentMap],
  ]) {
    if (!text.includes('review-protocol.md')) {
      error(`${name} must reference docs/workflow/review-protocol.md.`);
    }
  }
}

function checkProblemGovernance(
  problemGovernance,
  problemRecords,
  agents,
  claude,
  workflowReadme,
  documentMap,
  agentProtocol,
) {
  for (const requiredText of [
    '适用范围',
    '问题定义',
    '证据',
    '解决方案',
    '测试方案',
    '测试结果',
    '关闭标准',
    '治理流程',
    '模板',
  ]) {
    if (!problemGovernance.includes(requiredText)) {
      error(`problem-governance.md must mention: ${requiredText}`);
    }
  }

  for (const { id, path: recordPath, text } of problemRecords) {
    if (!problemGovernance.includes(recordPath.replace('docs/workflow/', ''))) {
      error(`problem-governance.md must index ${recordPath}.`);
    }
    if (!text.includes(`# ${id} `)) {
      error(`${recordPath} must start with its stable id ${id}.`);
    }
    for (const requiredHeading of [
      '## 1. 问题定义',
      '## 2. 证据',
      '## 3. 解决方案',
      '## 4. 测试方案',
      '## 5. 测试结果',
      '## 6. 关闭标准',
    ]) {
      if (!text.includes(requiredHeading)) {
        error(`${recordPath} must include: ${requiredHeading}`);
      }
    }
  }

  for (const [name, text] of [
    ['AGENTS.md', agents],
    ['CLAUDE.md', claude],
    ['docs/workflow/README.md', workflowReadme],
    ['docs/workflow/document-map.md', documentMap],
    ['docs/workflow/agent-protocol.md', agentProtocol],
  ]) {
    if (!text.includes('problem-governance.md')) {
      error(`${name} must reference docs/workflow/problem-governance.md.`);
    }
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
checkRetiredLegacyRootName();

const agents = read(files.agents);
const claude = read('CLAUDE.md');
const outline = read(files.outline);
const board = read(files.board);
const history = read(files.history);
const featureLinesText = read(files.featureLines);
const taskGeneration = read(files.taskGeneration);
const mechanicsText = read(files.mechanics);
const verticalSlices = read(files.verticalSlices);
const governanceLog = read(files.governanceLog);
const workflowReadme = read(files.workflowReadme);
const documentMap = read(files.documentMap);
const packageJsonText = read(files.packageJson);
const codeQualityGates = read(files.codeQualityGates);
const reviewProtocol = read(files.reviewProtocol);
const problemGovernance = read(files.problemGovernance);
const problem001 = read(files.problem001);
const problem002 = read(files.problem002);
const agentProtocol = read(files.agentProtocol);
const tsconfig = read(files.tsconfig);
const srcBoundaries = read(files.srcBoundaries);
const inputSystem = read(files.inputSystem);
const glossary = read(files.glossary);
const languageProcess = read(files.languageProcess);

const taskRows = parseTaskRows(board);
const featureLines = parseFeatureLineRows(featureLinesText);
const boardIds = taskRows.map((row) => row.id);
const boardDefinitionSection = section(board, '任务完成定义');
const boardDefinitionIds = taskDefinitions(boardDefinitionSection);
const taskBlockList = taskBlocks(boardDefinitionSection);
const mechanics = parseMechanics(mechanicsText);

checkBoardShape(board, taskRows, boardDefinitionIds, taskBlockList);
const recommendedIds = checkRecommendations(board, taskRows);
checkFeatureLines(featureLinesText, featureLines, taskRows, recommendedIds);
const { historyRows, historyDefinitionIds } = checkHistory(history, boardIds);
checkRefs(taskRows, mechanics, verticalSlices);
checkReadyDependencies(taskRows, mechanics);
checkStartupRules(agents, outline);
checkFeatureLineRouting(agents, claude, outline, workflowReadme, documentMap, agentProtocol, taskGeneration);
checkUtf8ReadingRules(agents, claude, workflowReadme);
checkRegimaRouting(agents, outline, board, workflowReadme, documentMap);
checkWorkflowSeparation(mechanicsText);
checkGovernanceLog([
  files.taskGeneration,
  files.featureLines,
  files.workflowReadme,
  files.documentMap,
  files.codeQualityGates,
  files.reviewProtocol,
  files.problemGovernance,
  files.problem001,
  files.problem002,
  files.agentProtocol,
], governanceLog);
checkCodeQualityGates(packageJsonText, codeQualityGates, claude);
checkReviewProtocol(reviewProtocol, agents, claude, workflowReadme, documentMap);
checkProblemGovernance(
  problemGovernance,
  [
    { id: 'PG-001', path: files.problem001, text: problem001 },
    { id: 'PG-002', path: files.problem002, text: problem002 },
  ],
  agents,
  claude,
  workflowReadme,
  documentMap,
  agentProtocol,
);
checkSourceBoundaryDocs(tsconfig, srcBoundaries, mechanicsText, inputSystem);
checkDomainLanguage(glossary, languageProcess, [inputSystem]);

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
