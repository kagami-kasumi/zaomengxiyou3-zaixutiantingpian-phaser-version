"""Add collision observation to byte-hashed 222A source-method callers; never edit 222A."""
import json
import argparse
import shutil
import subprocess
from run import ROOT,OUT,WORK,SDK,sha,save


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--call-site',action='store_true');args=parser.parse_args()
    source=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-222A/dynamic-air'
    work=WORK.parent/('dynamic-call' if args.call_site else 'dynamic');work.mkdir(parents=True,exist_ok=True)
    hashes={}
    for path in source.rglob('*.as'):
        if path.name in ['DynamicProbe.as','NativeTree.as']:continue
        target=work/path.relative_to(source);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(path,target)
        hashes[str(path.relative_to(ROOT)).replace('\\','/')]=sha(path)
    probe=ROOT/'tools/turtle-visual/DynamicProbe.as';text=probe.read_text(encoding='utf-8')
    text=text.replace('if(index==fixtures.sources.length){start();return;}',
                      'if(index==fixtures.sources.length){CollisionCapture.init(this,function():void{start();});return;}')
    start=text.index('  var bitmap:BitmapData=new BitmapData(940,590,true,0);')
    end=text.index('  rows.push(r);',start)
    text=text[:start]+('' if args.call_site else '  CollisionCapture.capture(c,p,tick);\n')+text[end:]
    if args.call_site:
        text=text.replace('gc.gameSence=c.world;var p:*=c.p;', 'gc.gameSence=c.world;var p:*=c.p;CollisionCapture.setContext(c,p,tick);')
        text=text.replace('if(!b.isReadyToDestroy)b.step2();','if(!b.isReadyToDestroy){CollisionCapture.beforeStep(c,p,b,tick);b.step2();}')
        path=work/'turtlefixture/base/BaseBullet.as';source_text=path.read_text(encoding='utf-8')
        assert 'public function checkAttack():void{}' in source_text
        source_text=source_text.replace('public function checkAttack():void{}','public function checkAttack():void{CollisionCapture.observe(this);}')
        source_text=source_text.replace('public function snapshot():Object{','public function collisionInput():Object{var r:Object=snapshot();r.disabled=isDisabled;r.secondary=imgMc1!=null;r.sourceAlive=sourceRole!=null;return r;}public function snapshot():Object{')
        path.write_text(source_text.replace('package turtlefixture.base {','package turtlefixture.base {import CollisionCapture;'),encoding='utf-8')
    (work/'DynamicProbe.as').write_text(text,encoding='utf-8')
    shutil.copyfile(ROOT/'tools/turtle-collision/CollisionCapture.as',work/'CollisionCapture.as')
    shutil.copyfile(ROOT/'tools/turtle-visual/NativeTree.as',work/'NativeTree.as')
    shutil.copyfile(source/'fixtures.json',work/'fixtures.json')
    shutil.copyfile(source/'application.xml',work/'application.xml')
    shutil.copyfile(WORK.parent/'full/source.swf',work/'collision-source.swf')
    (work/'my').mkdir(exist_ok=True);shutil.copyfile(WORK.parent/'full/my/HitTest.as',work/'my/HitTest.as')
    fixture=json.loads((work/'fixtures.json').read_text(encoding='utf-8'))
    for s in fixture['sources']:assert sha(__import__('pathlib').Path(s['path']))==s['sha256']
    fixture_name='dynamic-call-fixtures.json' if args.call_site else 'dynamic-fixtures.json'
    save(OUT/fixture_name,dict(sourceFixtureSha256=sha(source/'fixtures.json'),
         sourceProbeSha256=sha(probe),sourceMethodFiles=hashes,
         observation='Original 222A normal/SLD/follow/hurt/SYBH/Aoyi 8 masks/rest/dead/destroy callers; add three original targets and four placements per live attacking bullet per tick. Buffs are explicitly non-attacking.',
         observationPoint='BaseBullet.checkAttack entry inside original step/step2' if args.call_site else 'post-step visual snapshot',
         targetPlacements=['center','disjoint','left-edge-1','root-phase-.35--20.65'],ticks=list(range(122))))
    command=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air',
             '-debug=true','-default-size=940,590','-output=DynamicProbe.swf','DynamicProbe.as']
    result=subprocess.run(command,cwd=work,capture_output=True,timeout=60)
    (work/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    native=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(work/'application.xml'),str(work)]
    with (work/'stdout.log').open('wb') as stdout,(work/'stderr.log').open('wb') as stderr:
        result=subprocess.run(native,cwd=work,stdout=stdout,stderr=stderr,timeout=900)
    lines=((work/'stdout.log').read_bytes()+b'\n'+(work/'stderr.log').read_bytes()).decode(errors='replace').splitlines()
    assert result.returncode==0 and any(l.startswith('COMPLETE ') for l in lines),'\n'.join(lines[-8:])
    rows=[json.loads(l[10:]) for l in lines if l.startswith('COLLISION ')]
    save(work/'collision-measurement.json',dict(status='measured-not-promoted',cases=rows,
         stepInputs=[json.loads(l[11:]) for l in lines if l.startswith('STEP_INPUT ')],compileCommand=command,command=native,
         fixtureSha256=sha(OUT/fixture_name),probeSha256=sha(work/'DynamicProbe.as'),captureSha256=sha(work/'CollisionCapture.as'),
         sourceSwfSha256=sha(work/'collision-source.swf'),hitTestSha256=sha(work/'my/HitTest.as'),sourceMethodFiles=hashes))
    print('Dynamic native collision cases:',len(rows))


if __name__=='__main__':main()
