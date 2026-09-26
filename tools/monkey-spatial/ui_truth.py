"""UI-schema projection of the complete source-reconstructed natural display trees."""
import hashlib
import json
from pathlib import Path

from PIL import Image
import jsonschema

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def read(path):return json.loads(path.read_text(encoding='utf-8'))
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def rect(value):return dict(left=value['x'],top=value['y'],width=value['width'],height=value['height'])


def generate():
    inputs=read(OUT/'geometry-inputs.json');definitions=read(OUT/'source-definitions.json')
    fixture_path=BASE/'geometry-air/fixtures.json';fixtures=read(fixture_path)
    tree_path=BASE/'geometry-tree-air/measurement.json';rebuild=read(tree_path)
    assert rebuild['fixturesSha256']==sha(fixture_path)
    assert rebuild['builderSha256']==sha(ROOT/'tools/monkey-spatial/GeometryProbe.as')
    assert read(OUT/'geometry-verification.json')['exactPixelStates']==298
    trees={r['id']:r['tree'] for r in rebuild['trees']}
    native={fps:read(BASE/f'lifecycle-air/measurement-{fps}.json') for fps in [20,24,30]}
    fire={str(r['tick']):r for r in read(BASE/'cleanup-air/measurement.json')['fire']}
    provenance=[dict(id=s['id'],sourceType='restored-swf',sourcePath=s['path'],sha256=s['sha256'],locator='SymbolClass and recursive DefineSprite/shape closure') for s in definitions['sources']]
    provenance.append(dict(id='reconstructed-native-trees',sourceType='runtime-capture',sourcePath=tree_path.relative_to(ROOT).as_posix(),sha256=sha(tree_path),locator='/trees'))
    states=[];objects=[];baselines=[];counts={};compared=0;pending=0;empty_bounds=[]

    def compare(original,rebuilt):
        nonlocal compared,pending
        if original.get('pendingConstruction'):
            pending+=1;return
        for key in ['matrix','localBounds','rootBounds','alpha','visible','blendMode','colorTransform','filters']:
            if key in ('localBounds','rootBounds') and original[key]!=rebuilt[key] and all(v['width']==v['height']==0 for v in [original[key],rebuilt[key]]):
                empty_bounds.append(dict(state=state['id'],path=original['path'],field=key,native=original[key],reconstructed=rebuilt[key]))
                continue
            assert original[key]==rebuilt[key],(state['id'],original['path'],key,original[key],rebuilt[key])
        assert len(original['children'])==len(rebuilt['children'])
        compared+=1
        for a,b in zip(original['children'],rebuilt['children']):compare(a,b)

    def walk(node,source,cid,phase,state_id,path='root',parent=None,depth=0):
        identity=state_id+'/'+path
        frame=(phase or {}).get('frame') or 1
        placements=source['timelines'].get(str(cid),[])
        expected=placements[frame-1] if placements else []
        assert len(expected)==len(node['children']),(identity,cid)
        source_def=next(s for s in definitions['sources'] if s['id']==source['id'])['definitions'][str(cid)]
        refs=[f"{(OUT/'geometry-inputs.json').relative_to(ROOT).as_posix()}#/sources/{inputs['sources'].index(source)}",
              f"{tree_path.relative_to(ROOT).as_posix()}#/trees/{list(trees).index(state_id)}",'source-tag-sha256:'+source_def['tagBodySha256']]
        obj=dict(id=identity,parentId=parent,depth=depth,objectType='shape' if str(cid) in source['shapes'] else 'movie-clip',
                 sourceIdentity=dict(provenanceId=source['id'],characterId=cid,symbolClass=next((s for s,c in source['roots'].items() if c==cid),None),instanceName=None,frame=frame),
                 placements=[dict(stateId=state_id,visible=node['visible'],localMatrix=node['matrix'],registrationPoint=dict(x=0,y=0),
                                  localBounds=rect(node['localBounds']),stageBounds=rect(node['rootBounds']),alpha=node['alpha'],colorTransform=node['colorTransform'],
                                  derivation='calculated',derivationMethod='Source-decoded geometry/matrix/filter rebuilt in original AIR; native recursive phase selectors only. Root space equals stage space at identity placement.',evidenceRefs=refs)],
                 render=dict(assetRef=f"{(OUT/'geometry-inputs.json').relative_to(ROOT).as_posix()}#/sources/{inputs['sources'].index(source)}/{'shapes' if str(cid) in source['shapes'] else 'timelines'}/{cid}",blendMode=node['blendMode'],filters=node['filters'],maskId=None))
        objects.append(obj)
        count=int(node['visible'])
        for i,(child,p) in enumerate(zip(node['children'],expected)):
            child_phase=(phase or {}).get('children',[])
            child_phase=child_phase[i] if i<len(child_phase) else None
            count+=walk(child,source,p['characterId'],child_phase,state_id,path+'/'+str(i),identity,p['depth'])
        return count

    for state in fixtures['states']:
        identity=state['id'];source=inputs['sources'][state['sourceIndex']]
        if identity.startswith('fire-'):
            observation=fire[identity.split('-')[1]];path=BASE/'cleanup-air'/observation['path']
        else:
            fps,index=map(int,identity.split('-'));key=sorted(native[fps]['nativePhases'])[index]
            observation=native[fps]['nativePhases'][key];path=BASE/'lifecycle-air'/observation['path']
        assert sha(path)==observation['sha256']
        compare(observation['tree'],trees[identity])
        counts[identity]=walk(trees[identity],source,state['cid'],state['phase'],identity)
        baseline='baseline-'+identity
        states.append(dict(id=identity,entry='Native natural timeline; see lifecycle/cleanup fixture selectors',fixtureId='geometry-air/fixtures.json#'+identity,baselineId=baseline,frame=(state['phase'] or {}).get('frame') or 1))
        width,height=Image.open(path).size
        baselines.append(dict(id=baseline,stateId=identity,path=path.relative_to(ROOT).as_posix(),sha256=sha(path),width=width,height=height,crop=dict(left=state['left'],top=state['top'],width=width,height=height)))
    ids=[s['id'] for s in states]
    data=dict(schemaVersion=1,truthId='task-settings-228.monkey-natural-display',status='verified',
              scope=dict(taskId='TASK-SETTINGS-228',surfaceId='monkey-effects-fire-natural',originalVersion='restored 20120203 + StageCommon; original bundled AIR',description='Nine principal effects and target FireBuff natural source display closure. Body, inherited hurt, protection, and host lifecycle are separate manifest sections.'),
              generatedBy=dict(tool='tools/monkey-spatial/ui_truth.py',toolVersion='1',command='python tools/monkey-spatial/ui_truth.py',generatedAt='2026-09-21T00:00:00Z'),
              provenance=provenance,stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage',scaleMode='noScale',alignment='TL'),
              states=states,displayObjects=objects,baselines=baselines,
              completeness=dict(expectedStateIds=ids,extractedStateIds=ids,expectedVisibleObjectCountByState=counts,displayListMatched=True,stateSetMatched=True,unresolved=[]),
              evidenceRefs=[(OUT/n).relative_to(ROOT).as_posix() for n in ['geometry-verification.json','geometry-inputs.json','lifecycle-verification.json','cleanup-verification.json']])
    jsonschema.validate(data,read(ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json'))
    report=dict(status='passed',states=len(states),objects=len(objects),comparedNativeObjects=compared,pendingNativeSubtreesResolvedFromSource=pending,
                geometryTreeMeasurementSha256=sha(tree_path),emptyBoundsSentinelDifferences=empty_bounds,
                scope='Schema and complete recursive trees; pending source first-frame content is covered by strict independent RGBA gate. Only zero-width/zero-height empty sentinel positions may differ; their exact native/rebuilt values are retained, no nonempty geometry or collision tolerance.')
    return data,report


if __name__=='__main__':
    data,report=generate()
    (OUT/'natural-display-ui.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (OUT/'natural-display-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('228 display Schema:',report['states'],'states;',report['objects'],'objects;',report['comparedNativeObjects'],'native comparisons;',len(report['emptyBoundsSentinelDifferences']),'empty sentinel positions')
