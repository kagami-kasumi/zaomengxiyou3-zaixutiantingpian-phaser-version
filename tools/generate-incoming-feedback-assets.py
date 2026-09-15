"""216A: preserve verified native pnum exports after checking restored SWF pixels.

Does not write the 215 oracle. The small runtime projection is regenerated from it.
"""
import hashlib
import importlib.util
import json
import sys
from pathlib import Path
from PIL import Image

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
MAN = ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-215-player-pet-incoming-damage-feedback.json'
spec = importlib.util.spec_from_file_location('incoming_source', ROOT / 'tools/incoming-number/source.py')
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)


def products():
    truth = json.loads(MAN.read_text(encoding='utf-8'))
    assert truth['truthId'] == 'task-settings-215.player-pet-incoming-damage-feedback'
    assert truth['status'] == 'verified' and not truth['unresolved']
    visual = truth['visualTruth']
    complete = visual['completeness']
    assert visual['status'] == 'verified' and complete['displayListMatched'] and complete['stateSetMatched']
    assert not complete['unresolved'] and complete['expectedStateIds'] == complete['extractedStateIds']
    assert source.sha(source.SWF) == visual['provenance'][0]['sha256']
    assert truth['animation'] == source.animation()
    out = {}
    glyphs = []
    for actual, glyph in zip(source.extract(), truth['glyphs'], strict=True):
        for key in ['digit', 'symbolClass', 'characterId', 'width', 'height', 'locator']:
            assert actual[key] == glyph[key], key
        original = ROOT / glyph['assetRef']
        assert source.sha(original) == glyph['sha256']
        image = Image.open(original).convert('RGBA')
        assert image.size == (actual['width'], actual['height'])
        for index, (r, g, b, a) in enumerate(image.get_flattened_data()):
            aa, rr, gg, bb = actual['raw'][index * 4:index * 4 + 4]
            assert a == aa and max(abs(round(r*a/255)-rr), abs(round(g*a/255)-gg), abs(round(b*a/255)-bb)) <= 1
        path = f"/assets/ui/combat-feedback/incoming/{glyph['digit']}.png"
        out[ROOT / ('public' + path)] = original.read_bytes()
        glyphs.append({**glyph, 'key': f"combat-feedback.damage.incoming.{glyph['digit']}", 'path': path})
    child = next(o for o in visual['displayObjects'] if o['objectType'] == 'bitmap')
    root = next(o for o in visual['displayObjects'] if o['objectType'] == 'sprite')
    projection = {
        'truthId': truth['truthId'], 'status': truth['status'],
        'sourceManifestSha256': source.sha(MAN),
        'completeness': {'stateCount': len(visual['states']), 'displayListMatched': True,
                         'stateSetMatched': True, 'unresolved': []},
        'animation': {k: v for k, v in truth['animation'].items() if not k.startswith('queue')},
        'registrationPoint': child['placements'][0]['registrationPoint'],
        'render': child['render'], 'rootSymbol': root['sourceIdentity']['symbolClass'],
        'glyphs': glyphs,
    }
    out[ROOT / 'src/assets/IncomingDamageFeedbackProjection.json'] = (json.dumps(projection, ensure_ascii=False, indent=2) + '\n').encode()
    return out


if __name__ == '__main__':
    outputs = products()
    for path, payload in outputs.items():
        if '--check' in sys.argv:
            assert path.read_bytes() == payload, f'stale product: {path.relative_to(ROOT)}'
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(payload)
    print(f'216A: {len(outputs)-1} source-checked glyphs and runtime projection ' + ('verified' if '--check' in sys.argv else 'generated'))
