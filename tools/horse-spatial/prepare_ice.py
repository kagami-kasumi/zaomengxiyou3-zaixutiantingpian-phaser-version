"""Original add/remove/display methods with an explicitly bounded ice step projection."""
import hashlib
import json
import re
import shutil
from prepare_lifecycle import ROOT,SRC,OUT,take

WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/ice-air'

def main():
    WORK.mkdir(parents=True,exist_ok=True);path=SRC/'base/BaseAddEffect.as';source=path.read_text(encoding='utf-8')
    names=['add','remove','destroy','cancelAllEffect','getBuffByName','isCannotContrlSkill','show_pethorse_ice','hide_pethorse_ice']
    methods={name:take(path,name) for name in names};step=take(path,'step')
    prefix=step[:step.index('if(_loc10_.name ==')]
    show=step[step.index('else if(_loc10_.name == BaseAddEffect.PETHORSE_ICE)'):]
    show=show[:show.index('else if(_loc10_.name == BaseAddEffect.MAGIC_LEAF_CURE)')].replace('else if','if',1)
    start=step.index('if(_loc10_.isForever != 1');expiry=step[start:]
    expiry=expiry[:expiry.index('if(_loc10_.name ==')]+'this.remove(_loc10_);\n}'
    projected=prefix+show+'}\n'+expiry+'}}_loc9_++;}++this.count;}'
    calls=set(re.findall(r'this\.(hide\w+)\(',methods['remove']+methods['destroy']))-{'hide_pethorse_ice'}
    constants='\n'.join(re.findall(r'public static var \w+:String = [^;]+;',source))
    body='\n'.join(methods.values())+projected+'\n'.join('private function '+n+'(...args):void{}' for n in calls)
    fields='public var sourceRole:*,curEffectArray:Array=[],count:int=0,beAttackFatherCurCount:int=0,monster6008fire:int=0,bjsdcs:int=0,gc:IceConfig;'
    (WORK/'BaseAddEffect.as').write_text('package {import flash.display.*;public class BaseAddEffect {'+constants+fields+'public function BaseAddEffect(s:*,c:IceConfig){sourceRole=s;gc=c;}private function poison_times_bomb(a:int,b:Role4):void{throw new Error("inactive");}'+body+'}}',encoding='utf-8')
    (WORK/'AUtils.as').write_text('package {import flash.utils.*;public class AUtils {'+take(SRC/'AUtils.as','getNewObj')+'}}')
    (WORK/'IceConfig.as').write_text('package {public class IceConfig {public var frameClips:int;public var protectedPerproty:Object={removeProperty:function(o:*):void{}};public function isSingleGame():Boolean{return true;}}}')
    shutil.copyfile(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/body-air/BodyClip.as',WORK/'BodyClip.as')
    (WORK/'Target.as').write_text('''package {import flash.display.*;import flash.geom.*;public dynamic class Target extends Sprite {
public var colipse:Sprite,clip:BodyClip,locked:Boolean=false,staticCalls:int=0;
public function Target(){var b:BitmapData=new BitmapData(2,1,true,0);clip=new BodyClip([{name:"body",source:[b,b]}],1,1,new Point());clip.setFrameStopCount([[2,3]]);clip.setFrameCount([2]);clip.setFramePointY(0);}
public function getBBDC():BodyClip{return clip;}public function getPlayer():Object{return {getCurEquipByType:function(s:String):Object{return null;}};}
public function setStatic():void{staticCalls++;}public function setLostKeyboard():void{locked=true;}public function reSetLostKeyboard():void{locked=false;}}}''')
    for name in ['BaseHero','Role4']:(WORK/(name+'.as')).write_text('package {public dynamic class '+name+' extends Target {}}')
    records=[dict(method=n,startLine=source[:source.index(code)].count('\n')+1,sha256=hashlib.sha256(code.encode()).hexdigest()) for n,code in {**methods,'step':step}.items()]
    report=dict(status='prepared-not-promoted',source=path.relative_to(ROOT).as_posix(),sourceSha256=hashlib.sha256(path.read_bytes()).hexdigest(),methods=records,
        bodyClipSha256=hashlib.sha256((WORK/'BodyClip.as').read_bytes()).hexdigest(),bodySourceSha256=hashlib.sha256((SRC/'base/BaseBitmapDataClip.as').read_bytes()).hexdigest(),aUtilsSourceSha256=hashlib.sha256((SRC/'AUtils.as').read_bytes()).hexdigest(),
        scope='Exact add/remove/cancel/destroy/show/hide and source first-show/expiry bookkeeping projection. Other buffs inactive; actual BaseHero input services are observation sinks. Native colipse and ice display, original BBDC stop/continue/step. Target death caller remains separate from explicit cancel boundary.')
    (OUT/'ice-methods.json').write_text(json.dumps(report,indent=2)+'\n')

if __name__=='__main__':main()
