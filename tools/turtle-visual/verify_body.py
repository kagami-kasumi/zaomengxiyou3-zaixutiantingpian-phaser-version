"""Compare native body projections/countdowns with source alpha planes and holds."""
import hashlib
import json
import runpy
import struct
import zlib
from pathlib import Path

from PIL import Image, ImageChops

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/body-air'


def main():
    inputs=json.loads((OUT/'body-inputs.json').read_text())
    observed=json.loads((WORK/'measurement.json').read_text())
    source=json.loads((OUT/'body-source.json').read_text())
    raw=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))['source_tags'](ROOT/source['sourcePath'])
    planes={}
    for spec in source['bitmaps']:
        _,data=raw[spec['characterId']]
        offset=struct.unpack_from('<I',data,2)[0]
        alpha=zlib.decompress(data[6+offset:])
        assert len(alpha)==spec['width']*spec['height']
        planes[spec['form']]=Image.frombytes('L',(spec['width'],spec['height']),alpha)
    failures=[]
    for actual in observed['cells']:
        spec=inputs['forms'][actual['form']-1]
        w,h=spec['cellSize'];column,row=actual['column'],actual['row']
        cell=planes[actual['form']].crop((column*w,row*h,(column+1)*w,(row+1)*h))
        if actual['direct']==1:cell=cell.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        dx=-w/2+spec['offset'][0]*(1 if actual['direct']==1 else -1)
        dy=-h/2+spec['offset'][1]
        assert actual['offset']==dict(x=dx,y=dy)
        expected=Image.new('L',(940,590));expected.paste(cell,(round(actual['root']['x']+dx),round(actual['root']['y']+dy)))
        path=ROOT/actual['file'];assert hashlib.sha256(path.read_bytes()).hexdigest()==actual['sha256']
        observed_alpha=Image.open(path).convert('RGBA').getchannel('A')
        if ImageChops.difference(expected,observed_alpha).getbbox():failures.append(actual['id'])
    for actual in observed['clocks']:
        row=inputs['forms'][actual['form']-1]['rows'][actual['row']]
        tick=(actual['tick']-1)%row['totalHostTicks']+1
        cell=next(c for c in row['cells'] if c['entryHostTick']<=tick<=c['lastHostTick'])
        enter=actual['events'][0]
        assert enter==dict(phase='enter',column=cell['column'],row=row['row'],count=cell['lastHostTick']-tick+1),(actual,cell)
        assert any(e['phase']=='over' for e in actual['events'])==(tick==row['totalHostTicks'])
    report=dict(status='passed-bounded-check' if not failures else 'failed',cells=len(observed['cells']),
                clockSteps=len(observed['clocks']),alphaMismatches=failures,
                scope='Native BBDC bitmap cell alpha, direction, offset and enter/over countdown only. Full pet setAction/completion and dynamic skills pending.',
                measurementSha256=hashlib.sha256((WORK/'measurement.json').read_bytes()).hexdigest())
    (OUT/'body-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print(report)
    assert not failures


if __name__=='__main__':main()
