/* ---------- Helpers ---------- */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dstr=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const ord=n=>n+(["th","st","nd","rd"][(n%100>10&&n%100<14)?0:Math.min(n%10,4)%4]||"th");
const {PTS,AVATARS,QUOTES,belt,PROBLEMS,PUBLIC_TESTS}=window.CodeDojoData;
const {UKEY,store,state,save,getUser,setUser,clearUser}=window.CodeDojoStorage;

function calcStreak(){let n=0;const d=new Date();if(!state.activity[dstr(d)])d.setDate(d.getDate()-1);while(state.activity[dstr(d)]){n++;d.setDate(d.getDate()-1)}return n}
const memberStats=m=>m.me?{score:state.score,streak:calcStreak(),solved:Object.keys(state.solved).length}:{score:m.score,streak:m.streak,solved:Math.round(m.score/12)};
function teamTotals(t){let base=0,bonus=0,solved=0;t.members.forEach(m=>{const s=memberStats(m);base+=s.score;bonus+=s.streak*5;solved+=s.solved});return{base,bonus,solved,total:base+bonus}}
const ranked=()=>[...state.teams].map(t=>({t,...teamTotals(t)})).sort((a,b)=>b.total-a.total);
const myTeam=()=>state.teams.find(t=>t.id===state.teamId);
const myRank=()=>{const i=ranked().findIndex(r=>r.t.id===state.teamId);return i<0?null:i+1};

/* ---------- Motivation: toast, confetti, rotating quotes ---------- */
let toastTimer;
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),3800)}
function confetti(){["🎉","⭐","🔥","✨","🥋","🚀"].forEach((e,k)=>{for(let i=0;i<4;i++){const b=document.createElement("span");b.className="bit";b.textContent=e;b.style.setProperty("--x",(Math.random()*560-280)+"px");b.style.setProperty("--y",(-Math.random()*360-80)+"px");b.style.setProperty("--r",(Math.random()*540-270)+"deg");document.body.appendChild(b);setTimeout(()=>b.remove(),1400)}})}
let qi=0;setInterval(()=>{qi=(qi+1)%QUOTES.length;$$(".quote").forEach(q=>{q.textContent=QUOTES[qi];q.style.animation="none";q.offsetWidth;q.style.animation=""})},6000);
const greet=()=>{const h=new Date().getHours();return h<12?"Good morning":h<18?"Good afternoon":"Good evening"};

/* ---------- Pages: sign up and home ---------- */
function page(name){$$(".page").forEach(p=>p.classList.toggle("on",p.id===name));document.body.classList.toggle("home",name==="home")}
function route(){const u=getUser(),h=location.hash.slice(1);
  if(!u){if(h!=="signup")location.hash="signup";page("signup")}
  else{if(h!=="home")location.hash="home";page("home");if(state.name==="You"||!state.name){state.name=u.name;save()}showView(currentView)}
  window.scrollTo(0,0)}
addEventListener("hashchange",route);
function login(u){setUser(u);if(state.name==="You")state.name=u.name;save();route();toast("Welcome to the dojo, "+u.name+"! This is demo-only browser session.")}
$("#chain").innerHTML=[...Array(7)].map((_,n)=>`<i style="--n:${n}">🔥</i>`).join("");
$("#q1").textContent=QUOTES[0];
$("#auth").onsubmit=e=>{e.preventDefault();const email=$("#email").value.trim(),inputName=$("#fname").value.trim();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){const el=$("#err");el.textContent="Enter a valid email address.";el.hidden=false;return}
  if(inputName&&inputName.length<2){const el=$("#err");el.textContent="Display names must have at least 2 characters.";el.hidden=false;return}
  if(inputName.length>20){const el=$("#err");el.textContent="Use a display name with 20 characters or fewer.";el.hidden=false;return}
  const suggestedName=email.split("@")[0].slice(0,20);
  const name=inputName||(suggestedName.length>=2?suggestedName:"Coder");
  $("#err").hidden=true;login({name,email,demo:true})};
$("#logout").onclick=()=>{clearUser();location.hash="signup";route()};
$("#theme").onclick=()=>{const r=document.documentElement,dark=r.dataset.theme?r.dataset.theme==="dark":matchMedia("(prefers-color-scheme: dark)").matches;r.dataset.theme=dark?"light":"dark"};

