"""Independent original array-order and skill-flag expectations."""
import copy
import json
import re
from run_targeting import WORK,OUT
from run_lifecycle import sha

def check(row,fps):
    m=re.fullmatch(r'4-hit5-P(\d)-(\d)-(.*)',row['id']);owner,skills,mode=int(m[1]),int(m[2]),m[3]
    names=[] if mode=='empty' else ['C','A','B'] if mode=='reordered' else ['A','B','C']
    ids=['P'+str(owner)+n for n in names];errors=[]
    if row['inputIds']!=ids:errors.append('fixture-input')
    bullets=[b for b in row['bullets'] if b['symbol']=='PetHorse4Bullet5']
    if len(bullets)!=(len(ids) if row['tick']>=5 else 0):errors.append('count')
    if row['tick']>=5:
        info=dict(hitMaxCount=1,attackBackSpeed=[0,0],attackInterval=20,power=12,attackKind='magic')
        if skills&1:info['addEffect']=[dict(name='pethorse_ice',time=fps*2.4)]
        if row['attackInfo']!=info:errors.append('ice-attack-contract')
    for index,b in enumerate(bullets):
        target=ids[len(ids)-index-1] if skills&2 else None
        if target and mode=='dead-target' and target.endswith('B') and row['tick']>=6:target=None
        if b['target']!=target:errors.append('reverse-target-order-or-death')
        if b['owner']!='P'+str(owner):errors.append('owner')
        x=(300 if owner==1 else 640)+(len(ids)/2-index)*90
        if b['x']!=x or b['a']!=1:errors.append('origin-direction')
        if row['tick']==5 and (b['y']!=50 or b['ttl']!=fps*10 or b['distance']!=2000 or b['vx']!=0 or b['vy']!=1):errors.append('initial-state')
        if row['tick']==6 and b['y']!=(59 if target else 51):errors.append('tracking-step')
    return sorted(set(errors))

def main():
    failures=[];files=[];mutants={};total=0
    for fps in (20,24,30):
        path=WORK/f'measurement-{fps}.json';data=json.loads(path.read_text());assert len(data['rows'])==1024
        for row in data['rows']:
            errors=check(row,fps)
            if errors:failures.append(dict(fps=fps,id=row['id'],tick=row['tick'],fields=errors))
        sample=next(r for r in data['rows'] if r['id']=='4-hit5-P1-7-three' and r['tick']==5 and r['phase']=='enter')
        for name in ('order','count','ice','origin'):
            row=copy.deepcopy(sample);bullets=[b for b in row['bullets'] if b['symbol']=='PetHorse4Bullet5']
            if name=='order':bullets[0]['target']='P1A'
            if name=='count':row['bullets'].pop()
            if name=='ice':row['attackInfo'].pop('addEffect')
            if name=='origin':bullets[0]['x']+=45
            mutants[f'{name}-{fps}']=bool(check(row,fps))
        total+=len(data['rows']);files.append(dict(fps=fps,sha256=sha(path),compiledSha256=data['compiledSha256']))
    report=dict(status='failed' if failures else 'passed-bounded',rows=total,cases=192,failures=failures,fieldMutationsRejected=mutants,measurements=files,
        scope='Original doHit5/first movement, explicit empty/three/reordered/dead array cases, all learned bd/sp/bz combinations, both owners, three fps. Attack dictionary checked completely; actual collision/settlement and target death caller are separate.')
    (OUT/'targeting-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('229 targeting',total,'rows;',len(failures),'failures',failures[:4]);assert not failures and all(mutants.values())

if __name__=='__main__':main()
