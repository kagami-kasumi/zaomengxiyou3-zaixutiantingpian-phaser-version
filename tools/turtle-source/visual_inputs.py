"""Locate only required symbols in restored owners; no geometry or visual truth claim."""
import hashlib,json,struct,zlib
from prepare import ROOT
NAMES=[*[f'PetTurtleBmd{n}' for n in range(1,5)],'PetTurtle1Bullet1','PetTurtle2Bullet1','PetTurtle1Bullet2','PetTurtle3Bullet3','PetTurtle2Buff','AoyiBuff','ObjectBaseSprite','ObjectBaseSprite3','ObjectBaseSprite4']
def scan():
    result=[]
    for name in ['pet1.swf','StageCommon.swf']:
        path=ROOT/'local-resources/regima/source/restored-swfs/assets'/name;raw=path.read_bytes()
        b=zlib.decompress(raw[8:]) if raw[:3]==b'CWS' else raw[8:];pos=(5+4*(b[0]>>3)+7)//8+4;symbols={}
        while pos<len(b):
            h=struct.unpack_from('<H',b,pos)[0];pos+=2;tag,size=h>>6,h&63
            if size==63:size=struct.unpack_from('<I',b,pos)[0];pos+=4
            data=b[pos:pos+size];pos+=size
            if tag==76:
                p=2
                for _ in range(struct.unpack_from('<H',data)[0]):
                    cid=struct.unpack_from('<H',data,p)[0];p+=2;end=data.index(0,p);symbol=data[p:end].decode();p=end+1
                    if symbol in NAMES:symbols[symbol]=cid
            if tag==0:break
        result.append(dict(path=str(path.relative_to(ROOT)).replace('\\','/'),sha256=hashlib.sha256(raw).hexdigest(),symbols=symbols))
    assert set().union(*(set(x['symbols']) for x in result))==set(NAMES)
    return {'status':'located-only','requiredSymbols':NAMES,'sources':result,'next':'TASK-SETTINGS-222 must verify load precedence, recursive timeline, masks, pixel collision and baselines'}
if __name__=='__main__':
    data=scan();p=ROOT/'docs/tasks/evidence/TASK-SETTINGS-221/visual-inputs.json'
    import sys
    text=json.dumps(data,indent=2)+'\n'
    if '--check' in sys.argv:assert p.read_text()==text
    else:p.write_text(text)
    print('Located',len(NAMES),'required symbols in restored owners')
