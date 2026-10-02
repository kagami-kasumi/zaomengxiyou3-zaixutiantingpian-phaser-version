import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const dir = path.resolve('.tmp/pet-attached-browser'), out = 'docs/tasks/evidence/TASK-SLICE-245A';
mkdirSync(dir, { recursive: true }); mkdirSync(out, { recursive: true });
const native = JSON.parse(gunzipSync(readFileSync('docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz')));
const images = {}, cases = [], rows = new Map();
for (const r of native.rows) { const list = rows.get(r.id) ?? []; list.push(r); rows.set(r.id, list); }
function image(r) {
  const key = 'native-' + r.captureSha256;
  if (!images[key]) {
    assert.equal(createHash('sha256').update(readFileSync(r.capture)).digest('hex'), r.captureSha256, r.capture);
    copyFileSync(r.capture, path.join(dir, key + '.png')); images[key] = '/' + key + '.png';
  }
  return { tick: r.tick, key, crop: r.crop };
}
for (const effect of ['sxkb', 'fsnl']) for (const owner of [1, 2]) for (const direction of [0, 1])
for (const scenario of ['cycle', 'host-destroy', 'effect-destroy', 'world-pause']) {
  const id = `${effect}-monkey1-p${owner}-d${direction}-${scenario}`;
  const cycle = rows.get(`${effect}-monkey1-p${owner}-d${direction}-cycle`);
  cases.push({ id, effect, owner, direction, scenario, x: owner === 1 ? 350 : 550,
    frames: cycle.filter(r => r.phase === 'exit-after-owner' && r.tick < 100).map(image),
    rows: rows.get(id).filter(r => r.phase === 'exit-after-owner' && r.tick <= (scenario === 'host-destroy' ? 29 : 101)).map(image) });
}
writeFileSync(path.join(dir, 'inputs.json'), JSON.stringify({ images, cases }));
await build({ entryPoints: ['tools/pet-attached-browser-probe.ts'], bundle: true, format: 'esm', outfile: path.join(dir, 'probe.js'), logLevel: 'silent' });
writeFileSync(path.join(dir, 'index.html'), '<html><body style="margin:0"><script type="module" src="/probe.js"></script></body></html>');
const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost'), relative = decodeURIComponent(url.pathname).slice(1) || 'index.html';
    const base = relative.startsWith('assets/') ? path.resolve('public') : dir;
    const file = path.resolve(base, relative);
    if (!file.startsWith(base + path.sep)) throw Error('path');
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.json') ? 'application/json' : file.endsWith('.png') ? 'image/png' : 'text/html');
    res.end(readFileSync(file));
  } catch { res.writeHead(404).end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port, debugPort = 9500 + process.pid % 1000;
const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new', '--disable-extensions', '--disable-sync', '--no-first-run', '--no-default-browser-check', '--window-size=940,680', `--remote-debugging-port=${debugPort}`, `--user-data-dir=${dir}/profile-${process.pid}`, 'about:blank'], { stdio: 'ignore', windowsHide: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let socket, serial = 0; const pending = new Map(), errors = [];
function command(method, params = {}) { return new Promise((resolve, reject) => {
  const id = ++serial, timer = setTimeout(() => { pending.delete(id); reject(Error(`timeout ${method}`)); }, 60000);
  pending.set(id, result => { clearTimeout(timer); result.error ? reject(Error(JSON.stringify(result.error))) : resolve(result.result); });
  socket.send(JSON.stringify({ id, method, params }));
}); }
try {
  let page;
  for (let i = 0; i < 100 && !page; i++) { try { page = (await (await fetch(`http://127.0.0.1:${debugPort}/json`)).json()).find(p => p.type === 'page' && p.url === 'about:blank'); } catch {} if (!page) await sleep(100); }
  assert(page, 'edge debugging page'); socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => socket.addEventListener('open', r, { once: true }));
  socket.addEventListener('message', e => { const m = JSON.parse(e.data); if (m.id) { pending.get(m.id)?.(m); pending.delete(m.id); } else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params); });
  await command('Runtime.enable'); await command('Page.enable');
  const reports = [];
  for (const renderer of ['canvas', 'webgl']) {
    await command('Page.navigate', { url: `http://127.0.0.1:${port}/?renderer=${renderer}${process.argv.includes('--journey-only') ? '&journeyOnly=1' : ''}` });
    let report;
    for (let i = 0; i < 600 && !report; i++) {
      await sleep(500);
      assert.equal(errors.length, 0, JSON.stringify(errors));
      const r = await command('Runtime.evaluate', { expression: 'window.result', returnByValue: true }); report = r.result?.value;
    }
    assert(report, 'browser report timeout'); reports.push(report);
    writeFileSync(`${out}/${process.argv.includes('--journey-only') ? 'browser-journey' : 'browser'}.json`, JSON.stringify({ reports, errors }, null, 2) + '\n');
    assert.equal(report.status, 'passed', JSON.stringify(report));
    const capture = await command('Runtime.evaluate', { expression: 'window.representative', returnByValue: true });
    if (capture.result?.value) writeFileSync(`${out}/${renderer}.png`, Buffer.from(capture.result.value.split(',')[1], 'base64'));
    console.log(`${renderer}: ${report.results.length} actual adapter/native cases passed.`);
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
} catch (error) {
  writeFileSync(`${out}/browser-failure.json`, JSON.stringify({ error: String(error), errors }, null, 2));
  throw error;
} finally { socket?.close(); edge.kill(); server.closeAllConnections(); await new Promise(r => server.close(r)); }
