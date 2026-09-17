"""Attach native paint commands to their original independently movable owner."""
import copy
from run import ROOT, BASE, OUT, sha
from pack import encoded
from verify_pixels import load
from paint_requests import requests


def main():
    work=BASE/'dynamic';observed=BASE/'dynamic-paint'
    before=load(work/'measurement.json')['rows'];after=load(observed/'measurement.json')['rows']
    assert len(before)==len(after)==5856
    for a,b in zip(before,after):
        assert {k:v for k,v in a.items() if k not in ('capture','captureSha256')}=={k:v for k,v in b.items() if k not in ('capture','captureSha256')}
    expected=requests();assert expected==load(observed/'paint-requests.json')
    measured={r['id']:{g['path']:g['paintParts'] for g in r['groups']} for r in load(observed/'layers.json')['rows']}
    assert set(measured)==set(expected)
    data=load(work/'layers.json');count=0
    def relocate(value):
        if isinstance(value,list):
            for v in value:relocate(v)
        elif isinstance(value,dict):
            if value.get('path','').endswith('.png'):value['path']='../dynamic-paint/'+value['path']
            for v in value.values():
                if isinstance(v,(dict,list)):relocate(v)
    for row in data['rows']:
        if row['id'] not in expected:continue
        for group in row['groups']:
            if group['path'] not in expected[row['id']]:continue
            parts=copy.deepcopy(measured[row['id']][group['path']])
            assert [p['path'] for p in parts]==expected[row['id']][group['path']]
            relocate(parts);group['paintParts']=parts
            group['paintSemantics']='Source depth order; preserve each filter/clipDepth boundary. These parts move together with this source owner. Do not flatten before blending with preceding siblings.'
            count+=len(parts)
    (work/'canonical-layers.json').write_bytes(encoded(data))
    report=dict(status='native-paint-boundaries-observed',sourceTraceUnchanged=True,states=len(expected),parts=count,
        sourceRequestSha256=sha(observed/'paint-requests.json'),runSha256=sha(OUT/'dynamic-paint-run.json'),
        preservedBoundaries=['parent filters','current-frame source clipDepth','leaf display object'],modernVisualExceptions=[])
    (OUT/'paint-boundaries.json').write_bytes(encoded(report))
    print('225 paint join:',count,'parts;',len(expected),'source states; original trace unchanged')


if __name__=='__main__':main()
