document.addEventListener('DOMContentLoaded', () => {
  const $ = s => document.querySelector(s);
  const sleep = ms => new Promise(r=>setTimeout(r,ms));

  const s1 = $('#stage-1'), s2 = $('#stage-2'), s3 = $('#stage-3');
  const memberId = $('#memberId'), beginBtn = $('#beginBtn');
  const pad = $('#pad'), palm = $('#palmSvg'), scanline = $('#scanline');
  const scanBar = $('#scanBar'), logEl = $('#log'), idLine = $('#idLine'), launchFill = $('#launchFill');
  const music = $('#bgMusic');

  (function(){const c=document.getElementById('matrix'); if(!c) return; const x=c.getContext('2d'); const chars='01░▒▓█ΛΣΦΨΩ₪¥₩シツ'; let col,drop,W,H; function resize(){W=c.width=innerWidth;H=c.height=innerHeight;col=Math.floor(W/16);drop=new Array(col).fill(0);} function step(){x.fillStyle='rgba(0,0,0,0.22)'; x.fillRect(0,0,W,H); x.fillStyle='rgba(255,0,0,0.98)'; x.font='16px monospace'; for(let i=0;i<col;i++){ if(Math.random()>0.96) continue; const t=chars[Math.floor(Math.random()*chars.length)]; x.fillText(t,i*16,drop[i]*16); if(drop[i]*16>H&&Math.random()>0.975){drop[i]=0} drop[i]++; } requestAnimationFrame(step);} addEventListener('resize',resize,{passive:true}); resize(); step(); })();

  function startMusic(){ try{ music.muted=false; music.play(); }catch(e){} }
  document.body.addEventListener('pointerdown', startMusic, {once:true, passive:true});

  function show(el){ [s1,s2,s3].forEach(sec => sec && sec.classList.add('hidden')); el.classList.remove('hidden'); el.classList.add('active'); }
  function log(msg){ if(!logEl) return; const t = new Date().toLocaleTimeString(); logEl.textContent += `\n${t}  ${msg}`; logEl.parentElement.scrollTop = logEl.parentElement.scrollHeight; }

  function toStage2(){
    show(s2);
    scanBar.style.width = '0%';
    palm && palm.classList.remove('pulse');
    if(scanline){ scanline.style.display='none'; scanline.style.top='-46px'; }
    logEl.textContent = '';
    const id = (memberId.value || 'Guest').trim();
    log(`Member ID received: ${id}`);
    log('Awaiting palm placement… You have 5 seconds to place your palm.');
    pad && pad.focus();
    // Auto-start scan after 5 seconds (give user time to place palm)
    setTimeout(()=>{
      log('Starting automatic palm scan...');
      runPalmScan();
    }, 5000);
  }
  beginBtn?.addEventListener('click', (e)=>{ e.preventDefault(); toStage2(); });
  beginBtn?.addEventListener('touchstart', (e)=>{ e.preventDefault(); toStage2(); }, {passive:false});
  memberId?.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); toStage2(); } });
  $('#backToId')?.addEventListener('click', ()=>{ show(s1); memberId.focus(); });

  const scanMs = 10000; let scanning = false;
  async function runPalmScan(){
    if(scanning) return; scanning = true
  }
  async function runPalmScan(){
    if(scanning) return;
    scanning = true;
    startMusic();
    palm && palm.classList.add('pulse');
    if(scanline){
      scanline.style.display='block'; scanline.style.transition='none'; scanline.style.top='-46px';
      requestAnimationFrame(()=>{ scanline.style.transition=`top ${scanMs}ms linear`; scanline.style.top='100%'; });
    }
    log('Scanning palm topology…');
    const steps = Math.ceil(scanMs / 100);
    for(let i=0;i<=steps;i++){
      await sleep(100);
      const pct = Math.min(100, Math.round((i/steps)*100));
      scanBar.style.width = pct + '%';
      if(i===10) log('Analyzing ridge data…');
      if(i===30) log('Thermal & pulse check…');
      if(i===55) log('Liveness model: PASS');
      if(i===80) log('Entropy score: HIGH');
    }
    authenticate();
  }

  function handlePadTrigger(e){ e && e.preventDefault(); runPalmScan(); }
  pad?.addEventListener('click', handlePadTrigger);
  pad?.addEventListener('touchstart', handlePadTrigger, {passive:false});
  pad?.addEventListener('keydown', (e)=>{ if(e.key===' '||e.key==='Enter'){ e.preventDefault(); handlePadTrigger(e); }});

  async function authenticate(){
    log('Matching identity…');
    await sleep(600);
    const id = (memberId.value || 'Guest').trim();
    show(s3);
    idLine.textContent = 'User ' + id + ' identified — proceeding…';
    idLine.classList.remove('hidden');
    const launchMs = 22000;
    for(let i=0;i<=100;i++){
      await sleep(launchMs/100);
      launchFill.style.width = i + '%';
    }
    const params = new URLSearchParams(location.search);
    const target = params.get('redirect') || 'https://slvlog.live';
    location.href = target;
  }
});
