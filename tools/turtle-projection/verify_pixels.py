"""Independent Pillow decoding/composition versus unchanged 222A native pixels."""
import argparse
import gzip
import hashlib
import io
import json
from functools import lru_cache
from pathlib import Path

import numpy as np
from PIL import Image

from run import ROOT, BASE, OUT
from transfer import apply_response


@lru_cache(maxsize=384)
def decoded(payload):
    return Image.open(io.BytesIO(payload)).convert('RGBA')


def image(path):
    return decoded(path.read_bytes())


def difference(a, b):
    if a.size != b.size:
        return max(a.width * a.height, b.width * b.height)
    return int(np.count_nonzero(np.any(np.asarray(a) != np.asarray(b), axis=2)))


def load(path):
    raw = path.read_bytes()
    return json.loads(gzip.decompress(raw) if path.suffix == '.gz' else raw)


def stable(row, work):
    a, b = row['primary'], row['expanded']
    return (not a['touchesEdge'] and not b['touchesEdge'] and a['origin'] == b['origin']
            and a['empty'] == b['empty'] and not difference(image(work / a['path']), image(work / b['path'])))


def compose(row, work):
    result = np.zeros((590, 940, 4), dtype=np.uint16)
    for group in [part for parent in row.get('groups',[row]) for part in ([parent] if 'nativeResponse' in parent else parent.get('paintParts',[parent]))]:
        layer = group.get('canonical', group['primary'].get('canonical', group['primary']))
        source = np.asarray(image(work / layer['path']), dtype=np.uint16).copy()
        source[:, :, :3] = (source[:, :, :3] * source[:, :, 3:4] + 255) // 256
        x, y = layer['origin']['x'], layer['origin']['y']
        x0, y0 = max(0, x), max(0, y)
        x1, y1 = min(940, x + source.shape[1]), min(590, y + source.shape[0])
        if x1 <= x0 or y1 <= y0:
            continue
        src = source[y0-y:y1-y, x0-x:x1-x]
        dest = result[y0:y1, x0:x1]
        if 'nativeResponse' in group:
            assert (x0,y0,x1-x0,y1-y0)==(x,y,group['nativeResponse']['width'],group['nativeResponse']['height'])
            apply_response(dest,src,group['nativeResponse'],work)
        else:
            dest[:] = src + (dest * (256 - src[:, :, 3:4])) // 256
    result[:, :, :3] = np.minimum(255, result[:, :, :3] * 256 // np.maximum(result[:, :, 3:4], 1))
    return Image.fromarray(result.astype(np.uint8))


def verify(mode):
    work = BASE / mode
    layer_path = work / 'canonical-layers.json'
    layer_path = layer_path if layer_path.exists() else work / 'layers.json'
    source_path = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-222A' / (mode + '-native.json.gz')
    inputs = {p.relative_to(ROOT).as_posix():hashlib.sha256(p.read_bytes()).hexdigest()
              for p in [layer_path,source_path,work/'measurement.json',Path(__file__).resolve(),Path(__file__).with_name('transfer.py').resolve()]}
    layers = load(layer_path)['rows']
    original = load(source_path)
    observed = load(work / 'measurement.json')
    if mode == 'effects':
        references = {b['id']: b for s in original['states'] for b in s['baselines']}
        before = {(s['symbol'], s['tick']): s for s in original['states']}
        assert set(before) == {(s['symbol'], s['tick']) for s in observed['states']}
        for row in observed['states']:
            assert row['tree'] == before[(row['symbol'], row['tick'])]['tree'], 'Source display changed'
    elif mode == 'body':
        references = {r['id']: dict(path=r['file'], sha256=r['sha256']) for r in original['cells']}
        assert observed['clocks'] == original['clocks'], 'BBDC timing changed'
    else:
        references = {r['id'] + '-' + str(r['tick']): dict(path=r['capture'], sha256=r['captureSha256'], source=r)
                      for r in original['rows']}
        assert len(observed['rows']) == len(references)
        for row in observed['rows']:
            ref = references[row['id'] + '-' + str(row['tick'])]['source']
            assert {k: row[k] for k in row if k not in ['capture', 'captureSha256', 'originalCapturePath']} == {
                k: ref[k] for k in ref if k not in ['capture', 'captureSha256', 'originalCapturePath']}, 'Source trace changed'
    assert len(layers) == len(references) == len({r['id'] for r in layers})
    assert {r['id'] for r in layers} == set(references)
    failures, extents, results = [], [], []
    seen = set()
    for row in layers:
        reference = references[row['id']]
        ref_path = ROOT / reference['path']
        if reference['sha256'] not in seen:
            assert hashlib.sha256(ref_path.read_bytes()).hexdigest() == reference['sha256']
            seen.add(reference['sha256'])
        for group in row.get('groups', [row]):
            for unit in [group, *group.get('components', []), *group.get('paintParts', [])]:
                if not stable(unit, work):
                    extents.append(dict(id=row['id'], path=unit.get('path', 'root')))
        pixels = difference(compose(row, work), image(ref_path))
        results.append(dict(id=row['id'], differentPixels=pixels))
        if pixels:
            failures.append(results[-1])
    report = dict(mode=mode, status='passed' if not failures and not extents else 'unresolved', states=len(layers),
                  inputSha256=inputs,
                  sourceTraceUnchanged=True, differentStates=len(failures), differentPixels=sum(r['differentPixels'] for r in failures),
                  extentFailures=extents, differences=failures, results=results,
                  decoder='Pillow RGBA; native-witness 256 integer premultiplied source-over in original top-level depth order', visualExceptions=[])
    assert all(hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==digest for p,digest in inputs.items())
    (OUT / (mode + '-pixels.json')).write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(mode, report['status'], 'states', len(layers), 'pixel failures', len(failures), 'extent failures', len(extents), failures[:4])
    return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('mode', choices=['body', 'effects', 'dynamic', 'buff'])
    result = verify(parser.parse_args().mode)
    if result['status'] != 'passed':
        raise SystemExit(1)
