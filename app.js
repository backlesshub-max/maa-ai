// ----- Helpers -----
function normalizeText(s){
  return (s || "")
    .toLowerCase()
    .replace(/['"]/g,"")
    .replace(/[^a-z0-9\s]/g," ")
    .replace(/\s+/g," ")
    .trim();
}

// Levenshtein distance
function levenshtein(a, b){
  a = a || ""; b = b || "";
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, () => new Array(n+1).fill(0));
  for(let i=0;i<=m;i++) dp[i][0]=i;
  for(let j=0;j<=n;j++) dp[0][j]=j;
  for(let i=1;i<=m;i++){
    for(let j=1;j<=n;j++){
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i-1][j] + 1,
        dp[i][j-1] + 1,
        dp[i-1][j-1] + cost
      );
    }
  }
  return dp[m][n];
}

function similarity(a, b){
  a = normalizeText(a); b = normalizeText(b);
  if(!a || !b) return 0;
  const dist = levenshtein(a,b);
  return 1 - dist / Math.max(a.length, b.length);
}

function nowTime(){
  return new Date().toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}

// ----- Chat UI -----
const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

function addMessage(text, who="bot"){
  const wrap = document.createElement("div");
  wrap.className = `msg ${who}`;
  wrap.textContent = text;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.textContent = `${who === "user" ? "You" : "Clay AI"} • ${nowTime()}`;

  const holder = document.createElement("div");
  holder.appendChild(wrap);
  holder.appendChild(meta);

  chat.appendChild(holder);
  chat.scrollTop = chat.scrollHeight;
  return wrap;
}

function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }

async function typeWords(el, text, msPerWord=75){
  const words = (text || "").split(/\s+/);
  el.textContent = "";
  for(let i=0;i<words.length;i++){
    el.textContent += (i===0 ? "" : " ") + words[i];
    chat.scrollTop = chat.scrollHeight;
    await sleep(msPerWord);
  }
}

// ----- Knowledge base -----
function buildKnowledge(){
  const ds = window.DATASETS || {};
  const funBuilt = (window.buildFunQA ? window.buildFunQA() : []);
  const all = []
    .concat(ds.climatology || [])
    .concat(ds.assam || [])
    .concat(ds.india || [])
    .concat(ds.self || [])
    .concat(ds.geography || [])
    .concat(funBuilt || []);

  // Add normalized question for faster matching
  return all.map(item => ({
    ...item,
    _nq: normalizeText(item.q),
  }));
}

const KB = buildKnowledge();

function findBestAnswer(userQ){
  const q = normalizeText(userQ);
  if(!q) return null;

  // direct contains keyword shortcut
  const keywordHits = KB.filter(x => x._nq && (q.includes(x._nq) || x._nq.includes(q)));
  if(keywordHits.length) return { best: keywordHits[0], score: 0.99, suggestions: [] };

  // fuzzy search
  let best = null, bestScore = 0;
  const scored = [];

  for(const item of KB){
    const s = similarity(q, item._nq);
    scored.push({item, s});
    if(s > bestScore){
      bestScore = s;
      best = item;
    }
  }

  scored.sort((a,b)=>b.s-a.s);
  const suggestions = scored.slice(0,3).map(x => x.item.q);

  // threshold tuned for typos like "waat is your name"
  if(bestScore >= 0.52) return { best, score: bestScore, suggestions };
  return { best: null, score: bestScore, suggestions };
}

async function reply(userText){
  addMessage(userText, "user");

  // thinking bubble
  const thinkingEl = addMessage("thinking", "bot");
  const dots = document.createElement("span");
  dots.className = "thinkingDots";
  thinkingEl.appendChild(document.createTextNode(" "));
  thinkingEl.appendChild(dots);

  await sleep(5000);

  const result = findBestAnswer(userText);
  let answer = "";

  if(result?.best){
    answer = result.best.a;
  }else{
    answer =
`I don't have an exact stored answer for that.
Try one of these:
- ${result?.suggestions?.[0] || "What is climate?"}
- ${result?.suggestions?.[1] || "What is the capital of Assam?"}
- ${result?.suggestions?.[2] || "What is latitude and longitude?"}`;
  }

  // typewriter (word-by-word)
  await typeWords(thinkingEl, answer, 70);
}

// ----- Events -----
function autoGrow(){
  input.style.height = "auto";
  input.style.height = Math.min(input.scrollHeight, 160) + "px";
}

sendBtn.addEventListener("click", async ()=>{
  const text = input.value.trim();
  if(!text) return;
  input.value = "";
  autoGrow();
  await reply(text);
});

input.addEventListener("input", autoGrow);

input.addEventListener("keydown", (e)=>{
  if(e.key === "Enter" && !e.shiftKey){
    e.preventDefault();
    sendBtn.click();
  }
});

// Welcome
addMessage("CHAT WITH ME", "bot");
