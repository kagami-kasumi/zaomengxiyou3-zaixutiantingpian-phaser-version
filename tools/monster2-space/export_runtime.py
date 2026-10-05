"""Export runtime inputs from verified 257A; never regenerate native observations."""
import base64
import hashlib
import json
from pathlib import Path
import re
import sys
import zlib

ROOT = Path(__file__).resolve().parents[2]
SIDE = ROOT / 'docs/reverse-engineering/reference/monster2-attack-space-contract.json'
ASSET = 'assets/monsters/family-2-4-7-8/monster2-native'
CHECK = '--check' in sys.argv


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def output(path, value):
    if CHECK:
        assert read(path) == value, path
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(value, separators=(',', ':')) + '\n', encoding='utf-8')


def main():
    side = read(SIDE)
    assert side['status'] == 'verified' and not side['unresolved']
    assert side['approval']['status'] == 'user-approved'
    fields, poses = {}, []
    for attack in side['attacks']:
        number = attack['attack']
        assert sha(ROOT / attack['oracle']['path']) == attack['oracle']['sha256']
        native = read(ROOT / attack['oracle']['path'])
        world_bounds = {target['id']: target['bounds'] for target in native['targets']}
        for pose in native['projections']:
            matrix, bounds = pose['tree']['worldMatrix'], pose['tree']['stageBounds']
            world_bounds[f"f{pose['frame']}-s{pose['sign']}"] = dict(
                x=bounds['x']-matrix['tx'], y=bounds['y']-matrix['ty'],
                width=bounds['width'], height=bounds['height'])
        for resource in attack['resources']:
            source = ROOT / resource['path']
            assert sha(source) == resource['sha256'], source
            match = re.fullmatch(r'attack(\d+)-f(\d+)-s(-?1)', resource['stateId'])
            assert match and int(match[1]) == number
            frame, sign = int(match[2]), int(match[3])
            name = f'a{number}-f{frame}-s{sign}'
            path = f'{ASSET}/{name}.png'
            destination = ROOT / 'public' / path
            if CHECK:
                assert destination.read_bytes() == source.read_bytes(), destination
            else:
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_bytes(source.read_bytes())
            poses.append(dict(attack=number, frame=frame, sign=sign,
                key='monster2-native-' + name, path='/' + path,
                sourceSha256=resource['sha256'],
                **{key: resource[key] for key in ['x', 'y', 'width', 'height', 'emptyAlpha']}))
        if number == 3:  # Raw gather MovieClip has no collision/reception producer.
            continue
        for field in attack['phaseFields']:
            source = ROOT / field['path']
            assert sha(source) == field['sha256'], source
            raw = zlib.decompress(source.read_bytes())
            stride = field['phaseStride']
            assert field['phaseCount'] == 400 and len(raw) == field['rawBytes'] == 400 * stride
            planes, indices, lookup = [], {}, []
            for offset in range(400):
                plane = raw[offset * stride:(offset + 1) * stride]
                if plane not in indices:
                    indices[plane] = len(planes)
                    planes.append(base64.b64encode(plane).decode())
                lookup.append(indices[plane])
            identity = f'a{number}-{field["id"]}' if field['id'].startswith('f') else field['id']
            value = dict(id=identity, phases=lookup, planes=planes,
                **{key: field[key] for key in ['bounds', 'width', 'height', 'originX', 'originY']})
            # World bounds retain native attack sign and hero scale; field.bounds is local.
            if field['id'] in world_bounds:
                value['bounds'] = world_bounds[field['id']]
            if identity in fields:
                assert fields[identity] == value, 'Shared target fields disagree'
            fields[identity] = value
    assert len(poses) == 96 and len(fields) == 72
    output(ROOT / 'src/assets/monster2-collision.json', dict(truthId=side['truthId'],
        sourceContractSha256=sha(SIDE), profiles=side['profiles'], fields=list(fields.values())))
    output(ROOT / 'src/assets/monster2-native-display.json', dict(truthId=side['truthId'], poses=poses))
    print(f'Monster2 runtime inputs: {len(fields)} collision fields, {len(poses)} native poses')


if __name__ == '__main__':
    main()
