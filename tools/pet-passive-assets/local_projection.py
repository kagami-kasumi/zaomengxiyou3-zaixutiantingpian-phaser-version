"""246 finite native local projection. Does not write 244 or production inputs."""
import copy, gzip, hashlib, json, subprocess, sys, time
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-246'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
NATIVE=ROOT/'docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def prepare():
 assert sha(NATIVE)=='f93eb12a80ce07f2a547983beec506bd79703ff4e875708e26cf43b2a0839139'
 data=json.loads(gzip.decompress(NATIVE.read_bytes()))
 samples={};states=[]
 def clean(n):
  return {k:([clean(c) for c in v] if k=='children' else v) for k,v in n.items() if k in ['type','visible','matrix','colorTransform','blendMode','filters','frame','children']}
 for r in data['rows']:
  # Integer host translation is removed only; retain source subpixel phases,
  # hierarchy, local matrices, frame, alpha and filters without regrouping.
  x=int(r['hostMatrix']['x']//1);y=int(r['hostMatrix']['y']//1)
  n=clean(r['display'])
  for child in n['children']:
   child['matrix']['tx']-=x;child['matrix']['ty']-=y
  key=hashlib.sha256(json.dumps(n,sort_keys=True,separators=(',',':')).encode()).hexdigest()
  samples.setdefault(key,dict(key=key,tree=n))
  states.append(dict(id=r['id']+':'+str(r['tick'])+':'+r['phase'],key=key,origin=[x,y],capture=r['capture'],captureSha256=r['captureSha256'],crop=r['crop']))
 OUT.mkdir(parents=True,exist_ok=True)
 cfg=dict(source=str(ROOT/'local-resources/regima/source/restored-swfs/assets/pet1.swf'),sourceSha256=sha(ROOT/'local-resources/regima/source/restored-swfs/assets/pet1.swf'),nativeSha256=sha(NATIVE),samples=list(samples.values()),states=states)
 assert cfg['sourceSha256']=='0699a5d3a49ea8024d3635b18c6349f5d7f7cf5f1db869dd18a0a5ee6de60644'
 (OUT/'inputs.json').write_text(json.dumps(cfg,separators=(',',':')),encoding='utf-8')
 print('Prepared',len(samples),'unique local trees;',len(states),'states',flush=True)
 return cfg
def run(label='baseline'):
 cfg=prepare();work=OUT/label;work.mkdir(parents=True,exist_ok=True)
 (work/'inputs.json').write_text(json.dumps(dict(source=cfg['source'],mode=label,samples=cfg['samples']),separators=(',',':')),encoding='utf-8')
 (work/'LocalProjection.as').write_bytes(Path(__file__).with_name('LocalProjection.as').read_bytes())
 (work/'NativeTree.as').write_bytes((ROOT/'tools/turtle-visual/NativeTree.as').read_bytes())
 (work/'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task246.'+label+'</id><versionNumber>1.0.0</versionNumber><filename>LocalProjection</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>LocalProjection.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>',encoding='utf-8')
 cmd=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-default-frame-rate=24','-output=LocalProjection.swf','LocalProjection.as']
 r=subprocess.run(cmd,cwd=work,capture_output=True,timeout=60);(work/'compile.log').write_bytes(r.stdout+r.stderr)
 assert r.returncode==0,(r.stdout+r.stderr).decode(errors='replace')
 started=time.time_ns()
 with (work/'runtime.log').open('wb') as log:
  r=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(work/'application.xml'),str(work)],stdout=log,stderr=log,timeout=900)
 assert r.returncode==0,(r.returncode,(work/'runtime.log').read_text(encoding='utf-8')[-3000:])
 assert (work/'outputs.json').stat().st_mtime_ns>=started
 result=json.loads((work/'outputs.json').read_text(encoding='utf-8'))
 assert len(result['rows'])==len(cfg['samples'])
 print(label,len(result['rows']),'native local captures',flush=True)
if __name__=='__main__':run(sys.argv[1] if len(sys.argv)>1 else 'baseline')
