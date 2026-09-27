"""232 execute extracted source methods in bundled AIR; services are explicit sinks."""
import hashlib, json, re, subprocess, sys, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-232'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-232/source'
RECORDS=[]
def take(path,name):
 p=SRC/path;s=p.read_text(encoding='utf-8');m=re.search(r'(?:override )?(?:public|protected|private)(?: static)? function '+name+r'\s*\(',s);assert m,(path,name)
 b=s.index('{',m.end());d=1;i=b+1
 while d:d+=(s[i]=='{')-(s[i]=='}');i+=1
 code=s[m.start():i];RECORDS.append(dict(path=p.relative_to(ROOT).as_posix(),method=name,line=s[:m.start()].count('\n')+1,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),methodSha256=hashlib.sha256(code.encode()).hexdigest()))
 return code

def prepare(mutation):
 global WORK
 WORK=WORK/(mutation or 'baseline');WORK.mkdir(parents=True,exist_ok=True)
 def write(n,s):(WORK/n).write_text(s,encoding='utf-8')
 def methods(p,names):return '\n'.join(take(p,n) for n in names)
 bbdc=methods('base/BaseBitmapDataClip.as',['step','frameShow','setState','getState','setFramePointX','setFramePointY','getCurPoint','getCurFrameCount','stopFrame','continueFrame','addFrameScriptEnterEveryFrame','addFrameScriptExitEveryFrame'])
 write('Clip.as','''package {import flash.geom.Point;public class Clip{
 public var isAnimation:Boolean=false,isStopFrame:Boolean=false,_isPlaying:Boolean=true,curFrameStopCount:int=2,curKeyFrameIndex:int=0,state:String='wait',curPoint:Point=new Point();
 public var frameCount:Array=[6,1,5,1],frameStopCount:Array=[[2,2,2,2,2,2],[15],[2,2,2,2,6],[10]],enterFrameFunc:Function,exitFrameFunc:Function,addFrameScriptWhenFrameOver:Function;
 public function refreshCurFrame():void{} public function getDirect():uint{return 0;}
 METHODS }}'''.replace('METHODS',bbdc))
 objectstep=take('base/BaseObject.as','step')
 if mutation=='effects-first':objectstep=objectstep.replace('         if(this.bbdc)','         if(this.curAddEffect){this.curAddEffect.step();}\n         if(this.bbdc)',1).replace('            this.curAddEffect.step();','            /* mutation moved effect */',1)
 write('BaseObject.as','''package {import flash.display.*;public dynamic class BaseObject extends Sprite{
 public var gc:Config=Config.instance,bbdc:Clip=new Clip(),curAction:String='wait',curAddEffect:BaseAddEffect,curMagicWeapon:Object,cureHpQueue:Object;
 public var isFly:Boolean=true,fatherCount:int=-1,hmzfatherCount:int=-1,lysfatherCount:int=-1,istouming:Boolean=false,hp:int=100,isReadyToDestroy:Boolean=false;
 public var colipse:Sprite=new Sprite();public var magicBulletArray:Array=[],attackBackInfoDict:Object={hit1:{hitMaxCount:99,attackInterval:999,power:15}},beAttackIdArray:Array=[],id:String='source';
 public function reduceHp(v:int,h:Boolean=false):void{} public function isBeAttacking():Boolean{return curAction=='hit1';} public function setSpeed():void{} public function checkCanMove():void{} public function isCanMoveByStage():Boolean{return false;} public function move():void{} public function checkOver():void{}
 public function getBBDC():Clip{return bbdc;} public function isDead():Boolean{return hp<=0;} public function getNumAttackId():int{return 1;} public function getRealPower(a:String,b:Boolean=true):Object{return {hurt:15,qixue:0,atk:15};}
 public function beMagicAttack(b:BaseBullet,s:BaseObject):Boolean{Config.hits.push({tick:Config.tick,uid:b.uid,sourceDead:s.isDead(),action:s.curAction,x:b.x,y:b.y});return true;}
 public function beMagicAttack1(b:BaseBullet,s:BaseObject):Boolean{return false;}
 METHODS }}'''.replace('METHODS',objectstep+'\n'+take('base/BaseObject.as','setAction')))
 death=take('base/BaseMonster.as','reduceHp')
 if mutation=='death-clears':death=death.replace('this.setAction("dead");','this.setAction("dead");for each(var deadBullet:BaseBullet in this.magicBulletArray)deadBullet.destroy();this.magicBulletArray=[];')
 # Exact destroy prefix/suffix retained only through bullet cleanup; boss UI and delayed fade are explicit omitted services.
 destroy=take('base/BaseMonster.as','destroy');destroy=destroy[destroy.index('         this.isReadyToDestroy = true;'):destroy.index('         this.curAttackTarget = null;')]
 if mutation=='destroy-keeps':destroy=destroy.replace('bb.destroy();','/* mutation keep child */')
 RECORDS[-1]['fragment']='isReadyToDestroy through magicBulletArray=null; UI, Tween fade and post-cleanup fields excluded'
 write('BaseMonster.as','''package {public class BaseMonster extends BaseObject{
 public var curAttackTarget:BaseObject,protectedParamsObject:Object={exp:0},isBoss:Boolean=false,monsterName:String='probe';
 public function getHp():int{return hp;}public function getSHp():int{return 100;}public function setHp(v:int):void{hp=v;}public function drawMonsterHp():void{}
 public function reduceHpUnused():void{} public function setStatic():void{} public function dropAura():void{} public function destroy():void{var bb:*;DESTROY}
 METHODS }}'''.replace('METHODS',death).replace('DESTROY',destroy))
 m30=methods('export/monster/Monster30.as',['setAction','enterFrameFunc','doHi1','exitFrameFunc','scriptFrameOverFunc'])
 m30=m30.replace('override protected','protected')
 if mutation=='display-only':m30=m30.replace('this.magicBulletArray.push(_loc2_);','/* mutation no gameplay enrollment */')
 if mutation=='repeat-spawn':m30=m30.replace('this.bbdc.getCurFrameCount() == 10','this.bbdc.getCurFrameCount() >= 1')
 write('MonsterProbe.as','''package {import flash.geom.*;public class MonsterProbe extends BaseMonster{
 public function MonsterProbe(){bbdc.enterFrameFunc=enterFrameFunc;bbdc.exitFrameFunc=exitFrameFunc;bbdc.addFrameScriptWhenFrameOver=scriptFrameOverFunc;curAddEffect=new BaseAddEffect(this);setAction('hit1');}
 METHODS }}'''.replace('METHODS',m30))
 fire=take('base/BaseAddEffect.as','step');fire=fire[fire.rindex('                  else if(_loc10_.name == BaseAddEffect.PETMONKEY_FIRE)'):fire.rindex('                  else if(_loc10_.name == BaseAddEffect.Monster37FIX)')]
 RECORDS[-1]['fragment']='PETMONKEY_FIRE branch only; countdown injection explicitly controlled'
 ice=methods('base/BaseAddEffect.as',['show_pethorse_ice','hide_pethorse_ice']).replace('protected function','public function')
 write('BaseAddEffect.as','''package {public class BaseAddEffect{
 public static const PETMONKEY_FIRE:String='petmonkey_fire',SHENMISHANGRENSHIZHUANG:String='merchant';
 public var sourceRole:BaseObject,damage:int=0,ice:String='',count:int=0,gc:Config=Config.instance;
 public function BaseAddEffect(s:BaseObject=null){sourceRole=s;}public function getBuffByName(n:String):Object{return null;}
 public function step():void{if(ice=='show')show_pethorse_ice();if(ice=='hide')hide_pethorse_ice();ice='';if(damage){var _loc10_:Object={name:PETMONKEY_FIRE,hurt:damage};if(false){} __FIRE__ damage=0;}}
 __ICE__ }}'''.replace('__FIRE__',fire).replace('__ICE__',ice))
 head=(SRC/'base/BaseBullet.as').read_text(encoding='utf-8');fields=head[head.index('      public static var DESIDE'):head.index('      public function BaseBullet(')]
 bmethods=methods('base/BaseBullet.as',['BaseBullet','step2','step','checkAttack','destroy','setRole','setAction','refreshSourceRoleAttackInfoObject','setDirect','getAttackId','newAttackId','getImcName','getImgMc1','setBingoRate','setDestroyInCount','setHurtCanCutDownEffect'])
 write('BaseBullet.as','''package {import flash.display.*;import flash.geom.*;public class BaseBullet extends MovieClip{
 public static var serial:int=0;public var uid:int=++serial;
 FIELDS
 public function checkHitWall():void{} public function inspectFrame(v:int):void{if(imgMc)imgMc.gotoAndStop(v);}public function inspect():Object{return {uid:uid,ready:isReadyToDestroy,x:x,y:y,action:curAction,frame:imgMc?imgMc.currentFrame:0};}
 METHODS }}'''.replace('FIELDS',fields).replace('METHODS',bmethods))
 write('SpecialEffectBullet.as','package {public class SpecialEffectBullet extends BaseBullet{public function SpecialEffectBullet(s:String){super(s);}}}')
 # Monster-loop verbatim: old bullets are processed before body and newly-created bullets wait.
 world=take('World/PhysicsWorld.as','step');world=world[world.index('         var _loc8_:* = [];'):world.index('         _loc10_ = this.heroArray.length;')]
 if mutation=='same-tick-hit':world=world.replace('                  _loc3_ = uint(_loc4_.magicBulletArray.length);','                  _loc4_.step();\n                  _loc3_ = uint(_loc4_.magicBulletArray ? _loc4_.magicBulletArray.length : 0);').replace('                  _loc4_.step();\n               }','               }')
 clear=take('World/PhysicsWorld.as','clearWaitFromParentArray')
 write('WorldProbe.as','''package {public class WorldProbe {public var monsterArray:Array=[];
 public function step():void{var _loc1_:int=0,_loc2_:*,_loc3_:*,_loc4_:*; WORLD}
 CLEAR }}'''.replace('WORLD',world).replace('CLEAR',clear))
 write('Config.as','''package {import flash.display.Sprite;public class Config{
 public static var instance:Config=new Config(),tick:int=0,hits:Array=[];public var gameSence:Sprite=new Sprite(),frameClips:int=24,isStopGame:Boolean=false,difficulity:int=1,isPK:Boolean=false,targets:Array=[];
 public var pWorld:Object={monsterArray:[],likeMonsterArray:[]},protectedPerproty:Object={setProperty:function(...a):void{}},gameInfo:Object={addBossBlood:function(...a):void{}};
 public static function getInstance():Config{return instance;}public function getPlayerArray():Array{return targets;}public function isInRoom():Boolean{return false;}public function getRivalPlayer(s:*):Object{return null;}
 }}''')
 write('AUtils.as','''package {import flash.display.*;public class AUtils{public static var clipClass:Class;
 public static function getNewObj(s:String):MovieClip{return new clipClass() as MovieClip;}
 public static function flipHorizontal(o:DisplayObject,v:Number):void{o.scaleX=v;}
 public static function stopAllChildren(o:DisplayObjectContainer):void{for(var i:int=0;i<o.numChildren;i++){var c:DisplayObject=o.getChildAt(i);if(c is MovieClip)MovieClip(c).stop();if(c is DisplayObjectContainer)stopAllChildren(c as DisplayObjectContainer);}}
 public static function startAllChildren(o:DisplayObjectContainer):void{for(var i:int=0;i<o.numChildren;i++){var c:DisplayObject=o.getChildAt(i);if(c is MovieClip)MovieClip(c).play();if(c is DisplayObjectContainer)startAllChildren(c as DisplayObjectContainer);}}
 }}''')
 write('BaseHero.as','''package {public class BaseHero extends BaseObject{public var roleProperies:Object={setExper:function(v:*):void{},getExper:function():int{return 0;}};public function getPet():BasePet{return null;}public function getPlayer():Object{return null;}public function cureHp(v:*):void{}public function setStatic():void{}public function setLostKeyboard():void{}public function reSetLostKeyboard():void{}}}''')
 write('BasePet.as','''package {public class BasePet extends BaseObject{public var petInfo:Object={setCurExper:function(v:*):void{},getCurExper:function():int{return 0;},getAtk:function():int{return 1;}};public function getSourceRole():BaseHero{return null;}}}''')
 for n in list(range(70,79))+[34]:
  write('Monster'+str(n)+'.as','package {public class Monster'+str(n)+' extends BaseMonster{public function createShallow():void{}}}')
 write('MonsterRole4Hit5.as','package {public class MonsterRole4Hit5 extends BaseMonster{public function getSourceRole():BaseObject{return null;}}}')
 shutil.copyfile(Path(__file__).with_name('Probe.as'),WORK/'Probe.as')
 shutil.copyfile(ROOT/'local-resources/regima/source/restored-swfs/assets/1.swf',WORK/'source.swf')
 write('application.xml','<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task232.source</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
 return WORK

def run(mutation=None):
 work=prepare(mutation);commands=[['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as'],[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(work/'application.xml'),str(work)]]
 for label,cmd in zip(['compile','run'],commands):
  r=subprocess.run(cmd,cwd=work,capture_output=True,timeout=60);log=(r.stdout+r.stderr).decode(errors='replace');(work/(label+'.log')).write_text(log,encoding='utf-8');assert r.returncode==0,log[-5500:]
 assert 'COMPLETE' in log and '51,1,1,5' in log,log[-5500:]
 rows=json.loads(next(s[5:] for s in log.splitlines() if s.startswith('ROWS ')))
 report=dict(status='source-observation-not-yet-verified',mutation=mutation,runtime='AIR 51.1.1.5',rows=rows,sources=RECORDS,commands=commands,swfSha256=hashlib.sha256((work/'Probe.swf').read_bytes()).hexdigest(),restoredSwfSha256=hashlib.sha256((work/'source.swf').read_bytes()).hexdigest(),generatedHashes={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in work.glob('*.as')},limitations='Original method and exact fragment execution. Physics, reward/UI, graphics, targeting/collision acceptance are service sinks; effect expiry is injected. Bullet frames use restored MovieClip explicit gotoAndStop inputs, independently checked native clock by timeline probe. Not full game or pixel hit verification.')
 OUT.mkdir(parents=True,exist_ok=True);(OUT/('source-'+(mutation or 'baseline')+'.json')).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8');print('232 actual source:',len(rows),mutation or 'baseline')
if __name__=='__main__':run(sys.argv[1] if len(sys.argv)>1 else None)
