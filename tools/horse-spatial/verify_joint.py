"""Check real source creation against reviewed callbacks and native phase evidence."""
import copy
import json
import re
from prepare_lifecycle import ROOT,OUT
from run_lifecycle import sha
from verify_callbacks import RULES

BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229'
SYMBOLS={1:['PetHorse1Bullet1','PetHorse1Bullet2'],2:['PetHorse2Bullet1','PetHorse2Bullet2','PetHorse1Bullet2'],3:['PetHorse3Bullet1','PetHorse3Bullet2','PetHorse3Bullet3','PetHorse3Bullet4'],4:['PetHorse3Bullet1','PetHorse3Bullet2','PetHorse3Bullet3','PetHorse3Bullet4','PetHorse4Bullet5']}

def check(rows,atlas):
    failures=[]
    identity=rows[0]['id'];m=re.fullmatch(r'(\d)-(hit\d)-P(\d)-(-?\d+)',identity)
    form,action,owner,skills=int(m[1]),m[2],m[3],int(m[4]);ordinal=int(action[-1])-1
    birth,dx,dy=RULES[form][action];symbol=SYMBOLS[form][ordinal];births=[]
    for row in rows:
        for b in row['bullets']:
            if row['phase']=='enter' and b['birthTick']==row['tick']:
                births.append((row['tick'],b['symbol']))
                if b['calls'] or b['frame']!=1:failures.append('creation-stepped')
                expected_x=row['x']+(45 if action=='hit5' else dx)
                expected_y=50 if action=='hit5' else row['y']+dy
                if (b['x'],b['y'])!=(expected_x,expected_y):failures.append('creation-origin')
            if b['dead']:continue
            if b['owner']!='P'+owner:failures.append('owner')
            if b['depth']<=row['actorDepth']:failures.append('layer')
            elapsed=row['tick']-b['birthTick']
            if b['symbol']=='PetHorse4Bullet5':
                # Original one-frame root / eight-frame nested timeline, natural
                # construction holds frame one until the next host frame.
                phase=[1,1 if elapsed==0 else (elapsed-1)%8+1]
                if b['target']!=('target-P'+owner if skills&2 else None):failures.append('target-owner')
            else:
                phase=atlas.get((b['symbol'],elapsed,'created' if elapsed==0 else row['phase']))
            if b['phaseFrames']!=phase:failures.append('phase')
            if b['symbol']=='AoyiBuff' and (not b['disabled'] or b['birthTick']!=0):failures.append('prelude')
            if row['phase']=='enter' and elapsed==1:
                if len([c for c in b['calls'] if c['kind']=='attack'])!=(0 if b['disabled'] else 1):failures.append('first-attack')
    if births!=[(birth,symbol)]:failures.append('birth-schedule')
    return sorted(set(failures))

def main():
    failures=[];files=[];total=0;mutants={}
    for fps in (20,24,30):
        path=BASE/f'joint-air/measurement-{fps}.json';data=json.loads(path.read_text())
        assert data['environment'][0]['fps']==fps
        baseline=json.loads((BASE/f'lifecycle-air/measurement-{fps}.json').read_text())
        atlas={(r['state']['symbol'],r['tick'],r['phase']):r['state']['phaseFrames'] for r in baseline['rows'] if r['id'].endswith('-P1-1-natural')}
        groups={}
        for row in data['rows']:groups.setdefault(row['id'],[]).append(row)
        assert len(groups)==42
        for key,rows in groups.items():
            errors=check(rows,atlas)
            if errors:failures.append(dict(fps=fps,id=key,fields=errors))
        sample=groups['4-hit5-P1-7']
        for field,value in [('owner','P99'),('birthTick',1),('depth',-1),('phaseFrames',[99])]:
            rows=copy.deepcopy(sample);rows[0]['bullets'][0][field]=value
            mutants[f'{field}-{fps}']=bool(check(rows,atlas))
        files.append(dict(fps=fps,sha256=sha(path),compiledSha256=data['compiledSha256']));total+=len(data['rows'])
    report=dict(status='failed' if failures else 'passed-bounded',rows=total,measurements=files,failures=failures,mutationsRejected=mutants,
        scope='Actual horse callbacks/doHit plus native timelines, 42 controlled cases at each fps. Verifies creation schedule/origin, above-pet layers, private owner/target, disabled prelude and first attack call. Collision/settlement are sinks; no hit5Hit/ice/delayed explosion/full death claim.')
    (OUT/'joint-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('229 joint',total,'rows;',len(failures),'failures',failures[:5],'; mutations',mutants)
    assert not failures and all(mutants.values())

if __name__=='__main__':main()
