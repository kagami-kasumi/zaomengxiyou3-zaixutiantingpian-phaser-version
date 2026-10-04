package {
import flash.display.*;import flash.geom.*;import flash.events.*;import flash.system.*;import flash.utils.*;import flash.filesystem.*;import flash.desktop.NativeApplication;
public class VisualProbe extends Sprite {
private var packages:Array,fixtures:Array,domain:ApplicationDomain=new ApplicationDomain(ApplicationDomain.currentDomain),index:int=0,loaders:Array=[],patchClasses:Array=[],owners:Array=[];
public function VisualProbe(){try{packages=read('packages.json');fixtures=read('fixtures.json');AUtils.domain=domain;next();}catch(e:Error){fail(e);}}
private function read(name:String):Array{var s:FileStream=new FileStream();s.open(File.applicationDirectory.resolvePath(name),FileMode.READ);var a:Array=JSON.parse(s.readUTFBytes(s.bytesAvailable)) as Array;s.close();return a;}
private function save(name:String,bytes:ByteArray):void{var s:FileStream=new FileStream();s.open(new File(File.applicationDirectory.resolvePath(name).nativePath),FileMode.WRITE);s.writeBytes(bytes);s.close();}
private function json(name:String,value:Object):void{var bytes:ByteArray=new ByteArray();bytes.writeUTFBytes(JSON.stringify(value));save(name,bytes);}
private function next():void{
 if(index==packages.length){try{renderAll();}catch(e:Error){fail(e);}return;}
 var item:Object=packages[index],stream:FileStream=new FileStream(),bytes:ByteArray=new ByteArray();stream.open(new File(item.path),FileMode.READ);stream.readBytes(bytes);stream.close();
 var loader:Loader=new Loader();loaders.push(loader);var context:LoaderContext=new LoaderContext(false,domain);context.allowCodeImport=true;
 loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(event:Event):void{try{
  if(index==0)for(var i:int=1;i<=3;i++)patchClasses.push(domain.getDefinition('PetKabuBmd'+i));
  index++;next();
 }catch(e:Error){fail(e);}});
 loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,function(event:IOErrorEvent):void{fail(new Error(event.text));});
 loader.loadBytes(bytes,context);
}
private function renderAll():void{
 for(var i:int=1;i<=3;i++){var same:Boolean=domain.getDefinition('PetKabuBmd'+i)===patchClasses[i-1];owners.push({symbol:'PetKabuBmd'+i,patchClassPreserved:same});if(!same)throw new Error('Kabu owner changed');}
 var output:Array=[],saved:Object={};
 for each(var f:Object in fixtures){
  if(!Pool.hasRegisteredData(f.symbol))Pool.registerData(f.symbol);
  var pair:Array=Pool.infoDict[f.symbol];if(!pair)throw new Error('Missing '+f.symbol);
  if(!saved[f.symbol]&&pair[0] is BitmapData){var atlas:BitmapData=pair[0];save('png/atlas-'+f.symbol+'.png',atlas.encode(atlas.rect,new PNGEncoderOptions(true)));saved[f.symbol]=true;}
  var raw:BitmapData=pair[f.direct] is BitmapData?pair[f.direct]:pair[f.direct][f.row][f.x];if(!raw)throw new Error('Missing native cell '+f.id);var poolFile:String='png/pool-'+(pair[0] is BitmapData?f.symbol+'-d'+f.direct:f.id)+'.png';if(!saved[poolFile]){save(poolFile,raw.encode(raw.rect,new PNGEncoderOptions(true)));saved[poolFile]=true;}
  var source:Object=AUtils.getNewObj(f.symbol),sourceTree:Array=[],sourceFile:String=null;
  if(source is MovieClip){
   var sourceMc:MovieClip=source as MovieClip;sourceMc.gotoAndStop(f.row+1);
   var sourceChild:MovieClip=sourceMc.getChildAt(0) as MovieClip;if(!sourceChild)throw new Error('Missing source child '+f.id);
   sourceChild.gotoAndStop(f.x+1);walkSource(sourceMc,sourceMc,'0',null,0,sourceTree);
   var sourceBounds:Rectangle=sourceChild.getBounds(sourceMc);
   var independent:BitmapData=new BitmapData(sourceMc.width,sourceMc.height,true,16777215);
   independent.draw(sourceChild,f.direct==0?new Matrix(1,0,0,1,-sourceBounds.x+sourceChild.x,-sourceBounds.y+sourceChild.y):new Matrix(-1,0,0,1,sourceBounds.x+sourceBounds.width-sourceChild.x,-sourceBounds.y+sourceChild.y),null,null,null,true);
   sourceFile='png/source-'+f.id+'.png';save(sourceFile,independent.encode(independent.rect,new PNGEncoderOptions(true)));independent.dispose();
  }else if(source is BitmapData){sourceTree.push({id:'0',parent:null,kind:'BitmapData',symbol:f.symbol,width:source.width,height:source.height});BitmapData(source).dispose();}
  else throw new Error('Unexpected source type '+f.id);
  var frame:NativeFrame=new NativeFrame();frame.bmWidth=f.cell.width;frame.bmHeight=f.cell.height;frame.bmdArray=[{name:'body',source:pair}];frame.curPoint=new Point(f.x,f.row);frame.direct=f.direct;frame.setOffsetXY(f.cell.offset[0],f.cell.offset[1]);
  var cell:BitmapData=frame.render(),bitmap:Bitmap=new Bitmap(cell);frame.addChild(bitmap);
  var root:Sprite=new Sprite();root.x=470;root.y=350;root.addChild(frame);addChild(root);
  var image:BitmapData=new BitmapData(940,590,true,0);image.draw(root,new Matrix(1,0,0,1,470,350));
  var visible:Rectangle=image.getColorBoundsRect(0xff000000,0,false);
  save('png/'+f.id+'.png',image.encode(image.rect,new PNGEncoderOptions(true)));
  output.push({id:f.id,stageFrameRate:stage.frameRate,symbol:f.symbol,sourceTree:sourceTree,sourceFile:sourceFile,poolFile:poolFile,poolKind:pair[0] is BitmapData?'atlas':'movieclip',poolWidth:raw.width,poolHeight:raw.height,root:{x:470,y:350},frame:{x:frame.x,y:frame.y,width:f.cell.width,height:f.cell.height},cell:{x:f.x,y:f.row,direct:f.direct},visible:{x:visible.x,y:visible.y,width:visible.width,height:visible.height},display:[{name:'root',parent:null,depth:0,matrix:[1,0,0,1,470,350]},{name:'body',parent:'root',depth:0,matrix:[1,0,0,1,frame.x,frame.y]},{name:'bitmap',parent:'body',depth:0,matrix:[1,0,0,1,0,0],alpha:bitmap.alpha,smoothing:bitmap.smoothing}]});
  removeChild(root);image.dispose();cell.dispose();
 }
 json('owners.json',owners);json('observations.json',output);trace('COMPLETE '+output.length);NativeApplication.nativeApplication.exit();
}
private function rectValue(r:Rectangle):Object{return {x:r.x,y:r.y,width:r.width,height:r.height};}
private function sourcePath(node:DisplayObject,root:DisplayObject):String{
 if(node==root)return '0';if(!node.parent)return 'outside';
 return sourcePath(node.parent,root)+'/'+node.parent.getChildIndex(node);
}
private function walkSource(node:DisplayObject,root:DisplayObject,id:String,parentId:String,depth:int,rows:Array):void{
 var m:Matrix=node.transform.matrix,c:ColorTransform=node.transform.colorTransform,filters:Array=[];
 for each(var filter:Object in node.filters){var props:Object={};for each(var accessor:XML in describeType(filter)..accessor){var key:String=accessor.@name.toString();if(accessor.@access!='writeonly')props[key]=filter[key];}filters.push({kind:getQualifiedClassName(filter),properties:props});}
 rows.push({id:id,parent:parentId,depth:depth,kind:getQualifiedClassName(node),name:node.name,matrix:[m.a,m.b,m.c,m.d,m.tx,m.ty],localBounds:rectValue(node.getBounds(node)),sourceBounds:rectValue(node.getBounds(root)),alpha:node.alpha,visible:node.visible,blendMode:node.blendMode,mask:node.mask?sourcePath(node.mask,root):null,filters:filters,colorTransform:[c.redMultiplier,c.greenMultiplier,c.blueMultiplier,c.alphaMultiplier,c.redOffset,c.greenOffset,c.blueOffset,c.alphaOffset],frame:node is MovieClip?MovieClip(node).currentFrame:null,totalFrames:node is MovieClip?MovieClip(node).totalFrames:null,children:node is DisplayObjectContainer?DisplayObjectContainer(node).numChildren:0});
 if(node is DisplayObjectContainer){var container:DisplayObjectContainer=node as DisplayObjectContainer;for(var i:int=0;i<container.numChildren;i++)walkSource(container.getChildAt(i),root,id+'/'+i,id,i,rows);}
}
private function fail(e:Error):void{trace('FAILED '+e.getStackTrace());NativeApplication.nativeApplication.exit(1);}
}}
