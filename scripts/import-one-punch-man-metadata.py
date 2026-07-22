import html
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
source = html.unescape((ROOT / ".tmp-opm-wikipedia.html").read_text(encoding="utf-8"))
chunks = re.split(r'"VolumeNumber"', source)[1:38]
if len(chunks) != 37:
    raise RuntimeError(f"Esperados 37 volumes; encontrados {len(chunks)}")

raw = []
for index, chunk in enumerate(chunks, 1):
    number_match = re.search(r'"wt":"(\d{2})"', chunk)
    date_match = re.search(r'"RelDate".*?"wt":"([A-Z][a-z]+ \d{1,2}, \d{4})', chunk)
    isbn_match = re.search(r'"ISBN".*?"wt":"([\d-]{17})"', chunk)
    start_match = re.search(r'Numbered list\|start=\s*(\d+)', chunk)
    if not all((number_match, date_match, isbn_match, start_match)):
        raise RuntimeError(f"Metadados incompletos no volume {index}")
    number = int(number_match.group(1))
    if number != index:
        raise RuntimeError(f"Ordem inesperada: volume {number} na posição {index}")
    raw.append({
        "number": number,
        "releaseDate": datetime.strptime(date_match.group(1), "%B %d, %Y").strftime("%Y-%m-%d"),
        "isbnDigits": isbn_match.group(1).replace("-", ""),
        "firstChapter": int(start_match.group(1)),
        "bonusChapters": len(re.findall(r'Bonus Manga', chunk.split('"Summary"')[0])),
    })

volumes = []
for index, item in enumerate(raw):
    last = raw[index + 1]["firstChapter"] - 1 if index + 1 < len(raw) else 194
    digits = item.pop("isbnDigits")
    first = item.pop("firstChapter")
    item.update({
        "chapters": [first, last],
        "pageCount": 200,
        "coverSource": f"https://dosbg3xlm0x1t.cloudfront.net/images/items/{digits}/1200/{digits}.jpg",
    })
    volumes.append(item)

(ROOT / "scripts" / "one-punch-man-volumes.json").write_text(
    json.dumps(volumes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print(f"One-Punch Man: {len(volumes)} volumes, capítulos 1 a {volumes[-1]['chapters'][1]}.")
