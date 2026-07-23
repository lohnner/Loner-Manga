import { firebaseConfig, firebaseReady } from './firebase-config.js';

if (!document.querySelector('link[href="account-ui.css"]')) {
  const accountStyles = document.createElement('link');
  accountStyles.rel = 'stylesheet';
  accountStyles.href = 'account-ui.css';
  document.head.append(accountStyles);
}
if (!document.querySelector('link[href="global-nav.css"]')) {
  const navStyles = document.createElement('link');
  navStyles.rel = 'stylesheet';
  navStyles.href = 'global-nav.css';
  document.head.append(navStyles);
}
if (!document.querySelector('link[href="profile-ranking.css"]')) {
  const profileRankingStyles = document.createElement('link');
  profileRankingStyles.rel = 'stylesheet';
  profileRankingStyles.href = 'profile-ranking.css';
  document.head.append(profileRankingStyles);
}
if (!document.querySelector('link[href="avatar-layout.css"]')) {
  const avatarLayoutStyles = document.createElement('link');
  avatarLayoutStyles.rel = 'stylesheet';
  avatarLayoutStyles.href = 'avatar-layout.css';
  document.head.append(avatarLayoutStyles);
}
if (!document.querySelector('link[href="watch-online.css"]')) {
  const watchOnlineStyles = document.createElement('link');
  watchOnlineStyles.rel = 'stylesheet';
  watchOnlineStyles.href = 'watch-online.css';
  document.head.append(watchOnlineStyles);
}

