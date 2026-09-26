"""Independent geometry rebuild: decoded JPEG/lossless pixels, paths and masks."""
import ast
import hashlib
import json
import subprocess
import sys
from pathlib import Path
from PIL import Image,ImageChops
from prepare_lifecycle import ROOT,OUT,take
from run_lifecycle import SDK,sha

BASE=ROOT/'local-resources/regima/task-outputs/TASK-SETTINGS-229'
WORK=BASE/'geometry-air'

def phase(node):
    if node.get('pendingConstruction'):return dict(pendingConstruction=True)
    return dict(frame=node.get('frame'),children=[phase(c) for c in node['children']])

def builder():
    template=ROOT/'tools/monkey-spatial/GeometryProbe.as';code=template.read_text()
    helper=ROOT/'tools/monkey-spatial/hurt_geometry.py'
    assignment=next(n for n in ast.walk(ast.parse(helper.read_text())) if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='jpeg_next' for t in n.targets))
    jpeg_next=ast.literal_eval(assignment.value)
    code=code.replace('height:s.bitmaps[cid].height}', 'height:s.bitmaps[cid].height,jpegPath:s.bitmaps[cid].jpegPath,alphaPath:s.bitmaps[cid].alphaPath}')
    code=code.replace(take(template,'next'),jpeg_next)
    code=code.replace(take(template,'nextVector'),'private function nextVector():void {run();}')
    legacy='if(s.id=="20120203"&&(cid==131||cid==202)){var item:Shape=pools[String(cid)].pop() as Shape;if(!item)throw new Error("Vector pool exhausted");used.push({shape:item,cid:cid});return item;}'
    assert legacy in code
    code=code.replace(legacy,'')
    code=code.replace('for(var i:int=0;i<placements.length;i++){','var masks:Array=[];for(var i:int=0;i<placements.length;i++){')
    code=code.replace('if(p.clipDepth)throw new Error("Unexpected mask");root.addChild(child);', '''root.addChild(child);
if(p.clipDepth){masks.push({object:child,end:p.clipDepth,used:false});}
else for each(var mask:Object in masks)if(p.depth<=mask.end){if(mask.used)throw new Error("Multiple masked children require explicit group");child.mask=mask.object;mask.used=true;}''')
    code=code.replace('return root;}','for each(var leftover:Object in masks)if(!leftover.used)leftover.object.visible=false;return root;}')
    return code

