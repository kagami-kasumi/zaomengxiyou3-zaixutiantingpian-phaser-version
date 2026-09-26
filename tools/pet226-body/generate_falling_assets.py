"""Project verified native falling-effect rasters and bounded observed host phases."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
manifest = json.loads((ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-229-pet-horse-collision-phase.json').read_text(encoding='utf-8'))
truth = manifest['naturalDisplay']
assert manifest['status'] == truth['status'] == 'verified'
assert not truth['completeness']['unresolved']
source = next(p for p in truth['provenance'] if p['id'] == 'pet1')
assert hashlib.sha256((ROOT/source['sourcePath']).read_bytes()).hexdigest() == source['sha256']
frames = []
for frame in range(1, 9):
    baselines = [b for b in truth['baselines'] if b['path'].endswith(f'/PetHorse4Bullet5-_1_{frame}_.png')]
    assert len(baselines) == 3
    rasters = [(ROOT/b['path']).read_bytes() for b in baselines]
    assert all(hashlib.sha256(r).hexdigest() == b['sha256'] for b, r in zip(baselines, rasters))
    assert all(r == rasters[0] for r in rasters)
    b = baselines[0]
    relative = f'assets/pets/monkey-horse/HorseAoyiFalling-{frame}.png'
    target = ROOT/'public'/relative
    if '--check' in sys.argv:
        assert target.read_bytes() == rasters[0]
    else:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(rasters[0])
    frames.append(dict(kind='image', key=f'pet-horse-aoyi-falling-{frame}', path=relative,
                       frame=frame, stateIds=[b['stateId'] for b in baselines],
                       sha256=b['sha256'], width=b['width'], height=b['height'], crop=b['crop']))
maps = []
for scale in ['source', 'formal']:
    path = ROOT/f'local-resources/regima/task-outputs/TASK-SLICE-226/horse-aoyi-collision-{scale}/measurement.json'
    report = json.loads((ROOT/f'docs/tasks/evidence/TASK-SLICE-226/horse-aoyi-collision-{scale}/verification.json').read_text())
    assert hashlib.sha256(path.read_bytes()).hexdigest() == report['measurementSha256']
    observed = {}
    for row in json.loads(path.read_bytes())['cases']:
        phase = json.loads(row['phaseKey'].split('|', 1)[1])
        assert phase['frame'] == 1 and len(phase['children']) == 1
        index = phase['children'][0]['frame'] - 1
        assert 0 <= index < 8
        if row['tick'] in observed:
            assert observed[row['tick']] == index
        observed[row['tick']] = index
    assert set(observed) == set(range(321))
    maps.append([observed[tick] for tick in range(321)])
assert maps[0] == maps[1]
data = dict(symbol='PetHorse4Bullet5', truthId=truth['truthId'], sourceSha256=source['sha256'],
            scope='Observed natural host ticks 0..320; ordinary pause/resume excluded.',
            hostFrameIndices=maps[0], frames=frames)
payload = json.dumps(data, indent=2) + '\n'
target = ROOT/'src/assets/pet-horse-falling-display.json'
if '--check' in sys.argv:
    assert target.read_text(encoding='utf-8') == payload
else:
    target.write_text(payload, encoding='utf-8', newline='\n')
print('8 native falling rasters across three FPS and 321 independently observed host phases verified.')
