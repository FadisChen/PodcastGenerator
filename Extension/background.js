// Background script for Podcast Generator extension

// Enable side panel on extension icon click
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ tabId: tab.id });
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason !== "install" && details.reason !== "update") return;
    
    console.log('Podcast Generator extension installed');
    
    // Set up context menu for quick access
    chrome.contextMenus.create({
        id: "podcast-generator-extract",
        title: "提取文字到 Podcast 生成器",
        contexts: ["selection"]
    });
});

// Handle messages from content scripts and side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'elementSelected') {
        // Forward the selected element text to the side panel
        forwardToSidePanel(request);
        sendResponse({ success: true });
    } else if (request.action === 'selectionCancelled') {
        // Forward cancellation to side panel
        forwardToSidePanel(request);
        sendResponse({ success: true });
    } else if (request.action === 'startElementSelection') {
        // Start element selection on current tab
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
                    sendResponse(response);
                });
            }
        });
        return true; // Keep message channel open for async response
    }
});

// Function to forward messages to side panel
function forwardToSidePanel(message) {
    // Since we can't directly communicate with side panel,
    // we'll store the data and let the side panel poll for it
    chrome.storage.local.set({
        'lastElementSelection': {
            ...message,
            timestamp: Date.now()
        }
    });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "podcast-generator-extract") {
        // Send selected text to side panel
        forwardToSidePanel({
            action: 'elementSelected',
            text: info.selectionText,
            elementInfo: {
                tagName: 'selection',
                source: 'contextMenu'
            }
        });
        
        // Open side panel
        chrome.sidePanel.open({ tabId: tab.id });
    }
}); 