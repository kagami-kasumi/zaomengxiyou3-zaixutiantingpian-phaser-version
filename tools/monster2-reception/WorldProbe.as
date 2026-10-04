package {
public class WorldProbe {
 public static function snap(h:BaseHero):Object{
  var p:BasePet=h['samplePet'];
  return {sid:h.sid,hp:h.roleProperies.getHHP(),action:h.curAction,dead:h.isDead(),destroyed:h.isReadyToDestroy,ids:h.beAttackIdArray.concat(),father:h.fatherCount,
   attached:h.getPet()!=null,petRetired:p.isReadyToDestroy,petHp:p._petInfo.getHp(),petAction:p.curAction,petIds:p.beAttackIdArray.concat(),petFather:p.fatherCount,life:p._petInfo.getlifetime()};
 }
 public static function run():Array{
  var rows:Array=[];
  for each(var fps:int in [20,24,30])for each(var roster:String in ['p1','p2','both'])for each(var mode:String in ['normal','hero-protected','pet-protected','protect-expire','geometry-retry','dodge','difficulty2','critical','fatal-hero','fatal-pet','owner-dead','owner-ready','pet-dead','pet-ready','hp-equal','hp-above','source-dead','gather-negative']){
   Config.instance.frameClips=fps;Config.instance.curStage=1;Config.instance.curLevel=2;Config.instance.difficulity=mode=='difficulty2'?2:0;
   Config.geometry=true;Config.randomCalls=[];Config.rolls=[];
   var source:Monster2=new Monster2(),heroes:Array=[];
   if(mode=='critical')source.protectedParamsObject.Critical=100;
   Config.instance.hero1=null;Config.instance.hero2=null;
   for each(var slot:int in [1,2]){
    if(roster!='both' && roster!='p'+slot)continue;
    var hero:BaseHero=new Role1(),pet:BasePet=new PetMonkey1();hero.sid=slot;pet.sid=slot;hero.myPet=pet;hero['samplePet']=pet;pet.sourceRole=hero;
    if(mode=='hero-protected')hero.setYourFather(100);
    if(mode=='pet-protected')pet.setYourFather(100);
    if(mode=='protect-expire'){hero.setYourFather(6);pet.setYourFather(6);}
    if(mode=='dodge'){hero.roleProperies.miss=100;pet._petInfo._anti.miss=1;}
    if(mode=='fatal-hero')hero.roleProperies.dataObject.hhp=1;
    if(mode=='fatal-pet')pet._petInfo._anti.hp=1;
    if(mode=='hp-equal'){hero.roleProperies.dataObject.hhp=29;pet._petInfo._anti.hp=29;}
    if(mode=='hp-above'){hero.roleProperies.dataObject.hhp=30;pet._petInfo._anti.hp=30;}
    if(mode=='owner-dead'){hero.roleProperies.dataObject.hhp=0;hero.curAction='dead';}
    if(mode=='owner-ready')hero.isReadyToDestroy=true;
    if(mode=='pet-dead'){pet._petInfo._anti.hp=0;pet.curAction='dead';}
    if(mode=='pet-ready')pet.isReadyToDestroy=true;
    heroes.push(hero);if(slot==1)Config.instance.hero1=hero;else Config.instance.hero2=hero;
   }
   var bullets:Array=[],steps:Array=[];
   for(var tick:int=1;tick<=42;tick++){
    Config.randomCalls=[];Config.rolls=[];Config.geometry=!(mode=='geometry-retry' && tick==6);
    if(mode=='source-dead' && tick==7){source.hp=0;source.curAction='dead';}
    // Frozen 256/257A detector schedule is an input, not a new time-line proof.
    for each(var b:BaseBullet in bullets){
     var first:int=b.symbol=='Monster2Bullet1_1'?6:21,last:int=b.symbol=='Monster2Bullet1_1'?19:40;
     if(tick>=first && tick<=last)b.checkAttack();
    }
    if(mode!='gather-negative' && (tick==5 || (tick==20 && mode!='source-dead'))){
     b=new BaseBullet();b.symbol='Monster2Bullet1_'+(tick==5?1:2);b.name=b.symbol+'-';b.setRole(source);b.setAction('hit1');bullets.push(b);
    }
    for each(hero in heroes){hero.protectionStep();if(hero.getPet())hero.getPet().protectionStep();}
    var states:Array=[];for each(hero in heroes)states.push(snap(hero));
    var bs:Array=[];for each(b in bullets)bs.push({symbol:b.symbol,id:b.getAttackId(),count:b.attackIntervalCount,max:b.maxAttackCount});
    steps.push({tick:tick,targets:states,bullets:bs,random:Config.randomCalls.concat()});
   }
   rows.push({id:fps+'-'+roster+'-'+mode,fps:fps,roster:roster,mode:mode,steps:steps});
  }
  return rows;
 }
}
}
