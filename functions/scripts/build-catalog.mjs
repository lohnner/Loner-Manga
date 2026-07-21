import { writeFile } from "node:fs/promises";
import { catalogoVolumes } from "../../catalogo.js";
if (!catalogoVolumes.length) throw new Error("O catálogo oficial não possui volumes.");
await writeFile(new URL("../catalog-runtime.json", import.meta.url), JSON.stringify(catalogoVolumes, null, 2));
console.log(`${catalogoVolumes.length} volumes exportados do catálogo oficial.`);
