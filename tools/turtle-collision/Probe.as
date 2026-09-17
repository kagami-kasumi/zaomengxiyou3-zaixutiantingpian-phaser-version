package {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    import flash.system.*;
    import flash.utils.*;
    import flash.filesystem.*;
    import flash.desktop.NativeApplication;
    import my.HitTest;

    public class Probe extends Sprite {
        private var loader:Loader=new Loader();
        private var config:Object;
        private var source:DisplayObjectContainer;
        private var tick:int=0;
        private var count:int=0;
        public function Probe() {
            stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
            var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath('fixtures.json'),FileMode.READ);
            config=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);
            fs.open(File.applicationDirectory.resolvePath('source.swf'),FileMode.READ);
            var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();
            var ctx:LoaderContext=new LoaderContext(false,new ApplicationDomain());ctx.allowCodeImport=true;
            addChild(loader);loader.loadBytes(bytes,ctx);
        }
        private function reset(d:DisplayObject,play:Boolean):void {
            if(d is MovieClip) {if(play)MovieClip(d).play();else MovieClip(d).gotoAndStop(1);}
            if(d is DisplayObjectContainer)for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++)reset(DisplayObjectContainer(d).getChildAt(i),play);
        }
        private function loaded(e:Event):void {
            source=loader.content as DisplayObjectContainer;
            reset(source,false);
            trace('ENV '+JSON.stringify({runtime:Capabilities.version,fps:stage.frameRate,quality:stage.quality}));
            if(!config.diagnostic)for(var ti:int=0;ti<3;ti++)targetFields(source.getChildAt(config.effects.length+ti),ti);
            capture();reset(source,true);stage.addEventListener(Event.EXIT_FRAME,step);
        }
        private function targetFields(target:DisplayObject,index:int):void {
            var scale:Number=index==2?1:2;
            var ox:int=150,oy:int=150;
            var data:BitmapData=new BitmapData(300,300,false,0);
            for(var py:int=0;py<20;py++)for(var px:int=0;px<20;px++) {
                data.fillRect(data.rect,0);
                data.draw(target,new Matrix(scale,0,0,1,ox+px/20,oy+py/20),
                    new ColorTransform(1,1,1,1,255,-255,-255,255));
                save(data,'targets/t'+index+'-'+(py*20+px));
            }
            data.dispose();
        }
        private function step(e:Event):void {tick++;capture();}
        private function capture():void {
            try {
                if(config.ticks.indexOf(tick)>=0)for(var i:int=0;i<config.effects.length;i++) {
                    var spec:Object=config.effects[i],clip:MovieClip=source.getChildAt(i) as MovieClip;
                    trace('TREE '+JSON.stringify({symbol:spec.symbol,tick:tick,tree:clock(clip)}));
                    if(config.diagnostic) {if(i==2 && tick==config.diagnosticTick)diagnostic(clip);}
                    else if(!spec.sampleTicks || spec.sampleTicks.indexOf(tick)>=0)
                        for each(var scale:int in spec.scales)for each(var sign:int in [1,-1])sample(clip,spec.symbol,scale,sign);
                }
                if(tick==config.lastTick) {trace('COMPLETE '+count);NativeApplication.nativeApplication.exit(0);}
            } catch(error:Error) {trace('FAIL '+error.getStackTrace());NativeApplication.nativeApplication.exit(1);}
        }
        private function diagnostic(clip:MovieClip):void {
            if(config.clipDiagnostic) {
                for each(var extent:int in [100,128,256,512])for each(var offset:int in [0,1,8,32,64,128]) {
                    var viewport:BitmapData=new BitmapData(extent+offset,extent+offset,false,0xff0000);
                    viewport.draw(clip,new Matrix(-1,0,0,1,49.95+offset,69.64999999999998+offset),
                        new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
                    save(viewport,'clip19/size-'+extent+'-shift-'+offset);viewport.dispose();
                }
                return;
            }
            if(config.fineLocal) {
                var small:BitmapData=new BitmapData(256,256,false,0xff0000);
                for(var fy:int=0;fy<20;fy++)for(var fx:int=0;fx<20;fx++) {
                    small.fillRect(small.rect,0xff0000);
                    small.draw(clip,new Matrix(-1,0,0,1,128+fx/20,128+fy/20),
                        new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
                    save(small,'fine-local19/phase-'+(fy*20+fx));
                }
                small.dispose();return;
            }
            if(config.tileDiagnostic) {
                tiledFields(clip,'PetTurtle1Bullet2-'+tick+'-s1-d-1',1,-1);return;
            }
            if(config.translationDiagnostic) {
                for each(var shift:int in [0,1,2,4,8,16,32,64,128,256,512,800]) {
                    var cropped:BitmapData=new BitmapData(120+shift,130+shift,false,0xff0000);
                    cropped.draw(clip,new Matrix(1,0,0,1,59.45+shift,84.14999999999998+shift),
                        new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
                    save(cropped,'translation/shift-'+shift);cropped.dispose();
                }
                trace('DIAGNOSTIC translation');return;
            }
            var b:Rectangle=clip.getBounds(clip),ox:int=-Math.floor(b.x)+4,oy:int=-Math.floor(b.y)+4;
            var width:int=Math.ceil(b.right)+ox+4,height:int=Math.ceil(b.bottom)+oy+4;
            var data:BitmapData=new BitmapData(width,height,false,0xff0000);
            for(var py:int=0;py<20;py++)for(var px:int=0;px<20;px++) {
                data.fillRect(data.rect,0xff0000);
                data.draw(clip,new Matrix(1,0,0,1,ox+px/20,oy+py/20),
                    new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
                save(data,'diagnostic/phase-'+(py*20+px));
            }
            data.dispose();
            trace('DIAGNOSTIC '+JSON.stringify({originX:ox,originY:oy,width:width,height:height}));
        }
        private function tiledFields(clip:MovieClip,key:String,scale:int,sign:int):void {
            clip.transform.matrix=new Matrix(sign*scale,0,0,scale,0,0);
            var b:Rectangle=clip.getBounds(source);
            var pad:int=config.tilePadding?config.tilePadding:0;
            var data:BitmapData=new BitmapData(128+pad*2,128+pad*2,false,0xff0000);
            for(var ty:int=Math.floor(b.y/128);ty<=Math.floor(b.bottom/128);ty++)
                for(var tx:int=Math.floor(b.x/128);tx<=Math.floor(b.right/128);tx++)
                    for(var py:int=0;py<4;py++)for(var px:int=0;px<4;px++) {
                        data.fillRect(data.rect,0xff0000);
                        data.draw(clip,new Matrix(sign*scale,0,0,scale,-tx*128+pad+px/4,-ty*128+pad+py/4),
                            new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
                        save(data,'tiles/'+key+'-'+tx+'-'+ty+'-'+(py*4+px));
                    }
            data.dispose();clip.transform.matrix=new Matrix();
        }
        private function sample(clip:MovieClip,symbol:String,scale:int,sign:int):void {
            var key:String=symbol+'-'+tick+'-s'+scale+'-d'+sign;
            clip.transform.matrix=new Matrix(sign*scale,0,0,scale,0,0);
            var b:Rectangle=clip.getBounds(source);
            var ox:int=-Math.floor(b.x)+4,oy:int=-Math.floor(b.y)+4;
            var width:int=Math.max(1,Math.ceil(b.right)+ox+4),height:int=Math.max(1,Math.ceil(b.bottom)+oy+4);
            var data:BitmapData=new BitmapData(width,height,false,0xff0000);
            // Independent source field: no target and no oracle rectangle are inputs.
            if(config.tiledSLD && symbol=='PetTurtle1Bullet2')tiledFields(clip,key,scale,sign);
            else for(var py:int=0;py<4;py++)for(var px:int=0;px<4;px++) {
                data.fillRect(data.rect,0xff0000);
                data.draw(clip,new Matrix(sign*scale,0,0,scale,ox+px/4,oy+py/4),
                    new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
                save(data,'fields/'+key+'-'+(py*4+px));
            }
            data.dispose();
            trace('FIELD '+JSON.stringify({id:key,originX:ox,originY:oy,width:width,height:height,
                layout:config.tiledSLD && symbol=='PetTurtle1Bullet2'?'tiles128':'plane'}));
            for(var ti:int=0;ti<3;ti++) {
                var target:DisplayObject=source.getChildAt(config.effects.length+ti);
                var ts:Number=ti==2?1:2;target.transform.matrix=new Matrix(ts,0,0,1,0,0);
                var t:Rectangle=target.getBounds(source);
                for each(var f:Object in config.cases) {
                    var rx:Number=f.owner=='P1'?123.25:731.75,ry:Number=f.owner=='P1'?345.75:412.25;
                    clip.transform.matrix=new Matrix(sign*scale,0,0,scale,rx,ry);
                    var x:Number=rx+f.x,y:Number=ry+f.y;
                    if(f.anchor=='center') {x+=b.x+b.width/2;y+=b.y+b.height/2;}
                    if(f.anchor=='left') {x+=b.x-t.right;y+=b.y+b.height/2;}
                    if(f.anchor=='right') {x+=b.right-t.x;y+=b.y+b.height/2;}
                    if(f.anchor=='top') {x+=b.x+b.width/2;y+=b.y-t.bottom;}
                    if(f.anchor=='bottom') {x+=b.x+b.width/2;y+=b.bottom-t.y;}
                    target.transform.matrix=new Matrix(ts,0,0,1,x,y);
                    var id:String=key+'-t'+ti+'-'+f.id;
                    var actual:Boolean=HitTest.complexHitTestObject(target,clip);
                    var row:Object=Measure.run(target,clip,id);
                    row.id=id;row.field=key;row.tick=tick;row.symbol=symbol;row.scale=scale;row.sign=sign;
                    row.targetIndex=ti;row.fixture=f.id;row.actual=actual;row.sourceRoot={x:rx,y:ry};
                    trace('CASE '+JSON.stringify(row));count++;
                }
                target.transform.matrix=new Matrix();
            }
            clip.transform.matrix=new Matrix();
        }
        private function clock(d:DisplayObject):Object {
            var r:Object={frame:d is MovieClip?MovieClip(d).currentFrame:0,children:[]};
            if(d is DisplayObjectContainer)for(var i:int=0;i<DisplayObjectContainer(d).numChildren;i++)r.children.push(clock(DisplayObjectContainer(d).getChildAt(i)));
            return r;
        }
        public static function save(data:BitmapData,id:String):void {
            var file:File=new File(File.applicationDirectory.nativePath).resolvePath(id+'.png');file.parent.createDirectory();
            var stream:FileStream=new FileStream();stream.open(file,FileMode.WRITE);
            stream.writeBytes(data.encode(data.rect,new PNGEncoderOptions()));stream.close();
        }
    }
}
import flash.display.*;
import flash.geom.*;
import my.HitTest;
class Measure extends HitTest {
    private static function rect(r:Rectangle):Object {return {x:r.x,y:r.y,width:r.width,height:r.height};}
    public static function run(a:DisplayObject,b:DisplayObject,id:String):Object {
        var q:Rectangle=intersectionRectangle(a,b);
        var row:Object={intersection:rect(q),targetBounds:rect(a.getBounds(a.root)),sourceBounds:rect(b.getBounds(b.root)),
            targetDraw:{x:getDrawMatrix(a,q,1).tx,y:getDrawMatrix(a,q,1).ty},
            sourceDraw:{x:getDrawMatrix(b,q,1).tx,y:getDrawMatrix(b,q,1).ty}};
        if(q.width<1||q.height<1)return row;
        var data:BitmapData=new BitmapData(q.width,q.height,false,0);
        data.draw(a,getDrawMatrix(a,q,1),new ColorTransform(1,1,1,1,255,-255,-255,255));
        data.draw(b,getDrawMatrix(b,q,1),new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
        Probe.save(data,'oracle/'+id);data.dispose();return row;
    }
}
