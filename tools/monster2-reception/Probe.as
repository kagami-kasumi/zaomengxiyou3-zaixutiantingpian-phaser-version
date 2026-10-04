package {
import flash.display.*;import flash.desktop.NativeApplication;import flash.system.Capabilities;
import flash.filesystem.*;
public class Probe extends Sprite {
 public function Probe(){
  try {
   var file:File=new File(File.applicationDirectory.nativePath+'/fixtures.json'),io:FileStream=new FileStream();
   io.open(file,FileMode.READ);var fixtures:Array=JSON.parse(io.readUTFBytes(io.bytesAvailable)) as Array;io.close();
   var rows:Array=[];
   for each(var f:Object in fixtures) {
    Config.instance.curStage=1;Config.instance.curLevel=2;Config.instance.difficulity=f.difficulty;
    var source:Monster2=new Monster2();
    source.protectedParamsObject.Critical=f.critical;source.protectedParamsObject.Hit=f.sourceHit;source.protectedParamsObject.ReduceMagicDef=f.reduceMagic;
    if(f.flower){source.curAddEffect=new BaseAddEffect();source.curAddEffect.curEffectArray=[{name:BaseAddEffect.MAGIC_FLOWER_DEBUFF}];}
    var target:BaseObject=TargetFactory.create(f.name),hero:BaseHero=target as BaseHero,pet:BasePet=target as BasePet;
    target.sid=f.owner=='p1'?1:2;target.curAction=f.action;target['isYourFather']=f['protected'];target['isGXP']=f.gxp;if(f.protectionKind)target[f.protectionKind]=true;
    if(hero){hero.player.sd=f.sd;hero.roleProperies.dataObject.hhp=f.hp;hero.roleProperies.miss=f.miss;hero.roleProperies.defense=f.defense;hero.roleProperies.magicDefense=f.magicDefense;}
    if(pet){pet.sourceRole=new BaseHero();pet.sourceRole.sid=target.sid;pet._petInfo.name=f.name;if(f.qlfj!==null)pet._petInfo.qlfj=f.qlfj;
      pet._petInfo._anti.hp=f.hp;pet._petInfo._anti.miss=f.petMiss;pet._petInfo._anti.def=f.defense;pet._petInfo._anti.mDef=f.petMagicDefense;}
    if(pet && f.rabbit && f.name.indexOf('PetRabbit')==0){pet.curAddEffect=new BaseAddEffect();pet.curAddEffect.curEffectArray=[{name:BaseAddEffect.PET_RABBIT_JIFENG}];}
    var linkPet:BasePet=null;
    if(hero && (f.shield>0 || f.link)){
     hero.curAddEffect=new BaseAddEffect();hero.curAddEffect.sourceRole=hero;
     if(f.shield>0)hero.curAddEffect.curEffectArray=[{name:f.shieldKind,defendValue:f.shield}];
     if(f.link){hero.curAddEffect.curEffectArray.push({name:BaseAddEffect.PETTURTKE_BUFF});linkPet=new BasePet();linkPet.sourceRole=hero;linkPet._petInfo._anti.hp=f.linkHp;if(f.linkHp==0)linkPet.curAction='dead';linkPet.curAddEffect=new BaseAddEffect();linkPet.curAddEffect.curEffectArray=f.linkBoth?[{name:BaseAddEffect.PETTURTKE_BUFF}]:[];hero.myPet=linkPet;}
    }
    Config.geometry=f.geometry;Config.randomCalls=[];Config.rolls=f.rolls?f.rolls.concat():[f.roll,f.roll,f.roll,f.roll,f.roll,f.roll];
    var bullet:BaseBullet=new BaseBullet();bullet.curAction='hit1';bullet.symbol='Monster2Bullet1_'+f.attack;bullet.isBingo=f.bingo;
    var accepted:Boolean=target.beMagicAttack(bullet,source);
    rows.push({id:f.id,accepted:accepted,hp:hero?hero.roleProperies.getHHP():pet._petInfo.getHp(),random:Config.randomCalls,
      action:target.curAction,ids:target.beAttackIdArray,missed:!!target['missed'],destroyed:target.isReadyToDestroy,
      sourceHit:source.protectedParamsObject.Hit,father:target.fatherCount,
      skill1:!!target['skill1Release'],skill2:!!target['skill2Release'],skill3:!!target['skill3Release'],
      linkHp:linkPet?linkPet._petInfo.getHp():null,shield:hero && hero.curAddEffect && hero.curAddEffect.getBuffByName(f.shieldKind)?hero.curAddEffect.getBuffByName(f.shieldKind).defendValue:null,
      lifetime:pet?pet._petInfo.getlifetime():null});
   }
   io.open(new File(File.applicationDirectory.nativePath+'/rows.json'),FileMode.WRITE);io.writeUTFBytes(JSON.stringify(rows));io.close();
   io.open(new File(File.applicationDirectory.nativePath+'/world.json'),FileMode.WRITE);io.writeUTFBytes(JSON.stringify(WorldProbe.run()));io.close();
   trace('COMPLETE '+Capabilities.version+' rows='+rows.length);NativeApplication.nativeApplication.exit(0);
  }catch(e:Error){trace(e.getStackTrace());NativeApplication.nativeApplication.exit(1);}
 }
}
}
