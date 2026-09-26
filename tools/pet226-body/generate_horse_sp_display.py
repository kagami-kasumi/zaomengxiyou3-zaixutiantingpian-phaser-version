"""Native private-effect render states across complete source display-list cycles."""
import hashlib
import json
from pathlib import Path
import sys
from PIL import Image
import jsonschema
from native_phase_model import NativePhaseModel

ROOT = Path(__file__).resolve().parents[2]
def read(path): return json.loads((ROOT/path).read_text(encoding='utf-8'))
def sha(path): return hashlib.sha256((ROOT/path).read_bytes()).hexdigest()
def rect(r): return dict(left=r['x'], top=r['y'], width=r['width'], height=r['height'])
def flat(p): return ([p['frame']] if p.get('frame') else []) + [f for c in p.get('children', []) for f in flat(c)]

family = 'monkey' if '--monkey' in sys.argv else 'horse'
task = 228 if family == 'monkey' else 229
all_horse = '--all-horse' in sys.argv
assert not (all_horse and family == 'monkey')
surface = 'monkey-pause-display' if family == 'monkey' else 'horse-pause-display' if all_horse else 'horse-sp-pause-display'
work = f'local-resources/regima/task-outputs/TASK-SLICE-226/{family}-world-pause-air' + ('' if family == 'monkey' else '-render' if all_horse else '-long')
definitions = read(f'docs/tasks/evidence/TASK-SETTINGS-{task}/source-definitions.json')
source = next(s for s in definitions['sources'] if s['id'] == '20120203')
assert sha(source['path']) == source['sha256']
geometries = read(f'docs/tasks/evidence/TASK-SETTINGS-{task}/geometry-inputs.json')['sources']
clocks = read(f'src/assets/pet-{family}-native-clocks.json')['clips']
truth_id = 'task-slice-226.' + surface
states, objects, baselines, counts, projected = [], [], [], {}, {}
native = {fps:read(f'{work}/measurement-{fps}.json') for fps in [20,24,30]}
report = read(f'docs/tasks/evidence/TASK-SLICE-226/{family}-world-pause-native' + ('' if family == 'monkey' else '-render' if all_horse else '-long') + '.json')
for item in report['reports']: assert sha(item['path']) == item['sha256']
roots = {symbol: (s['id'],cid) for s in definitions['sources'] for symbol,cid in s['roots'].items() if symbol in clocks} if all_horse else {symbol: ('20120203',cid) for symbol,cid in (source['roots'] if family == 'monkey' else {'PetHorse3Bullet3': 88}).items()}
for symbol, (source_id, root_cid) in roots.items():
    source = next(s for s in definitions['sources'] if s['id'] == source_id)
    assert sha(source['path']) == source['sha256']
    geometry = next(s for s in geometries if s['id'] == source_id)
    clock = clocks[symbol]
    assets, indices, raster_ids = [], [0], {}
    model = NativePhaseModel(geometry, root_cid)
    for age in range(1, clock['cycleStart'] + clock['cycleTicks']):
        model.finish_pending(model.root)
        phase = model.phase()
        key = symbol+('|' if family == 'horse' and not all_horse else '|exit|') + json.dumps(flat(phase), separators=(',', ':'))
        captures = []
        for fps in [20,24,30]:
            capture = native[fps]['nativePhases'][key]
            path = Path(work)/capture['path']
            assert sha(path) == capture['sha256']
            width, height = Image.open(ROOT/path).size
            crop = dict(left=capture['left'], top=capture['top'], width=width, height=height)
            captures.append((capture['sha256'], crop, path))
            identity = f'{symbol}-fps{fps}-phase{age}'
            states.append(dict(id=identity, entry=f'Native post-construction render state; canonical natural tick {age}; recursive frames {flat(phase)}',
                               fixtureId=f'{work}/measurement-{fps}.json#{key}', baselineId=identity+'-baseline', frame=phase['frame']))
            baselines.append(dict(id=identity+'-baseline', stateId=identity, path=path.as_posix(), sha256=capture['sha256'], width=width, height=height, crop=crop))
            state_objects = []
            def walk(node, cid, parent=None, depth=0, path_id='root', mask_id=None, is_mask=False):
                assert not node.get('pendingConstruction'), (identity, path_id)
                object_id = identity+'/'+path_id
                frames = geometry['timelines'].get(str(cid))
                placements = frames[node['frame']-1] if frames else []
                assert len(placements) == len(node['children']), (identity, cid)
                state_objects.append(dict(id=object_id, parentId=parent, depth=depth,
                    objectType='mask' if is_mask else 'movie-clip' if frames else 'shape',
                    sourceIdentity=dict(provenanceId=source_id, characterId=cid, symbolClass=symbol if cid==root_cid else None, instanceName=node['name'], frame=node.get('frame',1)),
                    placements=[dict(stateId=identity, visible=node['visible'], localMatrix=node['matrix'], registrationPoint=dict(x=0,y=0),
                        localBounds=rect(node['localBounds']), stageBounds=rect(node['rootBounds']), alpha=node['alpha'], colorTransform=node['colorTransform'],
                        derivation='observed', derivationMethod='Original restored MovieClip recursive native capture after construction; source timeline identifies every depth/character.',
                        evidenceRefs=[f'{work}/measurement-{fps}.json#/nativePhases/{key}',
                                      'source-tag-sha256:'+source['definitions'][str(cid)]['tagBodySha256']])],
                    render=dict(assetRef=path.as_posix(), blendMode=node['blendMode'], filters=node['filters'], maskId=mask_id)))
                for index,(child,p) in enumerate(zip(node['children'],placements)):
                    masks=[j for j,q in enumerate(placements) if q.get('clipDepth') and q['depth']<p['depth']<=q['clipDepth']]
                    assert len(masks)<=1
                    child_mask=object_id+'/'+str(masks[0]) if masks else None
                    walk(child,p['characterId'],object_id,p['depth'],path_id+'/'+str(index),child_mask,bool(p.get('clipDepth')))
            walk(capture['tree'],root_cid)
            objects.extend(state_objects)
            counts[identity] = sum(o['placements'][0]['visible'] for o in state_objects)
        assert all((hash_value,crop)==captures[0][:2] for hash_value,crop,_ in captures)
        digest,crop,path = captures[0]
        raster_key = (digest, json.dumps(crop, sort_keys=True))
        if raster_key not in raster_ids:
            index = len(assets); raster_ids[raster_key]=index
            stem = f'{symbol}Native' if family == 'monkey' or all_horse else 'HorseSpNative'
            relative=f'assets/pets/monkey-horse/{stem}-{index}.png'
            asset_key = f'pet-{symbol}-native-{index}' if family == 'monkey' or all_horse else f'pet-horse-sp-native-{index}'
            if all_horse and symbol == 'PetHorse3Bullet3':
                relative = f'assets/pets/monkey-horse/HorseSpNative-{index}.png'
                asset_key = f'pet-horse-sp-native-{index}'
            target=ROOT/'public'/relative
            if '--check' in sys.argv: assert target.read_bytes()==(ROOT/path).read_bytes()
            else: target.write_bytes((ROOT/path).read_bytes())
            assets.append(dict(kind='image', key=asset_key, path=relative, sha256=digest, width=crop['width'], height=crop['height'], crop=crop))
        indices.append(raster_ids[raster_key])
        model.next_enter()
    indices[0]=indices[1]
    projected[symbol] = dict(hostFrameIndices=indices, frames=assets)

