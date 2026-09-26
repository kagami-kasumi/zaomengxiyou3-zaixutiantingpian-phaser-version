"""Apply the shared source decoder to the independently frozen horse closure."""
import hashlib
import io
import json
import runpy
import struct
import xml.etree.ElementTree as ET
import zlib
from PIL import Image
from prepare_lifecycle import ROOT,OUT

def main():
    decoder=runpy.run_path(str(ROOT/'tools/monkey-spatial/geometry_inputs.py'))
    work=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229/geometry-air'
    work.mkdir(parents=True,exist_ok=True)
    tags_fn=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))['source_tags']
    matrix=runpy.run_path(str(ROOT/'tools/dragon23-collision-source.py'))['matrix']
    sources=[]
    for source in json.loads((OUT/'source-definitions.json').read_text())['sources']:
        tags=tags_fn(ROOT/source['path'])
        assert hashlib.sha256((ROOT/source['path']).read_bytes()).hexdigest()==source['sha256']
        defs={int(n.get('shapeId') or n.get('spriteId') or n.get('characterID')):n for n in ET.parse(ROOT/source['xmlPath']).getroot().find('tags') if n.get('shapeId') or n.get('spriteId') or n.get('characterID')}
        shapes={};bitmaps={}
        for cid,definition in source['definitions'].items():
            code,raw=tags[int(cid)]
            assert hashlib.sha256(raw).hexdigest()==definition['tagBodySha256']
            if code in (2,22,32):shapes[cid]=decoder['shape'](defs[int(cid)],matrix);continue
            if code==39:continue
            prefix=work/(source['id']+'-'+cid)
            if code==35:
                size=struct.unpack_from('<I',raw,2)[0];jpeg=raw[6:6+size];alpha=zlib.decompress(raw[6+size:])
                width,height=Image.open(io.BytesIO(jpeg)).size;assert len(alpha)==width*height
                jpg=prefix.with_suffix('.jpg');a=prefix.with_suffix('.alpha');jpg.write_bytes(jpeg);a.write_bytes(alpha)
                bitmaps[cid]=dict(codec='jpeg3-premultiplied',width=width,height=height,jpegPath=str(jpg),alphaPath=str(a),jpegSha256=hashlib.sha256(jpeg).hexdigest(),alphaSha256=hashlib.sha256(alpha).hexdigest(),tagSha256=definition['tagBodySha256'])
            else:
                assert code==36 and raw[2]==5,(source['id'],cid,code)
                width,height=struct.unpack_from('<HH',raw,3);premul=zlib.decompress(raw[7:]);pixels=bytearray(len(premul))
                for i in range(0,len(premul),4):
                    a=premul[i];pixels[i:i+4]=bytes([a]+[min(255,(premul[i+j]*255+a//2)//a) if a else 0 for j in (1,2,3)])
                path=prefix.with_suffix('.argb');path.write_bytes(pixels)
                bitmaps[cid]=dict(width=width,height=height,argbPath=path.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(pixels).hexdigest(),tagSha256=definition['tagBodySha256'])
        sources.append(dict(id=source['id'],sourceSha256=source['sha256'],shapes=shapes,bitmaps=bitmaps,timelines=source['timelines'],roots=source['roots']))
    (OUT/'geometry-inputs.json').write_text(json.dumps(dict(status='decoded-not-promoted',sources=sources),separators=(',',':'))+'\n',encoding='utf-8')
    print('229 geometry decoded',sum(len(s['shapes']) for s in sources),'shapes',sum(len(s['bitmaps']) for s in sources),'bitmaps')

if __name__=='__main__':main()
