"""218 independent binary/source/render verifier. Does not import the generator."""
import copy
import hashlib
import json
import math
from pathlib import Path
import re
import runpy
import subprocess
import sys
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
LOCAL=ROOT/'local-resources/regima/task-outputs/task-settings-218'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-218'
MANIFEST=ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-218-dragon1-target-collision.json'
BINARY=runpy.run_path(str(ROOT/'tools/verify-pet-ground-environment.py'))
RENDER=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))

def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def close(a,b):
    if isinstance(a,dict):
        assert a.keys()==b.keys()
        for k in a: close(a[k],b[k])
    elif isinstance(a,list):
        assert len(a)==len(b)
        for x,y in zip(a,b): close(x,y)
    elif isinstance(a,(float,int)): assert abs(a-b)<1e-8,(a,b)
    else: assert a==b,(a,b)

def source_geometry(contract,manifest):
    defs,names=BINARY['binary_source'](ROOT/contract['provenance'][0]['path'])
    for s in contract['symbols']:
        cid=s['characterId'];assert names[cid]==s['symbol']
        children=[]
        while defs[cid][0]=='sprite':
            entries=BINARY['children'](defs[cid]);assert len(entries)==1
            depth,child,m,name=entries[0]
            children.append(dict(parentCharacterId=cid,characterId=child,depth=depth,instanceName=name,
                                 matrix=dict(zip(['a','b','c','d','tx','ty'],m))))
            cid=child
        assert cid==53
        close(children,s['displayList']);close(BINARY['bbox'](BINARY['points'](defs,s['characterId'])),s['affineBounds'])
        # Independent SVG path, fill and dimensions, not the generator's XML shape records.
        svg=(ROOT/s['sourceSvg']).read_text(encoding='utf-8')
        assert 'M70.0 0.0 L70.0 120.0 0.0 120.0 0.0 0.0 70.0 0.0' in svg
        assert 'fill="#ff0000"' in svg and 'fill-opacity="0.49803922"' in svg
        assert s['fill']==dict(alpha=127,blue=0,green=0,red=255)
        close(s['shapePolygonTwips'],[[1400,0],[1400,2400],[0,2400],[0,0],[1400,0]])
        assert digest(ROOT/s['sourceSvg'])==s['sourceSvgSha256']
    # Full original pet SWF timeline, not the extracted XML subset.
    raw=RENDER['source_tags'](ROOT/contract['provenance'][1]['path'])[542][1][4:]
    frames=[];current=None
    for code,body in BINARY['tags'](raw):
        if code==26:
            b=BINARY['Bits'](body);flags=b.u8();assert b.u16()==1
            if flags&2: assert b.u16()==541
            assert flags&4;current=dict(zip(['a','b','c','d','tx','ty'],b.matrix()))
        elif code==1: frames.append(current)
    close(frames,[f['matrix'] for f in contract['bulletFrames']]);assert len(frames)==11
    source=(LOCAL/'source/scripts/base/BaseMonster.as').read_text(encoding='utf-8')
    assert 'super();\n         this.colipse.scaleX *= 2;' in source
    for m in contract['monsterMappings']:
        code=(ROOT/m['sourcePath']).read_text(encoding='utf-8')
        assert digest(ROOT/m['sourcePath'])==m['sourceSha256']
        method=re.search(r'function newColipse\(\) : void\s*\{(.*?)\n      \}',code,re.S)[1]
        assert f'getNewObj("{m["symbol"]}")' in method
        sx=.5 if 'this.colipse.scaleX = 0.5;' in method else 1
        assert m['localScaleX']==sx and m['instanceMatrix']['a']==sx*2
        assert not re.search(r'colipse\.(?:x|y|scaleY)\s*=',method)
    assert [m['monsterId'] for m in contract['monsterMappings']]==[2,3,4,5,6,7,8,9,10,16,19,30]
    states=[s['symbol'] for s in contract['symbols']]+[f'bullet-{f}-{d}' for f in range(1,12) for d in ['left','right']]
    assert manifest['completeness']['expectedStateIds']==states
    assert manifest['completeness']['extractedStateIds']==states
    assert len(manifest['displayObjects'])==53
    for state in states:
        objects=[o for o in manifest['displayObjects'] if o['placements'][0]['stateId']==state]
        assert len(objects)==(2 if state.startswith('bullet-') else 3)
        assert manifest['completeness']['expectedVisibleObjectCountByState'][state]==len(objects)
        if state.startswith('bullet-'):
            _,frame,direction=state.split('-');sign=1 if direction=='left' else -1
            root=next(o for o in objects if o['sourceIdentity']['characterId']==542)
            child=next(o for o in objects if o['sourceIdentity']['characterId']==541)
            close(root['placements'][0]['localMatrix'],dict(a=sign,b=0,c=0,d=1,tx=470,ty=295))
            close(child['placements'][0]['localMatrix'],frames[int(frame)-1])
            fm=frames[int(frame)-1]
            xs=[470+sign*(fm['tx']+x) for x in [-34.5,34.5]]
            close(child['placements'][0]['stageBounds'],dict(left=min(xs),top=295+fm['ty']-28,width=69,height=56))
        else:
            symbol=next(s for s in contract['symbols'] if s['symbol']==state)
            for child in symbol['displayList']:
                obj=next(o for o in objects if o['sourceIdentity']['characterId']==child['characterId'])
                assert obj['sourceIdentity']['instanceName']==child['instanceName']
                close(obj['placements'][0]['localMatrix'],child['matrix'])
                close(obj['placements'][0]['localBounds'],BINARY['bbox'](BINARY['points'](defs,child['characterId'])))
    for p in contract['provenance']: assert digest(ROOT/p['path'])==p['sha256']
    for b in manifest['baselines']:
        assert digest(ROOT/b['path'])==b['sha256']
        with Image.open(ROOT/b['path']) as im: assert im.size==(940,590)

