"""256 actual ENTER/EXIT phase, original method harness with live restored clips."""
import hashlib,json,shutil,subprocess,sys
from pathlib import Path
import capture
ROOT=capture.ROOT;HERE=Path(__file__).resolve().parent;OUT=capture.OUT

def main():
 mutation=sys.argv[1] if len(sys.argv)>1 else None
 work=capture.prepare('native-phase'+('-'+mutation if mutation else ''))
 pause='\n'.join(capture.base.take('my/MainGame.as',n) for n in ['stopGame','continueGame'])
 if mutation=='pause-raw':pause=pause.replace('this.gc.isStopGame = true;', 'AUtils.stopAllChildren(this.gc.gameSence);this.gc.isStopGame = true;')
 (work/'MainGameProbe.as').write_text('package {import flash.events.*;import flash.display.*;import flash.utils.*;public class MainGameProbe {public var gc:Config=Config.instance,root:Sprite=new Sprite();private function __enterFrame(e:Event):void{}'+pause+'}}',encoding='utf-8')
 p=work/'Config.as';s=p.read_text(encoding='utf-8').replace('public var doors:Array=[];','public var doors:Array=[];public var keyboardControl:Object={stopKeyboardControl:function():void{},continueKeyboardControl:function():void{}};');p.write_text(s,encoding='utf-8')
 p=work/'BaseHero.as';s=p.read_text(encoding='utf-8').replace('public function getPlayer()', 'public function getCurMagicWeapon():Object{return null;}public function getPlayer()');p.write_text(s,encoding='utf-8')
 p=work/'TweenMax.as';s=p.read_text(encoding='utf-8').replace('public static var calls:Array=[];', 'public static var calls:Array=[],controls:Array=[];public static function pauseAll(a:Boolean,b:Boolean):void{controls.push({tick:Config.tick,kind:"pause",tweens:a,delays:b});}public static function resumeAll():void{controls.push({tick:Config.tick,kind:"resume"});}');p.write_text(s,encoding='utf-8')
 if mutation=='raw-no-remove':
  p=work/'AUtils.as';s=p.read_text(encoding='utf-8').replace('visuals.push(clip);','{visuals.push(clip);clip.addFrameScript(13,function():void{});}')
  p.write_text(s,encoding='utf-8')
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
 report=dict(runtime='AIR 51.1.1.5',generatedHashes={p.name:digest(p) for p in work.glob('*.as')},swfSha256=digest(work/'Probe.swf'),restoredSwfSha256=digest(work/'source.swf'),harnessSha256=digest(Path(capture.base.__file__)),status='captured-not-verified',rows=rows,checks=checks,commands=commands,sources=capture.base.RECORDS,fixtureSha256=hashlib.sha256((HERE/'PhaseProbe.as').read_bytes()).hexdigest(),limitations='Original Monster2/world/bullet methods, native clip clock; pause executes original MainGame stopGame/continueGame and skips world; Tween API is a recorded service, not interpolation. Targets are controlled acceptance sinks; not original full scene or pixel/HP oracle.')
 (OUT/('phase'+('-'+mutation if mutation else '')+'.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 print(json.dumps(dict(task='256',nativePhaseStates=len(rows),actualCheckCalls=len(checks),status='captured-not-verified')))
if __name__=='__main__':main()
