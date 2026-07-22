import json
import re
from datetime import datetime
from pathlib import Path

from lxml import html

ROOT = Path(__file__).resolve().parents[1]


def isbn13(value):
    digits = re.sub(r"[^0-9X]", "", value.upper())
    if len(digits) == 13:
        return digits
    base = "978" + digits[:9]
    check = (10 - sum((1 if index % 2 == 0 else 3) * int(char) for index, char in enumerate(base)) % 10) % 10
    return base + str(check)


def parse(source, total, date_cell):
    doc = html.fromstring((ROOT / source).read_bytes())
    volumes, next_chapter = [], 1
    for number in range(1, total + 1):
        heading = doc.xpath(f'//th[@id="vol{number}"]')[0]
        row = heading.getparent()
        cells = row.xpath("./td")
        publication = " ".join(" ".join(cells[date_cell].itertext()).split())
        date_match = re.search(r"([A-Z][a-z]+ \d{1,2}, \d{4})", publication)
        row_text = " ".join(" ".join(row.itertext()).split())
        isbn_match = re.search(r"(?:978-\d(?:-\d+)+|\d-\d{2}-\d{6}-[\dX])", row_text)
        details = row.getnext()
        count = len(details.xpath(".//li"))
        start, finish = next_chapter, next_chapter + count - 1
        next_chapter = finish + 1
        code = isbn13(isbn_match.group(0))
        volumes.append({
            "number": number,
            "releaseDate": datetime.strptime(date_match.group(1), "%B %d, %Y").strftime("%Y-%m-%d"),
            "chapters": [start, finish],
            "pageCount": 216 if source == ".tmp-kingdom.html" else 192,
            "coverSource": f"https://dosbg3xlm0x1t.cloudfront.net/images/items/{code}/1200/{code}.jpg",
        })
    return volumes


for filename, data in (
    ("kingdom-volumes.json", parse(".tmp-kingdom.html", 79, 0)),
    ("yu-gi-oh-volumes.json", parse(".tmp-yugioh.html", 38, 1)),
):
    (ROOT / "scripts" / filename).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(filename, len(data), data[0]["chapters"], data[-1]["chapters"])
