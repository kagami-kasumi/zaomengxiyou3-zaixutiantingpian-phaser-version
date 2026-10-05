import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { assertMonster2Lifecycle } from './monster2-browser-lifecycle.mjs';
const reportTag = () => process.env.HG_REPORT_TAG ? `-${process.env.HG_REPORT_TAG}` : '';
const reportFile = (base, ext='json') => `${base}${reportTag()}.${ext}`;
export async function assertMonster2Scene({evaluate,command,delay,fps,slots,variant}) {
  const petsMode = process.env.HG_PETS === '1';
  const keepOtherMonsters = process.env.HG_KEEP_OTHER_MONSTERS === '1';
  const initial=await evaluate(`monster2Probe.prepare(${fps},${JSON.stringify(slots)},${petsMode},${keepOtherMonsters})`);
  if (process.env.HG_VISUAL_ONLY === '1') {
    const visuals=await evaluate('monster2Probe.captureVisuals()');
    mkdirSync('docs/tasks/evidence/TASK-SLICE-260B/browser',{recursive:true});
    writeFileSync(`docs/tasks/evidence/TASK-SLICE-260B/browser/${reportFile(variant === 'baseline' ? 'registered-visuals' : `registered-visuals-${variant}`)}`,JSON.stringify(visuals));
    return {status:'passed',fps,slots,visualStates:visuals.states.length,
      boundary:'Actual isolated view framebuffer capture; independent pixel verification required'};
  }
  const history=[];let pause;
  for(let tick=1;tick<=fps*16;tick++) {
    const state=await evaluate('monster2Probe.step(1)');
    if(tick%fps===0)history.push(state);
    if(!pause && state.raw.length) {
      const before=await evaluate('monster2Probe.pause()');
      const after=await evaluate('monster2Probe.step(20)');
      assert.deepEqual(after.heroes,before.heroes,'paused real owners freeze');
      assert.deepEqual(after.monsters,before.monsters,'paused registered attacks freeze');
      assert.equal(after.raw.length,0,'naked MC continues and removes during Scene pause');
      assert(after.gather.paused);
      pause={before,after,resumed:await evaluate('monster2Probe.resume()')};
    }
  }
  const final=await evaluate('monster2Probe.snapshot()');
  mkdirSync('docs/tasks/evidence/TASK-SLICE-260B/browser',{recursive:true});
  writeFileSync(`docs/tasks/evidence/TASK-SLICE-260B/browser/${reportFile(`observation-${fps}-${slots.join('-')}`)}`,JSON.stringify({initial,history,final,pause},null,2));
  // The default matrix owns gather/pause coverage; active pets can interrupt gather.
  if (!petsMode) assert(pause,'natural gather must create a naked MC');
  assert(final.events.some(e=>e.kind==='bullet'&&e.attack===1),'natural first attack');
  assert(final.events.some(e=>e.kind==='bullet'&&e.attack===2),'natural second attack');
  if (!petsMode) assert(final.events.some(e=>e.kind==='gather'),'natural gather');
  assert(final.heroes.filter(h=>slots.includes(h.slot)).every(h=>h.hp<10000),'real selected hero HP decreases');
  if (petsMode) {
    const selectedPets = slots.map(slot => final.pets?.[slot]);
    assert(selectedPets.every(Boolean),'each selected slot has a real active pet roster entry');
    assert(selectedPets.every(p=>p.id && p.runtimeKey && p.petId===p.id),'each selected pet exposes a real Session identity');
    const emittedPetIds=final.events.filter(e=>e.kind==='bullet').map(e=>e.id+':');
    assert(selectedPets.every(p=>p.sessionHitIds.some(id=>emittedPetIds.some(prefix=>id.startsWith(prefix)))),
      'each selected real Pet Session records a naturally emitted Monster2 attack ID');
    for (const slot of slots) {
      const pet = final.pets[slot];
      assert(final.petReceptionTrace.some(row => row.slot === slot && row.petId === pet.id
        && emittedPetIds.some(prefix => row.attackId.startsWith(prefix))
        && row.hpBefore > row.hpAfter),
      `${slot} actual current pet HP decreases inside a naturally emitted Monster2 reception`);
    }
    assert(selectedPets.every(p=>p.hp<10000),'real selected pet HP decreases from natural Monster2 reception');
  }
  const emittedIds=final.events.filter(e=>e.kind==='bullet').map(e=>e.id+':');
  assert(final.heroes.filter(h=>slots.includes(h.slot)).every(h=>
    h.hitIds.some(id=>emittedIds.some(prefix=>id.startsWith(prefix)))),
    'each selected actual HP owner records a naturally emitted Monster2 attack ID');
  assert(final.monsters.filter(m=>m.type===2).every(m=>!m.oldAttack),'legacy hitbox retired');
  const visuals = process.env.HG_VISUAL === '1' ? await evaluate('monster2Probe.captureVisuals()') : undefined;
  if(visuals) writeFileSync(`docs/tasks/evidence/TASK-SLICE-260B/browser/${reportFile(variant === 'baseline' ? 'registered-visuals' : `registered-visuals-${variant}`)}`,JSON.stringify(visuals));
  const lifecycle = process.env.HG_LIFECYCLE === '1'
    ? await assertMonster2Lifecycle({evaluate,command,delay,fps,slots}) : undefined;
  return {status:variant === 'baseline' ? 'passed' : 'survived',fps,slots,boundary:'Controlled encounter entry, natural producer and actual Scene owners',initial,history,pause,final,lifecycle};
}
