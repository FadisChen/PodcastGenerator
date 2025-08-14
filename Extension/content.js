// Content script for element selection functionality
class ElementSelector {
    constructor() {
        this.isSelecting = false;
        this.selectedElement = null;
        this.overlay = null;
        this.tooltip = null;
        this.cancelButton = null;
        this.originalOutline = null;
        this.originalCursor = null;
        
        // Bind event handlers once
        this.boundHandleMouseOver = this.handleMouseOver.bind(this);
        this.boundHandleMouseOut = this.handleMouseOut.bind(this);
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundCancelClick = this.handleCancelClick.bind(this);
    }

    startSelection() {
        if (this.isSelecting) return;
        
        this.isSelecting = true;
        this.originalCursor = document.body.style.cursor;
        document.body.style.cursor = 'pointer';
        
        // Create overlay and cancel button
        this.createOverlay();
        this.createCancelButton();
        
        // Add event listeners
        document.addEventListener('mouseover', this.boundHandleMouseOver);
        document.addEventListener('mouseout', this.boundHandleMouseOut);
        document.addEventListener('click', this.boundHandleClick);
        
        this.showTooltip('點擊元素進行選取，或點擊右上角按鈕取消');
    }

    stopSelection() {
        if (!this.isSelecting) return;
        
        this.isSelecting = false;
        document.body.style.cursor = this.originalCursor;
        
        // Remove event listeners
        document.removeEventListener('mouseover', this.boundHandleMouseOver);
        document.removeEventListener('mouseout', this.boundHandleMouseOut);
        document.removeEventListener('click', this.boundHandleClick);
        
        // Remove overlay, cancel button and tooltip
        this.removeOverlay();
        this.removeCancelButton();
        this.removeTooltip();
        
        // Remove highlight from selected element
        if (this.selectedElement) {
            this.selectedElement.style.outline = this.originalOutline;
            this.selectedElement = null;
        }
    }

    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'podcast-generator-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.1);
            z-index: 999999;
            pointer-events: none;
        `;
        document.body.appendChild(this.overlay);
    }

    removeOverlay() {
        if (this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    createCancelButton() {
        this.cancelButton = document.createElement('button');
        this.cancelButton.id = 'podcast-generator-cancel-btn';
        this.cancelButton.textContent = '✕ 取消擷取';
        this.cancelButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            cursor: pointer;
            z-index: 1000000;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
            transition: all 0.2s ease;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
        `;
        
        // Add hover effect
        this.cancelButton.addEventListener('mouseenter', () => {
            this.cancelButton.style.background = '#ff5252';
            this.cancelButton.style.transform = 'translateY(-2px)';
            this.cancelButton.style.boxShadow = '0 6px 16px rgba(255, 107, 107, 0.4)';
        });
        
        this.cancelButton.addEventListener('mouseleave', () => {
            this.cancelButton.style.background = '#ff6b6b';
            this.cancelButton.style.transform = 'translateY(0)';
            this.cancelButton.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
        });
        
        this.cancelButton.addEventListener('click', this.boundCancelClick);
        document.body.appendChild(this.cancelButton);
    }

    removeCancelButton() {
        if (this.cancelButton) {
            this.cancelButton.remove();
            this.cancelButton = null;
        }
    }

    showTooltip(text) {
        this.removeTooltip();
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'podcast-generator-tooltip';
        this.tooltip.textContent = text;
        this.tooltip.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000000;
            pointer-events: none;
            font-family: Arial, sans-serif;
        `;
        document.body.appendChild(this.tooltip);
    }

    removeTooltip() {
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
    }

    handleMouseOver(event) {
        if (!this.isSelecting || event.target === this.overlay || event.target === this.tooltip) return;
        
        // Remove previous highlight
        if (this.selectedElement) {
            this.selectedElement.style.outline = this.originalOutline;
        }
        
        // Highlight current element
        this.selectedElement = event.target;
        this.originalOutline = this.selectedElement.style.outline;
        this.selectedElement.style.outline = '2px solid rgb(204, 0, 0)';
    }

    handleMouseOut(event) {
        if (!this.isSelecting || event.target === this.overlay || event.target === this.tooltip) return;
        
        if (this.selectedElement) {
            this.selectedElement.style.outline = this.originalOutline;
            this.selectedElement = null;
        }
    }

    handleClick(event) {
        if (!this.isSelecting || event.target === this.overlay || event.target === this.tooltip) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        const element = event.target;
        const text = this.extractTextFromElement(element);
        
        // Send text back to side panel
        chrome.runtime.sendMessage({
            action: 'elementSelected',
            text: text,
            elementInfo: {
                tagName: element.tagName,
                className: element.className,
                id: element.id
            }
        });
        
        this.stopSelection();
    }

    handleCancelClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        console.log('Cancel button clicked, cancelling selection');
        this.stopSelection();
        
        // Store cancellation in local storage
        chrome.storage.local.set({
            lastElementSelection: {
                action: 'selectionCancelled',
                timestamp: Date.now()
            }
        });
        
        // Send message to side panel
        chrome.runtime.sendMessage({
            action: 'selectionCancelled'
        });
    }

    extractTextFromElement(element) {
        // Different strategies for different element types
        let text = '';
        
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            text = element.value;
        } else if (element.tagName === 'SELECT') {
            text = element.options[element.selectedIndex]?.text || '';
        } else {
            // For other elements, get visible text content
            text = this.getVisibleTextContent(element);
        }
        
        return text.trim();
    }

    getVisibleTextContent(element) {
        // Clone the element to avoid modifying the original
        const clone = element.cloneNode(true);
        
        // Remove script and style elements
        const scripts = clone.querySelectorAll('script, style');
        scripts.forEach(script => script.remove());
        
        // Get text content and clean it up
        let text = clone.textContent || clone.innerText || '';
        
        // Clean up whitespace
        text = text.replace(/\s+/g, ' ').trim();
        
        return text;
    }
}

// Global instance
let elementSelector = null;

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startElementSelection') {
        if (!elementSelector) {
            elementSelector = new ElementSelector();
        }
        elementSelector.startSelection();
        sendResponse({ success: true });
    } else if (request.action === 'stopElementSelection') {
        if (elementSelector) {
            elementSelector.stopSelection();
        }
        sendResponse({ success: true });
    }
});

// Clean up when page unloads
window.addEventListener('beforeunload', () => {
    if (elementSelector) {
        elementSelector.stopSelection();
    }
}); 