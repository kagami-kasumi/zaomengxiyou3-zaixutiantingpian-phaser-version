"""Compile the original bitmap-mode clip methods against a native atlas fixture."""
import hashlib
import json
import runpy
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/body-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'


def main():
    source=runpy.run_path(str(ROOT/'tools/turtle-source/prepare.py'))
    path=source['SRC']/'base/BaseBitmapDataClip.as'
    text=path.read_text(encoding='utf-8')
    names=['BaseBitmapDataClip','frameShow','refreshCurFrame','getCurFrameBitmapData',
           'addFrameScriptEnterEveryFrame','addFrameScriptExitEveryFrame','setEnterFrameCallBack',
           'setAddScriptWhenFrameOver','setFramePointX','setFramePointY','step','setState','getState',
           'setFrameStopCount','getFrameStopCount','setFrameCount','getCurPoint','resetCurFrameStopCount',
           'getCurFrameCount','setCurFrameCount','stopFrame','continueFrame','setOffsetXY','setXYByDirect',
           'setDirect','getCurKeyFrameIndex','getDirect','applyOffset']
    methods,records=[],[]
    for name in names:
        code=source['method'](text,name)
        records.append(dict(method=name,startLine=text[:text.index(code)].count('\n')+1,
                            sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        compiled=code.replace('function BaseBitmapDataClip(', 'function BodyClip(')
        if name=='getCurFrameBitmapData':
            compiled=compiled[:compiled.rfind('}')]+ 'return null;\n}'
        methods.append(compiled)
    fields='''private var isAnimation:Boolean=false;
protected var frameStopCount:Array,frameCount:Array,bmdArray:Array;
protected var frameCountMaxLen:uint,curKeyFrameIndex:uint=0;
protected var curFrameStopCount:int,bmWidth:int,bmHeight:int,offsetX:int,offsetY:int;
protected var curFrameStopCount1:Boolean=false,state:String="wait";
public var curPoint:Point,bmSprite:Sprite,isStopFrame:Boolean=false;
protected var enterFrameFunc:Function,exitFrameFunc:Function,addFrameScriptWhenFrameOver:Function;
private var direct:int=0,_isPlaying:Boolean=true,_clipDict:Dictionary,_curClip:DisplayObject,_offsetX:int,_offsetY:int;
'''
    (WORK/'BodyClip.as').write_text('package {import flash.display.*;import flash.geom.*;import flash.utils.*;public class BodyClip extends Sprite {'+fields+'\n'.join(methods)+'}}',encoding='utf-8')
    report=dict(sourcePath=path.relative_to(ROOT).as_posix(),sourceSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                methods=records,scope='Class renamed BodyClip; getCurFrameBitmapData gets explicit return null only on inactive isAnimation=true branch for current compiler. All executed bitmap-mode method bodies unchanged; fields declared by harness.',
                generatedSha256=hashlib.sha256((WORK/'BodyClip.as').read_bytes()).hexdigest())
    (OUT/'body-methods.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('222A original BBDC methods:',len(methods))


if __name__=='__main__':main()
