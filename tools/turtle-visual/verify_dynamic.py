"""Independent bounded dynamic expectations from source holds and caller contracts."""
import copy
import gzip
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/dynamic-air'


def check(data,bodies):
    failures=[]
    cases={}
    def require(condition,detail):
        if not condition:failures.append(detail)
    for row in data['rows']:cases.setdefault(row['id'],{})[row['tick']]=row
    require(len(cases)==48,'case-count')
    for identity,states in cases.items():
        require(set(states)==set(range(122)),identity+':host-ticks')
        kind,form,owner,mask=identity.split('-');form=int(form);mask=int(mask)
        initial=states[0]
        require(initial['direct']==1,identity+':source-initial-right')
        def bullets(t,symbol):return [b for b in states[t]['bullets'] if b['symbol']==symbol]
        if kind in ('normal','sld','linked','sybh'):
            action={'normal':'hit1','sld':'hit2','linked':'hit2','sybh':'hit3'}[kind]
            spec=bodies['forms'][form-1]
            row=next(a['row'] for a in spec['actions'] if a['action']==action)
            holds=spec['rows'][row]['cells'];emission=1+sum(c['holdTicks'] for c in holds[:-1])
            require(initial['row']==row and initial['action']==action,identity+':initial-action')
            require(not states[emission-1]['bullets'] and len(states[emission]['bullets'])==1,identity+':emission')
            if kind in ('sld','linked'):
                require(states[emission]['hp']==173,identity+':cure')
                require(states[emission]['heroHp']==(173 if kind=='linked' else 100),identity+':linked-cure')
                before=bullets(14,'PetTurtle1Bullet2')[0];moved=bullets(15,'PetTurtle1Bullet2')[0]
                require(states[13]['direct']==0 and states[14]['direct']==1 and bullets(13,'PetTurtle1Bullet2')[0]['a']==before['a'],identity+':body-turn-not-root-flip')
                require(moved['x']-before['x']==40 and moved['y']-before['y']==-10,identity+':follow')
                require(bullets(16,'PetTurtle1Bullet2')[0]['a']==1,identity+':flip')
                require(not bullets(18,'PetTurtle1Bullet2')[0]['dead'],identity+':hurt-survival')
        if kind in ('linked','aoyi','rest','dead','destroy'):
            enabled=kind=='linked' or bool(mask&2)
            for t in (0,1):
                roots=states[t]['display']['children'][:2]
                buffs=[sum(child['type']=='PetTurtle2Buff' for child in root.get('children',[])) for root in roots]
                require(buffs==([1,1] if enabled and t==1 else [0,0]),identity+':buff-first-step:'+str(t))
        if kind=='aoyi':
            require(len(bullets(0,'PetTurtle3Bullet3'))==bool(mask&4),identity+':sybh-mask')
            require(len(bullets(0,'AoyiBuff'))==1,identity+':aoyi-buff')
            for t,count in [(5,1),(52,2),(100,3)]:
                require(len(bullets(t,'PetTurtle1Bullet2'))==(count if mask&1 else 0),identity+':sld-time:'+str(t))
            if mask&4:
                b=bullets(0,'PetTurtle3Bullet3')[0]
                require(abs(b['a'])==2 and b['d']==2 and b['ttl']==120 and not b['last'],identity+':sybh-scale-ttl')
                require(not bullets(119,'PetTurtle3Bullet3')[0]['dead'] and bullets(120,'PetTurtle3Bullet3')[0]['dead'],identity+':ttl-end')
            require(bullets(4,'AoyiBuff')[0]['x']==320 and bullets(4,'AoyiBuff')[0]['y']==395,identity+':aoyi-follow')
            require(bullets(5,'AoyiBuff')[0]['a']==1,identity+':aoyi-flip')
        if kind in ('rest','dead'):
            require(len(bullets(121,'PetTurtle1Bullet2'))==(1 if kind=='rest' else 0),identity+':guard-or-cleanup')
        if kind=='dead':
            require(states[12]['action']=='dead' and states[12]['hp']==0,identity+':death-action')
            spec=bodies['forms'][form-1];dead_row=next(a['row'] for a in spec['actions'] if a['action']=='dead')
            death_end=11+sum(c['holdTicks'] for c in spec['rows'][dead_row]['cells'])
            require(not states[death_end-1]['ready'] and states[death_end]['ready'],identity+':death-over-destroy')
            glow=states[12]['display']['children'][1]['filters']
            require(len(glow)==1 and glow[0]['type']=='flash.filters::GlowFilter' and glow[0]['color']==10092288 and glow[0]['blurX']==15,identity+':source-protection-glow')
        if kind=='destroy':
            require(states[12]['ready'] and not states[12]['bullets'],identity+':destroy-clear')
            require(len(states[36]['display']['children'])==1,identity+':fade-remove')
    require(sorted((e['time'],e['errorId']) for e in data['errors'])==[(2,1009),(2,1009),(4,1009),(4,1009)],'source-errors')
    return failures


def main():
    data=json.loads((WORK/'measurement.json').read_text(encoding='utf-8'))
    bodies=json.loads((OUT/'body-inputs.json').read_text(encoding='utf-8'))
    failures=check(data,bodies)
    mutations={}
    for name in ('timing','scale','state'):
        changed=copy.deepcopy(data)
        if name=='timing':next(r for r in changed['rows'] if r['id']=='sld-4-1-7' and r['tick']==5)['bullets']=[]
        if name=='scale':next(r for r in changed['rows'] if r['id']=='aoyi-4-1-7' and r['tick']==0)['bullets'][0]['d']=1
        if name=='state':next(r for r in changed['rows'] if r['id']=='dead-4-1-7' and r['tick']==12)['action']='wait'
        mutations[name]=bool(check(changed,bodies))
    images={}
    for row in data['rows']:
        if 'capture' not in row:continue
        path=WORK/row['capture'];content=path.read_bytes();digest=hashlib.sha256(content).hexdigest()
        with Image.open(path) as im:assert im.size==(940,590)
        target=OUT/'native-baselines'/(digest+'.png')
        images[digest]=len(content);target.write_bytes(content)
        row['originalCapturePath']=row['capture'];row['capture']=target.relative_to(ROOT).as_posix();row['captureSha256']=digest
    data['originalMeasurementSha256']=hashlib.sha256((WORK/'measurement.json').read_bytes()).hexdigest()
    data['probeSha256']=hashlib.sha256((WORK/'DynamicProbe.as').read_bytes()).hexdigest()
    data['nativeTreeSha256']=hashlib.sha256((WORK/'NativeTree.as').read_bytes()).hexdigest()
    data['probeSwfSha256']=hashlib.sha256((WORK/'DynamicProbe.swf').read_bytes()).hexdigest()
    data['generatedSourceSha256']={p.relative_to(WORK).as_posix():hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((WORK/'turtlefixture').rglob('*.as'))}
    (OUT/'dynamic-native.json.gz').write_bytes(gzip.compress(json.dumps(data).encode(),mtime=0))
    report=dict(status='passed-bounded-check' if not failures else 'failed',cases=48,states=len(data['rows']),uniqueImages=len(images),failures=failures,mutationRejected=mutations,
                relatedChecks=['display-verification.json','buff-verification.json','mask-mutations.json','contract-visual-consumer-matrix.json'],
                unresolved=['Source/owner mutation integration.','20/30 source frame-budget derivations; this native fixture is explicitly 24.','Final expected/extracted state join, repeatability and Schema promotion.'])
    (OUT/'dynamic-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps(report));assert not failures and all(mutations.values())


if __name__=='__main__':main()
