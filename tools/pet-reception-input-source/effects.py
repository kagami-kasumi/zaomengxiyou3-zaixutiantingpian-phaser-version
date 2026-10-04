"""Bounded Jifeng receiver-gate source execution; no pixel/complete-AI claim.

add/curDebuff/getBuffByName/destroy and rabbit release/gate are whole methods.
step retains the original iteration, first-step timestamp, expiration and count;
unrelated effect branches/glow are excluded. Visual callbacks are event sinks.
"""
import importlib.util
import json
import re
import subprocess
import capture

ROOT, HERE, SDK = capture.ROOT, capture.HERE, capture.SDK
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-252/effects'
spec = importlib.util.spec_from_file_location('source251', ROOT/'tools/monster3-reception-source/source.py')
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)


def cases():
    result = []
    for form in [2, 3, 4]:
        for owner in [1, 2]:
            for fps in [20, 24, 30]:
                for mode in ['normal', 'refresh-first', 'refresh-mid', 'pause', 'destroy', 'reenter', 'no-skill', 'low-mp', 'exact-mp']:
                    result.append(dict(id=len(result), form=form, owner=owner, fps=fps, mode=mode))
    return result


def prepare(mutation=None):
    capture.WORK = WORK
    capture.prepare()
    source.RECORDS.clear()
    take = source.take
    def put(name, text):
        (WORK/name).write_text(text, encoding='utf-8')
    put('application.xml', (WORK/'application.xml').read_text(encoding='utf-8').replace('regima.task252.attributes', 'regima.task252.effects'))
    config = (WORK/'config/Config.as').read_text(encoding='utf-8')
    config = config[:-2]+'''public var frameClips:int=30,sid:int=1,network:Array=[];
public var protectedPerproty:Object={removeProperty:function(o:*):void{}};
public function isSingleGame():Boolean{return true;}
public function sendPetAttack(...args):void{network.push(args);}
}}'''
    put('config/Config.as', config)
    effect = '''package {import config.Config;public class BaseAddEffect {
public var curEffectArray:Array=[],count:int=0,beAttackFatherCurCount:int=0,monster6008fire:int=0;
public var sourceRole:Object={},gc:Config=Config.instance,events:Array=[];
public function poison_times_bomb(...args):void{throw new Error('Unrelated poison');}
'''
    effect += '\n'.join(take('base/BaseAddEffect.as', n) for n in ['add', 'curDebuff', 'getBuffByName', 'destroy', 'isCannotContrlSkill'])
    step = take('base/BaseAddEffect.as', 'step')
    prefix = step[:step.index('                     if(_loc10_.name == BaseAddEffect.POISON)')]
    expiration = step[step.index('                  if(_loc10_.isForever != 1'):step.index('                  if(_loc10_.name == BaseAddEffect.MONSTER6008FIRE)', step.index('                  if(_loc10_.isForever != 1'))]
    expiration = re.sub(r'                     if\(_loc10_.name == BaseAddEffect.MAGIC_UMBRELLA_DEFEND2\)[\s\S]*?(?=                     this.remove)', '', expiration)
    effect += prefix+'this.showPetRabbitJiFeng();}\n'+expiration+'}}_loc9_++;}++this.count;}'
    source.RECORDS[-1]['fragment'] = 'Original loop, first timestamp, expiration and count; only Jifeng fixtures; unrelated dispatch/glow excluded, Jifeng show callback is an event sink.'
    remove = take('base/BaseAddEffect.as', 'remove')
    effect += remove[:remove.index('         if(param1.name')]+'this.hidePetRabbitJiFeng();}'
    source.RECORDS[-1]['fragment'] = 'Original array removal prefix; Jifeng hide event sink; other effect hooks excluded.'
    names = sorted(set(re.findall(r'BaseAddEffect\.(\w+)', effect)) | {'PET_RABBIT_JIFENG'})
    full = (source.SRC/'base/BaseAddEffect.as').read_text(encoding='utf-8')
    for name in names:
        declaration = re.search(r'public static (?:var|const) '+name+r':String\s*=\s*[^;]+;', full)
        assert declaration, name
        effect += declaration.group()
    hooks = sorted(set(re.findall(r'this\.(hide\w+|showPetRabbitJiFeng)\(', effect)))
    for name in hooks:
        effect += 'public function '+name+'():void{events.push("'+name+'");}'
    if mutation == 'late-expiry': effect = effect.replace('>= _loc10_.time', '> _loc10_.time')
    if mutation == 'early-expiry': effect = effect.replace('>= _loc10_.time', '>= _loc10_.time - 1')
    if mutation == 'refresh-clock': effect = effect.replace('_loc8_.startTime = this.count;', '_loc8_.startTime = 0;')
    if mutation == 'destroy-retains': effect = effect.replace('this.curEffectArray = [];', '')
    if mutation == 'first-step-gate': effect = effect.replace('_loc3_.name == param1', '_loc3_.name == param1 && !_loc3_.isFirst')
    if mutation == 'cooldown-gate':
        effect = effect.replace('var _loc2_:int = 0;\n         var _loc3_:* = null;\n         while(_loc2_ < this.curEffectArray.length)', 'if(param1 == PET_RABBIT_JIFENG) return Boolean(sourceRole && sourceRole.skillCD1[0] > 0);\n         var _loc2_:int = 0;\n         var _loc3_:* = null;\n         while(_loc2_ < this.curEffectArray.length)', 1)
    put('BaseAddEffect.as', effect+'}}')
    put('BaseHero.as', 'package {public dynamic class BaseHero {public function getPlayer():Object{return null;}}}')
    put('Role4.as', 'package {public dynamic class Role4 extends BaseHero {}}')
    for form in [2, 3, 4]:
        methods = '\n'.join(take('export/pet/PetRabbit'+str(form)+'.as', n) for n in ['beforeSkill1Start', 'releSkill1'])
        methods = methods.replace('override protected function', 'public function')
        methods += take('base/BasePet.as', 'countSkillCD').replace('private function', 'public function')
        if mutation == 'form-duration' and form > 2:
            methods = methods.replace('gc.frameClips * 10', 'gc.frameClips * 5')
        put('Rabbit'+str(form)+'.as', '''package {import config.Config;import petInfo.PetInfo;public class Rabbit'''+str(form)+''' {
public var gc:Config=Config.instance,_petInfo:PetInfo=new PetInfo(),effect:BaseAddEffect=new BaseAddEffect();
public var sourceRole:Object={sid:1,getRoleId:function():int{return 1;}},attacks:int=0,faces:int=0;
public var skillCD1:Array=[0,0],skillCD2:Array=[0,0],skillCD3:Array=[0,0],skillCD4:Array=[0,0];
public function newAttackId():void{attacks++;}
public function faceToTarget():void{faces++;}
public function getBBDC():Object{return {getDirect:function():int{return 1;}};}
public function addCurAddEffect(a:Array):void{effect.add(a);}
'''+methods+'}}')
    put('Probe.as', (HERE/'EffectProbe.as').read_text(encoding='utf-8'))
    put('fixtures.json', json.dumps(cases()))
    put('effect-sources.json', json.dumps(source.RECORDS, indent=2))


def run(mutation=None):
    prepare(mutation)
    for phase, command in [
        ('compile', ['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar', str(SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as']),
        ('run', [str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'), str(WORK/'application.xml'), str(WORK)])]:
        result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
        log = (result.stdout+result.stderr).decode(errors='replace')
        (WORK/(phase+'.log')).write_text(log, encoding='utf-8')
        if result.returncode: raise RuntimeError(log[-8000:])
    assert 'COMPLETE' in log, log
    print(log.strip())


if __name__ == '__main__':
    run()
