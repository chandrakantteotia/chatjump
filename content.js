(() => {
  // LocalStorage key for saving messages
  const STORAGE_KEY = 'cgsb_messages_v1';

  // CSS styles for sidebar and toggle button
  const embeddedCSS = `
  .__cgsb_sidebar {
    position: fixed;
    top: 80px;
    right: 1px;
    width: 300px;
    max-height: calc(100vh - 120px);
    background: #fff;
    border: 1px solid rgba(15,23,42,0.06);
    box-shadow: 0 8px 30px rgba(2,6,23,0.18);
    border-radius: 10px;
    overflow: hidden;
    z-index: 2147483647;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    user-select: none;
    cursor: grab;
  }
  .__cgsb_sidebar:active {
    cursor: grabbing;
  }
  .__cgsb_header {
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding:10px 12px;
    background: linear-gradient(180deg,#fbfdff,#f7fbff);
    border-bottom:1px solid #eef2ff;
    cursor: grab;
  }
  .__cgsb_header:active {
    cursor: grabbing;
  }
  .__cgsb_title { font-weight:600; font-size:14px; color:#0b1220; }
  .__cgsb_sub { font-size:12px; color:#64748b; }
  .__cgsb_list {
    overflow:auto;
    max-height: 60vh;
    padding:8px;
    display:flex;
    flex-direction:column;
    gap:6px;
    background: white;
  }
  .__cgsb_item {
    padding:8px;
    border-radius:8px;
    background:#fff;
    border:1px solid rgba(15,23,42,0.04);
    cursor:pointer;
    font-size:13px;
    color:#0b1220;
    line-height:1.2;
  }
  .__cgsb_item:hover { background:#eef8ff; transform: translateY(-1px); transition: .12s; }
  .__cgsb_item_meta { font-size:11px; color:#94a3b8; margin-top:6px; }
  .__cgsb_footer {
    display:flex;
    gap:8px;
    align-items:center;
    padding:8px;
    border-top:1px solid #041036ff;
    background: linear-gradient(180deg,#ffffff,#fbfdff);
  }
  .__cgsb_btn {
    padding:6px 8px;
    border-radius:8px;
    border:1px solid rgba(15,23,42,0.06);
    background:white;
    cursor:pointer;
    font-size:13px;
    transition: background-color 0.2s ease, color 0.2s ease;
  }
  .__cgsb_btn:hover {
    background-color: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  /* Toggle button styling */
  .__cgsb_toggle {
    position: fixed;
    top: 140px;
    right: 1px;
    z-index: 2147483647;
    background: linear-gradient(135deg, #2563eb, #0ea5e9);
    color: white;
    border: none;
    width: 56px;
    height: 56px;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(37, 99, 235, 0.6);
    font-weight: 700;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: box-shadow 0.3s ease, background 0.3s ease, transform 0.2s ease;
    user-select: none;
  }
  .__cgsb_toggle:hover {
    box-shadow: 0 12px 40px rgba(37, 99, 235, 0.8);
    background: linear-gradient(135deg, #3b82f6, #0284c7);
    transform: scale(1.1);
  }
  .__cgsb_toggle:active {
    transform: scale(0.95);
  }

 .__cgsb_highlight {
  position: relative;
  box-shadow: none; /* Reset if needed */
}

.__cgsb_highlight::before {
  content: "";
  pointer-events: none;
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  border: 2px solid black;  /* black border line */
  border-radius: 8px;       /* same as container's border-radius */
  box-sizing: border-box;
  animation: border-run 2.4s linear infinite;
}

/* The keyframe animates a border line as if it moves around the edges */
@keyframes border-run {
  0% {
    clip-path: polygon(
      0% 0%, 0% 0%, 0% 0%, 0% 0%
    );
  }
  25% {
    clip-path: polygon(
      0% 0%, 100% 0%, 100% 0%, 0% 0%
    );
  }
  50% {
    clip-path: polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%
    );
  }
  75% {
    clip-path: polygon(
      0% 0%, 100% 0%, 100% 100%, 0% 100%
    );
  }
  100% {
    clip-path: polygon(
      0% 0%, 0% 0%, 0% 0%, 0% 0%
    );
  }
}

  `;

  // Inject CSS into document head
  function injectCSS(cssText) {
    const style = document.createElement('style');
    style.setAttribute('data-cgsb-style', '1');
    style.textContent = cssText;
    document.head.appendChild(style);
    return style;
  }

  // Create sidebar & toggle button in DOM
  function createSidebar() {
    if (document.querySelector('.__cgsb_sidebar')) return; // Avoid duplicates

    // Sidebar container
    const container = document.createElement('div');
    container.className = '__cgsb_sidebar';
    container.style.top = '80px';
    container.style.right = '12px';
    container.style.left = 'auto';
    container.style.width = '300px';

    // Inner HTML for sidebar
    container.innerHTML = `
      <div class="__cgsb_header" id="cgsb-drag-handle">
        <div>
          <div class="__cgsb_title">ChatJump</div>
          <div class="__cgsb_sub">Click and Jump anywhere</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="__cgsb_btn" id="cgsb-refresh">Refresh</button>
          <button class="__cgsb_btn" id="cgsb-clear">Clear</button>
        </div>
      </div>
      <div class="__cgsb_list" id="cgsb-list"></div>
      <div class="__cgsb_footer">
        <div style="flex:1" class="__cgsb_sub">Detected: <span id="cgsb-count">0</span></div>
        <button class="__cgsb_btn" id="cgsb-scroll-last">Go to last</button>
      </div>
    `;
    document.body.appendChild(container);

    // Create toggle button
    const toggle = document.createElement('button');
    toggle.className = '__cgsb_toggle';
    toggle.id = 'cgsb-toggle';
    toggle.title = 'Toggle My Questions';
    toggle.textContent = '👋';
    toggle.style.position = 'fixed';
    toggle.style.top = '140px';
    toggle.style.right = '1px';
    toggle.style.zIndex = '2147483647';
    toggle.style.width = '50px';
    toggle.style.height = '50px';
    document.body.appendChild(toggle);

    // Toggle sidebar show/hide on click
    toggle.addEventListener('click', () => {
      const s = document.querySelector('.__cgsb_sidebar');
      if (!s) return;
      if (s.style.display === 'none' || getComputedStyle(s).display === 'none') {
        s.style.display = '';
        toggle.style.right = (parseInt(s.style.width) + 24) + 'px';
      } else {
        s.style.display = 'none';
        toggle.style.right = '12px';
      }
    });

    // Refresh button reloads message list
    document.getElementById('cgsb-refresh').addEventListener('click', () => scanAndRender(true));
    // Clear button clears saved messages from localStorage and refreshes
    document.getElementById('cgsb-clear').addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY);
      scanAndRender(true);
    });
    // Scroll to last detected user message
    document.getElementById('cgsb-scroll-last').addEventListener('click', () => {
      const data = loadSaved();
      if (!data || data.length === 0) return;
      const last = data[data.length - 1];
      jumpToReply(last);
    });

    // Make sidebar draggable by its header
    makeDraggable(container, document.getElementById('cgsb-drag-handle'));
  }

  // Function to make sidebar draggable by mouse/touch
