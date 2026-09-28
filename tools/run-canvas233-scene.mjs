import { build } from 'esbuild';
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const dir=path.resolve('dist/__canvas233');mkdirSync(dir,{recursive:true});
await build({entryPoints:['tools/canvas233-scene-probe.ts'],bundle:true,format:'iife',outfile:path.join(dir,'probe.js'),logLevel:'silent',external:['/assets/*'],define:{'import.meta.env.DEV':'false','import.meta.env.PROD':'true','import.meta.env.MODE':'"production"','import.meta.env.BASE_URL':'"/"'}});
writeFileSync(path.join(dir,'index.html'),'<meta charset="utf-8"><link rel="icon" href="data:,"><style>body{margin:0}#game{width:940px;height:590px}</style><div id="game"></div><script src="probe.js"></script>');
const port=19000+process.pid%10000;
const edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-timer-throttling','--disable-renderer-backgrounding',
  `--remote-debugging-port=${port}`,`--user-data-dir=${path.resolve('.tmp/canvas233-profile-'+port)}`,
  'about:blank',
],{stdio:'ignore',windowsHide:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
let socket;let id=0;const pending=new Map();const errors=[];
async function command(method,params={}) {
  const key=++id;
  const result=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pending.delete(key);reject(Error(`CDP timeout: ${method}`));},20000);
    pending.set(key,{resolve:v=>{clearTimeout(timer);resolve(v);},reject:e=>{clearTimeout(timer);reject(e);}});
  });
  socket.send(JSON.stringify({id:key,method,params}));return result;
}
async function evaluate(expression) {
  const result=await command('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if(result.exceptionDetails) throw Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
try {
  let pages;
  for(let n=0;n<100;n++) {
    try {pages=await (await fetch(`http://127.0.0.1:${port}/json`)).json();if(pages.some(p=>p.type==='page'))break;}catch {}
    await delay(100);
  }
  assert.ok(pages?.some(p=>p.type==='page'),'headless Edge failed to start');
  socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
  await new Promise((r,j)=>{socket.addEventListener('open',r,{once:true});socket.addEventListener('error',j,{once:true});});
  socket.addEventListener('message',({data})=>{
    const m=JSON.parse(data);
    if(m.id) {const p=pending.get(m.id);pending.delete(m.id);if(m.error)p?.reject(m.error);else p?.resolve(m.result);}
    else if(m.method==='Runtime.exceptionThrown'||(m.method==='Runtime.consoleAPICalled'&&['error','warning'].includes(m.params.type)))errors.push(m);
  });
  await command('Runtime.enable');
  await command('Page.enable');
  await command('Emulation.setDeviceMetricsOverride',{width:940,height:590,deviceScaleFactor:1,mobile:false});
  const out='docs/tasks/evidence/TASK-SLICE-233';mkdirSync(out,{recursive:true});
  const mode=process.argv[2]??'canvas';
  if(mode==='canvas') await command('Page.addScriptToEvaluateOnNewDocument',{source:`const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/i.test(type)?null:get.call(this,type,...args);};`});
  await command('Page.navigate',{url:'http://127.0.0.1:4174/__canvas233/index.html?qaStage=1-2&players=2'});
  for(let i=0;i<500;i++){if((await evaluate('window.canvas233?.ready()'))?.ready)break;await delay(100);}
  const report=await evaluate('canvas233.run()');
  for(const [i,c] of report.captures.entries()) {writeFileSync(`${out}/${mode}-scene-${i}.png`,Buffer.from(c.png.split(',')[1],'base64'));delete c.png;}
  writeFileSync(`${out}/${mode}-scene.json`,JSON.stringify(report,null,2));
  assert.match(readFileSync('src/main.ts','utf8'), /type: Phaser.AUTO/);
  assert.equal(report.configuredType,report.renderer,'AUTO resolves to available renderer');
  assert.equal(report.renderer,mode==='canvas'?1:2);
  assert.equal(report.roundPixels,true);
  if(mode==='canvas') {
    assert(report.rows.length>100);
    assert.equal(report.compatibilityCases,8);
    for(const key of ['hero-animation.hero1.body','hero-animation.hero2.body','stage.stage1.floor','stage.stage1-2.background','combat-hud.role-info'])assert(report.rows.some(r=>r.key===key),key);
    assert.deepEqual([...new Set(report.rows.map(r=>r.scroll))].sort((a,b)=>a-b),[0,123,345]);
    let expanded=0;
    for(const row of report.rows) {
      assert.deepEqual(row.before.length,row.after.length);
      for(let i=0;i<row.before.length;i++) {
        const expected=row.before[i].slice();
        if(row.round) {expected[6]-=0.5;expected[7]-=0.5;expanded++;}
        assert.deepEqual(row.after[i],expected,JSON.stringify(row));
      }
    }
    assert(expanded>100);
    console.log(JSON.stringify({renderer:mode,objects:report.objects.length,draws:report.rows.length,expanded,captures:report.captures.length,keys:[...new Set(report.rows.map(r=>r.key))]}));
  } else console.log(JSON.stringify({renderer:mode,objects:report.objects.length,captures:report.captures.length}));
  assert.equal(errors.length,0,JSON.stringify(errors));
} finally {socket?.close();edge.kill();}
