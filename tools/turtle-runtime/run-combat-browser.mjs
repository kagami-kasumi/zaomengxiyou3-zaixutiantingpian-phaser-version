import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';

const links = process.argv.includes('--links');
const dir = 'dist/__turtle_combat', out = `docs/tasks/evidence/${links ? 'TASK-SLICE-224A3' : 'TASK-SLICE-224A2'}`;
mkdirSync(dir, { recursive: true }); mkdirSync(out, { recursive: true });
mkdirSync(`${dir}/native`, { recursive: true });
const catalog = new Map();
const native = name => JSON.parse(gunzipSync(readFileSync(`docs/tasks/evidence/TASK-SETTINGS-222A/${name}-native.json.gz`)));
for (const row of native('body').cells) catalog.set(`body:${row.id}`, { file: row.file, root: row.root, sha256: row.sha256 });
for (const row of native('effects').states) for (const baseline of row.baselines) {
  catalog.set(`effect:${row.symbol}:${row.tick}:s${baseline.scale}:d${baseline.sign}`, { file: baseline.path, root: baseline.root, sha256: baseline.sha256 });
}
function reference(view) {
  const ref = catalog.get(view.stateId); assert(ref, view.stateId);
  assert.equal(createHash('sha256').update(readFileSync(ref.file)).digest('hex'), ref.sha256);
  copyFileSync(ref.file, `${dir}/native/${ref.sha256}.png`);
  return { ...ref, name: view.name, stateId: view.stateId, url: `./native/${ref.sha256}.png` };
}
await build({ entryPoints: ['tools/turtle-runtime/combat-browser-probe.ts'], bundle: true, format: 'iife',
  plugins: links ? [{ name: 'observe-existing-party', setup(build) {
    build.onLoad({ filter: /HeroPartyRuntimeBridge\.ts$/ }, ({ path }) => ({ loader: 'ts',
      contents: readFileSync(path, 'utf8').replace('heroPartyRuntimeByScene.set(scene, runtime);',
        'heroPartyRuntimeByScene.set(scene, runtime); (globalThis as any).__turtleParty = runtime;') }));
  } }] : [],
  outfile: `${dir}/probe.js`, logLevel: 'silent', external: ['/assets/*'],
  define: { 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true', 'import.meta.env.MODE': '"production"', 'import.meta.env.BASE_URL': '"/"' } });
writeFileSync(`${dir}/index.html`, '<html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="probe.css"></head><body><div id="game"></div><script src="probe.js"></script></body></html>');
const port = 9451 + process.pid % 1000;
const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--no-first-run', '--no-default-browser-check', '--window-size=940,680',
  `--remote-debugging-port=${port}`, `--user-data-dir=${path.resolve(`.tmp/turtle-combat-profile-${process.pid}`)}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket, id = 0;
const pending = new Map(), errors = [], reports = [];
async function command(method, params = {}) {
  const key = ++id;
  const result = new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(key); reject(Error(`CDP timeout ${method}`)); }, 60000);
    pending.set(key, { resolve: value => { clearTimeout(timer); resolve(value); }, reject });
  });
  socket.send(JSON.stringify({ id: key, method, params })); return result;
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function until(expression, description) {
  for (let i = 0; i < 600; i++) { if (await evaluate(expression)) return; await delay(100); }
  throw Error(`Timeout ${description}: ${JSON.stringify(errors)}`);
}
try {
  let page;
  for (let i = 0; i < 100; i++) {
    try { page = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find(row => row.type === 'page'); } catch {}
    if (page) break; await delay(100);
  }
  assert(page);
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) { const waiter = pending.get(message.id); pending.delete(message.id); if (message.error) waiter?.reject(message.error); else waiter?.resolve(message.result); }
    else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params);
  });
  await command('Runtime.enable'); await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 940, height: 590, deviceScaleFactor: 1, mobile: false });
  for (const [route, scene] of [['qaStage=1-2', 'Stage12Scene'], ['qaStage=1-1-role1', 'TestScene']]) {
    await command('Page.navigate', { url: `http://127.0.0.1:4174/__turtle_combat/index.html?${route}&players=2` });
    await until(`window.turtleCombatProbe?.snapshot().scene === '${scene}'`, scene);
    const baselineSave = await evaluate('turtleCombatProbe.snapshot().storedSaves');
    for (const form of links ? [2, 3, 4] : [1, 2, 3, 4]) {
      if (form > (links ? 2 : 1)) {
        const oldTextures = await evaluate('turtleCombatProbe.snapshot().textures');
        await evaluate('turtleCombatProbe.restart()');
        await until(`turtleCombatProbe.snapshot().scene === '${scene}' && ${JSON.stringify(oldTextures)}.every(k=>!turtleCombatProbe.snapshot().textures.includes(k))`, `${scene} replacement cleanup`);
      }
      await evaluate(`turtleCombatProbe.install(${form}, ${JSON.stringify(links ? ['txlj', 'sld'] : ['sld'])});`);
      await until(`Object.values(turtleCombatProbe.snapshot().pets ?? {}).filter(p=>p.species==='turtle'&&p.form===${form}).length===2`, `turtle${form} ready`);
      await evaluate('turtleCombatProbe.stop(); turtleCombatProbe.keys([68,39],true)');
      const samples = [], differences = [], seen = new Set();
      let settlement;
      for (let frame = 0; frame < 60; frame++) {
        const sample = await evaluate('turtleCombatProbe.keys([68,39],true); turtleCombatProbe.step(5); turtleCombatProbe.snapshot()');
        samples.push(sample);
        if (links && !settlement && sample.views.filter(v => v.stateId?.startsWith('effect:PetTurtle2Buff:')).length === 4) {
          settlement = await evaluate('turtleCombatProbe.linkSettlement()');
          assert.deepEqual(settlement.damage, [{ hero: 405, pet: 494 }, { hero: 500, pet: 500 }]);
          assert.deepEqual(settlement.duplicate, settlement.damage);
          assert.deepEqual(settlement.healing, [{ hero: 405, pet: 494 }, { hero: 606, pet: 606 }]);
          const linkedPng = await command('Page.captureScreenshot', { format: 'png' });
          writeFileSync(`${out}/linked-${scene}-form${form}.png`, Buffer.from(linkedPng.data, 'base64'));
        }
        assert.equal(sample.views.filter(view => view.stateId?.startsWith('body:')).length, 2, `${scene}/${form} visible owners`);
        const refs = sample.views.filter(view => !seen.has(`${view.name}/${view.stateId}`)).map(reference);
        if (refs.length) {
          const diff = await evaluate(`turtleCombatProbe.compare(${JSON.stringify(refs)})`);
          differences.push(...diff);
          assert(diff.every(row => row.differentPixels === 0), JSON.stringify(diff.filter(row => row.differentPixels)));
          refs.forEach(ref => seen.add(`${ref.name}/${ref.stateId}`));
        }
      }
      await evaluate('turtleCombatProbe.keys([68,39],false)');
      const state = samples.at(-1);
      if (links) assert(settlement, `${scene}/${form}: missing actual dual-owner links/settlement`);
      assert.deepEqual(state.storedSaves, baselineSave, 'No fixture saves');
      const png = await command('Page.captureScreenshot', { format: 'png' });
      writeFileSync(`${out}/combat-${scene}-form${form}.png`, Buffer.from(png.data, 'base64'));
      writeFileSync(`${out}/combat-${scene}-form${form}.json`, JSON.stringify(samples) + '\n');
      const effects = samples.filter(s => s.views.some(v => v.stateId?.startsWith('effect:'))).length;
      assert(effects > 0, `${scene}/${form} no real effects`);
      writeFileSync(`${out}/differences-${scene}-form${form}.json`, JSON.stringify(differences) + '\n');
      reports.push({ scene, form, samples: samples.length, effects, comparedLayers: differences.length, differentPixels: 0, settlement });
      console.log(JSON.stringify(reports.at(-1)));
      await evaluate('turtleCombatProbe.resume()');
    }
    const oldTextures = await evaluate('turtleCombatProbe.snapshot().textures');
    await evaluate('turtleCombatProbe.restart()');
    await until(`turtleCombatProbe.snapshot().scene === '${scene}' && ${JSON.stringify(oldTextures)}.every(k=>!turtleCombatProbe.snapshot().textures.includes(k))`, `${scene} restart cleanup`);
    await evaluate('turtleCombatProbe.stop(); turtleCombatProbe.leave(); turtleCombatProbe.step(2)');
    assert.deepEqual(await evaluate('turtleCombatProbe.snapshot().textures'), [], `${scene} leaked turtle textures`);
  }
  assert.deepEqual(errors, []);
  writeFileSync(`${out}/combat-browser.json`, JSON.stringify({ status: 'passed', viewport: { width: 940, height: 590 }, reports, errors }, null, 2) + '\n');
} finally {
  if (socket?.readyState === WebSocket.OPEN) await command('Browser.close').catch(() => {});
  socket?.close(); edge.kill();
}
