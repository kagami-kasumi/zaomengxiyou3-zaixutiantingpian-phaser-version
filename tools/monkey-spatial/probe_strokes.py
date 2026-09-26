"""Inspect native graphics records for the two bounded source stroke shapes."""
import json
import runpy
import struct
import subprocess
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228/strokes-air'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
WORK.mkdir(parents=True,exist_ok=True)
h=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))
source=ROOT/'local-resources/regima/source/restored-swfs/assets/20120203.swf'
tags=h['source_tags'](source)
chunks=[h['tag'](69,struct.pack('<I',8))]+[h['tag'](*tags[c]) for c in [131,202]]
chunks += [h['place'](c,i+1,dict(tx=0,ty=0),transformed=False) for i,c in enumerate([131,202])]
chunks += [h['tag'](1,b''),h['tag'](0,b'')]
body=h['rectangle'](200,200)+struct.pack('<HH',24*256,1)+b''.join(chunks)
(WORK/'source.swf').write_bytes(b'FWS'+bytes([10])+struct.pack('<I',8+len(body))+body)
(WORK/'Probe.as').write_text('''package {import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class Probe extends Sprite {public function Probe(){
loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
var l:Loader=new Loader();l.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{
var root:DisplayObjectContainer=l.content as DisplayObjectContainer;
for(var i:int=0;i<root.numChildren;i++){var shape:Shape=root.getChildAt(i) as Shape,records:Array=[];
for each(var data:IGraphicsData in shape.graphics.readGraphicsData()){
var o:Object={type:getQualifiedClassName(data)};
if(data is GraphicsPath){var p:GraphicsPath=data as GraphicsPath;o.commands=p.commands;o.data=p.data;o.winding=p.winding;}
if(data is GraphicsSolidFill){var f:GraphicsSolidFill=data as GraphicsSolidFill;o.color=f.color;o.alpha=f.alpha;}
if(data is GraphicsStroke){var s:GraphicsStroke=data as GraphicsStroke;o.thickness=s.thickness;o.pixelHinting=s.pixelHinting;o.caps=s.caps;o.joints=s.joints;o.scaleMode=s.scaleMode;}
records.push(o);}trace("SHAPE "+JSON.stringify({index:i,records:records}));}
trace("COMPLETE");NativeApplication.nativeApplication.exit(0);});
var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("source.swf"),FileMode.READ);var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();var context:LoaderContext=new LoaderContext();context.allowCodeImport=true;l.loadBytes(bytes,context);
}}}''')
(WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task228.strokes</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>Probe.swf</content><visible>false</visible><width>200</width><height>200</height></initialWindow></application>''')
result=subprocess.run(['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=Probe.swf','Probe.as'],cwd=WORK,capture_output=True,timeout=60)
assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
result=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),str(WORK/'application.xml'),str(WORK)],cwd=WORK,capture_output=True,timeout=30)
output=(result.stdout+result.stderr).decode(errors='replace');(WORK/'output.log').write_text(output)
assert result.returncode==0 and 'COMPLETE' in output,output[-2000:]
rows=[json.loads(line[6:]) for line in output.splitlines() if line.startswith('SHAPE ')]
(WORK/'measurement.json').write_text(json.dumps(rows,indent=2)+'\n')
print([(r['index'],[v for v in r['records'] if v['type'].endswith('GraphicsStroke')]) for r in rows])
