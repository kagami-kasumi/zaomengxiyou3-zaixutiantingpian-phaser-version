from __future__ import annotations

import io
import shutil
import struct
import zlib
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
TASK_OUTPUT = ROOT / "local-resources/regima/task-outputs/task-settings-175a-pet-page"
OUTPUT = ROOT / "public/assets/ui/feature/pets/native"
PET_SWF = ROOT / "local-resources/regima/source/restored-swfs/assets/pet1.swf"
SKILL_SWF = ROOT / "local-resources/regima/source/restored-swfs/assets/EIcon1.swf"

HEAD_FRAME_SIZE = {
    "PetMonkeyBmd1": (70, 70), "PetMonkeyBmd2": (100, 100),
    "PetMonkeyBmd3": (150, 150), "PetMonkeyBmd4": (200, 200),
    "PetHorseBmd1": (80, 80), "PetHorseBmd2": (100, 100),
    "PetHorseBmd3": (150, 150), "PetHorseBmd4": (200, 200),
    "PetKabuBmd1": (80, 80), "PetKabuBmd2": (100, 100), "PetKabuBmd3": (200, 200),
    "PetTigerBmd4": (250, 250),
    "PetTurtleBmd1": (150, 150), "PetTurtleBmd2": (200, 200),
    "PetTurtleBmd3": (250, 250), "PetTurtleBmd4": (250, 250),
    "PetPhoenixBmd1": (100, 100), "PetPhoenixBmd2": (150, 150),
    "PetPhoenixBmd3": (200, 200), "PetPhoenixBmd4": (300, 300),
    "PetDragonBmd1": (150, 150), "PetDragonBmd2": (200, 200),
    "PetDragonBmd3": (250, 250), "PetDragonBmd4": (300, 250),
}


