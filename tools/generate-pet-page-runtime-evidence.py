from __future__ import annotations

import hashlib
from pathlib import Path

from PIL import Image, ImageChops, ImageEnhance


ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = ROOT / "docs/tasks/evidence/TASK-SETTINGS-175A"
MODERN = ROOT / "docs/tasks/evidence/TASK-SLICE-180"

PAIRS = {
    "selected-p1": ("original-selected-fighting-p1-940x590.png", "modern-selected-p1-940x590.png"),
    "skill-hover-p1": ("original-skill-hover-p1-940x590.png", "modern-skill-hover-p1-940x590.png"),
    "release-confirm-p1": ("original-release-confirm-p1-940x590.png", "modern-release-confirm-p1-940x590.png"),
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


MODERN.mkdir(parents=True, exist_ok=True)
for state, (original_name, modern_name) in PAIRS.items():
    original = Image.open(ORIGINAL / original_name).convert("RGBA")
    modern = Image.open(MODERN / modern_name).convert("RGBA")
    if original.size != (940, 590) or modern.size != (940, 590):
        raise ValueError(f"{state} is not 940x590")

    side_by_side = Image.new("RGBA", (1880, 590), (0, 0, 0, 255))
    side_by_side.alpha_composite(original, (0, 0))
    side_by_side.alpha_composite(modern, (940, 0))
    side_by_side.save(MODERN / f"comparison-{state}-1880x590.png")

    half_original = original.copy()
    half_original.putalpha(ImageEnhance.Brightness(original.getchannel("A")).enhance(0.5))
    overlay = modern.copy()
    overlay.alpha_composite(half_original)
    overlay.save(MODERN / f"overlay-50-{state}-940x590.png")

    masked_modern = modern.copy()
    masked_modern.putalpha(original.getchannel("A"))
    difference = ImageChops.difference(original, masked_modern)
    difference.putalpha(original.getchannel("A"))
    difference.save(MODERN / f"difference-{state}-940x590.png")

manifest = ROOT / "docs/reverse-engineering/ground-truth/manifests/task-settings-175a-pet-page.json"
print(f"Generated three side-by-side, 50% overlay, and difference evidence sets; truth sha256={sha256(manifest)}")
