"""Compare actual Scene projection pixels to 248 AIR baselines, not modern metadata."""
import hashlib
import os
import json
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/tasks/evidence/TASK-SLICE-249B/browser'
SIDE = ROOT / 'docs/reverse-engineering/reference/monster3-attack-collision-contract.json'

def read(path):
    return json.loads(path.read_text(encoding='utf-8'))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    side = read(SIDE)
    assert side['status'] == 'verified' and side['unresolved'] == []
    expected = {}
    for attack in side['attacks']:
        oracle = ROOT / attack['oracle']['path']
        assert sha(oracle) == attack['oracle']['sha256']
        for pose in read(oracle)['projections']:
            filename = f"a{attack['attack']}-f{pose['frame']}-s{pose['sign']}.png"
            source = ROOT / f"local-resources/regima/task-outputs/TASK-SETTINGS-248/attack{attack['attack']}/air/baselines/f{pose['frame']}-s{pose['sign']}.png"
            expected[filename] = (source, pose['tree']['worldMatrix'])
    assert len(expected) == 30
    rows = []
    for scene in ([os.environ['M3_VERIFY_SCENE']] if os.environ.get('M3_VERIFY_SCENE') else ['TestScene', 'Stage13Scene']):
        directory = OUT / 'visual' / scene
        if os.environ.get('M3_VISUAL_MUTATION'):
            directory = directory / 'mutations' / os.environ['M3_VISUAL_MUTATION']
        captures = read(directory / 'captures.json')
        assert len(captures) == 60
        captures = {r['file']:r for r in captures}
        assert set(captures) == {name[:-4]+'-'+bg+'.png' for name in expected for bg in ['black','white']}
        for filename, (source, matrix) in expected.items():
            native = Image.open(source).convert('RGBA')
            a = np.asarray(native).astype(float)
            assert native.size == (940, 590)
            bounds = native.getbbox()
            rendered = {}
            deltas = []
            hashes = {}
            for background, color in [('black', 0), ('white', 255)]:
                key = filename[:-4] + '-' + background + '.png'
                capture = captures[key]
                actual = capture['actual']
                assert (capture['pose']['x'], capture['pose']['y']) == (matrix['tx'], matrix['ty'])
                assert capture['pose']['background'] == (0 if color == 0 else 0xffffff)
                assert (actual['x'], actual['y'], actual['width'], actual['height']) == (
                    bounds[0], bounds[1], bounds[2] - bounds[0], bounds[3] - bounds[1])
                assert (actual['originX'], actual['originY'], actual['alpha'], actual['flipX']) == (0, 0, 1, False)
                modern = directory / key
                image = Image.open(modern).convert('RGBA')
                assert image.size == (940, 590)
                pixels = np.asarray(image).astype(float)
                assert np.all(pixels[:, :, 3] == 255), 'Opaque capture must not encode premultiplied transparent pixels'
                composite = a[:, :, :3] * a[:, :, 3:] / 255 + color * (1 - a[:, :, 3:] / 255)
                deltas.append(np.abs(pixels[:, :, :3] - composite))
                rendered[background] = pixels[:, :, :3]
                hashes[background] = sha(modern)
            recovered_alpha = 255 - np.mean(rendered['white'] - rendered['black'], axis=2)
            alpha_error = np.abs(recovered_alpha - a[:, :, 3])
            recovered_bounds = Image.fromarray((recovered_alpha > 0).astype('uint8') * 255).getbbox()
            rows.append(dict(scene=scene, file=filename, renderer=actual['renderer'],
                nativeBounds=bounds, modernBounds=recovered_bounds,
                maxVisibleChannelDifference=float(max(d.max() for d in deltas)),
                maxAlphaDifference=float(alpha_error.max()),
                changedPixels=int(np.any(np.maximum(*deltas) > 0, axis=2).sum()),
                nativeSha256=sha(source), modernSha256=hashes))
    report = dict(status='passed' if all(r['maxVisibleChannelDifference'] <= 3 and r['maxAlphaDifference'] <= 1
        and r['nativeBounds'] == r['modernBounds'] for r in rows) else 'failed', states=len(rows), rows=rows,
        scope='Actual production projection in two loaded Scenes, isolated black/white 940x590 surfaces with alpha recovered from their difference; not combat timing or arbitrary subpixel roots.',
        tolerance='Visible channel <=3/255 and alpha <=1/255 for premultiplication/rounding; exact nontransparent bounds and registration. No collision tolerance.')
    (OUT / ('visual-verification-' + os.environ['M3_VISUAL_MUTATION'] + '.json' if os.environ.get('M3_VISUAL_MUTATION') else 'visual-verification.json')).write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    assert report['status'] == 'passed', [(r['scene'],r['file'],r['maxVisibleChannelDifference'],r['maxAlphaDifference']) for r in rows if r['maxVisibleChannelDifference'] > 3 or r['maxAlphaDifference'] > 1 or r['nativeBounds'] != r['modernBounds']]
    print('Monster3 native display:', len(rows), 'Scene states; max visible delta', max(r['maxVisibleChannelDifference'] for r in rows), 'max alpha delta', max(r['maxAlphaDifference'] for r in rows))

if __name__ == '__main__':
    main()
