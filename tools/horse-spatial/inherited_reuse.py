"""Hash-bound reuse of shared display methods; horse effects remain local proofs."""
import hashlib
import json
import re
from prepare_lifecycle import ROOT, SRC, OUT, take
from run_lifecycle import sha


def read(path):return json.loads(path.read_text(encoding='utf-8'))


def generate():
    manifest=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-228-pet-monkey-collision-phase.json'
    shared=read(manifest);assert shared['status']=='verified'
    common=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
    inventory=read(common/'hurt-inventory.json');assert inventory['status']=='verified-mapped'
    entries=[e for e in inventory['entries'] if e['name']!='AoyiBuff']
    methods=[]
    for entry in entries:
        records=entry['source'] if isinstance(entry['source'],list) else [entry['source']]
        for record in records:
            path=ROOT/record['path'];assert sha(path)==record['fileSha256']
            assert hashlib.sha256(take(path,record['method']).encode()).hexdigest()==record['sliceSha256']
            methods.append(record['method'])
        if 'reuse' in entry:assert sha(ROOT/entry['reuse']['path'])==entry['reuse']['sha256']
    forms=[]
    for form in range(1,5):
        path=SRC/f'export/pet/PetHorse{form}.as';text=path.read_text(encoding='utf-8')
        overrides=set(re.findall(r'function\s+(\w+)\(',text))
        assert not overrides.intersection(methods),overrides.intersection(methods)
        forms.append(dict(path=path.relative_to(ROOT).as_posix(),sha256=sha(path),noOverrides=methods))
    reports={}
    for name in ['hurt-natural','hurt-geometry','inherited-display','glow']:
        ref=shared['evidence'][name];assert sha(ROOT/ref['path'])==ref['sha256']
        report=read(ROOT/ref['path']);assert report['status'].startswith('passed') and not report.get('failures')
        reports[name]=ref
    # Validate source/measurement hashes carried by the inherited bundle, not
    # merely the shared task title or an identically named method.
    for ref in shared['inheritedDisplay']['nativeTimeline']:
        path=ROOT/ref['path'];assert sha(path)==ref['sha256']
        for record in read(path)['methods']:
            assert sha(ROOT/record['path'])==record['fileSha256']
    observed=read(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/inherited-display-air/measurement.json')
    for record in observed['methods']:assert sha(ROOT/record['path'])==record['fileSha256']
    assert sha(ROOT/'local-resources/regima/source/restored-swfs/assets/OtherMat1.swf')==observed['otherSourceSha256']
    for ref in shared['inheritedDisplay']['ui']['provenance']:
        assert sha(ROOT/ref['sourcePath'])==ref['sha256']
    report=dict(status='passed-bounded',sharedManifest=dict(path=manifest.relative_to(ROOT).as_posix(),sha256=sha(manifest)),entries=entries,forms=forms,evidence=reports,
        scope='Exact unchanged shared inherited methods and source display geometry only. No monkey principal effect, targeting, fire or collision result reused. Horse colipse placement uses its own source/host records. Shared HP/miss tween proof remains manual-clock; 215 damage digits retain their prior boundary. Aoyi and horse ice are verified by 229 independently.')
    return report,shared['inheritedDisplay']


if __name__=='__main__':
    report,_=generate();(OUT/'inherited-reuse-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('229 inherited reuse:',len(report['entries']),'display entries; four source forms have no overrides')
