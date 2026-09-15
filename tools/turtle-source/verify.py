"""Independent semantic expectations; no modern helpers or trace-derived expected values."""
import json
import math
import hashlib
from pathlib import Path
from prepare import ROOT, SRC, method

OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-221'
def verify_sources(data):
    for record in data['sources']:
        p=(ROOT/record['path']).resolve();assert p.is_relative_to(SRC.resolve())
        assert hashlib.sha256(p.read_bytes()).hexdigest()==record['sha256']
        text=p.read_text(encoding='utf-8')
        if 'method' in record:s=method(text,record['method'])
        elif 'startMarker' in record:
            start=text.index(record['startMarker']);s=text[start:text.index(record['endMarker'],start)]
        else:
            # 215's sole legacy record without markers is the complete display method.
            assert p.name=='BasePet.as';s=method(text,'addMonHurtMc')
        assert hashlib.sha256(s.encode()).hexdigest()==record['sliceSha256']

def verify(data):
    cases=data['cases'];c={x['id']:x for x in cases}
    assert len(c)==len(cases)==259
    assert data['runtime'].startswith('WIN 51,1,1,5')
    verify_sources(data)
    for f in range(1,5):
        for o in range(1,3):
            key=f'{f}-{o}';init=c['init-'+key];e=init['extra']
            assert e['range']==[40,120,150,150][f-1] and e['rate']==.7
            assert init['cd']==[72,72,96,288] and e['costs']==[20,20,20,30]
            attacks={'hit1':{'hitMaxCount':99,'attackBackSpeed':[6,-5],'attackInterval':999,'power':12,'attackKind':'physics'},
                     'hit2':{'hitMaxCount':99,'attackBackSpeed':[6,0] if f==4 else [10,0],'attackInterval':7 if f==1 else 999,'power':12,'attackKind':'physics' if f==4 else 'magic'}}
            if f>=3:attacks['hit3']={'hitMaxCount':99,'attackBackSpeed':[2,0] if f==4 else [5,0],'attackInterval':6 if f==4 else 999,'power':12,'attackKind':'magic'}
            assert e['attacks']==attacks
            for actual,want in zip(e['sourceHarm'],[106.05,6.825,572.67,.16065]):assert math.isclose(actual['first'],want)
            assert math.isclose(e['sourceHarm'][1]['second'],6.8)
            for d in [49,50,200,201]:assert c[f'gate-{key}-{d}']['extra']['gate']==(50<=d<=200)
            assert not c['low-mp-'+key]['extra']['gate']
            assert c['normal-before-'+key]['bullets']==[]
            b=c['normal-hit-'+key]['bullets'];assert len(b)==1 and b[0]['owner']
            assert b[0]['name']==('PetTurtle1Bullet1' if f==1 else 'PetTurtle2Bullet1')
            assert b[0]['x']==300+[85,95,140,140][f-1] and b[0]['y']==400-[40,60,75,75][f-1]
            assert not c['remote-'+key]['bullets']
            assert c['outside-'+key]['action']=='wait' and ['right'] in c['outside-'+key]['events']
            assert c['inside-'+key]['action']=='hit1'
            assert c['priority-'+key]['action']=='hit2' and c['priority-'+key]['cd'][0]==143
            assert c['counter-'+key]['action']=='hit1' and c['counter-'+key]['hp']==89
            assert c['target-first-'+key]['extra']=={'x':1000}
            assert c['target-loss-'+key]['extra']=={'lost':True}
            assert not c['unlearned-'+key]['extra']['gate']
            assert c['hurt-'+key]['action']=='hurt' and c['hurt-over-'+key]['action']=='wait'
            assert c['dead-'+key]['action']=='dead' and c['dead-'+key]['extra']['life']==9
            assert c['destroy-'+key]['extra']=={'ready':True,'ownerCleared':True}
            for skill in range(1,min(f,3)+1):
                r=c[f'release-{key}-{skill}'];assert r['mp']==980
                if skill==2:
                    assert r['action']=='wait' and r['buffs']==r['heroBuffs']
                    assert r['buffs']==[{'name':'petturtle_buff','time':168,'value':0}]
                else:
                    assert c[f'pre-frame-{key}-{skill}']['bullets']==[]
                    r=c[f'frame-{key}-{skill}'];assert len(r['bullets'])==1
                    assert r['bullets'][0]['owner'] and r['action']==('hit2' if skill==1 else 'hit3')
                    bullet=r['bullets'][0]
                    assert bullet['action']==r['action'] and bullet['last'] and not bullet['dead'] and not bullet['disabled']
                    assert bullet['ttl']==0 and bullet['scale']==(2 if skill==3 and f==4 else 1)
                    assert bullet['name']==('PetTurtle1Bullet2' if skill==1 else 'PetTurtle3Bullet3')
                    if skill==1:assert r['hp']==173 and r['bullets'][0]['cut'] is False
                    assert c[f'over-{key}-{skill}']['action']=='wait'
    for mask in range(8):
        a=c[f'aoyi-{mask}'];assert a['mp']==1000
        assert a['jobs']==([2,4,5] if mask&1 else [5])
        assert len(a['bullets'])==1+bool(mask&4)
        assert a['bullets'][-1]['name']=='AoyiBuff' and a['bullets'][-1]['disabled']
        if mask&4:assert a['bullets'][0]['ttl']==120 and a['bullets'][0]['last'] is False and a['bullets'][0]['scale']==2
        if mask&2:assert len(a['buffs'])==len(a['heroBuffs'])==1
        for suffix in ['two','four','end']:assert c[f'aoyi-{suffix}-{mask}']['mp']==1000
        assert ['back',1,2] in c[f'aoyi-end-{mask}']['events']
    for name in ['aoyi-rest','aoyi-dead']:
        # Initial aoyi + immediate SLD + TXLJ attack ids; skipped delayed SLD adds none.
        assert c[name]['events'].count(['attackId'])==3
    assert c['aoyi-hurt-suppressed']['hp']==89 and c['aoyi-hurt-suppressed']['action']=='hit2'
    assert ['back',1,2] not in c['aoyi-hurt-suppressed']['events']
    assert c['aoyi-destroy-alive']['extra']['errorId']==1009
    assert not c['aoyi-low-mp']['extra']['gate'] and c['aoyi-enough-mp']['extra']['gate']
    for f in range(2,5):
        assert c[f'linked-sld-{f}']['heroHp']==173 and c[f'linked-sld-{f}']['hp']==173
    for f in range(1,5):
        power=c[f'power-{f}']['extra'];factor=1.2*(1.5 if f==4 else 1)
        assert math.isclose(power['normal']['hurt'],103*factor)
        assert math.isclose(power['sld']['hurt'],75.9*factor)
        assert math.isclose(power['sybh']['hurt'],123.5*factor if f>=3 else 0)
    return {'status':'passed','cases':len(cases),'sourceSlices':len(data['sources'])}

