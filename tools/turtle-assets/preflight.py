"""Test local-RGBA conversion against independently drawn native stage baselines.

This is a capability preflight, not a renderer or truth promotion. A rejected
candidate says nothing against the native observations themselves.
"""
import argparse
import gzip
import hashlib
import json
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-222A'
OUT = ROOT / 'docs/tasks/evidence/TASK-SLICE-223'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


@lru_cache(maxsize=256)
def compare(local_path, expected_sha, x, y, scale, sign, baseline_path, baseline_sha):
    path = ROOT / local_path
    assert sha(path) == expected_sha
    image = Image.open(path).convert('RGBA')
    image = image.resize((image.width * scale, image.height * scale), Image.Resampling.NEAREST)
    left = x * scale
    if sign < 0:
        left = -left - image.width
        image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    projected = Image.new('RGBA', (940, 590))
    projected.paste(image, (470 + left, 350 + y * scale))
    reference = ROOT / baseline_path
    assert sha(reference) == baseline_sha
    actual = np.array(projected)
    expected = np.array(Image.open(reference).convert('RGBA'))
    assert expected.shape == (590, 940, 4)
    different = np.any(actual != expected, axis=2)
    visible = different & ((actual[:, :, 3] > 0) | (expected[:, :, 3] > 0))
    ys, xs = np.where(visible)
    return dict(differentPixels=int(different.sum()), visibleDifferentPixels=int(visible.sum()),
                alphaDifferentPixels=int(np.count_nonzero(actual[:, :, 3] != expected[:, :, 3])),
                differenceBounds=[int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())] if len(xs) else None)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true', help='Reproduce the recorded preflight, including its rejection.')
    args = parser.parse_args()
    corpus_path = SOURCE / 'effects-native.json.gz'
    corpus = json.loads(gzip.decompress(corpus_path.read_bytes()))
    differences, totals, state_ids = [], {}, []
    for state in corpus['states']:
        local = state['localImage']
        for baseline in state['baselines']:
            assert baseline['root'] == dict(x=470, y=350)
            identity = ('effect:' + state['symbol'] + ':' + str(state['tick']) +
                        ':s' + str(baseline['scale']) + ':d' + str(baseline['sign']))
            state_ids.append(identity)
            result = compare(local['path'], local['sha256'], local['origin']['x'], local['origin']['y'],
                             baseline['scale'], baseline['sign'], baseline['path'], baseline['sha256'])
            counts = totals.setdefault(state['symbol'], dict(states=0, differentStates=0, differentPixels=0))
            counts['states'] += 1
            counts['differentStates'] += int(result['differentPixels'] > 0)
            counts['differentPixels'] += result['differentPixels']
            if result['differentPixels']:
                differences.append(dict(stateId=identity,
                                        baselineId=baseline['id'], symbol=state['symbol'], tick=state['tick'],
                                        scale=baseline['scale'], sign=baseline['sign'], local=local,
                                        baseline=baseline, **result))
    expected = json.loads((SOURCE / 'expected-visual-states.json').read_text(encoding='utf-8'))
    assert len(set(state_ids)) == len(state_ids)
    assert sorted(state_ids) == sorted(s for s in expected['expectedStateIds'] if s.startswith('effect:'))
    example = next(s for s in corpus['states'] if s['symbol'] == 'PetTurtle3Bullet3' and s['tick'] == 0)
    report = dict(taskId='TASK-SLICE-223', status='candidate-conversion-rejected',
                  candidate='Integer nearest resize and horizontal flip of native unit localImage; paste at original registration.',
                  sourceSha256=sha(corpus_path), probeSha256=sha(ROOT / 'tools/turtle-visual/VisualProbe.as'),
                  states=sum(v['states'] for v in totals.values()), differentStates=len(differences),
                  differentPixels=sum(d['differentPixels'] for d in differences),
                  bySymbol=totals, differences=differences,
                  fullObjectGap=dict(symbol=example['symbol'], tick=0, unitLocal=example['localImage'],
                                     scaledStage=example['baselines'][2:],
                                     explanation='Signed scale2 stage RGBA exists, but the 940px viewport clips the object. '
                                     'The unit-local image is not an independently sampled signed/scale2 full-object RGBA.'),
                  boundaries=['No source or verified truth changed.',
                              'Failure rejects this candidate only, not all possible conversion algorithms.',
                              '20 collision cases / 70 approved pixels do not authorize any visual difference.',
                              'Dynamic/buff fixture captures are reference composites, not independently composable object assets.'])
    assert report['states'] == 2440 and report['differentStates'] > 0
    encoded = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
    destination = OUT / 'local-rgba-preflight.json'
    if args.check:
        assert destination.read_text(encoding='utf-8') == encoded, 'Preflight changed; inspect instead of accepting.'
    else:
        OUT.mkdir(parents=True, exist_ok=True)
        destination.write_text(encoded, encoding='utf-8', newline='\n')
    print(json.dumps({k: report[k] for k in ['status', 'states', 'differentStates', 'differentPixels', 'bySymbol']}))


if __name__ == '__main__':
    main()
