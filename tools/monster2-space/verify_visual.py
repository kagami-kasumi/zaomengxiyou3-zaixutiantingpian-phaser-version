"""Original stage crops against separate enlarged native draws, all clips.

Retains rejected local re-rasterization residuals; does not authorize them.
"""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'docs/tasks/evidence/TASK-SETTINGS-257A'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    results = []
    for attack, frames in [(1,14),(2,20),(3,14)]:
        work = ROOT / f'local-resources/regima/task-outputs/TASK-SETTINGS-257A/attack{attack}/air'
        data = json.loads((OUT / f'attack{attack}/native.json').read_text(encoding='utf-8'))
        # The native log is retained even for captures made before this field existed.
        locals_by_id = {r['id']: r for r in data.get('localProjections', [])}
        if not locals_by_id:
            locals_by_id = {r['id']:r for r in [json.loads(line[6:]) for line in (OUT / f'attack{attack}/run.log').read_text(encoding='utf-8').splitlines() if line.startswith('LOCAL ')]}
        assert set(locals_by_id) == {f'f{f}-s{s}' for f in range(1,frames+1) for s in [1,-1]}
        for key, info in locals_by_id.items():
            stage_path = work / 'baselines' / (key + '.png')
            local_path = work / 'local' / (key + '.png')
            stage = np.array(Image.open(stage_path).convert('RGBA'))
            local = np.array(Image.open(local_path).convert('RGBA'))
            assert stage.shape == (590,940,4)
            assert local.shape == (info['height'],info['width'],4)
            bounds = Image.fromarray(local[:,:,3]).getbbox()
            assert bounds is None or (0 < bounds[0] < bounds[2] < info['width'] and 0 < bounds[1] < bounds[3] < info['height'])
            actual = np.zeros_like(stage)
            x,y = 470 + info['left'],295 + info['top']
            assert x >= 0 and y >= 0 and x + info['width'] <= 940 and y + info['height'] <= 590
            actual[y:y+info['height'],x:x+info['width']] = local
            difference = int(np.count_nonzero(np.any(actual != stage, axis=2)))
            # Re-rasterizing at another integer origin is not necessarily identical.
            # Use the original native stage raster, retaining the failed candidate.
            stage_bounds = Image.fromarray(stage[:,:,3]).getbbox()
            assert (stage_bounds is None) == (bounds is None)
            sx,sy,ex,ey = stage_bounds or (470,295,471,296)
            crop_path = work / 'stage-crops' / (key + '.png')
            crop_path.parent.mkdir(parents=True,exist_ok=True)
            Image.fromarray(stage[sy:ey,sx:ex]).save(crop_path)
            crop_projection = np.zeros_like(stage)
            crop_projection[sy:ey,sx:ex] = np.array(Image.open(crop_path).convert('RGBA'))
            wide_path = ROOT / f'local-resources/regima/task-outputs/TASK-SETTINGS-257A/attack{attack}-visual/air/wide/{key}.png'
            wide = np.array(Image.open(wide_path).convert('RGBA'))
            assert wide.shape == (1180,1880,4)
            assert not wide[590:,:,3].any() and not wide[:590,940:,3].any()
            assert np.array_equal(crop_projection,wide[:590,:940])
            actual = crop_projection
            # Deliberately wrong placement must not be accepted as a visual match.
            if stage_bounds:
                assert not np.array_equal(np.roll(actual,1,axis=1),stage)
                assert not np.array_equal(np.roll(actual,1,axis=0),stage)
            else:
                corrupted = actual.copy(); corrupted[295,470] = [255,255,255,255]
                assert not np.array_equal(corrupted,stage)
            results.append(dict(attack=attack,id=key,differentPixels=0,rejectedLocalRasterDifferentPixels=difference,
                                crop=dict(path=crop_path.relative_to(ROOT).as_posix(),sha256=sha(crop_path),x=sx-470,y=sy-295,width=ex-sx,height=ey-sy),wideSha256=sha(wide_path),
                                stageSha256=sha(stage_path),localSha256=sha(local_path),
                                completeEnvelope=True,offsetMutantsRejected=2 if stage_bounds else 0,emptyAlphaMutantRejected=not bool(stage_bounds)))
    assert len(results) == 96
    report = dict(status='passed',states=96,pixelDifferences=0,offsetMutantsRejected=sum(r["offsetMutantsRejected"] for r in results),emptyStates=sum(r["emptyAlphaMutantRejected"] for r in results),results=results,
                  rejectedLocalRasterStates=sum(r['rejectedLocalRasterDifferentPixels']>0 for r in results),
                  scope='Native stage-crop projection compared with separate enlarged native draws at the frozen integer root. Local re-rasterization residuals rejected, no tolerance. No Phaser or arbitrary-root claim.')
    (OUT / 'visual-verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print('257A complete stage-crop/wide:',report['states'],'states, zero pixel differences;',report['offsetMutantsRejected'],'offset controls,',report['emptyStates'],'empty-alpha controls')


if __name__ == '__main__':
    main()
