"""Run the original eight getRealPower methods and PetInfo formula in AIR.

Only the external stat/buff/RNG providers are controlled. This is an arithmetic
oracle, not a claim about damage acceptance, callback order or buff lifetimes.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SLICE-226/damage-air'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK.mkdir(parents=True, exist_ok=True)
sources = []

def method(path, name):
    text = path.read_text(encoding='utf-8')
    start = text.index('function '+name+'(')
    brace = text.index('{', start)
    depth = 1
    end = brace+1
    while depth:
        depth += (text[end] == '{') - (text[end] == '}')
        end += 1
    sources.append(dict(path=str(path.relative_to(ROOT)).replace('\\', '/'),
                        sha256=hashlib.sha256(path.read_bytes()).hexdigest(), method=name))
    return 'public '+text[start:end]

harm = method(SOURCE/'petInfo/PetInfo.as', 'getPetHarmObj')
helper = '''package { public class DamagePetInfo {
 public var atk:Number=0;
 public function getAtk():Number{return atk;}
 public function getCurPetState():Number{return 0;}
 public function getwarpower():Number{return 0;}
 public function gettechnique():Number{return 0;}
 public function getSHp():Number{return 0;}
 HARM
}}'''.replace('HARM', harm)
(WORK/'DamagePetInfo.as').write_text(helper, encoding='utf-8')
fixtures = []
formulae = {}
for family in ['Monkey', 'Horse']:
    formulae[family.lower()] = {}
    for form in range(1, 5):
        name = f'Damage{family}{form}'
        real = method(SOURCE/f'export/pet/Pet{family}{form}.as', 'getRealPower')
        actor = '''package { public class NAME {
 public var _petInfo:DamagePetInfo=new DamagePetInfo();
 public var magic:Number=0, flower:Number=1;
 public var isGXP:Boolean=false, critical:Boolean=false;
 public var reads:int=0;
 public function getCriteValue(enabled:Boolean):Boolean{if(enabled){reads++;return critical;}return false;}
 public function getMagicAddValue():Number{return magic;}
 public function hurtBaseEffectRate():Number{return flower;}
 REAL
}}'''.replace('NAME', name).replace('REAL', real)
        (WORK/f'{name}.as').write_text(actor, encoding='utf-8')
        actions = re.findall(r'case "(hit[^"]+)":', real)
        configs = {}
        for action in actions:
            body = real.split(f'case "{action}":')[1].split('break;')[0]
            skill = re.search(r'getPetHarmObj\("([^"]+)"\)', body)
            expression = re.search(r'"hurt":([^,\n]+)', body)[1]
            multiplier = 0
            if skill:
                multiplier = float(re.search(r'case "'+skill[1]+r'":\s+_loc2_\.first = ([\d.]+) \* this.getAtk\(\);', harm)[1])
            configs[action] = dict(skill=skill[1] if skill else None,
                multiplier=multiplier, normal=action == 'hit1',
                magic='_loc5_' in expression, critical='_loc4_' in expression,
                gxp='_loc6_' in expression, flower='hurtBaseEffectRate' in expression,
                expression=expression)
        formulae[family.lower()][str(form)] = configs
        for action in actions:
            for atk in [0, 17, 123.75]:
                for magic in [0, 19.9, -1, 4294967297]:
                    for gxp in [False, True]:
                        for flower in [1, 1.37]:
                            for critical in [False, True]:
                                fixtures.append(dict(family=family.lower(), form=form, actor=name,
                                    action=action, atk=atk, magic=magic, gxp=gxp, flower=flower, critical=critical))
assert '_loc2_.first *= 1.05;' in harm
refs = ','.join(f'Damage{family}{form}' for family in ['Monkey', 'Horse'] for form in range(1, 5))
probe = '''package {
 import flash.display.Sprite; import flash.desktop.NativeApplication; import flash.utils.getDefinitionByName;
 public class DamageProbe extends Sprite {
  private var references:Array=[REFS];
  public function DamageProbe(){
   var fixtures:Array=FIXTURES;
   for each(var f:Object in fixtures){
    var cls:Class=getDefinitionByName(f.actor) as Class; var actor:Object=new cls();
    actor._petInfo.atk=f.atk; actor.magic=f.magic; actor.isGXP=f.gxp;
    actor.flower=f.flower; actor.critical=f.critical;
    var hurt:int=int(actor.getRealPower(f.action).hurt);
    var qixue:int=int(actor.getRealPower(f.action).qixue);
    var baseline:int=int(actor.getRealPower(f.action,false).hurt);
    f.result={hurt:hurt,attack:int(f.atk*2.8),critical:hurt/baseline>=1.6,reads:actor.reads,qixue:qixue};
    trace('CASE '+JSON.stringify(f));
   }
   trace('COMPLETE '+fixtures.length); NativeApplication.nativeApplication.exit();
  }
 }
}'''.replace('REFS', refs).replace('FIXTURES', json.dumps(fixtures, separators=(',', ':')))
(WORK/'DamageProbe.as').write_text(probe, encoding='utf-8')
(WORK/'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task226.damage</id><versionNumber>1.0.0</versionNumber><filename>DamageProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>DamageProbe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
compile = ['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar', str(SDK/'lib/mxmlc-cli.jar'),
           '+configname=air', '-debug=true', '-output=DamageProbe.swf', 'DamageProbe.as']
result = subprocess.run(compile, cwd=WORK, capture_output=True, timeout=60)
assert result.returncode == 0, (result.stdout+result.stderr).decode(errors='replace')
command = [str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'),
           '-profile', 'desktop', str(WORK/'application.xml'), str(WORK)]
result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
assert result.returncode == 0, result.stderr.decode(errors='replace')
output = (result.stdout+result.stderr).decode(errors='replace')
cases = [json.loads(line[5:]) for line in output.splitlines() if line.startswith('CASE ')]
assert len(cases) == len(fixtures) and f'COMPLETE {len(fixtures)}' in output
report = dict(status='measured', sources=sources, cases=cases, command=command, compileCommand=compile,
              probeSha256=hashlib.sha256((WORK/'DamageProbe.as').read_bytes()).hexdigest(),
              scope='Original getRealPower and PetInfo arithmetic with controlled stat/buff/critical inputs; not world acceptance or lifecycle.')
(WORK/'measurement.json').write_text(json.dumps(report, separators=(',', ':')), encoding='utf-8')
(ROOT/'src/assets/pet-monkey-horse-damage.json').write_text(
    json.dumps(dict(formulae=formulae, skillFactor=1.05, sources=sources), indent=2)+'\n', encoding='utf-8', newline='\n')
print(f'{len(cases)} original AS3 damage arithmetic cases captured.', flush=True)
