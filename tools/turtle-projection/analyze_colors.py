"""Diagnostic only: compare arithmetic hypotheses on native colour witnesses."""
import itertools
import numpy as np
from verify_pixels import load, image, ROOT, BASE

work = BASE / 'dynamic-colors'
rows = load(work / 'layers.json')['rows']
refs = {r['id']+'-'+str(r['tick']):r for r in load(ROOT / 'docs/tasks/evidence/TASK-SETTINGS-222A/dynamic-native.json.gz')['rows']}
samples=[]
for r in rows:
    gs=[ [np.asarray(image(work/p),dtype=np.int64) for p in g['images']] for g in r['groups'] ]
    ref=np.asarray(image(ROOT/refs[r['id']]['capture']),dtype=np.int64)
    mask=np.any(ref,axis=2)
    for t,b,w in gs:mask |= t[:,:,3]>0
    samples.append((r['id'],[(t[mask],b[mask],w[mask]) for t,b,w in gs],ref[mask]))
best=[]
for div,add,unround,aplus,unscale in itertools.product([255,256],[0,127,128,254,255],[0,0.5],[0,1],[255,256]):
    counts=[]
    for ident,gs,ref in samples:
        dest=np.zeros_like(ref)
        for t,b,w in gs:
            a=t[:,3:4]
            src=np.concatenate((b[:,:3],a),axis=1)
            dest=src+(dest*(255-a+aplus)+add)//div
            dest=np.minimum(dest,255)
        a=dest[:,3:4]
        rgb=np.floor(dest[:,:3]*unscale/np.maximum(a,1)+unround).clip(0,255).astype(np.int64)
        out=np.concatenate((rgb,a),axis=1)
        counts.append(int(np.count_nonzero(np.any(out!=ref,axis=1))))
    best.append((sum(counts),(div,add,unround,aplus,unscale),counts))
print('black premult hypotheses',sorted(best)[:12])
for ident,gs,ref in samples:
    print(ident,'groups',len(gs),'pixels',len(ref))
