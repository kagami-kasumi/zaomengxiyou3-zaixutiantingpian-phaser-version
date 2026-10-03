"""Independent finite decision oracle. Does not import the AS3 generator or modern game."""
import copy
import hashlib
import itertools
import json
import math
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-250'
REFERENCE=ROOT/'docs/reverse-engineering/reference/monster3-natural-attack-contract.json'
SCENARIOS=['natural','normal','distance199','distance200','distance201','vertical','normal149','normal150','normal151','cd1','busy1','busy2','hurt','dead','ready','ice','thaw','pause','no-target','acquire','target-dead','target-ready','walk','afterHurt','equal-x']
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
            skill=math.hypot(row['x'],row['y'])<200 and body['cd']==0
            normal_due=count%fps==0
            if skill:
                e.update(action='hit2',lastHit='hit2',serial=body['serial']+1,cd=fps*4)
            elif normal_due:
                if abs(row['x'])<=150:
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
    rows=report['rows'];assert len(rows)==len(expected_keys)==len({key(r) for r in rows})
    assert {key(r) for r in rows}==expected_keys
    compact=[];decisions=0;births=0
    for row in rows:
        k=key(row);fps=row['fps'];name=row['scenario']
        rate=0.85 if row['difficulty']==1 else 0.89 if row['difficulty']==2 else 0.423 if row['boss'] else 0.366
        initial=row['init'];assert initial['cd']==fps*2 and initial['interval']==fps*4,(k,'initial cd')
        assert initial['rate']==rate,(k,'initial rate',initial['rate'],rate)
        hp=926 if row['boss'] else 400
        if row['difficulty']==1:hp=int(hp*1.45)
        assert initial['hp']==hp and initial['action']=='wait' and initial['serial']==0,(k,'constructor')
        x,y=100,0
        if name.startswith('distance'):x=int(name[8:])
        if name=='vertical':x,y=150,150
        if name.startswith('normal1'):x,y=int(name[6:]),250
        if name=='equal-x':x,y=0,250
        assert (row['x'],row['y'])==(x,y),(k,'fixture geometry')
        first=dict(initial)
        first['target']=None if name in ['no-target','acquire'] else ('p2' if row['owner']=='p2' else 'p1')
        if name in ['normal','rate','equal-x'] or name.startswith('normal1'):first['cd']=fps*20
        elif name!='natural':first['cd']=1 if name in ['cd1','thaw'] else 0
        if name in ['busy1','busy2','hurt','dead','ready','ice','no-target','afterHurt']:first['cd']=fps*2
        if name!='natural':first['count']=fps-1
        if name in ['busy1','busy2','hurt','dead','walk','afterHurt']:
            first['action']={'busy1':'hit1','busy2':'hit2'}.get(name,name)
        if name=='dead':first['hp']=0
        if name=='ready':first['ready']=True
        if name in ['ice','thaw']:first.update(frozen=True,bodyStopped=True)
        if name=='distance199':first['direct']=1-row['direct']
        assert row['states'][0]['before']==first,(k,'fixture state')
        length=fps*8 if name in ['natural','normal','pause'] else 4
        assert len(row['states'])==length
        expected_births={};actual_births=[];selected=[];packed=[];world_tick=0;previous=None
        for index,state in enumerate(row['states'],1):
            assert state['tick']==index,(k,'ticks')
            assert state['paused']==(name=='pause' and 3<=index<=5),(k,'pause input')
            if previous is not None:assert state['before']==previous,(k,index,'continuity')
            if not state['paused']:world_tick+=1
            expected,calls=expected_step(row,state)
            assert state['random']==([0.97]+[row['roll']]*(calls-1) if calls else []),(k,index,'random calls',state['random'],calls)
            assert state['after']==expected,(k,index,'decision',state['after'],expected)
            search=bool(state['body'] and state['body']['hp']>0 and state['body']['action'] not in HURT and not state['body']['frozen'] and state['body']['target'] is None)
            assert state['order']==(['normalWalk','selectTarget'] if search else []),(k,index,'target search order')
            if name=='ice':assert state['after']['bodyStopped'] and state['after']['frozen']
            if name=='thaw' and index==2:
                assert not state['after']['bodyStopped'] and not state['after']['frozen'] and state['after']['action']=='hit2'

            if state['body'] is not None:
                # Count/CD cannot change during the prior body phase. AI is the only decision owner.
                for field in ['cd','count','serial','target']:
                    assert state['body'][field]==state['before'][field],(k,index,'body changed '+field)
            if state['after']['serial']>state['before']['serial']:
                decisions+=1;selected.append((world_tick,state['after']['action']))
                due=world_tick+(7 if state['after']['action']=='hit1' else 6)
                expected_births[due]=state['after']['action']
            if name in ['natural','normal','pause']:
                created=state['after']['created']-state['before']['created']
                should=int(not state['paused'] and world_tick in expected_births)
                assert created==should,(k,index,'natural emission',created,should)
                if created:
                    b=state['bullets'][-1];action=expected_births[world_tick];offset=105 if action=='hit1' else 155
                    assert b['action']==action and b['frame']==1,(k,index,'birth identity/frame')
                    assert b['x']==300+(-offset if state['before']['direct']==0 else offset)
                    assert b['y']==200-(60 if action=='hit1' else 30)
                    actual_births.append((index,b['uid']));births+=1
            packed.append([index,expected['action'],expected['cd'],expected['count'],expected['serial'],expected['direct'],expected['target'],calls,expected['created']])
            previous=state['after']
        if name in ['natural','normal','pause']:
            assert selected and actual_births,(k,'no natural attacks')
            for tick,uid in actual_births:
                first=next((s for s in row['states'] if s['tick']>tick and not s['paused']),None)
                attempts=[a for a in row['attempts'] if a['uid']==uid]
                if first:
                    assert attempts and attempts[0]['tick']==first['tick'],(k,tick,'first detection')
                    b=next(b for b in first['bullets'] if b['uid']==uid)
                    assert b['frame']==1,(k,tick,'first detection frame')
            if name=='natural':assert {a for _,a in selected}=={'hit1','hit2'},(k,'natural both attacks')
            if name=='normal':assert len(selected)>=2 and all(a=='hit1' for _,a in selected),(k,'normal repeat')
        compact.append(dict(input=list(k),states=packed))
    return dict(cases=len(rows),states=sum(len(r['states']) for r in rows),decisions=decisions,naturalBirths=births),compact


