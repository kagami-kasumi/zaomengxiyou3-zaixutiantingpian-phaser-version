package {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    import flash.system.*;
    import flash.utils.*;
    import flash.desktop.NativeApplication;
    import flash.filesystem.*;
    import my.HitTest;

    public class Dragon23Probe extends Sprite {
        [Embed(source="source.swf", mimeType="application/octet-stream")]
        private var SourceBytes:Class;
        [Embed(source="assets.json", mimeType="application/octet-stream")]
        private var AssetBytes:Class;
        private var assets:Array = JSON.parse(new AssetBytes().toString()) as Array;
        private var textures:Object = {};
        private var index:int = 0;
        private var sourceLoader:Loader = new Loader();
        private var rootSource:DisplayObjectContainer;
        private var symbols:Array = ["PetDragon2Bullet1","PetDragon2Bullet2","PetDragon3Bullet1","PetDragon3Bullet3"];
        private var seen:Object = {};
        private var count:int = 0;
        private var finished:int = 0;
        private var masks:Object = {};
        private var edgeSeen:Object = {};

        public function Dragon23Probe() {
            stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
            if(assets[0].symbols) symbols=assets[0].symbols;
            nextAsset();
        }
        private function nextAsset():void {
            if(index == assets.length) {
                addChild(sourceLoader);
                sourceLoader.contentLoaderInfo.addEventListener(Event.COMPLETE, loaded);
                var context:LoaderContext = new LoaderContext(false,new ApplicationDomain());
                context.allowCodeImport=true;
                sourceLoader.loadBytes(new SourceBytes() as ByteArray,context);
                return;
            }
            var file:File=File.applicationDirectory.resolvePath(assets[index].file);
            var stream:FileStream=new FileStream();stream.open(file,FileMode.READ);
            var bytes:ByteArray=new ByteArray();stream.readBytes(bytes);stream.close();
            var loader:Loader=new Loader();
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(event:Event):void {
                textures[assets[index].symbol+"/"+assets[index].frame]=Bitmap(loader.content).bitmapData.clone();
                index++;nextAsset();
            });
            loader.loadBytes(bytes);
        }
        private function loaded(event:Event):void {
            rootSource=sourceLoader.content as DisplayObjectContainer;
            if(rootSource.numChildren!=symbols.length+3) throw new Error("Unexpected original effects/targets");
            trace("ENV "+JSON.stringify({runtime:Capabilities.version,stageWidth:stage.stageWidth,
                stageHeight:stage.stageHeight,frameRate:stage.frameRate,quality:stage.quality}));
            capture(null);
            stage.addEventListener(Event.EXIT_FRAME,capture);
        }
        private function capture(event:Event):void {
            try {
                for(var i:int=0;i<symbols.length;i++) {
                    var movie:MovieClip=rootSource.getChildAt(i) as MovieClip;
                    var frame:int=movie.currentFrame;
                    var key:String=symbols[i]+"/"+frame;
                    if(seen[key]) continue;
                    seen[key]=true;
                    trace("TREE "+JSON.stringify({symbol:symbols[i],frame:frame,tree:Probe23.tree(movie)}));
                    if(assets[0].probeMode=="geometry" && i==2 && frame==3) {
                        movie.transform.matrix=new Matrix(-1,0,0,1,590,450);
                        Probe23.translationDiagnostic(movie);
                        movie.transform.matrix=new Matrix();
                    }
                    if(assets[0].probeMode!="geometry") for each(var sign:int in [1,-1]) sample(i,movie,frame,sign);
                    finished++;
                    if(frame==movie.totalFrames) movie.stop();
                }
                if(finished==assets.length) {
                    stage.removeEventListener(Event.EXIT_FRAME,capture);
                    trace("COMPLETE "+count+" "+finished);
                    NativeApplication.nativeApplication.exit(0);
                }
            } catch(error:Error) {
                trace("FAIL "+error.getStackTrace());NativeApplication.nativeApplication.exit(1);
            }
        }
        private function sample(i:int,movie:MovieClip,frame:int,sign:int):void {
            var direction:String=sign==1?"left":"right";
            var base:String=symbols[i]+"-"+frame+"-"+direction;
            var px:Number=sign==1?350:590;
            movie.transform.matrix=new Matrix(sign,0,0,1,px,450);
            var bounds:Rectangle=movie.getBounds(rootSource);
            var asset:Object;
            for each(var candidate:Object in assets) if(candidate.symbol==symbols[i] && candidate.frame==frame) asset=candidate;
            var edgeMode:Boolean=asset.probeMode=="edge";
            var rootMode:Boolean=asset.probeMode=="roots";
            var maskId:String=asset.maskGroup+"-"+direction;
            if(edgeMode && ((asset.maskGroup!="group-10" && asset.maskGroup!="group-14") || edgeSeen[maskId])) {
                movie.transform.matrix=new Matrix();return;
            }
            edgeSeen[maskId]=true;
            if(!edgeMode && !rootMode)Probe23.baseline(movie,base);
            var bitmap:Bitmap=new Bitmap(textures[symbols[i]+"/"+frame]);
            rootSource.addChild(bitmap);
            var placeX:Number=asset.registrationX-asset.cropX;
            var placeY:Number=asset.registrationY-asset.cropY;
            bitmap.transform.matrix=new Matrix(sign,0,0,1,px-sign*placeX,450-placeY);
            if(!edgeMode && !rootMode && asset.captureMasks!==false && !masks[maskId]) {
                masks[maskId]=true;
                trace("MASK "+JSON.stringify(Probe23.maskField(movie,maskId,sign)));
            }
            for(var targetIndex:int=0;targetIndex<3;targetIndex++) {
                if((edgeMode || rootMode) && targetIndex>0)continue;
                var target:DisplayObject=rootSource.getChildAt(symbols.length+targetIndex);
                var scale:Number=targetIndex==2?1:2;
                target.transform.matrix=new Matrix(scale,0,0,1,0,0);
                var local:Rectangle=target.getBounds(rootSource);
                var centerX:Number=bounds.x+bounds.width/2;
                var centerY:Number=bounds.y+bounds.height/2;
                var cases:Array=[{name:"center",x:centerX,y:centerY},
                    {name:"disjoint",x:2000,y:900},
                    {name:"subpixel-edge",x:bounds.x-local.right+0.5,y:centerY},
                    {name:"alpha-edge",x:bounds.x-local.right+3,y:centerY}];
                if(targetIndex==0) for(var phase:int=0;phase<20;phase++) cases.push({
                    name:"phase-"+phase,x:centerX+phase/20,y:centerY+((phase*7)%20)/20});
                if(edgeMode) {
                    cases=[];
                    for each(var overlap:Number in [0.05,0.25,0.5,0.75,1,2,3,4,5,6,8,10,12,16,20,24])
                        for each(var offset:Number in [-40,-20,0,20,40]) {
                            var suffix:String="-"+overlap+"-"+offset;
                            cases.push({name:"edge-right"+suffix,x:bounds.right-overlap-local.x,y:centerY+offset});
                            cases.push({name:"edge-left"+suffix,x:bounds.x+overlap-local.right,y:centerY+offset});
                            cases.push({name:"edge-top"+suffix,x:centerX+offset,y:bounds.y+overlap-local.bottom});
                            cases.push({name:"edge-bottom"+suffix,x:centerX+offset,y:bounds.bottom-overlap-local.y});
                        }
                }
                if(rootMode) {
                    cases=[];
                    for each(var slot:Object in [{id:"P1",x:123.25,y:345.75},{id:"P2",x:731.75,y:412.25}]) {
                        var empty:Boolean=bounds.width==0 || bounds.height==0;
                        cases.push({name:slot.id,x:slot.x+(empty?0:centerX-px),
                            y:slot.y+(empty?0:centerY-450),sourceX:slot.x,sourceY:slot.y});
                    }
                }
                if(asset.probeMode=="trigger") {
                    cases=[];
                    for each(var fixture:Object in asset.fixtures) {
                        var fx:Number=fixture.x,fy:Number=fixture.y;
                        if(fixture.anchor=="center") {fx+=centerX;fy+=centerY;}
                        if(fixture.anchor=="root") {fx+=px;fy+=450;}
                        if(fixture.anchor=="left") {fx+=bounds.x-local.right;fy+=centerY;}
                        if(fixture.anchor=="right") {fx+=bounds.right-local.x;fy+=centerY;}
                        if(fixture.anchor=="top") {fx+=centerX;fy+=bounds.y-local.bottom;}
                        if(fixture.anchor=="bottom") {fx+=centerX;fy+=bounds.bottom-local.y;}
                        cases.push({name:fixture.id,x:fx,y:fy,sourceX:fixture.sourceX,sourceY:fixture.sourceY});
                    }
                }
                for each(var item:Object in cases) {
                    if(rootMode || (asset.probeMode=="trigger" && item.sourceX!==undefined)) {
                        movie.transform.matrix=new Matrix(sign,0,0,1,item.sourceX,item.sourceY);
                        bitmap.transform.matrix=new Matrix(sign,0,0,1,item.sourceX-sign*placeX,item.sourceY-placeY);
                    } else if(asset.probeMode=="trigger") {
                        movie.transform.matrix=new Matrix(sign,0,0,1,px,450);
                        bitmap.transform.matrix=new Matrix(sign,0,0,1,px-sign*placeX,450-placeY);
                    }
                    target.transform.matrix=new Matrix(scale,0,0,1,item.x,item.y);
                    var id:String=base+"-t"+targetIndex+"-"+item.name;
                    var actual:Boolean=HitTest.complexHitTestObject(target,movie);
                    var production:Boolean=HitTest.complexHitTestObject(target,bitmap);
                    var result:Object=Probe23.measure(target,movie,id);
                    result.id=id;result.symbol=symbols[i];result.frame=frame;result.sign=sign;
                    result.targetIndex=targetIndex;result.actual=actual;result.productionActual=production;
                    result.sourceRoot={x:movie.x,y:movie.y};result.targetRoot={x:target.x,y:target.y};
                    trace("CASE "+JSON.stringify(result));count++;
                }
            }
            rootSource.removeChild(bitmap);
            movie.transform.matrix=new Matrix();
        }
    }
}

