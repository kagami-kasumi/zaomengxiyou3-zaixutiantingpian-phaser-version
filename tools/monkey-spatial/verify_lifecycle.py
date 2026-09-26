"""Independent transition expectations for original native lifecycle observations."""
import copy
import hashlib
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/lifecycle-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def check(row,spec):
    if row['phase']!='enter':return []
    before,actual=row['before'],row['state']
    expected=copy.deepcopy(before);expected['calls']=[]
    manual=row['id'].endswith('explicit-destroy') and row['tick']==8
    def destroy():
        expected.update(dead=True,attached=False,owner=None,frame=None,total=None,phaseFrames=[])
    if not before['dead']:
        if manual:destroy()
        else:
            if not row['paused']:
                if before['ttl']>0:
                    expected['ttl']-=1
                    if expected['ttl']==0:destroy()
                expected['calls'].append(dict(kind='wall',x=before['x'],y=before['y']))
                if not spec['disabled']:
                    expected['calls'].append(dict(kind='attack',x=before['x'],y=before['y'],a=before['a'],dead=expected['dead'],owner=expected['owner']))
            if before['last'] and before['frame']==before['total']:destroy()
            if before['cut'] and row['source']['action']=='hurt':destroy()
            if spec['follow'] and not expected['dead']:
                move_tick=4 if row['id'].endswith('pause') else 3 if row['id'].endswith('move-hurt') else -1
                flip_tick=4 if row['id'].endswith(('pause','move-hurt')) else -1
                if row['tick']==move_tick:expected['x']+=20;expected['y']-=7
                if row['tick']==flip_tick:expected['a']=row['source']['a']
    return [key for key in expected if actual[key]!=expected[key]]


def main():
    totals=0;failures=[];mutants={};files=[]
    for fps in [20,24,30]:
        path=WORK/f'measurement-{fps}.json'
        data=json.loads(path.read_text());files.append(dict(fps=fps,sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
        specs={s['symbol']:s for s in data['fixtures']['effects']}
        assert data['environment'][0]['fps']==fps
        grouped={}
        for row in data['rows']:
            grouped.setdefault(row['id'],[]).append(row)
            errors=check(row,specs[row['id'].split('-')[0]])
            if errors:failures.append(dict(fps=fps,id=row['id'],tick=row['tick'],fields=errors))
        assert len(grouped)==144
        for rows in grouped.values():
            created=rows[0]['state'];spec=specs[created['symbol']]
            assert created['frame']==1 and created['attached'] and not created['dead']
            assert created['ttl']==(4*fps if spec['xj'] else -1)
            assert created['disabled']==spec['disabled']
            enters=[r for r in rows if r['phase']=='enter']
            if spec['xj'] and rows[0]['id'].endswith(('natural','pause')):
                death=next(r['tick'] for r in enters if r['state']['dead'])
                assert death==fps*4+(3 if rows[0]['id'].endswith('pause') else 0)
        totals+=len(data['rows'])
        chosen=next(r for r in data['rows'] if r['phase']=='enter' and r['id']=='PetMonkey1Bullet2-P1-1-pause' and r['tick']==4)
        changed=copy.deepcopy(chosen);changed['state']['x']=changed['before']['x']
        mutants[f'paused-follow-{fps}']=bool(check(changed,specs['PetMonkey1Bullet2']))
        chosen=next(r for r in data['rows'] if r['phase']=='enter' and r['id']=='PetMonkey1Bullet2-P1-1-move-hurt' and r['tick']==3)
        changed=copy.deepcopy(chosen);changed['state']['calls'][-1]['x']+=20
        mutants[f'hit-after-follow-{fps}']=bool(check(changed,specs['PetMonkey1Bullet2']))
        chosen=next(r for r in data['rows'] if r['phase']=='enter' and r['id']=='PetMonkey2Bullet2_1-P1-1-natural' and r['tick']==1)
        changed=copy.deepcopy(chosen);changed['state']['calls'].append(dict(kind='attack'))
        mutants[f'disabled-hits-{fps}']=bool(check(changed,specs['PetMonkey2Bullet2_1']))
    result=dict(status='passed-bounded-check' if not failures and all(mutants.values()) else 'failed',rows=totals,
                failures=failures,mutationsRejected=mutants,measurements=files,
                scope='Native actual fps; source method transitions, pre-follow collision call position, disabled, pause, TTL, hurt and explicit destroy. Geometry, settlement, real creation/cleanup caller and buff attachment not claimed.')
    (OUT/'lifecycle-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print({k:v for k,v in result.items() if k not in ('failures','scope')});print('Failures:',failures[:10])
    assert not failures and all(mutants.values())


if __name__=='__main__':main()
