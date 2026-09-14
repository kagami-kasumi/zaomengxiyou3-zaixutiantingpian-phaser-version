package {
    import flash.display.Sprite;import flash.utils.ByteArray;import flash.system.Capabilities;
    import flash.desktop.NativeApplication;import config.Config;import my.ANumber;
    public class BehaviorProbe extends Sprite {
        private var gc:Config=Config.getInstance();private var h:BaseHero;private var p:BasePet;
        private var beforeHero:int;private var beforePet:int;
        public function BehaviorProbe(){try{run();trace("COMPLETE");NativeApplication.nativeApplication.exit(0);}catch(e:Error){trace("FAIL "+e.getStackTrace());NativeApplication.nativeApplication.exit(1);}}
        private function reset(hp:int=100,petHp:int=100,role3:Boolean=false):void {
            ANumber.calls=[];gc.mode="single";gc.sid=1;gc.started=true;gc.user=new MutiUser();
            h=role3?new Role3():new BaseHero();p=new BasePet();h.pet=p;p.sourceRole=h;gc.hero=h;
            h.roleProperies.setHHP(hp);p._petInfo.setHp(petHp);
            beforeHero=hp;beforePet=petHp;
        }
        private function buff(hero:BaseHero,name:String,capacity:int):void{
            if(!hero.curAddEffect){hero.curAddEffect=new BaseAddEffect();hero.curAddEffect.sourceRole=hero;}
            hero.curAddEffect.curEffectArray.push({name:name,defendValue:capacity});
        }
        private function report(id:String):void {
            trace("CASE "+JSON.stringify({id:id,hpBefore:beforeHero,petHpBefore:beforePet,hpAfter:h.roleProperies.getHHP(),petHpAfter:p._petInfo.getHp(),syncedHp:gc.user.hp,syncedPetHp:gc.user.petHp,
                pnumValues:ANumber.calls.map(function(c:Object,i:int,a:Array):int{return c.value;}),calls:ANumber.calls}));
        }
        private function sync(hp:int,petHp:int=100,name:String="A"):void{
            var b:ByteArray=new ByteArray();b.writeUTFBytes([1,hp,100,0,0,1,name,petHp,100,0,0,0,1].join(","));b.position=0;
            new BaseMutiLevelListenering().refreshOtherMutiUser(2,b);
        }
        private function run():void {
            trace("ENV "+JSON.stringify({version:Capabilities.version}));
            reset();h.reduceHp(10,true);report("hero-local-damage-pnum");
            reset(10);h.reduceHp(25,true);report("hero-hp-clamp-zero");
            reset(50);h.reduceHp(0,true);report("hero-zero-damage");
            reset();buff(h,BaseAddEffect.MAGIC_UMBRELLA_DEFEND,30);buff(h,BaseAddEffect.tjgl_Shield,30);h.reduceHp(20);report("hero-magic-umbrella-short-circuit");
            reset();buff(h,BaseAddEffect.tjgl_Shield,5);h.reduceHp(20);report("hero-shield-overflow-recurses");
            reset(200,200);buff(h,BaseAddEffect.PETTURTKE_BUFF,0);p.curAddEffect=new BaseAddEffect();p.curAddEffect.curEffectArray.push({name:BaseAddEffect.PETTURTKE_BUFF});h.reduceHp(101);report("hero-petturtle-transfer");
            reset();h.getHurtByPig8(7);report("hero-gethurt-pig8-duplicate-local");
            reset(50);buff(h,BaseAddEffect.tjgl_Shield,20);h.getHurtByPig8(7);report("pig8-full-shield-still-explicit-display");
            reset(100,100,true);h.isGXP=true;h.addHeroHurtMc(20);report("role3-gxp-display-half");
            reset(100,100,true);h.addHeroHurtMc(20);report("role3-nongxp-display-unchanged");
            reset(100,10);p.reduceHp(25);report("pet-clamp-and-owner-display");
            reset(100,50);p.reduceHp(0);report("pet-zero-damage");
            reset();gc.mode="room";h.sid=2;h.reduceHp(10);report("remote-reduce-no-local-display");
            reset();gc.mode="room";h.sid=2;p.reduceHp(10);report("remote-pet-reduce-no-display");
            reset();sync(90);report("remote-sync-decrease-on-start");
            reset();gc.user.hp=90;sync(90);report("remote-sync-same-no-display");
            reset();gc.started=false;sync(90);report("remote-sync-before-start-no-display");
            reset();sync(100,90,"B");report("remote-pet-name-change-no-pnum");
            reset();sync(90);sync(90);sync(100);sync(90);report("remote-sync-reordered-explicit-sequence");
            reset();sync(100,90);report("remote-pet-sync-decrease");
            reset();gc.user.petHp=90;sync(100,90);report("remote-pet-sync-same");
            reset();gc.started=false;sync(100,90);report("remote-pet-sync-not-started");
        }
    }
}
