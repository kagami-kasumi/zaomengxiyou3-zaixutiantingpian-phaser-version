"""Compare real production body projections against independent 254 AIR baselines."""
import hashlib
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
truth = json.loads((root / 'docs/reverse-engineering/ground-truth/manifests/task-settings-254-pet-reception-body-timing.json').read_text(encoding='utf-8'))
assert truth['status'] == 'verified' and not truth['completeness']['unresolved']
baselines = {b['stateId']: b for b in truth['baselines']}
for scene in sys.argv[1:] or ['TestScene', 'Stage13Scene']:
    folder = root / 'docs/tasks/evidence/TASK-SLICE-255/visual' / scene
    captures = json.loads((folder / 'captures.json').read_text(encoding='utf-8'))
    assert len(captures) == 832
    assert len({(c['pose']['id'], c['background']) for c in captures}) == 832
    maximum = 0.0
    for capture in captures:
        sid = capture['pose']['id']
        baseline = baselines[sid]
        source = root / baseline['path']
        assert hashlib.sha256(source.read_bytes()).hexdigest() == baseline['sha256']
        native = np.array(Image.open(source).convert('RGBA'), dtype=np.float64)
        actual = np.array(Image.open(folder / capture['file']).convert('RGBA'), dtype=np.float64)
        assert actual.shape == native.shape
        alpha = native[:, :, 3:4] / 255
        expected = native[:, :, :3] * alpha + (255 if capture['background'] else 0) * (1-alpha)
        difference = float(np.max(np.abs(actual[:, :, :3] - expected)))
        maximum = max(maximum, difference)
        assert difference <= 1.0, (scene, sid, difference)
        assert np.all(actual[:, :, 3] == 255), (scene, sid, 'background alpha')
        view = capture['actual']
        assert view['rootX'] == 470 and view['rootY'] == 350
        assert view['scaleX'] == view['scaleY'] == 1 and not view['flipX']
        assert view['originX'] == view['originY'] == 0
    report = dict(status='passed', scene=scene, poses=416, captures=832,
                  maximumVisibleChannelDifference=maximum, allowedChannelRounding=1,
                  scope='Controlled projection through production view; no natural combat reachability claim')
    (folder / 'verification.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
    print(json.dumps(report))
