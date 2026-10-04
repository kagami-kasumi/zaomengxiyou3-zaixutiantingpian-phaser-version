"""Verify export identity and reject corrupted handoff fields.

This verifies serialization against independently checked original captures.
It does not promote draft evidence or prove modern consumer behavior.
"""
import copy
import hashlib
import json
from jsonschema import Draft202012Validator
from behavior import OUT, SCHEMA, ROOT, build


def run():
    actual = json.loads(OUT.read_text(encoding='utf-8'))
    expected = build()
    sources = list(actual['provenance']) + actual['ownerResolution']['loaderSources']
    for form in actual['forms']:
        sources.extend(form['candidates'])
        sources.extend(form['methods'].values())
        assert form['selectedOwner'] in form['candidates']
    for group in actual['sourceMethods'].values():
        for record in group['records']:
            sources.append({**record, 'path': 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts/' + record['path'].replace('\\', '/')})
    for source in sources:
        assert hashlib.sha256((ROOT / source['path']).read_bytes()).hexdigest() == source['sha256'], source['path']
    validator = Draft202012Validator(json.loads(SCHEMA.read_text(encoding='utf-8')))

    def check(value):
        validator.validate(value)
        assert value == expected, 'Export differs from checked native/source inputs'

    check(actual)
    mutations = {
        'selected-owner': lambda v: v['forms'][0].__setitem__('selectedOwner', v['forms'][0]['candidates'][0]),
        'hold': lambda v: v['forms'][0]['actions'][0]['frameStopCount'].__setitem__(0, 9),
        'row': lambda v: v['forms'][0]['actions'][0].__setitem__('row', 0),
        'count': lambda v: v['forms'][0]['actions'][0].__setitem__('frameCount', 2),
        'terminal': lambda v: v['clock'][0]['states'][-1].__setitem__('action', 'hurt'),
        'guard': lambda v: v['guards'][0]['after'].__setitem__('action', 'hurt'),
        'cleanup': lambda v: v['cleanup'][0]['completed'].__setitem__('partnerIntact', False),
        'protection': lambda v: v['protection'][0]['states'][-2].__setitem__('isProtected', False),
    }
    for name, change in mutations.items():
        altered = copy.deepcopy(actual)
        change(altered)
        try:
            check(altered)
        except AssertionError:
            continue
        raise AssertionError(f'Corrupted contract accepted: {name}')
    print(f'Behavior export matches original captures; {len(mutations)} data corruptions rejected; contract status preserved.')


if __name__ == '__main__':
    run()
