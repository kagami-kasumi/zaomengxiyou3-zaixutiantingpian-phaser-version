"""Promote only the exact source/native input set accepted by independent checks."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
MANIFEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-222a-pet-turtle-visual.json'


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    reports=['body-verification.json','effects-placement-verification.json','dynamic-verification.json','buff-verification.json','owner-verification.json','display-verification.json','time-verification.json','mask-mutations.json','manifest-verification.json']
    checked={name:json.loads((OUT/name).read_text(encoding='utf-8')) for name in reports}
    for name,report in checked.items():
        assert report['status'] in ['passed-bounded-check','passed-draft-normalization'],(name,report['status'])
        assert not report.get('failures') and not report.get('failureCount'),name
        assert all(report.get('mutationRejected',{}).values()),name
    before=sha(MANIFEST);assert checked['manifest-verification.json']['manifestSha256']==before
    subprocess.run(['python',str(ROOT/'tools/turtle-visual/manifest.py')],cwd=ROOT,check=True,timeout=300)
    after=sha(MANIFEST);assert before==after,'Non-repeatable generation'
    names=['source-definitions.json','body-inputs.json','body-methods.json','dynamic-source-methods.json','owner-verification.json','expected-visual-states.json','body-native.json.gz','effects-native.json.gz','dynamic-native.json.gz','buff-native.json.gz']
    paths=[OUT/name for name in names]+[ROOT/'tools/turtle-visual/manifest.py',ROOT/'tools/turtle-visual/verify_manifest.py',ROOT/'docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json']
    original=json.loads(MANIFEST.read_text(encoding='utf-8'))
    report=dict(status='accepted',scope='222A finite13-symbol visual fixtures only; native24 profile; collision deferred222B.',draftManifestSha256=before,repeatedGenerationSha256=after,
                generatedAt=original['generatedBy']['generatedAt'],inputSha256={p.relative_to(ROOT).as_posix():sha(p) for p in paths},
                checks={name:sha(OUT/name) for name in reports},independentReview='Read-only dynamic_scope_audit: body geometry, registration definition, timing mutations and method slice fingerprints were addressed before this gate.',
                modernVisualExceptions=[],contractCount=32,stateCount=11572)
    (OUT/'acceptance.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('222A visual input acceptance: repeated generation identical;',len(paths),'frozen input hashes')


if __name__=='__main__':main()
