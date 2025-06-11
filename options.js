// Options page script for detailed settings management
class OptionsManager {
  constructor() {
    this.settings = null;
    this.stats = null;
    this.saveTimeout = null;
    this.init();
  }
  
  async init() {
    await this.loadData();
    this.setupEventListeners();
    this.renderUI();
    
    document.getElementById('loading').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
  }
  
  async loadData() {
    try {
      this.settings = await this.sendMessage({ type: 'getSettings' });
      this.stats = await this.sendMessage({ type: 'getStats' });
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
    // Timing settings
    document.getElementById('interval-minutes').addEventListener('change', (e) => {
      this.updateSetting('intervalMinutes', parseInt(e.target.value));
    });
    
    document.getElementById('notification-duration').addEventListener('change', (e) => {
      this.updateSetting('notificationDuration', parseInt(e.target.value));
    });
    
    // Notification settings
    document.getElementById('notification-style').addEventListener('change', (e) => {
      this.updateSetting('notificationStyle', e.target.value);
    });
    
    document.getElementById('sound-enabled').addEventListener('change', (e) => {
      this.updateSetting('soundEnabled', e.target.checked);
    });
    
    document.getElementById('track-compliance').addEventListener('change', (e) => {
      this.updateSetting('trackCompliance', e.target.checked);
    });
    
    // Custom messages
    document.getElementById('add-message-btn').addEventListener('click', () => {
      this.addCustomMessage();
    });
    
    document.getElementById('new-message').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.addCustomMessage();
      }
    });
    
    // Action buttons
    document.getElementById('reset-settings-btn').addEventListener('click', () => {
      this.resetSettings();
    });
    
    document.getElementById('export-data-btn').addEventListener('click', () => {
      this.exportData();
    });
  }
  
  renderUI() {
    if (!this.settings || !this.stats) return;
    
    // Update statistics
    const totalHours = Math.floor(this.stats.totalWorkTime / (1000 * 60 * 60));
    const totalMinutes = Math.floor((this.stats.totalWorkTime % (1000 * 60 * 60)) / (1000 * 60));
    document.getElementById('total-work-time').textContent = `${totalHours}h ${totalMinutes}m`;
    document.getElementById('total-breaks').textContent = this.stats.breakCount;
    
    // Calculate compliance rate (rough estimate)
    const expectedBreaks = Math.floor(this.stats.totalWorkTime / (this.settings.intervalMinutes * 60 * 1000));
    const complianceRate = expectedBreaks > 0 ? Math.round((this.stats.breakCount / expectedBreaks) * 100) : 0;
    document.getElementById('compliance-rate').textContent = `${Math.min(complianceRate, 100)}%`;
    
    // Update form values
    document.getElementById('interval-minutes').value = this.settings.intervalMinutes;
    document.getElementById('notification-duration').value = this.settings.notificationDuration;
    document.getElementById('notification-style').value = this.settings.notificationStyle;
    document.getElementById('sound-enabled').checked = this.settings.soundEnabled;
    document.getElementById('track-compliance').checked = this.settings.trackCompliance;
    
    // Render messages
    this.renderMessages();
  }
  
  renderMessages() {
    // Render default messages
    const defaultMessagesContainer = document.getElementById('default-messages');
    defaultMessagesContainer.innerHTML = '';
    
    this.settings.motivationalMessages.forEach((message, index) => {
      const messageElement = this.createMessageElement(message, 'default', index);
      defaultMessagesContainer.appendChild(messageElement);
    });
    
    // Render custom messages
    const customMessagesContainer = document.getElementById('custom-messages');
    customMessagesContainer.innerHTML = '';
    
    if (this.settings.customMessages.length === 0) {
      customMessagesContainer.innerHTML = '<p style="color: #6B7280; font-style: italic; padding: 20px; text-align: center;">No custom messages yet. Add one below!</p>';
    } else {
      this.settings.customMessages.forEach((message, index) => {
        const messageElement = this.createMessageElement(message, 'custom', index);
        customMessagesContainer.appendChild(messageElement);
      });
    }
  }
  
  createMessageElement(message, type, index) {
    const div = document.createElement('div');
    div.className = 'message-item';
    
    div.innerHTML = `
      <span class="message-text">${message}</span>
      <div class="message-actions">
        ${type === 'custom' ? `
          <button class="btn btn-danger btn-small" onclick="optionsManager.removeCustomMessage(${index})">
            Remove
          </button>
        ` : ''}
      </div>
    `;
    
    return div;
  }
  
  addCustomMessage() {
    const input = document.getElementById('new-message');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (message.length > 200) {
      alert('Message is too long. Please keep it under 200 characters.');
      return;
    }
    
    this.settings.customMessages.push(message);
    input.value = '';
    this.saveSettings();
    this.renderMessages();
  }
  
  removeCustomMessage(index) {
    this.settings.customMessages.splice(index, 1);
    this.saveSettings();
    this.renderMessages();
  }
  
  async updateSetting(key, value) {
    this.settings[key] = value;
    this.saveSettings();
  }
  
  async saveSettings() {
    // Debounce saves
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(async () => {
      try {
        await this.sendMessage({ type: 'updateSettings', settings: this.settings });
        this.showSaveStatus();
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }, 500);
  }
  
  showSaveStatus() {
    const status = document.getElementById('save-status');
    status.style.display = 'block';
    setTimeout(() => {
      status.style.display = 'none';
    }, 2000);
  }
  
  async resetSettings() {
    if (!confirm('Are you sure you want to reset all settings to their defaults? This cannot be undone.')) {
      return;
    }
    
    const defaultSettings = {
      intervalMinutes: 25,
      notificationStyle: 'banner',
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
    
    try {
      await this.sendMessage({ type: 'updateSettings', settings: defaultSettings });
      this.settings = defaultSettings;
      this.renderUI();
      alert('Settings have been reset to defaults.');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      alert('Failed to reset settings. Please try again.');
    }
  }
  
  async exportData() {
    try {
      const data = {
        settings: this.settings,
        stats: this.stats,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `healthy-work-habits-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    }
  }
}

// Initialize options manager when DOM is loaded
let optionsManager;
document.addEventListener('DOMContentLoaded', () => {
  optionsManager = new OptionsManager();
});

// Make it available globally for onclick handlers
window.optionsManager = optionsManager;