"""Compile mutated source slices; each must fail the independent verifier.

Each mutation uses a separate process/work/output root. Normal evidence must be
byte-identical after the run, including failure paths.
"""
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from run import OUT, ROOT
from verify import verify

normal = OUT/'source-trace.json'
before = hashlib.sha256(normal.read_bytes()).hexdigest()
results = []
try:
    for mutation in ['learned','mp','lyq-distance','hurt','phase','stun','random-boundary','cd-order','wrap','collision']:
        run = subprocess.run([sys.executable,str(Path(__file__).with_name('run.py')),mutation],cwd=ROOT,capture_output=True,timeout=60)
        if run.returncode:
            raise RuntimeError(run.stdout.decode(errors='replace')+run.stderr.decode(errors='replace'))
        report = json.loads((OUT/'mutations'/mutation/'source-trace.json').read_text(encoding='utf-8'))
        try:
            verify(report)
        except AssertionError as error:
            results.append(dict(mutation=mutation,rejected=True,firstFailure=str(error)[:500]))
        else:
            raise AssertionError('Survived mutation: '+mutation)
        print('Rejected:',mutation,flush=True)
finally:
    assert hashlib.sha256(normal.read_bytes()).hexdigest() == before, 'Normal source trace was overwritten'
(OUT/'source-mutations.json').write_text(json.dumps(dict(normalTraceSha256=before,results=results),indent=2)+'\n',encoding='utf-8')
