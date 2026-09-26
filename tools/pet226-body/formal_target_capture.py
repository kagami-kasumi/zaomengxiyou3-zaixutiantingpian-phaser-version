"""Native oracle at the formal monster constructors' X scale; leaves 228/229 untouched."""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[2]
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
task=int(sys.argv[1]);assert task in (228,229)
base=ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-{task}/natural-collision-air'
work=ROOT/f'local-resources/regima/task-outputs/TASK-SLICE-226/formal-target-collision-{task}'
work.mkdir(parents=True,exist_ok=True)
config=json.loads((base/'fixtures.json').read_text(encoding='utf-8'))
for source in config['sources']:
 assert hashlib.sha256(Path(source['path']).read_bytes()).hexdigest()==source['sha256']
(work/'fixtures.json').write_text(json.dumps(config),encoding='utf-8')
source=(base/'NaturalCollisionProbe.as').read_text(encoding='utf-8')
before='shape.scaleX=target.symbol=="ObjectBaseSprite7"?0.5:1;'
assert source.count(before)==1
source=source.replace(before,'shape.scaleX=target.symbol=="ObjectBaseSprite7"?1:2;')
source=source.replace('NaturalCollisionProbe','FormalTargetCollisionProbe')
(work/'FormalTargetCollisionProbe.as').write_text(source,encoding='utf-8')
(work/'my').mkdir(exist_ok=True)
shutil.copyfile(base/'my/HitTest.as',work/'my/HitTest.as')
(work/'application.xml').write_text(f'<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task226.formaltarget{task}</id><versionNumber>1.0.0</versionNumber><filename>FormalTargetCollisionProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>FormalTargetCollisionProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>')
args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-default-frame-rate=24','-output=FormalTargetCollisionProbe.swf','FormalTargetCollisionProbe.as']
command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(work/'application.xml'),str(work)]
if '--read' not in sys.argv:
 result=subprocess.run(args,cwd=work,capture_output=True,timeout=60)
 (work/'compile.log').write_bytes(result.stdout+result.stderr)
 assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
 with (work/'stdout.log').open('wb') as stdout,(work/'stderr.log').open('wb') as stderr:
  result=subprocess.run(command,cwd=work,stdout=stdout,stderr=stderr,timeout=600)
 assert result.returncode==0,(work/'stderr.log').read_text(errors='replace')[-2000:]
cases=[];complete=False
for log in ['stdout.log','stderr.log']:
 with (work/log).open(encoding='utf-8',errors='replace') as stream:
  for line in stream:
   if line.startswith('CASE '):cases.append(json.loads(line[5:]))
   if line.startswith('COMPLETE '):complete=int(line[9:])==len(cases)
assert complete
assert all(row['hit']==row['reference'] for row in cases)
sha=lambda path:hashlib.sha256(path.read_bytes()).hexdigest()
report=dict(status='measured-not-promoted',cases=cases,sourceTask=task,
 probeSha256=sha(work/'FormalTargetCollisionProbe.as'),originalProbeSha256=sha(base/'NaturalCollisionProbe.as'),
 fixtureSha256=sha(work/'fixtures.json'),hitTestSha256=sha(work/'my/HitTest.as'),
 runtimeSha256=sha(ROOT/'local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll'),
 command=command,compileCommand=args,scope='Native natural phases with formal constructor collider scales 2/2/1; no production projectile lifecycle.')
(work/'measurement.json').write_text(json.dumps(report,separators=(',',':')),encoding='utf-8')
print(f'{task}: {len(cases)} formal-target native collision cases captured',flush=True)
