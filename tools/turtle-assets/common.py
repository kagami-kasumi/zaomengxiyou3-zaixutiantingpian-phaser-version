"""Deterministic resource packaging helpers; original evidence is read-only."""
import gzip
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EVIDENCE = ROOT / 'docs/tasks/evidence'
OUT = EVIDENCE / 'TASK-SLICE-223'
DEST = ROOT / 'public/assets/pets/turtle'
FAMILY = ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-222-pet-turtle-family.json'
PROJECTION = ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-225-turtle-resource-projection.json'
MODES = ('body', 'effects', 'dynamic', 'buff')


def load(path):
    raw = path.read_bytes()
    return json.loads(gzip.decompress(raw) if path.suffix == '.gz' else raw)


def encode(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')) + '\n').encode()


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write(path, value, check=False):
    payload = encode(value)
    if path.suffix == '.gz':
        payload = gzip.compress(payload, mtime=0)
    if check:
        assert path.read_bytes() == payload, f'Stale package: {path}'
    else:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(payload)
    return dict(path='/'+path.relative_to(ROOT/'public').as_posix(), sha256=sha(path), bytes=len(payload))


def chosen(unit):
    return unit.get('canonical', unit['primary'].get('canonical', unit['primary']))


def state_id(mode, row):
    if mode == 'body':
        return 'body:' + row['id']
    if mode == 'effects':
        m = row['meta']
        return f"effect:{m['symbol']}:{m['tick']}:s{m['scale']}:d{m['sign']}"
    fixture, tick = row['id'].rsplit('-', 1)
    return f'{mode}:{fixture}:{tick}'
