import json
from datetime import datetime
from pathlib import Path
import re
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
URL = "https://grand-blue.fandom.com/api.php?action=parse&page=Volumes_%26_Chapters&prop=wikitext&format=json"
raw = urlopen(Request(URL, headers={"User-Agent": "Mozilla/5.0"}), timeout=60).read()
data = json.loads(raw)
text = data["parse"]["wikitext"]["*"]
records = []
for block in re.findall(r"\{\{Volumes\s*(.*?)\}\}\}\}", text, re.S):
    number_match = re.search(r"\|\s*volume\s*=\s*(\d+)", block)
    date_match = re.search(r"\|\s*release_ja\s*=\s*([^\n]+)", block)
    isbn_match = re.search(r"\|\s*ISBN\s*=\s*([\d-]+)", block)
    chapters = [int(value) for value in re.findall(r"\[\[Chapter\s+(\d+)(?:\.\d+)?\]\]", block)]
    if not (number_match and date_match and isbn_match and chapters):
        continue
    date_text = re.sub(r"(\d+)(?:st|nd|rd|th)", r"\1", date_match.group(1).strip())
    records.append({
        "number": int(number_match.group(1)),
        "releaseDate": datetime.strptime(date_text, "%B %d, %Y").strftime("%Y-%m-%d"),
        "chapters": [min(chapters), max(chapters)],
        "pageCount": 192,
        "isbn": re.sub(r"\D", "", isbn_match.group(1)),
    })
destination = ROOT / "scripts" / "grand-blue-volumes.json"
destination.write_text(json.dumps(records, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"{len(records)} volumes de Grand Blue normalizados.")
