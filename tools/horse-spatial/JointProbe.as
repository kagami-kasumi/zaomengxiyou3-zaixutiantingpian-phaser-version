package {
    import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;
    import flash.desktop.NativeApplication;import base.*;
    public class JointProbe extends Sprite {
        private var config:Object,index:int=0,tick:int=0,cases:Array=[],rows:Array=[],loaders:Array=[];
        public function JointProbe(){
            loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
            var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("fixtures.json"),FileMode.READ);
            config=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();stage.frameRate=config.fps;
            stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;next();
        }
        private function next():void {
            if(index==config.sources.length){start();return;}
            var loader:Loader=new Loader();loaders.push(loader);
            trace("LOAD "+index);
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{trace("LOADED "+index);if(index==2){for each(var n:String in ["PetHorse4Bullet5","PetHorse4Bullet5Explode"])AUtils.sourceClasses[n]=loader.contentLoaderInfo.applicationDomain.getDefinition(n);}if(index<3)loader.unload();index++;next();});
            loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR,function(e:IOErrorEvent):void{trace("FAIL "+e.text);NativeApplication.nativeApplication.exit(1);});
            var fs:FileStream=new FileStream();fs.open(new File(config.sources[index].path),FileMode.READ);
            var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();
            var context:LoaderContext=new LoaderContext(false,index<2?ApplicationDomain.currentDomain:new ApplicationDomain(null));context.allowCodeImport=true;
            loader.loadBytes(bytes,context);
        }
        private function start():void {
            var atlases:DisplayObjectContainer=loaders[3].content as DisplayObjectContainer;
            for(var i:int=0;i<4;i++){var atlas:DisplayObject=atlases.getChildAt(i);var bitmap:BitmapData=new BitmapData(atlas.width,atlas.height,true,0);bitmap.draw(atlas);CallbackBase.atlasPool.push(bitmap);}
            for each(var spec:Object in config.bodies.forms)for each(var action:Object in spec.actions){
                if(action.action.indexOf("hit")!=0||action.action=="hit5")continue;
                for each(var owner:int in [1,2])addCase(spec,action.action,owner,-1);
            }
            for(var skills:int=0;skills<8;skills++)for each(owner in [1,2])addCase(config.bodies.forms[3],"hit5",owner,skills);
            trace("ENV "+JSON.stringify({runtime:Capabilities.version,fps:stage.frameRate}));
            stage.addEventListener(Event.ENTER_FRAME,enter);stage.addEventListener(Event.EXIT_FRAME,exitFrame);
        }
        private function addCase(spec:Object,action:String,owner:int,skills:int):void {
            var classes:Array=[Horse1,Horse2,Horse3,Horse4],klass:Class=classes[spec.form-1],actor:*=new klass(spec);
            actor.id="P"+owner;actor.sourceRole.sid=owner;actor.gc.sid=owner;actor.gc.frameClips=config.fps;
            actor.x=owner==1?300:640;actor.y=350;actor.sourceRole.x=actor.x;actor.sourceRole.y=350;
            actor.gc.gameSence.addChild(actor);addChild(actor.gc.gameSence);
            var target:FixtureTarget=new FixtureTarget();target.x=600;target.y=350;target.id="target-P"+owner;actor.gc.gameSence.addChild(target);actor.gc.pWorld.monsterArray=[target];
            if(skills>=0){actor._petInfo.skills={bd:Boolean(skills&1),sp:Boolean(skills&2),bz:Boolean(skills&4)};actor.startAoyi();}
            else actor.setAction(action);
            cases.push({id:spec.form+"-"+action+"-P"+owner+"-"+skills,actor:actor,births:skills>=0?[0]:[],seen:actor.magicBulletArray.length});
        }
        private function enter(e:Event):void {
            tick++;
            for each(var item:Object in cases){
                var actor:*=item.actor;actor.events=[];actor.gc.events=[];
                for each(var bullet:BaseBullet in actor.magicBulletArray){bullet.calls=[];if(!bullet.isReadyToDestroy)bullet.step2();}
                actor.bbdc.step();
                while(item.seen<actor.magicBulletArray.length){item.births.push(tick);item.seen++;}
            }
            capture("enter");
        }
        private function capture(phase:String):void {
            for each(var item:Object in cases){
                var actor:*=item.actor,bullets:Array=[];
                for(var i:int=0;i<actor.magicBulletArray.length;i++){
                    var bullet:BaseBullet=actor.magicBulletArray[i],state:Object=bullet.snapshot();state.birthTick=item.births[i];
                    state.phaseFrames=[];if(bullet.getImgMc())phaseFrames(bullet.getImgMc(),state.phaseFrames);
                    state.depth=bullet.parent?bullet.parent.getChildIndex(bullet):-1;bullets.push(state);
                }
                rows.push({id:item.id,tick:tick,phase:phase,action:actor.curAction,x:actor.x,y:actor.y,
                    body:{row:actor.bbdc.getCurPoint().y,column:actor.bbdc.getCurPoint().x,count:actor.bbdc.getCurFrameCount()},
                    actorDepth:actor.parent.getChildIndex(actor),bullets:bullets,events:actor.events.concat(),network:actor.gc.events.concat()});
            }
        }
        private static function phaseFrames(d:DisplayObject,result:Array):void {
            if(d is MovieClip)result.push(MovieClip(d).currentFrame);
            if(d is DisplayObjectContainer)for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++)phaseFrames(DisplayObjectContainer(d).getChildAt(i),result);
        }
        private function exitFrame(e:Event):void {
            capture("exit");
            if(tick==160){stage.removeEventListener(Event.ENTER_FRAME,enter);stage.removeEventListener(Event.EXIT_FRAME,exitFrame);
                var fs:FileStream=new FileStream();fs.open(new File(File.applicationDirectory.nativePath).resolvePath("rows.json"),FileMode.WRITE);fs.writeUTFBytes(JSON.stringify(rows));fs.close();
                trace("COMPLETE "+rows.length);NativeApplication.nativeApplication.exit(0);}
        }
    }
}
