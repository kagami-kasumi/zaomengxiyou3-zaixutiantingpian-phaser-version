"""Independent original-runtime buffer checks and finite collision sampler calibration.

Does not import the runner or generator. Source pixels come from original lossless
bitmap bytes; observed buffers come from execution of unchanged restored HitTest.
"""
from pathlib import Path
import copy
import hashlib
import json
import math
import struct
import zlib
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-218'
SOURCE=ROOT/'local-resources/regima/source/restored-swfs/assets'

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def original_alpha():
    raw=(SOURCE/'pet1.swf').read_bytes()
    data=zlib.decompress(raw[8:]) if raw[:3]==b'CWS' else raw[8:]
    pos=(5+4*(data[0]>>3)+7)//8+4
    while pos<len(data):
        header=struct.unpack_from('<H',data,pos)[0];pos+=2
        code,size=header>>6,header&63
        if size==63:size=struct.unpack_from('<I',data,pos)[0];pos+=4
        body=data[pos:pos+size];pos+=size
        if code==36 and struct.unpack_from('<H',body)[0]==540:
            assert body[2]==5 and struct.unpack_from('<HH',body,3)==(69,56)
            pixels=zlib.decompress(body[7:]);assert len(pixels)==69*56*4
            alpha=pixels[::4];assert sum(x>0 for x in alpha)==1953
            return alpha
    raise AssertionError('Original bitmap540 not found')

def expected_mask(bounds,intersection,flip,alpha,mutant=None):
    w,h=int(intersection['width']),int(intersection['height'])
    dx=round((intersection['x']-bounds['x'])*20)
    dy=round((intersection['y']-bounds['y'])*20)
    # Empirically calibrated to original AIR51.1 fixed-twip, unit-scale cases.
    # Keep the finite scope explicit; these are not universal Flash API rules.
    ix=math.ceil((dx-(5 if flip==1 else 10))/20)
    iy=math.ceil((dy-5)/20)
    if mutant=='pixel-center':ix=math.floor(dx/20+.5);iy=math.floor(dy/20+.5)
    if mutant=='floor-origin':ix=math.floor(dx/20);iy=math.floor(dy/20)
    mask=[]
    for y in range(h):
        for x in range(w):
            sx=ix+x if flip==1 or mutant=='wrong-flip' else 68-ix-x
            sy=iy+y
            inside=0<=sx<69 and 0<=sy<56
            mask.append(inside and (mutant=='bitmap-rectangle' or alpha[sy*69+sx]>0))
    return mask

def verify(report,folder,alpha,mutant=None):
    assert report['exitCode']==0 and report['renderMode']=='direct'
    env=report['environment'][0]
    assert (env['stageWidth'],env['stageHeight'],env['frameRate'])==(940,590,24)
    assert len(report['inputs'])==len(report['actual'])==861
    inputs={i['id']:i for i in report['inputs']};assert len(inputs)==861
    assert {i['id'] for i in report['actual']}==set(inputs)
    assert sum(i.startswith('phase-') for i in inputs)==800
    for x in range(20):
        for y in range(20):
            for direction in ['left','right']:assert f'phase-{x}-{y}-{direction}' in inputs
    expected_stages=['ObjectBaseSprite','ObjectBaseSprite2','ObjectBaseSprite7']
    expected_stages += [f'bullet-{f}-{d}' for f in range(1,12) for d in ['left','right']]
    assert set(report['baselineHashes'])=={s+'.png' for s in expected_stages}
    for name,digest in report['sourceHashes'].items():assert sha(SOURCE/name)==digest
    for kind,key in [('buffers','bufferHashes'),('stage-baselines','baselineHashes')]:
        for name,digest in report[key].items():assert sha(folder/kind/name)==digest
    tx=[1.5,-24,-49.5,-75,-100.5,-125.95,-151.45,-176.95,-202.45,-227.95,-253.45]
    pixels=0
    for item in report['actual']:
        case=inputs[item['id']];q=item['intersection'];bb=item['bullet']
        if 'frame' in case:
            expected_x=case['bx']+case['flip']*tx[case['frame']-1]-34.5
            assert abs(bb['x']-expected_x)<1e-8 and bb['width']==69 and bb['height']==56
        if item['id'].startswith('contact-'):
            assert item['actual'] and item['cyanPixels']==1953,item['id']
        if q['width']<1 or q['height']<1:
            assert item['actual'] is False and item['cyanPixels']==0
            continue
        with Image.open(folder/'buffers'/(item['id']+'.png')) as im:
            assert im.size==(int(q['width']),int(q['height']))
            rgb=im.convert('RGB').tobytes()
            actual=[rgb[i:i+3]==b'\x00\xff\xff' for i in range(0,len(rgb),3)]
        expected=expected_mask(bb,q,case['flip'],alpha,mutant)
        assert expected==actual,item['id']
        assert sum(actual)==item['cyanPixels'] and any(actual)==item['actual']
        pixels+=len(actual)
    return pixels

