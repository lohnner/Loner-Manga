import { access, readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const volumes = JSON.parse(await readFile(new URL("dragon-ball-volumes.json", import.meta.url), "utf8"));
if (volumes.length !== 42 || volumes[0].chapters[0] !== 1 || volumes.at(-1).chapters[1] !== 519) throw new Error("Metadados de Dragon Ball incompletos");
for (let index = 0; index < volumes.length; index += 1) {
  const volume = volumes[index];
  if (index && volume.chapters[0] !== volumes[index - 1].chapters[1] + 1) throw new Error(`Intervalo incorreto no volume ${volume.number}`);
  const year = volume.releaseDate.slice(0, 4);
  await access(new URL(`Mang%C3%A1s/Dragon%20Ball/dragon-ball-${volume.number}-${year}.html`, root));
  await access(new URL(`Mang%C3%A1s/Dragon%20Ball/Dragon%20Ball%20%23${volume.number}.png`, root));
  const page = await readFile(new URL(`Mang%C3%A1s/Dragon%20Ball/dragon-ball-${volume.number}-${year}.html`, root), "utf8");
  if (page.includes("<th>ISBN</th>") || page.includes("<th>Formato</th>")) throw new Error(`Campo indevido no volume ${volume.number}`);
}
const catalog = await readFile(new URL("catalogo.js", root), "utf8");
if ((catalog.match(/id: "dragon-ball-\d+-\d{4}"/g) || []).length !== 42) throw new Error("Catálogo de Dragon Ball incompleto");
const sitemap = await readFile(new URL("sitemap.xml", root), "utf8");
if ((sitemap.match(/Dragon%20Ball/g) || []).length !== 43) throw new Error("Sitemap de Dragon Ball incompleto");
const checks = [
  ["Mang%C3%A1s/Boruto/boruto.html", "80 + 36 em Two Blue Vortex"],
  ["Mang%C3%A1s/Berserk/berserk.html", "<th>Cap&iacute;tulos</th><td>382</td>"],
  ["Mang%C3%A1s/Captain%20Tsubasa/captain-tsubasa.html", "<th>Cap&iacute;tulos</th><td>114</td>"],
  ["Mang%C3%A1s/Bleach/bleach.html", "<th>Cap&iacute;tulos</th><td>686</td>"],
];
for (const [path, expected] of checks) {
  const page = await readFile(new URL(path, root), "utf8");
  if (!page.includes(expected) || page.includes("<th>Continua&ccedil;&atilde;o</th>")) throw new Error(`Informações incorretas em ${path}`);
}
const script = await readFile(new URL("script.js", root), "utf8");
for (const id of ["borutoArcsDialog", "dorohedoroArcsDialog"]) if (!script.includes(id)) throw new Error(`Arcos ausentes: ${id}`);
console.log("Validação dos mangás concluída com sucesso.");
