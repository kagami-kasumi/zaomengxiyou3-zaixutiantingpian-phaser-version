"""Normalize 257A native evidence; exact collision approval is never inferred."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import jsonschema
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-257A'
DEST = ROOT / 'docs/reverse-engineering/ground-truth/manifests/monster2-attack-space.json'
SIDE = ROOT / 'docs/reverse-engineering/reference/monster2-attack-space-contract.json'
IDENTITIES = [(1,'Monster2Bullet1_1',49,14),(2,'Monster2Bullet1_2',34,20),(3,'Monster2Bullet2',30,14)]


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def rel(path):
    return path.relative_to(ROOT).as_posix()


def ref(path):
    return dict(path=rel(path),sha256=sha(path))


def save(path, value, check=False):
    text = json.dumps(value,ensure_ascii=False,indent=2)+'\n'
    if check:
        assert path.read_text(encoding='utf-8') == text, 'Regeneration changed '+rel(path)
    else:
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(text,encoding='utf-8')


def rect(r):
    return dict(left=r['x'],top=r['y'],width=r['width'],height=r['height'])


def count(tree):
    return 1 + sum(count(c) for c in tree['children'])


def main():
    verified = '--verify' in sys.argv
    check = '--check' in sys.argv
    visual = read(OUT/'visual-verification.json')
    phase = read(OUT/'phase-binding.json')
    assert visual['status']=='passed' and visual['states']==96 and visual['pixelDifferences']==0
    assert phase['status']=='passed' and phase['states']==10368 and phase['checks']==780
    assert phase['nativeMutationsRejected']==['pause-raw','raw-no-remove']
    assert sha(ROOT/phase['phaseSource'])==phase['phaseSha256']
    assert read(OUT/'native-mutations.json')['status']=='passed'
    visual_by_id={(r['attack'],r['id']):r for r in visual['results']}
    states,objects,baselines,counts,provenance,attacks = [],[],[],{},[],[]
    for attack,symbol,cid,frames in IDENTITIES:
        out=OUT/f'attack{attack}'
        work=ROOT/f'local-resources/regima/task-outputs/TASK-SETTINGS-257A/attack{attack}/air'
        native=read(out/'native.json')
        source=read(out/'source-display-list.json')
        fixtures=read(out/'fixtures.json')
        repeat=read(out/'repeat.json')
        assert sha(ROOT/source['source'])==source['sha256']
        assert sha(work/'Probe.as')==native['probeSha256']
        assert sha(work/'fixtures.json')==native['fixtureSha256']==sha(out/'fixtures.json')
        assert sha(work/'buffers.deflate')==native['bufferSha256']
        assert repeat['sourceCasesEqual'] and repeat['displayTreesEqual'] and repeat['baselinePngBytesEqual'] and repeat['fieldBytesEqual']
        assert len(native['projections'])==frames*2 and fixtures['symbol']==symbol
        assert len(native['cases'])==(frames*2*4*1444 if attack!=3 else 0)
        assert len(source['states'])==frames and source['projectionStates']==frames*2
        assert source['sourceFieldMutantsRejected']==['bounds','visibility','blend','matrix']
        provenance.append(dict(id=f'attack{attack}',sourceType='restored-swf',sourcePath=source['source'],sha256=source['sha256'],locator=f'{symbol} character{cid}; independent closure and native recursive trees'))
        resources=[]
        for projection in native['projections']:
            frame,sign=projection['frame'],projection['sign']
            key=f'f{frame}-s{sign}'
            identity=f'attack{attack}-{key}'
            tree=projection['tree']
            decoded=source['states'][frame-1]['tree']
            baseline=work/'baselines'/f'{key}.png'
            assert Image.open(baseline).size==(940,590)
            v=visual_by_id[attack,key]
            assert sha(baseline)==v['stageSha256']
            crop=v['crop'];assert sha(ROOT/crop['path'])==crop['sha256']
            resources.append(dict(stateId=identity,**crop,emptyAlpha=v['emptyAlphaMutantRejected']))
            states.append(dict(id=identity,entry='Native birth/ENTER pose before frame script; actual world/EXIT mapping in phase sidecar',frame=frame,fixtureId=identity,baselineId=identity))
            baselines.append(dict(id=identity,stateId=identity,**ref(baseline),width=940,height=590,crop=dict(left=0,top=0,width=940,height=590)))
            assert count(decoded)==count(tree)
            counts[identity]=count(decoded)
            def walk(s,n,path='root',parent=None):
                oid=identity+'/'+path
                assert n['blendMode']=='normal' and not n['filters']
                objects.append(dict(id=oid,parentId=parent,depth=s.get('depth',0),
                    objectType='movie-clip' if s['kind']=='DefineSpriteTag' else 'shape',
                    sourceIdentity=dict(provenanceId=f'attack{attack}',characterId=s['characterId'],symbolClass=symbol if parent is None else None,instanceName=None,frame=s['frame']),
                    placements=[dict(stateId=identity,visible=n['visible'],alpha=n['alpha'],
                        localMatrix=n['worldMatrix'] if parent is None else n['matrix'],
                        registrationPoint=dict(x=0,y=0),localBounds=rect(n['bounds']),stageBounds=rect(n['stageBounds']),
                        derivation='observed',derivationMethod='Native matrix and recursive bounds, independently checked against restored Place/Move/Remove tags; root includes signed fixture wrapper.',
                        evidenceRefs=[f'attack{attack}',rel(out/'source-display-list.json'),rel(out/'native.json')])],
                    render=dict(assetRef=crop['path'] if parent is None else None,blendMode=n['blendMode'],filters=[],maskId=None)))
                for sc,nc in zip(s['children'],n['children']):
                    walk(sc,nc,path+'/'+str(sc['depth']),oid)
            walk(decoded,tree)
        fields=[]
        for field in native['masks']:
            path=work/'fields'/f"{field['id']}.deflate"
            assert sha(path)==native['fieldHashes'][path.name]
            fields.append({**field,**ref(path)})
        verification=read(out/'verification.json') if attack!=3 else None
        if verification:
            assert verification['booleanDifferences']==0 and verification['cases']==len(native['cases'])
            assert verification['residualPixels']==(234 if attack==1 else 0)
            assert verification['candidateSha256']==sha(out/'candidate-pixel-differences.json')
        attacks.append(dict(attack=attack,symbol=symbol,characterId=cid,totalFrames=frames,
            sourceDisplayList=ref(out/'source-display-list.json'),oracle={**ref(out/'native.json'),'caseCount':len(native['cases'])},
            fixtures=ref(out/'fixtures.json'),resources=resources,phaseFields=fields,verification=verification,
            residuals=ref(out/'candidate-pixel-differences.json') if verification else None))
    state_ids={s['id'] for s in states}
    assert len(state_ids)==96
    assert len(phase['stateBindings'])==10368
    for binding in phase['stateBindings']:
        assert set(binding['stateIds'])<=state_ids
    for binding in phase['bindings']:
        assert binding['stateId'] in state_ids
    common=ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'
    provenance.append(dict(id='actual-targets',sourceType='restored-swf',sourcePath=rel(common),sha256=sha(common),locator='40 constructor mappings; four actual colipse profiles; source hashes revalidated'))
    unresolved=[dict(id='collision-residual-approval',description='First attack: 234 exact one-pixel differences, zero Boolean differences. Second attack: zero pixel/Boolean differences. No authorization inferred.',impact='validation',nextEvidence='Explicit user approval of the frozen exact list or elimination of every residual.')]
    status='blocked'
    approval=None
    if verified:
        approval=read(OUT/'approved-pixel-differences.json')
        assert approval['status']=='user-approved'
        for attack in attacks[:2]:
            assert approval['candidates'][str(attack['attack'])]==attack['residuals']['sha256']
        unresolved=[];status='verified'
    manifest=dict(schemaVersion=1,truthId='task-settings-257.monster2-attack-space',status=status,
        scope=dict(taskId='TASK-SETTINGS-257A',surfaceId='monster2-attack-space',originalVersion='RegiMA 1.1 / bundled AIR 51.1.1.5',description='96 native poses, 392768 finite actual-target HitTest cases, 10368 lifecycle observations with 780 CHECK bindings; no HP or Tween interpolation claim'),
        generatedBy=dict(tool='tools/monster2-space/generate.py',toolVersion='1',command='python tools/monster2-space/generate.py'+(' --verify' if verified else ''),generatedAt='2026-10-04T00:00:00Z'),
        provenance=provenance,stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage',scaleMode='noScale',alignment='TL'),
        states=states,displayObjects=objects,baselines=baselines,
        completeness=dict(expectedStateIds=[f'attack{a}-f{f}-s{s}' for a,_,_,frames in IDENTITIES for f in range(1,frames+1) for s in [1,-1]],extractedStateIds=[s['id'] for s in states],expectedVisibleObjectCountByState=counts,displayListMatched=True,stateSetMatched=True,unresolved=unresolved),
        evidenceRefs=[rel(SIDE),rel(OUT/'phase-binding.json'),rel(OUT/'visual-verification.json')])
    manifest['$schema']='../schema/ui-ground-truth.schema.json'
    consumers=read(OUT/'modern-consumers.json')
    assert all(sha(ROOT/c['path'])==c['currentSha256']==c['sha256'] for c in consumers['consumers'])
    empty_extents=[dict(objectId=o['id'],stateId=p['stateId'],emptyExtent=True,stageBoundsSentinel=True)
                   for o in objects for p in o['placements']
                   if p['stageBounds']['width']==0 and p['stageBounds']['height']==0]
    assert len(empty_extents)==28
    side=dict(emptyExtents=empty_extents,modernConsumers=consumers['consumers'],bodyBehavior=ref(ROOT/'docs/reverse-engineering/reference/monster2-body-attack-contract.json'),truthId=manifest['truthId'],status=status,manifest=rel(DEST),attacks=attacks,
        profiles=read(ROOT/'tools/monster30-collision/profiles.json'),targets=read(OUT/'attack1/native.json')['targets'],
        phase=ref(OUT/'phase-binding.json'),phaseBindings=phase['bindings'],stateBindings=phase['stateBindings'],
        visualVerification=ref(OUT/'visual-verification.json'),nativeMutations=ref(OUT/'native-mutations.json'),
        sampling=dict(phasesPerAxis=20,bitOrder='little',translation='quarter-pixel signed truncation; frozen finite domain only',predicate='AND source/target planes, then native sole-origin getColorBoundsRect rule',limitations='No arbitrary-coordinate equivalence. Only exact specifically approved residuals permitted.'),
        visual=dict(method='Original stage raster crops; separate enlarged native canvas has zero differences and no alpha outside viewport',rejectedAlternative='Re-rasterizing at a different local origin changes 28 first-attack poses; diagnostic retained, never used as accepted original pixels',emptyStates=30,menusButtonsText='not applicable',coordinateApis='Preserve source/local/getBounds geometry and observed quarter-pixel concatenatedMatrix separately; empty stageBounds x/y sentinels are not visible positions. See sourceDisplayList/concatenatedApiDifferences and emptyStageBounds.',maskFiltersBlend='No mask/filter/non-normal blend in declared source closure'),
        inheritedBehavior='reference/monster2-body-attack-contract.json M2-01..09 unchanged; real HP unknown; Tween/hero scheduling belongs to 257B',
        unresolved=[u['id'] for u in unresolved])
    if approval:side['approval']=approval
    schema=read(ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json')
    jsonschema.validate(manifest,schema)
    for key,value in [('status','invalid'),('schemaVersion',0),('truthId','INVALID ID'),('stage',{}),('provenance',[])]:
        bad=copy.deepcopy(manifest);bad[key]=value
        try:jsonschema.validate(bad,schema)
        except jsonschema.ValidationError:pass
        else:raise AssertionError('Schema accepted invalid '+key)
    save(DEST,manifest,check);save(SIDE,side,check)
    report=dict(status=status,states=96,displayObjects=len(objects),collisionCases=392768,nativePhaseStates=10368,checkBindings=780,
                schemaCorruptionsRejected=5,manifestSha256=sha(DEST),sidecarSha256=sha(SIDE))
    save(OUT/'manifest-verification.json',report,check)
    print(json.dumps(report))


if __name__=='__main__':
    main()
