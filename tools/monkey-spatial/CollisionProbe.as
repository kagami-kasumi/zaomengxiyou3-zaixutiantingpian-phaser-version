package {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    import flash.system.*;
    import flash.utils.*;
    import flash.filesystem.*;
    import flash.desktop.NativeApplication;
    import my.HitTest;

    public class CollisionProbe extends Sprite {
        private var config:Object;
        private var loaded:Object = {};
        private var effects:Array = [];
        private var targets:Array = [];
        private var sourceIndex:int = 0;
        private var tick:int = 0;
        private var count:int = 0;
        public function CollisionProbe() {
            loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR, function(e:UncaughtErrorEvent):void {
                trace("FAIL " + e.error); e.preventDefault(); NativeApplication.nativeApplication.exit(1);
            });
            stage.scaleMode = StageScaleMode.NO_SCALE; stage.align = StageAlign.TOP_LEFT;
            var fs:FileStream = new FileStream();
            fs.open(File.applicationDirectory.resolvePath("fixtures.json"),FileMode.READ);
            config = JSON.parse(fs.readUTFBytes(fs.bytesAvailable)); fs.close(); nextSource();
        }
        private function nextSource():void {
            if(sourceIndex == config.sources.length) { start(); return; }
            var loader:Loader = new Loader();
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void {
                loaded[config.sources[sourceIndex].id] = loader.content; sourceIndex++; nextSource();
            });
            loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,function(e:IOErrorEvent):void { throw new Error(e.text); });
            var fs:FileStream = new FileStream(); fs.open(new File(config.sources[sourceIndex].path),FileMode.READ);
            var bytes:ByteArray = new ByteArray(); fs.readBytes(bytes); fs.close();
            var context:LoaderContext = new LoaderContext(false,new ApplicationDomain()); context.allowCodeImport = true;
            loader.loadBytes(bytes,context);
        }
        private function start():void {
            for each(var source:Object in config.sources) addChild(loaded[source.id]);
            for each(var spec:Object in config.effects) {
                var clip:MovieClip = loaded[spec.owner].getChildAt(spec.sourceIndex) as MovieClip;
                reset(clip); effects.push({spec:spec,clip:clip});
            }
            for each(var target:Object in config.targets) {
                var shape:DisplayObject = loaded[target.owner].getChildAt(target.sourceIndex);
                targets.push({spec:target,clip:shape});
            }
            trace("ENV " + JSON.stringify({runtime:Capabilities.version,frameRate:stage.frameRate,quality:stage.quality}));
            capture();
            for each(var item:Object in effects) resume(item.clip);
            stage.addEventListener(Event.EXIT_FRAME,onFrame);
        }
        private static function reset(d:DisplayObject):void {
            if(d is MovieClip) MovieClip(d).gotoAndStop(1);
            if(d is DisplayObjectContainer) for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++) reset(DisplayObjectContainer(d).getChildAt(i));
        }
        private static function resume(d:DisplayObject):void {
            if(d is MovieClip) MovieClip(d).play();
            if(d is DisplayObjectContainer) for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++) resume(DisplayObjectContainer(d).getChildAt(i));
        }
        private function onFrame(e:Event):void {
            tick++; capture();
            if(tick == config.ticks) {
                stage.removeEventListener(Event.EXIT_FRAME,onFrame);
                trace("COMPLETE " + count); NativeApplication.nativeApplication.exit(0);
            }
        }
        private function capture():void {
            for each(var item:Object in effects) for each(var sign:int in [1,-1]) {
                var effect:MovieClip = item.clip;
                effect.x = 470; effect.y = 350; effect.scaleX = sign;
                for each(var target:Object in targets) for each(var position:Array in config.positions) {
                    var shape:DisplayObject = target.clip;
                    shape.x = 470 + position[0]; shape.y = 350 + position[1];
                    var intersection:Rectangle = HitTest.intersectionRectangle(effect,shape);
                    var hit:Boolean = HitTest.complexHitTestObject(effect,shape);
                    trace("CASE " + JSON.stringify({symbol:item.spec.symbol,tick:tick,frame:effect.currentFrame,
                        direction:sign,target:target.spec.symbol,x:position[0],y:position[1],hit:hit,
                        intersection:{x:intersection.x,y:intersection.y,width:intersection.width,height:intersection.height}}));
                    count++;
                }
            }
        }
    }
}
