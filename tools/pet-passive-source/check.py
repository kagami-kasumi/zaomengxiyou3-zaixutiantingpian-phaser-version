"""Run the bounded 235 native batch and reject source/report counterexamples."""
import copy
import hashlib
import json
from capture import run, OUT
from verify import verify

baseline = run()
assert verify(baseline) == 720
mutations = []
for name in ['period', 'first-only', 'immediate', 'refresh-first', 'stun', 'learned', 'mp', 'refresh-value', 'expiry', 'all-roster']:
    altered = run(name)
    assert altered['generatedHashes'] != baseline['generatedHashes'], name
    try:
        verify(altered)
    except AssertionError:
        mutations.append(dict(name=name, rejected=True))
    else:
        raise AssertionError('Source mutation survived: '+name)
negative = []
for name in ['missing-case', 'duplicate-case', 'changed-value', 'changed-source']:
    damaged = copy.deepcopy(baseline)
    if name == 'missing-case': damaged['cases'].pop()
    if name == 'duplicate-case': damaged['cases'].append(damaged['cases'][0])
    if name == 'changed-value': damaged['cases'][0]['result']['mp'] += 1
    if name == 'changed-source': damaged['sources'][0]['fileSha256'] = '0'*64
    try:
        verify(damaged)
    except (AssertionError, KeyError):
        negative.append(dict(name=name,rejected=True))
    else:
        raise AssertionError('Report mutation survived: '+name)
repeat = run()
assert repeat == baseline, 'Native regeneration changed'
report = dict(status='passed', cases=720, sourceMutations=mutations, damagedReports=negative,
              repeatedNativeEqual=True, baselineSha256=hashlib.sha256((OUT/'baseline/trace.json').read_bytes()).hexdigest())
(OUT/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print('235: 720 original cases, 10 compiled source mutations, 4 report rejections, regeneration identical')
