"""Keep both native raster contexts for offscreen objects; no oracle pixels read."""
import json
from PIL import Image
from run import ROOT, BASE, OUT, sha
from pack import encoded
from verify_pixels import load


def main():
    work=BASE/'dynamic';observed=BASE/'dynamic-viewport'
    # New original-origin observation must preserve the full prior source trace.
    before=load(work/'measurement.json')['rows'];after=load(observed/'measurement.json')['rows']
    assert len(before)==len(after)==5856
    for a,b in zip(before,after):
        assert {k:v for k,v in a.items() if k not in ('capture','captureSha256')}=={k:v for k,v in b.items() if k not in ('capture','captureSha256')}
    views={(r['id'],g['path']):g['viewport'] for r in load(observed/'layers.json')['rows'] for g in r['groups']}
    data=load(work/'layers.json');used=set();differences=[]
    for row in data['rows']:
        for group in row['groups']:
            primary=group['primary']
            if primary['empty'] or 'canonical' in primary:continue
            key=(row['id'],group['path']);view=views[key];used.add(key)
            original=Image.open(work/primary['path']).convert('RGBA')
            viewport=Image.open(observed/view['path']).convert('RGBA')
            x,y=primary['origin']['x'],primary['origin']['y']
            left,top=min(0,x),min(0,y);right,bottom=max(940,x+original.width),max(590,y+original.height)
            full=Image.new('RGBA',(right-left,bottom-top));full.paste(original,(x-left,y-top))
            # Replacement, including transparent pixels, at native viewport context.
            full.paste(viewport,(-left,-top));box=full.getchannel('A').getbbox()
            assert box
            crop=full.crop(box);directory=work/'context-resources';directory.mkdir(exist_ok=True)
            path=directory/(row['id']+'-'+group['path'].replace('/','-')+'.png');crop.save(path)
            view_path=work/'context-views'/path.name;view_path.parent.mkdir(exist_ok=True);view_path.write_bytes((observed/view['path']).read_bytes())
            group['rasterContexts']=dict(viewport=dict(path=view_path.relative_to(work).as_posix(),origin=dict(x=0,y=0),width=940,height=590),
                outside='primary capture outside [0,940)x[0,590); expanded capture independently checks full envelope',
                semantics='Independent isolated source object in two native raster contexts. Not translation-invariant Flash truth; bind exact frozen fixture coordinates and source tuple.')
            group['canonical']=dict(path=path.relative_to(work).as_posix(),origin=dict(x=left+box[0],y=top+box[1]),width=crop.width,height=crop.height,empty=False,
                reason='Original-origin isolated viewport plus complete expanded-envelope offscreen samples; source contexts recorded explicitly.')
            differences.append(dict(id=row['id'],group=group['path'],sourceViewportSha256=sha(observed/view['path']),completeResourceSha256=sha(path)))
    assert used==set(views) and len(used)==828
    (work/'canonical-layers.json').write_bytes(encoded(data))
    report=dict(status='source-contexts-preserved',groups=len(used),sourceTraceUnchanged=True,sourceRunSha256=sha(OUT/'dynamic-viewport-run.json'),results=differences,
                inputs=dict(rawLayers=sha(work/'layers.json'),viewportLayers=sha(observed/'layers.json')),modernVisualExceptions=[])
    (OUT/'viewport-projection.json').write_bytes(encoded(report))
    print('225 native contexts:',len(used),'independently isolated offscreen groups; no acceptance baseline read')


if __name__=='__main__':main()
