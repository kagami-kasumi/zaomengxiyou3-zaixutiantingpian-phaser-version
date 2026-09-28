"""Deliver verified 241 masks as self-contained game data; no local evidence at runtime."""
import base64,hashlib,json,zlib,sys
from pathlib import Path
from generate import ROOT,OUT,WORK,SIDE,read,save

def main():
 side=read(SIDE);assert side['status']=='verified' and not side['unresolved']
 fields=[]
 target_bounds={t['id']:t['bounds'] for t in side['targets']}
 attack_bounds={f"f{b['frame']}-s{b['sign']}":dict(x=b['worldBounds']['x']-b['rootMatrix']['tx'],y=b['worldBounds']['y']-b['rootMatrix']['ty'],width=b['worldBounds']['width'],height=b['worldBounds']['height']) for b in side['attackBounds']}
 for f in side['phaseFields']:
  packed=(ROOT/f['path']).read_bytes();assert hashlib.sha256(packed).hexdigest()==f['sha256']
  raw=zlib.decompress(packed);planes=[];lookup=[]
  for i in range(400):
   p=raw[i*f['phaseStride']:(i+1)*f['phaseStride']]
   if p not in planes:planes.append(p)
   lookup.append(planes.index(p))
  fields.append({**{k:f[k] for k in ['id','bounds','width','height','originX','originY','phaseStride']},'bounds':target_bounds.get(f['id'],attack_bounds.get(f['id'])),'phases':lookup,'planes':[base64.b64encode(p).decode() for p in planes]})
 data=dict(truthId=side['truthId'],status='verified',sourceContractSha256=hashlib.sha256(SIDE.read_bytes()).hexdigest(),profiles=side['profiles'],fields=fields)
 if '--check' in sys.argv: assert read(ROOT/'src/assets/monster30-collision.json')==data,'Runtime pack differs from verified 241 input'
 else: save(ROOT/'src/assets/monster30-collision.json',data)
 print('240 runtime collision pack:',len(fields),'fields;',sum(len(f['planes']) for f in fields),'unique planes')
if __name__=='__main__':main()
