"""Preserve original native baselines once by SHA; do not promote visual truth."""
import gzip
import hashlib
import json
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
LOCAL=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A'


def main():
    check='--check' in sys.argv
    files={}
    records=[]
    for name in ['effects','body']:
        original=LOCAL/(name+'-air')/'measurement.json'
        data=json.loads(original.read_text(encoding='utf-8'))
        baselines=([b for state in data['states'] for b in [*state['baselines'],state['localImage']]] if name=='effects' else data['cells'])
        for entry in baselines:
            key='path' if name=='effects' else 'file'
            source=ROOT/entry[key];content=source.read_bytes();digest=hashlib.sha256(content).hexdigest()
            assert digest==entry['sha256']
            target=OUT/'native-baselines'/(digest+'.png')
            if digest not in files:
                if check:assert target.read_bytes()==content
                else:target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(content)
                files[digest]=len(content)
            entry['originalCapturePath']=entry[key]
            entry[key]=target.relative_to(ROOT).as_posix()
        data['originalMeasurementSha256']=hashlib.sha256(original.read_bytes()).hexdigest()
        content=gzip.compress((json.dumps(data,indent=2)+'\n').encode(),mtime=0)
        path=OUT/(name+'-native.json.gz')
        if check:assert path.read_bytes()==content
        else:path.write_bytes(content)
        records.append(dict(name=name,path=path.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(content).hexdigest()))
    for name in ['dynamic','buff']:
        path=OUT/(name+'-native.json.gz');content=path.read_bytes();data=json.loads(gzip.decompress(content))
        for row in data['rows']:
            image=ROOT/row['capture'];payload=image.read_bytes();digest=hashlib.sha256(payload).hexdigest()
            assert digest==row['captureSha256'];files[digest]=len(payload)
        records.append(dict(name=name,path=path.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(content).hexdigest()))
    for case in json.loads((OUT/'mask-mutations.json').read_text(encoding='utf-8'))['checks']:
        for witness in case['witnesses']:
            payload=(ROOT/witness['path']).read_bytes();assert hashlib.sha256(payload).hexdigest()==witness['sha256'];files[witness['sha256']]=len(payload)
    manifest=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-222a-pet-turtle-visual.json'
    verified=manifest.exists() and json.loads(manifest.read_text(encoding='utf-8'))['status']=='verified'
    summary=dict(status='verified-visual-input' if verified else 'measured-not-promoted',measurements=records,uniqueImages=len(files),imageBytes=sum(files.values()),
                 purpose='Original native input for 222A completion and 222B collision fixtures; keep until consumers and parent contract close.',
                 unresolved=[] if verified else ['Aggregate normalized manifest acceptance and promotion; individual native/behavior/display/owner/mutation checks are separate reports.'])
    content=json.dumps(summary,indent=2)+'\n';path=OUT/'native-corpus.json'
    if check:assert path.read_text(encoding='utf-8')==content
    else:path.write_text(content,encoding='utf-8',newline='\n')
    if '--prune' in sys.argv:
        directory=(OUT/'native-baselines').resolve();removed=0
        for candidate in directory.glob('*.png'):
            assert candidate.resolve().parent==directory
            if len(candidate.stem)==64 and all(c in '0123456789abcdef' for c in candidate.stem) and candidate.stem not in files:
                candidate.unlink();removed+=1
        print('Removed superseded generated PNGs:',removed)
    print('222A packed native corpus:',len(files),'images,',sum(files.values()),'bytes')


if __name__=='__main__':main()
