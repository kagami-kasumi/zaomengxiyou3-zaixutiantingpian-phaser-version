"""Compose exact parent destruction with the already bounded horse explosion probe."""
import json
import re
import shutil
from prepare_lifecycle import ROOT, SRC, OUT, take
from run_lifecycle import sha

BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229'
WORK=BASE/'cleanup-air'


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    for source in (BASE/'explosion-air').rglob('*.as'):
        if source.name.endswith('Probe.as'):continue
        target=WORK/source.relative_to(BASE/'explosion-air')
        target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
    records=[]
    def method(file):
        path=SRC/file;code=take(path,'destroy')
        records.append(dict(path=path.relative_to(ROOT).as_posix(),fileSha256=sha(path),sliceSha256=__import__('hashlib').sha256(code.encode()).hexdigest()))
        return code
    p=WORK/'CallbackBase.as';s=p.read_text()
    s=s.replace('import base.BaseObject;','import base.BaseObject;import base.BaseBullet;import com.greensock.TweenMax;')
    s=s.replace('public static var atlasPool:', 'public var curAddEffect:CleanupEffect=new CleanupEffect(this);public static var atlasPool:')
    s=s.replace(take(p,'destroy'),re.sub(r'\bBasePet\b','CallbackBase',method('base/BasePet.as')));p.write_text(s)
    p=WORK/'BodyClip.as';s=p.read_text().replace('_curClip:DisplayObject','_curClip:Object')
    p.write_text(s[:-2]+'private var actionOverFunc:Function;'+method('base/BaseBitmapDataClip.as')+'}}')
    code=method('base/BaseAddEffect.as')
    sinks=''.join('private function '+n+'():void{}' for n in sorted(set(re.findall(r'this\.(hide\w+)\(',code))))
    (WORK/'CleanupEffect.as').write_text('package {public class CleanupEffect {public var sourceRole:Object,curEffectArray:Array=[],count:int=0,beAttackFatherCurCount:int=0,gc:CallbackConfig=new CallbackConfig();public function CleanupEffect(s:Object){sourceRole=s;}'+code+sinks+'}}')
    p=WORK/'CallbackConfig.as';p.write_text(p.read_text().replace('public var sid:', 'public var removed:Array=[],protectedPerproty:Object={removeProperty:function(o:Object):void{}};public var sid:'))
    p=WORK/'CallbackHero.as';p.write_text(p.read_text().replace('public var sid:', 'public var clears:int=0;public function clearPet():void{clears++;}public var sid:'))
    p=WORK/'com/greensock/TweenMax.as';p.write_text(p.read_text().replace('public static function delayedCall', 'public static function to(o:Object,t:Number,p:Object):void{backend.to(o,t,p);}public static function delayedCall'))
    probe=(BASE/'explosion-air/ExplosionProbe.as').read_text().replace('ExplosionProbe','CleanupProbe')
    probe=probe.replace('dead-after','destroy-dead').replace('ready-only','destroy-live')
    probe=probe.replace('actor.bbdc.step();','if(!actor.isReadyToDestroy)actor.bbdc.step();')
    probe=probe.replace('if(tick==8&&item.mode=="destroy-dead")actor.dead=true;\n                if(tick==8&&item.mode=="destroy-live")actor.isReadyToDestroy=true;',
        'if(tick==8&&(item.mode=="destroy-dead"||item.mode=="destroy-live")){item.old=actor.magicBulletArray.concat();item.ownerRef=actor.sourceRole;item.effectRef=actor.curAddEffect;if(item.mode=="destroy-dead")actor.dead=true;actor.destroy();}')
    probe=probe.replace('actorDepth:actor.parent.getChildIndex(actor),','actorDepth:actor.parent?actor.parent.getChildIndex(actor):-1,cleanup:{ready:actor.isReadyToDestroy,dead:actor.dead,alpha:actor.alpha,bodyAttached:Boolean(actor.bbdc.parent),sourceAttached:Boolean(actor.sourceRole),effectAttached:Boolean(actor.curAddEffect),effectOwner:item.effectRef?Boolean(item.effectRef.sourceRole):null,ownerClears:item.ownerRef?item.ownerRef.clears:0,old:oldStates(item)},')
    probe=probe.replace('private static function phaseFrames', 'private static function oldStates(item:Object):Array{var a:Array=[];if(item.old)for each(var b:BaseBullet in item.old)a.push({ready:b.isReadyToDestroy,attached:Boolean(b.parent)});return a;}private static function phaseFrames')
    (WORK/'CleanupProbe.as').write_text(probe)
    (OUT/'cleanup-methods.json').write_text(json.dumps(dict(methods=records,explosionProbeSha256=sha(BASE/'explosion-air/ExplosionProbe.as'),scope='Original parent/BBDC destruction, no active buffs on parent; other buff hides are sinks. Actual original TweenMax fade and delayed callback. Dead flag is controlled before destroy; this does not execute HP/death or replacement callers.'),indent=2)+'\n')


if __name__=='__main__':main()
