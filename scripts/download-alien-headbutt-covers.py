from io import BytesIO
import json
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Mangás" / "Alien Headbutt"
OUTPUT.mkdir(parents=True, exist_ok=True)
VOLUMES = json.loads((ROOT / "scripts" / "alien-headbutt-volumes.json").read_text(encoding="utf-8"))

for volume in VOLUMES:
    with urlopen(Request(volume["coverSource"], headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as response:
        raw = response.read()
    with Image.open(BytesIO(raw)) as source:
        image = source.convert("RGB")
        ratio = 2 / 3
        if image.width / image.height > ratio:
            width = round(image.height * ratio)
            left = (image.width - width) // 2
            image = image.crop((left, 0, left + width, image.height))
        elif image.width / image.height < ratio:
            height = round(image.width / ratio)
            top = (image.height - height) // 2
            image = image.crop((0, top, image.width, top + height))
        image.resize((500, 750), Image.Resampling.LANCZOS).save(OUTPUT / f"Alien Headbutt #{volume['number']}.png", "PNG", optimize=True)

print("2 capas oficiais de Alien Headbutt padronizadas em 500x750 px.")
