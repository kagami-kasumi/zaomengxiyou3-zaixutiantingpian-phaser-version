"""Independent lookup vs original HitTest; reject unapproved residuals and any hit-result difference."""
from pathlib import Path
import hashlib
import json
import math
import sys
import zlib
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-219'


def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()


def load_fields(report,folder):
    result={}
    for field in report['maskFields']:
        p=folder/'mask-fields'/(field['id']+'.deflate')
        assert sha(p)==field['sha256']
        raw=zlib.decompress(p.read_bytes())
        assert len(raw)==field['rawBytes']==field['phaseStride']*400
        table=np.frombuffer(raw,dtype=np.uint8).reshape(400,field['phaseStride'])
        planes=np.unpackbits(table,axis=1,bitorder='little')[:,:field['width']*field['height']]
        result[field['id']]=(field,planes.reshape(400,field['height'],field['width']).astype(bool))
    return result


def sample(item,asset,fields,mutant=None):
    direction='left' if item['sign']==1 else 'right'
    if mutant=='wrong-flip':direction='right' if direction=='left' else 'left'
    field,planes=fields[asset['maskGroup']+'-'+direction]
    q=item['intersection'];w,h=int(q['width']),int(q['height'])
    if w<1 or h<1:return np.zeros((0,0),bool)
    dx=item['sourceRoot']['x']-q['x'];dy=item['sourceRoot']['y']-q['y']
    if mutant=='wrong-root':dx+=1;dy+=1
    if mutant=='crop-as-root':dx+=asset['cropX'];dy+=asset['cropY']
    # Empirical signed quarter-pixel translation; negative draw origins truncate toward zero.
    tx=math.trunc(round(dx*20)/5)*5;ty=math.trunc(round(dy*20)/5)*5
    ix=tx//20;iy=ty//20;px=tx%20;py=ty%20
    phase=py*20+px
    if mutant=='integer-phase':phase=0
    y,x=np.mgrid[:h,:w];x=x+field['originX']-ix;y=y+field['originY']-iy
    inside=(x>=0)&(y>=0)&(x<field['width'])&(y<field['height'])
    result=np.zeros((h,w),bool)
    result[inside]=planes[phase,y[inside],x[inside]]
    if mutant=='rectangle':result[:]=True
    return result


def compare(folder,fields):
    report=json.loads((folder/'measurement.json').read_text(encoding='utf-8'))
    assets={(a['symbol'],a['frame']):a for a in report['assets']}
    mismatch=[];pixels=0;boolean_mismatch=[];cases=[]
    for item in report['actual']:
        prediction=sample(item,assets[(item['symbol'],item['frame'])],fields)
        if bool(prediction.any())!=item['actual']:boolean_mismatch.append(item['id'])
        if not prediction.size:
            assert not item['actual'] and item['cyanPixels']==0
            cases.append((item,prediction,prediction))
            continue
        actual=np.all(np.array(Image.open(folder/'buffers'/(item['id']+'.png')).convert('RGB'))==[0,255,255],axis=2)
        different=int(np.count_nonzero(actual!=prediction));pixels+=actual.size
        assert bool(np.any(actual))==item['actual'] and int(np.count_nonzero(actual))==item['cyanPixels']
        if different:
            points=[dict(x=int(x),y=int(y),source=bool(actual[y,x]),approximation=bool(prediction[y,x])) for y,x in np.argwhere(actual!=prediction)]
            mismatch.append(dict(id=item['id'],pixels=different,points=points))
        cases.append((item,actual,prediction))
    return dict(dataset=folder.name,cases=len(report['actual']),pixels=pixels,booleanMismatches=boolean_mismatch,mismatches=mismatch),cases,assets