const PAGE_ANIME = document.body.dataset.anime || 'naruto';
const TOTAL_EPISODES = Number(document.body.dataset.totalEpisodes || 220);
const PROGRESS_FIELDS = {
  naruto: 'watchedEpisodes', myHeroAcademia: 'myHeroWatchedEpisodes', villager999: 'villager999WatchedEpisodes',
  myHeroSeason2: 'myHeroSeason2WatchedEpisodes', myHeroSeason3: 'myHeroSeason3WatchedEpisodes',
  myHeroSeason4: 'myHeroSeason4WatchedEpisodes', myHeroSeason5: 'myHeroSeason5WatchedEpisodes',
  myHeroSeason6: 'myHeroSeason6WatchedEpisodes', myHeroSeason7: 'myHeroSeason7WatchedEpisodes',
  myHeroFinalSeason: 'myHeroFinalSeasonWatchedEpisodes', myHeroMore: 'myHeroMoreWatchedEpisodes',
  kekkonYubiwa: 'kekkonYubiwaWatchedEpisodes', kekkonYubiwaSeason2: 'kekkonYubiwaSeason2WatchedEpisodes',
  mushokuTensei: 'mushokuTenseiWatchedEpisodes', mushokuTenseiPart2: 'mushokuTenseiPart2WatchedEpisodes',
  mushokuGuardianFitz: 'mushokuGuardianFitzWatchedEpisodes', mushokuSeason2: 'mushokuSeason2WatchedEpisodes',
  mushokuSeason2Part2: 'mushokuSeason2Part2WatchedEpisodes', mushokuSeason3: 'mushokuSeason3WatchedEpisodes'
};
const progressField = PROGRESS_FIELDS[PAGE_ANIME] || 'watchedEpisodes';
const XP_PER_EPISODE = 22;
const DATA_VERSION = 1;
const DEFAULT_AVATAR = 'Avatar/naruto-default-500x500.jpg';
const WATCH_OPTIONS = {
  naruto: { title: 'Naruto', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-pt/series/GY9PJ5KWR/naruto' },
  myHeroAcademia: { title: 'My Hero Academia', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G6NQ5DWZ6/my-hero-academia' },
  myHeroSeason2: { title: 'My Hero Academia: 2ª Temporada', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G6NQ5DWZ6/my-hero-academia' },
  myHeroSeason3: { title: 'My Hero Academia: 3ª Temporada', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G6NQ5DWZ6/my-hero-academia' },
  myHeroSeason4: { title: 'My Hero Academia: 4ª Temporada', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G6NQ5DWZ6/my-hero-academia' },
  myHeroSeason5: { title: 'My Hero Academia: 5ª Temporada', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G6NQ5DWZ6/my-hero-academia' },
  myHeroSeason6: { title: 'My Hero Academia: 6ª Temporada', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G6NQ5DWZ6/my-hero-academia' },
  myHeroSeason7: { title: 'My Hero Academia: 7ª Temporada', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G6NQ5DWZ6/my-hero-academia' },
  myHeroFinalSeason: { title: 'My Hero Academia: Temporada Final', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G6NQ5DWZ6/my-hero-academia' },
  myHeroMore: { title: 'My Hero Academia: More', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G6NQ5DWZ6/my-hero-academia' },
  kekkonYubiwa: { title: 'Kekkon Yubiwa Monogatari', platform: 'Meus Animes', url: 'https://meusanimes.blog/a/kekkon-yubiwa-monogatari-dublado/' },
  kekkonYubiwaSeason2: { title: 'Kekkon Yubiwa Monogatari II', platform: 'Meus Animes', url: 'https://meusanimes.blog/a/kekkon-yubiwa-monogatari-dublado/' },
  villager999: { title: 'The Villager of Level 999', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/GT00371878/the-villager-of-level-999' },
  mushokuTensei: { title: 'Mushoku Tensei: Jobless Reincarnation', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G24H1N3MP/mushoku-tensei-jobless-reincarnation' },
  mushokuTenseiPart2: { title: 'Mushoku Tensei: Parte 2', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G24H1N3MP/mushoku-tensei-jobless-reincarnation' },
  mushokuGuardianFitz: { title: 'Mushoku Tensei: Guardião Fitz', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G24H1N3MP/mushoku-tensei-jobless-reincarnation' },
  mushokuSeason2: { title: 'Mushoku Tensei II', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G24H1N3MP/mushoku-tensei-jobless-reincarnation' },
  mushokuSeason2Part2: { title: 'Mushoku Tensei II: Parte 2', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G24H1N3MP/mushoku-tensei-jobless-reincarnation' },
  mushokuSeason3: { title: 'Mushoku Tensei III', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G24H1N3MP/mushoku-tensei-jobless-reincarnation' }
};
const MUSHOKU_SEQUENCE = [
  { key:'mushokuTensei', title:'Mushoku Tensei', subtitle:'1ª temporada', href:'mushoku-tensei.html', cover:'mushoku-tensei-500x750.jpg', episodes:11 },
  { key:'mushokuTenseiPart2', title:'Mushoku Tensei: Parte 2', subtitle:'1ª temporada • Parte 2', href:'mushoku-tensei-part-2.html', cover:'mushoku-tensei-part-2-500x750.jpg', episodes:12 },
  { key:'mushokuGuardianFitz', title:'Guardião Fitz', subtitle:'Episódio especial', href:'mushoku-guardian-fitz.html', cover:'mushoku-guardian-fitz-500x750.jpg', episodes:1 },
  { key:'mushokuSeason2', title:'Mushoku Tensei II', subtitle:'2ª temporada', href:'mushoku-tensei-season-2.html', cover:'mushoku-tensei-season-2-500x750.jpg', episodes:12 },
  { key:'mushokuSeason2Part2', title:'Mushoku Tensei II: Parte 2', subtitle:'2ª temporada • Parte 2', href:'mushoku-tensei-season-2-part-2.html', cover:'mushoku-tensei-season-2-part-2-500x750.jpg', episodes:12 },
  { key:'mushokuSeason3', title:'Mushoku Tensei III', subtitle:'3ª temporada', href:'mushoku-tensei-season-3.html', cover:'mushoku-tensei-season-3-500x750.jpg', episodes:14 }
];
const MY_HERO_SEQUENCE = [
  { key:'myHeroAcademia', title:'My Hero Academia', subtitle:'1ª temporada', href:'my-hero-academia.html', cover:'my-hero-academia-500x750.jpg', episodes:13, year:2016, status:'Completo', description:'Izuku Midoriya nasce sem poderes, mas recebe de All Might a oportunidade de herdar o One For All e ingressar na U.A. para se tornar um grande herói.' },
  { key:'myHeroSeason2', title:'My Hero Academia: 2ª Temporada', subtitle:'2ª temporada', href:'my-hero-academia-season-2.html', cover:'my-hero-academia-season-2-500x750.jpg', episodes:25, year:2017, status:'Completo', description:'O Festival Esportivo da U.A. coloca Deku e seus colegas diante de novos rivais, estágios profissionais e desafios que testam seus ideais de heroísmo.' },
  { key:'myHeroSeason3', title:'My Hero Academia: 3ª Temporada', subtitle:'3ª temporada', href:'my-hero-academia-season-3.html', cover:'my-hero-academia-season-3-500x750.jpg', episodes:25, year:2018, status:'Completo', description:'Durante o treinamento de verão, a Liga dos Vilões ataca os alunos da U.A., levando heróis e estudantes a uma batalha decisiva.' },
  { key:'myHeroSeason4', title:'My Hero Academia: 4ª Temporada', subtitle:'4ª temporada', href:'my-hero-academia-season-4.html', cover:'my-hero-academia-season-4-500x750.jpg', episodes:25, year:2019, status:'Completo', description:'Deku inicia seu estágio com Sir Nighteye e enfrenta Overhaul em uma missão perigosa para proteger a pequena Eri.' },
  { key:'myHeroSeason5', title:'My Hero Academia: 5ª Temporada', subtitle:'5ª temporada', href:'my-hero-academia-season-5.html', cover:'my-hero-academia-season-5-500x750.jpg', episodes:25, year:2021, status:'Completo', description:'As turmas 1-A e 1-B se enfrentam em um treinamento conjunto enquanto o poder de Deku começa a revelar novas habilidades.' },
  { key:'myHeroSeason6', title:'My Hero Academia: 6ª Temporada', subtitle:'6ª temporada', href:'my-hero-academia-season-6.html', cover:'my-hero-academia-season-6-500x750.jpg', episodes:25, year:2022, status:'Completo', description:'A guerra contra a Frente de Libertação Paranormal começa, colocando heróis e vilões em seu confronto mais devastador.' },
  { key:'myHeroSeason7', title:'My Hero Academia: 7ª Temporada', subtitle:'7ª temporada', href:'my-hero-academia-season-7.html', cover:'my-hero-academia-season-7-500x750.jpg', episodes:21, year:2024, status:'Completo', description:'Com a sociedade em crise, Deku e seus aliados se preparam para a batalha final contra Shigaraki e All For One.' },
  { key:'myHeroFinalSeason', title:'My Hero Academia: Temporada Final', subtitle:'8ª e última temporada', href:'my-hero-academia-final-season.html', cover:'my-hero-academia-final-season-500x750.jpg', episodes:11, year:2025, status:'Completo', description:'A batalha final chega ao clímax e define o destino de Deku, All Might, Shigaraki e de toda a sociedade de heróis.' },
  { key:'myHeroMore', title:'My Hero Academia: More', subtitle:'Episódio especial', href:'my-hero-academia-more.html', cover:'my-hero-academia-more-500x750.jpg', episodes:1, year:2026, status:'Especial', description:'Um episódio especial que retorna ao universo de My Hero Academia após a conclusão da temporada final.' }
];
const KEKKON_YUBIWA_SEQUENCE = [
  { key:'kekkonYubiwa', title:'Kekkon Yubiwa Monogatari', subtitle:'1ª temporada', href:'kekkon-yubiwa-monogatari.html', cover:'kekkon-yubiwa-monogatari-500x750.jpg', episodes:12, year:2024, status:'Completo', description:'Satou segue sua amiga de infância Hime até outro mundo e se torna o Rei dos Anéis, destinado a se casar com cinco princesas para enfrentar o Rei do Abismo.' },
  { key:'kekkonYubiwaSeason2', title:'Kekkon Yubiwa Monogatari II', subtitle:'2ª temporada', href:'kekkon-yubiwa-monogatari-season-2.html', cover:'kekkon-yubiwa-monogatari-season-2-500x750.jpg', episodes:13, year:2025, status:'Completo', description:'Satou, Hime e as Princesas dos Anéis continuam sua jornada para dominar o poder dos anéis e derrotar definitivamente o Rei do Abismo.' }
];
let services = null;
let currentUser = null;
let currentProfile = null;
let rankingUsersByUid = new Map();

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const totalWatched = (profile = {}) => Object.values(PROGRESS_FIELDS).reduce((sum, field) => sum + Number(profile?.[field] || 0), 0);
const mushokuWatched = (profile = {}) => MUSHOKU_SEQUENCE.reduce((sum, anime) => sum + Number(profile?.[PROGRESS_FIELDS[anime.key]] || 0), 0);
const myHeroWatched = (profile = {}) => MY_HERO_SEQUENCE.reduce((sum, anime) => sum + Number(profile?.[PROGRESS_FIELDS[anime.key]] || 0), 0);
const kekkonYubiwaWatched = (profile = {}) => KEKKON_YUBIWA_SEQUENCE.reduce((sum, anime) => sum + Number(profile?.[PROGRESS_FIELDS[anime.key]] || 0), 0);
const distributeProgress = (total, capacities) => { let remaining=Math.max(0,Number(total||0)); return capacities.map(capacity=>{const value=Math.min(capacity,remaining); remaining-=value; return value;}); };
document.addEventListener('error', (event) => { if (event.target instanceof HTMLImageElement && event.target.src !== new URL(DEFAULT_AVATAR, location.href).href) event.target.src = DEFAULT_AVATAR; }, true);
const xpForLevel = (level) => {
  const n = Math.max(0, Number(level) - 1);
  return Math.floor((50 * n ** 3 - 150 * n ** 2 + 400 * n) / 3);
};
const levelFromXp = (xp) => {
  const total = Math.max(0, Number(xp || 0));
  let level = 1;
  while (xpForLevel(level + 1) <= total) level += 1;
  return level;
};
const levelProgress = (xp) => {
  const level = levelFromXp(xp), floor = xpForLevel(level), ceiling = xpForLevel(level + 1);
  const current = Math.max(0, xp - floor), needed = Math.max(1, ceiling - floor);
  return { level, current, needed, percent: Math.min(100, current / needed * 100) };
};
const friendlyError = (error) => {
  const code = error?.code || '';
  if (code.includes('invalid-credential')) return 'E-mail ou senha incorretos.';
  if (code.includes('email-already-in-use')) return 'Este e-mail já possui uma conta.';
  if (code.includes('weak-password')) return 'Use uma senha com pelo menos 6 caracteres.';
  if (code.includes('popup-closed')) return 'A janela de login foi fechada.';
  return 'Não foi possível concluir. Tente novamente.';
};

function renderGlobalNavigation() {
  const nav = document.querySelector('.topbar nav');
  if (!nav) return;
  const page = window.location.pathname.split('/').pop() || 'index.html';
  nav.innerHTML = `<a class="${page === 'index.html' ? 'active' : ''}" href="index.html">HOME</a><a class="${['animes.html','naruto.html','the-villager-of-level-999.html',...MUSHOKU_SEQUENCE.map(anime=>anime.href),...MY_HERO_SEQUENCE.map(anime=>anime.href),...KEKKON_YUBIWA_SEQUENCE.map(anime=>anime.href)].includes(page) ? 'active' : ''}" href="animes.html">ANIMES</a><span class="nav-dropdown"><a class="${['ranking.html','ranking-animes.html'].includes(page) ? 'active' : ''}" href="ranking.html" aria-haspopup="true">RANKING</a><span class="nav-dropdown-menu"><a href="ranking-animes.html">Ranking de Animes</a><a href="ranking.html">Ranking de Usuários</a></span></span>`;
}

renderGlobalNavigation();

async function initFirebase() {
  if (!firebaseReady) return;
  const [appModule, authModule, dbModule] = await Promise.all([
    import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js'),
    import('https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js'),
    import('https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js')
  ]);
  const app = appModule.initializeApp(firebaseConfig);
  services = { auth: authModule.getAuth(app), db: dbModule.getFirestore(app), ...authModule, ...dbModule };
  services.onAuthStateChanged(services.auth, handleAuthState);
}

async function handleAuthState(user) {
  currentUser = user;
  if (!user) { currentProfile = null; renderAuth(); renderProgress(); renderProfile(); return; }
  const ref = services.doc(services.db, 'users', user.uid);
  const snapshot = await services.getDoc(ref);
  const old = snapshot.exists() ? snapshot.data() : {};
  const migrated = old.animeDataVersion !== DATA_VERSION;
  const myHeroExtraFields = MY_HERO_SEQUENCE.slice(1).map(anime => PROGRESS_FIELDS[anime.key]);
  const hasMyHeroSequence = myHeroExtraFields.some(field => old[field] !== undefined);
  const legacyMyHero = distributeProgress(Math.min(170,Number(old.myHeroWatchedEpisodes||0)), MY_HERO_SEQUENCE.slice(0,8).map(anime=>anime.episodes));
  currentProfile = {
    ...old, uid: user.uid, email: user.email || old.email || '',
    nick: old.nick || user.displayName || (user.email || 'Ninja').split('@')[0],
    watchedEpisodes: migrated ? 0 : Math.min(220, Number(old.watchedEpisodes || 0)),
    myHeroWatchedEpisodes: migrated ? 0 : hasMyHeroSequence ? Math.min(13, Number(old.myHeroWatchedEpisodes || 0)) : legacyMyHero[0],
    myHeroSeason2WatchedEpisodes: migrated ? 0 : hasMyHeroSequence ? Math.min(25,Number(old.myHeroSeason2WatchedEpisodes||0)) : legacyMyHero[1],
    myHeroSeason3WatchedEpisodes: migrated ? 0 : hasMyHeroSequence ? Math.min(25,Number(old.myHeroSeason3WatchedEpisodes||0)) : legacyMyHero[2],
    myHeroSeason4WatchedEpisodes: migrated ? 0 : hasMyHeroSequence ? Math.min(25,Number(old.myHeroSeason4WatchedEpisodes||0)) : legacyMyHero[3],
    myHeroSeason5WatchedEpisodes: migrated ? 0 : hasMyHeroSequence ? Math.min(25,Number(old.myHeroSeason5WatchedEpisodes||0)) : legacyMyHero[4],
    myHeroSeason6WatchedEpisodes: migrated ? 0 : hasMyHeroSequence ? Math.min(25,Number(old.myHeroSeason6WatchedEpisodes||0)) : legacyMyHero[5],
    myHeroSeason7WatchedEpisodes: migrated ? 0 : hasMyHeroSequence ? Math.min(21,Number(old.myHeroSeason7WatchedEpisodes||0)) : legacyMyHero[6],
    myHeroFinalSeasonWatchedEpisodes: migrated ? 0 : hasMyHeroSequence ? Math.min(11,Number(old.myHeroFinalSeasonWatchedEpisodes||0)) : legacyMyHero[7],
    myHeroMoreWatchedEpisodes: migrated ? 0 : Math.min(1,Number(old.myHeroMoreWatchedEpisodes||0)),
    kekkonYubiwaWatchedEpisodes: migrated ? 0 : Math.min(12, Number(old.kekkonYubiwaWatchedEpisodes || 0)),
    kekkonYubiwaSeason2WatchedEpisodes: migrated ? 0 : Math.min(13, Number(old.kekkonYubiwaSeason2WatchedEpisodes || 0)),
    villager999WatchedEpisodes: migrated ? 0 : Math.min(12, Number(old.villager999WatchedEpisodes || 0)),
    mushokuTenseiWatchedEpisodes: migrated ? 0 : Math.min(11, Number(old.mushokuTenseiWatchedEpisodes || 0)),
    mushokuTenseiPart2WatchedEpisodes: migrated ? 0 : Math.min(12, Number(old.mushokuTenseiPart2WatchedEpisodes || 0)),
    mushokuGuardianFitzWatchedEpisodes: migrated ? 0 : Math.min(1, Number(old.mushokuGuardianFitzWatchedEpisodes || 0)),
    mushokuSeason2WatchedEpisodes: migrated ? 0 : Math.min(12, Number(old.mushokuSeason2WatchedEpisodes || 0)),
    mushokuSeason2Part2WatchedEpisodes: migrated ? 0 : Math.min(12, Number(old.mushokuSeason2Part2WatchedEpisodes || 0)),
    mushokuSeason3WatchedEpisodes: migrated ? 0 : Math.min(14, Number(old.mushokuSeason3WatchedEpisodes || 0)),
    xp: migrated ? 0 : Number(old.xp || 0), animeDataVersion: DATA_VERSION,
    avatarPath: !old.avatarPath || old.avatarPath === 'lonermangalogo-v2.png' ? DEFAULT_AVATAR : old.avatarPath
  };
  currentProfile.xp = totalWatched(currentProfile) * XP_PER_EPISODE;
  currentProfile.level = levelFromXp(currentProfile.xp);
  await services.setDoc(ref, { ...currentProfile, updatedAt: services.serverTimestamp() }, { merge: true });
  renderAuth(); renderProgress(); renderProfile();
}

function renderAuth() {
  const area = $('#authArea'); if (!area) return;
  if (!currentUser) { area.innerHTML = '<button class="button ghost" data-open-auth>Entrar</button>'; return; }
  const xp = Number(currentProfile?.xp || 0), progress = levelProgress(xp);
  area.innerHTML = `<a class="header-profile" href="perfil.html"><img src="${escapeHtml(currentProfile?.avatarPath || DEFAULT_AVATAR)}" width="40" height="40" alt="Avatar de ${escapeHtml(currentProfile?.nick || 'usuário')}"><span class="header-profile-info"><span><strong>${escapeHtml(currentProfile?.nick || 'Perfil')}</strong><b>Level ${progress.level}</b></span><span class="header-xp-track"><i style="width:${progress.percent}%"></i></span><small>${progress.current.toLocaleString('pt-BR')} / ${progress.needed.toLocaleString('pt-BR')} XP</small></span></a>`;
}

function openAuth() { const modal = $('#authModal'); if (modal) { modal.hidden = false; modal.querySelector('input')?.focus(); } }
function closeAuth() { const modal = $('#authModal'); if (modal) modal.hidden = true; }
function setStatus(selector, message, type = '') { const el = $(selector); if (el) { el.textContent = message; el.className = `status ${type}`; } }

async function saveProgress(target) {
  if (!currentUser || !services) { openAuth(); setStatus('#progressStatus','Entre na sua conta para salvar seu progresso.'); return; }
  const watched = Math.max(0, Math.min(TOTAL_EPISODES, Number.parseInt(target, 10) || 0));
  const updatedProgress = Object.fromEntries(Object.values(PROGRESS_FIELDS).map(field => [field, field===progressField ? watched : Number(currentProfile?.[field]||0)]));
  const xp = Object.values(updatedProgress).reduce((sum,value)=>sum+value,0) * XP_PER_EPISODE;
  const pageXp = watched * XP_PER_EPISODE;
  const ref = services.doc(services.db, 'users', currentUser.uid);
  await services.setDoc(ref, { ...updatedProgress, xp, level: levelFromXp(xp), animeDataVersion: DATA_VERSION, updatedAt: services.serverTimestamp() }, { merge: true });
  currentProfile = { ...currentProfile, ...updatedProgress, xp, level: levelFromXp(xp) };
  renderProgress(); renderProfile(); renderAuth();
  setStatus('#progressStatus', `Progresso salvo: ${watched} episódios e ${pageXp.toLocaleString('pt-BR')} XP neste anime.`, 'ok');
}

function renderProgress() {
  const watched = Number(currentProfile?.[progressField] || 0);
  if ($('#watchedCount')) $('#watchedCount').textContent = watched;
  if ($('#xpTotal')) $('#xpTotal').textContent = `${(watched * XP_PER_EPISODE).toLocaleString('pt-BR')} XP`;
  if ($('#progressBar')) $('#progressBar').style.width = `${watched / TOTAL_EPISODES * 100}%`;
  document.querySelectorAll('.episode-item').forEach((item) => item.classList.toggle('watched', Number(item.dataset.episode) <= watched));
  if (currentUser) setStatus('#progressStatus', watched ? `Você chegou ao episódio ${watched}.` : 'Comece pelo episódio 1 e ganhe seus primeiros 22 XP.');
}

function buildEpisodes() {
  const grid = $('#episodeGrid'); if (!grid) return;
  grid.innerHTML = Array.from({length: TOTAL_EPISODES}, (_, index) => `<button class="episode-item" type="button" data-episode="${index + 1}">Episódio ${index + 1}</button>`).join('');
  renderProgress();
}

function renderVillagerCatalogCard() {
  const catalog = $('#animeCatalog');
  if (!catalog) return;
  const extraAnimes = [
    { search:'the villager of level 999 aldeao nivel 999', href:'the-villager-of-level-999.html', cover:'the-villager-of-level-999-500x750.jpg', title:'The Villager of Level 999', tag:'FANTASIA', episodes:12 },
    { search:'mushoku tensei jobless reincarnation isekai ittara honki dasu', href:'mushoku-tensei.html', cover:'mushoku-tensei-500x750.jpg', title:'Mushoku Tensei', tag:'ISEKAI', episodes:11 },
    { search:'kekkon yubiwa monogatari tales of wedding rings casamento aneis', href:'kekkon-yubiwa-monogatari.html', cover:'kekkon-yubiwa-monogatari-500x750.jpg', title:'Kekkon Yubiwa Monogatari', tag:'FANTASIA', episodes:25 }
  ];
  extraAnimes.forEach((anime) => {
    if (catalog.querySelector(`[data-anime-title="${anime.search}"]`)) return;
    const card = document.createElement('a');
    card.className = 'catalog-card';
    card.href = anime.href;
    card.dataset.animeTitle = anime.search;
    card.innerHTML = `<img src="${anime.cover}" width="500" height="750" alt="${escapeHtml(anime.title)}"><div><span class="tag">${anime.tag}</span><h2>${escapeHtml(anime.title)}</h2><p>${anime.episodes} episódios • 22 XP por episódio</p></div>`;
    catalog.append(card);
  });
}

function renderGeneratedAnimePage() {
  if (!document.body.dataset.generatedAnime) return;
  const anime = [...MY_HERO_SEQUENCE,...MUSHOKU_SEQUENCE,...KEKKON_YUBIWA_SEQUENCE].find(item=>item.key===PAGE_ANIME);
  const main = document.querySelector('main');
  if (!anime || !main) return;
  const sequence = PAGE_ANIME.startsWith('myHero') ? MY_HERO_SEQUENCE : PAGE_ANIME.startsWith('kekkon') ? KEKKON_YUBIWA_SEQUENCE : MUSHOKU_SEQUENCE;
  const currentIndex = sequence.findIndex(item => item.key === PAGE_ANIME);
  const previous = sequence[currentIndex - 1];
  main.innerHTML = `<section class="anime-detail-hero hero-academia"><div class="anime-detail-inner"><img src="${anime.cover}" width="500" height="750" alt="Capa de ${escapeHtml(anime.title)}"><div><a class="back-link" href="${previous?.href||'my-hero-academia.html'}">← Voltar para ${escapeHtml(previous?.title||'My Hero Academia')}</a><span class="eyebrow">${escapeHtml(anime.subtitle.toUpperCase())} • ${anime.year}</span><h1>${escapeHtml(anime.title)}</h1><p>${escapeHtml(anime.description)}</p><div class="detail-meta"><span><strong>${anime.episodes}</strong>${anime.episodes===1?'Episódio':'Episódios'}</span><span><strong>22 XP</strong>Por episódio</span><span><strong>${escapeHtml(anime.status)}</strong>Status</span></div><a class="button primary" href="#progresso">Continuar assistindo</a></div></div></section><section class="section episodes-section" id="progresso"><div class="section-heading"><div><span class="eyebrow">${escapeHtml(anime.title.toUpperCase())} • ${anime.episodes} ${anime.episodes===1?'EPISÓDIO':'EPISÓDIOS'}</span><h2>Seu progresso</h2></div><div class="xp-pill"><strong id="xpTotal">0 XP</strong><small>22 XP por episódio</small></div></div><div class="progress-card"><div class="progress-summary"><div class="episode-number"><strong id="watchedCount">0</strong><span>/ ${anime.episodes} assistidos</span></div><div class="progress-track"><span id="progressBar"></span></div></div><div class="progress-actions"><button class="plus-button" id="addEpisode" type="button">+</button><label for="episodeInput">Ou digite até qual episódio assistiu</label><div class="episode-input"><input id="episodeInput" type="number" min="0" max="${anime.episodes}" placeholder="Ex.: ${Math.min(5,anime.episodes)}"><kbd>Enter</kbd></div></div><p class="status" id="progressStatus">Entre na sua conta para salvar seu progresso.</p></div></section>`;
  if (!$('#authModal')) document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="authModal" hidden><div class="modal-card"><button class="modal-close" type="button" data-close-auth>×</button><h2 id="authTitle">Bem-vindo</h2><p>Entre para salvar episódios e ganhar XP.</p><form id="loginForm"><label>E-mail<input name="email" type="email" required></label><label>Senha<input name="password" type="password" minlength="6" required></label><button class="button primary">Entrar</button></form><form id="registerForm" hidden><label>E-mail<input name="email" type="email" required></label><label>Senha<input name="password" type="password" minlength="6" required></label><label>Confirmar senha<input name="confirm" type="password" minlength="6" required></label><button class="button primary">Criar conta</button></form><button class="button google" id="googleLogin" type="button">Continuar com Google</button><button class="text-button" id="toggleAuth" type="button">Ainda não tenho conta</button><p class="status" id="authStatus"></p></div></div>`);
}

function renderWatchOnline() {
  const option = WATCH_OPTIONS[PAGE_ANIME];
  const heroActions = document.querySelector('.anime-detail-inner > div');
  if (!option || !heroActions || heroActions.querySelector('[data-open-watch]')) return;
  const button = document.createElement('button');
  button.className = 'button watch-button';
  button.type = 'button';
  button.dataset.openWatch = '';
  button.innerHTML = '<span aria-hidden="true">▶</span> Onde assistir';
  heroActions.append(button);
}

function renderAnimeTimeline() {
  const sequence = PAGE_ANIME.startsWith('mushoku') ? MUSHOKU_SEQUENCE : PAGE_ANIME.startsWith('myHero') ? MY_HERO_SEQUENCE : PAGE_ANIME.startsWith('kekkon') ? KEKKON_YUBIWA_SEQUENCE : null;
  if (!sequence) return;
  document.querySelector('.sequence-section')?.remove();
  const progressSection = $('#progresso');
  if (!progressSection) return;
  const currentIndex = sequence.findIndex(anime => anime.key === PAGE_ANIME);
  const franchiseTitle = sequence===MUSHOKU_SEQUENCE ? 'Mushoku Tensei' : sequence===MY_HERO_SEQUENCE ? 'My Hero Academia' : 'Kekkon Yubiwa Monogatari';
  const section = document.createElement('section');
  section.className = 'section sequence-section';
  section.innerHTML = `<div class="section-heading"><div><span class="eyebrow">ORDEM PARA ASSISTIR</span><h2>Jornada de ${franchiseTitle}</h2><p class="sequence-intro">Siga a história na ordem. A etapa aberta está destacada.</p></div></div><div class="sequence-timeline">${sequence.map((anime,index) => `<a class="sequence-step${index===currentIndex?' current':''}" href="${anime.href}"${index===currentIndex?' aria-current="page"':''}><span class="sequence-order">${index+1}</span><img src="${anime.cover}" width="500" height="750" alt="${escapeHtml(anime.title)}"><div><span class="sequence-subtitle">${escapeHtml(anime.subtitle)}</span><h3>${escapeHtml(anime.title)}</h3><small>${anime.episodes} ${anime.episodes===1?'episódio':'episódios'} • 22 XP por episódio</small>${index===currentIndex?'<strong>VOCÊ ESTÁ AQUI</strong>':index<currentIndex?'<b>← Etapa anterior</b>':'<b>Próxima sequência →</b>'}</div></a>`).join('')}</div>`;
  progressSection.insertAdjacentElement('afterend', section);
}

function openWatchOnline() {
  const option = WATCH_OPTIONS[PAGE_ANIME];
  if (!option) return;
  document.querySelector('#watchModal')?.remove();
  const modal = document.createElement('div');
  modal.className = 'modal watch-modal';
  modal.id = 'watchModal';
  modal.innerHTML = `<section class="modal-card watch-modal-card" role="dialog" aria-modal="true" aria-labelledby="watchTitle"><button class="modal-close" type="button" data-close-watch aria-label="Fechar">×</button><span class="eyebrow">ONDE ASSISTIR ONLINE</span><h2 id="watchTitle">${escapeHtml(option.title)}</h2><p>Escolha a plataforma oficial para começar a assistir.</p><a class="watch-platform" href="${escapeHtml(option.url)}" target="_blank" rel="noopener noreferrer"><span class="watch-platform-icon">C</span><span><strong>${escapeHtml(option.platform)}</strong><small>Abre em uma nova janela e mantém o Animes Loner aberto</small></span><b>Assistir agora ↗</b></a></section>`;
  document.body.append(modal);
}

renderGeneratedAnimePage();
renderVillagerCatalogCard();
renderWatchOnline();
renderAnimeTimeline();

async function renderRanking() {
  const list = $('#rankingList'); if (!list || !services) return;
  try {
    const snapshot = await services.getDocs(services.collection(services.db, 'users'));
    const users = snapshot.docs.map(d => ({...d.data(), uid:d.id})).filter(u => u.animeDataVersion === DATA_VERSION).sort((a,b) => Number(b.xp||0)-Number(a.xp||0)).slice(0,100);
    rankingUsersByUid = new Map(users.map(user => [user.uid, user]));
    if (document.body.dataset.ranking === 'animes') {
      const animeRanking = [
        { title:'Naruto', href:'naruto.html', cover:'naruto-500x750.jpg', points:users.filter(u=>Number(u.watchedEpisodes||0)>=1).length, total:220 },
        { title:'My Hero Academia', href:'my-hero-academia.html', cover:'my-hero-academia-500x750.jpg', points:users.filter(u=>myHeroWatched(u)>=1).length, total:171 }
        ,{ title:'The Villager of Level 999', href:'the-villager-of-level-999.html', cover:'the-villager-of-level-999-500x750.jpg', points:users.filter(u=>Number(u.villager999WatchedEpisodes||0)>=1).length, total:12 }
        ,{ title:'Mushoku Tensei', href:'mushoku-tensei.html', cover:'mushoku-tensei-500x750.jpg', points:users.filter(u=>mushokuWatched(u)>=1).length, total:62 }
        ,{ title:'Kekkon Yubiwa Monogatari', href:'kekkon-yubiwa-monogatari.html', cover:'kekkon-yubiwa-monogatari-500x750.jpg', points:users.filter(u=>kekkonYubiwaWatched(u)>=1).length, total:25 }
      ].sort((a,b)=>b.points-a.points || a.title.localeCompare(b.title));
      list.classList.add('anime-ranking-grid');
      list.innerHTML = animeRanking.map((anime,i)=>`<a class="anime-ranking-card" href="${anime.href}"><div class="anime-ranking-cover"><img src="${anime.cover}" width="500" height="750" alt="${escapeHtml(anime.title)}"><span>#${i+1}</span></div><div class="anime-ranking-info"><span class="tag">${i===0?'MAIS ADICIONADO':'EM DESTAQUE'}</span><h2>${escapeHtml(anime.title)}</h2><p>${anime.total} episódios disponíveis</p><strong>${anime.points.toLocaleString('pt-BR')} <small>${anime.points===1?'ponto':'pontos'} • usuários que começaram</small></strong></div></a>`).join('');
      return;
    }
    list.innerHTML = users.length ? users.map((u,i) => `<button class="rank-row user-rank-row" type="button" data-public-profile="${escapeHtml(u.uid)}"><span class="rank-position">#${i+1}</span><img src="${escapeHtml(u.avatarPath || DEFAULT_AVATAR)}" width="52" height="52" alt="Avatar de ${escapeHtml(u.nick || 'Ninja Loner')}"><div><strong>${escapeHtml(u.nick || 'Ninja Loner')}</strong><small>Level ${levelFromXp(u.xp)} • ${totalWatched(u)} episódios assistidos</small></div><b>${Number(u.xp||0).toLocaleString('pt-BR')} XP</b></button>`).join('') : '<p>Ainda não há ninjas no ranking de usuários.</p>';
  } catch { list.innerHTML = '<p>Não foi possível carregar o ranking agora.</p>'; }
}

function renderProfile() {
  const content = $('#profileContent'); if (!content) return;
  if (!currentUser) { content.innerHTML = '<p>Entre na sua conta para ver seu perfil.</p><a class="button primary" href="index.html">Entrar</a>'; return; }
  const watched = totalWatched(currentProfile), xp = watched * XP_PER_EPISODE;
  const progress = levelProgress(xp);
  content.innerHTML = `<div class="profile-identity"><img src="${escapeHtml(currentProfile.avatarPath || DEFAULT_AVATAR)}" width="110" height="110" alt="Avatar de ${escapeHtml(currentProfile.nick)}"><div><h2>${escapeHtml(currentProfile.nick)}</h2><p>${escapeHtml(currentProfile.email)}</p><span class="profile-level">Level ${progress.level}</span></div></div><section class="profile-xp"><div><strong>Progresso para o level ${progress.level + 1}</strong><span>${progress.current.toLocaleString('pt-BR')} / ${progress.needed.toLocaleString('pt-BR')} XP</span></div><span class="profile-xp-track"><i style="width:${progress.percent}%"></i></span><small>Faltam ${(progress.needed - progress.current).toLocaleString('pt-BR')} XP para avançar.</small></section><div class="profile-stats"><div><small>Episódios assistidos</small><strong>${watched}</strong></div><div><small>XP total</small><strong>${xp.toLocaleString('pt-BR')}</strong></div><div><small>Level</small><strong>${progress.level}</strong></div></div><section class="profile-animes"><h3>Animes adicionados</h3>${profileAnimeCards(currentProfile)}</section><button class="button ghost profile-logout" id="logout" type="button">Sair da conta</button>`;
}

function profileAnimeCards(profile = {}) {
  const animes = [
    {title:'Naruto',href:'naruto.html',cover:'naruto-500x750.jpg',watched:Number(profile.watchedEpisodes||0),total:220},
    {title:'My Hero Academia',href:'my-hero-academia.html',cover:'my-hero-academia-500x750.jpg',watched:myHeroWatched(profile),total:171},
    {title:'The Villager of Level 999',href:'the-villager-of-level-999.html',cover:'the-villager-of-level-999-500x750.jpg',watched:Number(profile.villager999WatchedEpisodes||0),total:12},
    {title:'Mushoku Tensei',href:'mushoku-tensei.html',cover:'mushoku-tensei-500x750.jpg',watched:mushokuWatched(profile),total:62},
    {title:'Kekkon Yubiwa Monogatari',href:'kekkon-yubiwa-monogatari.html',cover:'kekkon-yubiwa-monogatari-500x750.jpg',watched:kekkonYubiwaWatched(profile),total:25}
  ].filter(anime => anime.watched > 0);
  if (!animes.length) return '<p class="empty-animes">Este usuário ainda não adicionou nenhum anime.</p>';
  return `<div class="profile-anime-grid">${animes.map(anime=>`<a href="${anime.href}" class="profile-anime-card"><img src="${anime.cover}" width="90" height="135" alt="${escapeHtml(anime.title)}"><div><strong>${escapeHtml(anime.title)}</strong><span>Episódio ${anime.watched} de ${anime.total}</span><span class="mini-progress"><i style="width:${anime.watched/anime.total*100}%"></i></span><small>${(anime.watched*XP_PER_EPISODE).toLocaleString('pt-BR')} XP</small></div></a>`).join('')}</div>`;
}

function openPublicProfile(uid) {
  const profile = rankingUsersByUid.get(uid); if (!profile) return;
  document.querySelector('#publicProfileModal')?.remove();
  const progress = levelProgress(Number(profile.xp||0));
  const watched = totalWatched(profile);
  const modal = document.createElement('div'); modal.className='modal public-profile-modal'; modal.id='publicProfileModal';
  modal.innerHTML = `<section class="modal-card public-profile-card" role="dialog" aria-modal="true" aria-labelledby="publicProfileTitle"><button class="modal-close" type="button" data-close-public-profile aria-label="Fechar">×</button><div class="profile-identity"><img src="${escapeHtml(profile.avatarPath||DEFAULT_AVATAR)}" width="110" height="110" alt="Avatar de ${escapeHtml(profile.nick||'Ninja Loner')}"><div><span class="eyebrow">PERFIL DO USUÁRIO</span><h2 id="publicProfileTitle">${escapeHtml(profile.nick||'Ninja Loner')}</h2><span class="profile-level">Level ${progress.level}</span></div></div><section class="profile-xp"><div><strong>Progresso de level</strong><span>${progress.current.toLocaleString('pt-BR')} / ${progress.needed.toLocaleString('pt-BR')} XP</span></div><span class="profile-xp-track"><i style="width:${progress.percent}%"></i></span></section><div class="profile-stats"><div><small>Episódios</small><strong>${watched}</strong></div><div><small>XP total</small><strong>${Number(profile.xp||0).toLocaleString('pt-BR')}</strong></div><div><small>Level</small><strong>${progress.level}</strong></div></div><section class="profile-animes"><h3>Animes adicionados</h3>${profileAnimeCards(profile)}</section></section>`;
  document.body.append(modal);
}

document.addEventListener('click', async (event) => {
  if (event.target.closest('[data-open-auth]')) openAuth();
  if (event.target.closest('[data-close-auth]') || event.target.id === 'authModal') closeAuth();
  if (event.target.closest('#logout')) await services?.signOut(services.auth);
  if (event.target.closest('#addEpisode')) await saveProgress(Number(currentProfile?.[progressField] || 0) + 1);
  const episode = event.target.closest('.episode-item'); if (episode) await saveProgress(episode.dataset.episode);
  const publicProfile = event.target.closest('[data-public-profile]'); if (publicProfile) openPublicProfile(publicProfile.dataset.publicProfile);
  if (event.target.closest('[data-close-public-profile]') || event.target.id === 'publicProfileModal') document.querySelector('#publicProfileModal')?.remove();
  if (event.target.closest('[data-open-watch]')) openWatchOnline();
  if (event.target.closest('[data-close-watch]') || event.target.id === 'watchModal') document.querySelector('#watchModal')?.remove();
});

$('#episodeInput')?.addEventListener('keydown', async (event) => { if (event.key === 'Enter') { event.preventDefault(); await saveProgress(event.currentTarget.value); } });
$('#episodeSearch')?.addEventListener('input', (event) => { const query = event.currentTarget.value.trim(); document.querySelectorAll('.episode-item').forEach(item => item.hidden = query && !item.dataset.episode.includes(query)); });
$('#animeSearch')?.addEventListener('input', (event) => { const query = event.currentTarget.value.trim().toLowerCase(); let visible = 0; document.querySelectorAll('[data-anime-title]').forEach(card => { card.hidden = query && !card.dataset.animeTitle.includes(query); if (!card.hidden) visible += 1; }); if ($('#catalogEmpty')) $('#catalogEmpty').hidden = visible > 0; });
$('#toggleAuth')?.addEventListener('click', () => { const login=$('#loginForm'), register=$('#registerForm'), registering=register.hidden; login.hidden=registering; register.hidden=!registering; $('#authTitle').textContent=registering?'Criar conta':'Bem-vindo'; $('#toggleAuth').textContent=registering?'Já tenho uma conta':'Ainda não tenho conta'; });
$('#loginForm')?.addEventListener('submit', async (event) => { event.preventDefault(); const data=new FormData(event.currentTarget); try { setStatus('#authStatus','Entrando...'); await services.signInWithEmailAndPassword(services.auth,data.get('email'),data.get('password')); closeAuth(); } catch(error) { setStatus('#authStatus',friendlyError(error),'error'); } });
$('#registerForm')?.addEventListener('submit', async (event) => { event.preventDefault(); const data=new FormData(event.currentTarget); if(data.get('password')!==data.get('confirm')) return setStatus('#authStatus','As senhas não coincidem.','error'); try { setStatus('#authStatus','Criando conta...'); await services.createUserWithEmailAndPassword(services.auth,data.get('email'),data.get('password')); closeAuth(); } catch(error) { setStatus('#authStatus',friendlyError(error),'error'); } });
$('#googleLogin')?.addEventListener('click', async () => { try { await services.signInWithPopup(services.auth,new services.GoogleAuthProvider()); closeAuth(); } catch(error) { setStatus('#authStatus',friendlyError(error),'error'); } });

buildEpisodes(); renderAuth(); renderProfile(); initFirebase().then(renderRanking).catch(() => setStatus('#authStatus','Firebase indisponível no momento.','error'));
