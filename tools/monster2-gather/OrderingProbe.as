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
    private var early:Sprite = new Sprite();
    private var late:Sprite;
    private var hero:BaseHero = new BaseHero();
    private var tick:int = 0;
    private var rows:Array = [];
    private var tween:Object;
    public function Probe() {
        loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR, function(e:UncaughtErrorEvent):void {
            trace('FAIL ' + e.error); e.preventDefault(); NativeApplication.nativeApplication.exit(1);
        });
        stage.frameRate = 24;
        early.addEventListener(Event.ENTER_FRAME, before);
        loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loaded);
        var stream:FileStream = new FileStream();
        stream.open(File.applicationDirectory.resolvePath('main-library.swf'), FileMode.READ);
        var bytes:ByteArray = new ByteArray(); stream.readBytes(bytes); stream.close();
        var context:LoaderContext = new LoaderContext(false, new ApplicationDomain(null));
        context.allowCodeImport = true; loader.loadBytes(bytes, context);
    }
    private function record(phase:String):void {
        rows.push({phase:phase,tick:tick,ms:getTimer(),x:hero.x,y:hero.y,time:tween?tween.cachedTime:-1});
    }
    private function loaded(e:Event):void {
        TweenMax.backend = loader.contentLoaderInfo.applicationDomain.getDefinition('com.greensock.TweenMax') as Class;
        hero.x=100;hero.y=300;hero.speed.x=5;hero.speed.y=2;
        tween=TweenMax.backend.to(hero,1,{x:400,y:250,onUpdate:function():void{record('tween');}});
        late=new Sprite();late.addEventListener(Event.ENTER_FRAME,after);
        stage.addEventListener(Event.EXIT_FRAME,exitFrame);
    }
    private function before(e:Event):void {
        if(!tween)return;
        ++tick;record('early-before');hero.runMove();record('early-after');
    }
    private function after(e:Event):void {record('late');}
    private function exitFrame(e:Event):void {
        record('exit');
        if(tick==12){early.removeEventListener(Event.ENTER_FRAME,before);early.addEventListener(Event.ENTER_FRAME,before);}
        if(tick>=32){
            for each(var row:Object in rows)trace('ROW '+JSON.stringify(row));
            trace('RUNTIME '+Capabilities.version);trace('COMPLETE');NativeApplication.nativeApplication.exit();
        }
    }
}
}
