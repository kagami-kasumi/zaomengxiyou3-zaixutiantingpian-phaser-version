"""Persist the actual compiled/running fixture, including each rejected mutant."""
import hashlib
from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-252'


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def snapshot(work, label):
    destination = OUT/'runs'/label
    destination.mkdir(parents=True, exist_ok=True)
    files = sorted(set(work.rglob('*.as')) | {work/name for name in
                   ['Probe.swf', 'fixtures.json', 'rows.json', 'sources.json', 'compile.log', 'run.log', 'application.xml']})
    if (work/'effect-sources.json').exists(): files.append(work/'effect-sources.json')
    records = {}
    for path in files:
        target = destination/path.relative_to(work)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, target)
        records[target.relative_to(ROOT).as_posix()] = digest(target)
    return records
