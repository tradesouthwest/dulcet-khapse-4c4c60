// Background script for tracking work time and managing break reminders
class HealthyWorkTracker {
  constructor() {
    this.isTracking = false;
    this.sessionStartTime = null;
    this.totalWorkTime = 0;
    this.breakCount = 0;
    this.settings = {
      intervalMinutes: 25,
      notificationStyle: 'banner', // 'banner', 'popup', 'sound', 'system'
      notificationDuration: 10,
      motivationalMessages: [
        "Time for a standing break! Your body will thank you 🌟",
        "Stand up, stretch, and give your eyes a rest 💪",
        "Take a moment to breathe and move around 🧘‍♀️",
        "A quick break now means better focus later ⚡",
        "Stand tall, stretch high, feel amazing! 🌈",
        "Your health is your wealth - take that break! 💎",
        "Movement is medicine - time for your dose! 🏃‍♀️",
        "Break time! Your spine deserves some love ❤️"
      ],
      customMessages: [],
      soundEnabled: true,
      trackCompliance: true,
      pauseUntil: null
    };
    
    this.init();
  }
  
  async init() {
    // Load settings from storage
    const stored = await this.getStoredData();
    this.settings = { ...this.settings, ...stored.settings };
    this.totalWorkTime = stored.totalWorkTime || 0;
    this.breakCount = stored.breakCount || 0;
    
    // Set up alarm listener
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === 'workBreakReminder') {
        this.showBreakReminder();
      }
    });
    
    // Track tab activity
    chrome.tabs.onActivated.addListener(() => this.handleTabActivity());
    chrome.tabs.onUpdated.addListener(() => this.handleTabActivity());
    
    // Start tracking
    this.startTracking();
  }
  
  async getStoredData() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings', 'totalWorkTime', 'breakCount'], resolve);
    });
  }
  
  async saveData() {
    return new Promise((resolve) => {
      chrome.storage.local.set({
        settings: this.settings,
        totalWorkTime: this.totalWorkTime,
        breakCount: this.breakCount
      }, resolve);
    });
  }
  
  startTracking() {
    if (this.isTracking) return;
    
    // Check if paused
    if (this.settings.pauseUntil && Date.now() < this.settings.pauseUntil) {
      setTimeout(() => this.startTracking(), this.settings.pauseUntil - Date.now());
      return;
    }
    
    this.isTracking = true;
    this.sessionStartTime = Date.now();
    
    // Set up alarm for break reminder
    chrome.alarms.create('workBreakReminder', {
      delayInMinutes: this.settings.intervalMinutes
    });
    
    this.updateBadge();
  }
  
  stopTracking() {
    if (!this.isTracking) return;
    
    this.isTracking = false;
    if (this.sessionStartTime) {
      this.totalWorkTime += Date.now() - this.sessionStartTime;
      this.sessionStartTime = null;
    }
    
    chrome.alarms.clear('workBreakReminder');
    this.updateBadge();
    this.saveData();
  }
  
  pauseTracking(minutes = 30) {
    this.settings.pauseUntil = Date.now() + (minutes * 60 * 1000);
    this.stopTracking();
    this.saveData();
    
    // Resume after pause period
    setTimeout(() => {
      this.settings.pauseUntil = null;
      this.startTracking();
    }, minutes * 60 * 1000);
  }
  
  handleTabActivity() {
    if (!this.isTracking) {
      this.startTracking();
    }
  }
  
  showBreakReminder() {
    const messages = [...this.settings.motivationalMessages, ...this.settings.customMessages];
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    switch (this.settings.notificationStyle) {
      case 'system':
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon-48.png',
          title: 'Healthy Work Break',
          message: message
        });
        break;
        
      case 'banner':
        this.showBannerNotification(message);
        break;
        
      case 'popup':
        this.showPopupNotification(message);
        break;
        
      case 'sound':
        if (this.settings.soundEnabled) {
          this.playNotificationSound();
        }
        this.showBannerNotification(message);
        break;
    }
    
    // Reset alarm for next interval
    chrome.alarms.create('workBreakReminder', {
      delayInMinutes: this.settings.intervalMinutes
    });
    
    this.breakCount++;
    this.saveData();
  }
  
  showBannerNotification(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'showBanner',
          message: message,
          duration: this.settings.notificationDuration * 1000
        });
      }
    });
  }
  
  showPopupNotification(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'showPopup',
          message: message,
          duration: this.settings.notificationDuration * 1000
        });
      }
    });
  }
  
  playNotificationSound() {
    // Create a simple notification sound using Web Audio API
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'playSound' });
      }
    });
  }
  
  updateBadge() {
    const badgeText = this.isTracking ? '●' : '';
    const badgeColor = this.isTracking ? '#10B981' : '#6B7280';
    
    chrome.browserAction.setBadgeText({ text: badgeText });
    chrome.browserAction.setBadgeBackgroundColor({ color: badgeColor });
  }
  
  getStats() {
    const currentSession = this.isTracking && this.sessionStartTime ? 
      Date.now() - this.sessionStartTime : 0;
    
    return {
      totalWorkTime: this.totalWorkTime + currentSession,
      breakCount: this.breakCount,
      isTracking: this.isTracking,
      currentSession: currentSession,
      isPaused: this.settings.pauseUntil && Date.now() < this.settings.pauseUntil
    };
  }
  
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveData();
    
    // Restart tracking if interval changed
    if (newSettings.intervalMinutes && this.isTracking) {
      this.stopTracking();
      this.startTracking();
    }
  }
}

// Initialize the tracker
const tracker = new HealthyWorkTracker();

// Handle messages from popup and options page
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'getStats':
      sendResponse(tracker.getStats());
      break;
      
    case 'getSettings':
      sendResponse(tracker.settings);
      break;
      
    case 'updateSettings':
      tracker.updateSettings(request.settings);
      sendResponse({ success: true });
      break;
      
    case 'pauseTracking':
      tracker.pauseTracking(request.minutes);
      sendResponse({ success: true });
      break;
      
    case 'resumeTracking':
      tracker.settings.pauseUntil = null;
      tracker.startTracking();
      sendResponse({ success: true });
      break;
      
    case 'resetStats':
      tracker.totalWorkTime = 0;
      tracker.breakCount = 0;
      tracker.saveData();
      sendResponse({ success: true });
      break;
  }
});