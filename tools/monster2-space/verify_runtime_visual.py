#!/usr/bin/env python3
"""Strict comparison of registered Monster2 browser images with 257A native truth."""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import sys
import zlib
from io import BytesIO
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / "docs/tasks/evidence/TASK-SLICE-260B/browser/registered-visuals.json"
OUT = ROOT / "docs/tasks/evidence/TASK-SLICE-260B/browser/registered-visuals-verification.json"
TRUTH = ROOT / "docs/tasks/evidence/TASK-SETTINGS-257A"
BASE = ROOT / "local-resources/regima/task-outputs/TASK-SETTINGS-257A"


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def key(attack: int, frame: int, sign: int) -> str:
    return f"f{frame}-s{'1' if sign == 1 else '-1'}"


def png_data(value: str) -> tuple[Image.Image, bool]:
    prefix, encoded = value.split(",", 1)
    raw = base64.b64decode(encoded)
    if prefix == "data:image/png;base64":
        return Image.open(BytesIO(raw)).convert("RGBA"), False
    marker = "data:application/x-rgba-premultiplied+zlib;base64"
    if not prefix.startswith("data:application/x-rgba-premultiplied+zlib;"):
        raise ValueError(f"transparentRenderPng has unsupported prefix: {prefix}")
    fields = dict(part.split("=", 1) for part in prefix.split(";" )[1:-1])
    width, height = int(fields["w"]), int(fields["h"])
    rgba = zlib.decompress(raw)
    if len(rgba) != width * height * 4:
        raise ValueError(f"compressed RGBA length {len(rgba)} != {width}x{height}x4")
    return Image.frombytes("RGBA", (width, height), rgba), True


def premultiplied_expected(image: Image.Image) -> Image.Image:
    data = bytearray(image.tobytes())
    for i in range(0, len(data), 4):
        alpha = data[i + 3]
        for channel in range(3):
            data[i + channel] = (data[i + channel] * alpha + 127) // 255
    return Image.frombytes("RGBA", image.size, bytes(data))


def rgba_bytes(image: Image.Image) -> bytes:
    return image.tobytes()


def alpha_bounds(image: Image.Image):
    alpha = image.getchannel("A")
    box = alpha.getbbox()
    if box is None:
        return None
    x0, y0, x1, y1 = box
    return {"x": x0, "y": y0, "width": x1 - x0, "height": y1 - y0}


