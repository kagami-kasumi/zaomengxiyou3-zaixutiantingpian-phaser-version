"""229 source slices; reuse only the 228 extraction mechanics, not family data."""
import hashlib
import json
import re
import runpy
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/lifecycle-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-229'
SRC=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'

def take(path,name):
    text=path.read_text(encoding='utf-8')
    match=re.search(r'(?:override )?(?:public|protected|private) (?:static )?function '+name+r'\(',text)
    assert match,name
    start=match.start();end=text.index('{',match.end())+1;depth=1
    while depth:depth+=(text[end]=='{')-(text[end]=='}');end+=1
    return text[start:end]

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    module=runpy.run_path(str(ROOT/'tools/monkey-spatial/prepare_lifecycle.py'))
    module['main'].__globals__.update(WORK=WORK,OUT=OUT)
    module['main']()
    path=WORK/'base/BaseObject.as'
    text=path.read_text().replace('public var curAction:', 'public var dead:Boolean=false,isReadyToDestroy:Boolean=false;public function isDead():Boolean{return dead;} public var curAction:')
    path.write_text(text,encoding='utf-8')
    (WORK/'base/BaseHero.as').write_text('package base {public class BaseHero extends BaseObject {}}')
    (WORK/'base/BaseMonster.as').write_text('package base {public class BaseMonster extends BaseObject {public function getHp():Number{return 100;}}}')
    path=WORK/'base/Config.as'
    text=path.read_text().replace('public var isStopGame:', 'public var pWorld:Object={monsterArray:[]},protectedPerproty:Object={getProperty:function(a:Object,b:String):Boolean{return false;}}; public var isStopGame:')
    path.write_text(text)
    path=WORK/'AUtils.as';text=path.read_text().replace('import flash.display.*;','import flash.display.*;import flash.geom.Point;')
    text=text.replace('public class AUtils {','public class AUtils {public static var sourceClasses:Object={};')
    text=text.replace('getDefinitionByName(param1)', '(sourceClasses[param1] || getDefinitionByName(param1))')
    text=text[:-2]+take(SRC/'AUtils.as','GetNextPointByTwoObj')+'}}'
    path.write_text(text,encoding='utf-8')
    original=(SRC/'export/bullet/EnemyMoveBullet.as').read_text(encoding='utf-8')
    marker=original.rfind('   }')
    observer='''override public function snapshot():Object {var o:Object=super.snapshot();
o.distance=distance;o.vx=speed.x;o.vy=speed.y;o.target=moveTarget?moveTarget.id:null;return o;}'''
    (WORK/'export/bullet/EnemyMoveBullet.as').write_text(original[:marker]+observer+original[marker:],encoding='utf-8')
    report=json.loads((OUT/'lifecycle-methods.json').read_text())
    for file,name in [('export/bullet/EnemyMoveBullet.as','whole-class'),('AUtils.as','GetNextPointByTwoObj')]:
        path=SRC/file
        report['methods'].append(dict(path=path.relative_to(ROOT).as_posix(),method=name,fileSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
            sliceSha256=None if name=='whole-class' else hashlib.sha256(take(path,name).encode()).hexdigest()))
    report['scope']='Original BaseBullet lifecycle, Follow/Special/EnemyMove classes; EnemyMove receives a read-only snapshot accessor. Collision/wall/settlement are sinks; BaseObject is a controlled source/target. Horse source is not BaseHero, so hero HP retarget branches are outside this fixture.'
    report['preparerReuse']=dict(path='tools/monkey-spatial/prepare_lifecycle.py',sha256=hashlib.sha256((ROOT/'tools/monkey-spatial/prepare_lifecycle.py').read_bytes()).hexdigest())
    report['symbolResolver']='The two pet1-only symbols are explicitly resolved from an isolated original pet1 ApplicationDomain to prevent its bundled game classes colliding with observation stubs. No original display script or symbol changes. Other constructors use original getDefinitionByName.'
    (OUT/'lifecycle-methods.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')

if __name__=='__main__':main()
