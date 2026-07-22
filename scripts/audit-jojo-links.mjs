import { readdir, readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = resolve(".");
const jojo = resolve("Mangás/JoJo");
const pages = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = resolve(directory, entry.name);
    if (entry.isDirectory()) await walk(target);
    else if (entry.name.endsWith(".html")) pages.push(target);
  }
}

await walk(jojo);
const missing = [];
const unsafeHome = [];
for (const page of pages) {
  const html = await readFile(page, "utf8");
  for (const match of html.matchAll(/(?:href|src|data-loner-app)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|#|data:|javascript:)/.test(value)) continue;
    const clean = decodeURIComponent(value.split(/[?#]/)[0]);
    const target = resolve(dirname(page), clean);
    try { await stat(target); } catch { missing.push({ page: page.slice(root.length + 1), value, target: target.slice(root.length + 1) }); }
  }
  for (const match of html.matchAll(/<a[^>]+href="([^"]*index\.html)"[^>]*>(?:<[^>]+>)*\s*(?:HOME|Início)/gi)) {
    const target = resolve(dirname(page), decodeURIComponent(match[1]));
    if (target !== resolve("index.html")) unsafeHome.push({ page: page.slice(root.length + 1), href: match[1], target: target.slice(root.length + 1) });
  }
}

const main = await readFile(resolve(jojo, "jojo.html"), "utf8");
console.log(JSON.stringify({ pages: pages.length, missing, unsafeHome, order: {
  resumo: main.indexOf("Resumo do Mangá"),
  info: main.indexOf("Informações do Mangá"),
  parts: main.indexOf("Ordem das partes")
}}, null, 2));
if (missing.length || unsafeHome.length) process.exitCode = 1;
