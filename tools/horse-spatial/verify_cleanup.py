"""Assert destruction and delayed-call boundaries independently of renderer state."""
import json
from prepare_cleanup import BASE, OUT
from run_lifecycle import sha


def check(data):
    failures=[];checked=0
    delays={r['id']:r for r in data['delays']}
    groups={}
    for row in data['rows']:groups.setdefault(row['id'],[]).append(row)
    for identity,rows in groups.items():
        mode=identity.split('-',4)[4];skills=int(identity.split('-')[3])
        if not mode.startswith('destroy-'):continue
        dead=mode=='destroy-dead'
        for row in rows:
            if row['tick']<8:continue
            checked+=1;c=row['cleanup'];bad=[]
            for key,value in dict(ready=True,dead=dead,sourceAttached=False,bodyAttached=False,effectAttached=False,effectOwner=False,ownerClears=1).items():
                if c[key]!=value:bad.append(key)
            if not c['old'] or any(b!={'ready':True,'attached':False} for b in c['old']):bad.append('private-old-bullets')
            # Already-created immediate explosions are removed by destroy. A new
            # delayed explosion is possible only for bd+bz and a live parent.
            if dead or skills&5!=5:
                if row['bullets']:bad.append('unexpected-post-destroy-bullet')
            if bad:failures.append(dict(id=identity,tick=row['tick'],phase=row['phase'],fields=bad))
        last=rows[-1]
        if last['actorDepth']!=-1 or last['cleanup']['alpha']!=0:failures.append(dict(id=identity,fields=['native-fade-completion']))
        if skills&5==5:
            delay=delays[identity]
            assert delay['start']-delay['timelineAtSchedule']==1 and len(delay['fires'])==1
            fire=delay['fires'][0]
            if fire['timeline']<delay['start'] or fire['dead']!=dead or not fire['ready']:failures.append(dict(id=identity,fields=['delayed-boundary']))
            if not dead:
                births=[b for r in rows for b in r['bullets'] if b['symbol']=='PetHorse4Bullet5Explode']
                if not births or any(b['birthTick']!=fire['tick'] for b in births):failures.append(dict(id=identity,fields=['live-destroy-delayed-birth']))
    return checked,failures


def main():
    measurements=[];total=0;failures=[]
    for fps in [20,24,30]:
        path=BASE/f'cleanup-air/measurement-{fps}.json';data=json.loads(path.read_text())
        assert data['methodsSha256']==sha(OUT/'cleanup-methods.json')
        count,bad=check(data);total+=count;failures+=bad
        measurements.append(dict(fps=fps,sha256=sha(path),rows=len(data['rows'])))
    report=dict(status='passed-bounded' if not failures else 'failed',checkedDestroyedStates=total,measurements=measurements,failures=failures,
        scope='Original BasePet/BBDC/BaseAddEffect destroy with inactive parent buffs, actual native TweenMax fade/delayed callback. P1/P2 private arrays and owners are independent. Dead/live flag supplied at explicit destroy boundary; full HP/death and live replacement callers are not executed. Live destroy alone does not cancel delayed bd+bz explosion; source callback tests only isDead.')
    (OUT/'cleanup-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('229 cleanup',total,'destroyed states;',len(failures),'failures',failures[:2]);assert not failures


if __name__=='__main__':main()
