"""Pack restored exports by trimming only fully transparent effect borders; preserve source registration."""
import argparse
import hashlib
import io
import json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/"local-resources/regima/task-outputs/task-settings-213-pet-dragon-family"
CATALOG=ROOT/"src/assets/PetDragonAssetFiles.json"

def main():
    parser=argparse.ArgumentParser();parser.add_argument("--check",action="store_true");args=parser.parse_args()
    truth=json.loads((ROOT/"docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json").read_text(encoding="utf-8"))
    assert truth["status"]=="verified" and not truth["completeness"]["unresolved"]
    for source in truth["sources"]:
        assert hashlib.sha256((ROOT/source["file"]).read_bytes()).hexdigest()==source["sha256"],source["file"]
    files=[]
    for obj in truth["visualTruth"]["displayObjects"]:
        ident=obj["sourceIdentity"];symbol=ident["symbolClass"];char=ident["characterId"]
        if obj["objectType"]=="body-atlas":
            pairs=[(0,SOURCE/"pet1-body"/f"{char}_{symbol}.png",f"/assets/pets/dragon/body/{symbol}.png")]
        else:
            shared=obj["owner"]=="assets/StageCommon.swf"
            source_dir=SOURCE/("common-sprites" if shared else "pet1-sprites")/f"DefineSprite_{char}_{symbol}"
            target=f"/assets/pets/shared/{symbol}" if shared else f"/assets/pets/dragon/effects/{symbol}"
            assert {int(x.stem) for x in source_dir.glob("*.png")}==set(range(1,obj["frameCount"]+1))
            pairs=[(f,source_dir/f"{f}.png",f"{target}/{f}.png") for f in range(1,obj["frameCount"]+1)]
        for frame,source,url in pairs:
            original=source.read_bytes();target=ROOT/"public"/url.lstrip("/")
            with Image.open(source) as im:
                image=im.convert("RGBA");source_width,source_height=image.size
                bounds=(0,0,source_width,source_height) if frame==0 else (image.getchannel("A").getbbox() or (0,0,1,1))
                trimmed=image.crop(bounds);width,height=trimmed.size
                buffer=io.BytesIO();trimmed.save(buffer,format="PNG",compress_level=9)
                data=original if frame==0 else buffer.getvalue()
            files.append(dict(objectId=obj["id"],frame=frame,key=f"pet-animation.dragon.{obj['id']}.{frame}" if symbol!="AoyiBuff" else f"pet-animation.shared.AoyiBuff.{frame}",path=url,width=width,height=height,sourceWidth=source_width,sourceHeight=source_height,cropX=bounds[0],cropY=bounds[1],sourceSha256=hashlib.sha256(original).hexdigest(),sha256=hashlib.sha256(data).hexdigest(),source=str(source.relative_to(ROOT)).replace("\\","/"),owner=obj["owner"]))
            if args.check: assert target.exists() and target.read_bytes()==data,f"stale asset {url}"
            else: target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data)
    result=dict(truthId=truth["truthId"],files=files)
    serialized=json.dumps(result,ensure_ascii=False,indent=2)+"\n"
    if args.check: assert CATALOG.read_text(encoding="utf-8")==serialized,"stale file metadata"
    else: CATALOG.write_text(serialized,encoding="utf-8",newline="\n")
    disk=set((ROOT/"public/assets/pets/dragon").rglob("*.png"))|set((ROOT/"public/assets/pets/shared/AoyiBuff").glob("*.png"))
    assert disk=={ROOT/"public"/f["path"].lstrip("/") for f in files},"unexpected or missing files"
    print(f"dragon assets {'checked' if args.check else 'integrated'}: {len(files)} files, 11 objects, source hashes verified")
if __name__=="__main__": main()