data=dict(schemaVersion=1,truthId=truth_id,status='verified',
    scope=dict(taskId='TASK-SLICE-226',surfaceId=surface,originalVersion='restored '+', '.join(sorted({source_id+'.swf' for source_id,_ in roots.values()}))+', original bundled AIR',description='Complete canonical private-effect render states; collision ENTER_FRAME phases and combat lifecycle are separate contracts.'),
    generatedBy=dict(tool='tools/pet226-body/generate_horse_sp_display.py',toolVersion='1',command='python tools/pet226-body/generate_horse_sp_display.py' + (' --monkey' if family == 'monkey' else ' --all-horse' if all_horse else ''),generatedAt='2026-09-25T00:00:00Z'),
    provenance=[dict(id=s['id'],sourceType='restored-swf',sourcePath=s['path'],sha256=s['sha256'],locator='SymbolClasses and recursive closures: '+', '.join(symbol for symbol,(source_id,_) in roots.items() if source_id==s['id'])) for s in definitions['sources'] if s['id'] in {source_id for source_id,_ in roots.values()}],
    stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage',scaleMode='noScale',alignment='TL'),
    states=states,displayObjects=objects,baselines=baselines,
    completeness=dict(expectedStateIds=[s['id'] for s in states],extractedStateIds=[s['id'] for s in states],expectedVisibleObjectCountByState=counts,displayListMatched=True,stateSetMatched=True,unresolved=[]),
    evidenceRefs=[f'docs/tasks/evidence/TASK-SLICE-226/{family}-world-pause-native' + ('' if family == 'monkey' else '-render' if all_horse else '-long') + '.json',f'docs/tasks/evidence/TASK-SLICE-226/{family}-native-clocks-verification.json'])
jsonschema.validate(data,read('docs/reverse-engineering/ground-truth/schema/ui-ground-truth.schema.json'))
truth_path=ROOT/f'docs/reverse-engineering/ground-truth/manifests/task-slice-226-{surface}.json'
truth_path.write_text(json.dumps(data,indent=2)+'\n',encoding='utf-8')
runtime = dict(truthId=truth_id, clips=projected) if family == 'monkey' or all_horse else dict(truthId=truth_id,symbol='PetHorse3Bullet3',**projected['PetHorse3Bullet3'])
payload=json.dumps(runtime,indent=2)+'\n'
target=ROOT/('src/assets/pet-monkey-native-display.json' if family == 'monkey' else 'src/assets/pet-horse-native-display.json' if all_horse else 'src/assets/pet-horse-sp-native-display.json')
if '--check' in sys.argv: assert target.read_text(encoding='utf-8')==payload
else: target.write_text(payload,encoding='utf-8',newline='\n')
print(f'{len(states)} native render states, {len(objects)} display objects, {sum(len(c['frames']) for c in projected.values())} exact rasters; UI Schema and three-FPS byte identity passed.')
