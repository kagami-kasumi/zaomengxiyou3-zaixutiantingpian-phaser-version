"""Independent expectations for original executable numeric/producer slices."""
import copy
import hashlib
import json

ALIASES={'remote-pet-sync-decrease':'remote-pet-decrease-on-start',
         'remote-pet-sync-same':'remote-pet-same-no-display',
         'remote-pet-sync-not-started':'remote-pet-before-start-no-display'}
def check(report,fixtures):
    cases=report['measurements'];byid={f['id']:f for f in fixtures['fixtures']}
    assert len(cases)==22 and len({c['id'] for c in cases})==22
    matched=[]
    for case in cases:
        cid=case['id'];fid=ALIASES.get(cid,cid)
        if cid=='remote-pet-reduce-no-display':
            assert case['pnumValues']==[] and case['petHpAfter']==90
            continue
        assert fid in byid,cid
        f=byid[fid];expected=f['expected'];matched.append(fid)
        if isinstance(expected.get('pnumValues'),list):assert case['pnumValues']==expected['pnumValues'],cid
        if cid=='hero-petturtle-transfer':
            assert case['pnumValues']==[expected['petDamage'],expected['heroDamageAfterTransfer']]
            assert case['hpBefore']-case['hpAfter']==expected['heroDamageAfterTransfer']
            assert case['petHpBefore']-case['petHpAfter']==expected['petDamage']
        elif not cid.startswith('remote-'):
            for key in ['hpAfter','petHpAfter']:
                if key in expected:assert case[key]==expected[key],cid
            if isinstance(expected.get('hpDelta'),(int,float)):assert case['hpAfter']-case['hpBefore']==expected['hpDelta'],cid
            if 'petHpDelta' in expected:assert case['petHpAfter']-case['petHpBefore']==expected['petHpDelta'],cid
        else:
            if cid=='remote-reduce-no-local-display':assert case['hpAfter']==90
            elif cid=='remote-sync-reordered-explicit-sequence':assert case['syncedHp']==expected['hpSequence'][-1]
            elif 'newHp' in f['input']:assert case['syncedHp']==f['input']['newHp'],cid
            elif 'newPetHp' in f['input']:assert case['syncedPetHp']==f['input']['newPetHp'],cid
        # Source callback order and target coordinates are distinct from HP state and values.
        for i,call in enumerate(case['calls']):
            pet=(cid.startswith(('pet-','remote-pet-')) or (cid=='hero-petturtle-transfer' and i==0))
            assert call==dict(value=case['pnumValues'][i],x=280,y=370 if pet else 290,stride=20,family='pnum'),cid
        assert len(case['calls'])==len(case['pnumValues'])
    return matched
def verify(root,fixtures,self_test=False):
    path=root/'docs/tasks/evidence/TASK-SETTINGS-215/behavior-native/measurement.json'
    report=json.loads(path.read_text(encoding='utf-8'))
    sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
    assert report['exitCode']==0
    assert report['probeSha256']==sha(root/'tools/incoming-number/BehaviorProbe.as')
    assert report['prepareSha256']==sha(root/'tools/incoming-number/prepare_behavior.py')
    assert report['runtimeSha256']==sha(root/'local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll')
    for s in report['sourceSlices']:
        source=root/s['path'];assert sha(source)==s['sha256']
        full=source.read_text(encoding='utf-8')
        if 'startMarker' in s:
            a=full.index(s['startMarker']);b=full.index(s['endMarker'],a)
            assert hashlib.sha256(full[a:b].encode()).hexdigest()==s['sliceSha256']
    ids=check(report,fixtures)
    if self_test:
        mutations=[('value',0),('count',6),('owner',5),('hpClamp',1),('shieldResidual',4),('transfer',5)]
        for label,index in mutations:
            bad=copy.deepcopy(report);c=bad['measurements'][index]
            if label=='count':c['pnumValues']=c['pnumValues'][:1]
            elif label=='owner':c['calls'][0]['y']=290
            elif label=='hpClamp':c['hpAfter']=-15
            else:c['pnumValues'][-1]+=1
            try:check(bad,fixtures)
            except AssertionError:continue
            raise AssertionError('native behavior mutation escaped: '+label)
        print('6 native behavior value/count/owner/clamp/shield/transfer mutations rejected')
    return dict(measurementPath=path.relative_to(root).as_posix(),sha256=sha(path),matchedFixtureIds=ids,
        supplementaryCaseIds=['remote-pet-reduce-no-display'],measurements=report['measurements'],
        sourceSlices=report['sourceSlices'],scope=report['scope'],excluded=report['excluded'])
