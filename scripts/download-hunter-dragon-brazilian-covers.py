from concurrent.futures import ThreadPoolExecutor
from html import unescape
from io import BytesIO
from pathlib import Path
import re
from urllib.parse import urljoin
from urllib.request import Request, urlopen

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}


def fetch(url):
    with urlopen(Request(url, headers=HEADERS), timeout=60) as response:
        return response.read()


def og_image(html):
    text = html.decode("utf-8", "ignore")
    match = re.search(r'<meta\s+property=["\']og:image["\']\s+content=["\']([^"\']+)', text, re.I)
    if not match:
        match = re.search(r'<meta\s+content=["\']([^"\']+)["\']\s+property=["\']og:image["\']', text, re.I)
    if not match:
        raise RuntimeError("Página sem imagem Open Graph")
    return unescape(match.group(1))


def save_cover(raw, destination):
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


def download_hunter(volume):
    if volume <= 38:
        page = f"https://editorajbc.com.br/mangas/colecao/hunter-x-hunter/vol/hunter-x-hunter-{volume:02d}/"
        image_url = og_image(fetch(page))
    else:
        # O volume 39 ainda não possui edição brasileira; usa-se a capa oficial da Shueisha.
        image_url = "https://dosbg3xlm0x1t.cloudfront.net/images/items/9784088851747/1200/9784088851747.jpg"
    save_cover(fetch(image_url), ROOT / "Mangás" / "Hunter x Hunter" / f"Hunter x Hunter #{volume}.png")


def discover_dragon_pages():
    pending = ["https://panini.com.br/dragon-ball-vol-1-amadr001r5"]
    visited = set()
    pages = {}
    while pending and len(pages) < 42:
        url = pending.pop(0)
        if url in visited:
            continue
        visited.add(url)
        try:
            html = fetch(url)
        except Exception:
            continue
        text = html.decode("utf-8", "ignore")
        title = re.search(r'<h1[^>]*class=["\'][^"\']*page-title[^"\']*["\'][^>]*>.*?<span[^>]*>(.*?)</span>', text, re.I | re.S)
        label = re.sub(r"<[^>]+>", " ", title.group(1)) if title else ""
        match = re.search(r"Dragon\s*Ball\s*Vol\.?\s*(\d+)", unescape(label), re.I)
        if match:
            number = int(match.group(1))
            if 1 <= number <= 42:
                pages[number] = (url, og_image(html))
        for href in re.findall(r'href=["\']([^"\']*dragon-ball-vol-[^"\'#?]+)', text, re.I):
            candidate = urljoin(url, unescape(href)).rstrip("/")
            if candidate not in visited:
                pending.append(candidate)
    missing = sorted(set(range(1, 43)) - pages.keys())
    if missing:
        raise RuntimeError(f"Não foi possível localizar na Panini: {missing}")
    return pages


def download_dragon(item):
    number, (_, image_url) = item
    # A CDN da Panini aceita uma imagem maior ao trocar o preset da miniatura.
    image_url = re.sub(r"/-S\d+-FWEBP$", "/-S1000-FWEBP", image_url)
    save_cover(fetch(image_url), ROOT / "Mangás" / "Dragon Ball" / f"Dragon Ball #{number}.png")


(ROOT / "Mangás" / "Hunter x Hunter").mkdir(parents=True, exist_ok=True)
with ThreadPoolExecutor(max_workers=6) as executor:
    list(executor.map(download_hunter, range(1, 40)))

dragon_pages = discover_dragon_pages()
with ThreadPoolExecutor(max_workers=6) as executor:
    list(executor.map(download_dragon, sorted(dragon_pages.items())))

print("Hunter x Hunter: capas brasileiras JBC 1–38 e capa oficial 39.")
print("Dragon Ball: 42 capas brasileiras Panini.")
