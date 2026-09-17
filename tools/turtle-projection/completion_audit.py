"""Audit the actual promoted artifact and all accepted evidence at handoff."""
import gzip
import hashlib
from accept import validate_reports
from manifest import TARGET
from run import ROOT, OUT, sha
from pack import encoded
from verify_pixels import load


def main():
    validate_reports()
    accepted=load(OUT/'acceptance.json');promotion=load(OUT/'promotion.json')
    assert accepted['status']=='accepted' and promotion['status']=='verified'
    assert promotion['acceptanceSha256']==sha(OUT/'acceptance.json')
    assert promotion['verifiedManifestSha256']==sha(TARGET)
    snapshot=gzip.decompress((OUT/'accepted-draft.json.gz').read_bytes())
    assert hashlib.sha256(snapshot).hexdigest()==accepted['draftManifestSha256']==promotion['draftManifestSha256']
    for path,digest in accepted['inputs'].items():
        if ROOT/path==TARGET:assert digest==accepted['draftManifestSha256']
        else:assert sha(ROOT/path)==digest,path
    draft=load(OUT/'accepted-draft.json.gz');final=load(TARGET)
    draft['status']='verified';draft['completeness'].update(displayListMatched=True,unresolved=[])
    assert final==draft and len(final['states'])==11572
    images={}
    def walk(value):
        if isinstance(value,dict):
            if str(value.get('path','')).endswith('.png') and 'sha256' in value:images[value['path']]=value['sha256']
            for child in value.values():walk(child)
        elif isinstance(value,list):
            for child in value:walk(child)
    for mode in ('body','effects','dynamic','buff'):walk(load(OUT/(mode+'-resources.json.gz')))
    walk(load(OUT/'component-native.json.gz'))
    for path,digest in images.items():assert sha(ROOT/path)==digest,path
    report=dict(status='passed',states=11572,symbols=13,behaviorContracts=32,approvedDifferenceStates=28,approvedPixels=308,
        verifiedManifestSha256=sha(TARGET),acceptanceSha256=sha(OUT/'acceptance.json'),resourceImagesChecked=len(images),
        scope='225 finite resource evidence only;223 modern resource conversion and gameplay remain future work.')
    (OUT/'completion-audit.json').write_bytes(encoded(report))
    print('225 completion audit passed:',report)


if __name__=='__main__':main()
