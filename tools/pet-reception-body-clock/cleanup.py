"""Execute original teardown methods, preserving owner and display references."""
import json,subprocess
import capture
WORK=capture.WORK.parent/'cleanup'
def prepare(mutation=None):
 def put(name,text):
  p=WORK/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text,encoding='utf-8',newline='\n')
 pet=capture.take(capture.Path('base/BasePet.as'),'destroy')
 changes={'source-retained':('this.sourceRole = null;','// source retained'), 'bullets-retained':('this.magicBulletArray = [];','// bullets retained'), 'body-retained':('this.bbdc.destroy();','// body retained'), 'protection-retained':('gc.protectedPerproty.removeProperty(this);','// protection retained')}
 if mutation:
  old,new=changes[mutation];assert old in pet;pet=pet.replace(old,new)
 put('BasePet.as',"""package {import flash.display.Sprite;public class BasePet extends Sprite {
public var bbdc:Body,curAddEffect:Object,magicBulletArray:Array=[],sourceRole:Hero,isReadyToDestroy:Boolean=false;
public var gc:Object;
public function BasePet(){gc={protectedPerproty:new MyProtectedProperty()};gc.protectedPerproty.addProperty(this,"isYourFather",true);}
"""+pet+'}}')
 original_registry=(capture.SRC/'my/MyProtectedProperty.as').read_text(encoding='utf-8')
 put('MyProtectedProperty.as',original_registry.replace('package my','package',1))
 capture.take(capture.Path('my/MyProtectedProperty.as'),'removeProperty')
 put('Hero.as','package {public class Hero {public var myPet:BasePet;'+capture.take(capture.Path('base/BaseHero.as'),'clearPet')+'}}')
 put('Body.as',"""package {import flash.display.Sprite;public class Body extends Sprite {
public var isAnimation:Boolean=false,bmdArray:Array=[1,2],enterFrameFunc:Function=function():void{},exitFrameFunc:Function=function():void{},addFrameScriptWhenFrameOver:Function=function():void{},actionOverFunc:Function,_clipDict:Object={},_curClip:Object;
"""+capture.take(capture.Path('base/BaseBitmapDataClip.as'),'destroy')+'}}')
 put('BaseBullet.as',"""package {import flash.display.Sprite;public class BaseBullet extends Sprite {
public var funcWhenDestroy:Function,funcWhenEnterFrame:Function=function():void{},isReadyToDestroy:Boolean=false,imgMc:Object={},sourceRole:Object,sourceRoleAttackInfoObject:Object={};
"""+capture.take(capture.Path('base/BaseBullet.as'),'destroy')+'}}')
 put('AUtils.as','package {import flash.display.*;public class AUtils {'+capture.take(capture.Path('AUtils.as'),'stopAllChildren')+'}}')
 # The scheduler is an explicit boundary. Execute the ORIGINAL callback after
 # checking its requested duration/params, without claiming Tween interpolation.
 put('TweenMax.as',"""package {public class TweenMax {public static var jobs:Array=[];
public static function to(o:Object,d:Number,p:Object):void{jobs.push({target:o,duration:d,params:p});}
public static function complete():void{var pending:Array=jobs;jobs=[];for each(var j:Object in pending)j.params.onComplete.apply(null,j.params.onCompleteParams);}
}}""")
 put('CleanupProbe.as',(capture.HERE/'CleanupProbe.as').read_text(encoding='utf-8'))
 put('sources.json',json.dumps(dict(records=capture.records,boundary='Original BasePet/Body/Bullet/Hero methods; Tween scheduler and effect destroy callback observed, not reimplemented visual interpolation'),indent=2))
 put('application.xml','<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task254.cleanup</id><versionNumber>1</versionNumber><filename>cleanup254</filename><initialWindow><content>CleanupProbe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
def run(mutation=None):
 prepare(mutation)
 commands=[('compile',['java','-Dflexlib='+str(capture.SDK/'frameworks'),'-jar',str(capture.SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=CleanupProbe.swf','CleanupProbe.as']),('run',[str(capture.SDK/'bin/adl.exe'),'-runtime',str(capture.ROOT/'local-resources/regima/source/unpacked'),str(WORK/'application.xml'),str(WORK)])]
 for phase,command in commands:
  r=subprocess.run(command,cwd=WORK,capture_output=True,timeout=60);log=(r.stdout+r.stderr).decode(errors='replace');(WORK/(phase+'.log')).write_text(log,encoding='utf-8')
  if r.returncode:raise RuntimeError(log[-5000:])
 assert 'COMPLETE' in log
 print('Native cleanup capture completed; independent assertions pending.')
if __name__=='__main__':run()
