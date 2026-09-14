"""215 manifest from independent SWF declaration + original AIR display-list measurements."""
import copy
import importlib.util
import json
import math
import sys
sys.dont_write_bytecode=True
from pathlib import Path
from PIL import Image
import jsonschema
from referencing import Registry,Resource

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('incoming_source',ROOT/'tools/incoming-number/source.py')
source=importlib.util.module_from_spec(spec);spec.loader.exec_module(source)
behaviorSpec=importlib.util.spec_from_file_location('verify_behavior',ROOT/'tools/incoming-number/verify_behavior.py')
behaviorVerifier=importlib.util.module_from_spec(behaviorSpec);behaviorSpec.loader.exec_module(behaviorVerifier)
E=ROOT/'docs/tasks/evidence/TASK-SETTINGS-215'
MAN=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-215-player-pet-incoming-damage-feedback.json'
SCHEMA=ROOT/'docs/reverse-engineering/ground-truth/schema/incoming-number-ground-truth.schema.json'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def rel(p):return p.relative_to(ROOT).as_posix()
def bounds(x,y,w,h):return dict(left=x,top=y,width=w,height=h)
def matrix(x,y,s=1):return dict(a=s,b=0,c=0,d=s,tx=x,ty=y)
def expected_states():
    out={}
    for kind in ['hero','pet']:
        for owner in ['P1','P2']:
            for t in [0,.1,.2,.25,.75,1.249,1.25]:
                key=f'{kind}-{owner}-{t:g}'
                out[key]=[] if t>=1.25 else [(123,280 if owner=='P1' else 660,290 if kind=='hero' else 370,t)]
    offsets=[(-20,-20),(-10,-10),(0,0),(10,-10),(20,-20)]
    for count in [1,6,12]:
        out[f'queue-{count}-before']=[];shown=[];left=list(range(count))
        for tick in range(5):
            if tick%2==0 and left:
                places=offsets if len(left)>5 else [(0,0)]
                for x,y in places:shown.append((left.pop(0),450+x,290+y,0))
            out[f'queue-{count}-tick-{tick}']=shown.copy()
    out['queue-stage98']=[];out['direct-stage98-zero']=[(0,450,290,0)];out['explicit-destroy']=[]
    for value in [-12,0,10,1234567890]:out[f'direct-value-{value}']=[(value,450,290,0)]
    for case in read(E/'behavior-fixtures.json')['fixtures']:
        exp=case['expected'];values=exp.get('pnumValues')
        if isinstance(values,list):numbers=[(v,'pet' if case['id'].startswith(('pet-','remote-pet-')) else 'hero') for v in values]
        elif case['id']=='hero-petturtle-transfer':numbers=[(exp['petDamage'],'pet'),(exp['heroDamageAfterTransfer'],'hero')]
        else:continue
        for owner in ['P1','P2']:out[f"behavior-{case['id']}-{owner}"]=[(v,280 if owner=='P1' else 660,370 if kind=='pet' else 290,0) for v,kind in numbers]
    return out
