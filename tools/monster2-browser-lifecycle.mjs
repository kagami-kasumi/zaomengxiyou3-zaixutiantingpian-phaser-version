import assert from 'node:assert/strict';

const partyExpr = () => 'heroGatherObserve.parties.find(p=>p.scene===monster2Observe.scene&&!p.model.destroyed)';
const captureExpr = `(() => {
  const party=${partyExpr()};
  const target=monster2Observe.monsters.combatTargets().find((m)=>m.enemyType===2);
  window.monster2LifecycleCapture ??= {attacks:[],raw:[]};
  for (const attack of target?.monster2AttackRuntime?.attacks ?? [])
    if (!window.monster2LifecycleCapture.attacks.includes(attack)) window.monster2LifecycleCapture.attacks.push(attack);
  for (const image of monster2Observe.scene.children.list.filter((v)=>v.name==='Monster2Bullet2'))
    if (!window.monster2LifecycleCapture.raw.includes(image)) window.monster2LifecycleCapture.raw.push(image);
  window.retainedMonster2Runtime=target?.monster2AttackRuntime;
  window.retainedMonster2Party=party;
  window.retainedMonster2Members=party?.model.members.map((m)=>m.movement) ?? [];
  window.retainedMonster2Gather=party?.runtime.gather;
  return {attacks:window.monster2LifecycleCapture.attacks.length,raw:window.monster2LifecycleCapture.raw.length};
})()`;

async function runUntilObserved({ evaluate, delay, fps }) {
  for (let i = 0; i < fps * 16; i += 1) {
    await evaluate('monster2Probe.step(1)');
    const seen = await evaluate(captureExpr);
    if (seen.attacks > 0 && seen.raw > 0) return seen;
    await delay(5);
  }
  return await evaluate(captureExpr);
}

async function runImmediateRestart({ evaluate, delay, fps, slots, kind }) {
  await evaluate('window.monster2RestartPrevious=monster2Observe.heroes; heroGatherProbe.restart()');
  for (let i = 0; i < 250; i += 1) {
    await evaluate('heroGatherProbe.step(1)'); await delay(20);
    if (await evaluate('monster2Observe.heroes!==window.monster2RestartPrevious && heroGatherProbe.ready()?.scene === "Stage12Scene" && !heroGatherProbe.ready()?.loading')) break;
  }
  await evaluate(`monster2Probe.prepare(${fps},${JSON.stringify(slots)}); window.monster2RestartCapture={attack:null,raw:null}`);
  for (let i = 0; i < fps * 16; i += 1) {
    await evaluate('monster2Probe.step(1)');
    const found = await evaluate(`(() => {
      const target=monster2Observe.monsters.combatTargets().find((m)=>m.enemyType===2);
      const attack=target?.monster2AttackRuntime?.attacks.find((a)=>a.source&&a.parentId);
      const raw=monster2Observe.scene.children.list.find((v)=>v.name==='Monster2Bullet2'&&v.active);
      window.monster2RestartCapture.attack ??= attack;
      window.monster2RestartCapture.raw ??= raw;
      window.monster2RestartCapture.party ??= ${partyExpr()};
      window.monster2RestartCapture.runtime ??= target?.monster2AttackRuntime;
      window.monster2RestartCapture.gather ??= window.monster2RestartCapture.party?.runtime.gather;
      return {attack:!!window.monster2RestartCapture.attack,raw:!!window.monster2RestartCapture.raw};
    })()`);
    if (found[kind]) break;
    await delay(5);
  }
  const observed = await evaluate('({attack:!!monster2RestartCapture.attack,raw:!!monster2RestartCapture.raw})');
  assert.equal(observed[kind], true, `restart sample must observe active ${kind}`);
  await evaluate('heroGatherProbe.restart()');
  let ready;
  for (let i = 0; i < 250; i += 1) {
    await evaluate('heroGatherProbe.step(1)'); await delay(20);
    ready = await evaluate(`({ready:heroGatherProbe.ready(),old:monster2RestartCapture.party?.model.destroyed})`);
    if (ready.old && ready.ready?.scene === 'Stage12Scene' && !ready.ready.loading) break;
  }
  const cleaned = await evaluate(`({destroyed:monster2RestartCapture.runtime?.destroyed,
    source:monster2RestartCapture.attack?.source,parentId:monster2RestartCapture.attack?.parentId,
    rawActive:monster2RestartCapture.raw?.active,gatherDisposed:monster2RestartCapture.gather?.snapshot().disposed})`);
  assert.equal(cleaned.destroyed, true, `${kind} restart destroys old runtime`);
  if (kind === 'attack') { assert.equal(cleaned.source, undefined, 'restart clears active attack source'); assert.equal(cleaned.parentId, undefined, 'restart clears active attack parent'); }
  else assert.equal(cleaned.rawActive, false, 'restart deactivates active raw image');
  assert.equal(cleaned.gatherDisposed, true, `${kind} restart disposes old gather`);
  for (let i = 0; i < 3; i += 1) { await evaluate('heroGatherProbe.step(1)'); await delay(5); }
  const after = await evaluate(`({source:monster2RestartCapture.attack?.source,parentId:monster2RestartCapture.attack?.parentId,
    rawActive:monster2RestartCapture.raw?.active})`);
  assert.equal(after.source, undefined, `${kind} old attack source stays cleared`);
  assert.equal(after.parentId, undefined, `${kind} old attack parent stays cleared`);
  if (observed.raw) assert.equal(after.rawActive, false, `${kind} old raw stays inactive`);
  return { kind, observed, cleaned, ready: ready?.ready };
}

