(() => {
"use strict";

const KEY = "familysynckids_v1";
const APP_VERSION = 1;
const STATUS_FLOW = ["Do zrobienia","W toku","Czeka","Gotowe","Archiwum"];
const MOODS = ["🤩 Mega dzień","😄 Super","😊 Fajnie","🙂 Dobrze","😌 Spokojnie","😎 Pewnie","🥳 Dumny","🤔 Zastanawiam się","😐 Normalnie","😶 Nie wiem","😕 Słabiej","😟 Martwię się","😞 Smutno","😤 Zły","😴 Zmęczony","🤯 Dużo się działo"];
const $ = id => document.getElementById(id);
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));
const nowISO = () => new Date().toISOString();
const today = () => new Date().toISOString().slice(0,10);
const fmtDate = iso => iso ? new Date(iso).toLocaleString("pl-PL",{dateStyle:"short",timeStyle:"short"}) : "";
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

function blank(){
  return {
    version: APP_VERSION,
    settings:{child:"",parent:"Rodzic",createdAt:nowISO()},
    tasks:[],
    routines:[],
    moods:[],
    notes:[],
    messages:[],
    activities:[],
    gameSessions:[],
    gameActive:null,
    xp:0,
    missions:[],
    achievements:[],
    reading:null,
    school:{text:"",updatedAt:null}
  };
}

