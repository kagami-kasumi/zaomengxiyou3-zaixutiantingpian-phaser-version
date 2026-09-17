"""Replay source caller collision observations against independently sampled fields."""
import gzip
import argparse
import json
import runpy
import numpy as np
from PIL import Image
import verify as sampler
from coverage import clock,load
from run import ROOT,OUT,WORK,sha,save


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--call-site',action='store_true');args=parser.parse_args()
    work=WORK.parent/('dynamic-call' if args.call_site else 'dynamic');sampler.WORK=WORK.parent/'full'
    actual=load(work/'collision-measurement.json');full=load(sampler.WORK/'measurement.json')
    dynamic=load(work/'measurement.json');bodies=load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/body-inputs.json')
    check=runpy.run_path(str(ROOT/'tools/turtle-visual/verify_dynamic.py'))['check']
    failures=check(dynamic,bodies);assert not failures,failures
    source=load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/dynamic-native.json.gz')
    # Observer insertion must preserve the established source actor/effect states.
    before={(r['id'],r['tick']):r for r in source['rows']}
    for row in dynamic['rows']:
        reference=before[(row['id'],row['tick'])]
        for key in ['hp','heroHp','action','direct','row','column','count','ready','bullets','events']:
            assert row[key]==reference[key],(row['id'],row['tick'],key)
    fields={r['id']:r for r in full['fields']};phase={}
    for t in full['trees']:phase.setdefault((t['symbol'],clock(t['tree'])),t['tick'])
    expected=set();ignored=[]
    if args.call_site:
        assert actual['stepInputs']
        for r in actual['stepInputs']:
            b=r['input']
            if b['ttl']==1 or not b['sourceAlive'] or (b['disabled'] and not b['secondary']):
                ignored.append(r);continue
            assert b['symbol']!='AoyiBuff'
            for target in range(3):
                for placement in ['center','disjoint','left-edge','phase']:
                    expected.add(f"{r['scenario']}-{r['tick']}-b{r['bulletIndex']}-t{target}-{placement}")
    else:
        for r in dynamic['rows']:
            for i,b in enumerate(r['bullets']):
                if b['dead'] or b['symbol']=='AoyiBuff':
                    ignored.append(dict(scenario=r['id'],tick=r['tick'],bulletIndex=i,reason='destroyed' if b['dead'] else 'non-attacking-buff'));continue
                for target in range(3):
                    for placement in ['center','disjoint','left-edge','phase']:
                        expected.add(f"{r['id']}-{r['tick']}-b{i}-t{target}-{placement}")
    assert len(actual['cases'])==len(expected)==len({r['id'] for r in actual['cases']})
    assert {r['id'] for r in actual['cases']}==expected
    diffs=[];booleans=[];pixels=0;positive=0;by_symbol={}
    for r in actual['cases']:
        tick=phase[(r['symbol'],clock(r['tree']))]
        r['field']=f"{r['symbol']}-{tick}-s{r['scale']}-d{r['sign']}"
        prediction=sampler.sample(r,fields)
        oracle=np.all(np.array(Image.open(work/'oracle'/(r['id']+'.png')).convert('RGB'))==[0,255,255],axis=2) if prediction.size else prediction
        assert bool(oracle.any())==r['actual']
        difference=int(np.count_nonzero(prediction!=oracle));pixels+=oracle.size;positive+=int(r['actual'])
        if difference:diffs.append(dict(id=r['id'],pixels=difference,field=r['field']))
        if bool(prediction.any())!=r['actual']:booleans.append(r['id'])
        stat=by_symbol.setdefault(r['symbol'],dict(cases=0,differentPixels=0));stat['cases']+=1;stat['differentPixels']+=difference
    save(work/'resolved-collision-measurement.json',actual)
    report=dict(status='passed' if not diffs else 'unresolved',cases=len(expected),callerStates=len(dynamic['rows']),
                sourceCallerUnchanged=True,pixels=pixels,positive=positive,differentPixels=sum(d['pixels'] for d in diffs),
                differentCases=len(diffs),booleanMismatches=len(booleans),examples=diffs[:20],bySymbol=by_symbol,
                nonAttackingStates=len(ignored),nativeSha256=sha(work/'collision-measurement.json'),
                sourceTraceSha256=sha(work/'measurement.json'),
                boundary='Native source visual/lifetime methods plus original HitTest observation. Source attack-id/settlement behavior remains the independent 221 computational trace; not full-game or modern-runtime reproduction.')
    report['observationPoint']='checkAttack-entry' if args.call_site else 'post-step'
    save(OUT/('dynamic-call-verification.json' if args.call_site else 'dynamic-verification.json'),report);save(work/'collision-differences.json',dict(pixel=diffs,boolean=booleans,notApplicable=ignored))
    print(json.dumps(report,indent=2));assert report['status']=='passed'


if __name__=='__main__':main()
