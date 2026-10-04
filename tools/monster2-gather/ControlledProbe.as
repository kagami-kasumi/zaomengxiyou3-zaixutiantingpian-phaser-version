package {
import flash.display.*;
import flash.events.*;
import flash.filesystem.*;
import flash.system.*;
import flash.utils.*;
import flash.desktop.NativeApplication;
import com.greensock.TweenMax;

public class Probe extends Sprite {
    private var loader:Loader = new Loader();
    private var rows:Array = [];
    private var lite:Class;
    public function Probe() {
        loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR, function(e:UncaughtErrorEvent):void {
            trace('FAIL ' + e.error); e.preventDefault(); NativeApplication.nativeApplication.exit(1);
        });
        loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loaded);
        var stream:FileStream = new FileStream();
        stream.open(File.applicationDirectory.resolvePath('main-library.swf'), FileMode.READ);
        var bytes:ByteArray = new ByteArray(); stream.readBytes(bytes); stream.close();
        var context:LoaderContext = new LoaderContext(false, new ApplicationDomain(null));
        context.allowCodeImport = true; loader.loadBytes(bytes, context);
    }
    private function loaded(e:Event):void {
        TweenMax.backend=loader.contentLoaderInfo.applicationDomain.getDefinition('com.greensock.TweenMax') as Class;
        lite=loader.contentLoaderInfo.applicationDomain.getDefinition('com.greensock.TweenLite') as Class;
        TweenMax.backend.to({x:0},1,{x:1});
        for each(var fps:int in [20,24,30])for each(var owner:int in [1,2,3])
            for each(var mode:String in ['plain','move-before','move-after','pause','overwrite','source-detach','hero-detach','kill'])run(fps,owner,mode);
        for each(var row:Object in rows)trace('ROW '+JSON.stringify(row));
        trace('RUNTIME '+Capabilities.version);trace('COMPLETE');NativeApplication.nativeApplication.exit();
    }
    private function run(fps:int,owner:int,mode:String):void {
        TweenMax.backend.killAll(false);lite.rootTimeline.renderTime(0,false,false);
        var world:Sprite=new Sprite();addChild(world);
        var heroes:Array=[];
        for each(var slot:int in owner==3?[1,2]:[owner]) {
            var h:BaseHero=new BaseHero();h.name=String(slot);h.x=slot==1?100:700;h.y=slot==1?300:180;
            h.speed.x=slot==1?5:-5;h.speed.y=2;heroes.push(h);world.addChild(h);
        }
        var source:MonsterProbe=new MonsterProbe();source.x=400;source.y=300;world.addChild(source);
        source.gc={gameSence:world,getPlayerArray:function():Array{return heroes;}};source.doHi2(0);
        for(var tick:int=0;tick<=fps*2;tick++) {
            if(mode=='move-before'&&tick)for each(h in heroes)h.runMove();
            lite.rootTimeline.renderTime(tick/fps,false,false);
            if(mode=='move-after'&&tick)for each(h in heroes)h.runMove();
            if(tick==int(fps/4)) {
                if(mode=='pause')TweenMax.backend.pauseAll(true,true);
                if(mode=='overwrite'){source.x=600;source.y=200;source.doHi2(1);}
                if(mode=='source-detach')world.removeChild(source);
                if(mode=='hero-detach')for each(h in heroes)world.removeChild(h);
                if(mode=='kill')TweenMax.backend.killAll(false);
            }
            if(mode=='pause'&&tick==int(fps*3/4))TweenMax.backend.resumeAll();
            for each(h in heroes)rows.push({fps:fps,owner:owner,slot:int(h.name),mode:mode,tick:tick,x:h.x,y:h.y,parent:h.parent!=null});
        }
        TweenMax.backend.killAll(false);removeChild(world);
    }
}
}
