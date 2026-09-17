package {
import flash.display.*;import flash.events.*;import flash.geom.*;import flash.system.*;import flash.utils.*;import flash.filesystem.*;
import my.HitTest;
public class CollisionCapture extends HitTest {
private static var targets:DisplayObjectContainer;
private static var count:int=0;
private static var context:Object,actor:Object,hostTick:int;
public static function setContext(c:Object,p:Object,tick:int):void {context=c;actor=p;hostTick=tick;}
public static function observe(bullet:Object):void {capture(context,actor,hostTick,bullet);}
public static function beforeStep(c:Object,p:Object,bullet:Object,tick:int):void {
 trace('STEP_INPUT '+JSON.stringify({scenario:c.id,tick:tick,bulletIndex:p.magicBulletArray.indexOf(bullet),input:bullet.collisionInput()}));
}
public static function init(parent:DisplayObjectContainer,done:Function):void {
 var loader:Loader=new Loader();parent.addChild(loader);
 loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void {
  targets=loader.content as DisplayObjectContainer;done();
 });
 var s:FileStream=new FileStream();s.open(File.applicationDirectory.resolvePath('collision-source.swf'),FileMode.READ);
 var b:ByteArray=new ByteArray();s.readBytes(b);s.close();
 var context:LoaderContext=new LoaderContext(false,new ApplicationDomain());context.allowCodeImport=true;loader.loadBytes(b,context);
}
private static function rect(r:Rectangle):Object {return {x:r.x,y:r.y,width:r.width,height:r.height};}
private static function clock(d:DisplayObject):Object {
 var r:Object={frame:d is MovieClip?MovieClip(d).currentFrame:0,children:[]};
 if(d is DisplayObjectContainer)for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++)r.children.push(clock(DisplayObjectContainer(d).getChildAt(i)));
 return r;
}
public static function capture(c:Object,p:Object,tick:int,only:Object=null):void {
 var index:int=0;
 for each(var bullet:Object in p.magicBulletArray) {
  if(only && bullet!=only){index++;continue;}
  var symbol:String=bullet.getImcName();
  if(bullet.isReadyToDestroy || symbol=='AoyiBuff'){index++;continue;}
  var clip:DisplayObject=bullet.getImgMc();
  if(!clip){index++;continue;}
  var root:Point=clip.localToGlobal(new Point()),world:Matrix=clip.transform.concatenatedMatrix;
  var bounds:Rectangle=clip.getBounds(clip.root);
  for(var ti:int=0;ti<3;ti++) {
   var target:DisplayObject=targets.getChildAt(4+ti),scale:Number=ti==2?1:2;
   target.transform.matrix=new Matrix(scale,0,0,1,0,0);
   var local:Rectangle=target.getBounds(target.root);
   var cases:Array=[{id:'center',x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2},
    {id:'disjoint',x:5000,y:5000},
    {id:'left-edge',x:bounds.x-local.right+1,y:bounds.y+bounds.height/2},
    {id:'phase',x:root.x+.35,y:root.y-20.65}];
   for each(var f:Object in cases) {
    target.transform.matrix=new Matrix(scale,0,0,1,f.x,f.y);
    var q:Rectangle=intersectionRectangle(target,clip);
    var id:String=c.id+'-'+tick+'-b'+index+'-t'+ti+'-'+f.id;
    var a:Matrix=getDrawMatrix(target,q,1),b:Matrix=getDrawMatrix(clip,q,1);
    var row:Object={id:id,scenario:c.id,tick:tick,bulletIndex:index,symbol:symbol,tree:clock(clip),
     sourceRoot:{x:root.x,y:root.y},sourceDraw:{x:b.tx,y:b.ty},scale:Math.abs(world.a),sign:world.a<0?-1:1,
     targetDraw:{x:a.tx,y:a.ty},targetIndex:ti,intersection:rect(q),actual:complexHitTestObject(target,clip),
     sourceBounds:rect(bounds),targetBounds:rect(target.getBounds(target.root)),fixture:f.id};
    if(q.width>=1 && q.height>=1) {
     var bitmap:BitmapData=new BitmapData(q.width,q.height,false,0);
     bitmap.draw(target,a,new ColorTransform(1,1,1,1,255,-255,-255,255));
     bitmap.draw(clip,b,new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
     var file:File=new File(File.applicationDirectory.nativePath).resolvePath('oracle/'+id+'.png');file.parent.createDirectory();
     var fs:FileStream=new FileStream();fs.open(file,FileMode.WRITE);fs.writeBytes(bitmap.encode(bitmap.rect,new PNGEncoderOptions()));fs.close();bitmap.dispose();
    }
    trace('COLLISION '+JSON.stringify(row));count++;
   }
  }
  index++;
 }
}
}}
