from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
from pathlib import Path
from time import sleep
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Mangás" / "Monster"
OUTPUT.mkdir(parents=True, exist_ok=True)
VOLUMES = json.loads((ROOT / "scripts" / "monster-volumes.json").read_text(encoding="utf-8"))


def cover_url(volume):
    return f"https://covers.openlibrary.org/b/isbn/{volume['isbn']}-L.jpg?default=false"


def download(volume):
    destination = OUTPUT / f"Monster #{volume['number']}.png"
    error = None
    for attempt in range(5):
        try:
            url = cover_url(volume)
            with urlopen(Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as response:
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
                image.resize((500, 750), Image.Resampling.LANCZOS).save(destination, "PNG", optimize=True)
            return volume["number"]
        except Exception as caught:
            error = caught
            sleep(2 + attempt * 2)
    raise error


with ThreadPoolExecutor(max_workers=2) as executor:
    completed = list(executor.map(download, VOLUMES))
print(f"{len(completed)} capas de Monster padronizadas em 500x750 px.")
