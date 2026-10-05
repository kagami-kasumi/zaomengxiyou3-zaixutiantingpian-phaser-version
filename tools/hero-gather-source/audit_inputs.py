"""Audit the bounded Role1..Role5 movement inputs used by TASK-SETTINGS-261.

This is a source-input audit only.  It deliberately does not reconstruct a full
Role constructor, regenerate a truth manifest, or modify any extracted source.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
SCRIPT_ROOT = ROOT / "local-resources/regima/legacy-extraction/resources_by_swf/[172845].swf/scripts"
OUT = ROOT / "docs/tasks/evidence/TASK-SETTINGS-261/input-audit.json"

PINNED_SHA256 = {
    "base/BaseObject.as": "fff45f68a219ae9dfe54fe97681824dd3dcce532851a8c296b8fe8cb7e925ca7",
    "base/BaseHero.as": "821eb938395609f6cc496c1eb07d054d3f0a5c67590ca2de50fb82e938f9f3f8",
    "export/hero/Role1.as": "9785fb74ddadc858c2bda6d084612a7f50bbd09392e45a99e71a9a7b80fde489",
    "export/hero/Role2.as": "cdfea276e85d4d8cc619fb6ca33901cbe2e7d42afd02b2bf5738acbdab16cf3b",
    "export/hero/Role3.as": "1a55dc67a6e0af9a8db2a60e45933ec9c1152c58c74f16bc9a113d8e618b85a1",
    "export/hero/Role4.as": "66b6456edf846f6878cec085f48245d15de2ead742a46262e5b9b3faf6832705",
    "export/hero/Role5.as": "7b947e6aa3885aec2741f60ae80440de206bb91009bc9fb19758aca0c8434c78",
    "export/setmenu/gameSetting.as": "d467c90af7d1aea39f9e2b77a4d40a35601c3ce9d4f9e169ac841d0728eea177",
    "config/Config.as": "ebc4558bed160ede34a26f026d2414dd62af141d1b142958b5cd83e03b5dcfa0",
}
MODERN_PINNED_SHA256 = {
    "src/systems/HeroMovementSystem.ts": "f9d54b72701ce90e33fb4f71ca7aef5a7cc5434edb5141c20e48b02b52555bdd",
    "src/scenes/HeroPartyRuntimeBridge.ts": "cc6d2c8ca3ce977c88c137ed9b7685b5c85bb58e118803c3ac9a67a7c409ec54",
    "src/scenes/PlayableLevelRuntime.ts": "6fdbca9c88a3a48ddf1d88fa1fa5c63b902fc291e42fb9cfeeb559704df18a09",
    "docs/reverse-engineering/ground-truth/manifests/monster2-attack-space.json": "ab53a883cf65f16d3a93fed42a675ba28802b7dab08a1bb723e552fbb29608aa",
    "docs/reverse-engineering/reference/monster2-attack-space-contract.json": "8f02e3bf745f67e628a10d1e285ffdcd218f82ef1a438112e3858d45c56f2c19",
    "local-resources/regima/source/restored-swfs/assets/StageCommon.swf": "c6fc973d7d606ce4ea177b0ac075844c86a5ee7e493235fa812a029fbe4f29c9",
}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def lines(path: Path) -> list[str]:
    return path.read_text(encoding="utf-8").splitlines()


def locators(path: Path, patterns: dict[str, str]) -> list[dict[str, object]]:
    text = lines(path)
    result: list[dict[str, object]] = []
    for name, pattern in patterns.items():
        hits = [index + 1 for index, line in enumerate(text) if re.search(pattern, line)]
        if not hits:
            raise AssertionError(f"missing source locator: {path}:{name}")
        result.append({"name": name, "lines": hits, "pattern": pattern})
    return result


def source_record(relative: str, patterns: dict[str, str]) -> dict[str, object]:
    path = SCRIPT_ROOT / relative
    actual = digest(path)
    pinned = PINNED_SHA256.get(relative)
    if pinned and pinned != "PIN_AT_RUNTIME" and actual != pinned:
        raise AssertionError(f"source changed since audit baseline: {relative}")
    return {
        "path": path.relative_to(ROOT).as_posix(),
        "sha256": actual,
        "locators": locators(path, patterns),
    }


def verify_expected(candidate: dict[str, object], expected: dict[str, object]) -> None:
    if candidate != expected:
        raise AssertionError("input audit candidate differs from source-derived expected data")


def build() -> dict[str, object]:
    base = source_record("base/BaseObject.as", {
        "fieldDefaults": r"protected var (horizenSpeed|horizenRunSpeed|graity|jumpPower):Number =",
        "constructorGravity": r"this\.graity = 1\.5;",
        "constructorInitialSpeed": r"this\.speed = new Point\(0,4\);",
        "bodyField": r"public var body:Sprite;",
        "colipseField": r"public var colipse:Sprite;",
        "constructorBody": r"this\.body = new Sprite\(\);",
        "constructorColipse": r"this\.newColipse\(\);",
        "setSpeed": r"protected function setSpeed\(\) : void",
        "move": r"protected function move\(\) : void",
        "step": r"public function step\(\) : void",
        "bottom": r"protected function getBottom\(\) : Number",
    })
    hero = source_record("base/BaseHero.as", {
        "constructor": r"public function BaseHero\(\)",
        "collisionScale": r"this\.colipse\.scaleX = 1\.2;",
        "step": r"override public function step\(\) : void",
        "move": r"override protected function move\(\) : void",
        "stageBounds": r"override public function isCanMoveByStage\(\) : Boolean",
        "gxpSpeedWrite": r"this\.horizenSpeed \*= 1\.4;",
        "normalGravityWrite": r"this\.graity = 1\.5;",
        "normalGravityRestore": r"this\.graity = 1\.5;",
    })
    role_specs = {
        "Role1": ("export/hero/Role1.as", 6, 10),
        "Role2": ("export/hero/Role2.as", 6, 10),
        "Role3": ("export/hero/Role3.as", 6, 10),
        "Role4": ("export/hero/Role4.as", 6, 10),
    }
    roles: dict[str, object] = {}
    for name, (relative, walk, run) in role_specs.items():
        roles[name] = {
            "source": source_record(relative, {
                "constructor": rf"public function {name}\(\)",
                "super": r"super\(\);",
                "walkWrite": rf"this\.horizenSpeed = {walk};",
                "newColipse": r"this\.colipse = AUtils\.getNewObj\(\"ObjectBaseSprite\"\) as Sprite;",
            }),
            "ordinary": {"walkPerHostFrame": walk, "runPerHostFrame": run, "gravityPerHostFrame": 1.5, "jumpPower": -20, "initialSpeed": {"x": 0, "y": 4}},
            "unwrittenByRole": ["horizenRunSpeed", "graity", "jumpPower"],
        }
    role5 = source_record("export/hero/Role5.as", {
        "isSwordDefault": r"public var isSword:Boolean = true;",
        "constructor": r"public function Role5\(\)",
        "super": r"super\(\);",
        "spearWalk": r"this\.horizenSpeed = 6;",
        "spearRun": r"this\.horizenRunSpeed = 10;",
        "swordWalk": r"this\.horizenSpeed = 7;",
        "swordRun": r"this\.horizenRunSpeed = 11;",
        "toSpear": r"public function ToSpear\(\) : void",
        "toSword": r"public function ToSword\(\) : void",
        "newColipse": r"this\.colipse = AUtils\.getNewObj\(\"ObjectBaseSprite\"\) as Sprite;",
    })
    roles["Role5"] = {
        "source": role5,
        "ordinary": {
            "defaultIsSword": True,
            "sword": {"walkPerHostFrame": 7, "runPerHostFrame": 11},
            "constructorFalseBranch": {"walkPerHostFrame": 6, "runPerHostFrame": 10},
            "gravityPerHostFrame": 1.5,
            "jumpPower": -20,
            "initialSpeed": {"x": 0, "y": 4},
        },
        "unwrittenByRole": ["graity", "jumpPower"],
        "shapeToggleDoesNotRewriteSpeed": True,
        "runtimeAlias": "ToSpear/ToSword only change isSword; they do not rewrite speed, so constructor default remains sword 7/11 unless a new instance is constructed.",
    }
    settings = source_record("export/setmenu/gameSetting.as", {
        "qualitySwitch": r"switch\(this\.gc\.frameClips\)",
        "set24": r"this\.gc\.frameClips = 24;",
        "set20": r"this\.gc\.frameClips = 20;",
        "set30": r"this\.gc\.stage\.frameRate = 30;",
    })
    config = source_record("config/Config.as", {"defaultFrameClips": r"public var frameClips:uint = 30;"})
    manifest = ROOT / "docs/reverse-engineering/ground-truth/manifests/monster2-attack-space.json"
    reference = ROOT / "docs/reverse-engineering/reference/monster2-attack-space-contract.json"
    manifest_data = json.loads(manifest.read_text(encoding="utf-8"))
    reference_data = json.loads(reference.read_text(encoding="utf-8"))
    profile = reference_data["targets"][0]
    expected_bounds = {"x": -30, "y": -50, "width": 60, "height": 100}
    if profile["bounds"] != expected_bounds or profile["tree"]["type"] != "ObjectBaseSprite":
        raise AssertionError("257A hero ObjectBaseSprite profile is not the verified 60x100 root")
    modern_files = []
    for relative in ["src/systems/HeroMovementSystem.ts", "src/scenes/HeroPartyRuntimeBridge.ts", "src/scenes/PlayableLevelRuntime.ts"]:
        path = ROOT / relative
        actual = digest(path)
        if actual != MODERN_PINNED_SHA256[relative]:
            raise AssertionError(f"modern mapping source changed: {relative}")
        modern_files.append({"path": relative, "sha256": actual})
    if digest(manifest) != MODERN_PINNED_SHA256[manifest.relative_to(ROOT).as_posix()]:
        raise AssertionError("257A manifest changed since audit baseline")
    if digest(reference) != MODERN_PINNED_SHA256[reference.relative_to(ROOT).as_posix()]:
        raise AssertionError("257A reference changed since audit baseline")
    stage_common = ROOT / "local-resources/regima/source/restored-swfs/assets/StageCommon.swf"
    if digest(stage_common) != MODERN_PINNED_SHA256[stage_common.relative_to(ROOT).as_posix()]:
        raise AssertionError("StageCommon source changed since audit baseline")
    modern = {
        "collisionManifest": {"path": manifest.relative_to(ROOT).as_posix(), "sha256": digest(manifest), "referencePath": reference.relative_to(ROOT).as_posix(), "referenceSha256": digest(reference), "profile0": {"id": profile["id"], "symbol": profile["tree"]["type"], "bounds": profile["bounds"], "scaleX": profile["tree"]["matrix"]["a"]}},
        "stageCommon": {"path": stage_common.relative_to(ROOT).as_posix(), "sha256": digest(stage_common)},
        "modernFiles": modern_files,
        "modernFootProjection": [
            {"path": "src/systems/HeroMovementSystem.ts", "locator": "HeroMovementModel.x/y/width/velocityX/velocityY; landOnPlatformIfNeeded"},
            {"path": "src/scenes/HeroPartyRuntimeBridge.ts", "locator": "createHeroPartyRuntime y=groundY; snapshots movement.x/movement.y"},
            {"path": "src/scenes/PlayableLevelRuntime.ts", "locator": "hero view setOrigin(0.5, 1)"},
        ],
        "mappingBoundary": "ObjectBaseSprite scaleX=1.2 and original getBottom are evidence inputs; modern HeroMovement width/platform bottom are a projection, not a verified pixel-identical collision root.",
    }
    return {
        "schemaVersion": 1,
        "contractId": "task-settings-261.hero-gather-source-input-audit",
        "status": "source-audited-bounded-constructor-inputs",
        "scope": "Role1..Role5/BaseHero/BaseObject ordinary movement constructor writes only; not full role constructors, skills, equipment, pets, or native movement replay",
        "baseObject": base,
        "baseHero": hero,
        "roles": roles,
        "frameRate": {"defaultFrameClips": 30, "switches": [30, 24, 20], "unit": "host frame; movement speed/gravity are per-step values", "sources": [config, settings]},
        "modernMapping": modern,
        "negativeSelfTest": {"kind": "reportDataMutationSelfTest", "mutation": "replace Role1 walk speed 6 with 5", "expected": "rejected by verify_expected"},
    }


def main() -> None:
    expected = build()
    bad = json.loads(json.dumps(expected))
    bad["roles"]["Role1"]["ordinary"]["walkPerHostFrame"] = 5
    try:
        verify_expected(bad, expected)
    except AssertionError:
        pass
    else:
        raise AssertionError("negative self-test was accepted")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(expected, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": expected["status"], "output": OUT.relative_to(ROOT).as_posix(), "roles": list(expected["roles"]), "negativeSelfTest": "passed"}))


if __name__ == "__main__":
    main()
