import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { gatherBrowserHooks } from './hero-gather-browser-hooks.mjs';
import { assertGatherScene } from './hero-gather-browser-assertions.mjs';
const base = 'http://127.0.0.1:4174/';
const r = await fetch(base, { signal: AbortSignal.timeout(5000) });
assert(r.ok, `HTTP ${r.status}`);
const fps = Number(process.env.HG_FPS ?? 30);
const variant = process.env.HG_VARIANT ?? 'baseline';
const slots = (process.env.HG_SLOTS ?? 'both') === 'p1' ? ['p1'] : (process.env.HG_SLOTS === 'p2' ? ['p2'] : ['p1', 'p2']);
const probeDirectory = `__hero-gather-${process.pid}`;
const dir = path.resolve('dist', probeDirectory); mkdirSync(dir, { recursive: true });
await build({
  entryPoints: ['tools/hero-gather-browser-probe.ts'], bundle: true, format: 'iife',
  outfile: path.join(dir, 'probe.js'), logLevel: 'silent', external: ['/assets/*'],
  define: { 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true', 'import.meta.env.MODE': '"production"', 'import.meta.env.BASE_URL': '"/"' },
  plugins: [gatherBrowserHooks(variant)],
});
writeFileSync(path.join(dir, 'index.html'), '<meta charset="utf-8"><style>#game{width:940px;height:590px}</style><div id="game"></div><script src="probe.js"></script>');
const port = 19000 + process.pid % 10000;
const edge = spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', ['--headless=new','--no-first-run','--no-default-browser-check','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows',`--remote-debugging-port=${port}`,`--user-data-dir=${path.resolve('.tmp/hero-gather-profile-'+port)}`,'about:blank'], { stdio: 'ignore', windowsHide: true });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket; let id = 0; const pending = new Map(); const browserErrors = [];
async function command(method, params = {}) { const key = ++id; const promise = new Promise((resolve, reject) => { const timer = setTimeout(() => reject(Error(`CDP timeout: ${method}`)), 60000); pending.set(key, { resolve: value => { clearTimeout(timer); resolve(value); }, reject }); }); socket.send(JSON.stringify({ id: key, method, params })); return promise; }
async function evaluate(expression) { const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails)); return result.result.value; }
try {
  let pages;
  for (let i = 0; i < 100; i++) { try { pages = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); if (pages.some(p => p.type === 'page')) break; } catch {} await delay(100); }
  const page = pages?.find(p => p.type === 'page'); assert(page, 'Edge failed');
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener('open', resolve, { once: true }); socket.addEventListener('error', reject, { once: true }); });
  socket.addEventListener('message', ({ data }) => { const message = JSON.parse(data); if (message.method === 'Runtime.exceptionThrown' || (message.method === 'Runtime.consoleAPICalled' && ['error','warning'].includes(message.params.type))) browserErrors.push(message); if (!message.id) return; const item = pending.get(message.id); pending.delete(message.id); if (message.error) item?.reject(message.error); else item?.resolve(message.result); });
  await command('Runtime.enable'); await command('Page.enable'); await command('Page.bringToFront');
  const url = `http://127.0.0.1:4174/${probeDirectory}/index.html?qaStage=1-2&players=2`;
  await command('Page.navigate', { url });
  let ready;
  for (let i = 0; i < 350; i++) { await evaluate('window.heroGatherProbe?.pumpLoading()'); ready = await evaluate('window.heroGatherProbe?.ready()'); if (ready?.scene === 'Stage12Scene' && !ready.loading) break; await delay(100); }
  assert.equal(ready?.scene, 'Stage12Scene', JSON.stringify({ready,browserErrors}));
  let report;
  try {
    report = await assertGatherScene({evaluate,command,delay,fps,slots,variant});
  } catch(error) {
    if(variant==='baseline' || error.name!=='AssertionError') {
      console.error(JSON.stringify({ready:await evaluate('window.heroGatherProbe?.ready()'),
        errors:browserErrors.map(row=>row.params.exceptionDetails?.exception?.description ?? row.params.args?.map(a=>a.value ?? a.description))}));
      throw error;
    }
    report={status:'rejected',compiled:true,variant,fps,slots,assertion:error.message};
  }
  assert.notEqual(report.status,'survived',`${variant} survived Scene assertions`);
  assert.equal(browserErrors.length,0,JSON.stringify(browserErrors.slice(-3)));
  mkdirSync('docs/tasks/evidence/TASK-SLICE-260A/browser',{recursive:true});
  writeFileSync(`docs/tasks/evidence/TASK-SLICE-260A/browser/hero-gather-${fps}-${slots.join('-')}-${variant}.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify({status:report.status,variant,fps,slots,lifecycle:report.lifecycle?.map(row=>row.destination),assertion:report.assertion?.split('\n')[0]}));
} finally { socket?.close(); edge.kill(); }
