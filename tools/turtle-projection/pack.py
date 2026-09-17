"""Archive native resource observations by content hash; never alter 222A."""
import copy
import gzip
import hashlib
import json
import sys
from run import ROOT, BASE, OUT, sha

MODES = ('body', 'effects', 'dynamic', 'buff')


def encoded(value):
    return (json.dumps(value, separators=(',', ':'), sort_keys=True) + '\n').encode()


def main():
    check = '--check' in sys.argv
    images = {}
    captures = []
    for mode in MODES:
        work = BASE / mode
        report = json.loads((OUT / (mode + '-run.json')).read_text())
        assert sha(work / 'layers.json') == report['layersSha256']
        assert sha(work / 'measurement.json') == report['measurementSha256']
        assert sha(work / 'RasterCapture.as') == report['observerSha256']
        path = work / ('canonical-layers.json' if (work/'canonical-layers.json').exists() else 'layers.json')
        data = json.loads(path.read_text())

        def walk(value):
            if isinstance(value, list):
                for item in value:
                    walk(item)
            elif isinstance(value, dict):
                if 'path' in value and value['path'].endswith(('.png','.z')):
                    payload = (work / value['path']).read_bytes()
                    digest = hashlib.sha256(payload).hexdigest()
                    suffix = '.png' if value['path'].endswith('.png') else '.z'
                    dest = OUT / 'native-resources' / (digest + suffix)
                    if digest not in images:
                        if check:
                            assert dest.read_bytes() == payload
                        elif not dest.exists():
                            dest.parent.mkdir(parents=True, exist_ok=True)
                            dest.write_bytes(payload)
                        else:
                            assert dest.read_bytes() == payload
                        images[digest] = len(payload)
                    value['originalPath'] = value['path']
                    value['path'] = dest.relative_to(ROOT).as_posix()
                    value['sha256'] = digest
                for item in list(value.values()):
                    if isinstance(item, (dict, list)):
                        walk(item)

        walk(data)
        data['sourceLayersSha256'] = sha(path)
        data['nativeRunSha256'] = sha(OUT / (mode + '-run.json'))
        data['sourceCorpus'] = 'docs/tasks/evidence/TASK-SETTINGS-222A/' + mode + '-native.json.gz'
        data['sourceCorpusSha256'] = sha(ROOT / data['sourceCorpus'])
        payload = gzip.compress(encoded(data), mtime=0)
        dest = OUT / (mode + '-resources.json.gz')
        if check:
            assert dest.read_bytes() == payload
        else:
            dest.write_bytes(payload)
        captures.append(dict(mode=mode, path=dest.relative_to(ROOT).as_posix(), sha256=sha(dest), states=len(data['rows'])))
        for filename in ('RasterCapture.as', 'application.xml', 'fixtures.json'):
            dest = OUT / 'native-observers' / mode / filename
            if check:
                assert dest.read_bytes() == (work / filename).read_bytes()
            else:
                dest.parent.mkdir(parents=True, exist_ok=True)
                dest.write_bytes((work / filename).read_bytes())
    summary = dict(corpora=captures, uniqueImages=len(images), imageBytes=sum(images.values()),
                   scope='225 source resource inputs only; immutable 222A baseline and source display tree remain authoritative.')
    dest = OUT / 'native-corpus.json'
    if check:
        assert dest.read_bytes() == encoded(summary)
    else:
        dest.write_bytes(encoded(summary))
    print('225 native archive:', len(images), 'images;', sum(images.values()), 'bytes')


if __name__ == '__main__':
    main()
