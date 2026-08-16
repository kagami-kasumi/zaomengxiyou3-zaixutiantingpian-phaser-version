from __future__ import annotations

import hashlib
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "docs/tasks/evidence/TASK-SETTINGS-175D"
MODERN = ROOT / "docs/tasks/evidence/TASK-SLICE-183"
MANIFEST = ROOT / "docs/reverse-engineering/ground-truth/manifests/task-settings-175d-skill-pages.json"

PAIRS = {
    "active-role1-tree1-p1": (
        "original-active-role1-tree1-p1-940x590.png",
        "modern-active-role1-tree1-p1-940x590.png",
    ),
    "passive-p1": (
        "original-passive-p1-940x590.png",
        "modern-passive-p1-940x590.png",
    ),
    "bind-p1": ("original-bind-p1-940x590.png", "modern-bind-p1-940x590.png"),
    "bind-p2": ("original-bind-p2-940x590.png", "modern-bind-p2-940x590.png"),
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


MODERN.mkdir(parents=True, exist_ok=True)
for state, (original_name, modern_name) in PAIRS.items():
    original = Image.open(ORIGINAL / original_name).convert("RGBA")
    modern = Image.open(MODERN / modern_name).convert("RGBA")
    if original.size != (940, 590) or modern.size != (940, 590):
        raise ValueError(f"{state} is not 940x590")

    comparison = Image.new("RGBA", (1880, 590), (0, 0, 0, 255))
    comparison.alpha_composite(original, (0, 0))
    comparison.alpha_composite(modern, (940, 0))
    comparison.save(MODERN / f"comparison-{state}-1880x590.png")

    Image.blend(original, modern, 0.5).save(
        MODERN / f"overlay-50-{state}-940x590.png"
    )
    ImageChops.difference(original, modern).save(
        MODERN / f"difference-{state}-940x590.png"
    )

print(
    "Generated active/passive/binding side-by-side, 50% overlay, and difference evidence; "
    f"truth sha256={sha256(MANIFEST)}"
)
