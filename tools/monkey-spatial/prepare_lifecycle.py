"""Compile original bullet lifecycle methods; collision/settlement are explicit sinks."""
import hashlib
import json
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/lifecycle-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def main():
    records=[]
    def write(name,text):
        path=WORK/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text,encoding='utf-8')
    def take(file,name):
        path=SRC/file;text=path.read_text(encoding='utf-8')
        match=re.search(r'(?:override )?(?:public|protected|private) (?:static )?function '+name+r'\(',text)
        assert match,(file,name)
        start=match.start();opening=text.index('{',match.end());end=opening+1;depth=1
        while depth:depth+=(text[end]=='{')-(text[end]=='}');end+=1
        code=text[start:end]
        records.append(dict(path=path.relative_to(ROOT).as_posix(),method=name,startLine=text[:start].count('\n')+1,
                            fileSha256=hashlib.sha256(path.read_bytes()).hexdigest(),sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        return code
    text=(SRC/'base/BaseBullet.as').read_text(encoding='utf-8')
    fields=text[text.index('public static var DESIDE_BY_FRAMES_LEFT'):text.index('public function BaseBullet(')]
    names=['BaseBullet','step2','step','setDestroyWhenLastFrame','setHurtCanCutDownEffect','setDestroyInCount',
           'setDisable','setRole','setDirect','destroy','setScale','getImgMc','getImcName','setFuncWhenEnterFrame','setFuncWhenDestroy']
    methods='\n'.join(take('base/BaseBullet.as',name) for name in names)
    write('base/BaseBullet.as','''package base {import flash.display.*;import flash.geom.*;
public class BaseBullet extends MovieClip {'''+fields+methods+'''
public var calls:Array=[];
public function setAction(s:String):void{curAction=s;}
protected function checkHitWall():void{calls.push({kind:"wall",x:x,y:y});}
public function checkAttack():void{calls.push({kind:"attack",x:x,y:y,a:transform.matrix.a,dead:isReadyToDestroy,owner:sourceRole?sourceRole.id:null});}
public function newAttackId():void{attackId++;}
private function phaseFrames(d:DisplayObject,result:Array):void{
if(d is MovieClip)result.push(MovieClip(d).currentFrame);
if(d is DisplayObjectContainer)for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++)phaseFrames(DisplayObjectContainer(d).getChildAt(i),result);}
public function snapshot():Object{var frames:Array=[];if(imgMc)phaseFrames(imgMc,frames);return {phaseFrames:frames,symbol:imcName,x:x,y:y,a:transform.matrix.a,d:transform.matrix.d,
dead:isReadyToDestroy,disabled:isDisabled,cut:isHurtCanCutDownEffect,last:isDestroyWhenLastFrame,ttl:destroyInCount,
frame:imgMc?imgMc.currentFrame:null,total:imgMc?imgMc.totalFrames:null,attached:parent!=null,owner:sourceRole?sourceRole.id:null,calls:calls.concat()};}
}}''')
    write('base/BaseObject.as','''package base {import flash.display.Sprite;public class BaseObject extends Sprite {
public var curAction:String="wait",id:String;public function getNumAttackId():int{return id=="P1"?101:202;}}}''')
    write('base/Config.as','''package base {public class Config {public static var instance:Config=new Config();
public var isStopGame:Boolean=false;public static function getInstance():Config{return instance;}}}''')
    for name in ['FollowBaseObjectBullet','SpecialEffectBullet']:
        path=SRC/f'export/bullet/{name}.as'
        write(f'export/bullet/{name}.as',path.read_text(encoding='utf-8'))
        records.append(dict(path=path.relative_to(ROOT).as_posix(),method='whole-class',fileSha256=hashlib.sha256(path.read_bytes()).hexdigest()))
    write('export/bullet/ThroughWallBullet.as','''package export.bullet {import flash.display.Sprite;
public class ThroughWallBullet extends Sprite {public function getUserData():Object{return null;}public function setSwordEffect(o:Object):void{}}}''')
    utils='\n'.join(take('AUtils.as',n) for n in ['getNewObj','flipHorizontal','stopAllChildren','startAllChildren'])
    write('AUtils.as','package {import flash.display.*;import flash.geom.*;import flash.utils.*;public class AUtils {'+utils+'}}')
    (OUT/'lifecycle-methods.json').write_text(json.dumps(dict(status='prepared-not-promoted',methods=records,
        scope='Original BaseBullet lifecycle and whole Follow/Special classes; original native symbol construction. checkHitWall/checkAttack record invocation only, setAction records action only. No damage, dedup, target geometry or owner death caller claim.'),indent=2)+'\n',encoding='utf-8')
    print('228 lifecycle source slices:',len(records))


if __name__=='__main__':main()