/* ---------- Navigation ---------- */
let currentView="daily";
function showView(name){currentView=name;$$(".view").forEach(v=>v.classList.toggle("active",v.id==="view-"+name));$$("#nav button").forEach(b=>{const active=b.dataset.view===name;b.classList.toggle("active",active);if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});renderView(name)}
function renderView(name){({daily:renderDaily,problems:renderProblems,teams:renderTeams,leaderboard:renderLeaderboard,profile:renderProfile}[name]||(()=>{}))();
  const b=belt(state.score);$("#cName").textContent=state.name;$("#cBelt").textContent=b.name+" belt";$("#cDot").style.background=b.col;$("#cStreak").textContent=calcStreak();$("#cScore").textContent=state.score}
$("#nav").addEventListener("click",e=>{if(e.target.dataset.view)showView(e.target.dataset.view)});

/* ---------- Daily hub ---------- */
const dailyProblem=()=>PROBLEMS[Math.floor(new Date().setHours(0,0,0,0)/86400000)%PROBLEMS.length];
const badge=d=>`<span class="badge ${d}">${d}</span>`;
const tagsHtml=t=>`<div class="tags">${t.map(x=>`<span class="tag">${esc(x)}</span>`).join("")}</div>`;
const fmt=t=>`Input: ${t.args.map(a=>JSON.stringify(a)).join(", ")}<br>Output: ${JSON.stringify(t.expected)}`;
function renderDaily(){const p=dailyProblem(),done=!!state.solved[p.id],s=calcStreak(),b=belt(state.score);
  $("#view-daily").innerHTML=`<div class="card hero">
    <div class="row muted"><span>${greet()}, ${esc(state.name)}</span><span class="sp"></span><span>Next problem in <b class="count" id="countdown"></b></span></div>
    <h1>${esc(p.title)} ${badge(p.difficulty)}</h1>${tagsHtml(p.tags)}
    <p class="st">${esc(p.statement)}</p><div class="ex">${fmt(p.tests[0])}</div>
    <p class="muted" style="margin-bottom:14px">Constraints: ${p.constraints.map(esc).join(" · ")}</p>
    <div class="row"><button class="btn primary" id="solveDaily">${done?"Solved – review":"Solve today’s challenge"}</button>
    <span class="muted">${done?"Today’s chain link is locked in. Try another problem for extra points.":s?`Day ${s} of your streak. One solve keeps it alive.`:"Solve one problem today to light your first streak flame."}</span></div></div>
    <div class="stats"><div class="stat"><b><span class="flame">🔥</span> ${s}</b>Day streak</div><div class="stat"><b>${Object.keys(state.solved).length}/${PROBLEMS.length}</b>Problems solved</div><div class="stat"><b>${myRank()?ord(myRank()):"–"}</b>Team rank</div></div>
    <div class="card" style="margin-bottom:16px"><div class="row"><b>${b.name} belt</b><span class="sp"></span><span class="muted">${b.next?`${b.need} pts to ${b.next} belt`:"You reached the top belt"}</span></div><div class="bar"><i style="--w:${b.pct}%"></i></div>
    <p class="quote muted" style="margin-top:14px">${QUOTES[qi]}</p></div>`;
  $("#solveDaily").onclick=()=>openProblem(p.id);tickCountdown()}
function tickCountdown(){const el=$("#countdown");if(!el)return;const n=new Date(),m=new Date(n);m.setHours(24,0,0,0);const s=Math.floor((m-n)/1000);el.textContent=[Math.floor(s/3600),Math.floor(s/60)%60,s%60].map(x=>String(x).padStart(2,"0")).join(":")}
setInterval(tickCountdown,1000);

