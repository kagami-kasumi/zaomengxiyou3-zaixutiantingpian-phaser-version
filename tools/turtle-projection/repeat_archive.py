"""Record a completed byte-identical archive rebuild without rewriting artifacts."""
import subprocess
from run import ROOT, BASE, OUT, sha
from pack import MODES, encoded


def main():
    paths=[ROOT/'tools/turtle-projection/pack.py',ROOT/'tools/turtle-projection/repeat_archive.py',OUT/'native-corpus.json']
    for mode in MODES:
        paths.extend([OUT/(mode+'-resources.json.gz'),OUT/(mode+'-run.json')])
        work=BASE/mode
        paths.extend(work/name for name in ('layers.json','measurement.json','RasterCapture.as','fixtures.json','application.xml'))
        if (work/'canonical-layers.json').exists():paths.append(work/'canonical-layers.json')
    inputs={p.relative_to(ROOT).as_posix():sha(p) for p in paths}
    subprocess.run(['python','tools/turtle-projection/pack.py','--check'],cwd=ROOT,check=True,timeout=1200)
    assert all(sha(ROOT/p)==digest for p,digest in inputs.items())
    (OUT/'archive-repeat.json').write_bytes(encoded(dict(status='passed',inputSha256=inputs,meaning='Every archive and image reproduced byte-identically from native observations.')))


if __name__=='__main__':main()
