"""Compare captured production presenter calls against the frozen original SWF states."""
import copy
import importlib.util
import json
import sys
from pathlib import Path
from PIL import Image, ImageDraw

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/tasks/evidence/TASK-SLICE-214C5'
spec = importlib.util.spec_from_file_location('render', ROOT / 'tools/verify-pet-dragon-asset-projections.py')
render = importlib.util.module_from_spec(spec)
spec.loader.exec_module(render)
data = json.loads((OUT / 'view-projections.json').read_text(encoding='utf-8'))
expected = json.loads((ROOT / 'docs/tasks/evidence/TASK-SETTINGS-213/baseline-index.json').read_text())
ids = [v for v in expected['expectedIds'] if v.startswith(('dragon1.', 'dragon1-normal.'))]
assert [s['id'] for s in data['projections']] == ids
results = []
sheet = Image.new('RGB', (940, 6*200), (30,34,44))
draw = ImageDraw.Draw(sheet)
selected = ['dragon1.wait.left','dragon1.normal.right','dragon1.fs.left',
            'dragon1.fs-clone-active.right','dragon1-normal.frame06.left','dragon1.dead.right']
for state in data['projections']:
    actual = render.render(state)
    original = Image.open(ROOT / state['baseline']).convert('RGBA')
    assert not render.different(actual, original), state['id']
    path = OUT / 'projections' / (state['id'] + '.png')
    path.parent.mkdir(parents=True, exist_ok=True)
    actual.save(path)
    results.append({'id':state['id'], 'differentPixels':0})
    if state['id'] in selected:
        y = selected.index(state['id'])*200
        for col, image in enumerate([original, actual]):
            bg = Image.new('RGBA', image.size, (30,34,44,255)); bg.alpha_composite(image)
            sheet.paste(bg.convert('RGB').resize((310,195)),(col*470+80,y+5))
        draw.text((5,y),state['id']+' | Original / production presenter',fill='white')
kills=[]
for key, state_id in [('geometry','dragon1.wait.left'),('alpha','dragon1.fs-clone-active.right'),
                      ('frame','dragon1.normal.right'),('flip','dragon1-normal.frame06.left')]:
    state=copy.deepcopy(next(s for s in data['projections'] if s['id']==state_id))
    layer=state['layers'][0]
    if key=='geometry': layer['x']+=1
    if key=='alpha': layer['alpha']=1
    if key=='frame': layer['crop'][0]-=250; layer['crop'][2]-=250
    if key=='flip': layer['flipX']=not layer['flipX']
    assert render.different(render.render(state), Image.open(ROOT/state['baseline']).convert('RGBA')), key
    kills.append(key)
sheet.save(OUT/'contact-sheet.png')
(OUT/'visual-diff.json').write_text(json.dumps({'scope':data['scope'],'states':len(results),
    'differentPixels':0,'mutationKills':kills,'results':results},indent=2)+'\n',encoding='utf-8')
print(f'{len(results)} production presenter states match original; four visual mutations rejected')