/* ---------- Problem list ---------- */
(function(){const tags=[...new Set(PROBLEMS.flatMap(p=>p.tags))].sort();$("#tagFilter").innerHTML=`<option value="">All topics</option>`+tags.map(t=>`<option>${esc(t)}</option>`).join("");["searchInput","tagFilter","diffFilter"].forEach(id=>$("#"+id).addEventListener("input",renderProblems))})();
function renderProblems(){const q=$("#searchInput").value.toLowerCase(),tag=$("#tagFilter").value,diff=$("#diffFilter").value;
  const list=PROBLEMS.filter(p=>(!q||p.title.toLowerCase().includes(q))&&(!tag||p.tags.includes(tag))&&(!diff||p.difficulty===diff));
  $("#problemList").innerHTML=list.length?list.map(p=>`<div class="card pcard" data-id="${p.id}"><div class="row"><b>${esc(p.title)}</b><span class="sp"></span>${state.solved[p.id]?"✅":""}</div><div class="row" style="margin-top:8px">${badge(p.difficulty)}<span class="muted">+${PTS[p.difficulty]} pts</span></div>${tagsHtml(p.tags)}</div>`).join(""):`<p class="muted">No problems match. Clear a filter to see more.</p>`;
  $$("#problemList .pcard").forEach(c=>c.onclick=()=>openProblem(+c.dataset.id))}

/* ---------- Workspace ---------- */
let cur=null,lang="javascript",lastRun=null;const openedAt={},failCount={};
const starter=(p,l)=>l==="python"?`def ${p.pyFn}(${p.params.join(", ")}):\n    # write your solution here\n    pass\n`:`function ${p.fn}(${p.params.join(", ")}) {\n  // write your solution here\n}\n`;
const draftKey=()=>`${cur.id}:${lang}`;
const code=$("#code");
code.addEventListener("input",()=>{if(cur){state.drafts[draftKey()]=code.value;save()}});
code.addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();code.setRangeText("  ",code.selectionStart,code.selectionEnd,"end")}});
$("#langSelect").onchange=e=>{lang=e.target.value;if(cur)loadEditor()};
$("#resetBtn").onclick=()=>{if(cur&&confirm("Reset to starter code?")){code.value=starter(cur,lang);state.drafts[draftKey()]=code.value;save()}};
$("#runBtn").onclick=()=>execute("run");$("#submitBtn").onclick=()=>execute("submit");
const loadEditor=()=>{code.value=state.drafts[draftKey()]??starter(cur,lang)};
function openProblem(id){cur=PROBLEMS.find(p=>p.id===id);openedAt[id]=openedAt[id]||Date.now();$("#results").innerHTML="";showView("workspace");
  $("#problemPane").innerHTML=`<div class="row"><h2>${esc(cur.title)}</h2>${badge(cur.difficulty)}${state.solved[cur.id]?"✅":""}</div>${tagsHtml(cur.tags)}<p>${esc(cur.statement)}</p><h4>Examples</h4>${cur.tests.slice(0,2).map(t=>`<div class="ex">${fmt(t)}</div>`).join("")}<h4>Constraints</h4><ul>${cur.constraints.map(c=>`<li>${esc(c)}</li>`).join("")}</ul><p class="muted">Write <code>${cur.fn}</code> (JavaScript) or <code>${cur.pyFn}</code> (Python). Run tests uses ${PUBLIC_TESTS} public cases; Submit also checks ${cur.tests.length-PUBLIC_TESTS} hidden ones.</p>`;
  lastRun=null;$("#coachExplain").disabled=false;$("#coachHint").disabled=false;$("#coachReview").disabled=false;
  $("#coachOutput").textContent=`Coach ready for ${cur.title}. Ask for an explanation, a hint, or a review after running tests.`;
  loadEditor();window.scrollTo(0,0)}

$("#coachExplain").onclick=()=>{if(!cur)return;const fn=lang==="python"?cur.pyFn:cur.fn,expected=cur.tests[0].expected,type=Array.isArray(expected)?"array":typeof expected,article=type==="array"||type==="object"?"an":"a";
  $("#coachOutput").textContent=`${cur.statement}\n\nImplement ${fn}(${cur.params.join(", ")}) and return ${article} ${type}. For the first example, the expected result is ${JSON.stringify(expected)}.`};
