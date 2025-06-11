// Popup script for extension interface
class PopupManager {
  constructor() {
    this.stats = null;
    this.settings = null;
    this.updateInterval = null;
    this.init();
  }
  
  async init() {
    // Load initial data
    await this.loadData();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start update loop
    this.startUpdateLoop();
    
    // Show main content
    document.getElementById('loading').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
  }
  
  async loadData() {
    try {
      // Get stats and settings from background script
      this.stats = await this.sendMessage({ type: 'getStats' });
      this.settings = await this.sendMessage({ type: 'getSettings' });
      
      this.updateUI();
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }
  
  sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, resolve);
    });
  }
  
  setupEventListeners() {
    // Pause/Resume button
    document.getElementById('pause-btn').addEventListener('click', () => {
      this.pauseTracking();
    });
    
    document.getElementById('resume-btn').addEventListener('click', () => {
      this.resumeTracking();
    });
    
    // Reset stats button
    document.getElementById('reset-btn').addEventListener('click', () => {
      this.resetStats();
    });
    
    // Settings controls
    document.getElementById('interval-select').addEventListener('change', (e) => {
      this.updateSetting('intervalMinutes', parseInt(e.target.value));
    });
    
    document.getElementById('notification-select').addEventListener('change', (e) => {
      this.updateSetting('notificationStyle', e.target.value);
    });
    
    // Options link
    document.getElementById('options-link').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    });
  }
  
  startUpdateLoop() {
    this.updateInterval = setInterval(() => {
      this.loadData();
    }, 1000);
  }
  
  updateUI() {
    if (!this.stats || !this.settings) return;
    
    // Update status
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    
    if (this.stats.isPaused) {
      statusDot.className = 'status-dot paused';
      statusText.textContent = 'Paused';
      pauseBtn.style.display = 'none';
      resumeBtn.style.display = 'block';
    } else if (this.stats.isTracking) {
      statusDot.className = 'status-dot active';
      statusText.textContent = 'Tracking Active';
      pauseBtn.style.display = 'block';
      resumeBtn.style.display = 'none';
    } else {
      statusDot.className = 'status-dot inactive';
      statusText.textContent = 'Inactive';
      pauseBtn.style.display = 'block';
      resumeBtn.style.display = 'none';
    }
    
    // Update timer display
    const currentSession = this.stats.currentSession || 0;
    const nextBreakIn = (this.settings.intervalMinutes * 60 * 1000) - (currentSession % (this.settings.intervalMinutes * 60 * 1000));
    document.getElementById('timer-display').textContent = this.formatTime(nextBreakIn);
    
    // Update stats
    document.getElementById('total-time').textContent = this.formatDuration(this.stats.totalWorkTime);
    document.getElementById('break-count').textContent = this.stats.breakCount;
    
    // Update settings controls
    document.getElementById('interval-select').value = this.settings.intervalMinutes;
    document.getElementById('notification-select').value = this.settings.notificationStyle;
  }
  
  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  formatDuration(milliseconds) {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
  
  async pauseTracking() {
    await this.sendMessage({ type: 'pauseTracking', minutes: 30 });
    this.loadData();
  }
  
  async resumeTracking() {
    await this.sendMessage({ type: 'resumeTracking' });
    this.loadData();
  }
  
  async resetStats() {
    if (confirm('Are you sure you want to reset all statistics?')) {
      await this.sendMessage({ type: 'resetStats' });
      this.loadData();
    }
  }
  
  async updateSetting(key, value) {
    const newSettings = { [key]: value };
    await this.sendMessage({ type: 'updateSettings', settings: newSettings });
    this.settings[key] = value;
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});