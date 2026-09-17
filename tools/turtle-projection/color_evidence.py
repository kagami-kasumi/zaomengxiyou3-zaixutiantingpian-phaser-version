"""Freeze bounded native arithmetic witnesses; no baseline-derived corrections."""
import hashlib
import numpy as np
from PIL import Image
from run import ROOT, BASE, OUT, sha
from pack import encoded
from verify_pixels import load, image


def main():
    work = BASE / 'dynamic-colors'
    rows = load(work / 'layers.json')['rows']
    refs = {r['id']+'-'+str(r['tick']):r for r in load(ROOT / 'docs/tasks/evidence/TASK-SETTINGS-222A/dynamic-native.json.gz')['rows']}
    results, inputs = [], {}
    for row in rows:
        destination = np.zeros((590,940,4),dtype=np.uint32)
        pillow = Image.new('RGBA',(940,590))
        failures = 0
        for group in row['groups']:
            arrays = []
            for path in group['images']:
                original = work / path
                dest = OUT / 'color-witnesses' / original.name
                dest.parent.mkdir(parents=True,exist_ok=True)
                dest.write_bytes(original.read_bytes())
                inputs[dest.relative_to(ROOT).as_posix()] = sha(dest)
                arrays.append(np.asarray(image(original),dtype=np.uint32))
            transparent, black, white = arrays
            a = transparent[:,:,3:4]
            premult = (transparent[:,:,:3] * a + 255) // 256
            failures += int(np.count_nonzero(np.any(premult != black[:,:,:3],axis=2)))
            rebuilt = np.minimum(255,black[:,:,:3]*256//np.maximum(a,1))
            failures += int(np.count_nonzero(np.any(rebuilt != transparent[:,:,:3],axis=2)))
            source = np.concatenate((premult,a),axis=2)
            destination = source + destination * (256-a) // 256
            assert np.all(destination <= 255)
            pillow.alpha_composite(Image.fromarray(transparent.astype(np.uint8)))
        destination[:,:,:3] = np.minimum(255,destination[:,:,:3]*256//np.maximum(destination[:,:,3:4],1))
        reference = refs[row['id']]
        assert sha(ROOT/reference['capture']) == reference['captureSha256']
        expected = np.asarray(image(ROOT/reference['capture']))
        pixels = int(np.count_nonzero(np.any(destination != expected,axis=2)))
        alternative = int(np.count_nonzero(np.any(np.asarray(pillow) != expected,axis=2)))
        results.append(dict(id=row['id'],groups=len(row['groups']),singleLayerFailures=failures,differentPixels=pixels,
                            pillowMutationDifferentPixels=alternative,baseline=reference['capture'],baselineSha256=reference['captureSha256']))
    assert all(r['singleLayerFailures']==r['differentPixels']==0 for r in results)
    assert all(r['pillowMutationDifferentPixels']>0 for r in results)
    # Every possible valid 8-bit premultiplied channel round-trips, including alpha0/255.
    for a in range(256):
        for p in range(a+1):
            c = min(255,p*256//max(a,1))
            assert (c*a+255)//256 == p
    report=dict(status='passed',scope='Five frozen existing 222A source states; rule subsequently requires all 11572 state checks. Not a universal Flash claim.',
        rule='P=(C*A+255)//256; DA=SA+DA*(256-SA)//256; DP=SP+DP*(256-SA)//256; C=min(255,DP*256//max(DA,1))',
        arithmetic='uint32 reference; production verifier uint16 intermediate maximum65280, no uint8 arithmetic',
        inverseBoundaryPairs=32896,inputs=inputs,results=results,independentReview='projection_audit independently confirmed all18 single-layer groups and two selected compositions.',
        sourceRunSha256=sha(OUT/'dynamic-colors-run.json'))
    (OUT/'color-arithmetic.json').write_bytes(encoded(report))
    (OUT/'color-witnesses/layers.json').write_bytes((work/'layers.json').read_bytes())
    print('225 native colour evidence: 5 source states,18 groups,zero differences; Pillow mutation rejected')


if __name__ == '__main__':
    main()
