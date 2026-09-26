"""Bounded native original-HitTest vs independent pixel reduction checks."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-229'


def main():
    path = BASE/'natural-collision-air/measurement.json'
    data = json.loads(path.read_text())
    rows = data['cases']
    assert len(rows) == 387960
    assert hashlib.sha256((ROOT/data['hitTestPath']).read_bytes()).hexdigest() == data['hitTestSha256']
    assert hashlib.sha256((ROOT/'tools/monkey-spatial/NaturalCollisionProbe.as').read_bytes()).hexdigest() == data['probeSha256']
    assert all(row['hit'] == row['reference'] for row in rows), 'Native/reduction mismatch'
    assert not any(row['hit'] for row in rows if row['x'] == 100000)
    index = {(r['symbol'], r['tick'], r['direction'], r['target'], r['x'], r['y']): r['hit'] for r in rows}
    mutations = dict(firstFrame=0, direction=0)
    far_negative_cases=0
    for row in rows:
        key = (row['symbol'], row['tick'], row['direction'], row['target'], row['x'], row['y'])
        first = key[:1] + (0,) + key[2:]
        flipped = key[:2] + (-row['direction'],) + key[3:]
        if first in index and index[first] != row['hit']: mutations['firstFrame'] += 1
        if flipped in index and index[flipped] != row['hit']: mutations['direction'] += 1
        if row['x'] == 100000 and not row['hit']: far_negative_cases += 1
    assert all(mutations.values()), mutations
    native = json.loads((ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/color-bounds-air/verification.json').read_text())
    assert native['exhaustive'] == dict(cases=74954, failures=0)
    report = dict(status='passed-bounded', cases=len(rows), hits=sum(r['hit'] for r in rows),
                  mismatchCount=0, counterfactualProjectionDifferences=mutations, farNegativeCases=far_negative_cases,
                  nativeColorBounds=native, measurementSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                  scope='Native raster oracle and independent color reduction, limited sampled coordinates/phases. firstFrame/direction are counterfactual input projections, not executed program mutations. Far sentinels prove negative coverage, not a tracked-identity consumer mutation. Independent geometry and actual consumer mutations are separate.')
    (OUT/'natural-collision-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({k:report[k] for k in ['status','cases','hits','mismatchCount','counterfactualProjectionDifferences','farNegativeCases']}))


if __name__ == '__main__':
    main()
