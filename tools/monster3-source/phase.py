"""247 actual ENTER/EXIT phase, original method harness with live restored clips."""
import hashlib,json,shutil,subprocess
from pathlib import Path
import capture
ROOT=capture.ROOT;HERE=Path(__file__).resolve().parent;OUT=capture.OUT

def main():
 work=capture.prepare('native-phase')
 p=work/'BaseBullet.as';s=p.read_text(encoding='utf-8')
 s=s.replace('public function checkAttack() : void\n      {','public function checkAttack() : void\n      {trace("CHECK "+JSON.stringify({tick:Config.tick,phase:inspectPhase()}));')
 s=s.replace('public function checkHitWall():void{}','public function checkHitWall():void{} public function inspectPhase():Object{return {uid:uid,frame:imgMc?imgMc.currentFrame:0,total:imgMc?imgMc.totalFrames:0,ready:isReadyToDestroy,parentPresent:parent!=null};}')
 p.write_text(s,encoding='utf-8');shutil.copyfile(HERE/'PhaseProbe.as',work/'Probe.as')
 commands=[['java','-Dflexlib='+str(capture.base.SDK/'frameworks'),'-jar',str(capture.base.SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as'],[str(capture.base.SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(work/'application.xml'),str(work)]]
 for label,cmd in zip(['compile','run'],commands):
  r=subprocess.run(cmd,cwd=work,capture_output=True,timeout=60);log=(r.stdout+r.stderr).decode(errors='replace');(work/(label+'.log')).write_text(log,encoding='utf-8');assert r.returncode==0,log[-2500:]
 assert 'COMPLETE' in log and '51,1,1,5' in log
 rows=[json.loads(s[6:]) for s in log.splitlines() if s.startswith('PHASE ')]
 checks=[json.loads(s[6:]) for s in log.splitlines() if s.startswith('CHECK ')]
 digest=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
 report=dict(runtime='AIR 51.1.1.5',generatedHashes={p.name:digest(p) for p in work.glob('*.as')},swfSha256=digest(work/'Probe.swf'),restoredSwfSha256=digest(work/'source.swf'),harnessSha256=digest(Path(capture.base.__file__)),status='captured-not-verified',rows=rows,checks=checks,commands=commands,sources=capture.base.RECORDS,fixtureSha256=hashlib.sha256((HERE/'PhaseProbe.as').read_bytes()).hexdigest(),limitations='Original Monster3/world/bullet methods, native clip clock; pause uses documented MainGame stop/start child calls and skips world. Targets are controlled acceptance sinks; not original full scene or pixel/HP oracle.')
 (OUT/'phase.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(dict(task='247',nativePhaseStates=len(rows),actualCheckCalls=len(checks),status='captured-not-verified')))
if __name__=='__main__':main()