def main():
    global WORK
    mutation=sys.argv[1] if len(sys.argv)>1 else None
    assert mutation in (None,'origin','phase','mask','pending')
    if mutation:WORK=BASE/('geometry-mutation-'+mutation);WORK.mkdir(parents=True,exist_ok=True)
    data=json.loads((OUT/'geometry-inputs.json').read_text());states=[];refs={}
    for source in data['sources']:
        for bitmap in source['bitmaps'].values():
            if 'argbPath' in bitmap:bitmap['absolutePath']=str(ROOT/bitmap['argbPath'])
    for fps in ([20] if mutation else [20,24,30]):
        native=json.loads((BASE/f'lifecycle-air/measurement-{fps}.json').read_text())
        for index,(key,row) in enumerate(sorted(native['nativePhases'].items())):
            symbol=key.split('|')[0];si=next(i for i,s in enumerate(data['sources']) if symbol in s['roots'])
            path=BASE/'lifecycle-air'/row['path'];width,height=Image.open(path).size;identity=f'{fps}-{index}'
            refs[identity]=dict(path=str(path),sha256=row['sha256'],key=key,bounds=row['tree']['localBounds'])
            states.append(dict(id=identity,sourceIndex=si,cid=data['sources'][si]['roots'][symbol],phase=phase(row['tree']),left=row['left'],top=row['top'],width=width,height=height))
    if not mutation:
        native_ice=json.loads((BASE/'ice-display-air/measurement.json').read_text())
        si=next(i for i,s in enumerate(data['sources']) if s['id']=='StageCommon')
        for row in native_ice['states']:
            image=row['localImage'];identity='ice-'+str(row['tick'])
            refs[identity]=dict(path=str(ROOT/image['path']),sha256=image['sha256'],key='PetHorseIceEffect|'+str(row['tick']),bounds=row['tree']['localBounds'])
            states.append(dict(id=identity,sourceIndex=si,cid=40,phase=phase(row['tree']),left=image['origin']['x'],top=image['origin']['y'],width=image['width'],height=image['height']))
    if mutation in ('origin','mask'):
        for source in data['sources']:
            for frames in source['timelines'].values():
                for frame in frames:
                    for p in frame:
                        if mutation=='origin':p['matrix']['tx']+=1
                        if mutation=='mask':p['clipDepth']=None
    if mutation=='phase':
        def first(node):
            if node.get('frame'):node['frame']=1
            for child in node.get('children',[]):first(child)
        for state in states:first(state['phase'])
    (WORK/'fixtures.json').write_text(json.dumps(dict(sources=data['sources'],states=states,suppressPending=mutation=='pending'),separators=(',',':')))
    probe=WORK/'GeometryProbe.as';probe.write_text(builder())
    (WORK/'application.xml').write_text('''<application xmlns="http://ns.adobe.com/air/application/51.1"><id>regima.task229.geometry.MODE</id><versionNumber>1.0.0</versionNumber><filename>GeometryProbe</filename><supportedProfiles>desktop</supportedProfiles><initialWindow><content>GeometryProbe.swf</content><visible>false</visible><width>940</width><height>590</height><renderMode>direct</renderMode></initialWindow></application>'''.replace('MODE',mutation or 'normal'))
    args=['java','-Dflexlib='+str(SDK/'frameworks'),'-jar',str(SDK/'lib/mxmlc-cli.jar'),'+configname=air','-debug=true','-output=GeometryProbe.swf','GeometryProbe.as']
    result=subprocess.run(args,cwd=WORK,capture_output=True,timeout=60);(WORK/'compile.log').write_bytes(result.stdout+result.stderr)
    assert result.returncode==0,(result.stdout+result.stderr).decode(errors='replace')
    result=subprocess.run([str(SDK/'bin/adl.exe'),'-runtime',str(ROOT/'local-resources/regima/source/unpacked'),'-profile','desktop',str(WORK/'application.xml'),str(WORK)],cwd=WORK,capture_output=True,timeout=60)
    output=(result.stdout+result.stderr).decode(errors='replace');(WORK/'output.log').write_text(output)
    assert result.returncode==0 and 'COMPLETE' in output,output[-1200:]
    rows=[json.loads(line[6:]) for line in output.splitlines() if line.startswith('STATE ')]
    assert len(rows)==len(states)
    for row in rows:
        ref=refs[row['id']];assert sha(Path(ref['path']))==ref['sha256']
        a=Image.open(ref['path']).convert('RGBA');b=Image.open(WORK/row['path']).convert('RGBA');assert a.size==b.size
        pixels=ImageChops.difference(a,b).tobytes()
        row.update(key=ref['key'],differentPixels=sum(pixels[i:i+4]!=b'\0\0\0\0' for i in range(0,len(pixels),4)),alphaDifferences=sum(p!=0 for p in pixels[3::4]),boundsExpected=ref['bounds'])
    report=dict(status='measured-not-promoted',mutation=mutation,states=rows,inputsSha256=sha(OUT/'geometry-inputs.json'),probeSha256=sha(probe),compiledSha256=sha(WORK/'GeometryProbe.swf'),scope='Independent bitmap/path/placement reconstruction. Native phase selectors/crop envelopes only; source geometry and source HitTest remain separate checks.')
    (WORK/'measurement.json').write_text(json.dumps(report,separators=(',',':'))+'\n')
    bad=[r for r in rows if r['differentPixels'] or r['bounds']!=r['boundsExpected']]
    print('229 reconstructed',len(rows),'states;',len(bad),'differences',[(r['key'],r['differentPixels'],r['bounds'],r['boundsExpected']) for r in bad[:4]])
    if bad:raise SystemExit(1)

if __name__=='__main__':main()
