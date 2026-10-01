"""Verify native passive-buff display trees against the pet1 source XML.

This checks only the source-owned buff subtree.  Host/world and
FollowBaseObjectBullet wrappers are intentionally excluded from the proof.
"""
import argparse
import copy
import gzip
import json
import math
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-244'
LOCAL = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-244/source'
ALIASES = {'sxkb': 'buff_sxkb', 'fsnl': 'buff_fsnl', 'smjc': 'buff_smjc',
           'mfjc': 'buff_mfjc', 'gjjc': 'buff_gjjc', 'fyjc': 'buff_fyjc'}
SOURCE_IDS = {'buff_sxkb': 806, 'buff_fsnl': 713, 'buff_smjc': 805,
              'buff_mfjc': 778, 'buff_gjjc': 761, 'buff_fyjc': 738}
SWF_MATRIX_TOL = {'linear': 1e-7, 'translation': 1e-7}


def source_timelines(xml_path):
    root = ET.parse(xml_path).getroot()
    sprites = {int(n.get('spriteId')): n for n in root.iter() if n.get('spriteId')}
    result = {}
    for cid, sprite in sprites.items():
        live, frames = {}, []
        subtags = next((n for n in sprite if n.tag == 'subTags'), None)
        if subtags is None:
            continue
        for index, item in enumerate(subtags):
            kind = item.get('type', '')
            if kind.startswith('PlaceObject'):
                depth = int(item.get('depth'))
                fresh = item.get('placeFlagHasCharacter') == 'true'
                if fresh:
                    live[depth] = {'characterId': int(item.get('characterId')), 'depth': depth,
                                   'placedAt': len(frames) + 1, 'xml': item,
                                   'locator': f'DefineSprite/{cid}/subTags/{index}'}
                elif depth not in live:
                    raise ValueError(f'unknown update depth {cid}:{depth}')
                else:
                    # PlaceObject updates inherit omitted matrix/color/filter
                    # fields. Merge both attributes and child records instead
                    # of replacing the effective placement with the sparse XML.
                    effective = copy.deepcopy(live[depth]['xml'])
                    effective.attrib.update(item.attrib)
                    for child in item:
                        old = next((x for x in effective if x.tag == child.tag), None)
                        if old is not None:
                            effective.remove(old)
                        effective.append(copy.deepcopy(child))
                    live[depth] = dict(live[depth], xml=effective)
            elif kind == 'RemoveObject2Tag':
                depth = int(item.get('depth'))
                if depth not in live:
                    raise ValueError(f'unknown remove depth {cid}:{depth}')
                del live[depth]
            elif kind == 'ShowFrameTag':
                frames.append([live[d] for d in sorted(live)])
            elif kind not in ('EndTag', 'SoundStreamHead2Tag'):
                raise ValueError(f'unknown source timeline tag {cid}:{kind}')
        expected = int(sprite.get('frameCount'))
        if len(frames) != expected:
            raise ValueError(f'frame count mismatch {cid}: {len(frames)} != {expected}')
        result[cid] = frames
    return result


def matrix_from_xml(item):
    n = item.find('matrix')
    if n is None:
        return {'a': 1, 'b': 0, 'c': 0, 'd': 1, 'tx': 0, 'ty': 0}
    a = n.attrib
    return {'a': float(a.get('scaleX', 1)) if a.get('hasScale') == 'true' else 1,
            'd': float(a.get('scaleY', 1)) if a.get('hasScale') == 'true' else 1,
            'b': float(a.get('rotateSkew0', 0)) if a.get('hasRotate') == 'true' else 0,
            'c': float(a.get('rotateSkew1', 0)) if a.get('hasRotate') == 'true' else 0,
            'tx': int(a.get('translateX', 0)) / 20,
            'ty': int(a.get('translateY', 0)) / 20}


def close(x, y, key):
    tol = SWF_MATRIX_TOL['translation'] if key in ('tx', 'ty') else SWF_MATRIX_TOL['linear']
    return math.isfinite(float(x)) and abs(float(x) - float(y)) <= tol


