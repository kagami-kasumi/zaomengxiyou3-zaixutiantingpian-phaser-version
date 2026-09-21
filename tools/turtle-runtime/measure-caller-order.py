"""Measure native MovieClip startup with the original pet's bullet-before-body order.

This isolates scheduling, not full BasePet AI: 221 remains the AI oracle. The
222A source-method wrapper and restored SWF are copied, never modified in place.
"""
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-222A/dynamic-air'
SKILLS = '--skills' in sys.argv
TASK = 'TASK-SLICE-224B' if SKILLS else 'TASK-SLICE-224A2'
WORK = ROOT / f'local-resources/regima/task-outputs/{TASK}/caller-order'
OUT = ROOT / f'docs/tasks/evidence/{TASK}'
SDK = Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    hashes = {}
    for path in SOURCE.rglob('*.as'):
        target = WORK / path.relative_to(SOURCE)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, target)
        hashes[str(path.relative_to(ROOT))] = digest(path)
    source_pet = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/base/BasePet.as'
    text = source_pet.read_text(encoding='utf-8')
    step = text[text.index('override public function step()'):text.index('private function countSkillCD')]
    assert step.index('_loc1_.step2()') < step.index('this.myIntelligence()') < step.index('super.step()')
    probe = (ROOT / 'tools/turtle-visual/DynamicProbe.as').read_text(encoding='utf-8')
    start, end = probe.index('private function start():void{'), probe.index('private function step(e:Event):void{')
    probe = probe[:start] + '''private function start():void{
 maxTick=45;
 for(var owner:int=1;owner<=2;owner++)for(var form:int=1;form<=4;form++){
  make(form,owner,'normal');make(form,owner,'sld');
 }
 capture();addEventListener(Event.EXIT_FRAME,step);
}
''' + probe[end:]
    if SKILLS:
        probe = probe.replace("maxTick=45;", "maxTick=151;")
        probe = probe.replace("  make(form,owner,'normal');make(form,owner,'sld');",
            "  if(form>=3)make(form,owner,'sybh');if(form==4)for(var mask:int=0;mask<8;mask++)make(4,owner,'aoyi',mask);")
    bullet_loop = '  for each(var b:BaseBullet in p.magicBulletArray.concat())if(!b.isReadyToDestroy)b.step2();'
    assert probe.count(bullet_loop) == 1
    probe = probe.replace(bullet_loop, '')
    body = '  if(!p.isReadyToDestroy)p.bbdc.step();'
    assert probe.count(body) == 1
    probe = probe.replace(body, "  CallerCapture.scenario=c.id;CallerCapture.tick=tick;\n" + bullet_loop + '\n' + body)
    start = probe.index('  var bitmap:BitmapData=new BitmapData(940,590,true,0);')
    end = probe.index('  rows.push(r);', start)
    probe = probe[:start] + probe[end:]
    (WORK / 'DynamicProbe.as').write_text(probe, encoding='utf-8')
    (WORK / 'CallerCapture.as').write_text('''package {
public class CallerCapture {
 public static var scenario:String,tick:int;
 public static function observe(b:Object):void {
  if(b.isReadyToDestroy)return;
  trace('CALL '+JSON.stringify({scenario:scenario,tick:tick,bullet:b.snapshot(),
   tree:NativeTree.tree(b.getImgMc(),b.getImgMc(),"root")}));
 }
}}
''', encoding='utf-8')
    bullet = WORK / 'turtlefixture/base/BaseBullet.as'
    text = bullet.read_text(encoding='utf-8')
    assert text.count('public function checkAttack():void{}') == 1
    text = text.replace('package turtlefixture.base {', 'package turtlefixture.base {import CallerCapture;')
    text = text.replace('public function checkAttack():void{}', 'public function checkAttack():void{CallerCapture.observe(this);}')
    bullet.write_text(text, encoding='utf-8')
    for name in ['fixtures.json', 'application.xml']:
        shutil.copyfile(SOURCE / name, WORK / name)
    fixture = json.loads((WORK / 'fixtures.json').read_text(encoding='utf-8'))
    for source in fixture['sources']:
        assert digest(Path(source['path'])) == source['sha256']
    compile_command = ['java', '-Dflexlib=' + str(SDK / 'frameworks'), '-jar', str(SDK / 'lib/mxmlc-cli.jar'),
                       '+configname=air', '-debug=true', '-default-size=940,590', '-output=DynamicProbe.swf', 'DynamicProbe.as']
    result = subprocess.run(compile_command, cwd=WORK, capture_output=True, timeout=60)
    (WORK / 'compile.log').write_bytes(result.stdout + result.stderr)
    assert result.returncode == 0, (result.stdout + result.stderr).decode(errors='replace')
    command = [str(SDK / 'bin/adl.exe'), '-runtime', str(ROOT / 'local-resources/regima/source/unpacked'),
               '-profile', 'desktop', str(WORK / 'application.xml'), str(WORK)]
    result = subprocess.run(command, cwd=WORK, capture_output=True, timeout=90)
    (WORK / 'native.log').write_bytes(result.stdout + result.stderr)
    lines = (result.stdout + result.stderr).decode(errors='replace').splitlines()
    assert result.returncode == 0 and any(line.startswith('COMPLETE ') for line in lines), lines[-10:]
    calls = [json.loads(line[5:]) for line in lines if line.startswith('CALL ')]
    assert calls
    output = dict(scope='Native source-method callers; original bullet-before-body scheduling prefix; not full BasePet AI',
                  calls=calls, sourceFiles=hashes, originalBasePetSha256=digest(source_pet),
                  probeSha256=digest(WORK / 'DynamicProbe.as'), bulletWrapperSha256=digest(bullet),
                  compileCommand=compile_command, nativeCommand=command,
                  measurementSha256=digest(WORK / 'measurement.json'))
    (OUT / 'native-caller-order.json').write_text(json.dumps(output, ensure_ascii=False) + '\n', encoding='utf-8')
    print('Measured native caller order:', len(calls), 'checkAttack entries')


if __name__ == '__main__':
    main()
