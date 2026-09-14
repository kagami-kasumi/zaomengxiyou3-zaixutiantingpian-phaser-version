"""Generate draft 220 source facts and a directly consumable field pack."""
import hashlib
import json
import runpy
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-220'
DEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-220-dragon4-trigger-collision.json'


def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def read(path): return json.loads(path.read_text(encoding='utf-8'))
def save(path,value): path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def rel(path): return path.relative_to(ROOT).as_posix()
def rect(b): return dict(left=b['x'],top=b['y'],width=b['width'],height=b['height'])


def generate():
    source=read(OUT/'source-display-list.json');native=read(OUT/'air-original/measurement.json')
    identity=dict(taskId='TASK-SETTINGS-220',truthId='task-settings-220.dragon4-trigger-collision',
                  surfaceId='dragon4-trigger-collision',description='One original masked trigger, 48 frames/96 directions; finite exact source sampling is separately verified.',
                  tool='generate-dragon4-collision.py',locator='PetDragonBullet4 / 539; unchanged closure 535..539; 535 clipDepth 3')
    spatial=runpy.run_path(str(ROOT/'tools/generate-dragon23-collision.py'))['spatial']
    manifest=spatial(source,native,output=OUT,identity=identity)
    if DEST.exists(): manifest['generatedBy']['generatedAt']=read(DEST)['generatedBy']['generatedAt']
    # Timeline masks occupy the display list but are not separately rendered colored objects.
    for obj in manifest['displayObjects']:
        if obj['sourceIdentity']['characterId']==535:
            obj['placements'][0]['visible']=False
        if obj['sourceIdentity']['characterId']==537:
            obj['render']['maskId']=obj['id'].rsplit('/',1)[0]+'/1'
    manifest['completeness']['expectedVisibleObjectCountByState']={s['id']:sum(
        p['visible'] for obj in manifest['displayObjects'] for p in obj['placements'] if p['stateId']==s['id']) for s in manifest['states']}
    manifest['completeness']['unresolved'][0]['nextEvidence']='verify-dragon4-contract.py'
    lookup=runpy.run_path(str(ROOT/'tools/verify-dragon4-sampling.py'))['fields']()
    pack=dict(schemaVersion=1,kind='source-air-quarter-phase-fields',fields={},planes={})
    for ident,(field,planes) in lookup.items():
        ids=[]
        for plane in planes:
            flat=plane.reshape(-1);digest=hashlib.sha256(flat.tobytes()).hexdigest();ids.append(digest)
            if digest not in pack['planes']:
                changes=np.diff(np.r_[False,flat,False].astype(np.int8))
                starts=np.flatnonzero(changes==1);ends=np.flatnonzero(changes==-1)
                pack['planes'][digest]=dict(size=flat.size,spans=np.column_stack((starts,ends-starts)).reshape(-1).tolist())
        pack['fields'][ident]={**{k:field[k] for k in ['width','height','originX','originY','support']},'quarterPhasePlaneIds':ids}
    (OUT/'runtime-mask-pack.json').write_text(json.dumps(pack,separators=(',',':'))+'\n')
    rows=[]
    for state,asset,tree in zip(source['states'],native['assets'],native['trees']):
        assert state['frame']==asset['frame']==tree['frame']
        frame=state['frame'];directions={}
        for direction,sign in [('left',1),('right',-1)]:
            item=next(i for i in native['actual'] if i['frame']==frame and i['sign']==sign)
            box=rect(item['bullet']);box['left']-=item['sourceRoot']['x'];box['top']-=item['sourceRoot']['y']
            directions[direction]=dict(bounds=box,fieldId=f'tile-{(frame-1)%15+1}-{direction}')
        rows.append(dict(symbol='PetDragonBullet4',frame=frame,characterId=539,blank=False,localBounds=rect(tree['tree']['bounds']),
                         directions=directions,displayList=state['displayList'],
                         production={**{k:asset[k] for k in ['sha256','cropX','cropY','registrationX','registrationY']},
                                     'path':asset['sourcePath'],'collisionUsesPngAlpha':False}))
    source_root=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
    evidence=[]
    for file,locator in [('export/pet/PetDragon4.as','doHit5:685-742; first remainingCount48, x/y root, hit4, hurtCanCutDownEffect false'),
                         ('base/BaseBullet.as','step2:105-134 and checkAttack:301-325; collision before last-frame release, optional hit callback'),
                         ('export/bullet/FollowBaseObjectBullet.as','step2:26-51; super before surviving position/flip follow')]:
        p=source_root/file;evidence.append(dict(path=rel(p),sha256=sha(p),locator=locator))
    target=ROOT/'docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json'
    contract=dict(schemaVersion=1,truthId=identity['truthId'],status='draft',
        scope=dict(taskId='TASK-SETTINGS-220',symbols=['PetDragonBullet4'],frameCounts={'PetDragonBullet4':48},frames=48,directionalStates=96),
        provenance=dict(sourceDisplayList=rel(OUT/'source-display-list.json'),sourceDisplayListSha256=sha(OUT/'source-display-list.json'),
                        nativeReport=rel(OUT/'air-original/measurement.json'),nativeReportSha256=sha(OUT/'air-original/measurement.json')),
        targetContract=dict(path=rel(target),sha256=sha(target),rule='Reuse the existing three target runtimeBounds once; do not apply instance scale twice.'),
        frames=rows,maskPack=dict(path=rel(OUT/'runtime-mask-pack.json'),sha256=sha(OUT/'runtime-mask-pack.json')),
        rootMapping=dict(expression=dict(x='combat.x',y='combat.y'),owners=['P1','P2'],facing='Modern facing -1 selects source left/sign +1; modern +1 selects right/sign -1.',
                         independence='Each projectile owns its root and follow history.',sourceCoordinate='Source root and target positions use existing twip conversion.'),
        sampling=dict(status='pending-independent-verification',accuracy=1,minIntersectionWidth=1,minIntersectionHeight=1,
                      algorithm='Use per-frame native bounds intersection. Truncate dimensions. qx=trunc(round((source.x-intersection.x)*20)/5), qy likewise; field phase=((qy%4+4)%4)*4+(qx%4+4)%4; offset=origin-floor(q/4). Count source field bits inside intersection.',
                      phaseOrder='y*4+x; quarter pixel',blank='Reject zero area before placing any field.',
                      precision='No observed differences in frozen cases; universal AIR raster equivalence is not claimed.',
                      verifier='tools/verify-dragon4-sampling.py',approvalRequiredForObservedResiduals=True),
        lifecycle=dict(triggerHostTick=1,remainingCount=48,sourceAction='hit4',bodyAction='hit5',
                       sourceOrder=['collision','optional hit callback','last-frame release','surviving owner position/flip follow'],
                       damageOnLastFrame=True,followsAfterCollision=True,hurtInterrupts=False,
                       attackId='Source attack-id snapshot plus projectile instance identity; target accepted-hit dedup.',
                       hitHealCallback=False,sourceEvidence=evidence),
        completeness=dict(displayListMatched=False,stateSetMatched=False,unresolved=['Independent source/field/semantic verification pending']))
    save(DEST,manifest);save(OUT/'collision-contract.json',contract)
    print('220 draft: 96 states, 384 display objects,',len(pack['fields']),'fields,',len(pack['planes']),'planes; no promotion.')


if __name__=='__main__': generate()
