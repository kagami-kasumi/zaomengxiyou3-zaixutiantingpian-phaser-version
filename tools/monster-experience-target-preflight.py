"""238 bounded input diagnostic, not full AI truth or gameplay acceptance.

Runs unchanged extracted selection methods using the game's bundled AIR, then
compares real production selectors. Does not modify 231 evidence or source data.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('reward_capture', ROOT/'tools/monster-reward-source/capture.py')
capture = importlib.util.module_from_spec(spec)
spec.loader.exec_module(capture)
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SLICE-238/selection-preflight'
OUT = ROOT/'docs/tasks/evidence/TASK-SLICE-238'
# Deliberately limited counterexamples: not an exhaustive sorting contract.
CASES = [
    dict(id='same-width', p1=[400, 0], p2=[100, 0], range=1000, expected='p2'),
    dict(id='different-width', p1=[20, 0], p2=[100, 0], range=1000, expected='p2'),
    dict(id='reversed', p1=[100, 0], p2=[20, 0], range=1000, expected='p1'),
    dict(id='vertical-distance', p1=[100, 400], p2=[200, 0], range=1000, expected='p2'),
    dict(id='outside-alert', p1=[400, 0], p2=[100, 0], range=50, expected=None),
    dict(id='selected-outside-alert', p1=[20, 0], p2=[100, 0], range=50, expected=None),
]


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    sources = []

    def take(path, name):
        file = capture.SRC/path
        full = file.read_text(encoding='utf-8')
        code = capture.method(full, name)
        sources.append(dict(path=file.relative_to(ROOT).as_posix(), method=name,
                            line=full[:full.index(code)].count('\n')+1,
                            sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
        return code

    def write(name, content):
        (WORK/name).write_text(content, encoding='utf-8')

    write('AUtils.as', 'package {import flash.display.DisplayObject; public class AUtils {' +
          take('AUtils.as', 'GetDisBetweenTwoObj') + take('AUtils.as', 'GetNearestObj') + '}}')
    write('BaseObject.as', 'package {import flash.display.Sprite; public class BaseObject extends Sprite {public var id:String;}}')
    write('Config.as', 'package {public class Config {public var candidates:Array; public function getPlayerArray():Array{return candidates;}}}')
    write('BaseMonster.as', 'package {public class BaseMonster extends BaseObject {public var gc:Config=new Config(),alertRange:Number,curAttackTarget:BaseObject;' +
          take('base/BaseMonster.as', 'selectTarget') + 'public function choose():void{selectTarget();}}}')
    write('Probe.as', '''package {import flash.display.Sprite;import flash.desktop.NativeApplication;import flash.system.Capabilities;
public class Probe extends Sprite {public function Probe(){trace('ENV '+Capabilities.version);
for each(var c:Object in JSON.parse('CASES')){var m:BaseMonster=new BaseMonster(),a:BaseObject=new BaseObject(),b:BaseObject=new BaseObject();
a.id='p1';b.id='p2';a.x=c.p1[0];a.y=c.p1[1];b.x=c.p2[0];b.y=c.p2[1];m.gc.candidates=[a,b];m.alertRange=c.range;m.choose();
trace('CASE '+JSON.stringify({id:c.id,target:m.curAttackTarget?m.curAttackTarget.id:null}));}
trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}}}'''.replace('CASES', json.dumps(CASES)))
    write('application.xml', '<?xml version="1.0"?><application xmlns="http://ns.adobe.com/air/application/51.0"><id>monster.selection.preflight</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><initialWindow><content>Probe.swf</content><visible>false</visible><width>100</width><height>100</height></initialWindow></application>')
    commands = [
        [str(capture.SDK/'bin/mxmlc.bat'), '+configname=air', '-debug=true', '-source-path='+str(WORK), '-output='+str(WORK/'Probe.swf'), str(WORK/'Probe.as')],
        [str(capture.SDK/'bin/adl.exe'), '-runtime', str(ROOT/'local-resources/regima/source/unpacked'), str(WORK/'application.xml'), str(WORK)],
    ]
    for label, cmd in zip(['compile', 'native'], commands):
        result = subprocess.run(cmd, capture_output=True, timeout=60)
        log = (result.stdout+result.stderr).decode(errors='replace')
        (OUT/(label+'-selection.log')).write_text(log, encoding='utf-8')
        assert result.returncode == 0, log
    assert 'COMPLETE' in log and '51,1,1,5' in log
    native = [json.loads(line[5:]) for line in log.splitlines() if line.startswith('CASE ')]
    assert native == [dict(id=c['id'], target=c['expected']) for c in CASES], native
    script = '''import {createMonster30,updateMonster30} from './src/systems/Monster30System.ts';
import {createStage1CombatEnemy,updateStage1Enemy} from './src/systems/Stage1CombatSystem.ts';
const cases=CASES;
console.log(JSON.stringify(cases.map(c=>{const targets=[{slot:'p1',x:c.p1[0],y:c.p1[1],alive:true},{slot:'p2',x:c.p2[0],y:c.p2[1],alive:true}];
const m=createMonster30(0,0);updateMonster30(m,targets,0,()=>1);
const enemy=createStage1CombatEnemy({id:c.id,enemyType:30,x:0,y:0});
// The actual production selector reads x; observe the chosen candidate via getters.
let last:string|undefined;const watched=targets.map(t=>({...t,get x(){last=t.slot;return t.x;}}));
updateStage1Enemy({enemy,targets:watched,deltaMs:0});
return {id:c.id,monster30:m.targetSlot??null,stage1:last??null};})));'''.replace('CASES', json.dumps(CASES))
    script = script.replace('./src/', ROOT.as_uri()+'/src/')
    write('modern.ts', script)
    result = subprocess.run([shutil.which('npx.cmd') or 'npx', '--no-install', 'tsx', str(WORK/'modern.ts')], cwd=ROOT, capture_output=True, timeout=60)
    assert result.returncode == 0, result.stderr.decode(errors='replace')
    modern = json.loads(result.stdout.decode().strip())
    rows = [dict(**c, native=n['target'], modern=m) for c, n, m in zip(CASES, native, modern)]
    assert rows[1]['modern']['monster30'] == 'p1'
    assert rows[1]['modern']['stage1'] == 'p1'
    assert rows[3]['modern']['stage1'] == 'p1'
    report = dict(status='input-gap-confirmed', cases=rows, sources=sources, commands=commands,
                  runtime='AIR 51.1.1.5 (game bundled)',
                  probeSha256=hashlib.sha256((WORK/'Probe.as').read_bytes()).hexdigest(),
                  swfSha256=hashlib.sha256((WORK/'Probe.swf').read_bytes()).hexdigest(),
                  boundary='Two injected live candidates in P1/P2 order; no real Config/constructor/scene coordinates, tie contract, whole-game execution or modern XP acceptance. Stage1 observed through target x getter; Monster30 retains its fixed 1000 range.')
    (OUT/'selection-preflight.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(dict(status=report['status'], cases=rows), ensure_ascii=False))


if __name__ == '__main__':
    main()

