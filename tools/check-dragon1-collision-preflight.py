"""Read-only 214C4 source/asset preflight; does not certify combat or Flash raster equivalence."""
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/tasks/evidence/TASK-SLICE-214C4'
SOURCE = ROOT / 'local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts'

def read(relative):
    path = SOURCE / relative
    data = path.read_bytes()
    return data.decode('utf-8-sig'), {'path': path.relative_to(ROOT).as_posix(),
                                    'sha256': hashlib.sha256(data).hexdigest()}

monster, monster_source = read('base/BaseMonster.as')
hit_test, hit_source = read('my/HitTest.as')
bullet, bullet_source = read('base/BaseBullet.as')
assert 'HitTest.complexHitTestObject(this.colipse,param1)' in monster
assert 'AUtils.testIntersects(this.colipse,param1,gc.gameSence)' in monster
assert 'BlendMode.DIFFERENCE' in hit_test and 'getColorBoundsRect' in hit_test
assert bullet.index('if(_loc2_.beMagicAttack(this,this.sourceRole))') < bullet.index(
    'this.refreshSourceRoleAttackInfoObject();', bullet.index('if(_loc2_.beMagicAttack(this,this.sourceRole))'))

truth = json.loads((ROOT / 'docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json').read_text(encoding='utf-8'))
catalog = json.loads((ROOT / 'src/assets/PetDragonAssetFiles.json').read_text(encoding='utf-8'))
frames = []
for file in catalog['files']:
    if file['objectId'] != 'PetDragon1Bullet1':
        continue
    path = ROOT / ('public' + file['path'])
    assert hashlib.sha256(path.read_bytes()).hexdigest() == file['sha256']
    with Image.open(path) as image:
        alpha = image.getchannel('A')
        histogram = alpha.histogram()
        frames.append({'frame': file['frame'], 'path': file['path'], 'sha256': file['sha256'],
                       'size': list(image.size), 'crop': [file['cropX'], file['cropY']],
                       'transparentPixels': histogram[0], 'nontransparentPixels': sum(histogram[1:])})
assert len(frames) == 11
assert frames[0]['transparentPixels'] > 0 and frames[0]['nontransparentPixels'] > 0
profiles = [p['class'] for p in truth['collisionProfiles']]
OUT.mkdir(parents=True, exist_ok=True)
report = {'status': 'blocked-input', 'task': 'TASK-SLICE-214C4',
          'scope': 'Source conditions and existing asset alpha only; no production combat trace or Flash pixel replay',
          'sources': [monster_source, hit_source, bullet_source],
          'existingPetCollisionProfiles': profiles, 'bulletFrames': frames,
          'requiredEvidence': ['target colipse shape/registration/transform',
                               'Flash draw/intersection sampling equivalence',
                               'successful-hit cached damage refresh and rejected-hit fixtures'],
          'retained': '213/214A visual assets and pet geometry; target collision completeness not established'}
(OUT / 'collision-preflight.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('214C4 preflight reproduced: 11 unchanged RGBA assets; target collision input remains blocked.')
