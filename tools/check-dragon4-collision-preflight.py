"""214E input-scope audit; checks existing evidence, never certifies source collision."""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'docs/tasks/evidence/TASK-SLICE-214E/collision-preflight.json'


def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8-sig'))


def provenance(path):
    return {'path': path, 'sha256': hashlib.sha256((ROOT / path).read_bytes()).hexdigest()}


truth_path = 'docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json'
catalog_path = 'src/assets/PetDragonAssetFiles.json'
contract_path = 'docs/tasks/evidence/TASK-SETTINGS-219/collision-contract.json'
source_path = 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/PetDragon4.as'
truth, catalog, contract = read(truth_path), read(catalog_path), read(contract_path)
symbol = 'PetDragonBullet4'
source = (ROOT / source_path).read_text(encoding='utf-8-sig')
start = source.index('private function doHit5(')
end = source.index('override protected function checkBuffSkill()', start)
trigger = source[start:end]
assert 'new FollowBaseObjectBullet("PetDragonBullet4")' in trigger
assert '_loc3_.setAction("hit4")' in trigger
assert '_loc3_.setHurtCanCutDownEffect(false)' in trigger
frames = [f for f in catalog['files'] if f['objectId'] == symbol]
assert len(frames) == 48 and sorted(f['frame'] for f in frames) == list(range(1, 49))
for frame in frames:
    assert hashlib.sha256((ROOT / ('public' + frame['path'])).read_bytes()).hexdigest() == frame['sha256']
covered = sorted({f['symbol'] for f in contract['frames']})
assert symbol not in covered and symbol not in contract['scope']['symbols']
assert symbol in json.dumps(truth)
report = {
    'task': 'TASK-SLICE-214E', 'status': 'blocked-input',
    'meaning': 'Existing visual assets are intact; 219 does not cover the qlaoyi trigger collision.',
    'sources': [provenance(p) for p in [truth_path, catalog_path, contract_path, source_path,
        'src/systems/PetDragonEffectCollisionSystem.ts',
        'docs/tasks/evidence/TASK-SETTINGS-219/approved-approximation.json']],
    'trigger': {'symbol': symbol, 'characterId': 539, 'frameCount': 48,
                'sourceAction': 'hit4', 'hurtInterrupts': False,
                'frames': [{'frame': f['frame'], 'path': f['path'], 'sha256': f['sha256']} for f in frames]},
    'existingCollisionSymbols': covered,
    'missing': ['trigger per-frame source display/draw collision mapping',
                'source HitTest positive/negative cases at both directions and independent owner roots',
                'explicit trigger sampling accuracy contract; 219 approval is limited to four other symbols'],
    'nextTask': 'TASK-SETTINGS-220',
}
encoded = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
if '--check' in sys.argv:
    assert OUTPUT.read_text(encoding='utf-8') == encoded, 'Preflight evidence changed; review scope before regenerating.'
else:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(encoded, encoding='utf-8')
print('214E historical scope audit passed: 48 unchanged visual frames; 219 excludes trigger. Supplemental coverage is tracked by 220.')