import flash.display.*;
import flash.geom.*;
import flash.filesystem.*;
import flash.utils.getQualifiedClassName;
import flash.utils.ByteArray;
import my.HitTest;

class Probe23 extends HitTest {
    public static function translationDiagnostic(subject:DisplayObject):void {
        var dx:Number=27.350000000000023,dy:Number=50.39999999999998;
        var color:ColorTransform=new ColorTransform(1,1,1,1,255,255,255,255);
        var reference:BitmapData=new BitmapData(100,100,false,0xff0000);
        reference.draw(subject,new Matrix(-1,0,0,1,dx,dy),color,BlendMode.DIFFERENCE);
        var results:Array=[];
        for each(var shift:int in [0,1,2,5,10,14,20,50,100]) {
            var candidate:BitmapData=new BitmapData(150+shift,150+shift,false,0xff0000);
            candidate.draw(subject,new Matrix(-1,0,0,1,dx+shift,dy+shift),color,BlendMode.DIFFERENCE);
            var errors:int=0;
            for(var y:int=0;y<100;y++) for(var x:int=0;x<100;x++)
                if((reference.getPixel(x,y)==0x00ffff)!=(candidate.getPixel(x+shift,y+shift)==0x00ffff)) errors++;
            results.push({shift:shift,errors:errors});candidate.dispose();
        }
        for each(var position:Object in [{x:41.35,y:58.4},{x:41.25,y:58.25},{x:41.35,y:58.35},
                {x:41.35000000000002,y:58.39999999999998}]) {
            candidate=new BitmapData(128,116,false,0xff0000);
            candidate.draw(subject,new Matrix(-1,0,0,1,position.x,position.y),color,BlendMode.DIFFERENCE);
            errors=0;
            for(y=0;y<100;y++) for(x=0;x<100;x++)
                if((reference.getPixel(x,y)==0x00ffff)!=(candidate.getPixel(x+14,y+8)==0x00ffff)) errors++;
            results.push({position:position,errors:errors});candidate.dispose();
        }
        var parent:DisplayObjectContainer=DisplayObjectContainer(DisplayObjectContainer(subject).getChildAt(0));
        var nested:DisplayObjectContainer=DisplayObjectContainer(parent.getChildAt(0));
        var leaf:DisplayObject=nested.getChildAt(0);
        var original:Matrix=leaf.transform.matrix;
        var combined:Matrix=leaf.transform.matrix;
        combined.concat(nested.transform.matrix);combined.concat(parent.transform.matrix);
        combined.concat(new Matrix(-1,0,0,1,dx,dy));
        candidate=new BitmapData(100,100,false,0xff0000);
        candidate.draw(leaf,combined,color,BlendMode.DIFFERENCE);
        errors=0;
        for(y=0;y<100;y++) for(x=0;x<100;x++)
            if((reference.getPixel(x,y)==0x00ffff)!=(candidate.getPixel(x,y)==0x00ffff)) errors++;
        results.push({flattenedErrors:errors,matrix:{a:combined.a,b:combined.b,c:combined.c,d:combined.d,tx:combined.tx,ty:combined.ty}});
        var best:int=10000;var positions:Array=[];
        for(var txi:int=2240;txi<=2260;txi++) for(var tyi:int=650;tyi<=690;tyi++) {
            combined.tx=txi/20;combined.ty=tyi/20;
            candidate.fillRect(candidate.rect,0xff0000);candidate.draw(leaf,combined,color,BlendMode.DIFFERENCE);
            errors=0;
            for(y=0;y<100;y++) for(x=0;x<100;x++)
                if((reference.getPixel(x,y)==0x00ffff)!=(candidate.getPixel(x,y)==0x00ffff)) errors++;
            if(errors<best){best=errors;positions=[];}
            if(errors==best)positions.push({x:combined.tx,y:combined.ty});
        }
        results.push({bestFlattenedErrors:best,positions:positions});
        save(reference,"diagnostic","original");save(candidate,"diagnostic","flattened");candidate.dispose();
        var pixels:BitmapData=new BitmapData(144,112,true,0);
        pixels.draw(leaf);save(pixels,"diagnostic","bitmap-source");pixels.dispose();
        pixels=new BitmapData(100,100,true,0);
        pixels.draw(subject,new Matrix(-1,0,0,1,dx,dy));
        save(pixels,"diagnostic","colored-source");pixels.dispose();
        trace("TRANSLATION "+JSON.stringify(results));reference.dispose();
    }
    public static function tree(node:DisplayObject):Object {
        var m:Matrix=node.transform.matrix;
        var world:Matrix=node.transform.concatenatedMatrix;
        var filters:Array=[];
        for each(var filter:Object in node.filters) filters.push({type:getQualifiedClassName(filter),matrix:filter.hasOwnProperty("matrix")?filter.matrix:null});
        var result:Object={matrix:{a:m.a,b:m.b,c:m.c,d:m.d,tx:m.tx,ty:m.ty},alpha:node.alpha,
            bounds:rect(node.getBounds(node)),blendMode:node.blendMode,filters:filters,children:[],
            worldMatrix:{a:world.a,b:world.b,c:world.c,d:world.d,tx:world.tx,ty:world.ty},stageBounds:rect(node.getBounds(node.root))};
        if(node is MovieClip) {result.frame=MovieClip(node).currentFrame;result.totalFrames=MovieClip(node).totalFrames;}
        if(node is DisplayObjectContainer) {
            var parent:DisplayObjectContainer=node as DisplayObjectContainer;
            for(var i:int=0;i<parent.numChildren;i++) result.children.push(tree(parent.getChildAt(i)));
        }
        return result;
    }
    public static function rect(r:Rectangle):Object {return {x:r.x,y:r.y,width:r.width,height:r.height};}
    private static function save(data:BitmapData,folder:String,id:String):void {
        var dir:File=new File(File.applicationDirectory.nativePath).resolvePath(folder);dir.createDirectory();
        var stream:FileStream=new FileStream();stream.open(dir.resolvePath(id+".png"),FileMode.WRITE);
        stream.writeBytes(data.encode(data.rect,new PNGEncoderOptions()));stream.close();
    }
    public static function baseline(subject:DisplayObject,id:String):void {
        var data:BitmapData=new BitmapData(940,590,true,0);
        data.draw(subject,subject.transform.concatenatedMatrix);
        save(data,"stage-baselines",id);data.dispose();
    }
    public static function maskField(subject:DisplayObject,id:String,sign:int):Object {
        var bounds:Rectangle=subject.getBounds(subject);
        var left:Number=sign==1?bounds.x:-bounds.right;
        var ox:int=-Math.floor(left),oy:int=-Math.floor(bounds.y);
        var width:int=Math.ceil(bounds.width)+2,height:int=Math.ceil(bounds.height)+2;
        var data:BitmapData=new BitmapData(width,height,false,0xff0000);
        var bytes:ByteArray=new ByteArray();
        for(var py:int=0;py<20;py++) for(var px:int=0;px<20;px++) {
            data.fillRect(data.rect,0xff0000);
            data.draw(subject,new Matrix(sign,0,0,1,ox+px/20,oy+py/20),
                new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
            var colors:Vector.<uint>=data.getVector(data.rect);
            for(var i:int=0;i<colors.length;i+=8) {
                var value:int=0;
                for(var bit:int=0;bit<8 && i+bit<colors.length;bit++) if(colors[i+bit]==0xff00ffff) value|=1<<bit;
                bytes.writeByte(value);
            }
        }
        var rawLength:int=bytes.length;bytes.compress();
        var dir:File=new File(File.applicationDirectory.nativePath).resolvePath("mask-fields");dir.createDirectory();
        var stream:FileStream=new FileStream();stream.open(dir.resolvePath(id+".deflate"),FileMode.WRITE);
        stream.writeBytes(bytes);stream.close();data.dispose();
        return {id:id,width:width,height:height,originX:ox,originY:oy,phaseCount:400,
            phaseOrder:"y*20+x",phaseStride:Math.ceil(width*height/8),rawBytes:rawLength,
            bitOrder:"LSB first; row-major; each phase byte-aligned",bounds:rect(bounds),sign:sign};
    }
    public static function measure(a:DisplayObject,b:DisplayObject,id:String):Object {
        var q:Rectangle=intersectionRectangle(a,b);
        var result:Object={target:rect(a.getBounds(a.root)),bullet:rect(b.getBounds(b.root)),
            intersection:rect(q),cyanPixels:0};
        if(q.width<1||q.height<1) return result;
        var data:BitmapData=new BitmapData(q.width,q.height,false,0);
        data.draw(a,getDrawMatrix(a,q,1),new ColorTransform(1,1,1,1,255,-255,-255,255));
        data.draw(b,getDrawMatrix(b,q,1),new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
        var cyan:int=0;
        for(var y:int=0;y<data.height;y++) for(var x:int=0;x<data.width;x++) if(data.getPixel32(x,y)==0xff00ffff) cyan++;
        result.cyanPixels=cyan;save(data,"buffers",id);data.dispose();return result;
    }
}
