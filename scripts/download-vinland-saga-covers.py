from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
from pathlib import Path
from time import sleep
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Mangás" / "Vinland Saga"
OUTPUT.mkdir(parents=True, exist_ok=True)
volumes = json.loads((ROOT / "scripts" / "vinland-saga-volumes.json").read_text(encoding="utf-8"))


def download(volume):
    destination = OUTPUT / f"Vinland Saga #{volume['number']}.png"
    if destination.exists():
        with Image.open(destination) as current:
            if current.size == (500, 750):
                return volume["number"]
    last_error = None
    for attempt in range(5):
        try:
            with urlopen(Request(volume["coverSource"], headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as response:
                raw = response.read()
            break
        except Exception as error:
            last_error = error
            sleep(2 + attempt * 2)
    else:
        raise last_error
    with Image.open(BytesIO(raw)) as source:
        image = source.convert("RGB")
        target_ratio = 2 / 3
        if image.width / image.height > target_ratio:
            width = round(image.height * target_ratio)
            left = (image.width - width) // 2
            image = image.crop((left, 0, left + width, image.height))
        elif image.width / image.height < target_ratio:
            height = round(image.width / target_ratio)
            top = (image.height - height) // 2
            image = image.crop((0, top, image.width, top + height))
        image.resize((500, 750), Image.Resampling.LANCZOS).save(destination, "PNG", optimize=True)
    return volume["number"]


with ThreadPoolExecutor(max_workers=3) as executor:
    completed = list(executor.map(download, volumes))
print(f"{len(completed)} capas oficiais padronizadas em 500x750 px.")
