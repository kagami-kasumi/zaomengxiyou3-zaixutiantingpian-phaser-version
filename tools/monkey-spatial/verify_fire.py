"""Independent arithmetic expectations for original target fire add/remove and projected step."""
import copy
import hashlib
import json
import math
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/fire-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def check(rows):
    errors=[]
    for row in rows:
        fps,tick,mode=row['fps'],row['tick'],row['mode']
        active=row['p'+str(row['selected'])];other=row['p'+str(3-row['selected'])]
        duration=fps if mode=='boundary' else fps*3.6
        start=fps+2 if mode=='refresh' and tick>=fps+2 else 0
        expiry=math.ceil(start+duration)
        cut=fps+3 if mode in ('cancel','destroy') else math.inf
        end=min(expiry,cut)
        visible=tick<end or mode=='destroy' and tick>=cut
        # Expiry removes the entry but the already selected original step item still deals damage.
        damage_end=min(tick,expiry,cut-1)
        hits=max(0,math.floor(damage_end/fps)+1)
        buff=dict(time=duration,startTime=start,hurt=10,isFirst=False) if tick<end else None
        expected=dict(fire=visible,children=int(visible),owner=not(mode=='destroy' and tick>=cut),
                      damage=[10]*hits,buff=buff)
        if active!=expected:errors.append((fps,mode,tick,'active',active,expected))
        if other!=dict(fire=False,children=0,owner=True,damage=[],buff=None):errors.append((fps,mode,tick,'other'))
    return errors


def main():
    path=WORK/'measurement.json';data=json.loads(path.read_text());rows=data['rows']
    assert len(rows)==5950
    failures=check(rows);assert not failures,failures[:3]
    mutants={}
    for name,mode,tick,key,value in [
        ('refresh-replaces-hurt','refresh',22,'buff',dict(time=72,startTime=22,hurt=99,isFirst=False)),
        ('expiry-early-return','boundary',20,'damage',[10]),
        ('destroy-clears-fire','destroy',23,'fire',False),
        ('duplicate-display','refresh',22,'children',2),
    ]:
        row=copy.deepcopy(next(r for r in rows if r['fps']==20 and r['selected']==1 and r['mode']==mode and r['tick']==tick))
        row['p1'][key]=value;mutants[name]=bool(check([row]))
    assert all(mutants.values())
    report=dict(status='passed-bounded',states=len(rows),cases=30,rejectedMutants=mutants,
                measurementSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                scope='Full source add/remove/cancelAllEffect/destroy with projected fire-only step; real target death caller and damage settlement remain separate contracts.')
    (OUT/'fire-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('228 fire verified: 5950 states, 30 cases, 4 rejected mutants')


if __name__=='__main__':main()
