import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();

const files = {
  agents: 'AGENTS.md',
  outline: 'TASK_OUTLINE.md',
  board: 'docs/tasks/task-board.md',
  history: 'docs/tasks/task-history.md',
  featureLines: 'docs/tasks/feature-lines.md',
  goalBoard: 'docs/tasks/goal-board.md',
  taskGeneration: 'docs/workflow/task-generation.md',
  verticalSlices: 'docs/tasks/vertical-slices.md',
  mechanics: 'docs/reverse-engineering/mechanics-index.md',
  governanceLog: 'docs/workflow/governance-log.md',
  workflowReadme: 'docs/workflow/README.md',
  documentMap: 'docs/workflow/document-map.md',
  codeQualityGates: 'docs/workflow/code-quality-gates.md',
  reviewProtocol: 'docs/workflow/review-protocol.md',
  problemGovernance: 'docs/workflow/problem-governance.md',
  reverseEngineeringProtocol: 'docs/workflow/reverse-engineering-protocol.md',
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
  'Goal 包：',
  '目标机制/切片：',
  '规模预算：',
  '拆分触发：',
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

function taskSizeBudgetErrors(text, status = 'Ready') {
  const budgetErrors = [];
  const budgetStart = text.indexOf('规模预算：');
  const splitStart = text.indexOf('拆分触发：');
  const inputStart = text.indexOf('输入资料：');
  const budgetSection = budgetStart >= 0 && splitStart > budgetStart
    ? text.slice(budgetStart, splitStart)
    : '';
  const splitSection = splitStart >= 0 && inputStart > splitStart
    ? text.slice(splitStart, inputStart)
    : '';
  const workPackages = Number(budgetSection.match(/主工作包：\s*(\d+)/)?.[1]);
  const expectedCompacts = Number(budgetSection.match(/预计上下文压缩：\s*(\d+)/)?.[1]);
  const acceptanceBatches = Number(budgetSection.match(/独立验收批次：\s*(\d+)/)?.[1]);

  if (!Number.isInteger(workPackages) || (status === 'Split' ? workPackages !== 0 : workPackages < 1 || workPackages > 2)) {
    budgetErrors.push(status === 'Split' ? 'Split task 主工作包 must be 0' : '主工作包 must be between 1 and 2');
  }
  if (expectedCompacts !== 0) {
    budgetErrors.push('预计上下文压缩 must be 0');
  }
  if (!Number.isInteger(acceptanceBatches) || (status === 'Split' ? acceptanceBatches !== 0 : acceptanceBatches < 1 || acceptanceBatches > 2)) {
    budgetErrors.push(status === 'Split' ? 'Split task 独立验收批次 must be 0' : '独立验收批次 must be between 1 and 2');
  }
  if (!/\n-\s+\S/.test(splitSection)) {
    budgetErrors.push('拆分触发 must contain at least one actionable bullet');
  }
  return budgetErrors;
}

function checkTaskSizeBudgetSamples() {
  const valid = `规模预算：
- 主工作包：1
- 预计上下文压缩：0
- 独立验收批次：1

拆分触发：
- 新增资料族时拆分。

输入资料：`;
  if (taskSizeBudgetErrors(valid).length > 0) {
    error('Task size budget positive sample failed.');
  }
  const negativeCases = [
    valid.replace('主工作包：1', '主工作包：3'),
    valid.replace('预计上下文压缩：0', '预计上下文压缩：1'),
    valid.replace('独立验收批次：1', '独立验收批次：3'),
    valid.replace('- 新增资料族时拆分。', ''),
  ];
  negativeCases.forEach((negativeCase, index) => {
    if (taskSizeBudgetErrors(negativeCase).length === 0) {
      error(`Task size budget negative case ${index + 1} must fail validation.`);
    }
  });
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
    goalPackage: row[2].replaceAll('`', '').trim(),
    featureLine: row[3],
    type: row[4],
    goal: row[5],
    targetRefs: row[6],
    output: row[7],
    next: row[8],
    row,
  }));
}

