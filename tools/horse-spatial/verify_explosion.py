"""Check source skill combinations, live reference coordinates and original timer."""
import copy
import json
import re
from prepare_explosion import WORK,OUT
from run_lifecycle import sha

def check(data):
    failures=[];groups={};delay_by_id={d['id']:d for d in data['delays']}
    for row in data['rows']:groups.setdefault(row['id'],[]).append(row)
    if len(groups)!=80:return ['case-set']
    for identity,rows in groups.items():
        m=re.fullmatch(r'4-hit5-P(\d)-(\d)-(.*)',identity);owner,skills,mode=int(m[1]),int(m[2]),m[3]
        delayed=bool(skills&1 and skills&4);should=bool(skills&4) and mode!='dead-before' and not(delayed and mode=='dead-after')
        observed=[(r,b) for r in rows for b in r['bullets'] if b['symbol']=='PetHorse4Bullet5Explode']
        if bool(observed)!=should:failures.append((identity,'existence'))
        if delayed:
            delay=delay_by_id.get(identity)
            if not delay:failures.append((identity,'missing-delay'));continue
            if delay['delay']!=1 or abs(delay['start']-delay['timelineAtSchedule']-1)>1e-12:failures.append((identity,'delay-source-clock'))
            if len(delay['fires'])!=1:failures.append((identity,'callback-count'));continue
            fire=delay['fires'][0]
            if fire['timeline']<delay['start']:failures.append((identity,'early-callback'))
            if fire['dead']!=(mode in ('dead-before','dead-after')):failures.append((identity,'dead-predicate'))
            if fire['ready']!=(mode=='ready-only'):failures.append((identity,'ready-input'))
        elif identity in delay_by_id:failures.append((identity,'unexpected-delay'))
        if observed:
            row,b=observed[0];x=(300 if owner==1 else 640)+45;y=59 if skills&2 else 51
            if delayed and mode=='move-reference':x+=23;y+=11
            if (b['x'],b['y'],b['owner'])!=(x,y,'P'+str(owner)):failures.append((identity,'coordinates-owner'))
            # BaseBullet.setDirect(0): direct=-1, flipHorizontal(...,-direct)=+1.
            if b['disabled'] or b['a']!=1:failures.append((identity,'explosion-flags'))
            expected_birth=delay_by_id[identity]['fires'][0]['tick'] if delayed else 6
            if b['birthTick']!=expected_birth:failures.append((identity,'callback-birth'))
            if sum(z['symbol']=='PetHorse4Bullet5Explode' for z in row['bullets'])!=1:failures.append((identity,'duplicate'))
    return failures

def main():
    failures=[];files=[];mutants={};total=0
    for fps in (20,24,30):
        path=WORK/f'measurement-{fps}.json';data=json.loads(path.read_text());assert data['environment'][0]['fps']==fps
        assert len(data['delays'])==20
        failures += [(fps,*f) for f in check(data)];total+=len(data['rows'])
        for name in ('delay','owner','reference','death'):
            altered=copy.deepcopy(data)
            if name=='delay':altered['delays'][0]['delay']=0
            elif name=='death':altered['delays'][0]['fires'][0]['dead']=not altered['delays'][0]['fires'][0]['dead']
            else:
                r=next(r for r in altered['rows'] if r['id']=='4-hit5-P1-5-move-reference' and any(b['symbol']=='PetHorse4Bullet5Explode' for b in r['bullets']))
                b=next(b for b in r['bullets'] if b['symbol']=='PetHorse4Bullet5Explode');b['owner' if name=='owner' else 'x']='P2' if name=='owner' else 345
            mutants[f'{name}-{fps}']=bool(check(altered))
        files.append(dict(fps=fps,sha256=sha(path),compiledSha256=data['compiledSha256'],pet1Sha256=data['pet1Sha256']))
    result=dict(status='failed' if failures else 'passed-bounded',rows=total,cases=240,nativeDelayedCallbacks=60,failures=failures,measurements=files,fieldMutationsRejected=mutants,
        scope='Original hit5Hit and original restored TweenMax delay. All bd/sp/bz combinations, P1/P2, dead-before/after, ready-only and moved bullet reference. Successful-hit and parent flags are controlled boundaries; no collision/HP/full replacement cleanup claim.')
    (OUT/'explosion-verification.json').write_text(json.dumps(result,indent=2)+'\n')
    print('229 explosion',total,'rows;',len(failures),'failures',failures[:6]);assert not failures and all(mutants.values())

if __name__=='__main__':main()
