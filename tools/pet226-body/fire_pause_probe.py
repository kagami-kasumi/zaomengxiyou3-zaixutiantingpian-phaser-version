"""Execute original MainGame pause methods around native FireBuff MovieClips."""
import hashlib
import json
from pathlib import Path
import runpy
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SLICE-226/fire-pause-air'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
helper = runpy.run_path(str(ROOT / 'tools/monkey-horse-source/run.py'))
SRC = helper['SRC']
WORK.mkdir(parents=True, exist_ok=True)
long_pause = '--long-pause' in sys.argv
resume_tick, end_tick = (19, 28) if long_pause else (9, 14)
methods = []
def take(file, name):
    path = SRC / file
    text = path.read_text(encoding='utf-8')
    signature = text.index('function ' + name + '(')
    start = text.rfind('\n', 0, signature) + 1
    opening = text.index('{', signature)
    depth = 1
    end = opening + 1
    while depth:
        if text[end] == '{': depth += 1
        elif text[end] == '}': depth -= 1
        end += 1
    code = text[start:end]
    methods.append(dict(path=path.relative_to(ROOT).as_posix(), method=name,
                        sha256=hashlib.sha256(code.encode()).hexdigest()))
    return code
def write(name, text):
    if name == 'Probe.as' and long_pause:
        text = text.replace('import flash.display.*;', 'import flash.display.*;import flash.geom.*;')
        text = text.replace('if(tick==9)', 'if(tick==19)').replace('if(tick==14)', 'if(tick==28)')
        text = text.replace('petClip:petClip.currentFrame,', 'petClip:petClip.currentFrame,petRaster:capture(),')
        text = text.replace('private function observe(', '''private function capture():Object{
var b:Rectangle=petClip.getBounds(petClip);var left:int=Math.floor(b.left),top:int=Math.floor(b.top),w:int=Math.ceil(b.right)-left,h:int=Math.ceil(b.bottom)-top;
var bitmap:BitmapData=new BitmapData(Math.max(1,w),Math.max(1,h),true,0);bitmap.draw(petClip,new Matrix(1,0,0,1,-left,-top));
var path:String="aoyi-"+fps+"-"+tick+".png";var fs:FileStream=new FileStream();fs.open(new File(File.applicationDirectory.nativePath).resolvePath(path),FileMode.WRITE);fs.writeBytes(bitmap.encode(bitmap.rect,new PNGEncoderOptions()));fs.close();bitmap.dispose();return {path:path,crop:{left:left,top:top,width:w,height:h}};}
private function observe(''')
    if name == 'Probe.as':
        text = text.replace('tick++;if(tick==3)', f'if(tick>={end_tick})return;tick++;if(tick==3)')
        text = text.replace('trace("COMPLETE");NativeApplication.nativeApplication.exit(0);',
                            'stage.removeEventListener(Event.EXIT_FRAME,observe);trace("COMPLETE");NativeApplication.nativeApplication.exit(0);')
    (WORK / name).write_text(text, encoding='utf-8')
write('AUtils.as', 'package {import flash.display.*;public class AUtils {' +
      take('AUtils.as', 'stopAllChildren') + take('AUtils.as', 'startAllChildren') + '}}')
