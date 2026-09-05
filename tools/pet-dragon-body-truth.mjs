import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

export const dragonSourceRoot = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts';
const names = { hit1: 'normal', hit2: 'fs', hit3: 'sdcc', hit4: 'ltwj', hit5: 'qlaoyi', hit6: 'qlaoyi-ltwj-link' };

function method(text, name) {
  const start = text.indexOf(`function ${name}(`);
  if (start < 0) throw new Error(`Missing ${name}`);
  const begin = text.indexOf('{', start);
  let end = begin + 1, depth = 1;
  while (depth && end < text.length) {
    if (text[end] === '{') depth++;
    if (text[end] === '}') depth--;
    end++;
  }
  if (depth) throw new Error(`Unclosed ${name}`);
  return { code: text.slice(begin + 1, end - 1).replace(/\r\n/gu, '\n'), startLine: text.slice(0, start).split('\n').length };
}

function cases(code) {
  return [...code.matchAll(/case "([^"]+)":([\s\S]*?)(?=case "|$)/gu)]
    .map((m) => [m[1], m[2].trim()]);
}

export async function buildDragonBodyTimelines(root) {
  const timelines = [];
  for (let form = 1; form <= 4; form++) {
    const file = `${dragonSourceRoot}/export/pet/PetDragon${form}.as`;
    const text = await readFile(path.join(root, file), 'utf8');
    const init = method(text, 'initBBDC'), select = method(text, 'setAction'), over = method(text, 'scriptFrameOverFunc');
    const holds = JSON.parse(init.code.match(/setFrameStopCount\((\[[^;]+\])\)/u)[1]);
    const counts = JSON.parse(init.code.match(/setFrameCount\((\[[^;]+\])\)/u)[1]);
    const transitions = new Map(cases(over.code));
    const actions = cases(select.code).map(([sourceAction, code]) => {
      const row = Number(code.match(/setFramePointY\((\d+)\)/u)[1]);
      if (holds[row].length !== counts[row]) throw new Error(`${file} row ${row} hold count`);
      const transitionCode = transitions.get(sourceAction);
      if (!transitionCode) throw new Error(`${file} ${sourceAction} missing frame-over`);
      let tick = 0;
      const cells = holds[row].map((holdTicks, column) => {
        const cell = { column, holdTicks, firstHostTick: tick + 1, lastHostTick: tick + holdTicks };
        tick += holdTicks;
        return cell;
      });
      return {
        id: names[sourceAction] ?? sourceAction, sourceAction, row, cells,
        totalHostTicks: tick, loops: ['wait', 'walk'].includes(sourceAction),
        entry: { resetColumnOnlyOnRowChange: true, clearAoyi: code.includes('this.isAoyi = false') },
        completion: {
          resetColumn: transitionCode.includes('setFramePointX(0)'),
          setStatic: transitionCode.includes('this.setStatic()'),
          destroys: transitionCode.includes('this.destroy()'),
          sourceCode: transitionCode,
          routes: sourceAction === 'dead' ? [{ when: [], target: 'destroy' }]
            : ['wait', 'walk'].includes(sourceAction) ? [{ when: [], target: names[sourceAction] ?? sourceAction }]
            : form === 4 && sourceAction === 'hit3' ? [{ when: ['isAoyi', 'learned:ltwj'], target: 'ltwj', free: true }, { when: [], target: 'wait' }]
            : form === 4 && sourceAction === 'hit5' ? [{ when: ['isAoyi', 'learned:sdcc'], target: 'sdcc', free: true }, { when: ['isAoyi', 'learned:ltwj'], target: 'qlaoyi-ltwj-link' }, { when: [], target: 'wait' }]
            : form === 4 && sourceAction === 'hit6' ? [{ when: [], target: 'ltwj', free: true }]
            : [{ when: [], target: 'wait' }],
        },
      };
    });
    timelines.push({ form, source: { file, sha256: createHash('sha256').update(text).digest('hex'), initLine: init.startLine, setActionLine: select.startLine, frameOverLine: over.startLine }, rowCount: counts.length, actions });
  }
  return timelines;
}
