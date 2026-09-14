"""Compare a pure field sampler with held-out original HitTest buffers."""
import hashlib
import json
import math
import io
import runpy
import zlib
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-220'


def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()


def fields():
    report=json.loads((OUT/'source-fields/measurement.json').read_text())
    logs=((OUT/'source-fields/stdout.log').read_bytes()+b'\n'+(OUT/'source-fields/stderr.log').read_bytes()).decode('utf-8',errors='replace').splitlines()
    assert 'COMPLETE 30 15' in logs and not any(line.startswith('FAIL ') for line in logs)
    assert [{k:v for k,v in f.items() if k!='sha256'} for f in report['fields']]==[json.loads(line[6:]) for line in logs if line.startswith('FIELD ')]
    assert sha(OUT/'source-fields/probe.as.txt')==report['probeSha256']
    result={}
    for field in report['fields']:
        path=OUT/'source-fields'/(field['id']+'.deflate')
        assert sha(path)==field['sha256']
        raw=zlib.decompress(path.read_bytes())
        assert len(raw)==field['rawBytes']==16*field['phaseStride']
        table=np.frombuffer(raw,dtype=np.uint8).reshape(16,field['phaseStride'])
        data=np.unpackbits(table,axis=1,bitorder='little')[:,:field['width']*field['height']]
        result[field['id']]=(field,data.reshape(16,field['height'],field['width']).astype(bool))
    return result


def sample(item,lookup,mutant=None):
    tile=(item['frame']-1)%15+1
    if mutant=='first-frame': tile=1
    sign=item['sign'] if mutant!='flip' else -item['sign']
    meta,planes=lookup[f'tile-{tile}-'+('left' if sign==1 else 'right')]
    q=item['intersection'];w,h=int(q['width']),int(q['height'])
    if w<1 or h<1:return np.zeros((0,0),bool)
    dx=item['sourceRoot']['x']-q['x'];dy=item['sourceRoot']['y']-q['y']
    if mutant=='root': dx+=20;dy+=20
    if mutant=='crop': dx+=1200;dy+=600
    tx=math.trunc(round(dx*20)/5);ty=math.trunc(round(dy*20)/5)
    ix=tx//4;iy=ty//4;phase=(ty%4)*4+tx%4
    if mutant=='phase': phase=0
    y,x=np.mgrid[:h,:w];x=x+meta['originX']-ix;y=y+meta['originY']-iy
    valid=(x>=0)&(y>=0)&(x<meta['width'])&(y<meta['height'])
    result=np.zeros((h,w),bool);result[valid]=planes[phase,y[valid],x[valid]]
    if mutant=='rectangle': result[:]=True
    if mutant=='last-frame' and item['frame']==48: result[:]=False
    return result


def main():
    native=json.loads((OUT/'air-original/measurement.json').read_text())
    read_buffer=runpy.run_path(str(ROOT/'tools/dragon4-oracle-buffers.py'))['read_buffer']
    lookup=fields();mismatch=[];boolean=[];pixels=0;positive=0
    mutations={name:0 for name in ['first-frame','flip','root','crop','phase','rectangle','last-frame']}
    for item in native['actual']:
        pred=sample(item,lookup)
        if pred.size:
            name=item['id']+'.png';data=read_buffer(name)
            assert hashlib.sha256(data).hexdigest()==native['artifactHashes']['buffers'][name]
            actual=np.all(np.array(Image.open(io.BytesIO(data)).convert('RGB'))==[0,255,255],axis=2)
        else: actual=pred
        assert bool(actual.any())==item['actual'] and int(actual.sum())==item['cyanPixels']
        pixels+=actual.size;positive+=int(item['actual'])
        if bool(pred.any())!=item['actual']:boolean.append(item['id'])
        count=int(np.count_nonzero(actual!=pred))
        if count: mismatch.append(dict(id=item['id'],pixels=count))
        for mutation in mutations:
            changed=sample(item,lookup,mutation)
            if not np.array_equal(changed,pred):mutations[mutation]+=1
    report=dict(status='passed' if not mismatch and not boolean else 'unresolved',
                cases=len(native['actual']),pixels=pixels,positive=positive,negative=len(native['actual'])-positive,
                booleanMismatches=boolean,pixelMismatches=mismatch,mutations=mutations,
                fieldReportSha256=sha(OUT/'source-fields/measurement.json'),oracleReportSha256=sha(OUT/'air-original/measurement.json'),
                blankFrameMutation='Not applicable: source has nonempty masked tiles in all 48 frames; verify from native state set.',
                exactAirEquivalence=False,scope='Finite original inputs; no claim of universal AIR raster equivalence.')
    (OUT/'sampling-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print({k:v for k,v in report.items() if k not in ['pixelMismatches','booleanMismatches']})
    print('Differences:',len(boolean),'hit booleans,',sum(x['pixels'] for x in mismatch),'pixels in',len(mismatch),'cases')
    if mismatch or boolean or not all(mutations.values()): raise SystemExit(1)


if __name__=='__main__': main()