$("#coachHint").onclick=()=>{if(cur)$("#coachOutput").textContent=`Hint: ${cur.hint}`};
$("#coachReview").onclick=()=>{if(!cur)return;
  if(!lastRun||lastRun.pid!==cur.id){$("#coachOutput").textContent="Run the tests for this problem first, then I can help review the result.";return}
  if(lastRun.error){$("#coachOutput").textContent=`The test runner could not complete: ${lastRun.error}`;return}
  if(lastRun.results.some(r=>r.tle)){$("#coachOutput").textContent="A test exceeded the time limit. Look for repeated work and consider a more efficient approach.";return}
  const publicResults=lastRun.results.slice(0,PUBLIC_TESTS),failedIndex=publicResults.findIndex(r=>!r.pass);
  if(failedIndex>=0){const result=publicResults[failedIndex];
    $("#coachOutput").textContent=result.err?`Public test ${failedIndex+1} raised an error: ${result.err}`:`Public test ${failedIndex+1} expected ${JSON.stringify(cur.tests[failedIndex].expected)} but got ${JSON.stringify(result.got)}. Check the return value and edge cases.`;
    return}
  if(lastRun.results.slice(PUBLIC_TESTS).some(r=>!r.pass)){$("#coachOutput").textContent="All public tests passed, but one or more hidden tests failed. Recheck boundary cases and the constraints; hidden inputs and expected answers are not shown.";return}
  $("#coachOutput").textContent=lastRun.kind==="run"?"All public tests passed. Submit to check the hidden tests.":`All ${lastRun.results.length} tests passed. Nice work!`};

/* ---------- Test runner (Web Worker with time limit) ---------- */
function workerFn(){self.onmessage=e=>{const{code,fn,args}=e.data;try{const f=new Function(code+"\nreturn typeof "+fn+' === "function" ? '+fn+" : undefined;")();if(!f)return self.postMessage({error:'Function "'+fn+'" not found'});try{const r=f(...args);self.postMessage({got:r===undefined?null:r})}catch(err){self.postMessage({err:String(err)})}}catch(err){self.postMessage({error:String(err)})}}}
let wUrl;try{wUrl=URL.createObjectURL(new Blob(["("+workerFn.toString()+")()"],{type:"text/javascript"}))}catch{}
let wOK;const probe=()=>wOK??=new Promise(r=>{try{const w=new Worker(wUrl),t=setTimeout(()=>{w.terminate();r(false)},1500);w.onmessage=()=>{clearTimeout(t);w.terminate();r(true)};w.onerror=()=>{clearTimeout(t);w.terminate();r(false)};w.postMessage({code:"",fn:"x",args:[]})}catch{r(false)}});
function runOneJs(c,fn,args,limit=1500){return new Promise(res=>{const w=new Worker(wUrl),t=setTimeout(()=>{w.terminate();res({tle:true})},limit);w.onmessage=e=>{clearTimeout(t);w.terminate();res(e.data)};w.onerror=e=>{clearTimeout(t);w.terminate();res({error:e.message})};w.postMessage({code:c,fn,args})})}
const PYODIDE_BASE_URL="https://cdn.jsdelivr.net/npm/pyodide@0.26.4/";
const PYODIDE_SCRIPT_INTEGRITY="sha384-i3R37b3tF+HWudsUf1VSEOY2YxwSNMqY8DQa9Z0O3xh+NkJ9o+yjcGyIi5huj+nB";
let pyP=null;
function getPy(){if(!pyP)pyP=new Promise((res,rej)=>{const s=document.createElement("script");s.src=PYODIDE_BASE_URL+"pyodide.js";s.integrity=PYODIDE_SCRIPT_INTEGRITY;s.crossOrigin="anonymous";s.onload=()=>loadPyodide({indexURL:PYODIDE_BASE_URL}).then(res,()=>{pyP=null;rej(new Error("The Python runtime could not start here. JavaScript works everywhere."))});s.onerror=()=>{pyP=null;rej(new Error("Could not load the verified Python runtime. Check your connection or use JavaScript."))};document.head.appendChild(s)});return pyP}
async function runPython(c,p,tests){const py=await getPy();try{py.globals.delete(p.pyFn)}catch{}py.runPython(c);const fn=py.globals.get(p.pyFn);if(!fn)throw new Error(`Function "${p.pyFn}" not found`);
  return tests.map(t=>{try{const args=t.args.map(a=>py.toPy(a));let r=fn(...args);if(r&&r.toJs){const j=r.toJs({dict_converter:Object.fromEntries});r.destroy&&r.destroy();r=j}args.forEach(a=>a&&a.destroy&&a.destroy());return{got:r}}catch(e){return{err:String(e.message||e).trim().split("\n").slice(-1)[0]}}})}
