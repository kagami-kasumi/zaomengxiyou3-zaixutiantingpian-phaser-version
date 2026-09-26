import { readFileSync } from 'node:fs';
type Row = { id: string; phase: string; tick: number; bullets: {
  birthTick: number; calls: { kind: string; dead: boolean }[];
}[] };
const measurements = new Map<string, Row[]>();
export function firstPrivateCollisionAge(family: 'monkey' | 'horse', form: number): number {
  if (!measurements.has(family)) measurements.set(family, JSON.parse(readFileSync(
    `local-resources/regima/task-outputs/TASK-SETTINGS-${family === 'monkey' ? 228 : 229}/joint-air/measurement-24.json`, 'utf8')).rows);
  const row = measurements.get(family)!.find(r => r.id === `${form}-hit1-P1--1` && r.phase === 'enter'
    && r.bullets.some(b => b.calls.some(c => c.kind === 'attack' && !c.dead)));
  if (!row) throw new Error(`Missing native first collision step for ${family}${form}`);
  return row.tick - row.bullets[0]!.birthTick;
}
