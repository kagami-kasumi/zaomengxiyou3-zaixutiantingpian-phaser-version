"""Independent free-play/native-caller clock agreement and actual timing mutants."""
import copy
import gzip
import json
from pathlib import Path

from verify_buff import check as check_buff
from verify_dynamic import check as check_dynamic

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'


def load(name):
    data=(OUT/name).read_bytes();return json.loads(gzip.decompress(data) if name.endswith('.gz') else data)


def signature(node):return (node.get('frame'),node.get('totalFrames'),tuple(signature(c) for c in node['children']))


def main():
    dynamic=load('dynamic-native.json.gz');effects=load('effects-native.json.gz');bodies=load('body-inputs.json');body=load('body-native.json.gz');buff=load('buff-native.json.gz')
    clocks={(s['symbol'],s['tick']):signature(s['tree']) for s in effects['states']}
    birth={};failures=[];compared=0;sample=None
    for row in dynamic['rows']:
        wrappers=[n for n in row['display']['children'] if 'Bullet' in n['type']]
        alive=[]
        for i,b in enumerate(row['bullets']):
            key=(row['id'],i)
            if key not in birth:birth[key]=row['tick']
            if not b['dead']:alive.append((b,birth[key]))
        assert len(wrappers)==len(alive)
        for wrapper,(bullet,created) in zip(wrappers,alive):
            native=wrapper['children'][0];offset=max(0,row['tick']-created-1)
            expected=clocks[(bullet['symbol'],offset)]
            if signature(native)!=expected:failures.append((row['id'],row['tick'],bullet['symbol'],offset))
            compared+=1
            if sample is None and bullet['symbol']=='PetTurtle3Bullet3' and row['tick']==20:sample=(native,expected)
    def hold_ok(clock):
        row=bodies['forms'][clock['form']-1]['rows'][clock['row']];tick=(clock['tick']-1)%row['totalHostTicks']+1
        cell=next(c for c in row['cells'] if c['entryHostTick']<=tick<=c['lastHostTick'])
        return clock['events'][0]==dict(phase='enter',column=cell['column'],row=row['row'],count=cell['lastHostTick']-tick+1)
    assert all(hold_ok(c) for c in body['clocks'])
    mutant=copy.deepcopy(body['clocks'][0]);mutant['events'][0]['count']+=1;mutations={'BBDC-hold':not hold_ok(mutant)}
    mutant=copy.deepcopy(sample[0]);child=mutant['children'][0];child['frame']=child['frame']%child['totalFrames']+1
    mutations['valid-child-phase']=signature(mutant)!=sample[1]
    mutant=copy.deepcopy(dynamic);row=next(r for r in mutant['rows'] if r['id']=='aoyi-4-1-7' and r['tick']==119);row['bullets'][0]['dead']=True
    mutations['SYBH-TTL']=bool(check_dynamic(mutant,bodies))
    mutant=copy.deepcopy(buff);before=next(r for r in mutant['rows'] if r['id']=='buff-4-1-7' and r['tick']==168);after=next(r for r in mutant['rows'] if r['id']=='buff-4-1-7' and r['tick']==169);after['display']=before['display']
    mutations['buff-expiry']=bool(check_buff(mutant))
    report=dict(status='passed-bounded-check' if not failures else 'failed',independentNativeClockComparisons=compared,bodyHoldSteps=len(body['clocks']),failures=failures[:30],failureCount=len(failures),mutationRejected=mutations,
                phaseContract='Observed native startup alignment: newly constructed objects remain at frame1 at birth capture and the following EXIT_FRAME; loaded/reset free-play advances at its first EXIT_FRAME. Free-play index is max(0,hostTick-birthTick-1) for both pre-loop and in-callback construction. After this explicit startup alignment, compare complete recursive native frame signatures; never root-frame dedup.',
                profile='Native24 only. 20/30 frame budgets in expected-visual-states.json are source calculations.')
    (OUT/'time-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(json.dumps(report));assert not failures and all(mutations.values())


if __name__=='__main__':main()
