"""Original inherited hit callback/filter/protection methods on real ENTER_FRAME timelines."""
import json
import hashlib
import shutil
import subprocess
import sys
from pathlib import Path
from generate import method
from ui_truth import ROOT,BASE,OUT,read,sha

SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def main():
    fps=int(sys.argv[1]) if len(sys.argv)>1 else 24
    work=BASE/f'hurt-natural-air/{fps}';work.mkdir(parents=True,exist_ok=True)
    original=ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
    records=[]
    def take(rel,name):
        path=original/rel;text=path.read_text(encoding='utf-8');code=method(text,name)
        records.append(dict(path=path.relative_to(ROOT).as_posix(),method=name,startLine=text[:text.index(code)].count('\n')+1,fileSha256=sha(path),sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        return code
    for name in ['Config','Effect','BaseHero','Role1','Role2','Role3','Role4']:
        shutil.copyfile(BASE/f'glow-air/{name}.as',work/f'{name}.as')
    pet=(BASE/'glow-air/BasePet.as').read_text().replace('import flash.display.*;','import flash.display.*;import flash.filters.*;')
    marker='public class BasePet extends Sprite {'
    insert='public var curAddEffect:Effect,colipse:Object;public function invoke():void{addBeAttackEffect(null);}'+take('base/BasePet.as','addBeAttackEffect').replace('override ','',1)
    assert marker in pet;(work/'BasePet.as').write_text(pet.replace(marker,marker+insert))
    (work/'BaseObject.as').write_text('package {public class BaseObject {}}')
    (work/'AUtils.as').write_text('package {import flash.utils.*;public class AUtils {'+take('AUtils.as','getNewObj')+'}}')
    cm=original/'my/ColorMatrix.as';(work/'ColorMatrix.as').write_text(cm.read_text(encoding='utf-8').replace('package my','package',1))
    records.append(dict(path=cm.relative_to(ROOT).as_posix(),method='whole-class',fileSha256=sha(cm)))
    probe=ROOT/'tools/monkey-spatial/HurtNaturalProbe.as';shutil.copyfile(probe,work/probe.name)
    shutil.copyfile(ROOT/'tools/monkey-spatial/NativeTree.as',work/'NativeTree.as')
    source=ROOT/'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'
    if fps==20:
        export=['C:/Program Files (x86)/FFDec/ffdec-cli.exe','-selectclass','HeroBeHurt','-export','script',str(BASE/'hurt-source'),str(source)]
        result=subprocess.run(export,capture_output=True,timeout=60)
        assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    (work/'inputs.json').write_text(json.dumps(dict(fps=fps,source=str(source))))
    app=f'''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task228.hurtnatural{fps}</id><versionNumber>1.0.0</versionNumber><filename>HurtNaturalProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>HurtNaturalProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>'''
    (work/'application.xml').write_text(app)
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=HurtNaturalProbe.swf','HurtNaturalProbe.as']
    result=subprocess.run(args,cwd=work,capture_output=True,timeout=60);(work/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    result=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(work/'application.xml'),str(work)],cwd=work,capture_output=True,timeout=90)
    output=(result.stdout+result.stderr).decode(errors='replace');(work/'output.log').write_text(output)
    assert result.returncode==0 and 'COMPLETE' in output,output[-2000:]
    data=read(work/'rows.json');assert len(data['rows'])==228
    for row in data['rows']:
        if 'path' in row:row['sha256']=sha(work/row['path'])
    data.update(methods=records,sourceSha256=sha(source),probeSha256=sha(probe),compiledSwfSha256=sha(work/'HurtNaturalProbe.swf'),
                protectionMeasurementSha256=sha(BASE/'glow-air/measurement.json'),scope='Real native ENTER_FRAME, original addBeAttackEffect/ColorMatrix/updateFather. Parent detachment only; original destroy is a separate source fixture. No complete damage engine claim.')
    (work/'measurement.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
    print('228 natural hurt:',fps,'fps;',len(data['rows']),'states')


if __name__=='__main__':main()
