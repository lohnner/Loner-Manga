import { readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const shueishaHtml = await readFile(join(tmpdir(), "one-piece-shueisha-list.html"), "utf8");
const serialized = shueishaHtml.match(/^var ssd = (.*);$/m)?.[1];
if (!serialized) throw new Error("Metadados da Shueisha não encontrados.");

const items = JSON.parse(serialized).data.item_datas;
const chapterRanges = {};
for (let page = 1; page <= 5; page += 1) {
  const html = await readFile(join(tmpdir(), `one-piece-comics-${page}.html`), "utf8");
  for (const match of html.matchAll(/\/img\/comics\/o(\d+)\/[^"']+[\s\S]*?第(\d+)話(?:～|〜)第(\d+)話/g)) {
    chapterRanges[Number(match[1])] = [Number(match[2]), Number(match[3])];
  }
}

// Confirmados nas páginas oficiais de lançamento dos volumes mais recentes.
chapterRanges[112] = [1134, 1144];
chapterRanges[113] = [1145, 1155];
chapterRanges[114] = [1156, 1166];
chapterRanges[115] = [1167, 1179];

const volumes = items.map((item) => {
  const number = Number(item.view_volume_number);
  const chapters = chapterRanges[number];
  if (!chapters) throw new Error(`Capítulos ausentes para o volume ${number}.`);
  const coverSource = item.image_url.replace("/240/", "/1200/");
  return {
    number,
    releaseDate: item.release_date,
    chapters,
    isbn: item.isbn,
    coverSource
  };
});

if (volumes.length !== 115) throw new Error(`Esperados 115 volumes; encontrados ${volumes.length}.`);
await writeFile(new URL("one-piece-volumes.json", import.meta.url), `${JSON.stringify(volumes, null, 2)}\n`);
console.log(`One Piece: metadados de ${volumes.length} volumes preparados.`);
