from __future__ import annotations

import argparse
import hashlib
import json
import re
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE_ROOT = ROOT / "local-resources/regima/task-outputs/task-settings-213-pet-dragon-family"
OUTPUT_ROOT = ROOT / "docs/tasks/evidence/TASK-SETTINGS-213/baselines"
INDEX_PATH = ROOT / "docs/tasks/evidence/TASK-SETTINGS-213/baseline-index.json"
STAGE_SIZE = (940, 590)
PET_ROOT = (470, 350)

FORMS = {
    1: {
        "atlas": "9_PetDragonBmd1.png", "cell": (150, 150), "offset": (1, -5),
        "actions": {"wait": (0, 0), "walk": (0, 0), "hurt": (1, 0), "dead": (2, 3), "normal": (3, 3), "fs": (4, 4)},
    },
    2: {
        "atlas": "13_PetDragonBmd2.png", "cell": (200, 200), "offset": (1, -5),
        "actions": {"wait": (0, 0), "walk": (1, 0), "hurt": (2, 0), "dead": (3, 4), "normal": (4, 3), "fs": (5, 4), "sdcc": (6, 0)},
    },
    3: {
        "atlas": "16_PetDragonBmd3.png", "cell": (250, 250), "offset": (1, -15),
        "actions": {"wait": (0, 0), "walk": (1, 0), "hurt": (2, 0), "dead": (3, 4), "normal": (4, 2), "fs": (5, 4), "sdcc": (6, 0), "ltwj": (7, 2)},
    },
    4: {
        "atlas": "23_PetDragonBmd4.png", "cell": (300, 250), "offset": (31, -25),
        "actions": {"wait": (0, 0), "walk": (1, 0), "hurt": (2, 0), "dead": (3, 4), "normal": (4, 2), "fs": (5, 4), "sdcc": (6, 0), "ltwj": (7, 2), "qlaoyi": (8, 0), "qlaoyi-ltwj-link": (9, 1)},
    },
}

EFFECTS = {
    "dragon1-normal": (542, "PetDragon1Bullet1", (30, 0), (1, 6, 11)),
    "dragon2-normal": (547, "PetDragon2Bullet1", (30, 0), (1, 8, 15)),
    "dragon2-sdcc": (563, "PetDragon2Bullet2", (0, 10), (1, 15, 30)),
    "dragon3-normal": (572, "PetDragon3Bullet1", (30, 0), (1, 11, 21)),
    "dragon3-ltwj": (603, "PetDragon3Bullet3", (0, 40), (1, 5, 10)),
    "dragon4-qlaoyi": (539, "PetDragonBullet4", (0, 40), (1, 24, 48)),
}


def sha256_bytes(value: bytes) -> str:
    return hashlib.sha256(value).hexdigest()


def body_cell(form: int, row: int, column: int) -> Image.Image:
    spec = FORMS[form]
    width, height = spec["cell"]
    atlas = Image.open(SOURCE_ROOT / "pet1-body" / spec["atlas"]).convert("RGBA")
    return atlas.crop((column * width, row * height, (column + 1) * width, (row + 1) * height))


def paste_body(canvas: Image.Image, image: Image.Image, form: int, direction: str, *, alpha: float = 1.0, root: tuple[int, int] = PET_ROOT) -> None:
    spec = FORMS[form]
    width, height = spec["cell"]
    offset_x, offset_y = spec["offset"]
    if direction == "right":
        image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        x = root[0] - width // 2 + offset_x
    else:
        x = root[0] - width // 2 - offset_x
    y = root[1] - height // 2 + offset_y
    if alpha != 1.0:
        image = image.copy()
        image.putalpha(image.getchannel("A").point(lambda value: round(value * alpha)))
    canvas.alpha_composite(image, (round(x), round(y)))


def registration(symbol_dir: Path, frame: int) -> tuple[float, float]:
    text = (symbol_dir / f"{frame}.svg").read_text(encoding="utf-8")
    match = re.search(r'<g transform="matrix\([^,]+, [^,]+, [^,]+, [^,]+, ([-\d.]+), ([-\d.]+)\)"', text)
    if not match:
        raise RuntimeError(f"Cannot locate FFDec registration matrix in {symbol_dir / f'{frame}.svg'}")
    return float(match.group(1)), float(match.group(2))


def paste_effect(canvas: Image.Image, character_id: int, symbol: str, frame: int, direction: str, offset: tuple[int, int], *, root: tuple[int, int] = PET_ROOT, source_prefix: str = "pet1") -> None:
    directory = f"DefineSprite_{character_id}_{symbol}"
    image = Image.open(SOURCE_ROOT / f"{source_prefix}-sprites" / directory / f"{frame}.png").convert("RGBA")
    reg_x, reg_y = registration(SOURCE_ROOT / f"{source_prefix}-svg" / directory, frame)
    signed_x = -offset[0] if direction == "left" else offset[0]
    if direction == "right":
        image = image.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        x = root[0] + signed_x + reg_x - image.width
    else:
        x = root[0] + signed_x - reg_x
    y = root[1] + offset[1] - reg_y
    canvas.alpha_composite(image, (round(x), round(y)))


