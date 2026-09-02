"""Safely normalize detected image names and rebuild Elena's static gallery."""

from __future__ import annotations

import html
import json
import os
import re
import struct
import sys
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent
CAPTIONS_PATH = ROOT / "captions.json"
INDEX_PATH = ROOT / "index.html"
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
IMAGE_EXTENSIONS = {
    "JPEG": {".jpg", ".jpeg", ".jpe"},
    "PNG": {".png"},
    "GIF": {".gif"},
    "WebP": {".webp"},
    "BMP": {".bmp"},
}


def jpeg_dimensions(data: bytes) -> tuple[int, int] | None:
    """Return JPEG dimensions only after a complete structural verification."""
    if len(data) < 4 or not data.startswith(b"\xff\xd8"):
        return None

    position = 2
    dimensions: tuple[int, int] | None = None
    saw_scan = False

    while position < len(data):
        if data[position] != 0xFF:
            return None
        while position < len(data) and data[position] == 0xFF:
            position += 1
        if position >= len(data):
            return None

        marker = data[position]
        position += 1

        if marker == 0xD9:
            return dimensions if saw_scan else None
        if marker == 0xD8:
            return None
        if marker == 0x01 or 0xD0 <= marker <= 0xD7:
            continue
        if position + 2 > len(data):
            return None

        segment_length = int.from_bytes(data[position : position + 2], "big")
        if segment_length < 2 or position + segment_length > len(data):
            return None

        if marker in {
            0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6,
            0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF,
        }:
            if segment_length < 7:
                return None
            height = int.from_bytes(data[position + 3 : position + 5], "big")
            width = int.from_bytes(data[position + 5 : position + 7], "big")
            if width <= 0 or height <= 0:
                return None
            dimensions = (width, height)

        if marker != 0xDA:
            position += segment_length
            continue

        saw_scan = True
        position += segment_length
        while position < len(data):
            if data[position] != 0xFF:
                position += 1
                continue

            marker_position = position
            position += 1
            while position < len(data) and data[position] == 0xFF:
                position += 1
            if position >= len(data):
                return None

            scan_marker = data[position]
            if scan_marker == 0x00 or 0xD0 <= scan_marker <= 0xD7:
                position += 1
                continue
            position = marker_position
            break

    return None


def png_dimensions(data: bytes) -> tuple[int, int] | None:
    if len(data) < 33 or not data.startswith(PNG_SIGNATURE):
        return None
    if data[12:16] != b"IHDR" or data[-8:-4] != b"IEND":
        return None
    width, height = struct.unpack(">II", data[16:24])
    return (width, height) if width > 0 and height > 0 else None


def gif_dimensions(data: bytes) -> tuple[int, int] | None:
    if len(data) < 14 or data[:6] not in {b"GIF87a", b"GIF89a"}:
        return None
    if data[-1] != 0x3B:
        return None
    width, height = struct.unpack("<HH", data[6:10])
    return (width, height) if width > 0 and height > 0 else None


def webp_dimensions(data: bytes) -> tuple[int, int] | None:
    if len(data) < 30 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return None
    declared_size = int.from_bytes(data[4:8], "little") + 8
    if declared_size > len(data):
        return None

    chunk_type = data[12:16]
    chunk_size = int.from_bytes(data[16:20], "little")
    if 20 + chunk_size > declared_size:
        return None

    if chunk_type == b"VP8X" and chunk_size >= 10:
        width = int.from_bytes(data[24:27], "little") + 1
        height = int.from_bytes(data[27:30], "little") + 1
    elif chunk_type == b"VP8L" and chunk_size >= 5 and data[20] == 0x2F:
        packed = int.from_bytes(data[21:25], "little")
        width = (packed & 0x3FFF) + 1
        height = ((packed >> 14) & 0x3FFF) + 1
    elif chunk_type == b"VP8 " and chunk_size >= 10 and data[23:26] == b"\x9d\x01\x2a":
        width = int.from_bytes(data[26:28], "little") & 0x3FFF
        height = int.from_bytes(data[28:30], "little") & 0x3FFF
    else:
        return None
    return (width, height) if width > 0 and height > 0 else None


def bmp_dimensions(data: bytes) -> tuple[int, int] | None:
    if len(data) < 26 or data[:2] != b"BM":
        return None
    declared_size = int.from_bytes(data[2:6], "little")
    dib_size = int.from_bytes(data[14:18], "little")
    if declared_size > len(data):
        return None
    if dib_size == 12:
        width, height = struct.unpack("<HH", data[18:22])
    elif dib_size >= 40 and len(data) >= 26:
        width, height = struct.unpack("<ii", data[18:26])
        width, height = abs(width), abs(height)
    else:
        return None
    return (width, height) if width > 0 and height > 0 else None


def detect_image(data: bytes) -> tuple[str, str, tuple[int, int]] | None:
    """Return verified format, conventional extension, and dimensions."""
    detectors = (
        ("JPEG", ".jpg", jpeg_dimensions),
        ("PNG", ".png", png_dimensions),
        ("GIF", ".gif", gif_dimensions),
        ("WebP", ".webp", webp_dimensions),
        ("BMP", ".bmp", bmp_dimensions),
    )
    for format_name, extension, detector in detectors:
        dimensions = detector(data)
        if dimensions is not None:
            return format_name, extension, dimensions
    return None