def diff_stats(actual: Image.Image, expected: Image.Image):
    a = actual.tobytes()
    b = expected.tobytes()
    if len(a) != len(b):
        return {"differentPixels": -1, "maxChannelDelta": None, "totalAbsoluteDelta": -1}
    different = 0
    maximum = [0, 0, 0, 0]
    total = [0, 0, 0, 0]
    for i in range(0, len(a), 4):
        pixel_diff = False
        for channel in range(4):
            delta = abs(a[i + channel] - b[i + channel])
            if delta:
                pixel_diff = True
                if delta > maximum[channel]:
                    maximum[channel] = delta
                total[channel] += delta
        if pixel_diff:
            different += 1
    return {
        "differentPixels": different,
        "maxChannelDelta": maximum,
        "totalAbsoluteDelta": total,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--report", type=Path, default=REPORT)
    parser.add_argument("--output", type=Path, default=OUT)
    parser.add_argument("--registered-only", action="store_true", help="accept only the current 68 attack1/2 states")
    args = parser.parse_args()

    if not args.report.exists():
        print(f"missing browser report: {args.report}", file=sys.stderr)
        return 2
    report = load_json(args.report)
    states = report.get("states")
    if not isinstance(states, list):
        print("browser report has no states array", file=sys.stderr)
        return 2

    expected_ids = {
        (attack, frame, sign)
        for attack in ((1, 2) if args.registered_only else (1, 2, 3))
        for frame in range(1, (14 if attack in (1, 3) else 20) + 1)
        for sign in (1, -1)
    }
    actual_ids = {(s.get("attack"), s.get("frame"), s.get("sign")) for s in states}
    errors = []
    if actual_ids != expected_ids:
        missing = sorted(expected_ids - actual_ids)
        extra = sorted(actual_ids - expected_ids)
        errors.append({"kind": "state-set", "missing": missing, "extra": extra})

    state_results = []
    sidecar_hashes = {}
    visual_truth = load_json(TRUTH / "visual-verification.json")
    visual_results = {(r["attack"], r["id"]): r for r in visual_truth.get("results", [])}
    for attack in (1, 2, 3):
        if attack == 3 and args.registered_only:
            continue
        native_path = TRUTH / f"attack{attack}/native.json"
        display_path = TRUTH / f"attack{attack}/source-display-list.json"
        native = load_json(native_path)
        display = load_json(display_path)
        sidecar_hashes[str(attack)] = {
            "nativeSha256": hashlib.sha256(native_path.read_bytes()).hexdigest(),
            "sourceSha256": display.get("sha256"),
            "source": display.get("source"),
            "nativeStatus": native.get("status"),
            "displayStatus": display.get("status"),
        }
        if display.get("sha256") != "14470fa742917ebd902763ddee7971876c458478a7b2711f1eeb8beaea2b0d7e":
            errors.append({"kind": "source-sha", "attack": attack, "sha256": display.get("sha256")})
        projections = native.get("projections", [])
        local = native.get("localProjections", [])
        for state in [s for s in states if s.get("attack") == attack]:
            a, frame, sign = state.get("attack"), state.get("frame"), state.get("sign")
            sid = key(a, frame, sign)
            idx = (frame - 1) * 2 + (0 if sign == 1 else 1)
            native_projection = next((p for p in projections if p.get("frame") == frame and p.get("sign") == sign), None)
            native_local = next((p for p in local if p.get("id") == sid), None)
            visual = visual_results.get((a, sid))
            image = state.get("image") or {}
            item_error = []
            if native_projection is None or native_local is None:
                item_error.append("missing-sidecar-projection")
            else:
                world = native_projection.get("tree", {}).get("worldMatrix", {})
                root = report.get("root", {})
                if world.get("tx") != root.get("x") or world.get("ty") != root.get("y"):
                    item_error.append("root-world-matrix")
                if visual is None:
                    item_error.append("missing-visual-sidecar")
                else:
                    crop = visual.get("crop", {})
                    expected_visible = crop.get("width") != 1 or crop.get("height") != 1
                    if bool(image.get("visible")) != expected_visible:
                        item_error.append("visible")
                    root = report.get("root", {})
                    if image.get("x") != root.get("x", 0) + crop.get("x", 0) or image.get("y") != root.get("y", 0) + crop.get("y", 0):
                        item_error.append("image-position")
            expected_key = f"monster2-native-a{a}-f{frame}-s{sign}"
            if image.get("key") != expected_key:
                item_error.append("image-key")
            if image.get("originX") != 0 or image.get("originY") != 0:
                item_error.append("image-origin")
            if image.get("scaleX") != 1 or image.get("scaleY") != 1:
                item_error.append("image-scale")
            if bool(image.get("flipX")):
                item_error.append("image-flip")

            actual_image, premultiplied = png_data(state.get("transparentRenderPng", ""))
            expected_path = BASE / f"attack{a}/air/baselines/{sid}.png"
            expected_image = Image.open(expected_path).convert("RGBA")
            if premultiplied:
                expected_image = premultiplied_expected(expected_image)
            stats = diff_stats(actual_image, expected_image)
            item = {
                "id": f"a{a}-{sid}",
                "image": {k: image.get(k) for k in ("key", "x", "y", "originX", "originY", "flipX", "scaleX", "scaleY", "visible")},
                "expectedAlphaBounds": alpha_bounds(expected_image),
                "actualAlphaBounds": alpha_bounds(actual_image),
                "expectedSha256": hashlib.sha256(rgba_bytes(expected_image)).hexdigest(),
                "actualSha256": hashlib.sha256(rgba_bytes(actual_image)).hexdigest(),
                **stats,
                "attributeErrors": item_error,
            }
            if stats["differentPixels"] != 0 or item_error:
                errors.append({"kind": "state", **item})
            state_results.append(item)

    result = {
        "status": "passed" if not errors else "failed",
        "report": str(args.report),
        "expectedStateCount": len(expected_ids),
        "actualStateCount": len(states),
        "registeredOnly": args.registered_only,
        "sidecars": sidecar_hashes,
        "states": state_results,
        "errors": errors,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Monster2 runtime visual: {result['status']} ({len(state_results)}/{len(expected_ids)} states); report={args.output}")
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
