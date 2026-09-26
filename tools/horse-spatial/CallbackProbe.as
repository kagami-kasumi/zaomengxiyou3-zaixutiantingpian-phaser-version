package {
    import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;
    import flash.desktop.NativeApplication;
    public class CallbackProbe extends Sprite {
        private var inputs:Object;
        private var cases:int=0;
        public function CallbackProbe() {
            loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void {
                trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);
            });
            var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("inputs.json"),FileMode.READ);
            inputs=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();
            for each(var spec:Object in inputs.forms) for each(var fps:int in [20,24,30]) for each(var direction:int in [0,1]) for each(var local:Boolean in [true,false]) {
                for each(var action:Object in spec.actions) sample(spec,fps,direction,local,action.action,-1,false,false);
            }
            for each(fps in [20,24,30]) for(var skills:int=0;skills<8;skills++) {
                sample(inputs.forms[3],fps,1,true,"hit5",skills,false,false);
                sample(inputs.forms[3],fps,1,true,"hit5",skills,true,false);
                sample(inputs.forms[3],fps,1,true,"hit5",skills,false,true);
            }
            trace("COMPLETE "+cases);NativeApplication.nativeApplication.exit(0);
        }
        private function sample(spec:Object,fps:int,direction:int,local:Boolean,action:String,skills:int,noTarget:Boolean,hurt:Boolean):void {
            var classes:Array=[Horse1,Horse2,Horse3,Horse4];var type:Class=classes[spec.form-1];
            var actor:*=new type(spec);actor.gc.frameClips=fps;actor.gc.sid=local?1:2;
            actor.x=300;actor.y=350;actor.bbdc.setDirect(direction);
            var monster:BaseMonster=new BaseMonster();monster.x=600;monster.y=350;
            actor.gc.gameSence.addChild(monster);actor.gc.pWorld.monsterArray=noTarget?[]:[monster];
            if(skills>=0){actor._petInfo.skills={bd:Boolean(skills&1),sp:Boolean(skills&2),bz:Boolean(skills&4)};actor.startAoyi();}
            else actor.setAction(action);
            var rows:Array=[];
            for(var tick:int=1;tick<=160;tick++) {
                actor.events=[];actor.gc.events=[];
                if(hurt&&tick==9)actor.setAction("hurt");
                var before:Object={action:actor.curAction,column:actor.bbdc.getCurPoint().x,row:actor.bbdc.getCurPoint().y,count:actor.bbdc.getCurFrameCount()};
                if(!actor.dead)actor.bbdc.step();
                rows.push({tick:tick,before:before,action:actor.curAction,column:actor.bbdc.getCurPoint().x,row:actor.bbdc.getCurPoint().y,
                    count:actor.bbdc.getCurFrameCount(),x:actor.x,y:actor.y,dead:actor.dead,events:actor.events.concat(),network:actor.gc.events.concat()});
            }
            trace("CASE "+JSON.stringify({form:spec.form,fps:fps,direction:direction,local:local,action:action,skills:skills,noTarget:noTarget,hurt:hurt,rows:rows}));
            cases++;
        }
    }
}