def verify_native(measured,glyphs):
    for path,h in measured['sources'].items():assert source.sha(ROOT/path)==h,path
    assert measured['probeSha256']==source.sha(ROOT/'tools/incoming-number/IncomingProbe.as')
    assert measured['behaviorFixtureSha256']==source.sha(E/'behavior-fixtures.json')
    assert measured['exitCode']==0 and measured['environment'][0]['version']=='WIN 51,1,1,5'
    expected=expected_states();actual={s['id']:s for s in measured['states']}
    assert set(actual)==set(expected)
    for key,numbers in expected.items():
        nodes=actual[key]['objects'];assert len(nodes)==len(numbers),key
        for depth,(n,(value,x,y,t)) in enumerate(zip(nodes,numbers)):
            s=1+3*(1-min(t/.2,1))**2
            phase=max(0,min(1,t-.25));alpha=(1-phase)**2
            assert abs(n['scaleX']-s)<.0001 and abs(n['scaleY']-s)<.0001,key
            assert abs(n['alpha']-alpha)<=1/255 and abs(n['y']-(y-100*(1-alpha)))<=.051,key
            assert n['x']==x and n['depth']==depth and n['mask'] is None and n['filters']==[]
            digits=[int(c) if c.isdigit() else 0 for c in str(value)]
            assert len(n['children'])==len(digits)
            for i,(c,digit) in enumerate(zip(n['children'],digits)):
                assert c['digit']==digit and c['depth']==i and c['x']==i*20 and c['y']==0
                assert c['width']==30 and c['height']==30 and not c['smoothing'] and c['pixelSnapping']=='auto'
                b=c['stageBounds'];assert abs(b['x']-(x+i*20*s))<=.051 and abs(b['width']-30*s)<=.051
                assert abs(b['y']-n['y'])<=.051 and abs(b['height']-30*s)<=.051
        p=E/'native/images'/f'{key}.png';assert Image.open(p).size==(940,590)
        assert source.sha(p)==measured['imageHashes'][p.name]
    for g in glyphs:
        p=E/'native/images'/f"glyph-{g['digit']}.png";im=Image.open(p).convert('RGBA')
        assert im.size==(g['width'],g['height'])==(30,30)
        # SWF stores premultiplied ARGB. Compare alpha exactly and RGB after premultiplication.
        for i,(r,green,b,a) in enumerate(im.get_flattened_data()):
            aa,rr,gg,bb=g['raw'][i*4:i*4+4]
            assert a==aa and max(abs(round(r*a/255)-rr),abs(round(green*a/255)-gg),abs(round(b*a/255)-bb))<=1
    return expected
def make():
    measured=read(E/'native/measurement.json');glyphs=source.extract();expected=verify_native(measured,glyphs)
    states=[];objects=[];baselines=[]
    for state in measured['states']:
        sid=state['id'];states.append(dict(id=sid,entry='Original ANumber/CureHpQueue source fixture',fixtureId=sid,baselineId=sid))
        p=E/'native/images'/f'{sid}.png'
        baselines.append(dict(id=sid,stateId=sid,path=rel(p),sha256=source.sha(p),width=940,height=590,crop=bounds(0,0,940,590)))
        for n in state['objects']:
            parent=f"{sid}.number-{n['depth']}";w=(len(n['children'])-1)*20+30;s=n['scaleX']
            def obj(oid,pid,depth,kind,cid,symbol,mat,local,stage,alpha,asset):
                return dict(id=oid,parentId=pid,depth=depth,objectType=kind,sourceIdentity=dict(provenanceId='swf' if cid else 'native',characterId=cid,symbolClass=symbol,instanceName=None),
                    placements=[dict(stateId=sid,visible=True,localMatrix=mat,registrationPoint=dict(x=0,y=0),localBounds=local,stageBounds=stage,alpha=alpha,derivation='observed',evidenceRefs=['swf','native'])],
                    render=dict(assetRef=asset,blendMode='normal',filters=[],maskId=None))
            objects.append(obj(parent,None,n['depth'],'sprite',None,'my.ANumber',matrix(n['x'],n['y'],s),bounds(0,0,w,30),bounds(n['x'],n['y'],w*s,30*s),n['alpha'],None))
            for c in n['children']:
                g=glyphs[c['digit']];b=c['stageBounds']
                objects.append(obj(f"{parent}.digit-{c['depth']}",parent,c['depth'],'bitmap',g['characterId'],g['symbolClass'],matrix(c['x'],c['y']),bounds(0,0,30,30),bounds(b['x'],b['y'],b['width'],b['height']),1,rel(E/'native/images'/f"glyph-{c['digit']}.png")))
    ids=list(expected);counts={k:sum(1+len(str(n[0])) for n in v) for k,v in expected.items()}
    visual=dict(schemaVersion=1,truthId='task-settings-215.player-pet-incoming-damage-feedback.visual',status='verified',
        scope=dict(taskId='TASK-SETTINGS-215',surfaceId='incoming-pnum',originalVersion='RegiMA 1.1 / bundled AIR 51.1.1.5',description='Isolated original number display list; no modern runtime or game backdrop'),
        generatedBy=dict(tool='tools/generate-incoming-number-truth.py',toolVersion='1',command='python tools/generate-incoming-number-truth.py',generatedAt='2026-09-14T00:00:00Z'),
        provenance=[dict(id='swf',sourceType='restored-swf',sourcePath=rel(source.SWF),sha256=source.sha(source.SWF),locator='SymbolClass pnum0..9 / DefineBitsLossless2'),
                    dict(id='native',sourceType='runtime-capture',sourcePath=rel(E/'native/measurement.json'),sha256=source.sha(E/'native/measurement.json'),locator=f'{len(states)} source ANumber / CureHpQueue states; behavior display replay is not a damage execution trace')],
        stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage',scaleMode='noScale',alignment='TL'),states=states,displayObjects=objects,baselines=baselines,
        completeness=dict(expectedStateIds=ids,extractedStateIds=[s['id'] for s in states],expectedVisibleObjectCountByState=counts,displayListMatched=True,stateSetMatched=True,unresolved=[]))
    behavior=read(E/'behavior-fixtures.json')
    for case in behavior['fixtures']:
        for check in case['sourceChecks']:
            lines=(ROOT/check['path']).read_text(encoding='utf-8').splitlines()
            excerpt='\n'.join(lines[check['startLine']-1:check['endLine']])
            for text in check['contains']:assert text in excerpt,(case['id'],text)
            check['sha256']=source.sha(ROOT/check['path'])
    assert measured['numeric']==[dict(input=n,turtle=int(n*.95),role3=int(n/2)) for n in [0,1,7,20,101]]
    # Full-package call inventory is an explicit completeness assertion, not merely a source snippet check.
    src=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
    occurrences=[p for p in src.rglob('*.as') if 'addHpLose' in p.read_text(encoding='utf-8')]
    assert occurrences==[src/'my/CureHpQueue.as']
    return dict(schemaVersion=1,truthId='task-settings-215.player-pet-incoming-damage-feedback',status='verified',
        visualTruth=visual,glyphs=[{**{k:v for k,v in g.items() if k!='raw'},'assetRef':rel(E/'native/images'/f"glyph-{g['digit']}.png"),'sha256':source.sha(E/'native/images'/f"glyph-{g['digit']}.png")} for g in glyphs],
        animation=source.animation(),
        behavior=behavior,behaviorNative=behaviorVerifier.verify(ROOT,behavior),unresolved=[])
