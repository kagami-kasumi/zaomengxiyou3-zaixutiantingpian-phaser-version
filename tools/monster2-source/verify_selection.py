"""Independent finite decision oracle. Does not import the AS3 generator or modern game."""
import copy
import hashlib
import itertools
import json
import math
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-256'
REFERENCE=ROOT/'docs/reverse-engineering/reference/monster2-natural-attack-contract.json'
SCENARIOS=['natural','normal','distance499','distance500','distance501','vertical','normal249','normal250','normal251','cd1','busy1','busy2','hurt','dead','ready','ice','thaw','pause','no-target','acquire','target-dead','target-ready','walk','afterHurt','equal-x']
ROLLS=[0.366,0.3661,0.423,0.4231,0.85,0.8501,0.89,0.8901]
HURT={'hurt_1','hurt_2','hurt_3','hurt','afterHurt','dead'}
BUSY=HURT|{'hit1','hit2','hit3'}


def key(row):return tuple(row[k] for k in ['fps','boss','direct','owner','scenario','difficulty','roll'])


def expected_step(row,state):
    body=state['body'];before=state['before']
    if state['paused'] or body is None:return dict(before),0
    e=dict(body);fps=row['fps'];name=row['scenario']
    count=0 if body['count']>fps*10 else body['count']+1
    e['count']=count;calls=0
    target=body['target']
    dead_target=name=='target-dead' and target==('p2' if row['owner']=='p2' else 'p1')
    if body['hp']>0 and body['action'] not in HURT and not body['frozen']:
        if target is None:
            candidates=[] if name=='no-target' else (['p1','p2'] if row['owner']=='both' else [row['owner']])
            if name=='target-dead':candidates=candidates[1:]
            e['target']=candidates[0] if candidates else None
        elif dead_target:e['target']=None
        elif body['action'] not in BUSY:
            calls=1  # unused ceil(random*4) is nevertheless consumed
            skill=math.hypot(row['x'],row['y'])<500 and body['cd']==0
            normal_due=count%fps==0
            if skill:
                e.update(action='hit2',lastHit='hit2',serial=body['serial']+1,cd=fps*5)
            elif normal_due:
                if abs(row['x'])<=250:
                    calls+=1
                    if row['roll']<=body['rate']:
                        e.update(action='hit1',lastHit='hit1',serial=body['serial']+1,
                                 direct=0 if row['x']==0 else row['direct'])
                    else:e['action']='wait'
                else:e.update(action='walk',direct=row['direct'])
    if not body['ready']:e['cd']=max(0,e['cd']-1)
    if e['target'] is not None and name in ['target-dead','target-ready']:
        invalid='p2' if row['owner']=='p2' else 'p1'
        if e['target']==invalid:e['target']=None
    return e,calls

def verify(report):
    expected_keys=set()
    for prefix in itertools.product([20,24,30],[False,True],[0,1],['p1','p2','both']):
        expected_keys.update(prefix+(s,0,0) for s in SCENARIOS)
        expected_keys.update(prefix+('rate',d,r) for d in [0,1,2] for r in ROLLS)
    rows=report['rows']
    assert len(rows)==len(expected_keys) and {key(r) for r in rows}==expected_keys
    decisions=0
    for row in rows:
        k=key(row);fps=row['fps'];initial=row['init']
        rate=0.85 if row['difficulty']==1 else 0.89 if row['difficulty']==2 else 0.423 if row['boss'] else 0.366
        hp=1500 if row['boss'] else 24189
        if row['difficulty']==1:hp=int(hp*1.45)
        assert initial['cd']==fps and initial['interval']==fps*5 and initial['rate']==rate and initial['hp']==hp,(k,initial)
        expected_length=fps*8 if row['scenario'] in ['natural','normal','pause'] else 4
        assert len(row['states'])==expected_length
        for tick,state in enumerate(row['states'],1):
            assert state['tick']==tick
            assert state['paused']==(row['scenario']=='pause' and 3<=tick<=5)
            expected,calls=expected_step(row,state)
            assert state['random']==([0.97]+[row['roll']]*(calls-1) if calls else []),(k,tick,'random')
            assert state['after']==expected,(k,tick,state['after'],expected)
            if tick>1:assert state['before']==row['states'][tick-2]['after'],(k,tick,'continuity')
            if state['body'] is not None:
                for field in ['cd','count','serial','target']:assert state['body'][field]==state['before'][field]
            decisions+=int(state['after']['serial']>state['before']['serial'])
    return dict(cases=len(rows),states=sum(len(r['states']) for r in rows),decisions=decisions)

if __name__=='__main__':
    print(verify(json.loads((OUT/'selection-baseline.json').read_text(encoding='utf-8'))))


