"""Independently decode production PNGs and compose every state against native RGBA."""
import argparse
import sys
from functools import lru_cache
import numpy as np
from PIL import Image
from common import ROOT, DEST, EVIDENCE, OUT, MODES, load, sha, encode


@lru_cache(maxsize=256)
def image(path):
    return np.asarray(Image.open(path).convert('RGBA'), dtype=np.uint32)


def render(state, manifest):
    canvas = np.zeros((590,940,4),dtype=np.uint32)
    for owner in state['groups']:
        for part in owner['paintParts']:
            record = manifest['images'][part['image']]
            pixels = image(ROOT/'public'/record['path'].lstrip('/')).copy()
            pixels[:,:,:3] = (pixels[:,:,:3]*pixels[:,:,3:4]+255)//256
            x,y = part['origin']['x'],part['origin']['y']
            left,top,right,bottom = max(0,x),max(0,y),min(940,x+pixels.shape[1]),min(590,y+pixels.shape[0])
            if left>=right or top>=bottom:
                continue
            region = pixels[top-y:bottom-y,left-x:right-x]
            canvas[top:bottom,left:right] = region + canvas[top:bottom,left:right]*(256-region[:,:,3:4])//256
    canvas[:,:,:3] = np.minimum(255,canvas[:,:,:3]*256//np.maximum(canvas[:,:,3:4],1))
    return Image.fromarray(canvas.astype('uint8'))


def main(mode):
    sys.path.insert(0,str(ROOT/'tools/turtle-projection'))
    from exceptions import approved, matches
    manifest=load(DEST/'manifest.json');package=load(DEST/(mode+'.json.gz'))
    native=load(EVIDENCE/'TASK-SETTINGS-222A'/(mode+'-native.json.gz'))
    if mode=='body':
        refs={r['id']:dict(path=r['file'],sha256=r['sha256']) for r in native['cells']}
        assert package['clocks']==native['clocks']
    elif mode=='effects':
        refs={b['id']:b for s in native['states'] for b in s['baselines']}
    else:
        refs={r['id']+'-'+str(r['tick']):dict(path=r['capture'],sha256=r['captureSha256']) for r in native['rows']}
    assert {r['nativeId'] for r in package['states']}==set(refs)
    assert len(package['states'])==len(refs)
    allowed=approved() if mode=='dynamic' else {}
    differences=[];seen=set();results=[]
    for index,state in enumerate(package['states']):
        for group in state['groups']:
            for part in group['paintParts']+group['components']:
                rec=manifest['images'][part['image']]
                if part['image'] not in seen:
                    assert sha(ROOT/'public'/rec['path'].lstrip('/'))==rec['sha256']
                    seen.add(part['image'])
        ref=refs[state['nativeId']]
        expected=Image.open(ROOT/ref['path']).convert('RGBA')
        actual=render(state,manifest)
        count=int(np.count_nonzero(np.any(np.asarray(actual)!=np.asarray(expected),axis=2)))
        if count:
            assert matches(state['nativeId'],ref['sha256'],expected,actual,allowed),state['id']
            differences.append(dict(id=state['id'],pixels=count))
        results.append(dict(id=state['id'],differentPixels=count))
        if index%1500==0:print(mode,index,'/',len(refs),flush=True)
    report=dict(status='passed',states=len(refs),differentStates=len(differences),
                differentPixels=sum(r['pixels'] for r in differences),differences=differences,
                results=results,manifestSha256=sha(DEST/'manifest.json'),packageSha256=sha(DEST/(mode+'.json.gz')))
    (OUT/(mode+'-verification.json')).write_bytes(encode(report))
    print(mode,report['states'],report['differentStates'],report['differentPixels'],flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('mode',choices=MODES);main(parser.parse_args().mode)
