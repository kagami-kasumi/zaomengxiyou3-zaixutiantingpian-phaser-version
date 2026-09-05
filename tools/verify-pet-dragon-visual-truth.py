"""Independent source/complete-output checks; does not import either generator."""
import argparse
import copy
import hashlib
import json
import re
import sys
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[1]
AS3 = ROOT / "local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts"
EXTRACT = ROOT / "local-resources/regima/task-outputs/task-settings-213-pet-dragon-family"
ALIASES = dict(zip(["hit1", "hit2", "hit3", "hit4", "hit5", "hit6"], ["normal", "fs", "sdcc", "ltwj", "qlaoyi", "qlaoyi-ltwj-link"]))


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def parse_method(text, name):
    start = text.index("function " + name + "(")
    begin = text.index("{", start)
    depth, end = 1, begin + 1
    while depth:
        depth += (text[end] == "{") - (text[end] == "}")
        end += 1
    return text[begin+1:end-1]


def source_forms():
    result = []
    for form in range(1, 5):
        text = (AS3 / f"export/pet/PetDragon{form}.as").read_text(encoding="utf-8")
        holds = json.loads(re.search(r"setFrameStopCount\((\[.*?\])\);", text).group(1))
        counts = json.loads(re.search(r"setFrameCount\((\[.*?\])\);", text).group(1))
        offset = tuple(map(int, re.search(r"setOffsetXY\((-?\d+),(-?\d+)\)", text).groups()))
        actions = {}
        for action, case in re.findall(r'case "([^"]+)":(.*?)(?=case "|$)', parse_method(text, "setAction"), re.S):
            row = int(re.search(r"setFramePointY\((\d+)\)", case).group(1))
            require(len(holds[row]) == counts[row], "source inconsistent row")
            actions[ALIASES.get(action, action)] = (row, holds[row], action)
        result.append((form, actions, offset, text))
    return result