def identity_color():
    return dict(redMultiplier=1, greenMultiplier=1, blueMultiplier=1, alphaMultiplier=1,
                redOffset=0, greenOffset=0, blueOffset=0, alphaOffset=0)


def source_color(item):
    n = item.find('colorTransform')
    if n is None:
        return identity_color()
    a = n.attrib
    return dict(redMultiplier=int(a.get('redMultTerm', 256)) / 256,
                greenMultiplier=int(a.get('greenMultTerm', 256)) / 256,
                blueMultiplier=int(a.get('blueMultTerm', 256)) / 256,
                alphaMultiplier=int(a.get('alphaMultTerm', 256)) / 256,
                redOffset=int(a.get('redAddTerm', 0)), greenOffset=int(a.get('greenAddTerm', 0)),
                blueOffset=int(a.get('blueAddTerm', 0)), alphaOffset=int(a.get('alphaAddTerm', 0)))


def filter_facts(item):
    node = item.find('surfaceFilterList')
    if node is None:
        return []
    facts = []
    for f in node:
        fact = {'type': f.get('type', '').lower()}
        matrix = f.find('matrix')
        if matrix is not None:
            fact['matrix'] = [float(x.text) for x in matrix.findall('item')]
        for key, value in f.attrib.items():
            if key not in ('type', 'id'):
                try:
                    fact[key] = float(value)
                except ValueError:
                    fact[key] = value
        facts.append(fact)
    return facts


def native_filter_facts(node):
    facts = []
    for f in node.get('filters', []):
        fact = {'type': f.get('type', '').split('::')[-1].lower()}
        for key, value in f.items():
            if key != 'type':
                fact[key] = value
        facts.append(fact)
    return facts


def native_nodes(node):
    yield node
    for child in node.get('children', []):
        yield from native_nodes(child)


def find_buff(root, name):
    matches = [n for n in native_nodes(root) if n.get('type', '').split('::')[-1] == name]
    if len(matches) != 1:
        raise ValueError(f'{name}: expected one source-owned buff node, found {len(matches)}')
    return matches[0]


def verify_tree(node, cid, frame, timelines, definitions, errors, state_path):
    if cid not in timelines:
        errors.append(f'{state_path}: missing source timeline {cid}')
        return 0
    frames = timelines[cid]
    if frame < 1 or frame > len(frames):
        errors.append(f'{state_path}: native frame {frame} outside source 1..{len(frames)}')
        return 0
    placements = frames[frame - 1]
    children = node.get('children', [])
    if len(children) != len(placements):
        errors.append(f'{state_path}: child count {len(children)} != source {len(placements)}')
    count = 1
    for index, placement in enumerate(placements):
        if index >= len(children):
            continue
        child = children[index]
        child_id = placement['characterId']
        expected_sprite = child_id in timelines
        kind = child.get('type', '').split('::')[-1]
        if expected_sprite and kind != 'MovieClip':
            errors.append(f'{state_path}/{index}: source sprite {child_id}, native type {kind}')
        if not expected_sprite and kind not in ('Shape', 'Bitmap', 'BitmapData'):
            errors.append(f'{state_path}/{index}: source definition {child_id}, native type {kind}')
        src_matrix = matrix_from_xml(placement['xml'])
        got_matrix = child.get('matrix', {})
        for key in ('a', 'b', 'c', 'd', 'tx', 'ty'):
            if key not in got_matrix or not close(got_matrix[key], src_matrix[key], key):
                errors.append(f'{state_path}/{index}: matrix {key} native={got_matrix.get(key)} source={src_matrix[key]}')
        src_filters = placement['xml'].find('surfaceFilterList')
        expected_filters = filter_facts(placement['xml'])
        got_filters = native_filter_facts(child)
        if len(got_filters) != len(expected_filters):
            errors.append(f'{state_path}/{index}: filters {len(got_filters)} != source {len(expected_filters)}')
        for fi, (got_filter, source_filter) in enumerate(zip(got_filters, expected_filters)):
            for key, expected_value in source_filter.items():
                if key not in got_filter:
                    errors.append(f'{state_path}/{index}: filter {fi} missing {key}')
                    continue
                actual = got_filter[key]
                if isinstance(expected_value, list):
                    if len(actual) != len(expected_value) or any(abs(float(a) - float(b)) > 1e-7 for a, b in zip(actual, expected_value)):
                        errors.append(f'{state_path}/{index}: filter {fi} {key} differs')
                elif isinstance(expected_value, (int, float)):
                    if abs(float(actual) - float(expected_value)) > 1e-7:
                        errors.append(f'{state_path}/{index}: filter {fi} {key} differs')
                elif str(actual).lower() != str(expected_value).lower():
                    errors.append(f'{state_path}/{index}: filter {fi} {key} differs')
        expected_color = source_color(placement['xml'])
        got_color = child.get('colorTransform', {})
        for key, value in expected_color.items():
            if key not in got_color or abs(float(got_color[key]) - float(value)) > 1e-7:
                errors.append(f'{state_path}/{index}: colorTransform {key} native={got_color.get(key)} source={value}')
        has_mask = placement['xml'].get('placeFlagHasClipDepth') == 'true'
        if bool(child.get('mask')) != has_mask:
            errors.append(f'{state_path}/{index}: mask native={bool(child.get("mask"))} source={has_mask}')
        if expected_sprite:
            total = len(timelines[child_id])
            got_frame = int(child.get('frame', 0))
            expected_frame = ((frame - placement['placedAt']) % total) + 1
            if got_frame != expected_frame:
                errors.append(f'{state_path}/{index}: nested frame {got_frame} != source clock {expected_frame}')
            if got_frame < 1 or got_frame > total:
                errors.append(f'{state_path}/{index}: native nested frame {got_frame} outside source range')
            count += verify_tree(child, child_id, got_frame, timelines, definitions,
                                 errors, f'{state_path}/{index}')
        else:
            count += 1
    return count


