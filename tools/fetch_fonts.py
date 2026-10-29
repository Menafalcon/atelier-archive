#!/usr/bin/env python3
"""Download the latin woff2 subsets used by the Atelier Archive reskin."""
from __future__ import annotations

import os
import re
import urllib.request

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, "assets", "fonts")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")

FAMILIES = [
    ("Bodoni Moda",
     "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..600&display=swap"),
    ("Manrope",
     "https://fonts.googleapis.com/css2?family=Manrope:wght@400..700&display=swap"),
    ("IBM Plex Mono",
     "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&display=swap"),
]

os.makedirs(OUT, exist_ok=True)

rules = []
for family, url in FAMILIES:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    css = urllib.request.urlopen(req, timeout=60).read().decode("utf-8")
    blocks = re.findall(r"/\*\s*([^*]+?)\s*\*/\s*@font-face\s*\{(.*?)\}", css, re.S)
    kept = 0
    for label, body in blocks:
        if label.strip() != "latin":
            continue
        style = re.search(r"font-style:\s*([^;]+);", body).group(1).strip()
        weight = re.search(r"font-weight:\s*([^;]+);", body).group(1).strip()
        src = re.search(r"url\((https://[^)]+)\)", body).group(1)
        fname = (family.lower().replace(" ", "-") + "-" + style + "-" +
                 weight.replace(" ", "_").replace("..", "-") + ".woff2")
        path = os.path.join(OUT, fname)
        if not os.path.exists(path):
            data = urllib.request.urlopen(
                urllib.request.Request(src, headers={"User-Agent": UA}), timeout=60).read()
            with open(path, "wb") as fh:
                fh.write(data)
        rules.append(
            "@font-face {\n"
            f"  font-family: '{family}';\n"
            f"  font-style: {style};\n"
            f"  font-weight: {weight};\n"
            "  font-display: swap;\n"
            f"  src: url('fonts/{fname}') format('woff2');\n"
            "}")
        kept += 1
    print(f"{family}: {kept} latin faces")

with open(os.path.join(BASE, "assets", "css", "fonts.css"), "w", encoding="utf-8") as fh:
    fh.write("/* Vendored latin subsets: Bodoni Moda, Manrope, IBM Plex Mono (OFL). */\n\n")
    fh.write("\n\n".join(rules) + "\n")
print("wrote assets/css/fonts.css")
