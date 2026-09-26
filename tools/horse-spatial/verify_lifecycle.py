"""Independent source transition model, including EnemyMove post-collision movement."""
import copy
import hashlib
import json
import math
from prepare_lifecycle import WORK,OUT,ROOT

def check(row,spec):
    if row['phase']!='enter':return []
    before=row['before'];expected=copy.deepcopy(before);expected['calls']=[]
    def destroy():expected.update(dead=True,attached=False,owner=None,frame=None,total=None,phaseFrames=[])
    if not before['dead']:
        if row['id'].endswith('explicit-destroy') and row['tick']==8:destroy()
        else:
            if not row['paused']:
                if expected['ttl']>0:
                    expected['ttl']-=1
                    if expected['ttl']==0:destroy()
                expected['calls'].append(dict(kind='wall',x=before['x'],y=before['y']))
                if not spec['disabled']:
                    expected['calls'].append(dict(kind='attack',x=before['x'],y=before['y'],a=before['a'],dead=expected['dead'],owner=expected['owner']))
                if spec['kind'] in ('enemy','tracking'):
                    if expected['target']:
                        if row['target']['dead']:expected['target']=None
                        elif not expected['dead']:
                            expected['vx']=0
                            expected['vy']=-9 if before['y']>row['target']['y']+31 else 9
                    expected['vy']=min(expected['vy'],35)
                    expected['x']+=expected['vx'];expected['y']+=expected['vy']
                    expected['vy']+=1
                    expected['distance']=int(expected['distance']-math.hypot(expected['vx'],expected['vy']))
                    if expected['distance']<=0:destroy()
            if before['last'] and before['frame']==before['total']:destroy()
            if before['cut'] and row['source']['action']=='hurt':destroy()
            if spec['follow'] and not expected['dead']:
                move=4 if row['id'].endswith('pause') else 3 if row['id'].endswith('move-hurt') else -1
                flip=4 if row['id'].endswith(('pause','move-hurt')) else -1
                if row['tick']==move:expected['x']+=20;expected['y']-=7
                if row['tick']==flip:expected['a']=row['source']['a']
    return [key for key in expected if expected[key]!=row['state'][key]]

def main():
    failures=[];files=[];mutants={};total=0
    for fps in (20,24,30):
        path=WORK/f'measurement-{fps}.json';data=json.loads(path.read_text())
        assert data['environment'][0]['fps']==fps
        assert data['methodsSha256']==hashlib.sha256((OUT/'lifecycle-methods.json').read_bytes()).hexdigest()
        specs={s['id']:s for s in data['fixtures']['effects']}
        assert len(specs)==13
        grouped={}
        for row in data['rows']:
            spec=specs[row['id'].split('-')[0]];grouped.setdefault(row['id'],[]).append(row)
            errors=check(row,spec)
            if errors:failures.append(dict(fps=fps,id=row['id'],tick=row['tick'],fields=errors))
        assert len(grouped)==208
        for rows in grouped.values():
            state=rows[0]['state'];spec=specs[rows[0]['id'].split('-')[0]]
            assert state['cut']==spec['cut'] and state['disabled']==spec['disabled']
            assert state['ttl']==(fps*10 if spec['kind'] in ('enemy','tracking') else -1)
        for label,ident,tick,field,value in [
            ('paused-follow','PetHorse1Bullet2_follow-P1-1-pause',4,'x',345),
            ('bd-cut','PetHorse2Bullet2_follow-P1-1-move-hurt',5,'dead',True),
            ('disabled','AoyiBuff_follow-P1-1-natural',1,'calls',[dict(kind='attack')]),
            ('tracking-horizontal','PetHorse4Bullet5_tracking-P1-1-natural',2,'vx',10.6),
            ('target-death','PetHorse4Bullet5_tracking-P1-1-natural',9,'target','target-P1')]:
            row=copy.deepcopy(next(r for r in data['rows'] if r['phase']=='enter' and r['id']==ident and r['tick']==tick))
            row['state'][field]=value
            mutants[f'{label}-{fps}']=bool(check(row,specs[ident.split('-')[0]]))
        files.append(dict(fps=fps,sha256=hashlib.sha256(path.read_bytes()).hexdigest(),compiledSha256=data['compiledSha256'],phaseCount=len(data['nativePhases'])))
        total+=len(data['rows'])
    report=dict(status='passed-bounded-check' if not failures and all(mutants.values()) else 'failed',rows=total,measurements=files,failures=failures,mutationsRejected=mutants,
        scope='Original source transitions at native 20/24/30fps. Thirteen class/setter variants, both owners/directions, source movement/hurt, pause, explicit destroy, target loss, distance and TTL. Field mutations validate assertions, not whole-program mutation adequacy. Collision, source body and actual delayed callback remain separate.')
    (OUT/'lifecycle-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(report['status'],'rows',total,'failures',len(failures),'mutants',mutants)
    print(failures[:8]);assert not failures and all(mutants.values())

if __name__=='__main__':main()
