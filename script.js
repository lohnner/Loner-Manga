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
const PROGRESS_FIELDS = { naruto: 'watchedEpisodes', myHeroAcademia: 'myHeroWatchedEpisodes', villager999: 'villager999WatchedEpisodes' };
const progressField = PROGRESS_FIELDS[PAGE_ANIME] || 'watchedEpisodes';
const XP_PER_EPISODE = 22;
const DATA_VERSION = 1;
const DEFAULT_AVATAR = 'Avatar/naruto-default-500x500.jpg';
const WATCH_OPTIONS = {
  naruto: { title: 'Naruto', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-pt/series/GY9PJ5KWR/naruto' },
  myHeroAcademia: { title: 'My Hero Academia', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/G6NQ5DWZ6/my-hero-academia' },
  villager999: { title: 'The Villager of Level 999', platform: 'Crunchyroll', url: 'https://www.crunchyroll.com/pt-br/series/GT00371878/the-villager-of-level-999' }
};
let services = null;
let currentUser = null;
let currentProfile = null;
let rankingUsersByUid = new Map();

const $ = (selector) => document.querySelector(selector);
const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
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
  nav.innerHTML = `<a class="${page === 'index.html' ? 'active' : ''}" href="index.html">HOME</a><a class="${['animes.html','naruto.html','my-hero-academia.html','the-villager-of-level-999.html'].includes(page) ? 'active' : ''}" href="animes.html">ANIMES</a><span class="nav-dropdown"><a class="${['ranking.html','ranking-animes.html'].includes(page) ? 'active' : ''}" href="ranking.html" aria-haspopup="true">RANKING</a><span class="nav-dropdown-menu"><a href="ranking-animes.html">Ranking de Animes</a><a href="ranking.html">Ranking de Usuários</a></span></span>`;
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
  currentProfile = {
    ...old, uid: user.uid, email: user.email || old.email || '',
    nick: old.nick || user.displayName || (user.email || 'Ninja').split('@')[0],
    watchedEpisodes: migrated ? 0 : Math.min(220, Number(old.watchedEpisodes || 0)),
    myHeroWatchedEpisodes: migrated ? 0 : Math.min(170, Number(old.myHeroWatchedEpisodes || 0)),
    villager999WatchedEpisodes: migrated ? 0 : Math.min(12, Number(old.villager999WatchedEpisodes || 0)),
    xp: migrated ? 0 : Number(old.xp || 0), animeDataVersion: DATA_VERSION,
    avatarPath: !old.avatarPath || old.avatarPath === 'lonermangalogo-v2.png' ? DEFAULT_AVATAR : old.avatarPath
  };
  currentProfile.xp = (currentProfile.watchedEpisodes + currentProfile.myHeroWatchedEpisodes + currentProfile.villager999WatchedEpisodes) * XP_PER_EPISODE;
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
  const narutoWatched = progressField === 'watchedEpisodes' ? watched : Number(currentProfile.watchedEpisodes || 0);
  const myHeroWatched = progressField === 'myHeroWatchedEpisodes' ? watched : Number(currentProfile.myHeroWatchedEpisodes || 0);
  const villagerWatched = progressField === 'villager999WatchedEpisodes' ? watched : Number(currentProfile.villager999WatchedEpisodes || 0);
  const xp = (narutoWatched + myHeroWatched + villagerWatched) * XP_PER_EPISODE;
  const pageXp = watched * XP_PER_EPISODE;
  const ref = services.doc(services.db, 'users', currentUser.uid);
  await services.setDoc(ref, { watchedEpisodes: narutoWatched, myHeroWatchedEpisodes: myHeroWatched, villager999WatchedEpisodes: villagerWatched, [progressField]: watched, xp, level: levelFromXp(xp), animeDataVersion: DATA_VERSION, updatedAt: services.serverTimestamp() }, { merge: true });
  currentProfile = { ...currentProfile, watchedEpisodes: narutoWatched, myHeroWatchedEpisodes: myHeroWatched, villager999WatchedEpisodes: villagerWatched, [progressField]: watched, xp, level: levelFromXp(xp) };
  renderProgress(); renderProfile();
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
  if (!catalog || catalog.querySelector('[data-anime-title="the villager of level 999"]')) return;
  const card = document.createElement('a');
  card.className = 'anime-card';
  card.href = 'the-villager-of-level-999.html';
  card.dataset.animeTitle = 'the villager of level 999 aldeao nivel 999';
  card.innerHTML = `<div class="anime-cover"><img src="the-villager-of-level-999-500x750.jpg" width="500" height="750" alt="The Villager of Level 999"><span class="anime-badge">12 EPISÓDIOS</span></div><div class="anime-info"><span class="eyebrow">FANTASIA • 2026</span><h2>The Villager of Level 999</h2><p>Koji Kagami é um aldeão de nível 999 que busca um mundo onde humanos e demônios possam viver juntos.</p><strong>Ver página do anime →</strong></div>`;
  catalog.append(card);
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

renderVillagerCatalogCard();
renderWatchOnline();

async function renderRanking() {
  const list = $('#rankingList'); if (!list || !services) return;
  try {
    const snapshot = await services.getDocs(services.collection(services.db, 'users'));
    const users = snapshot.docs.map(d => ({...d.data(), uid:d.id})).filter(u => u.animeDataVersion === DATA_VERSION).sort((a,b) => Number(b.xp||0)-Number(a.xp||0)).slice(0,100);
    rankingUsersByUid = new Map(users.map(user => [user.uid, user]));
    if (document.body.dataset.ranking === 'animes') {
      const animeRanking = [
        { title:'Naruto', href:'naruto.html', cover:'naruto-500x750.jpg', points:users.filter(u=>Number(u.watchedEpisodes||0)>=1).length, total:220 },
        { title:'My Hero Academia', href:'my-hero-academia.html', cover:'my-hero-academia-500x750.jpg', points:users.filter(u=>Number(u.myHeroWatchedEpisodes||0)>=1).length, total:170 }
        ,{ title:'The Villager of Level 999', href:'the-villager-of-level-999.html', cover:'the-villager-of-level-999-500x750.jpg', points:users.filter(u=>Number(u.villager999WatchedEpisodes||0)>=1).length, total:12 }
      ].sort((a,b)=>b.points-a.points || a.title.localeCompare(b.title));
      list.classList.add('anime-ranking-grid');
      list.innerHTML = animeRanking.map((anime,i)=>`<a class="anime-ranking-card" href="${anime.href}"><div class="anime-ranking-cover"><img src="${anime.cover}" width="500" height="750" alt="${escapeHtml(anime.title)}"><span>#${i+1}</span></div><div class="anime-ranking-info"><span class="tag">${i===0?'MAIS ADICIONADO':'EM DESTAQUE'}</span><h2>${escapeHtml(anime.title)}</h2><p>${anime.total} episódios disponíveis</p><strong>${anime.points.toLocaleString('pt-BR')} <small>${anime.points===1?'ponto':'pontos'} • usuários que começaram</small></strong></div></a>`).join('');
      return;
    }
    list.innerHTML = users.length ? users.map((u,i) => `<button class="rank-row user-rank-row" type="button" data-public-profile="${escapeHtml(u.uid)}"><span class="rank-position">#${i+1}</span><img src="${escapeHtml(u.avatarPath || DEFAULT_AVATAR)}" width="52" height="52" alt="Avatar de ${escapeHtml(u.nick || 'Ninja Loner')}"><div><strong>${escapeHtml(u.nick || 'Ninja Loner')}</strong><small>Level ${levelFromXp(u.xp)} • ${Number(u.watchedEpisodes||0) + Number(u.myHeroWatchedEpisodes||0) + Number(u.villager999WatchedEpisodes||0)} episódios assistidos</small></div><b>${Number(u.xp||0).toLocaleString('pt-BR')} XP</b></button>`).join('') : '<p>Ainda não há ninjas no ranking de usuários.</p>';
  } catch { list.innerHTML = '<p>Não foi possível carregar o ranking agora.</p>'; }
}

function renderProfile() {
  const content = $('#profileContent'); if (!content) return;
  if (!currentUser) { content.innerHTML = '<p>Entre na sua conta para ver seu perfil.</p><a class="button primary" href="index.html">Entrar</a>'; return; }
  const naruto = Number(currentProfile?.watchedEpisodes || 0), myHero = Number(currentProfile?.myHeroWatchedEpisodes || 0), villager = Number(currentProfile?.villager999WatchedEpisodes || 0), watched = naruto + myHero + villager, xp = watched * XP_PER_EPISODE;
  const progress = levelProgress(xp);
  content.innerHTML = `<div class="profile-identity"><img src="${escapeHtml(currentProfile.avatarPath || DEFAULT_AVATAR)}" width="110" height="110" alt="Avatar de ${escapeHtml(currentProfile.nick)}"><div><h2>${escapeHtml(currentProfile.nick)}</h2><p>${escapeHtml(currentProfile.email)}</p><span class="profile-level">Level ${progress.level}</span></div></div><section class="profile-xp"><div><strong>Progresso para o level ${progress.level + 1}</strong><span>${progress.current.toLocaleString('pt-BR')} / ${progress.needed.toLocaleString('pt-BR')} XP</span></div><span class="profile-xp-track"><i style="width:${progress.percent}%"></i></span><small>Faltam ${(progress.needed - progress.current).toLocaleString('pt-BR')} XP para avançar.</small></section><div class="profile-stats"><div><small>Episódios assistidos</small><strong>${watched}</strong></div><div><small>XP total</small><strong>${xp.toLocaleString('pt-BR')}</strong></div><div><small>Level</small><strong>${progress.level}</strong></div></div><section class="profile-animes"><h3>Animes adicionados</h3>${profileAnimeCards(currentProfile)}</section><button class="button ghost profile-logout" id="logout" type="button">Sair da conta</button>`;
}

function profileAnimeCards(profile = {}) {
  const animes = [
    {title:'Naruto',href:'naruto.html',cover:'naruto-500x750.jpg',watched:Number(profile.watchedEpisodes||0),total:220},
    {title:'My Hero Academia',href:'my-hero-academia.html',cover:'my-hero-academia-500x750.jpg',watched:Number(profile.myHeroWatchedEpisodes||0),total:170},
    {title:'The Villager of Level 999',href:'the-villager-of-level-999.html',cover:'the-villager-of-level-999-500x750.jpg',watched:Number(profile.villager999WatchedEpisodes||0),total:12}
  ].filter(anime => anime.watched > 0);
  if (!animes.length) return '<p class="empty-animes">Este usuário ainda não adicionou nenhum anime.</p>';
  return `<div class="profile-anime-grid">${animes.map(anime=>`<a href="${anime.href}" class="profile-anime-card"><img src="${anime.cover}" width="90" height="135" alt="${escapeHtml(anime.title)}"><div><strong>${escapeHtml(anime.title)}</strong><span>Episódio ${anime.watched} de ${anime.total}</span><span class="mini-progress"><i style="width:${anime.watched/anime.total*100}%"></i></span><small>${(anime.watched*XP_PER_EPISODE).toLocaleString('pt-BR')} XP</small></div></a>`).join('')}</div>`;
}

function openPublicProfile(uid) {
  const profile = rankingUsersByUid.get(uid); if (!profile) return;
  document.querySelector('#publicProfileModal')?.remove();
  const progress = levelProgress(Number(profile.xp||0));
  const watched = Number(profile.watchedEpisodes||0) + Number(profile.myHeroWatchedEpisodes||0) + Number(profile.villager999WatchedEpisodes||0);
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
