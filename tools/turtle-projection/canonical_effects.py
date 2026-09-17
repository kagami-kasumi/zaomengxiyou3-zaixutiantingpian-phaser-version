"""Choose an original-origin capture only after a full-envelope observation proves containment.

The source is the NEW 225 native stage capture, never a 222A acceptance baseline.
Objects extending offscreen retain the full transformed capture unchanged.
"""
import json
from PIL import Image
from run import BASE


def main():
    work = BASE / 'effects'
    data = json.loads((work / 'layers.json').read_text())
    source = json.loads((work / 'measurement.json').read_text())
    stages = {b['id']: b for s in source['states'] for b in s['baselines']}
    count = 0
    for row in data['rows']:
        a = row['primary']
        x, y = a['origin']['x'], a['origin']['y']
        if not a['empty'] and 0 < x and 0 < y and x + a['width'] < 940 and y + a['height'] < 590:
            stage = Image.open(work / stages[row['id']]['path']).convert('RGBA')
            box = stage.getchannel('A').getbbox()
            assert box and box[0] > 0 and box[1] > 0 and box[2] < 940 and box[3] < 590
            path = work / 'canonical' / (row['id'] + '.png')
            path.parent.mkdir(exist_ok=True)
            cropped = stage.crop(box)
            cropped.save(path)
            row['canonical'] = dict(path=path.relative_to(work).as_posix(), origin=dict(x=box[0], y=box[1]),
                                    width=cropped.width, height=cropped.height, empty=False,
                                    sourceStage=stages[row['id']]['path'],
                                    reason='Full independent geometric-envelope capture has no offscreen alpha. Preserve original raster origin.')
            count += 1
    (work / 'canonical-layers.json').write_text(json.dumps(data), encoding='utf-8')
    print('Native-origin effect captures:', count, '/', len(data['rows']))


if __name__ == '__main__':
    main()
