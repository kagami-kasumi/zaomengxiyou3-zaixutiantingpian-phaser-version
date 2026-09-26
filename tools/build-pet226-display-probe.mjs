import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Build a disposable fixture only. Browser control is performed through the UI tool.
execFileSync('python', ['tools/pet226-body/prepare_display_browser.py'], { stdio: 'inherit' });
const dir = path.resolve('dist/__pet226_display');
mkdirSync(dir, { recursive: true });
await build({ entryPoints: ['tools/pet226-display-browser-probe.ts'], bundle: true, format: 'esm',
  outfile: path.join(dir, 'probe.js'), logLevel: 'silent' });
writeFileSync(path.join(dir, 'index.html'), `<!doctype html><meta charset="utf-8"><link rel="icon" href="data:,">
<title>226 原生效果逐状态对照</title><style>body{font:14px sans-serif;margin:12px}#game{background:#ddd;width:940px;height:590px}pre{white-space:pre-wrap}</style>
<button id="run" disabled>运行逐状态原图对照</button> <span id="status">加载中</span>
<a href="?renderer=webgl">WebGL</a> <a href="?renderer=canvas">Canvas</a> <a href="?renderer=canvas&roundPixels=false">Canvas 无取整诊断</a><div id="game"></div><pre id="report"></pre>
<script type="module" src="probe.js"></script>`);
console.log('Fixture: http://localhost:4174/__pet226_display/index.html');
