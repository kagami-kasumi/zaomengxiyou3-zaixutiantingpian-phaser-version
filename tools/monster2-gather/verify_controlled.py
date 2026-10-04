"""Independent mathematical expectations for the finite original-library cases."""
import sys
sys.dont_write_bytecode = True
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-257B'


def q(value):
    return math.trunc(value * 20) / 20


def curve(start, end, elapsed):
    ratio = 1 - (1 - min(max(elapsed, 0), 1)) ** 2
    return [q(a + (b - a) * ratio) for a, b in zip(start, end)]


def verify(rows):
    expected_keys = {(fps, owner, slot, mode, tick)
                     for fps in (20, 24, 30) for owner in (1, 2, 3)
                     for slot in ((1, 2) if owner == 3 else (owner,))
                     for mode in ('plain', 'move-before', 'move-after', 'pause', 'overwrite', 'source-detach', 'hero-detach', 'kill')
                     for tick in range(fps * 2 + 1)}
    assert {(r['fps'],r['owner'],r['slot'],r['mode'],r['tick']) for r in rows} == expected_keys
    assert len(rows) == len(expected_keys)
    failures = []
    for row in rows:
        fps, slot, mode, tick = (row[k] for k in ('fps', 'slot', 'mode', 'tick'))
        initial = [100, 300] if slot == 1 else [700, 180]
        speed = [5 if slot == 1 else -5, 2]
        at, resume = fps // 4, fps * 3 // 4
        start = [a + b for a,b in zip(initial,speed)] if mode == 'move-before' and tick else initial
        elapsed = tick / fps
        if mode == 'pause':
            elapsed = (tick - max(0, min(tick, resume) - at)) / fps
        if mode == 'kill':
            elapsed = min(tick, at) / fps
        expected = curve(start, [400,250], elapsed)
        if mode == 'overwrite' and tick > at:
            expected = curve(curve(initial,[400,250],at/fps), [600,150], tick/fps-at/fps)
        if mode.startswith('move'):
            count = max(0,tick-fps) + (1 if mode == 'move-after' and 0 < tick <= fps else 0)
            if mode == 'move-after' and tick > fps:
                count += 1
            expected = [q(a + count*b) for a,b in zip(expected,speed)]
        actual = [row['x'],row['y']]
        if any(abs(a-b)>1e-8 for a,b in zip(actual,expected)):
            failures.append(dict(key=[fps,row['owner'],slot,mode,tick],expected=expected,actual=actual))
        assert row['parent'] == (mode != 'hero-detach' or tick < at)
    return failures


def main():
    report = json.loads((OUT / 'controlled.json').read_text())
    failures = verify(report['rows'])
    (OUT / 'controlled-differences.json').write_text(json.dumps(failures,indent=2)+'\n')
    print(json.dumps(dict(states=len(report['rows']), differences=len(failures), first=failures[:3])))
    assert not failures


if __name__ == '__main__':
    main()
