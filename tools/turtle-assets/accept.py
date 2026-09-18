"""Require current production hashes and every finite acceptance result."""
from common import DEST, OUT, MODES, load, sha, encode


def main():
    manifest=load(DEST/'manifest.json');digest=sha(DEST/'manifest.json')
    generation=load(OUT/'generation.json');metadata=load(OUT/'metadata-verification.json')
    assert generation['manifestSha256']==metadata['manifestSha256']==digest
    assert generation['status']==metadata['status']=='passed'
    assert generation['states']==metadata['states']==11572
    assert metadata['contracts']==32 and len(metadata['killedMutations'])==12
    reports=[]
    for mode in MODES:
        report=load(OUT/(mode+'-verification.json'))
        assert report['status']=='passed' and report['manifestSha256']==digest
        assert report['packageSha256']==sha(DEST/(mode+'.json.gz'))==manifest['packages'][mode]['sha256']
        assert report['states']==manifest['packages'][mode]['states']
        assert (report['differentStates'],report['differentPixels'])==((28,308) if mode=='dynamic' else (0,0))
        reports.append({k:report[k] for k in ('states','differentStates','differentPixels')})
    collision=load(OUT/'collision-verification.json')
    assert collision['status']=='passed'
    assert collision['packageSha256']==sha(DEST/'collision.json.gz')==manifest['packages']['collision']['sha256']
    assert [r['cases'] for r in collision['oracle']]==[94656,31344,31704]
    assert [r['differentPixels'] for r in collision['oracle']]==[70,0,0]
    result=dict(status='accepted',manifestSha256=digest,visual=reports,collision=collision['oracle'],
                productionBytes=generation['bytes'],images=generation['images'],contracts=32,
                metadataMutations=metadata['killedMutations'],
                boundary='223 resource preparation only; 224A/B/C retain all formal gameplay and consumer acceptance.')
    (OUT/'acceptance.json').write_bytes(encode(result))
    print('223 accepted: 11572 visual states, 157704 collision cases, 32 contracts; exact exceptions retained.')


if __name__=='__main__':main()
