"""Independent restored MovieClip host clock probe, no modern renderer."""
import hashlib,json,shutil,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-232/timeline'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-232/timeline.json'
def main():
 WORK.mkdir(parents=True,exist_ok=True)
 source=ROOT/'local-resources/regima/source/restored-swfs/assets/1.swf'
 shutil.copyfile(source,WORK/'source.swf');shutil.copyfile(Path(__file__).with_name('Probe.as'),WORK/'Probe.as')
 (WORK/'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task232.timeline</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
 commands=[['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as'],[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(WORK/'application.xml'),str(WORK)]]
 for label,cmd in zip(['compile','run'],commands):
  run=subprocess.run(cmd,cwd=WORK,capture_output=True,timeout=60);log=(run.stdout+run.stderr).decode(errors='replace');(WORK/(label+'.log')).write_text(log,encoding='utf-8');assert run.returncode==0,log[-3000:]
 assert 'COMPLETE' in log and '51,1,1,5' in log,log
 rows=json.loads(next(s[5:] for s in log.splitlines() if s.startswith('ROWS ')))
 assert len(rows)==66
 for fps in [20,24,30]:
  group=[r for r in rows if r['fps']==fps];assert len(group)==22
  assert all(r['total']==10 for r in group)
  assert all(group[i]['frame']==group[4]['frame'] for i in [5,6,7])
  assert group[8]['frame']==group[7]['frame']%10+1
  assert len(set(r['frame'] for r in group))==10
 report=dict(status='verified-bounded-native-timeline',runtime='AIR 51.1.1.5',source=source.relative_to(ROOT).as_posix(),sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),symbol='Monster30Bullet1',rows=rows,commands=commands,limitations='Native clip clock and explicit stop/play only; not PhysicsWorld or damage/collision/pixel equivalence.')
 OUT.parent.mkdir(parents=True,exist_ok=True);OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('232 restored MovieClip: 66 host observations, 3 fps, stop/resume passed')
if __name__=='__main__':main()
