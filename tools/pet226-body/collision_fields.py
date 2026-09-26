"""Bounded production-sampler experiment; does not promote or modify source truth."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import zlib
import numpy as np
ROOT=Path(__file__).resolve().parents[2]
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
task=int(sys.argv[1]) if len(sys.argv)>1 else 228
symbol=sys.argv[2] if len(sys.argv)>2 else ('PetMonkey1Bullet1' if task==228 else 'PetHorse1Bullet1')
base=ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-{task}'
work=ROOT/f'local-resources/regima/task-outputs/TASK-SLICE-226/collision-fields-{task}-{symbol}'
work.mkdir(parents=True,exist_ok=True)
oracle=json.loads((base/'natural-collision-air/measurement.json').read_text())
rows=[r for r in oracle['cases'] if symbol=='all' or r['symbol']==symbol]
keys={r['phaseKey'] for r in rows}
phases=[p for p in oracle['phases'] if p['key'] in keys]
config=json.loads((base/'geometry-air/fixtures.json').read_text())
sources=config['sources']
fields=[]
for i,p in enumerate(phases):
 si=next(i for i,s in enumerate(sources) if p['symbol'] in s['roots'])
 fields.append(dict(id=i,key=p['key'],symbol=p['symbol'],sourceIndex=si,cid=sources[si]['roots'][p['symbol']],phase=p['phase']))
targets=[]
for i,name in enumerate(sorted({r['target'] for r in rows})):
 si=next(i for i,s in enumerate(sources) if name in s['roots'])
 targets.append(dict(id=i,symbol=name,sourceIndex=si,cid=sources[si]['roots'][name],scaleX=.5 if name=='ObjectBaseSprite7' else 1))
config.update(fields=fields,targets=targets)
(work/'fixtures.json').write_text(json.dumps(config,separators=(',',':')))
builder=(base/'geometry-air/GeometryProbe.as').read_text()
code=builder.split('private function run():void {')[0]+(ROOT/'tools/pet226-body/CollisionFields.as.inc').read_text()+'}}'
code=code.replace('GeometryProbe','CollisionFields')
(work/'CollisionFields.as').write_text(code)
(work/'application.xml').write_text(f'<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task226.fields{task}</id><versionNumber>1.0.0</versionNumber><filename>CollisionFields</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>CollisionFields.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>')
result=subprocess.run(['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=CollisionFields.swf','CollisionFields.as'],cwd=work,capture_output=True,timeout=60)
(work/'compile.log').write_bytes(result.stdout+result.stderr)
assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
with (work/'stdout.log').open('wb') as stdout,(work/'stderr.log').open('wb') as stderr:
 result=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(work/'application.xml'),str(work)],cwd=work,stdout=stdout,stderr=stderr,timeout=600)
text=(work/'stdout.log').read_text(errors='replace')+(work/'stderr.log').read_text(errors='replace')
assert result.returncode==0 and 'COMPLETE' in text,text[-2000:]
meta={(r['id'],r['sign']):r for r in [json.loads(line[6:]) for line in text.splitlines() if line.startswith('FIELD ')]}
field_ids={r['key']:r['id'] for r in fields};target_ids={r['symbol']:r['id'] for r in targets};planes={}
def plane(path,width,height):
 if path not in planes:
  raw=zlib.decompress((work/path).read_bytes());bits=np.unpackbits(np.frombuffer(raw,dtype=np.uint8))[:width*height]
  planes[path]=bits.reshape(height,width)
 return planes[path]
def sample(row):
 q=row['intersection'];w=int(q['width']);h=int(q['height'])
 if w<1 or h<1:return False
 identity=field_ids[row['phaseKey']];m=meta[identity,row['direction']]
 tx=int(round((470-q['x'])*20)/5);ty=int(round((350-q['y'])*20)/5)
 a=plane(f"fields/{identity}-{row['direction']}-{(ty%4)*4+tx%4}.bin",m['width'],m['height'])
 targetx=int((470+row['x'])*20)/20;targety=int((350+row['y'])*20)/20
 ux=int((targetx-q['x'])*20);uy=int((targety-q['y'])*20)
 b=plane(f"targets/{target_ids[row['target']]}-{(uy%20)*20+ux%20}.bin",300,300)
 yy,xx=np.indices((h,w));ax=xx+m['originX']-tx//4;ay=yy+m['originY']-ty//4
 bx=xx+150-ux//20;by=yy+150-uy//20
 valid=(ax>=0)&(ax<m['width'])&(ay>=0)&(ay<m['height'])&(bx>=0)&(bx<300)&(by>=0)&(by<300)
 values=np.zeros((h,w),dtype=np.uint8);values[valid]=a[ay[valid],ax[valid]]&b[by[valid],bx[valid]]
 # Original AIR getColorBoundsRect omits an isolated match at linear index zero.
 return bool(values.flat[1:].any())
failures=[]
for i,row in enumerate(rows):
 actual=sample(row)
 if actual!=row['hit']:failures.append(dict(index=i,actual=actual,expected=row))
report=dict(status='failed' if failures else 'passed-bounded',symbol=symbol,cases=len(rows),fields=len(fields),failures=failures,
 sourceOracleSha256=hashlib.sha256((base/'natural-collision-air/measurement.json').read_bytes()).hexdigest())
(work/'verification.json').write_text(json.dumps(report,separators=(',',':')))
(work/'field-index.json').write_text(json.dumps(dict(fields=fields,targets=targets,meta=list(meta.values())),separators=(',',':')))
print(json.dumps({k:report[k] for k in ['status','symbol','cases','fields']}),'mismatches',len(failures),flush=True)
if failures:print(json.dumps(failures[:2]));raise SystemExit(1)
