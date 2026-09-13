"""Run unchanged restored HitTest against source-tag geometry in AIR, not FFDec."""
from pathlib import Path
import hashlib
import json
import runpy
import shutil
import struct
import subprocess
import sys

ROOT=Path(__file__).resolve().parents[1]
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')
LOCAL=ROOT/'local-resources/regima/task-outputs/task-settings-218'
WORK=LOCAL/'air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-218/air'
ORIGINAL_RUNTIME=ROOT/'local-resources/regima/source/unpacked'

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    global OUT
    original_runtime='--original-runtime' in sys.argv
    if original_runtime: OUT=OUT.with_name('air-original')
    WORK.mkdir(parents=True,exist_ok=True);OUT.mkdir(parents=True,exist_ok=True)
    binary=runpy.run_path(str(ROOT/'tools/dragon-collision-swf-fixtures.py'))
    source=ROOT/'local-resources/regima/source/restored-swfs/assets'
    common=binary['source_tags'](source/'StageCommon.swf')
    pet=binary['source_tags'](source/'pet1.swf')
    tag=binary['tag'];code,shape=common[53]
    chunks=[tag(69,struct.pack('<I',8)),tag(code,struct.pack('<H',60000)+shape[2:])]
    chunks += [tag(*pet[c]) for c in [540,541,542]]
    chunks += [tag(*common[c]) for c in [53,94,95,104,105,106,107]]
    chunks += [binary['place'](60000,1,dict(tx=0,ty=0),transformed=False),
               binary['place'](541,2,dict(tx=0,ty=0),transformed=False)]
    chunks += [binary['place'](cid,depth,dict(tx=0,ty=0),transformed=False)
               for cid,depth in [(105,3),(107,4),(95,5)]]
    chunks += [binary['place'](542,6,dict(tx=0,ty=0),transformed=False)]
    chunks += [tag(1,b''),tag(0,b'')]
    body=binary['rectangle'](940,590)+struct.pack('<HH',24*256,1)+b''.join(chunks)
    (WORK/'source.swf').write_bytes(b'FWS'+bytes([10])+struct.pack('<I',8+len(body))+body)
    inputs=[('interior',400,250,440,290,1),('disjoint',100,250,440,290,1),
            ('transparent-bitmap-padding',473.5,250,440,290,1),
            ('under-one-pixel',473.55,250,440,290,1),('edge-only',474.5,250,440,290,1),
            ('fractional-origin',400.35,250.15,440.65,290.45,1),('flipped',400,250,440,290,-1),
            ('padding-shifted',483.5,260,450,300,1),
            ('full-bitmap',405.5,262,440,290,1),('full-bitmap-flipped',405.5,262,440,290,-1)]
    cases=[dict(zip(['id','x','y','bx','by','flip'],row)) for row in inputs]
    for name,index,scale in [('ObjectBaseSprite',2,2),('ObjectBaseSprite2',3,2),('ObjectBaseSprite7',4,1)]:
        cases.append(dict(id=name,x=470,y=295,bx=470,by=295,flip=1,targetIndex=index,targetScaleX=scale))
        cases.append(dict(id='baseline-'+name,x=470,y=295,bx=470,by=295,flip=1,targetIndex=index,targetScaleX=1,
                          baselineState=name,baselineSubject='target'))
    frame_tx=[1.5,-24,-49.5,-75,-100.5,-125.95,-151.45,-176.95,-202.45,-227.95,-253.45]
    for frame in range(1,12):
        for direction,sign in [('left',1),('right',-1)]:
            cases.append(dict(id=f'timeline-{frame}-{direction}',x=400,y=250,bx=470,by=295,flip=sign,frame=frame,
                              baselineState=f'bullet-{frame}-{direction}',baselineSubject='bullet'))
            cases.append(dict(id=f'contact-{frame}-{direction}',x=470+sign*frame_tx[frame-1]-34.5,
                              y=268,bx=470,by=295,flip=sign,frame=frame))
    cases.append(dict(id='last-frame-contact',x=190,y=250,bx=470,by=295,flip=1,frame=11))
    for phase_x in range(20):
        for phase_y in range(20):
            for direction,sign in [('left',1),('right',-1)]:
                cases.append(dict(id=f'phase-{phase_x}-{phase_y}-{direction}',x=430+phase_x/20,y=275+phase_y/20,
                                  bx=440,by=290,flip=sign))
    (WORK/'cases.json').write_text(json.dumps(cases),encoding='utf-8')
    (WORK/'my').mkdir(exist_ok=True)
    original=LOCAL/'source/scripts/my/HitTest.as'
    shutil.copyfile(original,WORK/'my/HitTest.as')
    shutil.copyfile(ROOT/'tools/air-collision/CollisionProbe.as',WORK/'CollisionProbe.as')
    descriptor='''<application xmlns="http://ns.adobe.com/air/application/51.1">
<id>regima.task218.collisionprobe</id><versionNumber>1.0.0</versionNumber>
<filename>CollisionProbe</filename><supportedProfiles>desktop</supportedProfiles>
<initialWindow><content>CollisionProbe.swf</content><visible>false</visible>
<width>940</width><height>590</height><systemChrome>none</systemChrome><renderMode>direct</renderMode></initialWindow></application>'''
    (WORK/'application.xml').write_text(descriptor,encoding='utf-8')
    compile_args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),
                  '+configname=air','-debug=true','-default-frame-rate=24',
                  '-default-size=940,590','-output=CollisionProbe.swf','CollisionProbe.as']
    compile_result=subprocess.run(compile_args,cwd=WORK,capture_output=True,timeout=60)
    (OUT/'compile.log').write_bytes(compile_result.stdout+compile_result.stderr)
    if compile_result.returncode:raise RuntimeError((compile_result.stdout+compile_result.stderr).decode(errors='replace'))
    args=[str(SDK/'bin/adl.exe'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    if original_runtime: args[1:1]=['-runtime',str(ORIGINAL_RUNTIME)]
    for case in cases:
        for folder in [WORK/'buffers',OUT/'buffers']:
            stale=folder/(case['id']+'.png')
            if stale.exists(): stale.unlink()
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60)
    (OUT/'stdout.log').write_bytes(result.stdout);(OUT/'stderr.log').write_bytes(result.stderr)
    # This Windows ADL emits trace on stderr; retain both raw streams separately.
    lines=(result.stdout+b'\n'+result.stderr).decode('utf-8',errors='replace').splitlines()
    if result.returncode or f'COMPLETE {len(cases)}' not in lines:
        raise RuntimeError(f'ADL exit {result.returncode}: '+result.stdout.decode(errors='replace')+result.stderr.decode(errors='replace'))
    actual=[json.loads(line[5:]) for line in lines if line.startswith('CASE ')]
    assert [r['id'] for r in actual]==[c['id'] for c in cases]
    assert sha(original)==sha(WORK/'my/HitTest.as')
    buffer_names={c['id']+'.png' for c in cases}
    for folder in ['buffers','stage-baselines']:
        (OUT/folder).mkdir(exist_ok=True)
        for path in (WORK/folder).glob('*.png'):
            if folder=='buffers' and path.name not in buffer_names: continue
            shutil.copyfile(path,OUT/folder/path.name)
    report=dict(status='measured-not-promoted',runtime='Original game bundled AIR' if original_runtime else 'AIR SDK 51.3.4',
                renderMode='direct',environment=[json.loads(line[4:]) for line in lines if line.startswith('ENV ')],
                command=args,compileCommand=compile_args,exitCode=result.returncode,
                originalHitTestSha256=sha(original),probeSwfSha256=sha(WORK/'CollisionProbe.swf'),
                probeSourceSha256=sha(ROOT/'tools/air-collision/CollisionProbe.as'),
                sourceSubsetSha256=sha(WORK/'source.swf'),
                sourceHashes={name:sha(source/name) for name in ['StageCommon.swf','pet1.swf']},
                bufferHashes={p.name:sha(p) for p in (OUT/'buffers').glob('*.png') if p.name in buffer_names},
                baselineHashes={p.name:sha(p) for p in (OUT/'stage-baselines').glob('*.png')},inputs=cases,actual=actual)
    (OUT/'measurement.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    if original_runtime:
        dll=ORIGINAL_RUNTIME/'Adobe AIR/Versions/1.0/Adobe AIR.dll'
        report['originalRuntimeDll']=dict(path=dll.relative_to(ROOT).as_posix(),sha256=sha(dll))
        (OUT/'measurement.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(f"{report['runtime']}: {len(actual)} cases, {sum(r['actual'] for r in actual)} hits; raw source results saved")

if __name__=='__main__':main()
