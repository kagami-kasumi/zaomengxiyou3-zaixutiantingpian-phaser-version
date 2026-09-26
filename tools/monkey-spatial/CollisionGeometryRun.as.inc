private function run():void {
stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
var count:int=0;
for each(var group:Object in config.groups){
var effect:DisplayObject=build(config.sources[group.sourceIndex],group.cid,group.phase);
var target:DisplayObject=build(config.sources[group.targetSourceIndex],group.targetCid,null);
effect.x=470;effect.y=350;effect.scaleX=group.direction;target.scaleX=group.targetScaleX;
addChild(effect);addChild(target);
for each(var input:Object in group.cases){
target.x=470+input.x;target.y=350+input.y;
var hit:Boolean=HitTest.complexHitTestObject(effect,target);
trace("CASE "+JSON.stringify({index:input.index,hit:hit}));count++;
}
removeChild(effect);removeChild(target);
for each(var entry:Object in used){if(entry.shape.parent)entry.shape.parent.removeChild(entry.shape);pools[String(entry.cid)].push(entry.shape);}used=[];
}
trace("COMPLETE "+count);NativeApplication.nativeApplication.exit(0);
}
