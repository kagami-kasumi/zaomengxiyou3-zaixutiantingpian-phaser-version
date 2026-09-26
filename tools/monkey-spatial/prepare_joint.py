"""Join original monkey callbacks/doHit creation with original native bullet lifecycle."""
import hashlib
import json
import re
import runpy
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228'
WORK=BASE/'joint-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    for folder in ['callback-air','lifecycle-air']:
        for path in (BASE/folder).rglob('*.as'):
            if path.name.endswith('Probe.as'):continue
            target=WORK/path.relative_to(BASE/folder);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
    helper=runpy.run_path(str(ROOT/'tools/monkey-horse-source/run.py'))
    records=[]
    for form in range(1,5):
        path=WORK/f'Monkey{form}.as';text=path.read_text(encoding='utf-8')
        source=helper['SRC']/f'export/pet/PetMonkey{form}.as';original=source.read_text(encoding='utf-8')
        text=text.replace('import flash.geom.*;','import flash.geom.*;import base.*;import export.bullet.*;')
        text=text.replace('private var skill3Release:Boolean=false;','private var skill1Release:Boolean=false,skill2Release:Boolean=false,skill3Release:Boolean=false;')
        for name in re.findall(r'private function (doHit\w+)\(',text):
            code=helper['method'](original,name)
            old=helper['method'](text,name)
            text=text.replace(old,code)
            records.append(dict(source=source.relative_to(ROOT).as_posix(),method=name,
                                line=original[:original.index(code)].count('\n')+1,sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        path.write_text(text,encoding='utf-8')
    path=WORK/'CallbackBase.as';text=path.read_text(encoding='utf-8')
    text=text.replace('import flash.display.*;','import flash.display.*;import flash.utils.*;import base.BaseObject;')
    text=text.replace('extends Sprite','extends BaseObject').replace('bbdc:BodyClip,curAction:String="wait",lastHit:String=""','bbdc:BodyClip,lastHit:String=""')
    text=text.replace('public var events:Array=[]','public var magicBulletArray:Array=[],events:Array=[]')
    old='var bitmap:BitmapData=new BitmapData(spec.cellSize[0]*20,spec.cellSize[1]*spec.rows.length,true,0);'
    new='var bitmap:BitmapData=atlasPool[spec.form-1];var flipped:BitmapData=new BitmapData(bitmap.width,bitmap.height,true,0);flipped.draw(bitmap,new Matrix(-1,0,0,1,bitmap.width,0));'
    assert old in text;text=text.replace(old,new).replace('source:[bitmap,bitmap]','source:[bitmap,flipped]')
    text=text.replace('public class CallbackBase extends BaseObject {','public class CallbackBase extends BaseObject {public static var atlasPool:Array=[];')
    text=text.replace('bbdc.setDirect(1);','bbdc.setDirect(1);bbdc.setOffsetXY(spec.offset[0],spec.offset[1]);addChild(bbdc);',1)
    path.write_text(text,encoding='utf-8')
    report=dict(status='prepared-not-promoted',methods=records,
                dependencies=['callback-methods.json','lifecycle-methods.json','body-inputs.json'],
                scope='Original doHit methods replace emission sinks. CallbackBase still controls external AI/protection/MP/network; bullet collision and settlement remain sinks. Source native bitmap bodies replace blank callback atlas. Explicit scheduler uses known BasePet bullet-before-body ordering; full BasePet.step is not claimed.')
    (OUT/'joint-methods.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print('228 joint original doHit methods:',len(records))


if __name__=='__main__':main()
