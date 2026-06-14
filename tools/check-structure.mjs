import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// ── Configuration ──────────────────────────────────────────────
const LIMITS = {
  /** Split before adding new features. */
  systemWarnLines: 800,
  /** Hard ceiling — must split before any further edits. */
  systemErrorLines: 1500,
  /** Split before adding new features. */
  sceneWarnLines: 600,
  /** Transitional scene bridges are expected to be thicker than view helpers. */
  testSceneBridgeWarnLines: 800,
  /** Hard ceiling — must split before any further edits. */
  sceneErrorLines: 1200,
  /** Test files are more tolerant. */
  testWarnLines: 6000,
  testErrorLines: 10000,
  /** Number of near-identical code blocks before warning. */
  duplicationBlockThreshold: 3,
  /** Minimum lines per block to count as duplicated. */
  duplicationMinBlockLines: 4,
  /** Max similarity ratio (0 = identical, 1 = completely different). */
  duplicationSimilarityRatio: 0.25,
  /** Scene importing too many systems = God object. */
  sceneImportSystemWarn: 10,
  sceneImportSystemError: 15,
};

const errors = [];
const warnings = [];

function error(msg) {
  errors.push(msg);
}

function warn(msg) {
  warnings.push(msg);
}

// ── Helpers ────────────────────────────────────────────────────

function relPath(absolutePath) {
  return path.relative(root, absolutePath).replaceAll('\\', '/');
}

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function lineCount(text) {
  return text.split(/\r?\n/).length;
}

function listTsFiles(relativeDir) {
  const absoluteDir = path.join(root, relativeDir);
  if (!existsSync(absoluteDir)) return [];

  const results = [];
  const stack = [absoluteDir];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        results.push(relPath(full));
      }
    }
  }
  return results;
}

// ── 1. File size checks ────────────────────────────────────────

function checkFileSize(filePath, label, warnLimit, errorLimit) {
  const text = read(filePath);
  const lines = lineCount(text);

  if (lines > errorLimit) {
    error(
      `${label} ${filePath} is ${lines} lines (ceiling ${errorLimit}). ` +
      `MUST split before adding any new logic to this file.`
    );
  } else if (lines > warnLimit) {
    warn(
      `${label} ${filePath} is ${lines} lines (warn ${warnLimit}). ` +
      `Split before feature work on this file, or justify a narrow local fix.`
    );
  }
}

function getSceneWarnLimit(filePath) {
  if (/^src\/scenes\/test-scene\/.*Bridge\.ts$/.test(filePath)) {
    return LIMITS.testSceneBridgeWarnLines;
  }
  return LIMITS.sceneWarnLines;
}

function checkAllFileSizes() {
  for (const f of listTsFiles('src/systems')) {
    checkFileSize(f, '[system]', LIMITS.systemWarnLines, LIMITS.systemErrorLines);
  }
  for (const f of listTsFiles('src/scenes')) {
    checkFileSize(f, '[scene]', getSceneWarnLimit(f), LIMITS.sceneErrorLines);
  }
  for (const f of listTsFiles('tools')) {
    checkFileSize(f, '[test]', LIMITS.testWarnLines, LIMITS.testErrorLines);
  }
}

// ── 2. Duplication detection ───────────────────────────────────

