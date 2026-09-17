"""Check translation and tiled-field experiments without treating them as truth."""
import functools
import argparse
import json
import math
import numpy as np
from PIL import Image
from run import WORK,OUT,save,sha
from verify import target_sample


@functools.lru_cache(maxsize=512)
def read(path):
    if not path.exists():return np.zeros((128,128),bool)
    return np.all(np.array(Image.open(path).convert('RGB'))==[0,255,255],axis=2)


def tiled(row,folder,padding=0):
    q=row['intersection'];w,h=int(q['width']),int(q['height'])
    if w<1 or h<1:return np.zeros((0,0),bool)
    dx=row['sourceDraw']['x'];dy=row['sourceDraw']['y']
    tx=math.trunc(round(dx*20)/5);ty=math.trunc(round(dy*20)/5)
    ix,iy=tx//4,ty//4;phase=(ty%4)*4+tx%4
    y,x=np.mgrid[:h,:w];x=x-ix;y=y-iy
    result=np.zeros((h,w),bool)
    for cy in np.unique(y//128):
        for cx in np.unique(x//128):
            mask=(x//128==cx)&(y//128==cy)
            bits=read(folder/f"{row['field']}-{cx}-{cy}-{phase}.png")
            result[mask]=bits[y[mask]%128+padding,x[mask]%128+padding]
    return result & target_sample(row,result.shape)


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--padded19',action='store_true');args=parser.parse_args()
    folder=WORK/'diagnostic-air'
    reference=read(folder/'translation/shift-0.png')
    shifts=[dict(shift=s,pixels=int(np.count_nonzero(reference!=read(folder/f'translation/shift-{s}.png')[s:s+130,s:s+120])))
            for s in [0,1,2,4,8,16,32,64,128,256,512,800]]
    native_work=WORK.parent/'full' if args.padded19 else WORK
    native=json.loads((native_work/'measurement.json').read_text())
    rows=[r for r in native['cases'] if r['field']==('PetTurtle1Bullet2-19-s1-d-1' if args.padded19 else 'PetTurtle1Bullet2-17-s1-d1')]
    differences=[];pixels=0
    for row in rows:
        p=tiled(row,folder/'tiles',64 if args.padded19 else 0);actual=read(native_work/'oracle'/(row['id']+'.png')) if p.size else p
        n=int(np.count_nonzero(p!=actual));pixels+=p.size
        if n:differences.append(dict(id=row['id'],pixels=n))
    report=dict(status='diagnostic-only',translation=shifts,tiledCases=len(rows),pixels=pixels,
                tiledDifferences=differences,measurementSha256=sha(native_work/'measurement.json'),
                scope='One SLD nested state. Neither a full sampler nor permission for approximation.')
    save(OUT/('padded-diagnostic.json' if args.padded19 else 'sampling-diagnostic.json'),report);print(json.dumps(report,indent=2))


if __name__=='__main__':main()