def run_mutations(data, timelines, definitions):
    """Mutate real native rows and prove each mutation is rejected."""
    base = next((r for r in data['rows'] if r.get('phase') == 'first-owner-step'
                 and str(r.get('id', '')).startswith('sxkb-')), None)
    if base is None:
        raise ValueError('mutation fixture requires a present sxkb first-owner-step row')
    tests = []
    def add(name, mutate, check=None):
        row = copy.deepcopy(base)
        buff = find_buff(row['display'], 'buff_sxkb')
        mutate(buff)
        errors = []
        if check:
            check(buff, errors)
        else:
            verify_tree(buff, 806, int(buff.get('frame', 0)), timelines, definitions, errors, name)
        tests.append(dict(name=name, rejected=bool(errors), evidence=errors[:3]))
    add('nested-frame', lambda b: b['children'][0].__setitem__('frame', 2))
    add('shape-matrix-tx', lambda b: b['children'][0]['children'][0]['matrix'].__setitem__('tx', 0.125))
    add('shape-matrix-a', lambda b: b['children'][0]['children'][0]['matrix'].__setitem__('a', 1.1))
    add('shape-color-multiplier', lambda b: b['children'][0]['children'][0]['colorTransform'].__setitem__('redMultiplier', 1.1))
    add('shape-color-offset', lambda b: b['children'][0]['children'][0]['colorTransform'].__setitem__('redOffset', 1))
    add('delete-filter', lambda b: b['children'][0].__setitem__('filters', []))
    add('filter-parameter', lambda b: b['children'][0]['filters'][0]['matrix'].__setitem__(0, 0.9))
    add('delete-shape', lambda b: b['children'][0]['children'].__delitem__(0))
    add('wrong-total-frames', lambda b: b.__setitem__('totalFrames', 99),
        lambda b, e: e.append('totalFrames differs from source') if b['totalFrames'] != len(timelines[806]) else None)
    add('unknown-symbol', lambda b: b.__setitem__('type', 'buff_unknown'),
        lambda b, e: e.append('unknown native buff symbol'))
    report = dict(taskId='TASK-SETTINGS-244', status='passed' if all(x['rejected'] for x in tests) else 'failed',
                  input='baseline-native.json.gz', tests=tests,
                  note='Each case mutates a copied native row and runs the same source-owned subtree checks; host alpha is outside this verifier.')
    (EVIDENCE / 'display-mutations.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(f"display mutations: {report['status']}; rejected={sum(x['rejected'] for x in tests)}/{len(tests)}")
    if report['status'] != 'passed':
        raise SystemExit(1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', choices=('smoke', 'native'), default='native')
    parser.add_argument('--mutations', action='store_true')
    args = parser.parse_args()
    input_path = EVIDENCE / ('baseline-smoke-native.json.gz' if args.input == 'smoke' else 'baseline-native.json.gz')
    source_json = json.loads((EVIDENCE / 'source-definitions.json').read_text(encoding='utf-8'))
    xml_path = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-244/source/pet1-closure.xml'
    timelines = source_timelines(xml_path)
    if len(source_json['definitions']) != 107 or len(timelines) != 7:
        raise ValueError('source contract must contain 107 definitions and 7 timelines')
    data = json.load(gzip.open(input_path, 'rt', encoding='utf-8'))
    if args.mutations:
        run_mutations(data, timelines, source_json['definitions'])
        return
    errors, states = [], []
    for row_index, row in enumerate(data.get('rows', [])):
        effects = row.get('effects')
        effect = effects[0].get('name') if isinstance(effects, list) and effects and isinstance(effects[0], dict) else None
        if effect not in ALIASES:
            effect = str(row.get('id', '')).split('-', 1)[0]
        if effect not in ALIASES:
            raise ValueError(f"unknown effect name: {effect}")
        buff_name = ALIASES[effect]
        unknown = [n.get('type', '').split('::')[-1] for n in native_nodes(row['display'])
                   if n.get('type', '').split('::')[-1].startswith('buff_') and
                   n.get('type', '').split('::')[-1] not in SOURCE_IDS]
        if unknown:
            raise ValueError(f"unknown native buff symbol(s): {unknown}")
        matches = [n for n in native_nodes(row['display'])
                   if n.get('type', '').split('::')[-1] == buff_name]
        if not matches:
            states.append(dict(stateID=f"{row['id']}:{row.get('tick')}:{row.get('phase')}", effect=effect, sourceCharacterId=SOURCE_IDS[buff_name],
                               nativeFrame=None, nativeTotalFrames=None,
                               sourceFrameCount=len(timelines[SOURCE_IDS[buff_name]]),
                               sourceRecursiveObjectCount=0,
                               wrapperBoundary='buff absent in this lifecycle state; wrapper excluded'))
            continue
        if len(matches) != 1:
            raise ValueError(f'{buff_name}: expected one source-owned buff node, found {len(matches)}')
        buff = matches[0]
        cid = SOURCE_IDS[buff_name]
        frame = int(buff.get('frame', 0))
        total = int(buff.get('totalFrames', 0))
        if total != len(timelines[cid]):
            errors.append(f"{row['id']}:{effect}: totalFrames {total} != source {len(timelines[cid])}")
        object_count = verify_tree(buff, cid, frame, timelines, source_json['definitions'], errors,
                                   f"{row['id']}/{buff_name}")
        states.append(dict(stateID=f"{row['id']}:{row.get('tick')}:{row.get('phase')}", effect=effect, sourceCharacterId=cid,
                           nativeFrame=frame, nativeTotalFrames=total,
                           sourceFrameCount=len(timelines[cid]), sourceRecursiveObjectCount=object_count,
                           wrapperBoundary='buff node selected directly; world/host/follow wrapper excluded'))
    report = dict(taskId='TASK-SETTINGS-244', input=str(input_path.relative_to(ROOT)).replace('\\', '/'),
                  status='passed' if not errors else 'failed', rows=len(states), states=states,
                  tolerances=SWF_MATRIX_TOL,
                  toleranceReason='linear values use SWF XML fixed-point/API conversion; translations use SWF twips to display units',
                  errors=errors)
    out = EVIDENCE / 'display-verification.json'
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(f"display verification: {report['status']}; states={len(states)}; errors={len(errors)}")
    if errors:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
