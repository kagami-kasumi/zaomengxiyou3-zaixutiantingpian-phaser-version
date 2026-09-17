"""Rebuild unfiltered native owner groups solely from independently sampled parts."""
import gzip
import hashlib
import numpy as np
from PIL import Image
from run import ROOT, BASE, OUT, sha
from pack import encoded
from verify_pixels import load, image, stable, difference


def selected(group):
    return group.get('canonical',group['primary'].get('canonical',group['primary']))


def rebuild(parts,work):
    layers=[selected(p) for p in parts if not selected(p)['empty']]
    if not layers:return Image.new('RGBA',(1,1)),dict(x=0,y=0)
    left=min(p['origin']['x'] for p in layers);top=min(p['origin']['y'] for p in layers)
    right=max(p['origin']['x']+p['width'] for p in layers);bottom=max(p['origin']['y']+p['height'] for p in layers)
    result=np.zeros((bottom-top,right-left,4),dtype=np.uint32)
    for p in layers:
        src=np.asarray(image(work/p['path']),dtype=np.uint32).copy()
        src[:,:,:3]=(src[:,:,:3]*src[:,:,3:4]+255)//256
        x,y=p['origin']['x']-left,p['origin']['y']-top
        dst=result[y:y+p['height'],x:x+p['width']]
        dst[:]=src+dst*(256-src[:,:,3:4])//256
    result[:,:,:3]=np.minimum(255,result[:,:,:3]*256//np.maximum(result[:,:,3:4],1))
    return Image.fromarray(result.astype(np.uint8)),dict(x=left,y=top)


def main():
    results=[];contracts=[];failures=[];archive={};checked_images=set()
    for mode in ('dynamic','buff'):
        work=BASE/mode;reference=BASE/(mode+'-components')
        captured=load(reference/'layers.json')['rows']
        raw=load(work/'layers.json')['rows'];assert len(raw)==len(captured)
        source=load(ROOT/('docs/tasks/evidence/TASK-SETTINGS-222A/'+mode+'-native.json.gz'))['rows']
        observed=load(reference/'measurement.json')['rows'];assert len(source)==len(observed)
        for a,b in zip(source,observed):
            assert {k:v for k,v in a.items() if k not in ('capture','captureSha256','originalCapturePath')}=={k:v for k,v in b.items() if k not in ('capture','captureSha256','originalCapturePath')}
        source_map={r['id']+'-'+str(r['tick']):r for r in source}
        for row,ref in zip(raw,captured):
            assert row['id']==ref['id']
            groups={g['path']:g for g in row['groups']}
            for group in ref['groups']:
                parent=groups[group['path']];parts=parent['components'];expected=selected(group)
                rebuilt,origin=rebuild(parts,work)
                pixels=difference(rebuilt,image(reference/expected['path'])) if origin==expected['origin'] else -1
                okay=stable(group,reference) and pixels==0
                item=dict(mode=mode,id=row['id'],parentPath=group['path'],parts=len(parts),differentPixels=pixels,passed=okay)
                results.append(item)
                if not okay:failures.append(item)
                node=source_map[row['id']]['display']['children'][parent['depth']]
                contracts.append(dict(corpus=mode,id=row['id'],parentPath=group['path'],sourceParentSha256=hashlib.sha256(encoded(node)).hexdigest(),
                    parentFilterSha256=hashlib.sha256(encoded(node.get('filters',[]))).hexdigest(),parentFilters=node.get('filters',[]),
                    componentPaths=[p['path'] for p in parts],componentParentFiltersApplied=False,
                    canonicalDisplay='filtered owner group from main corpus; raw components are unfiltered witnesses, never substituted or filtered twice'))
                for unit in [group['primary'],group['expanded'],group['primary'].get('canonical')]:
                    if unit is None:continue
                    payload=(reference/unit['path']).read_bytes();digest=hashlib.sha256(payload).hexdigest()
                    target=OUT/'component-witnesses'/(digest+'.png')
                    if digest not in checked_images:
                        target.parent.mkdir(exist_ok=True);target.write_bytes(payload);checked_images.add(digest)
                    unit['originalPath']=unit['path'];unit['path']=target.relative_to(ROOT).as_posix();unit['sha256']=digest
        archive[mode]=captured
    (OUT/'component-native.json.gz').write_bytes(gzip.compress(encoded(archive),mtime=0))
    (OUT/'component-contracts.json.gz').write_bytes(gzip.compress(encoded(contracts),mtime=0))
    report=dict(status='passed' if not failures else 'unresolved',groups=len(results),sourceTraceUnchanged=True,differences=failures,results=results,
                nativeRuns={mode:sha(OUT/(mode+'-components-run.json')) for mode in ('dynamic','buff')})
    (OUT/'components-verification.json').write_bytes(encoded(report))
    print('225 raw components:',report['status'],len(results),'groups;',len(failures),'failures',failures[:5])
    if failures:raise SystemExit(1)


if __name__=='__main__':main()
