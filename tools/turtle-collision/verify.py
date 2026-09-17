"""Held-out oracle comparison for an independently rendered source-field sampler."""
import functools
import argparse
import json
import math
import numpy as np
from PIL import Image
from run import WORK, OUT, save, sha


@functools.lru_cache(maxsize=64)
def plane(key, phase):
    return np.all(np.array(Image.open(WORK/'fields'/f'{key}-{phase}.png').convert('RGB'))==[0,255,255],axis=2)


@functools.lru_cache(maxsize=256)
def target_plane(index,phase):
    return np.all(np.array(Image.open(WORK/'targets'/f't{index}-{phase}.png').convert('RGB'))==[255,0,0],axis=2)


def target_sample(row,shape):
    dx,dy=row['targetDraw']['x'],row['targetDraw']['y']
    tx,ty=math.trunc(dx*20),math.trunc(dy*20)
    ix,iy=tx//20,ty//20;phase=(ty%20)*20+tx%20
    bits=target_plane(row['targetIndex'],phase)
    y,x=np.mgrid[:shape[0],:shape[1]];x=x+150-ix;y=y+150-iy
    valid=(x>=0)&(y>=0)&(x<bits.shape[1])&(y<bits.shape[0])
    result=np.zeros(shape,bool);result[valid]=bits[y[valid],x[valid]]
    return result


@functools.lru_cache(maxsize=512)
def tile_plane(key,cx,cy,phase):
    path=WORK/'tiles'/f'{key}-{cx}-{cy}-{phase}.png'
    if not path.exists():return np.zeros((128,128),bool)
    return np.all(np.array(Image.open(path).convert('RGB'))==[0,255,255],axis=2)


def tiled_sample(row,w,h,ix,iy,phase):
    y,x=np.mgrid[:h,:w];x=x-ix;y=y-iy
    result=np.zeros((h,w),bool)
    for cy in np.unique(y//128):
        for cx in np.unique(x//128):
            mask=(x//128==cx)&(y//128==cy)
            bits=tile_plane(row['field'],cx,cy,phase)
            result[mask]=bits[y[mask]%128,x[mask]%128]
    return result


def sample(row, fields):
    q=row['intersection'];w,h=int(q['width']),int(q['height'])
    if w<1 or h<1:return np.zeros((0,0),bool)
    dx=row['sourceRoot']['x']-q['x'];dy=row['sourceRoot']['y']-q['y']
    tx=math.trunc(round(dx*20)/5);ty=math.trunc(round(dy*20)/5)
    ix,iy=tx//4,ty//4;phase=(ty%4)*4+tx%4
    field=fields[row['field']]
    if field.get('layout')=='tiles128':result=tiled_sample(row,w,h,ix,iy,phase)
    else:
        bits=plane(row['field'],phase)
        y,x=np.mgrid[:h,:w];x=x+field['originX']-ix;y=y+field['originY']-iy
        valid=(x>=0)&(y>=0)&(x<bits.shape[1])&(y<bits.shape[0])
        result=np.zeros((h,w),bool);result[valid]=bits[y[valid],x[valid]]
    return result & target_sample(row,result.shape) if 'targetDraw' in row else result


def approved_residual(residual, boolean):
    approval=json.loads((OUT/'sampling-approval.json').read_text(encoding='utf-8'))
    allowed=json.loads((OUT/'residual-cases.json').read_text(encoding='utf-8'))
    assert approval['status']=='approved' and sha(OUT/'residual-cases.json')==approval['residualSha256']
    assert sha(OUT/'sampling-exception.md')==approval['decisionSha256']
    return residual==allowed['cases'] and not boolean


def main():
    global WORK
    parser=argparse.ArgumentParser();parser.add_argument('--full',action='store_true');args=parser.parse_args()
    if args.full:WORK=WORK.parent/'full'
    native=json.loads((WORK/'measurement.json').read_text());fields={f['id']:f for f in native['fields']}
    diffs=[];boolean=[];pixels=0;positive=0;by_symbol={};residual=[]
    for row in native['cases']:
        pred=sample(row,fields)
        if pred.size:actual=np.all(np.array(Image.open(WORK/'oracle'/(row['id']+'.png')).convert('RGB'))==[0,255,255],axis=2)
        else:actual=pred
        assert bool(actual.any())==row['actual'],row['id']
        mismatch=int(np.count_nonzero(actual!=pred));pixels+=actual.size;positive+=int(row['actual'])
        if mismatch:
            diffs.append(dict(id=row['id'],pixels=mismatch))
            residual.append(dict(id=row['id'],sourceDraw=row['sourceDraw'],intersection=row['intersection'],
                originalHit=row['actual'],candidateHit=bool(pred.any()),
                points=[dict(x=int(x),y=int(y),original=bool(actual[y,x]),candidate=bool(pred[y,x])) for y,x in np.argwhere(actual!=pred)]))
        if bool(pred.any())!=row['actual']:boolean.append(row['id'])
        stat=by_symbol.setdefault(row['symbol'],dict(cases=0,pixels=0,differentPixels=0,booleanMismatches=0))
        stat['cases']+=1;stat['pixels']+=actual.size;stat['differentPixels']+=mismatch
        stat['booleanMismatches']+=int(bool(pred.any())!=row['actual'])
    approved=False
    if args.full and (OUT/'sampling-approval.json').exists():
        approved=approved_residual(residual,boolean)
    report=dict(task='TASK-SETTINGS-222B',status='passed-with-approved-residual' if approved else ('passed' if not diffs else 'unresolved'),
                cases=len(native['cases']),pixels=pixels,positive=positive,bySymbol=by_symbol,
                differentPixels=sum(d['pixels'] for d in diffs),differentCases=len(diffs),
                booleanMismatches=len(boolean),examples=diffs[:20],booleanExamples=boolean[:20],
                fixtureSha256=sha(OUT/('fixtures.json' if args.full else 'preflight-fixtures.json')),measurementSha256=sha(WORK/'measurement.json'),
                approvedResidual=approved,scope='Finite complete recursive phase matrix; user-approved exact residual list only. Dynamic callers and family closure have separate gates.')
    save(OUT/('sampling-verification.json' if args.full else 'preflight-sampling.json'),report);save(WORK/'differences.json',dict(pixel=diffs,boolean=boolean))
    print(json.dumps(report,indent=2))
    if diffs and not approved:raise SystemExit(1)


if __name__=='__main__':main()
