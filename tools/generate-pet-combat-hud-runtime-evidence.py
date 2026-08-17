from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "docs/tasks/evidence/TASK-SLICE-192B"
ORIGINAL = ROOT / "docs/tasks/evidence/TASK-SETTINGS-191"

modern = Image.open(EVIDENCE / "modern-active-dual-940x590.png").convert("RGBA")
original_dual = Image.new("RGBA", modern.size, (0, 0, 0, 0))
for slot in ("p1", "p2"):
    layer = Image.open(ORIGINAL / f"original-active-full-{slot}-940x590.png").convert("RGBA")
    original_dual = Image.alpha_composite(original_dual, layer)

original_over_modern = Image.alpha_composite(modern, original_dual)
overlay = Image.blend(modern, original_over_modern, 0.5)
comparison = Image.new("RGBA", (modern.width * 2, modern.height), (0, 0, 0, 255))
comparison.alpha_composite(modern, (0, 0))
comparison.alpha_composite(overlay, (modern.width, 0))
draw = ImageDraw.Draw(comparison)
draw.rectangle((0, 0, 250, 22), fill=(0, 0, 0, 190))
draw.text((8, 5), "modern active P1/P2", fill="white")
draw.rectangle((modern.width, 0, modern.width + 330, 22), fill=(0, 0, 0, 190))
draw.text((modern.width + 8, 5), "50% original character 662 overlay", fill="white")
comparison.convert("RGB").save(EVIDENCE / "comparison-active-dual-overlay.png")
print("Generated TASK-SLICE-192B dual-HUD overlay evidence.")
