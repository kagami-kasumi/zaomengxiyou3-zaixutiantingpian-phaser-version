"""249 self-contained collision and native display assets, derived from verified 248."""
import base64
import hashlib
import json
from pathlib import Path
import sys
import zlib
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
SIDE=ROOT/'docs/reverse-engineering/reference/monster3-attack-collision-contract.json'
DEST=ROOT/'public/assets/monsters/family-3-30/monster3-native'
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def output(p,data):
    if '--check' in sys.argv:assert read(p)==data,p
    else:p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(data,separators=(',',':'))+'\n',encoding='utf-8')

def main():
    side=read(SIDE);assert side['status']=='verified' and side['unresolved']==[]
    fields={};poses=[]
    for attack in side['attacks']:
        native=read(ROOT/attack['oracle']['path']);assert sha(ROOT/attack['oracle']['path'])==attack['oracle']['sha256']
        bounds={t['id']:t['bounds'] for t in native['targets']}
        for pose in native['projections']:
            tree=pose['tree'];root=tree['worldMatrix'];b=tree['stageBounds'];key=f"f{pose['frame']}-s{pose['sign']}"
            bounds[key]=dict(x=b['x']-root['tx'],y=b['y']-root['ty'],width=b['width'],height=b['height'])
            source=ROOT/f"local-resources/regima/task-outputs/TASK-SETTINGS-248/attack{attack['attack']}/air/baselines/{key}.png"
            im=Image.open(source).convert('RGBA');box=im.getbbox();assert box
            filename=f"a{attack['attack']}-{key}.png";dest=DEST/filename;crop=im.crop(box)
            if '--check' in sys.argv:assert Image.open(dest).convert('RGBA').tobytes()==crop.tobytes(),dest
            else:DEST.mkdir(parents=True,exist_ok=True);crop.save(dest)
            poses.append(dict(attack=attack['attack'],frame=pose['frame'],sign=pose['sign'],
              key='monster3-native-'+filename[:-4],path='/assets/monsters/family-3-30/monster3-native/'+filename,
              x=box[0]-root['tx'],y=box[1]-root['ty'],width=crop.width,height=crop.height,sourceSha256=sha(source)))
        for f in attack['phaseFields']:
            packed=(ROOT/f['path']).read_bytes();assert hashlib.sha256(packed).hexdigest()==f['sha256']
            raw=zlib.decompress(packed);planes=[];lookup=[]
            for i in range(400):
                plane=raw[i*f['phaseStride']:(i+1)*f['phaseStride']]
                if plane not in planes:planes.append(plane)
                lookup.append(planes.index(plane))
            identity=f"a{attack['attack']}-{f['id']}" if f['id'].startswith('f') else f['id']
            value=dict(id=identity,bounds=bounds[f['id']],**{k:f[k] for k in ['width','height','originX','originY']},
              phases=lookup,planes=[base64.b64encode(p).decode() for p in planes])
            if identity in fields:assert fields[identity]==value,'Target field disagreement'
            fields[identity]=value
    output(ROOT/'src/assets/monster3-collision.json',dict(truthId=side['truthId'],sourceContractSha256=sha(SIDE),profiles=side['profiles'],fields=list(fields.values())))
    output(ROOT/'src/assets/monster3-native-display.json',dict(truthId=side['truthId'],poses=poses))
    print('249 assets:',len(fields),'fields;',len(poses),'native display poses')

if __name__=='__main__':main()