function normalize(raw){
  const base = blank();
  if(!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const out = Object.assign(base, raw);
  out.version = APP_VERSION;
  out.settings = Object.assign(base.settings, raw.settings || {});
  ["tasks","routines","moods","notes","messages","activities","missions","achievements"].forEach(k => {
    out[k] = Array.isArray(raw[k]) ? raw[k] : [];
  });
  out.gameSessions = Array.isArray(raw.gameSessions) ? raw.gameSessions : (Array.isArray(raw.game) ? raw.game : []);
  out.gameActive = raw.gameActive && typeof raw.gameActive === "object" ? raw.gameActive : null;
  out.xp = Number.isFinite(Number(raw.xp)) ? Math.max(0,Number(raw.xp)) : 0;
  out.reading = raw.reading && typeof raw.reading === "object" ? raw.reading : null;
  out.school = typeof raw.school === "string" ? {text:raw.school,updatedAt:null} : Object.assign(base.school,raw.school || {});
  out.tasks = out.tasks.map(t => ({
    id:t.id || uid(),
    name:String(t.name || "Zadanie"),
    status:STATUS_FLOW.includes(t.status) ? t.status : "Do zrobienia",
    owner:["Dziecko","Rodzic","Wspólne"].includes(t.owner) ? t.owner : "Wspólne",
    visibility:["Dziecko","Wspólne","Tylko rodzic"].includes(t.visibility) ? t.visibility : "Wspólne",
    priority:["Normalny","Ważny","Pilny"].includes(t.priority) ? t.priority : "Normalny",
    due:t.due || "",
    help:Boolean(t.help),
    createdAt:t.createdAt || nowISO(),
    updatedAt:t.updatedAt || nowISO()
  }));
  out.routines = out.routines.map(r => ({
    id:r.id || uid(),
    name:String(r.name || "Rutyna"),
    lastDoneDate:r.lastDoneDate || (r.done ? today() : ""),
    createdAt:r.createdAt || nowISO()
  }));
  out.messages = out.messages.map(m => ({
    id:m.id || uid(),
    fromRole:m.fromRole || (m.from === out.settings.child ? "child" : "parent"),
    fromName:m.fromName || m.from || "Rodzina",
    text:String(m.text || ""),
    help:Boolean(m.help),
    resolved:Boolean(m.resolved),
    createdAt:m.createdAt || m.date || nowISO()
  }));
  out.moods = out.moods.map(m => ({
    id:m.id || uid(),
    date:m.date && /^\d{4}-\d{2}-\d{2}$/.test(m.date) ? m.date : today(),
    mood:String(m.mood || "😐 Normalnie"),
    text:String(m.text || ""),
    createdAt:m.createdAt || nowISO()
  }));
  out.activities = out.activities.map(a => ({
    id:a.id || uid(),
    name:String(a.name || "Aktywność"),
    minutes:Number(a.minutes) || 0,
    date:a.date || today(),
    createdAt:a.createdAt || nowISO()
  }));
  out.missions = out.missions.map(m => ({
    id:m.id || uid(),
    name:String(m.name || "Misja"),
    xp:Math.max(1,Number(m.xp) || 2),
    done:Boolean(m.done),
    completedAt:m.completedAt || null,
    createdAt:m.createdAt || nowISO()
  }));
  return out;
}

function load(){
  try{
    return normalize(JSON.parse(localStorage.getItem(KEY) || "null"));
  }catch{
    return blank();
  }
}

let data = load();
let mode = "child";
let view = "home";
let selectedMood = "";
let channel = null;
try{ channel = new BroadcastChannel("familysynckids"); }catch{}

function persist(render=true){
  localStorage.setItem(KEY,JSON.stringify(data));
  if(channel) channel.postMessage({type:"updated",at:Date.now()});
  if(render) renderApp();
}
function toast(msg){
  const el=$("toast");
  el.textContent=msg;
  el.classList.add("show");
  clearTimeout(toast.t);
  toast.t=setTimeout(()=>el.classList.remove("show"),1800);
}
function confirmDelete(label){
  return confirm("Usunąć: "+label+"?");
}
function priorityBadge(priority){
  if(priority==="Pilny") return '<span class="badge pilny">Pilny</span>';
  if(priority==="Ważny") return '<span class="badge wazny">Ważny</span>';
  return "";
}
function dueBadge(due){
  if(!due) return "";
  const late = due < today();
  return '<span class="badge '+(late?'help':'')+'">📅 '+esc(due)+(late?' · po terminie':'')+'</span>';
}
function childStatus(status){
  if(status==="W toku") return "Robię";
  if(status==="Gotowe") return "Gotowe";
  if(status==="Czeka") return "Do zrobienia";
  if(status==="Archiwum") return "";
  return "Do zrobienia";
}
function visibleChildTask(t){
  return t.visibility!=="Tylko rodzic" && t.owner!=="Rodzic" && t.status!=="Archiwum";
}
function renderTask(t,parent){
  const status = parent ? t.status : childStatus(t.status);
  if(!status) return "";
  let actions="";
  if(parent){
    actions =
      '<div class="task-actions">'+
      '<button onclick="FS.advanceTask(\''+t.id+'\')">Status →</button>'+
      '<button onclick="FS.toggleTaskHelp(\''+t.id+'\')">'+(t.help?'Pomoc ✓':'Potrzebuje pomocy')+'</button>'+
      '<button onclick="FS.openEditTask(\''+t.id+'\')">Edytuj</button>'+
      '<button class="danger" onclick="FS.deleteTask(\''+t.id+'\')">Usuń</button>'+
      '</div>';
  }else{
    actions =
      '<div class="task-actions">'+
      (t.status!=="W toku" && t.status!=="Gotowe" ? '<button onclick="FS.setTaskStatus(\''+t.id+'\',\'W toku\')">▶ Robię</button>' : '')+
      (t.status!=="Gotowe" ? '<button class="success" onclick="FS.setTaskStatus(\''+t.id+'\',\'Gotowe\')">✓ Gotowe</button>' : '')+
      '<button onclick="FS.toggleTaskHelp(\''+t.id+'\')">'+(t.help?'🆘 Pomoc zgłoszona':'Potrzebuję pomocy')+'</button>'+
      '</div>';
  }
  return '<div class="item">'+
    '<div class="spread"><div><div class="item-title">'+esc(t.name)+'</div><div class="meta">'+
    '<span class="badge brand">'+esc(status)+'</span>'+
    priorityBadge(t.priority)+dueBadge(t.due)+
    (t.help?'<span class="badge help">🆘 pomoc</span>':'')+
    '</div></div><span class="small muted">'+esc(t.owner)+'</span></div>'+actions+'</div>';
}

function childHome(){
  const tasks=data.tasks.filter(visibleChildTask);
  const routines=data.routines;
  const moodToday=data.moods.find(m=>m.date===today());
  const gameToday=data.gameSessions.filter(s=>(s.date||String(s.start||"").slice(0,10))===today()).reduce((a,s)=>a+(Number(s.minutes)||0),0);
  const reading=data.reading;
  const readPct=reading && reading.pages ? clamp(Math.round((Number(reading.page)||0)/Number(reading.pages)*100),0,100) : 0;
  const activeMissions=data.missions.filter(m=>!m.done);
  return '<div class="section-title"><div class="eyebrow">PANEL DZIECKA</div><h1>Cześć, '+esc(data.settings.child || "Dziecko")+' 👋</h1><p>Najważniejsze rzeczy na dziś, bez zbędnego chaosu.</p></div>'+
  '<div class="grid">'+
    '<section class="card c7"><div class="card-head"><div><h2>📅 Dzisiaj</h2><p class="small muted">'+tasks.length+' aktywnych spraw</p></div></div><div>'+ (tasks.map(t=>renderTask(t,false)).join("") || '<div class="empty">Na razie nic do zrobienia.</div>') +'</div></section>'+
    '<section class="card c5"><div class="card-head"><div><h2>☑️ Rutyny</h2><p class="small muted">Resetują się automatycznie każdego dnia.</p></div></div>'+
      (routines.map(r=>'<label class="item row"><input type="checkbox" style="width:auto" '+(r.lastDoneDate===today()?'checked':'')+' onchange="FS.toggleRoutine(\''+r.id+'\')"><span>'+esc(r.name)+'</span></label>').join("") || '<div class="empty">Dodaj pierwszą rutynę.</div>')+
      '<div class="row"><input id="newRoutineChild" placeholder="Nowa rutyna"><button class="action primary" onclick="FS.addRoutine(\'newRoutineChild\')">Dodaj</button></div></section>'+
    '<section class="card c6"><div class="card-head"><div><h2>😊 Jaki miałem dzień?</h2><p class="small muted">'+(moodToday?'Dzisiejszy wpis jest zapisany. Możesz go zmienić.':'Jedna buźka i jedno zdanie wystarczą.')+'</p></div></div>'+
      '<div class="moods">'+MOODS.map(m=>'<button class="mood '+(selectedMood===m?'selected':'')+'" data-mood="'+esc(m)+'" onclick="FS.selectMood(decodeURIComponent(\''+encodeURIComponent(m)+'\'))">'+esc(m)+'</button>').join("")+'</div>'+
      '<div class="stack" style="margin-top:9px"><input id="moodText" value="'+esc(moodToday?moodToday.text:"")+'" placeholder="Mój dzień w jednym zdaniu…"><button class="action primary" onclick="FS.saveMood()">Zapisz dzień</button></div></section>'+
    '<section class="card c6"><div class="card-head"><div><h2>💬 Rodzic i ja</h2><p class="small muted">Wiadomość lub szybka prośba o pomoc.</p></div></div>'+
      '<textarea id="childMessage" rows="3" placeholder="Napisz wiadomość…"></textarea>'+
      '<div class="row"><label class="inline-label"><input id="childMessageHelp" type="checkbox"> Potrzebuję pomocy</label><button class="action primary" onclick="FS.sendMessage(\'child\')">Wyślij</button></div></section>'+
    '<section class="card c4"><div class="card-head"><div><h2>📖 Czytelnia</h2></div><button class="action tiny" onclick="FS.openReading()">Ustaw</button></div>'+
      (reading?'<div class="item-title">'+esc(reading.title)+'</div><div class="progress"><i style="width:'+readPct+'%"></i></div><div class="spread"><span class="small muted">str. '+(Number(reading.page)||0)+' / '+(Number(reading.pages)||0)+'</span><b>'+readPct+'%</b></div><div class="row" style="margin-top:9px"><input id="quickPage" type="number" min="0" max="'+esc(reading.pages)+'" value="'+esc(reading.page)+'"><button class="action" onclick="FS.quickReading()">Zapisz stronę</button></div>':'<div class="empty">Brak aktualnej książki.</div>')+
      '</section>'+
    '<section class="card c4"><div class="card-head"><div><h2>🏃 Aktywność</h2></div></div><div class="two"><input id="activityName" placeholder="np. spacer"><input id="activityMinutes" type="number" min="0" placeholder="min"></div><button class="action" style="margin-top:7px" onclick="FS.addActivity()">Dodaj aktywność</button>'+
      '<div>'+data.activities.slice(-3).reverse().map(a=>'<div class="item"><b>'+esc(a.name)+'</b><div class="small muted">'+esc(a.date)+(a.minutes?' · '+a.minutes+' min':'')+'</div></div>').join("")+'</div></section>'+
    '<section class="card c4"><div class="card-head"><div><h2>🎮 Czas gry</h2><p class="small muted">Dzisiaj: '+gameToday+' min</p></div></div><div id="gameTimer" class="timer">'+gameTimeText()+'</div><div class="row"><button class="action primary" onclick="FS.startGame()">▶ START</button><button class="action" onclick="FS.stopGame()">⏹ STOP</button></div></section>'+
    '<section class="card c12"><div class="card-head"><div><h2>📚 Szkoła</h2><p class="small muted">Informacje organizacyjne od rodzica.</p></div></div>'+(data.school.text?'<div class="callout">'+esc(data.school.text)+'</div>':'<div class="empty">Na razie brak informacji szkolnych.</div>')+'</section>'+
    '<section class="card c12"><div class="card-head"><div><h2>⭐ Misje i XP</h2><p class="small muted">Opcjonalne zadania dodatkowe. Nie ma ujemnych punktów.</p></div><div class="stat"><strong>'+data.xp+'</strong><span>XP</span></div></div>'+
      (activeMissions.map(m=>'<div class="item spread"><div><b>'+esc(m.name)+'</b><div class="small muted">+'+m.xp+' XP</div></div><button class="action success" onclick="FS.completeMission(\''+m.id+'\')">✓ Zrobione</button></div>').join("") || '<div class="empty">Brak aktywnych misji.</div>')+'</section>'+
  '</div>';
}

function childMore(){
  const notes=data.notes.filter(n=>n.visibility!=="Tylko rodzic").slice().reverse();
  const msgs=data.messages.slice().reverse();
  return '<div class="section-title"><div class="eyebrow">WIĘCEJ</div><h1>Historia i moje rzeczy</h1><p>Notatki, wspólny inbox, osiągnięcia i historia dnia.</p></div>'+
  '<div class="grid">'+
    '<section class="card c6"><div class="card-head"><h2>⚡ Szybka notatka</h2></div><textarea id="quickNote" rows="3" placeholder="Co chcesz zapisać?"></textarea><div class="row"><select id="quickNoteVisibility" style="max-width:160px"><option>Dziecko</option><option>Wspólne</option></select><button class="action primary" onclick="FS.addNote()">Zapisz</button></div>'+
      (notes.slice(0,8).map(n=>'<div class="item"><div>'+esc(n.text)+'</div><div class="small muted">'+esc(n.visibility)+' · '+fmtDate(n.createdAt)+'</div></div>').join("") || '<div class="empty">Brak notatek.</div>')+'</section>'+
    '<section class="card c6"><div class="card-head"><h2>📨 Wspólny inbox</h2></div>'+
      (msgs.slice(0,15).map(renderMessage).join("") || '<div class="empty">Inbox jest pusty.</div>')+'</section>'+
    '<section class="card c6"><div class="card-head"><h2>📖 Dziennik dni</h2></div>'+
      (data.moods.slice().reverse().slice(0,14).map(m=>'<div class="item"><b>'+esc(m.mood)+'</b><div>'+esc(m.text)+'</div><div class="small muted">'+esc(m.date)+'</div></div>').join("") || '<div class="empty">Brak wpisów.</div>')+'</section>'+
    '<section class="card c6"><div class="card-head"><h2>🏅 Osiągnięcia</h2></div>'+
      (data.achievements.slice().reverse().map(a=>'<div class="item">🏅 '+esc(a.label || a)+'</div>').join("") || '<div class="empty">Jeszcze brak osiągnięć.</div>')+'</section>'+
  '</div>';
}

function renderMessage(m){
  return '<div class="item message '+(m.help&&!m.resolved?'help-message':'')+'"><div class="spread"><div><span class="from">'+esc(m.fromName)+'</span> '+(m.help?'<span class="badge help">'+(m.resolved?'pomoc zamknięta':'potrzebuję pomocy')+'</span>':'')+'</div><span class="date">'+fmtDate(m.createdAt)+'</span></div><div>'+esc(m.text)+'</div></div>';
}

function parentHome(){
  const active=data.tasks.filter(t=>t.status!=="Archiwum");
  const openTasks=active.filter(t=>t.status!=="Gotowe").length;
  const helpCount=active.filter(t=>t.help).length + data.messages.filter(m=>m.help&&!m.resolved).length;
  const moodToday=data.moods.find(m=>m.date===today());
  const gameToday=data.gameSessions.filter(s=>(s.date||String(s.start||"").slice(0,10))===today()).reduce((a,s)=>a+(Number(s.minutes)||0),0);
  return '<div class="section-title"><div class="eyebrow">PANEL RODZICA</div><h1>Co jest ważne teraz</h1><p>Pełny widok wspólnych spraw i rzeczy wymagających reakcji.</p></div>'+
  '<div class="grid">'+
    '<section class="card c12"><div class="stats"><div class="stat"><strong>'+openTasks+'</strong><span>aktywne zadania</span></div><div class="stat"><strong>'+helpCount+'</strong><span>sygnały pomocy</span></div><div class="stat"><strong>'+(moodToday?'1':'0')+'</strong><span>check-in dzisiaj</span></div><div class="stat"><strong>'+gameToday+'</strong><span>min gry dzisiaj</span></div></div></section>'+
    '<section class="card c8"><div class="card-head"><div><h2>🔄 Zadania i statusy</h2><p class="small muted">Jeden rekord, różne widoki rodzica i dziecka.</p></div></div>'+
      '<div class="three"><input id="newTaskName" placeholder="Nowe zadanie"><select id="newTaskOwner"><option>Dziecko</option><option>Rodzic</option><option>Wspólne</option></select><select id="newTaskVisibility"><option>Wspólne</option><option>Dziecko</option><option>Tylko rodzic</option></select></div>'+
      '<div class="three" style="margin-top:7px"><select id="newTaskPriority"><option>Normalny</option><option>Ważny</option><option>Pilny</option></select><input id="newTaskDue" type="date"><button class="action primary" onclick="FS.addTask()">Dodaj zadanie</button></div>'+
      '<div>'+ (active.map(t=>renderTask(t,true)).join("") || '<div class="empty">Brak zadań.</div>') +'</div></section>'+
    '<section class="card c4"><div class="card-head"><div><h2>🆘 Potrzebuje pomocy</h2></div></div>'+renderHelpQueue()+'</section>'+
    '<section class="card c6"><div class="card-head"><h2>📨 Wspólny inbox</h2></div><textarea id="parentMessage" rows="3" placeholder="Wiadomość do dziecka"></textarea><button class="action primary" onclick="FS.sendMessage(\'parent\')">Wyślij</button>'+
      (data.messages.slice().reverse().slice(0,8).map(renderMessage).join("") || '<div class="empty">Inbox jest pusty.</div>')+'</section>'+
    '<section class="card c6"><div class="card-head"><h2>👀 Ostatnie check-iny</h2></div>'+
      (data.moods.slice().reverse().slice(0,7).map(m=>'<div class="item"><b>'+esc(m.mood)+'</b><div>'+esc(m.text)+'</div><div class="small muted">'+esc(m.date)+'</div></div>').join("") || '<div class="empty">Brak check-inów.</div>')+'</section>'+
    '<section class="card c6"><div class="card-head"><h2>📖 Czytanie i aktywność</h2></div>'+renderParentReadingActivity()+'</section>'+
    '<section class="card c6"><div class="card-head"><h2>🎮 Historia gry</h2></div>'+renderGameHistory()+'</section>'+
  '</div>';
}

function renderHelpQueue(){
  const taskHelp=data.tasks.filter(t=>t.help&&t.status!=="Archiwum");
  const msgHelp=data.messages.filter(m=>m.help&&!m.resolved).slice().reverse();
  const blocks=[];
  taskHelp.forEach(t=>blocks.push('<div class="item"><b>🆘 '+esc(t.name)+'</b><div class="small muted">zadanie</div><button class="action tiny" onclick="FS.toggleTaskHelp(\''+t.id+'\')">Zamknij prośbę</button></div>'));
  msgHelp.forEach(m=>blocks.push('<div class="item"><b>'+esc(m.fromName)+'</b><div>'+esc(m.text)+'</div><button class="action tiny" onclick="FS.resolveMessage(\''+m.id+'\')">Oznacz jako załatwione</button></div>'));
  return blocks.join("") || '<div class="good-callout">Nie ma otwartych próśb o pomoc.</div>';
}

function renderParentReadingActivity(){
  const r=data.reading;
  const reading=r?'<div class="item"><b>📖 '+esc(r.title)+'</b><div class="small muted">str. '+r.page+' / '+r.pages+'</div><button class="action tiny" onclick="FS.openReading()">Edytuj</button></div>':'<div class="item"><span class="muted">Brak aktualnej książki.</span></div>';
  const acts=data.activities.slice().reverse().slice(0,5).map(a=>'<div class="item"><b>'+esc(a.name)+'</b><div class="small muted">'+esc(a.date)+(a.minutes?' · '+a.minutes+' min':'')+'</div></div>').join("");
  return reading+acts;
}
function renderGameHistory(){
  if(!data.gameSessions.length && !data.gameActive) return '<div class="empty">Brak sesji.</div>';
  const active=data.gameActive?'<div class="help-callout">Aktywna sesja: <b id="gameTimerParent">'+gameTimeText()+'</b></div>':'';
  return active+data.gameSessions.slice().reverse().slice(0,10).map(s=>'<div class="item spread"><span>'+esc(s.date || fmtDate(s.start))+'</span><b>'+Number(s.minutes || 0)+' min</b></div>').join("");
}

function parentManage(){
  return '<div class="section-title"><div class="eyebrow">ORGANIZACJA</div><h1>Ustawienia codzienności</h1><p>Rutyny, misje, szkoła i rzeczy widoczne w Panelu dziecka.</p></div>'+
  '<div class="grid">'+
    '<section class="card c6"><div class="card-head"><h2>☑️ Rutyny</h2></div>'+
      (data.routines.map(r=>'<div class="item spread"><span>'+esc(r.name)+'</span><button class="action tiny danger" onclick="FS.deleteRoutine(\''+r.id+'\')">Usuń</button></div>').join("") || '<div class="empty">Brak rutyn.</div>')+
      '<div class="row"><input id="newRoutineParent" placeholder="Nowa rutyna"><button class="action primary" onclick="FS.addRoutine(\'newRoutineParent\')">Dodaj</button></div></section>'+
    '<section class="card c6"><div class="card-head"><div><h2>⭐ Misje bonusowe</h2><p class="small muted">XP tylko za rzeczy dodatkowe; bez punktów ujemnych.</p></div></div>'+
      (data.missions.map(m=>'<div class="item spread"><div><b>'+esc(m.name)+'</b><div class="small muted">+'+m.xp+' XP · '+(m.done?'ukończona':'aktywna')+'</div></div><button class="action tiny danger" onclick="FS.deleteMission(\''+m.id+'\')">Usuń</button></div>').join("") || '<div class="empty">Brak misji.</div>')+
      '<div class="two"><input id="newMissionName" placeholder="Nowa misja"><input id="newMissionXp" type="number" min="1" value="2"></div><button class="action primary" style="margin-top:7px" onclick="FS.addMission()">Dodaj misję</button></section>'+
    '<section class="card c6"><div class="card-head"><h2>📚 Szkoła — informacja organizacyjna</h2></div><textarea id="schoolText" rows="8" placeholder="Plan na jutro, wydarzenie, rzeczy do zabrania…">'+esc(data.school.text)+'</textarea><button class="action primary" onclick="FS.saveSchool()">Zapisz dla dziecka</button></section>'+
    '<section class="card c6"><div class="card-head"><h2>📖 Czytelnia</h2></div>'+renderParentReadingActivity()+'</section>'+
  '</div>';
}

function parentBackend(){
  const archived=data.tasks.filter(t=>t.status==="Archiwum");
  return '<div class="section-title"><div class="eyebrow">ZAPLECZE</div><h1>Dane, prywatność i archiwum</h1><p>Techniczne rzeczy, których dziecko nie potrzebuje w codziennym widoku.</p></div>'+
  '<div class="grid">'+
    '<section class="card c6"><div class="card-head"><h2>🔒 Jak działa zapis</h2></div><div class="callout">Dane są zapisane lokalnie w tej przeglądarce. Nie są wysyłane do serwera FamilySyncKids++.</div><div class="item"><b>Synchronizacja między kartami</b><div class="small muted">Zmiany są odświeżane między otwartymi kartami tej samej przeglądarki.</div></div><div class="item"><b>Inne urządzenie</b><div class="small muted">Na razie wymaga eksportu/importu JSON. Prawdziwy multi-device będzie osobnym, zabezpieczonym modułem.</div></div></section>'+
    '<section class="card c6"><div class="card-head"><h2>💾 Kopia danych</h2></div><div class="stack"><button class="action primary" onclick="FS.exportData()">Pobierz kopię JSON</button><label class="file-btn" style="text-align:center">Wczytaj kopię JSON<input type="file" accept="application/json" hidden onchange="FS.importFromInput(this)"></label><button class="action danger" onclick="FS.clearAll()">Wyczyść lokalne dane</button></div></section>'+
    '<section class="card c12"><div class="card-head"><h2>🗄️ Archiwum zadań</h2></div>'+
      (archived.map(t=>renderTask(t,true)).join("") || '<div class="empty">Archiwum jest puste.</div>')+'</section>'+
  '</div>';
}

function renderApp(){
  $("familyLabel").textContent = data.settings.child ? data.settings.child+" + "+data.settings.parent : "lokalny panel rodziny";
  $("childModeBtn").classList.toggle("active",mode==="child");
  $("parentModeBtn").classList.toggle("active",mode==="parent");
  const items = mode==="child" ? [["home","🏠 Start"],["more","📚 Więcej"]] : [["home","🏠 Pulpit"],["manage","🧩 Organizacja"],["backend","🔒 Zaplecze"]];
  if(!items.some(x=>x[0]===view)) view="home";
  $("subnav").innerHTML=items.map(x=>'<button class="'+(view===x[0]?'active':'')+'" onclick="FS.setView(\''+x[0]+'\')">'+x[1]+'</button>').join("");
  if(mode==="child") $("main").innerHTML = view==="more" ? childMore() : childHome();
  else $("main").innerHTML = view==="manage" ? parentManage() : (view==="backend" ? parentBackend() : parentHome());
  if(mode==="child" && selectedMood){
    document.querySelectorAll(".mood").forEach(b=>b.classList.toggle("selected",b.textContent===selectedMood));
  }
}

function gameTimeText(){
  if(!data.gameActive) return "00:00";
  const sec=Math.max(0,Math.floor((Date.now()-Number(data.gameActive.start))/1000));
  const m=String(Math.floor(sec/60)).padStart(2,"0");
  const s=String(sec%60).padStart(2,"0");
  return m+":"+s;
}
function tickTimer(){
  const a=$("gameTimer"), b=$("gameTimerParent");
  if(a) a.textContent=gameTimeText();
  if(b) b.textContent=gameTimeText();
}

const FS = {
  setMode(next){ mode=next; view="home"; renderApp(); },
  setView(next){ view=next; renderApp(); },
  addTask(){
    const name=$("newTaskName").value.trim();
    if(!name) return toast("Wpisz nazwę zadania.");
    data.tasks.push({id:uid(),name,status:"Do zrobienia",owner:$("newTaskOwner").value,visibility:$("newTaskVisibility").value,priority:$("newTaskPriority").value,due:$("newTaskDue").value,help:false,createdAt:nowISO(),updatedAt:nowISO()});
    persist(); toast("Zadanie dodane.");
  },
  setTaskStatus(id,status){
    const t=data.tasks.find(x=>x.id===id); if(!t) return;
    t.status=status; t.updatedAt=nowISO(); persist(); toast(status==="Gotowe"?"Gotowe ✓":"Status zmieniony.");
  },
  advanceTask(id){
    const t=data.tasks.find(x=>x.id===id); if(!t) return;
    t.status=STATUS_FLOW[(STATUS_FLOW.indexOf(t.status)+1)%STATUS_FLOW.length]; t.updatedAt=nowISO(); persist();
  },
  toggleTaskHelp(id){
    const t=data.tasks.find(x=>x.id===id); if(!t) return;
    t.help=!t.help; t.updatedAt=nowISO(); persist(); toast(t.help?"Prośba o pomoc zgłoszona.":"Prośba o pomoc zamknięta.");
  },
  deleteTask(id){
    const t=data.tasks.find(x=>x.id===id); if(!t||!confirmDelete(t.name)) return;
    data.tasks=data.tasks.filter(x=>x.id!==id); persist(); toast("Zadanie usunięte.");
  },
  openEditTask(id){
    const t=data.tasks.find(x=>x.id===id); if(!t) return;
    $("editTaskId").value=t.id; $("editTaskName").value=t.name; $("editTaskOwner").value=t.owner; $("editTaskVisibility").value=t.visibility; $("editTaskPriority").value=t.priority; $("editTaskDue").value=t.due||"";
    $("editTaskDialog").showModal();
  },
  addRoutine(inputId){
    const input=$(inputId); if(!input) return;
    const name=input.value.trim(); if(!name) return toast("Wpisz nazwę rutyny.");
    data.routines.push({id:uid(),name,lastDoneDate:"",createdAt:nowISO()}); input.value=""; persist(); toast("Rutyna dodana.");
  },
  toggleRoutine(id){
    const r=data.routines.find(x=>x.id===id); if(!r) return;
    r.lastDoneDate=r.lastDoneDate===today()?"":today(); persist();
  },
  deleteRoutine(id){
    const r=data.routines.find(x=>x.id===id); if(!r||!confirmDelete(r.name)) return;
    data.routines=data.routines.filter(x=>x.id!==id); persist();
  },
  selectMood(m){ selectedMood=m; renderApp(); },
  saveMood(){
    const text=$("moodText").value.trim();
    const existing=data.moods.find(m=>m.date===today());
    const mood=selectedMood || (existing?existing.mood:"");
    if(!mood) return toast("Wybierz buźkę.");
    if(!text) return toast("Napisz jedno zdanie.");
    if(existing){existing.mood=mood;existing.text=text;existing.createdAt=nowISO();}
    else data.moods.push({id:uid(),date:today(),mood,text,createdAt:nowISO()});
    selectedMood=""; persist(); toast("Dzień zapisany.");
  },
  sendMessage(role){
    const input=role==="child"?$("childMessage"):$("parentMessage");
    const text=input.value.trim(); if(!text) return toast("Wpisz wiadomość.");
    const help=role==="child" && Boolean($("childMessageHelp") && $("childMessageHelp").checked);
    data.messages.push({id:uid(),fromRole:role,fromName:role==="child"?(data.settings.child||"Dziecko"):(data.settings.parent||"Rodzic"),text,help,resolved:false,createdAt:nowISO()});
    input.value=""; if(role==="child"&&$("childMessageHelp")) $("childMessageHelp").checked=false;
    persist(); toast(help?"Wiadomość i prośba o pomoc wysłane.":"Wiadomość wysłana.");
  },
  resolveMessage(id){
    const m=data.messages.find(x=>x.id===id); if(!m) return;
    m.resolved=true; persist(); toast("Prośba oznaczona jako załatwiona.");
  },
  addNote(){
    const text=$("quickNote").value.trim(); if(!text) return toast("Wpisz notatkę.");
    data.notes.push({id:uid(),text,visibility:$("quickNoteVisibility").value,createdAt:nowISO()}); persist(); toast("Notatka zapisana.");
  },
  addActivity(){
    const name=$("activityName").value.trim(); if(!name) return toast("Wpisz aktywność.");
    const minutes=Math.max(0,Number($("activityMinutes").value)||0);
    data.activities.push({id:uid(),name,minutes,date:today(),createdAt:nowISO()}); persist(); toast("Aktywność dodana.");
  },
  openReading(){
    $("readingTitle").value=data.reading?data.reading.title:"";
    $("readingPages").value=data.reading?data.reading.pages:"";
    $("readingPage").value=data.reading?data.reading.page:0;
    $("readingDialog").showModal();
  },
  quickReading(){
    if(!data.reading) return;
    const page=clamp(Number($("quickPage").value)||0,0,Number(data.reading.pages)||0);
    data.reading.page=page; data.reading.updatedAt=nowISO(); persist(); toast("Postęp czytania zapisany.");
  },
  startGame(){
    if(data.gameActive) return toast("Sesja gry już trwa.");
    data.gameActive={start:Date.now(),date:today()}; persist(); toast("Timer gry uruchomiony.");
  },
  stopGame(){
    if(!data.gameActive) return toast("Nie ma aktywnej sesji.");
    const end=Date.now(), minutes=Math.max(1,Math.round((end-Number(data.gameActive.start))/60000));
    data.gameSessions.push({id:uid(),start:data.gameActive.start,end,minutes,date:data.gameActive.date||today()});
    data.gameActive=null; persist(); toast("Sesja zapisana: "+minutes+" min.");
  },
  addMission(){
    const name=$("newMissionName").value.trim(); if(!name) return toast("Wpisz nazwę misji.");
    const xp=Math.max(1,Number($("newMissionXp").value)||2);
    data.missions.push({id:uid(),name,xp,done:false,completedAt:null,createdAt:nowISO()}); persist(); toast("Misja dodana.");
  },
  completeMission(id){
    const m=data.missions.find(x=>x.id===id); if(!m||m.done) return;
    m.done=true;m.completedAt=nowISO();data.xp+=m.xp;
    if(!data.achievements.some(a=>a.id==="mission:"+m.id)) data.achievements.push({id:"mission:"+m.id,label:"Ukończona misja: "+m.name,createdAt:nowISO()});
    persist();toast("Misja ukończona: +"+m.xp+" XP");
  },
  deleteMission(id){
    const m=data.missions.find(x=>x.id===id);if(!m||!confirmDelete(m.name))return;
    data.missions=data.missions.filter(x=>x.id!==id);persist();
  },
  saveSchool(){
    data.school={text:$("schoolText").value.trim(),updatedAt:nowISO()};persist();toast("Informacja szkolna zapisana.");
  },
  exportData(){
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="familysynckids-backup-"+today()+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  },
  importFromInput(input){
    const file=input.files && input.files[0]; if(file) importFile(file); input.value="";
  },
  clearAll(){
    if(!confirm("Usunąć wszystkie lokalne dane FamilySyncKids++ z tej przeglądarki?")) return;
    localStorage.removeItem(KEY); data=blank(); selectedMood=""; mode="child";view="home";renderApp();openSetup(true);toast("Dane wyczyszczone.");
  }
};
window.FS=FS;

function importFile(file){
  if(file.size>2*1024*1024) return toast("Plik jest za duży.");
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const parsed=JSON.parse(reader.result);
      if(!parsed || typeof parsed!=="object" || Array.isArray(parsed)) throw new Error("schema");
      data=normalize(parsed);persist();toast("Kopia danych wczytana.");
    }catch{toast("Nieprawidłowy plik kopii.");}
  };
  reader.readAsText(file);
}

