"""Exact add/remove/display methods with a source-fragment monkey-fire step projection."""
import hashlib
import json
import re
import runpy
import shutil
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/fire-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    helper=runpy.run_path(str(ROOT/'tools/monkey-horse-source/run.py'))
    path=helper['SRC']/'base/BaseAddEffect.as'
    source=path.read_text(encoding='utf-8');records=[]
    def take(name):
        code=helper['method'](source,name)
        records.append(dict(method=name,startLine=source[:source.index(code)].count('\n')+1,sha256=hashlib.sha256(code.encode()).hexdigest()))
        return code
    names=['add','remove','destroy','cancelAllEffect','getBuffByName','isCannotContrlSkill','show_mpetmonkey_fire','hide_mpetmonkey_fire']
    methods={name:take(name) for name in names}
    step=take('step')
    # Keep source loop bookkeeping/first flag/expiry guard/fire damage verbatim.
    prefix=step[:step.index('if(_loc10_.name ==')]
    # The first branch chain starts after isFirst/startTime writes.
    show=step[step.index('else if(_loc10_.name == BaseAddEffect.PETMONKEY_FIRE)'):]
    show=show[:show.index('else if(_loc10_.name == BaseAddEffect.PET_SXKB)')].replace('else if','if',1)
    expiry_start=step.index('if(_loc10_.isForever != 1')
    expire=step[expiry_start:step.index('if(_loc10_.name == BaseAddEffect.MONSTER6008FIRE)',expiry_start)]
    # Preserve the exact expiry expression/removal; umbrella-only branch is excluded.
    expire=expire[:expire.index('if(_loc10_.name ==')]+ 'this.remove(_loc10_);\n}'
    damage=step[step.index('else if(_loc10_.name == BaseAddEffect.PETMONKEY_FIRE)',step.index('if(_loc10_.isForever != 1')):]
    damage=damage[:damage.index('else if(_loc10_.name == BaseAddEffect.Monster37FIX)')].replace('else if','if',1)
    projected=prefix+show+'}\n'+expire+damage+'}}_loc9_++;}++this.count;}'
    # add/remove inactive status branches must remain unable to perform hidden work.
    calls=set(re.findall(r'this\.(hide\w+)\(',methods['remove']+methods['destroy']))-{'hide_mpetmonkey_fire'}
    constants='\n'.join(re.findall(r'public static var \w+:String = [^;]+;',source))
    fields='public var sourceRole:*,curEffectArray:Array=[],count:int=0,beAttackFatherCurCount:int=0,monster6008fire:int=0,bjsdcs:int=0,gc:FireConfig;'
    body='\n'.join(methods.values())+projected+'\n'.join('private function '+n+'(...args):void{}' for n in calls)
    shutil.copyfile(WORK.parent/'cleanup-air/AUtils.as',WORK/'AUtils.as')
    (WORK/'BaseAddEffect.as').write_text('package {import flash.display.*;public class BaseAddEffect {'+constants+fields+
        'public function BaseAddEffect(s:*,c:FireConfig){sourceRole=s;gc=c;}private function poison_times_bomb(a:int,b:Role4):void{throw new Error("inactive poison branch");}'+body+'}}',encoding='utf-8')
    (WORK/'FireConfig.as').write_text('''package {public class FireConfig {public var frameClips:int;
public var protectedPerproty:Object={removeProperty:function(o:*):void{}};public function isSingleGame():Boolean{return true;}}}''')
    (WORK/'Target.as').write_text('''package {import flash.display.Sprite;public dynamic class Target extends Sprite {
public var damage:Array=[];public function reduceHp(n:Number,b:Boolean):void{damage.push(n);}public function getPlayer():Object{return null;}}}''')
    for name in ['BaseHero','Role4']:
        (WORK/(name+'.as')).write_text('package {public dynamic class '+name+' extends Target {}}')
    report=dict(status='prepared-not-promoted',source=path.relative_to(ROOT).as_posix(),sourceSha256=hashlib.sha256(path.read_bytes()).hexdigest(),methods=records,
                scope='Exact add/remove/cancelAllEffect/destroy and display methods. step explicitly projects only first-show, expiry, fire damage and count bookkeeping; other status branches excluded. Target damage is an observation sink. Death caller not executed; cancelAllEffect is invoked at the fixture death boundary.')
    (OUT/'fire-methods.json').write_text(json.dumps(report,indent=2)+'\n')


if __name__=='__main__':main()