def mutations(cases,assets,fields):
    counts={name:0 for name in ['first-frame-mask','rectangle','wrong-flip','wrong-root','crop-as-root','integer-phase','blank-frame-stale','last-frame-destroy-first']}
    last={'PetDragon2Bullet1':15,'PetDragon2Bullet2':30,'PetDragon3Bullet1':21,'PetDragon3Bullet3':10}
    first={}
    for item,_,_ in cases:
        if item['frame']==1:first[(item['symbol'],item['sign'])]=item
    for item,actual,baseline in cases:
        asset=assets[(item['symbol'],item['frame'])]
        for mutant in counts:
            if mutant=='first-frame-mask':pred=sample(item,assets[(item['symbol'],1)],fields)
            elif mutant=='last-frame-destroy-first':
                pred=np.zeros_like(baseline) if item['frame']==last[item['symbol']] else baseline
            elif mutant=='blank-frame-stale':
                if item['bullet']['width'] or item['bullet']['height']:continue
                original=first[(item['symbol'],item['sign'])];box=original['bullet'];root=original['sourceRoot'];target=item['target']
                x=item['sourceRoot']['x']+box['x']-root['x'];y=item['sourceRoot']['y']+box['y']-root['y']
                left=max(x,target['x']);top=max(y,target['y'])
                width=min(x+box['width'],target['x']+target['width'])-left
                height=min(y+box['height'],target['y']+target['height'])-top
                changed={**item,'intersection':dict(x=left,y=top,width=max(0,width),height=max(0,height))}
                pred=sample(changed,assets[(item['symbol'],1)],fields)
            else:pred=sample(item,asset,fields,mutant)
            # Compare against the accepted algorithm, so known native residuals cannot kill a mutation by themselves.
            if pred.shape!=baseline.shape or not np.array_equal(pred,baseline):counts[mutant]+=1
    assert all(counts.values()),counts
    return counts


def main():
    native=json.loads((OUT/'air-original/measurement.json').read_text(encoding='utf-8'))
    fields=load_fields(native,OUT/'air-original');results=[];all_cases=[];assets={}
    for name in ['air-original','edge-probe','roots-probe']:
        result,cases,items=compare(OUT/name,fields);results.append(result);all_cases+=cases;assets.update(items)
    result=dict(status='measured',cases=sum(r['cases'] for r in results),pixels=sum(r['pixels'] for r in results),datasets=results,
                exactAirEquivalence=False,scope='Finite source-compiled phase fields; explicit user-approved collision approximation')
    if '--freeze-approved-differences' in sys.argv:
        approval=json.loads((OUT/'approved-approximation.json').read_text(encoding='utf-8'))
        assert approval['status']=='user-approved' and approval['userAnswer']=='允许记录近似后实现'
        save=dict(approvalSha256=sha(OUT/'approved-approximation.json'),differences={r['dataset']:r['mismatches'] for r in results})
        (OUT/'approved-buffer-differences.json').write_text(json.dumps(save,indent=2)+'\n',encoding='utf-8')
    allowed=json.loads((OUT/'approved-buffer-differences.json').read_text(encoding='utf-8'))
    assert allowed['approvalSha256']==sha(OUT/'approved-approximation.json')
    for measured in results:
        expected={i['id']:i for i in allowed['differences'][measured['dataset']]}
        assert not measured['booleanMismatches'],measured['booleanMismatches']
        for mismatch in measured['mismatches']:
            assert mismatch['id'] in expected and mismatch==expected[mismatch['id']],mismatch
    result['mutations']=mutations(all_cases,assets,fields)
    assert all(count>sum(len(r['mismatches']) for r in results) for count in result['mutations'].values())
    result['status']='passed-with-approved-approximation'
    (OUT/'sampling-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print('219 independent phase lookup:',result['status'],result['cases'],'cases',result['pixels'],'pixels')
    print('Residual pixels:',sum(m['pixels'] for r in results for m in r['mismatches']),'Mutation detections:',result['mutations'])
    if '--strict' in sys.argv and any(r['mismatches'] for r in results):raise SystemExit(1)


if __name__=='__main__':main()