function parseGoalRows(markdown) {
  const overview = section(markdown, 'Goal 总览');
  return tableRows(overview, /^\|\s*GOAL-\d{3}\s*\|/).map((row) => ({
    id: row[0],
    status: row[1],
    featureLine: row[2],
    taskIds: [...new Set(row[3].match(/TASK-(?:[A-Z]+-)?\d+[A-Z]?/g) ?? [])],
    deliveryBoundary: row[4],
    compactBudget: row[5],
    nextGoal: row[6],
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
    for (const budgetError of taskSizeBudgetErrors(block.text, row?.status)) {
      error(`${block.id} has invalid size budget: ${budgetError}.`);
    }
  }
  checkTaskSizeBudgetSamples();
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

function goalInvariantErrors(goalRows, featureLines, taskRows, recommendedIds) {
  const invariantErrors = [];
  const activeLine = featureLines.find((line) => line.status === 'Active');
  const activeGoals = goalRows.filter((goal) => goal.status === 'Active');
  const activeGoal = activeGoals[0];
  const unfinishedLines = featureLines.filter((line) => line.status !== 'Done');
  const goalIds = goalRows.map((goal) => goal.id);

  if (goalRows.length === 0) {
    invariantErrors.push('goal-board.md has no Goal rows.');
    return invariantErrors;
  }
  for (const id of duplicateIds(goalIds)) {
    invariantErrors.push(`goal-board.md has duplicate Goal id: ${id}`);
  }
  if (unfinishedLines.length > 0 && activeGoals.length !== 1) {
    invariantErrors.push(`goal-board.md must have exactly one Active Goal while unfinished lines exist; found ${activeGoals.length}.`);
  }
  for (const goal of goalRows) {
    if (!['Active', 'Planned', 'Blocked', 'Done'].includes(goal.status)) {
      invariantErrors.push(`${goal.id} has invalid Goal status: ${goal.status}`);
    }
    if (goal.taskIds.length === 0 || goal.taskIds.length > 2) {
      invariantErrors.push(`${goal.id} must bind one task by default and no more than two tasks; found ${goal.taskIds.length}.`);
    }
    if (goal.status === 'Done' && !/(?:最多\s*1\s*次|预计\s*0\s*次)/.test(goal.compactBudget)) {
      invariantErrors.push(`${goal.id} historical compact budget must be at most one or expected zero.`);
    }
    if (goal.status !== 'Done' && !/预计\s*0\s*次/.test(goal.compactBudget)) {
      invariantErrors.push(`${goal.id} must declare an expected compact budget of zero.`);
    }
    for (const taskId of goal.taskIds) {
      const task = taskRows.find((candidate) => candidate.id === taskId);
      if (goal.status !== 'Done' && !task) {
        invariantErrors.push(`${goal.id} binds missing unfinished task: ${taskId}`);
      } else if (task && task.goalPackage !== goal.id) {
        invariantErrors.push(`${goal.id} binds ${taskId}, but task-board maps it to ${task.goalPackage || '(missing)'}.`);
      }
    }
  }
  for (const task of taskRows) {
    if (task.status === 'Split') {
      if (task.goalPackage !== '—') {
        invariantErrors.push(`${task.id} is Split and must not occupy a Goal package.`);
      }
      continue;
    }
    const goal = goalRows.find((candidate) => candidate.id === task.goalPackage);
    if (!goal) {
      invariantErrors.push(`${task.id} references missing Goal package: ${task.goalPackage || '(missing)'}.`);
    } else if (!goal.taskIds.includes(task.id)) {
      invariantErrors.push(`${task.id} is not listed in its Goal package ${goal.id}.`);
    } else if (goal.featureLine !== task.featureLine) {
      invariantErrors.push(`${task.id} and ${goal.id} must belong to the same feature line.`);
    }
  }
  if (activeGoal) {
    if (activeGoal.featureLine !== activeLine?.id) {
      invariantErrors.push(`${activeGoal.id} is Active outside the Active feature line ${activeLine?.id ?? '(none)'}.`);
    }
    const executableTasks = taskRows.filter((task) => task.status === 'Ready' || task.status === 'Blocked');
    for (const task of executableTasks) {
      if (!activeGoal.taskIds.includes(task.id)) {
        invariantErrors.push(`${task.id} is executable outside the Active Goal ${activeGoal.id}.`);
      }
    }
    if (recommendedIds.length !== 1 || !activeGoal.taskIds.includes(recommendedIds[0])) {
      invariantErrors.push(`${activeGoal.id} must contain the only current recommendation.`);
    }
  }
  return invariantErrors;
}

function checkGoalInvariantSamples() {
  const line = { id: 'LINE-A', status: 'Active' };
  const task = { id: 'TASK-SLICE-900', status: 'Ready', featureLine: 'LINE-A', goalPackage: 'GOAL-900' };
  const goal = {
    id: 'GOAL-900', status: 'Active', featureLine: 'LINE-A', taskIds: [task.id], compactBudget: '预计 0 次',
  };
  if (goalInvariantErrors([goal], [line], [task], [task.id]).length > 0) {
    error('Goal positive invariant sample failed.');
  }
  const samples = [
    {
      name: 'double Active Goal',
      goals: [goal, { ...goal, id: 'GOAL-901' }],
      tasks: [task],
      expected: 'exactly one Active Goal',
    },
    {
      name: 'Active Goal outside Active line',
      goals: [{ ...goal, featureLine: 'LINE-B' }],
      tasks: [task],
      expected: 'outside the Active feature line',
    },
    {
      name: 'executable task outside Active Goal',
      goals: [goal, { ...goal, id: 'GOAL-901', status: 'Planned', taskIds: ['TASK-SLICE-901'] }],
      tasks: [task, { id: 'TASK-SLICE-901', status: 'Ready', featureLine: 'LINE-A', goalPackage: 'GOAL-901' }],
      expected: 'executable outside the Active Goal',
    },
    {
      name: 'oversized Goal',
      goals: [{ ...goal, taskIds: ['TASK-SLICE-900', 'TASK-SLICE-901', 'TASK-SLICE-902'] }],
      tasks: [task],
      expected: 'no more than two tasks',
    },
    {
      name: 'legacy compact budget on new Goal',
      goals: [{ ...goal, compactBudget: '最多 1 次' }],
      tasks: [task],
      expected: 'expected compact budget of zero',
    },
  ];
  for (const sample of samples) {
    const sampleErrors = goalInvariantErrors(sample.goals, [line], sample.tasks, [task.id]);
    if (!sampleErrors.some((message) => message.includes(sample.expected))) {
      error(`Goal negative sample did not fail as expected (${sample.name}): ${sample.expected}`);
    }
  }
}

function checkGoals(goalBoard, goalRows, featureLines, taskRows, recommendedIds) {
  for (const message of goalInvariantErrors(goalRows, featureLines, taskRows, recommendedIds)) {
    error(message);
  }
  for (const requiredText of ['预计 0 次上下文压缩', '第一次 compact 即视为规模超限', '不在同一次 `/goal` 中隐式续跑下一 Goal', '默认只绑定一个 task', '规模预检']) {
    if (!goalBoard.includes(requiredText)) {
      error(`goal-board.md must include Goal sizing rule: ${requiredText}`);
    }
  }
  checkGoalInvariantSamples();
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

function checkFeatureLineRouting(agents, claude, outline, workflowReadme, documentMap, agentProtocol, taskGeneration, goalBoard) {
  for (const [name, text] of [
    ['AGENTS.md', agents],
    ['CLAUDE.md', claude],
    ['TASK_OUTLINE.md', outline],
    ['docs/workflow/README.md', workflowReadme],
    ['docs/workflow/document-map.md', documentMap],
    ['docs/workflow/agent-protocol.md', agentProtocol],
    ['docs/workflow/task-generation.md', taskGeneration],
    ['docs/tasks/goal-board.md', goalBoard],
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
  for (const [name, text] of [
    ['AGENTS.md', agents],
    ['CLAUDE.md', claude],
    ['TASK_OUTLINE.md', outline],
    ['docs/workflow/README.md', workflowReadme],
    ['docs/workflow/document-map.md', documentMap],
    ['docs/workflow/agent-protocol.md', agentProtocol],
    ['docs/workflow/task-generation.md', taskGeneration],
  ]) {
    if (!text.includes('goal-board.md')) {
      error(`${name} must route /goal work through docs/tasks/goal-board.md.`);
    }
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
    'Problem Governance Feedback Gate',
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
    'UI 原生化评审门禁',
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

const uiNativeContractFields = [
  'UI 原生化合同：',
  '显示列表清单：',
  '原版视觉基准：',
  '允许的现代视觉例外：',
  '逐状态验收：',
  '差异证据：',
];

function uiNativeContractErrors(text) {
  return uiNativeContractFields.filter((requiredText) => !text.includes(requiredText));
}

function checkUiNativeWorkflowGate(
  taskGeneration,
  taskRows,
  taskBlockList,
  codeQualityGates,
  reverseEngineeringProtocol,
  reverseEngineeringAgent,
  implementationAgent,
  reviewAgent,
) {
  for (const requiredText of [
    '## UI 原生化 task 门禁',
    ...uiNativeContractFields,
  ]) {
    if (!taskGeneration.includes(requiredText)) {
      error(`task-generation.md must include UI native contract text: ${requiredText}`);
    }
  }

  for (const row of taskRows) {
    const summary = [row.type, row.goal, row.output].join(' ');
    if (!/(?:UI|HUD|菜单|页面|按钮|overlay|原生化)/iu.test(summary)) continue;
    const block = taskBlockList.find((candidate) => candidate.id === row.id)?.text ?? '';
    for (const missingText of uiNativeContractErrors(block)) {
      error(`${row.id} UI task is missing native-fidelity contract text: ${missingText}`);
    }
  }

  const positiveSample = uiNativeContractFields.join('\n');
  if (uiNativeContractErrors(positiveSample).length > 0) {
    error('UI native contract positive sample failed.');
  }
  uiNativeContractFields.forEach((field, index) => {
    const negativeSample = positiveSample.replace(field, `field-${index}-removed`);
    if (uiNativeContractErrors(negativeSample).length === 0) {
      error(`UI native contract negative sample ${index + 1} must fail validation.`);
    }
  });

  for (const [name, text, requiredText] of [
    ['docs/workflow/code-quality-gates.md', codeQualityGates, 'UI Native Fidelity Gate'],
    ['docs/workflow/reverse-engineering-protocol.md', reverseEngineeringProtocol, 'UI 显示列表与视觉基准门禁'],
    ['.claude/agents/reverse-engineering-researcher.md', reverseEngineeringAgent, 'display-list manifest'],
    ['.claude/agents/modern-implementation-engineer.md', implementationAgent, 'display-list manifest'],
    ['.claude/agents/engineering-reviewer.md', reviewAgent, 'display-list evidence'],
  ]) {
    if (!text.includes(requiredText)) {
      error(`${name} must include UI native-fidelity gate text: ${requiredText}`);
    }
  }
}

function problemFeedbackContractErrors(text) {
  const requiredFeedbackText = [
    '## 7. 适用触发与反馈记录',
    '触发条件：',
    '效果检查：',
    '| 日期 | 任务/变更 | 适用性 | 证据 | 结论 | 后续动作 |',
  ];
  return requiredFeedbackText.filter((requiredText) => !text.includes(requiredText));
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
    '效果反馈闭环',
    '问题适用性扫描',
    '适用触发与反馈记录',
    '治理流程',
    '模板',
  ]) {
    if (!problemGovernance.includes(requiredText)) {
      error(`problem-governance.md must mention: ${requiredText}`);
    }
  }

  if (problemRecords.length === 0) {
    error('docs/workflow/problems must contain at least one PG-*.md record.');
  }

  const indexedIds = extractRefs(section(problemGovernance, '问题索引'), 'PG');
  const discoveredIds = problemRecords.map(({ id }) => id);
  for (const indexedId of indexedIds) {
    if (!discoveredIds.includes(indexedId)) {
      error(`problem-governance.md indexes missing problem record: ${indexedId}`);
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
      '## 7. 适用触发与反馈记录',
    ]) {
      if (!text.includes(requiredHeading)) {
        error(`${recordPath} must include: ${requiredHeading}`);
      }
    }
    for (const missingFeedbackText of problemFeedbackContractErrors(text)) {
      error(`${recordPath} must include feedback contract text: ${missingFeedbackText}`);
    }

    const status = text.match(/^\u72b6\u6001\uff1a(.+)\u3002$/m)?.[1];
    const indexRow = section(problemGovernance, '问题索引')
      .split(/\r?\n/)
      .find((line) => line.startsWith(`| ${id} `));
    const indexedStatus = indexRow?.split('|')[2]?.trim();
    if (!status || indexedStatus !== status) {
      error(`${recordPath} status must match problem-governance.md index (${indexedStatus ?? 'missing'}).`);
    }
  }

  const feedbackSample = problemRecords[0]?.text ?? '';
  const negativeFeedbackCases = [
    feedbackSample.replace(/\n## 7\. \u9002\u7528\u89e6\u53d1\u4e0e\u53cd\u9988\u8bb0\u5f55[\s\S]*$/, ''),
    feedbackSample.replace('触发条件：', '触发已删除：'),
    feedbackSample.replace('| 日期 | 任务/变更 | 适用性 | 证据 | 结论 | 后续动作 |', '| 反馈表已删除 |'),
  ];
  negativeFeedbackCases.forEach((negativeCase, index) => {
    if (problemFeedbackContractErrors(negativeCase).length === 0) {
      error(`problem feedback negative case ${index + 1} must fail validation.`);
    }
  });

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
  if (!agents.includes('效果样本') || !agentProtocol.includes('问题适用性扫描')) {
    error('Agent entry and protocol must enforce problem-governance feedback scanning.');
  }
}

function reverseEngineeringProtocolErrors(text) {
  const requiredText = [
    '## 六段证据链',
    '1. **关卡/对象局部证据**',
    '2. **共享运行时调用链**',
    '3. **SWF 几何与坐标语义**',
    '4. **可观察行为合同**',
    '5. **现代实现映射**',
    '6. **双重验证**',
    '## 证据分级',
    '- `确认事实`：',
    '- `交叉确认`：',
    '- `推断`：',
    '- `未知`：',
    '- `现代设计选择`：',
    '| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |',
    'local/world/screen',
    '## 上下文与交接规则',
    '## 状态与关闭门禁',
    '## 逆向完成检查',
    '## UI 显示列表与视觉基准门禁',
    '显示列表清单',
    '原版视觉基准',
    '像素差异',
    '确定性测试',
    '运行时',
  ];
  return requiredText.filter((required) => !text.includes(required));
}

function checkReverseEngineeringProtocol(
  reverseEngineeringProtocol,
  agents,
  claude,
  workflowReadme,
  documentMap,
  agentProtocol,
  taskGeneration,
  codeQualityGates,
  reverseEngineeringAgent,
) {
  for (const missingText of reverseEngineeringProtocolErrors(reverseEngineeringProtocol)) {
    error(`reverse-engineering-protocol.md must include: ${missingText}`);
  }

  const negativeCases = [
    reverseEngineeringProtocol.replace('2. **共享运行时调用链**', '2. **共享调用链已删除**'),
    reverseEngineeringProtocol.replace(
      '| 行为合同项 | 局部证据 | 共享调用链 | 几何/坐标证据 | 证据等级 | 未知与反证条件 | 验证方式 |',
      '| 证据矩阵已删除 |',
    ),
    reverseEngineeringProtocol.replace('- `推断`：', '- `推断分类已删除`：'),
    reverseEngineeringProtocol.replace('## UI 显示列表与视觉基准门禁', '## UI 视觉门禁已删除'),
    reverseEngineeringProtocol.replaceAll('原版视觉基准', '原版参考已删除'),
  ];
  negativeCases.forEach((negativeCase, index) => {
    if (reverseEngineeringProtocolErrors(negativeCase).length === 0) {
      error(`reverse-engineering protocol negative case ${index + 1} must fail validation.`);
    }
  });

  for (const [name, text] of [
    ['AGENTS.md', agents],
    ['CLAUDE.md', claude],
    ['docs/workflow/README.md', workflowReadme],
    ['docs/workflow/document-map.md', documentMap],
    ['docs/workflow/agent-protocol.md', agentProtocol],
    ['docs/workflow/task-generation.md', taskGeneration],
    ['docs/workflow/code-quality-gates.md', codeQualityGates],
    ['.claude/agents/reverse-engineering-researcher.md', reverseEngineeringAgent],
  ]) {
    if (!text.includes('reverse-engineering-protocol.md')) {
      error(`${name} must reference docs/workflow/reverse-engineering-protocol.md.`);
    }
  }

  if (!agentProtocol.includes('证据矩阵') || !taskGeneration.includes('双重验证')) {
    error('Execution and task-generation protocols must enforce reverse-engineering evidence handoff and dual validation.');
  }
  if (!codeQualityGates.includes('Reverse Engineering Evidence Gate')) {
    error('code-quality-gates.md must include the reverse-engineering evidence gate.');
  }
  if (!reverseEngineeringAgent.includes('Evidence matrix') || !reverseEngineeringAgent.includes('shared runtime call path')) {
    error('reverse-engineering-researcher must output an evidence matrix and shared runtime call path.');
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
const goalBoard = read(files.goalBoard);
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
const reverseEngineeringProtocol = read(files.reverseEngineeringProtocol);
const problemDirectory = 'docs/workflow/problems';
const problemRecordPaths = readdirSync(filePath(problemDirectory))
  .filter((name) => /^PG-\d{3}-.+\.md$/.test(name))
  .sort()
  .map((name) => `${problemDirectory}/${name}`);
const problemRecords = problemRecordPaths.map((recordPath) => ({
  id: path.basename(recordPath).match(/^(PG-\d{3})-/)?.[1] ?? '',
  path: recordPath,
  text: read(recordPath),
}));
const agentProtocol = read(files.agentProtocol);
const reverseEngineeringAgent = read(files.reverseEngineeringAgent);
const implementationAgent = read(files.implementationAgent);
const reviewAgent = read(files.reviewAgent);
const tsconfig = read(files.tsconfig);
const srcBoundaries = read(files.srcBoundaries);
const inputSystem = read(files.inputSystem);
const glossary = read(files.glossary);
const languageProcess = read(files.languageProcess);

const taskRows = parseTaskRows(board);
const featureLines = parseFeatureLineRows(featureLinesText);
const goalRows = parseGoalRows(goalBoard);
const boardIds = taskRows.map((row) => row.id);
const boardDefinitionSection = section(board, '任务完成定义');
const boardDefinitionIds = taskDefinitions(boardDefinitionSection);
const taskBlockList = taskBlocks(boardDefinitionSection);
const mechanics = parseMechanics(mechanicsText);

checkBoardShape(board, taskRows, boardDefinitionIds, taskBlockList);
const recommendedIds = checkRecommendations(board, taskRows);
checkFeatureLines(featureLinesText, featureLines, taskRows, recommendedIds);
checkGoals(goalBoard, goalRows, featureLines, taskRows, recommendedIds);
const { historyRows, historyDefinitionIds } = checkHistory(history, boardIds);
checkRefs(taskRows, mechanics, verticalSlices);
checkReadyDependencies(taskRows, mechanics);
checkStartupRules(agents, outline);
checkFeatureLineRouting(agents, claude, outline, workflowReadme, documentMap, agentProtocol, taskGeneration, goalBoard);
checkUtf8ReadingRules(agents, claude, workflowReadme);
checkRegimaRouting(agents, outline, board, workflowReadme, documentMap);
checkWorkflowSeparation(mechanicsText);
checkGovernanceLog([
  files.taskGeneration,
  files.featureLines,
  files.goalBoard,
  files.workflowReadme,
  files.documentMap,
  files.codeQualityGates,
  files.reviewProtocol,
  files.problemGovernance,
  files.reverseEngineeringProtocol,
  ...problemRecordPaths,
  files.agentProtocol,
], governanceLog);
checkCodeQualityGates(packageJsonText, codeQualityGates, claude);
checkReviewProtocol(reviewProtocol, agents, claude, workflowReadme, documentMap);
checkUiNativeWorkflowGate(
  taskGeneration,
  taskRows,
  taskBlockList,
  codeQualityGates,
  reverseEngineeringProtocol,
  reverseEngineeringAgent,
  implementationAgent,
  reviewAgent,
);
checkProblemGovernance(
  problemGovernance,
  problemRecords,
  agents,
  claude,
  workflowReadme,
  documentMap,
  agentProtocol,
);
checkReverseEngineeringProtocol(
  reverseEngineeringProtocol,
  agents,
  claude,
  workflowReadme,
  documentMap,
  agentProtocol,
  taskGeneration,
  codeQualityGates,
  reverseEngineeringAgent,
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
console.log(`- goals: ${goalRows.length} tracked, active ${goalRows.find((goal) => goal.status === 'Active')?.id ?? 'none'}`);
