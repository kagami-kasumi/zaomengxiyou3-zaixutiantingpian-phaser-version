package {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    import flash.system.*;
    import flash.utils.*;
    import flash.desktop.NativeApplication;
    import flash.filesystem.*;
    import my.HitTest;

    public class CollisionProbe extends Sprite {
        [Embed(source="source.swf", mimeType="application/octet-stream")]
        private var SourceBytes:Class;
        [Embed(source="cases.json", mimeType="application/octet-stream")]
        private var CasesBytes:Class;
        private var loader:Loader = new Loader();

        public function CollisionProbe() {
            stage.scaleMode = StageScaleMode.NO_SCALE;
            stage.align = StageAlign.TOP_LEFT;
            addChild(loader);
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE, run);
            loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, fail);
            var context:LoaderContext = new LoaderContext(false, new ApplicationDomain());
            context.allowCodeImport = true;
            loader.loadBytes(new SourceBytes() as ByteArray, context);
        }
        private function fail(event:Event):void {
            trace("FAIL " + event.toString());
            NativeApplication.nativeApplication.exit(1);
        }
        private function run(event:Event):void {
            try {
                var root:DisplayObjectContainer = loader.content as DisplayObjectContainer;
                if(root.numChildren != 6) throw new Error("Expected raw shapes, target sprites and original bullet timeline");
                var target:DisplayObject = root.getChildAt(0);
                var bullet:DisplayObject = root.getChildAt(1);
                var cases:Array = JSON.parse(new CasesBytes().toString()) as Array;
                trace("ENV " + JSON.stringify({runtime:Capabilities.version,os:Capabilities.os,
                    stageWidth:stage.stageWidth,stageHeight:stage.stageHeight,frameRate:stage.frameRate,quality:stage.quality}));
                for each(var item:Object in cases) {
                    target = root.getChildAt(item.hasOwnProperty("targetIndex") ? item.targetIndex : 0);
                    bullet = root.getChildAt(item.hasOwnProperty("frame") ? 5 : 1);
                    if(item.hasOwnProperty("frame")) MovieClip(bullet).gotoAndStop(item.frame);
                    target.transform.matrix = new Matrix(item.hasOwnProperty("targetScaleX") ? item.targetScaleX : 1,0,0,1,item.x,item.y);
                    bullet.transform.matrix = new Matrix(item.flip,0,0,1,item.bx,item.by);
                    var actual:Boolean = HitTest.complexHitTestObject(target,bullet);
                    var measurement:Object = BufferProbe.measure(target,bullet,item.id);
                    measurement.id = item.id;
                    measurement.actual = actual;
                    if(item.hasOwnProperty("baselineState")) {
                        BufferProbe.baseline(item.baselineSubject == "target" ? target : bullet,item.baselineState);
                    }
                    trace("CASE " + JSON.stringify(measurement));
                }
                trace("COMPLETE " + cases.length);
                NativeApplication.nativeApplication.exit(0);
            } catch(error:Error) {
                trace("FAIL " + error.getStackTrace());
                NativeApplication.nativeApplication.exit(1);
            }
        }
    }
}

import flash.display.*;
import flash.geom.*;
import flash.filesystem.*;
import my.HitTest;

// Diagnostic buffer capture; boolean results above execute the unchanged source.
class BufferProbe extends HitTest {
    private static function save(data:BitmapData,folder:String,id:String):void {
        var dir:File=new File(File.applicationDirectory.nativePath).resolvePath(folder);dir.createDirectory();
        var stream:FileStream=new FileStream();
        stream.open(dir.resolvePath(id+".png"),FileMode.WRITE);
        stream.writeBytes(data.encode(data.rect,new PNGEncoderOptions()));stream.close();
    }
    public static function baseline(subject:DisplayObject,id:String):void {
        var data:BitmapData=new BitmapData(940,590,false,0);
        data.draw(subject,subject.transform.concatenatedMatrix);
        save(data,"stage-baselines",id);data.dispose();
    }
    public static function rect(r:Rectangle):Object {
        return {x:r.x,y:r.y,width:r.width,height:r.height};
    }
    public static function measure(a:DisplayObject,b:DisplayObject,id:String):Object {
        var intersection:Rectangle = HitTest.intersectionRectangle(a,b);
        var output:Object = {target:rect(a.getBounds(a.root)),bullet:rect(b.getBounds(b.root)),
            intersection:rect(intersection),targetWidth:a.width,targetHeight:a.height,cyanPixels:0};
        if(intersection.width < 1 || intersection.height < 1) return output;
        var data:BitmapData = new BitmapData(intersection.width,intersection.height,false,0);
        data.draw(a,getDrawMatrix(a,intersection,1),new ColorTransform(1,1,1,1,255,-255,-255,255));
        data.draw(b,getDrawMatrix(b,intersection,1),new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
        for(var y:int=0;y<data.height;y++) for(var x:int=0;x<data.width;x++) {
            if(data.getPixel32(x,y)==0xff00ffff) output.cyanPixels++;
        }
        output.cyanBounds = rect(data.getColorBoundsRect(0xffffffff,0xff00ffff));
        save(data,"buffers",id);data.dispose();
        return output;
    }
}