write('World.as', '''package {import flash.display.*;import flash.events.*;import flash.utils.*;
public class World extends Sprite {public var gc:Object; public var steps:int=0;
public function __enterFrame(e:Event):void{steps++;}
''' + take('my/MainGame.as', 'stopGame') + take('my/MainGame.as', 'continueGame') + '}}')
write('BaseMonster.as', 'package {import flash.display.*;public class BaseMonster extends Sprite {public var magicBulletArray:Array=[];}}')
write('BaseBullet.as', 'package {import flash.display.*;public class BaseBullet extends Sprite {}}')
write('BaseHero.as', 'package {public class BaseHero extends BaseMonster {public function getCurMagicWeapon():Object{return null;}}}')
write('TweenMax.as', 'package {public class TweenMax {public static function pauseAll(a:Boolean,b:Boolean):void{} public static function resumeAll():void{}}}')
write('Probe.as', '''package {import flash.display.*;import flash.events.*;import flash.filesystem.*;import flash.system.*;import flash.utils.*;import flash.desktop.NativeApplication;
public class Probe extends Sprite {private var world:World, target:MovieClip, bullet:MovieClip, petClip:MovieClip, tick:int=0, fps:int;
public function Probe(){loaderInfo.uncaughtErrorEvents.addEventListener(UncaughtErrorEvent.UNCAUGHT_ERROR,function(e:UncaughtErrorEvent):void{trace("FAIL "+e.error);NativeApplication.nativeApplication.exit(1);});
var fs:FileStream=new FileStream();fs.open(File.applicationDirectory.resolvePath("fixture.json"),FileMode.READ);var config:Object=JSON.parse(fs.readUTFBytes(fs.bytesAvailable));fs.close();fps=config.fps;stage.frameRate=fps;
var loader:Loader=new Loader();loader.contentLoaderInfo.addEventListener(Event.COMPLETE,function(e:Event):void{start();});fs.open(new File(config.source),FileMode.READ);var bytes:ByteArray=new ByteArray();fs.readBytes(bytes);fs.close();var context:LoaderContext=new LoaderContext(false,ApplicationDomain.currentDomain);context.allowCodeImport=true;loader.loadBytes(bytes,context);}
private function start():void{var cls:Class=ApplicationDomain.currentDomain.getDefinition("FireBuff") as Class;world=new World();addChild(world);var monster:BaseMonster=new BaseMonster();world.addChild(monster);target=new cls();monster.addChild(target);var attack:BaseBullet=new BaseBullet();world.addChild(attack);monster.magicBulletArray.push(attack);bullet=new cls();attack.addChild(bullet);
var hero:BaseHero=new BaseHero();world.addChild(hero);var pet:BaseMonster=new BaseMonster();world.addChild(pet);var petBullet:BaseBullet=new BaseBullet();world.addChild(petBullet);pet.magicBulletArray.push(petBullet);var aoyi:Class=ApplicationDomain.currentDomain.getDefinition("AoyiBuff") as Class;petClip=new aoyi();petBullet.addChild(petClip);
world.gc={isStopGame:false,pWorld:{monsterArray:[monster]},getPlayerArray:function():Array{return [hero];},keyboardControl:{stopKeyboardControl:function():void{},continueKeyboardControl:function():void{}}};
root.addEventListener(Event.ENTER_FRAME,world.__enterFrame);stage.addEventListener(Event.EXIT_FRAME,observe);}
private function observe(e:Event):void{tick++;if(tick==3)world.stopGame();if(tick==9)world.continueGame();trace("ROW "+JSON.stringify({fps:fps,tick:tick,paused:world.gc.isStopGame,target:target.currentFrame,bullet:bullet.currentFrame,petClip:petClip.currentFrame,worldSteps:world.steps}));if(tick==14){trace("COMPLETE");NativeApplication.nativeApplication.exit(0);}}
}}''')
write('application.xml', '<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.pet226.firepause</id><versionNumber>1.0.0</versionNumber><filename>Probe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>Probe.swf</content><visible>false</visible><width>940</width><height>590</height></initialWindow></application>')
compile_result = subprocess.run(['java', '-Dflexlib=' + str(SDK / 'frameworks'), '-jar', str(SDK / 'lib/mxmlc-cli.jar'), '+configname=air', '-debug=true', '-output=Probe.swf', 'Probe.as'], cwd=WORK, capture_output=True, timeout=60)
write('compile.log', (compile_result.stdout + compile_result.stderr).decode(errors='replace'))
assert compile_result.returncode == 0, (WORK / 'compile.log').read_text()
source = ROOT / 'local-resources/regima/source/restored-swfs/assets/StageCommon.swf'
rows = []
for fps in [20, 24, 30]:
    write('fixture.json', json.dumps(dict(fps=fps, source=str(source))))
    result = subprocess.run([str(SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'), '-profile', 'desktop', str(WORK / 'application.xml'), str(WORK)], cwd=WORK, capture_output=True, timeout=45)
    log = (result.stdout + result.stderr).decode(errors='replace')
    write(f'run-{fps}.log', log)
    assert result.returncode == 0 and 'COMPLETE' in log, (result.returncode, log)
    sample = [json.loads(line[4:]) for line in log.splitlines() if line.startswith('ROW ')]
    assert len(sample) == end_tick
    for prior, row in zip(sample, sample[1:]):
        assert row['target'] == prior['target'] % 20 + 1, row
        assert row['petClip'] == prior['petClip'] % 14 + 1, row
        if 4 <= row['tick'] <= resume_tick:
            assert row['bullet'] == sample[2]['bullet'], row
            assert row['worldSteps'] == sample[2]['worldSteps'], row
        if row['tick'] > resume_tick:
            assert row['bullet'] == prior['bullet'] % 20 + 1, row
    if long_pause:
        for row in sample:
            row['petRaster']['sha256'] = hashlib.sha256((WORK / row['petRaster']['path']).read_bytes()).hexdigest()
    rows.extend(sample)
report = dict(status='verified-bounded-native-pause', methods=methods, sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(), rows=rows,
              limitations='Original pause/resume and recursive clip methods; native FireBuff and pet AoyiBuff. Hero with empty direct bullet list, separately owned pet private bullet, stub keyboard/Tween services, controlled containers. Pet step2/terminal cleanup deliberately not run: this verifies pause display traversal, not resumed private lifecycle or full UI.')
out = ROOT / ('docs/tasks/evidence/TASK-SLICE-226/fire-pause-long-native.json' if long_pause else 'docs/tasks/evidence/TASK-SLICE-226/fire-pause-native.json')
out.write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(f'{len(rows)} native pause states: target FireBuff and pet private AoyiBuff continue; monster bullet clip and world stepping pause, then resume. Private terminal cleanup not covered.')
