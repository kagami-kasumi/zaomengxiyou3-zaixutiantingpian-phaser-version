"""244 bounded original visual methods; original files are read-only.

Only the six first-show/expiry/remove branches of BaseAddEffect are executed.
Host body/physics, unrelated effects, damage and networking are explicit sinks.
Native assets, display API, FollowBaseObjectBullet and visual lifetime are real.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT/'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'
WORK = ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-244/air'
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-244'
NAMES = ['sxkb', 'fsnl', 'smjc', 'mfjc', 'gjjc', 'fyjc']


def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def prepare(mutation='baseline'):
    work = WORK/mutation
    work.mkdir(parents=True, exist_ok=True)
    records = []

    def take(file, name):
        p = SRC/file
        text = p.read_text(encoding='utf-8')
        m = re.search(r'(?:override )?(?:public|protected|private) (?:static )?function '+name+r'\(', text)
        assert m, (file, name)
        start = m.start(); pos = text.index('{', m.end())+1; depth = 1
        while depth:
            depth += (text[pos] == '{')-(text[pos] == '}'); pos += 1
        code = text[start:pos]
        records.append(dict(path=p.relative_to(ROOT).as_posix(), method=name,
                            startLine=text[:start].count('\n')+1, sha256=sha(p),
                            sliceSha256=hashlib.sha256(code.encode()).hexdigest()))
        return code

    def write(path, code):
        p = work/path; p.parent.mkdir(parents=True, exist_ok=True)
        # Isolate fixture classes from the original restored package definitions.
        for name in ['base', 'export']:
            code = re.sub(r'\b'+name+r'\.', 'passivefixture.'+name+'.', code)
            code = code.replace('package '+name+' {', 'package passivefixture.'+name+' {')
        p.write_text(code, encoding='utf-8')

    utils = '\n'.join(take('AUtils.as', n) for n in ['getNewObj', 'flipHorizontal', 'stopAllChildren', 'startAllChildren'])
    write('AUtils.as', 'package {import flash.display.*;import flash.geom.*;import flash.utils.*;public class AUtils {'+utils+'}}')
    bullet_text = (SRC/'base/BaseBullet.as').read_text(encoding='utf-8')
    fields = bullet_text[bullet_text.index('public static var DESIDE_BY_FRAMES_LEFT'):bullet_text.index('public function BaseBullet(')]
    methods = '\n'.join(take('base/BaseBullet.as', n) for n in ['BaseBullet', 'step2', 'step', 'setDisable', 'setRole', 'setDirect', 'destroy', 'setScale', 'setHurtCanCutDownEffect', 'getImgMc'])
    if mutation == 'wrong-direction':
        methods = methods.replace('AUtils.flipHorizontal(this,-Number(this.direct))', 'AUtils.flipHorizontal(this,Number(this.direct))')
    if mutation == 'destroy-residual':
        methods = methods.replace('this.parent.removeChild(this);', '/* mutation: residual */')
    write('base/BaseBullet.as', 'package base {import flash.display.*;import flash.geom.*;public class BaseBullet extends MovieClip {'+fields+methods+'''
public function setAction(s:String):void{curAction=s;}
protected function checkHitWall():void{if(!isDisabled)throw new Error('unexpected enabled bullet');}
public function checkAttack():void{throw new Error('unexpected attack');}
public function snapshot():Object{return {dead:isReadyToDestroy,frame:imgMc?imgMc.currentFrame:null,owner:sourceRole!=null,x:x,y:y,a:transform.matrix.a,d:transform.matrix.d,parent:parent?parent.name:null};}
}}''')
    follow = (SRC/'export/bullet/FollowBaseObjectBullet.as').read_text(encoding='utf-8')
    records.append(dict(path=(SRC/'export/bullet/FollowBaseObjectBullet.as').relative_to(ROOT).as_posix(), method='whole-class', sha256=sha(SRC/'export/bullet/FollowBaseObjectBullet.as')))
    write('export/bullet/FollowBaseObjectBullet.as', follow)
    constants = '\n'.join(re.findall(r'public static var \w+:String = [^;]+;', (SRC/'base/BaseAddEffect.as').read_text(encoding='utf-8')))
    add = take('base/BaseAddEffect.as', 'add')
    step = take('base/BaseAddEffect.as', 'step')
    prefix = step[:step.index('                     if(_loc10_.name == BaseAddEffect.POISON)')]
    branches = step[step.index('                     else if(_loc10_.name == BaseAddEffect.PET_SXKB)'):step.index('                     else if(_loc10_.name == BaseAddEffect.ERLANGSHEN_HP_REJECT)')].replace('else if', 'if', 1)
    expiry = step[step.index('                  if(_loc10_.isForever != 1'):step.index('                  if(_loc10_.name == BaseAddEffect.MONSTER6008FIRE)', step.index('                  if(_loc10_.isForever != 1'))]
    expiry = re.sub(r'                     if\(_loc10_.name == BaseAddEffect.MAGIC_UMBRELLA_DEFEND2\)[\s\S]*?(?=                     this.remove)', '', expiry)
    step = prefix+branches+'}\n'+expiry+'} } _loc9_++;} ++this.count;}'
    remove = take('base/BaseAddEffect.as', 'remove')
    remove = remove[:remove.index('         if(param1.name')]+remove[remove.index('         else if(param1.name == BaseAddEffect.PET_SXKB)'):remove.index('         else if(param1.name == BaseAddEffect.ERLANGSHEN_HP_REJECT)')].replace('else if', 'if', 1)+'}'
    visual = '\n'.join(take('base/BaseAddEffect.as', prefix+'_'+n) for n in NAMES for prefix in ['show', 'hide'])
    if mutation == 'wrong-parent':
        visual = visual.replace('this.gc.gameSence.addChild(_loc1_);', 'this.sourceRole.addChild(_loc1_);')
    if mutation == 'wrong-registration':
        visual = visual.replace('this.sourceRole.addChild(_loc1_);', '_loc1_.x=10;this.sourceRole.addChild(_loc1_);')
    if mutation == 'refresh-duplicate':
        add = add.replace('_loc8_.time = _loc7_.time;', '_loc8_.isFirst=true;_loc8_.time = _loc7_.time;')
    destroy = take('base/BaseAddEffect.as', 'destroy')
    sink_names = re.findall(r'this\.(hide\w+)\(\);', destroy)
    effect = '''package base {import export.bullet.*;public class BaseAddEffect {
public var sourceRole:BaseObject,curEffectArray:Array=[],count:int=0,beAttackFatherCurCount:int=0,monster6008fire:int=0,gc:Config=Config.instance;
public function BaseAddEffect(o:BaseObject){sourceRole=o;}
public function isCannotContrlSkill(v:Object):Boolean{return false;}
public function poison_times_bomb(...args):void{throw new Error('outside scope');}
'''+constants+add+step+remove+visual+destroy+'\n'.join('private function '+n+'():void{}' for n in sink_names)+'}}'
    write('base/BaseAddEffect.as', effect)
    write('base/Config.as', '''package base {import flash.display.*;public class Config {
public static var instance:Config=new Config();public static function getInstance():Config{return instance;}
public var gameSence:Sprite,isStopGame:Boolean=false,frameClips:int=24,heroes:Array=[];public var pWorld:Object={monsterArray:[]},keyboardControl:Object={stopKeyboardControl:function():void{},continueKeyboardControl:function():void{}};public function getPlayerArray():Array{return heroes;}
public var protectedPerproty:Object={removeProperty:function(...a):void{}};
public function isSingleGame():Boolean{return true;}
}}''')
    write('base/BaseObject.as', '''package base {import flash.display.*;public dynamic class BaseObject extends MovieClip {
public var colipse:Sprite=new Sprite(),magicBulletArray:Array=[],curAction:String='idle',direction:int=0,curAddEffect:BaseAddEffect;
public function BaseObject(){curAddEffect=new BaseAddEffect(this);}
public function getBBDC():Object{return {getDirect:function():int{return direction;}};}
public var isReadyToDestroy:Boolean=false;public function getNumAttackId():int{return 1;}public function getPlayer():Object{return null;}
}}''')
    hero_destroy = take('base/BaseHero.as', 'destroy')
    hero_fragment = hero_destroy[hero_destroy.index('         if(this.curAddEffect)'):hero_destroy.index('         gc.protectedPerproty.removeProperty(this);')]
    clear = take('base/BaseHero.as', 'clearAllBullets')
    write('base/BaseHero.as', 'package base {import com.greensock.TweenMax;public dynamic class BaseHero extends BaseObject {public var beAttackIdArray:Array=[];public function getCurMagicWeapon():Object{return null;}'+clear+'public function destroy():void{'+hero_fragment+'}}}')
    pet_destroy = take('base/BasePet.as', 'destroy')
    write('base/BasePet.as', 'package base {import com.greensock.TweenMax;public dynamic class BasePet extends BaseObject {public var bbdc:Object=null,sourceRole:Object=null,gc:Config=Config.instance;'+pet_destroy+'}}')
    ease = take('com/greensock/TweenLite.as', 'easeOut')
    take('com/greensock/TweenLite.as', 'renderTime')
    write('com/greensock/TweenMax.as', '''package com.greensock {public class TweenMax {
public static var jobs:Array=[],now:Number=0;public static function killChildTweensOf(o:Object):void{}public static function pauseAll(...a):void{}public static function resumeAll():void{}
public static function to(o:Object,d:Number,p:Object):void{jobs.push({o:o,d:d,p:p,t:now,a:o.alpha});}
public static function advance(v:Number):void{now=v;var keep:Array=[];for each(var j:Object in jobs){var e:Number=Math.min(j.d,now-j.t);j.o.alpha=j.a+(j.p.alpha-j.a)*easeOut(e,0,1,j.d);if(e>=j.d)j.p.onComplete.apply(null,j.p.onCompleteParams);else keep.push(j);}jobs=keep;}
'''+ease+'}}')
    write('base/Role4.as', 'package base {public dynamic class Role4 extends BaseHero {}}')
    write('base/BaseMonster.as', 'package base {public dynamic class BaseMonster extends BaseObject {}}')
    game = ''.join(take('my/MainGame.as', n) for n in ['stopGame', 'continueGame'])
    write('base/MainGame.as', 'package base {import flash.display.*;import flash.events.*;import flash.utils.*;import com.greensock.TweenMax;public class MainGame {public var root:Sprite,gc:Config=Config.instance;public function MainGame(r:Sprite){root=r;}private function __enterFrame(e:Event):void{}'+game+'}}')
    cleanup = take('World/PhysicsWorld.as', 'clearWaitFromParentArray').replace('private function','public static function')
    take('base/BasePet.as','clearWaitFromParentArray')
    write('base/Cleanup.as','package base {public class Cleanup {'+cleanup+'}}')
    # Snapshot the complete source caller for independent phase/cleanup audit.
    for file, names in [('base/BaseObject.as', ['step']), ('base/BaseHero.as', ['step', 'stepOther']), ('base/BasePet.as', ['checkBuffSkill', 'destroy'])]:
        for n in names:
            take(file, n)
    # Compiler source-path must match the fixture namespace.
    for folder in ['base', 'export']:
        for p in list((work/folder).rglob('*.as')):
            target = work/'passivefixture'/p.relative_to(work)
            target.parent.mkdir(parents=True, exist_ok=True); target.write_bytes(p.read_bytes())
    (work/'source-methods.json').write_text(json.dumps(records, indent=2)+'\n', encoding='utf-8')
    return work, records


if __name__ == '__main__':
    prepare()
