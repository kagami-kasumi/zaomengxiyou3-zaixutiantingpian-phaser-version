"""215: run unchanged ANumber/CureHpQueue/Greensock with restored bitmap definitions."""
import hashlib
import json
import shutil
import subprocess
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
WORK = ROOT/'local-resources/regima/task-outputs/task-settings-215/air'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-215/native'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
    WORK.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
    behaviorPath=OUT.parent/'behavior-fixtures.json'
    behavior=json.loads(behaviorPath.read_text(encoding='utf-8'))
    display=[]
    for case in behavior['fixtures']:
        expected=case['expected'];values=expected.get('pnumValues')
        if isinstance(values,list):numbers=[dict(value=v,kind='pet' if case['id'].startswith(('pet-','remote-pet-')) else 'hero') for v in values]
        elif case['id']=='hero-petturtle-transfer':numbers=[dict(value=expected['petDamage'],kind='pet'),dict(value=expected['heroDamageAfterTransfer'],kind='hero')]
        else:continue
        display.append(dict(id=case['id'],numbers=numbers))
    (WORK/'behavior-display.json').write_text(json.dumps(display),encoding='utf-8')
    sources={}
    for folder in ['com/greensock','my','manager','config']:(WORK/folder).mkdir(parents=True,exist_ok=True)
    for p in (SRC/'com/greensock').rglob('*.as'):
        dest=WORK/p.relative_to(SRC);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,dest)
        sources[p.relative_to(ROOT).as_posix()]=sha(p)
    for name in ['my/ANumber.as','my/CureHpQueue.as','manager/ANumberManager.as']:
        shutil.copyfile(SRC/name,WORK/name);sources[(SRC/name).relative_to(ROOT).as_posix()]=sha(SRC/name)
    hero=(SRC/'base/BaseHero.as').read_text(encoding='utf-8')
    role3=(SRC/'export/hero/Role3.as').read_text(encoding='utf-8')
    turtle=re.search(r'param1 \*= 0\.95;\s*param1 = Math.ceil\(param1\);',hero)[0]
    role3Slice=re.search(r'param1 /= 2;',role3)[0]
    (WORK/'NumericSlices.as').write_text('package {public class NumericSlices {'+
        'public static function turtle(param1:int):int {'+turtle+'return param1;}'+
        'public static function role3(param1:int):int {'+role3Slice+'return param1;}}}')
    for name in ['base/BaseHero.as','export/hero/Role3.as']:
        sources[(SRC/name).relative_to(ROOT).as_posix()]=sha(SRC/name)
    # Only external service lookup is adapted; source number/queue/tween code is byte-identical.
    (WORK/'AUtils.as').write_text('''package {import flash.display.*;import flash.system.*;
public class AUtils {public static var domain:ApplicationDomain;
public static function getImageObj(name:*):* {var cls:Class=domain.getDefinition(name) as Class;return new Bitmap(new cls());}
public static function getNewObj(name:*):* {var cls:Class=domain.getDefinition(name) as Class;return new cls();}}}''')
    (WORK/'config/Config.as').write_text('''package config {import flash.display.Sprite;public class Config {
private static var instance:Config;public var curStage:int=1;public var gameSence:Sprite;
public static function getInstance():Config {if(!instance)instance=new Config();return instance;}}}''')
    swf=ROOT/'local-resources/regima/source/restored-swfs/assets/OtherMat1.swf'
    shutil.copyfile(swf,WORK/'OtherMat1.swf');sources[swf.relative_to(ROOT).as_posix()]=sha(swf)
    probe=ROOT/'tools/incoming-number/IncomingProbe.as';shutil.copyfile(probe,WORK/probe.name)
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task215.probe</id><versionNumber>1.0.0</versionNumber><filename>IncomingProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>IncomingProbe.swf</content><visible>false</visible><width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>''')
    compile=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-default-frame-rate=24','-default-size=940,590','-output=IncomingProbe.swf','IncomingProbe.as']
    result=subprocess.run(compile,cwd=WORK,capture_output=True,timeout=60)
    (OUT/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    runtime=ROOT/'local-resources/regima/source/unpacked'
    cmd=[str(SDK/'bin/adl.exe'),'-runtime',str(runtime),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    result=subprocess.run(cmd,cwd=WORK,capture_output=True,timeout=60)
    (OUT/'stdout.log').write_bytes(result.stdout);(OUT/'stderr.log').write_bytes(result.stderr)
    lines=(result.stdout+b'\n'+result.stderr).decode(errors='replace').splitlines()
    assert result.returncode==0 and 'COMPLETE' in lines,'\n'.join(lines[-20:])
    states=[json.loads(s[6:]) for s in lines if s.startswith('STATE ')]
    assert len(states)==53+len(display)*2,len(states)
    shutil.copytree(WORK/'images',OUT/'images',dirs_exist_ok=True)
    report=dict(sources=sources,probeSha256=sha(probe),compileCommand=compile,command=cmd,exitCode=result.returncode,
                runtimeSha256=sha(runtime/'Adobe AIR/Versions/1.0/Adobe AIR.dll'),
                environment=[json.loads(s[4:]) for s in lines if s.startswith('ENV ')],
                glyphs=[json.loads(s[6:]) for s in lines if s.startswith('GLYPH ')],states=states,
                numeric=[json.loads(s[8:]) for s in lines if s.startswith('NUMERIC ')],
                behaviorFixtureSha256=sha(behaviorPath),behaviorDisplay=display,
                imageHashes={p.name:sha(p) for p in sorted((OUT/'images').glob('*.png'))})
    (OUT/'measurement.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(f'215 native: {len(states)} states, 10 glyphs; source ANumber/queue/tweens unchanged')
if __name__=='__main__':main()
