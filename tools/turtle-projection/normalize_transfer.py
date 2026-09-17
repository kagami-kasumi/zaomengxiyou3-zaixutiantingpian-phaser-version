"""Losslessly encode native response tables relative to the observed RGBA layer."""
import hashlib
import zlib
import numpy as np
from run import ROOT, BASE, OUT, sha
from pack import encoded
from verify_pixels import load, image
from transfer_requests import requests


def main():
    work=BASE/'dynamic';native=BASE/'dynamic-transfer'
    request=requests();assert request==load(native/'transfer-requests.json')
    measured=load(native/'layers.json')['rows'];assert len(measured)==request['uniqueTuples']
    before=load(work/'measurement.json')['rows'];after=load(native/'measurement.json')['rows']
    assert len(before)==len(after)==5856
    for a,b in zip(before,after):
        assert {k:v for k,v in a.items() if k not in ('capture','captureSha256')}=={k:v for k,v in b.items() if k not in ('capture','captureSha256')}
    data=load(work/'canonical-layers.json');rows={r['id']:r for r in data['rows']};tables={};reports=[]
    for spec in measured:
        group=next(g for g in rows[spec['id']]['groups'] if g['path']==spec['path'])
        layer=group['primary'].get('canonical',group['primary'])
        assert layer['origin']==spec['origin'] and layer['width']==spec['width'] and layer['height']==spec['height']
        source=np.asarray(image(work/layer['path']),dtype=np.uint16)
        a=source[:,:,3:4];p=(source[:,:,:3]*a+255)//256
        w,h=spec['width'],spec['height'];values=np.arange(256,dtype=np.uint16)[:,None,None,None]
        opaque_raw=zlib.decompress((native/spec['rgb']).read_bytes());alpha_raw=zlib.decompress((native/spec['alpha']).read_bytes())
        opaque=np.frombuffer(opaque_raw,dtype=np.uint8).reshape((256,h,w,4))
        actual_alpha=np.frombuffer(alpha_raw,dtype=np.uint8).reshape((256,h,w,1))
        assert np.all(opaque[:,:,:,0]==255)
        assert np.array_equal(opaque[0,:,:,1:],p) and np.array_equal(actual_alpha[0],a)
        expected_rgb=p[None]+values*(256-a[None])//256
        expected_alpha=a[None]+values*(256-a[None])//256
        rgb_delta=(opaque[:,:,:,1:].astype(np.int16)-expected_rgb).astype(np.uint8)
        alpha_delta=(actual_alpha.astype(np.int16)-expected_alpha).astype(np.uint8)
        assert np.array_equal((expected_rgb+rgb_delta)%256,opaque[:,:,:,1:])
        assert np.array_equal((expected_alpha+alpha_delta)%256,actual_alpha)
        target=work/'native-response';target.mkdir(exist_ok=True)
        paths={}
        for name,array in [('rgbDelta',rgb_delta),('alphaDelta',alpha_delta)]:
            path=target/(spec['key']+'-'+name+'.z');path.write_bytes(zlib.compress(array.tobytes(),9))
            paths[name]=dict(path=path.relative_to(work).as_posix())
        result=dict(key=spec['key'],origin=spec['origin'],width=w,height=h,**paths,
            sourceOpaqueSha256=hashlib.sha256(opaque_raw).hexdigest(),sourceAlphaSha256=hashlib.sha256(alpha_raw).hexdigest(),
            semantics='Lossless native 256-value per-channel response data, encoded as modulo256 residual from native integer source-over. Not oracle corrections or a visual tolerance.')
        tables[spec['key']]=result
        reports.append(dict(key=spec['key'],rgbNonzero=int(np.count_nonzero(rgb_delta)),alphaNonzero=int(np.count_nonzero(alpha_delta)),
                            nativeRgbSha256=sha(native/spec['rgb']),nativeAlphaSha256=sha(native/spec['alpha'])))
    for binding in request['bindings']:
        group=next(g for g in rows[binding['id']]['groups'] if g['path']==binding['path'])
        group['nativeResponse']=tables[binding['key']]
    (work/'canonical-layers.json').write_bytes(encoded(data))
    report=dict(status='lossless-native-response',tuples=len(tables),bindings=len(request['bindings']),sourceTraceUnchanged=True,
        sourceRunSha256=sha(OUT/'dynamic-transfer-run.json'),sourceRequestsSha256=sha(native/'transfer-requests.json'),results=reports,
        archiveSemantics='Response deltas plus the original observed premultiplied RGBA reconstruct every native opaque RGB and alpha response byte exactly.',modernVisualExceptions=[])
    (OUT/'native-response.json').write_bytes(encoded(report))
    print('225 native response:',len(tables),'tuples;',len(request['bindings']),'bindings; lossless byte reconstruction')


if __name__=='__main__':main()
