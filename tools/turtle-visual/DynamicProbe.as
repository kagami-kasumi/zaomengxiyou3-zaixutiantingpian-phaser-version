package {
import flash.display.*;import flash.events.*;import flash.geom.*;import flash.system.*;import flash.utils.*;
import flash.filesystem.*;import flash.desktop.NativeApplication;
import turtlefixture.base.*;import turtlefixture.export.pet.*;import turtlefixture.petInfo.PetInfo;import turtlefixture.com.greensock.TweenMax;
public class DynamicProbe extends Sprite {
private var fixtures:Object,index:int=0,loaders:Array=[],cases:Array=[],tick:int=0,maxTick:int=121,gc:Config=Config.instance,rows:Array=[];
public function DynamicProbe(){
 loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace('FAIL '+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
 fixtures=read('fixtures.json');gc.bodySpecs=fixtures.bodies.forms;stage.frameRate=24;next();
}
private function read(path:String):Object{var s:FileStream=new FileStream();s.open(File.applicationDirectory.resolvePath(path),FileMode.READ);var o:Object=JSON.parse(s.readUTFBytes(s.bytesAvailable));s.close();return o;}
private function next():void{
 if(index==fixtures.sources.length){start();return;}
 var l:Loader=new Loader();loaders.push(l);l.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{l.unload();index++;next();});
 var s:FileStream=new FileStream();s.open(new File(fixtures.sources[index].path),FileMode.READ);var b:ByteArray=new ByteArray();s.readBytes(b);s.close();
 var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;l.loadBytes(b,context);
}
private function make(form:int,owner:int,kind:String,mask:int=7):void{
 gc.formChoice=form;var world:Sprite=new Sprite();addChild(world);gc.gameSence=world;
 var h:BaseHero=new BaseHero();h.sid=owner;h.x=600;h.y=400;world.addChild(h);
 var info:PetInfo=new PetInfo();info.harms={sld:{first:73.9},txlj:{first:.05,second:7.9},sybh:{first:121.5},qlfj:{first:.5}};
 info.skills={sld:Boolean(mask&1),txlj:Boolean(mask&2),sybh:Boolean(mask&4),xwaoyi:true};
 var klass:Class=[PetTurtle1,PetTurtle2,PetTurtle3,PetTurtle4][form-1],p:*=new klass(h,info);
 p.x=300;p.y=400;world.addChild(p);p.curAttackTarget={x:400,y:400,isDead:function():Boolean{return false;}};
 p.bbdc.setEnterFrameCallBack(function(point:Point):void{p.probeFrame(0,0);},function(point:Point):void{});
 p.bbdc.setAddScriptWhenFrameOver(function(n:int):void{p.probeOver();});
 var c:Object={id:kind+'-'+form+'-'+owner+'-'+mask,p:p,h:h,info:info,world:world,kind:kind};cases.push(c);
 if(kind=='normal')p.probeNormal();else if(kind=='sld')p.probeSkill(1);else if(kind=='linked'){p.probeSkill(2);p.probeSkill(1);}else if(kind=='sybh')p.probeSkill(3);else if(kind=='buff'||kind=='buffrefresh')p.probeSkill(2);else p.probeSkill(4);
}
private function start():void{
 if(fixtures.mode=='buff'){maxTick=241;for(var who:int=1;who<=2;who++)for(var form:int=2;form<=4;form++){make(form,who,'buff');make(form,who,'buffrefresh');}}
 else {
 for(var owner:int=1;owner<=2;owner++){
  for(var f:int=1;f<=4;f++){make(f,owner,'normal');make(f,owner,'sld');if(f>=2)make(f,owner,'linked');if(f>=3)make(f,owner,'sybh');}
  for(var mask:int=0;mask<8;mask++)make(4,owner,'aoyi',mask);
  for each(var kind:String in ['rest','dead','destroy'])make(4,owner,kind);
 }
 }
 capture();addEventListener(Event.EXIT_FRAME,step);
}
private function step(e:Event):void{
 tick++;TweenMax.advance(tick/24);
 for each(var c:Object in cases){gc.gameSence=c.world;var p:*=c.p;
  if(tick==12){if(c.kind=='rest')c.info.isFight=false;if(c.kind=='dead')p.reduceHp(1001,true);if(c.kind=='destroy')p.destroy();}
  if(tick==48&&c.kind=='buffrefresh')p.probeSkill(2);
  c.h.curAddEffect.step();
  if(!p.isReadyToDestroy)p.bbdc.step();
  if(!p.isReadyToDestroy)p.probeVisualTail();
  if((tick==13||tick==14)&&(c.kind=='sld'||c.kind=='linked'))p.probeBodyTurn(tick==13?0:1);
  if(tick==15&&(c.kind=='sld'||c.kind=='linked')){p.x+=40;p.y-=10;var m:Matrix=p.transform.matrix;m.a=-m.a;p.transform.matrix=m;}
  if(tick==16&&(c.kind=='sld'||c.kind=='linked')){m=p.transform.matrix;m.a=1;p.transform.matrix=m;}
  if(tick==4&&c.kind=='aoyi'){p.x+=20;p.y-=5;m=p.transform.matrix;m.a=-1;p.transform.matrix=m;}
  if(tick==5&&c.kind=='aoyi'){m=p.transform.matrix;m.a=1;p.transform.matrix=m;}
  if(tick==18&&c.kind=='sld')p.reduceHp(11,true);
  for each(var b:BaseBullet in p.magicBulletArray.concat())if(!b.isReadyToDestroy)b.step2();
 }
 capture();if(tick==maxTick){removeEventListener(Event.EXIT_FRAME,step);var out:FileStream=new FileStream();out.open(new File(File.applicationDirectory.nativePath).resolvePath('measurement.json'),FileMode.WRITE);out.writeUTFBytes(JSON.stringify({phase:'EXIT_FRAME after controlled callbacks/hero buff/body step/source protection and pet buff/bullet step',fps:24,rows:rows,errors:TweenMax.errors}));out.close();trace('COMPLETE '+rows.length);NativeApplication.nativeApplication.exit(0);}
}
private function capture():void{
 for each(var c:Object in cases){var p:*=c.p,bullets:Array=[];for each(var b:BaseBullet in p.magicBulletArray)bullets.push(b.snapshot());
  var r:Object={id:c.id,tick:tick,action:p.curAction,direct:p.bbdc.getDirect(),hp:c.info.getHp(),heroHp:c.h.roleProperies.getHHP(),row:p.bbdc.getCurPoint().y,column:p.bbdc.getCurPoint().x,count:p.bbdc.getCurFrameCount(),ready:p.isReadyToDestroy,bullets:bullets,events:p.events.concat(),display:NativeTree.tree(c.world,c.world,"root")};
  var bitmap:BitmapData=new BitmapData(940,590,true,0);bitmap.draw(c.world);var path:String='captures/'+c.id+'-'+tick+'.png';var file:File=new File(File.applicationDirectory.nativePath).resolvePath(path);file.parent.createDirectory();var stream:FileStream=new FileStream();stream.open(file,FileMode.WRITE);stream.writeBytes(bitmap.encode(bitmap.rect,new PNGEncoderOptions(true)));stream.close();bitmap.dispose();r.capture=path;
  rows.push(r);
 }
}
}}