async function evaluate(c,tests){let raw=[];
  if(lang==="python")raw=await runPython(c,cur,tests);
  else{if(!wUrl||!await probe())throw new Error("JavaScript test workers are unavailable in this browser. Try a modern browser with Web Worker support.");for(const t of tests){const a=JSON.parse(JSON.stringify(t.args)),r=await runOneJs(c,cur.fn,a);if(r.error)throw new Error(r.error);raw.push(r);if(r.tle)break}}
  return tests.map((t,i)=>{const r=raw[i];if(!r)return{skipped:true};if(r.tle)return{tle:true};if(r.err)return{err:r.err};return{got:r.got,pass:JSON.stringify(r.got)===JSON.stringify(t.expected)}})}
async function execute(kind){if(!cur)return toast("Open a problem first.");
  const tests=kind==="run"?cur.tests.slice(0,PUBLIC_TESTS):cur.tests,box=$("#results"),btns=[$("#runBtn"),$("#submitBtn")];
  btns.forEach(b=>b.disabled=true);box.innerHTML=`<p class="muted" style="margin-top:12px">${lang==="python"?"Running (the first Python run loads the runtime)…":"Running…"}</p>`;
  let res;try{res=await evaluate(code.value,tests)}catch(e){lastRun={pid:cur.id,error:e.message};box.innerHTML=`<div class="verdict bad">Error</div><div class="case fail"><span>${esc(e.message)}</span></div>`;btns.forEach(b=>b.disabled=false);return}
  btns.forEach(b=>b.disabled=false);
  const verdict=res.some(r=>r.tle)?"Time Limit Exceeded":res.every(r=>r.pass)?"Accepted":"Wrong Answer";
  lastRun={pid:cur.id,kind,verdict,results:res};
  box.innerHTML=`<div class="verdict ${verdict==="Accepted"?"Accepted":"bad"}">${verdict}${kind==="run"?" (public tests)":""}</div>`+res.map((r,i)=>{const t=tests[i],hidden=i>=PUBLIC_TESTS;if(r.skipped)return"";
    const st=r.tle?"TLE":r.pass?"PASSED":"FAILED",d=hidden?"Hidden test case":`Input: ${t.args.map(a=>JSON.stringify(a)).join(", ")}<br>Expected: ${JSON.stringify(t.expected)}<br>Got: ${r.err?esc(r.err):r.tle?"–":esc(JSON.stringify(r.got))}`;
    return`<div class="case ${r.pass?"pass":"fail"}"><span class="s">${st}</span><span>${d}</span></div>`}).join("");
  if(verdict!=="Accepted"){failCount[cur.id]=(failCount[cur.id]||0)+1;box.innerHTML+=failCount[cur.id]>=3?`<div class="hint">💡 <b>Hint:</b> ${esc(cur.hint)}</div>`:`<p class="muted" style="margin-top:8px">Not yet. Read the failing case and try again. A hint unlocks after 3 misses.</p>`}
  else if(kind==="run")box.innerHTML+=`<p class="muted" style="margin-top:8px">Public tests pass. Submit to check the hidden ones and earn points.</p>`;
  if(kind==="submit")recordSubmission(verdict)}
function recordSubmission(verdict){state.submissions.push({pid:cur.id,verdict,ts:Date.now(),lang});
  if(verdict==="Accepted"){const today=dstr(new Date());state.activity[today]=(state.activity[today]||0)+1;confetti();
    if(!state.solved[cur.id]){const before=myRank(),bb=belt(state.score).name,secs=(Date.now()-openedAt[cur.id])/1000,speed=Math.max(0,10-Math.floor(secs/120)),pts=PTS[cur.difficulty]+speed;
      state.solved[cur.id]={points:pts,date:today};state.score+=pts;const after=myRank(),nb=belt(state.score).name;
      let msg=`🎉 Accepted! +${pts} pts (${speed} speed bonus)`;if(nb!==bb)msg+=` · New belt: ${nb}!`;if(before&&after&&after!==before)msg+=` · Your team moved from ${ord(before)} to ${ord(after)}!`;toast(msg)}
    else toast("Accepted. Already solved, so no extra points.")}
  else toast(verdict+". Every miss is a lesson.");
  save();renderView(currentView)}

