const RARITIES = {
  common: { label:'Comum', value:5, className:'common' },
  rare: { label:'Rara', value:15, className:'rare' },
  shiny: { label:'Brilhante Lendária', value:50, className:'shiny' }
};
const CHARACTERS = [
  { id:'adam-warlock', name:'Adam Warlock', image:'loner-assets/cards/Adam Warlock.png' },
  { id:'arcangel', name:'Arcangel', image:'loner-assets/cards/Arcangel.png' },
  { id:'cable', name:'Cable', image:'loner-assets/cards/Cable.png' },
  { id:'coisa', name:'Coisa', image:'loner-assets/cards/Coisa.png' },
  { id:'cyclops', name:'Cyclops', image:'loner-assets/cards/cyclops.png' },
  { id:'dr-doom', name:'Dr. Doom', image:'loner-assets/cards/Dr. Doom.png' },
  { id:'fenix-negra', name:'Fênix Negra', image:'loner-assets/cards/fenix-negra.png' },
  { id:'fera', name:'Fera', image:'loner-assets/cards/Fera.png' },
  { id:'gambit', name:'Gambit', image:'loner-assets/cards/Gambit.png' },
  { id:'gaviao-arqueiro', name:'Gavião Arqueiro', image:'loner-assets/cards/Gavião Arqueiro.png' },
  { id:'homem-aranha', name:'Homem-Aranha', image:'loner-assets/cards/Homem Aranha.png' },
  { id:'homem-formiga', name:'Homem-Formiga', image:'loner-assets/cards/Homem Formiga.png' },
  { id:'hulk', name:'Hulk', image:'loner-assets/cards/Hulk.png' },
  { id:'iceman', name:'Iceman', image:'loner-assets/cards/Iceman.png' },
  { id:'magneto', name:'Magneto', image:'loner-assets/cards/Magneto.png' },
  { id:'mercury', name:'Mercury', image:'loner-assets/cards/Mercury.png' },
  { id:'noturno', name:'Noturno', image:'loner-assets/cards/Noturno.png' },
  { id:'omega-red', name:'Omega Red', image:'loner-assets/cards/Omega Red.png' },
  { id:'professor-x', name:'Professor X', image:'loner-assets/cards/Professor X.png' },
  { id:'raven', name:'Raven', image:'loner-assets/cards/Raven.png' },
  { id:'scarlet', name:'Scarlet', image:'loner-assets/cards/Scarlet.png' },
  { id:'tempestade', name:'Tempestade', image:'loner-assets/cards/Tempestade.png' },
  { id:'tocha-humana', name:'Tocha Humana', image:'loner-assets/cards/Tocha Humana.png' }
];
const DEFAULT_STATE = { lm:200, freeHour:'', premiumHour:'', premiumBought:0, collection:{}, album:{} };
let playerId = 'guest';
let state = loadState();
let albumSpread = 0;