def intersect(a,b):
    left=max(a[0],b[0]);top=max(a[1],b[1]);right=min(a[2],b[2]);bottom=min(a[3],b[3])
    return [left,top,max(0,right-left),max(0,bottom-top)]

def raster_contract():
    source=(LOCAL/'source/scripts/my/HitTest.as').read_text(encoding='utf-8')
    for text in ['_loc4_.width * param3 < 1 || _loc4_.height * param3 < 1',
                 'new BitmapData(_loc4_.width * param3,_loc4_.height * param3,false,0)',
                 'new ColorTransform(1,1,1,1,255,-255,-255,255)',
                 'new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE',
                 'getColorBoundsRect(4294967295,4278255615)']:
        assert text in source
    # Fixtures are frozen independently of generated per-frame geometry.
    cases=[('interior',400,250,440,290,1),('disjoint',100,250,440,290,1),
           ('transparent-bitmap-padding',473.5,250,440,290,1),
           ('under-one-pixel',473.55,250,440,290,1),('edge-only',474.5,250,440,290,1),
           ('fractional-origin',400.35,250.15,440.65,290.45,1),
           ('flipped',400,250,440,290,-1)]
    records=[]
    for name,x,y,bx,by,flip in cases:
        overlap=intersect([x,y,x+70,y+120],[bx-34.5,by-28,bx+34.5,by+28])
        passes_guard=overlap[2]>=1 and overlap[3]>=1
        cyan=0;file=None
        if passes_guard:
            l,t,w,h=overlap
            # Original draw buffer is intersection-local with int dimensions.
            path=RENDER['render_probe'](name,dict(a=1,d=1,tx=x-l,ty=y-t),
                 dict(a=flip,d=1,tx=bx-l,ty=by-t),size=(int(w),int(h)))
            dest=OUT/'raster'/f'{name}.png';dest.parent.mkdir(exist_ok=True);dest.write_bytes(path.read_bytes())
            with Image.open(dest) as image:
                colors=image.convert('RGB').getcolors(image.width*image.height)
                cyan=sum(n for n,c in colors if c==(0,255,255))
            file=dest.relative_to(ROOT).as_posix()
        records.append(dict(id=name,target=[x,y,x+70,y+120],bullet=[bx-34.5,by-28,bx+34.5,by+28],
                            intersection=overlap,expectedFlashHit=None if passes_guard else False,
                            passesSourceMinimumSizeGuard=passes_guard,
                            ffdecCyanPixels=cyan,path=file,
                            rejection='source <1 guard' if not passes_guard else None))
    # Same edge geometry translated into a larger canvas: a counterexample to
    # treating the frame exporter as an intersection-local BitmapData.draw oracle.
    path=RENDER['render_probe']('padding-shifted',dict(tx=10,ty=-2),
                              dict(tx=-23.5,ty=38),size=(21,76))
    dest=OUT/'raster/padding-shifted.png';dest.write_bytes(path.read_bytes())
    with Image.open(dest) as im:
        cyan=sum(n for n,c in im.convert('RGB').getcolors(im.width*im.height) if c==(0,255,255))
    records.append(dict(id='padding-shifted',expectedFlashHit=None,ffdecCyanPixels=cyan,
                        path=dest.relative_to(ROOT).as_posix(),
                        interpretation='diagnostic larger-canvas export; not the original draw buffer'))
    return records

