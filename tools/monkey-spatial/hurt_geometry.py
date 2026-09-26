"""Separate source decode and reconstruction of the inherited hurt MovieClip."""
import hashlib
import io
import json
import runpy
import shutil
import struct
import subprocess
import xml.etree.ElementTree as ET
import zlib
from pathlib import Path
from PIL import Image,ImageChops
from geometry_inputs import shape
from run_geometry import phase_only
from verify_hurt_natural import expected_filter
from ui_truth import ROOT,BASE,OUT,read,sha
from generate import method

WORK=BASE/'hurt-geometry-air'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    original=ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'
    xml=BASE/'source/StageCommon.xml'
    helpers=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))
    traversal=runpy.run_path(str(ROOT/'tools/dragon23-collision-source.py'))
    tags=helpers['source_tags'](original)
    defs={int(n.get('shapeId') or n.get('spriteId') or n.get('characterID')):n for n in ET.parse(xml).getroot().find('tags') if n.get('shapeId') or n.get('spriteId') or n.get('characterID')}
    pending=[18];used=set()
    while pending:
        cid=pending.pop()
        if cid in used:continue
        used.add(cid)
        for node in defs[cid].iter():
            if node.get('type','').startswith('PlaceObject') and node.get('placeFlagHasCharacter')=='true':pending.append(int(node.get('characterId')))
            if node.get('bitmapId') and int(node.get('bitmapId')) not in [0,65535]:pending.append(int(node.get('bitmapId')))
    assert used==set(range(10,19))
    bitmaps={};shapes={};definitions={}
    for cid in sorted(used):
        code,raw=tags[cid];definitions[str(cid)]=dict(tagCode=code,tagSha256=hashlib.sha256(raw).hexdigest())
        if code in [2,22,32]:shapes[str(cid)]=shape(defs[cid],traversal['matrix']);continue
        if code==39:continue
        if code==35:
            offset=struct.unpack_from('<I',raw,2)[0]
            jpeg=Image.open(io.BytesIO(raw[6:6+offset])).convert('RGB');width,height=jpeg.size
            alpha=zlib.decompress(raw[6+offset:]);rgb=jpeg.tobytes();pixels=bytearray(width*height*4)
            for i,a in enumerate(alpha):pixels[i*4:i*4+4]=bytes([a]+[min(255,(v*255+a//2)//a) if a else 0 for v in rgb[i*3:i*3+3]])
            (WORK/f'bitmap-{cid}.jpg').write_bytes(raw[6:6+offset]);(WORK/f'bitmap-{cid}.alpha').write_bytes(alpha)
        else:
            assert code==36 and raw[2]==5
            width,height=struct.unpack_from('<HH',raw,3);premul=zlib.decompress(raw[7:]);pixels=bytearray(len(premul))
            for i in range(0,len(premul),4):
                a=premul[i];pixels[i:i+4]=bytes([a]+[min(255,(premul[i+j]*255+a//2)//a) if a else 0 for j in [1,2,3]])
        path=WORK/f'bitmap-{cid}.argb';path.write_bytes(pixels)
        bitmaps[str(cid)]=dict(width=width,height=height,argbPath=path.relative_to(ROOT).as_posix(),absolutePath=str(path),sha256=sha(path))
        if code==35:
            bitmaps[str(cid)].update(codec='jpeg3-premultiplied',jpegPath=str(WORK/f'bitmap-{cid}.jpg'),alphaPath=str(WORK/f'bitmap-{cid}.alpha'),
                                     jpegSha256=sha(WORK/f'bitmap-{cid}.jpg'),alphaSha256=sha(WORK/f'bitmap-{cid}.alpha'))
            bitmaps[str(cid)]['pillowDiagnosticArgbPath']=bitmaps[str(cid)].pop('argbPath')
            bitmaps[str(cid)]['pillowDiagnosticSha256']=bitmaps[str(cid)].pop('sha256')
            bitmaps[str(cid)].pop('absolutePath')
    source=dict(id='StageCommon',sourceSha256=sha(original),xmlSha256=sha(xml),roots={'HeroBeHurt':18},definitions=definitions,bitmaps=bitmaps,shapes=shapes,
                timelines=traversal['timelines']({cid:defs[cid] for cid in used},allow_clip_depth=True))
    states=[];references={}
    for fps in [20,24,30]:
        work=BASE/f'hurt-natural-air/{fps}'
        for row in read(work/'measurement.json')['rows']:
            if 'path' not in row:continue
            identity=f'{fps}-P{row["owner"]}-{row["tick"]}';original_path=work/row['path'];width,height=Image.open(original_path).size
            states.append(dict(id=identity,sourceIndex=0,cid=18,phase=phase_only(row['tree']),left=row['left'],top=row['top'],width=width,height=height))
            references[identity]=dict(path=str(original_path),sha256=row['sha256'],bounds=row['tree']['localBounds'])
    fixture=dict(sources=[source],states=states,vectorPath=str(BASE/'geometry-air/decoded-vectors.swf'),vectorSwap=False,suppressPending=False,hueMatrix=expected_filter())
    (WORK/'fixtures.json').write_text(json.dumps(fixture,separators=(',',':')))
    builder=ROOT/'tools/monkey-spatial/GeometryProbe.as';code=builder.read_text().replace('GeometryProbe','HurtGeometryProbe')
    code=code.replace('height:s.bitmaps[cid].height}', 'height:s.bitmaps[cid].height,jpegPath:s.bitmaps[cid].jpegPath,alphaPath:s.bitmaps[cid].alphaPath}')
    original_next=method(code,'next')
    jpeg_next='''private function next():void {
if(index==queue.length){nextVector();return;}
var item:Object=queue[index];
if(!item.jpegPath){var fs:FileStream=new FileStream();fs.open(new File(item.path),FileMode.READ);var b:ByteArray=new ByteArray();fs.readBytes(b);fs.close();var bitmap:BitmapData=new BitmapData(item.width,item.height,true,0);bitmap.setPixels(bitmap.rect,b);bitmaps[item.key]=bitmap;index++;next();return;}
var decoder:Loader=new Loader();
decoder.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void {
var rgb:BitmapData=Bitmap(decoder.content).bitmapData;var f:FileStream=new FileStream();f.open(new File(item.alphaPath),FileMode.READ);var alpha:ByteArray=new ByteArray();f.readBytes(alpha);f.close();
var output:BitmapData=new BitmapData(item.width,item.height,true,0);
for(var y:int=0;y<item.height;y++)for(var x:int=0;x<item.width;x++){
var a:uint=alpha.readUnsignedByte(),p:uint=rgb.getPixel(x,y),r:uint=(p>>16)&255,g:uint=(p>>8)&255,z:uint=p&255;
if(a){r=Math.min(255,Math.floor((r*255+Math.floor(a/2))/a));g=Math.min(255,Math.floor((g*255+Math.floor(a/2))/a));z=Math.min(255,Math.floor((z*255+Math.floor(a/2))/a));}else{r=0;g=0;z=0;}
output.setPixel32(x,y,(a<<24)|(r<<16)|(g<<8)|z);}
bitmaps[item.key]=output;decoder.unload();index++;next();});
var input:FileStream=new FileStream();input.open(new File(item.jpegPath),FileMode.READ);var jpeg:ByteArray=new ByteArray();input.readBytes(jpeg);input.close();decoder.loadBytes(jpeg);
}'''
    code=code.replace(original_next,jpeg_next)
    code=code.replace('bounds:{x:r.x,y:r.y,width:r.width,height:r.height}}','bounds:{x:r.x,y:r.y,width:r.width,height:r.height},tree:NativeTree.tree(object,object,"root")}')
    marker='addChild(object);var b:BitmapData='
    assert marker in code;code=code.replace(marker,'object.filters=[new ColorMatrixFilter(config.hueMatrix)];'+marker)
    probe=WORK/'HurtGeometryProbe.as';probe.write_text(code)
    shutil.copyfile(ROOT/'tools/monkey-spatial/NativeTree.as',WORK/'NativeTree.as')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task228.hurtgeometry</id><versionNumber>1.0.0</versionNumber><filename>HurtGeometryProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>HurtGeometryProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=HurtGeometryProbe.swf','HurtGeometryProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60);(WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    result=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)],cwd=WORK,capture_output=True,timeout=60)
    output=(result.stdout+result.stderr).decode(errors='replace');(WORK/'output.log').write_text(output)
    assert result.returncode==0 and 'COMPLETE' in output,output[-1600:]
    rows=[json.loads(line[6:]) for line in output.splitlines() if line.startswith('STATE ')]
    failures=[]
    for row in rows:
        reference=references[row['id']];assert sha(Path(reference['path']))==reference['sha256']
        a=Image.open(reference['path']).convert('RGBA');b=Image.open(WORK/row['path']).convert('RGBA');assert a.size==b.size
        pixels=ImageChops.difference(a,b).tobytes();count=sum(pixels[i:i+4]!=b'\0\0\0\0' for i in range(0,len(pixels),4))
        if count or row['bounds']!=reference['bounds']:failures.append(dict(id=row['id'],differentPixels=count,actualBounds=row['bounds'],nativeBounds=reference['bounds']))
    report=dict(status='failed' if failures else 'passed-bounded',states=len(rows),failures=failures,sourceSha256=sha(original),builderSha256=sha(builder),compiledSourceSha256=sha(probe),
                fixturesSha256=sha(WORK/'fixtures.json'),scope='Independently decoded four source bitmaps/shapes and eight-frame placements with independent hue matrix; full RGBA and bounds against native inherited callback at three frame rates.')
    (OUT/'hurt-geometry-verification.json').write_text(json.dumps(report,indent=2)+'\n')
    (OUT/'hurt-geometry-inputs.json').write_text(json.dumps(dict(source=source,states=states),separators=(',',':'))+'\n')
    (WORK/'measurement.json').write_text(json.dumps(dict(states=rows,reference=references,fixturesSha256=sha(WORK/'fixtures.json')),separators=(',',':'))+'\n')
    print('228 hurt geometry:',len(rows),'states;',len(failures),'differences',failures[:2])
    if failures:raise SystemExit(1)


if __name__=='__main__':main()
