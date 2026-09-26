"""Assemble horse-only source truth after all declared bounded gates pass."""
import hashlib
import json
import sys
import jsonschema
from ui_truth import ROOT, BASE, OUT, read, sha, generate as ui
from prepare_lifecycle import SRC, take
from inherited_reuse import generate as inherited

DEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-229-pet-horse-collision-phase.json'
REQUIRED=['callback','lifecycle','joint','geometry','natural-collision','rebuilt-collision','dynamic-collision','ice','explosion','targeting','cleanup','natural-display','inherited-reuse']


def reference(path,locator='/',**extra):
    return dict(path=path.relative_to(ROOT).as_posix(),sha256=sha(path),locator=locator,**extra)


def assemble():
    natural,tree=ui();reuse,shared=inherited()
    for name,data in [('natural-display',tree),('inherited-reuse',reuse)]:
        assert read(OUT/(name+'-verification.json'))==data,name+' stale proof'
    evidence={};sources=[]
    for name in REQUIRED:
        path=OUT/(name+'-verification.json');report=read(path)
        assert report['status'].startswith('passed') and not report.get('failures'),name
        for key in ('fieldMutationsRejected','mutationsRejected'):
            assert all(report.get(key,{}).values()),(name,key)
        for record in report.get('measurements',[]):
            measurement=BASE/(f'dynamic-collision-air/{record["fps"]}/measurement.json' if name=='dynamic-collision' else f'{name}-air/measurement-{record["fps"]}.json')
            assert sha(measurement)==record['sha256'],(name,'stale measurement')
        if name in ['callback','geometry','natural-collision']:
            assert report['measurementSha256']==sha(BASE/f'{name}-air/measurement.json')
        evidence[name]=reference(path,status=report['status'],scope=report.get('scope','Recursive source trees and UI Schema'))
    for mode in ['tracked-identity','after-follow','skip-paused-follow','wrong-class']:
        path=OUT/f'dynamic-mutation-{mode}.json';report=read(path)
        assert report['status']=='failed' and report['failures'] and report['steps']>0
        assert report['measurements'][0]['sha256']==sha(BASE/f'dynamic-mutation-{mode}/20/measurement.json')
        evidence['mutation-'+mode]=reference(path,status='rejected-actual-compiled-mutant',scope=report['scope'])
    rebuilt=read(OUT/'rebuilt-collision-verification.json')
    assert rebuilt['cases']==387960 and rebuilt['hits']==41718
    assert rebuilt['oracleSha256']==sha(BASE/'natural-collision-air/measurement.json')
    assert rebuilt['geometryInputsSha256']==sha(OUT/'geometry-inputs.json')
    assert rebuilt['builderSha256']==sha(BASE/'geometry-air/GeometryProbe.as')
    definitions=read(OUT/'source-definitions.json')
    for record in definitions['sources']:
        assert sha(ROOT/record['path'])==record['sha256']
        assert sha(ROOT/record['xmlPath'])==record['xmlSha256']
        sources.append(reference(ROOT/record['path'],locator='SymbolClass / exact recursive definition closure'))
    for path in sorted(OUT.glob('*-methods.json')):
        doc=read(path)
        if 'sourceSha256' in doc:assert sha(ROOT/doc['source'])==doc['sourceSha256']
        for record in doc.get('methods',[]):
            source=ROOT/record.get('path',record.get('source',doc.get('source','')))
            if 'fileSha256' in record:assert sha(source)==record['fileSha256']
            name=record.get('method','destroy')
            if name!='whole-class':assert hashlib.sha256(take(source,name).encode()).hexdigest()==record.get('sliceSha256',record.get('sha256'))
        sources.append(reference(path,locator='/methods; original method hashes and fixture boundaries'))
    behavior_path=ROOT/'docs/tasks/evidence/TASK-SETTINGS-227/behavior-contract.json';behavior=read(behavior_path)
    evidence['227-retained']=reference(behavior_path,locator='/retainedContracts; /executedSources; /staticMethodInventory; /targetAcquisition',status=behavior['status'])
    for record in behavior['executedSources']+behavior['staticMethodInventory']:
        assert sha(ROOT/record['path'])==record['fileSha256']
    contracts=[]
    for row in behavior['retainedContracts']:
        if row['family']!='horse':continue
        path=ROOT/row['sourceTruth'];original=read(path)
        assert original['contractMatrix'][int(row['pointer'].split('/')[-1])]['id']==row['id']
        selected=['227-retained'];cid=row['id']
        if cid.startswith(('owner.','visual.')):selected+=['geometry','natural-display','inherited-reuse']
        if cid.startswith('horse'):selected+=['callback','joint','lifecycle']
        if 'tmaoyi' in cid:selected+=['targeting','explosion','cleanup']
        if cid in ('runtime.projectile-collision','owner.collision'):selected+=['natural-collision','rebuilt-collision','dynamic-collision']
        if cid in ('runtime.hurt','runtime.death','runtime.destroy','runtime.p1-p2'):selected+=['cleanup','ice','inherited-reuse']
        if 'ice' in cid:selected+=['ice']
        contracts.append(dict(id=cid,sourceTruth=row['sourceTruth'],sourceTruthSha256=sha(path),pointer=row['pointer'],supplementEvidence=selected,implementationTask='TASK-SLICE-226'))
    assert len(contracts)==43 and len({r['id'] for r in contracts})==43
    inventory=read(OUT/'family-inventory.json');body=read(OUT/'body-inputs.json');body['bitmapSources']=read(OUT/'body-source.json')
    for bitmap in body['bitmapSources']['bitmaps']:assert sha(ROOT/bitmap['sourcePath'])==bitmap['sourceSha256']
    for record in inventory['creationSites']+inventory['attachments']:
        path=ROOT/record['path'];assert sha(path)==record['sourceSha256']
        assert hashlib.sha256(take(path,record['method']).encode()).hexdigest()==record['sliceSha256']
    body_truth=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-193c-pet-horse-animation.json'
    sources += [reference(body_truth),reference(OUT/'family-inventory.json')]
    caller=SRC/'base/BaseMonster.as';code=take(caller,'beMagicAttack');assert 'this.curAddEffect.cancelAllEffect();' in code
    targets=[dict(symbol='ObjectBaseSprite',characterId=105,scaleX=1,monsterIds=[2,3,4,7,8,9,10,19]),dict(symbol='ObjectBaseSprite2',characterId=107,scaleX=1,monsterIds=[5,6,16]),dict(symbol='ObjectBaseSprite7',characterId=95,scaleX=.5,monsterIds=[30])]
    return dict(schemaVersion=1,truthId='task-settings-229.pet-horse-collision-phase',taskId='TASK-SETTINGS-229',status='verified',
        scope='Four horse forms, ten principal effects, AoyiBuff and ice, bounded original native host/geometry/collision. Shared inherited display is exact-source reuse; whole-scene and modern acceptance remain 226.',
        sources=sources,naturalDisplay=natural,inheritedDisplay=shared,geometry=read(OUT/'geometry-inputs.json'),body=body,evidence=evidence,contractMatrix=contracts,
        hostSemantics=dict(phaseInput=reference(BASE/'joint-air/measurement-24.json',locator='/rows'),lifecycleInputs=[reference(BASE/f'lifecycle-air/measurement-{fps}.json',locator='/rows; /nativePhases') for fps in [20,24,30]],
            bodyTruth=reference(body_truth),bodyTruthUsage='Reuse original body pixels/owners; host callback holds are source BBDC, independent of effect movie timelines.',
            followOrder='Collision before source-follow delta/flip; pause blocks TTL/collision but not follow compensation. Horse1 sp is Follow with hurt cutoff; Horse2 sp is Special with the same symbol. All bd Follow disables hurt cutoff.',
            pendingConstruction='Pending native children already render first-frame source geometry; root-frame equality does not identify nested phase.',
            collisionReduction='Original sequential red/white DIFFERENCE; native getColorBoundsRect skips a sole pixel at index zero. Exact source masks and RGBA, no tolerance.',
            aoyi='Reverse entire source target array, no alive prefilter; x=pet.x+(N/2-index)*90, y=50. Learned sp attaches target but initial speedx=0, vertical tracking step is +/-9. Dead target clears on first step.',
            ice='Learned bd adds pethorse_ice for 2.4*frameClips. Holder owns attachment sized to colipse. Deduplicated show freezes BBDC; explicit cancellation/expiry removes and resumes. Direct BaseAddEffect.destroy does not hide horse ice.',
            targetDeathCaller=dict(**reference(caller,locator='beMagicAttack, lines 1321-1331'),derivation='Static original dead branch calls cancelAllEffect; 229 executes that callee separately, not the entire damage method.'),
            explosion='bz creates explosion on successful hit; with bd uses original TweenMax delayedCall(1) in wall-clock seconds. Callback reads retained bullet coordinates and tests parent.isDead only; ready/live destroy does not cancel it.',
            cleanup='Original BasePet.destroy clears BBDC, parent effect helper, private bullets and owner, then native one-second fade removes parent. Already-dead delayed callbacks create nothing. Surviving other owners are independent.'),
        displayInventory=dict(body=[f['symbol'] for f in body['forms']],principalEffects=inventory['expectedPrimarySymbols'],creationSites=inventory['creationSites'],attached=['AoyiBuff','PetHorseIceEffect','HeroBeHurt','father GlowFilter','hpSlip','miss','pnum'],targets=targets),
        completeness=dict(contractIds=[c['id'] for c in contracts],requiredEvidence=REQUIRED,unresolved=[]),
        consumerBoundary=dict(implementationTask='TASK-SLICE-226',runtimeDataPolicy='Convert needed source geometry to tracked production data; ignored evidence and source corpus are never runtime dependencies.',notProven=['arbitrary spatial coordinates beyond finite native fixtures','whole BaseMonster damage/HP/death caller execution','live replacement caller reachability for delayed post-destroy creation','modern AI/dedup/damage and five-stage/TestScene P1/P2 acceptance']))


def main():
    data=assemble();schema=read(ROOT/'tools/horse-spatial/manifest.schema.json');jsonschema.validate(data,schema)
    text=json.dumps(data,ensure_ascii=False,indent=2)+'\n'
    if '--check' in sys.argv:assert DEST.read_text(encoding='utf-8')==text,'Stale manifest'
    else:DEST.write_text(text,encoding='utf-8')
    print('229 manifest:',data['status'],'; 43 retained contracts;',len(data['naturalDisplay']['states']),'states')


if __name__=='__main__':main()
