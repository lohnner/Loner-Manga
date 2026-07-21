import { firebaseConfig } from "./firebase-config.js";

const [appSdk, dbSdk] = await Promise.all([
  import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
  import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
]);
const app = appSdk.getApps().length ? appSdk.getApp() : appSdk.initializeApp(firebaseConfig);
const db = dbSdk.getFirestore(app);
const box = document.querySelector("#gameRankingContent");
const general = document.querySelector("#rankingPage");
const defaultAvatar = "lonermangalogo.png";
const legacyDefaultAvatar = "Avatar/homemaranha.png";
let shops = [], profiles = new Map();
const esc = (value = "") => String(value).replace(/[&<>]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[char]));
const imageUrl = path => new URL(!path || path === legacyDefaultAvatar ? defaultAvatar : path, new URL("./", location.href)).href;

function render(type) {
  document.querySelectorAll("[data-rank]").forEach(button => button.classList.toggle("active", button.dataset.rank === type));
  general.hidden = type !== "general";
  box.hidden = type === "general";
  if (type === "general") return;
  const field = type === "lm" ? "lm" : "collectionDistinctCount";
  const unit = type === "lm" ? "LM" : "pontos";
  const title = type === "lm" ? "Mais LM" : "Maior Coleção";
  const list = [...shops].sort((a, b) => (b[field] || 0) - (a[field] || 0));
  box.innerHTML = `<div class="ranking-board"><div class="ranking-header"><h2>${title}</h2></div><div class="ranking-list">${list.map((shop, index) => { const profile = profiles.get(shop.ownerUid) || {}; const name = profile.nick || shop.ownerDisplayName || "Leitor Loner"; return `<a class="ranking-row${index < 3 ? " top-rank" : ""}" href="perfil.html?uid=${encodeURIComponent(shop.ownerUid)}"><span class="ranking-position">#${index + 1}</span><img src="${imageUrl(profile.avatarPath)}" alt="Avatar de ${esc(name)}"><span class="ranking-user"><strong>${esc(name)}</strong><small>${esc(shop.shopName)} · ${shop[field] || 0} ${unit}</small></span></a>`; }).join("") || "<p>Nenhuma loja criada ainda.</p>"}</div></div>`;
}

document.querySelector("#gameRankings").onclick = event => { const button = event.target.closest("[data-rank]"); if (button) render(button.dataset.rank); };
const rerender = () => render(document.querySelector("[data-rank].active")?.dataset.rank || "general");
dbSdk.onSnapshot(dbSdk.collection(db, "shops"), snapshot => { shops = snapshot.docs.map(doc => doc.data()); rerender(); });
dbSdk.onSnapshot(dbSdk.collection(db, "users"), snapshot => { profiles = new Map(snapshot.docs.map(doc => [doc.id, doc.data()])); rerender(); });
