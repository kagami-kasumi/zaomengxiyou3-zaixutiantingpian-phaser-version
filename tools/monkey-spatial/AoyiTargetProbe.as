package {
import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.geom.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class AoyiTargetProbe extends Sprite {
private var input:Object;
public function AoyiTargetProbe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);});
var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("inputs.json"),FileMode.READ);input=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();
var l:Loader=new Loader();l.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{l.unload();run();});
fs.open(new File(input.sourcePath),FileMode.READ);var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;l.loadBytes(bytes,context);}
private function run():void {var count:int=0;for each(var fps:int in [20,24,30])for each(var owner:int in [1,2])for each(var mode:String in input.modes)for each(var choose:Number in input.choices)for each(var side:Number in input.sides){sample(fps,owner,mode,choose,side);count++;}trace("COMPLETE "+count);NativeApplication.nativeApplication.exit(0);}
private function sample(fps:int,owner:int,mode:String,choose:Number,side:Number):void {
var actor:Monkey4=new Monkey4(input.body);actor.gc.frameClips=fps;actor.gc.sid=owner;actor.sourceRole.sid=owner;
actor.x=300;actor.y=350;actor.gc.gameSence.addChild(actor);actor._petInfo.skills={lyq:true,xj:true,lj:true};actor.gc.randomValues=[choose,side];
var monsters:Array=[];
for each(var spec:Object in input.targets){var m:BaseMonster=new BaseMonster();m.removeChild(m.colipse);var type:Class=getDefinitionByName(spec.symbol) as Class;
m.colipse=new type();m.colipse.scaleX=spec.scaleX;m.addChild(m.colipse);m.name=spec.id;m.x=spec.x;m.y=spec.y;m.dead=mode=="dead-first"&&spec.id=="B";actor.gc.gameSence.addChild(m);monsters.push(m);}
actor.gc.pWorld.monsterArray=monsters.concat();actor.startAoyi();var rows:Array=[];
for(var tick:int=1;tick<=140;tick++){
if(tick==32){
if(mode=="enter"||mode=="leave-enter")monsters[0].x=input.targets[0].x+80;
if(mode=="leave-enter")monsters[1].x=input.targets[1].x+1000;
if(mode=="reorder")actor.gc.pWorld.monsterArray=monsters.concat().reverse();
if(mode=="empty-reenter")actor.gc.pWorld.monsterArray=[];
if(mode=="scene-shift")actor.gc.gameSence.x=10;
if(mode=="scene-flip"){actor.gc.gameSence.x=940;actor.gc.gameSence.scaleX=-1;}}
if(tick==58&&mode=="empty-reenter")actor.gc.pWorld.monsterArray=monsters.concat();
var beforeRandom:int=actor.gc.randomIndex;actor.events=[];actor.gc.events=[];actor.bbdc.step();
if(actor.gc.randomIndex!=beforeRandom||tick==32||tick==58||tick==140){
var candidates:Array=[];for each(m in actor.gc.pWorld.monsterArray){var r:Rectangle=m.colipse.getBounds(actor.gc.gameSence.parent);candidates.push({id:m.name,x:m.x,y:m.y,dead:m.dead,left:r.x,width:r.width});}
rows.push({tick:tick,randomBefore:beforeRandom,randomAfter:actor.gc.randomIndex,target:actor.curAttackTarget?actor.curAttackTarget.name:null,x:actor.x,y:actor.y,action:actor.curAction,mp:actor._petInfo.mp,candidates:candidates,events:actor.events.concat()});}
}
trace("CASE "+JSON.stringify({fps:fps,owner:owner,mode:mode,choose:choose,side:side,rows:rows}));
}
}}
