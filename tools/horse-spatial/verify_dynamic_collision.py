"""Native dynamic intersections plus independent source transition model."""
import copy
import json
import sys
from prepare_lifecycle import ROOT,OUT
from run_lifecycle import sha
from verify_lifecycle import check

BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229'

def inspect(data):
    specs={s['id']:s for s in data['fixtures']['effects']};failures=[];hits=far=steps=0
    for row in data['rows']:
        if row['phase']!='enter':continue
        steps+=1;clean=copy.deepcopy(row)
        for part in ('before','state'):
            for call in clean[part]['calls']:
                call.pop('hit',None);call.pop('reference',None)
        fields=check(clean,specs[row['id'].split('-')[0]])
        for call in row['state']['calls']:
            if call['kind']!='attack':continue
            if call['hit']!=call['reference']:fields.append('native-reference')
            if row['collisionTarget']['far']:
                far+=1
                if call['hit']:fields.append('far-hit')
            hits+=int(call['hit'])
        if fields:failures.append(dict(id=row['id'],tick=row['tick'],fields=sorted(set(fields))))
    return failures,dict(steps=steps,hits=hits,farCalls=far)

def main():
    mutation=sys.argv[1] if len(sys.argv)>1 else None
    assert mutation in (None,'tracked-identity','after-follow','skip-paused-follow','wrong-class')
    failures=[];files=[];totals=dict(steps=0,hits=0,farCalls=0)
    for fps in ([20] if mutation else [20,24,30]):
        folder=BASE/(f'dynamic-mutation-{mutation}/{fps}' if mutation else f'dynamic-collision-air/{fps}')
        path=folder/'measurement.json';data=json.loads(path.read_text());assert data['environment'][0]['fps']==fps
        assert len(data['rows'])==208*(1+2*(fps*10+8))
        bad,counts=inspect(data);failures += [dict(fps=fps,**r) for r in bad]
        for key in totals:totals[key]+=counts[key]
        files.append(dict(fps=fps,sha256=sha(path),compiledSha256=data['compiledSwfSha256']))
    report=dict(status='failed' if failures else 'passed-bounded',mutation=mutation,**totals,failures=failures,measurements=files,
        scope='Original bullet lifecycle and original native target shapes, target center/far alternation, independent native color reduction and source transition model. Collision entry is instrumented instead of settlement. Mutant runs compile actual changed identity/follow/pause code; ordinary positives do not prove autonomous acquisition or HP damage.')
    (OUT/(f'dynamic-mutation-{mutation}.json' if mutation else 'dynamic-collision-verification.json')).write_text(json.dumps(report,indent=2)+'\n')
    print('229 dynamic',mutation or 'normal',totals,'failures',len(failures),failures[:2])
    assert not failures and totals['hits']>0 and totals['farCalls']>0

if __name__=='__main__':main()
