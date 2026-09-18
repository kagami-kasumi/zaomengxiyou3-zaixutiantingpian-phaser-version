import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, copyFileSync, readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import path from 'node:path';
import assert from 'node:assert/strict';

const out = 'docs/tasks/evidence/TASK-SLICE-224A1';
const lifecycleOnly = process.argv.includes('--lifecycle-only');
const dir = 'dist/__turtle_probe'; mkdirSync(dir, { recursive: true });
await build({ entryPoints: ['tools/turtle-runtime/browser-probe.ts'], bundle: true, format: 'iife',
  outfile: `${dir}/probe.js`, logLevel: 'silent' });
if (!lifecycleOnly) {
  const visualOracle = JSON.parse(readFileSync(`${out}/visual-oracle.json`, 'utf8'));
  mkdirSync(`${dir}/native`, { recursive: true });
  for (let i = 0; i < visualOracle.length; i++) {
    copyFileSync(visualOracle[i].nativeFile, `${dir}/native/${i}.png`);
    visualOracle[i].nativeUrl = `native/${i}.png`;
}
writeFileSync(`${dir}/visual-oracle.json`, JSON.stringify(visualOracle));
}
writeFileSync(`${dir}/index.html`, '<html><head><link rel="icon" href="data:,"></head><body style="margin:0;background:#202020"><script src="probe.js"></script></body></html>');
const port = lifecycleOnly ? 9449 : 9448;
const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', [
  '--headless=new', '--no-first-run', '--no-default-browser-check', '--window-size=940,680',
  `--remote-debugging-port=${port}`, `--user-data-dir=${path.resolve(`.tmp/turtle-browser-profile-${process.pid}`)}`, 'about:blank',
], { stdio: 'ignore', windowsHide: true });
const delay = ms => new Promise(r => setTimeout(r, ms));
let socket, id = 0; const pending = new Map(), errors = [];
async function command(method, params = {}) {
  const key = ++id;
  const result = new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(key); reject(Error(`CDP timeout ${method}`)); }, 30000);
    pending.set(key, { resolve: v => { clearTimeout(timer); resolve(v); }, reject: e => { clearTimeout(timer); reject(e); } });
  });
  socket.send(JSON.stringify({ id: key, method, params })); return result;
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
try {
  let pages;
  for (let i = 0; i < 100; i++) {
    try { pages = await (await fetch(`http://127.0.0.1:${port}/json`, { signal: AbortSignal.timeout(1000) })).json(); if (pages.some(p => p.type === 'page')) break; } catch {}
    await delay(100);
  }
  assert(pages?.some(p => p.type === 'page'), 'Edge did not start');
  socket = new WebSocket(pages.find(p => p.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', ({ data }) => {
    const m = JSON.parse(data);
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); if (m.error) p?.reject(m.error); else p?.resolve(m.result); }
    else if (m.method === 'Runtime.exceptionThrown') errors.push(m);
  });
  await command('Runtime.enable'); await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride', { width: 940, height: 590, deviceScaleFactor: 1, mobile: false });
  await command('Page.navigate', { url: `http://127.0.0.1:4174/__turtle_probe/index.html${lifecycleOnly ? '?lifecycleOnly' : ''}` });
  let result;
  for (let i = 0; i < 1800; i++) {
    result = await evaluate('window.turtleProbe');
    if (result?.state === 'passed' || result?.state === 'failed') break;
    if (i % 30 === 0) console.log('turtle browser', result);
    await delay(1000);
  }
  assert.equal(result?.state, 'passed', JSON.stringify(result)); assert.deepEqual(errors, []);
  if (lifecycleOnly) {
    assert(result.sceneRestartIdentity && result.shutdownPresenterReleased);
    writeFileSync(`${out}/browser-lifecycle.json`, JSON.stringify({ ...result, errors }));
  } else {
    const displayRows = await evaluate('window.turtleDisplayRows');
    assert.equal(displayRows.length, 11572);
    writeFileSync(`${out}/browser-display-states.json`, JSON.stringify(displayRows));
    const shots = path.resolve('.tmp/verification-images/TASK-SLICE-224A1'); mkdirSync(shots, { recursive: true });
    for (let i = 0; i < result.frames.length; i++) {
      if (!result.frames[i]) continue;
      await evaluate(`window.turtleShow(${JSON.stringify(result.frames[i])})`); await delay(100);
      const shot = await command('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 940, height: 590, scale: 1 } });
      writeFileSync(`${shots}/browser-${i}.png`, Buffer.from(shot.data, 'base64'));
      const mode = result.frames[i].split(':')[0];
      const native = JSON.parse(gunzipSync(readFileSync(`docs/tasks/evidence/TASK-SETTINGS-222A/${mode}-native.json.gz`)));
      const state = JSON.parse(gunzipSync(readFileSync(`public/assets/pets/turtle/${mode}.json.gz`))).states.find(s => s.id === result.frames[i]);
      const ref = mode === 'body' ? native.cells.find(r => r.id === state.nativeId).file
        : native.rows.find(r => `${r.id}-${r.tick}` === state.nativeId).capture;
      copyFileSync(ref, `${dir}/native-${i}.png`);
      await evaluate(`window.turtleShowNative('native-${i}.png')`); await delay(100);
      const nativeShot = await command('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 940, height: 590, scale: 1 } });
      writeFileSync(`${shots}/native-${i}.png`, Buffer.from(nativeShot.data, 'base64'));
      await evaluate('window.turtleShowNative()');
    }
    writeFileSync(`${out}/browser-verification.json`, JSON.stringify({ ...result, errors, shots }));
  }
  console.log(result);
} finally {
  if (socket?.readyState === WebSocket.OPEN) try { await command('Browser.close'); } catch {}
  socket?.close(); edge.kill();
}
