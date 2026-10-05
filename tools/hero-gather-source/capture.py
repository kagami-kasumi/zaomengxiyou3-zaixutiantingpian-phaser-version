"""261: reuse 257B's original shared methods in an isolated task directory.

Only relevant constructor statements are sliced. Full Role constructors, art,
equipment, keyboard and skill state machines are NOT claimed to execute here.
"""
import sys
sys.dont_write_bytecode = True
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OLD = ROOT / 'tools/monster2-gather'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-261'
sys.path.insert(0, str(OLD))
import ordering


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_once(text, old, new):
    assert text.count(old) == 1, (old, text.count(old))
    return text.replace(old, new)


def prepare(mutation=None):
    # Do not edit or regenerate the authoritative 257B outputs. Its generator
    # has a fixed path; redirect that literal in this in-memory invocation only.
    namespace = {'__file__': str(OLD / 'shared.py'), '__name__': 'task261_shared'}
    source = (OLD / 'shared.py').read_text(encoding='utf-8')
    exec(compile(source.replace('TASK-SETTINGS-257B', 'TASK-SETTINGS-261'), str(OLD / 'shared.py'), 'exec'), namespace)
    base = namespace['base']
    base.OUT = OUT
    work, records = namespace['prepare']()
    # Normal/repeat may share compiled source. Mutants keep a separate directory
    # so their generated AS3, SWF and logs cannot replace the normal evidence.
    if mutation:
        import shutil
        target = work.parent / ('mutation-' + mutation)
        target.mkdir(parents=True, exist_ok=True)
        shutil.copytree(work, target, dirs_exist_ok=True)
        work = target

    base_source = (base.SRC / 'base/BaseObject.as').read_text(encoding='utf-8')
    declarations = []
    for name in ('horizenSpeed', 'horizenRunSpeed', 'graity', 'jumpPower'):
        match = re.search(r'protected var ' + name + r':Number = [\d.\-]+;', base_source)
        assert match
        declarations.append(match.group().replace('protected', 'public'))
    base.method('base/BaseObject.as', 'BaseObject', records)
    base.method('base/BaseHero.as', 'BaseHero', records)
    initial_speed = re.search(r'this.speed = new Point\(0,4\);', base_source).group()
    cases = []
    for role in range(1, 6):
        ctor = base.method(f'export/hero/Role{role}.as', f'Role{role}', records)
        collider = base.method(f'export/hero/Role{role}.as', 'newColipse', records)
        assert 'ObjectBaseSprite' in collider
        if role < 5:
            assignments = re.findall(r'this.horizen(?:Run)?Speed = [\d.]+;', ctor)
            assert assignments == ['this.horizenSpeed = 6;']
            cases.append(f'case {role}:' + ''.join(assignments) + 'break;')
        else:
            start = ctor.index('if(this.isSword == false)')
            end = ctor.index('this.attackBackInfoDict', start)
            cases.append('case 5:' + ctor[start:end] + 'break;')
    hero = (work / 'HeroBase.as').read_text(encoding='utf-8')
    hero = hero.replace('public var graity:Number=0,horizenSpeed:Number=5,horizenRunSpeed:Number=10;', '\n'.join(declarations))
    hero = replace_once(hero, 'public function isRunning():Boolean{return false;}', 'public var runInput:Boolean=false; public function isRunning():Boolean{return runInput;}')
    (work / 'HeroBase.as').write_text(hero, encoding='utf-8')
    hero = (work / 'BaseHero.as').read_text(encoding='utf-8')
    collider = base.method('export/hero/Role1.as', 'newColipse', records).replace('override protected function newColipse', 'public function constructCollider')
    hero = hero.replace('public var sid:String=', '''public var isSword:Boolean=true;
public function initializeMotionProfile(role:int,sword:Boolean):void {isSword=sword;''' + initial_speed + '''
switch(role){''' + ''.join(cases) + '''}constructCollider();this.colipse.scaleX = 1.2;}
''' + collider + '\npublic var sid:String=', 1)
    (work / 'BaseHero.as').write_text(hero, encoding='utf-8')
    a = (work / 'AUtils.as').read_text(encoding='utf-8')
    a = a.replace('public static function getNewObj(s:String):Object{return new MovieClip();}',
                  'public static var shapeClass:Class;public static function getNewObj(s:String):Object{return s=="ObjectBaseSprite"?new shapeClass():new MovieClip();}')
    (work / 'AUtils.as').write_text(a, encoding='utf-8')
    probe = (OLD / 'SharedProbe.as').read_text(encoding='utf-8')
    probe = probe.replace('private var fps:int,owner:int,mode:String', 'private var profile:int,profiles:Array=[],fps:int,owner:int,mode:String')
    probe = probe.replace("for each(var f:int in [20,24,30])", "AUtils.shapeClass=shapeClass;for(profile=1;profile<=6;profile++)for each(var f:int in [20,24,30])", 1)
    probe = probe.replace("'still','move','gravity'", "'still','move','run','gravity'", 1)
    probe = probe.replace("for each(f in [20,24,30])for each(o in [1,2,3])queue.push({fps:f,owner:o});", "for(profile=1;profile<=6;profile++)for each(f in [20,24,30])for each(o in [1,2,3])queue.push({fps:f,owner:o,profile:profile});")
    probe = probe.replace('var item:Object=queue.shift();setup(item.fps,item.owner,', 'var item:Object=queue.shift();profile=item.profile;setup(item.fps,item.owner,')
    old = 'h.colipse=new shapeClass();h.colipse.scaleX=1.2;h.addChild(h.colipse);h[\'hp\']=100;'
    new = '''h.initializeMotionProfile(profile>5?5:profile,profile!=6);h['hp']=100;
  if(tick==0)profiles.push({profile:profile,walk:h.horizenSpeed,run:h.horizenRunSpeed,gravity:h.graity,jump:h.jumpPower,initialVy:h.speed.y,bounds:h.colipse.getBounds(h),scaleX:h.colipse.scaleX});
  h.speed.x=0;h.speed.y=0;h.runInput=m=='run';'''
    probe = replace_once(probe, old, new)
    probe = replace_once(probe, "h.roleProperies=stats(h);h.horizenSpeed=5;h.graity=m=='gravity'?1.5:0;", "h.roleProperies=stats(h);if(m!='gravity')h.graity=0;")
    probe = replace_once(probe, "m=='move'||m=='native'", "m=='move'||m=='run'||m=='native'")
    probe = probe.replace('rows.push({native:nativeMode', 'rows.push({profile:profile,native:nativeMode')
    probe = probe.replace("trace('RUNTIME '+Capabilities.version)", "trace('PROFILES '+JSON.stringify(profiles));trace('RUNTIME '+Capabilities.version)")
    if '--controlled' in sys.argv:
        probe = probe.replace("trace('CONTROLLED_COMPLETE');", "for each(var result:Object in rows)trace('ROW '+JSON.stringify(result));trace('PROFILES '+JSON.stringify(profiles));trace('RUNTIME '+Capabilities.version);trace('COMPLETE');NativeApplication.nativeApplication.exit();return;")
    (work / 'Probe.as').write_text(probe, encoding='utf-8')
    mutations = {
        'speed-unit': ('BaseHero.as', 'this.horizenSpeed = 6;', 'this.horizenSpeed = 12;'),
        'gravity-first': ('BaseHero.as', 'this.y += Number(_loc5_ * _loc6_);', 'this.y += Number((_loc5_ + graity) * _loc6_);'),
        'round-instead-twip': ('BaseHero.as', 'this.x += Number(_loc4_ * _loc6_ * _loc7_);', 'this.x = Math.round(this.x + Number(_loc4_ * _loc6_ * _loc7_));'),
        'root-offset': ('BaseHero.as', 'this.colipse.visible = false;', 'this.colipse.visible = false;this.colipse.y=10;'),
        'wall-snap': ('HeroBase.as', 'Number(_loc2_.y) - 0.1 - this.colipse.height / 2', 'Number(_loc2_.y) + 5 - this.colipse.height / 2'),
        'screen-clamp': ('BaseHero.as', 'this.x = _loc2_.x;', 'this.x = 10;'),
        'world-before-tween': ('Probe.as', 'if(tick)lite.rootTimeline.renderTime(tick/fps,false,false);events();if(!gc.isStopGame&&main.root)main.manual();', 'events();if(!gc.isStopGame&&main.root)main.manual();if(tick)lite.rootTimeline.renderTime(tick/fps,false,false);'),
    }
    if mutation:
        file, old, new = mutations[mutation]
        p = work / file
        s = p.read_text(encoding='utf-8'); assert old in s
        p.write_text(s.replace(old, new), encoding='utf-8')
    return work, records, base


