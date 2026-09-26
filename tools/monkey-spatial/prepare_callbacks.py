"""Original pet callbacks over original BBDC; bullet creation is an explicit event sink."""
import hashlib
import json
import re
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/callback-air'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def main():
    helper = runpy.run_path(str(ROOT/'tools/monkey-horse-source/run.py'))
    src = helper['SRC']
    WORK.mkdir(parents=True,exist_ok=True)
    records = []
    def take(file,name):
        path=src/file
        text=path.read_text(encoding='utf-8')
        code=helper['method'](text,name)
        records.append(dict(path=path.relative_to(ROOT).as_posix(),method=name,startLine=text[:text.index(code)].count('\n')+1,
                            fileSha256=hashlib.sha256(path.read_bytes()).hexdigest(),sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        return code
    def write(name,text):
        (WORK/name).write_text(text,encoding='utf-8')
    clip=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/body-air/BodyClip.as'
    write('BodyClip.as',clip.read_text(encoding='utf-8'))
    for form in range(1,5):
        path=f'export/pet/PetMonkey{form}.as'
        names=['setAction','enterFrameFunc','scriptFrameOverFunc','normalHit']
        if form==4:names += ['releSkill1NoUseMana','releSkill2NoUseMana','releSkill3NoUseMana','releSkill4']
        methods=[take(path,n).replace('Math.random()','gc.random()') for n in names]
        # doHit methods are deliberately not claimed here; preserve their invocation as an event.
        hits=sorted(set(re.findall(r'this\.(doHit\w+)\(', '\n'.join(methods))))
        sinks=''.join('private function '+name+'(d:uint,p:Point):void{events.push({kind:"emit",name:"'+name+'",direction:d,x:p.x,y:p.y});}' for name in hits)
        prefix='package {import flash.geom.*; public class Monkey'+str(form)+' extends CallbackBase {'
        fields='private var hit5Times:int=0;private const hit5Const:int=5;private var skill3Release:Boolean=false;'
        constructor='public function Monkey'+str(form)+'(spec:Object){super(spec);bbdc.setEnterFrameCallBack(enterFrameFunc,exitFrameFunc);bbdc.setAddScriptWhenFrameOver(scriptFrameOverFunc);}'
        wrapper='public function startAoyi():void{'+('releSkill4();' if form==4 else '')+'}'
        write(f'Monkey{form}.as',prefix+fields+constructor+'\n'.join(methods)+sinks+wrapper+'}}')
    inherited=take('base/BaseObject.as','setAction')+take('base/BasePet.as','faceToTarget')
    write('CallbackBase.as','''package {import flash.display.*;import flash.geom.*;
public class CallbackBase extends Sprite {
public var bbdc:BodyClip,curAction:String="wait",lastHit:String="",gc:CallbackConfig=new CallbackConfig();
public var sourceRole:CallbackHero=new CallbackHero(),_petInfo:CallbackInfo=new CallbackInfo(),curAttackTarget:BaseMonster;
public var events:Array=[],dead:Boolean=false;
public function CallbackBase(spec:Object){
var bitmap:BitmapData=new BitmapData(spec.cellSize[0]*20,spec.cellSize[1]*spec.rows.length,true,0);
bbdc=new BodyClip([{name:"body",source:[bitmap,bitmap]}],spec.cellSize[0],spec.cellSize[1],new Point());
var holds:Array=[],counts:Array=[];
for each(var row:Object in spec.rows){var h:Array=[];for each(var cell:Object in row.cells)h.push(cell.holdTicks);holds.push(h);counts.push(row.keyFrameCount);}
bbdc.setFrameStopCount(holds);bbdc.setFrameCount(counts);bbdc.setFramePointY(0);bbdc.setDirect(1);
}
public function getBBDC():BodyClip{return bbdc;}public function newAttackId():void{events.push({kind:"attackId"});}
public function setYourFather(n:*):void{events.push({kind:"protect",ticks:n});}
public function setStatic():void{events.push({kind:"static"});}public function destroy():void{dead=true;events.push({kind:"destroy"});}
public function turnLeft():void{bbdc.setDirect(0);}public function turnRight():void{bbdc.setDirect(1);}
protected function enterFrameFunc(p:Point):void{}protected function exitFrameFunc(p:Point):void{}
protected function scriptFrameOverFunc(n:int):void{}protected function normalHit():void{}protected function releSkill4():void{}
'''+inherited+'}}')
    write('CallbackHero.as','package {public class CallbackHero {public var sid:int=1,x:Number=300,y:Number=350;public function getRoleId():int{return sid;}}}')
    write('CallbackInfo.as','''package {public class CallbackInfo {public var skills:Object={},mp:Number=1000;
public function findHasStudySkill(s:String):Boolean{return Boolean(skills[s]);}public function getMp():Number{return mp;}
public function setMp(n:Number):void{mp=n;}public function findPetUsedMagic(s:String):Number{return 10;}}}''')
    write('BaseMonster.as','''package {import flash.display.*;public class BaseMonster extends Sprite {
public var colipse:Sprite=new Sprite();public function BaseMonster(){colipse.graphics.beginFill(0);colipse.graphics.drawRect(-10,-20,20,20);addChild(colipse);}}}''')
    write('CallbackConfig.as','''package {import flash.display.*;public class CallbackConfig {
public var sid:int=1,frameClips:int=24,single:Boolean=false,pWorld:Object={monsterArray:[]},gameSence:Sprite=new Sprite();
public var randomValues:Array=[0,0],randomIndex:int=0,events:Array=[];
public function CallbackConfig(){new Sprite().addChild(gameSence);}
public function isSingleGame():Boolean{return single;}public function random():Number{return randomValues[(randomIndex++)%randomValues.length];}
public function sendPetAttack(...args):void{events.push({kind:"sendAttack",args:args});}
public function sendPetAction(...args):void{events.push({kind:"sendAction",args:args});}}}''')
    report=dict(status='prepared-not-promoted',methods=records,bodyClipSha256=hashlib.sha256(clip.read_bytes()).hexdigest(),
                instrumentation='Only ambient Math.random replaced with configured sequence; original callback/action methods retained. Bullet creation, network, protection, destruction and MP service are explicit observation sinks. Blank body bitmap has source cell dimensions and source BBDC methods; actual pixels verified separately. Synthetic target rectangles only control original jgaoyi eligibility; not collision truth.')
    (OUT/'callback-methods.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print('228 callback source methods:',len(records))


if __name__=='__main__':main()
