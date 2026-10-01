"""244 Schema normalization. Promotion requires independent acceptance hashes."""
import gzip
import hashlib
import json
from datetime import datetime,timezone
from pathlib import Path
import jsonschema
from prepare import ROOT,OUT,sha
from verify_display import source_timelines,SOURCE_IDS
from verify_lifecycle import key

TARGET=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-244-pet-passive-effects.json'
IDENTITY=dict(a=1,b=0,c=0,d=1,tx=0,ty=0)

def box(b):return dict(left=b['x'],top=b['y'],width=b['width'],height=b['height'])

def parent_bounds(b,m):
    pts=[(m['a']*x+m['c']*y+m['tx'],m['b']*x+m['d']*y+m['ty']) for x in (b['x'],b['x']+b['width']) for y in (b['y'],b['y']+b['height'])]
    xs,ys=zip(*pts);return dict(left=min(xs),top=min(ys),width=max(xs)-min(xs),height=max(ys)-min(ys))

def main(verified=False):
    native=OUT/'baseline-native.json.gz';data=json.loads(gzip.decompress(native.read_bytes()))
    lifecycle=json.loads((OUT/'lifecycle-verification.json').read_text(encoding='utf-8'))
    display=json.loads((OUT/'display-verification.json').read_text(encoding='utf-8'))
    assert lifecycle['status']==display['status']=='passed' and lifecycle['inputSha256']==sha(native)
    counts={s['stateID']:s['sourceRecursiveObjectCount']+lifecycle['wrapperCounts'][s['stateID']] for s in display['states']}
    timelines=source_timelines(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-244/source/pet1-closure.xml')
    states=[];baselines=[];objects={};provenance=[]
    for i,s in enumerate(data['fixtures']['sources']):
        p=Path(s['path']);provenance.append(dict(id='common' if i==0 else 'pet',sourceType='restored-swf',sourcePath=p.relative_to(ROOT).as_posix(),sha256=s['sha256'],locator='Original SymbolClass; pet targets 713/738/761/778/805/806, auxiliary known ObjectBaseSprite/3/4 collider inputs.'))
    provenance.append(dict(id='native',sourceType='runtime-capture',sourcePath=native.relative_to(ROOT).as_posix(),sha256=sha(native),locator='Original bundled AIR 51.1.1.5; /rows. Controlled source method entry and ENTER_FRAME host / EXIT_FRAME capture.'))
    seen=set()
    for record in data['sources']:
        if record['path'] in seen:continue
        seen.add(record['path']);provenance.append(dict(id='as3-'+hashlib.sha256(record['path'].encode()).hexdigest()[:16],sourceType='legacy-as3',sourcePath=record['path'],sha256=record['sha256'],locator='Source methods /sources in native corpus; exact startLine and sliceSha256.'))

    def tree(node,sid,group,pointer,parent=None,depth=0,cid=None,path='root'):
        if node['type'] in SOURCE_IDS:cid=SOURCE_IDS[node['type']]
        pid='pet' if cid else 'native'
        render=dict(assetRef=('local-resources/regima/source/restored-swfs/assets/pet1.swf#character='+str(cid)) if cid else None,blendMode=node['blendMode'],filters=node['filters'],maskId=None)
        identity=[group,path,parent,cid,node.get('frame'),render]
        oid='o-'+hashlib.sha256(json.dumps(identity,sort_keys=True).encode()).hexdigest()[:24]
        if oid not in objects:
            objects[oid]=dict(id=oid,parentId=parent,depth=depth,objectType='movie-clip' if cid in timelines else 'shape' if cid else 'container',sourceIdentity=dict(provenanceId=pid,characterId=cid,symbolClass=node['type'] if node['type'] in SOURCE_IDS else None,instanceName=None if node['name'].startswith('instance') else node['name'],frame=node.get('frame')),placements=[],render=render)
        m=node['matrix'];objects[oid]['placements'].append(dict(stateId=sid,visible=node['visible'],localMatrix=m,registrationPoint=dict(x=0,y=0),localBounds=box(node['localBounds']),parentBounds=parent_bounds(node['localBounds'],m),stageBounds=box(node['rootBounds']),alpha=node['alpha'],colorTransform=node['colorTransform'],derivation='calculated',derivationMethod='Flash symbol origin; native local/root bounds; affine local AABB to parent. Tight raster bounds and crop are independently retained per native row.',evidenceRefs=['native#/rows/'+str(pointer)]))
        placements=timelines[cid][node['frame']-1] if cid in timelines else None
        if placements is not None:assert len(placements)==len(node['children'])
        for i,c in enumerate(node['children']):
            p=placements[i] if placements else None
            tree(c,sid,group,pointer,oid,p['depth'] if p else i,p['characterId'] if p else None,path+'/'+str(i))
        return oid

    for i,row in enumerate(data['rows']):
        sid=key(row);bid='b-'+sid;c=row['crop']
        states.append(dict(id=sid,entry=row['phase'],fixtureId=row['id'],frame=row['tick'],baselineId=bid))
        baselines.append(dict(id=bid,stateId=sid,path=row['capture'],sha256=row['captureSha256'],width=c['width'],height=c['height'],crop=c))
        tree(row['display'],sid,row['id'],i)
    expected=sorted(counts);assert expected==sorted(s['id'] for s in states)
    now=json.loads((OUT/'acceptance.json').read_text(encoding='utf-8'))['generatedAt'] if (OUT/'acceptance.json').exists() else datetime.now(timezone.utc).isoformat()
    obj=dict(schemaVersion=1,truthId='task-settings-244.pet-passive-effects',status='draft',scope=dict(taskId='TASK-SETTINGS-244',surfaceId='six-pet-passive-effects',originalVersion='Restored RegiMA pet1 + bundled AIR51.1.1.5',description=data['fixtures']['boundary']+' 384 fixtures, 65280 states; 940x590 stage with lossless object crops retaining stage origin. No modern render or combat truth. Semantic wrappers retain actual parent/depth; native source shape trees are linked to original character IDs.'),generatedBy=dict(tool='tools/pet-passive-visual/manifest.py',toolVersion='1',command='python tools/pet-passive-visual/manifest.py',generatedAt=now),provenance=provenance,stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage',scaleMode='noScale',alignment='topLeft'),states=states,displayObjects=list(objects.values()),baselines=baselines,completeness=dict(expectedStateIds=expected,extractedStateIds=expected,expectedVisibleObjectCountByState=counts,displayListMatched=True,stateSetMatched=True,unresolved=[dict(id='pending-acceptance',description='Repeat capture, compiled source mutations and normalized object-count check pending.',impact='validation',nextEvidence='accept.py')]))
    obj['$schema']='../schema/ui-ground-truth.schema.json'
    if verified:
        a=json.loads((OUT/'acceptance.json').read_text(encoding='utf-8'));assert a['status']=='accepted'
        for p,digest in a['inputSha256'].items():assert sha(ROOT/p)==digest,p
        obj['status']='verified';obj['completeness']['unresolved']=[];obj['generatedBy']['command']+=' --verified'
    schema=json.loads((ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json').read_text(encoding='utf-8'))
    jsonschema.Draft202012Validator(schema).validate(obj)
    observed={sid:0 for sid in expected}
    for o in objects.values():
        for p in o['placements']:observed[p['stateId']]+=1
    assert observed==counts,'Independent source/lifecycle counts disagree with normalized display objects'
    TARGET.write_text(json.dumps(obj,separators=(',',':'))+'\n',encoding='utf-8')
    print(obj['status'],len(states),'states',len(objects),'objects',TARGET.stat().st_size,'bytes; Schema/counts passed')
    return obj

if __name__=='__main__':
    import sys
    main('--verified' in sys.argv)
