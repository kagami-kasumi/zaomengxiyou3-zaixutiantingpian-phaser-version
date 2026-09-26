"""Assemble bounded source inputs; promotion requires every declared evidence package."""
import json
import hashlib
import re
import sys

import jsonschema
from ui_truth import ROOT,BASE,OUT,read,sha,generate as generate_ui

DEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-228-pet-monkey-collision-phase.json'
REQUIRED=['body','callback','lifecycle','joint','cleanup','glow','fire','geometry','natural-collision','rebuilt-collision','aoyi-target','natural-display','dynamic-collision','hurt-natural','hurt-geometry','inherited-display']
MEASUREMENTS={'body':'body-air/measurement.json','callback':'callback-air/measurement.json','cleanup':'cleanup-air/measurement.json',
              'glow':'glow-air/measurement.json','fire':'fire-air/measurement.json','geometry':'geometry-air/measurement.json',
              'aoyi-target':'aoyi-target-air/measurement.json','inherited-display':'inherited-display-air/measurement.json'}


def reference(path,locator='/',**extra):
    return dict(path=path.relative_to(ROOT).as_posix(),sha256=sha(path),locator=locator,**extra)


def method(text,name):
    match=re.search(r'(?:override )?(?:public|protected|private) (?:static )?function '+re.escape(name)+r'\(',text)
    assert match,name
    start=match.start();opening=text.index('{',match.end());end=opening+1;depth=1
    while depth:depth+=(text[end]=='{')-(text[end]=='}');end+=1
    return text[start:end]


