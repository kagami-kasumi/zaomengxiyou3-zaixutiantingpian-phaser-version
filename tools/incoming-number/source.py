"""Small read-only SWF parser: SymbolClass and lossless bitmap declarations."""
import hashlib
import struct
import zlib
import re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
SWF=ROOT/'local-resources/regima/source/restored-swfs/assets/OtherMat1.swf'
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def animation():
    src=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
    a=(src/'my/ANumber.as').read_text(encoding='utf-8');h=(src/'base/BaseHero.as').read_text(encoding='utf-8');q=(src/'my/CureHpQueue.as').read_text(encoding='utf-8')
    def number(pattern,text):return float(re.search(pattern,text).group(1))
    anchor=re.search(r'aNumImage\("pnum",param1,this.x - (\d+),this.y - (\d+),(\d+)\)',h)
    delay=number(r'"delay":([\d.]+)',a);fade=number(r'TweenMax.to\(this,([\d.]+),',a)
    body=q[q.index('public function addHpLose'):q.index('public function addMonsterHurt')]
    assert 'queue.length' not in body and '"pnum"' in body
    return dict(digitStride=int(anchor[3]),anchorOffset=dict(x=-int(anchor[1]),y=-int(anchor[2])),
        popScale=number(r'this.scaleX = ([\d.]+)',a),popSeconds=number(r'this._tween = TweenMax.to\(this,([\d.]+)',a),
        delaySeconds=delay,risePixels=number(r'"y":this.y - ([\d.]+)',a),fadeSeconds=fade,destroySeconds=delay+fade,
        ease=re.search(r'"ease":([\w.]+)',a)[1],queueIntervalTicks=int(number(r'else\s*\{\s*this.showIntervalCount = (\d+)',q)),
        queueBurstThreshold=int(number(r'queue.length > (\d+)',q)),
        queueBurstOffsets=[[int(x),int(y)] for x,y in re.findall(r'showSingleCure\((-?\d+),(-?\d+)\)',q)],
        queueStageExcluded=int(number(r'curStage != (\d+)',body)),queueHpLoseCapacity=None)
def extract():
    raw=SWF.read_bytes()
    body=zlib.decompress(raw[8:]) if raw[:3]==b'CWS' else raw[8:]
    nbits=body[0]>>3;pos=(5+4*nbits+7)//8+4
    symbols={};bitmaps={}
    while pos<len(body):
        header=struct.unpack_from('<H',body,pos)[0];pos+=2
        tag,size=header>>6,header&63
        if size==63:size=struct.unpack_from('<I',body,pos)[0];pos+=4
        data=body[pos:pos+size];pos+=size
        if tag==76:
            p=2
            for _ in range(struct.unpack_from('<H',data)[0]):
                cid=struct.unpack_from('<H',data,p)[0];p+=2
                end=data.index(0,p);symbols[data[p:end].decode()]=cid;p=end+1
        if tag==36:
            cid,fmt,w,h=struct.unpack_from('<HBHH',data)
            if fmt==5:bitmaps[cid]=dict(format=fmt,width=w,height=h,rgba=zlib.decompress(data[7:]))
        if tag==0:break
    result=[]
    for d in range(10):
        name=f'pnum{d}';cid=symbols[name];b=bitmaps[cid]
        assert b['format']==5
        result.append(dict(digit=d,symbolClass=name,characterId=cid,width=b['width'],height=b['height'],
                           locator=f'SymbolClass {name}; DefineBitsLossless2 characterID={cid}',raw=b['rgba']))
    return result
