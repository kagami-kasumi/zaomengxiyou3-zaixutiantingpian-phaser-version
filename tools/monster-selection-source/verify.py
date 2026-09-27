"""Verify complete 239 evidence and publish a small reusable behavior contract."""
import copy
import hashlib
import json
from pathlib import Path
import sys
import capture
from fixtures import cases, verify

ROOT=capture.ROOT
OUT=capture.OUT
DEST=ROOT/'docs/reverse-engineering/reference/monster-target-selection-contract.json'


def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()


def read(p):return json.loads(p.read_text(encoding='utf-8-sig'))


def main():
    baseline=read(OUT/'selection.json');counts=verify(baseline)
    verification=read(OUT/'selection-verification.json')
    assert verification['status']=='passed' and verification['cases']==counts
    assert verification['baselineSha256']==sha(OUT/'selection.json')
    assert [r['name'] for r in verification['mutations']]==capture.MUTATIONS
    for name in [None,*capture.MUTATIONS]:
        path=OUT/((name or 'selection')+'.json');record=read(path)
        work,sources=capture.prepare(name)
        assert record['sources']==sources
        assert record['generatedHashes']=={p.name:sha(p) for p in work.glob('*.as')},name
        assert record['swfSha256']==sha(work/'Probe.swf')
        for row in record['sources']:assert sha(ROOT/row['path'])==row['fileSha256']
        if name:
            row=next(r for r in verification['mutations'] if r['name']==name)
            assert sha(path)==row['sha256'] and row['changed']>0
            assert row['changed']==sum(a!=b for a,b in zip(record['rows'],baseline['rows']))
            try:verify(record)
            except AssertionError:pass
            else:raise AssertionError(name+' survived')
    corrupted=[]
    for label,mutate in [('wrong-target',lambda r:r['rows'][0].__setitem__('target','invalid')),
                          ('missing-row',lambda r:r['rows'].pop()),
                          ('reverse-candidates',lambda r:r['rows'][0].__setitem__('candidates',['p2','p1'])),
                          ('wrong-id',lambda r:r['rows'][0].__setitem__('id','other'))]:
        bad=copy.deepcopy(baseline);mutate(bad)
        try:verify(bad)
        except AssertionError:corrupted.append(label)
        else:raise AssertionError(label)
    profile=read(OUT/'profiles.json');audit=read(OUT/'input-audit.json');consumer=read(OUT/'consumer-inputs.json')
    assert profile['status']==audit['status']=='passed'
    assert len(profile['profiles'])==180 and audit['prior231Cases']==264
    profile_set={(r['monsterId'],r['stage'],r['level'],r['fps']) for r in profile['profiles']}
    assert profile_set=={(r['monsterId'],s,l,f) for r in audit['profiles'] for s,l in [(1,1),(1,2),(1,3),(2,1),(2,2)] for f in [20,24,30]}
    for r in profile['profiles']:assert r['alertRange']==next(a['alertRange'] for a in audit['profiles'] if a['monsterId']==r['monsterId'])
    assert consumer['cases']==len(consumer['rows'])==240
    assert {str(r['level']) for r in consumer['rows']}=={'11','12','13','21','22','sandbox'}
    for r in consumer['sources']:assert sha(ROOT/r['path'])==r['sha256']
    for r in audit['sources']:assert sha(ROOT/r['path'])==r['fileSha256']
    for r in profile['methods']:assert sha(ROOT/r['path'])==r['fileSha256']
    for r in profile['inputs']:assert sha(ROOT/r['path'])==r['sha256']
    for path,h in profile['generatedHashes'].items():assert sha(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-239/profiles'/path)==h
    geo=audit['reusedGeometry'];assert sha(ROOT/geo['path'])==geo['sha256']
    output=dict(schemaVersion=1,contractId='task-settings-239.monster-target-selection',status='verified-bounded-behavior',
                scope='Current twelve types, normal five levels/TestScene, at most hero1/hero2. Selection/inputs only; not full AI/movement/XP production acceptance.',
                generatedBy='python tools/monster-selection-source/verify.py',
                profiles=audit['profiles'],candidateOrder=['p1','p2'],candidateEligibility='object exists and not isDead; no isReadyToDestroy filter in Config.getPlayerArray',
                selection=dict(distance='Math.sqrt(dx*dx + dy*dy), dx=hero.x-monster.x, dy=hero.y-monster.y',
                    sorting='AS3 sort(Array.RETURNINDEXEDARRAY) without NUMERIC, then indexOf(0) back into original candidate list',
                    twoCandidateEquivalent='Compare default decimal Number strings lexicographically; equal distances retain p1. Empty=>none, single=>that hero.',
                    alert='Check chosen candidate distance <= actual alertRange AFTER selection; do not prefilter candidates by range.',
                    lifecycle='Retain live current target; dead target clears without same-call reselection; tail clears dead/readyToDestroy even if AI blocked. Original hurt/debuff gate and effects->AI->tail phase retained by 231.'),
                rootMapping=audit['rootMapping'],reusedGeometry=geo,sourceBindings=audit['sources'],
                fixtures=[dict(**fixture,observed=actual['target']) for fixture,actual in zip(cases(),baseline['rows'])],
                evidence=dict(selectionCases=counts,constructorCases=180,consumerProjectionCases=240,retained231Cases=264,
                    mutations=verification['mutations'],corruptionRejections=corrupted,
                    reports=[dict(path=p.relative_to(ROOT).as_posix(),sha256=sha(p)) for p in [OUT/'selection.json',OUT/'profiles.json',OUT/'input-audit.json',OUT/'consumer-inputs.json']]),
                tools=[dict(path=p.relative_to(ROOT).as_posix(),sha256=sha(p)) for p in sorted(Path(__file__).parent.glob('*')) if p.suffix in ['.py','.as']]+[dict(path='tools/monster-selection-consumer-inputs.ts',sha256=sha(ROOT/'tools/monster-selection-consumer-inputs.ts'))],
                exclusions=['More than two candidates, unknown external/non-finite coordinates, other monster types and endless mode.',
                    'New hero/monster movement physics, exact historical spawn positions or visual/BBDC registration offsets.',
                    'Whole original game playback and modern five-level attacks/rewards/save/load: left to 238.'],unresolved=[])
    text=json.dumps(output,ensure_ascii=False,indent=2)+'\n'
    if '--check' in sys.argv:assert DEST.read_text(encoding='utf-8')==text
    else:DEST.write_text(text,encoding='utf-8',newline='\n')
    (OUT/'verification.json').write_text(json.dumps(dict(status='passed',selectionCases=counts,constructorCases=180,consumerCases=240,sourceMutations=len(capture.MUTATIONS),corruptionRejections=corrupted,contractSha256=sha(DEST)),indent=2)+'\n',encoding='utf-8')
    print('239 complete bounded evidence passed:', counts,'selection, 180 constructor, 240 producer, 9 source mutation, 4 corruption cases')


if __name__=='__main__':main()
