import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { createHeroPartyGatherControl } from '../src/systems/HeroGatherCoordinateSystem';
import { createHeroPartyRuntimeModel, destroyHeroPartyRuntime } from '../src/systems/HeroPartyRuntimeSystem';
import { createMonster2AttackRuntime, stepMonster2AttackBody } from '../src/systems/Monster2AttackRuntime';
import { createStage12Flow, removeStage12Monster2 } from '../src/systems/Stage12FlowSystem';

const report = JSON.parse(readFileSync('docs/tasks/evidence/TASK-SETTINGS-256/roster.json', 'utf8')) as {
  rows: Array<any>;
};
const rows = report.rows.filter(row => row.fps !== undefined);
assert.equal(rows.length, 96, '256 player roster rows; door rows excluded');

for (const row of rows) {
  const definitions = (['p1', 'p2'] as const).flatMap((slot) => {
    const status = row[slot];
    if (status === 'absent') return [];
    return [{ slot, heroId: 1 as const, x: slot === 'p1' ? 400 : 500, y: 250, width: 40 }];
  });
  const party = createHeroPartyRuntimeModel(definitions);
  for (const slot of ['p1', 'p2'] as const) {
    if (row[slot] !== 'dead') continue;
    party.members.find(member => member.combat.slot === slot)!.combat.combat.state = 'dead';
  }
  for (const slot of ['p1', 'p2'] as const) {
    if (row[slot] !== 'ready') continue;
    party.members.find(member => member.combat.slot === slot)!.combat.combat.state = 'ready';
  }

  const gather = createHeroPartyGatherControl(party);
  const runtime = createMonster2AttackRuntime();
  const host = { id: `roster-${row.fps}-${row.direct}-${row.p1}-${row.p2}`,
    parentId: 'stage12', x: 300, y: 200, facingX: row.direct === 0 ? -1 as const : 1 as const,
    attackSerial: 1, state: 'hit2' as const };
  const source = { boss: false, hit: 0, criticalPercent: 0, magicDefenseReduction: 0,
    flower: false, random: () => 0.97 };
  const raws: unknown[] = [];
  const points: { x: number; y: number }[] = [];
  for (let tick = 1; tick <= 7; tick++) {
    stepMonster2AttackBody(runtime, host, false, source, tick * 1000 / row.fps, row.fps, 0,
      spawn => raws.push(spawn), point => {
        points.push({ x: point.x, y: point.y });
        gather.request(point);
      });
  }
  assert.deepEqual(points, [{ x: 300, y: 150 }], `${row.fps}/${row.direct}/${row.p1}/${row.p2} gather point`);
  assert.equal(raws.length, 1, `${row.fps}/${row.direct}/${row.p1}/${row.p2} raw hit2 spawn`);
  assert.equal(gather.snapshot().pending, row.tweens.length, `${row.fps}/${row.direct}/${row.p1}/${row.p2} pending roster targets`);
  gather.advance(1);

  const movedSlots = party.members.filter(member => member.movement.x === 300 && member.movement.y === 200)
    .map(member => member.combat.slot);
  const expectedSlots = row.tweens.map((tween: any) => tween.target);
  assert.deepEqual(movedSlots, expectedSlots, `${row.fps}/${row.direct}/${row.p1}/${row.p2} live/dead/ready selection`);
  assert.equal(raws.length, row.visuals, `${row.fps}/${row.direct}/${row.p1}/${row.p2} visual raw count`);
  assert.equal(runtime.attacks.length, row.created, `${row.fps}/${row.direct}/${row.p1}/${row.p2} enrolled bullet count`);
  gather.destroy();
  destroyHeroPartyRuntime(party);
}

const doorRows = report.rows.filter(row => row.kind === 'door');
assert.equal(doorRows.length, 6);
for (const row of doorRows) {
  const flow = createStage12Flow(1);
  flow.activeStopPointIdx = 4;
  flow.activeSpawners = [];
  const retained = row.other === 'absent' ? [] : [{ enemyType: 4,
    hp: row.other === 'alive' ? 100 : 0, phase: row.other === 'alive' ? 'approach' : 'dead' }];
  removeStage12Monster2(flow, 'monster2', row.boss, retained);
  assert.equal(flow.doorVisible, row.visible, `door boss=${row.boss}, Monster4=${row.other}`);
}
console.log(`Monster2 roster: ${rows.length} player rows and ${doorRows.length} native door cases passed; dead Monster4 remains registered.`);
