"""Independent bitmap-fill sampling experiment; not promoted as a runtime algorithm."""
from pathlib import Path
import json
import math
import runpy
import struct
import zlib
import xml.etree.ElementTree as ET
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-219'


def read_matrix(n, bitmap=False):
    a=n.attrib
    v=lambda key: round(float(a[key])*65536)/65536
    m=np.array([[v('scaleX') if a.get('hasScale')=='true' else 1,
                 v('rotateSkew1') if a.get('hasRotate')=='true' else 0,int(a['translateX'])/20],
                [v('rotateSkew0') if a.get('hasRotate')=='true' else 0,
                 v('scaleY') if a.get('hasScale')=='true' else 1,int(a['translateY'])/20],[0,0,1]],float)
    if bitmap: m[:2,:2]/=20
    return m


def inputs():
    raw=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))['source_tags'](
        ROOT/'local-resources/regima/source/restored-swfs/assets/pet1.swf')
    xml=ET.parse(ROOT/'local-resources/regima/task-outputs/task-settings-219/source.xml').getroot()
    defs={int(t.get('spriteId') or t.get('shapeId') or t.get('characterID')):t for t in xml.find('tags')
          if t.get('spriteId') or t.get('shapeId') or t.get('characterID')}
    images={}
    for cid,(code,data) in raw.items():
        if not 543<=cid<=603 or code not in (35,36):continue
        if code==36:
            assert data[2]==5
            width,height=struct.unpack_from('<HH',data,3)
            alpha=zlib.decompress(data[7:])[::4]
        else:
            from io import BytesIO
            offset=struct.unpack_from('<I',data,2)[0]
            im=Image.open(BytesIO(data[6:6+offset]));width,height=im.size
            alpha=zlib.decompress(data[6+offset:])
        assert len(alpha)==width*height
        images[cid]=np.frombuffer(alpha,dtype=np.uint8).reshape(height,width)
    states=json.loads((OUT/'source-display-list.json').read_text(encoding='utf-8'))['states']
    leaves={}
    for state in states:
        world={'root':np.eye(3)};rows=[]
        for child in state['displayList']:
            m=child['matrix'];local=np.array([[m['a'],m['c'],m['tx']],[m['b'],m['d'],m['ty']],[0,0,1]])
            world[child['path']]=world[child['path'].rsplit('/',1)[0]]@local
            if not child['kind'].startswith('DefineShape'): continue
            definition=defs[child['characterId']]
            fills=definition.findall('./shapes/fillStyles/fillStyles/item')
            assert len(fills)==1
            fill=fills[0]
            rows.append((world[child['path']]@read_matrix(fill.find('bitmapMatrix'),True),
                         images[int(fill.get('bitmapId'))]))
        leaves[(state['symbol'],state['frame'])]=rows
    return leaves


def predict(item,leaves,anchor_x=.5,anchor_y=.5):
    q=item['intersection'];w,h=int(q['width']),int(q['height'])
    if w<1 or h<1:return np.zeros((0,0),bool)
    y,x=np.mgrid[:h,:w]
    root=item['sourceRoot']
    sample=np.array([(x+anchor_x+q['x']-root['x']).reshape(-1),
                     (y+anchor_y+q['y']-root['y']).reshape(-1),np.ones(w*h)])
    sample[0]*=item['sign']
    result=np.zeros(w*h,bool)
    for m,alpha in leaves[(item['symbol'],item['frame'])]:
        coords=np.linalg.inv(m)@sample
        sx=np.floor(coords[0]).astype(int);sy=np.floor(coords[1]).astype(int)
        inside=(sx>=0)&(sy>=0)&(sx<alpha.shape[1])&(sy<alpha.shape[0])
        result[inside]|=alpha[sy[inside],sx[inside]]>0
    return result.reshape(h,w)


def main():
    leaves=inputs()
    report=json.loads((OUT/'air-original/measurement.json').read_text(encoding='utf-8'))
    groups={}
    for item in report['actual']:
        if '-t0-phase-0' not in item['id'] or item['intersection']['width']<1 or item['intersection']['height']<1:continue
        actual=np.all(np.array(Image.open(OUT/'air-original/buffers'/f'{item["id"]}.png').convert('RGB'))==[0,255,255],axis=2)
        results=[]
        for ax in [.25,.5,.75]:
            for ay in [.25,.5,.75]:
                expected=predict(item,leaves,ax,ay)
                results.append((int(np.count_nonzero(actual!=expected)),ax,ay))
        best=min(results)
        if best[0]:groups[item['id']]=best
    print('nonzero best-anchor cases',len(groups));print(list(groups.items())[:20])


if __name__=='__main__':main()
