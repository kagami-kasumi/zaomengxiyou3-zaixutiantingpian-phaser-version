"""TASK-SETTINGS-217: recover the five existing levels' wall display lists.

XML is the generator input; selected FFDec SVG exports are independent geometry
checks, and the verifier also decodes the original SWF tag stream directly.
No game Layout constants are used as source facts.
"""
import hashlib
from datetime import datetime, timezone
import json
import math
import re
from pathlib import Path
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'local-resources/regima/task-outputs/task-settings-217'
EVIDENCE = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-217'
MANIFEST = ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-217-pet-ground-environment.json'
FFDEC = 'C:/Program Files (x86)/FFDec/ffdec-cli.exe'
LEVELS = (11, 12, 13, 21, 22)
IDENTITY = dict(a=1, b=0, c=0, d=1, tx=0, ty=0)
WALL_CLASSES = {'export.ObsWall', 'export.ThroughWall', 'export.ThroughUpButDownWall', 'export.FallDownWhenStandingWall'}


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def relative(p):
    return p.relative_to(ROOT).as_posix()


def run(*args):
    result = subprocess.run([FFDEC, *map(str, args)], capture_output=True, text=True,
                            cwd=ROOT, timeout=90)
    if result.returncode:
        raise RuntimeError(result.stdout + result.stderr)


def matrix(node):
    if node is None:
        return dict(IDENTITY)
    v = node.attrib
    return dict(a=float(v['scaleX']) if v.get('hasScale') == 'true' else 1,
                b=float(v['rotateSkew0']) if v.get('hasRotate') == 'true' else 0,
                c=float(v['rotateSkew1']) if v.get('hasRotate') == 'true' else 0,
                d=float(v['scaleY']) if v.get('hasScale') == 'true' else 1,
                tx=int(v['translateX']) / 20, ty=int(v['translateY']) / 20)


def compose(p, q):
    return dict(a=p['a']*q['a']+p['c']*q['b'], b=p['b']*q['a']+p['d']*q['b'],
                c=p['a']*q['c']+p['c']*q['d'], d=p['b']*q['c']+p['d']*q['d'],
                tx=p['a']*q['tx']+p['c']*q['ty']+p['tx'],
                ty=p['b']*q['tx']+p['d']*q['ty']+p['ty'])


def transform(rect, m):
    points = [(m['a']*x+m['c']*y+m['tx'], m['b']*x+m['d']*y+m['ty'])
              for x in (rect['left'], rect['left']+rect['width'])
              for y in (rect['top'], rect['top']+rect['height'])]
    xs, ys = zip(*points)
    return dict(left=min(xs), top=min(ys), width=max(xs)-min(xs), height=max(ys)-min(ys))


def union(rects):
    if not rects:
        return dict(left=0, top=0, width=0, height=0)
    left, top = min(x['left'] for x in rects), min(x['top'] for x in rects)
    return dict(left=left, top=top,
                width=max(x['left']+x['width'] for x in rects)-left,
                height=max(x['top']+x['height'] for x in rects)-top)


def first_frame(node):
    placements = []
    for child in node.find('subTags'):
        kind = child.get('type')
        if kind == 'ShowFrameTag':
            break
        if kind.startswith('PlaceObject'):
            assert child.get('placeFlagMove') != 'true', 'unhandled frame move'
            assert child.get('placeFlagHasClipDepth') != 'true', 'unhandled mask'
            placements.append(dict(characterId=int(child.get('characterId')), depth=int(child.get('depth')),
                                   name=child.get('name'), matrix=matrix(child.find('matrix'))))
    return sorted(placements, key=lambda p: p['depth'])