def main():
    old=json.loads((OUT/'air-original/measurement.json').read_text(encoding='utf-8'))
    new=json.loads((OUT/'air/measurement.json').read_text(encoding='utf-8'))
    assert old['environment'][0]['runtime']=='WIN 51,1,1,5'
    assert new['environment'][0]['runtime']=='WIN 51,3,4,2'
    dll=old['originalRuntimeDll'];assert sha(ROOT/dll['path'])==dll['sha256']
    extraction=json.loads((ROOT/'local-resources/regima/manifests/unpacked-manifest.json').read_text(encoding='utf-8'))
    original_dll=next(f for f in extraction['files'] if f['path']=='Adobe AIR/Versions/1.0/Adobe AIR.dll')
    assert dll['sha256']==original_dll['sha256']
    hit_test=ROOT/'local-resources/regima/task-outputs/task-settings-218/source/scripts/my/HitTest.as'
    assert sha(hit_test)==old['originalHitTestSha256']==new['originalHitTestSha256']
    assert sha(ROOT/'tools/air-collision/CollisionProbe.as')==old['probeSourceSha256']==new['probeSourceSha256']
    assert old['inputs']==new['inputs'] and old['actual']==new['actual']
    assert old['bufferHashes']==new['bufferHashes'] and old['baselineHashes']==new['baselineHashes']
    alpha=original_alpha();pixels=verify(old,OUT/'air-original',alpha)
    assert verify(new,OUT/'air',alpha)==pixels
    assets=[]
    expected_crop=bytes(alpha[y*69+x] for y in range(53) for x in range(67))
    assert all(alpha[y*69+x]==0 for y in range(56) for x in range(69) if x>=67 or y>=53)
    for frame in range(1,12):
        asset=ROOT/f'public/assets/pets/dragon/effects/PetDragon1Bullet1/{frame}.png'
        with Image.open(asset) as image:
            assert image.size==(67,53) and image.getchannel('A').tobytes()==expected_crop
        assets.append(dict(frame=frame,path=asset.relative_to(ROOT).as_posix(),sha256=sha(asset)))
    killed=[]
    for mutant in ['bitmap-rectangle','wrong-flip','pixel-center','floor-origin']:
        try:verify(old,OUT/'air-original',alpha,mutant)
        except AssertionError:killed.append(mutant)
        else:raise AssertionError('surviving mutation '+mutant)
    report=dict(status='passed-finite-source-runtime-scope',cases=861,pixelsCompared=pixels,
                runtimes=[old['environment'][0],new['environment'][0]],runtimeDifferencePixels=0,
                stageBaselines=25,mutationKills=killed,
                originalRuntimeProvenance=dict(dllSha256=dll['sha256'],extractionManifest='local-resources/regima/manifests/unpacked-manifest.json'),
                sourceBitmap=dict(width=69,height=56,alphaSha256=hashlib.sha256(alpha).hexdigest()),
                assetMaskProjection=dict(sourceOffset=[0,0],size=[67,53],transparentPaddingRightBottom=[2,3],frames=assets),
                scope='original source bitmap and HitTest; accuracy1, axis-aligned unit bullet scale +/-1, fixed-twip fixture inputs',
                notProven=['arbitrary scaling/rotation/accuracy','BaseBullet/BaseMonster business execution','modern coordinate adapter'],
                sampler='empirical finite-scope calibration, independently compared with original runtime buffers')
    (OUT/'air-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f'Original/runtime AIR comparison: 861 cases, {pixels} buffer pixels, 25 baselines; 4 mutations rejected')

if __name__=='__main__':main()
