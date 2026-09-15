package {import flash.display.Sprite;import flash.desktop.NativeApplication;import flash.system.Capabilities;import config.Config;import my.ANumber;
public class SettlementProbe extends Sprite {
public function SettlementProbe(){try{run();trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}catch(e:Error){trace('FAIL '+e.getStackTrace());NativeApplication.nativeApplication.exit(1);}}
private function run():void {
 trace('ENV '+Capabilities.version);
 for(var owner:int=1;owner<=2;owner++)for each(var n:int in [0,1,19,20,21,99,100,101,2001])for(var link:int=0;link<4;link++)for each(var heal:Boolean in [false,true]) {
  var h:BaseHero=new BaseHero(),p:BasePet=new BasePet();h.pet=p;p.sourceRole=h;h.sid=owner;
  h.roleProperies.setHHP(200);p._petInfo.setHp(200);ANumber.calls=[];
  if(link&1){h.curAddEffect=new BaseAddEffect();h.curAddEffect.sourceRole=h;h.curAddEffect.curEffectArray.push({name:BaseAddEffect.PETTURTKE_BUFF});}
  if(link&2){p.curAddEffect=new BaseAddEffect();p.curAddEffect.curEffectArray.push({name:BaseAddEffect.PETTURTKE_BUFF});}
  if(heal)h.cureHp(n);else h.reduceHp(n);
  trace('CASE '+JSON.stringify({id:owner+'-'+n+'-'+link+'-'+heal,hp:h.roleProperies.getHHP(),petHp:p._petInfo.getHp(),values:ANumber.calls.map(function(c:Object,i:int,a:Array):int{return c.value;})}));
 }
}}
}
