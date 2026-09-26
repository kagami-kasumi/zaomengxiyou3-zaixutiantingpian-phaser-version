"""Publish the verified native ice raster and source registration, without rerendering it."""
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
manifest_path = ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-229-pet-horse-collision-phase.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
truth = manifest['naturalDisplay']
assert manifest['status'] == truth['status'] == 'verified'
assert not truth['completeness']['unresolved']
source = next(p for p in truth['provenance'] if p['id'] == 'StageCommon')
assert hashlib.sha256((ROOT / source['sourcePath']).read_bytes()).hexdigest() == source['sha256']
baseline = next(b for b in truth['baselines'] if b['stateId'] == 'ice-0')
next_frame = next(b for b in truth['baselines'] if b['stateId'] == 'ice-1')
assert baseline['sha256'] == next_frame['sha256']
obj = next(o for o in truth['displayObjects'] if o['id'] == 'ice-0/root')
assert obj['sourceIdentity']['symbolClass'] == 'PetHorseIceEffect'
geometry = next(s for s in manifest['geometry']['sources'] if s['id'] == 'StageCommon')
character = obj['sourceIdentity']['characterId']
assert len(geometry['timelines'][str(character)]) == 1, 'Only a source single-frame clip may use this static raster'
bounds = obj['placements'][0]['localBounds']
raster = (ROOT / baseline['path']).read_bytes()
assert hashlib.sha256(raster).hexdigest() == baseline['sha256']
relative = 'assets/pets/monkey-horse/PetHorseIceEffect.png'
data = dict(kind='image', key='pet-horse-target-ice', path=relative,
            truthId=truth['truthId'], stateId='ice-0', symbol='PetHorseIceEffect',
            sha256=baseline['sha256'], sourceSha256=source['sha256'],
            width=baseline['width'], height=baseline['height'],
            crop=baseline['crop'], sourceBounds=bounds)
payload = json.dumps(data, indent=2) + '\n'
asset_path = ROOT / 'public' / relative
meta_path = ROOT / 'src/assets/pet-horse-target-ice.json'
if '--check' in sys.argv:
    assert asset_path.read_bytes() == raster
    assert meta_path.read_text(encoding='utf-8') == payload
else:
    asset_path.parent.mkdir(parents=True, exist_ok=True)
    asset_path.write_bytes(raster)
    meta_path.write_text(payload, encoding='utf-8', newline='\n')
print('Verified native ice raster and exact source bounds projected; world view not verified.')
