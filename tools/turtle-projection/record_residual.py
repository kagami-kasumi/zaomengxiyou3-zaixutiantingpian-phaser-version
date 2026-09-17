"""Describe exact unresolved pixels; this never grants a visual exception."""
import hashlib
import numpy as np
from PIL import Image
from run import ROOT, BASE, OUT, sha
from pack import encoded
from verify_pixels import load, image, compose


def main():
    report=load(OUT/'dynamic-pixels.json')
    for path,digest in report['inputSha256'].items():assert sha(ROOT/path)==digest
    rows={r['id']:r for r in load(BASE/'dynamic/canonical-layers.json')['rows']}
    refs={r['id']+'-'+str(r['tick']):r for r in load(ROOT/'docs/tasks/evidence/TASK-SETTINGS-222A/dynamic-native.json.gz')['rows']}
    results=[];shown=0
    for failure in report['differences']:
        identity=failure['id'];reference=refs[identity]
        expected=np.asarray(image(ROOT/reference['capture']))
        candidate=np.asarray(compose(rows[identity],BASE/'dynamic'))
        coords=np.argwhere(np.any(expected!=candidate,axis=2));assert len(coords)==failure['differentPixels']
        result=dict(id=identity,baselineSha256=reference['captureSha256'],differentPixels=len(coords),
            rgbaMaxDifference=np.abs(expected.astype(np.int16)-candidate.astype(np.int16)).max(axis=(0,1)).tolist(),
            pixels=[dict(x=int(x),y=int(y),original=expected[y,x].tolist(),candidate=candidate[y,x].tolist()) for y,x in coords])
        results.append(result)
        if shown<3 and identity.startswith('rest-4-1'):
            directory=OUT/'diagnostics/residual-images';directory.mkdir(exist_ok=True)
            x0,y0=max(0,int(coords[:,1].min())-8),max(0,int(coords[:,0].min())-8)
            x1,y1=min(940,int(coords[:,1].max())+9),min(590,int(coords[:,0].max())+9)
            left=Image.fromarray(expected).crop((x0,y0,x1,y1));right=Image.fromarray(candidate).crop((x0,y0,x1,y1))
            diff=Image.new('RGBA',(x1-x0,y1-y0),(0,0,0,255))
            for y,x in coords:diff.putpixel((int(x)-x0,int(y)-y0),(255,64,0,255))
            sheet=Image.new('RGBA',(left.width*3,left.height),(30,30,30,255))
            for index,picture in enumerate([left,right,diff]):sheet.alpha_composite(picture,(index*left.width,0))
            sheet.resize((sheet.width*4,sheet.height*4),Image.Resampling.NEAREST).save(directory/(identity+'.png'))
            result['comparisonCrop']=dict(x=x0,y=y0,width=x1-x0,height=y1-y0,columns=['original','independent candidate','different pixels'])
            shown+=1
    output=dict(status='unapproved-unresolved',states=report['states'],differentStates=len(results),differentPixels=sum(r['differentPixels'] for r in results),
        results=results,inputReportSha256=sha(OUT/'dynamic-pixels.json'),modernVisualExceptions=[],
        meaning='Exact counterexample set only. No tolerance, approval, verified promotion or gameplay completion is implied.')
    (OUT/'diagnostics/exact-unresolved-pixels.json').write_bytes(encoded(output))
    print('Unresolved finite set:',len(results),'states;',output['differentPixels'],'pixels; approval absent')


if __name__=='__main__':main()
