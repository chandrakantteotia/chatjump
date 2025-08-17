// ChatJump Pro - Background Script
// Handles extension lifecycle and browser action

console.log('ChatJump Pro background script loaded');

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('ChatJump Pro installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    // First time installation
    console.log('ChatJump Pro installed for the first time');
    
    // Set default settings
    chrome.storage.sync.set({
      theme: 'light',
      sidebarVisible: true,
      autoScan: true,
      notifications: true
    });
    
    // Open welcome page or instructions
    chrome.tabs.create({
      url: 'https://chat.openai.com/',
      active: true
    });
    
  } else if (details.reason === 'update') {
    // Extension updated
    console.log('ChatJump Pro updated to version:', chrome.runtime.getManifest().version);
  }
});

// Handle browser action click (extension icon click)
chrome.action.onClicked.addListener((tab) => {
  console.log('ChatJump Pro icon clicked on tab:', tab.url);
  
  // Check if we're on a supported page
  if (tab.url && (tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com'))) {
    // Send message to content script to toggle sidebar
    chrome.tabs.sendMessage(tab.id, {
      action: 'toggleSidebar'
    }).catch(error => {
      console.log('Could not send message to content script:', error);
    });
  } else {
    // Not on ChatGPT, open ChatGPT
    chrome.tabs.create({
      url: 'https://chat.openai.com/',
      active: true
    });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.action) {
    case 'updateBadge':
      // Update extension badge with message count
      chrome.action.setBadgeText({
        text: message.count > 0 ? message.count.toString() : '',
        tabId: sender.tab.id
      });
      chrome.action.setBadgeBackgroundColor({
        color: '#3b82f6',
        tabId: sender.tab.id
      });
      break;
      
    case 'showNotification':
      // Show browser notification (if permissions allow)
      if (message.title && message.message) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: message.title,
          message: message.message
        });
      }
      break;
      
    case 'getSettings':
      // Return stored settings
      chrome.storage.sync.get(['theme', 'sidebarVisible', 'autoScan', 'notifications'], (result) => {
        sendResponse(result);
      });
      return true; // Keep message channel open for async response
      
    case 'saveSettings':
      // Save settings
      chrome.storage.sync.set(message.settings, () => {
        sendResponse({ success: true });
      });
      return true;
      
    default:
      console.log('Unknown message action:', message.action);
  }
});

// Handle tab updates (page navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    if (tab.url.includes('chat.openai.com') || tab.url.includes('chatgpt.com')) {
      // ChatGPT page loaded, reset badge
      chrome.action.setBadgeText({
        text: '',
        tabId: tabId
      });
    }
  }
});

// Cleanup when extension is disabled/uninstalled
chrome.runtime.onSuspend.addListener(() => {
  console.log('ChatJump Pro background script suspended');
});

// Keep service worker alive
chrome.runtime.onStartup.addListener(() => {
  console.log('ChatJump Pro background script started');
});

// Export for debugging
if (typeof window !== 'undefined') {
  window.chatJumpBackground = {
    version: chrome.runtime.getManifest().version,
    isActive: true
  };
}