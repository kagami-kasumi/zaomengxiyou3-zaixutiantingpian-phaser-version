"""218 XML/SVG source generator. Verification is separate and controls status."""
from pathlib import Path
import hashlib
import json
import re
import runpy
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[1]
LOCAL=ROOT/'local-resources/regima/task-outputs/task-settings-218'
EVIDENCE=ROOT/'docs/tasks/evidence/TASK-SETTINGS-218'
DEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-218-dragon1-target-collision.json'
NAMES=['ObjectBaseSprite','ObjectBaseSprite2','ObjectBaseSprite7']
MONSTERS=[2,3,4,5,6,7,8,9,10,16,19,30]
I=dict(a=1,b=0,c=0,d=1,tx=0,ty=0)

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def relative(path): return path.relative_to(ROOT).as_posix()
def matrix(node):
    a=node.attrib
    # Decode fixed16 exactly: FFDec's XML float spelling is rounded to 8 decimals.
    fixed=lambda n: round(float(a[n])*65536)/65536
    return dict(a=fixed('scaleX') if a.get('hasScale')=='true' else 1,
                d=fixed('scaleY') if a.get('hasScale')=='true' else 1,
                b=fixed('rotateSkew0') if a.get('hasRotate')=='true' else 0,
                c=fixed('rotateSkew1') if a.get('hasRotate')=='true' else 0,
                tx=int(a['translateX'])/20,ty=int(a['translateY'])/20)
def compose(p,q):
    assert p['b']==p['c']==q['b']==q['c']==0
    return dict(a=p['a']*q['a'],d=p['d']*q['d'],b=0,c=0,
                tx=p['a']*q['tx']+p['tx'],ty=p['d']*q['ty']+p['ty'])
def bounds(rect,m):
    xs=[m['a']*x+m['tx'] for x in [rect['left'],rect['left']+rect['width']]]
    ys=[m['d']*y+m['ty'] for y in [rect['top'],rect['top']+rect['height']]]
    return dict(left=min(xs),top=min(ys),width=max(xs)-min(xs),height=max(ys)-min(ys))
def definitions(path):
    tags=list(ET.parse(path).getroot().find('tags'))
    return {int(t.get('spriteId') or t.get('shapeId')):t for t in tags if t.get('spriteId') or t.get('shapeId')},tags

