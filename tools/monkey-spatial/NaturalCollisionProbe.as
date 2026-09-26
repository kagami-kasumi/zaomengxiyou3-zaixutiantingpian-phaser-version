package {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    import flash.system.*;
    import flash.utils.*;
    import flash.filesystem.*;
    import flash.desktop.NativeApplication;
    import my.HitTest;

    public class NaturalCollisionProbe extends Sprite {
        private var config:Object;
        private var loaders:Array = [];
        private var effects:Array = [];
        private var targets:Array = [];
        private var sourceIndex:int = 0;
        private var tick:int = 0;
        private var count:int = 0;
        private var differences:int=0;
        private var phases:Object={};
        public function NaturalCollisionProbe() {
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
            var loader:Loader = new Loader();loaders.push(loader);
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void {
                loader.unload();sourceIndex++;nextSource();
            });
            loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,function(e:IOErrorEvent):void { throw new Error(e.text); });
            var fs:FileStream = new FileStream(); fs.open(new File(config.sources[sourceIndex].path),FileMode.READ);
            var bytes:ByteArray = new ByteArray(); fs.readBytes(bytes); fs.close();
            var context:LoaderContext = new LoaderContext(false,ApplicationDomain.currentDomain); context.allowCodeImport = true;
            loader.loadBytes(bytes,context);
        }
        private function start():void {

            for each(var spec:Object in config.effects) {
                var type:Class=getDefinitionByName(spec.symbol) as Class;var clip:MovieClip=new type();
                addChild(clip);effects.push({spec:spec,clip:clip});
            }
            for each(var target:Object in config.targets) {
                type=getDefinitionByName(target.symbol) as Class;var shape:DisplayObject=new type();shape.scaleX=target.symbol=="ObjectBaseSprite7"?0.5:1;addChild(shape);
                targets.push({spec:target,clip:shape});
            }
            trace("ENV " + JSON.stringify({runtime:Capabilities.version,frameRate:stage.frameRate,quality:stage.quality}));
            capture();
            stage.addEventListener(Event.ENTER_FRAME,onFrame);
        }
        private function onFrame(e:Event):void {
            tick++; capture();
            if(tick == config.ticks) {
                stage.removeEventListener(Event.ENTER_FRAME,onFrame);
                trace("COMPLETE " + count); NativeApplication.nativeApplication.exit(0);
            }
        }
        private function capture():void {
            for each(var item:Object in effects) for each(var sign:int in [1,-1]) {
                var effect:MovieClip = item.clip;
                effect.x = 470; effect.y = 350; effect.scaleX = sign;
                var phase:Object=phaseSelector(effect),phaseKey:String=item.spec.symbol+"|"+JSON.stringify(phase);
                if(!phases[phaseKey]){phases[phaseKey]=true;trace("PHASE "+JSON.stringify({key:phaseKey,symbol:item.spec.symbol,phase:phase}));}
                for each(var target:Object in targets) {
                    var shape:DisplayObject = target.clip;
                    var eb:Rectangle=effect.getBounds(this),tb:Rectangle=shape.getBounds(shape),positions:Array=config.positions.concat();
                    tb.x*=shape.scaleX;tb.width*=shape.scaleX;
                    var centerX:Number=eb.x+eb.width/2-470-tb.x-tb.width/2,centerY:Number=eb.y+eb.height/2-350-tb.y-tb.height/2;
                    for each(var delta:Number in [-1.01,-1,-0.99,-0.05,0,0.05]){
                        positions.push([eb.right-470-tb.x+delta,centerY]);
                        positions.push([eb.x-470-tb.right-delta,centerY]);
                        positions.push([centerX,eb.bottom-350-tb.y+delta]);
                        positions.push([centerX,eb.y-350-tb.bottom-delta]);
                    }
                    for each(var position:Array in positions) {
                    shape.x = 470 + position[0]; shape.y = 350 + position[1];
                    var intersection:Rectangle = HitTest.intersectionRectangle(effect,shape);
                    var hit:Boolean = HitTest.complexHitTestObject(effect,shape);
                    var referenceHit:Boolean=reference(effect,shape,intersection);
                    if(hit!=referenceHit&&differences++<3)trace("DIFFERENCE "+JSON.stringify({symbol:item.spec.symbol,tick:tick,actual:hit,reference:referenceHit,worldA:effect.localToGlobal(new Point()).toString(),worldB:shape.localToGlobal(new Point()).toString(),a:effect.transform.matrix.toString(),b:shape.transform.matrix.toString(),roi:intersection.toString()}));
                    trace("CASE " + JSON.stringify({symbol:item.spec.symbol,tick:tick,frame:effect.currentFrame,
                        direction:sign,target:target.spec.symbol,x:position[0],y:position[1],hit:hit,reference:referenceHit,phaseKey:phaseKey,
                        intersection:{x:intersection.x,y:intersection.y,width:intersection.width,height:intersection.height}}));
                    count++;
                    }
                }
            }
        }
        private static function phaseSelector(d:DisplayObject):Object {
            if(!d)return {pendingConstruction:true};
            var out:Object={frame:d is MovieClip?MovieClip(d).currentFrame:null,children:[]};
            if(d is DisplayObjectContainer){var c:DisplayObjectContainer=d as DisplayObjectContainer;for(var i:int=0;i<c.numChildren;i++)out.children.push(phaseSelector(c.getChildAt(i)));}
            return out;
        }
        private static function reference(effect:DisplayObject,target:DisplayObject,overlap:Rectangle):Boolean {
            if(overlap.width<1||overlap.height<1)return false;
            var a:BitmapData=new BitmapData(overlap.width,overlap.height,false,0);
            var ma:Matrix=effect.transform.concatenatedMatrix,mb:Matrix=target.transform.concatenatedMatrix;
            var pa:Point=effect.localToGlobal(new Point()),pb:Point=target.localToGlobal(new Point());
            ma.tx=pa.x-overlap.x;ma.ty=pa.y-overlap.y;mb.tx=pb.x-overlap.x;mb.ty=pb.y-overlap.y;
            ma.a/=effect.root.transform.concatenatedMatrix.a;ma.d/=effect.root.transform.concatenatedMatrix.d;
            mb.a/=target.root.transform.concatenatedMatrix.a;mb.d/=target.root.transform.concatenatedMatrix.d;
            a.draw(effect,ma,new ColorTransform(1,1,1,1,255,-255,-255,255));
            a.draw(target,mb,new ColorTransform(1,1,1,1,255,255,255,255),flash.display.BlendMode.DIFFERENCE);
            // Independent pixel reduction, preserving the source's sequential raster blend.
            // Separate binary masks are not equivalent at fractional vector edges.
            var va:Vector.<uint>=a.getVector(a.rect),hit:Boolean=false;
            // Original AIR getColorBoundsRect omits a sole match at pixel index 0.
            // Isolated exhaustive native probes freeze this behavior, not a tolerance.
            for(var i:int=1;i<va.length;i++)if(va[i]==0xff00ffff){hit=true;break;}
            a.dispose();return hit;
        }
    }
}
