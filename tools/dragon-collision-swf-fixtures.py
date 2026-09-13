"""Source-tag render fixtures for 218. FFDec renders them; no game code is used.

Copies only the exact original shape/bitmap definitions into a tiny test SWF.
The root places the target and bullet with HitTest's color transforms/difference.
This is a source-render baseline, not a running Flash Player capture.
"""
from pathlib import Path
import struct
import zlib
import subprocess

ROOT = Path(__file__).resolve().parents[1]
LOCAL = ROOT / 'local-resources/regima/task-outputs/task-settings-218'
FFDEC = 'C:/Program Files (x86)/FFDec/ffdec-cli.exe'

class Writer:
    def __init__(self): self.bits = ''
    def n(self, value, count): self.bits += format(value & ((1 << count)-1), f'0{count}b') if count else ''
    def finish(self):
        self.bits += '0' * (-len(self.bits) % 8)
        return int(self.bits, 2).to_bytes(len(self.bits)//8, 'big') if self.bits else b''

def signed_size(values): return max(abs(v).bit_length()+1 for v in values)

def rectangle(w, h):
    values = [0, round(w*20), 0, round(h*20)]
    out=Writer(); bits=signed_size(values); out.n(bits,5)
    for v in values: out.n(v,bits)
    return out.finish()

def matrix(a=1, d=1, tx=0, ty=0):
    out=Writer(); out.n(1,1); values=[round(a*65536),round(d*65536)]
    bits=signed_size(values); out.n(bits,5)
    for v in values: out.n(v,bits)
    out.n(0,1); values=[round(tx*20),round(ty*20)]; bits=signed_size(values); out.n(bits,5)
    for v in values: out.n(v,bits)
    return out.finish()

def color_transform(white):
    out=Writer(); out.n(1,1); out.n(1,1); out.n(10,4)
    for v in [256]*4: out.n(v,10)
    for v in ([255]*4 if white else [255,-255,-255,255]): out.n(v,10)
    return out.finish()

def tag(code, body):
    return struct.pack('<H',code<<6 | 63) + struct.pack('<I',len(body)) + body

def source_tags(path):
    raw=path.read_bytes(); assert raw[:3] in (b'CWS',b'FWS')
    data=zlib.decompress(raw[8:]) if raw[:3]==b'CWS' else raw[8:]
    bits=data[0]>>3; start=(5+bits*4+7)//8+4
    result={}; pos=start
    while pos+2<=len(data):
        header=struct.unpack_from('<H',data,pos)[0]; pos+=2; code,size=header>>6,header&63
        if size==63: size=struct.unpack_from('<I',data,pos)[0]; pos+=4
        body=data[pos:pos+size]; pos+=size
        if code in (2,22,32,83,6,20,21,35,36,90,39): result[struct.unpack_from('<H',body)[0]]=(code,body)
        if code==0: break
    return result

def prepare_sources():
    """Recreate only this task's ignored extraction inputs with existing FFDec."""
    LOCAL.mkdir(parents=True,exist_ok=True)
    source=ROOT/'local-resources/regima/source/restored-swfs'
    def run(*args):
        result=subprocess.run([FFDEC,*map(str,args)],capture_output=True,text=True,timeout=60)
        if result.returncode: raise RuntimeError(result.stdout+result.stderr)
    run('-swf2xml',source/'assets/StageCommon.swf',LOCAL/'StageCommon.xml')
    run('-selectid','95,105,107','-select','1','-format','sprite:svg',
        '-export','sprite',LOCAL/'collision-svg',source/'assets/StageCommon.swf')
    classes=[f'export.monster.Monster{x}' for x in [2,3,4,5,6,7,8,9,10,16,19,30]]
    classes+=['base.BaseMonster','base.BaseBullet','base.BaseObject','my.HitTest',
              'petInfo.PetInfo','export.pet.PetDragon1']
    run('-selectclass',','.join(classes),'-export','script',LOCAL/'source',source/'1_MainLoad__main1.swf')
    pet=source_tags(source/'assets/pet1.swf')
    chunks=[tag(69,struct.pack('<I',8))]+[tag(*pet[c]) for c in [540,541,542]]
    chunks += [place(542,1,dict(tx=470,ty=295),transformed=False),tag(1,b''),tag(0,b'')]
    body=rectangle(940,590)+struct.pack('<HH',24*256,1)+b''.join(chunks)
    path=LOCAL/'bullet-source-subset.swf'
    path.write_bytes(b'FWS'+bytes([10])+struct.pack('<I',8+len(body))+body)
    run('-swf2xml',path,LOCAL/'bullet-source-subset.xml')

def place(cid, depth, transform, white=False, difference=False, transformed=True):
    flags=6 | (8 if transformed else 0)
    body=bytes([flags,2 if difference else 0])+struct.pack('<HH',depth,cid)+matrix(**transform)
    if transformed: body+=color_transform(white)
    if difference: body+=bytes([7])
    return tag(70,body)

def render_probe(name, target, bullet, size=(940,590), transformed=True):
    common=source_tags(ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf')
    pet=source_tags(ROOT/'local-resources/regima/source/restored-swfs/assets/pet1.swf')
    # Original target fill is shape53; original bullet bitmap540/shape541.
    code,shape=common[53]
    chunks=[tag(69,struct.pack('<I',8)),tag(9,b'\0\0\0'),
            tag(code,struct.pack('<H',60000)+shape[2:])]
    for cid in [540,541]: chunks.append(tag(*pet[cid]))
    chunks += [place(60000,1,target,transformed=transformed),
               place(541,2,bullet,white=True,difference=transformed,transformed=transformed),tag(1,b''),tag(0,b'')]
    body=rectangle(*size)+struct.pack('<HH',24*256,1)+b''.join(chunks)
    path=LOCAL/'render-fixtures'/f'{name}.swf'; path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(b'FWS'+bytes([10])+struct.pack('<I',8+len(body))+body)
    output=LOCAL/'render-fixtures'/name
    result=subprocess.run([FFDEC,'-export','frame',str(output),str(path)],capture_output=True,text=True,timeout=60)
    if result.returncode: raise RuntimeError(result.stdout+result.stderr)
    return next(output.rglob('*.png'))

def render_sequence(states):
    common=source_tags(ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf')
    pet=source_tags(ROOT/'local-resources/regima/source/restored-swfs/assets/pet1.swf')
    chunks=[tag(69,struct.pack('<I',8)),tag(9,b'\0\0\0')]
    for cid in [53,94,95,104,105,106,107]:
        code,body=common[cid]
        # The copied common IDs do not collide with selected pet IDs.
        chunks.append(tag(code,body))
    for cid in [540,541]: chunks.append(tag(*pet[cid]))
    for i,state in enumerate(states):
        if i: chunks.append(tag(28,struct.pack('<H',1)))
        chunks.extend([place(state['characterId'],1,state['renderMatrix'],transformed=False),tag(1,b'')])
    chunks.append(tag(0,b''))
    body=rectangle(940,590)+struct.pack('<HH',24*256,len(states))+b''.join(chunks)
    path=LOCAL/'source-baselines.swf'; path.write_bytes(b'FWS'+bytes([10])+struct.pack('<I',8+len(body))+body)
    result=subprocess.run([FFDEC,'-export','frame',str(LOCAL/'source-baselines'),str(path)],
                          capture_output=True,text=True,timeout=60)
    if result.returncode: raise RuntimeError(result.stdout+result.stderr)
    return [LOCAL/'source-baselines'/f'{i+1}.png' for i in range(len(states))]

if __name__=='__main__':
    from PIL import Image
    path=render_probe('color-transform-probe',dict(a=1,d=1,tx=400,ty=250),dict(tx=440,ty=290))
    with Image.open(path) as im:
        colors=im.convert('RGB').getcolors(im.width*im.height)
        print(path, sorted(colors,reverse=True)[:8])
