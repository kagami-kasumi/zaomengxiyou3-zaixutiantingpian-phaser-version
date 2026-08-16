from __future__ import annotations

import hashlib
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "docs/tasks/evidence/TASK-SETTINGS-175G"
MODERN = ROOT / "docs/tasks/evidence/TASK-SLICE-185"
MANIFEST = ROOT / "docs/reverse-engineering/ground-truth/manifests/task-settings-175g-settings-page.json"

PAIRS = {
    "normal-default": ("original-normal-default-940x590.png", "modern-normal-default-940x590.png"),
    "difficulty-hover": ("original-difficulty-hover-940x590.png", "modern-difficulty-hover-940x590.png"),
    "quality-low": ("original-quality-low-940x590.png", "modern-quality-low-940x590.png"),
    "default-volume-dead-click": ("original-default-volume-dead-click-940x590.png", "modern-default-volume-dead-click-940x590.png"),
    "reopened-session": ("original-reopened-session-940x590.png", "modern-reopened-session-940x590.png"),
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
    Image.blend(original, modern, 0.5).save(MODERN / f"overlay-50-{state}-940x590.png")
    ImageChops.difference(original, modern).save(MODERN / f"difference-{state}-940x590.png")
    original_edges = original.convert("L").filter(ImageFilter.FIND_EDGES)
    modern_edges = modern.convert("L").filter(ImageFilter.FIND_EDGES)
    ImageChops.difference(original_edges, modern_edges).save(
        MODERN / f"edge-difference-{state}-940x590.png"
    )

print(
    f"Generated {len(PAIRS)} settings side-by-side, 50% overlay, pixel-difference, and edge-difference evidence sets; "
    f"truth sha256={sha256(MANIFEST)}"
)
