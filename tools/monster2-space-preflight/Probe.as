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
    public function Probe() {
        loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR, function(e:UncaughtErrorEvent):void {
            trace('FAIL ' + e.error); e.preventDefault(); NativeApplication.nativeApplication.exit(1);
        });
        stage.scaleMode = StageScaleMode.NO_SCALE;
        stage.align = StageAlign.TOP_LEFT;
        loader.contentLoaderInfo.addEventListener(Event.COMPLETE, loaded);
        var stream:FileStream = new FileStream();
        stream.open(File.applicationDirectory.resolvePath('main-library.swf'), FileMode.READ);
        var bytes:ByteArray = new ByteArray(); stream.readBytes(bytes); stream.close();
        var context:LoaderContext = new LoaderContext(false, new ApplicationDomain(null));
        context.allowCodeImport = true; loader.loadBytes(bytes, context);
    }
    private function loaded(e:Event):void {
        TweenMax.backend = loader.contentLoaderInfo.applicationDomain.getDefinition('com.greensock.TweenMax') as Class;
        for each(var fps:int in [20,24,30]) for each(var owner:int in [1,2]) {
            for each(var order:String in ['tween-only','move-then-tween','tween-then-move']) run(fps, owner, order);
        }
        trace('RUNTIME ' + Capabilities.version);
        for each(var row:Object in rows) trace('ROW ' + JSON.stringify(row));
        trace('COMPLETE ' + rows.length); NativeApplication.nativeApplication.exit();
    }
    private function run(fps:int, owner:int, order:String):void {
        var hero:BaseHero = new BaseHero(); hero.x = owner == 1 ? 100 : 700; hero.y = 300;
        hero.speed.x = owner == 1 ? 5 : -5; hero.speed.y = 2;
        var world:Sprite = new Sprite(); addChild(world); world.addChild(hero);
        var source:MonsterProbe = new MonsterProbe(); source.x = 400; source.y = 300;
        source.gc = {gameSence:world, getPlayerArray:function():Array { return [hero]; }};
        source.doHi2(owner - 1);
        var tween:Object = TweenMax.last;
        tween.pause(); tween.renderTime(0,true,true);
        rows.push({fps:fps,owner:owner,order:order,tick:0,x:hero.x,y:hero.y});
        for(var tick:int = 1; tick <= fps; tick++) {
            if(order == 'move-then-tween') hero.runMove();
            tween.renderTime(tick / fps,true,true);
            if(order == 'tween-then-move') hero.runMove();
            rows.push({fps:fps,owner:owner,order:order,tick:tick,x:hero.x,y:hero.y});
        }
        tween.kill(); removeChild(world);
    }
}
}
