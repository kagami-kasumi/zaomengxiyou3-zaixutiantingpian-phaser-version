private function savePlane(bitmap:BitmapData,path:String,color:uint):void {
var bytes:ByteArray=new ByteArray(),value:uint=0,bit:int=7;
for(var y:int=0;y<bitmap.height;y++)for(var x:int=0;x<bitmap.width;x++){
if(bitmap.getPixel(x,y)==color)value|=1<<bit;
if(--bit<0){bytes.writeByte(value);value=0;bit=7;}}
if(bit!=7)bytes.writeByte(value);bytes.compress();
var file:File=new File(File.applicationDirectory.nativePath).resolvePath(path);file.parent.createDirectory();
var fs:FileStream=new FileStream();fs.open(file,FileMode.WRITE);fs.writeBytes(bytes);fs.close();
}
private function releaseObject(object:DisplayObject):void {
removeChild(object);for each(var entry:Object in used){if(entry.shape.parent)entry.shape.parent.removeChild(entry.shape);pools[String(entry.cid)].push(entry.shape);}used=[];
}
private function run():void {
stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
for each(var state:Object in config.fields){
var object:DisplayObject=build(config.sources[state.sourceIndex],state.cid,state.phase);addChild(object);
for each(var sign:int in [1,-1]){
object.scaleX=sign;var bounds:Rectangle=object.getBounds(this);
var ox:int=-Math.floor(bounds.x)+4,oy:int=-Math.floor(bounds.y)+4;
var width:int=Math.max(1,Math.ceil(bounds.right)+ox+4),height:int=Math.max(1,Math.ceil(bounds.bottom)+oy+4);
var bitmap:BitmapData=new BitmapData(width,height,false,0xff0000);
for(var py:int=0;py<4;py++)for(var px:int=0;px<4;px++){
bitmap.fillRect(bitmap.rect,0xff0000);
bitmap.draw(object,new Matrix(sign,0,0,1,ox+px/4,oy+py/4),new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
savePlane(bitmap,'fields/'+state.id+'-'+sign+'-'+(py*4+px)+'.bin',0x00ffff);
}
trace('FIELD '+JSON.stringify({id:state.id,sign:sign,width:width,height:height,originX:ox,originY:oy,
bounds:{x:bounds.x,y:bounds.y,width:bounds.width,height:bounds.height}}));bitmap.dispose();}
releaseObject(object);
}
for each(var target:Object in config.targets){
object=build(config.sources[target.sourceIndex],target.cid,null);addChild(object);
bitmap=new BitmapData(300,300,false,0);
for(py=0;py<20;py++)for(px=0;px<20;px++){
bitmap.fillRect(bitmap.rect,0);
bitmap.draw(object,new Matrix(target.scaleX,0,0,1,150+px/20,150+py/20),new ColorTransform(1,1,1,1,255,-255,-255,255));
savePlane(bitmap,'targets/'+target.id+'-'+(py*20+px)+'.bin',0xff0000);}
bitmap.dispose();releaseObject(object);
}
trace('COMPLETE');NativeApplication.nativeApplication.exit(0);
}
