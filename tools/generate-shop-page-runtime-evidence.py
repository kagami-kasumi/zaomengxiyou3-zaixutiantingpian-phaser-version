from __future__ import annotations

import hashlib
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "docs/tasks/evidence/TASK-SETTINGS-175F"
MODERN = ROOT / "docs/tasks/evidence/TASK-SLICE-184"
MANIFEST = ROOT / "docs/reverse-engineering/ground-truth/manifests/task-settings-175f-shop-page.json"

PAIRS = {
    "normal-p1-all-page1": (
        "original-normal-p1-all-page1-940x590.png",
        "modern-normal-p1-all-page1-940x590.png",
    ),
    "category-fashion-selected": (
        "original-category-fashion-selected-940x590.png",
        "modern-category-fashion-selected-940x590.png",
    ),
    "category-pet-selected": (
        "original-category-pet-selected-940x590.png",
        "modern-category-pet-selected-940x590.png",
    ),
    "page-all-last": (
        "original-page-all-last-940x590.png",
        "modern-page-all-last-940x590.png",
    ),
    "confirm-dialog": (
        "original-confirm-dialog-940x590.png",
        "modern-confirm-dialog-940x590.png",
    ),
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


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
    "Generated five shop side-by-side, 50% overlay, and difference evidence sets; "
    f"truth sha256={sha256(MANIFEST)}"
)
