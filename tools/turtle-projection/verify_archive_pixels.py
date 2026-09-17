"""Verify the actual content-addressed archive; avoid rereading duplicate captures."""
import argparse
from pathlib import Path
from functools import lru_cache
from PIL import Image
import verify_pixels as pixels
from run import ROOT, OUT, sha
from pack import encoded
from exceptions import approved, matches


@lru_cache(maxsize=256)
def decoded(path):
    return Image.open(path).convert('RGBA')


def main(mode):
    path=OUT/(mode+'-resources.json.gz');data=pixels.load(path)
    source_path=ROOT/data['sourceCorpus'];assert sha(source_path)==data['sourceCorpusSha256']
    source=pixels.load(source_path);run=pixels.load(OUT/(mode+'-run.json'))
    assert sha(OUT/(mode+'-run.json'))==data['nativeRunSha256']
    work=ROOT/run['work'] if 'work' in run else Path(run['command'][-1])
    measurement=work/'measurement.json';assert sha(measurement)==run['measurementSha256']
    observed=pixels.load(measurement)
    if mode=='body':
        assert observed['clocks']==source['clocks']
        refs={r['id']:dict(path=r['file'],sha256=r['sha256']) for r in source['cells']}
    elif mode=='effects':
        refs={b['id']:b for s in source['states'] for b in s['baselines']}
        trees={(s['symbol'],s['tick']):s['tree'] for s in source['states']}
        assert all(s['tree']==trees[(s['symbol'],s['tick'])] for s in observed['states'])
    else:
        refs={r['id']+'-'+str(r['tick']):dict(path=r['capture'],sha256=r['captureSha256'],source=r) for r in source['rows']}
        assert len(refs)==len(observed['rows'])
        for r in observed['rows']:
            old=refs[r['id']+'-'+str(r['tick'])]['source']
            assert {k:v for k,v in r.items() if k not in ('capture','captureSha256','originalCapturePath')}=={k:v for k,v in old.items() if k not in ('capture','captureSha256','originalCapturePath')}
    assert len(data['rows'])==len(refs) and {r['id'] for r in data['rows']}==set(refs)
    inputs={p.relative_to(ROOT).as_posix():sha(p) for p in [path,source_path,measurement,ROOT/'tools/turtle-projection/verify_pixels.py',ROOT/'tools/turtle-projection/verify_archive_pixels.py',ROOT/'tools/turtle-projection/exceptions.py',OUT/'visual-exception-approval.json',OUT/'diagnostics/exact-unresolved-pixels.json']}
    for name in ('transfer.py','pack.py','run.py'):
        dependency=ROOT/'tools/turtle-projection'/name;inputs[dependency.relative_to(ROOT).as_posix()]=sha(dependency)
    environment=OUT/'verification-environment.json';inputs[environment.relative_to(ROOT).as_posix()]=sha(environment)
    allowed=approved() if mode=='dynamic' else {}
    pixels.image=decoded;seen=set();results=[];extents=[];unapproved=[];exceptions=[]
    for row in data['rows']:
        for group in row.get('groups',[row]):
            for unit in [group,*group.get('components',[]),*group.get('paintParts',[])]:
                for c in [unit['primary'],unit['expanded'],unit.get('canonical'),unit['primary'].get('canonical')]:
                    if c and c['sha256'] not in seen:
                        assert sha(ROOT/c['path'])==c['sha256'];seen.add(c['sha256'])
                if not pixels.stable(unit,ROOT):extents.append(dict(id=row['id'],path=unit.get('path','root')))
        ref=refs[row['id']]
        if ref['sha256'] not in seen:
            assert sha(ROOT/ref['path'])==ref['sha256'];seen.add(ref['sha256'])
        actual=pixels.compose(row,ROOT);expected=decoded(ROOT/ref['path'])
        count=pixels.difference(actual,expected)
        results.append(dict(id=row['id'],differentPixels=count))
        if count:
            if matches(row['id'],ref['sha256'],expected,actual,allowed):exceptions.append(results[-1])
            else:unapproved.append(results[-1])
    failures=[r for r in results if r['differentPixels']]
    report=dict(status='passed' if not unapproved and not extents else 'unresolved',mode=mode,states=len(results),differentStates=len(failures),differentPixels=sum(r['differentPixels'] for r in failures),
                sourceTraceUnchanged=True,extentFailures=extents,results=results,differences=failures,inputSha256=inputs,visualExceptions=exceptions,unapprovedDifferences=unapproved,scope='Direct decoding of the225 native-resource archive against immutable222A originals; only user-approved exact RGBA tuples are exempted.')
    assert all(sha(ROOT/p)==digest for p,digest in inputs.items())
    (OUT/(mode+'-archived-pixels.json')).write_bytes(encoded(report))
    print(mode,'archive',report['status'],len(results),'states;',len(failures),'different states;',report['differentPixels'],'pixels; extents',len(extents))
    if unapproved or extents:raise SystemExit(1)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=['body','effects','dynamic','buff']);main(parser.parse_args().mode)
