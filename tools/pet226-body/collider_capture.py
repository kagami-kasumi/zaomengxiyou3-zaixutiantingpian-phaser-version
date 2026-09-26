"""Independent restored MovieClip collider bounds/tree/PNG capture at identity root."""
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SLICE-226/collider-air'
WORK.mkdir(parents=True, exist_ok=True)
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
SWF = ROOT / 'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'
probe = '''package {import flash.display.*;import flash.geom.*;import flash.events.*;
import flash.filesystem.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class ColliderProbe extends Sprite {
private var loader:Loader=new Loader();
public function ColliderProbe(){var f:FileStream=new FileStream();f.open(new File(SWF),FileMode.READ);
var b:ByteArray=new ByteArray();f.readBytes(b);f.close();loader.contentLoaderInfo.addEventListener(Event.COMPLETE,run);
var c:LoaderContext=new LoaderContext(false,new ApplicationDomain());c.allowCodeImport=true;loader.loadBytes(b,c);}
private function rect(r:Rectangle):Object{return {left:r.x,top:r.y,width:r.width,height:r.height};}
private function tree(item:DisplayObject,root:DisplayObject):Object{
var m:Matrix=item.transform.matrix;var children:Array=[];
if(item is DisplayObjectContainer){var c:DisplayObjectContainer=item as DisplayObjectContainer;
 for(var i:int=0;i<c.numChildren;i++)children.push(tree(c.getChildAt(i),root));}
return {type:getQualifiedClassName(item),name:item.name,visible:item.visible,alpha:item.alpha,
 matrix:{a:m.a,b:m.b,c:m.c,d:m.d,tx:m.tx,ty:m.ty},
 localBounds:rect(item.getBounds(item)),rootBounds:rect(item.getBounds(root)),children:children};}
private function run(e:Event):void{
for each(var symbol:String in ['ObjectBaseSprite3','ObjectBaseSprite4','ObjectBaseSprite']){
var cls:Class=loader.contentLoaderInfo.applicationDomain.getDefinition(symbol) as Class;
var root:DisplayObject=new cls();addChild(root);var b:Rectangle=root.getBounds(root);
var left:int=Math.floor(b.left)-2,top:int=Math.floor(b.top)-2;
var w:int=Math.ceil(b.right)-left+2,h:int=Math.ceil(b.bottom)-top+2;
var image:BitmapData=new BitmapData(w,h,true,0);image.draw(root,new Matrix(1,0,0,1,-left,-top));
var f:FileStream=new FileStream();f.open(new File(File.applicationDirectory.nativePath).resolvePath(symbol+'.png'),FileMode.WRITE);
f.writeBytes(image.encode(image.rect,new PNGEncoderOptions()));f.close();image.dispose();
trace('COLLIDER '+JSON.stringify({symbol:symbol,width:root.width,height:root.height,bounds:rect(b),
 crop:{left:left,top:top,width:w,height:h},tree:tree(root,root)}));removeChild(root);
}trace('COMPLETE');NativeApplication.nativeApplication.exit();}}}'''.replace('SWF', json.dumps(str(SWF)))
(WORK / 'ColliderProbe.as').write_text(probe, encoding='utf-8')
(WORK / 'application.xml').write_text('<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task226.collider</id><versionNumber>1.0.0</versionNumber><filename>ColliderProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>ColliderProbe.swf</content><visible>false</visible><width>320</width><height>320</height></initialWindow></application>')
compile_command = ['java', '-Dflexlib=' + str(SDK / 'frameworks'), '-jar', str(SDK / 'lib/mxmlc-cli.jar'),
                   '+configname=air', '-debug=true', '-output=ColliderProbe.swf', 'ColliderProbe.as']
result = subprocess.run(compile_command, cwd=WORK, capture_output=True, timeout=60)
assert result.returncode == 0, (result.stdout + result.stderr).decode(errors='replace')
command = [str(SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'),
           '-profile', 'desktop', str(WORK / 'application.xml'), str(WORK)]
try:
    result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=60)
except subprocess.TimeoutExpired as error:
    print(((error.stdout or b'') + (error.stderr or b'')).decode(errors='replace'), flush=True)
    raise
output = (result.stdout + result.stderr).decode(errors='replace')
rows = [json.loads(line[9:]) for line in output.splitlines() if line.startswith('COLLIDER ')]
assert result.returncode == 0 and len(rows) == 3 and 'COMPLETE' in output, output[-2000:]
for row in rows:
    path = WORK / (row['symbol'] + '.png')
    row['png'] = dict(path=path.relative_to(ROOT).as_posix(), sha256=hashlib.sha256(path.read_bytes()).hexdigest())
report = dict(status='observed-native', source=dict(path=SWF.relative_to(ROOT).as_posix(),
              sha256=hashlib.sha256(SWF.read_bytes()).hexdigest()), scope=__doc__, rows=rows,
              compileCommand=compile_command, command=command,
              probeSha256=hashlib.sha256((WORK / 'ColliderProbe.as').read_bytes()).hexdigest())
(ROOT / 'docs/tasks/evidence/TASK-SLICE-226/collider-native.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print('Three restored native colliders captured with complete trees, registered bounds and PNG baselines.')