def spatial_manifest(contract):
    objects=[];states=[];baselines=[]
    for baseline in contract['baselines']:
        state=baseline['id']; is_bullet=state.startswith('bullet-')
        provenance='pet' if is_bullet else 'common'
        stage_matrix=dict(I,**baseline['renderMatrix'])
        if is_bullet:
            frame=int(state.split('-')[1]); f=contract['bulletFrames'][frame-1]
            root_matrix=dict(I,a=stage_matrix['a'],tx=470,ty=295)
            rows=[(542,None,root_matrix,f['drawBounds']),
                  (541,542,f['matrix'],dict(left=-34.5,top=-28,width=69,height=56))]
        else:
            frame=1;s=next(s for s in contract['symbols'] if s['symbol']==state)
            local_bounds={53:dict(left=0,top=0,width=70,height=120)}
            for child in reversed(s['displayList']):
                local_bounds[child['parentCharacterId']]=bounds(local_bounds[child['characterId']],child['matrix'])
            rows=[(s['characterId'],None,stage_matrix,local_bounds[s['characterId']])]
            rows += [(c['characterId'],c['parentCharacterId'],c['matrix'],local_bounds[c['characterId']]) for c in s['displayList']]
        worlds={}
        for cid,parent,m,rect in rows:
            world=m if parent is None else compose(worlds[parent],m);worlds[cid]=world
            objects.append(dict(id=f'{state}-{cid}',parentId=None if parent is None else f'{state}-{parent}',
                depth=0 if parent is None else 1,objectType='shape' if cid in [53,541] else 'sprite',
                sourceIdentity=dict(provenanceId=provenance,characterId=cid,
                    symbolClass=('PetDragon1Bullet1' if is_bullet else state) if parent is None else None,
                    instanceName=next((c['instanceName'] for c in s['displayList'] if c['characterId']==cid),None) if not is_bullet and parent is not None else None,
                    frame=frame if is_bullet and cid==542 else 1),
                placements=[dict(stateId=state,visible=True,localMatrix=m,registrationPoint=dict(x=0,y=0),
                    localBounds=rect,stageBounds=bounds(rect,world),derivation='calculated',
                    derivationMethod='Original fixed16 matrices and shape polygon; isolated source-tag render fixture',evidenceRefs=[provenance])],
                render=dict(assetRef=None,blendMode='normal',filters=[],maskId=None)))
        states.append(dict(id=state,entry='Source-tag isolated spatial baseline; no live gameplay capture',
                           frame=frame,fixtureId=state,baselineId=state))
        baselines.append({**{k:baseline[k] for k in ['id','path','sha256','width','height']},
                          'stateId':state,'crop':dict(left=0,top=0,width=940,height=590)})
    provenance=[dict(id=key,sourceType='restored-swf',sourcePath=s['path'],sha256=s['sha256'],locator=loc)
                for key,s,loc in zip(['common','pet','main'],contract['provenance'],
                                    ['Symbols ObjectBaseSprite/2/7; shape53','sprite542; shape541; bitmap540','selected newColipse/HitTest/BaseBullet'])]
    return dict(schemaVersion=1,truthId=contract['truthId'],status='draft',
        scope=dict(taskId='TASK-SETTINGS-218',surfaceId='dragon1-target-collision',originalVersion='RegiMA 1.1',
                   description='3 target collision sprites and 11 bullet frames x 2 directions; contract sidecar holds runtime mappings and source HitTest fixtures'),
        generatedBy=dict(tool='generate-dragon-target-collision.py',toolVersion='1',
                         command='python tools/generate-dragon-target-collision.py',generatedAt=datetime.now(timezone.utc).isoformat()),
        provenance=provenance,stage=dict(width=940,height=590,frameRate=24,coordinateSpace='stage'),
        states=states,displayObjects=objects,baselines=baselines,
        completeness=dict(expectedStateIds=[s['id'] for s in states],extractedStateIds=[s['id'] for s in states],
            expectedVisibleObjectCountByState={s['id']:sum(o['placements'][0]['stateId']==s['id'] for o in objects) for s in states},
            displayListMatched=False,stateSetMatched=False,
            unresolved=[dict(id='flash-sampling',description='Intersection-local Flash sampling and modern root mapping remain unverified',impact='validation',nextEvidence='Flash runtime measurement and explicit root adapter contract')]))

