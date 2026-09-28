import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { createMonster30, updateMonster30, applyMonster30Hit } from '../src/systems/Monster30System';
import { createStage1CombatEnemy, createStage1CombatRuntime, createStage1CombatPlayer,
  resolveStage1EnemyAttack, updateStage1Enemy } from '../src/systems/Stage1CombatSystem';
import { stepMonsterPetTargetEffects } from '../src/systems/MonsterPetTargetEffectSystem';
import { adaptTestScenePetEnemies } from '../src/scenes/test-scene/TestScenePetEnemyAdapter';
import { destroyMonster30Attacks } from '../src/systems/Monster30AttackRuntime';

const reports: unknown[] = [];
for (const owner of ['sandbox', 'formal'] as const) for (const fps of [20, 24, 30]) {
  for (const scenario of ['normal', 'fatal-fire', 'fire', 'ice-first', 'hurt', 'dead', 'destroy', 'pause', 'ice-held', 'ice-expiry', 'last-frame-hit'] as const) {
    const sandbox = createMonster30(300, 200, `${owner}-${fps}-${scenario}`);
    const formal = createStage1CombatEnemy({ id: sandbox.id, enemyType: 30, x: 300, y: 200 });
    const host = owner === 'sandbox' ? sandbox : formal;
    sandbox.state = 'hit1'; sandbox.stateTimerMs = 10000; sandbox.attackSerial = 1;
    formal.phase = 'windup'; formal.phaseRemainingMs = 10000; formal.attackSerial = 1;
    const enemy = owner === 'sandbox' ? adaptTestScenePetEnemies([sandbox], () => {})[0]! : formal;
    const state = host.petTargetEffectState!;
    const step = (delta = 1000 / fps) => {
      if (owner === 'sandbox') updateMonster30(sandbox, [], delta, () => 1, fps);
      else { stepMonsterPetTargetEffects(formal, delta, fps); updateStage1Enemy({ enemy: formal, targets: [], deltaMs: delta }); }
    };
    if (scenario === 'fatal-fire' || scenario === 'fire') {
      host.hp = scenario === 'fatal-fire' ? 1 : 100;
      state.effects.add({ name: 'petmonkey_fire', time: fps * 2, hurt: 1 });
    }
    if (scenario === 'ice-held' || scenario === 'ice-expiry') {
      // First show occurs with locomotion; arm only after the real effect owns the body stop.
      sandbox.state = 'wait'; formal.phase = 'idle';
      state.effects.add({ name: 'pethorse_ice', time: scenario === 'ice-held' ? 100 : 2 }); step();
      sandbox.state = 'hit1'; formal.phase = 'windup';
      for(let i=0;i<2;i++) { step(); assert.equal(host.attackRuntime!.attacks.length,0); assert.equal(host.attackRuntime!.body.actionTick,0); }
      if(scenario === 'ice-held') { reports.push({owner,fps,scenario,blockedBeforeCallback:true}); continue; }
      assert.equal(state.iceVisible,false,'expiry tick still stopped the body');
    }
    if (scenario === 'ice-first') state.effects.add({ name: 'pethorse_ice', time: 2 });
    step();
    assert.equal(host.attackRuntime!.attacks.length, 1, 'first ice show follows body; fatal fire cannot retract emission');
    const birth = structuredClone(host.attackRuntime!.attacks[0]!);
    assert.deepEqual([birth.x,birth.y],[300,200]);
    if(scenario==='fire') assert.equal(host.hp,99);
    host.x += 80; host.y += 40;
    assert.equal(host.attackRuntime!.detections.length, 0, 'new bullet waits for next world step');
    if (scenario === 'fatal-fire') {
      assert.equal(host.hp, 0); assert.equal(host.attackRuntime!.body.action, 'dead');
      assert.equal(host.attackRuntime!.body.actionTick, 0, 'effects select death without retroactive body step');
    }
    if (scenario === 'hurt' || scenario === 'dead') {
      if (owner === 'sandbox') applyMonster30Hit(sandbox, scenario === 'dead' ? 99999 : 1);
      else { formal.phase = scenario; formal.hp = scenario === 'dead' ? 0 : formal.hp - 1; formal.activeAttack = undefined; }
    }
    if (scenario === 'pause') {
      const before = structuredClone(host.attackRuntime);
      for (let i = 0; i < 3; i++) step(0);
      assert.deepEqual(host.attackRuntime, before);
    }
    if (scenario === 'destroy') {
      destroyMonster30Attacks(host); step();
      assert.equal(host.attackRuntime!.attacks.length, 0); assert.equal(host.attackRuntime!.detections.length, 0);
      reports.push({ owner, fps, scenario, cleared: true }); continue;
    }
    const combat = createStage1CombatRuntime();
    const players = (['p1', 'p2'] as const).map(slot => ({ player: createStage1CombatPlayer(slot), x: 280, y: 200 }));
    players[1]!.player.effectiveStats = {...players[1]!.player.effectiveStats,defense:4};
    if(scenario==='last-frame-hit') players.forEach(p=>p.player.combat.magicInvulnerability=true);
    const frames: number[] = []; const hpBefore = players.map(p => p.player.combat.hp);
    const ids: string[] = [];
    for (let i = 0; i < 10; i++) {
      step();
      frames.push(...host.attackRuntime!.detections.map(a => a.frame));
      for(const attack of host.attackRuntime!.detections) {
        assert.deepEqual([attack.x,attack.y,attack.sourceId,attack.attackId],[birth.x,birth.y,host.id,birth.attackId]);
      }
      if(scenario==='ice-first' && i<2) assert.equal(host.attackRuntime!.body.actionTick,1,'existing bullet advances while body is frozen, including expiry tick');
      if(scenario==='ice-first' && i===2) assert.equal(host.attackRuntime!.body.actionTick,2,'body resumes after expiry');
      if(scenario==='last-frame-hit' && i===9) players.forEach(p=>p.player.combat.magicInvulnerability=false);
      const events = resolveStage1EnemyAttack({ runtime: combat, enemy, players, timeMs: (i + 2) * 1000 / fps });
      if(scenario==='last-frame-hit') assert.equal(events.length,i===9?2:0,'protection does not consume the final-frame first hit');
      ids.push(...events.map(e => e.attackId));
      assert.equal(resolveStage1EnemyAttack({ runtime: combat, enemy, players, timeMs: (i + 2) * 1000 / fps }).length, 0);
    }
    assert.deepEqual(frames, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    assert.equal(host.attackRuntime!.attacks.length, 0);
    assert.deepEqual(players.map(p => p.player.combat.hp), hpBefore.map((hp,index) => hp - (index===0?13:11)));
    destroyMonster30Attacks(host);
    assert.equal(host.attackRuntime!.detections.length,0,'destroy clears final pending detection');
    assert.equal(ids.length, 2); assert.equal(new Set(ids).size, 1, 'same independent attack, separate P1/P2 target identities');
    reports.push({ owner, fps, scenario, frames, hpBefore, hpAfter: players.map(p => p.player.combat.hp), damageEvents: ids.length });
  }
}
mkdirSync('docs/tasks/evidence/TASK-SLICE-240', { recursive: true });
writeFileSync('docs/tasks/evidence/TASK-SLICE-240/lifecycle.json', JSON.stringify({ status: 'passed', reports }, null, 2));
console.log(`Monster30 lifecycle: ${reports.length} dual-owner/FPS boundaries, actual hero HP and events passed`);
