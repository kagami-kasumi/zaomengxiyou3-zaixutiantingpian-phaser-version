import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { inflateSync } from 'node:zlib';

// Source inventory only. Native execution and visual verification are separate
// gates; this deliberately cannot emit a verified runtime contract.
const root = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts';
const output = 'local-resources/regima/task-outputs/TASK-SETTINGS-254';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const families = [['ufo', 'Kabu', 3], ['tigress', 'Tiger', 4], ['phoenix', 'Phoenix', 4], ['rabbit', 'Rabbit', 4], ['mouse', 'Mouse', 4]];
const sources = new Map();
function source(name) {
  if (!sources.has(name)) {
    const path = `${root}/export/pet/${name}.as`, bytes = readFileSync(path);
    sources.set(name, { path, sha256: hash(bytes), text: bytes.toString('utf8') });
  }
  return sources.get(name);
}
function method(name, key, trail = []) {
  assert(!trail.includes(name), 'inheritance cycle');
  const s = source(name), match = new RegExp(`function ${key}\\(`).exec(s.text);
  if (!match) {
    const parent = /class \w+ extends (\w+)/.exec(s.text)?.[1];
    assert(parent && parent !== 'BasePet', `${name}.${key} missing`);
    return method(parent, key, [...trail, name]);
  }
  const start = s.text.indexOf('{', match.index);
  let depth = 1, end = start + 1;
  while (depth && end < s.text.length) {
    if (s.text[end] === '{') depth++;
    if (s.text[end] === '}') depth--;
    end++;
  }
  assert.equal(depth, 0);
  return { text: s.text.slice(start + 1, end - 1), owner: name,
    path: s.path, sha256: s.sha256, line: s.text.slice(0, match.index).split('\n').length,
    inheritedThrough: trail };
}
function capture(text, regex, label) {
  const m = regex.exec(text); assert(m, label); return m;
}
function actionCase(text, action) {
  const body = capture(text, new RegExp(`case "${action}":([\\s\\S]*?)(?=case "|default:|$)`), action)[1];
  let depth = 0;
  for (let i = 0; i < body.length; i++) {
    if (body[i] === '{') depth++;
    if (body[i] === '}' && --depth < 0) return body.slice(0, i);
  }
  return body;
}
function numericArray(text) {
  // AS3 contains literal products (for example 2 * 60), not just JSON.
  // Accept only numbers, brackets, commas and multiplication; never eval source.
  assert(/^[\d\s,\[\]*]+$/.test(text), `unsupported array expression: ${text}`);
  const reduced = text.replace(/\d+(?:\s*\*\s*\d+)+/g,
    expression => String(expression.split('*').reduce((n, v) => n * Number(v.trim()), 1)));
  return JSON.parse(reduced);
}
function symbols(packageName) {
  const path = `local-resources/regima/source/restored-swfs/assets/${packageName}.swf`;
  const original = readFileSync(path);
  const bytes = original.toString('ascii', 0, 3) === 'CWS'
    ? Buffer.concat([original.subarray(0, 8), inflateSync(original.subarray(8))]) : original;
  assert(['FWS', 'CWS'].includes(original.toString('ascii', 0, 3)), path);
  let at = 8 + Math.ceil((5 + 4 * (bytes[8] >> 3)) / 8) + 4;
  const rows = [];
  while (at < bytes.length) {
    const tag = bytes.readUInt16LE(at); at += 2;
    const code = tag >> 6;
    let length = tag & 63;
    if (length === 63) { length = bytes.readUInt32LE(at); at += 4; }
    assert(at + length <= bytes.length, path);
    if (code === 76) {
      const count = bytes.readUInt16LE(at); let cursor = at + 2;
      for (let i = 0; i < count; i++) {
        const characterId = bytes.readUInt16LE(cursor); cursor += 2;
        const end = bytes.indexOf(0, cursor); assert(end < at + length && end >= cursor);
        rows.push({ symbol: bytes.toString('utf8', cursor, end), characterId, path, sha256: hash(original) });
        cursor = end + 1;
      }
    }
    at += length;
    if (!code) break;
  }
  return rows;
}
const allSymbols = ['pet1', '20120203', '20120808', 'mouse', 'StageCommon'].flatMap(symbols);
const forms = [];
for (const [family, classStem, count] of families) for (let n = 1; n <= count; n++) {
  const className = `Pet${classStem}${n}`;
  const init = method(className, 'initBBDC'), set = method(className, 'setAction'), over = method(className, 'scriptFrameOverFunc');
  const symbol = capture(init.text, /getBitmapDataArrayByName\("([^"]+)"\)/, className)[1];
  const counts = numericArray(capture(init.text, /setFrameCount\((\[[\s\S]*?\])\);/, className)[1]);
  const holds = numericArray(capture(init.text, /setFrameStopCount\((\[[\s\S]*?\])\);/, className)[1]);
  const cell = capture(init.text, /BaseBitmapDataClip\(\[[^\]]+\],(\d+),(\d+),new Point\(([^)]+)\)/, className);
  const offset = capture(init.text, /setOffsetXY\(([^)]+)\)/, className)[1].split(',').map(Number);
  const candidates = allSymbols.filter(s => s.symbol === symbol);
  assert(candidates.length, `restored symbol missing: ${symbol}`);
  const actions = ['hurt', 'dead'].map(action => {
    const body = actionCase(set.text, action), ending = actionCase(over.text, action);
    const row = Number(capture(body, /setFramePointY\((\d+)\)/, `${className}.${action}`)[1]);
    assert((Number.isInteger(counts[row]) || Array.isArray(counts[row])) && Array.isArray(holds[row]), `${className}.${action}: unsupported row`);
    return { action, row, frameCount: counts[row], frameStopCount: holds[row],
      // Do not infer reachability from a row number: Phoenix has array counts
      // and conditional x/y guards that can preserve the previous row.
      entrySource: body.trim(), endSource: ending.trim() };
  });
  forms.push({ id: `${family}${n}`, className, symbol, candidates,
    cell: { width: Number(cell[1]), height: Number(cell[2]), point: cell[3].split(',').map(Number), offset },
    setActionSource: set.text.trim(), allFrameCounts: counts, allFrameStopCounts: holds,
    methods: Object.fromEntries([['initBBDC', init], ['setAction', set], ['scriptFrameOverFunc', over]].map(([k, { text, ...locator }]) => [k, locator])), actions });
}
assert.equal(forms.length, 19);
mkdirSync(output, { recursive: true });
writeFileSync(`${output}/source-inventory.json`, JSON.stringify({ status: 'draft',
  unresolved: ['source load precedence', 'native clock traces', 'visual baselines and display lists', 'independent mutations'], forms }, null, 2) + '\n');
console.log(`${forms.length} forms / ${forms.length * 2} actions extracted; draft only.`);
for (const f of forms) console.log(`${f.id}: ${f.symbol}; ${f.actions.map(a => `${a.action}=row${a.row}/${a.frameCount}frames/[${a.frameStopCount}]`).join('; ')}`);
