"""Small runtime integrity table for browsers receiving HTTP-decoded .json.gz."""
from pathlib import Path
import gzip, hashlib, json, sys
ROOT=Path(__file__).resolve().parents[2]
manifest=json.loads((ROOT/'public/assets/pets/turtle/manifest.json').read_text(encoding='utf-8'))
records={}
for name,record in manifest['packages'].items():
    raw=(ROOT/'public'/record['path'].lstrip('/')).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==record['sha256']
    decoded=gzip.decompress(raw)
    records[name]=dict(compressedSha256=record['sha256'],decodedSha256=hashlib.sha256(decoded).hexdigest())
payload=json.dumps(records,indent=2)+'\n'
target=ROOT/'src/assets/PetTurtleDecodedHashes.json'
if '--check' in sys.argv: assert target.read_text(encoding='utf-8')==payload
else: target.write_text(payload,encoding='utf-8',newline='\n')
print('Turtle HTTP decoding integrity table verified.' if '--check' in sys.argv else 'Turtle HTTP decoding integrity table generated.')