function makeDraggable(element, handle) {
  let isDragging = false;
  let startX, startY, startLeft, startTop;

  handle.style.touchAction = 'none';

  function onPointerDown(e) {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = element.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);

    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!isDragging) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    let newLeft = startLeft + dx;
    let newTop = startTop + dy;

    const winWidth = window.innerWidth;
    const winHeight = window.innerHeight;
    const elRect = element.getBoundingClientRect();

    if (newLeft < 0) newLeft = 0;
    if (newTop < 0) newTop = 0;
    if (newLeft + elRect.width > winWidth) newLeft = winWidth - elRect.width;
    if (newTop + elRect.height > winHeight) newTop = winHeight - elRect.height;

    element.style.left = newLeft + 'px';
    element.style.top = newTop + 'px';
    element.style.right = 'auto';  // Yeh important hai toggle button ke liye
    element.style.bottom = 'auto';
  }

  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', onPointerUp);
    document.removeEventListener('pointercancel', onPointerUp);
  }

  handle.addEventListener('pointerdown', onPointerDown);
}


  // Save message data to localStorage
  function saveData(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr || []));
    } catch (e) {}
  }
  // Load saved message data from localStorage
  function loadSaved() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  // Find main chat container on the page
  function findChatMain() {
    let main = document.querySelector('main');
    if (!main) main = document.querySelector('[role="main"]');
    return main;
  }

  // Get all chat message nodes visible in the main container
  function getMessageNodes() {
    const main = findChatMain();
    if (!main) return [];
    // Covers typical message containers
    const items = Array.from(main.querySelectorAll('div[role="listitem"], article, div[class*="message"], div[class*="group"]'));
    return items.filter(el => el.innerText && el.offsetHeight > 0);
  }

  // Detect if a message node is a user message (usually on the right side)
  function isUserMessage(node) {
    if (!node || !node.innerText) return false;
    if (node.innerText.trim() === '') return false;
    if (node.offsetHeight === 0 || node.offsetWidth === 0) return false;

    const main = findChatMain();
    if (!main) return false;

    const mainRect = main.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    const nodeCenterX = rect.left + rect.width / 2;
    const mainCenterX = mainRect.left + mainRect.width / 2;

    // User messages appear to the right side (with some buffer)
    return nodeCenterX > mainCenterX + 20;
  }

  // Build array of user messages with unique IDs and refs to DOM nodes
  function buildPairs() {
    const nodes = getMessageNodes();
    const userMessages = [];
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (isUserMessage(n)) {
        const userText = n.innerText.trim().slice(0, 1000);
        const id = `cgsb_${i}_${hashText(userText)}`;
        userMessages.push({ id, userNode: n, userText});
      }
    }
    return userMessages;
  }

  // Simple hash function to generate an ID from text
  function hashText(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      h >>>= 0;
    }
    return h.toString(36);
  }

  // Render the list of user messages in sidebar
  function renderPairs(pairs, save = true) {
    const list = document.getElementById('cgsb-list');
    if (!list) return;
    list.innerHTML = '';

    const toSave = [];

    pairs.forEach(p => {
      const item = document.createElement('div');
      item.className = '__cgsb_item';
      item.dataset.cgsbId = p.id;

      // Display first 140 chars of user message and its index number
      item.innerHTML = `<div class="__cgsb_preview">${escapeHtml(p.userText.slice(0, 140))}</div>
                      `;

      // On click, scroll smoothly to message in main chat and highlight briefly
      item.addEventListener('click', () => {
        if (p.userNode) {
          p.userNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
          p.userNode.classList.add('__cgsb_highlight');
          setTimeout(() => p.userNode.classList.remove('__cgsb_highlight'), 1100);
        }
      });

      list.appendChild(item);

      toSave.push({ id: p.id, userText: p.userText, created: Date.now() });
    });

    document.getElementById('cgsb-count').textContent = pairs.length;

    if (save) saveData(toSave);

    // Auto-scroll sidebar list to last message
    if (pairs.length > 0) {
      list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    }
  }

  // Escape HTML special characters to prevent injection
  function escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // Scroll to specific user message and highlight it
  function jumpToReply(pairOrObj) {
    if (!pairOrObj) return;
    if (pairOrObj.userNode) {
      pairOrObj.userNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      pairOrObj.userNode.classList.add('__cgsb_highlight');
      setTimeout(() => pairOrObj.userNode.classList.remove('__cgsb_highlight'), 1100);
    }
  }

  let mo = null;

  // Scan the chat page for user messages and update sidebar
  function scanAndRender(force = false) {
    try {
      const main = findChatMain();
      if (!main) return;
      const pairs = buildPairs();
      renderPairs(pairs);
    } catch (e) {
      console.error('CGSB scan error', e);
    }
  }

  // Set up mutation observer to watch for chat changes and update sidebar
  function startObserver() {
    const main = findChatMain();
    if (!main) return;
    if (mo) mo.disconnect();
    mo = new MutationObserver(() => {
      if (window.__cgsb_scan_timeout) clearTimeout(window.__cgsb_scan_timeout);
      window.__cgsb_scan_timeout = setTimeout(() => {
        scanAndRender();
      }, 300);
    });
    mo.observe(main, { childList: true, subtree: true, characterData: true });
  }

  // Initialize extension: inject CSS, create sidebar, start observer
  async function init() {
    injectCSS(embeddedCSS);
    createSidebar();
    scanAndRender();
    startObserver();

    // Periodic scan in case observer misses something
    setInterval(scanAndRender, 5000);

    // Periodically ensure sidebar exists (recreate if removed)
    setInterval(() => {
      if (!document.querySelector('.__cgsb_sidebar')) createSidebar();
    }, 4000);
  }

  // Wait until main chat area loads before initializing
  function readyCheck() {
    if (findChatMain()) {
      init();
    } else {
      const t = setInterval(() => {
        if (findChatMain()) {
          clearInterval(t);
          init();
        }
      }, 700);
    }
  }

  readyCheck();

  // Expose some functions for debugging in console
  window.__cgsb = {
    scanAndRender,
    buildPairs,
    jumpToReply
  };
})();
