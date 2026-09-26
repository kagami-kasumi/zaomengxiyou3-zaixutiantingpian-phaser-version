"""227 bounded original AS3 scheduler/gate probe. No production TS imports.

Animation, movement, skill execution and effects are explicit observation sinks;
this proves source branch selection, not complete game/visual/collision behavior.
"""
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-227/air'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-227'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def method(text, name):
    match = re.search(r'(?:override )?(?:public|protected|private) function ' + name + r'\(', text)
    if not match:
        raise ValueError(name)
    start = match.start()
    brace = text.index('{', match.end())
    depth, end = 1, brace + 1
    while depth:
        depth += (text[end] == '{') - (text[end] == '}')
        end += 1
    return text[start:end]


def mutate(path, name, value, mutation):
    if mutation == 'learned' and name.startswith('beforeSkill'):
        return re.sub(r'Boolean\(this\._petInfo\.findHasStudySkill\("[^"]+"\)\)', 'true', value)
    if mutation == 'mp' and name.startswith('beforeSkill'):
        return re.sub(r'this\._petInfo\.getMp\(\) >= this\._petInfo\.findPetUsedMagic\("[^"]+"\)', 'true', value)
    if mutation == 'lyq-distance' and name == 'beforeSkill1Start':
        return value.replace('<= 400', '<= 401')
    if mutation == 'hurt' and name == 'isBeAttacking':
        return value[:value.index('{')] + '{return false;}'
    if path == 'base/BasePet.as' and name == 'myIntelligence':
        if mutation == 'phase':
            return value.replace('% gc.frameClips == 0', '% gc.frameClips == 1')
        if mutation == 'stun':
            return value.replace('if(this.curAddEffect.isAnyThingElseStun(""))', 'if(false)')
        if mutation == 'random-boundary':
            return value.replace('Math.random() < 0.3', 'Math.random() <= 0.3')
    if mutation == 'cd-order' and path == 'base/BasePet.as' and name == 'step':
        return value.replace('this.myIntelligence();', 'this.countSkillCD();this.myIntelligence();').replace('this._petInfo.upPassive();\n         this.countSkillCD();', 'this._petInfo.upPassive();')
    if mutation == 'wrap' and name == 'step':
        return value.replace('>= 59999', '>= 60000')
    if mutation == 'collision' and name == 'beMagicAttack':
        return value.replace('&& Boolean(hited)', '&& true')
    return value