def hit_sequence(mutant=None):
    # Reference transcription of the narrow BaseBullet acceptance/cache ordering.
    # Target amounts are explicit resolved-target fixture inputs, not a replacement damage formula.
    cache=10;hp={'m1':100,'m2':100};pet_hp=50;seen=set();counter=0;serial=0;trace=[]
    requests={1:('m1','accept',17),2:('m2','dodge',99),3:('m2','accept',88),
              11:('m1','accept',23)}
    for tick in range(1,12):
        if mutant=='expire-before-last' and tick==11: break
        if counter==10: serial+=1;counter=0
        counter+=1
        if tick not in requests: continue
        target,result,next_cache=requests[tick];key=(target,serial)
        if key in seen: continue
        if mutant=='refresh-before-hit':cache=next_cache
        before=hp[target];accepted=result=='accept'
        seen.add(key)
        if accepted:
            hp[target]=max(0,hp[target]-cache);cache=next_cache;pet_hp+=5
        elif mutant=='heal-rejected':pet_hp+=5
        trace.append(dict(tick=tick,target=target,accepted=accepted,hpBefore=before,hpAfter=hp[target],
                          cacheForNext=cache,attackerHp=pet_hp,attackSerial=serial,sourceId='p2-root:clone:1',ownerSlot='p2'))
    return trace

def verify_behavior():
    bullet=(LOCAL/'source/scripts/base/BaseBullet.as').read_text(encoding='utf-8')
    monster=(LOCAL/'source/scripts/base/BaseMonster.as').read_text(encoding='utf-8')
    start=bullet.index('if(_loc2_.beMagicAttack(this,this.sourceRole))')
    assert start<bullet.index('this.refreshSourceRoleAttackInfoObject();',start)<bullet.index('this.funcWhenHit(this);',start)
    assert bullet.index('this.step();')<bullet.index('this.imgMc.currentFrame == this.imgMc.totalFrames')
    assert 'this.beAttackIdArray.push(param1.getAttackId());\n               return false;' in monster
    expected=[dict(tick=1,target='m1',accepted=True,hpBefore=100,hpAfter=90,cacheForNext=17,attackerHp=55,attackSerial=0,sourceId='p2-root:clone:1',ownerSlot='p2'),
              dict(tick=2,target='m2',accepted=False,hpBefore=100,hpAfter=100,cacheForNext=17,attackerHp=55,attackSerial=0,sourceId='p2-root:clone:1',ownerSlot='p2'),
              dict(tick=11,target='m1',accepted=True,hpBefore=90,hpAfter=73,cacheForNext=23,attackerHp=60,attackSerial=1,sourceId='p2-root:clone:1',ownerSlot='p2')]
    assert hit_sequence()==expected
    killed=[]
    for mutant in ['expire-before-last','refresh-before-hit','heal-rejected']:
        assert hit_sequence(mutant)!=expected;killed.append(mutant)
    (OUT/'hit-fixtures.json').write_text(json.dumps(dict(scope='independent source oracle; no production execution',
         resolvedTargetDamage='fixture uses cached amount without target mitigation; production target rules remain separate',
         expected=expected,mutationsKilled=killed),indent=2)+'\n',encoding='utf-8')
    return killed

