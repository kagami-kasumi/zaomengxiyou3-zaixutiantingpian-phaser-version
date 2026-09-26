"""Original HP/miss creation and tween methods versus source-decoded bitmap/vector inputs."""
import hashlib
import json
import runpy
import shutil
import struct
import subprocess
import zlib
from pathlib import Path
from generate import method
from ui_truth import ROOT,BASE,OUT,sha,read

WORK=BASE/'inherited-display-air';SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def bounds(source,cid):
    if str(cid) in source['shapes']:
        b=source['shapes'][str(cid)]['boundsTwips'];return [b['Xmin']/20,b['Ymin']/20,b['Xmax']/20,b['Ymax']/20]
    points=[]
    for p in source['timelines'][str(cid)][0]:
        b=bounds(source,p['characterId']);m=p['matrix']
        points += [(m['a']*x+m['c']*y+m['tx'],m['b']*x+m['d']*y+m['ty']) for x in [b[0],b[2]] for y in [b[1],b[3]]]
    return [min(x for x,y in points),min(y for x,y in points),max(x for x,y in points),max(y for x,y in points)]


def main():
    WORK.mkdir(parents=True,exist_ok=True);src=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts';records=[]
    def take(rel,name):
        path=src/rel;text=path.read_text(encoding='utf-8');code=method(text,name)
        records.append(dict(path=path.relative_to(ROOT).as_posix(),method=name,startLine=text[:text.index(code)].count('\n')+1,fileSha256=sha(path),sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        return code
    methods='\n'.join(take('base/BasePet.as',n) for n in ['newHpSlip','drawPetHp','showHpSlip','addMissMc'])
    (WORK/'InheritedPet.as').write_text('''package {import flash.display.*;public class InheritedPet extends Sprite {
public var hpSlip:Sprite,colipse:DisplayObject,gc:Object,_petInfo:Object,direction:int;
public function getBBDC():Object{return {getDirect:function():int{return direction;}};}
public function makeHp():void{newHpSlip();}public function paintHp():void{drawPetHp();}public function showHp():void{showHpSlip();}public function miss():void{addMissMc();}
'''+methods+'}}')
    (WORK/'AUtils.as').write_text('package {import flash.display.*;import flash.utils.*;public class AUtils {'+take('AUtils.as','getImageObj')+'}}')
    ease=take('com/greensock/TweenLite.as','easeOut')
    (WORK/'TweenMax.as').write_text('''package {public class TweenMax {public static var jobs:Array=[];
public static function to(target:*,seconds:Number,params:Object):void{jobs.push({target:target,seconds:seconds,params:params,x:target.x,y:target.y,alpha:target.alpha,done:false});}
public static function advance(time:Number):void{for each(var job:Object in jobs){if(job.done)continue;var r:Number=easeOut(Math.min(time,job.seconds),0,1,job.seconds);for each(var key:String in ["x","y","alpha"]){if(job.params.hasOwnProperty(key))job.target[key]=job[key]+(job.params[key]-job[key])*r;}if(time>=job.seconds){job.done=true;if(job.params.onComplete!=null)job.params.onComplete.apply(null,job.params.onCompleteParams||[]);}}}
'''+ease+'}}')
    tags=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))['source_tags']
    source=ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf';other=source.with_name('OtherMat1.swf')
    code,raw=tags(source)[8];assert code==36 and raw[2]==5 and raw[2:]==tags(other)[71][1][2:]
    width,height=struct.unpack_from('<HH',raw,3);premul=zlib.decompress(raw[7:]);pixels=bytearray(len(premul))
    for i in range(0,len(premul),4):
        a=premul[i];pixels[i:i+4]=bytes([a]+[min(255,(premul[i+j]*255+a//2)//a) if a else 0 for j in [1,2,3]])
    bitmap=WORK/'miss.argb';bitmap.write_bytes(pixels)
    geometry=next(s for s in read(OUT/'geometry-inputs.json')['sources'] if s['id']=='StageCommon')
    cases=[]
    for owner in [1,2]:
        for collider in ['ObjectBaseSprite3','ObjectBaseSprite4']:
            local=bounds(geometry,geometry['roots'][collider]);height_expected=round((local[3]-local[1])*20)/20
            for direction in [0,1]:
                for hp in [-1,0,50,100,120]:
                    ratio=max(0,hp/100);fill_width=50*ratio
                    cases.append(dict(id=f'hp-P{owner}-{collider}-{direction}-{hp}',kind='hp',owner=owner,collider=collider,direction=direction,hp=hp,x=300 if owner==1 else 640,y=350,
                                      colipseHeight=height_expected,expectedY=-height_expected/2-10,fillX=0 if direction==0 else 50-fill_width,fillWidth=fill_width))
        cases.append(dict(id=f'miss-P{owner}',kind='miss',owner=owner,collider='ObjectBaseSprite3',direction=0,hp=100,x=300 if owner==1 else 640,y=350))
    samples=[dict(time=t,progress=1-(1-t/2)**2,alpha=(1-t/2)**2) for t in [0,.5,1,1.5,2]]
    fixture=dict(source=str(source),bitmap=dict(path=str(bitmap),width=width,height=height),cases=cases,samples=samples)
    (WORK/'inputs.json').write_text(json.dumps(fixture,indent=2)+'\n')
    probe=ROOT/'tools/monkey-spatial/InheritedDisplayProbe.as';shutil.copyfile(probe,WORK/probe.name);shutil.copyfile(ROOT/'tools/monkey-spatial/NativeTree.as',WORK/'NativeTree.as')
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task228.inheriteddisplay</id><versionNumber>1.0.0</versionNumber><filename>InheritedDisplayProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>InheritedDisplayProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=InheritedDisplayProbe.swf','InheritedDisplayProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60);(WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    result=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)],cwd=WORK,capture_output=True,timeout=90)
    output=(result.stdout+result.stderr).decode(errors='replace');(WORK/'output.log').write_text(output)
    assert result.returncode==0 and 'COMPLETE' in output,output[-1600:]
    rows=read(WORK/'rows.json')
    for row in rows:row['sha256']=sha(WORK/row['path'])
    data=dict(rows=rows,fixtures=fixture,methods=records,probeSha256=sha(probe),sourceSha256=sha(source),otherSourceSha256=sha(other),missPixelPayloadSha256=hashlib.sha256(raw[2:]).hexdigest(),
              compiledSwfSha256=sha(WORK/'InheritedDisplayProbe.swf'),scope='Original four BasePet display methods and source default easeOut on a manual tween clock; independent source bitmap and vector input comparison. Not full TweenMax scheduler, game damage or HUD consumer acceptance.')
    (WORK/'measurement.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
    print('228 inherited display:',len(rows),'states;',sum(r['differentPixels']>0 for r in rows),'pixel mismatches')


if __name__=='__main__':main()
