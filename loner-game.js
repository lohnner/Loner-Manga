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
const DEFAULT_STATE = { lm:200, freeHour:'', premiumHour:'', premiumBought:0, collection:{} };
let playerId = 'guest';
let state = loadState();

const $ = selector => document.querySelector(selector);
const storageKey = () => `animes-loner-game-v1:${playerId}`;
function loadState() { try { return {...DEFAULT_STATE,...JSON.parse(localStorage.getItem(storageKey())||'{}')}; } catch { return {...DEFAULT_STATE}; } }
function saveState() { localStorage.setItem(storageKey(),JSON.stringify(state)); }
function brasiliaParts(date=new Date()) { return Object.fromEntries(new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value])); }
function hourKey() { const p=brasiliaParts(); return `${p.year}-${p.month}-${p.day}-${p.hour}`; }
function syncHour() { const key=hourKey(); if(state.premiumHour!==key){state.premiumHour=key;state.premiumBought=0;} saveState(); }
function chooseRarity(premium=false) { const roll=Math.random()*100; return roll<(premium?10:5)?'shiny':roll<(premium?45:30)?'rare':'common'; }
function drawCards(amount,premium=false) { return Array.from({length:amount},()=>{const character=CHARACTERS[Math.floor(Math.random()*CHARACTERS.length)];const rarity=chooseRarity(premium);const id=`${character.id}-${rarity}`;state.collection[id]=(state.collection[id]||0)+1;return {...character,...RARITIES[rarity],rarity,id};}); }
function cardMarkup(card,count=0,reveal=false) { return `<article class="sticker ${card.className}${reveal?' revealed':''}"><div class="sticker-shine"></div><span class="rarity-name">${card.label}</span><img src="${card.image}" alt="${card.name} — ${card.label}"><div class="sticker-info"><strong>${card.name}</strong><span>${card.label}</span><small>Valor ${card.value} LM</small></div>${count?`<b class="card-count">×${count}</b>`:''}</article>`; }
function allCards() { return CHARACTERS.flatMap(character=>Object.entries(RARITIES).map(([rarity,data])=>({...character,...data,rarity,id:`${character.id}-${rarity}`}))); }
function renderCollection() { const cards=allCards(); $('#stickerGrid').innerHTML=cards.map(card=>state.collection[card.id]?cardMarkup(card,state.collection[card.id]):`<article class="sticker locked ${card.className}"><div class="locked-symbol">?</div><strong>${card.name}</strong><span>${card.label}</span></article>`).join(''); const owned=cards.filter(c=>state.collection[c.id]); $('#uniqueCount').textContent=owned.length; $('#totalStyles').textContent=cards.length; $('#collectionValue').textContent=`${cards.reduce((sum,c)=>sum+(state.collection[c.id]||0)*c.value,0)} LM`; }
function render() { syncHour(); const key=hourKey(),freeAvailable=state.freeHour!==key,premiumLeft=3-state.premiumBought; $('#lmBalance').textContent=state.lm; $('#openFreePack').disabled=!freeAvailable; $('#openFreePack').textContent=freeAvailable?'Abrir grátis':'Já coletado'; $('#freePackStatus').textContent=freeAvailable?'Disponível agora':'Volta na próxima hora'; $('#openPremiumPack').disabled=premiumLeft<=0||state.lm<20; $('#premiumPackStatus').textContent=`${premiumLeft} ${premiumLeft===1?'compra disponível':'compras disponíveis'} nesta hora`; $('#resetNotice').classList.toggle('available',freeAvailable); $('#resetNotice strong').textContent=freeAvailable?'Pacote grátis disponível!':'Pacote grátis já coletado'; renderCollection(); }
function openPack(type) { syncHour(); const key=hourKey(),premium=type==='premium'; if(!premium&&state.freeHour===key)return; if(premium&&(state.premiumBought>=3||state.lm<20))return; if(premium){state.lm-=20;state.premiumBought+=1;}else state.freeHour=key; const cards=drawCards(premium?5:3,premium);saveState();render();$('#revealGrid').innerHTML=cards.map(card=>cardMarkup(card,0,true)).join('');$('#packOpening').hidden=false; }
function updateClock(){const p=brasiliaParts();const remaining=(59-Number(p.minute))*60+(60-Number(p.second));const mm=String(Math.floor(remaining/60)).padStart(2,'0'),ss=String(remaining%60).padStart(2,'0');$('#resetTimer').textContent=`Próximo reset em ${mm}:${ss}`;$('#brasiliaClock').textContent=`Brasília · ${p.hour}:${p.minute}:${p.second}`;if(remaining>=3598)render();}

$('#openFreePack').addEventListener('click',()=>openPack('free'));
$('#openPremiumPack').addEventListener('click',()=>openPack('premium'));
$('#closePack').addEventListener('click',()=>{$('#packOpening').hidden=true;});
document.addEventListener('loner-auth-changed',event=>{playerId=event.detail?.uid||'guest';state=loadState();render();});
render();updateClock();setInterval(updateClock,1000);
