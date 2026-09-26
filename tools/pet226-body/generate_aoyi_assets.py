"""Project the 13 displayed native AoyiBuff phases; frame 14 is a removal boundary."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
manifest = json.loads((ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-229-pet-horse-collision-phase.json').read_text(encoding='utf-8'))
truth = manifest['naturalDisplay']
assert manifest['status'] == truth['status'] == 'verified'
assert not truth['completeness']['unresolved']
source = next(p for p in truth['provenance'] if p['id'] == 'StageCommon')
assert hashlib.sha256((ROOT / source['sourcePath']).read_bytes()).hexdigest() == source['sha256']
geometry = next(p for p in manifest['geometry']['sources'] if p['id'] == 'StageCommon')
assert len(geometry['timelines']['120']) == 14
objects = [o for o in truth['displayObjects'] if o.get('sourceIdentity', {}).get('symbolClass') == 'AoyiBuff']
frames = []
for frame in range(1, 14):
    variants = [o for o in objects if o['sourceIdentity']['frame'] == frame]
    assert len(variants) == 3
    originals = []
    for obj in variants:
        assert obj['sourceIdentity']['characterId'] == 120
        state_id = obj['id'].split('/')[0]
        baseline = next(b for b in truth['baselines'] if b['stateId'] == state_id)
        raster = (ROOT / baseline['path']).read_bytes()
        assert hashlib.sha256(raster).hexdigest() == baseline['sha256']
        originals.append((baseline, raster))
    assert all(raster == originals[0][1] for _, raster in originals)
    baseline, raster = originals[0]
    relative = f'assets/pets/monkey-horse/AoyiBuff-{frame:02d}.png'
    asset = ROOT / 'public' / relative
    if '--check' in sys.argv:
        assert asset.read_bytes() == raster
    else:
        asset.parent.mkdir(parents=True, exist_ok=True)
        asset.write_bytes(raster)
    frames.append(dict(kind='image', key=f'pet-horse-aoyi-buff-{frame}', path=relative,
                       frame=frame, stateIds=[b['stateId'] for b, _ in originals],
                       sha256=baseline['sha256'], width=baseline['width'], height=baseline['height'], crop=baseline['crop']))
for fps in [20, 24, 30]:
    measurement = json.loads((ROOT / f'local-resources/regima/task-outputs/TASK-SETTINGS-229/lifecycle-air/measurement-{fps}.json').read_text(encoding='utf-8'))
    for owner in ['P1', 'P2']:
        for direction in [0, 1]:
            rows = [r for r in measurement['rows'] if r['id'] == f'AoyiBuff_follow-{owner}-{direction}-natural' and r['phase'] == 'enter']
            assert [r['state']['frame'] for r in rows[:13]] == list(range(1, 14))
            assert all(r['state']['dead'] and not r['state']['attached'] for r in rows[13:])
pause = json.loads((ROOT / 'docs/tasks/evidence/TASK-SLICE-226/fire-pause-long-native.json').read_text(encoding='utf-8'))
assert pause['sourceSha256'] == source['sha256']
terminal = [row for row in pause['rows'] if row['petClip'] == 14]
assert {row['fps'] for row in terminal} == {20, 24, 30}
assert all(row['petRaster']['sha256'] == frames[12]['sha256'] for row in terminal)
data = dict(symbol='AoyiBuff', truthId=truth['truthId'], sourceSha256=source['sha256'],
            sourceFrameCount=14, naturalRemovalFrame=14,
            nativeFrameRasterIndices=list(range(13)) + [12], frames=frames)
payload = json.dumps(data, indent=2) + '\n'
metadata = ROOT / 'src/assets/pet-horse-aoyi-buff.json'
if '--check' in sys.argv:
    assert metadata.read_text(encoding='utf-8') == payload
else:
    metadata.write_text(payload, encoding='utf-8', newline='\n')
print('13 native AoyiBuff rasters across 3 FPS and 12 natural removal traces verified; no runtime consumer claim.')
