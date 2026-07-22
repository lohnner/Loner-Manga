from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from io import BytesIO
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen

import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
HEADERS = {"User-Agent": "Mozilla/5.0"}
WIKI = "https://en.wikipedia.org/wiki/List_of_Hunter_%C3%97_Hunter_chapters"


def fetch(url):
    return urlopen(Request(url, headers=HEADERS), timeout=60).read()


def jbc_pages(volume):
    if volume == 39:
        return 208
    url = f"https://editorajbc.com.br/mangas/colecao/hunter-x-hunter/vol/hunter-x-hunter-{volume:02d}/"
    text = fetch(url).decode("utf-8", "ignore")
    match = re.search(r"Número de páginas:\s*</?[^>]*>?\s*(\d+)|Número de páginas:\s*(\d+)", text, re.I)
    if not match:
        match = re.search(r"Número de páginas:[^0-9]{0,80}(\d+)", text, re.I | re.S)
    return int(next(value for value in match.groups() if value)) if match else 192


table = pd.read_html(BytesIO(fetch(WIKI)))[0]
records = []
for index, row in table.iterrows():
    number_text = str(row["No."]).strip()
    if not number_text.isdigit():
        continue
    number = int(number_text)
    if not 1 <= number <= 39:
        continue
    chapter_row = table.iloc[index + 1]
    chapter_text = " ".join(str(chapter_row[column]) for column in table.columns)
    chapters = sorted({int(value) for value in re.findall(r"\b(\d{3})\.", chapter_text)})
    date_text = re.sub(r"\[\d+\].*", "", str(row["Original release date"])).strip()
    records.append({
        "number": number,
        "releaseDate": datetime.strptime(date_text, "%B %d, %Y").strftime("%Y-%m-%d"),
        "chapters": [min(chapters), max(chapters)],
        "pageCount": 192,
    })

with ThreadPoolExecutor(max_workers=8) as executor:
    page_counts = list(executor.map(jbc_pages, range(1, 40)))
for record, pages in zip(records, page_counts):
    record["pageCount"] = pages

destination = ROOT / "scripts" / "hunter-x-hunter-volumes.json"
destination.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(records)} volumes de Hunter x Hunter normalizados.")
