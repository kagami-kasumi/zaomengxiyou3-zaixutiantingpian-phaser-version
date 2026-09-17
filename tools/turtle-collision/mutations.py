"""Kill sampling mutants against the unchanged candidate, never using residuals as kills."""
import copy
import json
import numpy as np
import verify as sampler
from run import WORK,OUT,sha,save


def main():
    sampler.WORK=WORK.parent/'full'
    native=json.loads((sampler.WORK/'measurement.json').read_text());fields={f['id']:f for f in native['fields']}
    selected=[r for r in native['cases'] if r['fixture'] in ['P1-center','P1-phase-1','P2-left-4']]
    counts={name:0 for name in ['rectangle','empty-mask','first-phase','flip','scale','root','target','subpixel']}
    examples={}
    for r in selected:
        base=sampler.sample(r,fields)
        if not base.size:continue
        for name in counts:
            if name=='rectangle':changed=np.ones_like(base)
            elif name=='empty-mask':changed=np.zeros_like(base)
            else:
                m=copy.deepcopy(r)
                if name=='first-phase':m['field']=f"{r['symbol']}-0-s{r['scale']}-d{r['sign']}"
                elif name=='flip':m['field']=f"{r['symbol']}-{r['tick']}-s{r['scale']}-d{-r['sign']}"
                elif name=='scale':
                    if r['symbol']!='PetTurtle3Bullet3':continue
                    m['field']=f"{r['symbol']}-{r['tick']}-s{3-r['scale']}-d{r['sign']}"
                elif name=='root':m['sourceRoot']['x']+=17
                elif name=='target':m['targetIndex']=(m['targetIndex']+1)%3
                elif name=='subpixel':m['sourceRoot']['x']+=.45
                changed=sampler.sample(m,fields)
            if not np.array_equal(base,changed):counts[name]+=1;examples.setdefault(name,r['id'])
    report=dict(status='passed' if all(counts.values()) else 'failed',selectedCases=len(selected),kills=counts,examples=examples,
                nativeSha256=sha(sampler.WORK/'measurement.json'),samplerSha256=sha(__import__('pathlib').Path(sampler.__file__)),
                comparison='Each mutant vs the unmodified candidate on identical input; known native residuals cannot kill mutants.')
    save(OUT/'sampling-mutations.json',report);print(report);assert report['status']=='passed'


if __name__=='__main__':main()
