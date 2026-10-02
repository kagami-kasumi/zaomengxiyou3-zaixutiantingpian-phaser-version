import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const dir=path.resolve('.tmp/pet-passive-browser'),out='docs/tasks/evidence/TASK-SLICE-245B';
mkdirSync(dir,{recursive:true});mkdirSync(out,{recursive:true});
const native=JSON.parse(gunzipSync(readFileSync('docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz')));
const candidateSha256=createHash('sha256').update(readFileSync('tools/pet-passive-assets/candidate.ts')).digest('hex');
const cases=[], copied=new Set();
const find=(n,type)=>n.type===type?n:n.children.map(c=>find(c,type)).find(Boolean);
for(const r of native.rows){
 const [effect,profile,owner,direction,scenario]=r.id.split('-');
 if(!process.argv.includes('--full')&&(!['monkey1','hero1'].includes(profile)||owner!=='p1'||direction!=='d0'||!['cycle','move'].includes(scenario)||r.tick!==3))continue;
 const key='native-'+r.captureSha256;
 if(!copied.has(key)){assert.equal(createHash('sha256').update(readFileSync(r.capture)).digest('hex'),r.captureSha256);copyFileSync(r.capture,path.join(dir,key+'.png'));copied.add(key);}
 const pet=effect==='sxkb'||effect==='fsnl', node=find(r.display,'buff_'+effect);
 const host=r.display.children.find(n=>n.name==='host');
 cases.push({effect,profile,direction:pet?0:r.bullets[0]?.a<0?1:0,frame:node?.frame??0,x:r.hostMatrix.x,y:r.hostMatrix.y,
  sign:pet?r.hostMatrix.a:1,alpha:pet?(host?.alpha??0):1,crop:r.crop,expected:'/'+key+'.png',id:r.id+':'+r.tick+':'+r.phase});
}
writeFileSync(path.join(dir,'inputs.json'),JSON.stringify(cases));
await build({entryPoints:['tools/pet-passive-browser-probe.ts'],bundle:true,format:'esm',outfile:path.join(dir,'probe.js'),logLevel:'silent'});
writeFileSync(path.join(dir,'index.html'),'<html><body style="margin:0"><script type="module" src="/probe.js"></script></body></html>');
const server = createServer((req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost'), relative = decodeURIComponent(url.pathname).slice(1) || 'index.html';
    const base = relative.startsWith('assets/') ? path.resolve('public') : dir;
    const file = relative.startsWith('assets/pet-passive/') ? path.resolve('local-resources/regima/task-outputs/TASK-SLICE-245B/projection/images',path.basename(relative)) : path.resolve(base, relative);
    if (!relative.startsWith('assets/pet-passive/') && !file.startsWith(base + path.sep)) throw Error('path');
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
  for (const renderer of ['canvas']) {
    await command('Page.navigate', { url: `http://127.0.0.1:${port}/?renderer=${renderer}${process.argv.includes('--journey-only') ? '&journeyOnly=1' : ''}` });
    let report;
    for (let i = 0; i < 600 && !report; i++) {
      await sleep(500);
      assert.equal(errors.length, 0, JSON.stringify(errors));
      const r = await command('Runtime.evaluate', { expression: 'window.result', returnByValue: true }); report = r.result?.value;
    }
    assert(report, 'browser report timeout'); reports.push(report);
    writeFileSync(`${out}/${process.argv.includes('--full') ? 'projection-full' : 'projection-smoke'}.json`, JSON.stringify({ boundary: 'Actual Canvas candidate projection only; native frame/owner inputs supplied, not runtime lifecycle or formal gameplay acceptance. Envelope is diagnostic, not a new approved visual tolerance.', candidateSha256, nativeSha256: createHash('sha256').update(readFileSync('docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz')).digest('hex'), reports, errors }, null, 2) + '\n');
    assert.equal(report.status, 'diagnostic', JSON.stringify(report));
    const capture = await command('Runtime.evaluate', { expression: 'window.representative', returnByValue: true });
    if (capture.result?.value) writeFileSync(`${out}/${renderer}.png`, Buffer.from(capture.result.value.split(',')[1], 'base64'));
    console.log(`${renderer}: ${report.results.length} projection diagnostic cases measured; not acceptance.`);
  }
  assert.equal(errors.length, 0, JSON.stringify(errors));
} catch (error) {
  writeFileSync(`${out}/browser-failure.json`, JSON.stringify({ error: String(error), errors }, null, 2));
  throw error;
} finally { socket?.close(); edge.kill(); server.closeAllConnections(); await new Promise(r => server.close(r)); }
