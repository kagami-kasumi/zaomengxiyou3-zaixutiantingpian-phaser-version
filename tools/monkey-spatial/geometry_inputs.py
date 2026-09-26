"""Decode bounded source shapes/bitmaps independently of native MovieClip instances."""
import collections
import hashlib
import json
import runpy
import struct
import xml.etree.ElementTree as ET
import zlib
from pathlib import Path

from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/geometry-air'


def shape(node,matrix):
    fills=[];strokes=[];batches=[];operations=[]
    def add_fill(fill):
        kind=int(fill.get('fillStyleType'))
        if kind==0:
            color=fill.find('color')
            fills.append(dict(kind='solid',color=sum(int(color.get(k))<<s for k,s in [('red',16),('green',8),('blue',0)]),alpha=int(color.get('alpha','255'))/255))
        else:
            assert kind in (64,65,66,67),kind
            transform=matrix(fill.find('bitmapMatrix'))
            for key in ['a','b','c','d']:transform[key]/=20
            fills.append(dict(kind='bitmap',bitmapId=int(fill.get('bitmapId')),matrix=transform,repeat=kind in (64,66),smooth=kind in (64,65)))
    def add_styles(container):
        begin=len(fills);line_begin=len(strokes)
        for fill in container.findall('fillStyles/fillStyles/item'):add_fill(fill)
        assert not container.findall('lineStyles/lineStyles2/item'),'Advanced stroke unsupported'
        for line in container.findall('lineStyles/lineStyles/item'):
            color=line.find('color')
            strokes.append(dict(kind='stroke',width=int(line.get('width'))/20,color=sum(int(color.get(k))<<s for k,s in [('red',16),('green',8),('blue',0)]),alpha=int(color.get('alpha','255'))/255))
        batches.append(dict(fills=list(range(begin,len(fills))),strokes=list(range(line_begin,len(strokes)))))
        return begin,line_begin
    fill_base,line_base=add_styles(node.find('shapes'))
    edges=collections.defaultdict(list);stroke_edges=collections.defaultdict(list);x=y=left=right=line=0
    for record in node.findall('shapes/shapeRecords/item'):
        kind=record.get('type')
        if kind=='EndShapeRecord':continue
        if kind=='StyleChangeRecord':
            operation=dict(kind='style')
            if record.get('stateMoveTo')=='true':operation['move']=[int(record.get('moveDeltaX')),int(record.get('moveDeltaY'))]
            for flag,key in [('stateFillStyle0','fill0'),('stateFillStyle1','fill1'),('stateLineStyle','line')]:
                if record.get(flag)=='true':operation[key]=int(record.get({'fill0':'fillStyle0','fill1':'fillStyle1','line':'lineStyle'}[key]))
            if record.get('stateMoveTo')=='true':x=int(record.get('moveDeltaX'));y=int(record.get('moveDeltaY'))
            if record.get('stateFillStyle0')=='true':
                value=int(record.get('fillStyle0'));left=value+fill_base if value else 0
            if record.get('stateFillStyle1')=='true':
                value=int(record.get('fillStyle1'));right=value+fill_base if value else 0
            if record.get('stateLineStyle')=='true':
                value=int(record.get('lineStyle'));line=value+line_base if value else 0
            if record.get('stateNewStyles')=='true':fill_base,line_base=add_styles(record)
            if record.get('stateNewStyles')=='true':operation['newBatch']=len(batches)-1
            operations.append(operation)
            continue
        start=[x,y]
        if kind=='StraightEdgeRecord':
            x+=int(record.get('deltaX','0'));y+=int(record.get('deltaY','0'));edge=[start,[x,y]]
        else:
            assert kind=='CurvedEdgeRecord',kind
            cx=x+int(record.get('controlDeltaX'));cy=y+int(record.get('controlDeltaY'))
            x=cx+int(record.get('anchorDeltaX'));y=cy+int(record.get('anchorDeltaY'));edge=[start,[cx,cy],[x,y]]
        if right:edges[right].append(edge)
        if left:edges[left].append(list(reversed(edge)))
        if line:stroke_edges[line].append(edge)
        operations.append(dict(kind='line' if len(edge)==2 else 'curve',points=edge))
    for index,fill in enumerate(fills,1):
        pending=edges[index][:];paths=[]
        while pending:
            edge=pending.pop(0);contour=[edge];end=edge[-1]
            while end!=contour[0][0]:
                match=next((i for i,e in enumerate(pending) if e[0]==end),None)
                assert match is not None,('Open fill contour',node.get('shapeId'),index,end)
                edge=pending.pop(match);contour.append(edge);end=edge[-1]
            paths.append([[[v/20 for v in point] for point in e] for e in contour])
        fill['paths']=paths
    for index,stroke in enumerate(strokes,1):
        stroke['edges']=[[[v/20 for v in point] for point in e] for e in stroke_edges[index]]
        pending=stroke['edges'][:];paths=[]
        while pending:
            contour=[pending.pop(0)]
            while True:
                end=contour[-1][-1]
                match=next((i for i,e in enumerate(pending) if e[0]==end or e[-1]==end),None)
                if match is None:break
                edge=pending.pop(match)
                if edge[-1]==end:edge=list(reversed(edge))
                contour.append(edge)
                if edge[-1]==contour[0][0]:break
            paths.append(contour)
        stroke['paths']=paths
    return dict(fills=fills,strokes=strokes,batches=batches,operations=operations,boundsTwips={k:int(node.find('shapeBounds').get(k)) for k in ['Xmin','Xmax','Ymin','Ymax']},tagCode={'DefineShapeTag':2,'DefineShape2Tag':22,'DefineShape3Tag':32}[node.get('type')])


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    data=json.loads((OUT/'source-definitions.json').read_text())
    tags_fn=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))['source_tags']
    matrix=runpy.run_path(str(ROOT/'tools/dragon23-collision-source.py'))['matrix']
    result=[]
    for source in data['sources']:
        assert hashlib.sha256((ROOT/source['path']).read_bytes()).hexdigest()==source['sha256']
        assert hashlib.sha256((ROOT/source['xmlPath']).read_bytes()).hexdigest()==source['xmlSha256']
        tags=tags_fn(ROOT/source['path'])
        definitions={int(n.get('shapeId') or n.get('spriteId') or n.get('characterID')):n for n in ET.parse(ROOT/source['xmlPath']).getroot().find('tags') if n.get('shapeId') or n.get('spriteId') or n.get('characterID')}
        bitmaps={};shapes={}
        for cid,spec in source['definitions'].items():
            cid=int(cid);code,raw=tags[cid]
            assert hashlib.sha256(raw).hexdigest()==spec['tagBodySha256']
            if code in (2,22,32):shapes[str(cid)]=shape(definitions[cid],matrix)
            elif code==36:
                assert raw[2]==5
                width,height=struct.unpack_from('<HH',raw,3);argb=zlib.decompress(raw[7:]);assert len(argb)==width*height*4
                rgba=bytearray(len(argb))
                for i in range(0,len(argb),4):
                    a=argb[i]
                    rgba[i:i+4]=bytes([min(255,(argb[i+j]*255+a//2)//a) if a else 0 for j in (1,2,3)]+[a])
                target=WORK/(source['id']+'-'+str(cid)+'.png')
                Image.frombytes('RGBA',(width,height),bytes(rgba)).save(target)
                pixel_file=target.with_suffix('.argb')
                pixels=bytearray(len(rgba))
                for i in range(0,len(rgba),4):pixels[i:i+4]=bytes([rgba[i+3],*rgba[i:i+3]])
                pixel_file.write_bytes(pixels)
                bitmaps[str(cid)]=dict(path=target.relative_to(ROOT).as_posix(),argbPath=pixel_file.relative_to(ROOT).as_posix(),width=width,height=height,sha256=hashlib.sha256(target.read_bytes()).hexdigest(),tagSha256=hashlib.sha256(raw).hexdigest())
            else:assert code==39,code
        result.append(dict(id=source['id'],sourceSha256=source['sha256'],shapes=shapes,bitmaps=bitmaps,timelines=source['timelines'],roots=source['roots']))
    report=dict(status='decoded-not-promoted',sources=result,scope='Independent XML edge/fill decoder and binary lossless ARGB decoder. Awaiting native raster and phase reconstruction comparison; no geometry promotion.')
    (OUT/'geometry-inputs.json').write_text(json.dumps(report,separators=(',',':'))+'\n')
    print('228 geometry inputs:',sum(len(s['shapes']) for s in result),'shapes,',sum(len(s['bitmaps']) for s in result),'bitmaps')


if __name__=='__main__':main()
