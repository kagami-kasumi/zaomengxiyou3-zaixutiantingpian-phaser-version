"""Freeze independent native expectations; never imports production TS or 223 render()."""
from pathlib import Path
import gzip, hashlib, io, json, sys, zipfile
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
E = ROOT/'docs/tasks/evidence'
OUT = E/'TASK-SLICE-224A1'
OUT.mkdir(parents=True, exist_ok=True)
def load(p):
    raw=p.read_bytes(); return json.loads(gzip.decompress(raw) if p.suffix=='.gz' else raw)
def digest(raw): return hashlib.sha256(raw).hexdigest()
def save(p, value): p.write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n',encoding='utf-8',newline='\n')

def visual():
    sys.path.insert(0,str(ROOT/'tools/turtle-projection'))
    from exceptions import approved
    allowed=approved(); rows=[]
    for mode in ['body','effects','dynamic','buff']:
        n=load(E/'TASK-SETTINGS-222A'/f'{mode}-native.json.gz')
        if mode=='body': refs=[(r['id'],r['file'],r['sha256']) for r in n['cells']]
        elif mode=='effects': refs=[(r['id'],r['path'],r['sha256']) for s in n['states'] for r in s['baselines']]
        else: refs=[(r['id']+'-'+str(r['tick']),r['capture'],r['captureSha256']) for r in n['rows']]
        for identity,path,sha in refs:
            raw=(ROOT/path).read_bytes(); assert digest(raw)==sha
            image=np.asarray(Image.open(io.BytesIO(raw)).convert('RGBA')).copy()
            assert image.shape==(590,940,4)
            native_hash=digest(image.tobytes()); exceptions=[]
            if mode=='dynamic' and identity in allowed:
                exception=allowed[identity]; assert exception['baselineSha256']==sha
                exceptions=exception['pixels']
                for point in exceptions:
                    assert image[point['y'],point['x']].tolist()==point['original']
                    image[point['y'],point['x']]=point['candidate']
            rows.append(dict(mode=mode,nativeId=identity,nativeSha256=native_hash,
                expectedSha256=digest(image.tobytes()),exceptionPixels=len(exceptions),
                nativeFile=path, approvedPixels=exceptions))
        print('native visual',mode,len(refs),flush=True)
    assert len(rows)==11572
    save(OUT/'visual-oracle.json',rows)

def collision():
    index=load(E/'TASK-SETTINGS-222B/native-corpus-index.json.gz')
    package=load(ROOT/'public/assets/pets/turtle/collision.json.gz')
    planes={}; seen={}
    with zipfile.ZipFile(E/'TASK-SETTINGS-222B/native-corpus.zip') as archive:
        for name,sha in index.items():
            if not name.startswith(('full/fields/','full/tiles/','full/targets/')): continue
            key=name.removeprefix('full/').removesuffix('.png')
            color=(255,0,0) if '/targets/' in name else (0,255,255)
            identity=(sha,color)
            if identity not in seen:
                raw=archive.read(sha); assert digest(raw)==sha
                image=np.asarray(Image.open(io.BytesIO(raw)).convert('RGB'))
                bits=np.all(image==color,axis=2).astype('uint8')
                seen[identity]=dict(width=bits.shape[1],height=bits.shape[0],sha256=digest(bits.tobytes()))
            planes[key]=seen[identity]
        full=json.loads(archive.read(index['full/measurement.json']))
    assert len(planes)==61424
    save(OUT/'plane-oracle.json',planes)
    work=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222B'
    allowed={r['id']:r for r in package['approvedResidual']['cases']}
    summary=[]
    for mode in ['full','dynamic','dynamic-call']:
        cases=full['cases'] if mode=='full' else load(work/mode/'resolved-collision-measurement.json')['cases']
        pixels=exceptions=0
        with (OUT/f'{mode}-oracle.jsonl').open('w',encoding='utf-8',newline='\n') as output:
            for i,row in enumerate(cases):
                q=row['intersection']; w,h=int(q['width']),int(q['height'])
                if w<1 or h<1: bits=np.zeros((0,0),dtype='uint8')
                else: bits=np.all(np.asarray(Image.open(work/mode/'oracle'/(row['id']+'.png')).convert('RGB'))==[0,255,255],axis=2).astype('uint8')
                assert bool(bits.any())==row['actual']
                native_hash=digest(bits.tobytes()); pixels+=bits.size; points=[]
                if mode=='full' and row['id'] in allowed:
                    approved=allowed[row['id']]; points=approved['points']
                    assert row['intersection']==approved['intersection'] and row['sourceDraw']==approved['sourceDraw']
                    for p in points:
                        assert bool(bits[p['y'],p['x']])==p['original']
                        bits[p['y'],p['x']]=p['candidate']
                    exceptions+=len(points)
                result={k:row[k] for k in ['id','field','sourceRoot','intersection','targetDraw','targetIndex','actual'] if k in row}
                result.update(expectedSha256=digest(bits.tobytes()),nativeSha256=native_hash,exceptionPixels=len(points))
                output.write(json.dumps(result,separators=(',',':'))+'\n')
                if i%20000==0: print('native collision',mode,i,'/',len(cases),flush=True)
        summary.append(dict(mode=mode,cases=len(cases),pixels=int(pixels),exceptionPixels=exceptions))
    assert sum(r['cases'] for r in summary)==157704
    save(OUT/'oracle-summary.json',summary)

if __name__=='__main__':
    visual(); collision()
