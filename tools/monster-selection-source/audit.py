"""239 static caller/input audit; original geometry is reused from 218, not re-created."""
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess

ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-239'
spec=importlib.util.spec_from_file_location('reward231', ROOT/'tools/monster-reward-source/capture.py')
capture=importlib.util.module_from_spec(spec);spec.loader.exec_module(capture)


def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()


def main():
    records=[]
    def method(path,name):
        p=SRC/path;full=p.read_text(encoding='utf-8');code=capture.method(full,name)
        records.append(dict(path=p.relative_to(ROOT).as_posix(),method=name,line=full[:full.index(code)].count('\n')+1,
                            fileSha256=sha(p),methodSha256=hashlib.sha256(code.encode()).hexdigest()))
        return code
    profiles=[]
    for ident in [2,3,4,5,6,7,8,9,10,16,19,30]:
        path=f'export/monster/Monster{ident}.as';code=method(path,f'Monster{ident}')
        assigns=re.findall(r'this.alertRange\s*=\s*(\d+)\s*;',code)
        assert assigns==[str(600 if ident==19 else 1000)]
        assert code.index('super();')<code.index('this.alertRange')
        full=(SRC/path).read_text(encoding='utf-8');assert full.count('this.alertRange')==1
        profiles.append(dict(monsterId=ident,alertRange=int(assigns[0])))
    endless=method('base/BaseMonster.as','EndlessModeCreate');assert 'this.alertRange = 2000;' in endless
    found=subprocess.run(['rg','-l','-F','.EndlessModeCreate(',str(SRC)],capture_output=True,check=True,encoding='utf-8')
    callers=[Path(line).relative_to(SRC).as_posix() for line in found.stdout.splitlines()]
    assert callers==['export/level/StageListener981.as'],callers
    root_methods=[]
    for ident in [1,2,3,4,5]:
        path=f'export/hero/Role{ident}.as';code=method(path,'newColipse')
        assert 'AUtils.getNewObj("ObjectBaseSprite") as Sprite' in code
        assert 'this.addChild(this.colipse);' in code
        assert not re.search(r'colipse\.(?:x|y|scaleY)\s*=',(SRC/path).read_text(encoding='utf-8'))
        root_methods.append(dict(heroId=ident,symbol='ObjectBaseSprite',heightSource='218 ObjectBaseSprite native bounds, vertical scale 1'))
    base=method('base/BaseHero.as','BaseHero');assert 'this.colipse.scaleX = 1.2;' in base
    assert not re.search(r'colipse\.(?:y|scaleY)\s*=',(SRC/'base/BaseHero.as').read_text(encoding='utf-8'))
    bottom=method('base/BaseObject.as','getBottom');assert 'return this.colipse.height / 2 + this.y;' in bottom
    method('config/Config.as','getPlayerArray');method('base/BaseMonster.as','selectTarget')
    method('AUtils.as','GetNearestObj');method('AUtils.as','GetDisBetweenTwoObj')
    geom_path=ROOT/'docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json'
    geom=json.loads(geom_path.read_text(encoding='utf-8'));assert geom['status']=='verified'
    object_base=next(s for s in geom['symbols'] if s['symbol']=='ObjectBaseSprite')
    assert object_base['characterId']==105
    same_shape=[r for r in geom['monsterMappings'] if r['symbol']=='ObjectBaseSprite']
    assert all(r['instanceMatrix']['d']==1 and r['runtimeBounds']['height']==100 and r['runtimeBounds']['top']==-50 for r in same_shape)
    # Retain 231's existing oracle without rewriting or resampling its artifacts.
    spec=importlib.util.spec_from_file_location('verify231',ROOT/'tools/monster-reward-source/verify.py')
    prior=importlib.util.module_from_spec(spec);spec.loader.exec_module(prior)
    report=json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-231/source-trace.json').read_text(encoding='utf-8'))
    prior.check(report)
    for r in report['sources']:assert sha(ROOT/r['path'])==r['fileSha256']
    assert report['probeSha256']==sha(ROOT/'tools/monster-reward-source/Probe.as')
    result=dict(status='passed',profiles=profiles,heroRootBindings=root_methods,sources=records,endlessCallers=callers,
                prior231Cases=len(report['cases']),prior231Sha256=sha(ROOT/'docs/tasks/evidence/TASK-SETTINGS-231/source-trace.json'),
                reusedGeometry=dict(path=geom_path.relative_to(ROOT).as_posix(),sha256=sha(geom_path),truthId=geom['truthId'],
                    pointers=['/symbols/0','/monsterMappings/0/instanceMatrix','/monsterMappings/0/runtimeBounds'],
                    boundary='Reuse existing symbol/runtime height, with hero source vertical scale unchanged. This derives root from bottom; not a new full hero movement/visual or original spawn-position proof.'),
                rootMapping=dict(x='movement.x',y='movement.y - 50',sameSceneTranslationCancels=True,
                    excluded='Do not use BBDC per-role visual offsets, view origin, camera/screen positions or a new collision offset. Original wall 0.1 landing separation is movement behavior, not a target-coordinate adjustment.'))
    OUT.mkdir(parents=True,exist_ok=True);(OUT/'input-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('239 input audit: 12 constructors, 5 hero symbol bindings, existing 218 bounds and 264 retained 231 cases passed')


if __name__=='__main__':main()
