package {import flash.display.*;import flash.geom.*;import flash.utils.*;public class NativeTree {
        private static function rect(r:Rectangle):Object{return {x:r.x,y:r.y,width:r.width,height:r.height};}
        public static function tree(d:DisplayObject,root:DisplayObject,path:String):Object {
            if(d==null)return {path:path,pendingConstruction:true};
            var m:Matrix=d.transform.matrix,c:ColorTransform=d.transform.colorTransform;
            var result:Object={path:path,name:d.name,type:getQualifiedClassName(d),visible:d.visible,
                alpha:d.alpha,blendMode:d.blendMode,mask:d.mask?d.mask.name:null,
                matrix:m?{a:m.a,b:m.b,c:m.c,d:m.d,tx:m.tx,ty:m.ty}:null,
                matrix3D:d.transform.matrix3D?d.transform.matrix3D.rawData:null,
                colorTransform:{redMultiplier:c.redMultiplier,greenMultiplier:c.greenMultiplier,blueMultiplier:c.blueMultiplier,
                    alphaMultiplier:c.alphaMultiplier,redOffset:c.redOffset,greenOffset:c.greenOffset,blueOffset:c.blueOffset,alphaOffset:c.alphaOffset},
                localBounds:rect(d.getBounds(d)),rootBounds:rect(d.getBounds(root)),filters:[],children:[]};
            for each(var f:Object in d.filters) {
                var properties:Object={type:getQualifiedClassName(f)};
                var description:XML=describeType(f);
                for each(var member:XML in description.accessor) {
                    var key:String=member.@name.toString();if(member.@access.toString()!="writeonly")properties[key]=f[key];
                }
                result.filters.push(properties);
            }
            if(d is MovieClip){result.frame=MovieClip(d).currentFrame;result.totalFrames=MovieClip(d).totalFrames;}
            if(d is DisplayObjectContainer) {
                var container:DisplayObjectContainer=d as DisplayObjectContainer;
                for(var i:int=0;i<container.numChildren;i++)result.children.push(tree(container.getChildAt(i),root,path+"/"+i));
            }
            return result;
        }
}}
