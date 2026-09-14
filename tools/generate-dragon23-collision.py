"""Generate finite source geometry and explicitly approved approximate collision data."""
from pathlib import Path
from datetime import datetime,timezone
import hashlib
import json
import runpy
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-219'
DEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-219-dragon23-effect-collision.json'
COUNTS={'PetDragon2Bullet1':15,'PetDragon2Bullet2':30,'PetDragon3Bullet1':21,'PetDragon3Bullet3':10}
I=dict(a=1,b=0,c=0,d=1,tx=0,ty=0)


def read(path):return json.loads(path.read_text(encoding='utf-8'))
def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def rel(path):return path.relative_to(ROOT).as_posix()
def save(path,value):path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def bounds(r):return dict(left=r['x'],top=r['y'],width=r['width'],height=r['height'])


def descend(node):
    for child in node['children']:
        yield child
        yield from descend(child)


def spatial(source,native,*,output=None,identity=None):
    output=output or OUT
    identity=identity or dict(taskId='TASK-SETTINGS-219',truthId='task-settings-219.dragon23-effect-collision',
        surfaceId='dragon23-effect-collision',description='Four source effects, 76 native frames and 152 directional states. Source geometry/baselines only; collision approximation is explicitly separate in collision-contract.json.',
        tool='generate-dragon23-collision.py',locator='Symbols 547/563/572/603; unchanged closure 543..603')
    trees={(t['symbol'],t['frame']):t['tree'] for t in native['trees']}
    objects=[];states=[];baselines=[];counts={}
    for item in source['states']:
        tree=trees[(item['symbol'],item['frame'])]
        nodes=[(dict(path='root',characterId=item['characterId'],depth=0,frame=item['frame'],instanceName=None),tree)]
        nodes+=list(zip(item['displayList'],descend(tree)))
        for direction,sign,px in [('left',1,350),('right',-1,590)]:
            state=f"{item['symbol']}-{item['frame']}-{direction}"
            counts[state]=0
            for extracted,measured in nodes:
                path=extracted['path'];parent=path.rsplit('/',1)[0] if path!='root' else None
                local=bounds(measured['bounds']);stage=bounds(measured['stageBounds'])
                stage['left']=px+(stage['left'] if sign==1 else -stage['left']-stage['width']);stage['top']+=450
                visible=local['width']>0 and local['height']>0 and measured['alpha']>0
                counts[state]+=int(visible)
                objects.append(dict(id=state+'-'+path,parentId=state+'-'+parent if parent else None,
                    depth=extracted['depth'],objectType='movie-clip' if 'children' in measured and 'frame' in measured else 'shape',
                    sourceIdentity=dict(provenanceId='pet',characterId=extracted['characterId'],
                        symbolClass=item['symbol'] if path=='root' else None,instanceName=extracted['instanceName'],frame=extracted['frame']),
                    placements=[dict(stateId=state,visible=visible,localMatrix=dict(I,a=sign,tx=px,ty=450) if path=='root' else measured['matrix'],
                        registrationPoint=dict(x=0,y=0),localBounds=local,stageBounds=stage,alpha=measured['alpha'],
                        derivation='observed',derivationMethod='Original AIR native recursive getBounds/local matrix; stage root placement is the recorded source baseline.',
                        evidenceRefs=['pet','air'])],
                    render=dict(assetRef=None,blendMode=measured['blendMode'],filters=measured['filters'],maskId=None)))
            states.append(dict(id=state,entry='Original AIR native source-tag playback; isolated combat-space baseline',
                               frame=item['frame'],fixtureId=state,baselineId=state))
            path=output/'air-original/stage-baselines'/(state+'.png')
            baselines.append(dict(id=state,stateId=state,path=rel(path),sha256=sha(path),width=940,height=590,
                                  crop=dict(left=0,top=0,width=940,height=590)))
    return dict(schemaVersion=1,truthId=identity['truthId'],status='draft',
        scope=dict(taskId=identity['taskId'],surfaceId=identity['surfaceId'],originalVersion='RegiMA 1.1',description=identity['description']),
        generatedBy=dict(tool=identity['tool'],toolVersion='1',command='python tools/'+identity['tool'],generatedAt=datetime.now(timezone.utc).isoformat()),
        provenance=[dict(id='pet',sourceType='restored-swf',sourcePath='local-resources/regima/source/restored-swfs/assets/pet1.swf',
                         sha256=source['sourceHashes']['pet1.swf'],locator=identity['locator']),
                    dict(id='air',sourceType='runtime-capture',sourcePath=rel(output/'air-original/measurement.json'),
                         sha256=sha(output/'air-original/measurement.json'),locator='trees, actual and artifactHashes; original AIR DLL/probe provenance')],
        stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage'),states=states,displayObjects=objects,baselines=baselines,
        completeness=dict(expectedStateIds=[s['id'] for s in states],extractedStateIds=[s['id'] for s in states],
            expectedVisibleObjectCountByState=counts,displayListMatched=False,stateSetMatched=False,
            unresolved=[dict(id='independent-validation',description='Independent contract and approval-aware verification pending',impact='validation',nextEvidence='verify-dragon23-contract.py')]))


def mask_pack(native):
    helper=runpy.run_path(str(ROOT/'tools/verify-dragon23-collision.py'))
    fields=helper['load_fields'](native,OUT/'air-original')
    result=dict(schemaVersion=1,kind='original-air-phase-field-approved-approximation',fields={},planes={})
    for key,(meta,planes) in fields.items():
        ids=[]
        for py in range(4):
            for px in range(4):
                plane=planes[py*100+px*5].reshape(-1)
                ident=hashlib.sha256(plane.tobytes()).hexdigest()
                if ident not in result['planes']:
                    changes=np.diff(np.r_[False,plane,False].astype(np.int8))
                    starts=np.flatnonzero(changes==1);ends=np.flatnonzero(changes==-1)
                    result['planes'][ident]=dict(size=plane.size,spans=np.column_stack((starts,ends-starts)).reshape(-1).tolist())
                ids.append(ident)
        result['fields'][key]={**{k:meta[k] for k in ['width','height','originX','originY']},'quarterPhasePlaneIds':ids}
    return result


