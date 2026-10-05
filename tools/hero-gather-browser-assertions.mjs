import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

export async function assertGatherScene({ evaluate, command, delay, fps, slots, variant }) {
  await evaluate(`heroGatherProbe.prepare(${fps}); heroGatherProbe.configure(${fps})`);
  const initial = await evaluate('heroGatherProbe.resetFixture([1,-1])');
  assert.equal(initial.length, 2);
  await evaluate(`heroGatherProbe.request(400,250,${JSON.stringify(slots)}); heroGatherProbe.resetTrace(); heroGatherProbe.step(1)`);
  const requested = await evaluate('heroGatherProbe.snapshot()');
  const sequence = ['tween-before','tween-after','monster-world','hero-update','hero-projectiles','pets-update','hero-done','resolve-attacks'];
  assert.deepEqual(requested.traces.map(row => row.phase), [...sequence.slice(0,3),'fixture-request',...sequence.slice(3)], 'request must precede actual hero owner');
  assert.equal(requested.gather.pending, slots.length, 'one pending request per selected actual owner');
  const requestedPose = requested.traces.find(row => row.phase === 'hero-done').pose;
  const near = (actual, expected, label) => assert(Math.abs(actual-expected)<1e-8, `${label}: ${actual} != ${expected}`);
  for (let i=0; i<2; i++) {
    const speed = initial[i].heroId === 5 ? 7 : 6;
    near(requestedPose[i].rootX, initial[i].rootX + (i ? -speed : speed), 'ordinary host move at request');
    near(requestedPose[i].rootY, initial[i].rootY, 'integrate before first gravity');
  }
  await evaluate('heroGatherProbe.pause(); heroGatherProbe.step(5)');
  const paused = await evaluate('heroGatherProbe.snapshot()');
  assert.deepEqual(paused.heroes, requested.heroes, 'paused Scene changed coordinates');
  assert.equal(paused.traceCount, requested.traceCount, 'paused Scene advanced owners');
  assert(paused.gather.paused);
  await evaluate('heroGatherProbe.resume(); heroGatherProbe.resetTrace(); heroGatherProbe.step(1)');
  const resumed = await evaluate('heroGatherProbe.snapshot()');
  mkdirSync('docs/tasks/evidence/TASK-SLICE-260A/browser',{recursive:true});
  writeFileSync(`docs/tasks/evidence/TASK-SLICE-260A/browser/observation-${fps}-${slots.join('-')}-${variant}.json`,JSON.stringify({initial,requested,paused,resumed},null,2));
  assert.deepEqual(resumed.traces.map(row => row.phase), sequence, 'one ordered aggregate owner update per world step');
  assert(resumed.gather.time >= requested.gather.time, 'world clock must be monotonic');
  assert(resumed.traces[1].clock >= resumed.traces[0].clock,'resume may not run coordinate clock backwards');
  const resumePose = resumed.traces.find(row => row.phase === 'hero-done').pose;
  assert.deepEqual(resumed.traces.find(row=>row.phase==='tween-before').pose,
    resumed.traces.find(row=>row.phase==='tween-after').pose,'resume at the current world timestamp does not render elapsed time');
  await evaluate('heroGatherProbe.resetTrace(); heroGatherProbe.step(1)');
  const next = await evaluate('heroGatherProbe.snapshot()');
  const tweenPose = next.traces.find(row => row.phase === 'tween-after').pose;
  const finalPose = next.traces.find(row => row.phase === 'hero-done').pose;
  // Frozen 257B rules: lazy start is the request frame's post-move pose;
  // one-second easeOut, twip truncation, and zero paused elapsed duration.
  const twip = n => Math.trunc(n*20)/20;
  const elapsed = next.gather.time - resumed.gather.time;
  near(elapsed,1/fps,'one host interval after queued resume');
  const ease = 1-(1-elapsed)*(1-elapsed);
  for (let i=0; i<2; i++) {
    const selected = slots.includes(resumePose[i].slot);
    const x = selected ? twip(resumePose[i].rootX+(400-resumePose[i].rootX)*ease) : resumePose[i].rootX;
    const y = selected ? twip(resumePose[i].rootY+(250-resumePose[i].rootY)*ease) : resumePose[i].rootY;
    near(tweenPose[i].rootX,x,'lazy tween root x'); near(tweenPose[i].rootY,y,'lazy tween root y');
    const speed = initial[i].heroId === 5 ? 7 : 6;
    near(finalPose[i].rootX,twip(x+(i ? -speed : speed)),'hero after tween x');
    near(finalPose[i].rootY,twip(y+3),'hero after tween gravity');
  }
  if (variant !== 'baseline') return {status:'survived',variant,fps,slots};
  const lifecycle = [];
  if (process.env.HG_LIFECYCLE !== '0') {
    for (const destination of ['retry','back']) {
      await evaluate(`window.retainedGatherParty = heroGatherObserve.parties.find(p=>!p.model.destroyed);
        window.retainedGatherMembers = retainedGatherParty.model.members.map(m=>m.movement);
        heroGatherProbe.fail();`);
      for (let i=0;i<80;i++) { await evaluate('heroGatherProbe.step(1)'); await delay(5); }
      await evaluate(`heroGatherProbe.activateResult('${destination}')`);
      let transition;
      for (let i=0;i<250;i++) {
        await evaluate('heroGatherProbe.step(1)'); await delay(20);
        transition = await evaluate(`({ready:heroGatherProbe.ready(),oldDestroyed:retainedGatherParty.model.destroyed,
          oldDisposed:retainedGatherParty.runtime.gather.snapshot().disposed,
          liveParties:heroGatherObserve.parties.filter(p=>!p.model.destroyed).length})`);
        if (transition.oldDestroyed && (destination==='retry' ? transition.liveParties===1 : transition.ready.activeScenes.includes('HeavenMapScene'))) break;
      }
      assert.equal(transition.oldDestroyed,true,`${destination} must destroy old party`);
      assert.equal(transition.oldDisposed,true,`${destination} must dispose old coordinate controller`);
      if(destination==='retry') assert.equal(transition.liveParties,1,'retry creates exactly one new party');
      else assert(transition.ready.activeScenes.includes('HeavenMapScene'),'back follows real HeavenMap route');
      const frozen = await evaluate('retainedGatherMembers.map(m=>({x:m.x,y:m.y}))');
      await evaluate('retainedGatherParty.runtime.gather.advance(heroGatherGame.loop.time/1000+20); heroGatherProbe.step(3)');
      assert.deepEqual(await evaluate('retainedGatherMembers.map(m=>({x:m.x,y:m.y}))'),frozen,'old target must stay frozen after exit');
      lifecycle.push({destination,...transition});
    }
    await command('Page.reload');
    let reloaded;
    for(let i=0;i<350;i++){await evaluate('window.heroGatherProbe?.pumpLoading()');reloaded=await evaluate('window.heroGatherProbe?.ready()');if(reloaded?.scene==='Stage12Scene'&&!reloaded.loading)break;await delay(100);}
    assert.equal(reloaded?.scene,'Stage12Scene','reload real QA entry');
    assert.equal((await evaluate('heroGatherProbe.snapshot()')).heroes.length,2);
    lifecycle.push({destination:'reload',ready:reloaded});
  }
  return {status:'passed',variant,fps,slots,initial,requested,paused,resumed,next,lifecycle};
}
