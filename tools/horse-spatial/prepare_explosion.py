"""Use original pet1 TweenMax for the original Horse4 hit callback."""
import json
import shutil
from prepare_lifecycle import ROOT,OUT
from run_lifecycle import sha

BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229'
WORK=BASE/'explosion-air'

def main():
    WORK.mkdir(parents=True,exist_ok=True)
    for source in (BASE/'joint-air').rglob('*.as'):
        if source.name.endswith('Probe.as'):continue
        path=WORK/source.relative_to(BASE/'joint-air');path.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,path)
    path=WORK/'Horse4.as';code=path.read_text();code=code[:-2]+'public function observeSuccessfulHit(b:BaseBullet):void{var n:int=magicBulletArray.length;hit5Hit(b);for(var i:int=n;i<magicBulletArray.length;i++)magicBulletArray[i].observedBirthTick=TweenMax.tick;}}}';path.write_text(code)
    path=WORK/'base/BaseObject.as';path.write_text(path.read_text().replace('public class BaseObject extends Sprite {','public class BaseObject extends Sprite {public var auditId:String;'))
    path=WORK/'base/BaseBullet.as';path.write_text(path.read_text().replace('public class BaseBullet extends MovieClip {','public class BaseBullet extends MovieClip {public var observedBirthTick:int=-1;'))
    (WORK/'com/greensock/TweenMax.as').write_text('''package com.greensock {import flash.utils.getTimer;
public class TweenMax {public static var backend:Class,events:Array=[],tick:int=0;
public static function delayedCall(t:Number,f:Function,args:Array):void {
var record:Object={id:args[0].auditId,delay:t,createdMs:getTimer(),owner:args[0].id,deadAtSchedule:args[0].isDead(),fires:[]};events.push(record);
var tween:Object=backend.delayedCall(t,function(...actual):void{
record.fires.push({tick:tick,ms:getTimer(),timeline:tween.timeline.cachedTotalTime,dead:actual[0].isDead(),ready:actual[0].isReadyToDestroy,x:actual[1].x,y:actual[1].y});var n:int=actual[0].magicBulletArray.length;f.apply(null,actual);for(var i:int=n;i<actual[0].magicBulletArray.length;i++)actual[0].magicBulletArray[i].observedBirthTick=tick;
},args);
record.start=tween.cachedStartTime;record.timelineAtSchedule=tween.timeline.cachedTotalTime;
}}}''')
    report=dict(status='prepared-not-promoted',jointMethodsSha256=sha(OUT/'joint-methods.json'),scope='Exact Horse4.hit5Hit source body, class identifier adapted as in joint fixture. Successful hit is an explicit entry boundary, not collision/HP proof. Original restored pet1 TweenMax executes actual delayed scheduling; proxy records source timeline then invokes untouched callback with its original arguments. Parent dead/ready flags are controlled inputs, not full death caller.')
    (OUT/'explosion-methods.json').write_text(json.dumps(report,indent=2)+'\n')

if __name__=='__main__':main()
