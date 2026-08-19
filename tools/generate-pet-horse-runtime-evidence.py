from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "docs/verification/TASK-SLICE-193D"
ORIGINAL = (
    ROOT
    / "local-resources/regima/task-outputs/task-settings-193c-pet-horse-animation"
    / "20120203-body/17_PetHorseBmd1.png"
)
MODERN = OUTPUT / "modern-stage11-p1-p2-horse1-940x590.png"


def labeled(image: Image.Image, label: str, size: tuple[int, int]) -> Image.Image:
    panel = Image.new("RGBA", (size[0], size[1] + 24), (18, 18, 18, 255))
    fitted = image.copy()
    fitted.thumbnail(size, Image.Resampling.NEAREST)
    x = (size[0] - fitted.width) // 2
    y = 24 + (size[1] - fitted.height) // 2
    panel.alpha_composite(fitted, (x, y))
    ImageDraw.Draw(panel).text((6, 6), label, fill=(255, 255, 255, 255))
    return panel


def main() -> None:
    if not ORIGINAL.exists() or not MODERN.exists():
        raise FileNotFoundError("193C original atlas and 193D modern screenshot are required")
    original_atlas = Image.open(ORIGINAL).convert("RGBA")
    original_wait = original_atlas.crop((0, 0, 80, 80)).resize((160, 160), Image.Resampling.NEAREST)
    modern = Image.open(MODERN).convert("RGBA")
    if modern.size != (940, 590):
        raise ValueError(f"expected 940x590 modern capture, got {modern.size}")
    p1 = modern.crop((0, 385, 180, 545))
    p2 = modern.crop((760, 385, 940, 545))
    panels = [
        labeled(original_wait, "193C original horse1 wait", (180, 160)),
        labeled(p1, "193D modern P1", (180, 160)),
        labeled(p2, "193D modern P2", (180, 160)),
    ]
    comparison = Image.new("RGBA", (sum(panel.width for panel in panels), panels[0].height), (0, 0, 0, 255))
    x = 0
    for panel in panels:
        comparison.alpha_composite(panel, (x, 0))
        x += panel.width
    OUTPUT.mkdir(parents=True, exist_ok=True)
    comparison.save(OUTPUT / "original-modern-horse1-p1-p2-comparison.png")
    print("wrote TASK-SLICE-193D horse1 original/P1/P2 comparison")


if __name__ == "__main__":
    main()