/* ---------- Teams ---------- */
let pickedAvatar=AVATARS[0];
function renderTeams(){const t=myTeam(),v=$("#view-teams");
  if(t){const tt=teamTotals(t);
    v.innerHTML=`<div class="card"><div class="row" style="gap:16px;margin-bottom:14px"><div class="avatar">${t.avatar}</div><div><h2>${esc(t.name)}</h2><span class="muted">${t.members.length}/4 members · ${ord(myRank())} place · ${tt.total} pts</span></div><span class="sp"></span><button class="btn danger" id="leaveBtn">Leave team</button></div>
    ${t.members.map(m=>{const s=memberStats(m);return`<div class="member"><span>${esc(m.name)}${m.me?" (you)":""}</span><span class="muted">${s.score} pts · 🔥 ${s.streak}</span></div>`}).join("")}
    ${t.members.length<4?`<div class="row" style="margin-top:14px"><input type="text" id="newMember" placeholder="Add a teammate’s name" style="flex:1;width:auto"><button class="btn" id="addMember">Add</button></div>`:""}
    ${t.members.length<3?`<p class="muted" style="margin-top:10px">Squads work best with 3–4 members.</p>`:""}</div>`;
    $("#leaveBtn").onclick=()=>{t.members=t.members.filter(m=>!m.me);state.teamId=null;save();toast("You left the team.");renderView("teams")};
    const add=$("#addMember");if(add)add.onclick=()=>{const n=$("#newMember").value.trim();if(n.length<2)return toast("Enter a teammate name with at least 2 characters.");if(n.length>20)return toast("Teammate names must be 20 characters or fewer.");if(t.members.length>=4)return toast("This squad is full.");t.members.push({name:n,score:0,streak:0});save();renderView("teams")};
  }else{
    v.innerHTML=`<div class="two"><div class="card"><h3>Create a squad</h3><input type="text" id="teamName" placeholder="Squad name" maxlength="24"><div class="picker" id="picker">${AVATARS.map(a=>`<button data-a="${a}" class="${a===pickedAvatar?"sel":""}">${a}</button>`).join("")}</div><button class="btn primary" id="createTeam">Create squad</button></div>
    <div class="card"><h3>Join a squad</h3>${state.teams.map(t=>`<div class="member"><span class="row"><span class="avatar sm">${t.avatar}</span>${esc(t.name)} <span class="muted">(${t.members.length}/4)</span></span>${t.members.length<4?`<button class="btn" data-join="${t.id}">Join</button>`:`<span class="muted">Full</span>`}</div>`).join("")}</div></div>`;
    $("#picker").onclick=e=>{if(e.target.dataset.a){pickedAvatar=e.target.dataset.a;$$("#picker button").forEach(b=>b.classList.toggle("sel",b.dataset.a===pickedAvatar))}};
    $("#createTeam").onclick=()=>{const name=$("#teamName").value.trim();if(name.length<2)return toast("Give your squad a name with at least 2 characters.");if(name.length>24)return toast("Squad names must be 24 characters or fewer.");const t={id:"t"+Date.now(),name,avatar:pickedAvatar,members:[{name:state.name,me:true}]};state.teams.push(t);state.teamId=t.id;save();toast(`Squad “${name}” created. Invite two more teammates.`);renderView("teams")};
    $$("[data-join]").forEach(b=>b.onclick=()=>{const t=state.teams.find(x=>x.id===b.dataset.join);if(!t||t.members.length>=4)return toast("That squad is already full.");if(t.members.some(m=>m.me))return toast("You already joined this squad.");t.members.push({name:state.name,me:true});state.teamId=t.id;save();toast(`Joined ${t.name}!`);renderView("teams")})}}

