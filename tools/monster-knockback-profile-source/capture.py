"""237 original constructors + 230 shared methods. No modern implementation import."""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).parent
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-237/air'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-237'
spec = importlib.util.spec_from_file_location('source230', ROOT/'tools/monster-knockback-source/capture.py')
old = importlib.util.module_from_spec(spec)
spec.loader.exec_module(old)
IDS = [2,3,4,5,6,7,8,9,10,16,19,30]
CONTEXTS = [[1,1],[1,2],[1,3],[2,1],[2,2],[3,3],[8,1],[9,1]]


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def prepare(mutation):
    old.WORK = WORK
    old.OUT = OUT
    old.records.clear()
    old.prepare()  # Writes only the task-237 output tree, never task-230 or source corpus.
    base = old.take('base/BaseObject.as', 'BaseObject')
    body_path = WORK/'SourceBody.as'
    text = body_path.read_text(encoding='utf-8')
    # Default field expressions come from the original declarations, not a fixture table.
    original = (old.source.SRC/'base/BaseObject.as').read_text(encoding='utf-8')
    for field in ['horizenSpeed','horizenRunSpeed','graity']:
        value = re.search(r'\b'+field+r':Number = ([^;]+);', original)[1]
        text = re.sub(field+r':Number=[^;,]+', field+':Number='+value, text)
    text = text.replace("curAction:String='hurt'", "curAction:String='wait'")
    assignments = []
    for field in ['graity','speed','enforceSpeed']:
        assignments.append(re.search(r'this\.'+field+r' = [^;]+;', base)[0])
    # Original constructor calls virtual newColipse before BaseMonster's scale multiplier.
    extra = '''
public function SourceBody(){super();gc=Fixture.config;ASSIGNMENTS this.newColipse();}
protected function newColipse():void{}
public function profile():Object {var b:Rectangle=colipse.getBounds(this);return {
gravity:graity,horizontalSpeed:horizenSpeed,runSpeed:horizenRunSpeed,flying:isFly,
collider:{x:b.x,y:b.y,width:b.width,height:b.height},initialVx:speed.x,initialVy:speed.y};}
public function predicates():Object{return {attacking:isAttacking(),cannotMove:isCannotMoveWhenAttack(),beAttacking:isBeAttacking(),walkOrRun:isWalkOrRun()};}
'''.replace('ASSIGNMENTS','\n'.join(assignments))
    text = text[:-2] + extra + '}}'
    body_path.write_text(text, encoding='utf-8')
    p = WORK/'BaseMonster.as'
    text = p.read_text(encoding='utf-8')
    # Execute the complete original BaseMonster constructor. HP/visual/effect services
    # are explicit inert sinks; their bodies are outside this fixed-action experiment.
    ctor = old.take('base/BaseMonster.as','BaseMonster')
    extra = '''
public var _this:Object,normalAttackRate:Number,waitRateWhenNoTarget:Number,fallList:Array,
skillCD:Array,skillCD1:Array,skillCD2:Array,skillCD3:Array,skillCD4:Array,skillCD5:Array,
attackBackInfoDict:Object={},attackRange:Number,alertRange:Number,monsterName:String;
public function setHp(v:Number):void{} public function setSHp(v:Number):void{}
public function setFullHp(v:Number=0):void{} public function setLevel(v:Number):void{}
public function newHpSlip():void{}
'''
    text = text[:-2] + extra + ctor + old.take('base/BaseMonster.as','isWalkOrRun') + old.take('base/BaseMonster.as','checkOver') + '}}'
    if mutation == 'walk-predicate':
        text = text.replace('return this.curAction == "walk" || this.curAction == "run";', 'return true;')
    if mutation == 'base-scale':
        assert 'this.colipse.scaleX *= 2;' in text
        text = text.replace('this.colipse.scaleX *= 2;', 'this.colipse.scaleX *= 1;')
    p.write_text(text, encoding='utf-8')
    old.write('BaseAddEffect.as', '''package {public class BaseAddEffect {
public static const YUESEMENGLONG:String="moon";
public function BaseAddEffect(o:Object=null){} public function step():void{}
public function isAnyThingElseStun(v:String):Boolean{return false;}}}''')
    p = WORK/'AUtils.as'
    text = p.read_text().replace('public static var accept', 'public static var domain:Object;public static function getNewObj(n:String):Object{var c:Class=domain.getDefinition(n) as Class;return new c();}public static var accept')
    p.write_text(text)
    p = WORK/'BaseBullet.as'
    constant = re.search(r'public static var DESIDE_BY_FRAMES_LEFT:[^;]+;', (old.source.SRC/'base/BaseBullet.as').read_text(encoding='utf-8'))[0]
    p.write_text(p.read_text().replace('public var speed:', constant+'public var speed:'))
    old.write('Fixture.as', 'package {public class Fixture {public static var config:Object;}}')
    for ident in IDS:
        path = f'export/monster/Monster{ident}.as'
        methods = [old.take(path, f'Monster{ident}'), old.take(path, 'newColipse')]
        if ident == 16: methods.append(old.take(path,'isAttacking'))
        if ident == 30: methods.append(old.take(path,'isCannotMoveWhenAttack'))
        code = 'package {import flash.display.*;import flash.geom.*;public class Monster'+str(ident)+' extends BaseMonster {\n'+'\n'.join(methods)+'}}'
        if mutation == 'fly-gravity' and ident == 30:
            assert 'this.graity = 0;' in code
            code = code.replace('this.graity = 0;', 'this.graity = 1.5;')
        if mutation == 'fixed-speed': code = re.sub(r'this.horizenSpeed = [\d.]+;', 'this.horizenSpeed = 5;', code)
        if mutation == 'stage-branch' and ident in [9,10,19]: code = code.replace('gc.curStage == 9', 'false')
        if mutation == 'attack-predicate' and ident == 30: code = code.replace('this.curAction == "hit1"','false')
        if mutation == 'fourth-attack' and ident == 16: code = code.replace(' || this.curAction == "hit4"','')
        old.write(f'Monster{ident}.as', code)
    p = WORK/'Wall.as'
    text = p.read_text().replace('import flash.display.MovieClip;', 'import flash.display.MovieClip;import flash.display.DisplayObject;')
    text = text.replace('public var speedY:Number=0;', 'public var speedY:Number=0;public var fixtureBounds:Rectangle;override public function getBounds(target:DisplayObject):Rectangle{return fixtureBounds?fixtureBounds.clone():super.getBounds(target);}')
    p.write_text(text)
    properties=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-217/environment-properties.json').read_text(encoding='utf-8'))
    truth=json.loads((ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-217-pet-ground-environment.json').read_text(encoding='utf-8'))
    objects={r['id']:r for r in truth['displayObjects']}
    environments=[]
    for level in properties['levels']:
        flags={r['objectId']:r for r in level['walls']}
        walls=[]
        for ident in level['collisionOrder']:
            f=flags[ident];assert f['axisAligned'] and f['usesWallTolerance']
            walls.append(dict(id=ident,**objects[ident]['placements'][0]['stageBounds'],
                throughClass=f['isThroughWallClass'],markers=f['markers']))
        environments.append(dict(level=level['level'],walls=walls))
    probe = (HERE/'Probe.as').read_text(encoding='utf-8')
    probe = probe.replace('SOURCE_PATHS',json.dumps([str(ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'),str(WORK/'main-library.swf')]))
    probe = probe.replace('ENVIRONMENTS',json.dumps(environments))
    probe = probe.replace('PROFILE_CLASSES',','.join('Monster'+str(i) for i in IDS))
    probe = probe.replace('PROFILE_IDS',json.dumps(IDS)).replace('CONTEXTS',json.dumps(CONTEXTS))
    collision = json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json').read_text(encoding='utf-8'))
    probe = probe.replace('TARGET_BOUNDS',json.dumps({str(row['monsterId']): row['runtimeBounds'] for row in collision['monsterMappings']}))
    if mutation == 'force-endpoint':
        probe = probe.replace('Math.min((tick-1)/fps,.4),true,false', 'Math.min((tick-1)/fps,.4),true,true')
    old.write('Probe.as',probe)
    p=WORK/'application.xml';p.write_text(p.read_text().replace('regima.task230','regima.task237'))


def main():
    mutation = sys.argv[1] if len(sys.argv)>1 else None
    allowed = ['base-scale','fly-gravity','fixed-speed','stage-branch','attack-predicate','fourth-attack','walk-predicate','force-endpoint']
    assert mutation is None or mutation in allowed
    prepare(mutation)
    command = ['java','-Dflexlib='+str(old.source.SDK/'frameworks'),'-jar',str(old.source.SDK/'lib/mxmlc-cli.jar'),
        '+configname=air','-debug=true','-output=Probe.swf','Probe.as']
    compile_result = subprocess.run(command,cwd=WORK,capture_output=True,timeout=60)
    (WORK/'compile.log').write_bytes(compile_result.stdout+compile_result.stderr)
    assert compile_result.returncode == 0,(compile_result.stdout+compile_result.stderr).decode(errors='replace')
    run_command = [str(old.source.SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),
        '-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    result = subprocess.run(run_command,cwd=WORK,capture_output=True,timeout=120)
    (WORK/'stdout.log').write_bytes(result.stdout);(WORK/'stderr.log').write_bytes(result.stderr)
    assert result.returncode==0 and b'COMPLETE ' in result.stdout+result.stderr,(result.stdout+result.stderr).decode(errors='replace')[-5000:]
    report=json.loads((WORK/'rows.json').read_text(encoding='utf-8'))
    report.update(mutation=mutation,sources=[dict(path=p.relative_to(ROOT).as_posix(),sha256=sha(p)) for p in [
        ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf',
        ROOT/'local-resources/regima/source/restored-swfs/1_MainLoad__main1.swf']],
        methods=old.records,compileCommand=command,runCommand=run_command,exitCode=result.returncode,
        compiledSha256=sha(WORK/'Probe.swf'),generatedHashes={p.relative_to(WORK).as_posix():sha(p) for p in WORK.rglob('*.as')},
        substitutions=['BaseObject physics declarations/constructor assignments retained; unrelated UI/listeners/HP/AI services omitted',
            'BaseMonster and 12 derived constructors and newColipse execute original method bodies',
            'setAction writes fixed action only; no body callback, actual death or reward simulation',
            'BaseAddEffect/HP/level/UI constructor services are explicit inert sinks; stun fixture replaces effect service',
            'shared source movement and flying suffix inherited from 230; controlled static walls, no full scene claim',
            '217 environment replay injects exact verified stageBounds via Wall.getBounds and marker/class order; no new full-level source-SWF playback',
            'Tween sampled at deterministic seconds before source host steps; natural-clock overwrite evidence retained by 230'])
    dest=OUT/(f'mutation-{mutation}.json' if mutation else 'native.json')
    dest.write_text(json.dumps(report,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    print('237 source profiles:',len(report['profiles']),'trajectories:',len(report['motion']), 'mutation:',mutation)


if __name__=='__main__':main()
