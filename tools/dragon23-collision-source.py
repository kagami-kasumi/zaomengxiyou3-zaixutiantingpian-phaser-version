"""Bounded source preparation for 219; only four effects and existing 218 targets."""
from pathlib import Path
import copy
import hashlib
import json
import runpy
import struct
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
LOCAL = ROOT / 'local-resources/regima/task-outputs/task-settings-219'
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-219'
SYMBOLS = {'PetDragon2Bullet1': 547, 'PetDragon2Bullet2': 563,
           'PetDragon3Bullet1': 572, 'PetDragon3Bullet3': 603}
IDENTITY = dict(a=1, b=0, c=0, d=1, tx=0, ty=0)


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def matrix(node):
    a = node.attrib
    fixed = lambda key: round(float(a[key]) * 65536) / 65536
    return dict(a=fixed('scaleX') if a.get('hasScale') == 'true' else 1,
                d=fixed('scaleY') if a.get('hasScale') == 'true' else 1,
                b=fixed('rotateSkew0') if a.get('hasRotate') == 'true' else 0,
                c=fixed('rotateSkew1') if a.get('hasRotate') == 'true' else 0,
                tx=int(a['translateX']) / 20, ty=int(a['translateY']) / 20)


def tree_data(element):
    return {'attributes': dict(element.attrib),
            'children': [{child.tag: tree_data(child)} for child in element],
            'text': element.text.strip() if element.text and element.text.strip() else None}


def timelines(definitions):
    result = {}
    for cid, definition in definitions.items():
        if definition.get('type') != 'DefineSpriteTag':
            continue
        live, frames = {}, []
        for index, item in enumerate(definition.find('subTags')):
            kind = item.get('type')
            if kind.startswith('PlaceObject'):
                depth = int(item.get('depth'))
                fresh = item.get('placeFlagHasCharacter') == 'true'
                state = dict(characterId=int(item.get('characterId')), depth=depth,
                             placedAt=len(frames)+1, matrix=dict(IDENTITY), alpha=1,
                             colorTransform=None, filters=[], blendMode=0, instanceName=None) if fresh else copy.deepcopy(live[depth])
                if item.find('matrix') is not None:
                    state['matrix'] = matrix(item.find('matrix'))
                if item.find('colorTransform') is not None:
                    state['colorTransform'] = dict(item.find('colorTransform').attrib)
                    state['alpha'] = int(state['colorTransform']['alphaMultTerm']) / 256
                if item.find('surfaceFilterList') is not None:
                    state['filters'] = [tree_data(f) for f in item.find('surfaceFilterList')]
                if item.get('placeFlagHasBlendMode') == 'true':
                    state['blendMode'] = int(item.get('blendMode'))
                if item.get('placeFlagHasName') == 'true':
                    state['instanceName'] = item.get('name')
                assert item.get('placeFlagHasClipDepth') != 'true', 'Unresolved clipDepth'
                assert item.get('placeFlagHasClipActions') != 'true', 'Unresolved clipActions'
                state['locator'] = f'DefineSprite/{cid}/subTags/{index}'
                live[depth] = state
            elif kind == 'RemoveObject2Tag':
                del live[int(item.get('depth'))]
            elif kind == 'ShowFrameTag':
                frames.append(copy.deepcopy([live[d] for d in sorted(live)]))
            else:
                assert kind in ('EndTag', 'SoundStreamHead2Tag'), kind
        assert len(frames) == int(definition.get('frameCount'))
        result[cid] = frames
    return result


def expand(cid, frame, sequences, definitions, path='root'):
    rows = []
    for child in sequences[cid][frame-1]:
        item = copy.deepcopy(child)
        item['path'] = path + '/' + str(item['depth'])
        kind = definitions[item['characterId']].get('type')
        item['kind'] = kind
        item['frame'] = (frame-item['placedAt']) % len(sequences[item['characterId']])+1 if item['characterId'] in sequences else 1
        rows.append(item)
        if item['characterId'] in sequences:
            rows.extend(expand(item['characterId'], item['frame'], sequences, definitions, item['path']))
    return rows


def prepare():
    LOCAL.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    helper = runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))
    source = ROOT/'local-resources/regima/source/restored-swfs/assets'
    pet = helper['source_tags'](source/'pet1.swf')
    common = helper['source_tags'](source/'StageCommon.swf')
    # This contiguous dictionary interval consists only of the four dependency closures.
    chosen = {cid: value for cid, value in pet.items() if 543 <= cid <= 603}
    chunks = [helper['tag'](69, struct.pack('<I', 8))]
    chunks += [helper['tag'](*value) for value in chosen.values()]
    chunks += [helper['tag'](*common[cid]) for cid in [53,94,95,104,105,106,107]]
    for depth, cid in enumerate([*SYMBOLS.values(),105,107,95], 1):
        chunks.append(helper['place'](cid, depth, dict(tx=0,ty=0), transformed=False))
    chunks += [helper['tag'](1,b''), helper['tag'](0,b'')]
    body = helper['rectangle'](940,590)+struct.pack('<HH',24*256,1)+b''.join(chunks)
    subset = LOCAL/'source.swf'
    subset.write_bytes(b'FWS'+bytes([10])+struct.pack('<I',8+len(body))+body)
    xml = LOCAL/'source.xml'
    command = ['java','-Xmx2g','-jar','C:/Program Files (x86)/FFDec/ffdec.jar',
               '-swf2xml',str(subset),str(xml)]
    run = subprocess.run(command,capture_output=True,timeout=60)
    (LOCAL/'xml.log').write_bytes(run.stdout+run.stderr)
    if run.returncode:
        raise RuntimeError('Subset XML failed')
    root = ET.parse(xml).getroot()
    defs = {int(t.get('spriteId') or t.get('shapeId') or t.get('characterID')): t
            for t in root.find('tags') if t.get('spriteId') or t.get('shapeId') or t.get('characterID')}
    sequences = timelines(defs)
    states = []
    used = set()
    for symbol,cid in SYMBOLS.items():
        for frame in range(1,len(sequences[cid])+1):
            children = expand(cid,frame,sequences,defs)
            used.update(c['characterId'] for c in children)
            states.append(dict(symbol=symbol,characterId=cid,frame=frame,displayList=children))
    bitmaps = {int(fill.get('bitmapId')) for cid in used for fill in defs[cid].iter('item') if fill.get('bitmapId')}
    used.update(bitmaps);used.update(SYMBOLS.values())
    assert used == set(chosen), (set(chosen)-used,used-set(chosen))
    report = dict(taskId='TASK-SETTINGS-219',status='extracted-not-promoted',
                  sourceHashes={name:sha(source/name) for name in ['pet1.swf','StageCommon.swf']},
                  subsetSha256=sha(subset),xmlSha256=sha(xml),command=command,
                  definitions={str(cid):tree_data(defs[cid]) for cid in sorted(used)},
                  sourceTagHashes={str(cid):hashlib.sha256(value[1]).hexdigest() for cid,value in chosen.items()},
                  states=states)
    (OUT/'source-display-list.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'219 source subset: {len(chosen)} original definitions, {len(states)} frames')


if __name__ == '__main__':
    prepare()