def check_sources(report):
    for source in report['sources']:
        assert hashlib.sha256((ROOT/source['path']).read_bytes()).hexdigest()==source['sha256'],source['path']
    assert hashlib.sha256((ROOT/'tools/monster3-selection-source/capture.py').read_bytes()).hexdigest()==report['harnessSha256']
    assert hashlib.sha256((ROOT/'tools/monster3-source/capture.py').read_bytes()).hexdigest()==report['bodyHarnessSha256']
    assert report['runtime']=='AIR 51.1.1.5' and report['mutation'] is None


def check_reference(reference, summary, expected, baseline):
    assert reference['schemaVersion']==1 and reference['contractId']=='task-settings-250.monster3-natural-attack'
    assert reference['status']=='verified-bounded-behavior' and reference['unresolved']==[]
    assert reference['sources']==baseline['sources'] and reference['runtime']==baseline['runtime']
    assert reference['expectedCases']==expected and reference['summary']==summary
    assert reference['columns']==['tick','action','cd','count','serial','direct','target','randomCalls','created']


def negative_checks(baseline, summary, expected):
    rejected=[]
    for kind in ['missing-case','geometry','initial-cd','decision-cd','random','search-order']:
        damaged=copy.deepcopy(baseline)
        row=damaged['rows'][0];state=row['states'][0]
        if kind=='missing-case':damaged['rows'].pop()
        if kind=='geometry':row['x']+=1
        if kind=='initial-cd':state['before']['cd']+=1
        if kind=='decision-cd':state['after']['cd']+=1
        if kind=='random':state['random']=[]
        if kind=='search-order':state['order']=['selectTarget','normalWalk']
        try:verify(damaged)
        except AssertionError:rejected.append(kind)
        else:raise AssertionError('report corruption accepted: '+kind)
    reference=json.loads(REFERENCE.read_text(encoding='utf-8'))
    for kind in ['status','columns','expected','sources']:
        damaged=copy.deepcopy(reference)
        if kind=='status':damaged['status']='draft'
        if kind=='columns':damaged['columns'][2]='wrong'
        if kind=='expected':damaged['expectedCases'][0]['states'][0][2]+=1
        if kind=='sources':damaged['sources'][0]['sha256']='wrong'
        try:check_reference(damaged,summary,expected,baseline)
        except AssertionError:rejected.append('reference-'+kind)
        else:raise AssertionError('reference corruption accepted: '+kind)
    (OUT/'negative-checks.json').write_text(json.dumps(dict(status='passed',rejected=rejected),indent=2)+'\n',encoding='utf-8')
    print('Report/reference corruptions rejected:',len(rejected))


def main():
    baseline=json.loads((OUT/'baseline.json').read_text(encoding='utf-8'));check_sources(baseline)
    summary,expected=verify(baseline)
    if '--mutations' in sys.argv:
        from capture import MUTATIONS, run
        results=[]
        for name in MUTATIONS:
            mutant=run(name)
            try:verify(mutant)
            except AssertionError as error:
                changed=sum(a!=b for a,b in zip(mutant['rows'],baseline['rows']));assert changed>0
                results.append(dict(name=name,changed=changed,rejected=str(error)[:600]))
                print(name,'rejected',changed,flush=True)
            else:raise AssertionError('surviving mutation '+name)
        repeat=run(suffix='repeat');assert repeat['rows']==baseline['rows'],'repeat rows differ'
        (OUT/'verification.json').write_text(json.dumps(dict(status='passed',summary=summary,mutations=results,repeat=True),indent=2)+'\n',encoding='utf-8')
    if '--write-reference' in sys.argv:
        accepted=json.loads((OUT/'verification.json').read_text(encoding='utf-8'))
        assert accepted['status']=='passed' and accepted['summary']==summary
        data=dict(schemaVersion=1,contractId='task-settings-250.monster3-natural-attack',status='verified-bounded-behavior',
          scope='Finite Monster3 natural selection/CD into 247 body. Fixed roots/movement sinks; not full AI pathfinding or actual HP.',
          summary=summary,sources=baseline['sources'],runtime=baseline['runtime'],columns=['tick','action','cd','count','serial','direct','target','randomCalls','created'],
          expectedCases=expected,unresolved=[],limitations=baseline['limitations'])
        REFERENCE.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8')
    if '--check-reference' in sys.argv:
        reference=json.loads(REFERENCE.read_text(encoding='utf-8'))
        check_reference(reference,summary,expected,baseline)
    if '--audit-existing' in sys.argv:
        from capture import MUTATIONS
        for name in MUTATIONS:
            mutant=json.loads((OUT/(name+'.json')).read_text(encoding='utf-8'))
            try:verify(mutant)
            except AssertionError:pass
            else:raise AssertionError('surviving mutation '+name)
        assert json.loads((OUT/'repeat.json').read_text(encoding='utf-8'))['rows']==baseline['rows']
        print('Existing nine compiled mutants rejected; repeat identical.')
    if '--negative-checks' in sys.argv:negative_checks(baseline,summary,expected)
    print(json.dumps(summary),flush=True)


if __name__=='__main__':main()
