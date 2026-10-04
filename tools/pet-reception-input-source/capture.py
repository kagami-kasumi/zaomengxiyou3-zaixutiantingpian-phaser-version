"""252 native PetInfo probe. Corpus is read-only; outputs are local evidence.

Full PetInfo, Antiwear and binaryEncrypt bodies are compiled. Only the random
provider and visibility of the recalculation entry are adapted. Config/UI
services are bounded sinks; this is not a full gameplay or visual harness.
"""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SRC = ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-252/attributes'


def prepare(mutation=None):
    WORK.mkdir(parents=True, exist_ok=True)
    records = []

    def put(name, text):
        path = WORK/name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(text, encoding='utf-8')

    for name in ['petInfo/PetInfo.as', 'com/edgarcai/gamelogic/Antiwear.as',
                 'com/edgarcai/encrypt/binaryEncrypt.as', 'com/edgarcai/encrypt/IEncrypt.as']:
        path = SRC/name
        code = path.read_text(encoding='utf-8')
        changes = []
        if name == 'petInfo/PetInfo.as':
            code = code.replace('Math.random()', 'Config.random()')
            code = code.replace('private function reSetPetAttributeValue', 'public function reSetPetAttributeValue')
            changes = ['Math.random -> deterministic Config.random', 'reSetPetAttributeValue visibility only']
            mutations = {
                'growth-threshold': ('if(this.getLevel() >= 60)', 'if(this.getLevel() > 60)'),
                'miss-growth': ('this.setMiss(this.getMiss() + 0.01 * Math.floor(Config.random() * 2));', 'this.setMiss(this.getMiss());'),
                'mdef-draw': ('Math.floor(Config.random() * 1)', '0'),
                'mdef-cap': ('this.setMDef(0.36);', 'this.setMDef(0.48);'),
                'miss-cap': ('this.setMiss(0.48);', 'this.setMiss(0.36);'),
                'save-position': ('this.setMDef(_loc2_[10]);', 'this.setMDef(_loc2_[12]);'),
            }
            if mutation:
                before, after = mutations[mutation]
                assert before in code, (mutation, 'source mutation anchor missing')
                code = code.replace(before, after)
                changes.append('Source mutation: '+mutation)
        records.append(dict(path=path.relative_to(ROOT).as_posix(), sha256=hashlib.sha256(path.read_bytes()).hexdigest(), adaptations=changes))
        put(name, code)
    put('config/Config.as', '''package config {public class Config {
public static var instance:Config=new Config(),roll:Number=0,calls:Array=[],rolls:Array=[];
public static function getInstance():Config{return instance;}
public static function random():Number{var v:Number=rolls.length?Number(rolls.shift()):roll;calls.push(v);return v;}
public var isFirst:Boolean=false;
public function alert(...args):void{}
}}''')
    put('my/AllConsts.as', 'package my {public class AllConsts {public static const GAME_PET_MAXLEVEL:int=90;}}')
    put('my/AUtils.as', '''package my {public class AUtils {
public static function numberSub(...args):Number{throw new Error("Out-of-scope AUtils.numberSub");}
}}''')
    put('com/edgarcai/util/Utils.as', '''package com.edgarcai.util {public class Utils {
public static function equal(...args):Boolean{throw new Error("Out-of-scope non-scalar Antiwear equality");}
}}''')
    put('Probe.as', (HERE/'Probe.as').read_text(encoding='utf-8'))
    from fixtures import generate
    put('fixtures.json', json.dumps(generate()))
    put('application.xml', '<application xmlns="http://ns.adobe.com/air/application/51.0"><id>regima.task252.attributes</id><versionNumber>1</versionNumber><filename>probe252</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
    put('sources.json', json.dumps(records, indent=2))


def run(mutation=None):
    prepare(mutation)
    commands = [
        ['java', '-Dflexlib='+str(SDK/'frameworks'), '-jar', str(SDK/'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as'],
        [str(SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'), str(WORK/'application.xml'), str(WORK)],
    ]
    for phase, command in zip(['compile', 'run'], commands):
        result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
        log = (result.stdout+result.stderr).decode(errors='replace')
        (WORK/(phase+'.log')).write_text(log, encoding='utf-8')
        if result.returncode:
            raise RuntimeError(log[-9000:])
    assert 'COMPLETE' in log, log[-5000:]
    print(log.strip())


if __name__ == '__main__':
    run()