function openSetup(firstRun){
  $("cancelSetup").style.display=firstRun?"none":"";
  $("setupChild").value=data.settings.child||"";
  $("setupParent").value=data.settings.parent||"Rodzic";
  if(!$("setupDialog").open) $("setupDialog").showModal();
}

$("childModeBtn").onclick=()=>FS.setMode("child");
$("parentModeBtn").onclick=()=>FS.setMode("parent");
$("settingsBtn").onclick=()=>openSetup(false);
$("backupBtn").onclick=()=>FS.exportData();
$("importFile").onchange=e=>{const f=e.target.files&&e.target.files[0];if(f)importFile(f);e.target.value="";};

$("setupForm").addEventListener("submit",e=>{
  e.preventDefault();
  const child=$("setupChild").value.trim(),parent=$("setupParent").value.trim();
  if(!child||!parent) return toast("Uzupełnij oba pola.");
  data.settings.child=child;data.settings.parent=parent;persist();$("setupDialog").close();toast("Ustawienia zapisane.");
});
$("editTaskForm").addEventListener("submit",e=>{
  e.preventDefault();
  const t=data.tasks.find(x=>x.id===$("editTaskId").value);if(!t)return;
  t.name=$("editTaskName").value.trim()||t.name;t.owner=$("editTaskOwner").value;t.visibility=$("editTaskVisibility").value;t.priority=$("editTaskPriority").value;t.due=$("editTaskDue").value;t.updatedAt=nowISO();
  persist();$("editTaskDialog").close();toast("Zadanie zaktualizowane.");
});
$("readingForm").addEventListener("submit",e=>{
  e.preventDefault();
  const title=$("readingTitle").value.trim(),pages=Math.max(1,Number($("readingPages").value)||1),page=clamp(Number($("readingPage").value)||0,0,pages);
  if(!title)return;
  data.reading={title,pages,page,updatedAt:nowISO()};persist();$("readingDialog").close();toast("Czytelnia zaktualizowana.");
});

window.addEventListener("storage",e=>{if(e.key===KEY){data=load();renderApp();}});
if(channel) channel.onmessage=()=>{data=load();renderApp();};

setInterval(tickTimer,1000);
renderApp();
if(!data.settings.child) setTimeout(()=>openSetup(true),50);
})();