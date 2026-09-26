"""Original retained-dead host scheduling, with explicit child/body/passive sinks.

Four explicit calls per case. Does not establish the body's removal deadline,
child collision results, passive effect semantics, or a full scene lifecycle.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('source227', ROOT / 'tools/monkey-horse-source/run.py')
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SLICE-226/dead-step-air'
source.WORK = WORK
records = source.prepare()
probe = '''package {import flash.display.Sprite;import flash.desktop.NativeApplication;import base.*;
public class DeadStepProbe extends Sprite {public function DeadStepProbe(){
var classes:Array=[PetMonkey1,PetMonkey2,PetMonkey3,PetMonkey4,PetHorse1,PetHorse2,PetHorse3,PetHorse4];
var names:Array=['monkey1','monkey2','monkey3','monkey4','horse1','horse2','horse3','horse4'];
var gc:Config=Config.instance;var n:int=0;
for(var i:int=0;i<classes.length;i++)for each(var fps:int in [20,24,30])
for each(var phase:int in [0,fps-1,59998]){
gc.frameClips=fps;gc.sid=1;gc.single=true;gc.obbsiteArray=[];gc.rolls=[];gc.randomCalls=0;
var cls:Class=classes[i];var p:BasePet=new cls();p.curAction='dead';p.timeCount=phase;p.tCount=fps-1;
p.skillCD1=[3,24];p.skillCD2=[0,24];p.skillCD3=[-1,24];p.skillCD4=[24,24];
var calls:int=0;
p.magicBulletArray=[{isReadyToDestroy:false,step2:function():void{calls++;p.events.push('child-step');}}];
for(var tick:int=1;tick<=4;tick++){
p.events=[];p.step();
trace('CASE '+JSON.stringify({family:names[i],fps:fps,phase:phase,tick:tick,action:p.curAction,
 timeCount:p.timeCount,tCount:p.tCount,childCalls:calls,cd:[p.skillCD1[0],p.skillCD2[0],p.skillCD3[0],p.skillCD4[0]],
 events:p.events,randomCalls:gc.randomCalls}));n++;
}}
trace('COMPLETE '+n);NativeApplication.nativeApplication.exit();}}}'''
(WORK / 'DeadStepProbe.as').write_text(probe, encoding='utf-8')
(WORK / 'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task226.deadstep</id><versionNumber>1.0.0</versionNumber><filename>DeadStepProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>DeadStepProbe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
compile_command = ['java', '-Dflexlib=' + str(source.SDK / 'frameworks'), '-jar', str(source.SDK / 'lib/mxmlc-cli.jar'),
                   '+configname=air', '-debug=true', '-output=DeadStepProbe.swf', 'DeadStepProbe.as']
result = subprocess.run(compile_command, cwd=WORK, capture_output=True, timeout=60)
assert result.returncode == 0, (result.stdout + result.stderr).decode(errors='replace')
command = [str(source.SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'),
           '-profile', 'desktop', str(WORK / 'application.xml'), str(WORK)]
result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
output = (result.stdout + result.stderr).decode(errors='replace')
cases = [json.loads(line[5:]) for line in output.splitlines() if line.startswith('CASE ')]
assert result.returncode == 0 and len(cases) == 288 and 'COMPLETE 288' in output, output[-3000:]
for row in cases:
    assert row['action'] == 'dead' and row['childCalls'] == row['tick'] and row['randomCalls'] == 0
    assert row['timeCount'] == (row['phase'] + row['tick']) % 59999
    assert row['cd'] == [max(0, 3-row['tick']), 0, -1, 24-row['tick']]
    assert row['events'][0] == 'child-step' and row['events'][-1] == 'base-step'
    assert not any(event in row['events'] for event in ['normal', 'follow-owner', 'follow-target', 'skill1', 'skill2', 'skill3', 'skill4'])
report = dict(status='observed-retained-dead-scheduling', scope=__doc__, sources=records,
    substitutions=['227 explicit child/body/passive/effect sinks retained', 'dead action and initial counters controlled',
                   'child.step2 records invocation only; no child damage or lifetime claim'],
    compileCommand=compile_command, command=command, cases=cases,
    generatedHashes={p.relative_to(WORK).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in WORK.rglob('*.as')})
(ROOT / 'docs/tasks/evidence/TASK-SLICE-226/dead-step-native.json').write_text(json.dumps(report, separators=(',', ':')), encoding='utf-8')
print('288 original retained-dead host states: child calls and CD/timeCount continue, family AI stays suppressed. Body/removal/passive remain separate.')
