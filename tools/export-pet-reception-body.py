"""Export verified native body cells into self-contained runtime resources."""
import hashlib
import json
from pathlib import Path
import re
import sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TRUTH = ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-254-pet-reception-body-timing.json'
DEST = ROOT / 'public/assets/pets/reception-body'
INDEX = ROOT / 'src/assets/pet-reception-body-display.json'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def run():
    truth = json.loads(TRUTH.read_text(encoding='utf-8'))
    assert truth['status'] == 'verified' and not truth['completeness']['unresolved']
    baselines = {b['stateId']: b for b in truth['baselines']}
    poses = []
    for obj in truth['displayObjects']:
        for placement in obj['placements']:
            sid = placement['stateId']
            form, action, row, column, direct = re.fullmatch(r'(\w+)-(hurt|dead)-r(\d+)-x(\d+)-d([01])', sid).groups()
            baseline = baselines[sid]
            source = ROOT / baseline['path']
            assert sha(source) == baseline['sha256'], sid
            bounds = placement['stageBounds']
            x, y, w, h = (bounds[k] for k in ['left', 'top', 'width', 'height'])
            assert all(int(v) == v for v in [x, y, w, h]), sid
            x, y, w, h = map(int, [x, y, w, h])
            native = Image.open(source).convert('RGBA')
            assert 0 <= x <= x + w <= native.width and 0 <= y <= y + h <= native.height
            cell = native.crop((x, y, x + w, y + h))
            target = DEST / f'{sid}.png'
            if '--check' in sys.argv:
                delivered = Image.open(target).convert('RGBA')
                assert delivered.size == cell.size and delivered.tobytes() == cell.tobytes(), sid
            else:
                DEST.mkdir(parents=True, exist_ok=True)
                cell.save(target)
            poses.append(dict(id=sid, form=form, action=action, row=int(row), column=int(column),
                              direct=int(direct), key=f'pet-reception-{sid}',
                              path=f'/assets/pets/reception-body/{sid}.png',
                              x=x-470, y=y-350, width=w, height=h,
                              sourceSha256=baseline['sha256'], sha256=sha(target)))
    assert len(poses) == len(baselines) == 416
    result = dict(truthId=truth['truthId'], sourceSha256=sha(TRUTH), poses=poses)
    if '--check' in sys.argv:
        assert json.loads(INDEX.read_text(encoding='utf-8')) == result
    else:
        INDEX.write_text(json.dumps(result, separators=(',', ':'))+'\n', encoding='utf-8', newline='\n')
    print('416 native body cells exported/checked; original baseline hashes and full-cell pixels match.')


if __name__ == '__main__':
    run()
