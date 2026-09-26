"""Re-encode normalized vector topology, avoiding Graphics API serial-fill raster semantics."""
import hashlib
import json
import runpy
import struct
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/geometry-air'
H=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))


def color(fill,alpha):
    c=fill['color'];rgb=bytes([(c>>16)&255,(c>>8)&255,c&255])
    return rgb+bytes([round(fill['alpha']*255)]) if alpha else rgb


def encode(cid,spec):
    alpha=spec['tagCode']==32
    b=spec['boundsTwips'];values=[b[k] for k in ['Xmin','Xmax','Ymin','Ymax']]
    w=H['Writer']();bits=H['signed_size'](values);w.n(bits,5)
    for v in values:w.n(v,bits)
    result=struct.pack('<H',cid)+w.finish()
    def styles(index):
        batch=spec['batches'][index]
        fills=[spec['fills'][i] for i in batch['fills']];strokes=[spec['strokes'][i] for i in batch['strokes']]
        assert len(fills)<255 and len(strokes)<255
        encoded=bytes([len(fills)])
        for fill in fills:
            assert fill['kind']=='solid'
            encoded+=b'\0'+color(fill,alpha)
        encoded+=bytes([len(strokes)])
        for stroke in strokes:encoded+=struct.pack('<H',round(stroke['width']*20))+color(stroke,alpha)
        return encoded,len(fills).bit_length(),len(strokes).bit_length()
    encoded,fb,lb=styles(0);result+=encoded;w=H['Writer']();w.n(fb,4);w.n(lb,4)
    cursor=[0,0]
    for operation in spec['operations']:
        if operation['kind']=='style':
            flags=sum(value for key,value in [('move',1),('fill0',2),('fill1',4),('line',8),('newBatch',16)] if key in operation)
            assert flags
            w.n(flags,6)
            if 'move' in operation:
                cursor=operation['move'];bits=H['signed_size'](cursor);w.n(bits,5)
                for v in cursor:w.n(v,bits)
            for key,bits in [('fill0',fb),('fill1',fb),('line',lb)]:
                if key in operation:w.n(operation[key],bits)
            if 'newBatch' in operation:
                result+=w.finish();encoded,fb,lb=styles(operation['newBatch']);result+=encoded
                w=H['Writer']();w.n(fb,4);w.n(lb,4)
        else:
            edge=operation['points'];assert cursor==edge[0];cursor=edge[-1]
            if len(edge)==2:
                delta=[edge[1][i]-edge[0][i] for i in (0,1)];bits=max(2,H['signed_size'](delta))
                w.n(1,1);w.n(1,1);w.n(bits-2,4);w.n(1,1)
                for v in delta:w.n(v,bits)
            else:
                delta=[edge[1][i]-edge[0][i] for i in (0,1)]+[edge[2][i]-edge[1][i] for i in (0,1)]
                bits=max(2,H['signed_size'](delta));w.n(1,1);w.n(0,1);w.n(bits-2,4)
                for v in delta:w.n(v,bits)
    w.n(0,6);result+=w.finish()
    return result


def main():
    data=json.loads((OUT/'geometry-inputs.json').read_text());source=next(s for s in data['sources'] if s['id']=='20120203')
    chunks=[H['tag'](69,struct.pack('<I',8))];records=[]
    for cid in [131,202]:
        spec=source['shapes'][str(cid)];body=encode(cid,spec);chunks.append(H['tag'](spec['tagCode'],body))
        records.append(dict(characterId=cid,tagCode=spec['tagCode'],sha256=hashlib.sha256(body).hexdigest()))
    chunks += [H['place'](cid,i+1,dict(tx=0,ty=0),transformed=False) for i,cid in enumerate([131,202])]
    chunks += [H['tag'](1,b''),H['tag'](0,b'')]
    body=H['rectangle'](200,200)+struct.pack('<HH',24*256,1)+b''.join(chunks)
    target=WORK/'decoded-vectors.swf';target.write_bytes(b'FWS'+bytes([10])+struct.pack('<I',8+len(body))+body)
    (WORK/'decoded-vectors.json').write_text(json.dumps(dict(status='encoded-not-promoted',records=records,sha256=hashlib.sha256(target.read_bytes()).hexdigest()),indent=2)+'\n')
    print('228 re-encoded vectors:',len(records))


if __name__=='__main__':main()