def assemble():
    unresolved=[];evidence={}
    natural,tree_report=generate_ui()
    (OUT/'natural-display-verification.json').write_text(json.dumps(tree_report,indent=2)+'\n')
    for name in REQUIRED:
        path=OUT/(name+'-verification.json')
        if not path.exists():unresolved.append('Missing bounded evidence: '+name);continue
        report=read(path);assert report['status'].startswith('passed'),(name,report['status'])
        assert not report.get('failures'),name
        if name=='dynamic-collision' and len(report.get('rejectedMutants',{}))<3:
            unresolved.append('Dynamic collision independent reference/lifecycle/mutation review pending')
        if name=='hurt-natural' and not report.get('nativeHost'):
            unresolved.append('HeroBeHurt natural host/geometry evidence pending; controlled nextFrame is insufficient')
        if name=='dynamic-collision':
            for row in report['measurements']:
                assert row['measurementSha256']==sha(BASE/f'dynamic-collision-air/{row["fps"]}/measurement.json')
        if name=='hurt-natural':
            for row in report['measurements']:
                assert row['measurementSha256']==sha(BASE/f'hurt-natural-air/{row["fps"]}/measurement.json')
        if name in MEASUREMENTS:
            assert report['measurementSha256']==sha(BASE/MEASUREMENTS[name]),name+' stale measurement'
        if name=='body':assert read(BASE/MEASUREMENTS[name])['inputsSha256']==sha(OUT/'body-inputs.json')
        if name=='inherited-display':
            observed=read(BASE/MEASUREMENTS[name])
            assert observed['otherSourceSha256']==sha(ROOT/'local-resources/regima/source/restored-swfs/assets/OtherMat1.swf')
            for record in observed['methods']:assert sha(ROOT/record['path'])==record['fileSha256']
        if name=='hurt-natural':
            for fps in [20,24,30]:
                observed=read(BASE/f'hurt-natural-air/{fps}/measurement.json')
                for record in observed['methods']:assert sha(ROOT/record['path'])==record['fileSha256']
        if name in ('lifecycle','joint'):
            for row in report['measurements']:
                assert row['sha256']==sha(BASE/f'{name}-air/measurement-{row["fps"]}.json')
        evidence[name]=reference(path,status=report['status'],scope=report.get('scope',report.get('limits',[])))
    rebuilt=read(OUT/'rebuilt-collision-verification.json')
    assert rebuilt['oracleSha256']==sha(BASE/'natural-collision-air/measurement.json')
    assert rebuilt['geometryInputsSha256']==sha(OUT/'geometry-inputs.json')
    assert rebuilt['builderSha256']==sha(ROOT/'tools/monkey-spatial/GeometryProbe.as')
    assert rebuilt['driverSha256']==sha(ROOT/'tools/monkey-spatial/CollisionGeometryRun.as.inc')
    assert rebuilt['cases']==349164 and rebuilt['hits']==65094
    source_defs=read(OUT/'source-definitions.json');sources=[]
    for s in source_defs['sources']:
        for field,hash_field in [('path','sha256'),('xmlPath','xmlSha256')]:
            path=ROOT/s[field];assert sha(path)==s[hash_field]
            sources.append(reference(path,locator='SymbolClass / recursive display definition closure'))
    for path in sorted(OUT.glob('*-methods.json')):
        document=read(path)
        if 'sourceSha256' in document:
            assert sha(ROOT/document.get('sourcePath',document.get('source')))==document['sourceSha256']
        for record in document['methods']:
            if 'fileSha256' in record:assert sha(ROOT/record['path'])==record['fileSha256'],record['path']
            if record['method']!='whole-class':
                source_path=record.get('path',record.get('source',document.get('sourcePath',document.get('source'))))
                code=method((ROOT/source_path).read_text(encoding='utf-8'),record['method'])
                assert hashlib.sha256(code.encode()).hexdigest()==record.get('sliceSha256',record.get('sha256')),(path.name,record['method'])
        sources.append(reference(path,locator='/methods'))
    behavior_path=ROOT/'docs/tasks/evidence/TASK-SETTINGS-227/behavior-contract.json'
    behavior=read(behavior_path);sources.append(reference(behavior_path,locator='/retainedContracts; /executedSources; /staticMethodInventory'))
    retained=[r for r in behavior['retainedContracts'] if r['family']=='monkey'];assert len(retained)==41
    contracts=[]
    for row in retained:
        original_path=ROOT/row['sourceTruth'];original=read(original_path)
        assert original['contractMatrix'][int(row['pointer'].split('/')[-1])]['id']==row['id']
        cid=row['id']
        selected=['227-retained']
        if cid.startswith(('owner.','visual.')):selected+=['body','geometry','natural-display']
        elif cid.startswith('monkey'):selected+=['callback','joint','lifecycle']
        if cid in ('monkey4.jgaoyi','monkey4.jgaoyi-chain'):selected+=['aoyi-target']
        if cid in ('runtime.projectile-collision','owner.collision'):selected+=['natural-collision','rebuilt-collision','dynamic-collision']
        if cid in ('runtime.hurt','runtime.death','runtime.destroy','runtime.p1-p2'):selected+=['cleanup','glow','fire','hurt-natural','hurt-geometry']
        contracts.append(dict(id=cid,sourceTruth=row['sourceTruth'],sourceTruthSha256=sha(original_path),pointer=row['pointer'],supplementEvidence=selected,implementationTask='TASK-SLICE-226'))
    evidence['227-retained']=reference(behavior_path,locator='/retainedContracts',status=behavior['status'])
    inventory_path=OUT/'hurt-inventory.json'
    if not inventory_path.exists():unresolved.append('Inherited display inventory not yet fully reconciled')
    else:
        evidence['inherited-inventory']=reference(inventory_path)
        if read(inventory_path)['status']!='verified-mapped':unresolved.append('Inherited inventory source ownership/callers require main-agent review')
    geometry=read(OUT/'geometry-inputs.json');body=read(OUT/'body-inputs.json')
    from additional_ui import generate as inherited_ui
    inherited=dict(ui=inherited_ui(),geometry=read(OUT/'hurt-geometry-inputs.json'),
                   nativeTimeline=[reference(BASE/f'hurt-natural-air/{fps}/measurement.json',locator='/rows; /hits; /methods') for fps in [20,24,30]],
                   hudInputs=read(BASE/'inherited-display-air/measurement.json')['fixtures'])
    body['bitmapSources']=read(OUT/'body-source.json')
    for bitmap in body['bitmapSources']['bitmaps']:
        assert sha(ROOT/bitmap['sourcePath'])==bitmap['sourceSha256']
    assert len(body['forms'])==4
    targets=[dict(symbol='ObjectBaseSprite',characterId=105,scaleX=1,monsterIds=[2,3,4,7,8,9,10,19]),
             dict(symbol='ObjectBaseSprite2',characterId=107,scaleX=1,monsterIds=[5,6,16]),
             dict(symbol='ObjectBaseSprite7',characterId=95,scaleX=.5,monsterIds=[30])]
    return dict(schemaVersion=1,truthId='task-settings-228.pet-monkey-collision-phase',taskId='TASK-SETTINGS-228',status='draft' if unresolved else 'verified',
        scope='Four monkey forms: source body callbacks, nine principal effects, inherited feedback/protection and target fire, sampled native host lifecycle/geometry/collision. Finite source fixtures, not whole-scene or modern implementation acceptance.',
        sources=sources,naturalDisplay=natural,inheritedDisplay=inherited,geometry=geometry,body=body,evidence=evidence,contractMatrix=contracts,
        hostSemantics=dict(
            phaseInput=reference(BASE/'joint-air/measurement-24.json',locator='/rows'),
            lifecycleInputs=[reference(BASE/f'lifecycle-air/measurement-{fps}.json',locator='/rows; /nativePhases') for fps in [20,24,30]],
            bodyTruth=reference(ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-193a-pet-monkey-animation.json'),
            bodyTruthUsage='Reuse body pixel cells/owners only; effect elapsed phases are supplied by 228 naturalDisplay and native host measurements, not a controlled restart atlas.',
            protectionOrder=['BBDC/movement','fatherCount decrement; clear isYourFather at -1','checkOver','curAddEffect.step; myGlow/cancelGlow'],
            followOrder='Collision invocation precedes source-follow delta/flip compensation; pause prevents TTL/collision but not follow compensation.',
            xj='PetMonkey1Bullet2 lives 4*frameClips nonpaused steps; source-hurt and terminal MovieClip frame do not end it.',
            pendingConstruction='Null native child getter may already draw first-frame source content; never substitute blank geometry.',
            collisionReduction='Original sequential red/white DIFFERENCE draw; original AIR getColorBoundsRect ignores a sole matching pixel at index zero. No collision tolerance.',
            aoyi='Strict 20<target.colipse.getBounds(scene.parent).x<920, source array order, no dead filter; int(random*length), second random<.5 selects x-50 else x+50. Empty round cancels; fallback retains curAttackTarget. Success does not teleport to owner.',
            targetFire='Buff holder owns FireBuff. Attacker destroy does not remove it. Refresh changes duration/startTime, retains original hurt. On expiry selected item may still damage in that same step.'),
        displayInventory=dict(body=[f['symbol'] for f in body['forms']],principalEffects=source_defs['sources'][0]['roots'],
                              attached=['FireBuff','HeroBeHurt with source ColorMatrixFilter','father GlowFilter','hpSlip','scene miss bitmap','scene pnum reused from 215'],targets=targets),
        completeness=dict(contractIds=[c['id'] for c in contracts],requiredEvidence=REQUIRED,unresolved=unresolved),
        consumerBoundary=dict(implementationTask='TASK-SLICE-226',runtimeDataPolicy='Required game data must be converted into tracked production assets; no runtime dependency on ignored evidence or local corpus.',
                              notProven=['arbitrary spatial coordinates beyond finite native fixtures','whole BaseMonster damage engine execution in these fixtures','modern damage/dedup/AI/runtime and five-stage P1/P2 acceptance']))


def main():
    data=assemble();schema=read(ROOT/'tools/monkey-spatial/manifest.schema.json')
    jsonschema.validate(data,schema)
    if '--verified' in sys.argv:assert data['status']=='verified',data['completeness']['unresolved']
    text=json.dumps(data,ensure_ascii=False,indent=2)+'\n'
    if '--check' in sys.argv:assert DEST.read_text(encoding='utf-8')==text,'Stale manifest'
    else:DEST.write_text(text,encoding='utf-8')
    print('228 manifest:',data['status'],';',len(data['contractMatrix']),'retained contracts;',len(data['completeness']['unresolved']),'unresolved')


if __name__=='__main__':main()
