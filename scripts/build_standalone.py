#!/usr/bin/env python3
"""Build Fluxa.html as a single portable HTML file.

Uses only the Python standard library. Do not edit Fluxa.html directly;
change the modular source files and run this script instead.
"""
from __future__ import annotations

import base64
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
STYLES = ROOT / "styles.css"
APP = ROOT / "app.js"
KONVA = ROOT / "vendor" / "konva.min.js"
LOGO = ROOT / "assets" / "fluxa-logo.png"
OUTPUT = ROOT / "Fluxa.html"


def read(path: Path) -> str:
    if not path.exists():
        raise SystemExit(f"Missing required file: {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8")


def replace_once(source: str, old: str, new: str, label: str) -> str:
    if old not in source:
        raise SystemExit(f"Could not find {label} marker in index.html")
    return source.replace(old, new, 1)


def main() -> None:
    html = read(INDEX)
    css = read(STYLES)
    app = read(APP)
    konva = read(KONVA)
    logo = base64.b64encode(LOGO.read_bytes()).decode("ascii")

    html = replace_once(
        html,
        '  <link rel="stylesheet" href="styles.css" />',
        f"  <style>\n{css}\n  </style>",
        "stylesheet",
    )
    html = replace_once(
        html,
        '  <script src="vendor/konva.min.js"></script>\n  <script src="app.js"></script>',
        f"  <script>\n{konva}\n  </script>\n  <script>\n{app}\n  </script>",
        "script",
    )
    html = replace_once(
        html,
        'src="assets/fluxa-logo.png"',
        f'src="data:image/png;base64,{logo}"',
        "logo",
    )

    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Built {OUTPUT.name} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
