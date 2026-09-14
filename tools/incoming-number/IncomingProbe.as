package {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    import flash.system.*;
    import flash.utils.*;
    import flash.filesystem.*;
    import flash.desktop.NativeApplication;
    import my.*;
    import config.Config;
    import com.greensock.*;
    public class IncomingProbe extends Sprite {
        [Embed(source="OtherMat1.swf",mimeType="application/octet-stream")]
        private var Source:Class;
        [Embed(source="behavior-display.json",mimeType="application/octet-stream")]
        private var BehaviorDisplay:Class;
        private var loader:Loader=new Loader();
        private var scene:Sprite=new Sprite();
        public function IncomingProbe() {
            stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
            addChild(scene);Config.getInstance().gameSence=scene;
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,run);
            var ctx:LoaderContext=new LoaderContext(false,new ApplicationDomain(ApplicationDomain.currentDomain));
            ctx.allowCodeImport=true;loader.loadBytes(new Source() as ByteArray,ctx);
        }
        private function run(e:Event):void {
            try {
                AUtils.domain=loader.contentLoaderInfo.applicationDomain;
                trace("ENV "+JSON.stringify({version:Capabilities.version,playerType:Capabilities.playerType,width:stage.stageWidth,height:stage.stageHeight}));
                for each(var incoming:int in [0,1,7,20,101])trace("NUMERIC "+JSON.stringify({input:incoming,turtle:NumericSlices.turtle(incoming),role3:NumericSlices.role3(incoming)}));
                for(var d:int=0;d<10;d++) {
                    var bm:Bitmap=AUtils.getImageObj("pnum"+d);
                    png("glyph-"+d,bm.bitmapData);
                    trace("GLYPH "+JSON.stringify({digit:d,width:bm.width,height:bm.height,smoothing:bm.smoothing,pixelSnapping:bm.pixelSnapping}));
                }
                for each(var kind:String in ["hero","pet"])for each(var owner:String in ["P1","P2"])
                    for each(var t:Number in [0,0.1,0.2,0.25,0.75,1.249,1.25]) {
                        clear();var n:ANumber=new ANumber();scene.addChild(n);
                        n.aNumImage("pnum",123,owner=="P1"?280:660,kind=="hero"?290:370,20);
                        var tweens:Array=TweenMax.getTweensOf(n);
                        // Source TweenMax renderTime samples each original tween; delay belongs to its timeline.
                        for each(var tw:TweenMax in tweens)if(tw.vars.scaleX!==undefined)tw.renderTime(Math.min(t,0.2),false,true);
                        for each(tw in tweens)if(tw.vars.alpha!==undefined && t>=0.25)tw.renderTime(t-0.25,false,true);
                        capture(kind+"-"+owner+"-"+String(t),{kind:kind,owner:owner,time:t,value:123});
                    }
                for each(var count:int in [1,6,12]) {
                    clear();var q:CureHpQueue=new CureHpQueue();
                    for(var i:int=0;i<count;i++)q.addHpLose(i,450,290);
                    capture("queue-"+count+"-before",{count:count,tick:-1});
                    for(var tick:int=0;tick<5;tick++){q.step();capture("queue-"+count+"-tick-"+tick,{count:count,tick:tick});}
                }
                clear();Config.getInstance().curStage=98; q=new CureHpQueue();q.addHpLose(10,450,290);q.step();
                capture("queue-stage98",{stage:98});
                n=new ANumber();scene.addChild(n);n.aNumImage("pnum",0,450,290,20);
                capture("direct-stage98-zero",{stage:98,value:0});n.destroy();capture("explicit-destroy",{});
                for each(var value:int in [-12,0,10,1234567890]) {
                    clear();n=new ANumber();scene.addChild(n);n.aNumImage("pnum",value,450,290,20);
                    capture("direct-value-"+value,{value:value});
                }
                var displayCases:Array=JSON.parse(new BehaviorDisplay().toString()) as Array;
                for each(var displayCase:Object in displayCases)for each(owner in ["P1","P2"]) {
                    clear();
                    for each(var item:Object in displayCase.numbers) {
                        n=new ANumber();scene.addChild(n);
                        n.aNumImage("pnum",item.value,owner=="P1"?280:660,item.kind=="pet"?370:290,20);
                    }
                    capture("behavior-"+displayCase.id+"-"+owner,{sourceBehaviorExecuted:false,sourceDisplayExecuted:true,owner:owner,values:displayCase.numbers});
                }
                trace("COMPLETE");NativeApplication.nativeApplication.exit(0);
            } catch(err:Error){trace("FAIL "+err.getStackTrace());NativeApplication.nativeApplication.exit(1);}
        }
        private function clear():void {TweenMax.killAll();while(scene.numChildren)scene.removeChildAt(0);}
        private function capture(id:String,fixture:Object):void {
            var nodes:Array=[];
            for(var i:int=0;i<scene.numChildren;i++){
                var n:DisplayObjectContainer=scene.getChildAt(i) as DisplayObjectContainer;
                var children:Array=[];
                for(var j:int=0;j<n.numChildren;j++){
                    var c:Bitmap=n.getChildAt(j) as Bitmap;var r:Rectangle=c.getBounds(scene);
                    var digit:int=-1;
                    for(var k:int=0;k<10;k++)if(c.bitmapData.compare(Bitmap(AUtils.getImageObj("pnum"+k)).bitmapData)===0){digit=k;break;}
                    children.push({digit:digit,depth:j,x:c.x,y:c.y,width:c.bitmapData.width,height:c.bitmapData.height,stageBounds:{x:r.x,y:r.y,width:r.width,height:r.height},smoothing:c.smoothing,pixelSnapping:c.pixelSnapping});
                }
                nodes.push({depth:i,x:n.x,y:n.y,scaleX:n.scaleX,scaleY:n.scaleY,alpha:n.alpha,blendMode:n.blendMode,filters:n.filters,mask:n.mask,children:children});
            }
            trace("STATE "+JSON.stringify({id:id,fixture:fixture,objects:nodes}));
            var b:BitmapData=new BitmapData(940,590,true,0);b.draw(scene);png(id,b);b.dispose();
        }
        private function png(id:String,b:BitmapData):void {
            var out:File=new File(File.applicationDirectory.nativePath).resolvePath("images");out.createDirectory();
            var f:FileStream=new FileStream();f.open(out.resolvePath(id+".png"),FileMode.WRITE);
            f.writeBytes(b.encode(b.rect,new PNGEncoderOptions()));f.close();
        }
    }
}
