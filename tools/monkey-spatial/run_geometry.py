"""Rebuild decoded source geometry using only observed phase selectors, then compare original native pixels."""
import hashlib
import json
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image,ImageChops

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-228'
WORK=BASE/'geometry-air'
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-228'
SDK=Path('D:/AIRsdkmanager/sdk/AIRSDK_51.3.4')


def phase_only(node):
    if node.get('pendingConstruction'):return dict(pendingConstruction=True)
    return dict(frame=node.get('frame'),children=[phase_only(c) for c in node['children']])


def main():
    global WORK
    original_work=WORK
    mutation=sys.argv[1] if len(sys.argv)>1 else None
    assert mutation in (None,'origin','filter','phase','pending','vector')
    if mutation:
        WORK=BASE/('geometry-mutation-'+mutation);WORK.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(original_work/'decoded-vectors.swf',WORK/'decoded-vectors.swf')
    data=json.loads((OUT/'geometry-inputs.json').read_text());states=[];references={}
    for s in data['sources']:
        for b in s['bitmaps'].values():b['absolutePath']=str(ROOT/b['argbPath'])
    for fps in ([20] if mutation else [20,24,30]):
        native=json.loads((BASE/f'lifecycle-air/measurement-{fps}.json').read_text())
        for i,(key,n) in enumerate(sorted(native['nativePhases'].items())):
            symbol=key.split('|')[0];si=next(i for i,s in enumerate(data['sources']) if symbol in s['roots'])
            image=BASE/'lifecycle-air'/n['path'];width,height=Image.open(image).size
            identity=f'{fps}-{i}';references[identity]=dict(path=str(image),sha256=n['sha256'],key=key,bounds=n['tree']['localBounds'])
            states.append(dict(id=identity,sourceIndex=si,cid=data['sources'][si]['roots'][symbol],phase=phase_only(n['tree']),left=n['left'],top=n['top'],width=width,height=height))
    if not mutation:
        cleanup=json.loads((BASE/'cleanup-air/measurement.json').read_text())
        si=next(i for i,s in enumerate(data['sources']) if 'FireBuff' in s['roots'])
        for row in cleanup['fire']:
            identity='fire-'+str(row['tick']);image=BASE/'cleanup-air'/row['path']
            width,height=Image.open(image).size
            references[identity]=dict(path=str(image),sha256=row['sha256'],key='FireBuff|'+str(row['frame']),bounds=row['tree']['localBounds'])
            states.append(dict(id=identity,sourceIndex=si,cid=data['sources'][si]['roots']['FireBuff'],phase=phase_only(row['tree']),left=-100,top=-100,width=width,height=height))
    if mutation in ('origin','filter'):
        for s in data['sources']:
            for timeline in s['timelines'].values():
                for frame in timeline:
                    for p in frame:
                        if mutation=='origin':p['matrix']['tx']+=1
                        if mutation=='filter':p['filters']=[]
    if mutation=='phase':
        for state in states:
            if references[state['id']]['key'].startswith('PetMonkey1Bullet1|'):
                state['phase']['children'][0]['frame']=1
    fixture=dict(sources=data['sources'],states=states,vectorPath=str(WORK/'decoded-vectors.swf'),vectorSwap=mutation=='vector',suppressPending=mutation=='pending')
    (WORK/'fixtures.json').write_text(json.dumps(fixture,separators=(',',':')))
    probe=ROOT/'tools/monkey-spatial/GeometryProbe.as';shutil.copyfile(probe,WORK/probe.name)
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task228.geometry</id>
<versionNumber>1.0.0</versionNumber><filename>GeometryProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow>
<content>GeometryProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>'''.replace('regima.task228.geometry','regima.task228.geometry.'+(mutation or 'normal')))
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=GeometryProbe.swf','GeometryProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60);(WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    command=[str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)]
    result=subprocess.run(command,cwd=WORK,capture_output=True,timeout=60)
    output=(result.stdout+result.stderr).decode(errors='replace');(WORK/'output.log').write_text(output)
    assert result.returncode==0 and 'COMPLETE' in output,output[-2000:]
    rows=[json.loads(line[6:]) for line in output.splitlines() if line.startswith('STATE ')]
    assert len(rows)==len(states)
    for row in rows:
        ref=references[row['id']];p=Path(ref['path']);assert hashlib.sha256(p.read_bytes()).hexdigest()==ref['sha256']
        a=Image.open(p).convert('RGBA');b=Image.open(WORK/row['path']).convert('RGBA');difference=ImageChops.difference(a,b)
        pixels=difference.tobytes();row.update(key=ref['key'],differentPixels=sum(pixels[i:i+4]!=b'\0\0\0\0' for i in range(0,len(pixels),4)),alphaDifferences=sum(p!=0 for p in pixels[3::4]),boundsExpected=ref['bounds'])
        row['sha256']=hashlib.sha256((WORK/row['path']).read_bytes()).hexdigest()
    report=dict(status='measured-not-promoted',mutation=mutation,states=rows,inputsSha256=hashlib.sha256((OUT/'geometry-inputs.json').read_bytes()).hexdigest(),probeSha256=hashlib.sha256(probe.read_bytes()).hexdigest(),decodedVectorsSha256=hashlib.sha256((WORK/'decoded-vectors.swf').read_bytes()).hexdigest(),
                scope='Independent source edge/fill/bitmap/matrix/filter reconstruction; observed frame selectors only. Native crop envelope reused for aligned pixel comparison, not as geometry expected.')
    (WORK/'measurement.json').write_text(json.dumps(report,indent=2)+'\n')
    print('228 geometry:',len(rows),'states;',sum(r['differentPixels']>0 for r in rows),'differing;',sum(r['alphaDifferences'] for r in rows),'alpha pixels')
    print([(r['key'],r['differentPixels'],r['alphaDifferences']) for r in rows if r['differentPixels']][:8])
    if mutation and any(r['differentPixels'] for r in rows):raise SystemExit(1)


if __name__=='__main__':main()