def serialize_png(image: Image.Image) -> bytes:
    from io import BytesIO

    target = BytesIO()
    image.save(target, format="PNG", optimize=False, compress_level=9)
    return target.getvalue()


def build_items() -> list[dict[str, object]]:
    items: list[dict[str, object]] = []

    for form, spec in FORMS.items():
        for action, (row, column) in spec["actions"].items():
            for direction in ("left", "right"):
                image = Image.new("RGBA", STAGE_SIZE, (0, 0, 0, 0))
                paste_body(image, body_cell(form, row, column), form, direction)
                item_id = f"dragon{form}.{action}.{direction}"
                items.append(item(item_id, image, [f"PetDragon{form}.as", spec["atlas"]]))

    for form in FORMS:
        row, column = FORMS[form]["actions"]["wait"]
        for direction in ("left", "right"):
            image = Image.new("RGBA", STAGE_SIZE, (0, 0, 0, 0))
            paste_body(image, body_cell(form, row, column), form, direction, alpha=0.6 if form == 4 else 0.5, root=(370, 300))
            item_id = f"dragon{form}.fs-clone-active.{direction}"
            items.append(item(item_id, image, [f"PetDragon{form}.as:createFenshen/doHit2", FORMS[form]["atlas"]]))

    for usage, (character_id, symbol, offset, frames) in EFFECTS.items():
        for frame in frames:
            for direction in ("left", "right"):
                image = Image.new("RGBA", STAGE_SIZE, (0, 0, 0, 0))
                paste_effect(image, character_id, symbol, frame, direction, offset)
                item_id = f"{usage}.frame{frame:02d}.{direction}"
                items.append(item(item_id, image, [symbol, f"character {character_id}"]))

    for direction in ("left", "right"):
        image = Image.new("RGBA", STAGE_SIZE, (0, 0, 0, 0))
        offsets = ((0, 40), (-150, 30), (90, 15), (-90, 15), (150, 30), (-270, 15), (210, 30), (-210, 15), (270, 30))
        for offset in offsets:
            paste_effect(image, 603, "PetDragon3Bullet3", 1, direction, offset)
        items.append(item(f"dragon3-ltwj.nine-object-wave.{direction}", image, ["PetDragon3.as:doHit4", "PetDragon3Bullet3 character 603"]))

    for frame in (1, 7, 14):
        image = Image.new("RGBA", STAGE_SIZE, (0, 0, 0, 0))
        paste_effect(image, 120, "AoyiBuff", frame, "left", (0, 0), source_prefix="common")
        items.append(item(f"dragon4-qlaoyi-aoyi-buff.frame{frame:02d}.fixed", image, ["BasePet.as:addAoyiBuff", "StageCommon.swf character 120"]))

    return items


def item(item_id: str, image: Image.Image, source_refs: list[str]) -> dict[str, object]:
    data = serialize_png(image)
    return {
        "id": item_id,
        "path": f"docs/tasks/evidence/TASK-SETTINGS-213/baselines/{item_id}.png",
        "sha256": sha256_bytes(data),
        "width": STAGE_SIZE[0],
        "height": STAGE_SIZE[1],
        "sourceRefs": source_refs,
        "_bytes": data,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    items = build_items()
    public_items = [{key: value for key, value in entry.items() if key != "_bytes"} for entry in items]
    index = {
        "taskId": "TASK-SETTINGS-213",
        "truthId": "task-settings-213.pet-dragon-family",
        "originalVersion": "RegiMA 1.1 restored corpus",
        "stage": {"width": 940, "height": 590, "coordinateSpace": "stage", "fixtureRoot": {"x": PET_ROOT[0], "y": PET_ROOT[1]}},
        "expectedIds": [entry["id"] for entry in public_items],
        "extractedIds": [entry["id"] for entry in public_items],
        "items": public_items,
        "unresolved": [],
    }
    serialized = (json.dumps(index, ensure_ascii=False, indent=2) + "\n").encode("utf-8")

    if args.check:
        if not INDEX_PATH.exists() or INDEX_PATH.read_bytes() != serialized:
            raise SystemExit("dragon baseline index is stale")
        for entry in items:
            target = ROOT / str(entry["path"])
            if not target.exists() or sha256_bytes(target.read_bytes()) != entry["sha256"]:
                raise SystemExit(f"dragon baseline is stale: {entry['id']}")
        print(f"pet dragon 940x590 baselines verified: {len(items)} states, 0 unresolved")
        return

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    for entry in items:
        (ROOT / str(entry["path"])).write_bytes(entry["_bytes"])
    INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    INDEX_PATH.write_bytes(serialized)
    print(f"wrote {len(items)} pet dragon 940x590 baselines and baseline-index.json")


if __name__ == "__main__":
    main()