def generate():
    EVIDENCE.mkdir(parents=True,exist_ok=True)
    defs,tags=definitions(LOCAL/'StageCommon.xml')
    names={}
    for tag in tags:
        if tag.get('type')=='SymbolClassTag':
            names.update(zip([int(x.text) for x in tag.find('tags')],[x.text for x in tag.find('names')]))
    shape=defs[53]; records=shape.findall('./shapes/shapeRecords/item')
    point=[0,0]; polygon=[]
    for r in records:
        if r.get('type')=='StyleChangeRecord':
            assert r.get('stateMoveTo')=='true'; point=[int(r.get('moveDeltaX')),int(r.get('moveDeltaY'))]; polygon.append(point[:])
        elif r.get('type')=='StraightEdgeRecord':
            point=[point[0]+int(r.get('deltaX')),point[1]+int(r.get('deltaY'))]; polygon.append(point[:])
        else: assert r.get('type')=='EndShapeRecord'
    color=shape.find('./shapes/fillStyles/fillStyles/item/color').attrib
    assert polygon[0]==polygon[-1] and len(polygon)==5
    rectnode=shape.find('shapeBounds').attrib
    base=dict(left=int(rectnode['Xmin'])/20,top=int(rectnode['Ymin'])/20,
              width=(int(rectnode['Xmax'])-int(rectnode['Xmin']))/20,height=(int(rectnode['Ymax'])-int(rectnode['Ymin']))/20)
    symbols=[]; state_defs=[]
    for name in NAMES:
        cid=next(c for c,n in names.items() if n==name)
        display=[]; current=cid; total=dict(I)
        while current!=53:
            node=defs[current]; assert node.get('frameCount')=='1'
            places=[x for x in node.find('subTags') if x.get('type').startswith('PlaceObject')]
            assert len(places)==1
            p=places[0]; m=matrix(p.find('matrix'))
            assert p.get('placeFlagHasColorTransform')=='false' and p.get('placeFlagHasClipDepth')=='false'
            child=int(p.get('characterId'))
            display.append(dict(parentCharacterId=current,characterId=child,depth=int(p.get('depth')),
                                instanceName=p.get('name'),matrix=m))
            total=compose(total,m); current=child
        svg=next((LOCAL/'collision-svg').glob(f'DefineSprite_{cid}_*/1.svg'))
        root=ET.parse(svg).getroot(); export=dict(width=float(root.get('width').removesuffix('px')),
                                                height=float(root.get('height').removesuffix('px')))
        symbol=dict(symbol=name,characterId=cid,frameCount=1,displayList=display,shapeId=53,
                    shapePolygonTwips=polygon,fill={k:int(v) for k,v in color.items() if k!='type'},
                    shapeToRoot=total,affineBounds=bounds(base,total),exportBounds=export,
                    sourceSvg=relative(svg),sourceSvgSha256=sha(svg))
        symbols.append(symbol)
        state_defs.append(dict(id=name,characterId=cid,renderMatrix=dict(a=1,d=1,tx=470,ty=295)))
    base_source=(LOCAL/'source/scripts/base/BaseMonster.as').read_text(encoding='utf-8')
    multiplier=float(re.search(r'this\.colipse\.scaleX \*= ([\d.]+)',base_source)[1])
    mappings=[]
    for mid in MONSTERS:
        path=LOCAL/f'source/scripts/export/monster/Monster{mid}.as'; source=path.read_text(encoding='utf-8')
        body=re.search(r'function newColipse\(\) : void\s*\{(.*?)\n      \}',source,re.S)[1]
        name=re.search(r'getNewObj\("([^"]+)"\)',body)[1]
        local=re.search(r'colipse\.scaleX = ([\d.]+)',body)
        sx=float(local[1]) if local else 1
        symbol=next(s for s in symbols if s['symbol']==name)
        runtime=dict(I,a=sx*multiplier)
        mappings.append(dict(monsterId=mid,symbol=name,sourcePath=relative(path),sourceSha256=sha(path),
                             localScaleX=sx,baseConstructorScaleXMultiplier=multiplier,instanceMatrix=runtime,
                             affineBounds=bounds(symbol['affineBounds'],runtime),
                             exportProfileBounds=dict(width=symbol['exportBounds']['width']*runtime['a'],
                                                      height=symbol['exportBounds']['height'])))
    bullet_defs,_=definitions(LOCAL/'bullet-source-subset.xml'); bullet=bullet_defs[542]
    shape_rect=bullet_defs[541].find('shapeBounds').attrib
    bullet_rect=dict(left=int(shape_rect['Xmin'])/20,top=int(shape_rect['Ymin'])/20,
                     width=(int(shape_rect['Xmax'])-int(shape_rect['Xmin']))/20,
                     height=(int(shape_rect['Ymax'])-int(shape_rect['Ymin']))/20)
    frames=[]; current=None
    for t in bullet.find('subTags'):
        if t.get('type').startswith('PlaceObject'): current=matrix(t.find('matrix'))
        elif t.get('type')=='ShowFrameTag':
            index=len(frames)+1
            frames.append(dict(frame=index,characterId=541,matrix=current,drawBounds=bounds(bullet_rect,current)))
            for direction in ['left','right']:
                sign=1 if direction=='left' else -1
                state_defs.append(dict(id=f'bullet-{index}-{direction}',characterId=541,
                    renderMatrix=dict(a=sign,d=1,tx=470+sign*current['tx'],ty=295+current['ty'])))
    runtime=json.loads((EVIDENCE/'air-original/measurement.json').read_text(encoding='utf-8'))
    assert runtime['environment'][0]['runtime']=='WIN 51,1,1,5'
    paths=[EVIDENCE/'air-original/stage-baselines'/f"{s['id']}.png" for s in state_defs]
    for path in paths: assert sha(path)==runtime['baselineHashes'][path.name]
    for mapping in mappings:
        measured=next(x for x in runtime['actual'] if x['id']==mapping['symbol'])
        mapping['runtimeBounds']=dict(left=measured['target']['x']-470,top=measured['target']['y']-295,
                                      width=measured['targetWidth'],height=measured['targetHeight'])
    baselines=[]
    sheet=Image.new('RGB',(940,590),'#16191f'); draw=ImageDraw.Draw(sheet)
    for i,(state,path) in enumerate(zip(state_defs,paths)):
        dest=EVIDENCE/'baselines'/f"{state['id']}.png";dest.parent.mkdir(exist_ok=True);dest.write_bytes(path.read_bytes())
        with Image.open(dest) as im:
            assert im.size==(940,590)
            thumb=im.crop((150,225,800,365)).resize((180,70))
            x=(i%5)*188;y=(i//5)*118;sheet.paste(thumb,(x,y+25));draw.text((x+4,y+5),state['id'],fill='white')
        baselines.append(dict(id=state['id'],path=relative(dest),sha256=sha(dest),width=940,height=590,
                              kind='original game bundled AIR51.1 source-tag BitmapData baseline; no gameplay capture',renderMatrix=state['renderMatrix']))
    sheet.save(EVIDENCE/'contact-sheet.png')
    provenance=[]
    for name in ['assets/StageCommon.swf','assets/pet1.swf','1_MainLoad__main1.swf']:
        path=ROOT/'local-resources/regima/source/restored-swfs'/name
        provenance.append(dict(path=relative(path),sha256=sha(path)))
    result=dict(schemaVersion=1,truthId='task-settings-218.dragon1-target-collision',status='draft',
                scope=dict(taskId='TASK-SETTINGS-218',monsterIds=MONSTERS,symbols=NAMES,bullet='PetDragon1Bullet1',
                           stage=dict(width=940,height=590),excludes=['other families','other monsters','game implementation']),
                provenance=provenance,symbols=symbols,monsterMappings=mappings,bulletFrames=frames,baselines=baselines,
                precision=dict(affine='Exact source fixed16 matrices composed without rounding',
                               exportProfile='Separate FFDec twip-truncated export dimensions; not silently equated to affine geometry'),
                rootMapping=dict(inputSpace='modern combat/physics center',sourceSpace='original collision root',
                                 expression=dict(x='combat.x',y='combat.y'),
                                 justification='All three source runtimeBounds have center (0,0); modern physics uses y +/- height/2',
                                 instanceScale='Already included in runtimeBounds; do not apply it twice',
                                 trajectoryEquivalence='not claimed; existing height100 modern landing physics is outside this collision-input contract'),
                collision=dict(source='my/HitTest.as:14-85',accuracy=1,minIntersectionWidth=1,minIntersectionHeight=1,
                               colorOffsets=[[255,-255,-255,255],[255,255,255,255]],matchArgb='0xFF00FFFF',
                               blend='difference',bitmapTransparent=False,bitmapDimensions='int(intersection.width/height)',
                               pngAlphaIsHitMask='nonzero source alpha only with the validated original sampler; not generic pixel-center sampling',
                               explanation='Original bundled AIR executes unchanged HitTest; 861 cases and 25 baseline states match AIR51.3.4. Fractional positions require calibrated source sampling, not bitmap rectangle or ordinary nearest pixel-center tests.',
                               runtimeEvidence='docs/tasks/evidence/TASK-SETTINGS-218/air-original/measurement.json',
                               independentVerification='docs/tasks/evidence/TASK-SETTINGS-218/air-verification.json',
                               samplerScope='axis-aligned unit bullet scale +/-1, accuracy1, source fixed-twip coordinates'),
                completeness=dict(expectedSymbols=NAMES,expectedMonsterIds=MONSTERS,expectedBulletFrameCount=11,
                                  displayListMatched=False,stateSetMatched=False,unresolved=[
                                      'Independent source checks must be rerun after regeneration']))
    air_check=json.loads((EVIDENCE/'air-verification.json').read_text(encoding='utf-8'))
    result['collision']['assetMaskProjection']=air_check['assetMaskProjection']
    result['collision']['sampling']=dict(kind='empirical original-runtime calibration',twipsPerPixel=20,
        dx='round((intersection.x - bulletBounds.x) * 20)',dy='round((intersection.y - bulletBounds.y) * 20)',
        sourcePixelXLeft='ceil((dx - 5) / 20) + bufferPixelX',
        sourcePixelXRight='68 - ceil((dx - 10) / 20) - bufferPixelX',
        sourcePixelY='ceil((dy - 5) / 20) + bufferPixelY',hit='any in-bounds source alpha > 0',
        applicability=air_check['scope'],verifiedCases=air_check['cases'],verifiedBufferPixels=air_check['pixelsCompared'])
    (EVIDENCE/'collision-contract.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    DEST.write_text(json.dumps(spatial_manifest(result),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'218 draft: {len(symbols)} symbols, {len(mappings)} mappings, {len(frames)} frames, {len(baselines)} source baselines')

if __name__=='__main__':
    if '--prepare' in sys.argv or '--prepare-only' in sys.argv:
        runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))['prepare_sources']()
    if '--prepare-only' in sys.argv: raise SystemExit(0)
    generate()