def verify_settlement(data):
    verify_sources(data)
    assert len(data['cases'])==144 and data['runtime'].startswith('WIN 51,1,1,5')
    for row in data['cases']:
        owner,n,link,heal=row['id'].split('-');n=int(n);linked=int(link)==3
        if heal=='true':
            amount=int(n*1.05) if linked else n
            assert row['hp']==min(1000,200+amount)
            assert row['petHp']==(min(1000,200+int(n*1.05)) if linked else 200)
            assert row['values']==[]
        else:
            amount=int(n*.95) if linked else n
            pet_amount=math.ceil(n*.05) if linked else 0
            assert row['hp']==max(0,200-amount) and row['petHp']==max(0,200-pet_amount)
            assert row['values']==([pet_amount,amount] if linked else [amount])
    return {'status':'passed','cases':144}

def verify_hit(data):
    verify_sources(data)
    assert len(data['cases'])==108
    for row in data['cases']:
        if row['id'].startswith('snapshot-'):
            assert row['atk']==282 and row['hurt']==(73 if row['id']=='snapshot-before' else 145)
        elif row['id'].startswith('defense-'):
            _,kind,defense=row['id'].split('-',2);defense=float(defense)
            ratio=1-defense/100
            want=1 if ratio<0 else int(101*min(1.1,ratio))
            assert row['hurt']==want
        else:
            interval,accept,tick=row['id'].split('-');interval=int(interval);tick=int(tick);accept=accept=='true'
            assert row['attackId']==tick//interval
            hits=tick//interval+1 if accept else 0
            assert row['count']==99-hits and row['refresh']==hits
            assert row['calls']==(hits if accept else tick+1)
            assert len(row['seen'])==hits
    return {'status':'passed','cases':108,'boundary':'collision boolean supplied; no pixel equivalence claim'}

if __name__=='__main__':
    result=verify(json.loads((OUT/'source-trace.json').read_text(encoding='utf-8')))
    result['settlement']=verify_settlement(json.loads((OUT/'settlement-trace.json').read_text(encoding='utf-8')))
    result['hit']=verify_hit(json.loads((OUT/'hit-trace.json').read_text(encoding='utf-8')))
    (OUT/'verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(result))

