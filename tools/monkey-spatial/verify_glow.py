"""Independent period/countdown expectations for bounded protection observations."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/glow-air'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def expected_filter(tick):
    phase = tick % 17
    blur = 14-phase if phase < 8 else phase-1 if phase < 16 else 15
    return dict(color=0x99ff00, alpha=1 if phase < 8 or phase == 16 else .8,
                blurX=blur, blurY=blur, strength=1.5, quality=3, inner=False, knockout=False)


def check(data):
    errors = []
    for row in data['rows']:
        active = row['p'+str(row['selected'])]
        other = row['p'+str(3-row['selected'])]
        enabled = row['tick'] < row['fps']*5
        expected = dict(father=enabled,count=max(-1,row['fps']*5-row['tick']-1),alpha=1,
                        filter=expected_filter(row['tick']) if enabled else None)
        if active != expected: errors.append((row['fps'],row['selected'],row['tick'],'active'))
        if other != dict(father=False,count=-1,alpha=1,filter=None): errors.append(('other',row['tick']))
    for row in data['hits']:
        active = row['p'+str(row['selected'])]
        if active['father'] != (row['hit']==6): errors.append(('hit',row['hit']))
        if row['hit']==6 and active['filter'] != expected_filter(16): errors.append(('initial-filter',6))
    return errors


def main():
    path = WORK/'measurement.json'
    data = json.loads(path.read_text())
    assert len(data['rows']) == 758 and len(data['hits']) == 36
    assert not check(data), check(data)[:10]
    pictures = {}
    for row in data['rows']:
        if 'path' not in row: continue
        assert hashlib.sha256((WORK/row['path']).read_bytes()).hexdigest() == row['sha256']
        key = json.dumps(row['p'+str(row['selected'])]['filter'],sort_keys=True)
        pictures.setdefault(key,set()).add(row['sha256'])
    assert len(pictures) == 18 and all(len(v)==1 for v in pictures.values())
    mutants = {}
    for name, change in [
        ('wrong-color',lambda d:d['rows'][0]['p1']['filter'].update(color=0x99f500)),
        ('visible-six-blur',lambda d:d['rows'][8]['p1']['filter'].update(blurX=6,blurY=6)),
        ('P2-filter-bleed',lambda d:d['rows'][0]['p2'].update(filter=d['rows'][0]['p1']['filter'])),
        ('late-expiry',lambda d:d['rows'][100]['p1'].update(father=True,filter=expected_filter(100))),
    ]:
        altered = copy.deepcopy(data)
        change(altered)
        mutants[name] = bool(check(altered))
    assert all(mutants.values())
    report = dict(status='passed-bounded',states=758,hitCounterStates=36,uniqueRenderStates=18,
                  rejectedMutants=mutants,measurementSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                  scope='Original protection branches and native filter baseline; no complete beMagicAttack, all-family body geometry or target fire timer claim.')
    (OUT/'glow-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    print('228 glow verified: 758 states, 36 hit counters, 18 pixel states, 4 rejected mutants')


if __name__ == '__main__':
    main()
