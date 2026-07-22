from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
import json
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SERIES = (
    ("Kingdom", "Kingdom", "kingdom-volumes.json"),
    ("Yu-Gi-Oh!", "Yu-Gi-Oh!", "yu-gi-oh-volumes.json"),
)


def normalize(raw, destination):
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


def yugioh_wiki_cover(number):
    if number <= 7:
        filename = f"Yu-Gi-Oh!_Vol_{number}_JP.jpg"
    elif number == 20:
        filename = "Vol20.png"
    else:
        filename = f"YugiohOriginalManga-VOL{number:02d}-JP.jpg"
    api = (
        "https://yugioh.fandom.com/api.php?action=query&prop=imageinfo&iiprop=url"
        f"&titles={quote('File:' + filename)}&format=json"
    )
    with urlopen(Request(api, headers={"User-Agent": "Loner-Manga cover importer/1.0"}), timeout=60) as response:
        payload = json.load(response)
    page = next(iter(payload["query"]["pages"].values()))
    return page["imageinfo"][0]["url"]


def download(task):
    folder, prefix, volume = task
    destination = ROOT / "Mangás" / folder / f"{prefix} #{volume['number']}.png"
    if destination.exists() and folder != "Yu-Gi-Oh!":
        with Image.open(destination) as current:
            if current.size == (500, 750):
                return None
    try:
        source = volume["coverSource"]
        if folder == "Yu-Gi-Oh!":
            source = yugioh_wiki_cover(volume["number"])
        with urlopen(Request(source, headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as response:
            raw = response.read()
        normalize(raw, destination)
        return None
    except Exception as error:
        return folder, volume["number"], volume["coverSource"], str(error)


tasks = []
for folder, prefix, data_file in SERIES:
    (ROOT / "Mangás" / folder).mkdir(parents=True, exist_ok=True)
    data = json.loads((ROOT / "scripts" / data_file).read_text(encoding="utf-8"))
    tasks.extend((folder, prefix, volume) for volume in data)
with ThreadPoolExecutor(max_workers=8) as executor:
    errors = [result for result in executor.map(download, tasks) if result]
print(f"{len(tasks) - len(errors)} capas padronizadas em 500x750 px.")
for error in errors:
    print("ERRO", *error)
if errors:
    raise SystemExit(1)
