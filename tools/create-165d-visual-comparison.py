from pathlib import Path

from PIL import Image, ImageChops, ImageOps


ROOT = Path(__file__).resolve().parents[1]
BEFORE = ROOT / "docs/tasks/evidence/TASK-SLICE-142-p1-strength-original-ui-940x590.png"
ORIGINAL = ROOT / (
    "local-resources/regima/task-outputs/task-slice-117-crafting-ui/backpack1/"
    "DefineSprite_119_export.strength.StrengthEquipment/1.png"
)
AFTER = ROOT / "docs/tasks/evidence/TASK-SLICE-165D/p1-equipment-page-1-940x590.png"
OUTPUT = ROOT / "docs/tasks/evidence/TASK-SLICE-165D"


before = Image.open(BEFORE).convert("RGB")
original = Image.open(ORIGINAL).convert("RGB").crop((0, 0, 940, 590))
after = Image.open(AFTER).convert("RGB")
if before.size != (940, 590) or after.size != (940, 590):
    raise ValueError(f"Expected two 940x590 inputs, got {before.size} and {after.size}.")

side_by_side = Image.new("RGB", (1880, 590))
side_by_side.paste(before, (0, 0))
side_by_side.paste(after, (940, 0))
side_by_side.save(OUTPUT / "before-after-side-by-side.png")

Image.blend(before, after, 0.5).save(OUTPUT / "before-after-overlay-50.png")

right_panel = (500, 105, 820, 515)
stable_difference = ImageChops.difference(before.crop(right_panel), after.crop(right_panel))
ImageOps.autocontrast(stable_difference).save(OUTPUT / "right-panel-difference.png")

original_side_by_side = Image.new("RGB", (1880, 590))
original_side_by_side.paste(original, (0, 0))
original_side_by_side.paste(after, (940, 0))
original_side_by_side.save(OUTPUT / "original-modern-side-by-side.png")

Image.blend(original, after, 0.5).save(OUTPUT / "original-modern-overlay-50.png")
original_difference = ImageChops.difference(original.crop(right_panel), after.crop(right_panel))
ImageOps.autocontrast(original_difference).save(OUTPUT / "original-right-panel-difference.png")

print("Generated TASK-SLICE-165D original/pre-task comparisons, overlays, and right-panel differences.")
