const SAMPLE=`Histology|Study of tissues
Extracellular matrix|Material between cells
Epithelium|Protective covering of body surfaces; forms glands
Apical (free) surface|Exposed top surface
Basal surface|Bottom surface, attached to basement membrane
Lateral surface|Side surfaces next to neighbouring cells
Basement membrane|Acellular "glue" made by epithelium and connective tissue
Avascular|No blood vessels
Lumen|Open space inside a tube or organ
Microvilli (brush border)|Increase surface area for absorption or secretion
Cilia|Move materials across the cell surface
Goblet cells|Produce and secrete mucus
Simple|One layer of cells
Stratified|Multiple layers of cells
Pseudostratified|Looks layered, but all cells touch the basement membrane
Transitional|Stratified; cells change shape when stretched
Squamous|Flat, scale-like
Cuboidal|Cube-shaped
Columnar|Tall, narrow
Keratinized|Dead surface cells (skin)
Nonkeratinized|Living, moist surface cells (mouth)
Simple squamous|One layer of flat cells; diffusion, filtration, secretion
Simple cuboidal|One layer of cubes; secretion and absorption
Simple columnar|One layer of tall cells; secretion, absorption, moving particles
Pseudostratified columnar|Ciliated with goblet cells; secretes and moves mucus
Stratified squamous|Layers flatten toward surface; protects against abrasion, UV, water loss, infection
Transitional epithelium|Stretches with volume; protects against urine
Endothelium|Simple squamous lining of blood vessels
Alveoli|Air sacs of the lungs
Bowman's capsule|Kidney filtering structure
Serous membrane|Membrane lining body cavities
Bronchioles|Small airways of the lungs
Oocyte|Egg cell
Uterine tube|Carries oocytes to the uterus
Epididymis|Duct where sperm mature and are stored
Distention|Stretching of an organ
Caustic|Corrosive
Gland|Epithelial cells adapted for secretion
Endocrine gland|Ductless; secretes hormones
Exocrine gland|Secretes through ducts to a surface
Hormone|Chemical messenger from endocrine glands
Duct|Tube carrying gland secretions
Thyroid follicle|Hormone-producing cells around stored hormone precursor
Eccrine sweat gland|Exocrine gland in skin`;
const $=s=>document.querySelector(s),app=$('#app');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a};
const uid=()=>Math.random().toString(36).slice(2,9);
const K='deckquiz:v2';
const TOP='<div class="topbar"><button class="back" id="top">&larr; Back</button></div>';
const gs=t=>`<a class="btn" href="https://www.google.com/search?q=${encodeURIComponent(t)}" target="_blank" rel="noopener">Search Google</a>`;
let S={decks:[],cfg:{n:10,dir:'td'}},cur=null,ed=null,view='home',qs=[],qi=0,score=0,answered=null,missed=[],fc={};
try{const s=JSON.parse(localStorage.getItem(K)||'null');if(s)S=s;else{const o=JSON.parse(localStorage.getItem('deckquiz:v1')||'null');
 if(o&&o.raw){const d={id:uid(),name:'My deck',raw:o.raw,ts:o.ts,tsc:o.tsc,cs:o.cs,csc:o.csc};d.cards=parse(d);S.decks.push(d);if(o.cfg)S.cfg=o.cfg}}}catch(e){}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
function sepv(o,k){const v=o[k],c=o[k+'c'];return v==='custom'?c:{tab:'\t',comma:',',nl:'\n',semi:';'}[v]}
function parse(o){const t=sepv(o,'ts'),c=sepv(o,'cs');if(!t||!c)return[];
 return o.raw.replace(/\r\n?/g,'\n').split(c).filter(r=>r.trim()).map(r=>{const i=r.indexOf(t);if(i<0)return null;return{t:r.slice(0,i).trim(),d:r.slice(i+t.length).trim()}}).filter(x=>x&&x.t&&x.d)}
function viewHome(){view='home';
 app.innerHTML=`<h1>Deck Quiz</h1><p class="s">Keep a deck for each topic, then study it as flashcards or a quiz.</p>
 <div class="bar"><button class="p" id="new">New deck</button>${S.decks.some(d=>d.sample)?'':'<button id="samp">Add sample deck (epithelial tissue)</button>'}</div>
 ${S.decks.length?S.decks.map(d=>`<div class="dk"><b>${esc(d.name)}</b><br><span class="m">${d.cards.length} cards</span><div class="bar" data-id="${d.id}"><button data-a="cards" ${d.cards.length?'':'disabled'}>Flashcards</button><button class="p" data-a="quiz" ${d.cards.length<2?'disabled':''}>Quiz</button><button data-a="edit">Edit</button><button data-a="del">Delete</button></div></div>`).join(''):'<p class="s" style="margin-top:20px">No decks yet. Create one to get started.</p>'}`;
 $('#new').onclick=()=>edit({name:'',raw:'',ts:'tab',tsc:'   ',cs:'nl',csc:''});
 const sm=$('#samp');if(sm)sm.onclick=()=>{const d={id:uid(),name:'Epithelial tissue',sample:1,raw:SAMPLE.split('\n').map(l=>l.replace('|','   ')).join('\n'),ts:'custom',tsc:'   ',cs:'nl',csc:''};d.cards=parse(d);S.decks.push(d);save();viewHome()};
 app.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const d=S.decks.find(x=>x.id===b.parentElement.dataset.id),a=b.dataset.a;cur=d;
  if(a==='cards'){fc={cards:shuffle([...d.cards]),i:0,flip:false,front:'t'};viewFC()}
  else if(a==='quiz')viewSetup();
  else if(a==='edit')edit({...d});
  else if(b.dataset.c){S.decks=S.decks.filter(x=>x!==d);save();viewHome()}
  else{b.dataset.c=1;b.textContent='Confirm delete'}})}
