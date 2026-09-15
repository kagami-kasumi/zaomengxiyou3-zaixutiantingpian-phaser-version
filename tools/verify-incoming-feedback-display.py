"""Compare actual browser displays to independent original AIR state and images."""
import copy
import hashlib
import json
import sys
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
NATIVE = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-215/native'
BROWSER = ROOT / '.tmp/verification-images/TASK-SLICE-216A' / ('browser-no-sampling' if '--mutation' in sys.argv else 'browser')
OUT = ROOT / 'docs/tasks/evidence/TASK-SLICE-216A'
original = json.loads((NATIVE / 'measurement.json').read_text(encoding='utf-8'))
actual = json.loads((BROWSER / 'measurement.json').read_text(encoding='utf-8'))
expected = {s['id']: s['objects'] for s in original['states']}
ids = [f'{kind}-{owner}-{t:g}' for kind in ['hero', 'pet'] for owner in ['P1', 'P2']
       for t in [0, .1, .2, .25, .75, 1.249, 1.25]]
ids += [f'direct-value-{v}' for v in [-12, 0, 10, 1234567890]] + ['explicit-destroy']
ids += ['camera-hero-P2']


def verify(run):
    objects = run['objects']
    source = expected[run.get('sourceId', run['id'])]
    assert len(objects) == len(source), (run['id'], 'object count')
    for got, ref in zip(objects, source):
        if run['id'].startswith(('hero-', 'pet-')):
            kind, owner, _ = run['id'].split('-')
            assert got['kind'] == kind and got['owner'] == owner.lower(), 'owner/kind'
        for key in ['x', 'y', 'scaleX', 'scaleY', 'alpha']:
            tolerance = 1/255 if key == 'alpha' else .051 if key == 'y' else .0001
            offset = run.get('cameraX', 0) if key == 'x' else run.get('cameraY', 0) if key == 'y' else 0
            assert abs(got[key] - offset - ref[key]) <= tolerance, (run['id'], key, got[key], ref[key])
        assert len(got['children']) == len(ref['children']), 'digit count'
        for child, native in zip(got['children'], ref['children']):
            assert child['key'] == f"combat-feedback.damage.incoming.{native['digit']}", 'glyph'
            assert child['originX'] == child['originY'] == 0
            assert not child['flipX'] and not child['flipY'] and child['filter'] == 1, 'sampling'
            for key in ['x', 'y', 'width', 'height']:
                assert child[key] == native[key], ('child', key)
                offset = run.get('cameraX', 0) if key == 'x' else run.get('cameraY', 0) if key == 'y' else 0
                assert abs(child['stageBounds'][key] - offset - native['stageBounds'][key]) <= .051, ('bounds', key)


assert not actual['errors']
assert {(r['renderer'], r['id']) for r in actual['runs']} == {(r, i) for r in ['webgl', 'canvas'] for i in ids}
rows = []
for run in actual['runs']:
    verify(run)
    native = Image.open(NATIVE / 'images' / (run.get('sourceId', run['id']) + '.png')).convert('RGBA')
    rendered = Image.open(ROOT / run['imagePath']).convert('RGBA')
    assert native.size == rendered.size == (940, 590)
    # Compare composited pixel colors rather than meaningless RGB under transparent pixels.
    def composite(im):
        bg = Image.new('RGBA', im.size, (30, 34, 44, 255))
        bg.alpha_composite(im)
        return bg.convert('RGB')
    diff = ImageChops.difference(composite(native), composite(rendered))
    pixels = sum(any(p) for p in diff.get_flattened_data())
    maximum = max(c[1] for c in diff.getextrema())
    # Identical glyph coverage, with only premultiplied-alpha/channel rounding.
    # This rejects shifted texels, Canvas extent inflation and substituted glyphs.
    assert maximum <= 2, (run['renderer'], run['id'], 'raster mismatch', maximum)
    rows.append({'id': run['id'], 'renderer': run['renderer'], 'geometryPassed': True,
                 'differentPixels': pixels, 'maximumChannelDifference': maximum})

kills = []
sample = next(r for r in actual['runs'] if r['id'] == 'hero-P1-0.1')
mutations = {
    'owner': lambda o: o[0].update(owner='p2'),
    'target-kind': lambda o: o[0].update(kind='pet'),
    'anchor-x': lambda o: o[0].update(x=o[0]['x'] + 1),
    'anchor-y': lambda o: o[0].update(y=o[0]['y'] + 1),
    'pop-scale': lambda o: o[0].update(scaleX=2),
    'alpha': lambda o: o[0].update(alpha=.5),
    'glyph': lambda o: o[0]['children'][0].update(key='combat-feedback.damage.ordinary.1'),
    'digit-stride': lambda o: o[0]['children'][1].update(x=21),
    'origin': lambda o: o[0]['children'][0].update(originX=.5),
    'smoothing': lambda o: o[0]['children'][0].update(filter=0),
    'flip': lambda o: o[0]['children'][0].update(flipX=True),
    'missing-child': lambda o: o[0]['children'].pop(),
}
for name, mutate in mutations.items():
    bad = copy.deepcopy(sample)
    mutate(bad['objects'])
    try:
        verify(bad)
    except AssertionError:
        kills.append(name)
    else:
        raise AssertionError(f'escaped mutation {name}')
bad = copy.deepcopy(sample)
bad['id'] = 'hero-P1-1.25'
try:
    verify(bad)
except AssertionError:
    kills.append('destroy-timing')
else:
    raise AssertionError('escaped destroy mutation')

assert '--mutation' not in sys.argv, 'sampling mutation escaped'
OUT.mkdir(parents=True, exist_ok=True)
selected = ['hero-P1-0', 'hero-P2-0.1', 'pet-P1-0.2', 'pet-P2-0.75', 'direct-value-1234567890', 'explicit-destroy']
sheet = Image.new('RGB', (940*2, 590*len(selected)), (30, 34, 44))
draw = ImageDraw.Draw(sheet)
for i, sid in enumerate(selected):
    run = next(r for r in actual['runs'] if r['id'] == sid and r['renderer'] == 'webgl')
    for j, path in enumerate([NATIVE / 'images' / (sid+'.png'), ROOT / run['imagePath']]):
        sheet.paste(composite(Image.open(path).convert('RGBA')), (j*940, i*590))
    draw.text((10, i*590+10), sid + ' | Original AIR / production Phaser WebGL', fill='white')
sheet.save(OUT / 'display-comparison.png')
report = {'scope': actual['scope'], 'stateCount': len(rows),
          'geometryTolerance': '0.051px source twips; alpha 1/255 native quantization; scale 0.0001',
          'pixelTolerance': 'Maximum 2/255 composited channel difference (premultiplied alpha rounding); no displaced glyph pixels permitted',
          'rows': rows, 'verifierMutationKills': kills}
report['sourceHashes'] = {
    p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest()
    for p in ['src/scenes/IncomingDamageFeedbackView.ts', 'src/scenes/IncomingDamageBitmapSampling.ts',
              'src/assets/IncomingDamageFeedbackProjection.json',
              'docs/tasks/evidence/TASK-SETTINGS-215/native/measurement.json']
}
(OUT / 'display-verification.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
print(f"216A: {len(rows)} original/browser object comparisons passed, {len(kills)} verifier mutations killed")
print('Pixel differences:', [(r['renderer'], r['id'], r['differentPixels'], r['maximumChannelDifference']) for r in rows if r['differentPixels']])
