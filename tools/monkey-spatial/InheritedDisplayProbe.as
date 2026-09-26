package {
import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;import flash.geom.*;import flash.desktop.NativeApplication;
public class InheritedDisplayProbe extends Sprite {
private var config:Object,loader:Loader=new Loader(),rows:Array=[],bitmap:BitmapData;
public function InheritedDisplayProbe(){
loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
var f:FileStream=new FileStream();f.open(File.applicationDirectory.resolvePath("inputs.json"),FileMode.READ);config=JSON.parse(f.readUTFBytes(f.bytesAvailable));f.close();
bitmap=new BitmapData(config.bitmap.width,config.bitmap.height,true,0);f.open(new File(config.bitmap.path),FileMode.READ);var pixels:ByteArray=new ByteArray();f.readBytes(pixels);f.close();bitmap.setPixels(bitmap.rect,pixels);
loader.contentLoaderInfo.addEventListener(Event.COMPLETE,ready);f.open(new File(config.source),FileMode.READ);var bytes:ByteArray=new ByteArray();f.readBytes(bytes);f.close();var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;loader.loadBytes(bytes,context);
}
private function ready(e:Event):void {
loader.unload();stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
for each(var input:Object in config.cases){
TweenMax.jobs=[];var p:InheritedPet=new InheritedPet(),world:Sprite=new Sprite();addChild(world);world.addChild(p);p.gc={gameSence:world};p.x=input.x;p.y=input.y;p.direction=input.direction;
var collider:Class=getDefinitionByName(input.collider) as Class;p.colipse=new collider();p._petInfo={getHp:function():Number{return input.hp;},getSHp:function():Number{return 100;}};
var expectedWorld:Sprite=new Sprite(),expectedPet:Sprite=new Sprite();expectedWorld.addChild(expectedPet);expectedPet.x=p.x;expectedPet.y=p.y;
var expected:DisplayObject;
if(input.kind=="hp"){
p.makeHp();p.paintHp();p.showHp();var bar:Sprite=new Sprite();expectedPet.addChild(bar);expected=bar;bar.x=-23;bar.y=input.expectedY;
if(input.hp>=0){bar.graphics.lineStyle(1.2,0);bar.graphics.drawRect(0,5,50,5);bar.graphics.beginFill(0xff0000);bar.graphics.drawRect(input.fillX,5,input.fillWidth,5);bar.graphics.endFill();}
}else {p.miss();expected=new Bitmap(bitmap);expectedWorld.addChild(expected);expected.x=input.x-20;}
for each(var sample:Object in config.samples){TweenMax.advance(sample.time);expected.alpha=sample.alpha;expected.visible=sample.time<2;
if(input.kind=="miss")expected.y=input.y-60-60*sample.progress;
var actual:DisplayObject=input.kind=="hp"?p.hpSlip:world.numChildren>1?world.getChildAt(1):null;
var a:BitmapData=render(world,input),b:BitmapData=render(expectedWorld,input),diff:int=0;
var av:Vector.<uint>=a.getVector(a.rect),bv:Vector.<uint>=b.getVector(b.rect);for(var i:int=0;i<av.length;i++)if(av[i]!=bv[i])diff++;
var id:String=input.id+"-"+sample.time,path:String="baselines/"+id+".png",file:File=new File(File.applicationDirectory.nativePath).resolvePath(path);file.parent.createDirectory();var f:FileStream=new FileStream();f.open(file,FileMode.WRITE);f.writeBytes(a.encode(a.rect,new PNGEncoderOptions()));f.close();
rows.push({id:id,inputId:input.id,time:sample.time,kind:input.kind,owner:input.owner,hp:input.hp,direction:input.direction,colipseHeight:p.colipse.height,exists:actual!=null,visible:actual?actual.visible:false,alpha:actual?actual.alpha:null,x:actual?actual.x:null,y:actual?actual.y:null,differentPixels:diff,path:path,tree:NativeTree.tree(world,world,"root")});a.dispose();b.dispose();}
removeChild(world);
}
var out:FileStream=new FileStream();out.open(new File(File.applicationDirectory.nativePath).resolvePath("rows.json"),FileMode.WRITE);out.writeUTFBytes(JSON.stringify(rows));out.close();trace("COMPLETE "+rows.length);NativeApplication.nativeApplication.exit(0);
}
private function render(root:DisplayObject,input:Object):BitmapData {var result:BitmapData=new BitmapData(200,220,true,0);result.draw(root,new Matrix(1,0,0,1,80-input.x,180-input.y));return result;}
}}