/* ---------- Leaderboard (refreshes every 5 seconds) ---------- */
function renderLeaderboard(){const rows=ranked();
  $("#view-leaderboard").innerHTML=`<div class="card"><div class="row"><h2>🏆 Team contest leaderboard</h2><span class="sp"></span><span class="live">Live · refreshes every 5s</span></div>
  <p class="muted" style="margin-bottom:10px">Team score = member points + a streak bonus of 5 points per streak day per member.</p>
  <div class="tw"><table><thead><tr><th>#</th><th>Team</th><th>Solves</th><th>Member pts</th><th>Streak bonus</th><th>Total</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${r.t.id===state.teamId?"me":""}"><td>${i+1}</td><td><span class="row"><span class="avatar sm">${r.t.avatar}</span>${esc(r.t.name)}${r.t.members.length<3?' <span class="tag">recruiting</span>':""}</span></td><td>${r.solved}</td><td>${r.base}</td><td>+${r.bonus}</td><td><b>${r.total}</b></td></tr>`).join("")}</tbody></table></div>
  <label class="muted" style="display:block;margin-top:14px"><input type="checkbox" id="simToggle" ${state.simulate?"checked":""}> Simulate rival teams solving problems (demo)</label></div>`;
  $("#simToggle").onchange=e=>{state.simulate=e.target.checked;save()}}
setInterval(()=>{
  if(state.simulate&&Math.random()<.35){const rv=state.teams.filter(t=>t.id!==state.teamId&&t.members.some(m=>!m.me));if(rv.length){const t=rv[Math.floor(Math.random()*rv.length)],ms=t.members.filter(m=>!m.me);ms[Math.floor(Math.random()*ms.length)].score+=10;save()}}
  if(currentView==="leaderboard"&&getUser()){const b=myRank();renderView("leaderboard");const a=myRank();if(b&&a&&a>b)toast(`⚠️ A rival overtook you. You’re now ${ord(a)}. Time to solve one more!`)}},5000);

/* ---------- Profile + streak calendar ---------- */
function renderProfile(){const weeks=20,end=new Date(),start=new Date(end);start.setDate(end.getDate()-end.getDay()-(weeks-1)*7);
  let cells="";for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){const n=state.activity[dstr(d)]||0;cells+=`<div class="cell l${Math.min(4,n)}" title="${dstr(d)}: ${n} accepted"></div>`}
  const solved=Object.entries(state.solved).map(([id,s])=>({p:PROBLEMS.find(x=>x.id==id),s})),b=belt(state.score);
  $("#view-profile").innerHTML=`<div class="card" style="margin-bottom:16px"><div class="row"><input type="text" id="nameInput" value="${esc(state.name)}" maxlength="20" style="width:auto;flex:1;min-width:160px"><button class="btn" id="saveName">Save name</button><span class="sp"></span><button class="btn danger" id="resetAll">Reset all data</button></div></div>
  <div class="stats"><div class="stat"><b>${solved.length}</b>Solved</div><div class="stat"><b>${state.score}</b>Points</div><div class="stat"><b>${calcStreak()}</b>Current streak</div><div class="stat"><b>${state.submissions.length}</b>Submissions</div><div class="stat"><b>${b.name}</b>Belt</div></div>
  <div class="card" style="margin-bottom:16px"><h3>Daily challenge streak calendar</h3><div class="heat">${cells}</div></div>
  <div class="card"><h3>Solved problems</h3>${solved.length?solved.map(({p,s})=>`<div class="member"><span>${esc(p.title)} ${badge(p.difficulty)}</span><span class="muted">+${s.points} pts · ${s.date}</span></div>`).join(""):`<p class="muted">Nothing solved yet. Open the Daily tab and crack today’s challenge.</p>`}</div>`;
  $("#saveName").onclick=()=>{const n=$("#nameInput").value.trim();if(n.length<2)return toast("Use a name with at least 2 characters.");if(n.length>20)return toast("Names must be 20 characters or fewer.");state.name=n;const t=myTeam();if(t)t.members.forEach(m=>m.me&&(m.name=n));const u=getUser();if(u)setUser({...u,name:n});save();toast("Name saved.");renderView("profile")};
  $("#resetAll").onclick=()=>{if(confirm("Erase all progress?")){store.del(KEY);location.reload()}}}

route();
