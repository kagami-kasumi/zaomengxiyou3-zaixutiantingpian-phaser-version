package {
    import flash.display.*;
    import flash.events.*;
    import flash.geom.*;
    import flash.system.*;
    import flash.utils.*;
    import flash.filesystem.*;
    import flash.desktop.NativeApplication;

    public class Dragon4FieldsProbe extends Sprite {
        [Embed(source="source.swf", mimeType="application/octet-stream")]
        private var SourceBytes:Class;
        private var loader:Loader=new Loader();
        private var movie:MovieClip;
        private var seen:Object={};
        private var count:int=0;

        public function Dragon4FieldsProbe() {
            stage.scaleMode=StageScaleMode.NO_SCALE;stage.align=StageAlign.TOP_LEFT;
            addChild(loader);
            loader.contentLoaderInfo.addEventListener(Event.COMPLETE,loaded);
            var context:LoaderContext=new LoaderContext(false,new ApplicationDomain());
            context.allowCodeImport=true;
            loader.loadBytes(new SourceBytes() as ByteArray,context);
        }
        private function loaded(event:Event):void {
            movie=DisplayObjectContainer(loader.content).getChildAt(0) as MovieClip;
            capture(null);stage.addEventListener(Event.EXIT_FRAME,capture);
        }
        private function capture(event:Event):void {
            try {
                var frame:int=movie.currentFrame;
                if(seen[frame])return;
                seen[frame]=true;
                // The byte-verified 535 mask is the first child of source sprite 538.
                var maskShape:DisplayObject=DisplayObjectContainer(movie.getChildAt(0)).getChildAt(0);
                var support:Rectangle=maskShape.getBounds(movie);
                for each(var sign:int in [1,-1]) field(frame,sign,support);
                count++;
                // Native trees separately verify that the remaining 33 frames repeat these 15 tiles.
                if(count==15) {
                    stage.removeEventListener(Event.EXIT_FRAME,capture);
                    trace("COMPLETE 30 15");NativeApplication.nativeApplication.exit(0);
                }
            } catch(error:Error) {
                trace("FAIL "+error.getStackTrace());NativeApplication.nativeApplication.exit(1);
            }
        }
        private function field(frame:int,sign:int,support:Rectangle):void {
            var left:Number=sign==1?support.x:-support.right;
            var ox:int=-Math.floor(left)+2,oy:int=-Math.floor(support.y)+2;
            var width:int=Math.ceil(support.width)+6,height:int=Math.ceil(support.height)+6;
            var data:BitmapData=new BitmapData(width,height,false,0xff0000);
            var bytes:ByteArray=new ByteArray();
            for(var py:int=0;py<4;py++)for(var px:int=0;px<4;px++) {
                data.fillRect(data.rect,0xff0000);
                data.draw(movie,new Matrix(sign,0,0,1,ox+px/4,oy+py/4),
                    new ColorTransform(1,1,1,1,255,255,255,255),BlendMode.DIFFERENCE);
                var colors:Vector.<uint>=data.getVector(data.rect);
                for(var i:int=0;i<colors.length;i+=8) {
                    var value:int=0;
                    for(var bit:int=0;bit<8 && i+bit<colors.length;bit++)if(colors[i+bit]==0xff00ffff)value|=1<<bit;
                    bytes.writeByte(value);
                }
            }
            var length:int=bytes.length;bytes.compress();data.dispose();
            var id:String="tile-"+frame+"-"+(sign==1?"left":"right");
            var dir:File=new File(File.applicationDirectory.nativePath).resolvePath("fields");dir.createDirectory();
            var stream:FileStream=new FileStream();stream.open(dir.resolvePath(id+".deflate"),FileMode.WRITE);
            stream.writeBytes(bytes);stream.close();
            trace("FIELD "+JSON.stringify({id:id,tile:frame,sign:sign,width:width,height:height,originX:ox,originY:oy,
                phaseCount:16,phaseStride:Math.ceil(width*height/8),rawBytes:length,
                support:{x:support.x,y:support.y,width:support.width,height:support.height},
                phaseOrder:"y*4+x; quarter pixel; LSB first row-major"}));
        }
    }
}
