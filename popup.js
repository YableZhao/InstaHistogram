// Instagram Photo Analyzer - Popup Script

class PopupController {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadSettings();
    this.attachEventListeners();
    this.updateStatus();
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        enabled: true,
        showOnHover: true,
        histogramType: 'rgb'
      });
      this.settings = result;
      
      // 更新UI
      document.getElementById('enableAnalyzer').checked = this.settings.enabled;
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.settings = { enabled: true, showOnHover: true, histogramType: 'rgb' };
    }
  }

  attachEventListeners() {
    // 启用/禁用分析器
    document.getElementById('enableAnalyzer').addEventListener('change', (e) => {
      this.settings.enabled = e.target.checked;
      this.saveSettings();
      this.updateStatus();
      this.notifyContentScript();
    });
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set(this.settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  updateStatus() {
    const statusElement = document.getElementById('status');
    if (this.settings.enabled) {
      statusElement.textContent = '✅ Analyzer Enabled';
      statusElement.className = 'status active';
    } else {
      statusElement.textContent = '❌ Analyzer Disabled';
      statusElement.className = 'status inactive';
    }
  }

  async notifyContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url.includes('instagram.com')) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: this.settings
        });
      }
          } catch (error) {
        console.error('Failed to notify content script:', error);
      }
  }

  // 检查当前标签页是否为Instagram
  async checkInstagramPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab && tab.url.includes('instagram.com');
    } catch (error) {
      return false;
    }
  }
}

// 当弹出窗口加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});

// 添加一些统计信息显示
document.addEventListener('DOMContentLoaded', async () => {
  // 检查是否在Instagram页面
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isInstagram = tab && tab.url.includes('instagram.com');
  
  if (!isInstagram) {
    // Show warning if not on Instagram page
    const instructionsElement = document.querySelector('.instructions');
    instructionsElement.innerHTML = `
      <strong style="color: #ffeb3b;">⚠️ Notice:</strong><br>
      Please visit Instagram.com to use this tool<br><br>
      <strong>How to Use:</strong><br>
      1. Visit Instagram.com<br>
      2. Hover your mouse over any photo<br>
      3. View the automatic analysis panel
    `;
  }
});
