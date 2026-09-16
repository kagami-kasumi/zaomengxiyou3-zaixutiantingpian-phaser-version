package {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    import flash.system.*;
    import flash.utils.*;
    import flash.filesystem.*;
    import flash.desktop.NativeApplication;

    public class VisualProbe extends Sprite {
        private var sources:Array;
        private var loadedSources:Object = {};
        private var objects:Array = [];
        private var index:int = 0;
        private var tick:int = 0;
        private var config:Object;

        public function VisualProbe() {
            loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void {
                trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);
            });
            stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
            var stream:FileStream=new FileStream();
            stream.open(File.applicationDirectory.resolvePath("fixtures.json"),FileMode.READ);
            config=JSON.parse(stream.readUTFBytes(stream.bytesAvailable));stream.close();
            sources=config.sources;nextSource();
        }
        private function nextSource():void {
            if(index==sources.length) {start();return;}
            var loader:Loader=new Loader();
            loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,function(e:IOErrorEvent):void {
                trace("FAIL "+e.text);NativeApplication.nativeApplication.exit(1);
            });
            trace("LOADING "+sources[index].id);
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void {
                loadedSources[sources[index].id]=loader.content;
                index++;nextSource();
            });
            var fs:FileStream=new FileStream();fs.open(new File(sources[index].path),FileMode.READ);
            var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();
            var ctx:LoaderContext=new LoaderContext(false,new ApplicationDomain());ctx.allowCodeImport=true;
            loader.loadBytes(bytes,ctx);
        }
        private function start():void {
            for each(var spec:Object in config.effects) {
                var domain:DisplayObjectContainer=loadedSources[spec.owner] as DisplayObjectContainer;
                var clip:MovieClip=domain.getChildAt(spec.sourceIndex) as MovieClip;
                if(!clip)throw new Error("Not a MovieClip: "+spec.symbol);
                reset(clip);
                objects.push({spec:spec,clip:clip});
            }
            for each(var source:Object in sources)addChild(loadedSources[source.id]);
            trace("ENV "+JSON.stringify({runtime:Capabilities.version,quality:stage.quality,
                frameRate:stage.frameRate,width:stage.stageWidth,height:stage.stageHeight}));
            capture("controlled-start");
            for each(var playing:Object in objects)resume(playing.clip);
            stage.addEventListener(Event.EXIT_FRAME,onFrame);
        }
        private static function reset(d:DisplayObject):void {
            if(d is MovieClip)MovieClip(d).gotoAndStop(1);
            if(d is DisplayObjectContainer)for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++)reset(DisplayObjectContainer(d).getChildAt(i));
        }
        private static function resume(d:DisplayObject):void {
            if(d is MovieClip)MovieClip(d).play();
            if(d is DisplayObjectContainer)for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++)resume(DisplayObjectContainer(d).getChildAt(i));
        }
        private function onFrame(e:Event):void {
            try {
                tick++;capture("exit-frame");
                if(tick==config.ticks) {
                    stage.removeEventListener(Event.EXIT_FRAME,onFrame);
                    trace("COMPLETE "+tick+" "+objects.length);
                    NativeApplication.nativeApplication.exit(0);
                }
            } catch(error:Error) {trace("FAIL "+error.getStackTrace());NativeApplication.nativeApplication.exit(1);}
        }
        private function capture(phase:String):void {
            for each(var item:Object in objects) {
                var clip:MovieClip=item.clip;
                var states:Array=[];
                var bounds:Rectangle=clip.getBounds(clip);
                var left:int=Math.floor(bounds.x),top:int=Math.floor(bounds.y);
                var local:BitmapData=new BitmapData(Math.max(1,Math.ceil(bounds.right)-left),Math.max(1,Math.ceil(bounds.bottom)-top),true,0);
                local.draw(clip,new Matrix(1,0,0,1,-left,-top));
                var localId:String=item.spec.symbol+"-"+tick+"-local";
                writeImage(localId,local);
                var localImage:Object={path:"baselines/"+localId+".png",origin:{x:left,y:top},width:local.width,height:local.height,
                    visibleBounds:rect(local.getColorBoundsRect(0xff000000,0,false))};
                local.dispose();
                for each(var scale:Number in item.spec.scales) for each(var sign:int in [1,-1]) {
                    var matrix:Matrix=new Matrix(sign*scale,0,0,scale,470,350);
                    var canvas:BitmapData=new BitmapData(940,590,true,0);
                    canvas.draw(clip,matrix,null,null,null,false);
                    var id:String=item.spec.symbol+"-"+tick+"-s"+scale+"-d"+sign;
                    writeImage(id,canvas);
                    states.push({id:id,scale:scale,sign:sign,root:{x:470,y:350},
                        visibleBounds:rect(canvas.getColorBoundsRect(0xff000000,0,false)),path:"baselines/"+id+".png"});
                    canvas.dispose();
                }
                trace("STATE "+JSON.stringify({symbol:item.spec.symbol,owner:item.spec.owner,tick:tick,phase:phase,
                    tree:tree(clip,clip,"root"),baselines:states,localImage:localImage}));
            }
        }
        private static function writeImage(id:String,canvas:BitmapData):void {
            var target:File=new File(File.applicationDirectory.nativePath).resolvePath("baselines/"+id+".png");
            target.parent.createDirectory();var stream:FileStream=new FileStream();stream.open(target,FileMode.WRITE);
            stream.writeBytes(canvas.encode(canvas.rect,new PNGEncoderOptions()));stream.close();
        }
        private static function rect(r:Rectangle):Object{return {x:r.x,y:r.y,width:r.width,height:r.height};}
        private static function tree(d:DisplayObject,root:DisplayObject,path:String):Object {
            var m:Matrix=d.transform.matrix,c:ColorTransform=d.transform.colorTransform;
            var result:Object={path:path,name:d.name,type:getQualifiedClassName(d),visible:d.visible,
                alpha:d.alpha,blendMode:d.blendMode,mask:d.mask?d.mask.name:null,
                matrix:{a:m.a,b:m.b,c:m.c,d:m.d,tx:m.tx,ty:m.ty},
                colorTransform:{redMultiplier:c.redMultiplier,greenMultiplier:c.greenMultiplier,blueMultiplier:c.blueMultiplier,
                    alphaMultiplier:c.alphaMultiplier,redOffset:c.redOffset,greenOffset:c.greenOffset,blueOffset:c.blueOffset,alphaOffset:c.alphaOffset},
                localBounds:rect(d.getBounds(d)),rootBounds:rect(d.getBounds(root)),filters:[],children:[]};
            for each(var f:Object in d.filters) {
                var properties:Object={type:getQualifiedClassName(f)};
                var description:XML=describeType(f);
                for each(var member:XML in description.accessor) {
                    var key:String=member.@name.toString();if(member.@access.toString()!="writeonly")properties[key]=f[key];
                }
                result.filters.push(properties);
            }
            if(d is MovieClip){result.frame=MovieClip(d).currentFrame;result.totalFrames=MovieClip(d).totalFrames;}
            if(d is DisplayObjectContainer) {
                var container:DisplayObjectContainer=d as DisplayObjectContainer;
                for(var i:int=0;i<container.numChildren;i++)result.children.push(tree(container.getChildAt(i),root,path+"/"+i));
            }
            return result;
        }
    }
}
