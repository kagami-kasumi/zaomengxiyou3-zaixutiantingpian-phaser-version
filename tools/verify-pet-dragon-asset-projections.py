"""Render production-query projections with copied runtime PNGs, compare frozen originals."""
import argparse
import copy
import hashlib
import io
import json
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"docs/tasks/evidence/TASK-SLICE-214A"

def render(state):
    canvas=Image.new("RGBA",(940,590))
    for layer in state["layers"]:
        image=Image.open(ROOT/"public"/layer["path"].lstrip("/")).convert("RGBA")
        if "crop" in layer: image=image.crop(tuple(layer["crop"]))
        if layer["flipX"]: image=image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        if layer.get("alpha",1)!=1: image.putalpha(image.getchannel("A").point(lambda v:round(v*layer["alpha"])))
        canvas.alpha_composite(image,(round(layer["x"]),round(layer["y"])))
    return canvas

def different(a,b):
    return any(band.getbbox() for band in ImageChops.difference(a,b).split())

def main():
    parser=argparse.ArgumentParser();parser.add_argument("--check",action="store_true");args=parser.parse_args()
    data=json.loads((OUT/"asset-projections.json").read_text(encoding="utf-8"))
    baseline=json.loads((ROOT/"docs/tasks/evidence/TASK-SETTINGS-213/baseline-index.json").read_text(encoding="utf-8"))
    assert [x["id"] for x in data["projections"]]==baseline["expectedIds"]
    results=[];contact=Image.new("RGB",(940,8*180),(30,34,44));draw=ImageDraw.Draw(contact);shown=0
    selected=['dragon1.normal.left','dragon2.sdcc.right','dragon3.ltwj.left','dragon4.qlaoyi.left','dragon4.fs-clone-active.right','dragon3-ltwj.nine-object-wave.left','dragon4-qlaoyi.frame24.left','dragon4-qlaoyi-aoyi-buff.frame07.fixed']
    for state in data["projections"]:
        actual=render(state);original=Image.open(ROOT/state["baseline"]).convert("RGBA")
        assert not different(actual,original),"unexplained visual difference: "+state["id"]
        buffer=io.BytesIO();actual.save(buffer,format="PNG",compress_level=9);pixels=buffer.getvalue()
        path=OUT/"projections"/(state["id"]+".png")
        if args.check: assert path.exists() and path.read_bytes()==pixels,"stale projection: "+state["id"]
        else: path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(pixels)
        results.append(dict(id=state["id"],path=str(path.relative_to(ROOT)).replace("\\","/"),sha256=hashlib.sha256(pixels).hexdigest(),differentPixels=0,layers=len(state["layers"])))
        if state["id"] in selected:
            for i,(im,label) in enumerate([(original,"Original"),(actual,"Asset query projection")]):
                bg=Image.new("RGBA",im.size,(30,34,44,255));bg.alpha_composite(im)
                contact.paste(bg.convert("RGB").resize((263,165)),(i*470+103,shown*180+15))
                draw.text((i*470+8,shown*180),label+" "+state["id"],fill='white')
            shown+=1
    assert shown==8
    killed=[]
    for kind,state_id in [('geometry','dragon4.normal.cell02.left'),('alpha','dragon4.fs-clone-active.right'),('wave-count','dragon3-ltwj.nine-object-wave.left'),('frame','dragon4.normal.cell02.left')]:
        state=copy.deepcopy(next(x for x in data['projections'] if x['id']==state_id))
        if kind=='geometry': state['layers'][0]['x']+=1
        if kind=='alpha': state['layers'][0]['alpha']=0.1
        if kind=='wave-count': state['layers']=state['layers'][:4]
        if kind=='frame':
            crop=state['layers'][0]['crop'];width=crop[2]-crop[0];crop[0]-=width;crop[2]-=width
        assert different(render(state),Image.open(ROOT/state['baseline']).convert('RGBA')),kind+' mutation survived'
        killed.append(kind)
    report=dict(truthId=data['truthId'],scope=data['scope'],states=len(results),differentPixels=0,mutationKills=killed,results=results,unresolved=[])
    text=json.dumps(report,ensure_ascii=False,indent=2)+'\n'
    if args.check: assert (OUT/'visual-diff.json').read_text(encoding='utf-8')==text
    else:
        (OUT/'visual-diff.json').write_text(text,encoding='utf-8',newline='\n');contact.save(OUT/'contact-sheet.png')
    print(f"dragon modern asset projections: {len(results)} states, zero pixel differences, 4 visual mutation kills")
if __name__=='__main__': main()
