"""Project restored native collider geometry; never derive bounds from old SVG viewports."""
import hashlib
import json
from pathlib import Path
import re
import sys
import jsonschema

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return json.loads((ROOT / path).read_text(encoding='utf-8'))


def sha(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


capture_path = 'docs/tasks/evidence/TASK-SLICE-226/collider-native.json'
ground_path = 'docs/tasks/evidence/TASK-SLICE-226/ground-native.json'
capture, ground = read(capture_path), read(ground_path)
assert sha(capture['source']['path']) == capture['source']['sha256'] == ground['sourceSwf']['sha256']
truth = read('docs/reverse-engineering/ground-truth/manifests/task-settings-228-pet-monkey-collision-phase.json')
assert truth['status'] == 'verified'
source = next(item for item in truth['geometry']['sources'] if item['id'] == 'StageCommon')
assert source['sourceSha256'] == capture['source']['sha256']
states, objects, baselines, counts = [], [], [], {}
profiles = {}
for row in capture['rows']:
    symbol, tree = row['symbol'], row['tree']
    assert row['bounds'] == tree['localBounds'] == tree['rootBounds']
    assert row['width'] == row['bounds']['width'] and row['height'] == row['bounds']['height']
    assert sha(row['png']['path']) == row['png']['sha256']
    identity = 'collider-' + symbol
    states.append(dict(id=identity, entry='Isolated restored collider at root identity; game collider is normally hidden.',
                       frame=1, fixtureId=identity, baselineId='baseline-' + identity))
    baselines.append(dict(id='baseline-' + identity, stateId=identity, **row['png'],
                          width=row['crop']['width'], height=row['crop']['height'], crop=row['crop']))

    def walk(node, cid, path='root', parent=None, depth=0):
        object_id = identity + '/' + path
        timeline = source['timelines'].get(str(cid))
        placements = timeline[0] if timeline else []
        assert len(node['children']) == len(placements), (symbol, cid, 'complete display list differs')
        assert node['alpha'] == 1 and node['visible']
        objects.append(dict(id=object_id, parentId=parent, depth=depth,
            objectType='movie-clip' if timeline else 'shape',
            sourceIdentity=dict(provenanceId='stage-common', characterId=cid,
                symbolClass=symbol if parent is None else None, instanceName=node['name'], frame=1),
            placements=[dict(stateId=identity, visible=True, localMatrix=node['matrix'],
                registrationPoint=dict(x=0, y=0), localBounds=node['localBounds'], stageBounds=node['rootBounds'],
                alpha=node['alpha'], derivation='observed',
                derivationMethod='Native restored display tree/getBounds at root identity; complete child list matched independently decoded SWF timeline.',
                evidenceRefs=[capture_path + '#/rows/' + str(capture['rows'].index(row)),
                              'task-settings-228.pet-monkey-collision-phase#/geometry/StageCommon'])],
            render=dict(assetRef=row['png']['path'], blendMode='normal', filters=[], maskId=None)))
        for index, (child, placement) in enumerate(zip(node['children'], placements)):
            walk(child, placement['characterId'], path + '/' + str(index), object_id, placement['depth'])

    before = len(objects)
    walk(tree, source['roots'][symbol])
    counts[identity] = len(objects) - before
    profiles[symbol] = dict(width=row['width'], height=row['height'],
                            registration=dict(x=-row['bounds']['left'], y=-row['bounds']['top']))

source_root = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
base_object = (source_root / 'base/BaseObject.as').read_text(encoding='utf-8')
base_pet = (source_root / 'base/BasePet.as').read_text(encoding='utf-8')
initial = re.search(r'this.speed = new Point\(([-\d.]+),([-\d.]+)\);', base_object)
assert initial
gravity = float(re.search(r'protected var graity:Number = ([-\d.]+);', base_object)[1])
jump_power = float(re.search(r'this.jumpPower = ([-\d.]+);', base_pet)[1])
pet_constructor = base_pet.split('public function BasePet(', 1)[1].split('override protected function __added(', 1)[0]
# Decompiled constructor assigns this repeatedly; only the final assignment survives.
attack_rate = float(re.findall(r'this.attackRate = ([-\d.]+);', pet_constructor)[-1])
assert 'this.bbdc.turnRight();' in pet_constructor
gxp_method = base_pet.split('public function turnToGxp(', 1)[1].split('public function cancelGxp(', 1)[0]
gxp_speed = float(re.search(r'this.horizenSpeed = ([-\d.]+);', gxp_method)[1])
forms, differences = {}, []
for family, task in [('monkey', 207), ('horse', 209)]:
    legacy = read(f'docs/reverse-engineering/ground-truth/manifests/task-settings-{task}-pet-{family}-family.json')
    forms[family] = {}
    for form in range(1, 5):
        source_path = f'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/export/pet/Pet{family.title()}{form}.as'
        text = (ROOT / source_path).read_text(encoding='utf-8')
        symbol = re.search(r'this.colipse = AUtils.getNewObj\("([^"]+)"\)', text)[1]
        config = next(c for c in ground['configurations'] if c['family'] == family and c['form'] == form)
        assert config['collider'] == symbol
        samples = [r for r in ground['cases'] if r['family'] == family and r['form'] == form]
        assert samples and all(r['collision'] == next(c for c in capture['rows'] if c['symbol'] == symbol)['bounds'] for r in samples)
        assert any(r['path'] == source_path and r['fileSha256'] == sha(source_path) for r in ground['sources'])
        actions = {}
        for action in config['actions']:
            starts = [r for r in samples if r['tick'] == 1 and r['initialAction'] == action]
            assert starts and all(r['beforeFlags'] == starts[0]['beforeFlags'] for r in starts)
            calls = {r['moveCalls'] for r in starts}
            assert len(calls) == 1 and calls <= {0, 1}
            flags = starts[0]['beforeFlags']
            actions[action] = dict(attacking=flags['attacking'], hurt=flags['hurt'],
                immobileOnFloor=flags['immobileFloor'], suppressMove=calls == {0})
        assert re.search(r'override protected function myIntelligence\(\)\s*:\s*void\s*\{\s*'
                         r'if\(!this.isBeAttacking\(\)\)\s*\{\s*super.myIntelligence\(\);\s*\}\s*\}', text)
        speeds = re.findall(r'this.horizenSpeed = ([-\d.]+);', text)
        assert len(speeds) == 1
        assert 'this.attackRate =' not in text
        forms[family][str(form)] = dict(symbol=symbol, collision=profiles[symbol], sourceActions=actions,
            movement=dict(gravity=gravity, jumpPower=jump_power, speed=float(speeds[0]),
                gxpSpeed=gxp_speed, attackRate=attack_rate,
                initialVelocity=dict(x=float(initial[1]), y=float(initial[2])), initialFacingX=1,
                intelligenceBlockedActions=[action for action, flags in actions.items() if flags['hurt']]))
        old = next(p for p in legacy['collisionProfiles'] if p['class'] == symbol)
        differences.append(dict(family=family, form=form, symbol=symbol,
            old=dict(width=old['width'], height=old['height']), native=profiles[symbol]))

truth_id = 'task-slice-226.monkey-horse-ground-colliders'
manifest = dict(schemaVersion=1, truthId=truth_id, status='verified',
    scope=dict(taskId='TASK-SLICE-226', surfaceId='monkey-horse-ground-colliders',
        originalVersion='restored StageCommon.swf, bundled AIR',
        description='Three isolated collision MovieClips at identity root, complete trees and native bounds. No AI/physics/Scene completion claim.'),
    generatedBy=dict(tool='tools/pet226-body/generate_ground_geometry.py', toolVersion='1',
        command='python tools/pet226-body/generate_ground_geometry.py', generatedAt='2026-09-25T00:00:00Z'),
    provenance=[dict(id='stage-common', sourceType='restored-swf', sourcePath=capture['source']['path'],
        sha256=capture['source']['sha256'], locator='SymbolClasses: ' + ', '.join(profiles))],
    stage=dict(width=320, height=320, frameRate=24, coordinateSpace='stage', scaleMode='noScale', alignment='TL'),
    states=states, displayObjects=objects, baselines=baselines,
    completeness=dict(expectedStateIds=[s['id'] for s in states], extractedStateIds=[s['id'] for s in states],
        expectedVisibleObjectCountByState=counts, displayListMatched=True, stateSetMatched=True, unresolved=[]),
    evidenceRefs=[capture_path, ground_path])
jsonschema.validate(manifest, read('docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json'))
outputs = {
    'docs/reverse-engineering/ground-truth/manifests/task-slice-226-monkey-horse-ground-colliders.json': manifest,
    'src/assets/pet-monkey-horse-ground.json': dict(truthId=truth_id, forms=forms),
    'docs/tasks/evidence/TASK-SLICE-226/ground-geometry-verification.json': dict(status='verified-geometry-only',
        scope='Independent native isolated bounds agree with all physics-probe instances; complete decoded child list and UI Schema passed.',
        captureSha256=sha(capture_path), groundSha256=sha(ground_path), oldProfileDifferences=differences),
}
for relative, value in outputs.items():
    payload = json.dumps(value, indent=2) + '\n'
    path = ROOT / relative
    if '--check' in sys.argv:
        assert path.read_text(encoding='utf-8') == payload, relative + ' stale'
    elif '--evidence-only' not in sys.argv or not relative.startswith('src/'):
        path.write_text(payload, encoding='utf-8', newline='\n')
print(f'{len(states)} native collider states/{len(objects)} display objects; eight family mappings and 25920 independent physics samples agree. Runtime wiring remains separate.')
