"""245B candidate diagnostic, never a substitute for actual renderer acceptance."""
import gzip
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/tasks/evidence/TASK-SLICE-245B'


def visible(image):
    value = np.asarray(image, dtype=float).copy()
    value[:, :, :3] *= value[:, :, 3:4] / 255
    return value


def main():
    path = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz'
    data = json.loads(gzip.decompress(path.read_bytes()))
    rows = {(r['id'], r['tick'], r['phase']): r for r in data['rows']}
    results = []
    for effect in ['sxkb', 'fsnl', 'smjc', 'mfjc', 'gjjc', 'fyjc']:
        profile = 'monkey1' if effect in ['sxkb', 'fsnl'] else 'hero1'
        a = rows[(f'{effect}-{profile}-p1-d0-cycle', 3, 'exit-after-owner')]
        b = rows[(f'{effect}-{profile}-p1-d0-move', 3, 'exit-after-owner')]
        for row in [a, b]:
            assert hashlib.sha256((ROOT / row['capture']).read_bytes()).hexdigest() == row['captureSha256']
        dx = b['hostMatrix']['x'] - a['hostMatrix']['x']
        dy = b['hostMatrix']['y'] - a['hostMatrix']['y']
        assert (dx, dy) == (31.25, -12.5)
        original = Image.open(ROOT / a['capture']).convert('RGBA')
        expected = Image.open(ROOT / b['capture']).convert('RGBA')
        left = a['crop']['left'] + dx - b['crop']['left']
        top = a['crop']['top'] + dy - b['crop']['top']
        for name, resample in [('nearest', Image.Resampling.NEAREST), ('bilinear', Image.Resampling.BILINEAR)]:
            candidate = original.transform(expected.size, Image.Transform.AFFINE,
                (1, 0, -left, 0, 1, -top), resample=resample)
            delta = np.abs(visible(candidate) - visible(expected))
            results.append(dict(effect=effect, candidate=name, maxVisibleChannelDelta=float(delta.max()),
                pixelsOver3=int(np.any(delta > 3, axis=2).sum()), source=a['capture'], expected=b['capture'],
                sourceSha256=a['captureSha256'], expectedSha256=b['captureSha256'], translation=[dx, dy]))
    OUT.mkdir(parents=True, exist_ok=True)
    report = dict(status='candidate-mismatch', nativeSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
        boundary='Pillow translation of frozen cycle raster versus independent original move raster; not Phaser, not proof all projections fail. Threshold 3 is a diagnostic counter, not an approved new tolerance. Requires an explained and bounded conversion before production.', results=results)
    (OUT / 'translation-preflight.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(dict(candidates=len(results), pixelsOver3=sum(r['pixelsOver3'] for r in results),
        maxVisibleChannelDelta=max(r['maxVisibleChannelDelta'] for r in results))))


if __name__ == '__main__':
    main()