export async function assertMonster2Lifecycle({ evaluate, command, delay, fps, slots }) {
  const restartResults = [];
  restartResults.push(await runImmediateRestart({ evaluate, delay, fps, slots, kind: 'attack' }));
  restartResults.push(await runImmediateRestart({ evaluate, delay, fps, slots, kind: 'raw' }));
  await evaluate(`monster2Probe.prepare(${fps},${JSON.stringify(slots)}); window.monster2LifecycleCapture={attacks:[],raw:[]}`);
  let seen = await runUntilObserved({ evaluate, delay, fps });
  assert(seen.attacks > 0, 'natural Stage12 run must register Monster2 attacks');
  assert(seen.raw > 0, 'natural Stage12 run must create Monster2 raw display');
  for (const destination of ['retry', 'back']) {
    if (destination === 'back') {
      await evaluate(`monster2Probe.prepare(${fps},${JSON.stringify(slots)}); window.monster2LifecycleCapture={attacks:[],raw:[]}`);
      seen = await runUntilObserved({ evaluate, delay, fps });
      assert(seen.attacks > 0 && seen.raw > 0, 'back run must observe attack and raw references');
    }
    await evaluate('heroGatherProbe.fail()');
    for (let i = 0; i < 90; i += 1) { await evaluate('heroGatherProbe.step(1)'); await delay(5); }
    await evaluate(`heroGatherProbe.activateResult('${destination}')`);
    let transition;
    for (let i = 0; i < 260; i += 1) {
      await evaluate('heroGatherProbe.step(1)'); await delay(15);
      transition = await evaluate(`({oldDestroyed:retainedMonster2Party?.model.destroyed,
        runtimeDestroyed:retainedMonster2Runtime?.destroyed, attacks:retainedMonster2Runtime?.attacks.length,
        sources:monster2LifecycleCapture.attacks.map(a=>({source:!!a.source,parentId:a.parentId})),
        raw:monster2LifecycleCapture.raw.map(v=>({active:v.active,visible:v.visible})),
        gatherDisposed:retainedMonster2Gather?.snapshot().disposed, liveParties:heroGatherObserve.parties.filter(p=>!p.model.destroyed).length,
        ready:heroGatherProbe.ready()})`);
      const targetReady = destination === 'retry'
        ? transition.liveParties === 1
        : transition.ready?.activeScenes?.includes('HeavenMapScene');
      if (transition.oldDestroyed && targetReady) break;
    }
    assert.equal(transition.oldDestroyed, true, `${destination} destroys old Monster2 owner`);
    assert.equal(transition.runtimeDestroyed, true, `${destination} destroys Monster2 runtime`);
    assert.equal(transition.attacks, 0, `${destination} clears registered attacks`);
    assert(transition.sources.length > 0 && transition.sources.every((a) => !a.source && a.parentId === undefined), `${destination} releases attack source/parent`);
    assert(transition.raw.length > 0 && transition.raw.every((v) => !v.active), `${destination} deactivates raw Monster2 images`);
    assert.equal(transition.gatherDisposed, true, `${destination} disposes old gather controller`);
    if (destination === 'retry') assert.equal(transition.liveParties, 1, 'retry keeps one party');
    else assert(transition.ready?.activeScenes?.includes('HeavenMapScene'), 'back returns through the real map route');
    const frozen = await evaluate('retainedMonster2Members.map(m=>({x:m.x,y:m.y}))');
    await evaluate('retainedMonster2Gather.advance(heroGatherGame.loop.time/1000+20); heroGatherProbe.step(3)');
    assert.deepEqual(await evaluate('retainedMonster2Members.map(m=>({x:m.x,y:m.y}))'), frozen, `${destination} freezes old owner coordinates`);
  }
  await command('Page.reload');
  let ready;
  for (let i = 0; i < 350; i += 1) {
    await evaluate('window.heroGatherProbe?.pumpLoading()'); ready = await evaluate('window.heroGatherProbe?.ready()');
    if (ready?.scene === 'Stage12Scene' && !ready.loading) break;
    await delay(100);
  }
  assert.equal(ready?.scene, 'Stage12Scene', 'reload returns to Stage12Scene');
  const fresh = await evaluate(`({parties:heroGatherObserve.parties.filter(p=>!p.model.destroyed).length,
    scene:heroGatherProbe.ready()?.scene, events:window.monster2Events?.length ?? 0})`);
  assert.equal(fresh.parties, 1, 'reload creates one fresh party');
  assert.equal(fresh.scene, 'Stage12Scene', 'reload creates a fresh Stage12 owner');
  assert.equal(fresh.events, 0, 'reload has no retained Monster2 events');
  return { status: 'passed', fps, slots, scene: fresh.scene, restartResults };
}
