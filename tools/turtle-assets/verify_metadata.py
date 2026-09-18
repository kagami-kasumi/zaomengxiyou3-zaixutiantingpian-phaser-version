"""Independent source/state/owner/clock/mask completeness and mutation rejection."""
import copy
from common import ROOT, DEST, EVIDENCE, OUT, FAMILY, PROJECTION, MODES, load, sha, encode


def check_state(actual, source, trace, links):
    assert actual['nativeId']==source['id']
    assert actual['projectionLinks']==links
    assert actual['meta']==source.get('meta',{})
    assert actual['sourceTrace']==trace
    owners=source.get('groups',[source])
    assert len(actual['groups'])==len(owners)
    for group,owner in zip(actual['groups'],owners):
        assert group['ownerPath']==owner.get('path','root')
        assert group['depth']==owner.get('depth',0) and group['type']==owner.get('type')
        for field,units in [('paintParts',owner.get('paintParts',[owner])),('components',owner.get('components',[]))]:
            assert len(group[field])==len(units)
            for part,unit in zip(group[field],units):
                layer=unit.get('canonical') or unit['primary'].get('canonical') or unit['primary']
                assert part['image']==layer['sha256']
                assert part['origin']==layer['origin'] and part['empty']==layer['empty']
                assert (part['width'],part['height'])==(layer['width'],layer['height'])
                assert part['sourcePath']==unit.get('path','root') and part['type']==unit.get('type')
                assert part['sourceCapture']['primary']==unit['primary']
                assert part['sourceCapture']['expanded']==unit['expanded']


def check_fields(actual, expected):
    assert len(actual)==len(expected)
    assert {f['id']:f for f in actual}=={f['id']:f for f in expected}


