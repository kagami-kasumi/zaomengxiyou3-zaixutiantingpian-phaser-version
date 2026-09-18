"""Build the complete finite turtle resource package from verified 222/225 inputs."""
import argparse
from common import ROOT, EVIDENCE, OUT, DEST, FAMILY, PROJECTION, load, sha, write
import visual
import collision


def main(check=False):
    family, projection = load(FAMILY), load(PROJECTION)
    assert family['status'] == projection['status'] == 'verified'
    assert not family['completeness']['unresolved'] and not projection['completeness']['unresolved']
    sources = load(EVIDENCE/'TASK-SETTINGS-222A/source-definitions.json')['sources']
    for source in sources:
        assert sha(ROOT/source['path']) == source['sha256']
    files, packages = visual.build(check)
    packages['collision'] = collision.build(family,check)
    original_display = family['visualTruth']['manifest']
    packages['display'] = write(DEST/'display.json.gz',dict(
        sourceTruthId=original_display['truthId'],
        sourceDisplayObjects=original_display['displayObjects'],
        projectionDisplayObjects=projection['displayObjects'],
        states=original_display['states'],
        note='Original matrices/registration/masks are source metadata. Projection matrices restore crop positions; source transforms are already baked and must not be applied again.'),check)
    body = load(EVIDENCE/'TASK-SETTINGS-222A/body-inputs.json')
    metadata = dict(version=1, truthId=family['truthId'], projectionTruthId=projection['truthId'],
        sourceHashes={FAMILY.relative_to(ROOT).as_posix():sha(FAMILY),
                      PROJECTION.relative_to(ROOT).as_posix():sha(PROJECTION)},
        sourceSymbols=[dict(source=s['path'],sha256=s['sha256'],symbols=s['symbols']) for s in sources],
        packages=packages, images=files, bodyAnimations=body['forms'],
        contracts=family['contractMatrix'],
        composition=dict(stage=[940,590],fps=24,sourceTransformsBaked=True,
            premultiply='(C*A+255)//256',over='S+D*(256-SA)//256',
            unpremultiply='min(255,P*256//max(A,1))',
            rule='Independent owner groups; paintParts in depth order. Components are separate observations, not extra paint commands. Never flatten unfiltered siblings.'),
        visualException=dict(approval=load(EVIDENCE/'TASK-SETTINGS-225/visual-exception-approval.json'),
            tuples=load(EVIDENCE/'TASK-SETTINGS-225/diagnostics/exact-unresolved-pixels.json')),
        boundary='Finite resource preparation only. Formal runtime and all 32 gameplay contracts remain pending in 224A/B/C.')
    write(DEST/'manifest.json',metadata,check)
    expected={DEST/'manifest.json',*(DEST/(m+'.json.gz') for m in packages),
              *(ROOT/'public'/f['path'].lstrip('/') for f in files.values())}
    assert {p for p in DEST.rglob('*') if p.is_file()} == expected
    OUT.mkdir(parents=True,exist_ok=True)
    report=dict(status='passed',states=sum(v.get('states',0) for v in packages.values()),
                images=len(files),contracts=len(metadata['contracts']),
                bytes=sum(p.stat().st_size for p in expected),manifestSha256=sha(DEST/'manifest.json'))
    (OUT/'generation.json').write_bytes(__import__('common').encode(report))
    print(report)


if __name__ == '__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true')
    main(parser.parse_args().check)