def validate(value):
    schema=read(SCHEMA);ui=read(ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json')
    registry=Registry().with_resource(ui['$id'],Resource.from_contents(ui))
    jsonschema.Draft202012Validator(schema,registry=registry).validate(value)
    # Independent native/source recheck, including every behavior source assertion.
    assert value==make(),'manifest field differs from source/native-backed generation'
def main():
    value=make();validate(value);encoded=json.dumps(value,ensure_ascii=False,indent=2)+'\n'
    if '--check' in sys.argv:assert MAN.read_text(encoding='utf-8')==encoded,'stale manifest'
    else:MAN.write_text(encoded,encoding='utf-8')
    if '--self-test' in sys.argv:
        behaviorVerifier.verify(ROOT,value['behavior'],self_test=True)
        mutations=[('animation','digitStride',21),('animation','anchorOffset',dict(x=-19,y=-60)),('animation','popScale',3),('animation','delaySeconds',.2),('animation','destroySeconds',1.2),('animation','queueIntervalTicks',3),('glyphs',0,{**value['glyphs'][0],'characterId':71}),('behavior','fixtures',value['behavior']['fixtures'][1:]),('visualTruth','displayObjects',value['visualTruth']['displayObjects'][1:]),('visualTruth','states',value['visualTruth']['states'][1:])]
        for group,key,wrong in mutations:
            bad=copy.deepcopy(value);bad[group][key]=wrong
            try:validate(bad)
            except (AssertionError,jsonschema.ValidationError):continue
            raise AssertionError(f'escaped mutation {group}/{key}')
        print(f'{len(mutations)} field mutations rejected')
    print(f"215 verified: {len(value['visualTruth']['states'])} native states, 10 source bitmaps, {len(value['behavior']['fixtures'])} source fixtures; Schema/source/native complete")
if __name__=='__main__':main()