def main():
    mutation = next((arg for arg in sys.argv[1:] if not arg.startswith('--')), None)
    suffix = '-' + mutation if mutation else '-repeat' if '--repeat' in sys.argv else ''
    work, records, base = prepare(mutation)
    commands = [
        ['java', '-Dflexlib=' + str(base.SDK / 'frameworks'), '-jar', str(base.SDK / 'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as'],
        [str(base.SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'), str(work / 'application.xml'), str(work)],
    ]
    for label, command in zip(['compile', 'run'], commands):
        r = subprocess.run(command, cwd=work, capture_output=True, timeout=400)
        log = (r.stdout + r.stderr).decode(errors='replace')
        (work / (label + suffix + '.log')).write_text(log, encoding='utf-8')
        assert r.returncode == 0, log[-5000:]
    assert 'COMPLETE' in log and '51,1,1,5' in log
    rows = [json.loads(line[4:]) for line in log.splitlines() if line.startswith('ROW ')]
    profiles = [json.loads(line[9:]) for line in log.splitlines() if line.startswith('PROFILES ')][0]
    OUT.mkdir(parents=True, exist_ok=True)
    report = dict(status='captured-not-verified', mutation=mutation, rows=rows, profiles=profiles, sources=records,
                  generatedHashes={str(p.relative_to(work)):sha(p) for p in work.rglob('*.as')},
                  commands=commands, logSha256=sha(work / ('run' + suffix + '.log')),
                  constructorBoundary='Relevant original initialization statements only; full role constructors/art/equipment are outside this harness.',
                  generatorSha256=sha(Path(__file__)))
    (OUT / ('capture' + suffix + '.json')).write_text(json.dumps(report, separators=(',', ':')) + '\n', encoding='utf-8')
    print(json.dumps(dict(states=len(rows), natural=sum(r['native'] for r in rows), profiles=len(profiles), mutation=mutation)))


if __name__ == '__main__':
    main()
