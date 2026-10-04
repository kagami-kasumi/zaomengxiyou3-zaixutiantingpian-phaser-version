"""Export source input and native traces without a runtime dependency on local evidence.

The draft remains an input to the final independent audit, not a completion claim.
"""
import hashlib
import json
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / 'local-resources/regima/task-outputs/TASK-SETTINGS-254'
OUT = ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-254-pet-reception-behavior.json'
SCHEMA = ROOT / 'docs/reverse-engineering/ground-truth/schema/pet-reception-behavior.schema.json'


def read(relative):
    return json.loads((WORK / relative).read_text(encoding='utf-8'))


def build():
    # Recheck actual evidence before exporting; never export a failed capture.
    from verify import verify
    from verify_cleanup import verify as cleanup
    from verify_owner import verify as owner
    verify(WORK / 'clock')
    cleanup(WORK / 'cleanup')
    owner_report = owner()
    names = ['source-inventory.json', 'clock/observations.json',
             'clock/lifecycle.json', 'clock/receptions.json',
             'clock/guard-receptions.json', 'clock/protection.json',
             'clock/sources.json', 'cleanup/observations.json', 'cleanup/sources.json',
             'owner/observations.json', 'owner/verification.json']
    provenance = [dict(path=(WORK / n).relative_to(ROOT).as_posix(),
                       sha256=hashlib.sha256((WORK / n).read_bytes()).hexdigest()) for n in names]
    forms = read('source-inventory.json')['forms']
    for form in forms:
        candidates = form['candidates']
        form['selectedOwner'] = next(c for c in candidates if c['path'].endswith('/20120203.swf')) if len(candidates) > 1 else candidates[0]
    loader_sources = []
    for filename, line in [('Aloader.as', 34), ('AssetsLoader.as', 248)]:
        path = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/loader' / filename
        loader_sources.append(dict(path=path.relative_to(ROOT).as_posix(), line=line,
                                   sha256=hashlib.sha256(path.read_bytes()).hexdigest()))
    # Original source strings preserve conditional entry and inherited method
    # locators. Consumers must not replace conditional rows with a uniform timer.
    data = dict(schemaVersion=1, truthId='task-settings-254.pet-reception-behavior',
                status='verified', forms=forms, provenance=provenance,
                ownerResolution=dict(rule='first-definition-retained-in-shared-ApplicationDomain',
                                     testedPackageOrder=['20120203.swf', '20120808.swf', 'StageCommon.swf', 'pet1.swf', 'mouse.swf'],
                                     loaderSources=loader_sources, counterexample=owner_report),
                sourceMethods=dict(clock=read('clock/sources.json'),
                                   cleanup=read('cleanup/sources.json')),
                hostClock=dict(rates=[20, 24, 30], advancement='manual-source-step',
                               realTimeSchedulerVerified=False),
                scope=dict(actions=['hurt', 'dead'], injectedCoordinatesReachable=False,
                           tweenInterpolationVerified=False, skillExecutionVerified=False),
                clock=read('clock/observations.json'),
                pause=read('clock/lifecycle.json'),
                receptions=read('clock/receptions.json'),
                guards=read('clock/guard-receptions.json'),
                protection=read('clock/protection.json'),
                cleanup=read('cleanup/observations.json'),
                unresolved=[])
    data['$schema'] = '../schema/pet-reception-behavior.schema.json'
    return data


def run():
    data = build()
    Draft202012Validator(json.loads(SCHEMA.read_text(encoding='utf-8'))).validate(data)
    # Compact JSON avoids repeating indentation for tens of thousands of native
    # states; all field names and every observed host step remain lossless.
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n',
                   encoding='utf-8', newline='\n')
    print(f'Verified behavior contract: {len(data["forms"])} forms, '
          f'{len(data["clock"])} source-clock cases; {OUT.stat().st_size} bytes')


if __name__ == '__main__':
    run()
