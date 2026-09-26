"""Publish verified original FireBuff frames byte-for-byte; no timing inference."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
manifest = json.loads((ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-228-pet-monkey-collision-phase.json').read_text(encoding='utf-8'))
truth = manifest['naturalDisplay']
assert manifest['status'] == truth['status'] == 'verified'
assert not truth['completeness']['unresolved']
source = next(p for p in truth['provenance'] if p['id'] == 'StageCommon')
assert hashlib.sha256((ROOT / source['sourcePath']).read_bytes()).hexdigest() == source['sha256']
geometry = next(p for p in manifest['geometry']['sources'] if p['id'] == 'StageCommon')
assert len(geometry['timelines']['189']) == 20
frames = []
rasters = []
for index in range(1, 23):
    state_id = f'fire-{index}'
    state = next(s for s in truth['states'] if s['id'] == state_id)
    obj = next(o for o in truth['displayObjects'] if o['id'] == state_id + '/root')
    assert obj['sourceIdentity']['symbolClass'] == 'FireBuff'
    assert obj['sourceIdentity']['characterId'] == 189
    assert state['frame'] == (index - 1) % 20 + 1
    baseline = next(b for b in truth['baselines'] if b['stateId'] == state_id)
    raster = (ROOT / baseline['path']).read_bytes()
    assert hashlib.sha256(raster).hexdigest() == baseline['sha256']
    if index > 20:
        assert raster == rasters[index - 21], 'Source loop must repeat the first frames exactly'
        continue
    relative = f'assets/pets/monkey-horse/FireBuff-{index:02d}.png'
    asset = ROOT / 'public' / relative
    if '--check' in sys.argv:
        assert asset.read_bytes() == raster
    else:
        asset.parent.mkdir(parents=True, exist_ok=True)
        asset.write_bytes(raster)
    rasters.append(raster)
    frames.append(dict(kind='image', key=f'pet-monkey-target-fire-{index}', path=relative,
                       stateId=state_id, frame=state['frame'], sha256=baseline['sha256'],
                       width=baseline['width'], height=baseline['height'], crop=baseline['crop'],
                       sourceBounds=obj['placements'][0]['localBounds']))
data = dict(symbol='FireBuff', truthId=truth['truthId'], sourceSha256=source['sha256'], frames=frames)
payload = json.dumps(data, indent=2) + '\n'
metadata = ROOT / 'src/assets/pet-monkey-target-fire.json'
if '--check' in sys.argv:
    assert metadata.read_text(encoding='utf-8') == payload
else:
    metadata.write_text(payload, encoding='utf-8', newline='\n')
print('20 native FireBuff frames and 2 loop-repeat samples verified; timing/world consumer not verified.')
