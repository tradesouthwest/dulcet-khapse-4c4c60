// Content script for in-page notifications
class NotificationManager {
  constructor() {
    this.currentNotification = null;
    this.audioContext = null;
    this.init();
  }
  
  init() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      switch (request.type) {
        case 'showBanner':
          this.showBanner(request.message, request.duration);
          break;
        case 'showPopup':
          this.showPopup(request.message, request.duration);
          break;
        case 'playSound':
          this.playNotificationSound();
          break;
      }
    });
  }
  
  showBanner(message, duration) {
    // Remove existing notification
    this.removeCurrentNotification();
    
    // Create banner element
    const banner = document.createElement('div');
    banner.className = 'healthy-work-banner';
    banner.innerHTML = `
      <div class="healthy-work-banner-content">
        <div class="healthy-work-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
        </div>
        <div class="healthy-work-message">${message}</div>
        <button class="healthy-work-close" onclick="this.parentElement.parentElement.remove()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    
    document.body.appendChild(banner);
    this.currentNotification = banner;
    
    // Auto-remove after duration
    setTimeout(() => {
      if (this.currentNotification === banner) {
        this.removeCurrentNotification();
      }
    }, duration);
    
    // Add slide-in animation
    setTimeout(() => banner.classList.add('show'), 100);
  }
  
  showPopup(message, duration) {
    // Remove existing notification
    this.removeCurrentNotification();
    
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'healthy-work-popup';
    popup.innerHTML = `
      <div class="healthy-work-popup-content">
        <div class="healthy-work-popup-header">
          <div class="healthy-work-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          </div>
          <h3>Time for a Break!</h3>
        </div>
        <p class="healthy-work-popup-message">${message}</p>
        <div class="healthy-work-popup-actions">
          <button class="healthy-work-btn primary" onclick="this.closest('.healthy-work-popup').remove()">
            Take Break
          </button>
          <button class="healthy-work-btn secondary" onclick="this.closest('.healthy-work-popup').remove()">
            Remind Later
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(popup);
    this.currentNotification = popup;
    
    // Auto-remove after duration
    setTimeout(() => {
      if (this.currentNotification === popup) {
        this.removeCurrentNotification();
      }
    }, duration);
    
    // Add fade-in animation
    setTimeout(() => popup.classList.add('show'), 100);
  }
  
  removeCurrentNotification() {
    if (this.currentNotification) {
      this.currentNotification.remove();
      this.currentNotification = null;
    }
  }
  
  playNotificationSound() {
    try {
      // Create a simple pleasant notification tone
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  }
}

// Initialize notification manager
new NotificationManager();