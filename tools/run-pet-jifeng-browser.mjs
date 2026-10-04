import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir = path.resolve('dist/__pet_jifeng'), out = 'docs/tasks/evidence/TASK-SLICE-253/browser';
mkdirSync(dir, { recursive: true }); mkdirSync(out, { recursive: true });
const mutation = process.env.PET_JIFENG_BROWSER_MUTATION;
const mutationFiles = {
  'owner-death': ['TestScenePetMagicBridge.ts', '      clearRosterPetRabbitJifeng(this.petRoster);'],
  'scene-exit': ['TestSceneStage11RuntimeAdapter.ts', '          clearRosterPetRabbitJifeng(scene.p2PetRoster);'],
  'party-exit': ['HeroPartyRuntimeBridge.ts', '      for (const roster of Object.values(petRosters)) clearRosterPetRabbitJifeng(roster);'],
};
if (mutation) assert(mutationFiles[mutation], `Unknown mutation: ${mutation}`);
await build({ entryPoints: ['tools/pet-jifeng-browser-probe.ts'], bundle: true, format: 'iife',
  outfile: path.join(dir, 'probe.js'), logLevel: 'silent', external: ['/assets/*'],
  plugins: mutation ? [{ name: 'production-lifecycle-mutation', setup(builder) {
    const [file, anchor] = mutationFiles[mutation];
    builder.onLoad({ filter: new RegExp(file.replace('.', '\\.') + '$') }, args => {
      if (path.basename(args.path) !== file) return undefined;
      const source = readFileSync(args.path, 'utf8'); assert(source.includes(anchor), `Missing mutation anchor: ${mutation}`);
      return { loader: 'ts', contents: source.replace(anchor, '') };
    });
  } }] : [],
  define: { 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true', 'import.meta.env.MODE': '"production"', 'import.meta.env.BASE_URL': '"/"' } });
writeFileSync(path.join(dir, 'index.html'), '<html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="probe.css"></head><body><div id="game"></div><script src="probe.js"></script></body></html>');
const port = 19000 + process.pid % 10000;
const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--no-first-run',
  '--no-default-browser-check', `--remote-debugging-port=${port}`, `--user-data-dir=${path.resolve('.tmp/pet-jifeng-profile-' + port)}`, 'about:blank'],
  { stdio: 'ignore', windowsHide: true });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket, id = 0; const pending = new Map(), errors = [], rows = [];
async function command(method, params = {}) {
  const key = ++id;
  const promise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(key); reject(Error(`CDP timeout: ${method}`)); }, 30000);
    pending.set(key, { resolve: value => { clearTimeout(timer); resolve(value); }, reject: error => { clearTimeout(timer); reject(error); } });
  });
  socket.send(JSON.stringify({ id: key, method, params })); return promise;
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function ready() {
  for (let i = 0; i < 400; i++) {
    if (await evaluate('window.jifengProbe?.ready()')) return;
    await evaluate('window.jifengProbe?.pump()'); await delay(100);
  }
  throw Error('Scene readiness timeout');
}
try {
  let page;
  for (let i = 0; i < 100; i++) {
    try { page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(p => p.type === 'page'); } catch {}
    if (page) break; await delay(100);
  }
  assert(page); socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) { const waiter = pending.get(message.id); pending.delete(message.id); if (message.error) waiter?.reject(message.error); else waiter?.resolve(message.result); }
    else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params);
  });
  await command('Runtime.enable'); await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 940, height: 590, deviceScaleFactor: 1, mobile: false });
  await command('Page.navigate', { url: 'http://127.0.0.1:4174/__pet_jifeng/index.html?qaStage=1-1-role1&players=2' });
  await ready();
  for (const form of [2, 3, 4]) for (const fps of [20, 24, 30]) {
    await evaluate(`jifengProbe.install(${form},${fps});jifengProbe.step(2,${1000 / fps})`);
    const active = await evaluate('jifengProbe.states()');
    for (const slot of ['p1', 'p2']) {
      assert(active[slot].active);
      assert.equal(active[slot].remainingHostTicks, fps * (form === 2 ? 5 : 10) - 1, 'Actual owner advances exactly once per host tick');
      assert(await evaluate(`jifengProbe.runtime('${slot}')`));
    }
    await evaluate(`jifengProbe.pause();jifengProbe.step(5,${1000 / fps})`);
    assert.deepEqual(await evaluate('jifengProbe.states()'), active);
    await evaluate(`jifengProbe.resume();jifengProbe.kill('p1');jifengProbe.step(1,${1000 / fps})`);
    const dead = await evaluate('jifengProbe.states()'); assert.equal(dead.p1.active, false); assert.equal(dead.p2.active, true);
    assert.equal(await evaluate("jifengProbe.runtime('p1')"), false);
    await evaluate(`jifengProbe.revive('p1');jifengProbe.step(1,${1000 / fps})`);
    assert.equal((await evaluate('jifengProbe.states()')).p1.active, false);
    assert.equal(await evaluate("jifengProbe.runtime('p1')"), true);
    await evaluate(`jifengProbe.rearm('p1');jifengProbe.kill('p2');jifengProbe.step(1,${1000 / fps})`);
    const p2Dead = await evaluate('jifengProbe.states()');
    assert.equal(p2Dead.p2.active, false); assert.equal(p2Dead.p1.active, true);
    assert.equal(await evaluate("jifengProbe.runtime('p2')"), false);
    await evaluate(`jifengProbe.revive('p2');jifengProbe.step(1,${1000 / fps})`);
    assert.equal((await evaluate('jifengProbe.states()')).p2.active, false);
    assert.equal(await evaluate("jifengProbe.runtime('p2')"), true);
    await evaluate("jifengProbe.rearm('p2')");
    // A roster can change between the final update and shutdown; the party's
    // per-frame synchronization has not yet seen these new owner objects.
    const preExit = await evaluate(`jifengProbe.install(${form},${fps})`);
    const oldBeforeExit = await evaluate('jifengProbe.replacedStates()');
    assert(oldBeforeExit.p1.active && oldBeforeExit.p2.active);
    const stopped = await evaluate('jifengProbe.stopScene()');
    assert.equal(stopped.p1.active, false); assert.equal(stopped.p2.active, false);
    const partyStopped = await evaluate('jifengProbe.replacedStates()');
    assert.equal(partyStopped.p1.active, false); assert.equal(partyStopped.p2.active, false);
    assert.equal(await evaluate("jifengProbe.runtime('p2')"), false);
    await evaluate('jifengProbe.start()'); await ready();
    assert.equal((await evaluate('jifengProbe.states()')).p2.active, false);
    rows.push({ form, fps, active, dead, p2Dead, preExit, stopped, partyStopped, reentered: true });
  }
  assert.deepEqual(errors, []);
  assert(!mutation, `Surviving browser mutant: ${mutation}`);
  writeFileSync(`${out}/lifecycle.json`, JSON.stringify({ status: 'passed', scope: 'TestScene actual owner update, pause, hero death/revival, stop and start; no visual fidelity claim', rows, errors }, null, 2));
  console.log(`Jifeng browser: ${rows.length} two-owner form/fps lifecycle cases passed.`);
} catch (error) {
  writeFileSync(`${out}/${mutation ? 'mutation-' + mutation : 'failure'}.json`, JSON.stringify({ error: String(error), rows, errors }, null, 2)); throw error;
} finally { socket?.close(); edge.kill(); }
