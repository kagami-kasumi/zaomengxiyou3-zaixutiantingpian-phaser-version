"""Isolate AIR color-bounds behavior without source movies or geometry assumptions."""
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/color-bounds-air'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK.mkdir(parents=True, exist_ok=True)
(WORK/'Probe.as').write_text('''package {
import flash.display.*;import flash.desktop.NativeApplication;
public class Probe extends Sprite {public function Probe(){
for(var w:int=1;w<=4;w++)for(var h:int=1;h<=4;h++)for(var x:int=0;x<w;x++)for(var y:int=0;y<h;y++){
var b:BitmapData=new BitmapData(w,h,false,0);b.setPixel(x,y,0x00ffff);
trace("CASE "+JSON.stringify({w:w,h:h,x:x,y:y,pixel:b.getPixel32(x,y),bounds:b.getColorBoundsRect(4294967295,4278255615).toString()}));b.dispose();
}
var cases:int=0,failures:int=0;
for(w=1;w<=4;w++)for(h=1;h<=4;h++)for(var mask:uint=0;mask<(1<<(w*h));mask++){
b=new BitmapData(w,h,false,0);for(var i:int=0;i<w*h;i++)if(mask&(1<<i))b.setPixel(i%w,int(i/w),0x00ffff);
var hit:Boolean=b.getColorBoundsRect(4294967295,4278255615).width!=0;
if(hit!=((mask&0xfffffffe)!=0))failures++;cases++;b.dispose();
}trace("SUMMARY "+JSON.stringify({cases:cases,failures:failures}));
NativeApplication.nativeApplication.exit(0);}}}''')
(WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task228.colorbounds</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename>
<supportedProfiles>desktop</supportedProfiles><initialWindow><content>Probe.swf</content><visible>false</visible>
<width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>''')
compile_result = subprocess.run(['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),
                                '+configname=air','-debug=true','-output=Probe.swf','Probe.as'],cwd=WORK,capture_output=True)
assert compile_result.returncode == 0, compile_result.stderr
result = subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),
                         '-profile','desktop','application.xml'],cwd=WORK,capture_output=True,timeout=30)
assert result.returncode == 0, result.stderr
rows = [json.loads(line[5:]) for line in (result.stdout+result.stderr).decode(errors='replace').splitlines() if line.startswith('CASE ')]
assert len(rows) == 100
(WORK/'measurement.json').write_text(json.dumps(rows,indent=2)+'\n')
summary = [json.loads(line[8:]) for line in (result.stdout+result.stderr).decode(errors='replace').splitlines() if line.startswith('SUMMARY ')]
assert len(summary) == 1 and summary[0]['failures'] == 0, summary
(WORK/'verification.json').write_text(json.dumps(dict(singlePixelCases=len(rows), exhaustive=summary[0],
    scope='Exact-cyan width!=0 boolean in this original AIR runtime; the first pixel alone is omitted.'),indent=2)+'\n')
print(summary)
