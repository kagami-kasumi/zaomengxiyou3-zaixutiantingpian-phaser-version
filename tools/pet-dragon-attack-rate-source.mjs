import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const mainFile = 'local-resources/regima/source/restored-swfs/1_MainLoad__main1.swf';
const output = 'local-resources/regima/task-outputs/task-slice-214c2-source-check';
const classes = ['base.BasePet', 'base.BaseObject', ...[1, 2, 3, 4].map((n) => `export.pet.PetDragon${n}`)];

/** Resolve executable constructor writes, rather than mistaking a trait default for the final value. */
export async function deriveDragonAttackRate(repoRoot) {
  const result = spawnSync('C:/Program Files (x86)/FFDec/ffdec-cli.exe', [
    '-selectclass', classes.join(','), '-format', 'script:pcode', '-export', 'script', output, mainFile,
  ], { cwd: repoRoot, encoding: 'utf8', timeout: 60000, windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(`Dragon constructor bytecode export failed: ${result.error ?? result.stderr}`);
  const files = await Promise.all(classes.map(async (name) => {
    const file = `${output}/scripts/${name.replaceAll('.', '/')}.pcode`;
    return { name, file, value: await readFile(path.join(repoRoot, file), 'utf8') };
  }));
  const base = files[0];
  const lines = base.value.split(/\r?\n/u);
  const writes = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^\s*(?:initproperty|setproperty) Multiname\("attackRate",/u.test(lines[i])) continue;
    const literal = lines[i - 1]?.trim().match(/^pushdouble ([\d.]+)$/u);
    if (lines[i - 2]?.trim() !== 'getlocal0' || !literal) throw new Error('Unresolved BasePet attackRate write');
    writes.push({ line: i + 1, value: Number(literal[1]) });
  }
  if (!writes.length) throw new Error('Missing executable BasePet attackRate initialization');
  const span = lines.slice(writes[0].line - 3, writes.at(-1).line).join('\n');
  if (/^\s*(?:if\w+|jump|lookupswitch)\b/mu.test(span)) throw new Error('Conditional constructor rate requires explicit control-flow resolution');
  for (const file of files.slice(1)) {
    if (/^\s*(?:initproperty|setproperty) .*"attackRate"/mu.test(file.value)) {
      throw new Error(`Unresolved superclass/subclass attackRate override: ${file.name}`);
    }
  }
  const sha256 = (value) => createHash('sha256').update(value).digest('hex');
  const source = { id: 'restored-main-code', file: mainFile,
    sha256: sha256(await readFile(path.join(repoRoot, mainFile))) };
  const report = {
    source, extractor: 'FFDec script:pcode selected BasePet, BaseObject and dragon1..4',
    writes, finalAttackRate: writes.at(-1).value,
    overrideCheck: files.slice(1).map(({ name }) => ({ class: name, writesAttackRate: false })),
    extracted: files.map(({ name, file, value }) => ({ class: name, file, sha256: sha256(value) })),
    scope: 'Executable constant assignment order and absence of direct overrides; not a full original combat replay',
  };
  const reportDir = path.join(repoRoot, 'docs/tasks/evidence/TASK-SLICE-214C2');
  await mkdir(reportDir, { recursive: true });
  await writeFile(path.join(reportDir, 'attack-rate-bytecode.json'), `${JSON.stringify(report, null, 2)}\n`);
  return { attackRate: report.finalAttackRate, source };
}
