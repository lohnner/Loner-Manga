export const articles = [
  {
    id: "naruto-1",
    title: "Naruto #1",
    category: "Volume",
    year: "2000",
    tags: ["Shueisha", "shōnen", "ninja"],
    summary:
      "Primeiro volume do mangá Naruto, publicado pela Shueisha em 2000 com o título Uzumaki Naruto!!. Na Loner Mangá, este verbete reúne capa, dados editoriais, personagens centrais e relações com a cronologia da série."
  },
  {
    id: "naruto-serie",
    title: "Naruto (1999)",
    category: "Série",
    year: "1999",
    tags: ["Shueisha", "Weekly Shōnen Jump", "Masashi Kishimoto"],
    summary:
      "Série de mangá criada por Masashi Kishimoto, publicada na revista Weekly Shōnen Jump entre 1999 e 2014, acompanhando o ninja Naruto Uzumaki em busca de reconhecimento e do título de Hokage."
  },
  {
    id: "universo-naruto",
    title: "Universo Naruto",
    category: "Universo",
    year: "1999",
    tags: ["shōnen", "ninja", "Konoha"],
    summary:
      "Conjunto de histórias, personagens, vilas ninja e eras narrativas ligados a Naruto. O portal organiza volumes por linha temporal, editora, fase editorial e mídia de origem."
  }
];

export const acervo = [
  {
    tipo: "universo",
    id: "naruto",
    title: "Naruto",
    href: "Universos/Naruto/naruto.html"
  },
  {
    tipo: "serie",
    id: "naruto-1999",
    title: "Naruto",
    year: "1999",
    universe: "Naruto",
    href: "Universos/Naruto/naruto.html"
  },
  {
    tipo: "hq",
    id: "naruto-1-2000",
    title: "Naruto #1 (2000)",
    shortTitle: "Naruto #1",
    universe: "Naruto",
    series: "Naruto",
    href: "Universos/Naruto/naruto-1-2000.html",
    cover: "Universos/Naruto/Naruto%20%231.png",
    pageCount: 187,
    xpReward: 187,
    fileName: "naruto-1-2000.html",
    keywords: ["Naruto", "Naruto Uzumaki", "Uzumaki Naruto!!", "Konoha", "Iruka", "Mizuki", "Raposa de Nove Caudas", "Kyuubi", "shōnen", "ninja"]
  }
];

const hqsCatalogadas = acervo.filter((item) => item.tipo === "hq");

export const catalogo = {
  universos: acervo.filter((item) => item.tipo === "universo"),
  personagens: acervo.filter((item) => item.tipo === "personagem"),
  series: acervo.filter((item) => item.tipo === "serie"),
  hqs: hqsCatalogadas
};

export const comics = Object.fromEntries(catalogo.hqs.map((hq) => [hq.id, hq]));
