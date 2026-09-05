"""Independent SWF-binary/SVG verifier for 217; never imports the generator."""
import copy
import hashlib
import json
import math
from pathlib import Path
import re
import struct
import subprocess
import sys
import xml.etree.ElementTree as ET
import zlib

ROOT = Path(__file__).resolve().parent.parent
EVIDENCE = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-217'
MANIFEST = ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-217-pet-ground-environment.json'
LOCAL = ROOT / 'local-resources/regima/task-outputs/task-settings-217'
WALLS = ('export.ObsWall','export.ThroughWall','export.ThroughUpButDownWall','export.FallDownWhenStandingWall')


class Bits:
    def __init__(self, data, pos=0): self.data, self.bit = data, pos*8
    def n(self, count, signed=False):
        value = 0
        for _ in range(count):
            value = (value << 1) | ((self.data[self.bit//8] >> (7-self.bit%8)) & 1)
            self.bit += 1
        return value-(1<<count) if signed and count and value & (1<<(count-1)) else value
    def align(self): self.bit = (self.bit+7)//8*8
    def u8(self): self.align(); return self.n(8)
    def u16(self): return self.u8() | self.u8()<<8
    def string(self):
        chars=[]
        while (b:=self.u8()): chars.append(b)
        return bytes(chars).decode('utf-8')
    def rect(self):
        n=self.n(5); v=[self.n(n,True)/20 for _ in range(4)]; self.align()
        return (v[0],v[2],v[1],v[3])
    def matrix(self):
        a,d=1,1; b,c=0,0
        if self.n(1): n=self.n(5); a,d=self.n(n,True)/65536,self.n(n,True)/65536
        if self.n(1): n=self.n(5); b,c=self.n(n,True)/65536,self.n(n,True)/65536
        n=self.n(5); x,y=self.n(n,True)/20,self.n(n,True)/20; self.align()
        return (a,b,c,d,x,y)


def tags(data, start=0):
    pos=start
    while pos+2<=len(data):
        header=struct.unpack_from('<H',data,pos)[0]; pos+=2
        code,size=header>>6,header&63
        if size==63: size=struct.unpack_from('<I',data,pos)[0]; pos+=4
        yield code,data[pos:pos+size]
        pos+=size
        if not code: break


def binary_source(file):
    raw=file.read_bytes()
    assert raw[:3] in (b'FWS',b'CWS')
    data=zlib.decompress(raw[8:]) if raw[:3]==b'CWS' else raw[8:]
    header=Bits(data); header.rect(); header.u16(); header.u16()
    definitions, names={},{}
    for code,body in tags(data,header.bit//8):
        if code in (2,22,32,83):
            r=Bits(body); cid=r.u16(); definitions[cid]=('shape',r.rect())
        elif code==39:
            r=Bits(body); cid=r.u16(); count=r.u16(); definitions[cid]=('sprite',(count,body[4:]))
        elif code==76:
            r=Bits(body)
            for _ in range(r.u16()):
                cid=r.u16(); names[cid]=r.string()
    return definitions,names


def children(definition,single=True):
    assert definition[0]=='sprite' and (not single or definition[1][0]==1), 'wall timeline must be one frame'
    result=[]
    for code,body in tags(definition[1][1]):
        if code==1: break
        if code in (26,70):
            r=Bits(body); flags=r.u8(); flags2=r.u8() if code==70 else 0; depth=r.u16()
            assert not flags&1 and flags&2 and flags&4 and not flags&64, 'unsupported placement/mask'
            if flags2&8 or (flags2&16 and flags&2): r.string()
            cid=r.u16(); m=r.matrix()
            if flags&8:
                add,mult=r.n(1),r.n(1); count=r.n(4)
                if mult:
                    for _ in range(4): r.n(count,True)
                if add:
                    for _ in range(4): r.n(count,True)
                r.align()
            if flags&16: r.u16()
            name=r.string() if flags&32 else None
            result.append((depth,cid,m,name))
    return sorted(result)


def points(defs,cid,m=(1,0,0,1,0,0)):
    def apply(x,y): return (m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5])
    definition=defs[cid]
    if definition[0]=='shape':
        l,t,r,b=definition[1]
        return [apply(x,y) for x,y in ((l,t),(r,t),(r,b),(l,b))]
    result=[]
    for _,child,q,_ in children(definition):
        for x,y in points(defs,child,q): result.append(apply(x,y))
    return result


def bbox(pts):
    if not pts: return dict(left=0,top=0,width=0,height=0)
    xs,ys=zip(*pts)
    return dict(left=min(xs),top=min(ys),width=max(xs)-min(xs),height=max(ys)-min(ys))


def near(actual,expected,label):
    assert actual.keys()==expected.keys(),label
    for key in actual:
        assert abs(actual[key]-expected[key])<0.002, f'{label}.{key}: {actual[key]} != {expected[key]}'


def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()


def source_contract():
    shared=LOCAL/'shared-source/scripts'
    files={name:(shared/name).read_text(encoding='utf-8') for name in
           ('base/BaseObject.as','base/BasePet.as','base/BaseHero.as','base/Wall.as','base/BaseGameSence.as',
            'World/PhysicsWorld.as','export/ObsWall.as','export/ThroughWall.as',
            'export/ThroughUpButDownWall.as','export/FallDownWhenStandingWall.as')}
    pet,hero,obj,wall=(files[x] for x in ('base/BasePet.as','base/BaseHero.as','base/BaseObject.as','base/Wall.as'))
    def capture(pattern,text):
        found=re.search(pattern,text); assert found,pattern
        return float(found.group(1))
    spawn=capture(r'this\.myPet\.y = this\.y - ([\d.]+)',hero)
    warp=capture(r'this\.y = Number\(this\.sourceRole\.y\) - ([\d.]+)',pet)
    snap=capture(r'Number\(_loc\d+_\.y\) - ([\d.]+) - this\.colipse\.height / 2',obj)
    assert 'this.speedX == 0 && this.speedY == 0' in wall
    assert re.search(r'speedX:Number = 0',wall) and re.search(r'speedY:Number = 0',wall)
    assert 'getBounds(this.gc.gameSence)' in obj and 'this.wallArray.unshift' in files['World/PhysicsWorld.as']
    root_report=json.loads((LOCAL/'source-audit/root-initialization-audit.json').read_text(encoding='utf-8'))
    for entry in root_report:
        assert entry['sha256']==digest(ROOT/entry['source']) and not entry['dynamicTokens']
        source=(ROOT/entry['script']).read_text(encoding='utf-8')
        assert not re.search(r'\b(speedX|speedY|addFrameScript|removeChild)\b',source)
        entry['scriptSha256']=digest(ROOT/entry['script'])
    profile=json.loads((ROOT/'docs/reverse-engineering/ground-truth/manifests/task-settings-207-pet-monkey-family.json').read_text(encoding='utf-8'))
    assert profile['status']=='verified'
    collision=next(x for x in profile['collisionProfiles'] if x['class']=='ObjectBaseSprite')
    # Cross-check the profile against the source binary, rather than repeating its literal.
    main=ROOT/'local-resources/regima/source/restored-swfs/1_MainLoad__main1.swf'
    collision_source=next(x for x in profile['sources'] if x['id']=='collision-owner')
    assert digest(ROOT/collision_source['file'])==collision_source['sha256']
    defs,names=binary_source(ROOT/collision_source['file'])
    cid=next(k for k,v in names.items() if v=='ObjectBaseSprite' or v.endswith('.ObjectBaseSprite'))
    box=bbox(points(defs,cid))
    # Existing 207 dimensions are FFDec's integer-twip export bounds, not the
    # unrounded concatenated MATRIX geometry. Keep both, never silently equate.
    for field in ('width','height'):
        assert 0 <= box[field]-collision[field] < 0.05, 'owner export twip envelope'
    result=dict(status='source-checked',sourceMain=dict(path=str(main.relative_to(ROOT)).replace('\\','/'),sha256=digest(main)),
                rootInitializations=root_report,
                sharedSources=[dict(path=str((shared/name).relative_to(ROOT)).replace('\\','/'),sha256=digest(shared/name)) for name in files],
                ownerCollision=dict(characterId=cid,bounds=box,profileTruthId=profile['truthId'],source=collision_source,
                                    existingExportBounds=dict(width=collision['width'],height=collision['height']),
                                    distinction='Binary affine geometry versus FFDec integer-twip export bounds; neither is a Flash runtime capture.'),
                ownerMapping=dict(spawnOffsetY=-spawn,warpOffsetY=-warp,landingGap=snap,
                                  affineGroundRootOffsetY=-snap-box['height']/2,
                                  existingProfileGroundRootOffsetY=-snap-collision['height']/2,
                                  modernVisualRootOffsetY=-collision['registration']['y'],
                                  sourceLandingFormula='wall.top - 0.1 - colipse.height / 2',
                                  note='Source landing formula, unrounded affine calculation, existing export-profile approximation and modern registration mapping are distinct.'),
                fixtures=[dict(owner=owner,floorTop=500,originalLandedRootY=500-snap-box['height']/2,
                               petSpawnY=500-snap-box['height']/2-spawn,petWarpY=500-snap-box['height']/2-warp)
                          for owner in ('p1','p2')])
    return result


def verify(manifest,candidates,contract):
    objects={o['id']:o for o in manifest['displayObjects']}
    assert len(objects)==len(manifest['displayObjects'])
    assert [s['id'] for s in manifest['states']]==[f'level{n}-source-initial' for n in (11,12,13,21,22)]
    seen=set()
    for level in candidates['levels']:
        n=level['level']; file=ROOT/f'local-resources/regima/source/restored-swfs/assets/levels/level{n}.swf'
        defs,names=binary_source(file)
        root=next(k for k,v in names.items() if v==f'export.gameSence.sl{n}')
        raw=[p for p in children(defs[root]) if names.get(p[1]) in WALLS]
        registered=[p for p in children(defs[root]) if p[1] in defs and defs[p[1]][0]=='sprite'
                    and any(child[3] in ('isWall','isThroughWall','isThroughDownButUpWall','isThroughUpButDownWall')
                            for child in children(defs[p[1]],False))]
        assert raw==registered, 'class filter missed a PhysicsWorld-registered object'
        assert len(raw)==len(level['walls']),f'level{n}: missing wall'
        source_svg=ET.parse(ROOT/level['sourceRootSvg']).getroot()
        svg_walls=[u for u in list(source_svg)[0] if int(u.get('{https://www.free-decompiler.com/flash}characterId','-1'))
                   in {p[1] for p in raw}]
        assert len(svg_walls)==len(raw)
        for use,(_,cid,m,_) in zip(svg_walls,raw):
            assert int(use.get('{https://www.free-decompiler.com/flash}characterId'))==cid
            svg_matrix=[float(x) for x in re.search(r'matrix\(([^)]+)\)',use.get('transform')).group(1).split(',')]
            assert all(abs(a-b)<0.00011 for a,b in zip(svg_matrix,m)), 'SVG direct wall matrix'
        order=[]
        seen.add(f'level{n}-wall-scope')
        expected_scope=bbox([point for _,cid,m,_ in raw for point in points(defs,cid,m)])
        scope=objects[f'level{n}-wall-scope']
        near(scope['placements'][0]['localBounds'],expected_scope,'scoped root bounds')
        near(scope['placements'][0]['stageBounds'],expected_scope,'scoped root world bounds')
        for record,(depth,cid,m,instance) in zip(level['walls'],raw):
            key=f'level{n}-d{depth}'
            assert record['objectId']==key and record['characterId']==cid and record['className']==names[cid]
            near(record['worldMatrix'],dict(zip(('a','b','c','d','tx','ty'),m)),key+' matrix')
            near(record['bounds'],bbox(points(defs,cid,m)),key+' bounds')
            markers=[c[3] for c in children(defs[cid]) if c[3]]
            assert record['markers']==markers
            for field,marker in [('through','isThroughWall'),('throughUp','isThroughUpButDownWall'),('throughDown','isThroughDownButUpWall')]:
                assert record[field]==(marker in markers),key+' '+field
            assert record['isThroughWallClass']==(names[cid]=='export.ThroughWall') and record['usesWallTolerance']
            assert record['rotated']==bool(m[1] or m[2])
            assert record['axisAligned']==((m[1]==0 and m[2]==0) or (m[0]==0 and m[3]==0))
            assert record['axisAligned'] and round(math.degrees(math.atan2(m[1],m[0]))) in (0,90), 'unsupported actual slope branch'
            if 'isWall' in markers and (m[1] or m[2]): order.insert(0,key)
            else: order.append(key)
            def verify_tree(child,key,parent,depth,local,ancestors=(),instance=None):
                seen.add(key); node=objects[key]
                assert node['sourceIdentity']['characterId']==child and node['parentId']==parent and node['depth']==depth
                assert node['sourceIdentity']['symbolClass']==names.get(child)
                assert node['sourceIdentity']['instanceName']==instance
                assert node['sourceIdentity']['provenanceId']==f'level{n}' and node['sourceIdentity']['frame']==1
                near(node['placements'][0]['localBounds'],bbox(points(defs,child)),key+' local bounds')
                near(node['placements'][0]['localMatrix'],dict(zip(('a','b','c','d','tx','ty'),local)),key+' local matrix')
                world_points=points(defs,child,local) or [(local[4],local[5])]
                for a,b,c,d,tx,ty in ancestors:
                    world_points=[(a*x+c*y+tx,b*x+d*y+ty) for x,y in world_points]
                near(node['placements'][0]['stageBounds'],bbox(world_points),key+' recursive world bounds')
                assert node['placements'][0]['stateId']==f'level{n}-source-initial'
                if defs[child][0]=='sprite':
                    for d,c,q,name in children(defs[child]): verify_tree(c,key+f'-d{d}',key,d,q,(local,)+ancestors,name)
            verify_tree(cid,key,f'level{n}-wall-scope',depth,m,instance=instance)
            near(objects[key]['placements'][0]['stageBounds'],record['bounds'],key+' manifest world bounds')
            svg=ET.parse(ROOT/record['sourceSvg']).getroot(); source_box=bbox(points(defs,cid))
            for field in ('width','height'):
                assert abs(float(svg.get(field).removesuffix('px'))-source_box[field])<0.1, key+' SVG twip envelope'
        assert level['collisionOrder']==order, 'source wall order'
    assert seen==set(objects), 'missing/extra recursive display objects'
    state_ids=[s['id'] for s in manifest['states']]
    assert manifest['completeness']['expectedStateIds']==state_ids
    assert manifest['completeness']['extractedStateIds']==state_ids
    for state in state_ids:
        assert manifest['completeness']['expectedVisibleObjectCountByState'][state]==sum(
            p['stateId']==state and p['visible'] for o in objects.values() for p in o['placements'])
    for baseline in manifest['baselines']:
        assert digest(ROOT/baseline['path'])==baseline['sha256']
        svg=ET.parse(ROOT/baseline['path']).getroot()
        assert baseline['width']==math.ceil(float(svg.get('width').removesuffix('px')))
        assert baseline['height']==math.ceil(float(svg.get('height').removesuffix('px')))
        affine=[float(x) for x in re.search(r'matrix\(([^)]+)\)',list(svg)[0].get('transform')).group(1).split(',')]
        near(baseline['crop'],dict(left=-affine[4],top=-affine[5],width=float(svg.get('width').removesuffix('px')),
                                  height=float(svg.get('height').removesuffix('px'))),'source SVG crop')
    for entry in manifest['provenance']: assert digest(ROOT/entry['sourcePath'])==entry['sha256']
    source=source_contract()
    assert contract==source, 'source contract, provenance or owner fixture changed'
    return len(seen)


def main():
    manifest=json.loads(MANIFEST.read_text(encoding='utf-8'))
    candidates=json.loads((EVIDENCE/'environment-candidates.json').read_text(encoding='utf-8'))
    contract=(source_contract() if '--promote' in sys.argv else
              json.loads((EVIDENCE/'source-contract.json').read_text(encoding='utf-8')))
    count=verify(manifest,candidates,contract)
    mutations=[]
    for name in ('missing-side-wall','wrong-bottom','missing-inner-matrix','through-class-collapse','foot-as-root','wrong-wall-order','slope-mislabel'):
        m,c,s=copy.deepcopy(manifest),copy.deepcopy(candidates),copy.deepcopy(contract)
        if name=='missing-side-wall': c['levels'][1]['walls'].pop(1)
        elif name=='wrong-bottom': c['levels'][1]['walls'][0]['bounds']['height']+=10
        elif name=='missing-inner-matrix':
            o=next(x for x in m['displayObjects'] if x['parentId']=='level12-d23')
            o['placements'][0]['localMatrix']['a']=1
        elif name=='through-class-collapse': c['levels'][0]['walls'][-1]['through']=True
        elif name=='foot-as-root': s['ownerMapping']['affineGroundRootOffsetY']=0
        elif name=='wrong-wall-order': c['levels'][0]['collisionOrder'].reverse()
        elif name=='slope-mislabel': c['levels'][0]['walls'][1]['axisAligned']=False
        try: verify(m,c,s)
        except (AssertionError,KeyError): mutations.append(dict(name=name,rejected=True))
        else: raise AssertionError('surviving mutation '+name)
    if '--promote' in sys.argv:
        manifest['status']='verified'
        manifest['completeness'].update(displayListMatched=True,stateSetMatched=True,unresolved=[])
        staged=LOCAL/'schema-candidate.json'
        staged.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        subprocess.run(['node','tools/validate-ui-ground-truth.mjs',str(staged)],cwd=ROOT,check=True)
        candidates['status']='verified'
        MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        (EVIDENCE/'environment-candidates.json').write_text(json.dumps(candidates,indent=2)+'\n',encoding='utf-8')
    if manifest['status']=='verified':
        subprocess.run(['node','tools/validate-ui-ground-truth.mjs',str(MANIFEST)],cwd=ROOT,check=True)
    properties=dict(truthId=manifest['truthId'],manifestSha256=digest(MANIFEST),status=manifest['status'],
        levels=[dict(level=x['level'],collisionOrder=x['collisionOrder'],walls=[{key:w[key] for key in
            ('objectId','className','markers','through','throughDown','throughUp','usesWallTolerance','isThroughWallClass','rotated','axisAligned')}
            for w in x['walls']]) for x in candidates['levels']])
    if '--promote' in sys.argv:
        (EVIDENCE/'environment-properties.json').write_text(json.dumps(properties,indent=2)+'\n',encoding='utf-8')
        (EVIDENCE/'source-contract.json').write_text(json.dumps(contract,indent=2)+'\n',encoding='utf-8')
    else:
        assert json.loads((EVIDENCE/'environment-properties.json').read_text(encoding='utf-8'))==properties, 'production property sidecar changed'
    (EVIDENCE/'verification.json').write_text(json.dumps(dict(status='passed' if manifest['status']=='verified' else 'geometry-checked-awaiting-promotion',wallCount=sum(len(x['walls']) for x in candidates['levels']),
        displayObjectCount=count,independentInputs=['SWF binary recursive RECT/MATRIX and marker registration','FFDec SVG direct wall matrices and dimension envelopes (not pixel equality)','restored AS3'],
        mutations=mutations,manifestSha256=digest(MANIFEST)),indent=2)+'\n',encoding='utf-8')
    print(f'217: {count} display objects; binary/SVG/source checks and {len(mutations)} mutations passed.')


if __name__=='__main__': main()
