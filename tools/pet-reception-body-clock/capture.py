"""254 bounded original-method clock observation. No visual/HP claim."""
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SRC = ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-254/clock'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
records = []


def take(path, name):
    text = (SRC/path).read_text(encoding='utf-8')
    match = re.search(r'(?:public|protected|private) (?:static )?function '+name+r'\(', text)
    assert match, (path, name)
    begin = text.index('{', match.start())
    at, depth = begin+1, 1
    while depth:
        depth += (text[at] == '{') - (text[at] == '}')
        at += 1
    records.append(dict(path=str(path), method=name, line=text[:match.start()].count('\n')+1,
                        sha256=hashlib.sha256((SRC/path).read_bytes()).hexdigest()))
    return text[match.start():at]


def put(path, text):
    target = WORK/path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding='utf-8', newline='\n')


def prepare(mutation=None):
    forms = json.loads((WORK.parent/'source-inventory.json').read_text(encoding='utf-8'))['forms']
    methods = ['frameShow', 'addFrameScriptEnterEveryFrame', 'addFrameScriptExitEveryFrame',
               'setFramePointX', 'setFramePointY', 'step', 'setState', 'getState',
               'setFrameStopCount', 'getFrameStopCount', 'setFrameCount', 'getCurPoint',
               'resetCurFrameStopCount', 'getCurFrameCount', 'setCurFrameCount', 'stopFrame',
               'continueFrame', 'setAddScriptWhenFrameOver']
    code = '''package {import flash.geom.Point;public class Clock {
public var isAnimation:Boolean=false,isStopFrame:Boolean=false,_isPlaying:Boolean=true;
public var frameStopCount:Array,frameCount:Array,curPoint:Point=new Point(),curKeyFrameIndex:uint=0,curFrameStopCount:int=0,state:String='wait';
public var enterFrameFunc:Function,exitFrameFunc:Function,addFrameScriptWhenFrameOver:Function;
protected function refreshCurFrame():void{} // bitmap rendering is outside this clock probe
'''
    code += '\n'.join(take(Path('base/BaseBitmapDataClip.as'), m) for m in methods)+'}}'
    if mutation == 'hold-decrement':
        assert '--this.curFrameStopCount;' in code
        code = code.replace('--this.curFrameStopCount;', 'this.curFrameStopCount -= 2;')
    if mutation == 'frame-count':
        before = 'uint(this.frameCount[this.curPoint.y] - 1)'
        assert before in code
        code = code.replace(before, 'uint(this.frameCount[this.curPoint.y])')
    put('Clock.as', code)
    parent = """package {public class Parent {
public var bbdc:Clock=new Clock(),curAction:String='wait',isGXP:Boolean=false;
public var fatherCount:int=-1,hmzfatherCount:int=-1,lysfatherCount:int=-1,istouming:Boolean=false,alpha:Number=1,isYourFather:Boolean=false,hmzFather:Boolean=false,lysFather:Boolean=false;
public var isFly:Boolean=false,curAddEffect:Object=null,curMagicWeapon:Object=null,cureHpQueue:Object=null;
public var _petInfo:Info=new Info(),sourceRole:Object={sid:1,getRoleId:function():int{return 1;}};
public var gc:Object={frameClips:30,sid:1,isSingleGame:function():Boolean{return true;},isInRoom:function():Boolean{return false;},getMutiUserBySidAndRoleId:function(...args):Object{return null;},sendSelfMutiUserInfo:function(...args):void{},sendPetDead:function(...args):void{},protectedPerproty:{setProperty:function(o:Object,k:String,v:*):void{o[k]=v;}}};
public function isBeAttacking():Boolean{return true;}public function setSpeed():void{}public function checkCanMove():void{}public function isCanMoveByStage():Boolean{return false;}public function move():void{}public function checkOver():void{}
public function showHpSlip():void{}public function drawPetHp():void{}public function addMonHurtMc(...args):void{}public function normalHit():void{throw new Error('Counter outside fixture');}
"""
    parent += take(Path('base/BaseObject.as'), 'setAction')
    parent += take(Path('base/BaseObject.as'), 'step')
    parent += take(Path('base/BaseObject.as'), 'setYourFather')
    parent += take(Path('base/BasePet.as'), 'reduceHp')
    if mutation == 'death-resume':
        assert 'this.bbdc.continueFrame();' in parent
        parent = parent.replace('this.bbdc.continueFrame();', '// resume omitted')
    if mutation == 'protection-expiry':
        assert 'if(this.fatherCount < 0)' in parent
        parent = parent.replace('if(this.fatherCount < 0)', 'if(this.fatherCount <= 0)')
    if mutation == 'repeat-reset':
        assert 'this.bbdc.setFramePointX(0);' in parent
        parent = parent.replace('this.bbdc.setFramePointX(0);', '// repeated hurt reset omitted')
    put('Parent.as', parent+'}}')
    put('Info.as', """package {public class Info {public var hp:Number=100,lifetime:int=5;
public function getHp():Number{return hp;}public function setHp(v:Number):void{hp=v;}
public function getlifetime():int{return lifetime;}public function setlifetime(v:int):void{lifetime=v;}
public function findHasStudySkill(k:String):Boolean{return false;}public function getPetHarmObj(k:String):Object{throw new Error('Skill outside fixture');}
}}""")
    cases = []
    for form in forms:
        name = 'Pet_'+form['id']
        source_path = Path(form['methods']['setAction']['path']).relative_to(SRC.relative_to(ROOT))
        method = take(source_path, 'setAction')
        if mutation == 'phoenix-guard' and form['id'].startswith('phoenix'):
            assert '&&' in method
            method = method.replace('&&', '||')
        endings = '\n'.join('case '+json.dumps(a['action'])+':'+a['endSource']+'\nbreak;' for a in form['actions'])
        code = 'package {import flash.geom.Point;public class '+name+''' extends Parent {
public var dead:Boolean=false,statics:int=0,aoyiStep:int=1,_aoyiStep:int=1,isAoyi:Boolean=true,isAtkUp:Boolean=false,cleanup:int=0;
public function setStatic():void{statics++;}
public function destroy():void{dead=true;}
public function doWhenAoyiOver():void{cleanup++;} // observe unrelated skill cleanup as a sink
public function '''+name+'''(counts:Array,holds:Array){bbdc.setFrameCount(counts);bbdc.setFrameStopCount(holds);bbdc.setAddScriptWhenFrameOver(over);}
'''+method.replace('public function setAction', 'override public function setAction')+'''
public function over(param1:int):void{switch(bbdc.getState()){'''+endings+'''
default:throw new Error('Out-of-scope frame-over');}}
}}'''
        if mutation == 'hurt-end':
            code = code.replace('this.setStatic();', '// omitted setStatic')
        put(name+'.as', code)
        # Explicit coordinate inputs include hypothetical transitions. This is
        # not a claim that every atlas coordinate is reachable in live play.
        for row, holds in enumerate(form['allFrameStopCounts']):
            for x in range(len(holds)):
                for action in ['hurt', 'dead']:
                    for fps in [20, 24, 30]:
                        cases.append(dict(id=f"{form['id']}:{row}:{x}:{action}:{fps}", form=form['id'],
                            row=row, x=x, action=action, fps=fps, prior='wait',
                            counts=form['allFrameCounts'], holds=form['allFrameStopCounts']))
        if form['id'].startswith('phoenix'):
            for action in ['hurt', 'dead']:
                for fps in [20, 24, 30]:
                    cases.append(dict(id=f"{form['id']}:hit2:{action}:{fps}", form=form['id'],
                        row=form['actions'][0]['row'], x=1, action=action, fps=fps, prior='hit2',
                        counts=form['allFrameCounts'], holds=form['allFrameStopCounts']))
    put('fixtures.json', json.dumps(cases))
    factories = '\n'.join('case "'+f['id']+'":return new Pet_'+f['id']+'(c.counts,c.holds);' for f in forms)
    put('Probe.as', (HERE/'Probe.as').read_text(encoding='utf-8').replace('/*FACTORIES*/', factories))
    put('sources.json', json.dumps(dict(records=records, adaptations=[
        'Original BBDC methods; refreshCurFrame is a no-op bitmap sink',
        'Original BaseObject.setAction/step/setYourFather, BasePet.reduceHp and complete per-form setAction',
        'Info is a scalar HP/lifetime sink, no qlfj; movement, UI and networking are bounded sinks',
        'Only original hurt/dead frame-over branches; other branches throw',
        'setStatic/destroy and Phoenix skill cleanup are observation sinks, not full owner cleanup']), indent=2))
    put('application.xml', '<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task254.clock</id><versionNumber>1</versionNumber><filename>probe254</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
    return len(cases)


def run(mutation=None):
    count = prepare(mutation)
    for phase, command in [('compile', ['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar',
        str(SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as']),
        ('run', [str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'),
        str(WORK/'application.xml'), str(WORK)])]:
        result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
        log = (result.stdout+result.stderr).decode(errors='replace')
        put(phase+'.log', log)
        if result.returncode:
            raise RuntimeError(log[-6000:])
    observations = json.loads((WORK/'observations.json').read_text(encoding='utf-8'))
    assert len(observations) == count
    assert len({value['id'] for value in observations}) == count
    assert 'COMPLETE' in log
    print(f'{count} native source-method clock observations captured; independent verification pending.')


if __name__ == '__main__':
    run()
