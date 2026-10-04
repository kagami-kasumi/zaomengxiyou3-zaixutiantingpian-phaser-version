"""257A: original 256 world harness, with both directions and recursive poses.

Writes only 257A outputs. HP remains an acceptance service; spatial predicates
are independently sampled by capture.py, not inferred from the HP sink.
"""
import hashlib
import importlib.util
import json
from pathlib import Path
import sys
import subprocess
from types import SimpleNamespace

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
SOURCE = HERE.parent / 'monster2-source'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-257A/phase'
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-257A/phase'


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def main():
    repeat = '--repeat' in sys.argv
    if repeat: sys.argv.remove('--repeat')
    previous = json.loads((OUT/'phase.json').read_text(encoding='utf-8')) if repeat else None
    OUT.mkdir(parents=True, exist_ok=True)
    capture = load('capture', SOURCE / 'capture.py')
    phase = load('native256phase', SOURCE / 'phase.py')
    phase.subprocess = SimpleNamespace(run=lambda *args, **kwargs: subprocess.run(*args, **{**kwargs, "timeout": 240}))
    capture.WORK = WORK
    capture.OUT = phase.OUT = OUT
    original_prepare = capture.prepare

    def prepare(mutation=None):
        work = original_prepare(mutation)
        path = work / 'BaseBullet.as'
        code = path.read_text(encoding='utf-8')
        code = code.replace('public function inspectFrame', 'public function inspectDisplay():Object{return imgMc?{uid:uid,tree:Pose.tree(imgMc),wrapper:Pose.matrix(transform.matrix),parentPresent:parent!=null,imgMc1Present:imgMc1!=null}:null;}public function inspectFrame')
        path.write_text(code, encoding='utf-8')
        # Keep native transforms, bounds, visibility and all filter type identities.
        (work / 'Pose.as').write_text('''package {import flash.display.*;import flash.geom.*;import flash.utils.*;
public class Pose {
public static function matrix(m:Matrix):Object{return {a:m.a,b:m.b,c:m.c,d:m.d,tx:m.tx,ty:m.ty};}
public static function rect(r:Rectangle):Object{return {x:r.x,y:r.y,width:r.width,height:r.height};}
public static function tree(d:DisplayObject):Object {
var o:Object={type:getQualifiedClassName(d),matrix:matrix(d.transform.matrix),bounds:rect(d.getBounds(d)),alpha:d.alpha,visible:d.visible,blendMode:d.blendMode,maskPresent:d.mask!=null,filters:[],children:[]};
for each(var f:Object in d.filters)o.filters.push(getQualifiedClassName(f));
if(d is MovieClip){o.frame=MovieClip(d).currentFrame;o.totalFrames=MovieClip(d).totalFrames;}
if(d is DisplayObjectContainer)for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++)o.children.push(tree(DisplayObjectContainer(d).getChildAt(i)));
return o;}}}''', encoding='utf-8')
        path = work / 'application.xml'
        path.write_text(path.read_text(encoding='utf-8').replace('task256', 'task257A'), encoding='utf-8')
        return work

    capture.prepare = prepare
    # phase.main copies this generated probe after preparing source methods.
    probe_dir = WORK / 'probe-source'
    probe_dir.mkdir(parents=True, exist_ok=True)
    probe = (SOURCE / 'PhaseProbe.as').read_text(encoding='utf-8')
    probe = probe.replace("for each(var mode:String in ['normal','lethal','pause','destroy-after'])cases.push({fps:fps,attack:attack,mode:mode});", "for each(var mode:String in ['normal','lethal','pause','destroy-after','hurt-after','reject'])for each(var direction:int in [0,1])cases.push({fps:fps,attack:attack,mode:mode,direction:direction});")
    probe = probe.replace('Config.accept=true;', 'Config.accept=cases[batch].mode!="reject";')
    probe = probe.replace('new MonsterProbe(cases[batch].attack,1,false)', 'new MonsterProbe(cases[batch].attack,cases[batch].direction,false)')
    probe = probe.replace("if(cases[batch].mode=='destroy-after'", "if(cases[batch].mode=='hurt-after'&&tick==birth+1)m.setAction('hurt');if(cases[batch].mode=='destroy-after'")
    probe = probe.replace('var visuals:Array=[];', 'var displays:Array=[];for each(var db:BaseBullet in all)displays.push(db.inspectDisplay());var visuals:Array=[];')
    probe = probe.replace('playing:v.isPlaying}', 'playing:v.isPlaying,tree:Pose.tree(v)}')
    probe = probe.replace('scenario:cases[batch].mode,tick:tick', 'scenario:cases[batch].mode,direction:cases[batch].direction,tick:tick')
    probe = probe.replace('bullets:rows,visuals:visuals', 'bullets:rows,displays:displays,visuals:visuals')
    (probe_dir / 'PhaseProbe.as').write_text(probe, encoding='utf-8')
    phase.HERE = probe_dir
    phase.main()
    result_path = OUT / ('phase' + ('-' + sys.argv[1] if len(sys.argv) > 1 else '') + '.json')
    result = json.loads(result_path.read_text(encoding='utf-8'))
    result['spatialExtension'] = dict(
        toolSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        probeGeneratorSourceSha256=hashlib.sha256((SOURCE / 'PhaseProbe.as').read_bytes()).hexdigest(),
        baselineSourceSha256=hashlib.sha256((SOURCE / 'phase.py').read_bytes()).hexdigest(),
        expectedStates=10368,
        limitations='Original CHECK entry and pose binding only; controlled acceptance sinks do not prove original HP reception.')
    if previous:
        assert all(previous[k] == result[k] for k in ['rows','checks','generatedHashes','sources'])
        (OUT/'repeat.json').write_text(json.dumps(dict(status='passed',states=len(result['rows']),checks=len(result['checks']),rowsEqual=True,checksEqual=True,generatedSourcesEqual=True),indent=2)+'\n',encoding='utf-8')
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
