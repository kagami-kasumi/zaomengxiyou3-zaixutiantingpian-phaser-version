package {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    import flash.system.*;
    import flash.utils.*;
    import flash.filesystem.*;
    import flash.desktop.NativeApplication;
    public class OwnerProbe extends Sprite {
        private var fixtures:Object,index:int=0,loaders:Array=[];
        public function OwnerProbe() {
            loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void {
                trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);
            });
            var stream:FileStream=new FileStream();stream.open(File.applicationDirectory.resolvePath("fixtures.json"),FileMode.READ);
            fixtures=JSON.parse(stream.readUTFBytes(stream.bytesAvailable));stream.close();availability("before-load");next();
        }
        private function next():void {
            if(index==fixtures.sources.length) {
                for each(var spec:Object in fixtures.sources)for each(var name:String in spec.symbols) {
                    var klass:Class=getDefinitionByName(name) as Class;
                    var obj:*=new klass();
                    trace("OBJECT "+JSON.stringify({symbol:name,type:getQualifiedClassName(obj),declaredOwner:spec.id,
                        frame:obj is MovieClip?MovieClip(obj).currentFrame:null,totalFrames:obj is MovieClip?MovieClip(obj).totalFrames:null,
                        width:obj.width,height:obj.height}));
                    if(obj is BitmapData)BitmapData(obj).dispose();
                }
                trace("COMPLETE");NativeApplication.nativeApplication.exit(0);return;
            }
            var loader:Loader=new Loader();loaders.push(loader);
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void {
                trace("LOADED "+fixtures.sources[index].id);
                availability("after-"+fixtures.sources[index].id);
                // Original AssetsLoader unloads the display while retaining currentDomain definitions.
                loader.unload();index++;next();
            });
            var stream:FileStream=new FileStream();stream.open(new File(fixtures.sources[index].path),FileMode.READ);
            var bytes:ByteArray=new ByteArray();stream.readBytes(bytes);stream.close();
            var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;
            trace("LOAD "+fixtures.sources[index].id);loader.loadBytes(bytes,context);
        }
        private function availability(phase:String):void {
            var values:Object={};
            for each(var spec:Object in fixtures.sources)for each(var name:String in spec.symbols)
                values[name]=ApplicationDomain.currentDomain.hasDefinition(name);
            trace("DEFINITIONS "+JSON.stringify({phase:phase,values:values}));
        }
    }
}