function structureFingerprint(codeText) {
  return codeText
    .split(/\r?\n/)
    .map((line) => {
      let stripped = line
        .replace(/\/\/.*$/, '')
        .replace(/\/\*.*\*\//g, '')
        .trim();
      if (!stripped) return '';
      stripped = stripped
        .replace(/'[^']*'/g, "'...'")
        .replace(/"[^"]*"/g, '"..."')
        .replace(/`[^`]*`/g, '`...`')
        .replace(/\b\d+(\.\d+)?\b/g, '0');
      return stripped;
    })
    .filter((l) => l.length > 0);
}

function blockSimilarity(blockA, blockB) {
  if (blockA.length === 0 || blockB.length === 0) return 1;
  const maxLen = Math.max(blockA.length, blockB.length);
  let diffs = 0;
  const minLen = Math.min(blockA.length, blockB.length);
  for (let i = 0; i < minLen; i++) {
    if (blockA[i] !== blockB[i]) diffs += 1;
  }
  diffs += Math.abs(blockA.length - blockB.length);
  return diffs / maxLen;
}

function checkDuplication(filePath) {
  const text = read(filePath);
  const normalized = structureFingerprint(text);

  const blocks = [];
  let current = [];
  for (const line of normalized) {
    if (line === '') {
      if (current.length >= LIMITS.duplicationMinBlockLines) {
        blocks.push(current);
      }
      current = [];
    } else {
      current.push(line);
    }
  }
  if (current.length >= LIMITS.duplicationMinBlockLines) {
    blocks.push(current);
  }

  const reported = new Set();
  for (let i = 0; i < blocks.length; i++) {
    if (reported.has(i)) continue;
    const similarIndices = [i];
    for (let j = i + 1; j < blocks.length; j++) {
      if (reported.has(j)) continue;
      if (blockSimilarity(blocks[i], blocks[j]) <= LIMITS.duplicationSimilarityRatio) {
        similarIndices.push(j);
      }
    }
    if (similarIndices.length > LIMITS.duplicationBlockThreshold) {
      for (const idx of similarIndices) reported.add(idx);
      const sample = blocks[i].slice(0, 3).join(' | ');
      warn(
        `${filePath} — ${similarIndices.length} structurally similar code blocks. ` +
        `Extract a shared helper. Sample: [${sample}...]`
      );
    }
  }
}

function checkAllDuplications() {
  for (const f of listTsFiles('src/systems')) {
    checkDuplication(f);
  }
}

// ── 3. Scene import coupling ───────────────────────────────────

function checkSceneImports() {
  for (const f of listTsFiles('src/scenes')) {
    const text = read(f);
    const imports = text.match(/from\s+['"]\.\.\/systems\/[^'"]+['"]/g) ?? [];
    const count = imports.length;
    if (count > LIMITS.sceneImportSystemError) {
      error(
        `${f} imports ${count} system files (ceiling ${LIMITS.sceneImportSystemError}). ` +
        `Extract orchestration or view factories before adding more imports.`
      );
    } else if (count > LIMITS.sceneImportSystemWarn) {
      warn(
        `${f} imports ${count} system files (warn ${LIMITS.sceneImportSystemWarn}). ` +
        `Watch for God-object growth.`
      );
    }
  }
}

// ── 4. Scene boundary comment ──────────────────────────────────

function checkSceneBoundaryComments() {
  for (const f of listTsFiles('src/scenes')) {
    const text = read(f);
    const lines = lineCount(text);
    if (lines > 300) {
      const first50 = text.split(/\r?\n/).slice(0, 50).join('\n');
      if (!/不(直接|负责|承载|处理)/.test(first50) && !/boundary|边界/.test(first50)) {
        warn(
          `${f} is ${lines} lines without a boundary comment. ` +
          `Document what this scene does NOT own.`
        );
      }
    }
  }
}

// ── Run ─────────────────────────────────────────────────────────

checkAllFileSizes();
checkAllDuplications();
checkSceneImports();
checkSceneBoundaryComments();

const hasErrors = errors.length > 0;

if (warnings.length > 0) {
  console.warn('Structure warnings (review before feature work):');
  for (const msg of warnings) {
    console.warn(`  ⚠  ${msg}`);
  }
}

if (hasErrors) {
  console.error('Structure errors (MUST split before editing):');
  for (const msg of errors) {
    console.error(`  ✖  ${msg}`);
  }
}

if (hasErrors) {
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s). Files with errors must be split before adding new logic.`);
} else if (warnings.length > 0) {
  console.warn(`\n${warnings.length} warning(s). Split target files before feature work, or justify narrow local fixes.`);
} else {
  console.log('Structure validation passed — all files within limits.');
}

// Always exit 0: enforcement is via agent protocol rules, not CI gate.
// validate-workflow.mjs verifies this script exists and is registered.
process.exit(0);
