"""Bounded original destroy/display contract; no full buff timer or vendor tween claim."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/cleanup-air'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def check(data):
    errors = []
    labels = ['before', 'pet-destroy', 'fade-half', 'fade-complete', 'effect-destroy']
    if [s['label'] for s in data['states']] != labels:
        return ['state sequence']
    for i, row in enumerate(data['states']):
        alive = i == 0
        expected = dict(owner=alive, bodyAttached=alive, alpha=[1, 1, .25, 0, 0][i],
                        ready=not alive, bulletCount=int(alive), effect=alive, attached=i < 3)
        if row['p1'] != expected: errors.append(f'{i}:pet')
        if row['ownerClears'] != int(not alive): errors.append(f'{i}:owner clear')
        if row['p2'] != dict(owner=True, bulletCount=1, attached=True, ready=False):
            errors.append(f'{i}:P2')
        for key, value in dict(dead=not alive, attached=alive, owner='P1' if alive else None).items():
            if row['bullet1'][key] != value: errors.append(f'{i}:bullet1.{key}')
        for key, value in dict(dead=False, attached=True, owner='P2').items():
            if row['bullet2'][key] != value: errors.append(f'{i}:bullet2.{key}')
        if not row['targetFire']: errors.append(f'{i}:target fire')
        if row['fireEffectOwner'] != (i < 4): errors.append(f'{i}:buff owner')
    if [r['frame'] for r in data['fire']] != list(range(1, 21)) + [1, 2]:
        errors.append('native fire sequence')
    if any(r['totalFrames'] != 20 for r in data['fire']): errors.append('fire total')
    if data['removed'] != [dict(children=0)]: errors.append('explicit hide')
    return errors


def main():
    path = WORK/'measurement.json'
    data = json.loads(path.read_text())
    errors = check(data)
    for row in data['fire']:
        image = (WORK/row['path']).read_bytes()
        assert image.startswith(b'\x89PNG\r\n\x1a\n')
        assert hashlib.sha256(image).hexdigest() == row['sha256']
    mutants = {}
    for name, index, section, key, value in [
        ('early-parent-removal', 1, 'p1', 'attached', False),
        ('P2-owner-bleed', 1, 'bullet2', 'owner', None),
        ('ease-ratio-as-alpha', 2, 'p1', 'alpha', .75),
    ]:
        changed = copy.deepcopy(data)
        changed['states'][index][section][key] = value
        mutants[name] = bool(check(changed))
    changed = copy.deepcopy(data)
    changed['states'][1]['targetFire'] = False
    mutants['attacker-clears-target-fire'] = bool(check(changed))
    assert not errors, errors
    assert all(mutants.values()), mutants
    report = dict(status='passed-bounded', states=5, nativeFireFrames=22,
                  measurementSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                  rejectedMutants=mutants,
                  limits=['Blank body tests detach only', 'Manual tween scheduler uses original ease ratio',
                          'Target timer and normal death cancelAllEffect not executed'])
    (OUT/'cleanup-verification.json').write_text(json.dumps(report, indent=2)+'\n')
    print('228 cleanup verified: 5 states, 22 fire frames, 4 rejected mutants')


if __name__ == '__main__':
    main()
