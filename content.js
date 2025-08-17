(() => {
  const STORAGE_KEY = 'cgsb_messages_v1';

  const embeddedCSS = `
  /* ===== Sidebar CSS ===== */
  .__cgsb_sidebar { position: fixed; top: 80px; right: 12px; width: 300px; max-height: calc(100vh - 120px); background: #fff; border: 1px solid rgba(15,23,42,0.06); box-shadow: 0 8px 30px rgba(2,6,23,0.18); border-radius: 10px; overflow: hidden; z-index: 2147483647; font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; user-select: none; cursor: grab; transition: right 0.3s ease, opacity 0.3s ease; }
  .__cgsb_sidebar:active { cursor: grabbing; }
  .__cgsb_header { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background: linear-gradient(180deg,#fbfdff,#f7fbff); border-bottom:1px solid #eef2ff; cursor: grab; }
  .__cgsb_title { font-weight:600; font-size:14px; color:#0b1220; }
  .__cgsb_sub { font-size:12px; color:#64748b; }
  .__cgsb_list { overflow:auto; max-height:60vh; padding:8px; display:flex; flex-direction:column; gap:6px; background:white; }
  .__cgsb_item { padding:8px; border-radius:8px; background:#fff; border:1px solid rgba(15,23,42,0.04); cursor:pointer; font-size:13px; color:#0b1220; line-height:1.2; }
  .__cgsb_item:hover { background:#eef8ff; transform: translateY(-1px); transition: .12s; }
  .__cgsb_footer { display:flex; gap:8px; align-items:center; padding:8px; border-top:1px solid #041036ff; background: linear-gradient(180deg,#ffffff,#fbfdff); }
  .__cgsb_btn { padding:6px 8px; border-radius:8px; border:1px solid rgba(15,23,42,0.06); background:white; cursor:pointer; font-size:13px; transition: background-color 0.2s, color 0.2s; }
  .__cgsb_btn:hover { background-color: #3b82f6; color: white; border-color: #3b82f6; }
  .__cgsb_toggle { position: fixed; top: 140px; right: 12px; z-index: 2147483647; background: linear-gradient(135deg, #2563eb, #0ea5e9); color: white; border: none; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; box-shadow: 0 8px 32px rgba(37, 99, 235, 0.6); font-size: 20px; display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease, background 0.3s ease; }
  .__cgsb_toggle:hover { transform: scale(1.1); background: linear-gradient(135deg, #3b82f6, #0284c7); }
  .__cgsb_toggle:active { transform: scale(0.95); }
  .__cgsb_highlight { position: relative; }
  .__cgsb_highlight::before { content: ""; pointer-events: none; position: absolute; top: 0; left: 0; right: 0; bottom: 0; border: 2px solid black; border-radius: 8px; box-sizing: border-box; animation: border-run 2.4s linear infinite; }
  @keyframes border-run { 0%,100{clip-path: polygon(0% 0%,0% 0%,0% 0%,0% 0%);} 25{clip-path: polygon(0% 0%,100% 0%,100% 0%,0% 0%);} 50{clip-path: polygon(0% 0%,100% 0%,100% 100%,0% 100%);} 75{clip-path: polygon(0% 0%,100% 0%,100% 100%,0% 100%);} }
  `;

  function injectCSS(cssText) {
    const style = document.createElement('style');
    style.setAttribute('data-cgsb-style', '1');
    style.textContent = cssText;
    document.head.appendChild(style);
    return style;
  }

  function createSidebar() {
    if (document.querySelector('.__cgsb_sidebar')) return;

    const container = document.createElement('div');
    container.className = '__cgsb_sidebar';
    container.innerHTML = `
      <div class="__cgsb_header" id="cgsb-drag-handle">
        <div>
          <div class="__cgsb_title"><i class="fa-solid fa-comment"></i> ChatJump Pro</div>
          <div class="__cgsb_sub">Click and Jump anywhere</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center">
          <button class="__cgsb_btn" id="cgsb-refresh"><i class="fa-solid fa-arrows-rotate"></i></button>
          <button class="__cgsb_btn" id="cgsb-minimize"><i class="fa-solid fa-minus"></i></button>
        </div>
      </div>
      <div class="__cgsb_list" id="cgsb-list"></div>
      <div class="__cgsb_footer">
        <div style="flex:1" class="__cgsb_sub">Messages: <span id="cgsb-count">0</span></div>
        <button class="__cgsb_btn" id="cgsb-scroll-last"><i class="fa-solid fa-arrow-down"></i></button>
      </div>
    `;
    document.body.appendChild(container);

    const toggle = document.createElement('button');
    toggle.className = '__cgsb_toggle';
    toggle.id = 'cgsb-toggle';
    toggle.innerHTML = '<i class="fa-solid fa-comment-dots"></i>';
    toggle.style.display = 'none';
    document.body.appendChild(toggle);

    document.getElementById('cgsb-minimize').addEventListener('click', () => {
      container.style.display = 'none';
      toggle.style.display = 'flex';
    });

    toggle.addEventListener('click', () => {
      container.style.display = 'block';
      toggle.style.display = 'none';
    });

    document.getElementById('cgsb-refresh').addEventListener('click', () => scanAndRender(true));
    document.getElementById('cgsb-scroll-last').addEventListener('click', () => {
      const data = loadSaved();
      if (!data || data.length === 0) return;
      const last = data[data.length - 1];
      jumpToReply(last);
    });

    makeDraggable(container, document.getElementById('cgsb-drag-handle'));
  }

  function makeDraggable(element, handle) {
    let isDragging = false, startX, startY, startLeft, startTop;
    handle.style.touchAction = 'none';
    handle.addEventListener('pointerdown', e => {
      isDragging = true; startX = e.clientX; startY = e.clientY;
      const rect = element.getBoundingClientRect();
      startLeft = rect.left; startTop = rect.top;
      document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp); document.addEventListener('pointercancel', onUp);
      e.preventDefault();
    });
    function onMove(e) {
      if (!isDragging) return;
      let dx = e.clientX - startX, dy = e.clientY - startY;
      let newLeft = startLeft + dx, newTop = startTop + dy;
      const winWidth = window.innerWidth, winHeight = window.innerHeight, elRect = element.getBoundingClientRect();
      if (newLeft<0) newLeft=0; if (newTop<0) newTop=0; if (newLeft+elRect.width>winWidth) newLeft=winWidth-elRect.width; if (newTop+elRect.height>winHeight) newTop=winHeight-elRect.height;
      element.style.left = newLeft+'px'; element.style.top = newTop+'px'; element.style.right='auto'; element.style.bottom='auto';
    }
    function onUp() { if(!isDragging) return; isDragging=false; document.removeEventListener('pointermove',onMove); document.removeEventListener('pointerup',onUp); document.removeEventListener('pointercancel',onUp);}
  }

  function saveData(arr){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(arr||[]))}catch(e){}}
  function loadSaved(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch(e){return[]}}

  function findChatMain(){let main=document.querySelector('main');if(!main)main=document.querySelector('[role="main"]');return main;}
  function getMessageNodes(){const main=findChatMain();if(!main)return[];return Array.from(main.querySelectorAll('div[role="listitem"], article, div[class*="message"], div[class*="group"]')).filter(el=>el.innerText && el.offsetHeight>0);}
  function isUserMessage(node){if(!node||!node.innerText||node.innerText.trim()==='') return false;if(node.offsetHeight===0||node.offsetWidth===0) return false;const main=findChatMain();if(!main)return false;const mainRect=main.getBoundingClientRect();const rect=node.getBoundingClientRect();return rect.left+rect.width/2>mainRect.left+mainRect.width/2+20;}
  function buildPairs(){const nodes=getMessageNodes();const userMessages=[];for(let i=0;i<nodes.length;i++){const n=nodes[i];if(isUserMessage(n)){const userText=n.innerText.trim().slice(0,1000),id=`cgsb_${i}_${hashText(userText)}`;userMessages.push({id,userNode:n,userText})}}return userMessages;}
  function hashText(s){let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);h>>>0;}return h.toString(36);}
  
  function renderPairs(pairs,save=true){
    const list=document.getElementById('cgsb-list');
    if(!list)return;
    list.innerHTML='';
    const toSave=[];
    pairs.forEach(p=>{
      const item=document.createElement('div');
      item.className='__cgsb_item';
      item.dataset.cgsbId=p.id;
      item.innerHTML=`<div class="__cgsb_preview">${escapeHtml(p.userText.slice(0,140))}</div>`;
      item.addEventListener('click',()=>{
        if(p.userNode){
          p.userNode.scrollIntoView({behavior:'smooth',block:'center'});
          p.userNode.classList.add('__cgsb_highlight');
          setTimeout(()=>p.userNode.classList.remove('__cgsb_highlight'),1100);
        }
      });
      list.appendChild(item);
      toSave.push({id:p.id,userText:p.userText,created:Date.now()});
    });
    document.getElementById('cgsb-count').textContent=pairs.length;
    if(save) saveData(toSave);

    if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage({ action: 'updateBadge', count: pairs.length });
    }

    if(pairs.length>0) list.scrollTo({top:list.scrollHeight,behavior:'smooth'});
  }

  function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function jumpToReply(pairOrObj){if(!pairOrObj)return;if(pairOrObj.userNode){pairOrObj.userNode.scrollIntoView({behavior:'smooth',block:'center'});pairOrObj.userNode.classList.add('__cgsb_highlight');setTimeout(()=>pairOrObj.userNode.classList.remove('__cgsb_highlight'),1100);}}

  let mo=null;
  function scanAndRender(force=false){try{const main=findChatMain();if(!main)return;const pairs=buildPairs();renderPairs(pairs);}catch(e){console.error('CGSB scan error',e);}}
  function startObserver(){const main=findChatMain();if(!main)return;if(mo)mo.disconnect();mo=new MutationObserver(()=>{if(window.__cgsb_scan_timeout)clearTimeout(window.__cgsb_scan_timeout);window.__cgsb_scan_timeout=setTimeout(()=>{scanAndRender();},300);});mo.observe(main,{childList:true,subtree:true,characterData:true});}

  async function init(){
    injectCSS(embeddedCSS);
    await new Promise((resolve, reject)=>{
        if(document.querySelector('link[href*="font-awesome"]')) return resolve();
        const faLink = document.createElement('link');
        faLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css";
        faLink.rel = "stylesheet";
        faLink.onload = resolve;
        faLink.onerror = reject;
        document.head.appendChild(faLink);
    });
    createSidebar();
    scanAndRender();
    startObserver();
    setInterval(scanAndRender, 5000);
    setInterval(()=>{if(!document.querySelector('.__cgsb_sidebar')) createSidebar();},4000);
  }

  function readyCheck(){if(findChatMain()){init();}else{const t=setInterval(()=>{if(findChatMain()){clearInterval(t);init();}},700);}}
  readyCheck();

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=>{
    if(msg.action === 'getMessageCount'){
      const count = buildPairs().length;
      sendResponse({ count });
    }
  });

  window.__cgsb={scanAndRender,buildPairs,jumpToReply};
})();