function radios(name,items){return items.map(([v,l])=>`<label class="o"><input type="radio" name="${name}" value="${v}" ${ed[name]===v?'checked':''}>${l}</label>`).join('')+
 `<label class="o"><input type="radio" name="${name}" value="custom" ${ed[name]==='custom'?'checked':''}>Custom <input type="text" id="${name}c" value="${esc(ed[name+'c'])}" placeholder="e.g. ---"></label>`}
function edit(o){ed=o;view='edit';const cards=parse(ed);
 app.innerHTML=`${TOP}<h1>${ed.id?'Edit deck':'New deck'}</h1><h2>Deck name</h2><input type="text" id="nm" value="${esc(ed.name)}" placeholder="e.g. Muscle anatomy">
 <h2>Import your data</h2><textarea id="src" placeholder="Word 1&#9;Definition 1&#10;Word 2&#9;Definition 2" aria-label="Paste cards">${esc(ed.raw)}</textarea>
 <div class="row"><div><h2>Between term and definition</h2>${radios('ts',[['tab','Tab'],['comma','Comma']])}</div>
 <div><h2>Between cards</h2>${radios('cs',[['nl','New line'],['semi','Semicolon']])}</div></div>
 <h2>Preview <span class="m" style="font-weight:400">${cards.length} cards</span></h2>
 <div class="prev">${cards.length?cards.map(c=>`<div><b>${esc(c.t)}</b><span>${esc(c.d)}</span></div>`).join(''):'<div><span>Nothing to preview yet.</span></div>'}</div>
 <div class="bar"><button class="p" id="sv" ${cards.length?'':'disabled'}>Save deck</button></div>`;
 const re=()=>{const y=scrollY,a=document.activeElement.id,src=document.activeElement,p=src.selectionStart;edit(ed);scrollTo(0,y);const el=a&&$('#'+a);if(el){el.focus();if(p!=null&&el.setSelectionRange)el.setSelectionRange(p,p)}};
 $('#nm').oninput=e=>ed.name=e.target.value;$('#src').oninput=e=>{ed.raw=e.target.value;re()};
 document.querySelectorAll('input[type=radio]').forEach(r=>r.onchange=()=>{ed[r.name]=r.value;re()});
 ['ts','cs'].forEach(k=>$('#'+k+'c').oninput=e=>{ed[k+'c']=e.target.value;ed[k]='custom';re()});
 $('#sv').onclick=()=>{const d={...ed,name:ed.name.trim()||'Untitled deck',cards:parse(ed)};if(d.id)S.decks=S.decks.map(x=>x.id===d.id?d:x);else{d.id=uid();S.decks.push(d)}save();viewHome()}}
function viewSetup(){view='setup';const c=S.cfg;
 app.innerHTML=`${TOP}<h1>${esc(cur.name)}</h1><p class="s">${cur.cards.length} cards. Set up your quiz.</p>
 <div class="row"><div><label for="n">Questions</label><select id="n">${[5,10,20,50,999].map(n=>`<option value="${n}" ${c.n===n?'selected':''}>${n===999?'All cards':n}</option>`).join('')}</select></div>
 <div><label for="dir">Show</label><select id="dir"><option value="td" ${c.dir==='td'?'selected':''}>Term, pick the definition</option><option value="dt" ${c.dir==='dt'?'selected':''}>Definition, pick the term</option></select></div></div>
 <div class="bar"><button class="p" id="go">Start quiz</button></div>`;
 $('#n').onchange=e=>{c.n=+e.target.value;save()};$('#dir').onchange=e=>{c.dir=e.target.value;save()};
 $('#go').onclick=()=>start(cur.cards)}
function build(cards){const dir=S.cfg.dir,g=x=>dir==='td'?x.d:x.t,f=x=>dir==='td'?x.t:x.d;
 return shuffle([...cards]).slice(0,S.cfg.n).map(c=>{const ans=g(c),seen=new Set([ans]),o=[];
  for(const x of shuffle([...cur.cards])){if(o.length>=3)break;if(!seen.has(g(x))){seen.add(g(x));o.push(g(x))}}
  return{c,q:f(c),ans,opts:shuffle([ans,...o])}})}
