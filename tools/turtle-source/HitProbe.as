package {import flash.display.Sprite;import flash.desktop.NativeApplication;import flash.system.Capabilities;
public class HitProbe extends Sprite {
public function HitProbe(){try{run();trace('COMPLETE');NativeApplication.nativeApplication.exit(0);}catch(e:Error){trace('FAIL '+e.getStackTrace());NativeApplication.nativeApplication.exit(1);}}
private function run():void {
trace('ENV '+Capabilities.version);
var cache:HitBullet=new HitBullet();cache.sourceRefresh();cache.sourceRole.power=145.9;
trace('CASE '+JSON.stringify({id:'snapshot-before',hurt:cache._hurt,atk:cache._atk}));cache.sourceRefresh();
trace('CASE '+JSON.stringify({id:'snapshot-after',hurt:cache._hurt,atk:cache._atk}));
for each(var interval:int in [6,7,999])for each(var accepts:Boolean in [true,false]) {
 var b:HitBullet=new HitBullet();b.attackInterval=interval;
 var target:Object={beAttackIdArray:[],calls:0,beMagicAttack:function(b:Object,p:Object):Boolean{target.calls++;return accepts;}};
 b.gc.pWorld.monsterArray=[target];
 for(var tick:int=0;tick<16;tick++){b.checkAttack();trace('CASE '+JSON.stringify({id:interval+'-'+accepts+'-'+tick,attackId:b.id,count:b.maxAttackCount,calls:target.calls,seen:target.beAttackIdArray.concat(),refresh:b.refresh}));}
}
for each(var kind:String in ['physics','magic'])for each(var defense:Number in [-200,0,20,100,200]) {
 b=new HitBullet();b.sourceRoleAttackInfoObject.attackKind=kind;var d:Defense=new Defense();d.def=defense;d.mDef=defense/100;
 trace('CASE '+JSON.stringify({id:'defense-'+kind+'-'+defense,hurt:d.getRealHurt(101,b,new BasePet())}));
}
}}
}