def prepare(mutation=None):
    records = []
    def take(path, name):
        file = SRC / path
        full = file.read_text(encoding='utf-8')
        result = method(full, name)
        records.append(dict(path=str(file.relative_to(ROOT)).replace('\\', '/'), method=name,
                            startLine=full[:full.index(result)].count('\n') + 1,
                            fileSha256=hashlib.sha256(file.read_bytes()).hexdigest(),
                            sliceSha256=hashlib.sha256(result.encode()).hexdigest()))
        changed = mutate(path, name, result, mutation)
        records[-1]['mutationApplied'] = changed != result
        return changed
    def write(path, text):
        file = WORK / path
        file.parent.mkdir(parents=True, exist_ok=True)
        file.write_text(text, encoding='utf-8')

    base_functions = [take('base/BasePet.as', name) for name in
                      ['step', 'countSkillCD', 'myIntelligence', 'searchTarget']]
    base_functions += [take('base/BaseObject.as', name) for name in ['isAttacking', 'isBeAttacking']]
    # Sole instrumentation edit: deterministic random stream, counts preserved.
    base_functions = [value.replace('Math.random()', 'gc.random()') for value in base_functions]
    constructor = take('base/BasePet.as', 'BasePet')
    initial = '\n'.join(re.findall(r'this\.(?:attackRate|skillCD[1-4]) = [^;]+;', constructor))
    write('base/StepSink.as', '''package base {import flash.display.Sprite;
public class StepSink extends Sprite {public var events:Array=[];public function step():void{events.push('base-step');}}}''')
    write('base/BasePet.as', '''package base {public class BasePet extends StepSink {
public var gc:Config=Config.instance,_petInfo:Info=new Info(),sourceRole:Object={x:0,y:0,sid:1,getRoleId:function():int{return 1;}};
public var curAttackTarget:Object,curAddEffect:Object,isGXP:Boolean=false,magicBulletArray:Array=[],timeCount:uint=0,tCount:uint=0;
public var attackRange:Number=150,searchRange:Number=1200,attackRate:Number=.7;
public var skillCD1:Array,skillCD2:Array,skillCD3:Array,skillCD4:Array;
public var skill1Release:Boolean=false,skill2Release:Boolean=false,skill3Release:Boolean=false,curAction:String='wait';
public function BasePet(){INITIAL}
protected function beforeSkill1Start():Boolean{return false;}protected function beforeSkill2Start():Boolean{return false;}
protected function beforeSkill3Start():Boolean{return false;}protected function beforeSkill4Start():Boolean{return false;}
protected function releSkill1():void{events.push('skill1');}protected function releSkill2():void{events.push('skill2');}
protected function releSkill3():void{events.push('skill3');}protected function releSkill4():void{events.push('skill4');}
protected function normalHit():void{events.push('normal');}protected function followSource():void{events.push('follow-owner');}
protected function followTarget():void{events.push('follow-target');}protected function setStatic():void{events.push('static');}
protected function checkBuffSkill():void{events.push('buff');}protected function jump():void{events.push('jump');}
protected function getFallDown():void{events.push('fall');}protected function doPassive():void{events.push('passive');}
protected function clearWaitFromParentArray(a:Array,b:Array):void{events.push('bullet-clean');}
public function gate(n:int):Boolean{switch(n){case 1:return beforeSkill1Start();case 2:return beforeSkill2Start();case 3:return beforeSkill3Start();case 4:return beforeSkill4Start();}return false;}
public function ai():void{myIntelligence();}
'''.replace('INITIAL', initial) + '\n'.join(base_functions) + '}}')
    for family in ['Monkey', 'Horse']:
        for form in range(1, 5):
            path = f'export/pet/Pet{family}{form}.as'
            full = (SRC / path).read_text(encoding='utf-8')
            names = re.findall(r'function (beforeSkill[1-4]Start|myIntelligence|isAttacking)\(', full)
            functions = [take(path, name) for name in names]
            write(f'Pet{family}{form}.as', f'package {{import base.*;public class Pet{family}{form} extends BasePet {{' +
                  '\n'.join(functions) + '}}')
    cost = take('petInfo/PetInfo.as', 'findPetUsedMagic')
    write('base/Info.as', '''package base {public class Info {public var mp:Number=1000,skills:Object={};
public function getMp():Number{return mp;}public function findHasStudySkill(s:String):Boolean{return Boolean(skills[s]);}
public function upPassive():void{}''' + cost + '}}')
    monster = take('base/BaseMonster.as', 'beMagicAttack')
    start = monster.index('if(gc.protectedPerproty.getProperty')
    end = monster.index('{', monster.index('if(param3 ||'))
    # Exact original acceptance prefix; damage settlement after this condition is
    # outside this probe. HitTest/intersection are controlled Boolean inputs.
    write('CollisionGate.as', '''package {import base.*;public class CollisionGate {
public var gc:Object={protectedPerproty:{getProperty:function(...args):Boolean{return false;}}};public var colipse:Object={};
public function accepts(param1:Object,param3:Boolean=false):Boolean{var hited:Boolean=false;
''' + monster[start:end] + '{return true;}return false;}}}')
    write('base/HitTest.as', '''package base {public class HitTest {public static function complexHitTestObject(a:Object,b:Object):Boolean{return b.hit;}}}''')
    write('base/Config.as', '''package base {public class Config {public static var instance:Config=new Config();
public var sid:int=1,frameClips:int=24,single:Boolean=true,obbsiteArray:Array=[],rolls:Array=[0],randomCalls:int=0;
public function random():Number{randomCalls++;if(!rolls.length)throw new Error('RNG exhausted');return rolls.shift();}
public function isSingleGame():Boolean{return single;}public function isInRoomOrSingleGame():Boolean{return true;}
public function sendPetAction(...args):void{}}}''')
    write('base/AUtils.as', '''package base {public class AUtils {
public static function GetDisBetweenTwoObj(a:Object,b:Object):Number{return Math.sqrt((a.x-b.x)*(a.x-b.x)+(a.y-b.y)*(a.y-b.y));}
public static function testIntersects(a:Object,b:Object,c:Object):Boolean{return b.intersects;}
public static function shallowEffect(a:Object):void{}}}''')
    write('Probe.as', Path(__file__).with_name('Probe.as').read_text(encoding='utf-8'))
    write('application.xml', '<application xmlns="http://ns.adobe.com/air/application/51.0"><id>pet227.source.probe</id><versionNumber>1.0</versionNumber><filename>Probe</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
    return records


def run(mutation=None):
    global WORK, OUT
    if mutation:
        WORK = WORK / 'mutations' / mutation
        OUT = OUT / 'mutations' / mutation
    sources = prepare(mutation)
    if mutation and not any(source['mutationApplied'] for source in sources):
        raise RuntimeError('Mutation did not alter a source method: '+mutation)
    OUT.mkdir(parents=True, exist_ok=True)
    compile_command = [str(SDK/'bin/mxmlc.bat'), '+configname=air', '-debug=true',
                       '-source-path='+str(WORK), '-output='+str(WORK/'Probe.swf'), str(WORK/'Probe.as')]
    compile_result = subprocess.run(compile_command, capture_output=True, timeout=60)
    (OUT/'compile.log').write_bytes(compile_result.stdout + compile_result.stderr)
    if compile_result.returncode:
        raise RuntimeError((compile_result.stdout + compile_result.stderr).decode(errors='replace'))
    command = [str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'),
               str(WORK/'application.xml'), str(WORK)]
    result = subprocess.run(command, capture_output=True, timeout=60)
    (OUT/'stdout.log').write_bytes(result.stdout)
    (OUT/'stderr.log').write_bytes(result.stderr)
    log = (result.stdout + result.stderr).decode(errors='replace')
    if result.returncode or 'COMPLETE' not in log:
        raise RuntimeError(str(result.returncode) + ': ' + log)
    cases = [json.loads(line[5:]) for line in log.splitlines() if line.startswith('CASE ')]
    report = dict(status='source-observation-only', mutation=mutation, runtime=next(line[4:] for line in log.splitlines() if line.startswith('ENV ')),
                  compileCommand=compile_command, runCommand=command, sources=sources, cases=cases,
                  scope='Original gate/AI/step methods with controlled effect, animation, movement and action sinks; not full game execution')
    (OUT/'source-trace.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print('227 original AS3 cases:', len(cases))


if __name__ == '__main__':
    import sys
    run(sys.argv[1] if len(sys.argv) > 1 else None)