def image_dimensions(path: Path) -> tuple[int, int] | None:
    detected = detect_image(path.read_bytes())
    return detected[2] if detected else None


def natural_filename_key(filename: str) -> tuple[list[object], str]:
    path = Path(filename)
    stem_key = [int(part) if part.isdigit() else part.casefold()
                for part in re.split(r"(\d+)", path.stem)]
    return stem_key, path.suffix.casefold()


def normalize_extensionless_images() -> tuple[list[tuple[str, str]], list[str], list[str]]:
    candidates: list[tuple[Path, Path]] = []
    collisions: list[str] = []
    skipped: list[str] = []

    for path in sorted(ROOT.iterdir(), key=lambda item: natural_filename_key(item.name)):
        if not path.is_file() or path.suffix:
            continue
        detected = detect_image(path.read_bytes())
        if detected is None:
            skipped.append(path.name)
            continue
        _, extension, _ = detected
        target = path.with_name(path.name + extension)
        if target.exists():
            collisions.append(f"{path.name} -> {target.name}")
        else:
            candidates.append((path, target))

    if collisions:
        return [], collisions, skipped

    renamed: list[tuple[str, str]] = []
    for source, target in candidates:
        if target.exists():
            raise FileExistsError(f"Refusing to overwrite {target.name}")
        os.rename(source, target)
        renamed.append((source.name, target.name))
    return renamed, [], skipped


def extension_mismatches() -> list[str]:
    mismatches: list[str] = []
    for path in sorted(ROOT.iterdir(), key=lambda item: natural_filename_key(item.name)):
        if not path.is_file() or not path.suffix:
            continue
        detected = detect_image(path.read_bytes())
        if detected is None:
            continue
        format_name, _, _ = detected
        if path.suffix.casefold() not in IMAGE_EXTENSIONS[format_name]:
            mismatches.append(
                f"{path.name}: detected {format_name}; existing extension {path.suffix} was not changed"
            )
    return mismatches


def load_captions() -> dict[str, str]:
    with CAPTIONS_PATH.open("r", encoding="utf-8") as handle:
        captions = json.load(handle)
    if not isinstance(captions, dict):
        raise ValueError("captions.json must contain a filename-to-caption object")
    for filename, caption in captions.items():
        if not isinstance(filename, str) or not isinstance(caption, str) or not caption.strip():
            raise ValueError("Every caption entry must have a string filename and non-empty caption")
    return captions


def build_index(captions: dict[str, str]) -> int:
    entries: list[tuple[str, str, int, int]] = []
    for filename in sorted(captions, key=natural_filename_key):
        path = ROOT / filename
        if not path.is_file():
            raise FileNotFoundError(f"Captioned image does not exist: {filename}")
        dimensions = image_dimensions(path)
        if dimensions is None:
            raise ValueError(f"Captioned file is not a verified supported image: {filename}")
        entries.append((filename, captions[filename].strip(), *dimensions))

    cards: list[str] = []
    for index, (filename, caption, width, height) in enumerate(entries):
        escaped_caption = html.escape(caption, quote=True)
        image_url = quote(filename)
        loading = ' loading="eager" fetchpriority="high"' if index == 0 else ' loading="lazy"'
        cards.append(
            "        <figure class=\"photo\">\n"
            f"          <a class=\"photo-link\" href=\"{image_url}\" target=\"_blank\" "
            f"rel=\"noopener\" aria-label=\"Open full-size photo: {escaped_caption}\">\n"
            f"            <img src=\"{image_url}\" width=\"{width}\" height=\"{height}\" "
            f"alt=\"{escaped_caption}\"{loading}>\n"
            "          </a>\n"
            f"          <figcaption>{escaped_caption}</figcaption>\n"
            "        </figure>"
        )

    count = len(entries)
    noun = "photograph" if count == 1 else "photographs"
    document = f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="A personal photo gallery for Elena.">
    <title>Elena</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <header class="page-header">
      <h1>Elena</h1>
      <p class="subtitle">{count} {noun}</p>
    </header>
    <main>
      <section class="gallery" aria-label="Photo gallery">
{chr(10).join(cards)}
      </section>
    </main>
  </body>
</html>
"""
    INDEX_PATH.write_text(document, encoding="utf-8", newline="\n")
    return count


def main() -> int:
    renamed, collisions, skipped = normalize_extensionless_images()
    if collisions:
        print("Rename collision detected; no files were renamed:", file=sys.stderr)
        for collision in collisions:
            print(f"  {collision}", file=sys.stderr)
        return 2

    captions = load_captions()
    count = build_index(captions)
    for old_name, new_name in renamed:
        print(f"Renamed: {old_name} -> {new_name}")
    for filename in skipped:
        print(f"Skipped unknown extensionless file: {filename}")
    for mismatch in extension_mismatches():
        print(f"Extension mismatch: {mismatch}")
    print(f"Generated index.html with {count} captioned photographs.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
