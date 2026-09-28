import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
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
  for(const query of ['renderer=canvas&unfixed','renderer=canvas','renderer=webgl']) {
    await command('Page.navigate',{url:'http://127.0.0.1:4174/__pet226_display/index.html?'+query});
    for(let i=0;i<300;i++){if(await evaluate('!document.querySelector("#run")?.disabled'))break;await delay(100);}
    await evaluate('document.querySelector("#run").click()');
    let report;
    for(let i=0;i<2400;i++) {
      const text=await evaluate('document.querySelector("#report")?.textContent');
      if(text) { report=JSON.parse(text);break; }
      if(i%80===0)console.log(await evaluate('document.querySelector("#status")?.textContent'));
      assert.equal(errors.length,0,JSON.stringify(errors));
      await delay(250);
    }
    assert(report,'Missing pixel report');
    const name=query.includes('unfixed')?'canvas-before':query==='renderer=canvas'?'canvas-after':'webgl-after';
    writeFileSync(`${out}/${name}.json`,JSON.stringify(report,null,2));
    console.log(JSON.stringify({...report,results:undefined,failures:undefined}));
    assert.equal(report.cases,850);
    assert.equal(report.failedCases,query.includes('unfixed')?654:0);
    if(!query.includes('unfixed'))assert.equal(report.residualPixels,0,'No alpha or premultiplied RGB residual permitted in these 850 cases');
  }
  assert.equal(errors.length,0,JSON.stringify(errors));
} finally {socket?.close();edge.kill();}
