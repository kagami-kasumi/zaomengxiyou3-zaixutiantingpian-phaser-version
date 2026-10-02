"""245B source-native bitmap resource decoder. Only writes task output; no legacy writes."""
from pathlib import Path
import hashlib,time
source=Path("local-resources/regima/source/restored-swfs/assets/pet1.swf")
assert hashlib.sha256(source.read_bytes()).hexdigest()=="0699a5d3a49ea8024d3635b18c6349f5d7f7cf5f1db869dd18a0a5ee6de60644"
p=Path('local-resources/regima/task-outputs/TASK-SLICE-245B/bitmaps');p.mkdir(parents=True,exist_ok=True)
code='''package {import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class Extract extends Sprite {
private var rows:Array=[],serial:int=0;
public function Extract(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);NativeApplication.nativeApplication.exit(1);});var loader:Loader=new Loader();loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{run();});var fs:FileStream=new FileStream();fs.open(new File('SOURCE'),FileMode.READ);var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();var ctx:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);ctx.allowCodeImport=true;loader.loadBytes(bytes,ctx);}
private var tasks:Array=[],current:MovieClip,currentId:String;
private function run():void{stage.frameRate=60;for each(var name:String in ['buff_sxkb','buff_fsnl','buff_smjc','buff_mfjc','buff_gjjc','buff_fyjc']){var cls:Class=ApplicationDomain.currentDomain.getDefinition(name) as Class;var mc:MovieClip=new cls();var pet:Boolean=name=='buff_sxkb'||name=='buff_fsnl';for(var f:int=1;f<=(pet?1:mc.totalFrames);f++)for(var n:int=1;n<=(pet?6:1);n++)tasks.push({name:name,frame:f,nested:n});}next();}
private function next():void{if(tasks.length==0){var fs:FileStream=new FileStream();fs.open(new File(File.applicationDirectory.nativePath).resolvePath('bitmaps.json'),FileMode.WRITE);fs.writeUTFBytes(JSON.stringify(rows));fs.close();trace('COMPLETE '+rows.length);NativeApplication.nativeApplication.exit(0);return;}var t:Object=tasks.shift();var cls:Class=ApplicationDomain.currentDomain.getDefinition(t.name) as Class;current=new cls();addChild(current);current.gotoAndStop(t.frame);if(t.name=='buff_sxkb'||t.name=='buff_fsnl')MovieClip(current.getChildAt(0)).gotoAndStop(t.nested);currentId=t.name+':'+t.frame+':'+t.nested;stage.addEventListener(Event.EXIT_FRAME,finish);}
private function finish(e:Event):void{stage.removeEventListener(Event.EXIT_FRAME,finish);capture(current,currentId);removeChild(current);setTimeout(next,1);}
private function capture(c:DisplayObject,id:String):void{if(c is Shape){var shape:Shape=c as Shape;for each(var g:IGraphicsData in shape.graphics.readGraphicsData()){if(g is GraphicsBitmapFill){var b:GraphicsBitmapFill=g as GraphicsBitmapFill;var file:String='bitmap-'+serial+++'.png';var fs:FileStream=new FileStream();fs.open(new File(File.applicationDirectory.nativePath).resolvePath(file),FileMode.WRITE);fs.writeBytes(b.bitmapData.encode(b.bitmapData.rect,new PNGEncoderOptions(true)));fs.close();rows.push({id:id,path:file,matrix:{a:b.matrix.a,b:b.matrix.b,c:b.matrix.c,d:b.matrix.d,tx:b.matrix.tx,ty:b.matrix.ty},repeat:b.repeat,smooth:b.smooth,width:b.bitmapData.width,height:b.bitmapData.height});}}}else if(c is DisplayObjectContainer){var o:DisplayObjectContainer=c as DisplayObjectContainer;for(var i:int=0;i<o.numChildren;i++)capture(o.getChildAt(i),id+'/'+i);}}
}}'''
code=code.replace('SOURCE',str(Path('local-resources/regima/source/restored-swfs/assets/pet1.swf').resolve()).replace('\\','/'))
(p/'Extract.as').write_text(code,encoding='utf-8')
(p/'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task245b.extract</id><versionNumber>1.0.0</versionNumber><filename>Extract</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>Extract.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
import subprocess
sdk=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4');r=subprocess.run(['java','-Dflexlib='+str(sdk/'frameworks'),'-jar',str(sdk/'lib/mxmlc-cli.jar'),'+configname=air','-output=Extract.swf','Extract.as'],cwd=p,capture_output=True);(p/'compile.log').write_bytes(r.stdout+r.stderr);assert r.returncode==0, 'See compile.log'
started=time.time_ns()
r=subprocess.run([str(sdk/'bin/adl.exe'),'-runtime',str(Path('local-resources/regima/source/unpacked').resolve()),'-profile','desktop',str((p/'application.xml').resolve()),str(p.resolve())],capture_output=True,timeout=55);(p/'runtime.log').write_bytes(r.stdout+r.stderr);assert r.returncode==0, 'See runtime.log'

import json
assert (p/'bitmaps.json').stat().st_mtime_ns >= started, 'Missing fresh completed extraction'
rows=json.loads((p/'bitmaps.json').read_text(encoding='utf-8'));assert len(rows)==73
print('Native bitmap extraction:',len(rows),'observations')
