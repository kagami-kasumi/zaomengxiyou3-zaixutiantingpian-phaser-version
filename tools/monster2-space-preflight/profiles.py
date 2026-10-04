"""Read-only revalidation of 241 target constructors for Monster2 preflight."""
from pathlib import Path
import hashlib
import importlib.util
import json

ROOT = Path(__file__).resolve().parents[2]


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    script = ROOT / 'tools/monster30-collision/profiles.py'
    spec = importlib.util.spec_from_file_location('target_profiles', script)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    path = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-241/profile-source-map.json'
    source_map = json.loads(path.read_text(encoding='utf-8'))
    profiles_path = ROOT / 'tools/monster30-collision/profiles.json'
    profiles = {p['id']: p for p in json.loads(profiles_path.read_text(encoding='utf-8'))}
    checked = {}
    for item in source_map['types']:
        symbol, origin, line = module.constructor(ROOT / item['source']['path'])
        assert symbol == profiles[item['profile']]['symbol']
        assert origin.relative_to(ROOT).as_posix() == item['constructorSource']['path']
        assert line == item['line']
        for source in (item['source'], item['constructorSource']):
            assert digest(ROOT / source['path']) == source['sha256']
            checked[source['path']] = source['sha256']
    for source in source_map['commonSources']:
        assert digest(ROOT / source['path']) == source['sha256']
        checked[source['path']] = source['sha256']
    target = json.loads((ROOT / 'docs/tasks/evidence/TASK-SETTINGS-241/target-display-list.json').read_text(encoding='utf-8'))
    assert digest(ROOT / target['source']) == target['sha256']
    assert len(source_map['types']) == 40 and len(profiles) == 4
    result = dict(status='constructors-and-hashes-revalidated-not-monster2-collision',
                  types=40, profiles=4, sources=checked,
                  stageCommonSha256=target['sha256'], profileSourceMapSha256=digest(path),
                  profilesSha256=digest(profiles_path), constructorReaderSha256=digest(script),
                  limitation='Monster2 attack frames, matrices, pixel fields, target reception and HP still require independent evidence; no 241/248 residual approval transferred.')
    out = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-257/profile-preflight.json'
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: result[k] for k in ['status', 'types', 'profiles']}))


if __name__ == '__main__':
    main()
