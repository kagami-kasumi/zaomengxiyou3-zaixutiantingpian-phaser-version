package {
public class WorldProbe {
 public static function run():Array{
  var rows:Array=[];
  for each(var owner:String in ['p1','p2'])for each(var boss:Boolean in [false,true])for each(var attack:int in [1,2])for each(var mode:String in ['normal','protected-retry','geometry-retry','dodge','difficulty1','difficulty2','flower','order']){
   Config.instance.difficulity=mode=='difficulty2'?2:mode=='difficulty1'?1:0;Config.instance.curLevel=boss?1:3;
   Config.geometry=true;Config.rolls=[];Config.randomCalls=[];
   var source:Monster3=new Monster3(),hero:BaseHero=new Role1(),pet:BasePet=new PetMonkey1();
   if(mode=='order')source.protectedParamsObject.Critical=50;
   hero.sid=owner=='p1'?1:2;pet.sid=hero.sid;hero.myPet=pet;pet.sourceRole=hero;
   if(mode=='flower'){source.curAddEffect=new BaseAddEffect();source.curAddEffect.curEffectArray=[{name:BaseAddEffect.MAGIC_FLOWER_DEBUFF}];}
   if(mode=='dodge'){hero.roleProperies.miss=100;pet._petInfo._anti.miss=1;}
   Config.instance.players=[hero];
   var bullet:BaseBullet=new BaseBullet();bullet.setRole(source);bullet.setAction('hit'+attack);
   var setup:Array=Config.randomCalls.concat(),steps:Array=[];
   var count:int=attack==1?1001:7;
   for(var i:int=0;i<count;i++){
    hero['isYourFather']=mode=='protected-retry' && i==0;pet['isYourFather']=mode=='protected-retry' && i==0;
    // Difficulty 2 native protection persists; other cases explicitly release a controlled prior state.
    if(mode=='difficulty2' && i>0){hero['isYourFather']=true;pet['isYourFather']=true;}
    Config.geometry=!(mode=='geometry-retry' && i==0);Config.randomCalls=[];if(mode=='order')Config.rolls=[0.9,0.9,0.1,0.9,0.9,0.9,0.9,0.9,0.9];
    bullet.checkAttack();
    if(i<3 || i>=count-3)steps.push({frame:i+1,heroHp:hero.roleProperies.getHHP(),petHp:pet._petInfo.getHp(),
      heroIds:hero.beAttackIdArray.concat(),petIds:pet.beAttackIdArray.concat(),id:bullet.getAttackId(),
      interval:bullet.attackInterval,count:bullet.attackIntervalCount,max:bullet.maxAttackCount,
      random:Config.randomCalls.concat(),sourceHit:source.protectedParamsObject.Hit,
      heroFather:hero.fatherCount,petFather:pet.fatherCount});
   }
   rows.push({id:owner+'-'+int(boss)+'-'+attack+'-'+mode,owner:owner,boss:boss,attack:attack,mode:mode,setup:setup,steps:steps});
  }
  return rows;
 }
}
}