def expected_body_image(obj, row, column, direction, offset):
    width, height = obj["cell"]["width"], obj["cell"]["height"]
    identity = obj["sourceIdentity"]
    atlas = Image.open(EXTRACT / "pet1-body" / f'{identity["characterId"]}_{identity["symbolClass"]}.png').convert("RGBA")
    image = atlas.crop((column*width, row*height, (column+1)*width, (row+1)*height))
    canvas = Image.new("RGBA", (940, 590))
    if direction == "right":
        image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    x = 470 - width//2 + (offset[0] if direction == "right" else -offset[0])
    canvas.alpha_composite(image, (x, 350-height//2+offset[1]))
    return canvas


def same_pixels(expected, actual):
    return not any(band.getbbox() for band in ImageChops.difference(expected, actual).split())


def verify(truth, index, pixels=True, overrides=None):
    clip = (AS3 / "base/BaseBitmapDataClip.as").read_text(encoding="utf-8")
    step = parse_method(clip, "step")
    require(step.index("addFrameScriptEnterEveryFrame()") < step.index("--this.curFrameStopCount") < step.index("addFrameScriptExitEveryFrame()"), "source callback ordering changed")
    require("return this.curFrameStopCount" in parse_method(clip,"getCurFrameCount"), "source getter is not remaining counter")
    visual = truth["visualTruth"]
    require(visual["bodyClock"]["counter"] == "remaining hold ticks", "countdown clock missing")
    require(visual["bodyClock"]["callbackOrder"] == ["enter callback with current remaining count", "decrement or advance/frame-over", "exit callback"], "clock callback order")
    items = {item["id"]: item for item in index["items"]}
    require(len(items) == len(index["items"]), "duplicate state")
    expected_cells = set()
    require(len(visual["bodyTimelines"]) == 4, "body form coverage")
    for form, actions, offset, source in source_forms():
        timeline = next(x for x in visual["bodyTimelines"] if x["form"] == form)
        actual = {a["id"]: a for a in timeline["actions"]}
        require(set(actual) == set(actions), f"dragon{form} full action coverage")
        obj = next(o for o in visual["displayObjects"] if o["id"] == f"dragon{form}-body")
        require((obj["offset"]["x"], obj["offset"]["y"]) == offset, "body offset")
        for name, (row, holds, source_action) in actions.items():
            a = actual[name]
            require(a["row"] == row and a["sourceAction"] == source_action, "action row/identity")
            require(a["loops"] == (name in ("wait", "walk")), "loop flag")
            require(a["totalHostTicks"] == sum(holds), "total time")
            require([c["holdTicks"] for c in a["cells"]] == holds, "hold sequence")
            require(a["completion"]["destroys"] == (name == "dead"), "death transition")
            # Transition branches remain source-addressable as well as machine routes.
            source_cases = dict(re.findall(r'case "([^"]+)":(.*?)(?=case "|$)', parse_method(source, "scriptFrameOverFunc"), re.S))
            require(a["completion"]["sourceCode"] == source_cases[source_action].strip(), "completion source")
            routes = [{"when": [], "target": "wait"}]
            if name in ("wait", "walk", "dead"):
                routes = [{"when": [], "target": "destroy" if name == "dead" else name}]
            elif form == 4 and name == "sdcc":
                routes = [{"when": ["isAoyi", "learned:ltwj"], "target": "ltwj", "free": True}, {"when": [], "target": "wait"}]
            elif form == 4 and name == "qlaoyi":
                routes = [{"when": ["isAoyi", "learned:sdcc"], "target": "sdcc", "free": True}, {"when": ["isAoyi", "learned:ltwj"], "target": "qlaoyi-ltwj-link"}, {"when": [], "target": "wait"}]
            elif form == 4 and name == "qlaoyi-ltwj-link":
                routes = [{"when": [], "target": "ltwj", "free": True}]
            require(a["completion"]["routes"] == routes, "completion routes")
            tick = 1
            for column, hold in enumerate(holds):
                c = a["cells"][column]
                expected_cell = dict(column=column, holdTicks=hold, firstHostTick=tick, lastHostTick=tick+hold-1)
                require(c == expected_cell, "cell host interval")
                for direction in ("left", "right"):
                    state = f"dragon{form}.{name}.cell{column:02d}.{direction}"
                    expected_cells.add(state)
                    require(state in items, "missing cell baseline " + state)
                    require(items[state]["bodyCell"] == dict(form=form, action=name, row=row, **expected_cell), "baseline timing metadata")
                    if pixels:
                        expected = expected_body_image(obj, row, column, direction, offset)
                        actual_image = Image.open(ROOT/items[state]["path"]).convert("RGBA")
                        require(same_pixels(expected, actual_image), "body pixels " + state)
                tick += hold
            action = truth["forms"][form-1]["actions"].get(name)
            if action and "remainingHoldCount" in action["emitTiming"]:
                event = action["emitTiming"]
                require("holdTick" not in event, "ambiguous holdTick")
                seq, remaining = event["sequence"], event["remainingHoldCount"]
                enter_cases = dict(re.findall(r'case "([^"]+)":(.*?)(?=case "|$)', parse_method(source, "enterFrameFunc"), re.S))
                branch = enter_cases[source_action]
                source_remaining = [int(x) for x in re.findall(r"getCurFrameCount\(\) == (\d+)", branch)]
                source_sequence = [int(x) for x in re.findall(r"param1.x == (\d+)", branch)]
                require(source_remaining == [remaining] and source_sequence == [seq], "source emit condition")
                require(event["elapsedHostTick"] == sum(holds[:seq]) + holds[seq] - remaining + 1, "emit countdown conversion")
    require({k for k,v in items.items() if "bodyCell" in v} == expected_cells, "complete body cell set")
    require(visual["baselineCount"] == len(items), "baseline count")
    require(visual["expectedBaselineIds"] == index["expectedIds"] == index["extractedIds"] == [x["id"] for x in index["items"]], "state identity sets")
    dragon4 = truth["forms"][3]
    event = dragon4["actions"]["qlaoyi"]["emitTiming"]
    require(event["cloneRemainingCounts"] == [48,36,24,12] and event["cloneTicks"] == [1,13,25,37], "clone countdown")
    require(event["triggerTick"] == 1 and event["triggerRemainingCount"] == 48, "trigger countdown")
    require(dragon4["special"]["qlaoyi"]["cloneDirections"] == ["left","right","left","right"], "clone directions")
    require(dragon4["actions"]["qlaoyi"]["emit"] == {"x":0,"y":0}, "trigger root offset")
    source = (AS3/"export/pet/PetDragon4.as").read_text(encoding="utf-8")
    code = parse_method(source,"doHit5")
    require('_loc3_.x = this.x;' in code and '_loc3_.y = this.y;' in code, "trigger source position changed")
    if pixels:
        for frame in (1,24,48):
            directory = "DefineSprite_539_PetDragonBullet4"
            raw = Image.open(EXTRACT/"pet1-sprites"/directory/f"{frame}.png").convert("RGBA")
            svg = (EXTRACT/"pet1-svg"/directory/f"{frame}.svg").read_text(encoding="utf-8")
            matrix = re.search(r'<g transform="matrix\(([^)]+)\)"',svg).group(1)
            regx, regy = list(map(float,matrix.split(',')))[4:]
            for direction in ("left","right"):
                state = f"dragon4-qlaoyi.frame{frame:02d}.{direction}"
                canvas = Image.new("RGBA",(940,590))
                picture = raw if direction=="left" else raw.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
                x = 470-regx if direction=="left" else 470+regx-raw.width
                canvas.alpha_composite(picture,(round(x),round(350-regy)))
                actual_image = (overrides or {}).get(state)
                if actual_image is None: actual_image = Image.open(ROOT/items[state]["path"]).convert("RGBA")
                require(same_pixels(canvas,actual_image),"trigger baseline 40px offset " + state)
    return len(expected_cells)


def main():
    parser=argparse.ArgumentParser();parser.add_argument("--candidate",action="store_true");parser.add_argument("--self-test",action="store_true");args=parser.parse_args()
    truth=json.load(sys.stdin) if args.candidate else json.loads((ROOT/"docs/reverse-engineering/ground-truth/manifests/task-settings-213-pet-dragon-family.json").read_text(encoding="utf-8"))
    index=json.loads((ROOT/"docs/tasks/evidence/TASK-SETTINGS-213/baseline-index.json").read_text(encoding="utf-8"))
    count=verify(truth,index)
    killed=[]
    if args.self_test:
        for kind in ("missing-wait","missing-walk","missing-hurt","missing-dead","hold","row","loop","clock","transition","emit-condition","trigger-tick","clone-direction","root-offset","missing-baseline"):
            t=copy.deepcopy(truth);i=copy.deepcopy(index);a=t["visualTruth"]["bodyTimelines"][0]["actions"][0]
            if kind.startswith("missing-") and kind!="missing-baseline": t["visualTruth"]["bodyTimelines"][0]["actions"] = [x for x in t["visualTruth"]["bodyTimelines"][0]["actions"] if x["id"] != kind[8:]]
            if kind=="transition": a["completion"]["routes"] = []
            if kind=="hold": a["cells"][0]["holdTicks"]+=1
            if kind=="row": a["row"]+=1
            if kind=="loop": a["loops"]=False
            if kind=="clock": t["visualTruth"]["bodyClock"]["counter"]="elapsed ticks"
            if kind=="emit-condition": t["forms"][0]["actions"]["normal"]["emitTiming"]["remainingHoldCount"] = 2
            if kind=="trigger-tick": t["forms"][3]["actions"]["qlaoyi"]["emitTiming"]["triggerTick"]=48
            if kind=="clone-direction": t["forms"][3]["special"]["qlaoyi"]["cloneDirections"].reverse()
            if kind=="root-offset": t["forms"][3]["actions"]["qlaoyi"]["emit"]["y"]=40
            if kind=="missing-baseline": i["items"].pop()
            try: verify(t,i,False)
            except (AssertionError,KeyError): killed.append(kind)
            else: raise AssertionError("mutation survived: "+kind)
        state="dragon4-qlaoyi.frame24.left"
        item=next(x for x in index["items"] if x["id"]==state)
        original=Image.open(ROOT/item["path"]).convert("RGBA")
        shifted=Image.new("RGBA",original.size);shifted.alpha_composite(original,(0,40))
        try: verify(truth,index,True,{state:shifted})
        except AssertionError: killed.append("baseline-image-y+40")
        else: raise AssertionError("shifted baseline mutation survived")
    print(json.dumps(dict(bodyCellStates=count,totalBaselines=len(index["items"]),mutationKills=killed,unresolved=[])))

if __name__=="__main__": main()
