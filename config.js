
// ----- Configuration -----
const COMPANIES = {
  "Apple":150.25,"Microsoft":299.10,"Google":750.50,"Amazon":700.75,
  "Tesla":720.30,"Netflix":590.15,"Facebook":355.40,"Nvidia":220.80,
  "Intel":55.60,"Adobe":630.20,"IBM":140.20,"Oracle":85.50
};

const ABBR = { 
  "Apple":"AAPL","Microsoft":"MSFT","Google":"GOOG","Amazon":"AMZN","Tesla":"TSLA",
  "Netflix":"NFLX","Facebook":"FB","Nvidia":"NVDA","Intel":"INTC","Adobe":"ADBE",
  "IBM":"IBM","Oracle":"ORCL" 
};

const START_BALANCE = 10000;
const TOTAL_DAYS = 20;
const PREV_DAYS = 6;
const COLORS = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd','#8c564b','#e377c2','#7f7f7f','#bcbd22','#17becf','#00cc66','#ff6600'];

// ----- Helpers -----
function rndDelta(v){ return +(v*(1+(Math.random()*0.1-0.05))).toFixed(2); }
function initHistory(p0, days=PREV_DAYS){ 
  const h=[+p0.toFixed(2)]; 
  for(let i=1;i<days;i++) h.push(rndDelta(h[h.length-1])); 
  return h; 
}

// ----- Scenario API (called by modal) -----
window.applyScenarioCrash = function(multiplier = 0.5) {
  for (const c in COMPANIES) {
    if (!Array.isArray(history[c]) || history[c].length === 0) continue;
    const lastIndex = history[c].length - 1;
    const prev = history[c][lastIndex];
    const crashed = +(prev * multiplier).toFixed(2);
    history[c][lastIndex] = crashed;

    if (!Array.isArray(ohlc[c])) ohlc[c] = [];
    const prevC = ohlc[c].length ? ohlc[c][ohlc[c].length - 1].c : crashed;
    ohlc[c].push({
      o: prevC,
      h: Math.max(prevC, crashed) + Math.random() * 5,
      l: Math.min(prevC, crashed) - Math.random() * 5,
      c: crashed
    });
  }
  try { refreshUI(); } catch(e) { }
};

// ----- State -----
let history={}, shares={}, balance=START_BALANCE, dayPlayed=0, user=null, currentCompany=null, ohlc={};
let leaderboard = JSON.parse(localStorage.getItem('lb')||'{}');

for(const k in COMPANIES){ 
  history[k] = initHistory(COMPANIES[k]); 
  shares[k] = 0; 
  ohlc[k] = history[k].map((p,i)=>{
    const prev = i===0? p : history[k][i-1];
    return {o:prev, h:Math.max(prev,p)+Math.random()*5, l:Math.min(prev,p)-Math.random()*5, c:p};
  });
}

// ----- DOM Elements -----
let companyList, balLbl, dayLbl, startBtn, username, nextDayBtn, selChart, leaderboardBody, allGraphBtn, ctx, chart=null;

// ----- Build Company Rows -----
function buildCompanyRows(){
  companyList.innerHTML='';
  let i=0;
  for(const c in COMPANIES){
    const row = document.createElement('div'); row.className='compRow';

    const colorBox = document.createElement('div'); colorBox.className='colorBox'; 
    colorBox.style.background=COLORS[i%COLORS.length];
    colorBox.addEventListener('click',()=>{currentCompany=c; drawChart();});

    const abbr = document.createElement('div'); abbr.className='abbr'; abbr.textContent=ABBR[c];
    abbr.addEventListener('click',()=>{currentCompany=c; drawChart();});

    const price = document.createElement('div'); price.className='price'; price.dataset.company=c; 
    price.textContent = history[c][history[c].length-1].toFixed(2);

    const buy = document.createElement('button'); buy.className='buy'; buy.textContent='Buy'; 
    buy.addEventListener('click',()=>trade(c,true));

    const sell = document.createElement('button'); sell.className='sell'; sell.textContent='Sell'; 
    sell.addEventListener('click',()=>trade(c,false));

    const sh = document.createElement('div');
    sh.className = 'shares';
    sh.id = `shares-${c}`;
    sh.textContent = shares[c];


    row.append(colorBox,abbr,price,buy,sell,sh);
    companyList.append(row);
    i++;
  }
}