def load_level(level, refresh=False):
    swf = ROOT / f'local-resources/regima/source/restored-swfs/assets/levels/level{level}.swf'
    xml = OUT / f'level{level}.xml'
    digest = OUT / f'level{level}.sha256'
    if refresh or not xml.exists() or not digest.exists() or digest.read_text() != sha(swf):
        run('-swf2xml', swf, xml)
        digest.write_text(sha(swf))
    document = ET.parse(xml).getroot()
    assert document.get('_xmlExportMajor') == '2'
    tags = list(document.find('tags'))
    definitions = {}
    symbols = {}
    for tag in tags:
        for key in ('spriteId', 'shapeId'):
            if key in tag.attrib:
                definitions[int(tag.get(key))] = tag
        if tag.get('type') == 'SymbolClassTag':
            symbols.update(zip([int(i.text) for i in tag.find('tags')], [i.text for i in tag.find('names')]))
    root_id = next(k for k, v in symbols.items() if v == f'export.gameSence.sl{level}')
    placements = first_frame(definitions[root_id])
    walls = [p for p in placements if symbols.get(p['characterId']) in WALL_CLASSES]
    assert walls
    marker_names={'isWall','isThroughWall','isThroughDownButUpWall','isThroughUpButDownWall'}
    registered=[p for p in placements if definitions.get(p['characterId']) is not None
                and definitions[p['characterId']].get('type')=='DefineSpriteTag'
                and any(c['name'] in marker_names for c in first_frame(definitions[p['characterId']]))]
    assert registered==walls, 'Unexpected PhysicsWorld marker registration outside the declared wall classes'

    def bounds(cid):
        node = definitions[cid]
        if node.get('type').startswith('DefineShape'):
            r = node.find('shapeBounds').attrib
            return dict(left=int(r['Xmin'])/20, top=int(r['Ymin'])/20,
                        width=(int(r['Xmax'])-int(r['Xmin']))/20,
                        height=(int(r['Ymax'])-int(r['Ymin']))/20)
        assert node.get('type') == 'DefineSpriteTag' and node.get('frameCount') == '1', f'unhandled wall child {cid}'
        children = first_frame(node)
        return union([transform(bounds(c['characterId']), c['matrix']) for c in children
                      if bounds(c['characterId'])['width'] or bounds(c['characterId'])['height']])

    return swf, xml, definitions, symbols, root_id, walls, bounds


