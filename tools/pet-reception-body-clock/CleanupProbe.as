package {import flash.display.*;import flash.desktop.NativeApplication;import flash.filesystem.*;
public class CleanupProbe extends Sprite {
public function CleanupProbe(){try{run();}catch(e:Error){trace('FAILED '+e.getStackTrace());NativeApplication.nativeApplication.exit(1);}}
private function run():void{
 var output:Array=[];
 for(var owner:int=1;owner<=2;owner++)for each(var mode:String in ['full','empty','detached','repeat']){
  var world:Sprite=new Sprite(),pet:BasePet=new BasePet(),partner:BasePet=new BasePet(),hero:Hero=new Hero(),otherHero:Hero=new Hero();
  world.addChild(pet);world.addChild(partner);pet.sourceRole=hero;hero.myPet=pet;partner.sourceRole=otherHero;otherHero.myPet=partner;
  var body:Body=new Body();pet.bbdc=body;pet.addChild(body);
  var effect:Object={calls:0};effect.destroy=function():void{effect.calls++;};if(mode!='empty')pet.curAddEffect=effect;
  var bullets:Array=[];var callbacks:Object={calls:0};
  if(mode!='empty')for(var i:int=0;i<2;i++){var bullet:BaseBullet=new BaseBullet();bullet.sourceRole=pet;bullet.funcWhenDestroy=function(b:BaseBullet):void{callbacks.calls++;};world.addChild(bullet);bullets.push(bullet);pet.magicBulletArray.push(bullet);}
  if(mode=='detached'){world.removeChild(pet);pet.removeChild(body);}
  pet.destroy();var immediate:Object=snapshot(pet,body,hero,partner,otherHero,effect,bullets,callbacks);
  immediate.jobs=TweenMax.jobs.length;immediate.duration=TweenMax.jobs[0].duration;immediate.targetMatches=TweenMax.jobs[0].target===pet;immediate.callbackOwnerMatches=TweenMax.jobs[0].params.onCompleteParams[0]===pet;
  if(mode=='repeat')pet.destroy();var repeated:Object=snapshot(pet,body,hero,partner,otherHero,effect,bullets,callbacks);
  TweenMax.complete();var completed:Object=snapshot(pet,body,hero,partner,otherHero,effect,bullets,callbacks);
  output.push({id:'p'+owner+'-'+mode,immediate:immediate,repeated:repeated,completed:completed});
 }
 var file:File=new File(File.applicationDirectory.resolvePath('observations.json').nativePath),stream:FileStream=new FileStream();stream.open(file,FileMode.WRITE);stream.writeUTFBytes(JSON.stringify(output));stream.close();trace('COMPLETE '+output.length);NativeApplication.nativeApplication.exit();
}
private function snapshot(p:BasePet,b:Body,h:Hero,other:BasePet,oh:Hero,e:Object,bullets:Array,callbacks:Object):Object{
 var items:Array=[];for each(var bullet:BaseBullet in bullets)items.push({ready:bullet.isReadyToDestroy,parentNull:bullet.parent==null,sourceNull:bullet.sourceRole==null,infoNull:bullet.sourceRoleAttackInfoObject==null,imgNull:bullet.imgMc==null,frameCallbackNull:bullet.funcWhenEnterFrame==null});
 return {ready:p.isReadyToDestroy,sourceNull:p.sourceRole==null,ownerPetNull:h.myPet==null,parentNull:p.parent==null,bodyParentNull:b.parent==null,bodyData:b.bmdArray.length,bodyCallbacksNull:b.enterFrameFunc==null&&b.exitFrameFunc==null&&b.addFrameScriptWhenFrameOver==null,bodyReferenceRetained:p.bbdc===b,effectNull:p.curAddEffect==null,effectCalls:e.calls,bulletCount:p.magicBulletArray.length,bulletCallbacks:callbacks.calls,bullets:items,protectionCleared:!p.gc.protectedPerproty.getProperty(p,"isYourFather"),partnerIntact:other.sourceRole===oh&&oh.myPet===other};
}
}}
