"""222A byte-preserved bounded source definitions and timeline metadata."""
import hashlib
import json
import runpy
import struct
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCAL = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-222A/source'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-222A'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    LOCAL.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    helper = runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))
    traversal = runpy.run_path(str(ROOT/'tools/dragon23-collision-source.py'))
    located = json.loads((ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/visual-inputs.json').read_text())
    owners = []
    for source in located['sources']:
        path = ROOT/source['path']
        assert sha(path) == source['sha256']
        tags = helper['source_tags'](path)
        name = path.stem
        # Bounds for the XML bootstrap only; final closure excludes unrelated definitions.
        candidates = {cid for cid in tags if 470 <= cid <= 534} | {7, 11, 15, 22} if name == 'pet1' else {cid for cid in tags if cid <= 120}

        def write_subset(ids, suffix):
            chunks = [helper['tag'](69, struct.pack('<I', 8))]
            chunks += [helper['tag'](*tags[cid]) for cid in sorted(ids)]
            if suffix == '-closure':
                clips = [cid for symbol, cid in source['symbols'].items() if 'Bmd' not in symbol]
                chunks += [helper['place'](cid, i+1, dict(tx=0, ty=0), transformed=False) for i, cid in enumerate(clips)]
            chunks += [helper['tag'](1, b''), helper['tag'](0, b'')]
            body = helper['rectangle'](940, 590)+struct.pack('<HH', 24*256, 1)+b''.join(chunks)
            subset = LOCAL/(name+suffix+'.swf')
            subset.write_bytes(b'FWS'+bytes([10])+struct.pack('<I', 8+len(body))+body)
            return subset

        bootstrap = write_subset(candidates, '-bootstrap')
        xml = LOCAL/(name+'.xml')
        args = ['java', '-Xmx2g', '-jar', 'C:/Program Files (x86)/FFDec/ffdec.jar', '-swf2xml', str(bootstrap), str(xml)]
        result = subprocess.run(args, capture_output=True, timeout=90)
        (LOCAL/(name+'-xml.log')).write_bytes(result.stdout+result.stderr)
        assert result.returncode == 0
        parsed = ET.parse(xml).getroot()
        definitions = {int(t.get('spriteId') or t.get('shapeId') or t.get('characterID')): t for t in parsed.find('tags')
                       if t.get('spriteId') or t.get('shapeId') or t.get('characterID')}
        pending, used = list(source['symbols'].values()), set()
        while pending:
            cid = pending.pop()
            if cid in used:
                continue
            used.add(cid)
            for node in definitions[cid].iter():
                if node.get('type', '').startswith('PlaceObject') and node.get('placeFlagHasCharacter') == 'true':
                    pending.append(int(node.get('characterId')))
                if node.get('bitmapId') and int(node.get('bitmapId')) not in (0, 65535):
                    pending.append(int(node.get('bitmapId')))
        subset = write_subset(used, '-closure')
        selected = {cid: definitions[cid] for cid in used}
        timelines = traversal['timelines'](selected, allow_clip_depth=True)
        # Bitmap payloads remain byte-hashed in source; avoid duplicating their large hex strings.
        summaries = {}
        for cid, node in selected.items():
            attributes={key:value for key,value in node.attrib.items() if key not in ('imageData','bitmapAlphaData','zlibBitmapData')}
            summaries[str(cid)] = dict(tagCode=tags[cid][0], tagBodySha256=hashlib.sha256(tags[cid][1]).hexdigest(),
                                       attributes=attributes,
                                       structure=traversal['tree_data'](node) if tags[cid][0] not in (6, 20, 21, 35, 36, 90) else None)
        owners.append(dict(path=source['path'], sha256=source['sha256'], symbols=source['symbols'],
                           closurePath=subset.relative_to(ROOT).as_posix(), closureSha256=sha(subset),
                           xmlPath=xml.relative_to(ROOT).as_posix(), xmlSha256=sha(xml), command=args,
                           definitions=summaries, timelines=timelines))
    report = dict(taskId='TASK-SETTINGS-222A', status='extracted-not-promoted', sources=owners,
                  note='Timeline placements are binary/XML facts; live nested phase and source AS3 lifetime require native cross-check.')
    (OUT/'source-definitions.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8', newline='\n')
    print('222A source closures:', [(Path(o['path']).name, len(o['definitions']), len(o['timelines'])) for o in owners])


if __name__ == '__main__':
    main()