def verify_zero_and_owner():
    monster=(LOCAL/'source/scripts/base/BaseMonster.as').read_text(encoding='utf-8')
    pet=(LOCAL/'source/scripts/export/pet/PetDragon1.as').read_text(encoding='utf-8')
    assert '_loc4_ = param1 * (param2.atk - this.def + zxfy) / param2.atk;' in monster
    assert 'setRole(this)' in pet and 'setFuncWhenHit(this.addHurt)' in pet
    assert 'this.cureHp(_loc3_);' in pet
    # Explicit source-level fixture: physics atk==def, zxfy=0, no specials.
    # Healing uses SHp=100, atk=10, level=1 from PetDragon1.addHurt.
    inputs=dict(cachedDamage=10,atk=10,defense=10,zxfy=0,SHp=100,level=1,
                nextCache=17,sourceEntity='p2.clone1')
    def run(mutant=None):
        hp={'p1.root':30,'p2.root':40,'p2.clone1':50,'p2.clone2':60}
        damage=int(inputs['cachedDamage']*(inputs['atk']-inputs['defense']+inputs['zxfy'])/inputs['atk'])
        heal=int(inputs['SHp']*.018+inputs['atk']*.18+inputs['level']*2)
        recipient='p2.root' if mutant=='heal-slot-root' else inputs['sourceEntity']
        accepted=damage>0 if mutant=='zero-damage-rejected' else True
        if accepted: hp[recipient]+=heal
        return dict(accepted=accepted,targetHp=100-damage,petHp=hp,
                    cacheForNext=inputs['nextCache'] if accepted else inputs['cachedDamage'])
    expected=dict(accepted=True,targetHp=100,
                  petHp={'p1.root':30,'p2.root':40,'p2.clone1':55,'p2.clone2':60},cacheForNext=17)
    assert run()==expected
    killed=[]
    for mutant in ['heal-slot-root','zero-damage-rejected']:
        assert run(mutant)!=expected;killed.append(mutant)
    (OUT/'zero-owner-fixture.json').write_text(json.dumps(dict(
        scope='source transcription with explicit inputs, not production behavior verification',
        sourceLocators=['BaseMonster.as:1387-1400','PetDragon1.as:251-264','BaseBullet.as:303-325'],
        inputs=inputs,expected=expected,mutationsKilled=killed),indent=2)+'\n',encoding='utf-8')
    return killed

