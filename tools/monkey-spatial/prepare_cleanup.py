"""Original parent destruction and target FireBuff display methods with bounded services."""
import hashlib
import json
import re
import runpy
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228'
WORK=BASE/'cleanup-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    shutil.copyfile(ROOT/'tools/monkey-spatial/NativeTree.as',WORK/'NativeTree.as')
    helper=runpy.run_path(str(ROOT/'tools/monkey-horse-source/run.py'));src=helper['SRC'];records=[]
    def take(file,name):
        path=src/file;text=path.read_text(encoding='utf-8');code=helper['method'](text,name)
        records.append(dict(path=path.relative_to(ROOT).as_posix(),method=name,startLine=text[:text.index(code)].count('\n')+1,
                            fileSha256=hashlib.sha256(path.read_bytes()).hexdigest(),sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        return code
    def write(name,text):
        path=WORK/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text,encoding='utf-8')
    for path in (BASE/'lifecycle-air').rglob('*.as'):
        if path.name.endswith('Probe.as') or path.name=='NativeTree.as':continue
        target=WORK/path.relative_to(BASE/'lifecycle-air');target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
    clip=(BASE/'body-air/BodyClip.as').read_text(encoding='utf-8').replace('_curClip:DisplayObject','_curClip:Object')
    clip=clip[:-2]+'private var actionOverFunc:Function;'+take('base/BaseBitmapDataClip.as','destroy')+'}}'
    write('BodyClip.as',clip)
    write('OwnerStub.as','package {public class OwnerStub {public var clears:int=0;public function clearPet():void{clears++;}}}')
    write('CleanupConfig.as','''package {public class CleanupConfig {public static var instance:CleanupConfig=new CleanupConfig();
public var protectedPerproty:Object={removeProperty:function(o:Object):void{}};}}''')
    write('BasePet.as','''package {import flash.display.*;import flash.geom.*;import base.*;import com.greensock.TweenMax;
public class BasePet extends BaseObject {public var bbdc:BodyClip,curAddEffect:BaseAddEffect,magicBulletArray:Array=[];
public var sourceRole:OwnerStub=new OwnerStub(),gc:CleanupConfig=CleanupConfig.instance,isReadyToDestroy:Boolean=false;
public function BasePet(){var bitmap:BitmapData=new BitmapData(16,16,true,0);bbdc=new BodyClip([{name:"body",source:[bitmap,bitmap]}],16,16,new Point());
bbdc.setFrameStopCount([[1]]);bbdc.setFrameCount([1]);bbdc.setFramePointY(0);addChild(bbdc);curAddEffect=new BaseAddEffect(this);}
'''+take('base/BasePet.as','destroy')+'}}')
    methods='\n'.join(take('base/BaseAddEffect.as',name) for name in ['show_mpetmonkey_fire','hide_mpetmonkey_fire','destroy'])
    inactive=sorted(set(re.findall(r'this\.(hide\w+)\(',helper['method']((src/'base/BaseAddEffect.as').read_text(encoding='utf-8'),'destroy'))))
    sinks=''.join('private function '+name+'():void{}' for name in inactive)
    write('BaseAddEffect.as','''package {import flash.display.*;public class BaseAddEffect {
public var sourceRole:Sprite,curEffectArray:Array=[],count:int=0,beAttackFatherCurCount:int=0,gc:CleanupConfig=CleanupConfig.instance;
public function BaseAddEffect(s:Sprite){sourceRole=s;}public function showFire():void{show_mpetmonkey_fire();}public function hideFire():void{hide_mpetmonkey_fire();}
'''+methods+sinks+'}}')
    tween=(src/'com/greensock/TweenLite.as').read_text(encoding='utf-8')
    match=re.search(r'(?:public|protected|private) static function easeOut\(',tween);assert match
    begin=match.start();opening=tween.index('{',match.end());end=opening+1;depth=1
    while depth:depth+=(tween[end]=='{')-(tween[end]=='}');end+=1
    ease=tween[begin:end]
    records.append(dict(path='local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/com/greensock/TweenLite.as',method='easeOut',sliceSha256=hashlib.sha256(ease.encode()).hexdigest()))
    write('com/greensock/TweenMax.as','''package com.greensock {public class TweenMax {public static var items:Array=[];
public static function to(o:Object,t:Number,p:Object):void{items.push({target:o,time:t,props:p,initial:o.alpha});}
public static function advance(t:Number):void{for each(var item:Object in items){item.target.alpha=item.initial+(item.props.alpha-item.initial)*easeOut(Math.min(t,item.time),0,1,item.time);
if(t>=item.time)item.props.onComplete.apply(null,item.props.onCompleteParams);}}
'''+ease+'}}')
    report=dict(status='prepared-not-promoted',methods=records,
                scope='Exact BasePet.destroy/BBDC bitmap destruction and BaseAddEffect FireBuff show/hide/destroy. Other inactive buff hide methods are no-op fixture services. Tween scheduling uses controlled elapsed time with original easeOut and original completion callback. FireBuff holder is a separate target, not implicitly the attacking pet. Blank BBDC bitmap exercises removal only, not body visual truth.')
    (OUT/'cleanup-methods.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print('228 cleanup methods:',len(records))


if __name__=='__main__':main()
