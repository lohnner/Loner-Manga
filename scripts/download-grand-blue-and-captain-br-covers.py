from concurrent.futures import ThreadPoolExecutor
from html import unescape
from io import BytesIO
from pathlib import Path
import json
import re
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def fetch(url):
    with urlopen(Request(url, headers=HEADERS), timeout=60) as response:
        return response.read()


def og_image(raw):
    text = raw.decode("utf-8", "ignore")
    patterns = [
        r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)',
        r'<meta\s+content=["\']([^"\']+)["\']\s+property=["\']og:image["\']',
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.I)
        if match:
            return unescape(match.group(1))
    raise RuntimeError("Imagem Open Graph não encontrada")


def save(raw, destination):
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


def captain(number):
    page = f"https://panini.com.br/capitao-tsubasa-{number:02d}"
    image = og_image(fetch(page))
    image = re.sub(r"/-S\d+-FWEBP$", "/-S1000-FWEBP", image)
    save(fetch(image), ROOT / "Mangás" / "Captain Tsubasa" / f"Captain Tsubasa #{number}.png")


def grand_blue_cover(volume):
    isbn = volume["isbn"]
    candidates = [
        f"https://cv.bkmkn.kodansha.co.jp/{isbn}/{isbn}_w.jpg",
        f"https://cv.bkmkn.kodansha.co.jp/{isbn}/{isbn}.jpg",
    ]
    for url in candidates:
        try:
            raw = fetch(url)
            with Image.open(BytesIO(raw)) as image:
                image.verify()
            return raw
        except Exception:
            continue
    raise RuntimeError(f"Capa não localizada para o ISBN {isbn}")


grand_output = ROOT / "Mangás" / "Grand Blue"
grand_output.mkdir(parents=True, exist_ok=True)
with ThreadPoolExecutor(max_workers=2) as executor:
    list(executor.map(captain, (1, 2)))

products = json.loads((ROOT / "scripts" / "grand-blue-volumes.json").read_text(encoding="utf-8"))
with ThreadPoolExecutor(max_workers=6) as executor:
    futures = [executor.submit(save, grand_blue_cover(volume), grand_output / f"Grand Blue #{volume['number']}.png") for volume in products]
    for future in futures:
        future.result()

print("Captain Tsubasa: 2 capas brasileiras Panini atualizadas.")
print("Grand Blue: 26 capas oficiais Kodansha padronizadas em 500x750 px.")
