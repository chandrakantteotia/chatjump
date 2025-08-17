// popup.js - Fixed for ChatJump Pro
document.addEventListener('DOMContentLoaded', async () => {
    console.log('ChatJump Pro popup loaded');

    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isOnChatGPT = tab.url && (tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com'));

    // Update status
    updateStatus(isOnChatGPT);

    // Load stats if on ChatGPT
    if (isOnChatGPT) {
        await loadStats(tab.id);
    }

    // Setup event listeners
    setupEventListeners(tab);

    // Set version
    document.getElementById('version').textContent = `v${chrome.runtime.getManifest().version}`;
});

function updateStatus(isActive) {
    const statusEl = document.getElementById('status');
    const statusText = document.getElementById('status-text');
    const statusDetail = document.getElementById('status-detail');

    if (isActive) {
        statusEl.classList.remove('inactive');
        statusText.textContent = 'Active on ChatGPT';
        statusDetail.textContent = 'Extension is running';
    } else {
        statusEl.classList.add('inactive');
        statusText.textContent = 'Not on ChatGPT';
        statusDetail.textContent = 'Navigate to ChatGPT to use';
    }
}

async function loadStats(tabId) {
    try {
        const response = await chrome.tabs.sendMessage(tabId, { action: 'getMessageCount' });

        if (response) {
            document.getElementById('message-count').textContent = response.count || 0;
        }
    } catch (error) {
        console.log('Could not load stats:', error);
        document.getElementById('message-count').textContent = '0';
    }
}

function setupEventListeners(tab) {
    // Open ChatGPT button
    document.getElementById('open-chatgpt').addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://chat.openai.com/' });
        window.close();
    });

    // Help & Guide button
    document.getElementById('show-help').addEventListener('click', () => {
        document.getElementById('help-panel').classList.add('active');
    });

    document.getElementById('back-btn').addEventListener('click', () => {
        document.getElementById('help-panel').classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.getElementById('help-panel').classList.remove('active');
            e.preventDefault();
        }
    });
}

// Listen for messages from content script to update popup stats in real-time
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updatePopupStats') {
        document.getElementById('message-count').textContent = message.count || 0;
    }
});

// Auto-refresh message count every 2 seconds
setInterval(async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab.url && (tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com'))) {
        await loadStats(tab.id);
    }
}, 2000);
