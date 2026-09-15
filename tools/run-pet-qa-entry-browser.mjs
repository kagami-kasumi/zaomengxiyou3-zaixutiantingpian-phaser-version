import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const port=9440;
const edge=spawn('C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',[
  '--headless=new','--no-first-run','--no-default-browser-check',
  `--remote-debugging-port=${port}`,`--user-data-dir=${path.resolve('.tmp/pet-qa-entry-profile')}`,
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
  const out='docs/tasks/evidence/TASK-SLICE-216C';mkdirSync(out,{recursive:true});
  const rows=[];
  const snapshot=()=>evaluate(`({panels:document.querySelectorAll('[data-pet-qa-entry]').length,text:document.querySelector('[data-pet-qa-entry]')?.textContent,raw:localStorage.getItem('zaixu-tianding.save.slot.5'),active:localStorage.getItem('zaixu-tianding.save.active-slot')})`);
  async function waitPanel() { for(let i=0;i<300;i++){if(await evaluate(`!!document.querySelector('[data-pet-qa-entry] button')`))return;await delay(100);}throw Error('No discoverable entry'); }
  async function clickEntry(){await evaluate(`document.querySelector('[data-pet-qa-entry] button').click()`);return snapshot();}
  async function screenshot(name){const png=await command('Page.captureScreenshot',{format:'png'});writeFileSync(path.join(out,name+'.png'),Buffer.from(png.data,'base64'));}
  await command('Page.navigate',{url:'http://localhost:5173/'});await waitPanel();
  await evaluate('localStorage.clear()');await command('Page.reload');await waitPanel();
  let state=await snapshot();assert.equal(state.raw,null);assert.equal(state.panels,1);rows.push({id:'default-no-query-no-write',state});await screenshot('default-entry');
  state=await clickEntry();const created=state.raw;const save=JSON.parse(created);
  assert.equal(save.player1.pets.length,35);assert.equal(save.player2.pets.length,35);assert.equal(state.active,'5');rows.push({id:'click-create',state});await screenshot('created-entry');
  await command('Page.reload');await waitPanel();state=await clickEntry();assert.equal(state.raw,created);assert.equal(state.panels,1);rows.push({id:'reload-refresh-preserves',state});
  await command('Input.dispatchMouseEvent',{type:'mousePressed',x:590,y:424,button:'left',clickCount:1});
  await command('Input.dispatchMouseEvent',{type:'mouseReleased',x:590,y:424,button:'left',clickCount:1});
  for(let n=0;n<300;n++){if((await snapshot()).panels===0)break;await delay(100);}
  assert.equal((await snapshot()).panels,0,'native slot activation removes local entry');await screenshot('native-slot-entered');rows.push({id:'native-slot-entry-cleanup',state:await snapshot()});
  for(const kind of ['ordinary','corrupt']) {
    await command('Page.navigate',{url:'http://localhost:5173/'});await waitPanel();
    const ordinary=JSON.parse(created);ordinary.player1.pets=ordinary.player1.pets.slice(0,1);ordinary.player2.pets=ordinary.player2.pets.slice(0,1);
    const raw=kind==='corrupt'?'broken':JSON.stringify(ordinary);
    await evaluate(`localStorage.setItem('zaixu-tianding.save.slot.5',${JSON.stringify(raw)});localStorage.setItem('zaixu-tianding.save.active-slot','0')`);
    state=await clickEntry();assert.equal(state.raw,raw);assert.equal(state.active,'0');assert.ok(state.text.includes('未修改'));rows.push({id:kind+'-protected',state});
  }
  await evaluate('localStorage.clear()');await command('Page.navigate',{url:'http://localhost:5173/?qaPetSave=all'});await waitPanel();state=await snapshot();assert.equal(state.raw,null);rows.push({id:'query-alone-no-write',state});
  for(const origin of ['http://localhost:4174','http://127.0.0.2:5173']) {
    await command('Page.navigate',{url:origin+'/?qaPetSave=all'});
    for(let n=0;n<300;n++){if(await evaluate(`!!document.querySelector('canvas')`))break;await delay(100);}
    await delay(1500);state=await snapshot();assert.equal(state.panels,0);assert.equal(state.raw,null);rows.push({id:'hidden-and-no-write-'+origin,state});
  }
  assert.deepEqual(errors,[]);
  writeFileSync(path.join(out,'entry-verification.json'),JSON.stringify({status:'passed',scope:'Actual production build, explicit visible button and native save-slot click; dedicated browser storage only',rows,errors},null,2)+'\n');
  console.log(`216C actual browser: ${rows.length} default/click/reload/native-slot/protection/isolation states passed`);
} finally { socket?.close();edge.kill(); }