def main():
    manifest=load(DEST/'manifest.json');family=load(FAMILY);projection=load(PROJECTION)
    assert family['status']==projection['status']=='verified'
    for path,digest in manifest['sourceHashes'].items():assert sha(ROOT/path)==digest
    provenance={p['sourcePath']:p['sha256'] for p in projection['provenance']}
    links_by_state={}
    for link in load(EVIDENCE/'TASK-SETTINGS-225/projection-links.json')['links']:
        links_by_state.setdefault(link['stateId'],[]).append(link)
    assert manifest['contracts']==family['contractMatrix'] and len(manifest['contracts'])==32
    assert {c['contractId'] for c in manifest['contracts']}==set(family['completeness']['declaredContractIds'])
    profile_names={p['symbol'] for p in family['collisionProfiles']}
    for contract in manifest['contracts']:
        assert contract['visualUnits'] and contract['futureConsumer'] and contract['consumerStatus']
        collision_contract=contract['collision']
        if collision_contract['status']=='verified-finite-fixtures':
            assert collision_contract['profiles'] and set(collision_contract['profiles'])<=profile_names
        else:
            assert collision_contract['status'].startswith('not-applicable') and collision_contract['reason']
    assert manifest['bodyAnimations']==load(EVIDENCE/'TASK-SETTINGS-222A/body-inputs.json')['forms']
    assert manifest['visualException']['tuples']==load(EVIDENCE/'TASK-SETTINGS-225/diagnostics/exact-unresolved-pixels.json')
    expected=set(s['id'] for s in projection['states']);observed=[];mutation_fixture=None
    for mode in MODES:
        path=EVIDENCE/'TASK-SETTINGS-225'/(mode+'-resources.json.gz')
        assert sha(path)==provenance[path.relative_to(ROOT).as_posix()]
        source=load(path);package=load(DEST/(mode+'.json.gz'))
        assert package['sourceSha256']==sha(path)
        assert sha(DEST/(mode+'.json.gz'))==manifest['packages'][mode]['sha256']
        original=load(ROOT/source['sourceCorpus'])
        if mode=='body':refs={r['id']:r for r in original['cells']}
        elif mode=='effects':refs={b['id']:dict(tree=r['tree'],root=b['root'],tick=r['tick'],symbol=r['symbol'],scale=b['scale'],sign=b['sign']) for r in original['states'] for b in r['baselines']}
        else:refs={r['id']+'-'+str(r['tick']):r for r in original['rows']}
        assert len(package['states'])==len(source['rows'])
        for actual,row in zip(package['states'],source['rows']):
            trace={k:v for k,v in refs[row['id']].items() if k not in ('capture','captureSha256','originalCapturePath','file','sha256')}
            check_state(actual,row,trace,links_by_state[actual['id']])
            if mode in ('dynamic','buff'):
                assert actual['timing']==dict(fixtureId=trace['id'],hostTick=trace['tick'],phase=original['phase'],
                    action=trace['action'],direct=trace['direct'],row=trace['row'],column=trace['column'],
                    count=trace['count'],events=trace['events'])
            observed.append(actual['id'])
            if mode=='effects' and mutation_fixture is None:mutation_fixture=(actual,row,trace,links_by_state[actual['id']])
    assert len(observed)==len(set(observed))==11572 and set(observed)==expected
    actual,row,trace,links=mutation_fixture
    mutations={
        'state':lambda r:r.update(nativeId='deleted-state'),
        'owner':lambda r:r['groups'][0].update(ownerPath='wrong-owner'),
        'source':lambda r:r['groups'][0]['paintParts'][0].update(image='wrong-hash'),
        'scale':lambda r:r['meta'].update(scale=99),
        'timing':lambda r:r['sourceTrace'].update(tick=999),
        'mask':lambda r:r['sourceTrace']['tree'].update(mask='wrong-mask'),
        'registration':lambda r:r['groups'][0]['paintParts'][0]['origin'].update(x=-999),
        'missing-frame':lambda r:r['groups'].clear(),
        'missing-layer':lambda r:r['groups'][0]['paintParts'].clear(),
        'link':lambda r:r['projectionLinks'].clear(),
    }
    killed=[]
    for name,change in mutations.items():
        candidate=copy.deepcopy(actual);change(candidate)
        try:check_state(candidate,row,trace,links)
        except (AssertionError,KeyError):killed.append(name)
        else:raise AssertionError('Surviving mutation '+name)
    collision=load(DEST/'collision.json.gz')
    fields=[f for p in family['collisionProfiles'] for f in p['fields']]
    check_fields(collision['fields'],fields)
    for name,change in [('missing-field',lambda x:x.pop()),('collision-size',lambda x:x[0].update(width=-1))]:
        candidate=copy.deepcopy(collision['fields']);change(candidate)
        try:check_fields(candidate,fields)
        except AssertionError:killed.append(name)
        else:raise AssertionError('Surviving mutation '+name)
    source_target=family['sharedRuntime']['targetContract']
    assert collision['monsterTargets']==dict(symbols=source_target['symbols'],mappings=source_target['monsterMappings'])
    assert collision['petColipse']['owners']==family['owners']
    assert collision['profiles']==[{k:p[k] for k in ('symbol','characterId','scales','sampleTicks','sourceOwner','fixture')} for p in family['collisionProfiles']]
    display=load(DEST/'display.json.gz')
    assert display['sourceDisplayObjects']==family['visualTruth']['manifest']['displayObjects']
    assert display['projectionDisplayObjects']==projection['displayObjects']
    assert {o['sourceIdentity']['symbolClass'] for o in collision['petColipse']['displayObjects']}=={'ObjectBaseSprite','ObjectBaseSprite3','ObjectBaseSprite4'}
    (OUT/'metadata-verification.json').write_bytes(encode(dict(status='passed',states=len(observed),contracts=32,
        killedMutations=killed,manifestSha256=sha(DEST/'manifest.json'))))
    print('metadata passed:',len(observed),'states;',len(killed),'mutations')


if __name__=='__main__':main()
