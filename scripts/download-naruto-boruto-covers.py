from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
import json
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
TARGET = (500, 750)


def process(entry, folder, filename):
    request = Request(entry["coverSource"], headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=60) as response:
        raw = response.read()
    with Image.open(BytesIO(raw)) as source:
        image = source.convert("RGB")
        target_ratio = TARGET[0] / TARGET[1]
        if image.width / image.height > target_ratio:
            width = round(image.height * target_ratio)
            left = (image.width - width) // 2
            image = image.crop((left, 0, left + width, image.height))
        elif image.width / image.height < target_ratio:
            height = round(image.width / target_ratio)
            top = (image.height - height) // 2
            image = image.crop((0, top, image.width, top + height))
        image.resize(TARGET, Image.Resampling.LANCZOS).save(folder / filename, "PNG", optimize=True)


def main():
    naruto = json.loads((ROOT / "scripts/naruto-volumes.json").read_text(encoding="utf-8"))
    boruto = json.loads((ROOT / "scripts/boruto-volumes.json").read_text(encoding="utf-8"))
    jobs = []
    naruto_dir = ROOT / "Mangás/Naruto"
    boruto_dir = ROOT / "Mangás/Boruto"
    naruto_dir.mkdir(parents=True, exist_ok=True)
    boruto_dir.mkdir(parents=True, exist_ok=True)
    for entry in naruto:
        if entry["coverSource"]:
            jobs.append((entry, naruto_dir, f"Naruto #{entry['number']}.png"))
    for entry in boruto:
        prefix = "Boruto" if entry["series"].endswith("Next Generations") else "Boruto Two Blue Vortex"
        if entry["coverSource"]:
            jobs.append((entry, boruto_dir, f"{prefix} #{entry['number']}.png"))
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(process, *job) for job in jobs]
        for index, future in enumerate(as_completed(futures), 1):
            future.result()
            if index % 20 == 0 or index == len(jobs):
                print(f"Capas processadas: {index}/{len(jobs)}")
    print("Capas oficiais de Naruto e Boruto padronizadas em 500x750 px.")


if __name__ == "__main__":
    main()
