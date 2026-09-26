package {
    import flash.display.*;import flash.events.*;import flash.geom.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;
    import flash.desktop.NativeApplication;import base.*;import export.bullet.*;
    public class LifecycleProbe extends Sprite {
        private var config:Object,index:int=0,tick:int=0,items:Array=[],rows:Array=[],nativePhases:Object={};
        public function LifecycleProbe(){
            loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void {
                trace("FAIL "+(e.error is Error?Error(e.error).getStackTrace():e.error));e.preventDefault();NativeApplication.nativeApplication.exit(1);
            });
            var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("fixtures.json"),FileMode.READ);
            config=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();stage.frameRate=config.fps;
            stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;next();
        }
        private function next():void {
            if(index==config.sources.length){start();return;}
            var loader:Loader=new Loader();
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void {loader.unload();index++;next();});
            loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,function(e:IOErrorEvent):void{throw new Error(e.text);});
            var fs:FileStream=new FileStream();fs.open(new File(config.sources[index].path),FileMode.READ);
            var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();
            var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;
            loader.loadBytes(bytes,context);
        }
        private function start():void {
            for each(var spec:Object in config.effects) for each(var owner:String in ["P1","P2"]) for each(var direction:int in [0,1]) for each(var mode:String in ["natural","move-hurt","pause","explicit-destroy"]){
                var world:Sprite=new Sprite();addChild(world);
                var source:BaseObject=new BaseObject();source.id=owner;source.x=owner=="P1"?300:640;source.y=350;source.scaleX=direction==0?-1:1;world.addChild(source);
                var bullet:BaseBullet=spec.follow?new FollowBaseObjectBullet(spec.symbol):new SpecialEffectBullet(spec.symbol);
                bullet.x=source.x+(direction==0?-45:45);bullet.y=source.y-30;
                bullet.setRole(source);bullet.setDirect(direction);bullet.setAction("fixture-action");
                if(spec.disabled)bullet.setDisable();
                if(spec.xj){bullet.setDestroyWhenLastFrame(false);bullet.setHurtCanCutDownEffect(false);bullet.setDestroyInCount(config.fps*4);}
                world.addChild(bullet);
                var item:Object={id:spec.symbol+"-"+owner+"-"+direction+"-"+mode,spec:spec,source:source,bullet:bullet,mode:mode};
                items.push(item);rows.push({id:item.id,tick:0,phase:"created",state:bullet.snapshot()});
                capturePhase(bullet);
            }
            trace("ENV "+JSON.stringify({runtime:Capabilities.version,fps:stage.frameRate,quality:stage.quality}));
            stage.addEventListener(Event.ENTER_FRAME,enter);stage.addEventListener(Event.EXIT_FRAME,exitFrame);
        }
        private function enter(e:Event):void {
            tick++;
            for each(var item:Object in items){
                var bullet:BaseBullet=item.bullet,source:BaseObject=item.source;
                bullet.calls=[];
                Config.instance.isStopGame=item.mode=="pause"&&tick>=3&&tick<=5;
                if(item.mode=="move-hurt"){
                    if(tick==3){source.x+=20;source.y-=7;}
                    if(tick==4)source.scaleX=-source.scaleX;
                    if(tick==5)source.curAction="hurt";
                }
                if(item.mode=="pause"&&tick==4){source.x+=20;source.y-=7;source.scaleX=-source.scaleX;}
                var before:Object=bullet.snapshot();
                if(!bullet.isReadyToDestroy){if(item.mode=="explicit-destroy"&&tick==8)bullet.destroy();else bullet.step2();}
                rows.push({id:item.id,tick:tick,phase:"enter",paused:Config.instance.isStopGame,
                    source:{x:source.x,y:source.y,a:source.scaleX,action:source.curAction},before:before,state:bullet.snapshot()});
                capturePhase(bullet);
            }
            Config.instance.isStopGame=false;
        }
        private function capturePhase(bullet:BaseBullet):void {
            try {
            var clip:MovieClip=bullet.getImgMc();if(!clip)return;
            var key:String=bullet.getImcName()+"|"+JSON.stringify(bullet.snapshot().phaseFrames);
            if(nativePhases[key])return;
            var bounds:Rectangle=clip.getBounds(clip),left:int=Math.floor(bounds.x),top:int=Math.floor(bounds.y);
            var bitmap:BitmapData=new BitmapData(Math.max(1,Math.ceil(bounds.right)-left),Math.max(1,Math.ceil(bounds.bottom)-top),true,0);
            bitmap.draw(clip,new Matrix(1,0,0,1,-left,-top));
            var path:String="phases-"+config.fps+"/"+bullet.getImcName()+"-"+JSON.stringify(bullet.snapshot().phaseFrames).replace(/[^0-9]+/g,"_")+".png";
            var file:File=new File(File.applicationDirectory.nativePath).resolvePath(path);file.parent.createDirectory();
            var stream:FileStream=new FileStream();stream.open(file,FileMode.WRITE);stream.writeBytes(bitmap.encode(bitmap.rect,new PNGEncoderOptions()));stream.close();bitmap.dispose();
            nativePhases[key]={tree:NativeTree.tree(clip,clip,"root"),path:path,left:left,top:top};
            } catch(error:Error){trace("PHASE-FAIL "+bullet.getImcName()+" tick="+tick+" "+error.getStackTrace());NativeApplication.nativeApplication.exit(1);}
        }
        private function exitFrame(e:Event):void {
            for each(var item:Object in items){rows.push({id:item.id,tick:tick,phase:"exit",state:item.bullet.snapshot()});capturePhase(item.bullet);}
            if(tick==config.fps*4+8){
                stage.removeEventListener(Event.ENTER_FRAME,enter);stage.removeEventListener(Event.EXIT_FRAME,exitFrame);
                var fs:FileStream=new FileStream();fs.open(new File(File.applicationDirectory.nativePath).resolvePath("rows.json"),FileMode.WRITE);
                fs.writeUTFBytes(JSON.stringify(rows));fs.close();
                fs.open(new File(File.applicationDirectory.nativePath).resolvePath("native-phases.json"),FileMode.WRITE);fs.writeUTFBytes(JSON.stringify(nativePhases));fs.close();
                trace("COMPLETE "+rows.length);NativeApplication.nativeApplication.exit(0);
            }
        }
    }
}
