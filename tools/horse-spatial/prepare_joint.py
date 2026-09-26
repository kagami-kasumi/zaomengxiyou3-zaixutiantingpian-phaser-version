"""Join original horse callbacks/doHit creation with original native bullet lifecycle."""
import hashlib
import json
import re
import runpy
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229'
WORK=BASE/'joint-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-229'


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    for folder in ['callback-air','lifecycle-air']:
        for path in (BASE/folder).rglob('*.as'):
            if path.name.endswith('Probe.as'):continue
            target=WORK/path.relative_to(BASE/folder);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
    helper=runpy.run_path(str(ROOT/'tools/monkey-horse-source/run.py'))
    records=[]
    for form in range(1,5):
        path=WORK/f'Horse{form}.as';text=path.read_text(encoding='utf-8')
        source=helper['SRC']/f'export/pet/PetHorse{form}.as';original=source.read_text(encoding='utf-8')
        text=text.replace('import flash.geom.*;','import flash.geom.*;import base.*;import export.bullet.*;')
        for name in re.findall(r'private function (doHit\w+)\(',text):
            code=helper['method'](original,name)
            old=helper['method'](text,name)
            text=text.replace(old,code)
            records.append(dict(source=source.relative_to(ROOT).as_posix(),method=name,
                                line=original[:original.index(code)].count('\n')+1,sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        if form==4:
            callback=helper['method'](original,'hit5Hit')
            text=text[:-2]+re.sub(r'\bPetHorse4\b','Horse4',callback)+'}}'
            text=text.replace('import flash.geom.*;','import flash.geom.*;import com.greensock.TweenMax;')
            records.append(dict(source=source.relative_to(ROOT).as_posix(),method='hit5Hit',line=original[:original.index(callback)].count('\n')+1,sliceSha256=hashlib.sha256(callback.encode()).hexdigest()))
        path.write_text(text,encoding='utf-8')
    path=WORK/'CallbackBase.as';text=path.read_text(encoding='utf-8')
    text=text.replace('import flash.display.*;','import flash.display.*;import flash.utils.*;import base.BaseObject;')
    text=text.replace('extends Sprite','extends BaseObject').replace('bbdc:BodyClip,curAction:String="wait",lastHit:String=""','bbdc:BodyClip,lastHit:String=""')
    text=text.replace('public var events:Array=[]','public var magicBulletArray:Array=[],events:Array=[]')
    text=text.replace('events:Array=[],dead:Boolean=false;','events:Array=[];')
    text=text.replace('import base.BaseObject;','import base.BaseObject;import export.bullet.*;')
    text=text.replace('curAttackTarget:BaseMonster','curAttackTarget:FixtureTarget')
    text=text.replace('public var magicBulletArray:Array=[]','public var attackBackInfoDict:Object={};public var magicBulletArray:Array=[]')
    old=helper['method'](text,'addAoyiBuff')
    inherited=(helper['SRC']/'base/BasePet.as').read_text(encoding='utf-8')
    text=text.replace(old,helper['method'](inherited,'addAoyiBuff'))
    old='var bitmap:BitmapData=new BitmapData(spec.cellSize[0]*20,spec.cellSize[1]*spec.rows.length,true,0);'
    new='var bitmap:BitmapData=atlasPool[spec.form-1];var flipped:BitmapData=new BitmapData(bitmap.width,bitmap.height,true,0);flipped.draw(bitmap,new Matrix(-1,0,0,1,bitmap.width,0));'
    assert old in text;text=text.replace(old,new).replace('source:[bitmap,bitmap]','source:[bitmap,flipped]')
    text=text.replace('public class CallbackBase extends BaseObject {','public class CallbackBase extends BaseObject {public static var atlasPool:Array=[];')
    text=text.replace('bbdc.setDirect(1);','bbdc.setDirect(1);bbdc.setOffsetXY(spec.offset[0],spec.offset[1]);addChild(bbdc);',1)
    path.write_text(text,encoding='utf-8')
    path=WORK/'BaseMonster.as';text=path.read_text().replace('import flash.display.*;','import flash.display.*;import base.BaseMonster;').replace('extends Sprite','extends BaseMonster').replace('class BaseMonster','class FixtureTarget').replace('function BaseMonster','function FixtureTarget');(WORK/'FixtureTarget.as').write_text(text);path.unlink()
    path=WORK/'base/BaseBullet.as';text=path.read_text()
    original=(helper['SRC']/'base/BaseBullet.as').read_text(encoding='utf-8')
    text=text[:-2]+helper['method'](original,'setFuncWhenHit')+'}}';path.write_text(text)
    (WORK/'base/BaseAddEffect.as').write_text('package base {public class BaseAddEffect {public static const PETHORSE_ICE:String="pethorse_ice";}}')
    folder=WORK/'com/greensock';folder.mkdir(parents=True,exist_ok=True)
    (folder/'TweenMax.as').write_text('package com.greensock {public class TweenMax {public static var pending:Array=[];public static function delayedCall(t:Number,f:Function,args:Array):void{pending.push({delay:t,callback:f,args:args});}}}')
    report=dict(status='prepared-not-promoted',methods=records,
                dependencies=['callback-methods.json','lifecycle-methods.json','body-inputs.json'],
                scope='Original doHit/addAoyiBuff creation; hit5Hit keeps original body with class identifier adapted to fixture Horse4. CallbackBase controls AI/protection/MP/network. Collision and settlement are sinks, so hit5Hit is not called here and TweenMax only queues callbacks. Native bitmap body; explicit bullet-before-body scheduler, not full BasePet.step. Ice/delayed explosion execution requires separate evidence.')
    (OUT/'joint-methods.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print('229 joint original doHit methods:',len(records))


if __name__=='__main__':main()
