"""Freeze body visual rows/cells from the four original AS3 initializers."""
import hashlib
import json
import re
import runpy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT/'docs/tasks/evidence/TASK-SETTINGS-228/body-inputs.json'


def main():
    helpers = runpy.run_path(str(ROOT/'tools/turtle-source/prepare.py'))
    take, source = helpers['method'], helpers['SRC']
    forms = []
    for form in range(1, 5):
        path = source/f'export/pet/PetMonkey{form}.as'
        text = path.read_text(encoding='utf-8')
        init, action, enter = (take(text, method) for method in ['initBBDC', 'setAction', 'enterFrameFunc'])
        size = re.search(r'new BaseBitmapDataClip\(\[_loc1_\],(\d+),(\d+)', init)
        offsets = re.search(r'setOffsetXY\((-?\d+),(-?\d+)\)', init)
        holds = json.loads(re.search(r'setFrameStopCount\((\[.*\])\);', init)[1])
        counts = json.loads(re.search(r'setFrameCount\((\[.*\])\);', init)[1])
        actions = []
        for match in re.finditer(r'case "([^"]+)":([\s\S]*?)(?=case "|$)', action):
            row = int(re.search(r'setFramePointY\((\d+)\)', match[2])[1])
            actions.append(dict(action=match[1], row=row, resetColumnOnlyOnRowChange='_loc2_.y !=' in match[2]))
        assert len(holds) == len(counts)
        rows = []
        for row, count in enumerate(counts):
            tick, cells = 0, []
            for column, hold in enumerate(holds[row]):
                cells.append(dict(column=column, holdTicks=hold))
            sequence = []
            for key_frame in range(count):
                column = key_frame % len(holds[row])
                hold = holds[row][column]
                sequence.append(dict(keyFrame=key_frame,column=column,holdTicks=hold,entryHostTick=tick+1,lastHostTick=tick+hold))
                tick += hold
            rows.append(dict(row=row, cells=cells, keyFrameCount=count, sequence=sequence,totalHostTicks=tick))
        records = []
        for method, code in [('initBBDC', init), ('setAction', action), ('enterFrameFunc', enter),
                             ('scriptFrameOverFunc', take(text, 'scriptFrameOverFunc'))]:
            records.append(dict(method=method, startLine=text[:text.index(code)].count('\n')+1,
                                sliceSha256=hashlib.sha256(code.encode()).hexdigest(), code=code))
        forms.append(dict(form=form, symbol=f'PetMonkeyBmd{form}', cellSize=[int(size[1]), int(size[2])],
                          offset=[int(offsets[1]), int(offsets[2])], actions=actions, rows=rows,
                          sourcePath=path.relative_to(ROOT).as_posix(), sourceSha256=hashlib.sha256(path.read_bytes()).hexdigest(),
                          sourceMethods=records))
    report = dict(taskId='TASK-SETTINGS-228', status='expected-only', forms=forms,
                  cellCount=sum(len(row['cells']) for form in forms for row in form['rows']),
                  note='Host tick ranges derive from initializer holds and require independent original BaseBitmapDataClip execution; not a native observation.')
    OUT.write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n', encoding='utf-8', newline='\n')
    print('228 body input:',len(forms),'forms,',report['cellCount'],'declared cells')


if __name__ == '__main__':
    main()
