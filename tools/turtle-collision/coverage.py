"""Independent expected native case set, recursive phases and target applicability."""
import copy
import gzip
import json
import re
from pathlib import Path
from run import ROOT,OUT,WORK,sha,save

FULL=WORK.parent/'full'
A=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'


def load(path):
    raw=path.read_bytes();return json.loads(gzip.decompress(raw) if path.suffix=='.gz' else raw)


def clock(n):return (n.get('frame',0),tuple(clock(c) for c in n['children']))


def verify(native,fixture,visual):
    errors=[]
    expected=set()
    for effect in fixture['effects']:
        states={s['tick']:clock(s['tree']) for s in visual['states'] if s['symbol']==effect['symbol']}
        representatives={}
        for tick,state in sorted(states.items()):representatives.setdefault(state,tick)
        if effect['sampleTicks']!=sorted(representatives.values()):errors.append('representatives:'+effect['symbol'])
        if fixture['phaseMap'][effect['symbol']]!={str(t):representatives[s] for t,s in states.items()}:errors.append('phase-map:'+effect['symbol'])
        for tick in representatives.values():
            for scale in effect['scales']:
                for sign in [1,-1]:
                    for target in range(3):
                        for case in fixture['cases']:expected.add(f"{effect['symbol']}-{tick}-s{scale}-d{sign}-t{target}-{case['id']}")
    ids=[r['id'] for r in native['cases']]
    if len(ids)!=len(set(ids)) or set(ids)!=expected:errors.append('case-set')
    clocks={(s['symbol'],s['tick']):clock(s['tree']) for s in visual['states']}
    tree_keys={(r['symbol'],r['tick']) for r in native['trees']}
    if tree_keys!={(s['symbol'],t) for s in fixture['effects'] for t in range(122)}:errors.append('clock-set')
    for row in native['trees']:
        if clock(row['tree'])!=clocks[(row['symbol'],row['tick'])]:errors.append('recursive-clock')
    fields={f['id']:f for f in native['fields']}
    for r in native['cases']:
        expected_field=f"{r['symbol']}-{r['tick']}-s{r['scale']}-d{r['sign']}"
        if r['field']!=expected_field or expected_field not in fields:errors.append('field-state')
        q=r['intersection'];a=r['targetBounds'];b=r['sourceBounds']
        left=max(a['x'],b['x']);top=max(a['y'],b['y'])
        width=min(a['x']+a['width'],b['x']+b['width'])-left
        height=min(a['y']+a['height'],b['y']+b['height'])-top
        expected_q=dict(x=left,y=top,width=width,height=height) if width>0 and height>0 else dict(x=0,y=0,width=0,height=0)
        if any(abs(q[k]-v)>1e-8 for k,v in expected_q.items()):errors.append('intersection')
        owner=r['fixture'].split('-')[0]
        if r['sourceRoot']!={'x':123.25 if owner=='P1' else 731.75,'y':345.75 if owner=='P1' else 412.25}:errors.append('owner')
    return sorted(set(errors))


def main():
    native=load(FULL/'measurement.json');fixture=load(OUT/'fixtures.json');visual=load(A/'effects-native.json.gz')
    assert sha(FULL/'fixtures.json')==sha(OUT/'fixtures.json')==native['fixturesSha256']
    assert sha(FULL/'Probe.as')==native['probeSha256']
    for path,digest in fixture['sourceHashes'].items():assert sha(ROOT/path)==digest
    assert sha(FULL/'source.swf')==fixture['sourceSubsetSha256']
    assert sha(FULL/'my/HitTest.as')==native['originalHitTestSha256']
    assert sha(ROOT/'local-resources/regima/source/unpacked/Adobe AIR/Versions/1.0/Adobe AIR.dll')==native['runtimeSha256']
    errors=verify(native,fixture,visual)
    targets=load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-218/collision-contract.json')
    catalog=(ROOT/'src/systems/MonsterDefinitionCatalog.ts').read_text(encoding='utf-8')
    ids=set(map(int,re.findall(r'monsterId:\s*(\d+)',catalog)))
    # The catalog may construct IDs positionally; its public record keys are authoritative.
    if not ids:ids=set(map(int,re.findall(r'^\s*(\d+):',catalog,re.M)))
    assert ids=={m['monsterId'] for m in targets['monsterMappings']},ids
    for m in targets['monsterMappings']:assert sha(ROOT/m['sourcePath'])==m['sourceSha256']
    mutations={}
    for name,change in {
        'missing-case':lambda d:d['cases'].pop(),
        'owner':lambda d:d['cases'][0]['sourceRoot'].update(x=0),
        'scale':lambda d:d['cases'][0].update(scale=2),
        'state':lambda d:d['cases'][0].update(tick=999),
        'intersection':lambda d:d['cases'][0]['intersection'].update(width=999),
        'recursive-phase':lambda d:d['trees'][0]['tree'].update(frame=999),
    }.items():
        mutant=copy.deepcopy(native);change(mutant);mutations[name]=bool(verify(mutant,fixture,visual))
    report=dict(status='passed' if not errors and all(mutations.values()) else 'failed',errors=errors,mutations=mutations,
                cases=len(native['cases']),fields=len(native['fields']),recursiveStates=len(native['trees']),
                representatives={e['symbol']:len(e['sampleTicks']) for e in fixture['effects']},
                targetIds=sorted(ids),targetMappings=targets['monsterMappings'],
                inputSha256={str(p.relative_to(ROOT)).replace('\\','/'):sha(p) for p in [FULL/'measurement.json',OUT/'fixtures.json',A/'effects-native.json.gz']},
                boundary='Target applicability and finite phase set only; dynamic callers, sampler pixels and family join have separate gates.')
    save(OUT/'coverage-verification.json',report)
    print(report['status'],report['cases'],report['recursiveStates'],errors,mutations)
    assert report['status']=='passed'


if __name__=='__main__':main()