// ----- Refresh UI -----
function refreshUI(){
  dayLbl.textContent = `Day ${dayPlayed} / ${TOTAL_DAYS}`;
  balLbl.textContent = `Balance $${balance.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
  for(const c in COMPANIES){
    const el = document.querySelector(`.price[data-company='${c}']`);
    const cur = history[c][history[c].length-1];
    const prev = history[c].length>1 ? history[c][history[c].length-2]:cur;
    if(el){ el.textContent=cur.toFixed(2); el.style.color = cur>=prev?'#00FF7F':'#FF4500'; }
    const shEl = document.getElementById(`shares-${c}`);
    if(shEl) shEl.textContent=shares[c];
  }
  drawChart(); refreshLeader();
}

// ----- Refresh Leaderboard -----
function refreshLeader(){
  leaderboardBody.innerHTML='';
  const arr=Object.entries(leaderboard).sort((a,b)=>b[1]-a[1]);
  for(const [u,w] of arr){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u}</td><td>$${w.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>`;
    leaderboardBody.append(tr);
  }
}

// ----- Start Game -----
function startGame(){
  const n=username.value.trim(); if(!n){ alert('Enter a username'); return; }
  user=n; username.disabled=true; startBtn.disabled=true;
  if(!(user in leaderboard)) leaderboard[user]=balance;
  localStorage.setItem('lb',JSON.stringify(leaderboard));
  refreshUI();
}

// ----- Trade -----
function trade(comp,buy){
  if(!user){ alert('Start first'); return; }
  const qty=1; const price=history[comp][history[comp].length-1];
  if(buy){ if(balance<price*qty){ alert('Insufficient funds'); return; } balance-=price*qty; shares[comp]+=qty; }
  else{ if(shares[comp]<qty){ alert('Not enough shares'); return; } balance+=price*qty; shares[comp]-=qty; }
  refreshUI();
}

// ----- Next Day -----
function nextDay(){
  if(!user){ alert('Start first'); return; }
  if(dayPlayed>=TOTAL_DAYS){ finish(); return; }
  for(const c in COMPANIES){
    const last=history[c][history[c].length-1];
    const newPrice=rndDelta(last);
    history[c].push(newPrice);
    ohlc[c].push({o:last, h:Math.max(last,newPrice)+Math.random()*5, l:Math.min(last,newPrice)-Math.random()*5, c:newPrice});
  }
  dayPlayed++;
  refreshUI();
}

// ----- Finish Game -----
function finish(){
  const net = balance + Object.keys(shares).reduce((s,c)=>s+shares[c]*history[c][history[c].length-1],0);
  alert(`Final Net Worth: $${net.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`);
  leaderboard[user]=net;
  localStorage.setItem('lb',JSON.stringify(leaderboard));
  refreshLeader();
}

// ----- Draw Chart -----
function drawChart(){
  if(chart) chart.destroy();
  const type = selChart.value;
  let datasets=[], labels=[];
  if(currentCompany){
    labels = history[currentCompany].map((_,i)=>i+1);
    if(type==='line'){
      datasets=[{ label:currentCompany, data:history[currentCompany], borderColor:COLORS[Object.keys(COMPANIES).indexOf(currentCompany)%COLORS.length], backgroundColor:'transparent', tension:0.15 }];
    } else if(type==='candlestick'){
      datasets=[{ label:currentCompany, data:ohlc[currentCompany], type:'candlestick' }];
      labels = undefined;
    }
  } else {
    labels = Array.from({length:history[Object.keys(COMPANIES)[0]].length},(_,i)=>i+1);
    let i=0;
    for(const c in COMPANIES){
      datasets.push({ label:c, data:history[c], borderColor:COLORS[i%COLORS.length], backgroundColor:'transparent', tension:0.15 });
      i++;
    }
  }

  chart = new Chart(ctx, { type:type==='line'?'line':'candlestick', data:{labels,datasets}, options:{
    responsive:true,
    maintainAspectRatio:false,
    plugins:{ legend:{position:'right', labels:{boxWidth:10,font:{size:10}}} },
    scales:{ x:{ grid:{color:'rgba(255,255,255,0.12)'}, ticks:{color:'white'} }, y:{ grid:{color:'rgba(255,255,255,0.12)'}, ticks:{color:'white'} } }
  }});
}

document.addEventListener('DOMContentLoaded',()=>{
  companyList = document.getElementById('companyList');
  balLbl = document.getElementById('balLbl');
  dayLbl = document.getElementById('dayLbl');
  startBtn = document.getElementById('startBtn');
  username = document.getElementById('username');
  nextDayBtn = document.getElementById('nextDay');
  selChart = document.getElementById('selChart');
  leaderboardBody = document.querySelector('#leaderboard tbody');
  allGraphBtn = document.getElementById('allGraphBtn');
  const canvas=document.getElementById('chart'); ctx=canvas.getContext('2d');

  buildCompanyRows();
  refreshUI();

  nextDayBtn.addEventListener('click',nextDay);
  selChart.addEventListener('change',drawChart);
  allGraphBtn.addEventListener('click',()=>{currentCompany=null; drawChart();});
  document.getElementById('resetLeaderboard').addEventListener('click',()=>{
    if(confirm('Reset leaderboard?')){ leaderboard={}; localStorage.removeItem('lb'); refreshLeader(); alert('Leaderboard reset!'); }
  });
});