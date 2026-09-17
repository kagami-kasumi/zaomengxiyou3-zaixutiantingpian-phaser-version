"""Content-addressed original baselines and replay inputs; no modern output images."""
import argparse
import gzip
import hashlib
import json
import zipfile
from run import ROOT,WORK,OUT,sha,save


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');parser.add_argument('--restore',action='store_true');args=parser.parse_args()
    base=WORK.parent;archive=OUT/'native-corpus.zip';index_path=OUT/'native-corpus-index.json.gz'
    if args.check or args.restore:
        summary=json.loads((OUT/'native-corpus.json').read_text())
        assert sha(archive)==summary['archiveSha256'] and sha(index_path)==summary['indexSha256']
        index=json.loads(gzip.decompress(index_path.read_bytes()))
        with zipfile.ZipFile(archive) as z:
            for digest in sorted(set(index.values())):assert hashlib.sha256(z.read(digest)).hexdigest()==digest
            if args.restore:
                for name,digest in index.items():
                    path=(base/name).resolve();assert path.is_relative_to(base.resolve())
                    if path.exists():assert sha(path)==digest,name
                    else:path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(z.read(digest))
        print('Native corpus verified:',len(index),'logical files;',summary['uniqueFiles'],'unique blobs')
        return
    index={};seen=set();raw=0
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        paths=[p for folder in ['full','dynamic','dynamic-call','registry','preflight'] for p in (base/folder).rglob('*')
               if p.is_file() and p.suffix in ['.png','.as','.swf','.json','.log','.xml']]
        for path in sorted(paths):
            data=path.read_bytes();digest=hashlib.sha256(data).hexdigest();index[path.relative_to(base).as_posix()]=digest;raw+=len(data)
            if digest in seen:continue
            info=zipfile.ZipInfo(digest,date_time=(2026,9,16,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
            z.writestr(info,data,compresslevel=9);seen.add(digest)
    index_path.write_bytes(gzip.compress((json.dumps(index,sort_keys=True,separators=(',',':'))+'\n').encode(),mtime=0))
    save(OUT/'native-corpus.json',dict(taskId='TASK-SETTINGS-222B',archiveSha256=sha(archive),indexSha256=sha(index_path),
         logicalFiles=len(index),uniqueFiles=len(seen),rawBytes=raw,archiveBytes=archive.stat().st_size,
         localRoot=base.relative_to(ROOT).as_posix(),
         consumers=['222B native/oracle/source-field replay','222 parent truth','next turtle asset preparation and formal implementation'],
         retention='Original baselines and source fields are retained. Ignored expanded working copies may be removed only after family closure and verified restoration support.'))
    print('Packed native corpus:',len(index),'files;',len(seen),'unique;',archive.stat().st_size,'bytes')


if __name__=='__main__':main()
