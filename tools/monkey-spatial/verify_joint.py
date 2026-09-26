"""Check source creation against independent host schedules and native phase atlas."""
import hashlib
import json
import re
import runpy
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def phases(node):
    result=[node['frame']] if 'frame' in node else []
    for child in node['children']:result+=phases(child)
    return result


def main():
    expectation=runpy.run_path(str(ROOT/'tools/monkey-spatial/verify_callbacks.py'))['expected']
    mutation=sys.argv[1] if len(sys.argv)>1 else None
    assert mutation in (None,'phase','owner','birth','layer')
    mapping={1:{'doHit1':'PetMonkey1Bullet1','doHit2':'PetMonkey1Bullet2'},
             2:{'doHit1':'PetMonkey2Bullet1','doHit2_1':'PetMonkey2Bullet2_1','doHit2_2':'PetMonkey2Bullet2_2','doHit3':'PetMonkey1Bullet2'},
             3:{'doHit1':'PetMonkey3Bullet1','doHit2':'PetMonkey3Bullet2','doHit3':'PetMonkey1Bullet2','doHit4_1':'PetMonkey3Bullet3_1','doHit4_2':'PetMonkey3Bullet3_2'}}
    mapping[4]=mapping[3]
    failures=[];total=0;birth_count=0;files=[]
    for fps in [20,24,30]:
        path=BASE/f'joint-air/measurement-{fps}.json';data=json.loads(path.read_text())
        baseline=json.loads((BASE/f'lifecycle-air/measurement-{fps}.json').read_text())
        atlas={(r['state']['symbol'],r['tick'],r['phase']):r['state']['phaseFrames'] for r in baseline['rows'] if r['id'].endswith('-P1-1-natural')}
        if mutation:
            row=next(r for r in data['rows'] if r['phase']=='enter' and any(not b['dead'] and (mutation!='layer' or b['disabled']) for b in r['bullets']))
            bullet=next(b for b in row['bullets'] if not b['dead'] and (mutation!='layer' or b['disabled']))
            if mutation=='phase':bullet['phaseFrames'][0]+=1
            if mutation=='owner':bullet['owner']='P99'
            if mutation=='birth':bullet['birthTick']+=1
            if mutation=='layer':bullet['depth']=row['actorDepth']+1
        assert data['environment'][0]['fps']==fps
        files.append(dict(fps=fps,sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
        groups={}
        for row in data['rows']:groups.setdefault(row['id'],[]).append(row)
        assert len(groups)==42
        for identity,rows in groups.items():
            match=re.fullmatch(r'(\d)-(hit\d)-P(\d)-(-?\d+)',identity)
            form,owner,skills=int(match[1]),match[3],int(match[4])
            expected=[(tick,mapping[form][name]) for tick,name in expectation(dict(form=form,action=match[2],skills=skills,noTarget=False,hurt=False,local=True))]
            births=[]
            for row in rows:
                for bullet in row['bullets']:
                    if bullet['birthTick']==row['tick'] and row['phase']=='enter':
                        births.append((row['tick'],bullet['symbol']));birth_count+=1
                        if bullet['calls'] or bullet['frame']!=1:failures.append((fps,identity,row['tick'],'creation-phase'))
                        if bullet['disabled'] and bullet['depth']>=row['actorDepth']:failures.append((fps,identity,row['tick'],'prelude-layer'))
                    if not bullet['dead']:
                        if bullet['owner']!='P'+owner:failures.append((fps,identity,row['tick'],'owner'))
                        elapsed=row['tick']-bullet['birthTick']
                        expected_phase=atlas.get((bullet['symbol'],elapsed,'created' if elapsed==0 else row['phase']))
                        if expected_phase!=bullet['phaseFrames']:failures.append((fps,identity,row['tick'],'nested-phase',elapsed))
                    if row['phase']=='enter' and row['tick']==bullet['birthTick']+1:
                        attacks=[c for c in bullet['calls'] if c['kind']=='attack']
                        if len(attacks)!=(0 if bullet['disabled'] else 1):failures.append((fps,identity,row['tick'],'first-step'))
            if births!=expected:failures.append((fps,identity,'creation-schedule',births,expected))
        total+=len(data['rows'])
    result=dict(status='passed-bounded-check' if not failures else 'failed',rows=total,births=birth_count,failures=failures,measurements=files,mutation=mutation,
                scope='Actual doHit construction, child layer, P1/P2 origin, no creation-frame bullet step, next-step call and nested timeline phase vs separate natural native bullet construction. Controlled gotoAndStop restart atlas is explicitly not the host phase oracle. Collision/settlement and full pet death/buff are outside this check.')
    (OUT/('joint-verification.json' if not mutation else 'joint-mutation-'+mutation+'.json')).write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('228 joint:',total,'rows;',birth_count,'births;',len(failures),'failures;',failures[:5])
    assert not failures


if __name__=='__main__':main()
