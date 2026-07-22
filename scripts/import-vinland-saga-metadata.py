import json
import re
from datetime import datetime
from pathlib import Path
from urllib.request import Request, urlopen

from lxml import html

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / ".tmp-vinland.html"


def fullwidth_number(value):
    return int(value.translate(str.maketrans("０１２３４５６７８９", "0123456789")))


def official_covers():
    covers = {}
    for page in (0, 1, 2):
        url = f"https://www.kodansha.co.jp/titles/1000000195/api?count={page}"
        with urlopen(Request(url, headers={"User-Agent": "Loner-Manga catalog importer/1.0"}), timeout=60) as response:
            products = json.load(response)["products"]
        for product in products:
            match = re.fullmatch(r"ヴィンランド・サガ（([０-９]+)）", product.get("name", ""))
            if match and product.get("imageUrl"):
                number = fullwidth_number(match.group(1))
                if number not in covers or product.get("label") == "afternoon":
                    covers[number] = product["imageUrl"]
    return covers


document = html.fromstring(SOURCE.read_bytes())
covers = official_covers()
volumes = []
for number in range(1, 30):
    heading = document.xpath(f'//th[@id="vol{number}"]')[0]
    row = heading.getparent()
    row_text = " ".join(" ".join(row.itertext()).split())
    dates = re.findall(r"([A-Z][a-z]+ \d{1,2}, \d{4})", row_text)
    details = row.getnext()
    chapters = []
    for item in details.xpath(".//li"):
        text = " ".join(item.itertext()).strip()
        match = re.match(r"0*(\d{1,3})(?:\.\d+)?\.", text)
        if match:
            chapters.append(int(match.group(1)))
    if not dates or not chapters or number not in covers:
        raise RuntimeError(f"Metadados incompletos no volume {number}")
    volumes.append({
        "number": number,
        "releaseDate": datetime.strptime(dates[0], "%B %d, %Y").strftime("%Y-%m-%d"),
        "chapters": [min(chapters), max(chapters)],
        "pageCount": 192 if number < 29 else 256,
        "coverSource": covers[number],
    })

if volumes[0]["chapters"][0] != 1 or volumes[-1]["chapters"][1] != 220:
    raise RuntimeError("A sequência de capítulos não cobre 1 a 220")

destination = ROOT / "scripts" / "vinland-saga-volumes.json"
destination.write_text(json.dumps(volumes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Vinland Saga: {len(volumes)} volumes, capítulos 1 a {volumes[-1]['chapters'][1]}.")