def read_rect_end(data: bytes, offset: int) -> int:
    bit = offset * 8

    def read_unsigned(count: int) -> int:
        nonlocal bit
        value = 0
        for _ in range(count):
            value = value * 2 + ((data[bit // 8] >> (7 - bit % 8)) & 1)
            bit += 1
        return value

    bit_count = read_unsigned(5)
    for _ in range(4):
        read_unsigned(bit_count)
    return (bit + 7) // 8


def read_swf(path: Path) -> tuple[bytes, list[tuple[int, int, int]]]:
    raw = path.read_bytes()
    signature = raw[:3]
    if signature == b"CWS":
        data = b"FWS" + raw[3:8] + zlib.decompress(raw[8:])
    elif signature == b"FWS":
        data = raw
    else:
        raise ValueError(f"Unsupported SWF signature in {path}: {signature!r}")
    cursor = read_rect_end(data, 8) + 4
    tags: list[tuple[int, int, int]] = []
    while cursor + 2 <= len(data):
        header = struct.unpack_from("<H", data, cursor)[0]
        cursor += 2
        code = header >> 6
        length = header & 0x3F
        if length == 0x3F:
            length = struct.unpack_from("<I", data, cursor)[0]
            cursor += 4
        tags.append((code, cursor, cursor + length))
        cursor += length
        if code == 0:
            break
    return data, tags


def symbol_classes(data: bytes, tags: list[tuple[int, int, int]]) -> dict[str, int]:
    result: dict[str, int] = {}
    for code, start, _ in tags:
        if code != 76:
            continue
        count = struct.unpack_from("<H", data, start)[0]
        cursor = start + 2
        for _ in range(count):
            character_id = struct.unpack_from("<H", data, cursor)[0]
            cursor += 2
            end = data.index(0, cursor)
            name = data[cursor:end].decode("utf-8")
            cursor = end + 1
            result[name] = character_id
    return result


def bitmap_tags(data: bytes, tags: list[tuple[int, int, int]]) -> dict[int, tuple[int, int, int]]:
    return {
        struct.unpack_from("<H", data, start)[0]: (code, start, end)
        for code, start, end in tags
        if code in {20, 35, 36, 90}
    }


def unpremultiply(red: int, green: int, blue: int, alpha: int) -> tuple[int, int, int, int]:
    if alpha in {0, 255}:
        return (red, green, blue, alpha)
    return (
        min(255, round(red * 255 / alpha)),
        min(255, round(green * 255 / alpha)),
        min(255, round(blue * 255 / alpha)),
        alpha,
    )


def decode_lossless(data: bytes, code: int, start: int, end: int) -> Image.Image:
    bitmap_format = data[start + 2]
    width, height = struct.unpack_from("<HH", data, start + 3)
    cursor = start + 7
    color_count = 0
    if bitmap_format == 3:
        color_count = data[cursor] + 1
        cursor += 1
    raw = zlib.decompress(data[cursor:end])
    has_alpha = code == 36
    pixels: list[tuple[int, int, int, int]] = []
    if bitmap_format == 5:
        for index in range(width * height):
            alpha, red, green, blue = raw[index * 4:index * 4 + 4]
            pixels.append(unpremultiply(red, green, blue, alpha) if has_alpha else (red, green, blue, 255))
    elif bitmap_format == 3:
        stride = 4 if has_alpha else 3
        palette = []
        for index in range(color_count):
            entry = raw[index * stride:(index + 1) * stride]
            if has_alpha:
                red, green, blue, alpha = entry
                palette.append(unpremultiply(red, green, blue, alpha))
            else:
                red, green, blue = entry
                palette.append((red, green, blue, 255))
        offset = color_count * stride
        row_stride = (width + 3) & ~3
        for y in range(height):
            for x in range(width):
                pixels.append(palette[raw[offset + y * row_stride + x]])
    else:
        raise ValueError(f"Unsupported lossless bitmap format {bitmap_format}")
    image = Image.new("RGBA", (width, height))
    image.putdata(pixels)
    return image


def decode_jpeg_alpha(data: bytes, code: int, start: int, end: int) -> Image.Image:
    alpha_offset = struct.unpack_from("<I", data, start + 2)[0]
    jpeg_start = start + (8 if code == 90 else 6)
    jpeg_end = jpeg_start + alpha_offset
    image = Image.open(io.BytesIO(data[jpeg_start:jpeg_end])).convert("RGBA")
    alpha = zlib.decompress(data[jpeg_end:end])
    if len(alpha) != image.width * image.height:
        raise ValueError(f"Alpha plane mismatch: {len(alpha)} for {image.size}")
    image.putalpha(Image.frombytes("L", image.size, alpha))
    return image


def export_bitmap_symbols(
    source: Path,
    prefix: str,
    destination: Path,
    frame_sizes: dict[str, tuple[int, int]] | None = None,
) -> list[str]:
    data, tags = read_swf(source)
    symbols = symbol_classes(data, tags)
    bitmaps = bitmap_tags(data, tags)
    destination.mkdir(parents=True, exist_ok=True)
    exported: list[str] = []
    for name, character_id in symbols.items():
        if not name.startswith(prefix) or character_id not in bitmaps:
            continue
        code, start, end = bitmaps[character_id]
        image = decode_lossless(data, code, start, end) if code in {20, 36} else decode_jpeg_alpha(data, code, start, end)
        frame_size = frame_sizes.get(name) if frame_sizes else None
        if frame_size:
            image = image.crop((0, 0, frame_size[0], frame_size[1]))
        image.save(destination / f"{name}.png")
        exported.append(name)
    return exported


def copy_native_structure() -> None:
    svg_root = TASK_OUTPUT / "exports-svg"
    png_root = TASK_OUTPUT / "exports-png"
    copies = {
        svg_root / "DefineSprite_1224_petlist/1.svg": OUTPUT / "pet-list-row.svg",
        svg_root / "DefineSprite_1228_skillIntro/1.svg": OUTPUT / "skill-tooltip.svg",
        svg_root / "DefineSprite_1221_giveUpThisPet/1.svg": OUTPUT / "release-confirm.svg",
    }
    for source, target in copies.items():
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)
    for character_id in (835, 840, 845, 883):
        for index, state in ((1, "up"), (2, "over"), (3, "down")):
            source = png_root / f"DefineButton2_{character_id}/{index}_{state}.png"
            target = OUTPUT / f"buttons/{character_id}/{state}.png"
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)
    for character_id in (852, 858, 863, 868, 873, 878):
        for frame in range(1, 21):
            source = svg_root / f"DefineSprite_{character_id}_pet_fla.Timeline_{13 + (character_id != 852) * 2}/1.svg"
            candidates = list(svg_root.glob(f"DefineSprite_{character_id}_*/{frame}.svg"))
            if not candidates:
                raise FileNotFoundError(f"Missing character {character_id} frame {frame}")
            target = OUTPUT / f"progress/{character_id}/{frame}.svg"
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(candidates[0], target)
    for frame in range(1, 4):
        source = svg_root / f"DefineSprite_891_pet_fla.Timeline_26/{frame}.svg"
        target = OUTPUT / f"quality/{frame}.svg"
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, target)


OUTPUT.mkdir(parents=True, exist_ok=True)
copy_native_structure()
heads = export_bitmap_symbols(PET_SWF, "Pet", OUTPUT / "heads", HEAD_FRAME_SIZE)
skills = export_bitmap_symbols(SKILL_SWF, "petskill_", OUTPUT / "skills")
print(f"Generated pet-page native assets: {len(heads)} heads, {len(skills)} skills.")
