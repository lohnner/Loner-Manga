from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
import json
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "Mangás" / "Hajime no Ippo"
METADATA = Path(__file__).with_name("hajime-no-ippo-volumes.json")
TARGET_SIZE = (500, 750)


def download_cover(volume):
    number = volume["number"]
    request = Request(volume["coverSource"], headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=60) as response:
        raw = response.read()

    with Image.open(BytesIO(raw)) as source:
        image = source.convert("RGB")
        source_ratio = image.width / image.height
        target_ratio = TARGET_SIZE[0] / TARGET_SIZE[1]
        if source_ratio > target_ratio:
            crop_width = round(image.height * target_ratio)
            left = (image.width - crop_width) // 2
            image = image.crop((left, 0, left + crop_width, image.height))
        elif source_ratio < target_ratio:
            crop_height = round(image.width / target_ratio)
            top = (image.height - crop_height) // 2
            image = image.crop((0, top, image.width, top + crop_height))
        image = image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)
        image.save(OUTPUT / f"Hajime no Ippo #{number}.png", "PNG", optimize=True)
    return number


def main():
    volumes = json.loads(METADATA.read_text(encoding="utf-8"))
    OUTPUT.mkdir(parents=True, exist_ok=True)
    completed = []
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(download_cover, volume) for volume in volumes]
        for future in as_completed(futures):
            completed.append(future.result())
            if len(completed) % 10 == 0 or len(completed) == len(volumes):
                print(f"Capas processadas: {len(completed)}/{len(volumes)}")
    print("Capas oficiais de Hajime no Ippo padronizadas em 500x750 px.")


if __name__ == "__main__":
    main()
