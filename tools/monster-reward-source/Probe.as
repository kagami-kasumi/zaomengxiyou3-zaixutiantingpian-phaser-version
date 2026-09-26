package {
import flash.display.Sprite;
import flash.desktop.NativeApplication;
import flash.system.Capabilities;
public class Probe extends Sprite {
  public function Probe() {
    trace('ENV '+Capabilities.version);
    for each(var exp:int in [1,7,101,1000]) for(var owner:int=0;owner<2;owner++) {
      for each(var scenario:String in ['none','hero','hero-pet','pet','fire-retains-pet',
        'later-hero','later-pet','ai-retains','dead-before-fire','retired-before-fire',
        'retired-cleared','retired-reselected','dead-ai-clear','dead-ai-next',
        'frozen-ai','hero-new-pet','old-pet-new-active','dodge','protected','miss',
        'accepted-no-info','hero-no-player','hero-retired-clear','out-of-range',
        'hero-merchant','dead-hero-before-fire','dead-hero-cleared','no-live-heroes','retired-world-lethal','retired-world-one-wait','retired-world-two-waits','dead-world-lethal','hurt-ai']) {
        run(scenario,owner,exp);
      }
    }
    trace('COMPLETE'); NativeApplication.nativeApplication.exit(0);
  }
  private function run(s:String,owner:int,exp:int):void {
    var h1:BaseHero=new BaseHero(),h2:BaseHero=new BaseHero();h1.id='h1';h2.id='h2';
    h1.x=400;h2.x=100;
    var heroes:Array=[h1,h2],h:BaseHero=heroes[owner],other:BaseHero=heroes[1-owner];
    // Make the OTHER owner the nearest AI candidate (same digit width).
    h.x=400;other.x=100;
    var old:BasePet=new BasePet(),fresh:BasePet=new BasePet(),op:BasePet=new BasePet();
    old.id='old';fresh.id='fresh';op.id='other-pet';
    old.sourceRole=h;old.owner=h;fresh.sourceRole=h;fresh.owner=h;op.sourceRole=other;op.owner=other;
    var m:BaseMonster=new ProbeMonster();m.gc.hero1=h1;m.gc.hero2=h2;
    m.protectedParamsObject.exp=exp;
    var bullet:BaseBullet=new BaseBullet(),accepted:Boolean=true;
    HitTest.accept=true;AUtils.accept=true;
    if(s=='none') {}
    else if(s=='hero') {m.beMagicAttack(bullet,h,true);}
    else if(s=='hero-pet'||s=='hero-new-pet'||s=='hero-merchant') {
      h.myPet=old;m.beMagicAttack(bullet,h,true);
      if(s=='hero-new-pet')h.myPet=fresh;
      if(s=='hero-merchant')h.curAddEffect.buff={hurt:13};
    }
    else if(s=='hero-no-player') {h.roleProperies.who=null;m.beMagicAttack(bullet,h,true);}
    else if(s=='hero-retired-clear'||s=='dead-hero-before-fire'||s=='dead-hero-cleared') {
      m.beMagicAttack(bullet,h,true);
      if(s=='hero-retired-clear')h.isReadyToDestroy=true;else h.hp=0;
      if(s!='dead-hero-before-fire')m.cleanup();
    }
    else if(s=='out-of-range'||s=='no-live-heroes') {
      if(s=='out-of-range')m.alertRange=10;else {h1.hp=0;h2.hp=0;}
      m.ai();
    }
    else {
      h.myPet=old;other.myPet=op;
      m.curAttackTarget=other;
      m.beMagicAttack(bullet,old,true);
      if(s=='later-hero')m.beMagicAttack(bullet,other,true);
      if(s=='later-pet')m.beMagicAttack(bullet,op,true);
      if(s=='ai-retains')m.ai();
      if(s=='dead-before-fire'||s=='dead-ai-clear'||s=='dead-ai-next')old.hp=0;
      if(s=='dead-ai-clear'||s=='dead-ai-next')m.ai();
      if(s=='dead-ai-next')m.ai();
      if(s=='retired-before-fire'||s=='retired-cleared'||s=='retired-reselected'||s=='old-pet-new-active')old.retire();
      if(s=='old-pet-new-active')h.myPet=fresh;
      if(s=='retired-cleared'||s=='retired-reselected')m.cleanup();
      if(s=='retired-reselected')m.ai();
      if(s=='hurt-ai'){m.curAttackTarget=null;m.curAction='hurt';m.ai();}
      if(s=='frozen-ai') {m.curAttackTarget=null;m.curAddEffect.blocked=true;m.ai();}
      if(s.indexOf('world')>=0){
        if(s=='dead-world-lethal')old.hp=0;else old.retire();
        m.curAddEffect.sourceRole=m;
        if(s=='retired-world-one-wait'||s=='retired-world-two-waits')m.step();
        if(s=='retired-world-two-waits')m.step();
      }
      if(s=='dodge'||s=='protected'||s=='miss'||s=='accepted-no-info') {
        if(s=='dodge')m.gc.roll=0;
        if(s=='protected')m.gc.protectedHit=true;
        if(s=='miss')HitTest.accept=false;
        if(s=='accepted-no-info')bullet.sourceRoleAttackInfoObject=null;
        accepted=m.beMagicAttack(bullet,other,false);
      }
    }
    var before:String=m.curAttackTarget?m.curAttackTarget.id:'none';
    var effect:BaseAddEffect=new BaseAddEffect();effect.sourceRole=m;
    if(s.indexOf('world')>=0){m.curAddEffect.damage=1000;m.step();}
    else if(s=='hero'||s=='hero-pet'||s=='pet')m.reduceHp(1000,true);
    else effect.fire(1000);
    var first:Array=snapshot(h1,h2,old,fresh,op);
    m.reduceHp(1000);effect.fire(1000);
    trace('CASE '+JSON.stringify({id:s+'/'+owner+'/'+exp,scenario:s,owner:owner,exp:exp,
      target:before,targetAfter:m.curAttackTarget?m.curAttackTarget.id:'none',accepted:accepted,first:first,repeat:snapshot(h1,h2,old,fresh,op),
      healed:h.healed,action:m.curAction,petUpdates:[old.petInfo.updates,fresh.petInfo.updates,op.petInfo.updates],
      persisted:[h1.roleProperies.persisted,h2.roleProperies.persisted]}));
  }
  private function snapshot(h1:BaseHero,h2:BaseHero,old:BasePet,fresh:BasePet,op:BasePet):Array {
    return [h1.roleProperies.getExper(),h2.roleProperies.getExper(),old.petInfo.getCurExper(),fresh.petInfo.getCurExper(),op.petInfo.getCurExper()];
  }
}
}
