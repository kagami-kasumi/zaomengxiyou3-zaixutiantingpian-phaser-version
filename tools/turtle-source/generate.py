"""Source-derived behavioral declaration manifest; deliberately not visual verified truth."""
import hashlib,json,re,sys
from pathlib import Path
from prepare import ROOT,SRC,method
from contracts import CONTRACTS

OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-221'
def source(path,name):
    p=SRC/path;t=p.read_text(encoding='utf-8');s=method(t,name)
    return dict(path=str(p.relative_to(ROOT)).replace('\\','/'),method=name,line=t[:t.index(s)].count('\n')+1,
                sha256=hashlib.sha256(p.read_bytes()).hexdigest(),sliceSha256=hashlib.sha256(s.encode()).hexdigest())
def generate():
    forms=[]
    for f in range(1,5):
        path=f'export/pet/PetTurtle{f}.as';t=(SRC/path).read_text(encoding='utf-8')
        constructor=method(t,f'PetTurtle{f}')
        attacks={}
        for key,body in re.findall(r'attackBackInfoDict\["(\w+)"\] = (\{.*?\});',constructor,re.S):
            attacks[key]=json.loads(body.replace('gc.frameClips * 0.25','6'))
        forms.append(dict(form=f,className=f'PetTurtle{f}',baseClass=re.search(r'extends (\w+)',t)[1],
            rangeExpression=re.search(r'attackRange = ([^;]+)',constructor)[1],attacksAt24Fps=attacks,
            rowFrameCounts=json.loads(re.search(r'setFrameCount\(([^;]+)\);',t)[1]),
            rowHolds=json.loads(re.search(r'setFrameStopCount\(([^;]+)\);',t)[1]),
            skills=['sld','txlj','sybh','xwaoyi'][:f],source=source(path,f'PetTurtle{f}')))
    contracts=[dict(id=cid,source=source(path,name),fixtureSelector=fixture,modernConsumer=consumer,
                    statement=statement,evidenceLevel='确认事实',geometry='deferred-to-TASK-SETTINGS-222')
               for cid,path,name,fixture,consumer,statement in CONTRACTS]
    return dict(truthId='task-settings-221.pet-turtle-behavior',status='behavior-evidence',forms=forms,contracts=contracts,
        unresolvedBehavior=[],deferred=['recursive-display-lists','source-pixel-collision-oracle','body-host-tick-projection','formal-runtime-consumption'],
        runtimeBoundary='AS3 computational slices on bundled AIR 51.1.1.5; controlled external services, no Flash Player or full-scene claim')
def main():
    import jsonschema
    data=generate();schema=json.loads((Path(__file__).with_name('schema.json')).read_text())
    jsonschema.validate(data,schema)
    assert {c['id'] for c in data['contracts']}=={c[0] for c in CONTRACTS} and len(data['contracts'])==32
    assert [f['baseClass'] for f in data['forms']]==['BasePet']*4
    text=json.dumps(data,ensure_ascii=False,indent=2)+'\n';path=OUT/'behavior-contract.json'
    if '--check' in sys.argv:assert path.read_text(encoding='utf-8')==text
    else:path.write_text(text,encoding='utf-8')
    print('221 behavior Schema/source inventory passed: 4 forms, 32 contracts')
if __name__=='__main__':main()