const $ = selector => document.querySelector(selector);
const storageKey = () => `animes-loner-game-v1:${playerId}`;
function loadState() { try { const raw=JSON.parse(localStorage.getItem(storageKey())||'{}'),saved={...DEFAULT_STATE,...raw}; saved.collection=saved.collection||{}; saved.album=saved.album||{}; if(!Object.prototype.hasOwnProperty.call(raw,'album'))Object.keys(saved.collection).forEach(id=>{if(saved.collection[id]>0)saved.album[id]=true;}); return saved; } catch { return {...DEFAULT_STATE,collection:{},album:{}}; } }
function saveState() { localStorage.setItem(storageKey(),JSON.stringify(state)); }
function brasiliaParts(date=new Date()) { return Object.fromEntries(new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value])); }
function hourKey() { const p=brasiliaParts(); return `${p.year}-${p.month}-${p.day}-${p.hour}`; }
function syncHour() { const key=hourKey(); if(state.premiumHour!==key){state.premiumHour=key;state.premiumBought=0;} saveState(); }
function chooseRarity(premium=false) { const roll=Math.random()*100; return roll<(premium?10:5)?'shiny':roll<(premium?45:30)?'rare':'common'; }
function drawCards(amount,premium=false) { return Array.from({length:amount},()=>{const character=CHARACTERS[Math.floor(Math.random()*CHARACTERS.length)];const rarity=chooseRarity(premium);const id=`${character.id}-${rarity}`;state.collection[id]=(state.collection[id]||0)+1;return {...character,...RARITIES[rarity],rarity,id};}); }
function cardMarkup(card,count=0,reveal=false,inventory=false) { return `<article class="sticker ${card.className}${reveal?' revealed':''}${inventory?' inventory-sticker':''}"><div class="sticker-shine"></div><span class="rarity-name">${card.label}</span><img src="${card.image}" alt="${card.name} — ${card.label}"><div class="sticker-info"><strong>${card.name}</strong><span>${card.label}</span><small>Valor ${card.value} LM</small>${inventory?`<button class="sell-sticker" type="button" data-sell-card="${card.id}">Vender 1 por ${card.value} LM</button>`:''}</div>${count?`<b class="card-count">×${count}</b>`:''}</article>`; }
function allCards() { return CHARACTERS.flatMap(character=>Object.entries(RARITIES).map(([rarity,data])=>({...character,...data,rarity,id:`${character.id}-${rarity}`}))); }
function albumSlotMarkup(card) {
  if(!card)return '<div class="album-slot album-slot-blank"></div>';
  if(state.album[card.id])return `<div class="album-slot pasted">${cardMarkup(card)}</div>`;
  const available=state.collection[card.id]||0;
  return `<article class="album-slot waiting ${available?'available':''}"><span class="slot-number">${card.id}</span><div class="slot-mark">${available?'✓':'?'}</div><strong>${card.name}</strong><small>${card.label}</small>${available?`<button type="button" data-paste-card="${card.id}">Colar figurinha</button>`:'<em>Não encontrada</em>'}</article>`;
}
function renderAlbum(cards) {
  const perPage=3,perSpread=perPage*2,totalPages=Math.ceil(cards.length/perPage),totalSpreads=Math.ceil(totalPages/2);
  albumSpread=Math.min(albumSpread,totalSpreads-1);
  const start=albumSpread*perSpread,left=cards.slice(start,start+perPage),right=cards.slice(start+perPage,start+perSpread);
  while(left.length<perPage)left.push(null);
  while(right.length<perPage)right.push(null);
  $('#leftAlbumPage').innerHTML=left.map(albumSlotMarkup).join('');
  $('#rightAlbumPage').innerHTML=right.map(albumSlotMarkup).join('');
  const leftNumber=albumSpread*2+1,rightNumber=Math.min(leftNumber+1,totalPages);
  $('#leftPageLabel').textContent=`Página ${leftNumber}`;
  $('#rightPageLabel').textContent=`Página ${rightNumber}`;
  $('#albumPageIndicator').textContent=`Páginas ${leftNumber}–${rightNumber} de ${totalPages}`;
  $('#previousAlbumPage').disabled=albumSpread===0;
  $('#nextAlbumPage').disabled=albumSpread>=totalSpreads-1;
}
function renderCollection() {
  const cards=allCards();
  const inventoryCards=cards.filter(card=>(state.collection[card.id]||0)>0);
  const albumCards=cards.filter(card=>state.album[card.id]);
  $('#inventoryGrid').innerHTML=inventoryCards.map(card=>cardMarkup(card,state.collection[card.id],false,true)).join('');
  $('#inventoryEmpty').hidden=inventoryCards.length>0;
  renderAlbum(cards);
  $('#inventoryUnits').textContent=cards.reduce((sum,card)=>sum+(state.collection[card.id]||0),0);
  $('#uniqueCount').textContent=albumCards.length;
  $('#totalStyles').textContent=cards.length;
  $('#collectionValue').textContent=`${cards.reduce((sum,card)=>sum+(state.collection[card.id]||0)*card.value,0)} LM`;
  $('#albumProgress').style.width=`${(albumCards.length/cards.length)*100}%`;
}
function pasteCard(cardId) {
  if(state.album[cardId]||(state.collection[cardId]||0)<1)return;
  state.collection[cardId]-=1;
  if(state.collection[cardId]===0)delete state.collection[cardId];
  state.album[cardId]=true;
  saveState();
  render();
}
function turnAlbum(direction) {
  const cards=allCards(),totalSpreads=Math.ceil(Math.ceil(cards.length/3)/2),next=albumSpread+direction;
  if(next<0||next>=totalSpreads)return;
  const book=$('#albumBook');
  book.classList.add(direction>0?'turning-next':'turning-previous');
  setTimeout(()=>{albumSpread=next;renderAlbum(cards);book.classList.remove('turning-next','turning-previous');},220);
}
function sellCard(cardId) {
  const card=allCards().find(item=>item.id===cardId);
  if(!card||(state.collection[cardId]||0)<1)return;
  state.collection[cardId]-=1;
  if(state.collection[cardId]===0)delete state.collection[cardId];
  state.lm+=card.value;
  saveState();
  render();
}
function render() { syncHour(); const key=hourKey(),freeAvailable=state.freeHour!==key,premiumLeft=3-state.premiumBought; $('#lmBalance').textContent=state.lm; $('#openFreePack').disabled=!freeAvailable; $('#openFreePack').textContent=freeAvailable?'Abrir grátis':'Já coletado'; $('#freePackStatus').textContent=freeAvailable?'Disponível agora':'Volta na próxima hora'; $('#openPremiumPack').disabled=premiumLeft<=0||state.lm<20; $('#premiumPackStatus').textContent=`${premiumLeft} ${premiumLeft===1?'compra disponível':'compras disponíveis'} nesta hora`; $('#resetNotice').classList.toggle('available',freeAvailable); $('#resetNotice strong').textContent=freeAvailable?'Pacote grátis disponível!':'Pacote grátis já coletado'; renderCollection(); }
function openPack(type) { syncHour(); const key=hourKey(),premium=type==='premium'; if(!premium&&state.freeHour===key)return; if(premium&&(state.premiumBought>=3||state.lm<20))return; if(premium){state.lm-=20;state.premiumBought+=1;}else state.freeHour=key; const cards=drawCards(premium?5:3,premium);saveState();render();$('#revealGrid').innerHTML=cards.map(card=>cardMarkup(card,0,true)).join('');$('#packOpening').hidden=false; }
function updateClock(){const p=brasiliaParts();const remaining=(59-Number(p.minute))*60+(60-Number(p.second));const mm=String(Math.floor(remaining/60)).padStart(2,'0'),ss=String(remaining%60).padStart(2,'0');$('#resetTimer').textContent=`Próximo reset em ${mm}:${ss}`;$('#brasiliaClock').textContent=`Brasília · ${p.hour}:${p.minute}:${p.second}`;if(remaining>=3598)render();}

$('#openFreePack').addEventListener('click',()=>openPack('free'));
$('#openPremiumPack').addEventListener('click',()=>openPack('premium'));
$('#closePack').addEventListener('click',()=>{$('#packOpening').hidden=true;});
document.addEventListener('click',event=>{
  const tab=event.target.closest('[data-game-tab]');
  if(tab){
    document.querySelectorAll('[data-game-tab]').forEach(button=>button.classList.toggle('active',button===tab));
    document.querySelectorAll('[data-game-panel]').forEach(panel=>{panel.hidden=panel.dataset.gamePanel!==tab.dataset.gameTab;});
  }
  const sellButton=event.target.closest('[data-sell-card]');
  if(sellButton)sellCard(sellButton.dataset.sellCard);
  const pasteButton=event.target.closest('[data-paste-card]');
  if(pasteButton)pasteCard(pasteButton.dataset.pasteCard);
});
$('#previousAlbumPage').addEventListener('click',()=>turnAlbum(-1));
$('#nextAlbumPage').addEventListener('click',()=>turnAlbum(1));
document.addEventListener('loner-auth-changed',event=>{playerId=event.detail?.uid||'guest';state=loadState();render();});
render();updateClock();setInterval(updateClock,1000);