def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    EVIDENCE.mkdir(parents=True, exist_ok=True)
    provenance, objects, states, baselines, levels = [], [], [], [], []
    shared_classes=['base.Wall','base.BaseObject','base.BasePet','base.BaseHero','base.BaseGameSence','World.PhysicsWorld',*sorted(WALL_CLASSES)]
    run('-selectclass', ','.join(shared_classes), '-export', 'script', OUT/'shared-source',
        ROOT/'local-resources/regima/source/restored-swfs/1_MainLoad__main1.swf')
    root_reports=[]
    for level in LEVELS:
        swf, xml, definitions, symbols, root_id, walls, bounds = load_level(level, '--refresh' in sys.argv)
        source_id = f'level{level}'
        script_dir=OUT/f'source-audit/level{level}'
        run('-selectclass', f'export.gameSence.sl{level}', '-export', 'script', script_dir, swf)
        script=script_dir/f'scripts/export/gameSence/sl{level}.as'
        code=script.read_text(encoding='utf-8')
        root_reports.append(dict(level=level,source=relative(swf),sha256=sha(swf),script=relative(script),
            declaredTypes=sorted(set(re.findall(r'var\s+\w+\s*:\s*(\w+)',code))),
            assignedProperties=sorted(set(re.findall(r'\.(\w+)\s*=(?!=)',code))),
            dynamicTokens=sorted(set(re.findall(r'\b(?:speedX|speedY|addFrameScript|removeChild|addChild)\b',code)))))
        state = f'level{level}-source-initial'
        root_key = f'level{level}-wall-scope'
        provenance.extend([dict(id=source_id, sourceType='restored-swf', sourcePath=relative(swf), sha256=sha(swf),
                                locator=f'export.gameSence.sl{level}; DefineSprite {root_id}; frame 1, wall children'),
                           dict(id=source_id+'-xml', sourceType='ffdec-xml', sourcePath=relative(xml), sha256=sha(xml),
                                locator=f'DefineSprite {root_id}/subTags')])
        selected = sorted({root_id, *(p['characterId'] for p in walls)})
        svg_dir = OUT / f'level{level}-selected-svg'
        png_dir = OUT / f'level{level}-selected-png'
        run('-selectid', ','.join(map(str, selected)), '-select', '1', '-format', 'sprite:svg', '-export', 'sprite', svg_dir, swf)
        run('-selectid', str(root_id), '-select', '1', '-format', 'sprite:png', '-export', 'sprite', png_dir, swf)
        svg_root_path = next(svg_dir.glob(f'DefineSprite_{root_id}_*/1.svg'))
        svg_root = ET.parse(svg_root_path).getroot()
        png_path = next(png_dir.glob(f'DefineSprite_{root_id}_*/1.png'))
        preview = EVIDENCE / f'level{level}-source-initial.png'
        preview.write_bytes(png_path.read_bytes())
        destination = EVIDENCE / f'level{level}-source-initial.svg'
        destination.write_bytes(svg_root_path.read_bytes())
        source_width = float(svg_root.get('width').removesuffix('px'))
        source_height = float(svg_root.get('height').removesuffix('px'))
        width, height = math.ceil(source_width), math.ceil(source_height)
        affine = [float(x) for x in re.search(r'matrix\(([^)]+)\)', list(svg_root)[0].get('transform')).group(1).split(',')]
        crop = dict(left=-affine[4], top=-affine[5], width=source_width, height=source_height)
        baselines.append(dict(id=state, stateId=state, path=relative(destination), sha256=sha(destination),
                              width=width, height=height, crop=crop))
        states.append(dict(id=state, entry=f'Original sl{level} frame1 wall geometry before PhysicsWorld hides markers',
                           fixtureId=state, baselineId=state, frame=1))
        root_bounds = union([transform(bounds(p['characterId']), p['matrix']) for p in walls])

        def add_object(cid, key, parent, depth, local, world, instance=None, is_scope=False):
            rect = root_bounds if is_scope else bounds(cid)
            kind = 'container' if is_scope else ('shape' if definitions[cid].get('type').startswith('DefineShape') else 'sprite')
            objects.append(dict(id=key, parentId=parent, depth=depth, objectType=kind,
                                sourceIdentity=dict(provenanceId=source_id, characterId=cid, symbolClass=symbols.get(cid), instanceName=instance, frame=1),
                                placements=[dict(stateId=state, visible=True, localMatrix=local, registrationPoint=dict(x=0,y=0),
                                                 localBounds=rect, stageBounds=transform(rect, world), derivation='calculated',
                                                 derivationMethod='Recursive original shape RECT and PlaceObject MATRIX, twips/20; wall scope excludes non-wall scene art.',
                                                 evidenceRefs=[source_id, source_id+'-xml'])],
                                render=dict(assetRef=None, blendMode='normal', filters=[], maskId=None)))
            if not is_scope and kind == 'sprite':
                for child in first_frame(definitions[cid]):
                    add_object(child['characterId'], key+f"-d{child['depth']}", key, child['depth'], child['matrix'],
                               compose(world, child['matrix']), child['name'])

        add_object(root_id, root_key, None, 0, dict(IDENTITY), dict(IDENTITY), is_scope=True)
        wall_records, collision_order = [], []
        for p in walls:
            cid, m = p['characterId'], p['matrix']
            key = f"level{level}-d{p['depth']}"
            add_object(cid, key, root_key, p['depth'], m, m, p['name'])
            markers = [c['name'] for c in first_frame(definitions[cid]) if c['name']]
            record = dict(objectId=key, characterId=cid, depth=p['depth'], className=symbols[cid], markers=markers,
                          worldMatrix=m, bounds=transform(bounds(cid), m),
                          through='isThroughWall' in markers, throughDown='isThroughDownButUpWall' in markers,
                          throughUp='isThroughUpButDownWall' in markers, usesWallTolerance=True,
                          isThroughWallClass=symbols[cid] == 'export.ThroughWall',
                          rotated=m['b'] != 0 or m['c'] != 0,
                          axisAligned=(m['b']==0 and m['c']==0) or (m['a']==0 and m['d']==0),
                          sourceSvg=relative(next(svg_dir.glob(f'DefineSprite_{cid}_*/1.svg'))))
            wall_records.append(record)
            if 'isWall' in markers and record['rotated']:
                collision_order.insert(0, key)
            else:
                collision_order.append(key)
        levels.append(dict(level=level, rootCharacterId=root_id, walls=wall_records, collisionOrder=collision_order,
                           sourceRootSvg=relative(svg_root_path), sourceCoordinateSpace='original scene local; no camera/export crop offset'))
        print(f'level{level}: {len(walls)} walls, {width}x{height} source baseline', flush=True)
    manifest = dict(schemaVersion=1, truthId='task-settings-217.pet-ground-environment', status='draft',
                    scope=dict(taskId='TASK-SETTINGS-217', surfaceId='pet-ground-environment', originalVersion='1.1 restored',
                               description='Five original scene-local wall display lists; root containers scoped to collision children. No full gameplay visibility claim.'),
                    generatedBy=dict(tool='generate-pet-ground-environment.py', toolVersion='1', command='python tools/generate-pet-ground-environment.py', generatedAt=datetime.now(timezone.utc).isoformat()),
                    provenance=provenance, stage=dict(width=940,height=590,frameRate=30,coordinateSpace='stage'),
                    states=states, displayObjects=objects, baselines=baselines,
                    completeness=dict(expectedStateIds=[s['id'] for s in states], extractedStateIds=[s['id'] for s in states],
                                      expectedVisibleObjectCountByState={s['id']:sum(o['placements'][0]['stateId']==s['id'] for o in objects) for s in states},
                                      displayListMatched=False,stateSetMatched=False,
                                      unresolved=[dict(id='independent-validation',description='Await binary/SVG/source contract verification',impact='validation',nextEvidence='217 verifier')]))
    MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n', encoding='utf-8')
    (EVIDENCE/'environment-candidates.json').write_text(json.dumps(dict(status='draft', levels=levels),indent=2)+'\n',encoding='utf-8')
    (OUT/'source-audit/root-initialization-audit.json').write_text(json.dumps(root_reports,indent=2)+'\n',encoding='utf-8')


if __name__ == '__main__':
    generate()
