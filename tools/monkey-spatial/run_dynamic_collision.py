"""Original lifecycle driver plus native target enter/leave and independent pixel reduction."""
import json
import shutil
import subprocess
import sys
from pathlib import Path
from generate import method
from ui_truth import ROOT,BASE,OUT,sha,read

SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def main():
    fps=int(sys.argv[1]) if len(sys.argv)>1 else 24
    work=BASE/f'dynamic-collision-air/{fps}';work.mkdir(parents=True,exist_ok=True)
    source=BASE/'lifecycle-air'
    for path in source.rglob('*.as'):
        if path.name.endswith('Probe.as'):continue
        target=work/path.relative_to(source);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
    natural=read(BASE/'natural-collision-air/measurement.json')
    hit=ROOT/natural['hitTestPath'];assert sha(hit)==natural['hitTestSha256']
    (work/'my').mkdir(exist_ok=True);shutil.copyfile(hit,work/'my/HitTest.as')
    reference_source=ROOT/'tools/monkey-spatial/NaturalCollisionProbe.as'
    reference=method(reference_source.read_text(),'reference').replace('private static function','public static function')
    (work/'my/CollisionReference.as').write_text('package my {import flash.display.*;import flash.geom.*;public class CollisionReference {'+reference+'}}')
    bullet=work/'base/BaseBullet.as';text=bullet.read_text()
    text=text.replace('import flash.geom.*;','import flash.geom.*;import my.*;',1)
    text=text.replace('public var calls:Array=[];','public static var collisionTarget:DisplayObject;public var calls:Array=[];')
    original=method(text,'checkAttack')
    replacement='''public function checkAttack():void {
var h:Boolean=HitTest.complexHitTestObject(this,collisionTarget);
var r:Rectangle=HitTest.intersectionRectangle(this,collisionTarget);
var expected:Boolean=CollisionReference.reference(this,collisionTarget,r);
calls.push({kind:"attack",x:x,y:y,a:transform.matrix.a,dead:isReadyToDestroy,owner:sourceRole?sourceRole.id:null,hit:h,reference:expected});}'''
    text=text.replace(original,replacement);bullet.write_text(text)
    driver=ROOT/'tools/monkey-spatial/LifecycleProbe.as';text=driver.read_text()
    text=text.replace('LifecycleProbe','DynamicCollisionProbe')
    text=text.replace(method(text,'capturePhase'),'private function capturePhase(bullet:BaseBullet):void {}')
    marker='items.push(item);'
    insertion='''var targetSymbol:String=["ObjectBaseSprite","ObjectBaseSprite2","ObjectBaseSprite7"][items.length%3];
var targetType:Class=getDefinitionByName(targetSymbol) as Class;
var target:DisplayObject=new targetType();target.scaleX=targetSymbol=="ObjectBaseSprite7"?0.5:1;world.addChild(target);
item.target=target;item.targetSymbol=targetSymbol;
'''
    assert marker in text;text=text.replace(marker,insertion+marker)
    marker='var before:Object=bullet.snapshot();'
    insertion='''var far:Boolean=tick%6==3||tick%6==4;
var target:DisplayObject=item.target;
var eb:Rectangle=bullet.getBounds(bullet.parent?bullet.parent:this),tb:Rectangle=target.getBounds(target);
target.x=far?100000:eb.x+eb.width/2-(tb.x+tb.width/2)*target.scaleX;
target.y=far?100000:eb.y+eb.height/2-tb.y-tb.height/2;
BaseBullet.collisionTarget=target;
'''
    assert marker in text;text=text.replace(marker,insertion+marker)
    marker='source:{x:source.x,y:source.y,a:source.scaleX,action:source.curAction},before:before,state:bullet.snapshot()'
    replacement='source:{x:source.x,y:source.y,a:source.scaleX,action:source.curAction},target:{symbol:item.targetSymbol,x:target.x,y:target.y,scaleX:target.scaleX,far:far},before:before,state:bullet.snapshot()'
    assert marker in text;text=text.replace(marker,replacement)
    probe=work/'DynamicCollisionProbe.as';probe.write_text(text)
    fixture=read(source/f'measurement-{fps}.json')['fixtures'];fixture['ticks']=fps*4+8
    (work/'fixtures.json').write_text(json.dumps(fixture))
    app=(source/'application.xml').read_text().replace('LifecycleProbe','DynamicCollisionProbe').replace('regima.task228.lifecycle',f'regima.task228.dynamiccollision.corrected{fps}')
    (work/'application.xml').write_text(app)
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=DynamicCollisionProbe.swf','DynamicCollisionProbe.as']
    result=subprocess.run(args,cwd=work,capture_output=True,timeout=60);(work/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(work/'application.xml'),str(work)]
    with (work/'stdout.log').open('wb') as stdout,(work/'stderr.log').open('wb') as stderr:result=subprocess.run(command,cwd=work,stdout=stdout,stderr=stderr,timeout=180)
    output=((work/'stdout.log').read_bytes()+(work/'stderr.log').read_bytes()).decode(errors='replace')
    assert result.returncode==0 and 'COMPLETE' in output,output[-1600:]
    rows=read(work/'rows.json');assert len(rows)==144*(1+2*(fps*4+8))
    data=dict(rows=rows,fixtures=fixture,compiledSourceSha256=sha(probe),compiledSwfSha256=sha(work/'DynamicCollisionProbe.swf'),
              lifecycleDriverSha256=sha(driver),lifecycleMethodsSha256=sha(OUT/'lifecycle-methods.json'),
              referenceSourceSha256=sha(reference_source),hitTestSha256=sha(hit),baseBulletSha256=sha(bullet),runnerSha256=sha(Path(__file__)),
              environment=[json.loads(line[4:]) for line in output.splitlines() if line.startswith('ENV ')])
    (work/'measurement.json').write_text(json.dumps(data,separators=(',',':'))+'\n')
    print('228 corrected dynamic:',fps,'fps;',len(rows),'rows')


if __name__=='__main__':main()