function start(cards){qs=build(cards);qi=0;score=0;answered=null;missed=[];viewQ()}
function viewQ(){view='quiz';const q=qs[qi],st=answered===null?0:q.opts[answered]===q.ans?1:2;
 app.innerHTML=`${TOP}<div class="meta"><span>Question ${qi+1} of ${qs.length}</span><span>Score ${score}</span></div><div class="prog"><i style="width:${qi/qs.length*100}%"></i></div>
 <div class="q"><p class="t">${esc(q.q)}</p>${q.opts.map((o,i)=>{const k=answered===i?(st===1?'ok':'no'):'';return `<button class="opt ${k}" data-i="${i}" ${answered!==null?'disabled':''}>${esc(o)}</button>`}).join('')}
 <p class="fb ${st===1?'good':st===2?'bad':''}" aria-live="polite">${st===1?'Correct!':st===2?'Not quite. Try again.':''}</p></div>
 <div class="bar">${st===2?'<button class="p" id="try">Try again</button>':''}${gs(q.q)}</div>`;
 document.querySelectorAll('.opt').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;answered=i;
  if(q.opts[i]===q.ans){if(!q.wrong)score++;viewQ();setTimeout(()=>{if(view==='quiz'&&qs[qi]===q&&answered!==null){answered=null;qi++;qi<qs.length?viewQ():viewDone()}},900)}
  else{if(!q.wrong){q.wrong=1;missed.push(q)}viewQ();const t=$('#try');t&&t.focus()}});
 const t=$('#try');if(t)t.onclick=()=>{answered=null;viewQ();};}
function viewDone(){view='done';const p=Math.round(score/qs.length*100);
 app.innerHTML=`${TOP}<h1>Results</h1><p class="s">${esc(cur.name)}</p><div class="big">${score} / ${qs.length} <span style="font-size:1.2rem;color:var(--mut)">${p}%</span></div>
 ${missed.length?`<h2>Missed</h2>`+missed.map(q=>`<div class="miss"><b>${esc(q.q)}</b><br><span>${esc(q.ans)}</span> ${gs(q.q)}</div>`).join(''):'<p class="s">Perfect score.</p>'}
 <div class="bar"><button class="p" id="again">New random quiz</button>${missed.length?'<button id="retry">Retry missed</button>':''}</div>`;
 $('#again').onclick=()=>start(cur.cards);
 const r=$('#retry');if(r)r.onclick=()=>{const m=missed.map(q=>q.c),n=S.cfg.n;S.cfg.n=999;start(m);S.cfg.n=n};
}
function viewFC(){view='fc';const c=fc.cards[fc.i],t=fc.front==='t',f=t?c.t:c.d,b=t?c.d:c.t,fl=t?'Term':'Definition',bl=t?'Definition':'Term';
 app.innerHTML=`${TOP}<div class="meta"><span>${esc(cur.name)}</span><span>${fc.i+1} / ${fc.cards.length}</span></div><div class="prog"><i style="width:${(fc.i+1)/fc.cards.length*100}%"></i></div>
 <div class="scene"><div class="card3d${fc.flip?' flipped':''}" id="card" role="button" tabindex="0" aria-label="Flashcard, press to flip"><div class="face" aria-hidden="${fc.flip}"><small>${fl}</small>${esc(f)}</div><div class="face back" aria-hidden="${!fc.flip}"><small>${bl}</small>${esc(b)}</div></div></div>
 <div class="nav"><button id="pv" ${fc.i?'':'disabled'}>&larr; Previous</button><button class="p" id="nx" ${fc.i<fc.cards.length-1?'':'disabled'}>Next &rarr;</button></div>
 <p class="s" style="margin:12px 0 0">Tap the card to flip. Arrow keys move between cards.</p>
 <div class="bar"><button id="sh">Shuffle</button><button id="sw">Start with ${t?'definition':'term'}</button>${gs(c.t)}</div>`;
 const card=$('#card'),flip=()=>{fc.flip=!fc.flip;card.classList.toggle('flipped',fc.flip);card.querySelectorAll('.face').forEach((x,i)=>x.setAttribute('aria-hidden',String(i===(fc.flip?0:1))))};
 card.onclick=flip;card.onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();flip()}};
 $('#pv').onclick=()=>go(-1);$('#nx').onclick=()=>go(1);
 $('#sh').onclick=()=>{fc.cards=shuffle(fc.cards);fc.i=0;fc.flip=false;viewFC()};
 $('#sw').onclick=()=>{fc.front=t?'d':'t';fc.flip=false;viewFC()}}
function go(d){const n=fc.i+d;if(n<0||n>=fc.cards.length)return;fc.i=n;fc.flip=false;viewFC();$('#card').focus()}
document.addEventListener('keydown',e=>{if(view!=='fc')return;if(e.key==='ArrowRight')go(1);else if(e.key==='ArrowLeft')go(-1)});
app.addEventListener('click',e=>{if(e.target.closest('#top'))viewHome()});
viewHome();
