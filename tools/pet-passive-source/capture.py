"""235: original methods in bundled AIR; explicit movement/visual/network sinks."""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('scheduler227', ROOT/'tools/monkey-horse-source/run.py')
old = importlib.util.module_from_spec(spec)
spec.loader.exec_module(old)
SRC, SDK = old.SRC, old.SDK
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-235'
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-235/air'


def prepare(mutation='baseline'):
    work = WORK/mutation
    old.WORK = work
    records = old.prepare()

    def take(path, name):
        p = SRC/path
        full = p.read_text(encoding='utf-8')
        code = old.method(full, name)
        records.append(dict(path=p.relative_to(ROOT).as_posix(), method=name,
                            startLine=full[:full.index(code)].count('\n')+1,
                            fileSha256=hashlib.sha256(p.read_bytes()).hexdigest(),
                            sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        return code

    def write(name, code):
        (work/name).write_text(code, encoding='utf-8')

    def edit(name, fn):
        p = work/name
        write(name, fn(p.read_text(encoding='utf-8')))

    pet = (work/'base/BasePet.as').read_text(encoding='utf-8')
    for name in ['checkBuffSkill', 'doPassive']:
        pet = pet.replace(old.method(pet, name), take('base/BasePet.as', name))
    extra = '\n'.join(take('base/BasePet.as', n) for n in ['cureHp', 'cureMp', 'isDead', 'getMagicAddValue', 'getCriteValue', 'destroy'])
    extra = extra.replace('override ', '').replace('protected function', 'public function').replace('Math.random()', 'gc.critRoll')
    fields = (SRC/'base/BasePet.as').read_text(encoding='utf-8')
    counts = '\n'.join(re.findall(r'protected var (?:sxkbCount|fsnlCount|smjcCount|mfjcCount|gjjcCount|fyjcCount|testCount):uint = \d+;', fields)).replace('protected', 'public')
    counts = counts.replace('public var', 'public var')
    pet = pet[:-2] + counts + extra + '''
public var bbdc:Object=null,isReadyToDestroy:Boolean=false;public function addCureMc(v:int):void{events.push('heal:'+v);}
public function ready():void{sxkbCount=fsnlCount=smjcCount=mfjcCount=gjjcCount=fyjcCount=0;}
public function counts():Array{return [sxkbCount,fsnlCount,smjcCount,mfjcCount,gjjcCount,fyjcCount];}
public function check():void{checkBuffSkill();}
}}
'''
    pet = pet.replace('curAddEffect:Object', 'curAddEffect:BaseAddEffect')
    if mutation == 'period': pet = pet.replace('this.tCount++ >=', '++this.tCount >=')
    if mutation == 'first-only': pet = pet.replace('this.sxkbCount = 4320;', 'this.sxkbCount = 4320;return;')
    if mutation == 'immediate': pet = pet.replace(':uint = 300;', ':uint = 0;')
    if mutation == 'refresh-first': pet = pet.replace('this.doPassive();', 'this._petInfo.upPassive();this.doPassive();')
    if mutation == 'stun': pet = pet.replace('if(this.curAddEffect.isAnyThingElseStun(""))', 'if(false)')
    if mutation == 'learned': pet = re.sub(r'Boolean\(this\._petInfo.findHasStudySkill\("\w+"\)\)', 'true', pet)
    if mutation == 'mp': pet = re.sub(r'this\._petInfo.getMp\(\) >= this\._petInfo.findPetUsedMagic\("\w+"\)', 'true', pet)
    write('base/BasePet.as', pet)
    edit('base/StepSink.as', lambda s:s.replace("events.push('base-step');", "events.push('base-step');if(BasePet(this).curAddEffect)BasePet(this).curAddEffect.step();"))
    edit('base/Config.as', lambda s:s.replace('public var sid:', 'public var protectedPerproty:Object={removeProperty:function(...a):void{}};public var critRoll:Number=0.2;public var sid:').replace('public function random()', 'public function isInRoom():Boolean{return false;} public function getMutiUserBySidAndRoleId(...a):Object{return null;} public function sendSelfMutiUserInfo(...a):void{} public function random()'))
    info = '''package base {public class Info {
public var hp:int=100,mp:int=1000,shp:int=1000,smp:int=1000,level:int=10,ehp:int=0,emp:int=0,form:int=1,technique:int=3,power:int=1,skills:Object={};
public function getHp():int{return hp;}public function setHp(v:int):void{hp=v;}
public function getMp():int{return mp;}public function setMp(v:int):void{mp=v;}
public function getSHp():uint{return shp;}public function getSMp():int{return smp;}
public function getLevel():int{return level;}public function getEHp():int{return ehp;}public function getEMp():int{return emp;}
public function setEHp(v:int):void{ehp=v;}public function setEMp(v:int):void{emp=v;}
public function getCurPetState():uint{return form;}public function gettechnique():int{return technique;}
public function getwarpower():int{return power;}public function getAtk():int{return 100;}public function getCrit():Number{return 0.1;}
public function findHasStudySkill(n:String):Boolean{return Boolean(skills[n]);}
'''
    info += '\n'.join(take('petInfo/PetInfo.as', n) for n in ['upPassive', 'getPetHarmObj', 'findPetUsedMagic']) + '}}'
    write('base/Info.as', info)
    # Execute original add/lookup. Other effects and equipment are unreachable stubs.
    effect = '''package base {public class BaseAddEffect {
public static var PET_SXKB:String='sxkb',PET_FSNL:String='fsnl',PET_SMJC:String='smjc',PET_MFJC:String='mfjc',PET_GJJC:String='gjjc',PET_FYJC:String='fyjc',POISON_TIMES:String='poison',MONSTER6008FIRE:String='fire',SPEEDUP:String='speed',ERLANGSHEN_HP_REJECT:String='reject',MONSTER120DEBUFF:String='debuff',MONSTER129Buff:String='129',MONSTER42_BLUE:String='blue';
public var curEffectArray:Array=[],count:int=0,sourceRole:Object={},gc:Config=Config.instance,monster6008fire:int=0,stun:Boolean=false;
public function isAnyThingElseStun(s:String):Boolean{return stun;}
public function isCannotContrlSkill(v:Object):Boolean{return false;}
public function poison_times_bomb(...a):void{}
'''
    effect += '\n'.join(take('base/BaseAddEffect.as', n) for n in ['add', 'getBuffByName', 'getBuffTimeLeftByName'])
    # Source step fragments: only six buffs; visual callbacks intentionally omitted.
    step = take('base/BaseAddEffect.as', 'step')
    prefix = step[:step.index('                     if(_loc10_.name == BaseAddEffect.POISON)')]
    expiration = step[step.index('                  if(_loc10_.isForever != 1'):step.index('                  if(_loc10_.name == BaseAddEffect.MONSTER6008FIRE)', step.index('                  if(_loc10_.isForever != 1'))]
    expiration = re.sub(r'                     if\(_loc10_.name == BaseAddEffect.MAGIC_UMBRELLA_DEFEND2\)[\s\S]*?(?=                     this.remove)', '', expiration)
    effect += prefix + '}\n' + expiration + '} } _loc9_++;} ++this.count;}'
    remove = take('base/BaseAddEffect.as', 'remove')
    effect += remove[:remove.index('         if(param1.name')] + '}'
    effect += 'public function destroy():void{curEffectArray=[];count=0;sourceRole=null;} }}'
    if mutation == 'refresh-value': effect = effect.replace('_loc8_.time = _loc7_.time;', '_loc8_.value = _loc7_.value;_loc8_.time = _loc7_.time;')
    if mutation == 'expiry': effect = effect.replace('>= _loc10_.time', '> _loc10_.time')
    write('base/BaseAddEffect.as', effect)
    write('base/BaseHero.as', 'package base {public dynamic class BaseHero {public function getPlayer():Object{return null;}}}')
    write('base/Role4.as', 'package base {public dynamic class Role4 extends BaseHero {}}')
    write('base/BaseBullet.as', 'package base {public class BaseBullet {public function destroy():void{}}}')
    write('base/TweenMax.as', 'package base {public class TweenMax {public static function to(...a):void{}}}')
    # Four hero stat consumers: extract each original case and its actual guard.
    props = '''package base {public class Props {
public var who:Object,gc:Config=Config.instance,buffArray:Array=[],dataObject:Object={hhp:333,mmp:77,shhp:1000,smmp:200,basePower:101,defense:39};
public function snapshot():Array{return [getHHP(),getMMP(),getSHHP(),getSMMP(),getBasePower(),getDefense()];}
'''
    for name, field in [('HHP','hp'),('MMP','mp'),('SHHP','shp'),('SMMP','smp'),('BasePower','atk'),('Defense','def')]:
        props += take('base/BaseRoleProperies.as', 'get'+name) + take('base/BaseRoleProperies.as', 'set'+name)
    for name in ['addBuff', 'removeBuff']:
        code = take('base/BaseRoleProperies.as', name).replace('private function', 'public function')
        begin = code[:code.index('               case HeroBuff.HPUPBUFF:')]
        body = code[code.index('               case BaseAddEffect.PET_SMJC:'):code.index('               case "role1_sx":')]
        a = body.index('               case BaseAddEffect.MAGIC_FLOWER_ADDBUFF:')
        b = body.index('               case BaseAddEffect.PET_FYJC:', a)
        body = body[:a] + body[b:]
        tail = code[code.rindex('            }'):]
        props += begin + body + tail
    pstep = take('base/BaseRoleProperies.as', 'step')
    segment = pstep[pstep.index('               _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.PET_SMJC)'):pstep.index('               _loc2_ = this.who.curAddEffect.getBuffByName(BaseAddEffect.MAGIC_FLOWER_ADDBUFF)')]
    props += 'public function step():void{var _loc2_:*;var _loc3_:int;'+segment+'} }}'
    write('base/Props.as', props)
    write('base/MutiUser.as', 'package base {public dynamic class MutiUser {}}')
    host = take('base/BaseHero.as', 'updatePet')
    if mutation == 'all-roster': host = host[:host.index('{')] + '{for each(var p:BasePet in roster)p.step();}'
    write('base/Host.as', 'package base {public class Host {public var myPet:BasePet,roster:Array=[];' + host + '}}')
    write('Probe.as', Path(__file__).with_name('Probe.as').read_text(encoding='utf-8'))
    return work, records


def run(mutation='baseline'):
    work, records = prepare(mutation)
    out = OUT/mutation
    out.mkdir(parents=True, exist_ok=True)
    command = ['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar', str(SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as']
    result = subprocess.run(command, cwd=work, capture_output=True, timeout=60)
    (out/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode == 0, (result.stdout+result.stderr).decode(errors='replace')
    runtime = [str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'), str(work/'application.xml'), str(work)]
    result = subprocess.run(runtime, cwd=work, capture_output=True, timeout=60)
    (out/'stdout.log').write_bytes(result.stdout)
    (out/'stderr.log').write_bytes(result.stderr)
    log = (result.stdout+result.stderr).decode(errors='replace')
    assert result.returncode == 0 and 'COMPLETE' in log, log
    cases = [json.loads(l[5:]) for l in log.splitlines() if l.startswith('CASE ')]
    report = dict(task='TASK-SETTINGS-235', mutation=mutation, sources=records, cases=cases,
                  compileCommand=command, runtimeCommand=runtime, runtime='bundled AIR 51.1.1.5',
                  generatedHashes={p.relative_to(work).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in work.rglob('*.as')},
                  boundary=__doc__)
    (out/'trace.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(mutation, len(cases), 'native cases')
    return report


if __name__ == '__main__':
    run(sys.argv[1] if len(sys.argv)>1 else 'baseline')
