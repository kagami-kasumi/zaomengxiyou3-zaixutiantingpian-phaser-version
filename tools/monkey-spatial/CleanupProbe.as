package {
    import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;import flash.geom.*;
    import flash.desktop.NativeApplication;import base.BaseBullet;import export.bullet.FollowBaseObjectBullet;import com.greensock.TweenMax;
    public class CleanupProbe extends Sprite {
        private var config:Object,index:int=0,loaders:Array=[],p1:BasePet,p2:BasePet,owner:OwnerStub,fireTarget:Sprite,fireEffect:BaseAddEffect,tick:int=0;
        public function CleanupProbe(){
            loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
            var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("fixtures.json"),FileMode.READ);config=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();next();
        }
        private function next():void {
            if(index==config.sources.length){start();return;}
            var loader:Loader=new Loader();loaders.push(loader);
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{loader.unload();index++;next();});
            var fs:FileStream=new FileStream();fs.open(new File(config.sources[index].path),FileMode.READ);var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();
            var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;loader.loadBytes(bytes,context);
        }
        private function bullet(p:BasePet):BaseBullet {
            var b:BaseBullet=new FollowBaseObjectBullet("PetMonkey1Bullet2");b.setRole(p);b.setHurtCanCutDownEffect(false);b.setDestroyWhenLastFrame(false);
            addChild(b);p.magicBulletArray.push(b);return b;
        }
        private function state(label:String,a:BaseBullet,b:BaseBullet):void {
            trace("STATE "+JSON.stringify({label:label,p1:{attached:p1.parent!=null,alpha:p1.alpha,bodyAttached:p1.bbdc.parent!=null,ready:p1.isReadyToDestroy,
                bulletCount:p1.magicBulletArray.length,owner:p1.sourceRole!=null,effect:p1.curAddEffect!=null},ownerClears:owner.clears,
                p2:{attached:p2.parent!=null,ready:p2.isReadyToDestroy,bulletCount:p2.magicBulletArray.length,owner:p2.sourceRole!=null},
                bullet1:a.snapshot(),bullet2:b.snapshot(),targetFire:fireTarget.getChildByName("FireBuff")!=null,fireEffectOwner:fireEffect.sourceRole!=null}));
        }
        private function start():void {
            p1=new BasePet();p1.id="P1";addChild(p1);owner=p1.sourceRole;
            p2=new BasePet();p2.id="P2";addChild(p2);
            fireTarget=new Sprite();fireTarget.x=470;fireTarget.y=350;addChild(fireTarget);fireEffect=new BaseAddEffect(fireTarget);
            fireEffect.showFire();fireEffect.showFire();
            if(fireTarget.numChildren!=1)throw new Error("Fire duplicate");
            var a:BaseBullet=bullet(p1),b:BaseBullet=bullet(p2);state("before",a,b);
            p1.destroy();state("pet-destroy",a,b);
            TweenMax.advance(0.5);state("fade-half",a,b);
            TweenMax.advance(1);state("fade-complete",a,b);
            fireEffect.destroy();state("effect-destroy",a,b);
            stage.addEventListener(Event.EXIT_FRAME,frame);
        }
        private function frame(e:Event):void {
            tick++;var fire:MovieClip=fireTarget.getChildByName("FireBuff") as MovieClip;
            var bitmap:BitmapData=new BitmapData(200,200,true,0);bitmap.draw(fire,new Matrix(1,0,0,1,100,100));
            var file:File=new File(File.applicationDirectory.nativePath).resolvePath("fire/fire-"+tick+".png");file.parent.createDirectory();
            var fs:FileStream=new FileStream();fs.open(file,FileMode.WRITE);fs.writeBytes(bitmap.encode(bitmap.rect,new PNGEncoderOptions()));fs.close();bitmap.dispose();
            trace("FIRE "+JSON.stringify({tick:tick,frame:fire.currentFrame,totalFrames:fire.totalFrames,path:"fire/fire-"+tick+".png",tree:NativeTree.tree(fire,fire,"root")}));
            if(tick==22){stage.removeEventListener(Event.EXIT_FRAME,frame);var removing:BaseAddEffect=new BaseAddEffect(fireTarget);removing.hideFire();
                trace("REMOVED "+JSON.stringify({children:fireTarget.numChildren}));trace("COMPLETE");NativeApplication.nativeApplication.exit(0);}
        }
    }
}
