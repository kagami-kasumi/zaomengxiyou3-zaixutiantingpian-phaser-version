"""Independent 258 two-object/owner sequence oracle, driven by frozen host steps."""
import copy

def expected(fps,roster,mode):
    slots=[1,2] if roster=='both' else [int(roster[-1])]
    targets=[]
    for sid in slots:
        t=dict(sid=sid,hp=1000,petHp=1000,action='wait',petAction='wait',dead=False,destroyed=False,
               ids=[],petIds=[],father=-1,petFather=-1,life=10,attached=True,petRetired=False)
        if mode=='hero-protected':t['father']=100
        if mode=='pet-protected':t['petFather']=100
        if mode=='protect-expire':t['father']=t['petFather']=6
        if mode=='fatal-hero':t['hp']=1
        if mode=='fatal-pet':t['petHp']=1
        if mode in ['hp-equal','hp-above']:t['hp']=t['petHp']=29+(mode=='hp-above')
        if mode=='owner-dead':t.update(hp=0,dead=True,action='dead')
        if mode=='owner-ready':t['destroyed']=True
        if mode=='pet-dead':t.update(petHp=0,petAction='dead')
        if mode=='pet-ready':t['petRetired']=True
        targets.append(t)
    bullets=[];steps=[]
    for tick in range(1,43):
        random=0
        for b in bullets:
            first,last=(6,19) if b['symbol'].endswith('_1') else (21,40)
            if not first<=tick<=last:continue
            b['count']+=1
            if mode=='difficulty2':random+=1
            for t in targets:
                # Actual Config takes a living hero roster snapshot BEFORE damage.
                if t['hp']<=0:continue
                aid=b['id'];geometry=not(mode=='geometry-retry' and tick==6)
                if aid not in t['ids'] and t['father']<0 and geometry:
                    random+=1 if mode in ['dodge','difficulty2'] else 3
                    if mode!='dodge':
                        damage=99000 if mode=='difficulty2' else 58 if mode=='critical' else 29
                        t['hp']=max(0,t['hp']-damage)
                        if t['hp']==0:
                            t.update(dead=True,destroyed=True,father=0,ids=[],attached=False,petRetired=True)
                        else:t['action']='hurt'
                        if mode=='difficulty2':t['father']=fps
                    if mode!='difficulty2':t['ids'].append(aid)
                    t['ids'].append(aid);b['max']-=1;random+=3
                if t['attached'] and aid not in t['petIds'] and t['petFather']<0 and geometry:
                    random+=1 if mode in ['dodge','difficulty2'] else 3
                    if mode!='dodge':
                        damage=99000 if mode=='difficulty2' else 58 if mode=='critical' else 29
                        t['petHp']=max(0,t['petHp']-damage)
                        if t['petHp']==0:
                            if t['petAction']!='dead':t.update(petAction='dead',petFather=fps*5,life=t['life']-1)
                        else:t['petAction']='hurt'
                    if mode!='difficulty2':
                        t['petIds'].extend([aid]*(2 if mode=='dodge' else 1));b['max']-=1
        if mode!='gather-negative' and (tick==5 or (tick==20 and mode!='source-dead')):
            symbol='Monster2Bullet1_'+('1' if tick==5 else '2')
            bullets.append(dict(symbol=symbol,id=symbol+'-1',count=0,max=99));random+=3
        for t in targets:
            if t['father']>=0:t['father']-=1
            if t['attached'] and t['petFather']>=0:t['petFather']-=1
        steps.append(dict(tick=tick,targets=copy.deepcopy(targets),bullets=copy.deepcopy(bullets),random=[0.9]*random))
    return dict(id=f'{fps}-{roster}-{mode}',fps=fps,roster=roster,mode=mode,steps=steps)

MODES=['normal','hero-protected','pet-protected','protect-expire','geometry-retry','dodge','difficulty2','critical','fatal-hero','fatal-pet','owner-dead','owner-ready','pet-dead','pet-ready','hp-equal','hp-above','source-dead','gather-negative']
def verify(rows):
    keys=[(f,r,m) for f in [20,24,30] for r in ['p1','p2','both'] for m in MODES]
    assert len(rows)==len(keys)==162
    for key,row in zip(keys,rows):
        want=expected(*key)
        assert row.keys()==want.keys() and row['id']==want['id'],key
        assert len(row['steps'])==42
        for actual,wanted in zip(row['steps'],want['steps']):
            assert actual==wanted,(row['id'],wanted['tick'],{k:(wanted[k],actual.get(k)) for k in wanted if wanted[k]!=actual.get(k)})
    return len(rows)*42

if __name__=='__main__':
    import json
    from pathlib import Path
    p=Path(__file__).resolve().parents[2]/'docs/tasks/evidence/TASK-SETTINGS-258/baseline.json'
    print('world states',verify(json.loads(p.read_text())['world']))