def main():
    c=json.loads((OUT/'collision-contract.json').read_text(encoding='utf-8'))
    m=json.loads(MANIFEST.read_text(encoding='utf-8'))
    source_geometry(c,m)
    if '--ffdec-diagnostic' in sys.argv: raster_contract()
    runpy.run_path(str(ROOT/'tools/verify-air-collision-probe.py'))['main']()
    air=json.loads((OUT/'air-verification.json').read_text(encoding='utf-8'))
    runtime=json.loads((OUT/'air-original/measurement.json').read_text(encoding='utf-8'))
    for mapping in c['monsterMappings']:
        observed=next(r for r in runtime['actual'] if r['id']==mapping['symbol'])
        expected=dict(left=observed['target']['x']-470,top=observed['target']['y']-295,
                      width=observed['targetWidth'],height=observed['targetHeight'])
        close(mapping['runtimeBounds'],expected)
        assert expected['left']+expected['width']/2==expected['top']+expected['height']/2==0
    assert c['rootMapping']['expression']==dict(x='combat.x',y='combat.y')
    physics=(ROOT/'src/systems/MonsterPhysicsSystem.ts').read_text(encoding='utf-8')
    registry=(ROOT/'src/systems/MonsterRuntimeRegistrySystem.ts').read_text(encoding='utf-8')
    assert 'model.y + model.height / 2' in physics and 'runtime.combat.y = runtime.physics.y;' in registry
    assert c['collision']['assetMaskProjection']==air['assetMaskProjection']
    assert c['collision']['sampling']['verifiedCases']==air['cases']
    for key,value in dict(dx='round((intersection.x - bulletBounds.x) * 20)',
                          dy='round((intersection.y - bulletBounds.y) * 20)',
                          sourcePixelXLeft='ceil((dx - 5) / 20) + bufferPixelX',
                          sourcePixelXRight='68 - ceil((dx - 10) / 20) - bufferPixelX',
                          sourcePixelY='ceil((dy - 5) / 20) + bufferPixelY',
                          hit='any in-bounds source alpha > 0').items():
        assert c['collision']['sampling'][key]==value
    assert c['collision']['accuracy']==1 and c['collision']['matchArgb']=='0xFF00FFFF'
    mutations=verify_behavior()+verify_zero_and_owner()+['air-'+name for name in air['mutationKills']]
    for mutant in ['missing-constructor-scale','wrong-frame-translation','missing-inner-matrix']:
        changed=copy.deepcopy(c)
        if mutant=='missing-constructor-scale':changed['monsterMappings'][0]['instanceMatrix']['a']=1
        elif mutant=='wrong-frame-translation':changed['bulletFrames'][-1]['matrix']['tx']=0
        else:changed['symbols'][0]['displayList'][-1]['matrix']['a']=1
        try:source_geometry(changed,m)
        except AssertionError:mutations.append(mutant)
        else:raise AssertionError('surviving mutation '+mutant)
    changed=copy.deepcopy(m)
    next(o for o in changed['displayObjects'] if o['id']=='ObjectBaseSprite2-106')['sourceIdentity']['instanceName']=None
    try:source_geometry(c,changed)
    except AssertionError:mutations.append('missing-colipseRect-name')
    else:raise AssertionError('surviving instance-name mutation')
    for mutant in ['wrong-flip','wrong-fixture-root']:
        changed=copy.deepcopy(m)
        obj=next(o for o in changed['displayObjects'] if o['id']=='bullet-11-right-542')
        obj['placements'][0]['localMatrix']['a' if mutant=='wrong-flip' else 'tx']=1
        try:source_geometry(c,changed)
        except AssertionError:mutations.append(mutant)
        else:raise AssertionError('surviving mutation '+mutant)
    report=dict(status='passed',scope='source geometry, original bundled AIR sampling and narrow source-level behavior fixtures; not modern battle',
                sourceGeometryPassed=True,runtimeVerification='air-verification.json',mutationsKilled=mutations,
                productionBattleVerified=False,unresolved=[])
    if '--promote' in sys.argv:
        for document in [c,m]:
            document['status']='verified'
            document['completeness'].update(displayListMatched=True,stateSetMatched=True,unresolved=[])
        candidate=LOCAL/'verified-candidate.json';candidate.write_text(json.dumps(m),encoding='utf-8')
        subprocess.run(['node','tools/validate-ui-ground-truth.mjs',str(candidate)],cwd=ROOT,check=True)
        (OUT/'collision-contract.json').write_text(json.dumps(c,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        MANIFEST.write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    (OUT/'verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print('218: original-runtime collision/geometry and source cache/owner fixtures passed; modern battle remains C4.')
    if '--require-verified' in sys.argv and (c['status']!='verified' or m['status']!='verified'):raise SystemExit(2)

if __name__=='__main__':main()
