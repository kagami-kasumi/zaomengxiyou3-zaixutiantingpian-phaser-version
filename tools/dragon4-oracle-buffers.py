"""Lossless storage of 220 oracle PNG inputs; no source-corpus files are touched."""
import hashlib
import json
import zipfile
from functools import lru_cache
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/tasks/evidence/TASK-SETTINGS-220/air-original'


@lru_cache(maxsize=1)
def archive():
    return zipfile.ZipFile(OUT/'buffers.zip')


def read_buffer(name):
    assert '/' not in name and '\\' not in name and name.endswith('.png')
    path=OUT/'buffers'/name
    if path.exists(): return path.read_bytes()
    return archive().read(name)


def pack():
    expected=json.loads((OUT/'measurement.json').read_text())['artifactHashes']['buffers']
    folder=(OUT/'buffers').resolve()
    assert folder.is_relative_to(ROOT.resolve()) and folder.parent==OUT.resolve()
    archive_path=OUT/'buffers.zip'
    with zipfile.ZipFile(archive_path,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
        for name,digest in sorted(expected.items()):
            data=(folder/name).read_bytes()
            assert hashlib.sha256(data).hexdigest()==digest
            info=zipfile.ZipInfo(name,(2026,9,14,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
            archive.writestr(info,data)
    with zipfile.ZipFile(archive_path) as archive:
        assert set(archive.namelist())==set(expected)
        for name,digest in expected.items(): assert hashlib.sha256(archive.read(name)).hexdigest()==digest
    total=0
    # Delete only the just-verified duplicated generated PNGs, after the archive is complete.
    for name in expected:
        path=(folder/name).resolve();assert path.parent==folder
        total+=path.stat().st_size;path.unlink()
    summary=dict(status='losslessly-packed',pngCount=len(expected),pngBytes=total,
                 archivePath=archive_path.relative_to(ROOT).as_posix(),archiveBytes=archive_path.stat().st_size,
                 archiveSha256=hashlib.sha256(archive_path.read_bytes()).hexdigest(),
                 entryHashes='air-original/measurement.json artifactHashes.buffers',
                 consumers=['tools/verify-dragon4-sampling.py','TASK-SLICE-214E source oracle'],
                 retention='Keep as independent source input until family closure; unpacking is unnecessary.')
    (OUT/'buffer-storage.json').write_text(json.dumps(summary,indent=2)+'\n')
    print(summary)


if __name__=='__main__':pack()