def main():
    source=read(OUT/'source-display-list.json');native=read(OUT/'air-original/measurement.json')
    approval=read(OUT/'approved-approximation.json');assert approval['status']=='user-approved'
    trees={(t['symbol'],t['frame']):t['tree'] for t in native['trees']}
    assets={(a['symbol'],a['frame']):a for a in native['assets']}
    frames=[]
    for state in source['states']:
        key=(state['symbol'],state['frame']);tree=trees[key];asset=assets[key];directions={}
        for direction,sign in [('left',1),('right',-1)]:
            item=next(i for i in native['actual'] if (i['symbol'],i['frame'],i['sign'])==(*key,sign))
            box=bounds(item['bullet']);box['left']-=item['sourceRoot']['x'];box['top']-=item['sourceRoot']['y']
            # Flash exposes sentinel coordinates on empty frames; the runtime must reject zero area before positioning.
            directions[direction]=dict(bounds=box,fieldId=asset['maskGroup']+'-'+direction)
        frames.append(dict(symbol=key[0],frame=key[1],characterId=state['characterId'],blank=tree['bounds']['width']==0 or tree['bounds']['height']==0,
            localBounds=bounds(tree['bounds']),directions=directions,displayList=state['displayList'],
            production=dict(path=asset['sourcePath'],sha256=asset['sha256'],cropX=asset['cropX'],cropY=asset['cropY'],
                registrationX=asset['registrationX'],registrationY=asset['registrationY'],collisionUsesPngAlpha=False)))
    pack=mask_pack(native)
    (OUT/'runtime-mask-pack.json').write_text(json.dumps(pack,separators=(',',':'))+'\n',encoding='utf-8')
    target=ROOT/'docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json'
    contract=dict(schemaVersion=1,truthId='task-settings-219.dragon23-effect-collision',status='draft',
        scope=dict(taskId='TASK-SETTINGS-219',symbols=list(COUNTS),frameCounts=COUNTS,frames=76,directionalStates=152),
        provenance=dict(sourceDisplayList=rel(OUT/'source-display-list.json'),sourceDisplayListSha256=sha(OUT/'source-display-list.json'),
            nativeReport=rel(OUT/'air-original/measurement.json'),nativeReportSha256=sha(OUT/'air-original/measurement.json')),
        targetContract=dict(path=rel(target),sha256=sha(target),monsterIds=[2,3,4,5,6,7,8,9,10,16,19,30],
                            rule='Reuse 218 monster runtimeBounds once; do not apply instance scale a second time.'),
        frames=frames,maskPack=dict(path=rel(OUT/'runtime-mask-pack.json'),sha256=sha(OUT/'runtime-mask-pack.json')),
        rootMapping=dict(inputSpace='combat',expression=dict(x='combat.x',y='combat.y'),owners=['P1','P2'],
            independence='Each projectile uses its own current root and owning player; never a shared primary-player root.',
            sourceCoordinate='truncate coordinate*20 toward zero, then divide by20; preserve negative values'),
        sampling=dict(status='approved-approximation',approvalPath=rel(OUT/'approved-approximation.json'),approvalSha256=sha(OUT/'approved-approximation.json'),
            equivalence='Not an exact reproduction of AIR rasterization. Source facts and measured native outputs remain separate.',
            algorithm='Intersection-local quarter phase lookup of original AIR compiled source fields; accept a sample if any field bit lies inside the target intersection.',
            accuracy=1,minIntersectionWidth=1,minIntersectionHeight=1,phaseOrder='quarterY*4+quarterX',
            delta='sourceRoot - intersectionOrigin',quarterTranslation='truncate(round(delta*20)/5) /4',
            fieldPixel='bufferPixel + fieldOrigin - floor(quarterTranslation)',
            phase='positive modulo 4 of truncate(round(delta*20)/5)',blank='zero-area source frame returns false before sentinel bounds are positioned',
            measuredDifferences='sampling-verification.json',nativePrecisionNotModeled=['AIR rotated bitmap scanline precision','Partial target-edge coverage in some fractional-root draws']),
        lifecycle=dict(sourceOrder=['BaseBullet.step2: step / collision','callback','last-frame stop/destroy','source-hurt cleanup if enabled','FollowBaseObjectBullet: follow owner only if still alive'],
            damageOnLastFrame=True,sdccFollowsAfterCollision=True,ltwjIndependentObjects=True,
            attackId='setRole copies the source role attack id; separate ltwj objects need not have distinct owner attack ids'),
        completeness=dict(displayListMatched=False,stateSetMatched=False,unresolved=['Independent verification pending']))
    legacy=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
    contract['lifecycle']['sourceEvidence']=[dict(path=rel(legacy/path),sha256=sha(legacy/path),lines=lines)
        for path,lines in [('base/BaseBullet.as','105-145,403-431'),('export/bullet/FollowBaseObjectBullet.as','18-54,65-77'),
                           ('export/pet/PetDragon3.as','417-470')]]
    save(OUT/'collision-contract.json',contract);save(DEST,spatial(source,native))
    print('219 draft generated: 76 frames, 152 baselines,',len(pack['planes']),'unique quarter-phase planes; mask pack bytes=',(OUT/'runtime-mask-pack.json').stat().st_size)


if __name__=='__main__':main()
