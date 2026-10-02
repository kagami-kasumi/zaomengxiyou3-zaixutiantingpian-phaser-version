import { mutationPlugin } from './pet-passive-display-mutations.mjs';
const mutant=process.argv.find(a=>a.startsWith('--mutant='))?.split('=')[1];
import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const dir = path.resolve('.tmp/pet-passive-render'+(mutant?'-'+mutant:'')), out = 'docs/tasks/evidence/TASK-SLICE-245B';
mkdirSync(dir, { recursive: true }); mkdirSync(out, { recursive: true });
const native = JSON.parse(gunzipSync(readFileSync('docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz')));
const images = {}, grouped = new Map();
const find = (n, type) => n.type === type ? n : n.children.map(c => find(c, type)).find(Boolean);
for (const r of native.rows) {
 const [effect, profile] = r.id.split('-');
 const spec = native.fixtures.cases.find(c => c.id === r.id);
 if ((mutant || process.argv.includes('--smoke')) && (spec.owner!==1 || spec.direction!==0 || !['hero1','monkey1'].includes(profile))) continue;
 const key='native-'+r.captureSha256;
 if (!images[key]) { assert.equal(createHash('sha256').update(readFileSync(r.capture)).digest('hex'),r.captureSha256);copyFileSync(r.capture,path.join(dir,key+'.png'));images[key]='/'+key+'.png'; }
 const node=find(r.display,'buff_'+effect),host=r.display.children.find(n=>n.name==='host');
 if (!grouped.has(r.id)) grouped.set(r.id,{...spec,rows:[]});
 grouped.get(r.id).rows.push({tick:r.tick,phase:r.phase,key,crop:r.crop,visualCount:node?1:0,frame:node?.frame,alpha:host?.alpha});
}
const cases=[...grouped.values()];
writeFileSync(path.join(dir, 'inputs.json'), JSON.stringify({ images, cases }));
await build({ entryPoints: ['tools/pet-passive-render-probe.ts'], bundle: true, format: 'esm', outfile: path.join(dir, 'probe.js'), logLevel: 'silent', plugins: mutant ? [mutationPlugin(mutant)] : [] });
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
  for (const renderer of (mutant ? ['canvas'] : ['canvas', 'webgl'])) {
    await command('Page.navigate', { url: `http://127.0.0.1:${port}/?renderer=${renderer}${process.argv.includes('--journey-only') ? '&journeyOnly=1' : ''}` });
    let report;
    for (let i = 0; i < 1800 && !report; i++) {
      await sleep(500);
      assert.equal(errors.length, 0, JSON.stringify(errors));
      const r = await command('Runtime.evaluate', { expression: 'window.result', returnByValue: true }); report = r.result?.value;
    }
    assert(report, 'browser report timeout'); reports.push(report);
    writeFileSync(`${out}/${mutant?'mutation-'+mutant:process.argv.includes('--smoke') ? 'render-smoke' : 'render-full'}.json`, JSON.stringify({ reports, errors }, null, 2) + '\n');
    if(mutant){assert.equal(report.status,'failed',JSON.stringify(report));assert.match(report.error,/wrong pet parent|pixels >3|frame |Duplicate pet attachment|count |exit residual/);console.log(mutant+': rejected '+report.error.split('\n')[0]);continue;}
    assert.equal(report.status, 'passed', JSON.stringify(report));
    const capture = await command('Runtime.evaluate', { expression: 'window.representative', returnByValue: true });
    if (capture.result?.value) writeFileSync(`${out}/${renderer}.png`, Buffer.from(capture.result.value.split(',')[1], 'base64'));
    console.log(`${renderer}: ${report.results.length} actual passive/native fixtures passed.`);
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
} catch (error) {
  writeFileSync(`${out}/browser-failure.json`, JSON.stringify({ error: String(error), errors }, null, 2));
  throw error;
} finally { socket?.close(); edge.kill(); server.closeAllConnections(); await new Promise(r => server.close(r)); }
