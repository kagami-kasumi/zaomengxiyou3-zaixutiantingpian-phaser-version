"""Preserve original bitmap tags and build explicit atlas observation rectangles."""
import hashlib
import io
import json
import runpy
import struct
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/body-air'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    helpers = runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))
    chunks, specs = [helpers['tag'](69, struct.pack('<I', 8))], []
    for i, (owner,cid) in enumerate([('20120203',7),('20120203',14),('20120203',11),('pet1',20)]):
        original = ROOT/f'local-resources/regima/source/restored-swfs/assets/{owner}.swf'
        tags = helpers['source_tags'](original)
        code, data = tags[cid]
        assert code in (35,36)
        if code == 35:
            size = struct.unpack_from('<I', data, 2)[0]
            width, height = Image.open(io.BytesIO(data[6:6+size])).size
        else:
            assert data[2] == 5, 'Only original ARGB32 lossless format supported'
            width,height = struct.unpack_from('<HH',data,3)
        writer = helpers['Writer']()
        writer.n(1,4); writer.n(0,4)  # One fill bit, no line bits.
        writer.n(0,1); writer.n(5,5)  # MoveTo and FillStyle1.
        writer.n(1,5); writer.n(0,1); writer.n(0,1); writer.n(1,1)
        for dx, dy in [(width*20,0),(0,height*20),(-width*20,0),(0,-height*20)]:
            value = dx or dy
            bits = max(2, abs(value).bit_length()+1)
            writer.n(1,1); writer.n(1,1); writer.n(bits-2,4)
            writer.n(0,1); writer.n(1 if dy else 0,1); writer.n(value,bits)
        writer.n(0,6)
        shape = struct.pack('<H',60000+i)+helpers['rectangle'](width,height)
        shape += bytes([1,67])+struct.pack('<H',cid)+helpers['matrix'](a=20,d=20)+bytes([0])+writer.finish()
        chunks += [helpers['tag'](code,data),helpers['tag'](32,shape)]
        specs.append(dict(form=i+1,characterId=cid,width=width,height=height,
                          sourcePath=original.relative_to(ROOT).as_posix(),sourceSha256=hashlib.sha256(original.read_bytes()).hexdigest(),
                          tagCode=code,bitmapTagSha256=hashlib.sha256(data).hexdigest(),wrapperCharacterId=60000+i))
    chunks += [helpers['place'](60000+i,i+1,dict(tx=0,ty=0),transformed=False) for i in range(4)]
    chunks += [helpers['tag'](1,b''),helpers['tag'](0,b'')]
    body=helpers['rectangle'](940,590)+struct.pack('<HH',24*256,1)+b''.join(chunks)
    target=WORK/'body-source.swf'
    target.write_bytes(b'FWS'+bytes([10])+struct.pack('<I',8+len(body))+body)
    report=dict(status='observation-fixture',bitmaps=specs,
                wrapper='Synthetic unscaled clipped non-smoothed bitmap rectangle only; original JPEG3/Lossless2 tag bytes unchanged.',
                path=target.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(target.read_bytes()).hexdigest())
    (OUT/'body-source.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('228 native atlas observation fixture:',[(s['form'],s['width'],s['height']) for s in specs])


if __name__ == '__main__':
    main()
