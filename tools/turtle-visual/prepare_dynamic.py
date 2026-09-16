"""222A source actor/bullet methods with native MovieClips and explicit service boundaries."""
import hashlib
import json
import re
import runpy
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/dynamic-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A'


def main():
    WORK.mkdir(parents=True,exist_ok=True)
    helper=runpy.run_path(str(ROOT/'tools/turtle-source/prepare.py'))
    records=helper['prepare'](WORK)
    src=helper['SRC']
    def take(file,name):
        path=src/file;text=path.read_text(encoding='utf-8')
        # Match static methods too, preserving their entire source body.
        match=re.search(r'(?:override )?(?:public|protected|private) (?:static )?function '+name+r'\(',text)
        assert match,(file,name)
        start=match.start();opening=text.index('{',match.end());depth=1;end=opening+1
        while depth:
            depth+=(text[end]=='{')-(text[end]=='}');end+=1
        code=text[start:end]
        records.append(dict(path=path.relative_to(ROOT).as_posix(),method=name,startLine=text[:start].count('\n')+1,
                            sha256=hashlib.sha256(path.read_bytes()).hexdigest(),sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        return code
    def write(file,text):
        path=WORK/file;path.parent.mkdir(parents=True,exist_ok=True);path.write_text(text,encoding='utf-8')
    def change(file,old,new):
        path=WORK/file;text=path.read_text(encoding='utf-8');assert old in text,(file,old)
        path.write_text(text.replace(old,new),encoding='utf-8')
    write('base/BaseObject.as','''package base {import flash.display.Sprite;public class BaseObject extends Sprite {
public var curAction:String="wait",isGXP:Boolean=false;public function getNumAttackId():int{return 1;}}}''')
    change('base/BasePet.as','extends Sprite','extends BaseObject')
    change('base/BasePet.as',"public var curAction:String='wait',lastHit:String=''","public var lastHit:String=''")
    take('base/BasePet.as','BasePet')
    change('base/BasePet.as','sourceRole=h;_petInfo=p;h.pet=this;',
           'sourceRole=h;_petInfo=p;h.pet=this;curAddEffect.sourceRole=this;addChild(bbdc);bbdc.turnRight();curAddEffect.add([{name:"father",time:gc.frameClips*5,interval:1000,isForever:1}]);')
    change('base/BasePet.as','bbdc.direct=0','bbdc.setDirect(0)')
    change('base/BasePet.as','bbdc.direct=1','bbdc.setDirect(1)')
    change('base/BasePet.as','public function getBBDC()',
           'public function probeBodyTurn(n:int):void{if(n==0)turnLeft();else turnRight();}public function getBBDC()')
    for name in ['turnLeft','turnRight']:take('base/BaseObject.as',name)
    change('base/BasePet.as','isGXP:Boolean=false,','')
    change('base/BasePet.as',"public function setYourFather(n:*):void{events.push(['protect',n]);}",
           'public var fatherCount:int=0,istouming:Boolean=false;'+take('base/BaseObject.as','setYourFather'))
    original_step=take('base/BaseObject.as','step')
    father=original_step[original_step.index('if(this.fatherCount >= 0)'):original_step.index('if(this.hmzfatherCount >= 0)')]
    change('base/BasePet.as','public function getBBDC()',
           'public function probeVisualTail():void{'+father+'if(this.curAddEffect)this.curAddEffect.step();}public function getBBDC()')
    change('base/BaseHero.as','extends Sprite','extends BaseObject')
    change('base/BaseHero.as','public function getRoleId()', 'public function BaseHero(){curAddEffect.sourceRole=this;}public function getRoleId()')
    for form in range(1,5):
        change(f'export/pet/PetTurtle{form}.as','bbdc.count=count;enterFrameFunc(new Point(x,0));','enterFrameFunc(bbdc.getCurPoint());')
    change('base/Config.as','public static var instance:Config=new Config();','public static var instance:Config=new Config();public static function getInstance():Config{return instance;}public var bodySpecs:Array,formChoice:int=1,isStopGame:Boolean=false;')
    change('base/Config.as','protectedPerproty:Object={removeProperty:function(p:*):void{}}','protectedPerproty:Object=new Protection()')
    write('base/Protection.as','''package base {import flash.utils.Dictionary;public class Protection {
private var values:Dictionary=new Dictionary();public function setProperty(o:Object,k:String,v:*):void{if(!values[o])values[o]={};values[o][k]=v;}
public function getProperty(o:Object,k:String):*{return values[o]?values[o][k]:null;}public function removeProperty(o:Object):void{delete values[o];}}}''')
    for number in range(1,5):write(f'base/Role{number}.as',f'package base {{public class Role{number} extends BaseHero {{}}}}')
    # Reuse the source BBDC methods already verified in body-native; add original destruction.
    clip=(ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/body-air/BodyClip.as').read_text(encoding='utf-8')
    clip=clip.replace('package {','package base {',1).replace('BodyClip','BodyClipInternal').replace('_curClip:DisplayObject','_curClip:Object')
    clip=clip[:-2]+take('base/BaseBitmapDataClip.as','destroy')+take('base/BaseBitmapDataClip.as','turnRight')+'private var actionOverFunc:Function;}}'
    write('base/BodyClipInternal.as',clip)
    write('base/Clip.as','''package base {import flash.display.*;import flash.geom.*;import flash.utils.*;
public class Clip extends BodyClipInternal {
private static var pools:Object={};
private static function pool():Array {
 var form:int=Config.instance.formChoice;
 if(!pools[form]){var klass:Class=getDefinitionByName("PetTurtleBmd"+form) as Class;
 var bitmap:BitmapData=new klass();var flipped:BitmapData=new BitmapData(bitmap.width,bitmap.height,true,0);
 flipped.draw(bitmap,new Matrix(-1,0,0,1,bitmap.width,0));pools[form]=[bitmap,flipped];}
 return [{name:"body",source:pools[form]}];
}
public function Clip(){super(pool(),Config.instance.bodySpecs[Config.instance.formChoice-1].cellSize[0],
 Config.instance.bodySpecs[Config.instance.formChoice-1].cellSize[1],new Point());
 var spec:Object=Config.instance.bodySpecs[Config.instance.formChoice-1],holds:Array=[],counts:Array=[];
 for each(var row:Object in spec.rows){var stops:Array=[];for each(var cell:Object in row.cells)stops.push(cell.holdTicks);holds.push(stops);counts.push(stops.length);}
 setFrameStopCount(holds);setFrameCount(counts);setOffsetXY(spec.offset[0],spec.offset[1]);setFramePointY(0);
}
public function get point():Point{return getCurPoint();}
}}''')
    # Real native asset construction/flip/stop operations, not display placeholders.
    utils='\n'.join(take('AUtils.as',name) for name in ['getNewObj','flipHorizontal','stopAllChildren','startAllChildren','GetDisBetweenTwoObj'])
    write('AUtils.as','package {import flash.display.*;import flash.geom.*;import flash.utils.*;public class AUtils {'+utils+'}}')
    # Source BaseBullet visual/lifetime methods; collision intentionally belongs to 222B.
    bullet=(src/'base/BaseBullet.as').read_text(encoding='utf-8')
    fields=bullet[bullet.index('public static var DESIDE_BY_FRAMES_LEFT'):bullet.index('public function BaseBullet(')]
    methods='\n'.join(take('base/BaseBullet.as',name) for name in ['BaseBullet','step2','step','setDestroyWhenLastFrame',
        'setHurtCanCutDownEffect','setDestroyInCount','setDisable','setRole','setDirect','destroy','setScale','getImgMc','getImcName'])
    write('base/BaseBullet.as','''package base {import flash.display.*;import flash.geom.*;public class BaseBullet extends MovieClip {'''+fields+methods+'''
public function setAction(s:String):void{curAction=s;}protected function checkHitWall():void{}public function checkAttack():void{}
public function newAttackId():void{attackId++;}
public function snapshot():Object{return {symbol:imcName,action:curAction,x:x,y:y,a:transform.matrix.a,d:transform.matrix.d,
dead:isReadyToDestroy,cut:isHurtCanCutDownEffect,last:isDestroyWhenLastFrame,ttl:destroyInCount,frame:imgMc?imgMc.currentFrame:null,
ownerAlive:sourceRole!=null};}
}}''')
    # Keep exact FollowBaseObjectBullet, including translation-delta and root-matrix semantics.
    follow=(src/'export/bullet/FollowBaseObjectBullet.as').read_text(encoding='utf-8')
    write('export/bullet/FollowBaseObjectBullet.as',follow)
    records.append(dict(path=(src/'export/bullet/FollowBaseObjectBullet.as').relative_to(ROOT).as_posix(),method='whole-class',
                        sha256=hashlib.sha256((src/'export/bullet/FollowBaseObjectBullet.as').read_bytes()).hexdigest()))
    # Turtle SpecialEffectBullet never receives followObject; source base step is its full active branch.
    write('export/bullet/SpecialEffectBullet.as','''package export.bullet {import base.BaseBullet;
public class SpecialEffectBullet extends BaseBullet {public function SpecialEffectBullet(s:String,p:String=""){super(s,p);}}}''')
    effect=WORK/'base/BaseAddEffect.as';text=effect.read_text(encoding='utf-8')
    text=text.replace('public class BaseAddEffect {','public class BaseAddEffect {public var sourceRole:BaseObject;')
    text=text.replace('buffs=buffs.concat(a);','''for each(var item:Object in a){
var existing:Object=getBuffByName(item.name);if(existing){existing.time=item.time;existing.startTime=count;}
else{item.isFirst=true;buffs.push(item);}}''')
    text=text.replace('public var buffs:Array=[];','''public var buffs:Array=[],count:int=0;
public function step():void{var i:int=0;while(i<buffs.length){var item:Object=buffs[i];
if(item&&sourceRole){if(item.isFirst){item.startTime=count;item.isFirst=false;if(item.name==PETTURTKE_BUFF)show_petturtle_buff();}
if(item.isForever!=1&&count-Number(item.startTime)>=item.time){if(item.name==PETTURTKE_BUFF)hide_petturtle_buff();buffs.splice(i,1);}}
i++;}if(sourceRole){if(sourceRole is BaseHero){if(sourceRole.isGXP||gc.protectedPerproty.getProperty(sourceRole,"isYourFather"))myGlow();else cancelGlow();}
else if(sourceRole is BasePet){if(gc.protectedPerproty.getProperty(sourceRole,"isYourFather"))myGlow();else cancelGlow();}}count++;}''')
    # Record the whole methods behind this explicitly bounded target-buff service projection.
    for name in ['step','add','remove']:take('base/BaseAddEffect.as',name)
    # Original destroy does not call hide_petturtle_buff; preserve that visible residual.
    text=text.replace('public function destroy():void{buffs=[];}','public function destroy():void{buffs=[];count=0;gc.protectedPerproty.removeProperty(sourceRole);sourceRole=null;}')
    text=text.replace('package base {','package base {import flash.filters.*;',1).replace('public var sourceRole:BaseObject;','public var sourceRole:BaseObject;private var glow:GlowFilter,gc:Config=Config.instance;')
    text=text[:-2]+''.join(take('base/BaseAddEffect.as',n) for n in ['show_petturtle_buff','hide_petturtle_buff','myGlow','cancelGlow'])+'}}'
    write('base/BaseAddEffect.as',text)
    # Controlled elapsed time, exact source default easeOut formula for the sole alpha tween.
    ease=take('com/greensock/TweenLite.as','easeOut')
    write('com/greensock/TweenMax.as','''package com.greensock {import base.Config;public class TweenMax {
public static var jobs:Array=[],tweens:Array=[],now:Number=0,errors:Array=[];
public static function delayedCall(t:Number,f:Function,a:Array):void{jobs.push({time:now+t,fn:f,args:a,world:Config.instance.gameSence});}
public static function to(o:Object,t:Number,p:Object):void{tweens.push({target:o,start:now,duration:t,initial:o.alpha,props:p});}
public static function advance(t:Number):void {
 now=t;var pending:Array=jobs;jobs=[];
 for each(var job:Object in pending){if(job.time<=t+0.000001){Config.instance.gameSence=job.world;try{job.fn.apply(null,job.args);}catch(e:Error){errors.push({time:t,errorId:e.errorID});}}else jobs.push(job);}
 var keep:Array=[];for each(var tween:Object in tweens){var elapsed:Number=Math.min(tween.duration,t-tween.start);
 tween.target.alpha=easeOut(elapsed,tween.initial,tween.props.alpha-tween.initial,tween.duration);
 if(elapsed>=tween.duration)tween.props.onComplete.apply(null,tween.props.onCompleteParams);else keep.push(tween);}tweens=keep;
}
'''+ease+'}}')
    # Avoid partially shadowing the full restored packages' own runtime classes.
    for folder in ['base','petInfo','export','com']:
        for path in (WORK/folder).rglob('*.as'):
            code=path.read_text(encoding='utf-8')
            code=re.sub(r'\b(base|petInfo|export|com)\.',r'turtlefixture.\1.',code)
            code=re.sub(r'package (base|petInfo)\s*\{',r'package turtlefixture.\1 {',code)
            code=code.replace('AUtils','NativeUtils').replace('{','{import turtlefixture.NativeUtils;',1)
            target=WORK/'turtlefixture'/path.relative_to(WORK)
            target.parent.mkdir(parents=True,exist_ok=True);target.write_text(code,encoding='utf-8')
    util=(WORK/'AUtils.as').read_text(encoding='utf-8').replace('package {','package turtlefixture {',1).replace('AUtils','NativeUtils')
    (WORK/'turtlefixture/NativeUtils.as').write_text(util,encoding='utf-8')
    report=dict(status='prepared-not-verified',sourceMethods=records,
                boundaries=['Config/HP/skills/target are explicit fixtures inherited from221; no combat collision or monster renderer.',
                            'Original BBDC methods and original pet action/release/callback/destruction execute; bitmap init consumes source-derived specs.',
                            'SpecialEffectBullet active no-followObject branch uses original BaseBullet step; setAction is a label sink, hit formulas are221/222B.',
                            'BaseAddEffect target-buff projection preserves add/refresh, first-step show, count/startTime expiry and hide; exact source myGlow/cancelGlow execute after the source BaseObject.step fatherCount block, following BBDC step. Unrelated status branches excluded; destroy retains original target-child/filter omission.',
                            'Delayed callbacks use controlled elapsed seconds; alpha-only TweenMax.to uses source TweenLite.easeOut, not the full vendor scheduler.',
                            'Fixture packages are prefixed turtlefixture to avoid shadowing original restored classes; source method fingerprints precede this lexical adaptation.'])
    (OUT/'dynamic-source-methods.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8',newline='\n')
    print('222A dynamic sources:',len(records),'source methods/classes')


if __name__=='__main__':main()
