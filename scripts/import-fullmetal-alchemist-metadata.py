import html
import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
wiki = html.unescape((ROOT / ".tmp-fullmetal-chapters.html").read_text(encoding="utf-8"))
viz = (ROOT / ".tmp-fullmetal-viz.html").read_text(encoding="utf-8")

markers = list(re.finditer(r'id="vol(\d{2})"', wiki))
covers = re.findall(r'data-original="(https://dw9to29mmj727\.cloudfront\.net/products/[^\"]+\.jpg)"', viz)
if len(markers) != 27 or len(covers) != 27:
    raise RuntimeError(f"Esperados 27 volumes/capas; encontrados {len(markers)}/{len(covers)}")

volumes = []
bonus_by_volume = {3: 1, 4: 1, 6: 1, 7: 1, 8: 1, 14: 1, 23: 1, 24: 1, 27: 1}
for index, marker in enumerate(markers):
    block = wiki[marker.start(): markers[index + 1].start() if index + 1 < len(markers) else len(wiki)]
    date_match = re.search(r'</th><td>([A-Z][a-z]+ \d{1,2}, \d{4})', block)
    chapters = [int(number) for number in re.findall(r'<li>\s*(\d{1,3})\.', block)]
    if not date_match or not chapters:
        raise RuntimeError(f"Metadados incompletos no volume {index + 1}")
    # A fonte oficial de capítulos usa rótulos diferentes (Gaiden, Bonus e
    # Special Episode); o mapa mantém todos os extras encadernados explícitos.
    bonus = bonus_by_volume.get(index + 1, 0)
    volumes.append({
        "number": index + 1,
        "releaseDate": datetime.strptime(date_match.group(1), "%B %d, %Y").strftime("%Y-%m-%d"),
        "chapters": [min(chapters), max(chapters)],
        "bonusChapters": bonus,
        "pageCount": 192,
        "coverSource": covers[index],
    })

(ROOT / "scripts" / "fullmetal-alchemist-volumes.json").write_text(
    json.dumps(volumes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
)
print(f"Fullmetal Alchemist: {len(volumes)} volumes, capítulos 1 a {volumes[-1]['chapters'][1]}.")
