"""Read-only 222 scope probe; binary timelines are not verified visual truth."""
import hashlib
import json
import runpy
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-222/source-preflight.json'


def sprite_children(data):
    pos, children = 4, set()
    while pos + 2 <= len(data):
        header = struct.unpack_from('<H', data, pos)[0]
        pos += 2
        code, length = header >> 6, header & 63
        if length == 63:
            length = struct.unpack_from('<I', data, pos)[0]
            pos += 4
        body = data[pos:pos + length]
        pos += length
        if code in (26, 70) and body[0] & 2:
            # These bounded source sprites have no PlaceObject3 class-name field.
            assert code != 70 or not body[1] & 8, 'class-name requires explicit parsing'
            children.add(struct.unpack_from('<H', body, 3 if code == 26 else 4)[0])
        elif code == 4:
            children.add(struct.unpack_from('<H', body)[0])
        elif code == 94:
            raise AssertionError('PlaceObject4 requires explicit parsing')
    return sorted(children)


def generate():
    located = json.loads((ROOT / 'docs/tasks/evidence/TASK-SETTINGS-221/visual-inputs.json').read_text())
    helper = runpy.run_path(str(ROOT / 'tools/dragon-collision-swf-fixtures.py'))
    sources = []
    for source in located['sources']:
        path = ROOT / source['path']
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        assert digest == source['sha256']
        tags = helper['source_tags'](path)
        objects = []
        for symbol, cid in source['symbols'].items():
            pending, seen, sprites = [cid], set(), []
            while pending:
                child = pending.pop()
                if child in seen:
                    continue
                seen.add(child)
                code, data = tags[child]
                if code != 39:
                    continue
                children = sprite_children(data)
                sprites.append(dict(characterId=child, frameCount=struct.unpack_from('<H', data, 2)[0],
                                    placedCharacterIds=children,
                                    tagBodySha256=hashlib.sha256(data).hexdigest()))
                pending.extend(children)
            objects.append(dict(symbol=symbol, characterId=cid, tagCode=tags[cid][0],
                                sprites=sorted(sprites, key=lambda row: row['characterId'])))
        sources.append(dict(path=source['path'], sha256=digest, objects=objects))
    return dict(taskId='TASK-SETTINGS-222', status='preflight-only', sources=sources,
                scope='Binary root/descendant sprite frame counts only. No current-frame display list, pixels, owner precedence or collision verification.',
                unresolved=['host-tick nested playback and follow/turn fixtures',
                            'effect scale2 native oracle and independent sampling',
                            'all 222 visual and collision promotion gates remain pending'])


if __name__ == '__main__':
    value = json.dumps(generate(), ensure_ascii=False, indent=2) + '\n'
    if '--check' in sys.argv:
        assert OUT.read_text(encoding='utf-8') == value
    else:
        OUT.parent.mkdir(parents=True, exist_ok=True)
        OUT.write_text(value, encoding='utf-8')
    print('222 preflight: 13 source symbols; no visual/collision promotion')
