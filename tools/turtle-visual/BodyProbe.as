package {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    import flash.system.*;
    import flash.utils.*;
    import flash.filesystem.*;
    import flash.desktop.NativeApplication;
    public class BodyProbe extends Sprite {
        private var inputs:Object;
        private var source:Loader=new Loader();
        public function BodyProbe() {
            stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
            loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void {
                trace("FAIL "+e.error);e.preventDefault();NativeApplication.nativeApplication.exit(1);
            });
            var stream:FileStream=new FileStream();stream.open(File.applicationDirectory.resolvePath("inputs.json"),FileMode.READ);
            inputs=JSON.parse(stream.readUTFBytes(stream.bytesAvailable));stream.close();
            stream.open(File.applicationDirectory.resolvePath("body-source.swf"),FileMode.READ);
            var bytes:ByteArray=new ByteArray();stream.readBytes(bytes);stream.close();
            source.contentLoaderInfo.addEventListener(Event.COMPLETE,run);
            var context:LoaderContext=new LoaderContext(false,new ApplicationDomain());context.allowCodeImport=true;
            source.loadBytes(bytes,context);
        }
        private function run(e:Event):void {
            var total:int=0;
            var container:DisplayObjectContainer=source.content as DisplayObjectContainer;
            for each(var spec:Object in inputs.forms) {
                var atlas:DisplayObject=container.getChildAt(spec.form-1);
                var bounds:Rectangle=atlas.getBounds(atlas);
                var bitmap:BitmapData=new BitmapData(bounds.width,bounds.height,true,0);bitmap.draw(atlas);
                var flipped:BitmapData=new BitmapData(bitmap.width,bitmap.height,true,0);
                flipped.draw(bitmap,new Matrix(-1,0,0,1,bitmap.width,0));
                var holds:Array=[],counts:Array=[];
                for each(var row:Object in spec.rows) {
                    var stops:Array=[];for each(var cell:Object in row.cells)stops.push(cell.holdTicks);
                    holds.push(stops);counts.push(row.cells.length);
                }
                for(var direct:int=0;direct<2;direct++) {
                    var clip:BodyClip=new BodyClip([{name:"body",source:[bitmap,flipped]}],spec.cellSize[0],spec.cellSize[1],new Point());
                    clip.setFrameStopCount(holds);clip.setFrameCount(counts);clip.setFramePointY(0);
                    clip.setOffsetXY(spec.offset[0],spec.offset[1]);clip.setDirect(direct);
                    for each(row in spec.rows)for each(cell in row.cells) {
                        clip.setFramePointX(cell.column);clip.setFramePointY(row.row);
                        for each(var owner:Object in [{id:"P1",x:300,y:350},{id:"P2",x:640,y:350}]) {
                            var id:String="turtle"+spec.form+"-r"+row.row+"-c"+cell.column+"-d"+direct+"-"+owner.id;
                            var canvas:BitmapData=new BitmapData(940,590,true,0);
                            canvas.draw(clip,new Matrix(1,0,0,1,owner.x+clip.x,owner.y+clip.y));
                            save(id,canvas);
                            trace("CELL "+JSON.stringify({id:id,form:spec.form,row:row.row,column:cell.column,direct:direct,
                                owner:owner.id,root:{x:owner.x,y:owner.y},offset:{x:clip.x,y:clip.y},
                                visibleBounds:rect(canvas.getColorBoundsRect(0xff000000,0,false)),file:"baselines/"+id+".png"}));
                            canvas.dispose();total++;
                        }
                    }
                    for each(row in spec.rows) {
                        clip.setFramePointX(0);clip.setFramePointY(row.row);clip.setState("row-"+row.row);
                        var events:Array=[];
                        clip.setEnterFrameCallBack(function(point:Point):void{events.push({phase:"enter",column:point.x,row:point.y,count:clip.getCurFrameCount()});},
                            function(point:Point):void{events.push({phase:"exit",column:point.x,row:point.y,count:clip.getCurFrameCount()});});
                        clip.setAddScriptWhenFrameOver(function(n:int):void{events.push({phase:"over",row:n});clip.setFramePointX(0);});
                        for(var tick:int=1;tick<=row.totalHostTicks+1;tick++) {
                            events=[];clip.step();trace("CLOCK "+JSON.stringify({form:spec.form,direct:direct,row:row.row,tick:tick,events:events}));
                        }
                    }
                }
                bitmap.dispose();flipped.dispose();
            }
            trace("COMPLETE "+total);NativeApplication.nativeApplication.exit(0);
        }
        private static function rect(r:Rectangle):Object{return {x:r.x,y:r.y,width:r.width,height:r.height};}
        private static function save(id:String,canvas:BitmapData):void {
            var target:File=new File(File.applicationDirectory.nativePath).resolvePath("baselines/"+id+".png");target.parent.createDirectory();
            var stream:FileStream=new FileStream();stream.open(target,FileMode.WRITE);
            stream.writeBytes(canvas.encode(canvas.rect,new PNGEncoderOptions()));stream.close();
        }
    }
}
