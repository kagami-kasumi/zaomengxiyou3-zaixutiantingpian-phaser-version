"""Optional small native/production/overlay/difference contact sheets."""
import argparse
from PIL import Image, ImageChops, ImageDraw
from common import ROOT, DEST, EVIDENCE, load
from verify_visual import render


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--write-images',action='store_true');args=parser.parse_args()
    if not args.write_images:return
    manifest=load(DEST/'manifest.json')
    output=ROOT/'.tmp/verification-images/TASK-SLICE-223';output.mkdir(parents=True,exist_ok=True)
    for mode in ['body','dynamic','buff']:
        package=load(DEST/(mode+'.json.gz'))
        if mode=='body':state=next(s for s in package['states'] if s['meta']['form']==4 and s['meta']['owner']=='P2')
        elif mode=='dynamic':
            ident=manifest['visualException']['tuples']['results'][0]['id']
            state=next(s for s in package['states'] if s['nativeId']==ident)
        else:state=max(package['states'],key=lambda s:sum(p['width']*p['height'] for g in s['groups'] for p in g['paintParts']))
        native=load(EVIDENCE/'TASK-SETTINGS-222A'/(mode+'-native.json.gz'))
        if mode=='body':path=next(r['file'] for r in native['cells'] if r['id']==state['nativeId'])
        else:path=next(r['capture'] for r in native['rows'] if r['id']+'-'+str(r['tick'])==state['nativeId'])
        original=Image.open(ROOT/path).convert('RGBA');actual=render(state,manifest)
        diff=ImageChops.difference(original,actual)
        sheet=Image.new('RGB',(1880,1220),(35,40,48));draw=ImageDraw.Draw(sheet)
        for i,(label,img) in enumerate([('native',original),('production',actual),('50% overlay',Image.blend(original,actual,.5)),('difference x16',diff.point(lambda v:min(255,v*16))) ]):
            x,y=(i%2)*940,(i//2)*610
            draw.text((x+8,y+3),label+' '+state['id'],fill='white')
            sheet.paste(img,(x,y+20),img if i<3 else None)
        sheet.save(output/(mode+'.png'))
        print((output/(mode+'.png')).as_posix())


if __name__=='__main__':main()
