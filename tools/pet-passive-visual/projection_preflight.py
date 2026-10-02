"""Read-only 245 raster reuse experiment; not a production-render acceptance."""
import gzip
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/tasks/evidence/TASK-SLICE-245'
NATIVE = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-244/baseline-native.json.gz'


def main():
    data = json.loads(gzip.decompress(NATIVE.read_bytes()))
    rows = {(r['id'], r['tick'], r['phase']): r for r in data['rows']}
    result = []
    for effect in ['sxkb', 'fsnl']:
        for tick in range(4, 26):
            phase = 'exit-after-owner'
            source = rows[(f'{effect}-monkey1-p1-d0-cycle', tick, phase)]
            target = rows[(f'{effect}-monkey1-p1-d0-host-destroy', tick, phase)]
            assert source['crop'] == target['crop']
            src = np.array(Image.open(ROOT / source['capture']).convert('RGBA'))
            dst = np.array(Image.open(ROOT / target['capture']).convert('RGBA'))
            alpha = target['display']['children'][0]['alpha']
            candidate = src.copy()
            candidate[:, :, 3] = np.floor(src[:, :, 3].astype(float) * alpha + .5).astype('uint8')
            # Compare premultiplied visible channels to ignore RGB under zero alpha.
            def visible(a):
                out = a.astype(float)
                out[:, :, :3] *= out[:, :, 3:4] / 255
                return np.floor(out + .5).astype('int16')
            delta = np.abs(visible(candidate) - visible(dst))
            result.append(dict(effect=effect, tick=tick, alpha=alpha,
                               pixels=int(np.any(delta, axis=2).sum()),
                               maxChannelDelta=int(delta.max()),
                               pixelsOver2=int(np.any(delta > 2, axis=2).sum()),
                               source=source['capture'], expected=target['capture']))
    OUT.mkdir(parents=True, exist_ok=True)
    report = dict(boundary='Pillow/NumPy post-raster alpha candidate versus original native fade. No Phaser renderer or gameplay execution; a failed candidate does not prove every projection impossible.',
                  nativeSha256=hashlib.sha256(NATIVE.read_bytes()).hexdigest(), rows=result)
    (OUT / 'projection-preflight.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
    print(json.dumps(dict(cases=len(result), different=sum(r['pixels'] > 0 for r in result),
                          pixelsOver2=sum(r['pixelsOver2'] for r in result),
                          maxChannelDelta=max(r['maxChannelDelta'] for r in result))))


if __name__ == '__main__':
    main()
